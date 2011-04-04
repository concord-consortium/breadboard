/*
    http://www.JSON.org/json2.js
    2009-09-29

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:


            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/



if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {


        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {


        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];


        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }


        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }


        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':


            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':


            return String(value);


        case 'object':


            if (!value) {
                return 'null';
            }


            gap += indent;
            partial = [];


            if (Object.prototype.toString.apply(value) === '[object Array]') {


                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }


                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }


            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {


                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }


            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }


    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {


            var i;
            gap = '';
            indent = '';


            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }


            } else if (typeof space === 'string') {
                indent = space;
            }


            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }


            return str('', {'': value});
        };
    }



    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {


            var j;

            function walk(holder, key) {


                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }



            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }



            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {


                j = eval('(' + text + ')');


                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }


            throw new SyntaxError('JSON.parse');
        };
    }
}());

/* FILE setup-common.js */

(function () {

    /*
     * Common initial setup for SPARKS activities
     */

    if (typeof console === 'undefined' || !console) {
        this.console = {};
    }
    if (!console.log) {
        console.log = function () {};
    }

    if (typeof debug === 'undefined' || !debug) {
        this.debug = function (x) { console.log(x); };
    }

    if (typeof sparks === 'undefined' || !sparks) {
        this.sparks = {};
    }

    if (!sparks.config) {
        sparks.config = {};
    }

    if (!sparks.circuit) {
        sparks.circuit = {};
    }

    if (!sparks.util) {
        sparks.util = {};
    }

    if (!sparks.activities) {
        sparks.activities = {};
    }

    sparks.config.root_dir = '/sparks-content';



    sparks.extend = function(Child, Parent, properties) {
      var F = function() {};
      F.prototype = Parent.prototype;
      Child.prototype = new F();
      if (properties) {
          for (var k in properties) {
              Child.prototype[k] = properties[k];
          }
      }
      Child.prototype.constructor = Child;
      Child.parentConstructor = Parent;
      Child.uber = Parent.prototype;
    };

})();

/* FILE string.js */

(function () {

    this.sparks.string = {};

    var str = sparks.string;

    str.strip = function (s) {
        s = s.replace(/\s*([^\s]*)\s*/, '$1');
        return s;
    };

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

/* FILE math.js */

(function () {
    this.sparks.math = {};

    var math = sparks.math;

    math.equalExceptPowerOfTen = function(x, y) {
        var sx = sparks.string.stripZerosAndDots(x.toString());
        var sy = sparks.string.stripZerosAndDots(y.toString());

        return sx === sy;
    };

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

     math.roundToSigDigits = function(x, n) {
         var k = Math.pow(10, n - math.leftMostPos(x) - 1);
         return Math.round(x * k) / k;
     };

     math.getRoundedSigDigits = function (x, n) {
         return Math.round(x * Math.pow(10, n - math.leftMostPos(x) - 1));
     };

})();

/* FILE unit.js */

(function () {

    this.sparks.unit = {};

    var u = sparks.unit;

    u.labels = { ohms : '\u2126', kilo_ohms : 'k\u2126', mega_ohms : 'M\u2126' };

    u.toEngineering = function (value, units){
      value = Number(value);

      if (value >= 1000000){
        var MUnits = "mega"+units;
        units = MUnits;
        value = u.round(value/1000000,2);
      } else if (value >= 1000){
        var kUnits = "kilo"+units;
        units = kUnits;
        value = u.round(value/1000,2);
      } else if (value === 0 ) {
        units = units;
        value = 0;
      } else if (value < 0.000001){
        var nUnits = "nano"+units;
        units = nUnits;
        value = u.round(value * 1000000000,2);
      } else if (value < 0.001){
        var uUnits = "micro"+units;
        units = uUnits;
        value = u.round(value * 1000000,2);
      } else if (value < 1) {
        var mUnits = "milli"+units;
        units = mUnits;
        value = u.round(value * 1000,2);
      } else {
        units = units;
        value = u.round(value,2);
      }

      return {"value": value, "units": units};
    };

    u.round = function(num, dec) {
    	var result = Math.round( Math.round( num * Math.pow( 10, dec + 2 ) ) / Math.pow( 10, 2 ) ) / Math.pow(10,dec);
    	return result;
    };

    u.sigFigs = function(n, sig) {
        var mult = Math.pow(10,
            sig - Math.floor(Math.log(n) / Math.LN10) - 1);
        return Math.round(n * mult) / mult;
    };

    u.isMeasurement = function(string) {
      var isMeasurementPattern = /^\s?\d+.?\d*\s?\D+\s?$/
      var matched = string.match(isMeasurementPattern);
      return !!matched;
    };

    /**
    * assumes this will be in the form ddd uu
    * i.e. a pure number and a unit, separated by an optional space
    * '50 ohms' and '50V' are both valid
    */
    u.convertMeasurement = function(measurement) {
      if (!this.isMeasurement(measurement)){
        return measurement
      }

      var numPattern = /\d+\.?\d*/g
      var nmatched = measurement.match(numPattern);
      if (!nmatched){
        return measurement;
      }
      var value = nmatched[0];

      var unitPattern =  /(?=\d*.?\d*)[^\d\.\s]+/g
      var umatched = measurement.match(unitPattern);
      if (!umatched){
        return measurement;
      }
      var unit = umatched[0];

      var eng = u.toEngineering(value, unit)
      return eng.value + " " + eng.units;
    };

    u.normalizeToOhms = function (value, unit) {
        switch (unit) {
        case u.labels.ohms:
            return value;
        case u.labels.kilo_ohms:
            return value * 1000;
        case u.labels.mega_ohms:
            return value * 1e6;
        }
        return null;
    };

    u.ohmCompatible = function (unit) {
        if (unit == u.labels.ohms || unit == u.labels.kilo_ohms ||
            unit == u.labels.mega_ohms)
        {
            return true;
        }
        return false;
    };

    u.res_str = function (value) {
        var vstr, unit, val;

        if (typeof value !== 'number' || isNaN(Number(value))) {
            return 'Invalid Value ' + String(value);
        }

        if (value < 1000) {
            val = value;
            unit = u.labels.ohms;
        }
        else if (value < 1e6) {
            val = value / 1000;
            unit = u.labels.kilo_ohms;
        }
        else {
            val = value / 1e6;
            unit = u.labels.mega_ohms;
        }

        if (val.toFixed) {
            val = val.toFixed(6);
        }

        vstr = String(val).replace(/(\.[0-9]*[1-9])0*/, '$1');
        vstr = vstr.replace(/([0-9])\.0+$/, '$1');
        return vstr + ' ' + unit;
    };

    u.res_unit_str = function (value, mult) {
        var vstr;
        var unit = u.labels.ohms;

        if (mult === 'k') {
            vstr = String(value / 1000.0);
            unit = u.labels.kilo_ohms;
        }
        else if (mult === 'M') {
            vstr = String(value / 1000000.0);
            unit = u.labels.mega_ohms;
        }
        else {
            vstr = String(value);
            unit = u.labels.ohms;
        }
        return vstr + ' ' + unit;
    };

    u.pct_str = function (value) {
        return (value * 100) + ' %';
    };


})();

/* FILE setup-common.js */

(function () {

    this.sparks.activities.mr = {};
    this.sparks.activities.mr.config = {};
    this.sparks.activities.mr.assessment = {};

    sparks.activities.mr.config.root_dir = sparks.config.root_dir + '/activities/measuring-resistance';

})();

/* FILE util.js */

sparks.util.readCookie = function (name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length,c.length);
        }
    }
    return null;
};

