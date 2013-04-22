require 'rack/reverse_proxy'

use Rack::ReverseProxy do
  # Set :preserve_host to true globally (default is true already)
  reverse_proxy_options :preserve_host => true

  reverse_proxy /^\/sparks-activities(\/.*)$/, 'http://concord-consortium.github.io/sparks-activities$1'

end

use Rack::ContentLength

app = Rack::Directory.new Dir.pwd
run app
