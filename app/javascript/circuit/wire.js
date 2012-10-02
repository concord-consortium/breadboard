/* FILE battery.js */
//= require "component"
/*globals console sparks */

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

    toNetlist: function () {
      var voltage = this.voltage || 0,
          nodes      = this.getNodes();

      return 'TLIN:' + this.UID + ' ' + nodes[0] + ' ' + nodes[1] + ' Z="0.000001 Ohm" L="1 mm" Alpha="0 dB"';
    }
  });

})();
