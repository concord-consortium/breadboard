require 'rack/reverse_proxy'

use Rack::ReverseProxy do
  # Set :preserve_host to true globally (default is true already)
  reverse_proxy_options :preserve_host => true

  reverse_proxy /^\/couchdb\/learnerdata(\/.*)$/, 'http://couchdb.cosmos.concord.org/sparks_data$1'
  reverse_proxy /^\/couchdb\/activities(\/.*)$/, 'http://couchdb.cosmos.concord.org/sparks$1'

end

use Rack::ContentLength

app = Rack::Directory.new Dir.pwd
run app
