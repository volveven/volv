# volvevent. – Website (volvevent.de)

Statische Website von volvevent. (Inhaber: Muhammet Hasan Gürcan, Ergolding), ausgeliefert über **GitHub Pages** unter der eigenen Domain `volvevent.de` (siehe `CNAME`).

## Struktur

| Pfad | Inhalt |
| --- | --- |
| `index.html` | Startseite mit Scrollytelling (GSAP, ScrollTrigger, Lenis) |
| `webdesign.html`, `projekte.html`, `architektur.html`, `security-audit.html` | Leistungsseiten |
| `blog.html`, `forum.html` | News & Insights, Cybersecurity-Forum |
| `kontakt.html`, `termin.html` | Formulare (Versand über Web3Forms) |
| `impressum.html`, `datenschutz.html`, `agb.html` | Rechtliches |
| `404.html` | Fehlerseite (GitHub Pages) |
| `about.html`, `contact.html`, `services.html` | Weiterleitungen auf die aktuellen Seiten (alte URLs) |
| `robots.txt`, `sitemap.xml` | Suchmaschinen |
| `assets/css/styles.css` | Gemeinsames Stylesheet aller Seiten |
| `assets/css/index.css` | Zusätzliche Styles der Startseite (Scrollytelling) |
| `assets/js/app.js` | Navigation, Formularschutz, Filter, Blog-Leser, Audit-Rechner, Simulator |
| `assets/js/scroll.js` | Scroll-Animationen der Startseite |
| `assets/vendor/` | GSAP 3.15.0, ScrollTrigger, Lenis 1.3.27 (lokal, inkl. Lizenzen) |
| `assets/fonts/` | Inter und Inter Tight (woff2, SIL Open Font License) |
| `assets/img/` | Favicon, Logo, Open-Graph-Bild |
| `images/` | Fotos und Bildsequenzen (`images/scrollytelling/…`, `images/cloud_architecture/…`) |

## Grundsätze

- **Keine externen Ressourcen zur Laufzeit:** Schriften, Skripte und Styles liegen im Repository. Es werden keine Cookies gesetzt und keine Tracking-Dienste geladen. Externe Verbindungen entstehen nur beim Absenden eines Formulars (Web3Forms) oder beim Klick auf WhatsApp.
- **Bilder bleiben Originale:** Fotos und Bildsequenzen werden in Originalfarben gezeigt; nur die Oberfläche (Text, Buttons, Linien) ist schwarz-weiß. Bilddateien bitte nicht umbenennen oder verschieben, da sie über feste Pfade eingebunden sind.
- **Barrierefreiheit:** Skip-Link, `<main>`, sichtbare Fokuszustände, Burger-Menü mit `aria-expanded`, Escape und Fokusfalle. Bei `prefers-reduced-motion` und ohne JavaScript ist die Startseite vollständig statisch lesbar.
- **Bewegung nur auf der Startseite.** Unterseiten verzichten bewusst auf Scroll-Effekte.

## Lokal ansehen

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Blog-Artikel

Die Beiträge stammen aus `all_articles_clean.json`. `generate_blog.ps1` erzeugt `blog.html` aus `blog_template.html` (Platzhalter `<!-- CARDS_PLACEHOLDER -->` und `<!-- ARTICLES_PLACEHOLDER -->`). Hinweis: Das Skript wurde an das neue Markup angepasst, aber noch nicht unter PowerShell getestet.

## Lizenzen

- GSAP und ScrollTrigger: GreenSock Standard License (`assets/vendor/LICENSE-gsap.txt`)
- Lenis: MIT (`assets/vendor/LICENSE-lenis.txt`)
- Inter, Inter Tight: SIL Open Font License 1.1 (`assets/fonts/OFL-*.txt`)
