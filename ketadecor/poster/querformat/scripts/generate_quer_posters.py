import os
import base64
import subprocess

base_dir = r"c:\volvevent\ketadecor"
out_dir = os.path.join(base_dir, "poster", "querformat")
os.makedirs(out_dir, exist_ok=True)

img_dir = os.path.join(base_dir, "images")
poster_assets = os.path.join(base_dir, "poster")

def get_base64_img(path):
    with open(path, "rb") as f:
        data = f.read()
    ext = os.path.splitext(path)[1].lower().replace(".", "")
    if ext == "jpg":
        ext = "jpeg"
    return f"data:image/{ext};base64,{base64.b64encode(data).decode('utf-8')}"

wa_qr_b64 = get_base64_img(os.path.join(poster_assets, "wa_qr_900.png"))
ig_qr_b64 = get_base64_img(os.path.join(poster_assets, "ig_qr_900.png"))

posters = [
    {
        "id": "poster_quer_1_antrag",
        "title": "Poster 1: Der perfekte Heiratsantrag",
        "theme": "dark",
        "photo_side": "left",
        "photo": os.path.join(img_dir, "32.jpg"),
        "photo_badge": "SIGNATURE MOMENT • COLD SPARKS & KERZENMEER",
        "headline": "DER PERFEKTE HEIRATSANTRAG",
        "subline": "Atemberaubende Kulissen, Kerzenmeer & Spezialeffekte in ganz NRW",
        "accent_glow": "rgba(212, 175, 55, 0.15)"
    },
    {
        "id": "poster_quer_2_hochzeit",
        "title": "Poster 2: Haute Couture Hochzeiten",
        "theme": "dark",
        "photo_side": "right",
        "photo": os.path.join(img_dir, "36.jpg"),
        "photo_badge": "HAUTE COUTURE HOCHZEITEN • NRW",
        "headline": "HOCHZEITSDEKORATION DER EXTRAKLASSE",
        "subline": "Monumentale Brauttische, Blütenportale & maßgeschneidertes Eventdesign",
        "accent_glow": "rgba(212, 175, 55, 0.15)"
    },
    {
        "id": "poster_quer_3_rosenherz",
        "title": "Poster 3: Sag Ja zum perfekten Moment (101 Rosen VIP)",
        "theme": "dark_crimson",
        "photo_side": "left",
        "photo": os.path.join(img_dir, "35.jpg"),
        "photo_badge": "VIP EDITION • 101 SAMTIGE EDELROSEN",
        "headline": "SAG JA ZUM PERFEKTEN MOMENT",
        "subline": "Das originale 101-Rosen VIP-Herz, Roter Teppich & Rundum-Sorglos-Service",
        "accent_glow": "rgba(220, 20, 60, 0.18)"
    },
    {
        "id": "poster_quer_4_pearl_ivory",
        "title": "Poster 4: Deine Traumdekoration (Pearl Ivory Bridal Edition)",
        "theme": "pearl_ivory",
        "photo_side": "right",
        "photo": os.path.join(img_dir, "3.jpg"),
        "photo_badge": "ORANGERIE & SALON DESIGNS • GANZ NRW",
        "headline": "DEINE TRAUMDEKORATION",
        "subline": "Heiratsantrag • Verlobung • Traumhochzeit – Pünktlicher Auf- & Abbau vor Ort",
        "accent_glow": "rgba(212, 175, 55, 0.2)"
    },
    {
        "id": "poster_quer_5_skyline",
        "title": "Poster 5: Unvergessliche Momente (Rooftop & Skyline Romance)",
        "theme": "dark_midnight",
        "photo_side": "left",
        "photo": os.path.join(img_dir, "28.jpg"),
        "photo_badge": "ROOFTOP & SKYLINE EMOTION • NRW",
        "headline": "UNVERGESSLICHE MOMENTE",
        "subline": "Exklusive Rooftop-, Outdoor- & Luxus-Locations in Düsseldorf, Köln & NRW",
        "accent_glow": "rgba(65, 105, 225, 0.15)"
    }
]

