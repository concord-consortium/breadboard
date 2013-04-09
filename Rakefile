require 'rubygems'
require 'sprockets'

desc "Default: combine:all"
task :default => [:"combine:all"]

namespace :combine do

  @load_path = [ 'lib', 'app' ]

  desc "Do all combine tasks"
  task :all => [
    :'client:breadboard_activity'
  ]

  namespace :client do

    desc "Concatenate all JavaScript for breadboard activity (client)"
    task :breadboard_activity do
      sprocket([
          'app/init.js'
        ],
        'client-breadboard-activity.js')
    end

  end

  def sprocket(source_files, target)
    secretary = Sprockets::Secretary.new(
      :source_files => source_files,
      :load_path => @load_path
    )
    secretary.concatenation.save_to(target)
  end

end
