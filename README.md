# CertifyMe marketing site 
 
## Validation

Run the comparison-page regression suite before publishing updates to comparison
articles:

```sh
bundle exec ruby scripts/validate-comparison-pages.rb
```

The command performs a fresh Jekyll build, then verifies the comparison pages'
JSON-LD relationships, shared internal resource links, and accessible responsive
table behavior.
