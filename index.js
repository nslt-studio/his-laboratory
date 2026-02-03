// ============================================================
//  HIS LABORATORY — Entry Point
//  Single script to load via jsDelivr. Handles all dependency
//  loading and then loads the organised source files.
//
//  Usage (Webflow — Before </body>):
//  <script src="https://cdn.jsdelivr.net/gh/nslt-studio/his-laboratory@main/index.js"></script>
// ============================================================
(function () {
  "use strict";

  var BASE = "https://cdn.jsdelivr.net/gh/nslt-studio/his-laboratory@main";

  // ---- External dependencies --------------------------------
  var GSAP_CORE = "https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js";
  var GSAP_ST = "https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js";
  var GSAP_CE = "https://cdn.jsdelivr.net/npm/gsap@3/dist/CustomEase.min.js";
  var LENIS = "https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js";
  var SWUP = "https://cdn.jsdelivr.net/npm/swup@4/dist/Swup.umd.js";

  // ---- Our source files (loaded in order) -------------------
  var SRC = [
    "/src/config.js",
    "/src/lenis.js",
    "/src/preloader.js",
    "/src/loader.js",
    "/src/pages/global.js",
    "/src/pages/home.js",
    "/src/pages/management.js",
    "/src/pages/submissions.js",
    "/src/pages/about.js",
    "/src/swup.js",
  ];

  // ---- Helpers ----------------------------------------------
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = function () {
        reject(new Error("[HisLab] Failed to load: " + src));
      };
      document.head.appendChild(s);
    });
  }

  function loadAll(urls) {
    return Promise.all(urls.map(loadScript));
  }

  function loadSequential(urls) {
    return urls.reduce(function (chain, url) {
      return chain.then(function () {
        return loadScript(url);
      });
    }, Promise.resolve());
  }

  // ---- Boot sequence ----------------------------------------
  function boot() {
    // Phase 1 — GSAP core (must load first)
    loadScript(GSAP_CORE)
      .then(function () {
        // Phase 2 — GSAP plugins + Lenis + Swup (parallel)
        return loadAll([GSAP_ST, GSAP_CE, LENIS, SWUP]);
      })
      .then(function () {
        // Phase 3 — Our source files (sequential, order matters)
        return loadSequential(
          SRC.map(function (path) {
            return BASE + path;
          })
        );
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
