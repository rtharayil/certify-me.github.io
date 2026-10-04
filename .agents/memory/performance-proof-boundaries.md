---
name: Performance and hosting evidence boundaries
description: Distinguish canonical-host behavior, Replit deployment behavior, and local performance evidence.
---

Probe the canonical website and the published Replit host separately; publishing metadata identifies the Replit deployment, not necessarily the infrastructure serving the canonical host.

**Why:** The canonical host returned a missing-path redirect chain ending in HTTP 200 while the published Replit host returned a genuine 404. Compression/cache behavior also differed between hosts and preview.

**How to apply:** Obtain the published URL from deployment metadata, read the canonical origin from current project configuration, and label each host's evidence explicitly. A local benchmark or validated cache configuration does not verify delivery after publishing. Synthetic Event Timing observations are not field INP.