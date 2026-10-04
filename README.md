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

Run the image regression suite before publishing image or responsive CSS changes:

```sh
npm run test:images
```

This is included in `npm test`. It keeps the Ruby source-dimension assertions
and adds a browser check of the homepage, higher-education illustrations/logos,
and representative blog thumbnails (the capped read-more card and first six
listing cards) at 1440px and 390px. By default it builds a fresh Jekyll site
in a temporary directory and serves only that output. To check a running preview:

```sh
IMAGE_TEST_BASE_URL="https://$REPLIT_DEV_DOMAIN" npm run test:image-proportions
```

The test uses system Chromium (`which chromium`, or `CHROMIUM_PATH`), with
temporary browser cache/config outside the workspace. It decodes lazy images,
uses the selected resource's unrounded dimensions for `srcset` images, subtracts
border/padding from content boxes, and exempts intentional `contain`, `cover`,
and `scale-down` fits. It checks positive intrinsic width/height attributes without
removing them. Mobile higher-education illustrations and accompanying text are
checked after scrolling and allowing reveal animations to settle.

Failures exit nonzero and identify the URL, viewport, selector, image, rendered
dimensions, and selected-source dimensions. Full results (including crop
exemptions) go to `/tmp/certifyme-image-proportions.json`; set `IMAGE_TEST_REPORT`
to choose another path. The tolerance is 2% relative ratio error plus more than
one CSS pixel of height error; smaller differences are layout noise.

The fixture guard runs automatically. To run it alone or prove nonzero exit on
the deliberately squeezed fixture (HTML dimensions retained, CSS width only):

```sh
node scripts/validate-image-proportions.cjs --self-test
node scripts/validate-image-proportions.cjs --fixture-squeezed # expected exit 1
```
