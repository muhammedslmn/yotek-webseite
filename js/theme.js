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

  // Nach Aktualisieren (oder Zurück) wieder dort landen, wo man stand:
  // an Abschnitt + Abstand gemerkt (unabhängig von später ladenden Schriften/Bildern),
  // nur für 30 Minuten und nur solange man nicht selbst scrollt.
  function initScrollRestore() {
    var key = "yotek-scroll:" + location.pathname;
    var MAX_AGE = 30 * 60 * 1000;
    try { history.scrollRestoration = "manual"; } catch (e) {}
    var nav = window.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
    var type = nav ? nav.type : "navigate";

    var lastScroll = 0; // Zeitpunkt des letzten echten Scrollens (nicht des Sicherns)
    function sections() { return document.querySelectorAll("main > section"); }

    function save() {
      var y = Math.max(0, Math.round(window.pageYOffset));
      var list = sections(), idx = -1, off = 0;
      for (var i = 0; i < list.length; i++) {
        var top = list[i].getBoundingClientRect().top + window.pageYOffset;
        if (top <= y + 1) { idx = i; off = y - top; } else { break; }
      }
      try { sessionStorage.setItem(key, JSON.stringify({ i: idx, o: Math.round(off), y: y, t: lastScroll || Date.now() })); } catch (e) {}
    }

    var saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(key) || "null"); } catch (e) {}
    if (saved && typeof saved === "object" && saved.t) { lastScroll = saved.t; }
    var usable = saved && typeof saved === "object" && saved.y > 0 && (Date.now() - saved.t) < MAX_AGE;

    if ((type === "reload" || type === "back_forward") && !location.hash && usable) {
      var stop = false;
      var halt = function () { stop = true; };
      ["touchstart", "wheel", "mousedown", "keydown"].forEach(function (ev) {
        window.addEventListener(ev, halt, { passive: true, once: true });
      });
      var target = function () {
        var list = sections();
        if (saved.i >= 0 && list[saved.i]) {
          var el = list[saved.i];
          var off = Math.min(saved.o, Math.max(0, el.offsetHeight - 40));
          return el.getBoundingClientRect().top + window.pageYOffset + off;
        }
        return saved.y;
      };
      var go = function () {
        if (stop) return;
        var t = Math.round(target());
        if (Math.abs(window.pageYOffset - t) > 2) {
          window.scrollTo({ top: t, left: 0, behavior: "instant" });
        }
      };
      go();
      window.addEventListener("load", function () {
        go(); setTimeout(go, 300); setTimeout(go, 1000); setTimeout(go, 2000);
      });
      if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { go(); setTimeout(go, 200); }); }
    }

    var timer;
    window.addEventListener("scroll", function () {
      lastScroll = Date.now();
      clearTimeout(timer);
      timer = setTimeout(save, 150);
    }, { passive: true });
    // Beim Verlassen/Neuladen sofort sichern (Handy: sonst evtl. noch nicht gespeichert)
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") save(); });
  }
  // Adresse: auf iPhone/iPad in Apple Karten, sonst Google Maps
  function initMapLinks() {
    var ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
              (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (!ios) return;
    document.querySelectorAll("a[data-apple]").forEach(function (a) {
      a.href = a.getAttribute("data-apple");
    });
  }
  document.addEventListener("DOMContentLoaded", function () {
    initThemes();
    initNav();
    initReveal();
    initScrollRestore();
    initMapLinks();
  });
})();
