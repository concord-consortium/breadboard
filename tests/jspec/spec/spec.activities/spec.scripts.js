describe 'Authored Scripts'

  before_each
    breadModel('clear');
    sparks.sparksSectionController.reset();
    sparks.sparksActivityController.reset();
  end
  
  describe 'Question Answers'

      it 'should be able to use scripts to define distractors'
        breadModel('insertComponent', 'resistor', {"UID": "r1", "connections": "a1,a2", "colors": "orange,black,brown,gold"});

        var jsonSection =
          {
            "pages":[
              {
                "questions": [
                  {
                    "prompt": "What is the resistance of R1?",
                    "correct_answer": "[if (r1.nominalResistance < 500) {'R1 is small'} else {'R1 is big'}]",
                    "correct_units": "ohms"
                  },
                  {
                    "prompt": "What is the resistance of R1?",
                    "correct_answer": "[if (r1.nominalResistance != 300) {'R1 is not 300'} else {'R1 is 300'}]",
                    "correct_units": "ohms"
                  }
                ]
              }
            ]
          };

          var ac = new sparks.ActivityConstructor(jsonSection);
          var section = sparks.sparksActivityController.currentSection;

          section.pages[0].questions.length.should.be 2
          section.pages[0].questions[0].correct_answer.should.be "R1 is small"
          section.pages[0].questions[1].correct_answer.should.be "R1 is 300"
      end
      
  end
  
  describe 'Question Grading'
    it 'should be able to grade student answers using simple scripts'
      var jsonSection =
        {
          "pages":[
            {
              "questions": [
                {
                    "prompt": "What is the resistance of R1?",
                    "points": 5,
                    "scoring": "if (question.answer == 10) {question.points_earned = 5} else {question.points_earned = 0}"
                },
                {
                    "prompt": "What is the resistance of R2?",
                    "points": 5,
                    "scoring": "if (question.answer == 20) {question.points_earned = 5} else {question.points_earned = 3}"
                }
              ]
            }
          ]
        };
        
      var ac = new sparks.ActivityConstructor(jsonSection);
      var section = sparks.sparksActivityController.currentSection;
      
      section.pages[0].questions[0].answer = "10"
      section.pages[0].questions[1].answer = "500"
      
      $.each(section.pages[0].questions, function(i, question){
        sparks.sparksQuestionController.gradeQuestion(question);
      });
      
      section.pages[0].questions[0].answerIsCorrect.should.be true
      section.pages[0].questions[0].points_earned.should.be 5
      section.pages[0].questions[1].answerIsCorrect.should.be false
      section.pages[0].questions[1].points_earned.should.be 3
    end
    
    it 'should be able to grade student answers using scripts with circuit variables'
    
      breadModel('insertComponent', 'resistor', {"UID": "r1", "resistance": "100"});
      breadModel('insertComponent', 'resistor', {"UID": "r2", "resistance": "200"});
      var jsonSection =
        {
          "pages":[
            {
              "questions": [
                {
                    "prompt": "What is the resistance of R1?",
                    "points": 5,
                    "scoring": "if (question.answer == r1.resistance) {question.points_earned = 5} else {question.points_earned = 0}"
                },
                {
                    "prompt": "What is the resistance of R2?",
                    "points": 5,
                    "scoring": "if (question.answer == r2.resistance) {question.points_earned = 5} else {question.points_earned = 0}"
                }
              ]
            }
          ]
        };
        
      var ac = new sparks.ActivityConstructor(jsonSection);
      var section = sparks.sparksActivityController.currentSection;
      
      section.pages[0].questions[0].answer = "100"
      section.pages[0].questions[1].answer = "500"
      
      $.each(section.pages[0].questions, function(i, question){
        sparks.sparksQuestionController.gradeQuestion(question);
      });
      
      section.pages[0].questions[0].answerIsCorrect.should.be true
      section.pages[0].questions[0].points_earned.should.be 5
      section.pages[0].questions[1].answerIsCorrect.should.be false
      section.pages[0].questions[1].points_earned.should.be 0
    end
  end
 
end
