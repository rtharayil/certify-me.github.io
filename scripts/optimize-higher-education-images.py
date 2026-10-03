"""Generate responsive copies without changing or removing original artwork."""
from pathlib import Path
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DIRECTORY = ROOT / "assets4/images/EduTranscript"
SOURCES = {
    "EduTranscript-No-1-Choice-For-University-Registrars-Worldwide.png":
        ("university-transcript-workflow", (640, 960, 1250)),
    "hero-image-edutranscript.png": ("digital-transcript-platform", (640, 960, 1020)),
    "Minimize Administrative Effort.png": ("transcript-administration-icon", (160,)),
    "Integrate with your Student Information System.png": ("student-information-system-icon", (160,)),
    "Ensure Verifiability, Abolish Forgery.png": ("transcript-verification-icon", (160,)),
    "Assure Data Security And Compliance.png": ("transcript-security-icon", (160,)),
}
manifest = []
for filename, (slug, widths) in SOURCES.items():
    source = DIRECTORY / filename
    with Image.open(source) as original:
        variants = []
        for width in widths:
            height = round(original.height * width / original.width)
            image = original.resize((width, height), Image.Resampling.LANCZOS)
            destination = DIRECTORY / f"{slug}-{width}.webp"
            image.save(destination, format="WEBP", lossless=True, method=6)
            variants.append({"path": str(destination.relative_to(ROOT)), "width": width,
                             "height": height, "bytes": destination.stat().st_size})
        manifest.append({"source": str(source.relative_to(ROOT)),
                         "source_bytes": source.stat().st_size, "variants": variants})
out = ROOT / ".local/reports/institutional-seo"
out.mkdir(parents=True, exist_ok=True)
(out / "image-optimization.json").write_text(json.dumps(manifest, indent=2))
print(json.dumps(manifest, indent=2))