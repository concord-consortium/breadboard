describe 'OScope View'

  describe 'OScope model interfacing with a mock oscope view'
  
    before_each
      oldOScopeViewPrototype = sparks.OscilloscopeView.prototype;
      sparks.OscilloscopeView.prototype.getView = function() {  return $('<div>'); };
      sparks.OscilloscopeView.prototype.renderSignal = function() { };
      sparks.OscilloscopeView.prototype.removeTrace = function() { };
      sparks.OscilloscopeView.prototype.horizontalScaleChanged = function() {};
      sparks.OscilloscopeView.prototype.verticalScaleChanged = function() {};
      
      sparks.config.qucsate_server_url = "http://localhost:1234/sparks/qucsator/solve";
      
      breadModel('clear');
      sparks.sectionController.reset();
      sparks.activityController.reset();
    end

    after_each
      sparks.OscilloscopeView.prototype = oldOScopeViewPrototype;
    end
    
    it 'should send the right commands to the view for the signal trace'
      var jsonSection =
        {
          "circuit": [
             {
               "type": "function generator",
               "UID": "source",
               "frequencies": [1000],
               "amplitude": 100
             }
          ],
          "show_oscilloscope": true
        };
      
      var renderSignalCalled = false;
      sparks.OscilloscopeView.prototype.renderSignal = function (channel) {
        renderSignalCalled = true;
        channel.should.be 1
      }
      
      var ac = new sparks.ActivityConstructor(jsonSection);
      renderSignalCalled.should.be true
    end
    
    it 'should send the right commands to the view for a probe trace for signal and ground (mock QUCS)'
      var jsonSection =
        {
          "circuit": [
             {
               "type": "function generator",
               "UID": "source",
               "frequencies": [1000],
               "amplitude": 100
             },
             {
                "type": "capacitor",
                "capacitance": 0.1,
                "connections": "left_negative1,left_positive1"
              }
          ],
          "show_oscilloscope": true
        };
      
      var ac = new sparks.ActivityConstructor(jsonSection);
      
      // actual QUCS result for above circuit
      mock_request().and_return(
        "<Qucs Dataset 0.0.15>\n" +
        "<indep acfrequency 1>\n" +
        "  +1.00000000000e+03\n"  +
        "</indep>\n" +
        "<dep source.i acfrequency>\n" +
        "  +0.00000000000e+00-j6.28318530718e+04\n" +
        "</dep>\n" +
        "<dep powerPosL.v acfrequency>\n" +
        "  +1.00000000000e+02\n" +
        "</dep>", 
        'text/plain');
      
      var renderSignalCalledTimes = 0;
      sparks.OscilloscopeView.prototype.renderSignal = function (channel) {
        renderSignalCalledTimes++;
      }
      
      var meter = sparks.activityController.currentSection.meter;
      meter.setProbeLocation("red", "left_negative1");
      renderSignalCalledTimes.should.be 2
      
      var renderSignalCalledTimes = 0;
      sparks.OscilloscopeView.prototype.renderSignal = function (channel) {
        renderSignalCalledTimes++;
      }
      
      meter.setProbeLocation("red", "left_positive1");
      renderSignalCalledTimes.should.be 2
    end
    
    it 'should send the right commands to the view for a probe trace at a node (mock QUCS)'
      var jsonSection =
        {
          "circuit": [
             {
               "type": "function generator",
               "UID": "source",
               "frequencies": [1000],
               "amplitude": 100
             },
             {
                "type": "capacitor",
                "capacitance": 0.1,
                "connections": "left_negative1,a1"
              },
              {
                  "type": "resistor",
                  "resistance": 100,
                  "connections": "a1,left_positive1"
                }
          ],
          "show_oscilloscope": true
        };
      
      var ac = new sparks.ActivityConstructor(jsonSection);
      
      // actual QUCS result for above circuit
      mock_request().and_return(
        "<Qucs Dataset 0.0.15>\n" +
        "<indep acfrequency 1>\n" +
        "  +1.00000000000e+03\n" +
        "</indep>\n" +
        "<dep source.i acfrequency>\n" +
        "  -9.99999999747e-01-j1.59154943052e-05\n" +
        "</dep>\n" +
        "<dep L1.v acfrequency>\n" +
        "  +2.53302959042e-08-j1.59154943052e-03\n" +
        "</dep>\n" +
        "<dep powerPosL.v acfrequency>\n" +
        "  +1.00000000000e+02\n" +
        "</dep>",
        'text/plain');
      
      var renderSignalCalledTimes = 0;
      sparks.OscilloscopeView.prototype.renderSignal = function (channel) {
        renderSignalCalledTimes++;
      }
      
      var meter = sparks.activityController.currentSection.meter;
      meter.setProbeLocation("red", "a1");
      renderSignalCalledTimes.should.be 2
    end
    
    
  end
  
end
