(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  // Layer bleed is 20% top + 20% bottom; travel ≤10vh either way.
  const maxTravel = 0.1;
  const ease = 0.16;
  const storageKey = "dune-bg-parallax";

  let current = 0;
  let target = 0;
  let running = false;
  let touchStartY = 0;
  let touchPull = 0;
  let touching = false;

  try {
    const saved = sessionStorage.getItem(storageKey);
    if (saved != null) {
      current = parseFloat(saved) || 0;
    }
  } catch (_) {
    /* private mode */
  }

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  const rawScrollY = () => {
    const y = window.scrollY || root.scrollTop || 0;
    const vv = window.visualViewport;
    if (y <= 0 && vv && vv.offsetTop) {
      return y + vv.offsetTop;
    }
    return y;
  };

  const computeTarget = () => {
    if (reduce.matches) {
      return 0;
    }
    const y = rawScrollY();
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

  const tick = () => {
    target = computeTarget();
    const delta = target - current;
    if (Math.abs(delta) < 0.08) {
      current = target;
      apply();
      running = false;
      return;
    }
    current += delta * ease;
    apply();
    running = true;
    window.requestAnimationFrame(tick);
  };

  const kick = () => {
    if (reduce.matches) {
      current = 0;
      target = 0;
      apply();
      running = false;
      return;
    }
    if (!running) {
      running = true;
      window.requestAnimationFrame(tick);
    }
  };

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
      if (rawScrollY() <= 0 && dy > 0) {
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
  window.addEventListener("pageshow", kick);
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
  kick();
})();
