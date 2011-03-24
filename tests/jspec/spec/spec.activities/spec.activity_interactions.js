describe 'Activity Interactions'

  before_each
    breadModel('clear');
  end
  
  after_each
    $('#questions_area').remove();
    $('#breadboard').remove();
    sparks.debug = false;
  end
  
  describe 'Submit buttons'
  
   it 'should be able to click submit and get to the next question'
   
     sparks.debug = true;
     sparks.jsonSection = {
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
     
     stub(sparks.util, 'readCookie').and_return(null);
     
     init();
     
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
    
      sparks.debug = true;
      sparks.jsonSection = {
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

     stub(sparks.util, 'readCookie').and_return(null);

     init();
     
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
    
      sparks.debug = true;
      sparks.jsonSection = {
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

     stub(sparks.util, 'readCookie').and_return(null);

     init();
     
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
    
      sparks.debug = true;
      sparks.jsonSection = {
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

     stub(sparks.util, 'readCookie').and_return(null);

     init();
     
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
    
      sparks.debug = true;
      sparks.jsonSection = {
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

     stub(sparks.util, 'readCookie').and_return(null);

     init();
     
     var components = getBreadBoard().components;
     
     var res1 = components.r1.resistance;
     var res2 = components.r2.resistance;

     $buttons = $questionsDiv.find(':button');
     $($buttons[0]).click();
     $($buttons[1]).click();
     var $reportButtons = $questionsDiv.find('.report').find(':button');
     var $repeat = $($reportButtons[0]);
     $repeat.click();
     
     var components = getBreadBoard().components;
     var bothResistorsAreTheSame = (components.r1.resistance === res1) && (components.r2.resistance === res2)
     
     bothResistorsAreTheSame.should.not.be true
     
    var newres1 = components.r1.resistance;
    var newres2 = components.r2.resistance;
      
     
      
    end
  
  end

end
