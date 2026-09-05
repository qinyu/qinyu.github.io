(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const factor = 0.16;
  let ticking = false;

  const apply = () => {
    ticking = false;
    if (reduce.matches) {
      root.style.setProperty("--bg-parallax", "0px");
      return;
    }
    const y = window.scrollY || 0;
    root.style.setProperty("--bg-parallax", `${(-y * factor).toFixed(1)}px`);
  };

  const onScroll = () => {
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(apply);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  if (typeof reduce.addEventListener === "function") {
    reduce.addEventListener("change", apply);
  } else if (typeof reduce.addListener === "function") {
    reduce.addListener(apply);
  }
  apply();
})();
