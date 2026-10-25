/* YOTEK — Kontaktformular + Mehrfach-Leistungen
   Lokale Verarbeitung: Bestätigung auf der gleichen Seite, keine Weiterleitungen.
   Plus-Button zum Hinzufügen weiterer Leistungen (ohne Limit)
   --------------------------------------------------------------------------
   EINRICHTUNG (optional):
   Ohne Formspree-Endpoint: Formular zeigt lokale Erfolgsmeldung und bleibt auf der Seite.
   Optional mit Formspree (externe E-Mail-Integration):
   1. Kostenloses Konto auf https://formspree.io erstellen, Formular anlegen,
      Ziel-E-Mail = yorulmaz.de@gmail.com bestätigen.
   2. Den erhaltenen Endpoint unten bei FORM_ENDPOINT eintragen
      (Form "https://formspree.io/f/XXXXXXX"). */
(function () {
  "use strict";

  var FORM_ENDPOINT = "https://formspree.io/f/xqevbawj";
  var TARGET_EMAIL = "yorulmaz.de@gmail.com";

  function valid(form) {
    var ok = true;
    form.querySelectorAll("[required]").forEach(function (el) {
      var good = el.value.trim() !== "" && el.checkValidity();
      el.setAttribute("aria-invalid", good ? "false" : "true");
      if (!good) ok = false;
    });
    return ok;
  }

  function status(form, type, msg) {
    var s = form.querySelector(".form-status");
    if (!s) return;
    s.className = "form-status " + (type === "ok" ? "is-ok" : "is-err");
    s.textContent = msg;
  }

  function showLocalSuccess(form) {
    form.reset();
    status(form, "ok", "Vielen Dank! Ihre Anfrage ist eingegangen — wir melden uns zeitnah bei Ihnen.");
  }

  function handle(form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Honeypot: ausgefüllt = Bot
      var hp = form.querySelector(".honeypot input");
      if (hp && hp.value) return;

      if (!valid(form)) {
        status(form, "err", "Bitte füllen Sie die Pflichtfelder korrekt aus.");
        return;
      }

      var fd = new FormData(form);
      var data = {};
      fd.forEach(function (v, k) { data[k] = v; });

      var btn = form.querySelector("button[type=submit]");

      if (FORM_ENDPOINT.indexOf("formspree.io") === -1) {
        // Kein Endpoint konfiguriert → lokale Erfolgsmeldung
        showLocalSuccess(form);
        return;
      }

      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = "Wird gesendet …"; }

      fetch(FORM_ENDPOINT, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" }
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          status(form, "ok", "Vielen Dank! Ihre Anfrage ist eingegangen — wir melden uns zeitnah bei Ihnen.");
        } else {
          status(form, "err", "Senden fehlgeschlagen. Bitte rufen Sie uns an: +49 174 6796199.");
        }
      }).catch(function () {
        status(form, "err", "Verbindungsfehler. Bitte rufen Sie uns an: +49 174 6796199.");
      }).finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || "Anfrage senden"; }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("form[data-yotek-form]").forEach(handle);
    initServiceAdder();
  });
})();

// Mehrfach-Leistungen: Plus-Button zum Hinzufügen
function initServiceAdder() {
  var options = [
    "Gartengestaltung", "Pflasterarbeiten", "Terrassenbau", "Rollrasen & Rasenbau",
    "Bewässerungssysteme", "Zaunbau", "Mauern & Treppen", "Erd- & Baggerarbeiten",
    "Pool- & Außenanlagen", "Gartenpflege", "Baumfällungen", "Sonstiges"
  ];

  document.querySelectorAll(".btn-add-service").forEach(function(btn) {
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      var formId = btn.getAttribute("data-form");
      var list = document.querySelector('.services-list[data-form="' + formId + '"]');
      var idx = list.children.length + 1;
      var div = document.createElement("div");
      div.style.cssText = "display:grid;grid-template-columns:1fr auto;gap:.6rem;align-items:flex-end;animation:fadeIn .3s ease";
      div.innerHTML =
        '<select class="select" name="leistung_' + idx + '" style="font-size:.96rem">' +
        '<option value="">Bitte wählen …</option>' +
        options.map(function(o) { return '<option>' + o + '</option>'; }).join('') +
        '</select>' +
        '<button type="button" class="btn-remove-service" aria-label="Entfernen" style="width:44px;height:44px;padding:0;display:grid;place-items:center;font-size:1.2rem;color:var(--muted);cursor:pointer;background:0;border:0">−</button>';
      list.appendChild(div);
      div.querySelector(".btn-remove-service").addEventListener("click", function(e2) {
        e2.preventDefault();
        div.remove();
      });
    });
  });
}

// Fade-in Keyframe für neue Felder
if (!document.querySelector("style[data-yotek-anims]")) {
  var style = document.createElement("style");
  style.setAttribute("data-yotek-anims", "1");
  style.textContent = "@keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }";
  document.head.appendChild(style);
}
