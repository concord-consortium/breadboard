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
      log.events.length.should.be 1
      log.events[0].name.should.be sparks.LogEvent.CLICKED_TUTORIAL
      log.events[0].value.should.be "/example.html"
      log.events[0].time.should.be_greater_than 0
    end
  end
  
  describe "Circuit logging"
  
    before_each
      stub(sparks.util, 'readCookie').and_return(null);
      // mock_request().and_return(sparks.jsonSection, 'application/javascript', 200)
      init();
      sparks.activity.onActivityReady();
      sparks.config.qucsate_server_url = "http://localhost:1234/sparks/qucsator/solve";
    end
    
    after_each
      breadModel('clear');
      receiveEvent('disconnect', 'probe|probe_black', 0);
      receiveEvent('disconnect', 'probe|probe_red', 0);
    end
    
    it "should log when a student makes a DMM measurement"
      
      breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
      
      var section = sparks.sparksActivityController.currentSection;
      var sessionReport = sparks.sparksReportController.addNewSessionReport(section.pages[0]);
      
      receiveEvent('connect', 'probe|probe_red|a1', 0);
      receiveEvent('connect', 'probe|probe_black|a2', 0);
      
      var log = sessionReport.log;
      log.events.length.should.be 1
      log.events[0].name.should.be sparks.LogEvent.DMM_MEASUREMENT
      
    end
    
    it "should log when a student makes or breaks a connection"
      
      breadModel('insertComponent', 'resistor', {"uid": "r1", "connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
      
      var section = sparks.sparksActivityController.currentSection;
      var sessionReport = sparks.sparksReportController.addNewSessionReport(section.pages[0]);
      
      receiveEvent('disconnect', 'component|r1|a1', 0);
      
      var log = sessionReport.log;
      log.events.length.should.be 1
      log.events[0].name.should.be sparks.LogEvent.CHANGED_CIRCUIT
      log.events[0].value.type.should.be "disconnect lead"
      log.events[0].value.location.should.be "a1"
      
      receiveEvent('connect', 'component|r1|a1', 0);
      
      log.events.length.should.be 2
      log.events[1].name.should.be sparks.LogEvent.CHANGED_CIRCUIT
      log.events[1].value.type.should.be "connect lead"
      log.events[1].value.location.should.be "a1"
      
    end
      
  end
 
end
