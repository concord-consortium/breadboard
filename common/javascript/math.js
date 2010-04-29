(function () {
    this.sparks.math = {};
    
    var math = sparks.math;
    var str = sparks.string;
    
    // Return true if number x is 10^z times y where z is an int
    math.equalExceptPowerOfTen = function(x, y) {
        var sx = str.stripZerosAndDots(x.toString());
        var sy = str.stripZerosAndDots(y.toString());

        return sx === sy;
    };
    
})();
