/* FILE svg_view_comm.js */

/*globals console sparks $ document window alert navigator*/

(function () {

    sparks.breadboardComm = {};

    sparks.breadboardComm.openConnections = {};

    sparks.breadboardComm.connectionMade = function(component, hole) {
      var section = sparks.activityController.currentSection,
          breadboard, comp, openConnections, openConnectionsArr, connectionReturning, connection;

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

          // check that we don't have two leads to close together
          breadModel("checkLocation", comp);
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

})();
