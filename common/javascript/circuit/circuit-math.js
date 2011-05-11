//= require "breadboard"

/*globals console sparks getBreadBoard*/

(function () {
    sparks.circuitMath = function(){};
    
    sparks.circuitMath.prototype = {
      
      getResistors: function(resistorNames) {
        var resistors = [];
        var components = getBreadBoard().components;
        $.each(resistorNames, function(i, name){
          if (!!components[name]){
            resistors.push(components[name]);
          } else {
            console.log("ERROR: "+name+" cannot be found on breadboard");
          }
        });
        return resistors;
      },
      
      rSeries: function() {
        var resistors = this.getResistors(arguments);
        
        var resistance = 0;
        $.each(resistors, function(i, resistor){
          resistance += resistor.resistance;
        });
        return resistance;
      },
      
      rParallel: function() {
        var resistors = this.getResistors(arguments);
        
        var resistance = 0;
        $.each(resistors, function(i, resistor){
          resistance += (1/resistor.resistance);
        });
        return (1/resistance);
      },
      
      rNominalSeries: function() {
        var resistors = this.getResistors(arguments);
        console.log("woo")
        var resistance = 0;
        $.each(resistors, function(i, resistor){
          console.log("adding "+resistor.nominalResistance)
          resistance += resistor.nominalResistance;
        });
        return resistance;
      },
      
      rNominalParallel: function() {
        var resistors = this.getResistors(arguments);
        
        var resistance = 0;
        $.each(resistors, function(i, resistor){
          resistance += (1/resistor.nominalResistance);
        });
        return (1/resistance);
      },
      
      vDiv: function(x, y){
        var resistors = this.getResistors(arguments);
        return resistors[0].resistance / (resistors[0].resistance + resistors[1].resistance);
      }
    };
    
    this.cMath = new sparks.circuitMath();
    
})();