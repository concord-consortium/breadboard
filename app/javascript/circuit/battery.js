/* FILE battery.js */
//= require "component"
/*globals console sparks */

(function () {

  sparks.circuit.Battery = function (props, breadBoard) {
    sparks.circuit.Battery.parentConstructor.call(this, props, breadBoard);
  };

  sparks.extend(sparks.circuit.Battery, sparks.circuit.Component, {
    toNetlist: function () {
      var voltage = this.voltage || 0,
          nodes      = this.getNodes();
      
      return 'Vdc:' + this.UID + ' ' + nodes[0] + ' ' + nodes[1] + ' U="' + voltage + ' V"';
    }
  });

})();