/**
 * Naive deep-cloning of an object.
 * Doesn't check against infinite recursion.
 */
sparks.util.cloneSimpleObject = function (obj) {
    var ret, key;
    if (obj instanceof Array) {
        ret = [];
        for (key in obj) {
            ret.push(sparks.util.cloneSimpleObject(obj[key]));
        }
        return ret;
    }
    else if (typeof obj === 'object') {
        ret = {};
        for (key in obj) {
            ret[key] = sparks.util.cloneSimpleObject(obj[key]);
        }
        return ret;
    }
    else {
        return obj;
    }
};

/*
sparks.util.checkFlashVersion = function () {
    var major = 10;
    var minor = 0;
    var revision = 31;

    if (!DetectFlashVer(10, 0, 33)) {
        var msg = 'This activity requires Flash version ';
        msg += major + '.' + minor + '.' + revision + '. ';

        $('body').html('<p>' + msg + '</p>');
    }
    document.write('<p>Flash version: ' + GetSwfVer() + '</p>');
};
*/

sparks.util.Alternator = function (x, y)
{
    this.x = x;
    this.y = y;
    this.cnt = 0;
};
sparks.util.Alternator.prototype =
{
    next : function () {
        ++this.cnt;
        return this.cnt % 2 == 1 ? this.x : this.y;
    }
};

sparks.util.timeLapseStr = function (start, end) {
    var seconds = Math.floor((end - start) / 1000);
    var minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    var str = seconds + (seconds == 1 ? ' second' : ' seconds');
    if (minutes > 0) {
        str = minutes + (minutes == 1 ? ' minute ' : ' minutes ') + str;
    }
    return str;
};

/**
The initial version of this was copied from the serializeArray method of jQuery
this version returns a result object and uses the names of the input elements
as the actual keys in the result object.  This requires more careful naming but it
makes using the returned object easier.  It could be improved to handle dates and
numbers perhaps using style classes to tag them as such.
*/
sparks.util.serializeForm = function (form) {
    var result = {};
    form.map(function () {
        return this.elements ? jQuery.makeArray(this.elements) : this;
    }).filter(function () {
        return this.name &&
        (this.checked || (/select|textarea/i).test(this.nodeName) ||
        (/text|hidden|password|search/i).test(this.type));
    }).each(function (i) {
        var val = jQuery(this).val();
        if(val === null){
            return;
        }

        if (jQuery.isArray(val)) {
            result[this.name] = jQuery.makeArray(val);
        }
        else {
            result[this.name] = val;
        }
    });
    return result;
};

sparks.util.formatDate = function (date) {
    function fillZero(val) {
        return val < 10 ? '0' + val : String(val);
    }
    if (typeof date === 'number') {
        date = new Date(date);
    }
    var s = fillZero(date.getMonth() + 1) + '/';

    s += fillZero(date.getDate()) + '/';
    s += String(date.getFullYear()) + ' ';
    s += fillZero(date.getHours()) + ':';
    s += fillZero(date.getMinutes()) + ':';
    s += fillZero(date.getSeconds()) + ' ';
    return s;
};

sparks.util.prettyPrint = function (obj, indent) {
    var t = '';
    if (typeof obj === 'object') {
        for (var key in obj) {
            if (typeof obj[key] !== 'function') {
                for (var i = 0; i < indent; ++i) {
                    t += ' ';
                }
                t += key + ': ';
                if (typeof obj[key] === 'object') {
                    t += '\n';
                }
                t += sparks.util.prettyPrint(obj[key], indent + 4);
            }
        }
        return t;
    }
    else {
        return obj + '\n';
    }
};

