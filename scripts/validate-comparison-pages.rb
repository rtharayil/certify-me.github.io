#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"
require "open3"
require "pathname"

ROOT = Pathname.new(__dir__).join("..").realpath
SITE_DIR = ROOT.join("_site")
CANONICAL_ORIGIN = "https://www.certifyme.online"
REQUIRED_RESOURCE_LINKS = [
  "/digital-credential-maturity/",
  "/blog/certifyme-open-badge-3-0-certified",
  "/blog/digital-credentialing-platforms-2026-comparison",
  "/blog/What-is-Digital-Credential-Management-Platform",
  "/digital-badges"
].freeze

def fail_with(errors)
  warn "\nComparison page validation failed:"
  errors.each { |error| warn "  - #{error}" }
  exit 1
end

def comparison_posts
  Dir[ROOT.join("_blog", "*.md").to_s].filter_map do |path|
    contents = File.read(path, encoding: "UTF-8")
    next unless contents.match?(/\A---\s*\n.*?^comparison_page:\s*true\s*$/m)

    Pathname.new(path)
  end
end

def build_site
  puts "Building Jekyll site..."
  stdout, stderr, status = Open3.capture3(
    "bundle", "exec", "jekyll", "build", "--destination", SITE_DIR.to_s,
    chdir: ROOT.to_s
  )
  print stdout unless stdout.empty?
  warn stderr unless stderr.empty?
  return if status.success?

  warn "Jekyll build exited with status #{status.exitstatus}."
  exit status.exitstatus || 1
end

def output_path_for(post)
  SITE_DIR.join("blog", "#{post.basename(".md")}.html")
end

