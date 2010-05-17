/* FILE string.js */

(function () {
    
    this.sparks.string = {};
    
    var str = sparks.string;
    
    str.strip = function (s) {
        s = s.replace(/\s*([^\s]*)\s*/, '$1');
        return s;
    };
    
    // Remove a dot in the string, and then remove 0's on both sides
    // e.g. '20100' => '201', '0.0020440' => '2044'
    str.stripZerosAndDots = function (s) {
        s = s.replace('.', '');
        s = s.replace(/0*([^0].*)/, '$1');
        s = s.replace(/(.*[^0])0*/, '$1');
        return s;
    };
    
    str.stripZeros = function (s) {
        s = s.replace(/0*([^0].*)/, '$1');
        s = s.replace(/(.*[^0])0*/, '$1');
        return s;
    };
    

})();