sparks.util.getRubric = function (id, callback, local) {
    var self = this;
    var url;

    if (local) {
        url = 'rubric.json';
    }
    else {
        url = unescape(sparks.util.readCookie('rubric_path') + '/' + id + '.json');
    }
    console.log('url=' + url);
    $.ajax({
        url: url,
        dataType: 'json',
        success: function (rubric) {
            callback(rubric);
        },
        error: function (request, status, error) {
            console.log('Activity#getRubric ERROR:\nstatus: ' + status + '\nerror: ' + error + '\nurl=' + url);
        }
    });
};

sparks.util.shuffle = function (o) {
  for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};

sparks.util.contains = function (array, obj) {
  for (i in array){
    if (array[i] == obj){
      return true;
    }
  }
  return false;
};

sparks.util.getKeys = function (json) {
  var keys = [];
  $.each(json, function(key){
    keys.push(key);
  })
  return keys;
};

/* FILE feedback.js */

(function () {

    var util = sparks.util;
    var mr = sparks.activities.mr;

    /**
     * rubric
     *   :name
     *   :version
     *   :description
     *   :variables
     *     :rated_resistance
     *       :description
     *       :value
     *     :rated_tolerance
     *       :description
     *       :value
     *   :max_points
     *   :items
     *     :reading
     *       :description
     *       :max_points
     *       :items
     *         :rated_r_value
     *           :description
     *           :max_points
     *           :feedback
     *             :messages
     *               :correct
     *                 :description
     *                 :short_message
     *                 :long_message
     *               :incorrect
     *         :rated_t_value
     *     :measuring
     *       :items
     *         :measured_r_value
     *         :plug_connection
     *         :probe_connection
     *         :knob_setting
     *         :power_switch
     *         :task_order
     *     :t_range
     *       :items
     *         :range_values
     *         :in_out
     *     :time
     *       :items
     *         :reading
     *         :measuring
     */

    mr.Feedback = function (rubric) {
        this.root = util.cloneSimpleObject(rubric);

        this.optimal_dial_setting = '';
        this.initial_dial_setting = '';
        this.final_dial_setting = '';
        this.time_reading = 0;
        this.time_measuring = 0;

        this.root.items.reading.items.rated_r_value.processPatterns = function (key, messages, subs) {
            if (key === 'power_ten') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                        '$1<font color="blue"><i>' + subs[0] +
                        '</i></font>$2<font color="blue"><i>' + subs[1] + '</i></font>$3');
            }
            else if (key === 'unit') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)/m,
                        '$1<font color="red"><i>' + subs[0] + '</i></font>$2');
            }
            return messages;
        };

        this.root.items.reading.items.rated_t_value.processPatterns = function (key, messages, subs) {
            if (key === 'incorrect') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                    '$1<font color="red"><i>' + subs[1] +
                    '</i></font>$2<font color="blue"><i>' + subs[0] + '</i></font>$3');
            }
            return messages;
        };

        this.root.items.measuring.items.measured_r_value.processPatterns = function (key, messages, subs) {
            if (key === 'incomplete') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                        '$1<font color="blue"><i>' + subs[0] +
                        '</i></font>$2<font color="red"><i>' + subs[1] + '</i></font>$3');
            }
            else if (key === 'power_ten') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)\$\{.*\}(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                        '$1<font color="orange"><i>' + subs[0] +
                        '</i></font>$2<font color="orange"><i>' + subs[1] +
                        '</i></font>$3<font color="blue"><i>' + subs[2] +
                        '</i></font>$4<font color="blue"><i>' + subs[3] +
                        '</i></font>$5<font color="blue"><i>' + subs[4] + '</i></font>$6');
            }
            else if (key === 'unit') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)/m,
                        '$1<font color="red"><i>' + subs[0] + '</i></font>$2');
            }
            return messages;
        };

        this.root.items.measuring.items.knob_setting.processPatterns = function (key, messages, subs) {
            if (key === 'suboptimal') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                        '$1<font color="orange"><i>' + subs[1] +
                        '</i></font>$2<font color="blue"><i>' + subs[0] + '</i></font>$3');
            }
            return messages;
        };

        this.root.items.t_range.items.range_values.processPatterns = function (key, messages, subs) {
            if (key === 'correct' || key === 'rounded' ||
                key === 'correct_wrong_prev_r' || key === 'correct_wrong_prev_t' ||
                key === 'correct_wrong_prev_rt' || key === 'rounded_wrong_prev_r' ||
                key === 'rounded_wrong_prev_t' || key === 'rounded_wrong_prev_rt')
            {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                    '$1<font color="blue"><i>' + subs[1] +
                    '</i></font>$2<font color="blue"><i>' + subs[0] + '</i></font>$3');
            }
            else if (key === 'inaccurate' || key === 'wrong' ||
                key === 'inaccurate_wrong_prev_r' || key === 'inaccurate_wrong_prev_t' ||
                key === 'inaccurate_wrong_prev_rt')
            {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                    '$1<font color="red"><i>' + subs[1] +
                    '</i></font>$2<font color="blue"><i>' + subs[0] + '</i></font>$3');
            }
            return messages;
        };

        this.root.items.t_range.items.in_out.processPatterns = function (key, messages, subs) {
            if (key === 'correct' || key === 'incorrect') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)\$\{.*\}(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                        '$1<font color="green"><i>' + subs[0] +
                        '</i></font>$2<font color="blue"><i>' + subs[1] +
                        '</i></font>$3<font color="blue"><i>' + subs[2] +
                        '</i></font>$4<font color="green"><i>' + subs[3] +
                        '</i></font>$5<font color="green"><i>' + subs[4] + '</i></font>$6');
            }
            return messages;
        };

        this.root.items.time.items.reading.processPatterns = function (key, messages, subs) {
            if (key === 'slow') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)/m,
                        '$1<font color="red"><i>' + subs[0] + '</i></font>$2');
            }
            return messages;
        };

        this.root.items.time.items.measuring.processPatterns = function (key, messages, subs) {
            if (key === 'slow') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)/m,
                        '$1<font color="red"><i>' + subs[0] + '</i></font>$2');
            }
            return messages;
        };

    };

    mr.Feedback.prototype = {

        addFeedback: function (node, key) {
            var messages = [];
            messages[0] = node.feedback.messages[key].short_message;
            messages[1] = node.feedback.messages[key].long_message;
            var subs = Array.prototype.slice.call(arguments, 2);
            if (!node.feedbacks) { node.feedbacks = []; }
            if (node.processPatterns) {
                node.feedbacks.push(node.processPatterns(key, messages, subs));
            }
            else {
                node.feedbacks.push(messages);
            }
        },

        updatePoints: function () {
            this._updatePoints(this.root);
        },

        _updatePoints: function (node) {
            var key, pair, points, maxPoints;

            if (node.items) {
                points = 0;
                maxPoints = 0;
                for (key in node.items) {
                    pair = this._updatePoints(node.items[key]);
                    points += pair[0];
                    maxPoints += pair[1];
                }
                node.points = points;
                node.maxPoints = maxPoints;
            }
            return [node.points, node.maxPoints];
        },

        processPatterns: function (key, messages, substitutions) {
            return messages;
        }
    };

})();

