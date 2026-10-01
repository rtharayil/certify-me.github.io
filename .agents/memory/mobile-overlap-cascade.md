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

When a compact mobile layout seems to require tiny text, inspect computed container spacing from the host page before reducing typography.

**Why:** Host footer styling added unnecessary top padding to the walkthrough's bottom bar despite its component stylesheet specifying compact spacing. Shrinking progress labels and narrative text concealed the space problem instead of fixing it.

**How to apply:** Verify the integrated page, not only an isolated component. Inspect computed padding and the winning cascade, neutralize host rules narrowly, and preserve readable text while testing expanded menus between sticky header and footer.

Check opening-state readability immediately after the dialog appears, not only after delayed screenshots.

**Why:** A delayed opening scroll produced correct later screenshots while initially leaving the heading and opening paragraph behind the compact phone footer.

**How to apply:** Finish scroll resets and focus placement before revealing the narrative in the next frame. Verify both the initial reading position and the settled layout against the actual sticky boundaries.