var extend    = require('../helpers/util').extend,
    Component = require('./component');

Wire = function (props, breadboardController) {
  Wire.parentConstructor.call(this, props, breadboardController);
  this.setViewArguments({color: this.getColor()});
};

extend(Wire, Component, {

  getColor: function () {
    var location = this.getLocation();
    if (this.color) {
      return this.color;
    } else if (location.indexOf("positive") > -1) {
      return "red";
    } else if (location.indexOf("negative") > -1) {
      return "black";
    } else {
      return "green";
    }
  },

  addCiSoComponent: function (ciso) {
    var resistance  = 1e-6,
        nodes       = this.getNodes();
    ciso.addComponent(this.UID, "Resistor", resistance, nodes);
  }
});

module.exports = Wire;
