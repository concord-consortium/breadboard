var extend    = require('../helpers/util').extend,
    Component = require('./component');

Wire = function (props, breadboardController) {
  Wire.parentConstructor.call(this, props, breadboardController);
  this.setViewArguments({color: this.getColor()});
};

extend(Wire, Component, {

  getColor: function () {
    var location = this.getLocation();
    if (location.indexOf("positive") > -1) {
      return "red";
    } else if (location.indexOf("negative") > -1) {
      return "black";
    } else {
      if (Math.random() < 0.5){
        return "green";
      } else {
        return "blue";
      }
    }
  },

  addCiSoComponent: function (ciso) {
    var resistance  = 1e-6,
        nodes       = this.getNodes();
    ciso.addComponent(this.UID, "Resistor", resistance, nodes);
  }
});

module.exports = Wire;
