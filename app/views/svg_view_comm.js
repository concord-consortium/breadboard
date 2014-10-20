/* FILE svg_view_comm.js */

/*globals console sparks $ document window alert navigator*/

(function () {

    sparks.breadboardComm = {};

    sparks.breadboardComm.openConnections = {};

    sparks.breadboardComm.connectionMade = function(component, hole) {
      var workbench = sparks.workbenchController.workbench,
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
              sparks.workbenchController.workbench.meter.moveProbe(connection, hole);
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
      workbench.meter.update();
    };

    sparks.breadboardComm.connectionBroken = function(component, hole) {
      if (!sparks.breadboardComm.openConnections[component]) {
        sparks.breadboardComm.openConnections[component] = {}
      }
      sparks.breadboardComm.openConnections[component][hole] = true;

      var workbench = sparks.workbenchController.workbench;
      var newHole = breadModel('getGhostHole', hole+"ghost");

      breadModel('mapHole', hole, newHole.nodeName());
      sparks.logController.addEvent(sparks.LogEvent.CHANGED_CIRCUIT, {
        "type": "disconnect lead",
        "location": hole});
      workbench.meter.update();
    };

    sparks.breadboardComm.probeAdded = function(meter, color, location) {
      var workbench = sparks.workbenchController.workbench;
      workbench.meter.setProbeLocation("probe_"+color, location);
      sparks.sound.play(sparks.sound.click)
    };

    sparks.breadboardComm.probeRemoved = function(meter, color) {
      var workbench = sparks.workbenchController.workbench;
      workbench.meter.setProbeLocation("probe_"+color, null);
    };

    sparks.breadboardComm.dmmDialMoved = function(value) {
      var workbench = sparks.workbenchController.workbench;
      workbench.meter.dmm.dialPosition = value;
      workbench.meter.update();
    };

})();
