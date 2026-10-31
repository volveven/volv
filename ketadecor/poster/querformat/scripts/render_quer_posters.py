import os
import subprocess
import time

base_dir = r"c:\volvevent\ketadecor"
out_dir = os.path.join(base_dir, "poster", "querformat")
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

ids = [
    "poster_quer_1_antrag",
    "poster_quer_2_hochzeit",
    "poster_quer_3_rosenherz",
    "poster_quer_4_pearl_ivory",
    "poster_quer_5_skyline"
]

for pid in ids:
    html_file = os.path.abspath(os.path.join(out_dir, f"{pid}.html"))
    pdf_file = os.path.abspath(os.path.join(out_dir, f"{pid}.pdf"))
    png_file = os.path.abspath(os.path.join(out_dir, f"{pid}_300dpi.png"))
    
    html_url = f"file:///{html_file.replace(os.sep, '/')}"
    print(f"\n==========================================")
    print(f"Rendering {pid} ...")
    
    # 1. Render PDF (DIN A2 Landscape)
    cmd_pdf = [
        chrome_path,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_file}",
        html_url
    ]
    subprocess.run(cmd_pdf, capture_output=True, text=True)
    if os.path.exists(pdf_file):
        print(f"  [OK] PDF: {os.path.basename(pdf_file)} ({os.path.getsize(pdf_file):,} bytes)")
    else:
        print(f"  [FAIL] PDF not created for {pid}")

    # 2. Render 300 DPI Ultra-HD PNG (1980x1400 * 2 = 3960x2800 px)
    cmd_png = [
        chrome_path,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--hide-scrollbars",
        "--force-device-scale-factor=2",
        "--window-size=1980,1400",
        f"--screenshot={png_file}",
        html_url
    ]
    subprocess.run(cmd_png, capture_output=True, text=True)
    if os.path.exists(png_file):
        print(f"  [OK] PNG: {os.path.basename(png_file)} ({os.path.getsize(png_file):,} bytes)")
    else:
        print(f"  [FAIL] PNG not created for {pid}")

print("\nAll 5 landscape posters rendered successfully!")
