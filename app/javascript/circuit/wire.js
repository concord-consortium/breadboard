/* FILE battery.js */
//= require "component"
/*globals console sparks */

(function () {

  sparks.circuit.Wire = function (props, breadBoard) {
    sparks.circuit.Wire.parentConstructor.call(this, props, breadBoard);
  };

  sparks.extend(sparks.circuit.Wire, sparks.circuit.Component, {
    getColor: function () {
      var location = this.getLocation();
      if (location.indexOf("positive") > -1) {
        return "0xaa0000";
      } else if (location.indexOf("negative") > -1) {
        return "0x000000";
      } else {
        if (Math.random() < 0.5){
          return "0x008800";
        } else {
          return "0x000088";
        }
      }
    },

    addCiSoComponent: function (ciso) {
      var resistance  = 1e-6,
          nodes       = this.getNodes();
      ciso.addComponent(this.UID, "Resistor", resistance, nodes);
    },

    getFlashArguments: function () {
      return ['wire', this.UID, this.getLocation(), this.getColor()];
    }
  });

})();
