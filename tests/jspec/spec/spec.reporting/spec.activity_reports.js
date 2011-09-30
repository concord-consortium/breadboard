describe 'Activity Reports'

  before_each
    breadModel('clear');
    sparks.sparksActivityController.reset();
    sparks.sparksReportController = new sparks.SparksReportController();
    sparks.sparksSectionController.reset();
  end
  
  after_each
    sparks.sparksSectionController.reset();
    sparks.sparksActivityController.reset();
  end
  
  describe "Creating reports"
  
    it 'should be able to score a multi-section activity'
      var jsonActivity =
        {
          "type": "activity",
          "sections": [
            {
              "pages": [
                {
                  "questions": [
                    {
                      "prompt": "What is the resistance of R1?",
                      "correct_answer": "100",
                      "points": 1
                    },
                    {
                      "prompt": "What is the resistance of R2?",
                      "correct_answer": "200",
                      "points": 1
                    }
                  ]
                }
              ]
            },
            {
              "pages": [
                {
                  "questions": [
                    {
                      "prompt": "What is the resistance of R3?",
                      "correct_answer": "100",
                      "points": 1
                    },
                    {
                      "prompt": "What is the resistance of R4?",
                      "correct_answer": "200",
                      "points": 1
                    }
                  ]
                }
              ]
            }
          ]
        };
        
      var ac = new sparks.ActivityConstructor(jsonActivity);
      // answer "100" for every question and create reports
      var sections = sparks.sparksActivity.sections;
      for (var i = 0, ii = sections.length; i < ii; i++){
        var section = sections[i];
        sparks.sparksActivityController.currentSection = section;
        sparks.sparksSectionController.loadCurrentSection();
        for (var j = 0, jj = section.pages.length; j < jj; j++){
          var page = section.pages[j];
          for (var k = 0, kk = page.questions.length; k < kk; k++) {
            page.questions[k].answer = 100;
          }
          sparks.sparksReportController.addNewSessionReport(section.pages[j]);
        }
      }
      
      sections[0].pages[0].questions[0].answerIsCorrect.should.be true
      sections[0].pages[0].questions[0].points_earned.should.be 1
      sections[0].pages[0].questions[1].answerIsCorrect.should.be false
      sections[0].pages[0].questions[1].points_earned.should.be 0
      sections[1].pages[0].questions[0].answerIsCorrect.should.be true
      sections[1].pages[0].questions[0].points_earned.should.be 1
      sections[1].pages[0].questions[1].answerIsCorrect.should.be false
      sections[1].pages[0].questions[1].points_earned.should.be 0
    end
    
  end
 
end
