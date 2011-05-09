describe 'Logging'

  before_each
    breadModel('clear');
    sparks.sparksSectionController = new sparks.SparksSectionController();
    sparks.sparksReportController = new sparks.SparksReportController();
  end
  
  describe 'Simple Logging'
  
    it "should be able to start and end a session"
      var activityLog = new sparks.Activity.ActivityLog();
    
      activityLog.beginSession();
    
      activityLog.currentSession().start_time.should.be_at_least 1
      activityLog.currentSession().end_time.should.be null
    
      activityLog.endSession();
    
      var startTime = activityLog.currentSession().start_time;
      activityLog.currentSession().end_time.should.be_at_least (startTime)
    end
  
    it "should be able to start a session and log some stuff"
      var activityLog = new sparks.Activity.ActivityLog();
    
      activityLog.beginSession();
      activityLog.setValue("resistor 1 resistance", 200);
      activityLog.log("connect", "probe_red", "a2");
    
      activityLog.sessions[0].properties["resistor 1 resistance"].should.be 200
      activityLog.sessions[0].events[0].name.should.be "connect"
      activityLog.sessions[0].events[0].value.should.be "probe_red|a2"
    end

      it 'should log when user clicks tutorial'
        var jsonSection =
          {
            "pages":[
              {
                "questions": [
                  {
                    "prompt": "What is the resistance of R1?",
                    "options": [
                        {
                            "option": "200",
                            "points": 0,
                            "feedback": "Wrong!",
                            "tutorial": "/example.html"
                        },
                        {
                            "option": "300",
                            "points": 5
                        }
                    ]
                  }
                ]
              }
            ]
          };

        var $questionsDiv = $("<div>");

        var ac = new sparks.ActivityConstructor(jsonSection);
        ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
        ac.layoutActivity();

        var $select = $questionsDiv.find('select');
        $select.val("200");
        $select.change();
        
        var section = sparks.sparksActivityController.currentSection;
        var sessionReport = sparks.sparksReportController.addNewSessionReport(section.pages[0]);
        var $report = sparks.sparksReport.view.getSessionReportView(sessionReport);
        var $trs = $report.find('tr');

        var $tds1 = $($trs[1]).find('td');
        $tds1[4].innerHTML.should.be("Wrong!<button>Tutorial</button>");
        $button = $($tds1[4]).find('button');
        $button.click();
        
        var log = sessionReport.log;
        var question = section.pages[0].questions[0];
        log.events.length.should.be 1
        log.events[0].name.should.be sparks.LogEvent.CLICKED_TUTORIAL
        log.events[0].value.should.be "/example.html"
        log.events[0].time.should.be_greater_than 0
      end
      
  end
 
end
