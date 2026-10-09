/* ==========================================================================
   Stackly Wellness — Preloader
   ========================================================================== */
(function () {
  "use strict";

  function hidePreloader() {
    var el = document.getElementById("preloader");
    if (!el) return;
    el.classList.add("is-done");
    setTimeout(function () {
      el.setAttribute("aria-hidden", "true");
    }, 700);
  }

  if (document.readyState === "complete") {
    setTimeout(hidePreloader, 500);
  } else {
    window.addEventListener("load", function () {
      setTimeout(hidePreloader, 550);
    });
  }

  // Safety fallback
  setTimeout(hidePreloader, 4000);
})();
