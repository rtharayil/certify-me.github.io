---
name: CertifyMe client-logo section location
description: Where the homepage customer/client logo strip actually lives in the template hierarchy, to avoid re-guessing its structure.
---

Preserve the original approved customer-logo strip when reordering or restoring homepage sections; do not recreate it from lookalike historical templates. Do not assume a component named Statistics still contains numeric counters.

**Why:** An earlier attempt incorrectly recreated this as a separate `clientsBranding.html` include placed directly in `V4Layout.html` (based on an unrelated older/removed section with similar purpose but different markup, heading copy, and image set). That produced a visually similar but structurally wrong result until git history was searched specifically for `logo-list`/`badges-main-container` class names to find the real implementation.

**How to apply:** If asked to restore/modify the homepage client-logo list again, look inside `Statistics.html` for the `ClientLogos.html` include first, rather than assuming it's a separate layout-level section.
