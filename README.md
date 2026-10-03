# CertifyMe marketing site 
 
## Validation

Run the confidential-upload build/serve regression check before publishing:

```sh
npm run test:private-uploads
```

This uses only harmless synthetic uploads in a temporary directory, using the
website's configuration and upload guard. It checks fresh, cached and incremental
builds, normal and skip-initial-build server startup, actual HTTP 404 responses,
and preservation of original fixture files. It never reads or modifies the
original `attached_assets` uploads. The check is also included in `npm test`.

Keep `attached_assets` excluded in `_config.yml`. The private-upload Jekyll plugin
removes only stale generated copies from the build destination before builds and
server startup, including startup with `--skip-initial-build`. Use the normal
Bundler/Jekyll commands (without `--safe`, which disables local plugins).

Run the comparison-page regression suite before publishing updates to comparison
articles:

```sh
bundle exec ruby scripts/validate-comparison-pages.rb
```

The command performs a fresh Jekyll build, then verifies the comparison pages'
JSON-LD relationships, shared internal resource links, and accessible responsive
table behavior.
