describe 'Activity Pages'

  before_each
    breadModel('clear');
    sparks.sparksSectionController.reset();
    sparks.sparksActivityController.reset();
  end
  
  after_each
    $('#questions_area').remove();
    $('#breadboard').remove();
  end
  
  describe 'Page creation'
  
    // for more circuit creation examples, see spec.circuit_constructor
    it 'should be able to create a page with one question'
      var jsonSection =
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
        
        var ac = new sparks.ActivityConstructor(jsonSection);
        
        sparks.sparksActivity.should.not.be undefined
        
        var section = sparks.sparksActivityController.currentSection;
        
        section.pages.length.should.be 1
        section.pages[0].questions.length.should.be 1
        
        section.pages[0].questions[0].prompt.should.be "What is the resistance of R1?"
    end
    
    it 'should be able to create multiple pages with questions'
      var jsonSection =
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
  
        var ac = new sparks.ActivityConstructor(jsonSection);
        
        sparks.sparksActivity.should.not.be undefined
        var section = sparks.sparksActivityController.currentSection;
        
        section.pages.length.should.be 2
        section.pages[0].questions.length.should.be 2
        section.pages[1].questions.length.should.be 1
    end
    
    
  end
  
  describe "Page displaying"
  
    it "should start by displaying page 1"
      var jsonSection =
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
      
      var ac = new sparks.ActivityConstructor(jsonSection);
      sparks.sparksActivity.view.setEmbeddingTargets({$questionsDiv: $questionsDiv});
      sparks.sparksActivity.view.layoutCurrentSection();
    
      var $forms = $questionsDiv.find('form');
      $forms.length.should.be 2
      
      $($forms[0]).find('.prompt')[0].innerHTML.should.be "1.  Set 1 Question 1"
      $($forms[1]).find('.prompt')[0].innerHTML.should.be "2.  Set 1 Question 2"
      
      $($($forms[0]).parent()[0]).should.be_visible();
      $($($forms[1]).parent()[0]).should.be_visible();
    end
  
    it "should be able to display authored text"
      var jsonSection =
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
    
      var ac = new sparks.ActivityConstructor(jsonSection);
      sparks.sparksActivity.view.setEmbeddingTargets({$questionsDiv: $questionsDiv});
      sparks.sparksActivity.view.layoutCurrentSection();
    
      var $notes = $questionsDiv.find('.notes');
    
      $notes.html().should.be("Answer the questions");
    end
  end

end
