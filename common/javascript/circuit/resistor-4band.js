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
      console.log('r=' + this.nominalValue + ' t=' + this.tolerance);
      console.log('colors=' + this.colors);
      console.log('Sending colors=' + this.colors.join('|'));
      Flash.sendCommand('set_resistor_label', this.colors);
  },
  
  // rvalue: resistance value
  getColors : function(rvalue, tolerance) {
      for (var exp = 0; exp < 9; ++exp) {
          if (Math.floor(rvalue / Math.pow(10, exp)) === 0) {
              break;
          }
      }
      var sig1 = Math.floor(rvalue / Math.pow(10, exp-1));
      var tempValue = rvalue - sig1 * Math.pow(10, exp-1);
      var sig2 = Math.floor(tempValue / Math.pow(10, exp-2));
      tempValue = tempValue - sig2 * Math.pow(10, exp-2);
      return [this.colorMap[sig1], this.colorMap[sig2], this.colorMap[exp-2],
              this.toleranceColorMap[tolerance]];
  }

});
