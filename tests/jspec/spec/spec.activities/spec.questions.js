describe 'Questions'

  before_each
    breadModel('clear');
  end
  
  describe 'Creation'

      it 'should be able to create a simple question'
        var jsonSection =
          {
            "pages":[
              {
                "questions": [
                  {
                    "prompt": "What is the resistance of R1?",
                    "correct_answer": "100",
                    "correct_units": "V"
                  },
                  {
                    "prompt": "What is your name?"
                  }
                ]
              }
            ]
          };
      
          
      
          var ac = new sparks.ActivityConstructor(jsonSection);
          
          sparks.sparksActivity.should.not.be undefined
          sparks.sparksActivity.pages.length.should.be 1
      
          sparks.sparksActivity.pages[0].questions.length.should.be 2
          sparks.sparksActivity.pages[0].questions[0].prompt.should.be "What is the resistance of R1?"
          sparks.sparksActivity.pages[0].questions[0].correct_answer.should.be 100
          sparks.sparksActivity.pages[0].questions[0].correct_units.should.be "V"
          
          sparks.sparksActivity.pages[0].questions[1].prompt.should.be "What is your name?"
          sparks.sparksActivity.pages[0].questions[1].correct_answer.should.be null
      end
      
      it 'should be able to create nested questions'
        var jsonSection =
          {
            "pages":[
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
              }
            ]
          };
      
          var ac = new sparks.ActivityConstructor(jsonSection);
          
          sparks.sparksActivity.pages[0].questions.length.should.be 3
          sparks.sparksActivity.pages[0].questions[0].prompt.should.be "R<sub>1</sub>:"
          sparks.sparksActivity.pages[0].questions[1].prompt.should.be "R<sub>2</sub>:"
          sparks.sparksActivity.pages[0].questions[2].prompt.should.be "What is the voltage across R1?"
      end
      
      it 'should be able to create a multichoice question'
        var jsonSection =
          {
            "pages":[
              {
                "questions": [
                  {
                    "prompt": "What is the resistance of R1?",
                    "correct_answer": "100",
                    "correct_units": "V"
                  },
                  {
                    "prompt": "What is the resistance of R1?",
                    "correct_answer": "100",
                    "correct_units": "V",
                    "options": ["100", "200"]
                  }
                ]
              }
            ]
          };
      
          var ac = new sparks.ActivityConstructor(jsonSection);
      
          sparks.sparksActivity.pages[0].questions.length.should.be 2
          
          sparks.sparksActivity.pages[0].questions[0].options.should.be null
          
          sparks.sparksActivity.pages[0].questions[1].options.should.not.be null
          sparks.sparksActivity.pages[0].questions[1].options.length.should.be 2
          sparks.sparksActivity.pages[0].questions[1].options[0].should.be "100"
          sparks.sparksActivity.pages[0].questions[1].options[1].should.be "200"
      end
      
      it 'should be able to create a multichoice question with points and feedback'
        var jsonSection =
          {
            "pages":[
              {
                "questions": [
                    {
                        "prompt": "What is the resistance of R1?",
                        "options": [
                            {
                                "option": "1000 V",
                                "points": "5"
                            },
                            {
                                "option": "200",
                                "feedback": "That's so wrong"
                            }
                        ] 
                    } 
                ]
              }
            ]
          };
          
          var ac = new sparks.ActivityConstructor(jsonSection);
      
          sparks.sparksActivity.pages[0].questions.length.should.be 1
          
          sparks.sparksActivity.pages[0].questions[0].options.should.not.be null
          sparks.sparksActivity.pages[0].questions[0].options.length.should.be 2
          sparks.sparksActivity.pages[0].questions[0].options[0].option.should.be "1 kV"
      end
      
  end
  
  describe 'Circuit Variables'
  
    it 'should be able to substitute a circuit variable in an answer'
      
      breadModel('insertComponent', 'resistor', {"UID": "r1", "connections": "a1,a2", "colors": "orange,black,brown,gold"});
      
      var jsonSection =
        {
          "pages":[
            {
              "questions": [
                {
                  "prompt": "What is the resistance of R1?",
                  "correct_answer": "[${r1.nominalResistance}]",
                  "correct_units": "ohms"
                }
              ]
            }
          ]
        };
    
        var ac = new sparks.ActivityConstructor(jsonSection);
    
        sparks.sparksActivity.pages[0].questions.length.should.be 1
        sparks.sparksActivity.pages[0].questions[0].correct_answer.should.be 300
    end
    
    it 'should be able to calculate an answer from circuit variables'
      
      breadModel('insertComponent', 'resistor', {"UID": "r1", "connections": "a1,a2", "colors": "orange,black,brown,gold"});
      breadModel('insertComponent', 'resistor', {"UID": "r2", "connections": "a2,a3", "resistance": "300"});
      
      var jsonSection =
        {
          "pages":[
            {
              "questions": [
                {
                  "prompt": "What is the nominal resistance of R1 + R2 in parallel?",
                  "correct_answer": "[1 / ((1 / ${r1.nominalResistance}) + (1 / ${r2.nominalResistance}))]",
                  "correct_units": "ohms"
                }
              ]
            }
          ]
        };
    
        var ac = new sparks.ActivityConstructor(jsonSection);
    
        sparks.sparksActivity.pages[0].questions.length.should.be 1
        sparks.sparksActivity.pages[0].questions[0].correct_answer.should.be 150
    end
    
    it 'should be able to handle calculated parts and non-calculated parts of an answer'
      
      breadModel('insertComponent', 'resistor', {"UID": "r1", "connections": "a1,a2", "colors": "orange,black,brown,gold"});
      
      var jsonSection =
        {
          "pages":[
            {
              "questions": [
                {
                  "prompt": "What is the resistance of R1 and half the resistance of R1?",
                  "correct_answer": "[${r1.nominalResistance}] and [${r1.nominalResistance}/2]"
                }
              ]
            }
          ]
        };
    
        var ac = new sparks.ActivityConstructor(jsonSection);
    
        sparks.sparksActivity.pages[0].questions.length.should.be 1
        sparks.sparksActivity.pages[0].questions[0].correct_answer.should.be "300 and 150"
    end
    
    it 'should be able to format answer to engineering'
      
      breadModel('insertComponent', 'resistor', {"UID": "r1", "connections": "a1,a2", "resistance": "3000"});
      
      var jsonSection =
        {
          "pages":[
            {
              "questions": [
                {
                  "prompt": "What is the resistance of R1?",
                  "correct_answer": "[${r1.nominalResistance}]",
                  "correct_units": "ohms"
                },
                {
                  "prompt": "What is the resistance of R1?",
                  "correct_answer": "[${r1.nominalResistance}] ohms",
                },
              ]
            }
          ]
        };
    
        var ac = new sparks.ActivityConstructor(jsonSection);
        
        sparks.sparksActivity.pages[0].questions.length.should.be 2
        sparks.sparksActivity.pages[0].questions[0].correct_answer.should.be 3
        sparks.sparksActivity.pages[0].questions[0].correct_units.should.be "k&#x2126;"
        
        sparks.sparksActivity.pages[0].questions[1].correct_answer.should.be "3 k&#x2126;"
    end
    
    it 'should be able to create multichoice distractors from circuit variables'
      
      breadModel('insertComponent', 'resistor', {"UID": "r1", "connections": "a1,a2", "resistance": "100"});
      breadModel('insertComponent', 'resistor', {"UID": "r2", "connections": "a2,a3", "resistance": "300"});
      
      var jsonSection =
        {
          "pages":[
            {
              "questions": [
                {
                  "prompt": "What is the resistance of R1?",
                  "correct_answer": "[${r1.resistance}]",
                  "correct_units": "ohms",
                  "options": ["[${r1.resistance}]", "[${r1.resistance}/2]"]
                }
              ]
            }
          ]
        };
    
        var ac = new sparks.ActivityConstructor(jsonSection);
    
        sparks.sparksActivity.pages[0].questions.length.should.be 1
        sparks.sparksActivity.pages[0].questions[0].options.length.should.be 2
        sparks.sparksActivity.pages[0].questions[0].options[0].should.be "100"
        sparks.sparksActivity.pages[0].questions[0].options[1].should.be "50"
    end
    
  end
  
  describe "Question displaying"
  
    it "should be able to display simple questions"
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
            }
          ]
      };
    
      var $questionsDiv = $("<div>");
      
      var ac = new sparks.ActivityConstructor(jsonSection);
      ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
      ac.layoutActivity();
    
      var $forms = $questionsDiv.find('form');
      $forms.length.should.be 2
      
      $($forms[0]).find('.prompt')[0].innerHTML.should.be "1.  Set 1 Question 1"
      $($forms[1]).find('.prompt')[0].innerHTML.should.be "2.  Set 1 Question 2"
    end
    
    it "should be able to display a question with an image"
      var jsonSection =
        {
          "pages": [
            {
              "questions":[
                {
                  "image": "http://test.com/test.jpg",
                  "prompt": "What is this image?",
                  "correct_answer": "A test"
                }
              ]
            }
          ]
      };
    
      var $questionsDiv = $("<div>");
      
      var ac = new sparks.ActivityConstructor(jsonSection);
      ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
      ac.layoutActivity();
    
      var $forms = $questionsDiv.find('form');
      var $question = $($forms[0]);
      
      $question.find('img').length.should.be 1
      $($question.find('img')[0]).attr('src').should.be "http://test.com/test.jpg"
    end
    
    it "should be able to display basic multiplechoice questions"
      var jsonSection =
        {
          "pages":[
            {
              "questions": [
                  {
                      "prompt": "What is the resistance of R1?",
                      "keepOrder": true,
                      "options": [
                          {
                              "option": "100 ohms"
                          },
                          {
                              "option": "200 ohms"
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
      
      var $forms = $questionsDiv.find('form');
      var $question = $($forms[0]);
      
      function htmlToText(string) {
        return $('<div>'+string+"</div>").html();
      }
      
      $question.find('select').length.should.be 1
      var $select = $($question.find('select')[0])
      $select.find('option').length.should.be 3
      $select.find('option')[0].innerHTML.should.be htmlToText("")
      $select.find('option')[1].innerHTML.should.be htmlToText("100 &#x2126;")
      $select.find('option')[2].innerHTML.should.be htmlToText("200 &#x2126;")
    end
    
    it "should be able to display radio and checkbox questions"
      var jsonSection =
        {
          "pages":[
            {
              "questions": [
                  {
                      "prompt": "What is the resistance of R1?",
                      "keepOrder": true,
                      "options": [
                          {
                              "option": "0"
                          },
                          {
                              "option": "1"
                          }
                      ],
                      "checkbox": true
                  },
                  {
                      "prompt": "What is the resistance of R2?",
                      "keepOrder": true,
                      "options": [
                          {
                              "option": "0"
                          },
                          {
                              "option": "100"
                          }
                      ],
                      "radio": true
                  },
                  {
                      "prompt": "What is the resistance of R3?",
                      "keepOrder": true,
                      "options": [
                          {
                              "option": "0"
                          },
                          {
                              "option": "100"
                          }
                      ],
                      "radio": true
                  }
              ]
            }
          ]
      };
      
      var $questionsDiv = $("<div>");
        
      var ac = new sparks.ActivityConstructor(jsonSection);
      ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
      ac.layoutActivity();
      
      var $forms = $questionsDiv.find('form');
      var $question = $($forms[0]);
      
      
      $question.find('input').length.should.be 2
      
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
      
      $question.find('input').length.should.be 2
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
    
    /*
     * Note: This test has a 1 in 720 chance in failing due to random ordering
     */
    it "should be able to display multiplechoice questions in random order"
      var jsonSection =
        {
          "pages":[
            {
              "questions": [
                  {
                      "prompt": "What is the resistance of R1?",
                      "keepOrder": true,
                      "options": [  
                          {
                              "option": "1"
                          },
                          {
                              "option": "2"
                          },
                          {
                              "option": "3"
                          },
                          {
                              "option": "4"
                          },
                          {
                              "option": "5"
                          },
                          {
                              "option": "6"
                          }
                      ] 
                  },
                  {
                      "prompt": "What is the resistance of R1?",  // keepOrder should be false by default
                      "options": [  
                          {
                              "option": "1"
                          },
                          {
                              "option": "2"
                          },
                          {
                              "option": "3"
                          },
                          {
                              "option": "4"
                          },
                          {
                              "option": "5"
                          },
                          {
                              "option": "6"
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
      
      var $forms = $questionsDiv.find('form');
      var $question1 = $($forms[0]);
      
      var $select = $($question1.find('select')[0])
      
      var allInOrder = true;
      $.each($select.find('option'), function(i, option){
        if (!option.innerHTML == ""+i){
          allInOrder = false;
        }
      })
      
      allInOrder.should.be true
      
      var $question2 = $($forms[1]);
      
      var $select = $($question2.find('select')[0])
      
      var allInOrder = true;
      $.each($select.find('option'), function(i, option){
        if (!option.innerHTML == ""+i){
          allInOrder = false;
        }
      })
      
      allInOrder.should.be true
    end
    
    it "should be able to display nested questions"
      var jsonSection =
        {
          "pages":[
            {
              "questions": [
                  {
                      "prompt": "What is the resistance of",
                      "subquestions": [
                        {
                          "prompt": "R1?"
                        },
                        {
                          "prompt": "R2?",
                          "options": [
                            {
                              "option": "100"
                            },
                            {
                              "option": "200"
                            }
                          ]
                        }
                      ]
                  },
                  {
                    "prompt": "What is the voltage across R1?"
                  }
              ]
            }
          ]
      };
      
      var $questionsDiv = $("<div>");
        
      var ac = new sparks.ActivityConstructor(jsonSection);
      ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
      ac.layoutActivity();
      
      var $forms = $questionsDiv.find('form');

      $forms.length.should.be 2
      
      $nested = $($forms[0]);
      
      $($forms[0]).children('.prompt').length.should.be 1
      $($forms[0]).children('.prompt')[0].innerHTML.should.be "1.  What is the resistance of"
      
      $nested = $($($forms[0]).find('.subquestions')[0]);
      
      $nested.find('.prompt').length.should.be 2
      $nested.find('input').length.should.be 1
      $nested.find('select').length.should.be 1
      
      $nested.find('.prompt')[0].innerHTML.should.be "R1?"
      $nested.find('.prompt')[1].innerHTML.should.be "R2?"
      
      $($forms[0]).find('button').length.should.be 1
    end
    
  end

end
