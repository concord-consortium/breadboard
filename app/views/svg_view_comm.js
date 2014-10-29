/*globals console sparks $ document window alert navigator*/
var LogEvent            = require('../models/log'),
    util                = require('../helpers/util'),
    sound               = require('../helpers/sound'),
    logController       = require('../controllers/log-controller');

breadboardComm = {};

breadboardComm.openConnections = {};

breadboardComm.connectionMade = function(workbench, component, hole) {
  var breadboard, comp, openConnections, openConnectionsArr, connectionReturning, connection;

  if (!!hole){
    openConnections = breadboardComm.openConnections[component];
    if (!openConnections) return; // shouldn't happen

    if (openConnections[hole]) {        // if we're just replacing a lead
      breadModel('unmapHole', hole);
      delete openConnections[hole];
    } else {                            // if we're putting lead in new hole
      breadboard = getBreadBoard();
      comp = breadboard.components[component];
      // transform to array
      openConnectionsArr = util.getKeys(openConnections);
      // pick first open lead
      connectionReturning = openConnectionsArr[0];
      breadModel('unmapHole', connectionReturning);
      //swap
      for (var i = 0; i < comp.connections.length; i++) {
        connection = comp.connections[i].getName();
        if (connection === connectionReturning) {
          comp.connections[i] = breadboard.getHole(hole);
          delete openConnections[connection];
          workbench.meter.moveProbe(connection, hole);
          break;
        }
      }

      // check that we don't have two leads to close together
      breadModel("checkLocation", comp);
    }

  }
  logController.addEvent(LogEvent.CHANGED_CIRCUIT, {
    "type": "connect lead",
    "location": hole});
  workbench.meter.update();
};

breadboardComm.connectionBroken = function(workbench, component, hole) {
  if (!breadboardComm.openConnections[component]) {
    breadboardComm.openConnections[component] = {}
  }
  breadboardComm.openConnections[component][hole] = true;

  var newHole = breadModel('getGhostHole', hole+"ghost");

  breadModel('mapHole', hole, newHole.nodeName());
  logController.addEvent(LogEvent.CHANGED_CIRCUIT, {
    "type": "disconnect lead",
    "location": hole});
  workbench.meter.update();
};

breadboardComm.probeAdded = function(workbench, meter, color, location) {
  workbench.meter.setProbeLocation("probe_"+color, location);
  sound.play(sound.click)
};

breadboardComm.probeRemoved = function(workbench, meter, color) {
  workbench.meter.setProbeLocation("probe_"+color, null);
};

breadboardComm.dmmDialMoved = function(workbench, value) {
  workbench.meter.dmm.dialPosition = value;
  workbench.meter.update();
};

module.exports = breadboardComm;
