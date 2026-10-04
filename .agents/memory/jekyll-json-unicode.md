---
name: Jekyll JSON Unicode
description: Why valid JSON with escaped emoji surrogate pairs can fail in this site's data loader.
---

Generate Jekyll data JSON with literal UTF-8 Unicode rather than escaped UTF-16 surrogate pairs.

**Why:** This site's Jekyll data loader passes JSON through Ruby's YAML parser. A vendor heading containing an emoji produced valid JSON with a surrogate-pair escape, but the YAML parser rejected it as an invalid Unicode escape and stopped the build.

**How to apply:** When serializing fetched headings or other potentially non-BMP characters into Jekyll data, use UTF-8 output (for Python, `json.dumps(..., ensure_ascii=False)`). Check the actual Jekyll build, not JSON parsing alone. Ordinary excluded report JSON does not share the Jekyll loader constraint.