# frozen_string_literal: true

require "fileutils"
require "pathname"

# Exclusion prevents new copies; this also removes output left by older builds,
# including when `jekyll serve --skip-initial-build` serves a cached destination.
module PrivateUploads
  DIRECTORY = "attached_assets"

  def self.protect(site)
    unless Array(site.exclude).include?(DIRECTORY)
      raise Jekyll::Errors::FatalException, "#{DIRECTORY} must remain excluded from public builds."
    end

    source = File.realpath(site.source)
    # Resolve existing ancestors as well as the destination itself, so a symlink
    # cannot make cleanup reach the source uploads.
    destination = Pathname.new(site.dest)
    suffix = []
    until destination.exist? || destination.symlink?
      suffix.unshift(destination.basename.to_s)
      destination = destination.parent
    end
    destination = File.join(destination.realpath.to_s, *suffix)
    uploads = File.join(source, DIRECTORY)
    uploads = File.realpath(uploads) if File.exist?(uploads)
    if destination == source || source.start_with?("#{destination}/") ||
       destination == uploads || destination.start_with?("#{uploads}/")
      raise Jekyll::Errors::FatalException, "Refusing upload cleanup in an unsafe build destination."
    end

    generated = File.join(destination, DIRECTORY)
    # rm_r unlinks a top-level symlink rather than traversing it. Only the
    # generated directory is removed; original uploads are never opened.
    FileUtils.rm_r(generated) if File.exist?(generated) || File.symlink?(generated)
  end
end

Jekyll::Hooks.register :site, :after_init do |site|
  PrivateUploads.protect(site)
end

Jekyll::Hooks.register :site, :after_reset do |site|
  PrivateUploads.protect(site)
end