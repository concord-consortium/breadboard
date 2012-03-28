//= require "resistor"
//= require "r-values"
/*globals console sparks $ breadModel getBreadBoard */

/* FILE variable-resistor.js */

(function () {
    
    var circuit = sparks.circuit;

    circuit.VariableResistor = function (props, breadBoard) {
      sparks.circuit.Resistor.parentConstructor.call(this, props, breadBoard);
      var superclass = sparks.circuit.VariableResistor.uber;
      superclass.init.apply(this, [props.UID]);
      this.resistance = this.minimumResistance;
    };
    
    sparks.extend(circuit.VariableResistor, circuit.Resistor, {
        
      getMinResistance: function() {
        return this.minimumResistance;
      },
      
      getMaxResistance: function() {
        return this.maximumResistance;
      },
      
      scaleResistance: function(value) {
        var perc = value / 10,       // values are 0-10
            range = this.maximumResistance - this.minimumResistance,
            newValue = this.minimumResistance + (range * perc);
        this.resistance = newValue;
      },
      
      getFlashArguments: function() {
        if (this.resistance > 0) {
          return ['slider', this.UID, this.getLocation(), this.label];
        }
      }
      
    });

})();
