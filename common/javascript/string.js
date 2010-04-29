(function () {
    this.sparks.string = {};
    
    var str = sparks.string;
    
    str.stripZerosAndDots = function (s) {
        s = s.replace('.', '');
        s = s.replace(/0*([^0].*)/, '$1');
        s = s.replace(/(.*[^0])0*/, '$1');
        return s;
    };

})();
