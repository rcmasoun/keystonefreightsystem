// Keystone Freight Systems — shared site behavior
(function () {
  "use strict";

  var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------------- Scroll reveal ----------------
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach(function (el) { observer.observe(el); });
  }

  // ---------------- Smooth page-to-page transition ----------------
  function initPageTransitions() {
    if (prefersReduced) return;

    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[href]");
      if (!link) return;
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("download")) return;

      var href = link.getAttribute("href") || "";
      var isSamePageAnchor = href.startsWith("#");
      var isExternalScheme = /^(mailto:|tel:|javascript:)/i.test(href);
      var isExternalHost = link.hostname && link.hostname !== window.location.hostname;

      if (!href || isSamePageAnchor || isExternalScheme || isExternalHost) return;

      event.preventDefault();
      document.body.classList.add("is-leaving");
      window.setTimeout(function () {
        window.location.href = link.href;
      }, 260);
    });
  }

  // ---------------- Home page coverflow gallery ----------------
  function initCoverflow() {
    var root = document.getElementById("homeCoverflow");
    if (!root) return;

    var track = document.getElementById("coverflowTrack");
    var allSlides = Array.prototype.slice.call(track.children);
    var prevBtn = document.getElementById("coverflowPrev");
    var nextBtn = document.getElementById("coverflowNext");
    var filterBtns = document.querySelectorAll(".coverflow-pill[data-filter]");

    var activeFilter = "all";
    var currentIndex = 0;
    var autoplayTimer = null;
    var AUTOPLAY_MS = 4200;

    function visibleSlides() {
      return allSlides.filter(function (slide) {
        return activeFilter === "all" || slide.getAttribute("data-category") === activeFilter;
      });
    }

    function render() {
      var visible = visibleSlides();
      var len = visible.length;
      if (!len) return;

      currentIndex = ((currentIndex % len) + len) % len;

      allSlides.forEach(function (slide) {
        var idx = visible.indexOf(slide);
        if (idx === -1) {
          slide.setAttribute("data-pos", "hidden");
          slide.setAttribute("aria-hidden", "true");
          slide.tabIndex = -1;
          return;
        }
        var raw = idx - currentIndex;
        if (raw > len / 2) raw -= len;
        if (raw < -len / 2) raw += len;

        if (Math.abs(raw) > 2) {
          slide.setAttribute("data-pos", "hidden");
          slide.setAttribute("aria-hidden", "true");
          slide.tabIndex = -1;
        } else {
          slide.setAttribute("data-pos", String(raw));
          slide.setAttribute("aria-hidden", raw === 0 ? "false" : "true");
          slide.tabIndex = raw === 0 ? 0 : -1;
        }
      });
    }

    function go(delta) {
      currentIndex += delta;
      render();
      restartAutoplay();
    }

    function goTo(slide) {
      var visible = visibleSlides();
      var idx = visible.indexOf(slide);
      if (idx === -1) return;
      currentIndex = idx;
      render();
      restartAutoplay();
    }

    function startAutoplay() {
      if (prefersReduced) return;
      stopAutoplay();
      autoplayTimer = window.setInterval(function () {
        currentIndex += 1;
        render();
      }, AUTOPLAY_MS);
    }
    function stopAutoplay() {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }
    function restartAutoplay() {
      if (prefersReduced) return;
      stopAutoplay();
      startAutoplay();
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { go(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { go(1); });

    allSlides.forEach(function (slide) {
      slide.addEventListener("click", function () {
        if (slide.getAttribute("data-pos") === "0") return;
        goTo(slide);
      });
    });

    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        activeFilter = btn.getAttribute("data-filter");
        currentIndex = 0;
        render();
        restartAutoplay();
      });
    });

    root.addEventListener("mouseenter", stopAutoplay);
    root.addEventListener("mouseleave", startAutoplay);
    root.addEventListener("focusin", stopAutoplay);
    root.addEventListener("focusout", startAutoplay);

    render();
    startAutoplay();
  }

  // ---------------- Home nav: solid bar after scrolling ----------------
  function initNavScroll() {
    var nav = document.querySelector(".ud-nav");
    if (!nav) return;
    function update() { nav.classList.toggle("is-scrolled", window.scrollY > 80); }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  // ---------------- Hero video: respect reduced motion ----------------
  function initHeroVideo() {
    var video = document.querySelector(".ud-hero-video");
    if (!video) return;
    if (prefersReduced) {
      video.removeAttribute("autoplay");
      video.pause();
      return;
    }
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  initReveal();
  initPageTransitions();
  initCoverflow();
  initNavScroll();
  initHeroVideo();
})();
