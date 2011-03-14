//= require "resistor"
//= require "r-values"

/* FILE resistor-4band.js */

(function () {
    
    var circuit = sparks.circuit;

    circuit.Resistor4band = function (id) {
        var superclass = sparks.circuit.Resistor4band.uber;
        superclass.init.apply(this, [id]);
        this.numBands = 4;
        
        if (breadModel('getResOrderOfMagnitude') < 0){
          var om = this.randInt(0, 3);
          breadModel('setResOrderOfMagnitude', om);
        }

        this.r_values5pct = this.filter(circuit.r_values.r_values4band5pct);
        this.r_values10pct = this.filter(circuit.r_values.r_values4band10pct);
    };
    
    sparks.extend(circuit.Resistor4band, circuit.Resistor, {

        toleranceValues: [0.05, 0.1],
        
        randomize: function (options) {
            var ix = this.randInt(0, 1);
            var values;

            this.tolerance = this.toleranceValues[ix];
            
            if (options && options.rvalues) {
                values = options.rvalues;
            }
            else if (this.tolerance == 0.05) {
                values = this.r_values5pct;
            }
            else {
                values = this.r_values10pct;
            }
            
            var om = breadModel('getResOrderOfMagnitude');
            var extra = this.randInt(0, 1);
            om = om + extra;
            
            var value = values[this.randInt(0, values.length-1)];
            
            value = value * Math.pow(10,om);
            
            this.nominalValue = value;



      //             //make nominalValue within 2 order of magnitude of first chosen resistor - jonah
      //             //console.log('nominal value!!!!!!!!'+circuit.Resistor.prototype.nominalValueMagnitude);  //-1
      // var firstNominal = circuit.Resistor.prototype.nominalValueMagnitude;
      // //console.log('firstNominal '+circuit.Resistor.prototype.nominalValueMagnitude);
      //             if(circuit.Resistor.prototype.nominalValueMagnitude == -1){
	            // this.nominalValue = Math.random()*2000;  // I switched this because some values were too large to measure with the multimeter
	            //               circuit.Resistor.prototype.nominalValueMagnitude = this.nominalValue;
	            //            }
	            //            this.nominalValue = (Math.floor((500-1)*Math.random()) ) * circuit.Resistor.prototype.nominalValueMagnitude;
	           
//            this.nominalValue = values[this.randInt(0, values.length-1)];

            if (options && options.realEqualsNominal) {
                this.realValue = this.nominalValue;
            }
            else {
                this.realValue = this.calcRealValue(this.nominalValue, this.tolerance);
            }
            console.log('r=' + this.nominalValue + ' t=' + this.tolerance);
            
            this.colors = this.getColors(this.nominalValue, this.tolerance);
        },
        
        // rvalue: resistance value
        getColors: function (ohms, tolerance) {
            var s = ohms.toString();
            var decIx = s.indexOf('.'); // real location of the dot in the string
            // virtual location of dot
            // e.g., for "324", decLoc is 3, and for "102000", 6
            var decLoc = decIx > -1 ? decIx : s.length;

            s = s.replace('.', '');
            var len = s.length;

            // Make sure there are at least three significant digits
            for (var i = 0; i < 2 - len; ++i) {
                s += '0';
            }

            var mult = decLoc > 1 ? decLoc - 2 : 10;

            return [ this.colorMap[s.charAt(0)],
                     this.colorMap[s.charAt(1)],
                     this.colorMap[decLoc - 2],
                     this.toleranceColorMap[tolerance]
                   ];
        }

    });

})();
