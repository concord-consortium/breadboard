describe 'Page Reports'

  before_each
    breadModel('clear');
  end
  
  describe 'Question grading'

      it 'should be able to get the student answers for simple questions'
        var jsonActivity =
          {
            "pages":[
              {
                "questions": [
                  {
                    "prompt": "What is the resistance of R1?",
                    "correct_answer": "100"
                  },
                  {
                      "prompt": "What is the resistance of R2?",
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
              }
            ]
          };
          
        var $questionsDiv = $("<div>");

        var ac = new sparks.ActivityConstructor(jsonActivity);
        ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
        ac.layoutActivity();
        
        sparks.sparksActivity.pages[0].questions.length.should.be 2
        sparks.sparksActivity.pages[0].questions[0].answer.should.be ""
        sparks.sparksActivity.pages[0].questions[1].answer.should.be ""

        var $input = $questionsDiv.find('input');
        $input.val("test");
        $input.change();
        
        var $select = $questionsDiv.find('select');
        $select.val("200");
        $select.change();
        
        sparks.sparksActivity.pages[0].questions[0].answer.should.be "test"
        sparks.sparksActivity.pages[0].questions[1].answer.should.be "200"
      end
      
      it 'should be able to grade student answers for simple questions'
        var jsonActivity =
          {
            "pages":[
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
                  },
                  {
                      "prompt": "What is the resistance of R3?",
                      "options": [
                          {
                              "option": "100"
                          },
                          {
                              "option": "200",
                              "points": 5
                          }
                      ] 
                  },
                  {
                      "prompt": "What is the resistance of R4?",
                      "options": [
                          {
                              "option": "200",
                              "points": 2
                          },
                          {
                              "option": "300",
                              "points": 5
                          },
                          {
                              "option": "400",
                              "points": 0
                          }
                      ] 
                  }
                ]
              }
            ]
          };
          
        var $questionsDiv = $("<div>");

        var ac = new sparks.ActivityConstructor(jsonActivity);
        ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
        ac.layoutActivity();

        var $input = $questionsDiv.find('input');
        $input.val("100");                          // sets val of both open-response q's
        $input.change();
        
        var $select = $questionsDiv.find('select');
        $select.val("200");                         // sets val of both selects
        $select.change();
        
        var qc = sparks.sparksQuestionController;
        qc.gradeQuestion(sparks.sparksActivity.pages[0].questions[0]);
        qc.gradeQuestion(sparks.sparksActivity.pages[0].questions[1]);
        qc.gradeQuestion(sparks.sparksActivity.pages[0].questions[2]);
        qc.gradeQuestion(sparks.sparksActivity.pages[0].questions[3]);
        
        sparks.sparksActivity.pages[0].questions[0].answerIsCorrect.should.be true
        sparks.sparksActivity.pages[0].questions[0].points_earned.should.be 1
        sparks.sparksActivity.pages[0].questions[1].answerIsCorrect.should.be false
        sparks.sparksActivity.pages[0].questions[1].points_earned.should.be 0
        sparks.sparksActivity.pages[0].questions[2].answerIsCorrect.should.be true
        sparks.sparksActivity.pages[0].questions[2].points_earned.should.be 5
        sparks.sparksActivity.pages[0].questions[3].answerIsCorrect.should.be false
        sparks.sparksActivity.pages[0].questions[3].points_earned.should.be 2
      end
      
      it 'should be able to grade student answers for radio button questions'
        var jsonActivity =
          {
            "pages":[
              {
                "questions": [
                  {
                      "prompt": "What is the resistance of R5?",
                      "options": [
                          {
                              "option": "100"
                          },
                          {
                              "option": "200",
                              "points": 5
                          }
                      ],
                      "radio": true
                  },
                  {
                      "prompt": "What is the resistance of R6?",
                      "options": [
                          {
                              "option": "300"
                          },
                          {
                              "option": "400",
                              "points": 5
                          }
                      ],
                      "radio": true
                  }
                ]
              }
            ]
          };
          
        var $questionsDiv = $("<div>");

        var ac = new sparks.ActivityConstructor(jsonActivity);
        ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
        ac.layoutActivity();

        var $input = $questionsDiv.find('input');
        $input.each(function(i, choice){
          var $choice = $(choice);
          if ($choice.attr('value') === "200" || $choice.attr('value') === "300"){
            $choice.attr('selected', true);
            $choice.change();
          }
        });
        
        var qc = sparks.sparksQuestionController;
        qc.gradeQuestion(sparks.sparksActivity.pages[0].questions[0]);
        qc.gradeQuestion(sparks.sparksActivity.pages[0].questions[1]);
        
        sparks.sparksActivity.pages[0].questions[0].answerIsCorrect.should.be true
        sparks.sparksActivity.pages[0].questions[0].points_earned.should.be 5
        sparks.sparksActivity.pages[0].questions[1].answerIsCorrect.should.be false
        sparks.sparksActivity.pages[0].questions[1].points_earned.should.be 0
      end
      
      it 'should be able to grade student answers for nested questions'
        var jsonActivity =
          {
            "pages":[
              {
                "questions": [
                  {
                      "prompt": "What is the resistance of",
                      "subquestions": [
                        {
                          "prompt": "R7",
                          "correct_answer": "100",
                          "points": 1
                        },
                        {
                          "prompt": "R8",
                          "correct_answer": "200",
                          "points": 1
                        },
                        {
                          "prompt": "R9",
                          "options": [
                              {
                                  "option": "100",
                                  "points": 5
                              },
                              {
                                  "option": "200"
                              }
                          ]
                        },
                        {
                          "prompt": "R10",
                          "options": [
                              {
                                  "option": "100"
                              },
                              {
                                  "option": "200",
                                  "points": 5
                              }
                          ]
                        }
                      ]
                  }
                ]
              }
            ]
          };
          
        var $questionsDiv = $("<div>");

        var ac = new sparks.ActivityConstructor(jsonActivity);
        ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
        ac.layoutActivity();

        var $input = $questionsDiv.find('input');
        $input.val("100");                          // sets val of both open-response q's
        $input.change();
        
        var $select = $questionsDiv.find('select');
        $select.val("100");                         // sets val of both selects
        $select.change();
        
        var qc = sparks.sparksQuestionController;
        qc.gradeQuestion(sparks.sparksActivity.pages[0].questions[0]);
        qc.gradeQuestion(sparks.sparksActivity.pages[0].questions[1]);
        qc.gradeQuestion(sparks.sparksActivity.pages[0].questions[2]);
        qc.gradeQuestion(sparks.sparksActivity.pages[0].questions[3]);
        
        sparks.sparksActivity.pages[0].questions[0].answerIsCorrect.should.be true
        sparks.sparksActivity.pages[0].questions[0].points_earned.should.be 1
        sparks.sparksActivity.pages[0].questions[1].answerIsCorrect.should.be false
        sparks.sparksActivity.pages[0].questions[1].points_earned.should.be 0
        sparks.sparksActivity.pages[0].questions[2].answerIsCorrect.should.be true
        sparks.sparksActivity.pages[0].questions[2].points_earned.should.be 5
        sparks.sparksActivity.pages[0].questions[3].answerIsCorrect.should.be false
        sparks.sparksActivity.pages[0].questions[3].points_earned.should.be 0
      end
      
  end
  
  describe "Creating reports"
  
    it 'should be able to grade the answers on one page'
      var jsonActivity =
        {
          "pages":[
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
                },
                {
                    "prompt": "What is the resistance of R3?",
                    "options": [
                        {
                            "option": "100"
                        },
                        {
                            "option": "200",
                            "points": 5
                        }
                    ] 
                },
                {
                    "prompt": "What is the resistance of R4?",
                    "options": [
                        {
                            "option": "200",
                            "points": 2
                        },
                        {
                            "option": "300",
                            "points": 5
                        },
                        {
                            "option": "400",
                            "points": 0
                        }
                    ] 
                }
              ]
            }
          ]
        };
        
      var $questionsDiv = $("<div>");

      var ac = new sparks.ActivityConstructor(jsonActivity);
      ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
      ac.layoutActivity();

      var $input = $questionsDiv.find('input');
      $input.val("100");                          // sets val of both open-response q's
      $input.change();
      
      var $select = $questionsDiv.find('select');
      $select.val("200");                         // sets val of both selects
      $select.change();
      
      var reportView = new sparks.SparksReportView();
      reportView.getPageReportView(sparks.sparksActivity.pages[0]);
      
      sparks.sparksActivity.pages[0].questions[0].answerIsCorrect.should.be true
      sparks.sparksActivity.pages[0].questions[0].points_earned.should.be 1
      sparks.sparksActivity.pages[0].questions[1].answerIsCorrect.should.be false
      sparks.sparksActivity.pages[0].questions[1].points_earned.should.be 0
      sparks.sparksActivity.pages[0].questions[2].answerIsCorrect.should.be true
      sparks.sparksActivity.pages[0].questions[2].points_earned.should.be 5
      sparks.sparksActivity.pages[0].questions[3].answerIsCorrect.should.be false
      sparks.sparksActivity.pages[0].questions[3].points_earned.should.be 2
    end
    
    it 'should be able to create a report of one page'
      var jsonActivity =
        {
          "pages":[
            {
              "questions": [
                {
                  "prompt": "What is the resistance of R1?",
                  "correct_answer": "100",
                  "points": 1
                },
                {
                  "prompt": "What is the resistance of R2?",
                  "shortPrompt": "R2?",
                  "correct_answer": "200",
                  "points": 1
                },
                {
                    "prompt": "What is the resistance of R3?",
                    "options": [
                        {
                            "option": "100"
                        },
                        {
                            "option": "200",
                            "points": 5
                        }
                    ] 
                },
                {
                    "prompt": "What is the resistance of R4?",
                    "options": [
                        {
                            "option": "200",
                            "points": 2,
                            "feedback": "That is not quite right"
                        },
                        {
                            "option": "300",
                            "points": 5
                        },
                        {
                            "option": "400",
                            "points": 0
                        }
                    ] 
                }
              ]
            }
          ]
        };
        
      var $questionsDiv = $("<div>");

      var ac = new sparks.ActivityConstructor(jsonActivity);
      ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
      ac.layoutActivity();

      var $input = $questionsDiv.find('input');
      $input.val("100");                          // sets val of both open-response q's
      $input.change();
      
      var $select = $questionsDiv.find('select');
      $select.val("200");                         // sets val of both selects
      $select.change();
      
      var reportView = new sparks.SparksReportView();
      var $report = reportView.getPageReportView(sparks.sparksActivity.pages[0]);
      
      var $headers = $report.find('th');
      $headers[0].innerHTML.should.be("Question");
      $headers[1].innerHTML.should.be("Your answer");
      $headers[2].innerHTML.should.be("Correct answer");
      $headers[3].innerHTML.should.be("Score");
      $headers[4].innerHTML.should.be("Notes");
      
      var $trs = $report.find('tr');
      
      $($trs[1]).attr('class').should.be "correct"
      var $tds1 = $($trs[1]).find('td');
      $tds1[0].innerHTML.should.be("What is the resistance of R1?");
      $tds1[1].innerHTML.should.be("100");
      $tds1[2].innerHTML.should.be("100");
      $tds1[3].innerHTML.should.be("1/1");
      $tds1[4].innerHTML.should.be("");
      
      $($trs[2]).attr('class').should.be "incorrect"
      var $tds2 = $($trs[2]).find('td');
      $tds2[0].innerHTML.should.be("R2?");
      $tds2[1].innerHTML.should.be("100");
      $tds2[2].innerHTML.should.be("200");
      $tds2[3].innerHTML.should.be("0/1");
      $tds2[4].innerHTML.should.be("The value was wrong");
      
      $($trs[3]).attr('class').should.be "correct"
      var $tds3 = $($trs[3]).find('td');
      $tds3[0].innerHTML.should.be("What is the resistance of R3?");
      $tds3[1].innerHTML.should.be("200");
      $tds3[2].innerHTML.should.be("200");
      $tds3[3].innerHTML.should.be("5/5");
      $tds3[4].innerHTML.should.be("");
      
      $($trs[4]).attr('class').should.be "incorrect"
      var $tds4 = $($trs[4]).find('td');
      $tds4[0].innerHTML.should.be("What is the resistance of R4?");
      $tds4[1].innerHTML.should.be("200");
      $tds4[2].innerHTML.should.be("300");
      $tds4[3].innerHTML.should.be("2/5");
      $tds4[4].innerHTML.should.be("That is not quite right");
      
      var $ths5 = $($trs[5]).find('th');
      $ths5[0].innerHTML.should.be("Total Score:");
      $ths5[3].innerHTML.should.be("8/12");
      
    end
    
  end
 
end
