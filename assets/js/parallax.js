(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  // Layer bleed is 10vh top + 10vh bottom; 8vh max travel leaves 2vh safety.
  const maxBleed = 0.08;
  let ticking = false;

  const apply = () => {
    ticking = false;
    if (reduce.matches) {
      root.style.setProperty("--bg-parallax", "0px");
      return;
    }
    const maxPx = window.innerHeight * maxBleed;
    const maxScroll = Math.max(1, root.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, (window.scrollY || 0) / maxScroll));
    root.style.setProperty("--bg-parallax", `${(-progress * maxPx).toFixed(1)}px`);
  };

  const onScroll = () => {
    if (reduce.matches || ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(apply);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", apply, { passive: true });
  if (typeof reduce.addEventListener === "function") {
    reduce.addEventListener("change", apply);
  } else if (typeof reduce.addListener === "function") {
    reduce.addListener(apply);
  }
  apply();
})();
