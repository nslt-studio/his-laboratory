// ============================================================
//  HIS LABORATORY — Management Page
//  Gallery scroll animations, progress bar, logo/header swap.
//  All ScrollTriggers are tracked for proper cleanup on exit.
// ============================================================
(function () {
  "use strict";

  var scrollTriggers = [];
  var lenisScrollHandler = null;

  // -----------------------------------------------------------
  //  Gallery scale effect
  // -----------------------------------------------------------
  function initGalleryScale() {
    var wrappers = document.querySelectorAll(".models-gallery-item");

    wrappers.forEach(function (wrap) {
      var inner = wrap.querySelector(".models-gallery-img-inner");
      if (!inner) return;

      var tween = gsap.fromTo(
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
      if (tween.scrollTrigger) scrollTriggers.push(tween.scrollTrigger);
    });
  }

  // -----------------------------------------------------------
  //  Progress bar
  // -----------------------------------------------------------
  function initProgressBar() {
    var bar = document.querySelector(".model-progress");
    var first = document.querySelector(
      ".models-gallery-item:first-child .models-gallery-img-inner"
    );
    var last = document.querySelector(
      ".models-gallery-item:last-child .models-gallery-img-inner"
    );
    if (!bar || !first || !last) return;

    // Scale X from 0 to 1 across gallery
    var tween1 = gsap.to(bar, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: first,
        start: "top top",
        endTrigger: last,
        end: "top top",
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
    });
    if (tween1.scrollTrigger) scrollTriggers.push(tween1.scrollTrigger);

    // Fade out after last item
    var tween2 = gsap.to(bar, {
      opacity: 0,
      duration: 0.3,
      ease: "power1.out",
      scrollTrigger: {
        trigger: last,
        start: "bottom 60%",
        toggleActions: "play none none reverse",
        invalidateOnRefresh: true,
      },
    });
    if (tween2.scrollTrigger) scrollTriggers.push(tween2.scrollTrigger);
  }

  // -----------------------------------------------------------
  //  Logo / Header swap on scroll
  // -----------------------------------------------------------
  function initLogoHeaderSwap() {
    var modelInfo = document.querySelector("#modelName");
    var logo = document.querySelector("#logo");
    var header = document.querySelector(".model-header");
    var modelExplore = document.querySelector("#modelExplore");

    if (!logo || !header) return;

    // Trigger 1 — when modelName exits the top of the viewport
    if (modelInfo) {
      var st1 = ScrollTrigger.create({
        trigger: modelInfo,
        start: "bottom top",
        onEnter: function () {
          gsap.to(logo, {
            opacity: 0,
            duration: 0.3,
            ease: "power1.out",
            onComplete: function () {
              logo.style.pointerEvents = "none";
            },
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
            onStart: function () {
              logo.style.pointerEvents = "auto";
            },
          });
          gsap.to(header, {
            opacity: 0,
            yPercent: 0,
            ease: "power1.out",
          });
        },
      });
      scrollTriggers.push(st1);
    }

    // Trigger 2 — when modelExplore hits 50% of viewport
    if (modelExplore) {
      var st2 = ScrollTrigger.create({
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
            onStart: function () {
              logo.style.pointerEvents = "auto";
            },
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
            onComplete: function () {
              logo.style.pointerEvents = "none";
            },
          });
        },
      });
      scrollTriggers.push(st2);
    }
  }

  // -----------------------------------------------------------
  //  Page module
  // -----------------------------------------------------------
  window.HisLab.pages.management = {
    init: function () {
      this.cleanup();

      // Sync Lenis scroll with ScrollTrigger
      var lenis = window.lenis;
      if (lenis) {
        lenisScrollHandler = function () {
          ScrollTrigger.update();
        };
        lenis.on("scroll", lenisScrollHandler);
      }

      window.HisLab.initViewButtons();
      initGalleryScale();
      initProgressBar();
      initLogoHeaderSwap();
    },

    cleanup: function () {
      // Kill any running GSAP tweens on elements about to be removed
      var logo = document.querySelector("#logo");
      var header = document.querySelector(".model-header");
      var bar = document.querySelector(".model-progress");
      [logo, header, bar].forEach(function (el) {
        if (el) gsap.killTweensOf(el);
      });

      // Kill tracked ScrollTriggers
      scrollTriggers.forEach(function (st) {
        st.kill();
      });
      scrollTriggers = [];

      // Remove Lenis <-> ScrollTrigger sync
      var lenis = window.lenis;
      if (lenis && lenisScrollHandler) {
        lenis.off("scroll", lenisScrollHandler);
        lenisScrollHandler = null;
      }
    },
  };
})();
