//= require setup-common
//= require jquery/jquery-1.8.1.min
//= require jquery/jquery-ui-1.8.24.custom.min
//= require circuitSolver.min
//= require jquery/plugins/jquery.url.packed
//= require jquery/plugins/jquery.cookie
//= require jquery/plugins/jquery.easyTooltip
//= require jquery/plugins/jquery.tablesorter.min
//= require jquery/plugins/jquery.event.drag-2.0.min
//= require jquery/plugins/jquery.flashembed
//= require data-source/couch-ds
//= require helpers/util
//= require helpers/unit
//= require models/log
//= require models/meter
//= require models/oscilloscope
//= require models/workbench
//= require views/oscilloscope-view
//= require views/function-generator-view
//= require views/breadboard-svg-view
//= require views/add-components-view
//= require views/svg_view_comm
//= require views/workbench-view
//= require controllers/log-controller
//= require controllers/workbench-controller
//= require helpers/math-parser
//= require helpers/string
//= require helpers/ui
//= require helpers/complex-number
//= require circuit/breadboard
//= require circuit/multimeter2
//= require circuit/resistor-4band
//= require circuit/resistor-5band
//= require circuit/circuit-math
//= require circuit/inductor
//= require circuit/capacitor
//= require circuit/battery
//= require circuit/function-generator
//= require circuit/wire
//= require circuit/power-lead
//= require apMessageBox
//= require helpers/math
//= require helpers/ga-helper

/* FILE init.js */

/*global Audio console sparks $ document window onDocumentReady unescape prompt apMessageBox*/

(function () {

  sparks.activity_base_url = "/sparks-activities/";
  sparks.activity_images_base_url = "/sparks-activities/images/";
  sparks.soundFiles = {click: "../common/sounds/click.ogg"};

  window._gaq = window._gaq || [];      // in case this script loads before the GA queue is created

  loadSounds = function () {
    var soundName, audio;

    sparks.sound = {};

    sparks.sound.mute = false;

    sparks.sound.play = function (sound) {
      if (!!window.Audio && !sparks.sound.mute) {
        sound.play();
      }
    }

    for (soundName in sparks.soundFiles) {
      if (!!window.Audio) {
        audio = new Audio();
        audio.src = sparks.soundFiles[soundName];
        sparks.sound[soundName] = audio;
      }
    }
  };

  $(document).ready(function () {
      loadSounds();
  });
})();
