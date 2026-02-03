// ============================================================
//  HIS LABORATORY — Entry Loader Animation
//  Shows a random item on first visit, exits on click.
//  Calls onComplete callback when loader exits or is skipped.
// ============================================================
(function () {
  "use strict";

  var TRANS = window.HisLab.TRANS;

  function initLoader(onComplete) {
    var loader = document.getElementById("loader-section");
    var mainW = document.querySelector(".main-w");
    var htmlEl = document.documentElement;
    var lenis = window.lenis;

    // No loader needed — fade in main content and continue
    if (!loader || sessionStorage.getItem("loaderPlayed")) {
      if (mainW) {
        gsap.set(mainW, { opacity: 0 });
        gsap.to(mainW, {
          opacity: 1,
          duration: TRANS.duration,
          ease: TRANS.ease,
          onComplete: onComplete,
        });
      } else if (onComplete) {
        onComplete();
      }
      return;
    }

    var items = loader.querySelectorAll(".loader-collection-w .loader-item");
    if (!items.length) {
      if (onComplete) onComplete();
      return;
    }

    // Force scroll to top
    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }

    // Lock scroll during loader
    var prevBodyOverflow = document.body.style.overflow;
    var prevHtmlOverflow = htmlEl.style.overflow;
    document.body.style.overflow = "hidden";
    htmlEl.style.overflow = "hidden";
    if (lenis && typeof lenis.stop === "function") lenis.stop();

    // Show a random item
    var randomIndex = Math.floor(Math.random() * items.length);
    items[randomIndex].classList.add("active");

    // Exit handler (click to dismiss)
    function handleExit() {
      loader.removeEventListener("click", handleExit);
      sessionStorage.setItem("loaderPlayed", "true");

      // Ensure scroll at top
      if (lenis && typeof lenis.scrollTo === "function") {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }

      var vh = window.innerHeight;
      var tl = gsap.timeline({ defaults: { duration: 0.9, ease: "cbEase" } });

      tl.to(loader, { top: -vh, opacity: 0 }, 0);

      if (mainW) {
        tl.fromTo(mainW, { top: vh, opacity: 0 }, { top: 0, opacity: 1 }, 0);
      }

      tl.add(function () {
        loader.style.display = "none";
        document.body.style.overflow = prevBodyOverflow;
        htmlEl.style.overflow = prevHtmlOverflow;
        if (lenis && typeof lenis.start === "function") lenis.start();
        htmlEl.classList.add("loader-played");
        if (onComplete) onComplete();
      });
    }

    loader.addEventListener("click", handleExit);
  }

  window.HisLab.initLoader = initLoader;
})();
