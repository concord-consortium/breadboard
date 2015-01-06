require('../bower_components/jquery/jquery');
require('../lib/jquery/jquery-ui-1.8.24.custom.min');
require('../lib/jquery/plugins/jquery.event.drag-2.0.min');
require('../bower_components/jquery-nearest/src/jquery.nearest.min');
require('../lib/apMessageBox');
require('../bower_components/circuit-solver/dist/circuitSolver.min');

var workbenchController = require('./controllers/workbench-controller'),
    sound               = require('./helpers/sound'),
    soundFiles          = {click: "../common/sounds/click.ogg"};

loadSounds = function () {
  var soundName, audio;

  for (soundName in soundFiles) {
    if (!!window.Audio) {
      audio = new Audio();
      audio.src = soundFiles[soundName];
      sound[soundName] = audio;
    }
  }
};

$(document).ready(function () {
    loadSounds();
});

var sparks = {};

sparks.createWorkbench = function(props, elId) {
  workbenchController.createWorkbench(props, elId);
}

sparks.removeComponent = function(uid) {
  workbenchController.breadboardView.removeComponent(uid);
}

// this is probably too much access for an API, but doing it now for simplicity
sparks.workbenchController = workbenchController;

module.exports = sparks;
