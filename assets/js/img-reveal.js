(() => {
  /* Reserve-then-reveal for shelf covers only.
     The Mars poster is the same file as html's plate and is preloaded
     across in-site nav — do not opacity-fade or re-decode it here.
     Use load/complete, not decode() — decode can hang and leave opacity 0. */
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
      const img = cover.querySelector("img");
      if (reduce.matches) {
        markLoaded(cover);
        return;
      }
      whenReady(img, () => markLoaded(cover));
    });
  };

  const boot = () => {
    scanCovers();
  };

  boot();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  }
  document.addEventListener("cover-imgs-reset", scanCovers);
  window.addEventListener("load", boot);
})();
