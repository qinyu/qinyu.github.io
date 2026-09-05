(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  // Poster layer bleed is 10vh top + 10vh bottom; 8vh max travel leaves 2vh safety.
  const maxBleed = 0.08;
  let ticking = false;

  const paint = () => {
    if (reduce.matches) {
      root.style.setProperty("--bg-parallax", "0px");
      return;
    }
    const maxPx = window.innerHeight * maxBleed;
    const maxScroll = Math.max(1, root.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, (window.scrollY || 0) / maxScroll));
    root.style.setProperty("--bg-parallax", `${(-progress * maxPx).toFixed(1)}px`);
  };

  const schedule = () => {
    if (reduce.matches || ticking) {
      if (reduce.matches) {
        root.style.setProperty("--bg-parallax", "0px");
      }
      return;
    }
    ticking = true;
    window.requestAnimationFrame(() => {
      ticking = false;
      paint();
    });
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  if (typeof reduce.addEventListener === "function") {
    reduce.addEventListener("change", paint);
  } else if (typeof reduce.addListener === "function") {
    reduce.addListener(paint);
  }
  paint();
})();
