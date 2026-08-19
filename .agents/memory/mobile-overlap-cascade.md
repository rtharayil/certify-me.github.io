---
name: Mobile homepage overlap cascade
description: Mobile homepage spacing and carousel rules must explicitly override legacy responsive declarations.
---

At mobile breakpoints, legacy responsive overrides can use `!important` to apply negative section margins and grid layouts. New mobile composition rules need to neutralize those declarations explicitly, especially around adjacent logo/statistics sections and horizontal card rows.

**Why:** The homepage statistics strip was pulled into the logo section by legacy negative margins, and the credential maturity carousel stayed a grid because an older grid declaration won the cascade.

**How to apply:** When changing the homepage mobile layout, inspect `enterprise-overrides.css` before adding rules to `mobile-ux.css`; use narrowly scoped `!important` only where the existing cascade requires it, then verify settled screenshots at 320px and 390px.