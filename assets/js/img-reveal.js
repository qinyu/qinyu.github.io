(() => {
  /* Reserve-then-reveal for shelf covers and the Mars poster.
     Do not resize .site-bg__poster here — parallax.js owns rest framing. */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  const markLoaded = (el) => {
    if (el) {
      el.classList.add("is-loaded");
    }
  };

  const whenDecoded = (img, done) => {
    if (!img) {
      done();
      return;
    }
    const finish = () => {
      if (typeof img.decode === "function") {
        img.decode().then(done).catch(done);
      } else {
        done();
      }
    };
    if (img.complete && img.naturalWidth > 0) {
      finish();
      return;
    }
    img.addEventListener("load", finish, { once: true });
    img.addEventListener("error", done, { once: true });
  };

  const scanCovers = () => {
    document.querySelectorAll(".bookshelf__cover.loading, .series-grid__cover.loading").forEach((cover) => {
      if (cover.classList.contains("is-loaded")) {
        return;
      }
      whenDecoded(cover.querySelector("img"), () => markLoaded(cover));
    });
  };

  const posterUrl = () => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--bg-image").trim();
    const match = raw.match(/url\(\s*(['"]?)(.*?)\1\s*\)/);
    return match ? match[2] : "";
  };

  /* Start Mars decode as soon as this head bundle runs. */
  const mars = new Image();
  mars.decoding = "async";
  const marsSrc = posterUrl();
  if (marsSrc) {
    mars.src = marsSrc;
  }

  const revealPoster = () => {
    const poster = document.querySelector(".site-bg__poster");
    if (!poster || poster.classList.contains("is-loaded")) {
      return;
    }
    if (reduce.matches) {
      markLoaded(poster);
      return;
    }
    if (!marsSrc) {
      markLoaded(poster);
      return;
    }
    whenDecoded(mars, () => markLoaded(poster));
  };

  const boot = () => {
    scanCovers();
    revealPoster();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
  document.addEventListener("cover-imgs-reset", scanCovers);
  window.addEventListener("load", boot);
})();
