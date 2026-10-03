#!/usr/bin/env python3
"""Generate committed WebP candidates without overwriting original artwork.

Requires Pillow (also used by prepare-home-hero.py). Run after changing a source
listed in _data/homepage_images.json, then rebuild Jekyll.
"""
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DESTINATION = ROOT / "assets4/images/optimized"


def main():
    images = json.loads((ROOT / "_data/homepage_images.json").read_text())
    DESTINATION.mkdir(parents=True, exist_ok=True)
    for key, spec in images.items():
        source = ROOT / spec["source"]
        with Image.open(source) as original:
            original = ImageOps.exif_transpose(original)
            original = original.convert("RGBA" if "A" in original.getbands() else "RGB")
            for width in spec["widths"]:
                if width > original.width:
                    raise ValueError(f"{key}: refusing to upscale {original.width}px to {width}px")
                height = round(original.height * width / original.width)
                image = original.resize((width, height), Image.Resampling.LANCZOS)
                output = DESTINATION / f"{key}-{width}.webp"
                # Preserve alpha and readable labels; never blur or crop artwork.
                image.save(output, "WEBP", quality=spec.get("quality", 90), method=6, exact=True)
                print(f"{key}: {width}×{height}, {output.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()