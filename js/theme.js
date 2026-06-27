/* YOTEK — Theme-Switcher, Mobile-Nav, Scroll-Reveal
   Das Theme wird zusätzlich per Inline-Snippet im <head> sofort gesetzt
   (gegen "Flash of Unstyled Theme"). Hier folgen UI-Bindung & Persistenz. */
(function () {
  "use strict";

  var STORAGE_KEY = "yotek-theme";
  var THEMES = ["anthrazit", "schwarz", "weiss"];
  var DEFAULT = "anthrazit";

  function current() {
    var t = document.documentElement.getAttribute("data-theme");
    return THEMES.indexOf(t) > -1 ? t : DEFAULT;
  }

  function apply(theme) {
    if (THEMES.indexOf(theme) === -1) theme = DEFAULT;
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
    document.querySelectorAll(".theme-btn").forEach(function (btn) {
      var on = btn.getAttribute("data-set") === theme;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    // Logo anpassen basierend auf Theme
    document.querySelectorAll("img.brand__logo--dark").forEach(function (logo) {
      if (theme === "weiss") {
        logo.src = "assets/logo/logo-light.png";
      } else {
        logo.src = "assets/logo/logo-dark.png";
      }
    });
  }

  function initThemes() {
    apply(current());
    document.querySelectorAll(".theme-btn").forEach(function (btn) {
      btn.addEventListener("click", function () { apply(btn.getAttribute("data-set")); });
    });
  }

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initThemes();
    initNav();
    initReveal();
  });
})();
