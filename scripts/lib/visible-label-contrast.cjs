"use strict";

// Runs in the browser. Inspect painted text, not aria-labels or hidden navigation.
function visibleLabelContrast(element) {
  const parse = value => {
    const parts = value.match(/[\d.]+/g)?.map(Number);
    return parts?.length >= 3 ? [...parts.slice(0, 3), parts[3] ?? 1] : null;
  };
  const blend = (top, bottom) => top.slice(0, 3)
    .map((v, i) => v * top[3] + bottom[i] * (1 - top[3])).concat(1);
  const luminance = rgb => rgb.slice(0, 3).map(value => {
    value /= 255;
    return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
  }).reduce((sum, value, i) => sum + value * [.2126, .7152, .0722][i], 0);
  const contrast = (a, b) => {
    const x = luminance(a), y = luminance(b);
    return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
  };
  function backgrounds(node) {
    const chain = [];
    for (let parent = node; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent), color = parse(style.backgroundColor);
      chain.push({ color, image: style.backgroundImage });
      if (color?.[3] === 1 && style.backgroundImage === "none") break;
    }
    let colors = [[255, 255, 255, 1]], provisional = false;
    for (const { color, image } of chain.reverse()) {
      if (color) colors = colors.map(bg => blend(color, bg));
      if (color?.[3] === 1) provisional = false;
      if (image.includes("url(")) provisional = true;
      if (image.includes("gradient(")) {
        const stops = (image.match(/rgba?\([^)]+\)/g) || []).map(parse);
        if (stops.length) colors = stops.flatMap(stop => colors.map(bg => blend(stop, bg)));
        else provisional = true;
      }
    }
    return { colors, provisional };
  }
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const segments = [];
  let node;
  while ((node = walker.nextNode())) {
    if (!node.textContent.trim()) continue;
    const parent = node.parentElement;
    if (parent.closest("script,style,svg,.visually-hidden,.sr-only,[aria-hidden='true']")) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    if (![...range.getClientRects()].some(r => r.width > 1 && r.height > 1)) continue;
    let hidden = false, opacity = 1;
    for (let p = parent; p; p = p.parentElement) {
      const style = getComputedStyle(p);
      opacity *= Number(style.opacity);
      if (style.display === "none" || style.visibility !== "visible" ||
          style.clip !== "auto" || style.clipPath !== "none") hidden = true;
    }
    if (hidden || opacity === 0) continue;
    const style = getComputedStyle(parent), foreground = parse(style.color);
    if (!foreground) continue;
    foreground[3] *= opacity;
    const { colors, provisional } = backgrounds(parent);
    const large = parseFloat(style.fontSize) >= 24 ||
      (parseFloat(style.fontSize) >= 18.66 && parseInt(style.fontWeight, 10) >= 700);
    segments.push({
      text: node.textContent.trim(), foreground: style.color,
      backgrounds: colors, provisional, required: large ? 3 : 4.5,
      ratio: Math.min(...colors.map(bg => contrast(blend(foreground, bg), bg))),
    });
  }
  return segments;
}

module.exports = { visibleLabelContrast };
