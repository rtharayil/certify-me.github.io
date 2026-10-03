#!/usr/bin/env python3
"""Recreate the supplied map as transparent SVG paths, circles and native text.

This is reference artwork, not a geocoded customer dataset. Source marker and
label coordinates are preserved; do not substitute inferred city locations.
Requires Pillow only. No raster image is embedded in the generated SVG.
"""
from pathlib import Path
from math import hypot
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "attached_assets/CertifyMe_V2-univercity_1791010062702.png"
OUTPUT = ROOT / "_includes/V4NewLook/homepage-trust-map.svg"
BOUNDS = (469, 358, 1429, 838)


def components(points):
    remaining = set(points)
    result = []
    while remaining:
        start = remaining.pop()
        part = [start]
        for x, y in part:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1),
                           (1, 1), (1, -1), (-1, 1), (-1, -1)):
                point = (x + dx, y + dy)
                if point in remaining:
                    remaining.remove(point)
                    part.append(point)
        result.append(part)
    return result


def simplify(points, tolerance=1.5):
    if len(points) < 3:
        return points
    a, b = points[0], points[-1]
    length = hypot(b[0] - a[0], b[1] - a[1])
    distances = [
        abs((b[1] - a[1]) * p[0] - (b[0] - a[0]) * p[1]
            + b[0] * a[1] - b[1] * a[0]) / length
        if length else hypot(p[0] - a[0], p[1] - a[1])
        for p in points
    ]
    index = max(range(len(points)), key=lambda i: distances[i])
    if distances[index] <= tolerance:
        return [a, b]
    return simplify(points[:index + 1], tolerance)[:-1] + simplify(points[index:], tolerance)


def outlines(mask):
    w, h = mask.size
    pixels = mask.load()
    edges = {}

    def filled(x, y):
        return 0 <= x < w and 0 <= y < h and pixels[x, y] > 127

    def edge(a, b):
        edges.setdefault(a, []).append(b)

    for y in range(h):
        for x in range(w):
            if not filled(x, y):
                continue
            if not filled(x, y - 1): edge((x, y), (x + 1, y))
            if not filled(x + 1, y): edge((x + 1, y), (x + 1, y + 1))
            if not filled(x, y + 1): edge((x + 1, y + 1), (x, y + 1))
            if not filled(x - 1, y): edge((x, y + 1), (x, y))
    paths = []
    while edges:
        start = next(iter(edges))
        current = start
        loop = []
        while current in edges:
            loop.append(current)
            following = edges[current].pop()
            if not edges[current]:
                del edges[current]
            current = following
            if current == start:
                break
        area = abs(sum(a[0] * b[1] - b[0] * a[1]
                       for a, b in zip(loop, loop[1:] + loop[:1]))) / 2
        if area < 18:
            continue
        middle = len(loop) // 2
        contour = simplify(loop[:middle + 1])[:-1] + simplify(loop[middle:] + loop[:1])[:-1]
        paths.append("M" + " ".join(f"{x},{y}" for x, y in contour) + "Z")
    return paths


def main():
    image = Image.open(SOURCE).convert("RGB").crop(BOUNDS)
    w, h = image.size
    assert (w, h) == (960, 480)
    pixels = image.load()
    blue = {(x, y) for y in range(h) for x in range(w)
            if pixels[x, y][2] > 180
            and pixels[x, y][2] - pixels[x, y][0] > 75
            and pixels[x, y][2] - pixels[x, y][1] > 40}
    groups = components(blue)
    pills = sorted((g for g in groups if len(g) > 1000),
                   key=lambda g: min(p[1] for p in g))
    names = ["Europe", "North America", "Middle East", "Asia Pacific", "Latin America", "Africa"]
    assert len(pills) == len(names)
    regions = []
    for name, group in zip(names, pills):
        xs, ys = zip(*group)
        regions.append((name, min(xs), min(ys), max(xs) - min(xs) + 1, max(ys) - min(ys) + 1))
    dots = []
    for group in groups:
        if len(group) > 1000:
            continue
        occupied = set(group)
        # Split touching dots at their circular cores instead of relocating a
        # multi-dot cluster to one centroid.
        distance = {}
        for x, y in group:
            distance[x, y] = min(
                dx * dx + dy * dy
                for dx in range(-5, 6) for dy in range(-5, 6)
                if (x + dx, y + dy) not in occupied
            )
        candidates = sorted(group, key=lambda p: (-distance[p], p))
        selected = []
        for p in candidates:
            if distance[p] < 2 and selected:
                continue
            if all(hypot(p[0] - q[0], p[1] - q[1]) >= 5.5 for q in selected):
                selected.append(p)
        if not selected:
            selected = [group[0]]
        dots.extend(selected)
    dots.sort(key=lambda p: (p[1], p[0]))
    land = Image.new("L", (w, h))
    land.putdata([255 if b - r > 7 and g - r > 3 and b - g > 2
                 and r < 240 and g > 150 else 0 for r, g, b in image.getdata()])
    land = land.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
    land = land.filter(ImageFilter.GaussianBlur(1.2))
    paths = outlines(land)
    output = [
        '<svg class="homepage-trust-banner__world" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 480" role="img" aria-labelledby="trust-map-title trust-map-description">',
        '  <title id="trust-map-title">Global reach</title>',
        '  <desc id="trust-map-description">Illustrative world map recreated from the supplied artwork. North America, Europe, Latin America, Africa, Middle East and Asia Pacific retain their original label positions. Markers retain the source artwork coordinates.</desc>',
        '  <g class="trust-map-land" fill="#dce8f8" fill-rule="evenodd" stroke="#dce8f8" stroke-width=".6">',
        '    <path d="' + "".join(paths) + '"/>',
        '  </g>',
        '  <g class="trust-map-markers" fill="#3675dc">',
    ]
    output.extend(f'    <circle class="trust-map-marker" cx="{x}" cy="{y}" r="2.6"/>' for x, y in dots)
    output.append('  </g>')
    for name, x, y, width, height in regions:
        output.extend([
            f'  <g class="trust-map-region" data-region="{name}" data-source-center="{x + width / 2},{y + height / 2}" transform="translate({x},{y})">',
            f'    <rect width="{width}" height="{height}" rx="{height / 2}" fill="#3675dc"/>',
            f'    <text class="trust-map-region-label" x="{width / 2}" y="{height / 2}" text-anchor="middle" dominant-baseline="central" fill="#fff" font-family="sans-serif" font-size="16">{name}</text>',
            '  </g>',
        ])
    output.append('</svg>\n')
    OUTPUT.write_text("\n".join(output))
    print(f"Recreated transparent native SVG: {len(dots)} source-marker cores, {len(regions)} exact-position labels, {len(paths)} geographic contours.")


if __name__ == "__main__":
    main()