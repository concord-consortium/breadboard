/* FILE flash_comm.js */

/*globals console sparks $ document window alert navigator*/

(function () {

    sparks.flash = {};
    
    sparks.flash.loaded = false;
    
    sparks.flash.queuedMessages = [];
    
    sparks.flash.init = function() {
      sparks.flash.loaded = true;
      var length = sparks.flash.queuedMessages.length;
      for (var i = 0; i < length; i++){
        sparks.flash.sendCommand.apply(this, sparks.flash.queuedMessages.pop());
      }
    };

    sparks.flash.getFlashMovie = function (movieName) {
      var isIE = navigator.appName.indexOf("Microsoft") != -1;
      return (isIE) ? window[movieName] : document[movieName];
    };

    sparks.flash.sendCommand = function () {
      if (!sparks.flash.loaded){
        sparks.flash.queuedMessages.push(arguments);
        return;
      }
      
      try {
        var params = [];
        for (var i = 0; i < arguments.length; ++i) {
          params[i] = arguments[i];
        }
        var flash = sparks.flash.getFlashMovie(sparks.config.flash_id);
        
        var retVal = flash.sendMessageToFlash.apply(flash, params).split('|');
        if (retVal[0] == 'flash_error') {
          alert('Flash error:\n' + retVal[1]);
        }
      }
      catch (e) {
        alert('Error sending command to Flash:\n' + e.toString());
      }
    };

    // To be called from Flash thru ExternalInterface
    this.receiveEvent = function (name, value, time) {
      console.log('ENTER sm.Activity#receiveEvent');
      console.log('Received: ' + name + ', ' + value + ', ' + new Date(parseInt(time, 10)));
      
      var v;
      var t = '';
      var args = value.split('|');
      
      var section = sparks.activityController.currentSection;
      
      if (name === 'connect') {
          if (args[0] === 'probe') {
            section.meter.setProbeLocation(args[1], args[2]);
          }
          if (args[0] === 'component') {
              // for now, we're just dealing with the situation of replacing one lead that had been lifted
              if (!!args[2]){
                breadModel('unmapHole', args[2]);
              }
              sparks.logController.addEvent(sparks.LogEvent.CHANGED_CIRCUIT, {
                "type": "connect lead", 
                "location": args[2]});
              section.meter.update();
          }
      } else if (name === 'disconnect') {
          if (args[0] === 'probe') {
            section.meter.setProbeLocation(args[1], null);
          } else if (args[0] === 'component') {
            var hole = args[2];
            var newHole = breadModel('getGhostHole', hole+"ghost");
            
            breadModel('mapHole', hole, newHole.nodeName());
            sparks.logController.addEvent(sparks.LogEvent.CHANGED_CIRCUIT, {
              "type": "disconnect lead", 
              "location": hole});
            section.meter.update();
          }
      } else if (name === 'probe') {
          $('#popup').dialog();
          
          v = breadModel('query', 'voltage', 'a23,a17');
          t += v.toFixed(3);
          v = breadModel('query', 'voltage', 'b17,b11');
          t += ' ' + v.toFixed(3);
          v = breadModel('query', 'voltage', 'c11,c5');
          t += ' ' + v.toFixed(3);
          $('#dbg_voltage').text(t);

          // Disconnect wire1
          breadModel('move', 'wire1', 'left_positive1,a22');
          
          v = breadModel('query', 'resistance', 'a23,a17');
          t = v.toFixed(3);
          v = breadModel('query', 'resistance', 'b17,b11');
          t += ' ' + v.toFixed(3);
          v = breadModel('query', 'resistance', 'c11,c5');
          t += ' ' + v.toFixed(3);
          
          $('#dbg_resistance').text(t);
          
          v = breadModel('query', 'current', 'a22,a23');
          t = v.toFixed(3);
          
          breadModel('move', 'wire1', 'left_positive1,a23');
          breadModel('move', 'resistor1', 'a23,a16');
          v = breadModel('query', 'current', 'a16,b17');
          t += ' ' + v.toFixed(3);
          
          breadModel('move', 'resistor1', 'a23,a17');
          breadModel('move', 'resistor2', 'b17,b10');
          v = breadModel('query', 'current', 'b10,c11');
          t += ' ' + v.toFixed(3);
          
          breadModel('move', 'resistor2', 'b17,b11');
          
          $('#dbg_current').text(t);

          $('#popup').dialog('close');
      } else if (name == 'multimeter_dial') {
          section.meter.dmm.dialPosition = value;
          section.meter.update();
          // activity.log.add(name, { value: this.multimeter.dialPosition });
      } else if (name == 'multimeter_power') {
          section.meter.dmm.powerOn = value == 'true' ? true : false;
          section.meter.update();
          // activity.log.add(name, { value: this.multimeter.powerOn });
          //                 if (value === 'true' && this.multimeter.allConnected()) {
          //                     activity.log.add('make_circuit');
          //                 } else if (value == 'false' && wasConnected) {
          //                     activity.log.add('break_circuit');
          //                 }
      }
  }

})();
