/* FILE powerlead.js */
//= require "component"
/*globals console sparks */

(function () {

  sparks.circuit.PowerLead = function (props, breadBoard) {
    sparks.circuit.PowerLead.parentConstructor.call(this, props, breadBoard);
  };

  sparks.extend(sparks.circuit.PowerLead, sparks.circuit.Component, {

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

    addCiSoComponent: function (ciso) { },

    toNetlist: function () {
      return '';
    },

    getFlashArguments: function () {
      return [this.getColor(), this.UID, this.getLocation()];
    }
  });

})();
