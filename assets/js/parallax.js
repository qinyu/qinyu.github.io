(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  // Merged main: landscape layer 115%, --bg-scale 1.00–1.08.
  // At scroll top, scale is the MIN (1.00), not max zoom-in.
  // 115% × 1.00 still has ~15% overflow on paper — but bounce only
  // drove translateY and clamped scale to 1.00, so the finger felt
  // Y-only (easy to read as a "zoom-in limit").
  // Now: rest width ~122%, intentional zoom 1.00–1.06 (peak ≈ 129%
  // wide). Top overscroll eases scale UP a little (1.00 → ~1.035)
  // so horizontal framing follows the pull. Never clamp to flush cover.
  const maxTravel = 0.06;
  const ease = 0.16;
  const arriveEase = 0.08;
  const storageKey = "site-bg-parallax";
  const scrollKey = "site-bg-scroll";
  const scaleKey = "site-bg-scale";
  const handoffKey = "site-bg-handoff";
  const barKey = "site-nav-bar";
  const leaveMs = 160;
  const baseScale = 1;
  const peakScale = 1.06;
  const bounceScaleIn = 0.035;

  let current = 0;
  let target = 0;
  let currentScale = baseScale;
  let targetScale = baseScale;
  let running = false;
  let touchStartY = 0;
  let touchPullTop = 0;
  let touchPullBottom = 0;
  let touching = false;
  // After an in-site nav: keep the outgoing visual, ease to the new page's Y.
  let arriving = false;
  let arriveScroll = 0;
  let holdFirstFrame = false;
  let userTookScroll = false;
  let navScrollY = 0;

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  // Layout viewport only. window.innerHeight / visualViewport.height
  // thrash when Chrome's URL bar collapses and would pop --bg-scale.
  const layoutHeight = () => root.clientHeight || window.innerHeight || 1;

  const readScrollY = () => window.scrollY || root.scrollTop || 0;

  const maxScrollY = () => Math.max(0, root.scrollHeight - layoutHeight());

  const topOverscrollPx = () => {
    const y = window.scrollY || root.scrollTop || 0;
    return Math.max(y < 0 ? -y : 0, touchPullTop);
  };

  const bottomOverscrollPx = () => {
    const y = window.scrollY || root.scrollTop || 0;
    return Math.max(y > maxScrollY() ? y - maxScrollY() : 0, touchPullBottom);
  };

  const bounceT = (pull) => clamp(pull / (layoutHeight() * 0.18), 0, 1);

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
    const maxScroll = Math.max(1, maxScrollY());
    return clamp(y / maxScroll, 0, 1);
  };

  const computeTarget = () => {
    if (reduce.matches) {
      return 0;
    }
    const maxPx = layoutHeight() * maxTravel;
    const top = topOverscrollPx();
    if (top > 0) {
      return clamp(top * 0.22, 0, maxPx);
    }
    const progress = pageProgress();
    return clamp(-progress * maxPx, -maxPx, maxPx);
  };

  const computeScale = () => {
    if (reduce.matches) {
      return baseScale;
    }
    const top = topOverscrollPx();
    if (top > 0) {
      // Was Y-only (clamped to 1.00). Zoom-in with reserved width.
      return baseScale + bounceScaleIn * bounceT(top);
    }
    const bottom = bottomOverscrollPx();
    if (bottom > 0) {
      return peakScale - bounceScaleIn * bounceT(bottom);
    }
    return scaleFromProgress(pageProgress());
  };

  const apply = () => {
    const maxPx = layoutHeight() * maxTravel;
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
    arriveScroll = 0;
    navScrollY = 0;
    applyScrollCarry();
    root.classList.remove("is-nav-carry");
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "auto";
    }
    window.setTimeout(() => {
      root.classList.remove("is-nav-carry");
      root.classList.remove("is-nav-arrive");
    }, 400);
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
    finishArrive();
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

  const navRoot = () => document.querySelector(".header .nav");

  const activeNavLink = () =>
    document.querySelector(".header .nav__list:not(.nav__list--end) a.nav__link--active");

  const ensureUnderline = (nav) => {
    let bar = nav.querySelector(".nav__underline");
    if (!bar) {
      bar = document.createElement("span");
      bar.className = "nav__underline";
      bar.setAttribute("aria-hidden", "true");
      nav.appendChild(bar);
    }
    return bar;
  };

  const barMetrics = (nav, link) => {
    const nr = nav.getBoundingClientRect();
    const r = link.getBoundingClientRect();
    return {
      left: r.left - nr.left,
      width: r.width,
      top: r.bottom - nr.top - 1,
    };
  };

  const applyBar = (bar, metrics, animate) => {
    bar.style.transition = animate && !reduce.matches ? "" : "none";
    bar.style.left = `${metrics.left.toFixed(2)}px`;
    bar.style.width = `${metrics.width.toFixed(2)}px`;
    bar.style.top = `${metrics.top.toFixed(2)}px`;
    if (!animate) {
      void bar.offsetWidth;
    }
  };

  const persistBar = (metrics) => {
    try {
      sessionStorage.setItem(barKey, JSON.stringify(metrics));
    } catch (_) {
      /* private mode */
    }
  };

  const readBar = () => {
    try {
      const raw = sessionStorage.getItem(barKey);
      if (!raw) {
        return null;
      }
      sessionStorage.removeItem(barKey);
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.left === "number") {
        return parsed;
      }
    } catch (_) {
      /* private mode */
    }
    return null;
  };

  const initNavMotion = () => {
    const nav = navRoot();
    const link = activeNavLink();
    if (!nav || !link) {
      return;
    }
    const bar = ensureUnderline(nav);
    const dest = barMetrics(nav, link);
    const from = arriving ? readBar() : null;
    if (from && !reduce.matches) {
      applyBar(bar, from, false);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => applyBar(bar, dest, true));
      });
    } else {
      applyBar(bar, dest, false);
    }
    if (arriving && !reduce.matches) {
      window.requestAnimationFrame(() => {
        root.classList.add("is-nav-arrive");
      });
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
      const nav = navRoot();
      if (nav && nav.contains(link) && !reduce.matches) {
        const dest = barMetrics(nav, link);
        persistBar(dest);
        applyBar(ensureUnderline(nav), dest, true);
      }
      const page = document.querySelector(".page-body");
      if (page && !reduce.matches) {
        event.preventDefault();
        page.classList.add("is-page-leave");
        window.setTimeout(() => {
          window.location.href = next.href;
        }, leaveMs);
      }
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
      touchPullTop = 0;
      touchPullBottom = 0;
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
      const y = window.scrollY || root.scrollTop || 0;
      const max = maxScrollY();
      if (y <= 0 && dy > 0) {
        touchPullTop = dy;
        touchPullBottom = 0;
        kick();
      } else if (y >= max - 1 && dy < 0) {
        touchPullBottom = -dy;
        touchPullTop = 0;
        kick();
      } else {
        touchPullTop = 0;
        touchPullBottom = 0;
      }
    },
    { passive: true },
  );

  const endTouch = () => {
    touching = false;
    touchPullTop = 0;
    touchPullBottom = 0;
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
  // Layout resize (rotate / desktop window) only. Do not subscribe to
  // visualViewport — Chrome URL-bar collapse fires those and would
  // re-kick scale against a changing visual height.
  window.addEventListener(
    "resize",
    () => {
      const nav = navRoot();
      const link = activeNavLink();
      if (nav && link) {
        applyBar(ensureUnderline(nav), barMetrics(nav, link), false);
      }
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
  initNavMotion();
  syncPortraitNav();
})();
