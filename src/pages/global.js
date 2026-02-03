// ============================================================
//  HIS LABORATORY — Global Page Logic
//  View-button switcher shared across pages with two views.
// ============================================================
(function () {
  "use strict";

  var TRANS = window.HisLab.TRANS;

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

        // Update active states
        buttons.forEach(function (b) {
          b.classList.remove("active");
          var sel = b.querySelector(".selector");
          if (sel) sel.classList.remove("active");
        });
        btn.classList.add("active");
        var selector = btn.querySelector(".selector");
        if (selector) selector.classList.add("active");

        var curView = views[current];
        var tgtView = views[target];
        if (!curView || !tgtView) return;

        // Animate view switch
        tl.kill();
        tl = gsap.timeline({ defaults: TRANS });
        tl.to(curView, { opacity: 0 })
          .set(curView, { display: "none" })
          .set(tgtView, { display: "block", opacity: 0 })
          .to(tgtView, { opacity: 1 });
      });
    });
  }

  window.HisLab.initViewButtons = initViewButtons;
})();
