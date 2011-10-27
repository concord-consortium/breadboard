/* FILE complex_number.js */
/*globals sparks */

(function () {

    sparks.ComplexNumber = function (real, imag) {
      this.real      = real || 0;
      this.imag      = imag || 0;
      this.magnitude = Math.sqrt(this.real*this.real + this.imag*this.imag);
      this.angle     = Math.atan2(this.imag, this.real); // Math.atan2(y, x) -> angle to the point at (x,y) [yes, y comes first!]
    };
    
    // must handle strings of the form
    // +1.00000000000e+03
    // -1.95000000000e+02+j4.92889189986e-16
    // +1.95000000000e+02-j2.46444594993e-16
    sparks.ComplexNumber.parse = function (str) {
      if (!str) {
        return null;
      }
      
      var parts = /(.*)([+,\-]j.*)/.exec(str),            // try to tranform 'str' into [str, real, imaginary]
          real,
          imaginary;
          
      if (parts && parts.length === 3) {
        real      = parseFloat(parts[1]);
        imaginary = parseFloat(parts[2].replace("j", ""));    // imag. is of form (+/-)j123. We remove the j, but keep the +/-
      } else {
        real      = parseFloat(str);
        imaginary = 0;
      }
      
      if ( isNaN(real) || isNaN(imaginary) ) {
        return null;  // should this be an Error?
      }
      
      return new sparks.ComplexNumber(real, imaginary);
    };
    
    sparks.ComplexNumber.prototype.toString = function() {
      return "" + this.real + "+i" + this.imag
    };
})();