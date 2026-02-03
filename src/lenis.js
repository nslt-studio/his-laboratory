// ============================================================
//  HIS LABORATORY — Lenis Smooth Scroll
// ============================================================
(function () {
  "use strict";

  var lenis = new Lenis({
    smooth: true,
    syncTouch: true,
    smoothTouch: true,
    touchInertiaExponent: 1.9,
    syncTouchLerp: 0.04,
    lerp: 0.13,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Expose globally for loader, management, and Swup
  window.lenis = lenis;
  window.HisLab.lenis = lenis;
})();
