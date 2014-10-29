var extend    = require('../helpers/util').extend,
    Component = require('./component');

PowerLead = function (props, breadBoard) {
  PowerLead.parentConstructor.call(this, props, breadBoard);
};

extend(PowerLead, Component, {

  getColor: function () {
    var location = this.getLocation();
    if (location.indexOf("positive") > -1) {
      return "redPowerWire";
    } else {
      return "blackPowerWire";
    }
  },

  getLocation: function () {
    return this.connections[0].getName() + ",a1";       // Flash coding issue means we need to give this a second argument...
  },

  addCiSoComponent: function () { },

  getViewArguments: null
});

module.exports = PowerLead;
