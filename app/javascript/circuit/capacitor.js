/* FILE capacitor.js */
//= require "reactive-component"
/*globals console sparks */

(function () {

  sparks.circuit.Capacitor = function (props, breadBoard) {
    sparks.circuit.Capacitor.parentConstructor.call(this, props, breadBoard);
  };

  sparks.extend(sparks.circuit.Capacitor, sparks.circuit.ReactiveComponent, {

    getCapacitance: function () {
      return this.getComponentParameter('capacitance', this.capacitanceFromImpedance);
    },

    capacitanceFromImpedance: function (impedance, frequency) {
      return impedance * 2 * Math.PI * frequency;
    },

    toNetlist: function () {
      var capacitance = this.getCapacitance() || 0,
          nodes       = this.getNodes();

      return 'C:' + this.UID + ' ' + nodes[0] + ' ' + nodes[1] + ' C="' + capacitance + ' F"';
    },

    getFlashArguments: function () {
      return ['capacitor', this.UID, this.getLocation(), this.label];
    }
  });

})();
