---
name: Git history spans multiple eras
description: Plain `git log` can show a misleadingly narrow window; use --all to see the true full history when restoring or comparing against a past date.
---

On this project, `git log` (default, current branch/HEAD) only surfaced a handful of very recent days of commits, making the repo look like it had almost no history. `git log --all` revealed the real history goes back years (multiple prior authors/branches, imported history).

**Why:** Squash merges, branch imports, or checkpoint mechanics can leave the default `git log` view pointing at a short recent chain, while the full commit graph (with real historical authored dates) is only visible via `--all` (or explicitly walking known older commit hashes).

**How to apply:** When a user asks to restore, diff against, or match "how it was on [date]," always search with `git log --all --pretty=... --date=iso | grep <date>` before concluding a date doesn't exist in history. Don't trust the default `git log` output as the full picture of available history.
