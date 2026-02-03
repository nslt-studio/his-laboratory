// ============================================================
//  HIS LABORATORY — Swup Page Transitions & Routing
//  Replaces the manual fade-out / window.location.href approach
//  with Swup SPA-style navigation.
//
//  Flow:
//    1. Loader plays (or is skipped)
//    2. Swup initialises
//    3. Current page init() runs
//    4. On navigation: fade out → cleanup → content swap →
//       scroll to top → init new page → fade in
// ============================================================
(function () {
  "use strict";

  var TRANS = window.HisLab.TRANS;
  var pages = window.HisLab.pages;
  var currentPageKey = null;

  // -----------------------------------------------------------
  //  Determine current page from data-namespace on .main-w
  //  (independent of URL slugs — works on staging & production)
  // -----------------------------------------------------------
  function getCurrentPage() {
    var mainW = document.querySelector(".main-w");
    if (mainW) {
      var ns = mainW.getAttribute("data-namespace");
      if (ns) return ns.trim().toLowerCase();
    }
    // Fallback to URL segment
    var path = window.location.pathname.replace(/\/+$/, "");
    return path.split("/").pop() || "home";
  }

  // -----------------------------------------------------------
  //  Update w--current class on every [data-link] element
  // -----------------------------------------------------------
  function updateWCurrent(pageKey) {
    var navLinks = document.querySelectorAll("[data-link]");
    navLinks.forEach(function (link) {
      if (link.getAttribute("data-link") === pageKey) {
        link.classList.add("w--current");
      } else {
        link.classList.remove("w--current");
      }
    });
  }

  // -----------------------------------------------------------
  //  Page lifecycle helpers
  // -----------------------------------------------------------
  function initCurrentPage() {
    currentPageKey = getCurrentPage();
    updateWCurrent(currentPageKey);

    console.log("[HisLab] page:", currentPageKey, "| registered:", Object.keys(pages).join(", "));

    var page = pages[currentPageKey];
    if (page && page.init) {
      try {
        page.init();
      } catch (err) {
        console.error("[HisLab] Error in " + currentPageKey + ".init():", err);
      }
    } else {
      console.warn("[HisLab] No module found for page '" + currentPageKey + "'");
    }

    // Re-process images for the new content
    if (window.HisLab.initPreloader) window.HisLab.initPreloader();
  }

  function cleanupCurrentPage() {
    if (currentPageKey && pages[currentPageKey] && pages[currentPageKey].cleanup) {
      try {
        pages[currentPageKey].cleanup();
      } catch (err) {
        console.error("[HisLab] Error in " + currentPageKey + ".cleanup():", err);
      }
    }
  }

  // -----------------------------------------------------------
  //  Swup initialisation
  // -----------------------------------------------------------
  function initSwup() {
    var swup = new Swup({
      containers: [".main-w"],
      animateHistoryBrowsing: true,
      linkSelector: "a[data-link]",
    });

    // ------ Leave animation (GSAP fade out) ------------------
    swup.hooks.replace("animation:out:await", function () {
      return new Promise(function (resolve) {
        var mainW = document.querySelector(".main-w");
        if (!mainW) return resolve();

        gsap.to(mainW, {
          opacity: 0,
          duration: TRANS.duration,
          ease: TRANS.ease,
          onComplete: resolve,
        });
      });
    });

    // ------ Enter animation (GSAP fade in) -------------------
    swup.hooks.replace("animation:in:await", function () {
      return new Promise(function (resolve) {
        var mainW = document.querySelector(".main-w");
        if (!mainW) return resolve();

        gsap.to(mainW, {
          opacity: 1,
          duration: TRANS.duration,
          ease: TRANS.ease,
          onComplete: resolve,
        });
      });
    });

    // ------ Before content swap: cleanup ---------------------
    swup.hooks.before("content:replace", function () {
      cleanupCurrentPage();
    });

    // ------ After content swap: prepare new page -------------
    swup.hooks.on("content:replace", function () {
      var mainW = document.querySelector(".main-w");
      if (mainW) gsap.set(mainW, { opacity: 0 });

      // Scroll to top
      var lenis = window.lenis;
      if (lenis && typeof lenis.scrollTo === "function") {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }

      // Re-init Webflow if present
      if (window.Webflow) {
        window.Webflow.ready();
        if (window.Webflow.require) {
          var ix2 = window.Webflow.require("ix2");
          if (ix2 && ix2.init) ix2.init();
        }
      }

      // Initialise the new page
      initCurrentPage();
    });

    // ------ Update w--current immediately on click -----------
    swup.hooks.on("visit:start", function (visit) {
      var el = visit && visit.trigger && visit.trigger.el;
      if (el && el.getAttribute("data-link")) {
        updateWCurrent(el.getAttribute("data-link"));
      }
    });

    window.HisLab.swup = swup;
    console.log("[HisLab] Swup initialized");
  }

  // -----------------------------------------------------------
  //  Boot — called after loader completes (or is skipped)
  // -----------------------------------------------------------
  function boot() {
    console.log("[HisLab] Boot starting");
    window.HisLab.initLoader(function () {
      console.log("[HisLab] Loader done, initializing Swup + page");
      initSwup();
      initCurrentPage();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
