// ============================================================
//  HIS LABORATORY — Configuration & GSAP Setup
// ============================================================
(function () {
  "use strict";

  window.HisLab = window.HisLab || {};
  window.HisLab.pages = {};

  // GSAP plugin registration
  gsap.registerPlugin(ScrollTrigger, CustomEase);

  // Custom easing
  CustomEase.create("cbEase", ".7,0,.3,1");

  // Shared transition defaults
  window.HisLab.TRANS = { duration: 0.3, ease: "power1.out" };
})();
