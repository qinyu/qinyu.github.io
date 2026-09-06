(() => {
  /* Reserve-then-reveal for shelf covers and the Mars poster.
     Use load/complete, not decode() — decode can hang and leave opacity 0.
     Do not resize .site-bg__poster; parallax.js owns rest framing. */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  const markLoaded = (el) => {
    if (el) {
      el.classList.add("is-loaded");
    }
  };

  const whenReady = (img, done) => {
    if (!img) {
      done();
      return;
    }
    if (img.complete) {
      done();
      return;
    }
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  };

  const scanCovers = () => {
    document.querySelectorAll(".bookshelf__cover.loading, .series-grid__cover.loading").forEach((cover) => {
      if (cover.classList.contains("is-loaded")) {
        return;
      }
      whenReady(cover.querySelector("img"), () => markLoaded(cover));
    });
  };

  const posterUrl = () => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--bg-image").trim();
    const match = raw.match(/url\(\s*(['"]?)(.*?)\1\s*\)/);
    return match ? match[2] : "";
  };

  /* Start Mars fetch as soon as this head bundle runs. */
  const mars = new Image();
  const marsSrc = posterUrl();
  if (marsSrc) {
    mars.src = marsSrc;
  }

  const revealPoster = () => {
    const poster = document.querySelector(".site-bg__poster");
    if (!poster || poster.classList.contains("is-loaded")) {
      return;
    }
    if (reduce.matches || !marsSrc) {
      markLoaded(poster);
      return;
    }
    whenReady(mars, () => markLoaded(poster));
  };

  const boot = () => {
    scanCovers();
    revealPoster();
  };

  boot();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  }
  document.addEventListener("cover-imgs-reset", scanCovers);
  window.addEventListener("load", boot);
})();
