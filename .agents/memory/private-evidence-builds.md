---
name: Private evidence and Jekyll builds
description: Protect confidential evidence from public build output and stale generated copies.
---

Treat confidential evidence uploads as analysis input, not publishable website assets. Excluding an input directory is insufficient if stale copies remain in a served build destination.

**Why:** A restricted-use audit report remained accessible from generated output after an exclusion was added; a reader selecting zero new files did not prove that old files were no longer served.

**How to apply:** Preserve original uploads, exclude their directory from website builds, remove only stale generated copies when necessary, and verify the actual HTTP response for private-file routes after rebuilding. Keep raw extracted pages and sensitive text in temporary or excluded analysis locations.

Use harmless synthetic fixtures for upload-exposure regression checks, never the actual confidential evidence.

**Why:** The owner explicitly requires original uploads to be preserved and the confidential SOC report not to be used as a test fixture.

**How to apply:** Isolate test source, caches, output, and server processes in temporary directories; test stale output and skipped-build startup as well as fresh builds.

Ad-hoc Python package installation in a Ruby/Jekyll project can scaffold an unrelated Python application and alter system dependencies even when installation fails.

**Why:** The package installer initialized application files before failing on its Python environment during document analysis.

**How to apply:** Inspect and reconcile installer changes; keep analysis tools separate from application dependencies. Do not leave an unrelated application scaffold or changed run setup merely to process evidence.