var Unit = {};

Unit.labels = { ohms : '\u2126', kilo_ohms : 'k\u2126', mega_ohms : 'M\u2126' };

Unit.normalizeToOhms = function(value, unit) {
    switch (unit) {
    case Unit.labels.ohms:
        return value;
    case Unit.labels.kilo_ohms:
        return value * 1000;
    case Unit.labels.mega_ohms:
        return value * 1e6;
    }
    return null;
};
    
Unit.ohmCompatible = function(unit) {
    if (unit == Unit.labels.ohms || unit == Unit.labels.kilo_ohms ||
        unit == Unit.labels.mega_ohms)
    {
        return true;
    }
    return false;
};

// Return a string with a unit representing the resistance value.
// value: resistance value in ohms
Unit.res_str = function(value) {
    var vstr;
    var unit;
    
    if (value < 1000) {
        vstr = String(value);
        unit = Unit.labels.ohms;
    }
    else {
        var val = value / 1000.0;
        if (val.toFixed) {
            val = val.toFixed(6);
        }
        vstr = String(val);
        unit = Unit.labels.kilo_ohms;
    }
    
    /*
    var n = vstr.match('.') ?  4 : 3;
    if (vstr.charAt(0) == '1') { ++n; }
    if (vstr.length > n) {
        vstr = vstr.substring(0, n);
    }
    */
    
    vstr = vstr.replace(/(\.[0-9]*[1-9])0*/, '$1');
    return vstr + ' ' + unit;
};

Unit.res_unit_str = function(value, mult) {
    var vstr;
    var unit = Unit.labels.ohms;
    
    if (mult === 'k') {
        vstr = String(value / 1000.0);
        unit = Unit.labels.kilo_ohms;
    }
    else if (mult === 'M') {
        vstr = String(value / 1000000.0);
        unit = Unit.labels.mega_ohms;
    }
    else {
        vstr = String(value);
        unit = Unit.labels.ohms;
    }
    return vstr + ' ' + unit;
};

Unit.pct_str = function(value) {
    return (value * 100) + ' %';
};

