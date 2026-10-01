---
name: Uploaded image cropping
description: Coordinate handling for scaled chat previews and preserving supplied diagram content.
---

Treat crop coordinates taken from chat previews as scaled coordinates, not native upload pixels. Preserve artwork outside the region the user asked to remove, including diagram callouts.

**Why:** A chat preview was smaller than its uploaded source, so using preview coordinates directly selected the wrong region. Isolating the central artwork also removed right-hand callouts the user wanted preserved.

**How to apply:** Read the source image dimensions first, scale preview-selected bounds proportionally, and inspect the resulting crop before integration. When removing only embedded left-hand text, retain the complete remaining diagram and its original top, bottom and right edges.