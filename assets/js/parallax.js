(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  // CSS layer is already 115% (15% overflow buffer). That buffer is for
  // rubber-band / overscroll — do not consume it with scroll zoom.
  // Intentional zoom-in toward center uses ~8% (1.00–1.08), leftover ~7%+
  // for bounce. Translate stays ≤6vh so it fits inside remaining overflow
  // after that zoom. Do not peak at 1.15 on a 115% layer.
  const maxTravel = 0.06;
  const ease = 0.16;
  const storageKey = "site-bg-parallax";
  const scaleKey = "site-bg-scale";
  const handoffKey = "site-bg-handoff";
  const baseScale = 1;
  const peakScale = 1.08;

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
  let holdFirstFrame = false;

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
    }
  } catch (_) {
    /* private mode */
  }

  // Full page loads reset scrollY to 0 while the stored offset may still be mid-travel.
  if (!arriving && Math.abs(current) > 0.5 && readScrollY() < 2) {
    arriving = true;
  }

  if (arriving) {
    root.classList.add("is-nav-carry");
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
    const pull = Math.max(y < 0 ? -y : 0, touchPull);
    if (pull > 0) {
      return baseScale;
    }
    return scaleFromProgress(pageProgress());
  };

  const apply = () => {
    const maxPx = (window.innerHeight || 1) * maxTravel;
    current = clamp(current, -maxPx, maxPx);
    currentScale = clamp(currentScale, baseScale, peakScale);
    root.style.setProperty("--bg-parallax", `${current.toFixed(2)}px`);
    root.style.setProperty("--bg-scale", currentScale.toFixed(4));
    persistParallax();
  };

  const finishArrive = () => {
    if (!arriving) {
      return;
    }
    arriving = false;
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
    apply();
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
    targetScale = computeScale();
    const delta = target - current;
    const deltaScale = targetScale - currentScale;
    if (Math.abs(delta) < 0.08 && Math.abs(deltaScale) < 0.0008) {
      current = target;
      currentScale = targetScale;
      apply();
      running = false;
      finishArrive();
      return;
    }
    current += delta * ease;
    currentScale += deltaScale * ease;
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
      const link = event.target.closest ? event.target.closest("a[href]") : null;
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

  window.addEventListener("pagehide", persistParallax);

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

  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", kick, { passive: true });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      arriving = false;
      holdFirstFrame = false;
    }
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
})();
