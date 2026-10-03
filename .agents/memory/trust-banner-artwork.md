---
name: Trust banner artwork
description: Owner's updated request to recreate the trust banner while preserving its content and background blending.
---

The owner approved the redesigned responsive native trust banner for the homepage. This supersedes their earlier choice to use the finished uploaded image directly.

**Why:** The owner said the flat image looked out of design, then explicitly selected “Use the redesigned banner” when offered the native version.

**How to apply:** Preserve the supplied headline, figures, named regions, sectors and institution logos in the native responsive layout. Follow the homepage's hero-relative H2 typography, and do not revert to the flattened image. This choice applies to this banner, not every illustration on the site.

The trust banner's outer edges should blend into the homepage background, while its meaningful content remains sharp.

**Why:** The user said “trust banner to blend in to bg, currently the edges are too sharp.”

**How to apply:** Preserve this edge-blending treatment in future banner replacements. Do not blur the text, logos or map, or reintroduce a solid rectangular section background.

Multiply-blended artwork needs access to the shared background, not an isolated transparent stacking context.

**Why:** The theme's section stacking context left white map and logo backgrounds visible even though their computed blend mode was correctly set to multiply.

**How to apply:** Check ancestor stacking contexts when blended artwork renders with white rectangles. Preserve navigation stacking, but avoid isolating a transparent artwork section from the background it needs to blend with.