/* FILE log-parser.js */

(function () {

    var mr = sparks.activities.mr;

    mr.LogParser = function (session) {
        this.session = session;
        this.section = session.sections[0];
        this.events = this.section.events;
        this.questions = this.section.questions;

        this.measure_submit_time = this.questions[2].end_time;

        this.submit_red_probe_conn = null;
        this.submit_black_probe_conn = null;
        this.submit_red_plug_conn = null;
        this.submit_black_plug_conn = null;
        this.initial_dial_setting = 'acv_750'; //DMM dial setting when the swith is first turned on
        this.submit_dial_setting = 'acv_750'; //DMM dial setting when the user submits the 3rd question
        this.power_on = false; //Power switch when the user submits the 3rd question
        this.correct_order = true;

        this.temp_power_on = false;
        this.temp_red_probe_conn = null;
        this.temp_black_probe_conn = null;
        this.temp_red_plug_conn = null;
        this.temp_black_plug_conn = null;
        this.temp_dial_setting = null;

        this.initial_dial_setting_set = false;
        this.correct_order_set = false;

        this.parseEvents();
    };

    mr.LogParser.prototype = {

        parseEvents: function () {
            for (var i = 0; i < this.events.length; ++i) {
                if (this.events[i].name === 'connect') {
                    this.parseConnect(this.events[i]);
                }
                else if (this.events[i].name === 'disconnect') {
                    this.parseDisconnect(this.events[i]);
                }
                else if (this.events[i].name === 'multimeter_power') {
                    this.parseMultimeterPower(this.events[i]);
                }
                else if (this.events[i].name === 'multimeter_dial') {
                    this.parseMultimeterDial(this.events[i]);
                }
            }
        },

        parseConnect: function (event) {
            var comps = event.value.split('|');
            switch (comps[0]) {
            case 'red_probe':
                this.parseProbeConnection(event);
                this.parseRedProbeConnection(comps[1], event.time);
                break;
            case 'black_probe':
                this.parseProbeConnection(event);
                this.parseBlackProbeConnection(comps[1], event.time);
                break;
            case 'red_plug':
                this.parseRedPlugConnection(comps[1], event.time);
                break;
            case 'black_plug':
                this.parseBlackPlugConnection(comps[1], event.time);
                break;
            }
            if (this.allConnWithNonResDial()) {
                this.correct_order = false;
            }
        },

        parseDisconnect: function (event) {
        },

        parseMultimeterPower: function (event) {
            this.temp_power_on = event.value;
            if (event.time < this.measure_submit_time) {
                this.power_on = event.value;
                if (event.value === true && !this.initial_dial_setting_set) {
                    this.initial_dial_setting = this.submit_dial_setting;
                    this.initial_dial_setting_set = true;
                }
            }
            if (this.temp_power_on &&
                event.time < this.measure_submit_time)
            {
                if (this.allConnWithNonResDial()) {
                    this.correct_order = false;
                }
            }
        },

        parseMultimeterDial: function (event) {
            this.temp_dial_setting = event.value;
            if (event.time < this.measure_submit_time) {
                this.submit_dial_setting = event.value;
            }
        },

        parseProbeConnection: function (event) {
        },

        parseRedProbeConnection: function (connectedTo, time) {
            this.temp_red_probe_conn = connectedTo;
            if (time < this.measure_submit_time) {
                this.submit_red_probe_conn = connectedTo;
            }
        },

        parseBlackProbeConnection: function (connectedTo, time) {
            this.temp_black_probe_conn = connectedTo;
            if (time < this.measure_submit_time) {
                this.submit_black_probe_conn = connectedTo;
            }
        },

        parseRedPlugConnection: function (connectedTo, time) {
            this.temp_red_plug_conn = connectedTo;
            if (time < this.measure_submit_time) {
                this.submit_red_plug_conn = connectedTo;
            }
        },

        parseBlackPlugConnection: function (connectedTo, time) {
            this.temp_black_plug_conn = connectedTo;
            if (time < this.measure_submit_time) {
                this.submit_black_plug_conn = connectedTo;
            }
        },

        getLastConnection: function (conn1) {
            var conn2 = null;
            var values = null;
            for (var i = 0; i < this.events.length; ++i) {
                if (this.events[i].name == 'connect') {
                    values = this.events[i].value.split('|');
                    if (values[0] == conn1) {
                        conn2 = values[1];
                    }
                }
            }
            return conn2;
        },

        /*
         * Last time before measured resistance is submitted that the circuit is
         * all connected.
         *
         * Returns +Infinity if there's no 'make_circuit' events.
         */
        getLastCircuitMakeTime: function () {
            var end_time = this.measure_submit_time;
            var make_time = Infinity;
            for (var i = 0; i < this.events.length && this.events[i].time < end_time; ++i) {
                if (this.events[i].name === 'make_circuit') {
                    make_time = this.events[i].time;
                }
            }
            return make_time;
        },

        getLastCircuitBreakTime: function () {
            var end_time = this.measure_submit_time;
            var break_time = -Infinity;
            for (var i = 0; i < this.events.length && this.events[i].time < end_time; ++i) {
                if (this.events[i].name === 'break_circuit') {
                    break_time = this.events[i].time;
                }
            }
            return break_time;
        },

        allConnWithNonResDial: function () {
            return (this.temp_red_probe_conn &&
                this.temp_black_probe_conn &&
                this.temp_red_plug_conn &&
                this.temp_black_plug_conn &&
                this.temp_dial_setting != 'r_2000k' &&
                this.temp_dial_setting != 'r_200k' &&
                this.temp_dial_setting != 'r_20k' &&
                this.temp_dial_setting != 'r_2000' &&
                this.temp_dial_setting != 'r_200' &&
                this.temp_power_on);
        }
    };

})();

