---
name: Mobile homepage overlap cascade
description: Mobile homepage spacing and carousel rules must explicitly override legacy responsive declarations.
---

At mobile breakpoints, legacy responsive overrides can use `!important` to apply negative section margins and grid layouts. New mobile composition rules need to neutralize those declarations explicitly, especially around adjacent logo/statistics sections and horizontal card rows.

**Why:** The homepage statistics strip was pulled into the logo section by legacy negative margins, and the credential maturity carousel stayed a grid because an older grid declaration won the cascade.

**How to apply:** When changing the homepage mobile layout, inspect `enterprise-overrides.css` before adding rules to `mobile-ux.css`; use narrowly scoped `!important` only where the existing cascade requires it, then verify settled screenshots at 320px and 390px.

Shared mobile rules loaded from the document head must also out-specificity any component base styles emitted later in an inline `<style>` block. Scope migrated component rules beneath their stable section ancestor rather than relying on stylesheet order.

**Why:** A shared Product Details mobile rule with the same selector specificity as its inline base style was overwritten because the inline style appears later in the document.

**How to apply:** For a component that retains inline desktop CSS, use its section ID or unique section class as an ancestor for each migrated responsive selector; confirm that no equal-specificity base rule follows it in rendered HTML.