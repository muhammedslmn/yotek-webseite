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
  var MAX_FILES = 5;
  var MAX_BYTES = 10 * 1024 * 1024;

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

  function resetFileHelp(form) {
    var help = form.querySelector("[data-file-help]");
    if (help) { help.textContent = help.getAttribute("data-default") || ""; help.classList.remove("is-err"); }
  }

  function initFiles(form) {
    var input = form.querySelector("input[type=file]");
    var help = form.querySelector("[data-file-help]");
    if (!input || !help) return;
    input.addEventListener("change", function () {
      var list = [].filter.call(input.files, function (f) { return f.size > 0; });
      if (!list.length) { resetFileHelp(form); return; }
      var total = list.reduce(function (n, f) { return n + f.size; }, 0);
      var tooMany = list.length > MAX_FILES || total > MAX_BYTES;
      var mb = (total / 1048576).toFixed(1).replace(".", ",");
      help.textContent = tooMany
        ? "Zu viele oder zu große Dateien (" + list.length + " Dateien, " + mb + " MB). Erlaubt: bis zu " + MAX_FILES + " Dateien, zusammen maximal 10 MB."
        : list.length + (list.length === 1 ? " Datei" : " Dateien") + " ausgewählt (" + mb + " MB): " + list.map(function (f) { return f.name; }).join(", ");
      help.classList.toggle("is-err", tooMany);
    });
  }
  function handle(form) {
    initFiles(form);
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Honeypot: ausgefüllt = Bot
      var hp = form.querySelector(".honeypot input");
      if (hp && hp.value) return;

      if (!valid(form)) {
        status(form, "err", "Bitte füllen Sie die Pflichtfelder korrekt aus.");
        return;
      }

      // Chip-Auswahl (mehrere Leistungen) in ein Feld zusammenführen
      var chips = form.querySelector("[data-chips]");
      if (chips) {
        var picked = [].map.call(chips.querySelectorAll("input[type=checkbox]:checked"), function (c) { return c.value; });
        form.querySelector("input[name=leistung]").value = picked.join(", ");
      }

      var fd = new FormData(form);
      var data = {};
      fd.forEach(function (v, k) { data[k] = v; });

      // Anhänge (optional): Fotos oder Dateien prüfen
      var fileInput = form.querySelector("input[type=file]");
      var files = fileInput ? [].filter.call(fileInput.files, function (f) { return f.size > 0; }) : [];
      if (fileInput) {
        var total = files.reduce(function (n, f) { return n + f.size; }, 0);
        if (files.length > MAX_FILES || total > MAX_BYTES) {
          status(form, "err", "Bitte hängen Sie höchstens " + MAX_FILES + " Dateien mit zusammen maximal 10 MB an.");
          return;
        }
        if (!files.length) fd.delete(fileInput.name);
      }

      var btn = form.querySelector("button[type=submit]");

      if (FORM_ENDPOINT.indexOf("formspree.io") === -1) {
        // Kein Endpoint konfiguriert → lokale Erfolgsmeldung
        showLocalSuccess(form);
        return;
      }

      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = "Wird gesendet …"; }

      function post() {
        return fetch(FORM_ENDPOINT, {
          method: "POST",
          body: fd,
          headers: { Accept: "application/json" }
        });
      }
      var okText = "Vielen Dank! Ihre Anfrage ist eingegangen — wir melden uns zeitnah bei Ihnen.";
      var failText = "Senden fehlgeschlagen. Bitte rufen Sie uns an: +49 174 6796199.";

      post().then(function (res) {
        if (res.ok) {
          form.reset(); resetFileHelp(form);
          status(form, "ok", okText);
          return;
        }
        if (files.length) {
          // Mit Dateien nicht möglich → Anfrage ohne Dateien senden, damit sie nicht verloren geht
          fd.delete(fileInput.name);
          return post().then(function (res2) {
            if (res2.ok) {
              form.reset(); resetFileHelp(form);
              status(form, "ok", "Vielen Dank! Ihre Anfrage ist eingegangen. Die Dateien konnten leider nicht übertragen werden – bitte senden Sie diese kurz per WhatsApp oder E-Mail an info@yotek.de.");
            } else {
              status(form, "err", failText);
            }
          });
        }
        status(form, "err", failText);
      }).catch(function () {
        status(form, "err", "Verbindungsfehler. Bitte rufen Sie uns an: +49 174 6796199.");
      }).finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || "Anfrage senden"; }
      });    });
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
