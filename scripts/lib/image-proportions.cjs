// Runs in the browser. Keep this shared by the live-page and negative-fixture tests.
async function inspectImages(selector) {
  function uniqueSelector(element) {
    if (element.id) return `#${CSS.escape(element.id)}`;
    const parts = [];
    while (element && element.nodeType === 1) {
      if (element.id) {
        parts.unshift(`#${CSS.escape(element.id)}`);
        break;
      }
      const siblings = [...element.parentElement?.children || []]
        .filter(sibling => sibling.tagName === element.tagName);
      parts.unshift(`${element.localName}:nth-of-type(${siblings.indexOf(element) + 1})`);
      element = element.parentElement;
    }
    return parts.join(" > ");
  }
  async function decode(image) {
    let timer;
    try {
      await Promise.race([
        image.decode(),
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error("Image decode timed out (10s)")), 10000);
        }),
      ]);
      if (!image.naturalWidth || !image.naturalHeight) throw new Error("Image has no natural dimensions");
    } finally {
      clearTimeout(timer);
    }
  }
  return Promise.all([...document.querySelectorAll(selector)].map(async image => {
    const row = {
      selector: uniqueSelector(image), image: image.currentSrc || image.src,
      alt: image.alt, attributes: [image.getAttribute("width"), image.getAttribute("height")],
    };
    if (!image.getClientRects().length || !image.getBoundingClientRect().width
        || !image.getBoundingClientRect().height) return { ...row, status: "hidden" };
    try {
      // Eager loading alone does not guarantee a lazy image has finished loading.
      image.loading = "eager";
      await decode(image);
      row.image = image.currentSrc || image.src;
      row.natural = [image.naturalWidth, image.naturalHeight];
      row.source = row.natural;
      if (image.srcset || image.closest("picture")) {
        // Width-descriptor srcset produces density-corrected INTEGER natural
        // dimensions (e.g. 99x6 for a 296x20 logo). Decode the selected resource
        // without srcset to compare against its actual ratio, not rounded density.
        const source = new Image();
        source.src = row.image;
        await decode(source);
        row.source = [source.naturalWidth, source.naturalHeight];
      }
      const style = getComputedStyle(image);
      const inset = axis => ["padding", "border"].reduce((sum, kind) => (
        sum + (parseFloat(style[`${kind}${axis === "width" ? "Left" : "Top"}${kind === "border" ? "Width" : ""}`]) || 0)
        + (parseFloat(style[`${kind}${axis === "width" ? "Right" : "Bottom"}${kind === "border" ? "Width" : ""}`]) || 0)
      ), 0);
      row.box = ["width", "height"].map(axis => (
        parseFloat(style[axis]) - (style.boxSizing === "border-box" ? inset(axis) : 0)
      ));
      row.fit = style.objectFit;
      if (!row.attributes.every(value => Number(value) > 0)) {
        return { ...row, status: "FAIL", reason: "Missing positive intrinsic width/height attributes" };
      }
      if (["contain", "cover", "scale-down"].includes(row.fit)) {
        return { ...row, status: "exempt", reason: `Intentional object-fit: ${row.fit}` };
      }
      if (!row.box.every(value => Number.isFinite(value) && value > 0)) {
        return { ...row, status: "FAIL", reason: "Image content box has no positive dimensions" };
      }
      const ratio = row.source[0] / row.source[1];
      row.expectedHeight = row.box[0] / ratio;
      row.relativeError = Math.abs(row.box[0] / row.box[1] / ratio - 1);
      // Ignore subpixel layout noise, not a fixed percentage of visible distortion.
      const distorted = row.relativeError > 0.02 && Math.abs(row.box[1] - row.expectedHeight) > 1;
      return { ...row, status: distorted ? "FAIL" : "PASS",
        ...(distorted ? { reason: "Rendered content ratio differs from selected image; check width/height CSS (use height:auto or width:auto)" } : {}) };
    } catch (error) {
      return { ...row, status: "FAIL", reason: error.message };
    }
  }));
}

// Run after scrolling each element into view; offscreen content is not hidden content.
function inspectVisibility(element) {
  const parts = [];
  for (let node = element; node; node = node.parentElement) {
    if (node.id) { parts.unshift(`#${CSS.escape(node.id)}`); break; }
    const siblings = [...node.parentElement?.children || []].filter(sibling => sibling.tagName === node.tagName);
    parts.unshift(`${node.localName}:nth-of-type(${siblings.indexOf(node) + 1})`);
  }
  const rect = element.getBoundingClientRect();
  let left = Math.max(0, rect.left), right = Math.min(innerWidth, rect.right);
  let top = Math.max(0, rect.top), bottom = Math.min(innerHeight, rect.bottom);
  let hidden = false;
  for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
    const style = getComputedStyle(ancestor);
    hidden ||= style.display === "none" || style.visibility !== "visible" || Number(style.opacity) < 0.05;
    const bounds = ancestor.getBoundingClientRect();
    if (ancestor !== element && /hidden|clip|auto|scroll/.test(style.overflowX)) {
      left = Math.max(left, bounds.left); right = Math.min(right, bounds.right);
    }
    if (ancestor !== element && /hidden|clip|auto|scroll/.test(style.overflowY)) {
      top = Math.max(top, bounds.top); bottom = Math.min(bottom, bounds.bottom);
    }
  }
  const visibleFraction = Math.max(0, right - left) * Math.max(0, bottom - top)
    / Math.max(1, rect.width * rect.height);
  return {
    selector: parts.join(" > "),
    ...(element.tagName === "IMG" ? { image: element.currentSrc || element.src } : {}),
    status: !hidden && rect.width > 0 && rect.height > 0 && visibleFraction > 0.5 ? "PASS" : "FAIL",
    reason: "Scrolled content must be visible, not hidden or mostly clipped",
    text: element.textContent.trim().slice(0, 140), visibleFraction,
    box: [rect.width, rect.height], opacityOrVisibilityHidden: hidden,
  };
}

module.exports = { inspectImages, inspectVisibility };