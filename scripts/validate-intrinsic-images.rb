#!/usr/bin/env ruby
# frozen_string_literal: true
require "jekyll"
require "tmpdir"
require "fileutils"
require_relative "../_plugins/intrinsic_image_dimensions"

def assert(condition, message)
  raise message unless condition
end

Dir.mktmpdir("certifyme-image-dimensions") do |dir|
  FileUtils.mkdir_p(File.join(dir, "images"))
  png = "\x89PNG\r\n\x1a\n".b + "\x00\x00\x00\rIHDR".b + [640, 320].pack("NN")
  File.binwrite(File.join(dir, "images/sample.png"), png)
  File.write(File.join(dir, "images/sample.svg"), '<svg viewBox="0 0 120 60"></svg>')
  jpeg = "\xff\xd8\xff\xe0".b + [4].pack("n") + "OK" + "\xff\xc0".b + [7].pack("n") + [8, 320, 640].pack("Cnn") + "\xff\xd9".b
  File.binwrite(File.join(dir, "images/sample.jpg"), jpeg)
  File.binwrite(File.join(dir, "images/sample.webp"), "RIFF".b + [22].pack("V") + "WEBPVP8X" + [10].pack("V") + "\x00\x00\x00\x00".b + [0x7f, 0x02, 0, 0x3f, 0x01, 0].pack("C*"))
  %w[png jpg webp].each do |ext|
    assert(CertifyMeIntrinsicImages.read_size(File.join(dir, "images/sample.#{ext}")) == [640, 320], "#{ext} dimensions incorrect")
  end
  assert(CertifyMeIntrinsicImages.read_size(File.join(dir, "images/sample.svg")) == [120.0, 60.0], "SVG viewBox incorrect")
  output = CertifyMeIntrinsicImages.process('<img src="images/sample.png" class="existing" alt="Example">', dir)
  assert(output.include?('src="/images/sample.png"') && output.include?('width="640" height="320"') && output.include?('class="existing"'), "Dimensions/root address/class not preserved")
  scaled = CertifyMeIntrinsicImages.process('<img src="/images/sample.jpg" width="100">', dir)
  assert(scaled.include?('height="50"') && scaled.scan('width=').size == 1, "Existing width/aspect ratio not preserved")
  original = '<img src="/images/sample.png" width="80" height="80">'
  assert(CertifyMeIntrinsicImages.process(original, dir) == original, "Explicit dimensions changed")
  unsafe = '<img src="/images/../../private.png">'
  assert(CertifyMeIntrinsicImages.process(unsafe, dir) == unsafe, "Path traversal not rejected")
  FileUtils.mkdir_p(File.join(dir, "attached_assets"))
  File.binwrite(File.join(dir, "attached_assets/private.png"), png)
  private_traversal = '<img src="/images/../attached_assets/private.png">'
  assert(CertifyMeIntrinsicImages.process(private_traversal, dir) == private_traversal, "Private upload path traversed")
  File.symlink(File.join(dir, "attached_assets/private.png"), File.join(dir, "images/private.png"))
  private_symlink = '<img src="/images/private.png">'
  assert(CertifyMeIntrinsicImages.process(private_symlink, dir) == private_symlink, "Private upload symlink traversed")
  unknown = '<img src="https://example.com/not-verified.png">'
  assert(CertifyMeIntrinsicImages.process(unknown, dir) == unknown, "Unknown remote dimensions invented")
  ['', '#preview', '?placeholder'].each do |src|
    placeholder = %(<img src="#{src}">)
    assert(CertifyMeIntrinsicImages.process(placeholder, dir) == placeholder, "Empty/fragment placeholder changed")
  end
end
puts "PASS intrinsic PNG/JPEG/WebP/SVG dimensions, scaled dimensions, preserved attributes, root media paths and private-path/unknown-remote safeguards"