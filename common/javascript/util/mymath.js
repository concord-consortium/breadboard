var MyMath = {};

// Get 10's power of the most significant digit.
// e.g. For 4: 0, for 77: 1, for 3753: 3, for 0.02.
// NOTE: The most significant digit is assumed to be the first non-zero digit,
// which may be unacceptable for certain applications.
// NOTE: x is a non-negative number.
MyMath.leftMostPos = function(x) {
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
MyMath.roundToSigDigits = function(x, n) {
    var k = Math.pow(10, n - MyMath.leftMostPos(x) - 1);
    return Math.round(x * k) / k;
};

// Similar to roundToSigDigits but returns number composed only of the n 
// significant digits; e.g., returns 127 for 12678 when n = 3.
MyMath.getRoundedSigDigits = function (x, n) {
    return Math.round(x * Math.pow(10, n - MyMath.leftMostPos(x) - 1));
};
