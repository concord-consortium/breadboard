//= require <helpers/string>

/*globals console sparks */

/* FILE math.js */

(function () {
    this.sparks.math = {};
    
    var math = sparks.math;

    // Return true if number x is 10^z times y where z is an int
    math.equalExceptPowerOfTen = function(x, y) {
        var sx = sparks.string.stripZerosAndDots(x.toString());
        var sy = sparks.string.stripZerosAndDots(y.toString());

        return sx === sy;
    };

     // Get 10's power of the most significant digit.
     // e.g. For 4: 0, for 77: 1, for 3753: 3, for 0.02.
     // NOTE: The most significant digit is assumed to be the first non-zero digit,
     // which may be unacceptable for certain applications.
     // NOTE: x is a non-negative number.
     math.leftMostPos = function (x) {
         x = Number(x);
         if (isNaN(x) || x < 0) {
             console.log('ERROR: math.leftMostPos: Invalid input ' + x);
             return 0;
         }
         if (x === 0) {
             return 0;
         }
         var n = 0;
         var y = x;
         if (x < 1) {
             while (y < 1) {
                 y *= 10;
                 n -= 1;
             }
         }
         else {
             while (y >= 10) {
                 y /= 10;
                 n += 1;
             }
         }
         return n;
     };

     // Round x to n significant digits
     // e.g. Returns 12700 for 12678 when n = 3.
    math.roundToSigDigits = function(x, n) {
      if (x === 0) {
        return 0;
      }
      var order = Math.ceil(Math.log10(x)),
          factor;
       
      // Divide into 2 cases to get numerically sane results (i.e., no .xxx999999s)
      if (n - order > 0) {
        // Ex. order of x = 1e-4, n = 3 sig digs: so multiply by 1e7, round, then divide by 1e7
        factor = Math.pow(10, n - order);
        return Math.round(x * factor) / factor;
      } else {
        // Ex. order of x = 1e6, n = 2 sig digs: so divide by 1e4, round, then multiply by 1e4
        factor = Math.pow(10, order - n);
        return Math.round(x / factor) * factor;
      }
    };

     // Similar to roundToSigDigits but returns number composed only of the n 
     // significant digits; e.g., returns 127 for 12678 when n = 3.
     math.getRoundedSigDigits = function (x, n) {
         return Math.round(x * Math.pow(10, n - math.leftMostPos(x) - 1));
     };
     
     
     // *** extend the Math object with useful methods ***
     
     Math.log10 = function(x){
       return Math.log(x)/Math.LN10;
     };
     
     Math.powNdigits = function(x,n){
       return Math.pow(10,Math.floor(Math.log(x)/Math.LN10-n+1));
     };
     
     // Rounds to n sig figs (including adding on trailing zeros if necessary),
     // and returns a string representation of the number.
     Math.toSigFigs = function(num, sigFigs) {
       num = num.toPrecision(sigFigs);
       return sigFigs > Math.log(num) * Math.LOG10E ? num : ""+parseFloat(num);
     };
    
})();
