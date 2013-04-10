/* FILE battery.js */
//= require "component"
/*global sparks */

(function () {

  sparks.circuit.Battery = function (props, breadBoard) {
    var range;

    sparks.circuit.Battery.parentConstructor.call(this, props, breadBoard);

    // if voltages are specified as an array, then if it has only value, set the
    // voltage to that value, otherwise set it to a random voltage between the first
    // and second values
    if (this.voltage && this.voltage.length) {
      if (this.voltage.length === 1) {
        this.voltage = this.voltage[0];
      } else {
        range = this.voltage[1] - this.voltage[0];
        this.voltage = this.voltage[0] + (Math.random() * range);
      }
    }
  };

  sparks.extend(sparks.circuit.Battery, sparks.circuit.Component, {
    addCiSoComponent: function (ciso) {
      var voltage = this.voltage || 0,
          nodes      = this.getNodes();

      ciso.addVoltageSource(this.UID, voltage, nodes[0], nodes[1]);
    }
  });

})();
