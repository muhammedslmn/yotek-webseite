# YOTEK Garden Design — Website

Statische Marketing-Website (HTML/CSS/JS, **kein Build**) für das Garten- und Landschaftsbau-Familienunternehmen **YOTEK Garden Design / GardenDesignYotek**. Ziel: Besucher in Anfragen umwandeln (Conversion) + lokale SEO.

## Lokal ansehen
- Server: Preview-Konfiguration `yotek` (siehe `.claude/launch.json`) startet `serve.ps1` auf `http://localhost:3000` (reiner PowerShell-Static-Server, da kein Node/Python vorhanden).
- Es gibt keinen Build- und keinen Installationsschritt.

## Struktur
- `index.html` — Homepage (Hero+Formular, Trust, Benefits, Leistungen, Werte, Galerie-Teaser, FAQ, Kontakt)
- `leistungen.html` · `galerie.html` (Lightbox) · `ueber-uns.html` · `impressum.html` · `datenschutz.html`
- `css/style.css` — Theme-System + alle Komponenten
- `js/theme.js` (Theme-Switch, Mobile-Nav, Scroll-Reveal) · `js/gallery.js` (Lightbox) · `js/form.js` (Formular)
- `assets/logo/` (Favicon + Platz für echte Logodateien) · `assets/images/projekte/` (echte Projektfotos)

## Marke
- Farben: Lime `#8dc63f`, Forest `#2e7d32` (Verlauf = der „Y"-Schwung im Logo), Steel `#b8beb2` (wie „YOTEK"-Schriftzug), Anthrazit `#141712`.
- Schriften: Display **Sora**, Body **Inter** (Google Fonts).
- Signature: kursiver grüner **„Y"-Schwung** (SVG-Symbol `#logo-y`, als dekorativer Strich + Favicon).
- **Echte Logos integriert:** freigestellte PNGs `assets/logo/logo-dark.png` (silbernes YOTEK, für anthrazit & schwarz) und `logo-light.png` (dunkles YOTEK, für weiss). Per CSS `[data-theme=weiss]` umgeschaltet. Originale liegen als `orig-*.jpeg` daneben. Erzeugt aus den Originalen via Zuschnitt + Hintergrund-Freistellung (Skript war einmalig, Quelle im Scratchpad).

## 3 Farb-Themes (umschaltbar, `localStorage`-Key `yotek-theme`)
- **`anthrazit` = Standard** (graues Stein-Theme, passend zum grauen Logo)
- **`schwarz`** · **`weiss`**
- Umsetzung: `data-theme` am `<html>`; CSS-Custom-Properties in `css/style.css`. Anti-Flash-Snippet im `<head>` jeder Seite. Grün ist in allen Themes der Akzent.

## Inhalts-Regeln (wichtig)
- Gelieferter Text = Quelle der Wahrheit. Formulierungen dürfen optimiert werden, **Aussagen nicht verändert**.
- **Nie vermischen:** Firma **2021 gegründet** ↔ Inhaber **über 30 Jahre Erfahrung im Bau**.
- Keine erfundenen Awards/Zertifikate/Bewertungen.
- Faktencheck-Daten: Inhaber **Abdullah Sirac Yorulmaz**; Sitz **Frankenthaler Straße 16, 67240 Bobenheim-Roxheim**; Tel **0171 3410500**; Mail **yorulmaz.de@gmail.com**; Instagram **@gardendesignyotek**.

## Kontaktformular
- Sendet an **yorulmaz.de@gmail.com**. Einrichtung in `js/form.js` (`FORM_ENDPOINT` = Formspree-URL eintragen). Ohne Endpoint: automatischer **mailto-Fallback**.

## Offen / vor Go-Live
- `FORM_ENDPOINT` (Formspree) eintragen oder mailto-Fallback bewusst akzeptieren.
- Impressum/Datenschutz: Platzhalter `[…]` ergänzen, rechtlich prüfen; Google Fonts ggf. self-hosten.
- Domain in `canonical`, `og:*`, `sitemap.xml`, `robots.txt` anpassen, falls nicht `gardendesignyotek.de`.
- Echte Kundenbewertungen ergänzen (Bewertungs-Sektion ist bewusst noch nicht eingebaut — keine Erfindung).
