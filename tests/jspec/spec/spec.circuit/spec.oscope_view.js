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
      
      var oscope = sparks.activityController.currentSection.meter.oscope;
      oscope.signals[1].amplitude.should.be 100
      oscope.signals[1].frequency.should.be 1000
      oscope.signals[1].phase.should.be 0
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
      var oscope = sparks.activityController.currentSection.meter.oscope;
      
      var renderSignalCalledTimes = 0;
      sparks.OscilloscopeView.prototype.renderSignal = function (channel) {
        renderSignalCalledTimes++;
      }
      
      var meter = sparks.activityController.currentSection.meter.oscope;
      meter.setProbeLocation("probe_pink", "left_negative1");
      renderSignalCalledTimes.should.be 2
      
      oscope.signals[1].amplitude.should.be 100
      oscope.signals[1].frequency.should.be 1000
      oscope.signals[1].phase.should.be 0
      
      oscope.signals[2].amplitude.should.be 0
      oscope.signals[2].frequency.should.be 0
      oscope.signals[2].phase.should.be 0
      
      var renderSignalCalledTimes = 0;
      sparks.OscilloscopeView.prototype.renderSignal = function (channel) {
        renderSignalCalledTimes++;
      }
      
      meter.setProbeLocation("probe_pink", "left_positive1");
      renderSignalCalledTimes.should.be 2
      
      oscope.signals[2].amplitude.should.be 100
      oscope.signals[2].frequency.should.be 1000
      oscope.signals[2].phase.should.be 0
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
      var oscope = sparks.activityController.currentSection.meter.oscope;
      
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
        'text/plain', 200);
      
      var renderSignalCalledTimes = 0;
      sparks.OscilloscopeView.prototype.renderSignal = function (channel) {
        renderSignalCalledTimes++;
      }
      
      var meter = sparks.activityController.currentSection.meter.oscope;
      meter.setProbeLocation("probe_pink", "a1");
      renderSignalCalledTimes.should.be 2
      
      oscope.signals[2].amplitude.should.be 1.591549430721572e-3
      oscope.signals[2].frequency.should.be 1000
      oscope.signals[2].phase.should.be -1.5707804113005888
    end
    
    it 'should send the right commands to the view for a multi-frequency source after changing frequency (mock QUCS)'
      var jsonSection =
        {
          "circuit": [
             {
               "type": "function generator",
               "UID": "source",
               "frequencies": [1000, 2000],
               "amplitude": 100
             },
             {
                "type": "capacitor",
                "capacitance": 0.1,
                "connections": "left_positive1,a1"
              },
              {
                  "type": "resistor",
                  "resistance": 100,
                  "connections": "a1,left_negative1"
                }
          ],
          "show_oscilloscope": true
        };
      
      var ac = new sparks.ActivityConstructor(jsonSection);
      var oscope = sparks.activityController.currentSection.meter.oscope;
      
      // actual QUCS result for above circuit
      mock_request().and_return(
        "<Qucs Dataset 0.0.15>\n"  +
        "<indep acfrequency 2>\n"  +
        "  +1.00000000000e+03\n"   +
        "  +2.00000000000e+03\n"   +
        "</indep>\n" +
        "<dep source.i acfrequency>\n" +
        "  -3.94768591204e-05-j1.31111145020e-01\n" +
        "  -1.57888737627e-04-j4.72755432129e-01\n" +
        "</dep>\n" +
        "<dep powerPosL.v acfrequency>\n" +
        "  +1.00000000000e+01\n" +
        "  +1.00000000000e+01\n" +
        "</dep>\n" +
        "<dep L1.v acfrequency>\n" +
        "  +3.94768591204e-04+j6.28293726676e-02\n" +
        "  +1.57888737627e-03+j1.25643865260e-01\n" +
        "</dep>",
        'text/plain', 200);
      
      var renderSignalCalledTimes = 0;
      sparks.OscilloscopeView.prototype.renderSignal = function (channel) {
        renderSignalCalledTimes++;
      }
      
      var meter = sparks.activityController.currentSection.meter.oscope;
      meter.setProbeLocation("probe_pink", "a1");
      renderSignalCalledTimes.should.be 2
      
      oscope.signals[2].amplitude.should.be 6.283061285746593e-2
      oscope.signals[2].frequency.should.be 1000
      oscope.signals[2].phase.should.be 1.564513224169169
      
      // change the source frequency
      getBreadBoard().components.source.setFrequency(2000);
      
      oscope.signals[1].frequency.should.be 2000
      
      oscope.signals[2].amplitude.should.be 1.2565378531035176e-1
      oscope.signals[2].frequency.should.be 2000
      oscope.signals[2].phase.should.be 1.5582306175851692
    end
    
    
  end
  
end
