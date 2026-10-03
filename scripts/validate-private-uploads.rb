#!/usr/bin/env ruby
# frozen_string_literal: true

require "digest"
require "fileutils"
require "net/http"
require "open3"
require "pathname"
require "socket"
require "timeout"
require "tmpdir"
require "yaml"

module PrivateUploadValidation
  ROOT = Pathname.new(__dir__).join("..").realpath
  FIXTURES = {
    "synthetic-evidence.pdf" => "Harmless synthetic evidence, not a real report.\n",
    "nested/synthetic image.png" => "Harmless synthetic image fixture.\n",
    "synthetic-page.md" => "---\nlayout: null\n---\nSynthetic private page.\n",
    "index.html" => "Synthetic private directory index.\n"
  }.freeze
  PUBLIC_BODY = "Public upload-regression control page.\n"

  def self.assert(condition, message)
    raise message unless condition
  end

  def self.command(source, destination, *args)
    ["bundle", "exec", "jekyll", *args, "--source", source,
     "--destination", destination, "--config", File.join(source, "_config.yml")]
  end

  def self.run!(*args)
    stdout, stderr, status = Open3.capture3(*args, chdir: ROOT.to_s)
    assert(status.success?, "Jekyll command failed:\n#{stdout}\n#{stderr}")
  end

  def self.reject!(source, destination, expected)
    stdout, stderr, status = Open3.capture3(
      *command(source, destination, "build"), chdir: ROOT.to_s
    )
    assert(!status.success? && "#{stdout}\n#{stderr}".include?(expected),
           "Unsafe configuration did not fail with #{expected.inspect}")
  end

  def self.seed(destination)
    FIXTURES.each do |name, body|
      path = File.join(destination, "attached_assets", name)
      FileUtils.mkdir_p(File.dirname(path))
      File.write(path, body)
    end
    # A previously rendered Markdown upload also needs to disappear.
    File.write(File.join(destination, "attached_assets", "synthetic-page.html"), "Stale private page.")
  end

  def self.assert_output(destination)
    assert(!File.exist?(File.join(destination, "attached_assets")), "Generated uploads remain in #{destination}")
    assert(File.read(File.join(destination, "index.html")) == PUBLIC_BODY, "Public output changed")
  end

  def self.response(port, route)
    Net::HTTP.start("127.0.0.1", port, nil, nil, nil, nil,
                    open_timeout: 1, read_timeout: 2) do |http|
      http.get(route)
    end
  end

  def self.check_http(source, destination, label, skip_build:)
    socket = TCPServer.new("127.0.0.1", 0)
    port = socket.addr[1]
    socket.close
    args = command(source, destination, "serve", "--host", "127.0.0.1",
                   "--port", port.to_s, "--no-watch")
    args << "--skip-initial-build" if skip_build
    log_path = File.join(source, "server.log")
    pid = nil
    File.open(log_path, "w") do |log|
      pid = Process.spawn(*args, chdir: ROOT.to_s, out: log, err: log, pgroup: true)
      begin
        Timeout.timeout(30) do
          loop do
            begin
              public_response = response(port, "/")
              assert(public_response.code == "200" && public_response.body == PUBLIC_BODY,
                     "#{label}: public control did not return the expected HTTP 200")
              break
            rescue Errno::ECONNREFUSED, Errno::ECONNRESET
              assert(Process.waitpid(pid, Process::WNOHANG).nil?, "#{label}: server exited early")
              sleep 0.1
            end
          end
        end
        routes = FIXTURES.keys.map { |name| "/attached_assets/#{name.gsub(' ', '%20')}" }
        routes += ["/attached_assets", "/attached_assets/", "/attached_assets/synthetic-page.html",
                   "/%61ttached_assets/synthetic-evidence.pdf"]
        routes.each do |route|
          result = response(port, route)
          assert(result.code == "404", "#{label}: #{route} returned HTTP #{result.code}, expected 404")
        end
        assert_output(destination)
        puts "PASS #{label}: public HTTP 200; all #{routes.length} upload routes HTTP 404"
      rescue StandardError => error
        raise "#{error.message}\nServer log:\n#{File.read(log_path)}"
      ensure
        if pid
          begin
            Process.kill("TERM", -pid)
            Timeout.timeout(5) { Process.wait(pid) }
          rescue Errno::ESRCH, Errno::ECHILD
            # The failed server has already exited.
          rescue Timeout::Error
            Process.kill("KILL", -pid)
            Process.wait(pid)
          end
        end
      end
    end
  end

  def self.main
    Dir.mktmpdir("private-upload-regression-") do |temp|
      source = File.join(temp, "source")
      destination = File.join(temp, "public")
      FileUtils.mkdir_p(File.join(source, "_plugins"))
      FileUtils.cp(ROOT.join("_plugins/private_uploads.rb"), File.join(source, "_plugins"))
      # Use the website's actual configuration, never its original uploads.
      FileUtils.cp(ROOT.join("_config.yml"), File.join(source, "_config.yml"))
      File.write(File.join(source, "index.html"), PUBLIC_BODY)
      seed(source)
      original_hashes = Dir.glob("#{source}/attached_assets/**/*").select { |path| File.file?(path) }
                           .to_h { |path| [path, Digest::SHA256.file(path).hexdigest] }

      run!(*command(source, destination, "build"))
      assert_output(destination)
      check_http(source, destination, "fresh build", skip_build: true)

      seed(destination)
      run!(*command(source, destination, "build"))
      assert_output(destination)
      check_http(source, destination, "cached rebuild", skip_build: true)

      # Exercise metadata/cache reuse and explicitly retained stale output.
      File.open(File.join(source, "_config.yml"), "a") { |file| file.puts "\nkeep_files: [attached_assets]" }
      run!(*command(source, destination, "build", "--incremental"))
      seed(destination)
      run!(*command(source, destination, "build", "--incremental"))
      assert_output(destination)
      check_http(source, destination, "incremental cached rebuild", skip_build: true)

      seed(destination)
      check_http(source, destination, "cached server startup (skip initial build)", skip_build: true)
      seed(destination)
      check_http(source, destination, "normal server startup", skip_build: false)

      # A generated symlink must be unlinked, never followed into original inputs.
      File.symlink(File.join(source, "attached_assets"), File.join(destination, "attached_assets"))
      check_http(source, destination, "symlinked stale output startup", skip_build: true)

      # Fail closed rather than allowing cleanup to reach the originals through
      # an unsafe destination, including a destination symlink.
      reject!(source, File.join(source, "attached_assets", "build"), "unsafe build destination")
      unsafe_destination = File.join(temp, "unsafe-public")
      File.symlink(File.join(source, "attached_assets"), unsafe_destination)
      reject!(source, unsafe_destination, "unsafe build destination")
      puts "PASS unsafe destinations rejected without touching original inputs"

      config_path = File.join(source, "_config.yml")
      config = YAML.load_file(config_path)
      config["exclude"].delete("attached_assets")
      File.write(config_path, YAML.dump(config))
      reject!(source, destination, "must remain excluded")
      puts "PASS removal of the upload exclusion fails closed"

      original_hashes.each do |path, hash|
        assert(File.file?(path) && Digest::SHA256.file(path).hexdigest == hash, "Synthetic original was altered: #{path}")
      end
      puts "PASS original synthetic uploads preserved; real uploads never read or modified"
    end
  end
end

begin
  PrivateUploadValidation.main
rescue StandardError => error
  warn "Private upload validation failed: #{error.message}"
  exit 1
end