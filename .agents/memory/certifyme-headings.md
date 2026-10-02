---
name: CertifyMe heading audits
description: Reliable audit scope and proof boundaries when checking heading hierarchy and typography.
---

Audit parsed, rendered HTML rather than matching heading strings in source or output with regular expressions. Ignore comments, scripts and templates; report indexable marketing pages separately from noindex pages, legacy demos and utility outputs.

**Why:** A literal-tag audit falsely reported duplicate H1s on nearly every integration page because it counted a commented statistics heading. Old audit totals were also misleading because certificate demos and utility pages were mixed with public marketing content.

**How to apply:** Rebuild before auditing. Verify emitted headings and their actual source before editing; do not infer a defect from a matching string in a comment. Give legacy demo issues their own scope instead of silently changing their search visibility.

Treat typography and heading semantics as separate concerns. Preserve component styling and keyboard-focus behavior when changing heading levels, including hidden dialog content.

**Why:** The SEO/style audit required coherent visual sizes as well as a clear page outline; the credential dialog navigates to its stage headings, so semantic changes alone can break focus.

**How to apply:** Check CSS and interaction selectors along with markup. Validate responsive heading sizes and dialog navigation after retagging; retain a single primary page heading without treating sample credentials as separate page titles.

Inspect computed root font size and legacy important declarations before diagnosing responsive heading-size differences.

**Why:** Tablet styles use a smaller root font size, and an important legacy hero rule defeated newer, more specific heading styles. Repeating ordinary specificity changes did not affect the rendered H1.

**How to apply:** Measure actual pixels at tablet as well as desktop/phone widths. Resolve the important-rule conflict narrowly rather than applying global heading overrides.