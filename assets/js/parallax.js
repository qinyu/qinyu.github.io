(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const plateQuery = window.matchMedia(
    "(orientation: portrait), (max-aspect-ratio: 1 / 1)",
  );
  // Cover + overflow only. Bounce and scroll-zoom are separate:
  //   bounce: translate ≤ 6% of layout vh. At scale 1, leftover
  //           overflow must stay ≥ safety 2%. --bg-rest 120% ⇒
  //           10% per-side ⇒ leftover 2% at rest. Unchanged.
  //   zoom:   rest→end scale delta is zoomTravel (0.03 ⇒ peak 1.03).
  //           Was ~0.02 from leftover math (peak 1.02). Zoom-in
  //           grows the plate, so it does not spend bounce leftover.
  // Layout viewport only. Never scale < 1. Never contain.
  const maxTravel = 0.06;
  const bounceReserve = maxTravel;
  const safetyMargin = 0.02;
  const zoomTravel = 0.03;
  const ease = 0.16;
  const arriveEase = 0.08;
  const storageKey = "site-bg-parallax";
  const scaleKey = "site-bg-scale";
  const handoffKey = "site-bg-handoff";
  const baseScale = 1;
  let peakScale = baseScale;
  let bouncePeak = baseScale;

  let current = 0;
  let target = 0;
  let currentScale = baseScale;
  let targetScale = baseScale;
  let rafPending = false;
  let lerpUntilSettled = false;
  let touchStartY = 0;
  let touchPull = 0;
  let touching = false;
  // After an in-site nav: keep the outgoing parallax/scale, ease to this page.
  let arriving = false;
  let holdFirstFrame = false;
  let userTookScroll = false;
  let booted = false;

  // Layout cache — resize / load only. Scroll must not measure.
  let poster = null;
  let frame = null;
  let layoutVh = 1;
  let restVh = 1;
  let maxScrollPx = 1;
  let posterAxisX = "-50%";
  let coverH = 0;

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  const restFromCss = () => {
    const raw = parseFloat(getComputedStyle(root).getPropertyValue("--bg-rest"));
    const rest = Number.isFinite(raw) && raw > 0 ? raw / 100 : 1.2;
    return Math.max(0, (rest - 1) / 2);
  };

  const measureOverflowFrac = () => {
    // Rest box only (.site-bg__frame / svh) — not visualViewport
    // and not the lvh clip. Chrome collapse must not retune peakScale.
    const box = restVh || layoutVh;
    if (!poster || poster.offsetHeight < 1 || box < 1) {
      return restFromCss();
    }
    // Layout px, before translate/scale. Bounce travels on Y, so
    // rest_overflow_frac is the per-side height leftover (4:3 iPad
    // is the tight height case). X is cover-only; we do not pan.
    return Math.max(0, (poster.offsetHeight - box) / 2 / box);
  };

  const syncPeakScale = () => {
    const overflowFrac = measureOverflowFrac();
    // Bounce/cover still use rest overflow at scale 1 (tightest).
    // Do not let a short plate raise zoom; do not spend leftover on zoom.
    const leftoverAtBase = overflowFrac - bounceReserve - safetyMargin;
    peakScale = leftoverAtBase < 0 ? baseScale : baseScale + zoomTravel;
    bouncePeak = baseScale + (peakScale - baseScale) / 2;
  };

  const cacheMetrics = () => {
    poster = document.querySelector(".site-bg__poster");
    frame = document.querySelector(".site-bg__frame");
    layoutVh = root.clientHeight || window.innerHeight || 1;
    restVh = (frame && frame.offsetHeight > 1) ? frame.offsetHeight : layoutVh;
    maxScrollPx = Math.max(1, root.scrollHeight - layoutVh);
    posterAxisX = plateQuery.matches ? "0" : "-50%";
    syncPeakScale();
    syncChromeCover();
  };

  // Expand-only cover for iPad Chrome URL-bar / toolbar collapse.
  // Grows --bg-cover-h to max(layout, visual, last). Never shrinks.
  // Never calls syncPeakScale.
  const syncChromeCover = () => {
    const vv = window.visualViewport;
    const visual = vv && vv.height > 1 ? vv.height : layoutVh;
    const next = Math.max(layoutVh, restVh, visual, coverH);
    if (next > coverH + 0.5) {
      coverH = next;
      root.style.setProperty("--bg-cover-h", `${coverH}px`);
    }
  };

  const visualHeight = () => {
    const vv = window.visualViewport;
    return vv && vv.height > 1 ? vv.height : layoutVh;
  };

  // When Chrome collapse grows the visible area and the plate has
  // already translated up, shift back down just enough to keep the
  // new bottom band covered. 0 when chrome is showing (rest intact).
  const coverBiasY = () => {
    const grow = Math.max(0, visualHeight() - restVh);
    if (grow < 1 || current >= 0) {
      return 0;
    }
    return Math.min(-current, grow);
  };

  // Layout scrollY only. Do not add visualViewport.offsetTop — on iPad
  // that tracks the URL bar and jitters scale while the finger is still.
  const readScrollY = () => window.scrollY || root.scrollTop || 0;

  const scaleFromProgress = (progress) => {
    // Zoom-in from rest (top = base) toward center; never returns to 1.00
    // at the page bottom the way the old dune ±5% V-curve did.
    return baseScale + (peakScale - baseScale) * progress;
  };

  const persistParallax = () => {
    try {
      sessionStorage.setItem(storageKey, String(current));
      sessionStorage.setItem(scaleKey, String(currentScale));
    } catch (_) {
      /* private mode */
    }
  };

  try {
    const saved = sessionStorage.getItem(storageKey);
    if (saved != null) {
      const parsed = parseFloat(saved);
      if (!Number.isNaN(parsed)) {
        current = parsed;
      }
    } else {
      const existing = parseFloat(getComputedStyle(root).getPropertyValue("--bg-parallax"));
      if (!Number.isNaN(existing)) {
        current = existing;
      }
    }
    const savedScale = sessionStorage.getItem(scaleKey);
    if (savedScale != null) {
      const parsedScale = parseFloat(savedScale);
      if (!Number.isNaN(parsedScale)) {
        currentScale = parsedScale;
      }
    } else {
      const existingScale = parseFloat(getComputedStyle(root).getPropertyValue("--bg-scale"));
      if (!Number.isNaN(existingScale) && existingScale > 0) {
        currentScale = existingScale;
      }
    }
    /* Handoff is consumed in boot() after .site-bg__poster exists. */
  } catch (_) {
    /* private mode */
  }

  const pageProgress = () => {
    const y = Math.max(0, readScrollY());
    return clamp(y / maxScrollPx, 0, 1);
  };

  const computeTarget = () => {
    if (reduce.matches) {
      return 0;
    }
    const y = readScrollY();
    const maxPx = restVh * maxTravel;
    const pull = Math.max(y < 0 ? -y : 0, touchPull);
    if (pull > 0) {
      return clamp(pull * 0.22, 0, maxPx);
    }
    const progress = pageProgress();
    return clamp(-progress * maxPx, -maxPx, maxPx);
  };

  const computeScale = () => {
    if (reduce.matches) {
      return baseScale;
    }
    const y = readScrollY();
    const pull = Math.max(y < 0 ? -y : 0, touchPull);
    if (pull > 0) {
      const t = clamp(pull / (restVh * 0.2), 0, 1);
      return baseScale + (bouncePeak - baseScale) * t;
    }
    return scaleFromProgress(pageProgress());
  };

  const apply = () => {
    const maxPx = restVh * maxTravel;
    current = clamp(current, -maxPx, maxPx);
    currentScale = clamp(currentScale, baseScale, Math.max(peakScale, bouncePeak));
    if (poster) {
      // Transform-only on the plate. Do not write --bg-* on :root
      // during scroll — that invalidates the whole document.
      const y = current + coverBiasY();
      poster.style.transform =
        `translate3d(${posterAxisX}, calc(-50% + ${y}px), 0) scale(${currentScale})`;
    } else {
      root.style.setProperty("--bg-parallax", `${current}px`);
      root.style.setProperty("--bg-scale", String(currentScale));
    }
  };

  const finishArrive = () => {
    if (!arriving) {
      return;
    }
    arriving = false;
    root.classList.remove("is-nav-carry");
    /* Keep history.scrollRestoration = "manual" for in-site nav.
       Flipping to auto here lets the browser restore a stale Y
       while image-heavy pages (出版著作) are still growing. */
  };

  const snapRest = () => {
    current = 0;
    target = 0;
    currentScale = baseScale;
    targetScale = baseScale;
    holdFirstFrame = false;
    lerpUntilSettled = false;
    if (poster) {
      poster.style.transform = "";
    }
    root.style.setProperty("--bg-parallax", "0px");
    root.style.setProperty("--bg-scale", "1");
    rafPending = false;
    finishArrive();
  };

  const tick = () => {
    rafPending = false;
    if (reduce.matches) {
      snapRest();
      return;
    }
    if (holdFirstFrame) {
      holdFirstFrame = false;
      apply();
      lerpUntilSettled = true;
      requestTick(true);
      return;
    }

    syncPortraitNav();
    target = computeTarget();
    targetScale = computeScale();

    // Live scroll: 1:1 with the latest scrollY this frame. Lerp only
    // for in-site arrive and bounce release — chasing a discrete
    // target on iPad is what made the zoom 一卡一卡.
    if (!arriving && !lerpUntilSettled) {
      current = target;
      currentScale = targetScale;
      apply();
      return;
    }

    const step = arriving ? arriveEase : ease;
    const delta = target - current;
    const deltaScale = targetScale - currentScale;
    if (Math.abs(delta) < 0.08 && Math.abs(deltaScale) < 0.0008) {
      current = target;
      currentScale = targetScale;
      apply();
      lerpUntilSettled = false;
      finishArrive();
      return;
    }
    current += delta * step;
    currentScale += deltaScale * step;
    apply();
    requestTick(true);
  };

  const requestTick = (lerp) => {
    if (!booted) {
      return;
    }
    if (reduce.matches) {
      snapRest();
      return;
    }
    if (lerp) {
      lerpUntilSettled = true;
    }
    if (rafPending) {
      return;
    }
    rafPending = true;
    window.requestAnimationFrame(tick);
  };

  const cancelScrollSettle = () => {
    userTookScroll = true;
    lerpUntilSettled = false;
    finishArrive();
  };
  const portraitNav = window.matchMedia("(max-width: 960px)");
  const portraitNavSlop = 8;

  const syncPortraitNav = () => {
    if (!portraitNav.matches) {
      root.classList.remove("is-portrait-nav-away");
      return;
    }
    const y = window.scrollY || root.scrollTop || 0;
    if (y > portraitNavSlop) {
      root.classList.add("is-portrait-nav-away");
    } else {
      root.classList.remove("is-portrait-nav-away");
    }
  };

  const markHandoff = () => {
    persistParallax();
    try {
      sessionStorage.setItem(handoffKey, "1");
    } catch (_) {
      /* private mode */
    }
  };

  document.addEventListener(
    "click",
    (event) => {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const rawTarget = event.target;
      const from = rawTarget && rawTarget.nodeType === 1 ? rawTarget : rawTarget && rawTarget.parentElement;
      const link = from && typeof from.closest === "function" ? from.closest("a[href]") : null;
      if (!link) {
        return;
      }
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || link.hasAttribute("download")) {
        return;
      }
      if (link.target && link.target !== "_self") {
        return;
      }
      let next;
      try {
        next = new URL(link.href, window.location.href);
      } catch (_) {
        return;
      }
      if (next.origin !== window.location.origin) {
        return;
      }
      if (next.pathname === window.location.pathname && next.search === window.location.search) {
        return;
      }
      markHandoff();
    },
    true,
  );

  window.addEventListener("pagehide", () => {
    persistParallax();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      persistParallax();
    }
  });

  window.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.touches[0];
      if (!touch) {
        return;
      }
      touching = true;
      touchStartY = touch.clientY;
      touchPull = 0;
    },
    { passive: true },
  );

  window.addEventListener(
    "touchmove",
    (event) => {
      const touch = event.touches[0];
      if (!touching || !touch) {
        return;
      }
      const dy = touch.clientY - touchStartY;
      if (readScrollY() <= 0 && dy > 0) {
        touchPull = dy;
        requestTick(false);
      } else {
        touchPull = 0;
      }
    },
    { passive: true },
  );

  const endTouch = () => {
    touching = false;
    touchPull = 0;
    requestTick(true);
  };
  window.addEventListener("touchend", endTouch, { passive: true });
  window.addEventListener("touchcancel", endTouch, { passive: true });

  window.addEventListener(
    "scroll",
    () => {
      if (!arriving) {
        lerpUntilSettled = false;
      }
      requestTick(arriving);
    },
    { passive: true },
  );
  window.addEventListener(
    "wheel",
    () => {
      if (arriving) {
        cancelScrollSettle();
      }
      requestTick(false);
    },
    { passive: true },
  );
  window.addEventListener(
    "keydown",
    (event) => {
      if (
        arriving &&
        (event.key === "PageDown" ||
          event.key === "PageUp" ||
          event.key === "ArrowDown" ||
          event.key === "ArrowUp" ||
          event.key === "Home" ||
          event.key === "End" ||
          event.key === " " ||
          event.key === "Spacebar")
      ) {
        cancelScrollSettle();
      }
      requestTick(false);
    },
    true,
  );
  window.addEventListener(
    "resize",
    () => {
      cacheMetrics();
      requestTick(false);
    },
    { passive: true },
  );
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      arriving = false;
      holdFirstFrame = false;
      lerpUntilSettled = false;
      root.classList.remove("is-nav-carry");
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "auto";
      }
    }
    cacheMetrics();
    requestTick(false);
  });
  // Chrome collapse: expand the clip only. Do not recache peakScale
  // or rest framing — that is the Air 3 jank path.
  if (window.visualViewport) {
    window.visualViewport.addEventListener(
      "resize",
      () => {
        syncChromeCover();
        requestTick(false);
      },
      { passive: true },
    );
  }
  window.addEventListener("load", () => {
    cacheMetrics();
    requestTick(false);
  });
  if (typeof reduce.addEventListener === "function") {
    reduce.addEventListener("change", () => requestTick(false));
  } else if (typeof reduce.addListener === "function") {
    reduce.addListener(() => requestTick(false));
  }
  if (typeof plateQuery.addEventListener === "function") {
    plateQuery.addEventListener("change", () => {
      cacheMetrics();
      requestTick(false);
    });
  } else if (typeof plateQuery.addListener === "function") {
    plateQuery.addListener(() => {
      cacheMetrics();
      requestTick(false);
    });
  }

  const consumeHandoff = () => {
    try {
      arriving = sessionStorage.getItem(handoffKey) === "1";
      if (arriving) {
        sessionStorage.removeItem(handoffKey);
      }
    } catch (_) {
      arriving = false;
    }
    if (!arriving) {
      return;
    }
    root.classList.add("is-nav-carry");
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  };

  const boot = () => {
    poster = document.querySelector(".site-bg__poster");
    if (!poster) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
        return;
      }
      window.requestAnimationFrame(boot);
      return;
    }

    consumeHandoff();
    cacheMetrics();
    booted = true;

    if (reduce.matches) {
      snapRest();
    } else {
      // Paint the carried parallax/scale first, then ease. Never snap.
      holdFirstFrame = arriving || Math.abs(current) > 0.08 || Math.abs(currentScale - baseScale) > 0.0008;
      apply();
      requestTick(arriving || holdFirstFrame);
    }
    if (typeof portraitNav.addEventListener === "function") {
      portraitNav.addEventListener("change", syncPortraitNav);
    } else if (typeof portraitNav.addListener === "function") {
      portraitNav.addListener(syncPortraitNav);
    }
    syncPortraitNav();
  };

  boot();
})();
