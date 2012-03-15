describe 'Authored Scripts'

  before_each
    breadModel('clear');
    sparks.sectionController.reset();
    sparks.activityController.reset();
  end
  
  describe 'Question Answers'

      it 'should be able to use scripts to define correct answers'

        var jsonSection =
          {
            "circuit": [
              {
                 "type": "resistor",
                 "UID": "r1",
                 "connections": "b2,b3",
                 "colors": ["orange","black","brown","gold"]
               }
            ],
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
          var section = sparks.activityController.currentSection;
          
          section.pages[0].questions.length.should.be 2
          section.pages[0].questions[0].correct_answer.should.be "R1 is small"
          section.pages[0].questions[1].correct_answer.should.be "R1 is 300"
      end
      
      it 'should be able to store script variables across scripts'

        var jsonSection =
          {
            "circuit": [
              {
                 "type": "resistor",
                 "UID": "r1",
                 "connections": "b2,b3",
                 "colors": ["orange","black","brown","gold"]
               }
            ],
            "pages":[
              {
                "questions": [
                  {
                    "prompt": "What is the resistance of R1?",
                    "correct_answer": "[sparks.vars.a = 10/2; sparks.vars.a]",
                    "correct_units": "ohms"
                  },
                  {
                    "prompt": "What is the resistance of R1?",
                    "correct_answer": "[sparks.vars.a]",
                    "correct_units": "ohms"
                  }
                ]
              }
            ]
          };
          
          var ac = new sparks.ActivityConstructor(jsonSection);
          var section = sparks.activityController.currentSection;
          
          section.pages[0].questions[0].correct_answer.should.be 5
          section.pages[0].questions[1].correct_answer.should.be 5
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
       var section = sparks.activityController.currentSection;
       
       section.pages[0].questions[0].answer = "10"
       section.pages[0].questions[1].answer = "500"
       
       $.each(section.pages[0].questions, function(i, question){
         sparks.questionController.gradeQuestion(question);
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
           "circuit": [
             {
                "type": "resistor",
                "UID": "r1",
                "resistance": "100",
                "connections": "b2,b3"
              },
              {
                  "type": "resistor",
                  "UID": "r2",
                  "resistance": "200",
                  "connections": "b3,b4"
              }
            ],
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
       var section = sparks.activityController.currentSection;
       sparks.sectionController.loadCurrentSection();
       
       section.pages[0].questions[0].answer = "100"
       section.pages[0].questions[1].answer = "500"
       
       $.each(section.pages[0].questions, function(i, question){
         sparks.questionController.gradeQuestion(question);
       });
       
       section.pages[0].questions[0].answerIsCorrect.should.be true
       section.pages[0].questions[0].points_earned.should.be 5
       section.pages[0].questions[1].answerIsCorrect.should.be false
       section.pages[0].questions[1].points_earned.should.be 0
     end
     
     it 'should be able to find faults from within a script'
     
       breadModel('insertComponent', 'resistor', {"UID": "r1", "resistance": "100"});
       breadModel('insertComponent', 'resistor', {"UID": "r2", "resistance": "200", "open": true});
       var jsonSection =
         {
           "circuit": [
              {
                 "type": "resistor",
                 "UID": "r1",
                 "resistance": "100",
                 "connections": "b2,b3"
               },
               {
                   "type": "resistor",
                   "UID": "r2",
                   "resistance": "200",
                   "open": true,
                   "connections": "b3,b4"
               }
             ],
           "pages":[
             {
               "questions": [
                 {
                     "prompt": "Which resistor is faulty?",
                     "points": 5,
                     "scoring": "if (question.answer == breadboard.getFault().UID) {question.points_earned = 5}"
                 },
                 {
                     "prompt": "List the faulty resistors in the feedback...",
                     "points": 5,
                     "scoring": "question.feedback = breadboard.getFaults()[0].UID"
                 }
               ]
             }
           ]
         };
         
       var ac = new sparks.ActivityConstructor(jsonSection);
       var section = sparks.activityController.currentSection;
       sparks.sectionController.loadCurrentSection();
       
       section.pages[0].questions[0].answer = "r2"
       
       $.each(section.pages[0].questions, function(i, question){
         sparks.questionController.gradeQuestion(question);
       });
       
       section.pages[0].questions[0].answerIsCorrect.should.be true
       section.pages[0].questions[0].points_earned.should.be 5
       section.pages[0].questions[1].answerIsCorrect.should.be false
       section.pages[0].questions[1].feedback.should.be "r2"
     end
     
   end
   
   describe 'Before-Question Scripts'
   
      before_each
        breadModel('clear');
        sparks.sectionController.reset();
        sparks.activityController.reset();
      end

       it 'should be able to run a script when a question is enabled'

         var jsonSection =
           {
             "circuit": [
               {
                  "type": "resistor",
                  "UID": "r1",
                  "connections": "b2,b3"
                }
             ],
             "pages":[
               {
                 "questions": [
                   {
                     "prompt": "What is the resistance of R1?",
                     "beforeScript": "sparks.vars.test = 'a'"
                   },
                   {
                     "prompt": "What is the resistance of R2?",
                     "beforeScript": "sparks.vars.test = 'b'"
                   }
                 ]
               }
             ]
           };

            var $breadboardDiv = $("<div>").attr('id','breadboard');
            var $questionsDiv = $("<div>").attr('id','questions_area');
            $(document.body).append($breadboardDiv);
            $(document.body).append($questionsDiv);

            var ac = new sparks.ActivityConstructor(jsonSection);
            sparks.activity.view.layoutCurrentSection();
            
            sparks.vars.test.should.be "a"

            $buttons = $questionsDiv.find(':button');
            $($buttons[0]).click();
            
            sparks.vars.test.should.be "b"
       end
    end
 
end
