(() => {
  const holdMs = 320;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  const scaleTarget = (el) => {
    if (el.classList.contains("series-grid__item")) {
      return el;
    }
    return el.querySelector(".bookshelf__cover img") || el.querySelector(".bookshelf__cover") || el;
  };

  const bind = (el) => {
    const target = scaleTarget(el);
    let timer = 0;
    let down = false;
    let held = false;

    const clearTimer = () => {
      if (timer) {
        window.clearTimeout(timer);
        timer = 0;
      }
    };

    const releaseHold = () => {
      target.classList.remove("is-shelf-held");
      held = false;
    };

    const bounce = () => {
      target.classList.remove("is-shelf-bounce");
      void target.offsetWidth;
      target.classList.add("is-shelf-bounce");
    };

    el.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) {
        return;
      }
      if (reduce.matches) {
        return;
      }
      down = true;
      held = false;
      target.classList.remove("is-shelf-bounce");
      clearTimer();
      timer = window.setTimeout(() => {
        if (!down) {
          return;
        }
        held = true;
        target.classList.add("is-shelf-held");
      }, holdMs);
    });

    const finish = (event) => {
      if (!down) {
        return;
      }
      down = false;
      clearTimer();
      if (reduce.matches) {
        releaseHold();
        return;
      }
      if (held) {
        releaseHold();
        return;
      }
      if (event && event.type === "pointercancel") {
        return;
      }
      bounce();
    };

    el.addEventListener("pointerup", finish);
    el.addEventListener("pointercancel", (event) => {
      finish(event);
      target.classList.remove("is-shelf-bounce");
    });
    el.addEventListener("pointerleave", () => {
      if (!down) {
        return;
      }
      down = false;
      clearTimer();
      releaseHold();
    });
    target.addEventListener("animationend", (event) => {
      if (event.animationName === "shelf-bounce") {
        target.classList.remove("is-shelf-bounce");
      }
    });
  };

  document.querySelectorAll(".bookshelf__item, .series-grid__item").forEach(bind);
})();
