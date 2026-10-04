# frozen_string_literal: true

require "cgi"
require "uri"

# Reserve the real aspect ratio of existing public artwork without resizing it,
# adding runtime dependencies, or reading private uploads.
module CertifyMeIntrinsicImages
  MEDIA_ROOTS = %w[assets/ assets4/ img/ images/].freeze
  SOF = [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].freeze
  EXTERNAL = {
    "https://openbadges.org/sites/default/files/assets/content/Graphic_Open%20Badges.png" => [646, 314]
  }.freeze

  def self.read_size(file)
    File.open(file, "rb") do |io|
      header = io.read(32)
      return nil unless header
      return header.byteslice(16, 8).unpack("NN") if header.start_with?("\x89PNG\r\n\x1a\n".b) && header.bytesize >= 24
      return header.byteslice(6, 4).unpack("vv") if header.start_with?("GIF87a", "GIF89a") && header.bytesize >= 10
      if header.start_with?("RIFF") && header.byteslice(8, 4) == "WEBP" && header.bytesize >= 30
        case header.byteslice(12, 4)
        when "VP8X"
          return [24, 27].map { |offset| header.getbyte(offset) + (header.getbyte(offset + 1) << 8) + (header.getbyte(offset + 2) << 16) + 1 }
        when "VP8 "
          return header.byteslice(26, 4).unpack("vv").map { |v| v & 0x3fff } if header.byteslice(23, 3) == "\x9d\x01\x2a".b
        when "VP8L"
          bits = header.byteslice(21, 4).unpack1("V")
          return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1] if header.getbyte(20) == 0x2f
        end
      end
      if header.start_with?("\xff\xd8".b)
        io.seek(2)
        until io.eof?
          next unless io.read(1)&.getbyte(0) == 0xff
          marker = io.read(1)&.getbyte(0)
          marker = io.read(1)&.getbyte(0) while marker == 0xff
          break unless marker
          next if marker == 0x00 || marker == 0xd8 || (0xd0..0xd7).cover?(marker)
          break if [0xd9, 0xda].include?(marker)
          length_bytes = io.read(2)
          break unless length_bytes&.bytesize == 2
          length = length_bytes.unpack1("n")
          break if length < 2
          if SOF.include?(marker)
            frame = io.read(5)
            return frame.byteslice(1, 4).unpack("nn").reverse if frame&.bytesize == 5
            break
          end
          io.seek(length - 2, IO::SEEK_CUR)
        end
      elsif File.extname(file).downcase == ".svg"
        io.rewind
        root = io.read(65_536)[/<svg\b[^>]*>/im]
        return nil unless root
        width = root[/\bwidth\s*=\s*["'](\d+(?:\.\d+)?)(?:px)?["']/i, 1]
        height = root[/\bheight\s*=\s*["'](\d+(?:\.\d+)?)(?:px)?["']/i, 1]
        return [width.to_f, height.to_f] if width && height
        viewbox = root[/\bviewBox\s*=\s*["']([^"']+)["']/i, 1]
        return viewbox.split(/[\s,]+/).map(&:to_f).last(2) if viewbox && viewbox.split(/[\s,]+/).size == 4
      end
    end
    nil
  end

  def self.attribute(tag, name)
    match = tag.match(/\s#{name}\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)
    match && (match[1] || match[2] || match[3])
  end

  def self.process(html, source)
    cache = {}
    html.gsub(/<img\b[^>]*>/im) do |original|
      src = attribute(original, "src")
      next original if !src || src.empty? || src.start_with?("#", "?")
      size = EXTERNAL[src]
      tag = original.dup
      unless size
        relative = URI::DEFAULT_PARSER.unescape(CGI.unescapeHTML(src).split(/[?#]/).first).sub(%r{\A/}, "")
        next original unless MEDIA_ROOTS.any? { |prefix| relative.start_with?(prefix) }
        root = File.realpath(source)
        file = File.expand_path(relative, root)
        next original unless file.start_with?(root + "/") && File.file?(file) && File.realpath(file).start_with?(root + "/")
        real_relative = File.realpath(file).delete_prefix(root + "/")
        next original unless MEDIA_ROOTS.any? { |prefix| real_relative.start_with?(prefix) }
        size = cache.fetch(file) { cache[file] = read_size(file) }
        # Public media live at the site root, including on trailing-slash pages.
        tag.sub!(/(\ssrc\s*=\s*["'])[^"']*(["'])/i) { "#{Regexp.last_match(1)}/#{src}#{Regexp.last_match(2)}" } unless src.start_with?("/")
      end
      next tag unless size && size.all? { |v| v && v.positive? }
      width = attribute(tag, "width")
      height = attribute(tag, "height")
      next tag if width && height
      next tag if (width && !width.match?(/\A\d+(?:\.\d+)?\z/)) || (height && !height.match?(/\A\d+(?:\.\d+)?\z/))
      w, h = size
      h = h * width.to_f / w if width
      w = w * height.to_f / h if height
      attrs = []
      attrs << %(width="#{[w.round, 1].max}") unless width
      attrs << %(height="#{[h.round, 1].max}") unless height
      tag.sub(/(\s*\/?>)\z/, " #{attrs.join(' ')}\\1")
    end
  end
end

Jekyll::Hooks.register [:pages, :documents], :post_render do |document|
  next unless document.output_ext == ".html"
  document.output = CertifyMeIntrinsicImages.process(document.output, document.site.source)
end