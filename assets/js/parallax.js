(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  // CSS layer stays 120% at rest (20% overflow buffer). Do not shrink
  // that rest size. Intentional scroll zoom is ~3/5 of the 1.04 peak
  // (1.00–1.024) so it is felt but does not track foreground scroll.
  // Top rubber-band still eases a milder scale-in. Translate stays ≤6vh.
  const maxTravel = 0.06;
  const ease = 0.16;
  const arriveEase = 0.08;
  const storageKey = "site-bg-parallax";
  const scrollKey = "site-bg-scroll";
  const scaleKey = "site-bg-scale";
  const handoffKey = "site-bg-handoff";
  const baseScale = 1;
  const peakScale = 1.024;
  const bouncePeak = 1.012;

  let current = 0;
  let target = 0;
  let currentScale = baseScale;
  let targetScale = baseScale;
  let running = false;
  let touchStartY = 0;
  let touchPull = 0;
  let touching = false;
  // After an in-site nav: keep the outgoing visual, ease to the new page's Y.
  let arriving = false;
  let arriveScroll = 0;
  let holdFirstFrame = false;
  let userTookScroll = false;
  let navScrollY = 0;

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  const readScrollY = () => {
    const y = window.scrollY || root.scrollTop || 0;
    const vv = window.visualViewport;
    if (y <= 0 && vv && vv.offsetTop) {
      return y + vv.offsetTop;
    }
    return y;
  };

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

  const persistScroll = (y) => {
    try {
      sessionStorage.setItem(scrollKey, String(y));
    } catch (_) {
      /* private mode */
    }
  };

  const applyScrollCarry = () => {
    root.style.setProperty("--nav-scroll-y", `${navScrollY.toFixed(2)}px`);
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
    arriving = sessionStorage.getItem(handoffKey) === "1";
    if (arriving) {
      sessionStorage.removeItem(handoffKey);
      const savedScroll = sessionStorage.getItem(scrollKey);
      if (savedScroll != null) {
        const parsedScroll = parseFloat(savedScroll);
        if (!Number.isNaN(parsedScroll)) {
          navScrollY = Math.max(0, parsedScroll);
        }
      }
    }
  } catch (_) {
    /* private mode */
  }

  if (arriving) {
    root.classList.add("is-nav-carry");
    const maxScroll = Math.max(0, root.scrollHeight - (window.innerHeight || 0));
    if (maxScroll > 0) {
      navScrollY = clamp(navScrollY, 0, maxScroll);
    }
    arriveScroll = navScrollY;
    applyScrollCarry();
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }

  const pageProgress = () => {
    const y = readScrollY();
    const vh = window.innerHeight || 1;
    const maxScroll = Math.max(1, root.scrollHeight - vh);
    return clamp(y / maxScroll, 0, 1);
  };

  const computeTarget = () => {
    if (reduce.matches) {
      return 0;
    }
    const y = readScrollY();
    const vh = window.innerHeight || 1;
    const maxPx = vh * maxTravel;
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
    const vh = window.innerHeight || 1;
    const pull = Math.max(y < 0 ? -y : 0, touchPull);
    if (pull > 0) {
      const t = clamp(pull / (vh * 0.2), 0, 1);
      return baseScale + (bouncePeak - baseScale) * t;
    }
    return scaleFromProgress(pageProgress());
  };

  const apply = () => {
    const maxPx = (window.innerHeight || 1) * maxTravel;
    current = clamp(current, -maxPx, maxPx);
    currentScale = clamp(currentScale, baseScale, Math.max(peakScale, bouncePeak));
    root.style.setProperty("--bg-parallax", `${current.toFixed(2)}px`);
    root.style.setProperty("--bg-scale", currentScale.toFixed(4));
    persistParallax();
  };

  const finishArrive = () => {
    if (!arriving) {
      return;
    }
    arriving = false;
    arriveScroll = 0;
    navScrollY = 0;
    applyScrollCarry();
    root.classList.remove("is-nav-carry");
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "auto";
    }
  };

  const snapRest = () => {
    current = 0;
    target = 0;
    currentScale = baseScale;
    targetScale = baseScale;
    holdFirstFrame = false;
    navScrollY = 0;
    apply();
    applyScrollCarry();
    running = false;
    finishArrive();
  };

  const tick = () => {
    if (reduce.matches) {
      snapRest();
      return;
    }
    if (holdFirstFrame) {
      holdFirstFrame = false;
      apply();
      running = true;
      window.requestAnimationFrame(tick);
      return;
    }
    target = computeTarget();
    const step = arriving ? arriveEase : ease;
    if (arriving && !userTookScroll && arriveScroll > 0.5) {
      arriveScroll += (0 - arriveScroll) * step;
      if (arriveScroll < 0.5) {
        arriveScroll = 0;
      }
      navScrollY = arriveScroll;
      applyScrollCarry();
    }
    targetScale = computeScale();
    const delta = target - current;
    const deltaScale = targetScale - currentScale;
    if (Math.abs(delta) < 0.08 && Math.abs(deltaScale) < 0.0008 && (!arriving || arriveScroll < 0.5 || userTookScroll)) {
      current = target;
      currentScale = targetScale;
      apply();
      running = false;
      finishArrive();
      return;
    }
    current += delta * step;
    currentScale += deltaScale * step;
    apply();
    running = true;
    window.requestAnimationFrame(tick);
  };

  const kick = () => {
    if (reduce.matches) {
      snapRest();
      return;
    }
    if (!running) {
      running = true;
      window.requestAnimationFrame(tick);
    }
  };

  const cancelScrollSettle = () => {
    userTookScroll = true;
    arriveScroll = 0;
    navScrollY = 0;
    applyScrollCarry();
    root.classList.remove("is-nav-carry");
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
    persistScroll(readScrollY());
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
    // Unload often reports scrollY=0; do not clobber a handoff offset.
    const y = readScrollY();
    if (y > 0.5) {
      persistScroll(y);
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
        kick();
      } else {
        touchPull = 0;
      }
    },
    { passive: true },
  );

  const endTouch = () => {
    touching = false;
    touchPull = 0;
    kick();
  };
  window.addEventListener("touchend", endTouch, { passive: true });
  window.addEventListener("touchcancel", endTouch, { passive: true });

  window.addEventListener(
    "scroll",
    () => {
      syncPortraitNav();
      kick();
    },
    { passive: true },
  );
  window.addEventListener(
    "wheel",
    () => {
      if (arriving) {
        cancelScrollSettle();
      }
      kick();
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
      kick();
    },
    true,
  );
  window.addEventListener(
    "resize",
    () => {
      syncPortraitNav();
      kick();
    },
    { passive: true },
  );
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      arriving = false;
      holdFirstFrame = false;
      arriveScroll = 0;
      navScrollY = 0;
      applyScrollCarry();
      root.classList.remove("is-nav-carry");
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "auto";
      }
    }
    syncPortraitNav();
    kick();
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("scroll", kick, { passive: true });
    window.visualViewport.addEventListener("resize", kick, { passive: true });
  }
  if (typeof reduce.addEventListener === "function") {
    reduce.addEventListener("change", kick);
  } else if (typeof reduce.addListener === "function") {
    reduce.addListener(kick);
  }

  if (reduce.matches) {
    snapRest();
  } else {
    // Paint the carried frame first, then ease to this page's Y. Never snap.
    holdFirstFrame = arriving || Math.abs(current) > 0.08 || Math.abs(currentScale - baseScale) > 0.0008;
    apply();
    kick();
  }
  if (typeof portraitNav.addEventListener === "function") {
    portraitNav.addEventListener("change", syncPortraitNav);
  } else if (typeof portraitNav.addListener === "function") {
    portraitNav.addListener(syncPortraitNav);
  }
  syncPortraitNav();
})();
