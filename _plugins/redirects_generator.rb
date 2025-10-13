Jekyll::Hooks.register :site, :post_read do |site|
  credential_pages = site.collections['certificate-templates'].docs
  credential_pages.each do |page|
    old_url = page.url.sub('certificate-templates', 'credential-templates')
    site.pages << Jekyll::PageWithoutAFile.new(site, site.source, old_url, 'index.html').tap do |p|
      p.data['layout'] = nil
      p.data['redirect_to'] = [page.url]
    end
  end
end
