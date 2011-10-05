describe 'Logging'

  before_each
    breadModel('clear');
    sparks.sectionController = new sparks.SectionController();
    sparks.reportController = new sparks.ReportController();
  end
  
  describe 'Simple Logging'

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
      sparks.activity.view.setEmbeddingTargets({$questionsDiv: $questionsDiv});
      sparks.activity.view.layoutCurrentSection();

      var $select = $questionsDiv.find('select');
      $select.val("200");
      $select.change();
      
      var section = sparks.activityController.currentSection;
      var sessionReport = sparks.reportController.addNewSessionReport(section.pages[0]);
      var $report = sparks.report.view.getSessionReportView(sessionReport);
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
      sparks.activity.sections = [];
      stub(sparks.util, 'readCookie').and_return(null);
      mock_request().and_return(sparks.jsonSection, 'application/javascript', 200)
      sparks.config.qucsate_server_url = "http://localhost:1234/sparks/qucsator/solve";
      onDocumentReady();
      unmock_request();
    end
    
    after_each
      breadModel('clear');
    end
    
    it "should log when a student makes a DMM measurement"
      
      var section = sparks.activityController.currentSection;
      var sessionReport = sparks.reportController.addNewSessionReport(section.pages[0]);

      receiveEvent('connect', 'probe|probe_red|b23', 0);
      receiveEvent('connect', 'probe|probe_black|b17', 0);
      
      var log = sessionReport.log;
      log.events.length.should.be 1
      log.events[0].name.should.be sparks.LogEvent.DMM_MEASUREMENT
      
    end
    
    it "should log when a student makes or breaks a connection"
      
      var section = sparks.activityController.currentSection;
      var sessionReport = sparks.reportController.addNewSessionReport(section.pages[0]);
      console.log("DISCONNECT")
      receiveEvent('disconnect', 'component|r1|b23', 0);
      
      var log = sessionReport.log;
      log.events.length.should.be 1
      log.events[0].name.should.be sparks.LogEvent.CHANGED_CIRCUIT
      log.events[0].value.type.should.be "disconnect lead"
      log.events[0].value.location.should.be "b23"
      
      receiveEvent('connect', 'component|r1|b23', 0);
      
      log.events.length.should.be 2
      log.events[1].name.should.be sparks.LogEvent.CHANGED_CIRCUIT
      log.events[1].value.type.should.be "connect lead"
      log.events[1].value.location.should.be "b23"
      
    end
      
  end
 
end
