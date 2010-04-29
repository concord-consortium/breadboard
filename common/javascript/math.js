(function () {
    this.sparks.math = {};
    
    var math = sparks.math;
    
    // Return true if number x is 10^z times y where z is an int
    math.equalExceptPowerOfTen = function(x, y) {
        function stripZerosAndDots(s) {
            s = s.replace('.', '');
            s = s.replace(/0*([^0].*)/, '$1');
            s = s.replace(/(.*[^0])0*/, '$1');
            return s;
        }
        var sx = stripZerosAndDots(x.toString());
        var sy = stripZerosAndDots(y.toString());

        return sx === sy;
    };
    
})();
