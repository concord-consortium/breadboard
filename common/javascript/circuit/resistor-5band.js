(function () {
    
    sparks.circuit.Resistor5band = function () {
        var superclass = sparks.circuit.Resistor5band.uber;
        superclass.init.apply(this);
        this.id = 'resistor_5band';

        this.r_values1pct = this.filter(r_values.r_values5band1pct);
        this.r_values2pct = this.filter(r_values.r_values5band2pct);
    };

    sparks.util.extend(sparks.circuit.Resistor5band, Resistor, {

        randomize : function() {
          var ix = this.randInt(0, 1);
          var values;

          if (sparks.config.debug_tvalue) {
              this.tolerance = sparks.config.debug_tvalue;
          }
          else {
              this.tolerance = this.toleranceValues[ix];
          }

          if (this.tolerance == 0.01) {
              values = this.r_values1pct;
          }
          else {
              values = this.r_values2pct;
          }
          if (sparks.config.debug_rvalue) {
              this.nominalValue = sparks.config.debug_rvalue;
          }
          else {
              this.nominalValue = values[this.randInt(0, values.length-1)];
          }
          this.realValue = this.calcRealValue(this.nominalValue, this.tolerance);
          this.colors = this.getColors(this.nominalValue, this.tolerance);
          console.log('r=' + this.nominalValue + ' t=' + this.tolerance);
          console.log('colors=' + this.colors);
          console.log('Sending colors=' + this.colors.join('|'));
          Flash.sendCommand('set_resistor_label', this.colors);
        },

        getColors: function(ohms, tolerance) {
            var s = ohms.toString();
            var decIx = s.indexOf('.'); // real location of the dot in the string
            // virtual location of dot
            // e.g., for "324", decLoc is 3, and for "102000", 6
            var decLoc = decIx > -1 ? decIx : s.length;

            s = s.replace('.', '');
            var len = s.length;

            // Make sure there are at least three significant digits
            for (var i = 0; i < 3 - len; ++i) {
                s += '0';
            }

            return [ this.colorMap[s.charAt(0)],
                     this.colorMap[s.charAt(1)],
                     this.colorMap[s.charAt(2)],
                     this.colorMap[decLoc - 3],
                     this.toleranceColorMap[tolerance]
                   ];
        }
    });
})();
