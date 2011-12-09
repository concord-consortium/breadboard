describe 'Activity Creator'

  before
    oldOScopeView = sparks.OscilloscopeView;
    sparks.OscilloscopeView = function () {};
    sparks.OscilloscopeView.prototype = {
      getView:    function () { return $('<div>'); },
      renderSignal:   function () {},
      removeTrace: function () {},
      setModel:   function () {},
      horizontalScaleChanged: function () {},
      verticalScaleChanged: function () {}    
    };
  end
  
  after
    sparks.OscilloscopeView = oldOScopeView;
  end

  before_each
    breadModel('clear');
    sparks.sectionController.reset();
    sparks.activityController.reset();
  end
  
  after_each
    $('#questions_area').remove();
    $('#breadboard').remove();
    sparks.activityController.reset();
  end
  
  describe 'Circuit creation'
  
    // for more circuit creation examples, see spec.circuit_constructor
    it 'should be able to create a circuit'
      var jsonSection =
        {
          "circuit": [
             {
               "type": "resistor",
               "connections": "b2,b3"
             }
          ]
        };
  
      var ac = new sparks.ActivityConstructor(jsonSection);
  
      var board = getBreadBoard();
      var netlist = sparks.circuit.qucsator.makeNetlist(board);
      netlist.search(/R:resistor.* L2 L3/).should.be_at_least 0
    end
    
    it 'should be able to create a circuit with faults'
      var jsonSection =
        {
          "circuit": [
             {
               "type": "resistor",
               "UID": "r1",
               "connections": "b2,b3"
             }
          ],
          "faults": [
            {
              "type": "open",
              "component": "r1"
            }
          ]
        };
  
      var ac = new sparks.ActivityConstructor(jsonSection);
  
      var board = getBreadBoard();
      board.components["r1"].resistance.should.be 1e20
    end
    
  end
  
  describe 'Adding DMMs and OScopes'
    
    it 'should not set the section.meter property if no multimeter or oscope is visible'
      var jsonSection =
        {
          "circuit": [
             {
               "type": "resistor",
               "UID": "r1",
               "connections": "b2,b3"
             }
          ]
        };
        
      var ac = new sparks.ActivityConstructor(jsonSection);
      sparks.activityController.currentSection.meter.dmm.should.be null
      sparks.activityController.currentSection.meter.oscope.should.be null
    end
    
    it 'should set the section.meter property to be a DMM if multimeter is visible'
      var jsonSection =
        {
          "circuit": [
             {
               "type": "resistor",
               "UID": "r1",
               "connections": "b2,b3"
             }
          ],
          "show_multimeter": true
        };
        
      var ac = new sparks.ActivityConstructor(jsonSection);
      sparks.activityController.currentSection.meter.dmm.should_not.be null
      sparks.activityController.currentSection.meter.dmm.dialPosition.should_not.be null
      sparks.activityController.currentSection.meter.oscope.should.be null
    end
    
    it 'should set the section.meter property to be an o-scope if o-scope is visible'
      var jsonSection =
        {
          "circuit": [
             {
               "type": "resistor",
               "UID": "r1",
               "connections": "b2,b3"
             }
          ],
          "show_oscilloscope": true
        };
        
      var ac = new sparks.ActivityConstructor(jsonSection);
      sparks.activityController.currentSection.meter.oscope.should_not.be null
      sparks.activityController.currentSection.meter.oscope.PROBE_CHANNEL.should_not.be null
      sparks.activityController.currentSection.meter.dmm.should.be null
    end
    
  end
  
  describe 'Question creation'

      // for more question creation examples, see spec.questions
      it 'should be able to create a simple question'
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
          
          sparks.activity.should.not.be undefined
          var section = sparks.activityController.currentSection;
          section.pages.length.should.be 1
          
          section.pages[0].questions.length.should.be 1
          section.pages[0].questions[0].prompt.should.be "What is the resistance of R1?"
          section.pages[0].questions[0].correct_answer.should.be 100
          section.pages[0].questions[0].correct_units.should.be "V"
      end
      
  end
  
  describe 'Activity displaying'
    it 'should be able to embed images in main body of page'
    
      var jsonSection =
        {
          "_id": "test",
          "image": "test.jpg"
      };
      
      var $imageDiv = $("<div>");
      
      var ac = new sparks.ActivityConstructor(jsonSection);
      sparks.activity.view.setEmbeddingTargets({$imageDiv: $imageDiv});
      sparks.activity.view.layoutCurrentSection();
      var $img = $imageDiv.find('img');
      $img.length.should.be 1
      $($imageDiv.find('img')[0]).attr('src').should.be "http://couchdb.cosmos.concord.org/sparks/test/test.jpg"
    end
    
  end

end
