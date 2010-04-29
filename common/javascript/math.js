(function () {
    this.sparks.math = {};
    
    var math = sparks.math;

    // Return true if number x is 10^z times y where z is an int
    math.equalExceptPowerOfTen = function(x, y) {
        var sx = sparks.string.stripZerosAndDots(x.toString());
        var sy = sparks.string.stripZerosAndDots(y.toString());

        return sx === sy;
    };
    
})();
