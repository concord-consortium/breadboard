/* FILE inductor.js */
//= require "reactive-component"
/*globals console sparks */

(function () {

  sparks.circuit.Inductor = function (props, breadBoard) {
    sparks.circuit.Inductor.parentConstructor.call(this, props, breadBoard);
  };

  sparks.extend(sparks.circuit.Inductor, sparks.circuit.ReactiveComponent, {

    getInductance: function () {
      return this.getComponentParameter('inductance', this.inductanceFromImpedance);
    },

    inductanceFromImpedance: function (impedance, frequency) {
      return impedance / (2 * Math.PI * frequency);
    },

    toNetlist: function () {
      var inductance = this.getInductance() || 0,
          nodes      = this.getNodes();

      return 'L:' + this.UID + ' ' + nodes[0] + ' ' + nodes[1] + ' L="' + inductance + ' H"';
    },

    getFlashArguments: function () {
      return ['inductor', this.UID, this.getLocation(), this.label];
    }
  });

})();
