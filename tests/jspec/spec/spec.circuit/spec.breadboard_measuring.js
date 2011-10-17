describe 'Measuring breadboard components'
    before
      sparks.config.qucsate_server_url = "http://localhost:1234/sparks/qucsator/solve";
      breadModel('clear');
    end
    
    before_each
      stub(sparks.logController, 'addEvent').and_return(null);
      sparks.circuit.qucsator.previousMeasurements = {};
      breadModel('clear');
    end
    
    describe 'Calling QUCS'
    
      it "it should call QUCS when we first connect both probes"
        
        mock_request().and_return('<Qucs Dataset 0.0.15>\n<dep meter.V V1>\n  +2.00000000000e+00\n</dep>', 'text/plain')
        var timesCalled = 0;
        var oldParse = sparks.circuit.qucsator.parse;   // parse is a proxy for knowing when we made a new measurement
        sparks.circuit.qucsator.parse = function(){
          timesCalled++;
          return {meter: {I: 1, V: 1}};
        }
        
        breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
        var multimeter = new sparks.circuit.Multimeter2();
        
        multimeter.redProbeConnection = 'a1';
        multimeter.update();
        
        timesCalled.should.be 0
        
        multimeter.blackProbeConnection = 'a2';
        multimeter.update();
        
        timesCalled.should.be 1
        
        sparks.circuit.qucsator.parse = oldParse;
        
      end
      
      it "it should call QUCS when we switch to new measurement type"
        
        mock_request().and_return('<Qucs Dataset 0.0.15>\n<dep meter.V V1>\n  +2.00000000000e+00\n</dep>', 'text/plain')
        var timesCalled = 0;
        var oldParse = sparks.circuit.qucsator.parse;
        sparks.circuit.qucsator.parse = function(){
          timesCalled++;
          return {meter: {I: 1, V: 1}};
        }
        
        breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
        var multimeter = new sparks.circuit.Multimeter2();
        
        multimeter.dialPosition = 'dcv_20'
        
        multimeter.redProbeConnection = 'a1';
        multimeter.blackProbeConnection = 'a2';
        multimeter.update();
        
        timesCalled.should.be 1
        
        multimeter.dialPosition = 'r_200'
        multimeter.update();
        
        timesCalled.should.be 2
        
        multimeter.dialPosition = 'dca_200mc'
        multimeter.update();
        
        timesCalled.should.be 3
        
        
        sparks.circuit.qucsator.parse = oldParse;
        
      end
      
      it "it should not call QUCS when we switch to new range within same measurement type"
      
        mock_request().and_return('<Qucs Dataset 0.0.15>\n<dep meter.V V1>\n  +2.00000000000e+00\n</dep>', 'text/plain')
        var timesCalled = 0;
        var oldParse = sparks.circuit.qucsator.parse;
        sparks.circuit.qucsator.parse = function(){
          timesCalled++;
          return {meter: {I: 1, V: 1}};
        }
        
        breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
        var multimeter = new sparks.circuit.Multimeter2();
        
        multimeter.dialPosition = 'dcv_20'
        
        multimeter.redProbeConnection = 'a1';
        multimeter.blackProbeConnection = 'a2';
        multimeter.update();
        
        timesCalled.should.be 1
        
        multimeter.dialPosition = 'dcv_200'
        multimeter.update();
        
        timesCalled.should.be 1
        
        multimeter.dialPosition = 'dcv_1000'
        multimeter.update();
        
        timesCalled.should.be 1
        
        multimeter.dialPosition = 'dca_200mc'
        multimeter.update();
        
        timesCalled.should.be 2
        
        multimeter.dialPosition = 'dca_2000mc'
        multimeter.update();
        
        timesCalled.should.be 2
        
        
        sparks.circuit.qucsator.parse = oldParse;
        
      end
      
      it "it should not call QUCS when we return to a previous measurement type"
        
        mock_request().and_return('<Qucs Dataset 0.0.15>\n<dep meter.V V1>\n  +2.00000000000e+00\n</dep>', 'text/plain')
        var timesCalled = 0;
        var oldParse = sparks.circuit.qucsator.parse;
        sparks.circuit.qucsator.parse = function(){
          timesCalled++;
          return {meter: {I: 1, V: 1}};
        }
        
        breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
        var multimeter = new sparks.circuit.Multimeter2();
        
        multimeter.dialPosition = 'dcv_20'
        
        multimeter.redProbeConnection = 'a1';
        multimeter.blackProbeConnection = 'a2';
        multimeter.update();
        
        timesCalled.should.be 1
        
        multimeter.dialPosition = 'dca_200mc'
        multimeter.update();
        
        timesCalled.should.be 2
        
        multimeter.dialPosition = 'dcv_1000'
        multimeter.update();
        
        timesCalled.should.be 2
        
        sparks.circuit.qucsator.parse = oldParse;
        
      end
      
      it "it should call QUCS when we change the circuit"
        
        mock_request().and_return('<Qucs Dataset 0.0.15>\n<dep meter.V V1>\n  +2.00000000000e+00\n</dep>', 'text/plain')
        var timesCalled = 0;
        var oldParse = sparks.circuit.qucsator.parse;
        sparks.circuit.qucsator.parse = function(){
          timesCalled++;
          return {meter: {I: 1, V: 1}};
        }
        
        breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
        var multimeter = new sparks.circuit.Multimeter2();
        
        multimeter.dialPosition = 'dcv_20'
        
        multimeter.redProbeConnection = 'a1';
        multimeter.blackProbeConnection = 'a2';
        multimeter.update();
        
        timesCalled.should.be 1
        
        breadModel('mapHole', 'a1', 'ghost-a1');
        
        multimeter.update();
        
        timesCalled.should.be 2
        
        sparks.circuit.qucsator.parse = oldParse;
        
      end
      
      it "it should not call QUCS when we return to a previous circuit configuration"
        
        mock_request().and_return('<Qucs Dataset 0.0.15>\n<dep meter.V V1>\n  +2.00000000000e+00\n</dep>', 'text/plain')
        var timesCalled = 0;
        var oldParse = sparks.circuit.qucsator.parse;
        sparks.circuit.qucsator.parse = function(){
          timesCalled++;
          return {meter: {I: 1, V: 1}};
        }
        
        breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
        var multimeter = new sparks.circuit.Multimeter2();
        
        multimeter.dialPosition = 'dcv_20'
        
        multimeter.redProbeConnection = 'a1';
        multimeter.blackProbeConnection = 'a2';
        multimeter.update();
        
        timesCalled.should.be 1
        
        breadModel('mapHole', 'a1', 'ghost-a1');
        
        multimeter.update();
        
        timesCalled.should.be 2
        
        breadModel('unmapHole', 'a1');
        
        multimeter.update();
        
        timesCalled.should.be 2
        
        sparks.circuit.qucsator.parse = oldParse;
        
      end
      
    end
    
    describe 'Using QUCS [QUCS application-dependent]'
    
      it "should correctly measure resistance"
    
        // we add a 100 ohm resistor
        breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
        var result = breadModel('query', 'resistance', 'a1,a2');
        // the first value of the current (I) value of the meter
        result.meter.i[0].real.should.be 1/100
      
        // we add another 100 ohm resistor in series
        breadModel('insertComponent', 'resistor', {"connections": 'b2,b3', "colors": 'brown,black,brown,gold'});
        var result = breadModel('query', 'resistance', 'a1,a3')
        result.meter.i[0].real.should.be 1/200
      
        // we add a 300 ohm resistor in series, but only measure between 2 and 3
        breadModel('insertComponent', 'resistor', {"connections": 'c3,c4', "colors": 'orange,black,brown,gold'});
        var result = breadModel('query', 'resistance', 'a2,d4')
        result.meter.i[0].real.should.be 1/400
      
        // we add a 500 ohm resistor in parallel to everything
        // ____100___100___300____
        //   \_____500________/
        breadModel('insertComponent', 'resistor', {"connections": 'd1,d4', "colors": 'green,black,brown,gold'});
        var result = breadModel('query', 'resistance', 'a1,d4')
        result.meter.i[0].real.should.be 1/250
      end
    
      it "should correctly measure voltage with an added battery"
      
        // we add a 100 ohm resistor and a 5V battery
        breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
        breadModel('insertComponent', 'battery', {"connections": 'a1,a2', "voltage": 5});
      
        var result = breadModel('query', 'voltage', 'a1,a2')
        result.meter.v[0].real.should.be 5
      
        breadModel('clear');
      
        // we add a 100 ohm resistor and 400 ohm resistor and a 5V battery
        breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
        breadModel('insertComponent', 'resistor', {"connections": 'a2,a3', "colors": 'yellow,black,brown,gold'});
        breadModel('insertComponent', 'battery', {"connections": 'a1,a3', "voltage": 5});
      
        var result = breadModel('query', 'voltage', 'a1,a2')
        Math.round(result.meter.v[0].real).should.be 1
        var result = breadModel('query', 'voltage', 'a2,a3')
        Math.round(result.meter.v[0].real).should.be 4
      end
      
      it "should correctly measure voltage with the default (unauthored) battery"
        
        var jsonCircuit = [
          {
            "type": "resistor",
            "connections": "a1,a2",
            "resistance": "100"
          },
          {
            "type": "resistor",
            "connections": "a2,a3",
            "resistance": "200"
          },
          {
            "type": "wire",
            "connections": "a1,left_positive1"
          },
          {
            "type": "wire",
            "connections": "a3,left_negative1"
          }
         ];

        breadModel("createCircuit", jsonCircuit);
        
        var result = breadModel('query', 'voltage', 'a1,a2')
        Math.round(result.meter.v[0].real).should.be 3
        var result = breadModel('query', 'voltage', 'a2,a3')
        Math.round(result.meter.v[0].real).should.be 6
      end
    
      // previously, this circuit would show a positive voltage in the voltmeter, because
      // we weren't simulating a resistance in parallel with the voltmeter:
      //
      //     +9 ___________      __R2__
      //              |   |__V__|
      //            R1
      //     0 _____|
      it "should correctly measure voltage even with a disconnected resistor"
      
        // we add a 100 ohm resistor and a 9V battery
        breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
        breadModel('insertComponent', 'resistor', {"connections": 'a3,a4', "colors": 'brown,black,brown,gold'});
        breadModel('insertComponent', 'battery', {"connections": 'a2,a1', "voltage": 9});
      
        var result = breadModel('query', 'voltage', 'a1,a3')
        Math.abs(result.meter.v[0].real).should.be_less_than 1e-4
      end
    
    
      it "should correctly measure current"
      
        // we add a 100 ohm resistor and a 5V battery
        breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
        breadModel('insertComponent', 'battery', {"connections": 'a1,a3', "voltage": 5});
        var result = breadModel('query', 'current', 'a2,a3');
        result.meter.i[0].real.should.be (5 / 100)
      end
      
      it "should correctly measure AC voltage with an added function generator"
      
        // we add a 100 ohm resistor and a 5V battery
        breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
        breadModel('insertComponent', 'function generator', {"UID": "source", "connections": 'a2,a1', "amplitude": 5, "frequencies": [1000]});
      
        var result = breadModel('query', 'ac_voltage', 'a1,a2');
        Math.abs(result.meter.v[0].real).should.be 5
      end
    
    end
    
end