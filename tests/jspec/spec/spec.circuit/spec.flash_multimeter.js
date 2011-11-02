describe 'Using multimeter with mock Flash connection'
    before
      sparks.activityController.reset();
      stub(sparks.util, 'readCookie').and_return(null);
      mock_request().and_return(sparks.jsonSection, 'application/javascript', 200)
      sparks.config.qucsate_server_url = "http://localhost:1234/sparks/qucsator/solve";
      onDocumentReady();
      unmock_request();
    end
    
    before_each
      breadModel('clear');
      receiveEvent('disconnect', 'probe|probe_black', 0);
      receiveEvent('disconnect', 'probe|probe_red', 0);
    end
    
    it "should call update when a probe is added"
     
      // we add a 100 ohm resistor
      breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
      
      var updateCalled = false;
      
      var oldUpdate = sparks.circuit.Multimeter2.prototype.update;
      sparks.circuit.Multimeter2.prototype.update = function() {
        updateCalled = true;
      }
      
      receiveEvent('connect', 'probe|probe_red|a2', 0);
      
      updateCalled.should.be true
      
      sparks.circuit.Multimeter2.prototype.update = oldUpdate;
      
    end
    
    it "should send a command to flash when both probes are added"
           
      // we add a 100 ohm resistor
      breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
      
      var sendCalled = false;
      
      var oldSendCommand = sparks.flash.sendCommand;
      sparks.flash.sendCommand = function() {
        sendCalled = true;
      }
      
      receiveEvent('connect', 'probe|probe_black|a1', 0);
      receiveEvent('connect', 'probe|probe_red|a2', 0);
      
      sendCalled.should.be true
      
      sparks.flash.sendCommand = oldSendCommand;
      
    end
    
    it "should send a resistance to flash when in res mode and both probes added"
      
      // we add a 100 ohm resistor
      breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
      
      var sendCalled = false;
      var oldSendCommand = sparks.flash.sendCommand;
      
      sparks.flash.sendCommand = function(command, value) {
        command.should.be "set_multimeter_display"
        value.should.be " 1   . "
        sendCalled = true;
      }
      
      receiveEvent('multimeter_dial', 'r_200', 0);          // will call first sendCommand
      receiveEvent('connect', 'probe|probe_black|a1', 0);   // will call first sendCommand
      sendCalled.should.be true
      
      var sendCalled = false;
      
      sparks.flash.sendCommand = function(command, value) {
        command.should.be "set_multimeter_display"
        value.should.be " 10 0.0"
        sendCalled = true;
      }
      
      receiveEvent('connect', 'probe|probe_red|a2', 0);     // will call second sendCommand
      sendCalled.should.be true
      
      
      sparks.flash.sendCommand = oldSendCommand;
      
    end
    
    it "should send a voltage to flash when in voltage mode and both probes added"
           
      // we add a 100 ohm resistor
      breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
      breadModel('insertComponent', 'battery', {"connections": 'b1,b2', "voltage": 9});
      
      var sendCalled = false;
      var oldSendCommand = sparks.flash.sendCommand;
      
      sparks.flash.sendCommand = function(command, value) {
        command.should.be "set_multimeter_display"
        value.should.be "  0.0 0"
        sendCalled = true;
      }
      
      receiveEvent('multimeter_dial', 'dcv_20', 0);          // will call first sendCommand
      receiveEvent('connect', 'probe|probe_black|a1', 0);   // will call first sendCommand
      sendCalled.should.be true
      
      var sendCalled = false;
      
      sparks.flash.sendCommand = function(command, value) {
        command.should.be "set_multimeter_display"
        value.should.be "  9.0 0"
        sendCalled = true;
      }
      
      receiveEvent('connect', 'probe|probe_red|a2', 0);     // will call second sendCommand
      sendCalled.should.be true
      
      
      sparks.flash.sendCommand = oldSendCommand;
      
    end
    
    it "should send a RMS voltage to flash when in ac_voltage mode and both probes added"
           
      // we add a 100 ohm resistor
      breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
      breadModel('insertComponent', 'function generator', {"UID": "source", "connections": 'b1,b2', "amplitude": 5, "frequencies": [1000]});
      
      var sendCalled = false;
      var oldSendCommand = sparks.flash.sendCommand;
      
      sparks.flash.sendCommand = function(command, value) {
        command.should.be "set_multimeter_display"
        value.should.be "  0 0.0"
        sendCalled = true;
      }
      
      receiveEvent('multimeter_dial', 'acv_200', 0);          // will call first sendCommand
      receiveEvent('connect', 'probe|probe_black|a1', 0);     // will call first sendCommand
      sendCalled.should.be true
      
      var sendCalled = false;
      
      sparks.flash.sendCommand = function(command, value) {
        command.should.be "set_multimeter_display"
        value.should.be "  0 3.5"
        sendCalled = true;
      }
      
      receiveEvent('connect', 'probe|probe_red|a2', 0);     // will call second sendCommand
      sendCalled.should.be true
      
      var sendCalled = false;
      
      sparks.flash.sendCommand = function(command, value) {
        command.should.be "set_multimeter_display"
        value.should.be "h 0 0 4"
        sendCalled = true;
      }
      
      receiveEvent('multimeter_dial', 'acv_750', 0);     // will call third sendCommand
      sendCalled.should.be true
      
      sparks.flash.sendCommand = oldSendCommand;
      
    end
    
    it "should send pick the right RMS voltage if there are multiple frequencies"
           
      breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
      breadModel('insertComponent', 'capacitor', {"connections": 'a2,a3', "capacitance": 0.00001});
      breadModel('insertComponent', 'function generator', {"UID": "source", "connections": 'b1,b3', "amplitude": 5, "frequencies": [100, 1000]});
      
      receiveEvent('multimeter_dial', 'acv_200', 0);
      receiveEvent('connect', 'probe|probe_black|a1', 0);
      
      var sendCalled = false;
      var oldSendCommand = sparks.flash.sendCommand;
      
      sparks.flash.sendCommand = function(command, value) {
        command.should.be "set_multimeter_display"
        value.should.be "  0 1.9"
        sendCalled = true;
      }
      
      receiveEvent('connect', 'probe|probe_red|a2', 0);     // will call sendCommand
      sendCalled.should.be true
      
      var sendCalled = false;
      
      sparks.flash.sendCommand = function(command, value) {
        command.should.be "set_multimeter_display"
        value.should.be "  0 3.5"
        sendCalled = true;
      }
      
      getBreadBoard().components.source.setFrequency(1000); // will call second sendCommand
      sendCalled.should.be true
      
      sparks.flash.sendCommand = oldSendCommand;
      
    end
    
    it "should send show zero volts if measuring an AC circuit with DC_V"
           
      // we add a 100 ohm resistor
      breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
      breadModel('insertComponent', 'function generator', {"UID": "source", "connections": 'b1,b2', "amplitude": 5, "frequencies": [1000]});
      
      
      
      receiveEvent('multimeter_dial', 'dcv_20', 0);
      receiveEvent('connect', 'probe|probe_black|a1', 0);
      
      var oldSendCommand = sparks.flash.sendCommand;
      var sendCalled = false;
      sparks.flash.sendCommand = function(command, value) {
        command.should.be "set_multimeter_display"
        value.should.be "  0.0 0"
        sendCalled = true;
      }
      
      receiveEvent('connect', 'probe|probe_red|a2', 0);     // will call sendCommand
      sendCalled.should.be true
      
      sparks.flash.sendCommand = oldSendCommand;
      
    end
    
    it "should send show zero volts if measuring an DC circuit with AC_V"
           
      // we add a 100 ohm resistor
      breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
      breadModel('insertComponent', 'battery', {"UID": "source", "connections": 'b1,b2', "voltage": 5});
      
      
      
      receiveEvent('multimeter_dial', 'acv_200', 0);
      receiveEvent('connect', 'probe|probe_black|a1', 0);
      
      var oldSendCommand = sparks.flash.sendCommand;
      var sendCalled = false;
      sparks.flash.sendCommand = function(command, value) {
        command.should.be "set_multimeter_display"
        value.should.be "  0 0.0"
        sendCalled = true;
      }
      
      receiveEvent('connect', 'probe|probe_red|a2', 0);     // will call sendCommand
      sendCalled.should.be true
      
      sparks.flash.sendCommand = oldSendCommand;
      
    end
    
    it "should pop up a warning if we blow the fuse"
           
      // we add a 100 ohm resistor
      breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
      breadModel('insertComponent', 'battery', {"connections": 'b1,b2', "voltage": 9});
      
      var messageShown = false;
      var oldMessageCommand = apMessageBox.error;
      
      apMessageBox.error = function() {
        messageShown = true;
      }
      
      receiveEvent('multimeter_dial', 'dcv_20', 0);
      receiveEvent('connect', 'probe|probe_black|a1', 0);
      receiveEvent('connect', 'probe|probe_red|a2', 0);
      
      messageShown.should.be false
      
      receiveEvent('multimeter_dial', 'dca_200m', 0);
      
      messageShown.should.be true
      
      // change dial to volts, should not call message
      messageShown = false
      receiveEvent('multimeter_dial', 'dcv_20', 0);
      messageShown.should.be false
      
      // reset to amps. After getting the message move leads. Should not fire message
      receiveEvent('multimeter_dial', 'dca_200m', 0);
      messageShown = false
      receiveEvent('connect', 'probe|probe_black|a2', 0);
      messageShown.should.be false
      
      // move leads back with still set on amps. Should fire
      receiveEvent('connect', 'probe|probe_black|a1', 0);
      messageShown.should.be true
      
      apMessageBox.error = oldMessageCommand;
      
    end

    
 
    
end