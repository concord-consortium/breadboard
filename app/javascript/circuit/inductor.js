/* FILE inductor.js */
//= require "component"
/*globals console sparks */

(function () {

  sparks.circuit.Inductor = function (props, breadBoard) {
    sparks.circuit.Inductor.parentConstructor.call(this, props, breadBoard);
  };

  sparks.extend(sparks.circuit.Inductor, sparks.circuit.Component, {
    init: function (id) {
      this.id = id;
    },
    
    getInductance: function () {
      return this.inductance;
    }
  });

})();
