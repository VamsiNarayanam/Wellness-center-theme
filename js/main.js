/* ==========================================================================
   Stackly Wellness — Main interactions
   Nav, AOS, sliders, filters, pagination, forms, smooth scroll
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky header ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Ensure page can always scroll (nav/preloader leftovers) */
  document.body.style.overflow = "";
  document.documentElement.style.overflowY = "auto";

  /* ---------- Hero ambient video ---------- */
  var hero = document.querySelector(".hero");
  var heroVideo = document.querySelector(".hero__video");
  if (hero && heroVideo && !reduceMotion) {
    var markReady = function () {
      hero.classList.add("has-video");
    };
    heroVideo.addEventListener("loadeddata", markReady);
    heroVideo.addEventListener("playing", markReady);
    var playPromise = heroVideo.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.then(markReady).catch(function () {
        hero.classList.remove("has-video");
      });
    }
  }

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Active nav ---------- */
  var path = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".nav a, .mobile-nav a").forEach(function (a) {
    var href = (a.getAttribute("href") || "").split("/").pop().toLowerCase();
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("is-active");
    }
  });

  /* ---------- AOS ---------- */
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: reduceMotion ? 0 : 750,
      easing: "ease-out-cubic",
      once: true,
      offset: 60,
      /* Fade offsets shove sections off-screen on narrow phones */
      disable: function () {
        return reduceMotion || window.innerWidth < 768;
      },
    });
  }

  /* ---------- Generic autoslider ---------- */
  function createSlider(root) {
    if (!root) return;
    var track = root.querySelector(".slider__slides");
    var slides = root.querySelectorAll(".slider__slide");
    var dotsWrap = root.querySelector(".slider__dots");
    var prev = root.querySelector(".slider__arrow--prev");
    var next = root.querySelector(".slider__arrow--next");
    if (!track || slides.length === 0) return;

    var index = 0;
    var timer = null;
    var interval = parseInt(root.getAttribute("data-interval") || "5500", 10);

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      if (dotsWrap) {
        dotsWrap.querySelectorAll(".slider__dot").forEach(function (d, di) {
          d.classList.toggle("is-active", di === index);
        });
      }
    }

    if (dotsWrap) {
      dotsWrap.innerHTML = "";
      slides.forEach(function (_, i) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "slider__dot" + (i === 0 ? " is-active" : "");
        btn.setAttribute("aria-label", "Go to slide " + (i + 1));
        btn.addEventListener("click", function () {
          goTo(i);
          restart();
        });
        dotsWrap.appendChild(btn);
      });
    }

    if (prev) prev.addEventListener("click", function () { goTo(index - 1); restart(); });
    if (next) next.addEventListener("click", function () { goTo(index + 1); restart(); });

    function play() {
      if (reduceMotion || slides.length < 2) return;
      timer = setInterval(function () { goTo(index + 1); }, interval);
    }
    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }
    function restart() {
      stop();
      play();
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", play);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", play);

    goTo(0);
    play();
  }

  document.querySelectorAll("[data-slider]").forEach(createSlider);

  /* ---------- Service filters ---------- */
  var filterBar = document.querySelector("[data-filter-bar]");
  if (filterBar) {
    var items = document.querySelectorAll("[data-category]");
    filterBar.querySelectorAll(".filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBar.querySelectorAll(".filter-btn").forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");
        var cat = btn.getAttribute("data-filter");
        items.forEach(function (item) {
          var show = cat === "all" || item.getAttribute("data-category") === cat;
          item.style.display = show ? "" : "none";
        });
      });
    });
  }

  /* ---------- Blog pagination + tags ---------- */
  var blogGrid = document.querySelector("[data-blog-grid]");
  if (blogGrid) {
    var cards = Array.from(blogGrid.querySelectorAll(".blog-card"));
    var perPage = 6;
    var currentPage = 1;
    var activeTag = "all";
    var searchQuery = "";
    var pagination = document.querySelector("[data-pagination]");
    var searchInput = document.querySelector("[data-blog-search]");

    function filtered() {
      return cards.filter(function (card) {
        var tag = (card.getAttribute("data-tag") || "").toLowerCase();
        var text = card.textContent.toLowerCase();
        var tagOk = activeTag === "all" || tag === activeTag;
        var searchOk = !searchQuery || text.indexOf(searchQuery) !== -1;
        return tagOk && searchOk;
      });
    }

    function render() {
      var list = filtered();
      var pages = Math.max(1, Math.ceil(list.length / perPage));
      if (currentPage > pages) currentPage = pages;
      cards.forEach(function (c) { c.style.display = "none"; });
      var start = (currentPage - 1) * perPage;
      list.slice(start, start + perPage).forEach(function (c) {
        c.style.display = "";
      });

      if (pagination) {
        pagination.innerHTML = "";
        var prev = document.createElement("button");
        prev.type = "button";
        prev.innerHTML = '<i class="fa-solid fa-chevron-left" aria-hidden="true"></i>';
        prev.setAttribute("aria-label", "Previous page");
        prev.className = currentPage === 1 ? "is-disabled" : "";
        prev.addEventListener("click", function () {
          if (currentPage > 1) { currentPage--; render(); }
        });
        pagination.appendChild(prev);

        for (var i = 1; i <= pages; i++) {
          (function (n) {
            var b = document.createElement("button");
            b.type = "button";
            b.textContent = String(n);
            if (n === currentPage) b.className = "is-active";
            b.setAttribute("aria-label", "Page " + n);
            b.addEventListener("click", function () { currentPage = n; render(); });
            pagination.appendChild(b);
          })(i);
        }

        var nextBtn = document.createElement("button");
        nextBtn.type = "button";
        nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>';
        nextBtn.setAttribute("aria-label", "Next page");
        nextBtn.className = currentPage === pages ? "is-disabled" : "";
        nextBtn.addEventListener("click", function () {
          if (currentPage < pages) { currentPage++; render(); }
        });
        pagination.appendChild(nextBtn);
      }
    }

    document.querySelectorAll("[data-tag-filter]").forEach(function (pill) {
      pill.addEventListener("click", function () {
        document.querySelectorAll("[data-tag-filter]").forEach(function (p) {
          p.classList.remove("is-active");
        });
        pill.classList.add("is-active");
        activeTag = pill.getAttribute("data-tag-filter");
        currentPage = 1;
        render();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        searchQuery = searchInput.value.trim().toLowerCase();
        currentPage = 1;
        render();
      });
    }

    render();
  }

  /* ---------- FAQ accordion (one open at a time) ---------- */
  var faqList = document.querySelector(".faq__list");
  if (faqList) {
    faqList.querySelectorAll(".faq__item").forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (!item.open) return;
        faqList.querySelectorAll(".faq__item").forEach(function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
  }

  /* ---------- Contact / generic form validation ---------- */
  document.querySelectorAll("[data-validate]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll("[required]").forEach(function (field) {
        var group = field.closest(".form-group");
        var ok = true;
        if (field.type === "email") {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        } else if (field.type === "tel") {
          var value = field.value.trim();
          var digits = value.replace(/\D/g, "");
          ok = /^\+?[\d\s().-]+$/.test(value) && digits.length >= 7 && digits.length <= 15;
        } else if (field.type === "checkbox") {
          ok = field.checked;
        } else {
          ok = field.value.trim().length > 0;
        }
        if (group) group.classList.toggle("is-invalid", !ok);
        if (!ok) valid = false;
      });

      var pass = form.querySelector("[data-password]");
      var confirm = form.querySelector("[data-confirm]");
      if (pass && confirm) {
        var match = pass.value === confirm.value && pass.value.length >= 6;
        var cg = confirm.closest(".form-group");
        var pg = pass.closest(".form-group");
        if (pg) pg.classList.toggle("is-invalid", pass.value.length < 6);
        if (cg) cg.classList.toggle("is-invalid", pass.value !== confirm.value);
        if (!match) valid = false;
      }

      if (valid) {
        var redirect = form.getAttribute("data-redirect");
        if (form.classList.contains("newsletter__form")) redirect = "404.html";
        if (redirect) {
          form.reset();
          window.location.href = redirect;
          return;
        }

        var success = form.querySelector(".form-success");
        if (success) success.classList.add("is-visible");
        form.reset();
        form.querySelectorAll(".is-invalid").forEach(function (g) {
          g.classList.remove("is-invalid");
        });
      }
    });
  });

  /* ---------- Password show/hide ---------- */
  document.querySelectorAll("[data-password-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var wrap = btn.closest(".password-field");
      var input = wrap ? wrap.querySelector("input") : null;
      if (!input) return;
      var show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
      var icon = btn.querySelector("i");
      if (icon) {
        icon.className = show ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
      }
    });
  });
})();
