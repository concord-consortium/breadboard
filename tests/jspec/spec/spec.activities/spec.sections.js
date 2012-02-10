describe 'Sections'

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
  
  describe 'Section meters'
  
    it 'should not share meters across all sections'
      var jsonActivity =
        {
          "type": "activity",
          "sections": [
            {
              "_id": "sectionA",
              "circuit": [
                 {
                   "type": "resistor",
                   "UID": "r1",
                   "connections": "b2,b3"
                 }
              ],
              "show_oscilloscope": true,
              "pages": [
                {
                  "questions": [
                    {
                      "prompt": "What is the resistance of R1?",
                      "correct_answer": "100",
                      "points": 1
                    }
                  ]
                }
              ]
            },
            {
              "_id": "sectionB",
              "circuit": [
                 {
                   "type": "resistor",
                   "UID": "r1",
                   "connections": "b2,b3"
                 }
              ],
              "show_oscilloscope": false,
              "pages": [
                {
                  "questions": [
                    {
                      "prompt": "What is the resistance of R3?",
                      "correct_answer": "100",
                      "points": 1
                    }
                  ]
                }
              ]
            }
          ]
        };
        
      var ac = new sparks.ActivityConstructor(jsonActivity);
      
      var sections = sparks.activityController.sectionMap,
          sectionA = sections.sectionA,
          sectionB = sections.sectionB;
          
      sectionA.meter.oscope.should.not.be null
      sectionB.meter.oscope.should.be null
    end
    
  end

end
