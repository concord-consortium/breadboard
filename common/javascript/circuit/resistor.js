/* FILE resistor.js */
//= require "component"
/*globals console sparks */

(function () {

    var flash = sparks.flash;

    sparks.circuit.Resistor = function (props, breadBoard) {
      sparks.circuit.Resistor.parentConstructor.call(this, props, breadBoard);
      
      // if we have colors defined and not resistance
      if ((this.resistance === undefined) && this.colors){
        this.resistance = this.getResistance( this.colors );
      }
      
      // if we have neither colors nor resistance
      if ((this.resistance === undefined) && !this.colors) {
        var resistor = new sparks.circuit.Resistor4band(name);
        resistor.randomize(null);
        this.resistance = resistor.getRealValue();
        this.tolerance = resistor.tolerance;
        this.colors = resistor.colors;
      }
      
      // if we have resistance and no colors
      if (!this.colors){
        this.colors = this.getColors4Band( this.resistance, (!!this.tolerance ? this.tolerance : 0.05));
      }
      
      // at this point, we must have both real resiatance and colors
      // calculate nominal resistance
      this.nominalResistance =  this.getResistance( this.colors );
      
      // now that everything has been set, if we have a fault set it now
      if (!!this.open){
        this.resistance = 1e20;
        breadBoard.faultyComponents.push(this);
      } else if (!!this.shorted) {
        this.resistance = 1e-6;
        breadBoard.faultyComponents.push(this);
      } else {
        this.open = false;
        this.shorted = false;
      }
    };

    sparks.extend(sparks.circuit.Resistor, sparks.circuit.Component,
    {
    	nominalValueMagnitude: -1,
    	
        colorMap: { '-1': 'gold', '-2': 'silver',
            0 : 'black', 1 : 'brown', 2 : 'red', 3 : 'orange',
            4 : 'yellow', 5 : 'green', 6 : 'blue', 7 : 'violet', 8 : 'grey',
            9 : 'white' },

        toleranceColorMap: { 0.01 : 'brown', 0.02 : 'red', 5e-3 : 'green',
            2.5e-3 : 'blue', 1e-3 : 'violet', 5e-4 : 'gray', 5e-2 : 'gold',
            0.1 : 'silver', 0.2 : 'none' },

        toleranceValues: [ 0.01, 0.02 ],

        init: function (id) {
              this.id = id;
              this.nominalValue = 0.0; //resistance value specified by band colors;
              this.realValue = 0.0; //real resistance value in Ohms
              this.tolerance = 0.0; //tolerance value
              this.colors = []; //colors for each resistor band
        },
        
        getNumBands: function () {
            return this.numBands;
        },
        
        getNominalValue: function () {
            return this.nominalValue;
        },
        
        setNominalValue: function (value) {
            this.nominalValue = value;
        },
        
        getTolerance: function () {
            return this.tolerance;
        },
        
        setTolerance: function(value) {
            this.tolerance = value;
        },

        getRealValue: function () {
            return this.realValue;
        },

        setRealValue: function (value) {
            this.realValue = value;
        },
        
        updateColors: function (resistance, tolerance) {
            //console.log('colors=' + this.colors);
            //console.log('Sending colors=' + this.colors.join('|'));
            this.colors = this.getColors(resistance, tolerance);
            // flash.sendCommand('set_resistor_colors', this.id, this.colors);
        },

        show : function() {
            // flash.sendCommand('show_resistor');
        },

        calcRealValue: function (nominalValue, tolerance) {
            var chance = Math.random();
            if (chance > 0.8) {
                var chance2 = Math.random();
                if (chance2 < 0.5) {
                    return nominalValue + nominalValue * (tolerance + Math.random() * tolerance);
                }
                else {
                    return nominalValue - nominalValue * (tolerance + Math.random() * tolerance);
                }
            }

            // Multiply 0.9 just to be comfortably within tolerance
            var realTolerance = tolerance * 0.9;
            return nominalValue * this.randFloat(1 - realTolerance, 1 + realTolerance);
        },

        randInt: function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        randFloat: function (min, max) {
            return this.randPseudoGaussian(3) * (max - min) + min;
        },

        randPseudoGaussian: function (n) {
            var r = 0.0;
            for (var i = 0; i < n; ++i) {
                r += Math.random();
            }
            return r / n;
        },

        // Filter resistance values according to the requirements of this resistor
        filter: function (in_values) {
            var values = [];
            for (var i = 0; i < in_values.length; ++i) {
                if (in_values[i] >= 10.0 && in_values[i] < 2e6) {
                    values.push(in_values[i]);
                }
            }
            return values;
        },
        
        getColors4Band: function (ohms, tolerance) {
            var s = ohms.toString();
            var decIx = s.indexOf('.');
            var decLoc = decIx > -1 ? decIx : s.length;
            s = s.replace('.', '');
            var len = s.length;
            for (var i = 0; i < 2 - len; ++i){ s += '0'; }
            var mult = decLoc > 1 ? decLoc - 2 : 10;
            return [ this.colorMap[s.charAt(0)],
                     this.colorMap[s.charAt(1)],
                     this.colorMap[decLoc - 2],
                     this.toleranceColorMap[tolerance]
                   ];
        },
        
        getColors5Band: function (ohms, tolerance) {
            var s = ohms.toString();
            var decIx = s.indexOf('.');
            var decLoc = decIx > -1 ? decIx : s.length;
            s = s.replace('.', '');
            var len = s.length;
            for (var i = 0; i < 3 - len; ++i) { s += '0'; }
            return [ this.colorMap[s.charAt(0)],
                     this.colorMap[s.charAt(1)],
                     this.colorMap[s.charAt(2)],
                     this.colorMap[decLoc - 3],
                     this.toleranceColorMap[tolerance]
                   ];
        },
        
        colorToNumber: function (color) {
          for (var n in this.colorMap) {
            if (this.colorMap[n] == color) { return parseInt(n,10); }
          }
          // alternate spelling...
          if (color == "gray") {
            return 8;
          }
          return null;
        },
        
        getResistance: function(colors){
          if (typeof(colors)==="string"){
            colors = colors.split(",");
          }
          var resistance = this.colorToNumber(colors[0]);
          for (var i = 1; i < colors.length - 2; i++) {
            resistance = resistance * 10;
            resistance += this.colorToNumber(colors[i]);
          }
          return resistance * Math.pow(10, this.colorToNumber(colors[i]));
        }
    });

})();
