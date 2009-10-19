function getFlashMovie(movieName) {
  var isIE = navigator.appName.indexOf("Microsoft") != -1;
  return (isIE) ? window[movieName] : document[movieName];
}  

function sendCommand() {
  var params = [];
  for (var i = 0; i < arguments.length; ++i) {
      params[i] = arguments[i];
  }
  flash = getFlashMovie("resistor_colors");
  retVal = flash.sendMessageToFlash.apply(flash, params);
  console.log('Returned by flash: ' + retVal);
}

function receiveEvent(name, value, time) {
  console.log('received: ' + name + ', ' + value + ', ' + new Date(parseInt(time)));
  var activity = jQuery.sparks.activity;
  var multimeter = activity.multimeter;
  
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
  }
  else if (name == 'multimeter_dial') {
      multimeter.dialPosition = value;
      multimeter.update();
  }
  else if (name == 'multimeter_power') {
      multimeter.powerOn = value == 'true' ? true : false;
      multimeter.update();
  }
  else if (name == 'not_ready') {
      alert('Sorry, you can only access the circuit after you have answered question #1.');
  }
}