def generate_html(p):
    photo_b64 = get_base64_img(p["photo"])
    is_light = (p["theme"] == "pearl_ivory")
    
    # Color scheme
    if is_light:
        bg_main = "#FAF8F5"
        bg_gradient = "radial-gradient(circle at 75% 25%, rgba(212, 175, 55, 0.15) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(230, 215, 195, 0.3) 0%, transparent 50%), #FAF8F5"
        text_primary = "#1C1917"
        text_secondary = "#8A6D3B"
        border_color = "rgba(180, 140, 60, 0.25)"
        gold_title = "linear-gradient(135deg, #B8860B 0%, #D4AF37 50%, #8A6D3B 100%)"
        card_bg = "rgba(255, 255, 255, 0.95)"
        card_shadow = "0 12px 35px rgba(0, 0, 0, 0.06)"
        badge_border = "rgba(180, 140, 60, 0.3)"
        footer_color = "#78716C"
        crown_fill = "#B8860B"
    elif p["theme"] == "dark_crimson":
        bg_main = "#0B0809"
        bg_gradient = "radial-gradient(circle at 80% 25%, rgba(180, 20, 40, 0.15) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(212, 175, 55, 0.1) 0%, transparent 50%), #0B0809"
        text_primary = "#FFFFFF"
        text_secondary = "#E6C587"
        border_color = "rgba(212, 175, 55, 0.3)"
        gold_title = "linear-gradient(135deg, #FFF0D0 0%, #F3D280 40%, #D4AF37 70%, #AA8020 100%)"
        card_bg = "rgba(18, 14, 16, 0.85)"
        card_shadow = "0 16px 40px rgba(0, 0, 0, 0.6)"
        badge_border = "rgba(220, 40, 60, 0.4)"
        footer_color = "#9E9E9E"
        crown_fill = "url(#goldGrad)"
    elif p["theme"] == "dark_midnight":
        bg_main = "#08090E"
        bg_gradient = "radial-gradient(circle at 80% 25%, rgba(40, 70, 140, 0.2) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(212, 175, 55, 0.1) 0%, transparent 50%), #08090E"
        text_primary = "#FFFFFF"
        text_secondary = "#E6C587"
        border_color = "rgba(212, 175, 55, 0.3)"
        gold_title = "linear-gradient(135deg, #FFF0D0 0%, #F3D280 40%, #D4AF37 70%, #AA8020 100%)"
        card_bg = "rgba(14, 17, 26, 0.85)"
        card_shadow = "0 16px 40px rgba(0, 0, 0, 0.6)"
        badge_border = "rgba(65, 105, 225, 0.4)"
        footer_color = "#9E9E9E"
        crown_fill = "url(#goldGrad)"
    else: # dark noir gold
        bg_main = "#0B0C0E"
        bg_gradient = "radial-gradient(circle at 80% 25%, rgba(212, 175, 55, 0.15) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(180, 140, 60, 0.08) 0%, transparent 50%), #0B0C0E"
        text_primary = "#FFFFFF"
        text_secondary = "#E6C587"
        border_color = "rgba(212, 175, 55, 0.3)"
        gold_title = "linear-gradient(135deg, #FFF0D0 0%, #F3D280 40%, #D4AF37 70%, #AA8020 100%)"
        card_bg = "rgba(18, 19, 23, 0.85)"
        card_shadow = "0 16px 40px rgba(0, 0, 0, 0.6)"
        badge_border = "rgba(212, 175, 55, 0.3)"
        footer_color = "#9E9E9E"
        crown_fill = "url(#goldGrad)"

    # Flex order
    photo_order = 1 if p["photo_side"] == "left" else 2
    content_order = 2 if p["photo_side"] == "left" else 1

    return f"""<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>{p['title']} - KETADECOR</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Montserrat:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&display=swap" rel="stylesheet">
  <style>
    @page {{
      size: 594mm 420mm;
      margin: 0;
    }}
    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }}
    html, body {{
      width: 1980px;
      height: 1400px;
      overflow: hidden;
      background: {bg_main};
      font-family: 'Montserrat', sans-serif;
    }}
    .poster-container {{
      width: 1980px;
      height: 1400px;
      display: flex;
      position: relative;
      background: {bg_gradient};
      border: 1px solid {border_color};
    }}
    
    /* Photo Section */
    .photo-section {{
      order: {photo_order};
      flex: 0 0 54%;
      height: 1400px;
      position: relative;
      overflow: hidden;
    }}
    .photo-section img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 25%;
      display: block;
    }}
    .photo-overlay-left {{
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to right, rgba(0,0,0,0.1) 70%, {bg_main} 100%);
      pointer-events: none;
    }}
    .photo-overlay-right {{
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to left, rgba(0,0,0,0.1) 70%, {bg_main} 100%);
      pointer-events: none;
    }}
    .photo-badge {{
      position: absolute;
      bottom: 50px;
      left: {'50px' if p['photo_side'] == 'left' else 'auto'};
      right: {'50px' if p['photo_side'] == 'right' else 'auto'};
      background: rgba(12, 13, 16, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid {border_color};
      color: #E6C587;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 3.5px;
      padding: 14px 28px;
      border-radius: 40px;
      text-transform: uppercase;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      z-index: 5;
    }}

    /* Content Section */
    .content-section {{
      order: {content_order};
      flex: 0 0 46%;
      height: 1400px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 75px 75px;
      position: relative;
      z-index: 10;
    }}

    /* Brand Header */
    .brand-box {{
      text-align: left;
    }}
    .crown-svg {{
      width: 52px;
      height: 40px;
      margin-bottom: 12px;
      display: block;
    }}
    .brand-title {{
      font-family: 'Cinzel', serif;
      font-size: 46px;
      font-weight: 800;
      letter-spacing: 11px;
      background: {gold_title};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1.1;
      text-transform: uppercase;
    }}
    .brand-sub {{
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 6px;
      color: {text_secondary};
      text-transform: uppercase;
      margin-top: 8px;
      opacity: 0.9;
    }}
    .divider-line {{
      display: flex;
      align-items: center;
      gap: 15px;
      margin-top: 24px;
      width: 100%;
    }}
    .divider-line .line {{
      flex: 1;
      height: 1px;
      background: {border_color};
    }}
    .divider-line .diamond {{
      color: #D4AF37;
      font-size: 12px;
    }}

    /* Main Message (Nur 1-2 Sachen, riesig & leserlich!) */
    .hero-message {{
      margin: 30px 0;
    }}
    .hero-tagline {{
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 5px;
      color: #D4AF37;
      text-transform: uppercase;
      margin-bottom: 16px;
      display: inline-block;
    }}
    .hero-headline {{
      font-family: 'Playfair Display', serif;
      font-size: 64px;
      font-weight: 800;
      line-height: 1.12;
      color: {text_primary};
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }}
    .hero-subline {{
      font-size: 24px;
      font-weight: 500;
      line-height: 1.45;
      color: {text_secondary};
      margin-top: 22px;
      max-width: 95%;
    }}

    /* QR Code Action Section */
    .qr-block {{
      background: {card_bg};
      backdrop-filter: blur(15px);
      border: 1px solid {border_color};
      border-radius: 28px;
      padding: 32px 34px;
      box-shadow: {card_shadow};
    }}
    .qr-block-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 22px;
    }}
    .qr-block-title {{
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: {text_primary};
    }}
    .qr-cards-row {{
      display: flex;
      gap: 22px;
    }}
    
    /* WhatsApp Card */
    .qr-card-wa {{
      flex: 1;
      background: rgba(37, 211, 102, 0.04);
      border: 2px solid rgba(37, 211, 102, 0.4);
      border-radius: 20px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      box-shadow: 0 8px 25px rgba(37, 211, 102, 0.1);
    }}
    .wa-pill {{
      background: #25D366;
      color: #05260F;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1.2px;
      padding: 6px 16px;
      border-radius: 30px;
      display: flex;
      align-items: center;
      gap: 6px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }}
    .qr-box {{
      background: #FFFFFF;
      padding: 10px;
      border-radius: 14px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
      margin-bottom: 14px;
    }}
    .qr-box img {{
      width: 175px;
      height: 175px;
      display: block;
    }}
    .qr-action-title {{
      font-size: 15px;
      font-weight: 700;
      color: {text_primary};
      margin-bottom: 4px;
    }}
    .qr-action-sub {{
      font-size: 13.5px;
      font-weight: 700;
      color: #25D366;
      letter-spacing: 0.5px;
    }}

    /* Instagram Card */
    .qr-card-ig {{
      flex: 1;
      background: rgba(225, 48, 108, 0.04);
      border: 2px solid rgba(225, 48, 108, 0.4);
      border-radius: 20px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      box-shadow: 0 8px 25px rgba(225, 48, 108, 0.1);
    }}
    .ig-pill {{
      background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
      color: #FFFFFF;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1.2px;
      padding: 6px 16px;
      border-radius: 30px;
      display: flex;
      align-items: center;
      gap: 6px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }}
    .qr-action-sub-ig {{
      font-size: 13.5px;
      font-weight: 700;
      color: #E1306C;
      letter-spacing: 0.5px;
    }}

    /* Bottom Brand Footer */
    .poster-footer {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 15px;
      border-top: 1px solid {border_color};
      font-size: 13px;
      letter-spacing: 3px;
      color: {footer_color};
      font-weight: 600;
      text-transform: uppercase;
    }}
  </style>
</head>
<body>
  <svg style="position: absolute; width: 0; height: 0; overflow: hidden;" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF0D0" />
        <stop offset="35%" stop-color="#F3D280" />
        <stop offset="70%" stop-color="#D4AF37" />
        <stop offset="100%" stop-color="#AA8020" />
      </linearGradient>
    </defs>
  </svg>

  <div class="poster-container">
    
    <!-- Photo Side -->
    <div class="photo-section">
      <img src="{photo_b64}" alt="{p['headline']}">
      <div class="{'photo-overlay-left' if p['photo_side'] == 'left' else 'photo-overlay-right'}"></div>
      <div class="photo-badge">{p['photo_badge']}</div>
    </div>

    <!-- Content Side -->
    <div class="content-section">
      
      <!-- Top Brand -->
      <div class="brand-box">
        <svg class="crown-svg" viewBox="0 0 24 24" fill="{crown_fill}">
          <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z"/>
        </svg>
        <h1 class="brand-title">KETADECOR</h1>
        <div class="brand-sub">Haute Couture Eventdekoration</div>
        <div class="divider-line">
          <div class="line"></div>
          <span class="diamond">◆</span>
          <div class="line"></div>
        </div>
      </div>

      <!-- Hero Message: Nur 1-2 Sachen, riesig & leserlich! -->
      <div class="hero-message">
        <div class="hero-tagline">Exklusiv in Nordrhein-Westfalen</div>
        <h2 class="hero-headline">{p['headline']}</h2>
        <p class="hero-subline">{p['subline']}</p>
      </div>

      <!-- Big Dual QR Block -->
      <div class="qr-block">
        <div class="qr-block-header">
          <div class="qr-block-title">Wunschtermin anfragen & Inspiration erleben</div>
          <div style="font-size: 13px; color: #D4AF37; font-weight: 700; letter-spacing: 1px;">★ 5.0 GOOGLE RATING</div>
        </div>
        <div class="qr-cards-row">
          
          <!-- WhatsApp -->
          <div class="qr-card-wa">
            <div class="wa-pill">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12 20.33c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.293 8.293 0 0 1-1.27-4.47c0-4.58 3.73-8.31 8.31-8.31 2.22 0 4.31.86 5.88 2.43a8.25 8.25 0 0 1 2.43 5.88c0 4.58-3.73 8.33-8.31 8.33zm4.56-6.22c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.26-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.41 1.01 2.58.13.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.11-.23-.17-.48-.3z"/>
              </svg>
              WhatsApp
            </div>
            <div class="qr-box">
              <img src="{wa_qr_b64}" alt="WhatsApp QR Code">
            </div>
            <div class="qr-action-title">Direkt chatten & anfragen</div>
            <div class="qr-action-sub">+49 176 57354779</div>
          </div>

          <!-- Instagram -->
          <div class="qr-card-ig">
            <div class="ig-pill">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </div>
            <div class="qr-box">
              <img src="{ig_qr_b64}" alt="Instagram QR Code">
            </div>
            <div class="qr-action-title">100+ Live-Videos & Reels</div>
            <div class="qr-action-sub-ig">@ketadecor_</div>
          </div>

        </div>
      </div>

      <!-- Footer Info -->
      <div class="poster-footer">
        <div>DÜSSELDORF • KÖLN • DORTMUND • ESSEN • GANZ NRW</div>
        <div style="font-weight: 800; color: #D4AF37;">WWW.KETADECOR.DE</div>
      </div>

    </div>

  </div>
</body>
</html>"""

# Generate HTML files
print("Generating HTML files...")
for p in posters:
    html_content = generate_html(p)
    file_path = os.path.join(out_dir, f"{p['id']}.html")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Created: {file_path}")

print("All 5 HTML files created successfully!")
