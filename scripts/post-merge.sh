#!/usr/bin/env bash
# Fast, idempotent setup for changes merged from task agents.
set -euo pipefail

if [[ -f Gemfile ]]; then
  bundle check >/dev/null || bundle install --quiet
fi

bundle exec jekyll build