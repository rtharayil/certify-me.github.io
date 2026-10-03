---
name: Trust banner artwork
description: Owner's updated request to recreate the trust banner while preserving its content and background blending.
---

The owner approved the redesigned responsive native trust banner for the homepage. This supersedes their earlier choice to use the finished uploaded image directly.

**Why:** The owner said the flat image looked out of design, then explicitly selected “Use the redesigned banner” when offered the native version.

**How to apply:** Preserve the supplied headline, figures, named regions, sectors and institution logos in the native responsive layout. Follow the homepage's hero-relative H2 typography, and do not revert to the flattened image. This choice applies to this banner, not every illustration on the site.

Keep “A global learning community” at the same visual scale as “The institutional outcome.”

**Why:** The user said the two sections were not the same size and requested a matching redesign.

**How to apply:** Compare their container widths, horizontal alignment and text/artwork proportions at the same viewport. Preserve the consistent H2 typography rather than compensating for a narrow container with an oversized headline.

Keep the institution logos on one line at a reduced size, using genuine web-sourced logo artwork.

**Why:** After requesting larger web-sourced logos, the user clarified: “reduce size of logo sould be on one line.”

**How to apply:** Preserve a single row of all six logos, with smaller responsive sizing instead of wrapping. Retain the existing organizations and local copies of sourced assets. Balance visible artwork rather than giving every logo an identical height: the user requested smaller UE, IEEE, HBP and PMI wordmarks and larger IISc and DCU marks so they look similar in visual weight.

The trust banner's outer edges should blend into the homepage background, while its meaningful content remains sharp.

**Why:** The user said “trust banner to blend in to bg, currently the edges are too sharp.”

**How to apply:** Preserve this edge-blending treatment in future banner replacements. Do not blur the text, logos or map, or reintroduce a solid rectangular section background.

Multiply-blended artwork needs access to the shared background, not an isolated transparent stacking context.

**Why:** The theme's section stacking context left white map and logo backgrounds visible even though their computed blend mode was correctly set to multiply.

**How to apply:** Check ancestor stacking contexts when blended artwork renders with white rectangles. Preserve navigation stacking, but avoid isolating a transparent artwork section from the background it needs to blend with.