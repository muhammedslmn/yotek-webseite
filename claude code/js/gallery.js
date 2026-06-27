/* YOTEK — Galerie-Lightbox
   Erwartet Tiles mit Klasse .tile, die ein <img> enthalten.
   Vollbild-Ansicht mit Weiter/Zurück, Tastatur- und Wisch-Steuerung. */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var tiles = Array.prototype.slice.call(document.querySelectorAll(".tile"));
    if (!tiles.length) return;

    var lb = document.querySelector(".lightbox");
    if (!lb) return;
    var imgEl = lb.querySelector(".lightbox__img");
    var capEl = lb.querySelector(".lightbox__cap");
    var index = 0;

    var slides = tiles.map(function (t) {
      var img = t.querySelector("img");
      return { src: img.getAttribute("src"), alt: img.getAttribute("alt") || "" };
    });

    function show(i) {
      index = (i + slides.length) % slides.length;
      imgEl.setAttribute("src", slides[index].src);
      imgEl.setAttribute("alt", slides[index].alt);
      if (capEl) capEl.textContent = slides[index].alt;
    }
    function open(i) {
      show(i);
      lb.classList.add("is-open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    function close() {
      lb.classList.remove("is-open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    tiles.forEach(function (t, i) {
      t.setAttribute("role", "button");
      t.setAttribute("tabindex", "0");
      t.addEventListener("click", function () { open(i); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
      });
    });

    lb.querySelector(".lightbox__close").addEventListener("click", close);
    lb.querySelector(".lightbox__next").addEventListener("click", function (e) { e.stopPropagation(); show(index + 1); });
    lb.querySelector(".lightbox__prev").addEventListener("click", function (e) { e.stopPropagation(); show(index - 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });

    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") show(index + 1);
      else if (e.key === "ArrowLeft") show(index - 1);
    });

    // Touch-Wischen
    var x0 = null;
    lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      x0 = null;
    }, { passive: true });
  });
})();
