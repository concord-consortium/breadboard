describe 'Activity Creator'

  before_each
    breadModel('clear');
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
          ac.createQuestions();
      
          assessment.questions.length.should.be 1
          assessment.questions[0].prompt.should.be "What is the resistance of R1?"
          assessment.questions[0].correct_answer.should.be 100
          assessment.questions[0].correct_units.should.be "V"
      end
  
      it 'should be able to substitute a circuit variable in an answer'
        
        breadModel('insertComponent', 'resistor', {"UID": "r1", "connections": "a1,a2", "colors": "orange,black,brown,gold"});
        
        var jsonActivity =
          {
            "questions": [
              {
                "prompt": "What is the resistance of R1?",
                "correct_answer": "${r1.nominalResistance}",
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
                "correct_answer": "1 / ((1 / ${r1.nominalResistance}) + (1 / ${r2.nominalResistance}))",
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
              "correct_answer": "${r3.resistance} + ${r4.resistance}",
              "correct_units": "ohms"
            }
          ]
        };
    
        var assessment = new sparks.Activity.Assessment();
    
        var ac = new sparks.ActivityConstructor(jsonActivity, assessment);
        ac.createBreadboard();
        ac.createQuestions();
    
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
      ac.createQuestions($questionsDiv);
      
      var $forms = $questionsDiv.find('form');
      
      $forms.length.should.be 2
      
      $forms.each(function(i, val){
        console.log(i + " > " + val);
        $(val).find('.prompt').length.should.be 1
        
        if (i === 0){
          $(val).find('.prompt')[0].innerHTML.should.be "What is the resistance of R1?"
        } else {
            $(val).find('.prompt')[0].innerHTML.should.be "What question is this?"
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
      
  end

end
