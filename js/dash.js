/* ==========================================================================
   Stackly Wellness — Dashboard UI
   ========================================================================== */
(function () {
  "use strict";

  var user = window.StacklyAuth ? window.StacklyAuth.getUser() : null;

  document.querySelectorAll("[data-user-name]").forEach(function (el) {
    el.textContent = user && user.name ? formatName(user.name) : "Guest";
  });

  document.querySelectorAll("[data-user-email]").forEach(function (el) {
    el.textContent = user && user.email ? user.email : "guest@stackly.wellness";
  });

  document.querySelectorAll("[data-user-plan]").forEach(function (el) {
    el.textContent = user && user.membership ? user.membership : "Bloom";
  });

  function formatName(raw) {
    if (!raw) return "Guest";
    return raw
      .split(/[._\s-]+/)
      .map(function (p) {
        return p.charAt(0).toUpperCase() + p.slice(1);
      })
      .join(" ");
  }

  /* In-dashboard subpages (hash views) — no element ids, so hash never scrolls the page */
  var views = Array.prototype.slice.call(document.querySelectorAll("[data-dash-view]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-dash-nav]"));

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  function pinDashTop() {
    if (window.scrollY !== 0 || document.documentElement.scrollTop !== 0) {
      window.scrollTo(0, 0);
    }
  }

  function currentView() {
    var hash = (window.location.hash || "#overview").replace(/^#/, "");
    if (!hash) hash = "overview";
    var exists = views.some(function (view) {
      return view.getAttribute("data-dash-view") === hash;
    });
    return exists ? hash : "overview";
  }

  function showView(name) {
    views.forEach(function (view) {
      var match = view.getAttribute("data-dash-view") === name;
      view.classList.toggle("is-active", match);
      if (match) {
        view.removeAttribute("hidden");
      } else {
        view.setAttribute("hidden", "");
      }
    });

    navLinks.forEach(function (link) {
      var href = link.getAttribute("href") || "";
      var target = href.replace(/^#/, "");
      link.classList.toggle("is-active", target === name);
    });

    pinDashTop();
  }

  function goToView(name) {
    if (!name) name = "overview";
    var next = "#" + name;
    /* pushState updates the hash without scrolling */
    if (window.location.hash !== next) {
      history.pushState({ dashView: name }, "", next);
    }
    showView(name);
  }

  if (views.length) {
    navLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var href = link.getAttribute("href") || "";
        if (href.charAt(0) !== "#") return;
        e.preventDefault();
        goToView(href.replace(/^#/, ""));
        closeDrawer();
      });
    });

    window.addEventListener("popstate", function () {
      showView(currentView());
    });

    window.addEventListener("hashchange", function () {
      showView(currentView());
      pinDashTop();
    });

    if (!window.location.hash) {
      history.replaceState({ dashView: "overview" }, "", "#overview");
    }
    showView(currentView());
    pinDashTop();
    window.addEventListener("load", pinDashTop);
  }

  /* Mobile drawer */
  var openBtn = document.querySelector("[data-dash-open]");
  var drawer = document.getElementById("dash-drawer");
  var closeBtn = document.querySelector("[data-dash-close]");

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  if (openBtn && drawer) {
    openBtn.addEventListener("click", function () {
      drawer.classList.add("is-open");
      document.body.style.overflow = "hidden";
    });
  }
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (drawer) {
    drawer.addEventListener("click", function (e) {
      if (e.target === drawer) closeDrawer();
    });
  }

  /* Action buttons / CTAs → 404.html (ThemeForest stub pages) */
  function go404(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    window.location.href = "404.html";
  }

  function isChromeControl(el) {
    if (!el) return true;
    if (el.hasAttribute("data-dash-open") || el.hasAttribute("data-dash-close")) return true;
    if (el.hasAttribute("data-logout")) return true;
    if (el.hasAttribute("data-status-cycle")) return true;
    if (el.classList.contains("dash-menu-btn")) return true;
    return false;
  }

  document.querySelectorAll(".dash-main .btn, .dash-main button.btn").forEach(function (el) {
    if (isChromeControl(el)) return;
    /* Keep in-dashboard section nav working */
    if (el.hasAttribute("data-dash-nav")) return;
    /* Request session validates first, then redirects */
    if (el.id === "quick-book-submit") return;
    el.addEventListener("click", go404);
  });

  /* Quick book → validate, then 404 */
  var quickBook = document.getElementById("quick-book-form");
  var quickBookBtn = document.getElementById("quick-book-submit");

  function submitQuickBook(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!quickBook) return false;

    var service = document.getElementById("qb-service");
    var date = document.getElementById("qb-date");
    var ok = true;

    [service, date].forEach(function (field) {
      if (!field) {
        ok = false;
        return;
      }
      var group = field.closest(".form-group");
      var valid = String(field.value || "").trim().length > 0;
      if (group) group.classList.toggle("is-invalid", !valid);
      if (!valid) ok = false;
    });

    if (!ok) return false;
    window.location.href = "404.html";
    return false;
  }

  if (quickBook) {
    quickBook.addEventListener("submit", submitQuickBook);
  }
  if (quickBookBtn) {
    quickBookBtn.addEventListener("click", submitQuickBook);
  }

  /* Admin status toggles (demo) */
  document.querySelectorAll("[data-status-cycle]").forEach(function (btn) {
    var states = [
      { label: "Confirmed", cls: "badge--ok" },
      { label: "Pending", cls: "badge--warn" },
      { label: "Completed", cls: "badge--info" },
    ];
    var i = 0;
    btn.addEventListener("click", function () {
      i = (i + 1) % states.length;
      btn.className = "badge " + states[i].cls;
      btn.textContent = states[i].label;
    });
  });
})();
