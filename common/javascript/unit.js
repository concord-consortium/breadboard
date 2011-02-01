//= require "setup-common"

/* FILE unit.js */

(function () {

    this.sparks.unit = {};
    
    var u = sparks.unit;

    u.labels = { ohms : '\u2126', kilo_ohms : 'k\u2126', mega_ohms : 'M\u2126' };
    
    u.toEngineering = function (value, units){
      // function html_entity_decode(str) {
      //   return $("<div>").html(str).text();
      // }
      value = Number(value);
      
      if (value >= 1000000){
        var MUnits = "mega"+units;
        units = MUnits;
        value = u.round(value/1000000,2);
      } else if (value >= 1000){
        var kUnits = "kilo"+units;
        units = kUnits;
        value = u.round(value/1000,2);
      } else if (value === 0 ) {
        units = units;
        value = 0;
      } else if (value < 0.000001){
        var nUnits = "nano"+units;
        units = nUnits;
        value = u.round(value * 1000000000,2);
      } else if (value < 0.001){
        var uUnits = "micro"+units;
        units = uUnits;
        value = u.round(value * 1000000,2);
      } else if (value < 1) {
        var mUnits = "milli"+units;
        units = mUnits;
        value = u.round(value * 1000,2);
      } else {
        units = units;
        value = u.round(value,2);
      }
      
      return {"value": value, "units": units};
    };
    
    u.round = function(num, dec) {
    	var result = Math.round( Math.round( num * Math.pow( 10, dec + 2 ) ) / Math.pow( 10, 2 ) ) / Math.pow(10,dec);
    	return result;
    };
    
    u.sigFigs = function(n, sig) {
        var mult = Math.pow(10,
            sig - Math.floor(Math.log(n) / Math.LN10) - 1);
        return Math.round(n * mult) / mult;
    };
    
    /**
    * assumes this will be in the form ddd uu
    * i.e. a pure number and a unit, separated by an optional space
    * '50 ohms' and '50V' are both valid
    */
    u.convertMeasurement = function(measurement) {
      var isMeasurementPattern = /^\s?\d+.?\d*\s?\D+\s?$/
      var matched = measurement.match(isMeasurementPattern);
      if (!matched){
        return measurement
      }
      
      var numPattern = /\d+\.?\d*/g
      var nmatched = measurement.match(numPattern);
      if (!nmatched){
        return measurement;
      }
      var value = nmatched[0];
      
      var unitPattern =  /(?=\d*.?\d*)[^\d\.\s]+/g
      var umatched = measurement.match(unitPattern);
      if (!umatched){
        return measurement;
      }
      var unit = umatched[0];
      
      var eng = u.toEngineering(value, unit)
      return eng.value + " " + eng.units;
    };

    u.normalizeToOhms = function (value, unit) {
        switch (unit) {
        case u.labels.ohms:
            return value;
        case u.labels.kilo_ohms:
            return value * 1000;
        case u.labels.mega_ohms:
            return value * 1e6;
        }
        return null;
    };

    u.ohmCompatible = function (unit) {
        if (unit == u.labels.ohms || unit == u.labels.kilo_ohms ||
            unit == u.labels.mega_ohms)
        {
            return true;
        }
        return false;
    };

    // Return a string with a unit representing the resistance value.
    // value: resistance value in ohms
    u.res_str = function (value) {
        var vstr, unit, val;
        
        if (typeof value !== 'number' || isNaN(Number(value))) {
            return 'Invalid Value ' + String(value);
        }

        if (value < 1000) {
            val = value;
            unit = u.labels.ohms;
        }
        else if (value < 1e6) {
            val = value / 1000;
            unit = u.labels.kilo_ohms;
        }
        else {
            val = value / 1e6;
            unit = u.labels.mega_ohms;
        }

        if (val.toFixed) {
            val = val.toFixed(6);
        }
        
        vstr = String(val).replace(/(\.[0-9]*[1-9])0*/, '$1');
        vstr = vstr.replace(/([0-9])\.0+$/, '$1');
        return vstr + ' ' + unit;
    };

    u.res_unit_str = function (value, mult) {
        var vstr;
        var unit = u.labels.ohms;

        if (mult === 'k') {
            vstr = String(value / 1000.0);
            unit = u.labels.kilo_ohms;
        }
        else if (mult === 'M') {
            vstr = String(value / 1000000.0);
            unit = u.labels.mega_ohms;
        }
        else {
            vstr = String(value);
            unit = u.labels.ohms;
        }
        return vstr + ' ' + unit;
    };

    u.pct_str = function (value) {
        return (value * 100) + ' %';
    };


})();
