window.onunload = function() {
  if (window.moveActionCallback) {
    window.moveActionCallback();
  }
}