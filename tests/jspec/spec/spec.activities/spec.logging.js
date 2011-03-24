describe 'Logging'

  before_each
    breadModel('clear');
    sparks.sparksSectionController = new sparks.SparksSectionController();
    sparks.sparksReportController = new sparks.SparksReportController();
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
