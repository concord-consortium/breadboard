var Resistor5band = function() {
  Resistor5band.uber.init.apply(this);
  this.id = 'resistor_5band';
  
  this.r_values1pct = this.filter(r_values.r_values5band1pct);
  this.r_values2pct = this.filter(r_values.r_values5band2pct);
};

Util.extend(Resistor5band, Resistor, {
  
    colMap: ['black', 'brown', 'red', 'orange', 'yellow',
             'green','blue','violet','grey','white',
             'gold','silver'],
    
    tolMap: { _01:'brown', _02:'red', _05:'grey', _1:'violet', _25:'blue', _5:'green' },
    
    randomize : function() {
      var ix = this.randInt(0, 1);
      var values;
      this.tolerance = this.toleranceValues[ix];
      if (this.tolerance == 0.01) {
          values = this.r_values1pct;
      }
      else {
          values = this.r_values2pct;
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
    getColors_old : function(rvalue, tolerance) {
        for (var exp = 0; exp < 9; ++exp) {
            if (Math.floor(rvalue / Math.pow(10, exp)) === 0) {
                break;
            }
        }
        var sig1 = Math.floor(rvalue / Math.pow(10, exp-1));
        var tempValue = rvalue - sig1 * Math.pow(10, exp-1);
        var sig2 = Math.floor(tempValue / Math.pow(10, exp-2));
        tempValue = tempValue - sig2 * Math.pow(10, exp-2);
        var sig3 = Math.floor(tempValue / Math.pow(10, exp-3));
        return [this.colorMap[sig1], this.colorMap[sig2], this.colorMap[sig3],
                this.colorMap[exp-3], this.toleranceColorMap[tolerance]];
    },
    
    getColors: function(ohms, tolerance) {
        var ohmsStr = '' + ohms;
        var sigfigs = '';
        var dec = false;
        var pwr = 0;
        var iohms = '';
        
        for (var i = 0; i < ohmsStr.length; ++i) {
          iohms = ohmsStr[i];
          
          switch(iohms)
          {
          case '.': dec = true; break;
          case '0': pwr += !dec && sigfigs.length > 1 ? 1 : 0;
          default: sigfigs += iohms; break;
          }
        }
        var mult = ohmsStr.indexOf('.') > -1 ? 9 + ohmsStr.split('.')[1].length : pwr;
        return [ this.colMap[sigfigs[0]], this.colMap[sigfigs[1]],
                 this.colMap[sigfigs[2]], this.colMap[mult],
                 this.tolMap['_' + ('' + tolerance).split(".")[1]] ];
    }
});
