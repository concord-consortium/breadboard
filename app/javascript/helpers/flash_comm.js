/* FILE flash_comm.js */

/*globals console sparks $ document window alert navigator*/

(function () {

    sparks.breadboardComm = {};

    sparks.breadboardComm.openConnections = {};

    sparks.breadboardComm.connectionMade = function(component, hole) {
      var section = sparks.activityController.currentSection,
          breadboard, comp, openConnections, openConnectionsArr, connectionReturning, connection;
      // for now, we're just dealing with the situation of replacing one lead that had been lifted
      if (!!hole){
        openConnections = sparks.breadboardComm.openConnections[component];
        if (!openConnections) return; // shouldn't happen

        if (openConnections[hole]) {        // if we're just replacing a lead
          breadModel('unmapHole', hole);
          delete openConnections[hole];
        } else {                            // if we're putting lead in new hole
          breadboard = getBreadBoard();
          comp = breadboard.components[component];
          // transform to array
          openConnectionsArr = sparks.util.getKeys(openConnections);
          // pick first open lead
          connectionReturning = openConnectionsArr[0];
          breadModel('unmapHole', connectionReturning);
          //swap
          for (var i = 0; i < comp.connections.length; i++) {
            connection = comp.connections[i].getName();
            if (connection === connectionReturning) {
              comp.connections[i] = breadboard.getHole(hole);
              delete openConnections[connection];
              sparks.activityController.currentSection.meter.moveProbe(connection, hole);
              break;
            }
          }
        }

      }
      sparks.logController.addEvent(sparks.LogEvent.CHANGED_CIRCUIT, {
        "type": "connect lead",
        "location": hole});
      section.meter.update();
    };

    sparks.breadboardComm.connectionBroken = function(component, hole) {
      if (!sparks.breadboardComm.openConnections[component]) {
        sparks.breadboardComm.openConnections[component] = {}
      }
      sparks.breadboardComm.openConnections[component][hole] = true;

      var section = sparks.activityController.currentSection;
      var newHole = breadModel('getGhostHole', hole+"ghost");

      breadModel('mapHole', hole, newHole.nodeName());
      sparks.logController.addEvent(sparks.LogEvent.CHANGED_CIRCUIT, {
        "type": "disconnect lead",
        "location": hole});
      section.meter.update();
    };

    sparks.breadboardComm.probeAdded = function(meter, color, location) {
      var section = sparks.activityController.currentSection;
      section.meter.setProbeLocation("probe_"+color, location);
      sparks.sound.play(sparks.sound.click)
    };

    sparks.breadboardComm.probeRemoved = function(meter, color) {
      var section = sparks.activityController.currentSection;
      section.meter.setProbeLocation("probe_"+color, null);
    };

    sparks.breadboardComm.dmmDialMoved = function(value) {
      var section = sparks.activityController.currentSection;
      section.meter.dmm.dialPosition = value;
      section.meter.update();
    };

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
      console.log('Received: ' + name + ', ' + value + ', ' + new Date(parseInt(time, 10)));

      var v;
      var t = '';
      var args = value.split('|');

      var section = sparks.activityController.currentSection;

      if (name === 'connect') {
          if (args[0] === 'probe' && !!args[2]) {
            section.meter.setProbeLocation(args[1], args[2]);
          }
          if (args[0] === 'component') {
              if (args[2] === "left_positive21" || args[2] === "left_negative21") {
                // bad hardcoding: pretending left_positive21 (power lead connection) == left_positive1 (source connection)
                // args[2] = args[2].replace("2", "");
              }
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
            if (hole === "left_positive21" || hole === "left_negative21") {
                // bad hardcoding: pretending left_positive21 (power lead connection) == left_positive1 (source connection)
              // hole = hole.replace("2", "");
            }
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
      } else if (name == 'value_changed') {
        var component = getBreadBoard().components[args[0]];
        if (component.scaleResistance) {
          component.scaleResistance(args[1]);
          section.meter.update();
        }
      }
  }

})();
