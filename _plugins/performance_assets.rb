# Measured asset substitutions only. Original media and CSS remain available.
require "cgi"
require "uri"

module CertifyMePerformanceAssets
  def self.process(html, mapping, page_url)
    output = html.gsub(/<link\b[^>]*>/im) do |tag|
      mapping.fetch("styles", {}).reduce(tag) do |value, (old, asset)|
        value.gsub(/(\bhref\s*=\s*["'])#{Regexp.escape(old)}(?:\?[^"']*)?(["'])/, "\\1#{asset['href']}\\2")
      end
    end
    output.gsub(/<img\b[^>]*>/im) do |tag|
      match = tag.match(/\bsrc\s*=\s*(["'])(.*?)\1/im)
      next tag unless match
      src = CGI.unescapeHTML(match[2])
      next tag if src.start_with?("data:", "http:", "https:", "//")
      begin
        path = URI::DEFAULT_PARSER.unescape(URI.join("https://local.invalid#{page_url}", URI::DEFAULT_PARSER.escape(src)).path)
      rescue URI::Error
        next tag
      end
      asset = mapping.fetch("images", {})[path]
      next tag unless asset
      # Existing responsive art has its own selection/crop contract.
      next tag if tag.match?(/\bsrcset\s*=/i)
      result = tag.sub(match[0], "src=\"#{asset['src']}\"")
      if asset["variants"]
        candidates = asset["variants"].map { |v| "#{v['src']} #{v['width']}w" }.join(", ")
        result.sub!(/\/?>\z/) { |end_tag| " srcset=\"#{candidates}\" sizes=\"(max-width: 767px) 94vw, (max-width: 1199px) 50vw, 960px\"#{end_tag}" }
        # Keep intentional custom sizes/crops. Update genuinely intrinsic dimensions.
        w = tag[/\bwidth\s*=\s*["'](\d+)["']/i, 1]&.to_i
        h = tag[/\bheight\s*=\s*["'](\d+)["']/i, 1]&.to_i
        if w == asset["original_width"] && h == asset["original_height"]
          result.sub!(/\bwidth\s*=\s*["']\d+["']/i, "width=\"#{asset['width']}\"")
          result.sub!(/\bheight\s*=\s*["']\d+["']/i, "height=\"#{asset['height']}\"")
        end
      end
      result
    end
  end
end

Jekyll::Hooks.register [:pages, :documents], :post_render do |page|
  next unless page.output_ext == ".html" && page.site.data["performance_assets"]
  page.output = CertifyMePerformanceAssets.process(page.output, page.site.data["performance_assets"], page.url)
end