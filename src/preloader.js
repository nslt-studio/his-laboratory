// ============================================================
//  HIS LABORATORY — Image Preloader
//  Fades in images with [data-preloader] attribute.
//  Watches for dynamically added images via MutationObserver.
// ============================================================
(function () {
  "use strict";

  var TRANS = window.HisLab.TRANS;

  function fadeIn(img) {
    gsap.fromTo(
      img,
      { opacity: 0 },
      {
        opacity: 1,
        duration: TRANS.duration,
        ease: TRANS.ease,
        onComplete: function () {
          img.classList.add("is-loaded");
        },
      }
    );
  }

  function handleImg(img) {
    if (!img.hasAttribute("data-preloader") || img.dataset.loaded) return;
    img.dataset.loaded = "1";

    if (img.complete && img.naturalWidth > 0) {
      fadeIn(img);
    } else {
      img.addEventListener("load", function () { fadeIn(img); }, { once: true });
      img.addEventListener("error", function () { fadeIn(img); }, { once: true });
    }
  }

  function initPreloader() {
    document.querySelectorAll("img[data-preloader]").forEach(handleImg);
  }

  // Watch for dynamically injected images
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

  window.HisLab.initPreloader = initPreloader;
  initPreloader();
})();
