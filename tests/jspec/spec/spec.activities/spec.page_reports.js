describe 'Page Reports'

  before_each
    breadModel('clear');
    sparks.sparksReportController = new sparks.SparksReportController();
  end
  
  after_each
    sparks.sparksActivityController.reset();
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
      
      sparks.sparksReportController.addNewSessionReport(sparks.sparksActivity.pages[0]);
      
      sparks.sparksActivity.pages[0].questions[0].answerIsCorrect.should.be true
      sparks.sparksActivity.pages[0].questions[0].points_earned.should.be 1
      sparks.sparksActivity.pages[0].questions[1].answerIsCorrect.should.be false
      sparks.sparksActivity.pages[0].questions[1].points_earned.should.be 0
      sparks.sparksActivity.pages[0].questions[2].answerIsCorrect.should.be true
      sparks.sparksActivity.pages[0].questions[2].points_earned.should.be 5
      sparks.sparksActivity.pages[0].questions[3].answerIsCorrect.should.be false
      sparks.sparksActivity.pages[0].questions[3].points_earned.should.be 2
    end
    
    it 'should be able to calculate the score for one page'
      // create six questions with answers all 100
      var jsonActivity =
        {
          "pages":[{"questions":[]}]
        };
      for (var i = 0; i < 6; i++){
        jsonActivity.pages[0].questions.push({"prompt": ""+i, "correct_answer": 100, "points": 1});
      }
      
      var $questionsDiv = $("<div>");

      var ac = new sparks.ActivityConstructor(jsonActivity);
      ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
      ac.layoutActivity();

      var $input = $questionsDiv.find('input');
      $($input[0]).val("100");                          // sets q0 to correct answer
      $($input[0]).change();
      
      var sessionReport = sparks.sparksReportController.addNewSessionReport(sparks.sparksActivity.pages[0]);
      
      sessionReport.score.should.be 1
      sessionReport.maxScore.should.be 6
    end
    
    it 'should be able to create multiple session reports for a page and get the best one'
      // create six questions with answers all 100
      var jsonActivity =
        {
          "pages":[{"questions":[]}]
        };
      for (var i = 0; i < 6; i++){
        jsonActivity.pages[0].questions.push({"prompt": ""+i, "correct_answer": 100, "points": 1});
      }
      
      var $questionsDiv = $("<div>");

      var ac = new sparks.ActivityConstructor(jsonActivity);
      ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
      ac.layoutActivity();

      var $input = $questionsDiv.find('input');
      $($input[0]).val("100");                          // sets q0 to correct answer
      $($input[0]).change();
      
      var page = sparks.sparksActivity.pages[0];
      
      var sessionReport = sparks.sparksReportController.addNewSessionReport(page);
      
      sessionReport.score.should.be 1
      
      $($input[1]).val("100");                          // sets q1 to correct answer
      $($input[1]).change();
    
      var sessionReport2 = sparks.sparksReportController.addNewSessionReport(page);
      
      sessionReport2.score.should.be 2
      
      $($input[0]).val("0");                          // sets q0 and q1 back to incorrect answer
      $($input[0]).change();
      $($input[1]).val("0");
      $($input[1]).change();
    
      var sessionReport3 = sparks.sparksReportController.addNewSessionReport(page);
      
      sessionReport3.score.should.be 0
      
      sparks.sparksReport.pageReports[page].sessionReports.length.should.be 3
      
      var bestReport = sparks.sparksReportController.getBestSessionReport(page);
      bestReport.score.should.be 2
    end
  end
  
  describe "Report views"
    
    it 'should be able to create a report table of one page'
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
      
      var sessionReport = sparks.sparksReportController.addNewSessionReport(sparks.sparksActivity.pages[0]);
      var $report = sparks.sparksReport.view.getSessionReportView(sessionReport);
      
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
    
    it 'should show tutorial links if they are specified'
      var jsonActivity =
        {
          "pages":[
            {
              "questions": [
                {
                  "prompt": "What is the resistance of R1?",
                  "tutorial": "/example.html",
                  "options": [
                      {
                          "option": "200",
                          "points": 0,
                          "feedback": "Wrong!"
                      },
                      {
                          "option": "300",
                          "points": 5
                      }
                  ]
                },
                {
                  "prompt": "What is the resistance of R1?",
                  "tutorial": "/example2.html",
                  "options": [
                      {
                          "option": "200",
                          "points": 0,
                          "feedback": "Wrong 2!",
                          "tutorial": "/example.html",            // this overrides question-level property
                      },
                      {
                          "option": "300",
                          "points": 5
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

      var $select = $questionsDiv.find('select');
      $select.val("200");
      $select.change();
      
      var sessionReport = sparks.sparksReportController.addNewSessionReport(sparks.sparksActivity.pages[0]);
      var $report = sparks.sparksReport.view.getSessionReportView(sessionReport);
      
      var $trs = $report.find('tr');
      
      var $tds1 = $($trs[1]).find('td');
      $tds1[4].innerHTML.should.be("Wrong!<button>Tutorial</button>");
      var $tds2 = $($trs[2]).find('td');
      $tds2[4].innerHTML.should.be("Wrong 2!<button>Tutorial</button>");
      
      var oldOpen = window.open;
      window.open = function(){};
      
      window.should.receive('open', 'twice').with_args("/example.html", "", "menubar=no,height=600,width=800,resizable=yes,toolbar=no,location=no,status=no")
      $button = $($tds1[4]).find('button');
      $button.click();
      
      $button = $($tds2[4]).find('button');
      $button.click();
      
      window.open = oldOpen;
      
    end
    
    it 'should use base tutorial url if necessary'
      var oldOpen = window.open;
      
      var openCalled = false;
      window.open = function(url){
        url.should.be "http://example.com"
        openCalled = true;
      };
      sparks.sparksReportController.showTutorial("http://example.com");
      openCalled.should.be true
      
      openCalled = false;
      window.open = function(url){
        url.should.be "/example.html"
        openCalled = true;
      };
      sparks.sparksReportController.showTutorial("/example.html");
      openCalled.should.be true
      
      openCalled = false;
      window.open = function(url){
        url.should.be sparks.tutorial_base_url + "example.html"
        openCalled = true;
      };
      sparks.sparksReportController.showTutorial("example.html");
      openCalled.should.be true
    
      window.open = oldOpen;
    end
    
    it 'should be able to create an activity reports with multiple pages and sessions'
      // create two pages, six questions each, with answers all 100
      var jsonActivity =
        {
          "pages":[{"questions":[]}, {"questions":[]}]
        };
      for (var i = 0; i < 6; i++){
        jsonActivity.pages[0].questions.push({"prompt": ""+i, "correct_answer": 100, "points": 1});
        jsonActivity.pages[1].questions.push({"prompt": ""+i, "correct_answer": 100, "points": 1});
      }
      
      var $questionsDiv = $("<div>");

      var ac = new sparks.ActivityConstructor(jsonActivity);
      ac.setEmbeddingTargets({$questionsDiv: $questionsDiv});
      ac.layoutActivity();
      
      var page = sparks.sparksActivity.pages[0];

      var $input = $questionsDiv.find('input');
      $($input[0]).val("100");                          // sets q0 to correct answer
      $($input[0]).change();
      $($input[1]).val("100");                          // sets q1 to correct answer
      $($input[1]).change();
      
      sparks.sparksReportController.addNewSessionReport(page);
      
      $($input[1]).val("0");                          // sets q1 to incorrect answer (second try is worse)
      $($input[1]).change();
      sparks.sparksReportController.addNewSessionReport(page);
      
      sparks.sparksActivityController.nextPage();
      var page = sparks.sparksActivity.pages[1];
      
      var $input = $questionsDiv.find('input');
      $($input[2]).val("100");                          // sets q2 of page 2 to correct answer
      $($input[2]).change();
      sparks.sparksReportController.addNewSessionReport(page);
      
      var $report = sparks.sparksReport.view.getActivityReportView();
      $report.should.not.be undefined
      
      // confirm total score is calculated correctly
      var $score = $report.find('h1').next();        // this finds the <b>olded score
      $score.html().should.be "3"
      var $max = $report.find('h1').next().next();
      $max.html().should.be "12"
      
      // confirm there are two titles 
      var $titles = $report.find('h2');
      $titles.length.should.be 2
      $titles[1].innerHTML.should.be "Page 2"
      
      // confirm there are two tables, and the tables are correct
      var $tables = $report.find('table');
      $tables.length.should.be 2
      
      var $table1 = $($tables[0]);
      var $trs = $table1.find('tr');
      $($trs[1]).attr('class').should.be "correct"
      $($trs[2]).attr('class').should.be "correct"
      $($trs[3]).attr('class').should.be "incorrect"
      
      var $table2 = $($tables[1]);
      var $trs2 = $table2.find('tr');
      $($trs2[1]).attr('class').should.be "incorrect"
      $($trs2[2]).attr('class').should.be "incorrect"
      $($trs2[3]).attr('class').should.be "correct"
      
      // confirm there are two buttons to go back to previous activities
      var $buttons = $report.find('button');
      $buttons.length.should.be 2
      $buttons[0].innerHTML.should.be "Try Page 1 again"
    end
    
  end
 
end
