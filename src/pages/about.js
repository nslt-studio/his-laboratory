// ============================================================
//  HIS LABORATORY — About Page
//  Dynamic responsive grid layout for the clients list.
// ============================================================
(function () {
  "use strict";

  function setClientsGridRows() {
    var grid = document.querySelector(".clients-list");
    if (!grid) return;

    var items = grid.querySelectorAll(".clients-item");
    if (!items.length) return;

    var isMobile = window.innerWidth < 480;
    var cols = isMobile ? 2 : 3;
    var rows = Math.ceil(items.length / cols);
    grid.style.gridTemplateRows = "repeat(" + rows + ", auto)";
  }

  window.HisLab.pages.about = {
    init: function () {
      setClientsGridRows();
    },
    cleanup: function () {},
  };
})();
