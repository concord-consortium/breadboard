function getFlashMovie(movieName) {
  var isIE = navigator.appName.indexOf("Microsoft") != -1;
  return (isIE) ? window[movieName] : document[movieName];
}  

function sendCommand() {
  var params = [];
  for (var i = 0; i < arguments.length; ++i) {
      params[i] = arguments[i];
  }
  flash = getFlashMovie("my");
  retVal = flash.sendMessageToFlash.apply(flash, params);
  console.log('Returned by flash: ' + retVal);
}

function receiveEvent(name, value, time) {
  console.log('received: ' + name + ', ' + value + ', ' + new Date(parseInt(time)));
}
