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
    
    toNetlist: function () {
      var voltage = this.voltage || 0,
          nodes      = this.getNodes();
      
      return 'TLIN:' + this.UID + ' ' + nodes[0] + ' ' + nodes[1] + ' Z="0.000001 Ohm" L="1 mm" Alpha="0 dB"';
    },
    
    getFlashArguments: function () {
      return ['wire', this.UID, this.getLocation(), this.getColor()];
    }
  });

})();
