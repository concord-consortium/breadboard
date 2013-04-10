/* FILE battery.js */
//= require "component"
/*global sparks */

(function () {

  sparks.circuit.Wire = function (props, breadBoard) {
    sparks.circuit.Wire.parentConstructor.call(this, props, breadBoard);
    this.setViewArguments({color: this.getColor()});
  };

  sparks.extend(sparks.circuit.Wire, sparks.circuit.Component, {

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

})();
