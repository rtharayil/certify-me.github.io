---
name: CertifyMe client-logo section location
description: Where the homepage customer/client logo strip actually lives in the template hierarchy, to avoid re-guessing its structure.
---

The homepage customer logo strip (University of Europe, IEEE, Harvard, PMI, LEB, DCU) is implemented as a partial `ClientLogos.html`, included from inside `_includes/V4NewLook/Statistics.html` — right after the commented-out "STATISTIC-5" block and before the numeric stat counters. It is not a standalone top-level section in `V4Layout.html`.

**Why:** An earlier attempt incorrectly recreated this as a separate `clientsBranding.html` include placed directly in `V4Layout.html` (based on an unrelated older/removed section with similar purpose but different markup, heading copy, and image set). That produced a visually similar but structurally wrong result until git history was searched specifically for `logo-list`/`badges-main-container` class names to find the real implementation.

**How to apply:** If asked to restore/modify the homepage client-logo list again, look inside `Statistics.html` for the `ClientLogos.html` include first, rather than assuming it's a separate layout-level section.