def canonical_url(html, page_name, errors)
  match = html.match(%r{<link\s+rel=(['"])canonical\1\s+href=(['"])(.*?)\2}i)
  if match.nil?
    errors << "#{page_name}: no canonical URL was rendered"
    return nil
  end

  url = match[3]
  unless url.start_with?(CANONICAL_ORIGIN)
    errors << "#{page_name}: canonical URL must use #{CANONICAL_ORIGIN}"
  end
  url
end

def json_ld_graphs(html, page_name, errors)
  blocks = html.scan(
    %r{<script\b[^>]*\btype=(['"])application/ld\+json\1[^>]*>(.*?)</script>}im
  ).map(&:last)

  if blocks.empty?
    errors << "#{page_name}: no JSON-LD script was rendered"
    return []
  end

  blocks.filter_map do |block|
    JSON.parse(block)
  rescue JSON::ParserError => error
    errors << "#{page_name}: invalid JSON-LD (#{error.message})"
    nil
  end.flat_map { |data| data.fetch("@graph", [data]) }
end

def node_with_type(graph, type)
  graph.find do |node|
    node_type = node["@type"]
    Array(node_type).include?(type)
  end
end

def id_reference(node, property)
  value = node[property]
  value.is_a?(Hash) ? value["@id"] : nil
end

def validate_schema(graph, page_name, page_url, errors)
  expected = {
    "BlogPosting" => "#{page_url}#article",
    "WebPage" => "#{page_url}#webpage",
    "BreadcrumbList" => "#{page_url}#breadcrumb"
  }
  nodes = expected.transform_values { |id| graph.find { |node| node["@id"] == id } }

  expected.each do |type, id|
    node = nodes[type]
    if node.nil?
      errors << "#{page_name}: missing #{type} with @id #{id}"
    elsif !Array(node["@type"]).include?(type)
      errors << "#{page_name}: #{id} is not a #{type}"
    end
  end

  article = nodes["BlogPosting"] || node_with_type(graph, "BlogPosting")
  webpage = nodes["WebPage"] || node_with_type(graph, "WebPage")
  breadcrumb = nodes["BreadcrumbList"] || node_with_type(graph, "BreadcrumbList")

  if article && id_reference(article, "mainEntityOfPage") != expected["WebPage"]
    errors << "#{page_name}: BlogPosting mainEntityOfPage must reference #{expected["WebPage"]}"
  end
  if webpage && id_reference(webpage, "mainEntity") != expected["BlogPosting"]
    errors << "#{page_name}: WebPage mainEntity must reference #{expected["BlogPosting"]}"
  end
  if webpage && id_reference(webpage, "breadcrumb") != expected["BreadcrumbList"]
    errors << "#{page_name}: WebPage breadcrumb must reference #{expected["BreadcrumbList"]}"
  end
  return unless breadcrumb

  items = breadcrumb["itemListElement"]
  unless items.is_a?(Array) && items.length >= 3
    errors << "#{page_name}: BreadcrumbList must contain Home, Blog, and the current page"
    return
  end

  unless items.last["item"] == page_url
    errors << "#{page_name}: BreadcrumbList final item must reference #{page_url}"
  end
end

def validate_resources(html, page_name, errors)
  REQUIRED_RESOURCE_LINKS.each do |href|
    unless html.match?(%r{<a\b[^>]*\bhref=(['"])#{Regexp.escape(href)}\1}i)
      errors << "#{page_name}: missing internal comparison resource link #{href}"
    end
  end
end

def validate_table_contract(html, page_name, errors)
  unless html.match?(%r{<link\b[^>]*\bhref=(['"])/assets4/css/comparison-layer\.css\1}i)
    errors << "#{page_name}: comparison stylesheet is not loaded"
  end

  unless html.match?(%r{<div\b[^>]*\bclass=(['"])[^'"]*\bcp-table-wrap\b[^'"]*\1[^>]*\brole=(['"])region\2[^>]*\btabindex=(['"])0\3}i)
    errors << "#{page_name}: static comparison table must have a keyboard-focusable scroll wrapper"
  end

  wrapper_script = %r{
    document\.querySelectorAll\('\.single-post-txt\ table'\).*?
    wrapper\.className\s*=\s*'cp-article-table-wrap';.*?
    wrapper\.setAttribute\('role',\s*'region'\);.*?
    wrapper\.setAttribute\('tabindex',\s*'0'\);
  }mx
  unless html.match?(wrapper_script)
    errors << "#{page_name}: article comparison tables are not wrapped in a keyboard-focusable scroll region"
  end
end

def validate_css(errors)
  css_path = ROOT.join("assets4/css/comparison-layer.css")
  css = File.read(css_path, encoding: "UTF-8")

  unless css.match?(/\.cp-table-wrap\s*,\s*\.cp-article-table-wrap\s*\{[^}]*overflow-x:\s*auto;/m)
    errors << "comparison-layer.css: table wrappers must retain overflow-x: auto"
  end
  unless css.match?(/\.cp-table-wrap:focus-visible\s*,\s*\.cp-article-table-wrap:focus-visible\s*\{/m)
    errors << "comparison-layer.css: table wrappers must retain visible keyboard focus styling"
  end
  unless css.match?(/@media\s*\(\s*max-width:\s*767px\s*\).*?\.cp-scroll-hint\s*\{\s*display:\s*block;/m)
    errors << "comparison-layer.css: mobile comparison-table scroll guidance is missing"
  end
end

build_site
posts = comparison_posts
errors = []

if posts.empty?
  errors << "No posts with comparison_page: true were found in _blog"
end

posts.each do |post|
  page_name = post.basename.to_s
  output_path = output_path_for(post)
  unless output_path.file?
    errors << "#{page_name}: expected generated page #{output_path.relative_path_from(ROOT)} was not found"
    next
  end

  html = File.read(output_path, encoding: "UTF-8")
  page_url = canonical_url(html, page_name, errors)
  graph = json_ld_graphs(html, page_name, errors)

  validate_schema(graph, page_name, page_url, errors) if page_url && !graph.empty?
  validate_resources(html, page_name, errors)
  validate_table_contract(html, page_name, errors)
end

validate_css(errors)
fail_with(errors) unless errors.empty?

puts "Comparison page validation passed for #{posts.length} page#{posts.length == 1 ? "" : "s"}."