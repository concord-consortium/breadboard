require('../lib/jquery/jquery-1.8.1.min');
require('../lib/jquery/jquery-ui-1.8.24.custom.min');
require('../lib/circuitSolver.min');
require('../lib/jquery/plugins/jquery.url.packed');
require('../lib/jquery/plugins/jquery.cookie');
require('../lib/jquery/plugins/jquery.easyTooltip');
require('../lib/jquery/plugins/jquery.tablesorter.min');
require('../lib/jquery/plugins/jquery.event.drag-2.0.min');
require('../lib/jquery/plugins/jquery.flashembed');
require('../lib/apMessageBox');
require('../lib/raphael-min');

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

module.exports = sparks;
