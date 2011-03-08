describe 'Activity Pages'

  before_each
    breadModel('clear');
  end
  
  after_each
    $('#questions_area').remove();
    $('#breadboard').remove();
  end
  
  describe 'Page creation'
  
    // for more circuit creation examples, see spec.circuit_constructor
    it 'should be able to create a page with one question'
      var jsonActivity =
        {
          "pages": [
             {
               "questions": [
                 {
                   "prompt": "What is the resistance of R1?",
                   "correct_answer": "100",
                   "correct_units": "V"
                 }
               ]
             }
          ]
        };
  
        var ac = new sparks.ActivityConstructor(jsonActivity);
        
        sparks.sparksActivity.should.not.be undefined
        
        sparks.sparksActivity.pages.length.should.be 1
        sparks.sparksActivity.pages[0].questions.length.should.be 1
        
        sparks.sparksActivity.pages[0].questions[0].prompt.should.be "What is the resistance of R1?"
    end
    
    it 'should be able to create multiple pages with questions'
      var jsonActivity =
        {
          "pages": [
             {
               "questions": [
                 {
                   "prompt": "What is the resistance of R1?",
                   "correct_answer": "100",
                   "correct_units": "V"
                 },
                 {
                    "prompt": "What is the resistance of R2?",
                    "correct_answer": "100",
                    "correct_units": "V"
                  }
               ]
             },
             {
                "questions": [
                  {
                    "prompt": "What is the resistance of R3?",
                    "correct_answer": "100",
                    "correct_units": "V"
                  }
                ]
              }
          ]
        };
  
        var ac = new sparks.ActivityConstructor(jsonActivity);
        
        sparks.sparksActivity.should.not.be undefined
        
        sparks.sparksActivity.pages.length.should.be 2
        sparks.sparksActivity.pages[0].questions.length.should.be 2
        sparks.sparksActivity.pages[1].questions.length.should.be 1
        
        sparks.assessment.questions.length.should.be 3
        
        sparks.assessment.questions[2].should.be sparks.sparksActivity.pages[1].questions[0]
    end
    
    
  end
  
  describe "Page displaying"
  
    it "should start by displaying page 1"
      var jsonActivity =
        {
          "pages": [
            {
              "questions":[
                {
                  "prompt": "Set 1 Question 1",
                  "correct_answer": ""
                },
                {
                  "prompt": "Set 1 Question 2",
                  "correct_answer": ""
                }
              ]
            },
            {
              "questions":[
                {
                  "prompt": "Set 1 Question 1",
                  "correct_answer": ""
                },
                {
                  "prompt": "Set 1 Question 2",
                  "correct_answer": ""
                }
              ]
            }
          ]
      };
    
      var $questionsDiv = $("<div>");
      
      var ac = new sparks.ActivityConstructor(jsonActivity);
      ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
      ac.layoutActivity();
    
      var $forms = $questionsDiv.find('form');
      $forms.length.should.be 2
      
      $($forms[0]).find('.prompt')[0].innerHTML.should.be "1.  Set 1 Question 1"
      $($forms[1]).find('.prompt')[0].innerHTML.should.be "2.  Set 1 Question 2"
      
      $($($forms[0]).parent()[0]).should.be_visible();
      $($($forms[1]).parent()[0]).should.be_visible();
    end
  
    it "should be able to display authored text"
      var jsonActivity =
        {
          "pages": [
            {
              "questions":[
                {
                  "prompt": "Set 1 Question 1",
                  "correct_answer": ""
                },
                {
                  "prompt": "Set 1 Question 2",
                  "correct_answer": ""
                }
              ],
              "notes": "Answer the questions"
            },
            {
              "questions":[
                {
                  "prompt": "Set 1 Question 1",
                  "correct_answer": ""
                },
                {
                  "prompt": "Set 1 Question 2",
                  "correct_answer": ""
                }
              ]
            }
          ]
      };
  
      var $questionsDiv = $("<div>");
    
      var ac = new sparks.ActivityConstructor(jsonActivity);
      ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
      ac.layoutActivity();
    
      var $notes = $questionsDiv.find('.notes');
    
      $notes.html().should.be("Answer the questions");
    end
  end

end
