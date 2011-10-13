/* FILE inductor.js */
//= require "component"
/*globals console sparks */

(function () {

  sparks.circuit.Inductor = function (props, breadBoard) {
    sparks.circuit.Inductor.parentConstructor.call(this, props, breadBoard);
  };

  sparks.extend(sparks.circuit.Inductor, sparks.circuit.Component, {
    getInductance: function () {
      return this.inductance;
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
