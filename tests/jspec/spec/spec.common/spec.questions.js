describe 'Questions'

  before_each
    breadModel('clear');
  end
  
  describe 'Creation'

      it 'should be able to create a simple question'
        var jsonActivity =
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
          };
      
          var assessment = new sparks.Activity.Assessment();
      
          assessment.questions.length.should.be 0
      
          var ac = new sparks.ActivityConstructor(jsonActivity, assessment);
          ac.createQuestions();
      
          assessment.questions.length.should.be 2
          assessment.questions[0].prompt.should.be "What is the resistance of R1?"
          assessment.questions[0].correct_answer.should.be 100
          assessment.questions[0].correct_units.should.be "V"
          
          assessment.questions[1].prompt.should.be "What is your name?"
          assessment.questions[1].correct_answer.should.be ""
      end
      
      it 'should be able to create nested questions'
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
      
          var assessment = new sparks.Activity.Assessment();
          var ac = new sparks.ActivityConstructor(jsonActivity, assessment);
          ac.createQuestions();
          
          assessment.questions.length.should.be 3
          assessment.questions[0].prompt.should.be "What is the rated resistance of R<sub>1</sub>:"
          assessment.questions[1].prompt.should.be "What is the rated resistance of R<sub>2</sub>:"
          assessment.questions[2].prompt.should.be "What is the voltage across R1?"
      end
      
      it 'should be able to create a multichoice question'
        var jsonActivity =
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
                "multichoice": ["100", "200"]
              }
            ]
          };
      
          var assessment = new sparks.Activity.Assessment();
      
          assessment.questions.length.should.be 0
      
          var ac = new sparks.ActivityConstructor(jsonActivity, assessment);
          ac.createQuestions();
      
          assessment.questions.length.should.be 2
          
          assessment.questions[0].multichoice.should.be undefined
          
          assessment.questions[1].multichoice.should.not.be undefined
          assessment.questions[1].multichoice.length.should.be 2
          assessment.questions[1].multichoice[0].should.be "100"
          assessment.questions[1].multichoice[1].should.be "200"
      end
      
      it 'should be able to create a multiple groups of question'
        var jsonActivity =
          {
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
      
          var assessment = new sparks.Activity.Assessment();
      
          assessment.questions.length.should.be 0
      
          var ac = new sparks.ActivityConstructor(jsonActivity, assessment);
          ac.createQuestions();
      
          assessment.questions.length.should.be 4
          assessment.questions[0].prompt.should.be "Set 1 Question 1"
          assessment.questions[3].prompt.should.be "Set 2 Question 2"
      end
      
  end
  
  describe 'Circuit Variables'
  
    it 'should be able to substitute a circuit variable in an answer'
      
      breadModel('insertComponent', 'resistor', {"UID": "r1", "connections": "a1,a2", "colors": "orange,black,brown,gold"});
      
      var jsonActivity =
        {
          "questions": [
            {
              "prompt": "What is the resistance of R1?",
              "correct_answer": "[${r1.nominalResistance}]",
              "correct_units": "ohms"
            }
          ]
        };
    
        var assessment = new sparks.Activity.Assessment();
    
        var ac = new sparks.ActivityConstructor(jsonActivity, assessment);
        ac.createQuestions();
    
        assessment.questions.length.should.be 1
        assessment.questions[0].correct_answer.should.be 300
    end
    
    it 'should be able to calculate an answer from circuit variables'
      
      breadModel('insertComponent', 'resistor', {"UID": "r1", "connections": "a1,a2", "colors": "orange,black,brown,gold"});
      breadModel('insertComponent', 'resistor', {"UID": "r2", "connections": "a2,a3", "resistance": "300"});
      
      var jsonActivity =
        {
          "questions": [
            {
              "prompt": "What is the nominal resistance of R1 + R2 in parallel?",
              "correct_answer": "[1 / ((1 / ${r1.nominalResistance}) + (1 / ${r2.nominalResistance}))]",
              "correct_units": "ohms"
            }
          ]
        };
    
        var assessment = new sparks.Activity.Assessment();
    
        var ac = new sparks.ActivityConstructor(jsonActivity, assessment);
        ac.createQuestions();
    
        assessment.questions.length.should.be 1
        assessment.questions[0].correct_answer.should.be 150
    end
    
    it 'should be able to handle calculated parts and non-calculated parts of an answer'
      
      breadModel('insertComponent', 'resistor', {"UID": "r1", "connections": "a1,a2", "colors": "orange,black,brown,gold"});
      
      var jsonActivity =
        {
          "questions": [
            {
              "prompt": "What is the resistance of R1 and half the resistance of R1?",
              "correct_answer": "[${r1.nominalResistance}] and [${r1.nominalResistance}/2]"
            }
          ]
        };
    
        var assessment = new sparks.Activity.Assessment();
    
        var ac = new sparks.ActivityConstructor(jsonActivity, assessment);
        ac.createQuestions();
    
        assessment.questions.length.should.be 1
        assessment.questions[0].correct_answer.should.be "300 and 150"
    end
    
    it 'should be able to create multichoice distractors from circuit variables'
      
      breadModel('insertComponent', 'resistor', {"UID": "r1", "connections": "a1,a2", "resistance": "100"});
      breadModel('insertComponent', 'resistor', {"UID": "r2", "connections": "a2,a3", "resistance": "300"});
      
      var jsonActivity =
        {
          "questions": [
            {
              "prompt": "What is the resistance of R1?",
              "correct_answer": "[${r1.resistance}]",
              "correct_units": "ohms",
              "multichoice": ["[${r1.resistance}]", "[${r1.resistance}/2]"]
            }
          ]
        };
    
        var assessment = new sparks.Activity.Assessment();
    
        var ac = new sparks.ActivityConstructor(jsonActivity, assessment);
        ac.createQuestions();
    
        assessment.questions.length.should.be 1
        assessment.questions[0].multichoice.length.should.be 2
        assessment.questions[0].multichoice[0].should.be "100"
        assessment.questions[0].multichoice[1].should.be "50"
    end
    
  end

end
