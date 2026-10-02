---
name: CertifyMe SEO verification
description: Audit rendered schema rather than historical counts, and preserve plugin dependencies when deferring scripts.
---

Audit the freshly built, rendered homepage before accepting historical schema counts or source-only reports. Multiple JSON-LD blocks are not automatically duplicate or conflicting entities.

**Why:** Historical notes and an explorer report described obsolete homepage ratings and FAQ claims that were absent from the emitted homepage. Shared templates can also retain non-homepage schema inside a conditional branch.

**How to apply:** Build once after the coherent edit batch, parse the emitted JSON-LD, inspect resolved entity IDs and visible-content correspondence, and distinguish valid Schema.org description from eligibility for a Google rich result. Do not infer live rankings or citation visibility from local validation.

Load jQuery plugins before scripts that register ready callbacks using those plugins when converting synchronous footer scripts to deferred scripts.

**Why:** With deferred scripts, jQuery can observe an interactive document and run a ready callback before a later plugin has finished loading. The previously synchronous ordering then produced a real validation-plugin runtime error.

**How to apply:** Review dependencies, not only script counts; test delayed loading and runtime errors after deferral. Preserve unrelated pages' loading behavior when the requested scope is homepage-only.
