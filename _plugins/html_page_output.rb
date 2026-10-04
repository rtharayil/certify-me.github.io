# frozen_string_literal: true

# An extensionless source otherwise produces an octet-stream download. Opt-in
# pages retain their permalink but write conventional .html output, which the
# existing server can serve with the correct MIME type.
Jekyll::Hooks.register :pages, :post_init do |page|
  page.ext = ".html" if page.data["html_output"] == true && page.ext.empty?
end