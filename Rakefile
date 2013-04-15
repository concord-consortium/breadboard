require 'rubygems'
require 'sprockets'

sprockets = Sprockets::Environment.new
sprockets.append_path 'lib'
sprockets.append_path 'app'

task :default do
  assets = sprockets.find_asset("init.js")
  assets.write_to "client-breadboard-activity.js"
end
