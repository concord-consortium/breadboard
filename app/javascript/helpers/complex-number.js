/* FILE complex_number.js */
/*globals sparks */

(function () {

    sparks.ComplexNumber = function (real, i) {
      this.real = real || 0;
      this.i = i || 0;
    };
    
    // must handle strings of the form
    // +1.00000000000e+03
    // -1.95000000000e+02+j4.92889189986e-16
    // +1.95000000000e+02-j2.46444594993e-16
    sparks.ComplexNumber.parse = function (str) {
      if (!str) {
        return null;
      }
      
      var cn = new sparks.ComplexNumber();
      
      var parts = /(.*)([+,\-]j.*)/.exec(str),            // try to tranform 'str' into [str, real, imaginary]
          real,
          imaginary;
      if (parts && parts.length === 3){
        real = parseFloat(parts[1]);
        imaginary = parseFloat(parts[2].replace("j", ""));    // imag. is of form (+/-)j123. We remove the j, but keep the +/-
      } else {
        real = parseFloat(str);
      }
      
      if (!isNaN(real)) {
        cn.real = real;
      } else {
        return null;        // if we couldn't parse a real part, don't return anything
      }
      
      if (!isNaN(imaginary)) {
        cn.i = imaginary;
      }
      
      return cn;
    };

})();