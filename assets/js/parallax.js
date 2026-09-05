(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  // Layer bleed is 20% top + 20% bottom; travel ≤10vh either way.
  const maxTravel = 0.1;
  const ease = 0.16;
  const arriveEase = 0.1;
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

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  const readScrollY = () => {
    const y = window.scrollY || root.scrollTop || 0;
    const vv = window.visualViewport;
    if (y <= 0 && vv && vv.offsetTop) {
      return y + vv.offsetTop;
    }
    return y;
  };

  try {
    const saved = sessionStorage.getItem(storageKey);
    if (saved != null) {
      current = parseFloat(saved) || 0;
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
    try {
      sessionStorage.setItem(storageKey, String(current));
    } catch (_) {
      /* private mode */
    }
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

  const tick = () => {
    target = computeTarget();
    const step = arriving ? arriveEase : ease;
    if (arriving && arriveScroll > 0.5) {
      arriveScroll += (0 - arriveScroll) * step;
      if (arriveScroll < 0.5) {
        arriveScroll = 0;
      }
      window.scrollTo(0, arriveScroll);
    }
    const delta = target - current;
    if (Math.abs(delta) < 0.08 && (!arriving || arriveScroll < 0.5)) {
      current = target;
      apply();
      running = false;
      finishArrive();
      return;
    }
    current += delta * step;
    apply();
    running = true;
    window.requestAnimationFrame(tick);
  };

  const kick = () => {
    if (reduce.matches) {
      current = 0;
      target = 0;
      arriving = false;
      arriveScroll = 0;
      apply();
      running = false;
      return;
    }
    if (!running) {
      running = true;
      window.requestAnimationFrame(tick);
    }
  };

  const markHandoff = () => {
    try {
      sessionStorage.setItem(storageKey, String(current));
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
      const link = event.target.closest("a[href]");
      if (!link) {
        return;
      }
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#")) {
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
    try {
      sessionStorage.setItem(storageKey, String(current));
    } catch (_) {
      /* private mode */
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

  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", kick, { passive: true });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      arriving = false;
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

  apply();

  // Do not ease in <head> before first paint — that finishes at rest and looks like a snap.
  const start = () => {
    if (arriving) {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(kick);
      });
      return;
    }
    kick();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
