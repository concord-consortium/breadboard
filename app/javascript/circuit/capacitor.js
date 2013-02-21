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
      return 1 / (impedance * 2 * Math.PI * frequency);
    },

    addCiSoComponent: function (ciso) {
      var capacitance = this.getCapacitance() || 0,
          nodes       = this.getNodes();
      ciso.addComponent(this.UID, "Capacitor", capacitance, nodes);
    },

    getFlashArguments: function () {
      return ['capacitor', this.UID, this.getLocation(), this.label];
    }
  });

})();
