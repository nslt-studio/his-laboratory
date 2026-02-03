// ============================================================
//  HIS LABORATORY — Main Script
//  Single entry point for all pages.
//
//  Dependencies (CDN, loaded in Webflow Head):
//  - Lenis
//  - GSAP + ScrollTrigger + CustomEase
// ============================================================
(function () {
  "use strict";

  // ==========================================================
  //  GSAP PLUGINS
  // ==========================================================
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("cbEase", ".7,0,.3,1");

  var TRANS = { duration: 0.3, ease: "power1.out" };

  // ==========================================================
  //  LENIS SMOOTH SCROLL
  // ==========================================================
  var lenis = new Lenis({
    smooth: true,
    syncTouch: true,
    smoothTouch: true,
    touchInertiaExponent: 1.9,
    syncTouchLerp: 0.04,
    lerp: 0.13,
  });

  window.lenis = lenis;

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add(function (time) {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // ==========================================================
  //  IMAGE PRELOADER
  // ==========================================================
  function initImagePreloader() {
    var fadeIn = function (img) {
      gsap.fromTo(
        img,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.3,
          ease: "power1.out",
          onComplete: function () {
            img.classList.add("is-loaded");
          },
        }
      );
    };

    var handleImg = function (img) {
      if (!img.hasAttribute("data-preloader") || img.dataset.loaded) return;
      img.dataset.loaded = "1";

      if (img.complete && img.naturalWidth > 0) {
        fadeIn(img);
      } else {
        img.addEventListener("load", function () { fadeIn(img); }, { once: true });
        img.addEventListener("error", function () { fadeIn(img); }, { once: true });
      }
    };

    document.querySelectorAll("img[data-preloader]").forEach(handleImg);

    new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        if (!added) continue;
        for (var j = 0; j < added.length; j++) {
          var node = added[j];
          if (node.nodeType !== 1) continue;
          if (node.matches && node.matches("img[data-preloader]")) handleImg(node);
          if (node.querySelectorAll) {
            node.querySelectorAll("img[data-preloader]").forEach(handleImg);
          }
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  initImagePreloader();

  // ==========================================================
  //  LOADER
  // ==========================================================
  var loaderWillPlay = false;

  function initLoader() {
    var loader = document.getElementById("loader-section");
    var mainW = document.querySelector(".main-w");
    var htmlEl = document.documentElement;

    if (!loader || sessionStorage.getItem("loaderPlayed")) return;

    var items = loader.querySelectorAll(".loader-collection-w .loader-item");
    if (!items.length) return;

    loaderWillPlay = true;

    // Force scroll to top
    lenis.scrollTo(0, { immediate: true });

    // Lock scroll
    var prevBodyOverflow = document.body.style.overflow;
    var prevHtmlOverflow = htmlEl.style.overflow;
    document.body.style.overflow = "hidden";
    htmlEl.style.overflow = "hidden";
    lenis.stop();

    // Show random item
    var randomIndex = Math.floor(Math.random() * items.length);
    items[randomIndex].classList.add("active");

    // Exit on click
    var handleExit = function () {
      loader.removeEventListener("click", handleExit);
      sessionStorage.setItem("loaderPlayed", "true");

      lenis.scrollTo(0, { immediate: true });

      var vh = window.innerHeight;
      var tl = gsap.timeline({
        defaults: { duration: 0.9, ease: "cbEase" },
      });

      tl.to(loader, { top: -vh, opacity: 0 }, 0);

      if (mainW) {
        tl.fromTo(mainW, { top: vh, opacity: 0 }, { top: 0, opacity: 1 }, 0);
      }

      tl.add(function () {
        loader.style.display = "none";
        document.body.style.overflow = prevBodyOverflow;
        htmlEl.style.overflow = prevHtmlOverflow;
        lenis.start();
        htmlEl.classList.add("loader-played");
      });
    };

    loader.addEventListener("click", handleExit);
  }

  initLoader();

  // ==========================================================
  //  VIEW BUTTONS (first / second)
  // ==========================================================
  function initViewButtons() {
    var buttons = document.querySelectorAll(".view-button[data-button]");
    if (!buttons.length) return;

    var views = {
      first: document.querySelector('[data-view="first"]'),
      second: document.querySelector('[data-view="second"]'),
    };

    var tl = gsap.timeline({ paused: true });

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-button");
        var currentBtn = document.querySelector(".view-button.active");
        if (!currentBtn) return;

        var current = currentBtn.getAttribute("data-button");
        if (target === current) return;

        buttons.forEach(function (b) {
          b.classList.remove("active");
          var sel = b.querySelector(".selector");
          if (sel) sel.classList.remove("active");
        });
        btn.classList.add("active");
        var sel = btn.querySelector(".selector");
        if (sel) sel.classList.add("active");

        var curView = views[current];
        var tgtView = views[target];
        if (!curView || !tgtView) return;

        tl.kill();
        tl = gsap.timeline({ defaults: TRANS });
        tl.to(curView, { opacity: 0 })
          .set(curView, { display: "none" })
          .set(tgtView, { display: "block", opacity: 0 })
          .to(tgtView, { opacity: 1 });
      });
    });
  }

  // ==========================================================
  //  NAVIGATION (data-link transitions)
  // ==========================================================
  function initNavigation(mainW) {
    var navLinks = document.querySelectorAll("[data-link]");
    if (!navLinks.length) return;

    var isNavigating = false;

    navLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var clicked = e.currentTarget;
        var targetVal = clicked.getAttribute("data-link");

        if (isNavigating) { e.preventDefault(); return; }
        if (clicked.classList.contains("w--current")) return;

        e.preventDefault();
        isNavigating = true;

        var url = clicked.href;

        navLinks.forEach(function (l) {
          if (l.getAttribute("data-link") === targetVal) {
            l.classList.add("w--current");
          } else {
            l.classList.remove("w--current");
          }
        });

        gsap.to(mainW, {
          opacity: 0,
          duration: TRANS.duration,
          ease: TRANS.ease,
          onComplete: function () {
            window.location.href = url;
          },
        });
      });
    });
  }

  // ==========================================================
  //  PAGE: ABOUT
  // ==========================================================
  function initAboutPage() {
    var grid = document.querySelector(".clients-list");
    if (!grid) return;

    var setRows = function () {
      var items = grid.querySelectorAll(".clients-item");
      if (!items.length) return;
      var cols = window.innerWidth < 480 ? 2 : 3;
      grid.style.gridTemplateRows = "repeat(" + Math.ceil(items.length / cols) + ", auto)";
    };

    setRows();
    window.addEventListener("resize", setRows);
  }

  // ==========================================================
  //  PAGE: MANAGEMENT
  // ==========================================================
  function initManagementPage() {
    var modelInfo = document.querySelector("#modelName");
    var logo = document.querySelector("#logo");
    var header = document.querySelector(".model-header");
    var modelExplore = document.querySelector("#modelExplore");

    // --- Gallery scale ---
    document.querySelectorAll(".models-gallery-item").forEach(function (wrap) {
      var inner = wrap.querySelector(".models-gallery-img-inner");
      if (!inner) return;

      gsap.fromTo(
        inner,
        { scale: 1 },
        {
          scale: 0,
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    });

    // --- Progress bar ---
    var progressBar = document.querySelector(".model-progress");
    var firstItem = document.querySelector(
      ".models-gallery-item:first-child .models-gallery-img-inner"
    );
    var lastItem = document.querySelector(
      ".models-gallery-item:last-child .models-gallery-img-inner"
    );

    if (progressBar && firstItem && lastItem) {
      gsap.to(progressBar, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: firstItem,
          start: "top top",
          endTrigger: lastItem,
          end: "top top",
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });

      gsap.to(progressBar, {
        opacity: 0,
        duration: 0.3,
        ease: "power1.out",
        scrollTrigger: {
          trigger: lastItem,
          start: "bottom 60%",
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true,
        },
      });
    }

    // --- Logo / header scroll swap ---
    if (modelInfo && logo && header) {
      ScrollTrigger.create({
        trigger: modelInfo,
        start: "bottom top",
        onEnter: function () {
          gsap.to(logo, {
            opacity: 0,
            duration: 0.3,
            ease: "power1.out",
            onComplete: function () { logo.style.pointerEvents = "none"; },
          });
          gsap.to(header, {
            opacity: 1,
            yPercent: 100,
            duration: 0.3,
            delay: 0.3,
            ease: "power1.out",
          });
        },
        onLeaveBack: function () {
          gsap.to(logo, {
            opacity: 1,
            duration: 0.3,
            delay: 0.3,
            ease: "power1.out",
            onStart: function () { logo.style.pointerEvents = "auto"; },
          });
          gsap.to(header, {
            opacity: 0,
            yPercent: 0,
            ease: "power1.out",
          });
        },
      });
    }

    if (modelExplore && logo && header) {
      ScrollTrigger.create({
        trigger: modelExplore,
        start: "top 50%",
        onEnter: function () {
          gsap.to(header, {
            opacity: 0,
            yPercent: 0,
            duration: 0.3,
            ease: "power1.out",
          });
          gsap.to(logo, {
            opacity: 1,
            duration: 0.3,
            delay: 0.3,
            ease: "power1.out",
            onStart: function () { logo.style.pointerEvents = "auto"; },
          });
        },
        onLeaveBack: function () {
          gsap.to(header, {
            opacity: 1,
            yPercent: 100,
            duration: 0.3,
            delay: 0.3,
            ease: "power1.out",
          });
          gsap.to(logo, {
            opacity: 0,
            duration: 0.3,
            ease: "power1.out",
            onComplete: function () { logo.style.pointerEvents = "none"; },
          });
        },
      });
    }

    // --- Reset logo/header on non-management nav click ---
    if (logo && header) {
      document.querySelectorAll("[data-link]").forEach(function (link) {
        link.addEventListener("click", function () {
          if (link.getAttribute("data-link") === "management") return;

          gsap.to(logo, {
            opacity: 1,
            duration: 0.3,
            delay: 0.3,
            ease: "power1.out",
            onStart: function () { logo.style.pointerEvents = "auto"; },
          });
          gsap.to(header, {
            opacity: 0,
            yPercent: 0,
            ease: "power1.out",
          });
        });
      });
    }
  }

  // ==========================================================
  //  MAIN INIT
  // ==========================================================
  document.addEventListener("DOMContentLoaded", function () {
    var pageEl = document.querySelector("[data-namespace]");
    var page = pageEl ? pageEl.dataset.namespace : null;
    var mainW = document.querySelector(".main-w");

    // Global
    initViewButtons();
    initNavigation(mainW);

    // Fade in main wrapper (skip if loader handles it)
    if (mainW && !loaderWillPlay) {
      gsap.set(mainW, { opacity: 0 });
      gsap.to(mainW, {
        opacity: 1,
        duration: TRANS.duration,
        ease: TRANS.ease,
      });
    }

    // Page-specific
    if (page === "about") initAboutPage();
    if (page === "management") initManagementPage();

    // Back button cache fix
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) window.location.reload();
    });
  });
})();
