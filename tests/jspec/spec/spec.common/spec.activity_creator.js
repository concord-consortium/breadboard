describe 'Activity Creator'

  before_each
    breadModel('clear');
  end
  
  after_each
    $('#questions_area').remove();
    $('#breadboard').remove();
  end
  
  describe 'Circuit creation'
  
    // for more circuit creation examples, see spec.circuit_constructor
    it 'should be able to create a circuit'
      var jsonActivity =
        {
          "circuit": [
             {
               "type": "resistor",
               "connections": "b2,b3"
             }
          ]
        };
  
      var ac = new sparks.ActivityConstructor(jsonActivity);
      ac.createBreadboard();
  
      var board = getBreadBoard();
      var netlist = sparks.circuit.qucsator.makeNetlist(board);
      netlist.search(/R:resistor.* L2 L3/).should.be_at_least 0
    end
  end
  
  describe 'Question creation'

      // for more question creation examples, see spec.questions
      it 'should be able to create a simple question'
        var jsonActivity =
          {
            "questions": [
              {
                "prompt": "What is the resistance of R1?",
                "correct_answer": "100",
                "correct_units": "V"
              }
            ]
          };
      
          var assessment = new sparks.Activity.Assessment();
      
          assessment.questions.length.should.be 0
      
          var ac = new sparks.ActivityConstructor(jsonActivity, assessment);
          ac.createAndLayoutActivity();
      
          assessment.questions.length.should.be 1
          assessment.questions[0].prompt.should.be "What is the resistance of R1?"
          assessment.questions[0].correct_answer.should.be 100
          assessment.questions[0].correct_units.should.be "V"
      end
      
  end
  
  describe 'Activity creation'
  
    it 'should be able to create a circuit and calculate an answer'
      
      var jsonActivity =
        {
          "circuit": [
            {
              "type": "resistor",
              "UID": "r3",
              "connections": "b2,b3",
              "resistance": "100"
            },
            {
              "type": "resistor",
              "UID": "r4",
              "connections": "b2,b3",
              "resistance": "200" 
            }
          ],
          "questions": [
            {
              "prompt": "What is the total resistance across R1 and R2?",
              "correct_answer": "[${r3.resistance} + ${r4.resistance}]",
              "correct_units": "ohms"
            }
          ]
        };
    
        var assessment = new sparks.Activity.Assessment();
    
        var ac = new sparks.ActivityConstructor(jsonActivity, assessment);
        ac.createAndLayoutActivity();
    
        assessment.questions.length.should.be 1
        assessment.questions[0].correct_answer.should.be 300
        
    end
    
    it 'should be able to embed questions into an activity'
    
      var jsonActivity =
        {
          "questions": [
            {
              "prompt": "What is the resistance of R1?",
              "correct_answer": "100",
              "correct_units": "ohms"
            },
            {
              "prompt": "What question is this?",
              "correct_answer": "2"
            }
          ]
      };
      
      var $questionsDiv = $("<div>");
        
      var assessment = new sparks.Activity.Assessment();
      
      var ac = new sparks.ActivityConstructor(jsonActivity, assessment);
      ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
      
      ac.createAndLayoutActivity($questionsDiv);
      
      var $forms = $questionsDiv.find('form');
      
      $forms.length.should.be 2
      
      $forms.each(function(i, val){
        $(val).find('.prompt').length.should.be 1
        
        if (i === 0){
          $(val).find('.prompt')[0].innerHTML.should.be "1.  What is the resistance of R1?"
        } else {
            $(val).find('.prompt')[0].innerHTML.should.be "2.  What question is this?"
        }
        
        $(val).find('input').length.should.be 1
        
        if (i === 0){
          $(val).find('select').length.should.be 1
          $(val).find('select').find('option').length.should.be 10
        } else {
          $(val).find('select').length.should.be 0
        }
        
        $(val).find('button').length.should.be 1
        $(val).find('button')[0].innerHTML.should.be "Submit"
        
      })
      
    end
    
    it 'should be able to embed nested questions in an activity'
      var jsonActivity =
        {
          "questions": [
            {
              "prompt": "What is the rated resistance of",
              "subquestions": [
                {
                  "prompt": "R<sub>1</sub>:",
                  "correct_answer": "100",
                  "correct_units": "ohms"
                },
                {
                  "prompt": "R<sub>2</sub>:",
                  "correct_answer": "200",
                  "correct_units": "ohms"
                }
              ]
            },
            {
              "prompt": "What is the voltage across R1?",
              "correct_answer": "100",
              "correct_units": "V"
            }
          ]
        };
        
        var $questionsDiv = $("<div>");
    
        var assessment = new sparks.Activity.Assessment();
        var ac = new sparks.ActivityConstructor(jsonActivity, assessment);
        ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
        ac.createAndLayoutActivity();
        
        var $forms = $questionsDiv.find('form');

        $forms.length.should.be 2
        
        $nested = $($forms[0]);
        
        $($forms[0]).children('.prompt').length.should.be 1
        $($forms[0]).children('.prompt')[0].innerHTML.should.be "1.  What is the rated resistance of"
        
        $nested = $($($forms[0]).find('div')[0]);
        
        $nested.find('.prompt').length.should.be 2
        $nested.find('input').length.should.be 2
        $nested.find('select').length.should.be 2
        
        $nested.find('.prompt')[0].innerHTML.should.be "R<sub>1</sub>:"
        $nested.find('.prompt')[1].innerHTML.should.be "R<sub>2</sub>:"
        
        $($forms[0]).find('button').length.should.be 1
    end
    
    it 'should be able to embed multichoice questions into an activity'
    
      var jsonActivity =
        {
          "questions": [
            {
              "prompt": "What is the resistance of R1?",
              "correct_answer": "100",
              "correct_units": "ohms",
              "multichoice": ["100", "200"]
            }
          ]
      };
      
      var $questionsDiv = $("<div>");
        
      var assessment = new sparks.Activity.Assessment();
      var ac = new sparks.ActivityConstructor(jsonActivity, assessment);
      ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
      ac.createAndLayoutActivity();
      
      var $forms = $questionsDiv.find('form');
      var $question = $($forms[0]);
      
      
      $question.find('select').length.should.be 2
      var $select = $($question.find('select')[0])
      $select.find('option').length.should.be 2
      $select.find('option')[0].innerHTML.should.be "100"
      $select.find('option')[1].innerHTML.should.be "200"
      
    end
    
    it 'should be able to embed checkbox and radio multichoice questions into an activity'
    
      var jsonActivity =
        {
          "questions": [
            {
              "prompt": "What is the resistance of R1?",
              "correct_answer": "1",
              "correct_units": "ohms",
              "multichoice": ["0", "1", "2"],
              "checkbox": "true"
            },
            {
              "prompt": "What is the resistance of R1?",
              "correct_answer": "100",
              "correct_units": "ohms",
              "multichoice": ["0", "100", "200", "300"],
              "radio": "true"
            },
            {
              "prompt": "What is the resistance of R1?",
              "correct_answer": "100",
              "correct_units": "ohms",
              "multichoice": ["0", "100", "200", "300"],
              "radio": "true"
            }
          ]
      };
      
      var $questionsDiv = $("<div>");
        
      var assessment = new sparks.Activity.Assessment();
      var ac = new sparks.ActivityConstructor(jsonActivity, assessment);
      ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
      ac.createAndLayoutActivity();
      
      var $forms = $questionsDiv.find('form');
      var $question = $($forms[0]);
      
      
      $question.find('input').length.should.be 3
      
      var checkGroupName = $($question.find('input')[0]).attr('name');
      checkGroupName.length.should.be_greater_than 0
      
      $question.find('input').each(function(i, val){
        $val = $(val);
        $val.attr("type").should.be "checkbox"
        $val.attr("name").should.be checkGroupName
        $val.attr("value").should.be ""+i
        $val.next().html().should.be " "+i
      });
      
      $question = $($forms[1]);
      
      var radioGroupName = $($question.find('input')[0]).attr('name');
      radioGroupName.should.not.be checkGroupName
      
      $question.find('input').length.should.be 4
      $question.find('input').each(function(i, val){
        $val = $(val);
        $val.attr("type").should.be "radio"
        $val.attr("name").should.be radioGroupName
        $val.attr("value").should.be ""+(i*100)
        $val.next().html().should.be " "+(i*100)
      });
      
      $question = $($forms[2]);
      
      var radioGroupName2 = $($question.find('input')[0]).attr('name');
      radioGroupName2.should.not.be checkGroupName
      radioGroupName2.should.not.be radioGroupName
      
    end
    
    it 'should be able to embed multichoice questions into an activity with calculated distrators'
    
      var jsonActivity =
        {
          "circuit": [
            {
              "type": "resistor",
              "UID": "r5",
              "connections": "b2,b3",
              "resistance": "100"
            },
            {
              "type": "resistor",
              "UID": "r6",
              "connections": "b2,b3",
              "resistance": "200" 
            }
          ],
          "questions": [
            {
              "prompt": "What is the resistance of R1?",
              "correct_answer": "100",
              "correct_units": "ohms",
              "multichoice": ["[${r5.resistance}]", "[${r5.resistance}/2]"]
            }
          ]
      };
      
      var $questionsDiv = $("<div>");
        
      var assessment = new sparks.Activity.Assessment();
      var ac = new sparks.ActivityConstructor(jsonActivity, assessment);
      ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
      ac.createAndLayoutActivity();
      
      var $forms = $questionsDiv.find('form');
      var $question = $($forms[0]);
      
      
      $question.find('select').length.should.be 2
      var $select = $($question.find('select')[0])
      $select.find('option').length.should.be 2
      $select.find('option')[0].innerHTML.should.be "100"
      $select.find('option')[1].innerHTML.should.be "50"
      
    end
    
    it 'should be able to embed calculated multichoice questions correctly conveted to engineering'
    
      var jsonActivity =
        {
          "circuit": [
            {
              "type": "resistor",
              "UID": "r7",
              "connections": "b2,b3",
              "resistance": "1000"
            }
          ],
          "questions": [
            {
              "prompt": "What is the resistance of R1?",
              "correct_answer": "[${r7.resistance}] ohms",
              "multichoice": ["[${r7.resistance}] ohms", "[${r7.resistance}/10] ohms", "0.1 V"]
            }
          ]
      };
    
      var $questionsDiv = $("<div>");
      
      var assessment = new sparks.Activity.Assessment();
      var ac = new sparks.ActivityConstructor(jsonActivity, assessment);
      ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
      ac.createAndLayoutActivity();
    
      var $forms = $questionsDiv.find('form');
      var $question = $($forms[0]);
    
    
      $question.find('select').length.should.be 1
      var $select = $($question.find('select')[0])
      $select.find('option').length.should.be 3
    
      function getHTML(string) {
        return $('<div>'+string+"</div>").html();
      }
    
      $select.find('option')[0].innerHTML.should.be getHTML("1 k&#x2126;")
      $select.find('option')[1].innerHTML.should.be getHTML("100 &#x2126;")
      $select.find('option')[2].innerHTML.should.be getHTML("100 mV")
      
    end
    
    it 'should be able to embed questions with images'
    
      var jsonActivity =
        {
          "questions": [
            {
              "image": "http://test.com/test.jpg",
              "prompt": "What is this image?",
              "correct_answer": "A test"
            }
          ]
      };
      
      var $questionsDiv = $("<div>");
        
      var assessment = new sparks.Activity.Assessment();
      var ac = new sparks.ActivityConstructor(jsonActivity, assessment);
      ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
      ac.createAndLayoutActivity();
      
      var $forms = $questionsDiv.find('form');
      var $question = $($forms[0]);
      
      $question.find('img').length.should.be 1
      $($question.find('img')[0]).attr('src').should.be "http://test.com/test.jpg"
    end
    
    it 'should be able to embed questions with relative images'
    
      var jsonActivity =
        {
          "activity_url": "http://test.com/myActivity",
          "images_url": "http://test.com/images/myActivity",
          "questions": [
            {
              "image": "test.jpg",
              "prompt": "What is this image?",
              "correct_answer": "A test"
            }
          ]
      };
      
      var $questionsDiv = $("<div>");
        
      var assessment = new sparks.Activity.Assessment();
      var ac = new sparks.ActivityConstructor(jsonActivity, assessment);
      ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
      ac.createAndLayoutActivity();
      
      var $forms = $questionsDiv.find('form');
      var $question = $($forms[0]);
      
      $($question.find('img')[0]).attr('src').should.be "http://test.com/images/myActivity/test.jpg"
    end
    
    it 'should be able to embed images in main body of page'
    
      var jsonActivity =
        {
          "activity_url": "http://test.com/myActivity",
          "images_url": "http://test.com/images/myActivity",
          "image": "test.jpg"
      };
      
      var $imageDiv = $("<div>");
        
      var assessment = new sparks.Activity.Assessment();
      var ac = new sparks.ActivityConstructor(jsonActivity, assessment);
      ac.setEmbeddingTargets({$imageDiv: $imageDiv});
      ac.createAndLayoutActivity();
      
      var $img = $imageDiv.find('img');
      $img.length.should.be 1
      $($imageDiv.find('img')[0]).attr('src').should.be "http://test.com/images/myActivity/test.jpg"
    end
    
    it 'should be able to have questions and no breadboard'
    
      sparks.debug = true;
      sparks.jsonActivity = {
        "title": "woo",
        "questions": [
          {
            "prompt": "Any circuit here?",
            "correct_answer": "No!"
          }
        ]
      };
      
      var $breadboardDiv = $("<div>").attr('id','breadboard');
      var $questionsDiv = $("<div>").attr('id','questions_area');
      $(document.body).append($breadboardDiv);
      $(document.body).append($questionsDiv);
      
      stub(sparks.util, 'readCookie').and_return(null);
      
      init();
      
      $questionsDiv.find('form').length.should.be 1
      $("#breadboard").html().length.should.be 0
    end
    
    it 'should be able to include a flash breadboard'
    
    sparks.debug = true;
    sparks.jsonActivity = {
        "title": "woo",
        "circuit": [
          {
            "type": "resistor",
            "UID": "r5",
            "connections": "b2,b3",
            "resistance": "100"
          }
        ],
        "questions": [
          {
            "prompt": "Any circuit here?",
            "correct_answer": "Yes!"
          }
        ]
      };
      
      var $breadboardDiv = $("<div>").attr('id','breadboard');
      var $questionsDiv = $("<div>").attr('id','questions_area');
      $(document.body).append($breadboardDiv);
      $(document.body).append($questionsDiv);
      
      stub(sparks.util, 'readCookie').and_return(null);
      
      init();
      sparks.activity.onActivityReady();
      
      $questionsDiv.find('form').length.should.be 1
      $("#breadboard").html().length.should.be_greater_than 0
    end
      
  end
  
  describe 'Pagination'
  
    it 'should be able to display multiple pages of questions'
    
      var jsonActivity =
        {
          "activity_url": "http://test.com/myActivity",
          "images_url": "http://test.com/images/myActivity",
          "questions": [
            [
              {
                "prompt": "Set 1 Question 1",
                "correct_answer": ""
              },
              {
                "prompt": "Set 1 Question 2",
                "correct_answer": ""
              }
            ],
            [
              {
                "prompt": "Set 2 Question 1",
                "correct_answer": ""
              },
              {
                "prompt": "Set 2 Question 2",
                "correct_answer": ""
              }
            ]
          ]
      };
    
      var $questionsDiv = $("<div>");
      
      var assessment = new sparks.Activity.Assessment();
      var ac = new sparks.ActivityConstructor(jsonActivity, assessment);
      ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
      ac.createAndLayoutActivity();
    
      var $forms = $questionsDiv.find('form');
      $forms.length.should.be 4
      
      // sanity check
      $($forms[0]).find('.prompt')[0].innerHTML.should.be "1.  Set 1 Question 1"
      $($forms[3]).find('.prompt')[0].innerHTML.should.be "4.  Set 2 Question 2"
      
      $($($forms[0]).parent()[0]).should.be_visible();
      $($($forms[1]).parent()[0]).should.be_visible();
      $($($forms[2]).parent()[0]).should.be_hidden();
      $($($forms[3]).parent()[0]).should.be_hidden();
      
      
      var $next = $questionsDiv.find('.next-questions');
      $next.length.should.be 1
      
      $next.click();
      
      $($($forms[0]).parent()[0]).should.be_hidden();
      $($($forms[1]).parent()[0]).should.be_hidden();
      $($($forms[2]).parent()[0]).should.be_visible();
      $($($forms[3]).parent()[0]).should.be_visible();
      
      
    end
    
  end

end
