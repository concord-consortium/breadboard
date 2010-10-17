require 'rubygems'
require 'sprockets'

desc "Default: combine:all" 
task :default => [:"combine:all"]

namespace :combine do

  @load_path = [ 'lib', 'common/javascript' ]
    
  desc "Do all combine tasks"
  task :all => [
    :'client:measuring_resistance_activity',
    :'client:measuring_resistance_report',
    :'client:series_measuring_activity',
    :'server:measuring_resistance_report'
  ]

  namespace :client do
    
    desc "Concatenate all JavaScript for Measuring Resistance activity (client)"
    task :measuring_resistance_activity do
      sprocket([
          'activities/measuring-resistance/javascript/activity.js'
        ],
        'client-mr-activity.js')
    end
    
    desc "Concatenate all JavaScript for Measuring Resistance report (client)"
    task :measuring_resistance_report do
      sprocket([
          'activities/measuring-resistance/javascript/assessment/learner-session-report.js'
        ],
        'client-mr-report.js')
    end

    desc "Concatenate all JavaScript for Series - Measuring activity (client)"
    task :series_measuring_activity do
      sprocket([
          'activities/module-2/series-measuring/js/activity.js'
        ],
        'client-series-measuring-activity.js')
    end
    
    desc "Concatenate all JavaScript for Parallel - Measuring activity (client)"
    task :series_measuring_activity do
      sprocket([
          'activities/module-2/series-measuring/js/activity-parallel.js'
        ],
        'client-parallel-measuring-activity.js')
    end

  end

  namespace :server do
    
    desc "Concatenate all JavaScript for Measuring Resistance report (server)"
    task :measuring_resistance_report do
      sprocket([
          'activities/measuring-resistance/javascript/assessment/grader.js'
        ],
        'server-mr-report.js')
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
