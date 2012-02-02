describe 'Activity Interactions'

  before_each
    breadModel('clear');
    sparks.sectionController.reset();
    sparks.activityController.reset();
  end
  
  after_each
    $('#questions_area').remove();
    $('#breadboard').remove();
    sparks.debug = false;
    sparks.activityController.reset();
  end
  
  describe 'Submit buttons'
  
   it 'should be able to click submit and get to the next question'
   
     jsonSection = {
       "title": "woo",
       "pages": [
          {
            "questions": [
               {
                 "prompt": "Question 1",
                 "correct_answer": ""
               },
               {
                 "prompt": "Question 2",
                 "correct_answer": ""
               },
               {
                 "prompt": "Question 3",
                 "correct_answer": ""
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
     
     $forms = $questionsDiv.find('form');
     $forms.length.should.be 3
     
     $buttons = $questionsDiv.find(':button');
     $buttons.length.should.be 3
     
     $($buttons[0]).html().should.be "Submit"
     
     $($buttons[0]).attr('disabled').should.be false
     $($buttons[1]).attr('disabled').should.be true
     $($buttons[2]).attr('disabled').should.be true
     
     $($buttons[0]).click();
     
     $($buttons[0]).attr('disabled').should.be true
     $($buttons[1]).attr('disabled').should.be false
     $($buttons[2]).attr('disabled').should.be true
     
     $($buttons[1]).click();
     
     $($buttons[0]).attr('disabled').should.be true
     $($buttons[1]).attr('disabled').should.be true
     $($buttons[2]).attr('disabled').should.be false
     
    end
    
    it 'should show the page report after clicking the last submit'
    
      jsonSection = {
       "title": "woo",
       "pages": [
          {
            "questions": [
               {
                 "prompt": "Question 1",
                 "correct_answer": ""
               },
               {
                 "prompt": "Question 2",
                 "correct_answer": ""
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
     
     $questionsDiv.find('.inner-questions').should.be_visible
     $questionsDiv.find('.report').length.should.be 0

     $buttons = $questionsDiv.find(':button');
     $($buttons[0]).click();
     $questionsDiv.find('.report').length.should.be 0
     $($buttons[1]).click();
     
     $questionsDiv.find('.inner-questions').should.not.be_visible
     $questionsDiv.find('.report').length.should.be 1
    
    end
    
  end
  
  describe 'Repeating Pages'
  
    it 'should allow user to repeat a page'
    
      jsonSection = {
       "title": "woo",
       "pages": [
          {
            "questions": [
               {
                 "prompt": "Question 1",
                 "correct_answer": ""
               },
               {
                 "prompt": "Question 2",
                 "correct_answer": ""
               }
             ]
          },
          {
            "questions": [
               {
                 "prompt": "Question 1",
                 "correct_answer": ""
               },
               {
                 "prompt": "Question 2",
                 "correct_answer": ""
               },
               {
                  "prompt": "Question 3",
                  "correct_answer": ""
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
     
     $questionsDiv.find('.inner-questions').should.be_visible
     $questionsDiv.find('.report').length.should.be 0

     $buttons = $questionsDiv.find(':button');
     $($buttons[0]).click();
     $($buttons[1]).click();
     
     $questionsDiv.find('.inner-questions').should.not.be_visible
     $questionsDiv.find('.report').length.should.be 1
     
     var $reportButtons = $questionsDiv.find('.report').find(':button');
     var $repeat = $($reportButtons[0]);
     
     $repeat.html().should.be "Repeat"
     
     $repeat.click();
     
     $questionsDiv.find('.inner-questions').should.be_visible
     $questionsDiv.find('.report').length.should.be 0
     
     $questionsDiv.find('form').length.should.be 2
      
    end
    
    it 'should clear question answers when a page is repeated'
    
      jsonSection = {
       "title": "woo",
       "pages": [
          {
            "questions": [
               {
                 "prompt": "Question 1",
                 "correct_answer": ""
               },
               {
                 "prompt": "Question 2",
                 "correct_answer": ""
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
     
     $questionsDiv.find('input').val("test");
     
     $($questionsDiv.find('input')[0]).val().should.be "test"

     $buttons = $questionsDiv.find(':button');
     $($buttons[0]).click();
     $($buttons[1]).click();
     var $reportButtons = $questionsDiv.find('.report').find(':button');
     var $repeat = $($reportButtons[0]);
     
     $repeat.click();
     
     $($questionsDiv.find('input')[0]).val().should.be ""
      
    end
    
    it 'should reset circuit when a page is repeated'
    
      jsonSection = {
       "title": "woo",
       "circuit": [
          {
            "type": "resistor",
            "UID": "r1",
            "connections": "b2,b3"
          },
          {
             "type": "resistor",
             "UID": "r2",
             "connections": "b3,b4"
           }
       ],
       "pages": [
          {
            "questions": [
               {
                 "prompt": "Question 1",
                 "correct_answer": ""
               },
               {
                 "prompt": "Question 2",
                 "correct_answer": ""
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
     
     var components = getBreadBoard().components;
     console.log("components.r1 = "+components.r1);
       console.log("components.r2 = "+components.r2);
     var res1 = components.r1.resistance;
     var res2 = components.r2.resistance;
     console.log("res1 = "+res1);
     console.log("res2 = "+res2);

     $buttons = $questionsDiv.find(':button');
     $($buttons[0]).click();
     $($buttons[1]).click();
     var $reportButtons = $questionsDiv.find('.report').find(':button');
     var $repeat = $($reportButtons[0]);
     $repeat.click();
     
     var components = getBreadBoard().components;
     console.log("components.r1 = "+components.r1);
      console.log("components.r2 = "+components.r2);
     var bothResistorsAreTheSame = (components.r1.resistance === res1) && (components.r2.resistance === res2)
     
     bothResistorsAreTheSame.should.not.be true
     
     var newres1 = components.r1.resistance;
     var newres2 = components.r2.resistance;
     
    end
  
  end
  
  
  describe 'Circuits and Questions'
    
    it 'should record circuit metadata when a user clicks submit'
    
      jsonSection = {
       "title": "woo",
       "circuit": [
          {
            "type": "function generator",
            "UID": "source",
            "frequencies": [1000, 2000],
            "amplitude": 100
          },
          {
            "type": "resistor",
            "UID": "r1",
            "connections": "b2,b3"
          }
       ],
       "pages": [
          {
            "questions": [
               {
                 "prompt": "Question 1",
                 "correct_answer": ""
               },
               {
                  "prompt": "Question 2",
                  "correct_answer": ""
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
     
     var components = getBreadBoard().components;
  
     $submitButtons = $questionsDiv.find(':button');
     $($submitButtons[0]).click();
     
     getBreadBoard().components.source.setFrequency(2000);
     getBreadBoard().components.source.setAmplitude(50);
     
     $($submitButtons[1]).click();
     
     var section = sparks.activityController.currentSection;
     
     section.pages[0].questions[0].meta.should.not.be null
     section.pages[0].questions[0].meta.frequency.should.be 1000
     section.pages[0].questions[0].meta.amplitude.should.be 100
     
     section.pages[0].questions[1].meta.frequency.should.be 2000
     section.pages[0].questions[1].meta.amplitude.should.be 50
    end
    
    it 'should record circuit metadata in all subquestions when a user clicks submit'
    
      jsonSection = {
       "title": "woo",
       "circuit": [
          {
            "type": "function generator",
            "UID": "source",
            "frequencies": [1000, 2000],
            "amplitude": 100
          },
          {
            "type": "resistor",
            "UID": "r1",
            "connections": "b2,b3"
          }
       ],
       "pages": [
          {
            "questions": [
               {
                 "prompt": "Question 1",
                 "subquestions": [
                  {
                    "prompt": "Question 1a",
                    "correct_answer": ""
                  },
                  {
                    "prompt": "Question 1b",
                    "correct_answer": ""
                  }
                 ]
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
     
     var components = getBreadBoard().components;
  
     $submitButtons = $questionsDiv.find(':button');
     
     getBreadBoard().components.source.setFrequency(2000);
      
     $($submitButtons[0]).click();
     
     var section = sparks.activityController.currentSection;
     
     section.pages[0].questions[0].meta.should.not.be null
     section.pages[0].questions[0].meta.frequency.should.be 2000
     
     section.pages[0].questions[1].meta.should.not.be null
     section.pages[0].questions[1].meta.frequency.should.be 2000
    end
  end

end
