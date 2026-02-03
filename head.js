// ============================================================
//  HIS LABORATORY — Head (pre-render)
//  Loaded in <head> to apply critical classes before first paint.
//
//  Usage (Webflow — Inside <head>):
//  <script src="https://cdn.jsdelivr.net/gh/nslt-studio/his-laboratory@main/head.js"></script>
// ============================================================
(function () {
  if (sessionStorage.getItem("loaderPlayed")) {
    document.documentElement.classList.add("loader-played");
  }
})();