/* FILE grader.js */

(function () {

    var math = sparks.math;
    var unit = sparks.unit;
    var str = sparks.string;
    var mr = sparks.activities.mr;

    mr.Grader = function (session, rubric) {
        this.session = session;
        this.rubric = rubric;

        this.section = this.session.sections[0];
        this.questions =  this.section.questions;

        this.feedback = new mr.Feedback(rubric);
        this.parser = new mr.LogParser(session);

        this.resistanceAnswer = null;
        this.toleranceAnswer = null;
        this.measuredResistanceAnswer = null;
        this.rangeMinAnswer = null;
        this.rangeMaxAnswer = null;
    };

    mr.Grader.prototype = {

        grade: function () {
            this.realCorrectMin = this.section.nominal_resistance * (1 - this.section.tolerance);
            this.realCorrectMax = this.section.nominal_resistance * (1 + this.section.tolerance);

            this.gradeReadingColorBands();
            this.gradeTolerance();
            this.gradeResistance();
            this.gradeToleranceRange();
            this.gradeWithinTolerance();
            this.gradeTime();
            this.gradeSettings();

            this.feedback.updatePoints();

            return this.feedback;
        },

        gradeReadingColorBands: function () {
            var question = this.questions[0];
            var unitCorrect = true;
            var fb = this.feedback.root.items.reading.items.rated_r_value;

            fb.correct = 0;
            fb.points = 0;

            if (!unit.ohmCompatible(question.unit)) {
                this.resistanceAnswer = null;
                unitCorrect = false;
                this.feedback.addFeedback(fb, 'unit', question.unit);
                return;
            }

            if (question.answer === null || isNaN(question.answer)) {
                this.resistanceAnswer = null;
                this.feedback.addFeedback(fb, 'incorrect');
                return;
            }

            var parsedValue = unit.normalizeToOhms(question.answer, question.unit);
            this.resistanceAnswer = parsedValue;


            if (question.correct_answer != parsedValue) {
                if (unitCorrect) {
                    if (math.equalExceptPowerOfTen(question.correct_answer, parsedValue)) {
                        fb.points = 10;
                        fb.correct = 2;
                        this.feedback.addFeedback(fb, 'power_ten',
                            this.section.resistor_num_bands - 1,
                            this.section.resistor_num_bands - 2);
                        return;
                    }
                    else if (this.oneOff(question.correct_answer, parsedValue)) {
                        fb.points = 2;
                        fb.correct = 1;
                        this.feedback.addFeedback(fb, 'difficulty');
                        return;
                    }
                }
                this.feedback.addFeedback(fb, 'incorrect');
                return;
            }
            fb.points = 20;
            fb.correct = 4;
            this.feedback.addFeedback(fb, 'correct');
        },

        gradeResistance: function () {
            var question = this.questions[2];
            var fb = this.feedback.root.items.measuring.items.measured_r_value;
            var unitCorrect = true;

            fb.points = 0;
            fb.correct = 0;

            if (!unit.ohmCompatible(question.unit)) {
                unitCorrect = false;
                this.feedback.addFeedback(fb, 'unit', question.unit);
                return;
            }

            if (question.answer === null || isNaN(question.answer)) {
                this.feedback.addFeedback(fb, 'incorrect');
                return;
            }

            var parsedValue = unit.normalizeToOhms(question.answer, question.unit);
            this.measuredResistanceAnswer = parsedValue;

            console.log('parsedValue=' + parsedValue + ' correctValue=' + question.correct_answer);

            if (question.correct_answer != parsedValue) {
                var n = this.section.resistor_num_bands - 2;
                if (this.roundedMatch(question.correct_answer, parsedValue, n)) {
                    fb.points = 5;
                    fb.correct = 3;
                    this.feedback.addFeedback(fb, 'incomplete', unit.res_str(question.correct_answer),
                        unit.res_str(parsedValue));
                    return;
                }
                else if (math.equalExceptPowerOfTen(question.correct_answer, parsedValue)) {
                    fb.points = 3;
                    fb.correct = 2;
                    this.feedback.addFeedback(fb, 'power_ten', question.answer, question.unit,
                            unit.res_unit_str(question.correct_answer),
                            unit.res_unit_str(question.correct_answer, 'k'),
                            unit.res_unit_str(question.correct_answer, 'M'));
                    return;
                }
                this.feedback.addFeedback(fb, 'incorrect');
                return;
            }

            fb.points = 10;
            fb.correct = 4;
            this.feedback.addFeedback(fb, 'correct');
        },

        gradeTolerance: function () {
            var question = this.questions[1];
            var fb = this.feedback.root.items.reading.items.rated_t_value;

            var correctStr = (question.correct_answer * 100) + '%';
            var answerStr = question.answer + '%';

            fb.correct = 0;
            fb.points = 0;

            if (question.answer === null || isNaN(question.answer)) {
                this.feedback.addFeedback(fb, 'incorrect', correctStr, answerStr);
                return;
            }
            this.toleranceAnswer = question.answer / 100.0;
            if (question.correct_answer != question.answer / 100.0){
                this.feedback.addFeedback(fb, 'incorrect', correctStr, answerStr);
                return;
            }

            fb.correct = 4;
            fb.points = 5;
            this.feedback.addFeedback(fb, 'correct');
        },

        gradeToleranceRange: function () {
            var question = this.questions[3];
            var fb = this.feedback.root.items.t_range.items.range_values;
            var fb_r = this.feedback.root.items.reading.items.rated_r_value;
            var fb_t = this.feedback.root.items.reading.items.rated_t_value;
            var nominalResistance;
            var fbkey;

            question.correct_answer = [this.realCorrectMin, this.realCorrectMax];

            if (this.resistanceAnswer) {
                nominalResistance = this.resistanceAnswer;
            }
            else {
                nominalResistance = this.section.nominal_resistance;
            }
            var tolerance = this.toleranceAnswer;

            fb.points = 0;
            fb.correct = 0;

            var correctMin = nominalResistance * (1 - tolerance);
            var correctMax = nominalResistance * (1 + tolerance);


            var min = question.answer[0];
            var max = question.answer[1];

            var correctStr = '[' + unit.res_str(correctMin) + ', ' +
                unit.res_str(correctMax) + ']';
            var answerStr = '[' + min + ' ' + question.unit[0] + ', ' +
                max + ' ' + question.unit[1] + ']';

            if (min === null || isNaN(min) || max === null || isNaN(max)) {
                this.feedback.addFeedback(fb, 'wrong', correctStr, answerStr);
                return;
            }


            if (!unit.ohmCompatible(question.unit[0]) ||
                !unit.ohmCompatible(question.unit[1]))
            {
                this.feedback.addFeedback(fb, 'wrong');
                return;
            }

            var parsedMin = unit.normalizeToOhms(min, question.unit[0]);
            var parsedMax = unit.normalizeToOhms(max, question.unit[1]);

            this.rangeMinAnswer = parsedMin;
            this.rangeMaxAnswer = parsedMax;

            if (parsedMin > parsedMax) {
                var tmp = parsedMin;
                parsedMin = parsedMax;
                parsedMax = tmp;
            }

            if (this.equalWithTolerance(parsedMin, correctMin, 1e-5) &&
                this.equalWithTolerance(parsedMax, correctMax, 1e-5))
            {
                fb.points = 15;
                fb.correct = 4;
                if (fb_r.correct === 4) {
                    if (fb_t.correct == 4) {
                        this.feedback.addFeedback(fb, 'correct', unit.res_str(nominalResistance),
                                unit.pct_str(tolerance));
                    }
                    else {
                        this.feedback.addFeedback(fb, 'correct_wrong_prev_t', unit.res_str(nominalResistance),
                                unit.pct_str(tolerance));
                    }
                }
                else if (fb_t.correct == 4) {
                    this.feedback.addFeedback(fb, 'correct_wrong_prev_r', unit.res_str(nominalResistance),
                            unit.pct_str(tolerance));
                }
                else {
                    this.feedback.addFeedback(fb, 'correct_wrong_prev_rt', unit.res_str(nominalResistance),
                            unit.pct_str(tolerance));
                }
                return;
            }

            var n = this.section.resistor_num_bands - 2;

            if (math.roundToSigDigits(correctMin, n) ===
                math.roundToSigDigits(parsedMin, n) &&
                math.roundToSigDigits(correctMax, n) ===
                math.roundToSigDigits(parsedMax, n))
            {
                fb.points = 10;
                fb.correct = 3;
                if (fb_r.correct === 4) {
                    if (fb_t.correct === 4) {
                        this.feedback.addFeedback(fb, 'rounded', unit.res_str(nominalResistance),
                                unit.pct_str(tolerance));
                    }
                    else {
                        this.feedback.addFeedback(fb, 'rounded_wrong_prev_t', unit.res_str(nominalResistance),
                                unit.pct_str(tolerance));
                    }
                }
                else if (fb_t.correct === 4) {
                    this.feedback.addFeedback(fb, 'rounded_wrong_prev_r', unit.res_str(nominalResistance),
                            unit.pct_str(tolerance));
                }
                else {
                    this.feedback.addFeedback(fb, 'rounded_wrong_prev_rt', unit.res_str(nominalResistance),
                            unit.pct_str(tolerance));
                }
                return;
            }

            if (Math.abs(math.getRoundedSigDigits(correctMin, n) -
                         math.getRoundedSigDigits(parsedMin, n)) <= 2 &&
                Math.abs(math.getRoundedSigDigits(correctMax, n) -
                         math.getRoundedSigDigits(parsedMax, n)) <= 2)
            {
                fb.points = 3;
                fb.correct = 2;
                if (fb_r.correct === 4) {
                    if (fb_t.correct === 4) {
                        this.feedback.addFeedback(fb, 'inaccurate', correctStr, answerStr);
                    }
                    else {
                        this.feedback.addFeedback(fb, 'inaccurate_wrong_prev_t', correctStr, answerStr);
                    }
                }
                else if (fb_t.correct === 4) {
                    this.feedback.addFeedback(fb, 'inaccurate_wrong_prev_r', correctStr, answerStr);
                }
                else {
                    this.feedback.addFeedback(fb, 'inaccurate_wrong_prev_rt', correctStr, answerStr);
                }
                return;
            }
            this.feedback.addFeedback(fb, 'wrong', correctStr, answerStr);
            return;
        },

        gradeWithinTolerance: function () {
            var question = this.questions[4];
            var correctAnswer;
            var nominalResistance = null;

            if (this.section.displayed_resistance >= this.realCorrectMin &&
                this.section.displayed_resistance <= this.realCorrectMax)
            {
                question.correct_answer = 'yes';
            }
            else {
                question.correct_answer = 'no';
            }

            var fb = this.feedback.root.items.t_range.items.in_out;

            if (this.feedback.root.items.measuring.items.measured_r_value.correct < 4 ||
                this.feedback.root.items.t_range.items.range_values < 4)
            {
                fb.points = 0;
                fb.correct = 0;
                this.feedback.addFeedback(fb, 'undef');
                return;
            }

            if (this.resistanceAnswer) {
                nominalResistance = this.resistanceAnswer;
            }
            else {
                nominalResistance = this.section.nominal_resistance;
            }
            var tolerance = this.toleranceAnswer;

            var displayValue = null;
            if (this.measuredResistanceAnswer) {
                displayValue = this.measuredResistanceAnswer;
            }
            else {
                displayValue = this.section.displayed_resistance;
            }
            var allowance = nominalResistance * tolerance;

            fb.correct = 0;
            fb.points = 0;

            if (displayValue < nominalResistance - allowance ||
                displayValue > nominalResistance + allowance)
            {
                correctAnswer = 'no';
            }
            else {
                correctAnswer = 'yes';
            }

            var did = (correctAnswer === 'no') ? 'did not' : 'did';
            var is = (correctAnswer === 'no') ? 'is not' : 'is';

            if (question.answer !== correctAnswer) {
                if (question.correct_answer === correctAnswer) {
                    this.feedback.addFeedback(fb, 'incorrect',
                        unit.res_str(this.measuredResistanceAnswer),
                        unit.res_str(this.rangeMinAnswer),
                        unit.res_str(this.rangeMaxAnswer),
                        did, is);
                }
                else {
                    this.feedback.addFeedback(fb, 'incorrect_wrong_prev');
                }
                return;
            }
            fb.points = 5;
            fb.correct = 4;

            if (question.correct_answer === correctAnswer) {
                this.feedback.addFeedback(fb, 'correct',
                    unit.res_str(this.measuredResistanceAnswer),
                    unit.res_str(this.rangeMinAnswer),
                    unit.res_str(this.rangeMaxAnswer),
                    did, is);
            }
            else {
                this.feedback.addFeedback(fb, 'correct_wrong_prev');
            }
        },

        gradeTime: function () {
            var seconds;
            var fb;

            this.feedback.reading_time = this.questions[1].end_time - this.questions[0].start_time;
            seconds = this.feedback.reading_time / 1000;
            fb = this.feedback.root.items.time.items.reading;
            if (seconds <= 20) {
                fb.points = 5;
                fb.correct = 4;
                this.feedback.addFeedback(fb, 'efficient');
            }
            else if (seconds <= 40) {
                fb.points = 2;
                fb.correct = 2;
                this.feedback.addFeedback(fb, 'semi');
            }
            else {
                fb.points = 0;
                fb.correct = 0;
                this.feedback.addFeedback(fb, 'slow', Math.round(seconds));
            }

            this.feedback.measuring_time = this.questions[2].end_time - this.questions[2].start_time;
            seconds = this.feedback.measuring_time / 1000;
            fb = this.feedback.root.items.time.items.measuring;
            if (seconds <= 20) {
                fb.points = 5;
                fb.correct = 4;
                this.feedback.addFeedback(fb, 'efficient');
            }
            else if (seconds <= 40) {
                fb.points = 2;
                fb.correct = 2;
                this.feedback.addFeedback(fb, 'semi');
            }
            else {
                fb.points = 0;
                fb.correct = 0;
                this.feedback.addFeedback(fb, 'slow', Math.round(seconds));
            }
        },

        gradeSettings: function () {
            var fb = this.feedback.root.items.measuring;
            var redProbeConn = this.parser.submit_red_probe_conn;
            var blackProbeConn = this.parser.submit_black_probe_conn;
            var redPlugConn = this.parser.submit_red_plug_conn;
            var blackPlugConn = this.parser.submit_black_plug_conn;


            if ((redProbeConn == 'resistor_lead1' || redProbeConn == 'resistor_lead2') &&
                (blackProbeConn == 'resistor_lead1' || blackProbeConn == 'resistor_lead2') &&
                (redProbeConn != blackProbeConn))
            {
                fb.items.probe_connection.correct = 4;
                fb.items.probe_connection.points = 2;
                fb.items.probe_connection.desc = 'Correct';
                this.feedback.addFeedback(fb.items.probe_connection, 'correct');
            }
            else {
                fb.items.probe_connection.correct = 0;
                fb.items.probe_connection.points = 0;
                fb.items.probe_connection.desc = 'Incorrect';
                this.feedback.addFeedback(fb.items.probe_connection, 'incorrect');
            }

            if (redPlugConn == 'voma_port' && blackPlugConn == 'common_port') {
                fb.items.plug_connection.points = 5;
                fb.items.plug_connection.correct = 4;
                fb.items.plug_connection.desc = 'Correct';
                this.feedback.addFeedback(fb.items.plug_connection, 'correct');
            }
            else {
                fb.items.plug_connection.correct = 0;
                if (redPlugConn == 'common_port' && blackPlugConn == 'voma_port') {
                    fb.items.plug_connection.points = 3;
                    fb.items.plug_connection.correct = 3;
                    fb.items.plug_connection.desc = 'Reversed';
                    this.feedback.addFeedback(fb.items.plug_connection, 'reverse');
                }
                else {
                    fb.items.plug_connection.points = 0;
                    fb.items.plug_connection.correct = 0;
                    fb.items.plug_connection.desc = 'Incorrect';
                    this.feedback.addFeedback(fb.items.plug_connection, 'incorrect');
                }
            }

            var i_knob = this.parser.initial_dial_setting;
            var f_knob = this.parser.submit_dial_setting;
            var o_knob = this.optimalDial(this.section.displayed_resistance);

            this.feedback.initial_dial_setting = i_knob;
            this.feedback.submit_dial_setting = f_knob;
            this.feedback.optimal_dial_setting = o_knob;

            if (f_knob === o_knob) {
                fb.items.knob_setting.points = 20;
                fb.items.knob_setting.correct = 4;
                this.feedback.addFeedback(fb.items.knob_setting, 'correct');
            }
            else if (this.isResistanceKnob(f_knob)){
                fb.items.knob_setting.points = 10;
                fb.items.knob_setting.correct = 2;
                this.feedback.addFeedback(fb.items.knob_setting, 'suboptimal', o_knob, f_knob);
            }
            else {
                fb.items.knob_setting.points = 0;
                fb.items.knob_setting.correct = 0;
                this.feedback.addFeedback(fb.items.knob_setting, 'incorrect');
            }

            if (this.parser.power_on) {
                fb.items.power_switch.points = 2;
                fb.items.power_switch.correct = 4;
                this.feedback.addFeedback(fb.items.power_switch, 'correct');
            }
            else {
                fb.items.power_switch.points = 0;
                fb.items.power_switch.correct = 0;
                this.feedback.addFeedback(fb.items.power_switch, 'incorrect');
            }
            console.log('power_switch.points=' + fb.items.power_switch.points);

            if (this.parser.correct_order) {
                fb.items.task_order.points = 6;
                fb.items.task_order.correct = 4;
                this.feedback.addFeedback(fb.items.task_order, 'correct');
            }
            else {
                fb.items.task_order.points = 0;
                fb.items.task_order.correct = 0;
                this.feedback.addFeedback(fb.items.task_order, 'incorrect');
            }
            console.log('task_order.points=' + fb.items.task_order.points);
        },

        equalWithTolerance: function (value1, value2, tolerance) {
            return Math.abs(value1 - value2) < tolerance;
        },

        validateNonEmpty: function (inputField, form) {
            if (inputField === null ||
                inputField === undefined ||
                inputField.length < 1)
            {
                form.message = "No Value Entered";
                return false;
            }
            return true;
        },

        validateNumber: function (num, answer) {
            if (isNaN(num)) {
                answer.message = "Value entered is not a number";
                return false;
            }
            return true;
        },

        roundedMatch: function (x, y, numSig) {
            return math.roundToSigDigits(x, numSig) === y;
        },

        oneOff: function (x, y) {
            var sx = x.toString();
            var sy = y.toString();
            if (!sx.match(/\./)) {
                sx = sx + '.';
            }
            if (!sy.match(/\./)) {
                sy = sy + '.';
            }
            sx = str.stripZeros(sx);
            sy = str.stripZeros(sy);
            if (sx.length != sy.length) {
                return false;
            }
            var numDiff = 0;
            for (var i = 0; i < sx.length; ++i) {
                if (sx.charAt(i) !== sy.charAt(i)) {
                    numDiff += 1;
                    if (numDiff > 1) {
                        return false;
                    }
                }
            }
            return true;
        },

        sameBeforeDot: function (x, y) {
            var lx = String(x).split('.')[0].length;
            var ly = String(y).split('.')[0].length;
            return lx === ly;
        },

        semiCorrectDigits: function (x, y, numSigDigits) {
            var sx = String(x).replace('.', '').substring(0, numSigDigits);
            var sy = String(y).replace('.', '').substring(0, numSigDigits);
            if (sx === sy ||
                sx === this.reverseString(sy) ||
                this.onlyOneDigitDifferent(sx, sy))
            {
                return true;
            }
            return false;
        },

        reverseString: function (s) {
            return s.split('').reverse().join('');
        },

        onlyOneDigitDifferent: function (x, y) {
            var numDiff = 0;
            for (var i = 0; i < x.length; ++i) {
                if (x[i] !== y[i]) {
                    ++numDiff;
                }
            }
            return numDiff == 1;
        },

        optimalDial: function (r) {
            if (r < 200) { return 'r_200'; }
            if (r < 2000) { return 'r_2000'; }
            if (r < 20e3) { return 'r_20k'; }
            if (r < 200e3) { return 'r_200k'; }
            return 'r_2000k';
        },

        isResistanceKnob: function (setting) {
            return setting === 'r_200' ||
                setting === 'r_2000' ||
                setting === 'r_20k' ||
                setting === 'r_200k';
        }
    };

})();
