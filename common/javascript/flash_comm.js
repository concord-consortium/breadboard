//= require "setup-common"

/* FILE flash_comm.js */

(function () {

    sparks.flash = {};

    sparks.flash.getFlashMovie = function (movieName) {
      var isIE = navigator.appName.indexOf("Microsoft") != -1;
      return (isIE) ? window[movieName] : document[movieName];
    };

    sparks.flash.sendCommand = function () {
      try {
        var params = [];
        for (var i = 0; i < arguments.length; ++i) {
          params[i] = arguments[i];
        }
        var flash = sparks.flash.getFlashMovie(sparks.config.flash_id);
        var retVal = flash.sendMessageToFlash.apply(flash, params).split('|');
        console.log('Returned by flash: ' + retVal);
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
      if (sparks.flash.activity) {
          return sparks.flash.activity.receiveEvent(name, value, time);
      }
        
      console.log('Received: ' + name + ', ' + value + ', ' + new Date(parseInt(time, 10)));
      var activity = sparks.activity;
      var multimeter = activity.multimeter;
      var wasConnected = multimeter.allConnected();

      if (name == 'connect') {
          var ids = value.split('|');
          if (ids[0] == 'red_probe') {
              multimeter.redProbeConnection = ids[1];
          }
          else if (ids[0] == 'black_probe') {
              multimeter.blackProbeConnection = ids[1];
          }
          else if (ids[0] == 'red_plug') {
              multimeter.redPlugConnection = ids[1];
          }
          else if (ids[0] == 'black_plug') {
              multimeter.blackPlugConnection = ids[1];
          }
          multimeter.update();
          activity.log.add(name, { conn1 : ids[0], conn2 : ids[1] });
          if (multimeter.allConnected()) {
              activity.log.add('make_circuit');
          }
      }
      else if (name == 'disconnect') {
          if (value == 'red_probe') {
              multimeter.redProbeConnection = null;
          }
          else if (value == 'black_probe') {
              multimeter.blackProbeConnection = null;
          }
          else if (value == 'red_plug') {
              multimeter.redPlugConnection = null;
          }
          else if (value == 'black_plug') {
              multimeter.blackPlugConnection = null;
          }
          multimeter.update();
          activity.log.add(name, { value: value});
          if (wasConnected) {
              activity.log.add('break_circuit');
          }
      }
      else if (name == 'multimeter_dial') {
          multimeter.dialPosition = value;
          multimeter.update();
          activity.log.add(name, { value: multimeter.dialPosition });
      }
      else if (name == 'multimeter_power') {
          multimeter.powerOn = value == 'true' ? true : false;
          multimeter.update();
          activity.log.add(name, { value: multimeter.powerOn });
          if (value === 'true' && multimeter.allConnected()) {
              activity.log.add('make_circuit');
          }
          else if (value == 'false' && wasConnected) {
              activity.log.add('break_circuit');
          }
      }
      else if (name == 'not_ready') {
          alert('Sorry, you can only access the circuit after you have answered question #1.');
      }
    };

})();
