var Resistor4band = function() {
    Resistor4band.uber.init.apply(this);
    this.id = 'resistor_4band';
  
    this.r_values5pct = this.filter(r_values.r_values4band5pct);
    this.r_values10pct = this.filter(r_values.r_values4band10pct);
};

Util.extend(Resistor4band, Resistor, {
  
    toleranceValues: [0.05, 0.1],
    
    randomize: function() {
      var ix = this.randInt(0, 1);
      var values;
      this.tolerance = this.toleranceValues[ix];
      if (this.tolerance == 0.05) {
          values = this.r_values5pct;
      }
      else {
          values = this.r_values10pct;
      }
      this.nominalValue = values[this.randInt(0, values.length-1)];
      this.realValue = this.calcRealValue(this.nominalValue, this.tolerance);
      this.colors = this.getColors(this.nominalValue, this.tolerance);
      //console.log('r=' + this.nominalValue + ' t=' + this.tolerance);
      //console.log('colors=' + this.colors);
      //console.log('Sending colors=' + this.colors.join('|'));
      Flash.sendCommand('set_resistor_label', this.colors);
  },
  
  // rvalue: resistance value
  getColors: function(ohms, tolerance) {
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
