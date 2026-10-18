/* Applies saved display settings before first paint */
(function () {
  document.documentElement.classList.add("js-anim");
  try {
    var c = JSON.parse(localStorage.getItem("hl-storage") || "{}");
    if (c.display === false) return;
    var p = JSON.parse(localStorage.getItem("hl-display") || "{}");
    var d = document.documentElement;
    if (p.theme && p.theme !== "light") d.dataset.theme = p.theme;
    if (p.text && p.text !== "md") d.dataset.text = p.text;
  } catch (e) {}
})();
