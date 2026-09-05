(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  // Layer bleed is ~28% top + bottom (landscape ~36%); travel ≤10vh either way.
  const maxTravel = 0.1;
  const ease = 0.16;
  const storageKey = "dune-bg-parallax";
  const handoffKey = "dune-bg-handoff";

  let current = 0;
  let target = 0;
  let running = false;
  let touchStartY = 0;
  let touchPull = 0;
  let touching = false;
  // After an in-site nav: keep the outgoing visual, ease to rest. Never snap.
  let arriving = false;
  let arriveScroll = 0;
  let holdFirstFrame = false;
  let userTookScroll = false;

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  const readScrollY = () => {
    const y = window.scrollY || root.scrollTop || 0;
    const vv = window.visualViewport;
    if (y <= 0 && vv && vv.offsetTop) {
      return y + vv.offsetTop;
    }
    return y;
  };

  const persistParallax = () => {
    try {
      sessionStorage.setItem(storageKey, String(current));
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
    arriveScroll = readScrollY();
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }

  const computeTarget = () => {
    if (reduce.matches || arriving) {
      return 0;
    }
    const y = readScrollY();
    const vh = window.innerHeight || 1;
    const maxPx = vh * maxTravel;
    const pull = Math.max(y < 0 ? -y : 0, touchPull);
    if (pull > 0) {
      return clamp(pull * 0.22, 0, maxPx);
    }
    const maxScroll = Math.max(1, root.scrollHeight - vh);
    const progress = clamp(y / maxScroll, 0, 1);
    return clamp(-progress * maxPx, -maxPx, maxPx);
  };

  const apply = () => {
    const maxPx = (window.innerHeight || 1) * maxTravel;
    current = clamp(current, -maxPx, maxPx);
    root.style.setProperty("--bg-parallax", `${current.toFixed(2)}px`);
    persistParallax();
  };

  const finishArrive = () => {
    if (!arriving) {
      return;
    }
    arriving = false;
    arriveScroll = 0;
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "auto";
    }
  };

  const snapRest = () => {
    current = 0;
    target = 0;
    holdFirstFrame = false;
    apply();
    running = false;
    if (arriving && readScrollY() !== 0) {
      window.scrollTo(0, 0);
    }
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
    if (arriving && !userTookScroll && arriveScroll > 0.5) {
      arriveScroll += (0 - arriveScroll) * ease;
      if (arriveScroll < 0.5) {
        arriveScroll = 0;
      }
      window.scrollTo(0, arriveScroll);
    }
    const delta = target - current;
    if (Math.abs(delta) < 0.08 && (!arriving || arriveScroll < 0.5 || userTookScroll)) {
      current = target;
      apply();
      running = false;
      finishArrive();
      return;
    }
    current += delta * ease;
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
      cancelScrollSettle();
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

  window.addEventListener("wheel", cancelScrollSettle, { passive: true });
  window.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "PageUp" ||
        event.key === "PageDown" ||
        event.key === "Home" ||
        event.key === "End" ||
        event.key === " "
      ) {
        cancelScrollSettle();
      }
    },
    { passive: true },
  );

  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", kick, { passive: true });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      arriving = false;
      holdFirstFrame = false;
      arriveScroll = 0;
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
    // Paint the carried offset first, then ease to rest. Never snap to 0 then animate.
    holdFirstFrame = arriving || Math.abs(current) > 0.08;
    apply();
    kick();
  }
})();
