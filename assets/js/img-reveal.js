(() => {
  /* Reserve-then-reveal for shelf covers only.
     The Mars poster is the same file as html's plate and is preloaded
     across in-site nav — do not opacity-fade or re-decode it here.
     Use load/complete, not decode() — decode can hang and leave opacity 0.
     Glow stays off until the img has pixels (naturalWidth > 0). */
  const markLoaded = (el) => {
    if (el) {
      el.classList.add("is-loaded");
    }
  };

  const whenReady = (img, done) => {
    if (!img) {
      return;
    }
    /* complete + naturalWidth 0 is a broken/aborted slot — keep glow off. */
    if (img.complete && img.naturalWidth > 0) {
      done();
      return;
    }
    img.addEventListener(
      "load",
      () => {
        if (img.naturalWidth > 0) {
          done();
        }
      },
      { once: true },
    );
  };

  const scanCovers = () => {
    document.querySelectorAll(".bookshelf__cover.loading, .series-grid__cover.loading").forEach((cover) => {
      if (cover.classList.contains("is-loaded")) {
        return;
      }
      whenReady(cover.querySelector("img"), () => markLoaded(cover));
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
