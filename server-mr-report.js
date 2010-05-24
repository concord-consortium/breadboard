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
        if (typeof print !== 'undefined') {
            console.log = print;
        }
        else if (typeof debug !== 'undefined') {
            console.log = debug;
        }
        else {
            console.log = function () {};
        }
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
             debug('ERROR: math.leftMostPos: Invalid input ' + x);
             return 0;
         }
         if (x == 0) {
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

/* FILE feedback.js */

(function () {

    var mr = sparks.activities.mr;

    /**
     * A FeedbackItem is contains derived information from the activity log:
     * Grader parses the activity log and populates feedback items.
     * Reporter uses feedback items to generate the report.
     */
    mr.FeedbackItem = function (maxPoints) {
        this.correct = 0;

        this.feedbacks = [];
        this.feedbackSpace = null; //set of all possible feedback messages
        this.points = 0;
        this.maxPoints = (maxPoints === null || maxPoints === undefined ? 0 : maxPoints);
    };

    mr.FeedbackItem.prototype = {

        updatePoints : function () {
            var key;
            var isLeaf = true;
            for (key in this) {
                if (this[key] instanceof mr.FeedbackItem) {
                    isLeaf = false;
                    break;
                }
            }
            if (!isLeaf) {
                this.points = 0;
                this.maxPoints = 0;
                for (key in this) {
                    if (this[key] instanceof mr.FeedbackItem) {
                        pair = this[key].updatePoints();
                        this.points += pair[0];
                        this.maxPoints += pair[1];
                    }
                }
            }
            return [this.points, this.maxPoints];
        },

        addFeedback: function (key) {
            var messages = [];
            for (var i = 0; i < this.feedbackSpace[key].length; ++i) {
                messages[i] = this.feedbackSpace[key][i];
            }
            var subs = Array.prototype.slice.call(arguments, 1);
            this.feedbacks.push(this.processPatterns(key, messages, subs));
        },

        processPatterns: function (key, messages, substitutions) {
            return messages;
        }
    };

    mr.Feedback = function () {
        this.optimal_dial_setting = '';
        this.initial_dial_setting = '';
        this.final_dial_setting = '';
        this.time_reading = 0;
        this.time_measuring = 0;

        this.root = new mr.FeedbackItem();

        this.root.reading = new mr.FeedbackItem();
        this.root.reading.rated_r_value = new mr.FeedbackItem(20);
        this.root.reading.rated_t_value = new mr.FeedbackItem(5);

        this.root.measuring = new mr.FeedbackItem();
        this.root.measuring.plug_connection = new mr.FeedbackItem(5);
        this.root.measuring.probe_connection = new mr.FeedbackItem(2);
        this.root.measuring.knob_setting = new mr.FeedbackItem(20);
        this.root.measuring.power_switch = new mr.FeedbackItem(2);
        this.root.measuring.measured_r_value = new mr.FeedbackItem(10);
        this.root.measuring.task_order = new mr.FeedbackItem(6);

        this.root.t_range = new mr.FeedbackItem();
        this.root.t_range.t_range_value = new mr.FeedbackItem(15);
        this.root.t_range.within_tolerance = new mr.FeedbackItem(5);

        this.root.time = new mr.FeedbackItem();
        this.root.time.reading_time = new mr.FeedbackItem(5);
        this.root.time.measuring_time = new mr.FeedbackItem(5);

        this.root.reading.rated_r_value.feedbackSpace = {
            correct: [
                'Correct interpretation of color bands',
                'Good work! You correctly interpreted the color bands used to label this resistor’s rated resistance value.'
            ],
            power_ten: [
                'Power-of-ten error',
                'Although you got the digits correct, based on the first ${number of bands} bands, you seemed to have trouble interpreting the power-of-ten band. This band determines the power of ten to multiply the digits from the first ${number of bands – 1} bands. See the Color Band tutorial for additional help.'
            ],
            difficulty: [
                'Apparent difficulty interpreting color bands',
                'One of the digits that you reported from the color bands was incorrect. Roll over each band to expand the color and double-check your interpretation of each color band before submitting your answer. See the Color Band tutorial for additional help.'
            ],
            incorrect: [
                'Incorrect interpretation of color bands',
                'The resistance value you submitted indicates that you misinterpreted more than one color band. You seem to be having difficulty using the color bands to determine the rated resistor value. See the Color Band tutorial for a table of band colors and the numbers they signify.'
            ],
            unit: [
                'Incorrect units (not resistance units)',
                'You mistakenly specified ${selected unit} in your answer. That is not a unit resistance of resistance. The base unit for resistance is the ohm.'
            ]
        };

        this.root.reading.rated_r_value.processPatterns = function (key, messages, subs) {
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

        this.root.reading.rated_t_value.feedbackSpace = {
            correct: [
                'Correct interpretation of tolerance color band',
                'Good work! You correctly interpreted the color band used to label this resistor’s rated tolerance.'
            ],
            incorrect: [
                'Incorrect tolerance value',
                'You specified ${your tolerance-value}, rather than the correct tolerance value of ${tolerance value}. Next time, refer to the color code for the tolerance band. See the Color Band tutorial for additional help.'
            ]
        };

        this.root.reading.rated_t_value.processPatterns = function (key, messages, subs) {
            if (key === 'incorrect') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                    '$1<font color="red"><i>' + subs[1] +
                    '</i></font>$2<font color="blue"><i>' + subs[0] + '</i></font>$3');
            }
            return messages;
        };

        this.root.measuring.measured_r_value.feedbackSpace = {
            correct: [
                'Correct measured R value',
                'You correctly reported the value of this resistor as measured with the digital multimeter.'
            ],
            incomplete: [
                'Did not record complete value from DMM display.',
                'You should record all the digits displayed by the digital multimeter —don’t round the results. While the DMM displayed ${dmm-display}, your answer was ${your answer-value}.'
            ],
            power_ten: [
                'Power-of-ten error.',
                'While the digits you submitted from the digital multimeter display appear to be correct, the power of ten implied by the units you chose were incorrect. Your answer was ${your answer-value} ${your answer-units}, but the correct answer was ${answer-ohms}, ${answer-k-ohms}, or ${answer meg-ohms}.'
            ],
            incorrect: [
                'Not a measured value.',
                'Submitted value does not match a valued measured with the digital multimeter. The tutorial on this subject may help clarify this topic for you.'
            ],
            unit: [
                'Incorrect type of units.',
                'The result of a resistance measurement should be a resistance unit, such as Ω, kΩ, or MΩ, not ${your answer-unit}.'
            ]
        };

        this.root.measuring.measured_r_value.processPatterns = function (key, messages, subs) {
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

        this.root.measuring.plug_connection.feedbackSpace = {
            correct: [
                'Correct connections to the DMM',
                'Good work. The probes were correctly connected to the digital multimeter for this measurement.'
            ],
            reverse: [
                'Connections to DMM are reversed',
                '<p>While the meter will still read resistance measurements ' +
                'correctly, it is good practice to always connect the red lead ' +
                'to the <font color="blue">VΩmA</font> jack, and the black lead ' +
                'to the <font color="blue">COM</font> jack of the DMM.</p>' +
                '<p>This will be essential when making correct measurements of voltage and current in later modules. See the Using the DMM tutorial for additional help.</p>'
            ],
            incorrect: [
                'Connections to the DMM are incorrect',
                '<p>The digital multimeter will not measure resistance unless the ' +
                'leads are plugged in correctly: red lead to ' +
                '<font color="blue">VΩmA</font> jack, black lead to ' +
                '<font color="blue">COM</font> jack.</p>' +
                '<p>While there is no risk in this case, it is good practice to be aware that any time you connect the leads to incorrect DMM jacks and to a circuit, you may damage the meter and/or your circuit. See the Using the DMM tutorial for additional help.</p>'
            ]
        };

        this.root.measuring.probe_connection.feedbackSpace = {
                correct: [
                    'Correct connections to the resistor',
                    'Good work. You correctly connected the probes to each end of the resistor to make your resistance measurement.'
                ],
                incorrect: [
                    'Incorrect connections to the resistor',
                    'You must connect one of the digital multimeter probes to each end of the resistor to make a resistance measurement. See the Using the DMM tutorial for additional help.'
                ]
        };

        this.root.measuring.knob_setting.feedbackSpace = {
            correct: [
                'Correct DMM knob setting.',
                'Good work. You set the digital multimeter knob to the correct resistance scale for this resistance measurement.'
            ],
            suboptimal: [
                'DMM knob set to incorrect resistance scale',
                '<p>While the digital multimeter knob was set to measure ' +
                'resistance, it was not set to display the optimal scale for ' +
                'this resistance measurement.</p><p>You chose ' +
                '${your-knob-setting}, but the best scale setting for your ' +
                'resistor would have been ${optimum-knob-setting}. See the ' +
                'Using the DMM tutorial for additional help.</p>'
            ],
            incorrect: [
                'DMM knob not set to a resistance scale',
                '<p>While there is no risk in this case, the digital multimeter ' +
                'knob should always be set to the proper type of measurement.</p>' +
                '<p>Here you are measuring resistance, and so the DMM knob ' +
                'should be set to a resistance scale, such as 2000Ω, 20kΩ, and ' +
                'so forth.</p><p>Any other knob-type setting, may damage either ' +
                'the meter and/or your circuit. See the Using the DMM tutorial ' +
                'for additional help.'
            ]
        };

        this.root.measuring.knob_setting.processPatterns = function (key, messages, subs) {
            if (key === 'suboptimal') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                        '$1<font color="orange"><i>' + subs[1] +
                        '</i></font>$2<font color="blue"><i>' + subs[0] + '</i></font>$3');
            }
            return messages;
        };

        this.root.measuring.power_switch.feedbackSpace = {
            correct: [
                'DMM turned ON',
                'Good work. You correctly turned on the digital multimeter to make this resistance measurement.'
            ],
            incorrect: [
                'DMM was not turned ON',
                '<p>The digital multimeter was off. A digital multimeter ' +
                'can only function with power supplied to the electronics within ' +
                'and the display.</p><p>In addition, when making resistance ' +
                'measurements, a DMM must supply a small amount of test current ' +
                'through the probes. See the Using the DMM tutorial for ' +
                'additional help.'
            ]
        };

        this.root.measuring.task_order.feedbackSpace = {
            correct: [
                'Order of tasks is acceptable.',
                'When measuring resistance, it is always a good practice to have the DMM knob set to a resistance function prior to turning ON the digital multimeter and connecting the probes to the circuit, just as you did.  Good job!'
            ],
            incorrect: [
                'Incorrect order of tasks',
                '<p>When measuring resistance, it is not good practice to have the digital multimeter knob set to a non-resistance function when it is turned on and connected to a circuit.</p><p>At some point during this session, we noted that this condition occurred.</p><p>Next time, turn the DMM knob to a resistance function before connecting the leads to the resistor. See the Using the DMM tutorial for additional help.</p>'
            ]
        };

        this.root.t_range.t_range_value.feedbackSpace = {
            correct: [
                'Correct calculation',
                'You correctly applied the ${tolerance-band-number} tolerance band to the ${resistor-value} resistor value to calculate the tolerance range for this resistor, and included all the digits in your answer. Good work.'
            ],
            rounded: [
                'Rounded result',
                'You appeared to correctly apply the ${tolerance-band-number} tolerance band to the ${resistor-value} resistor value to calculate the tolerance range for this resistor, but you seem to have rounded your answer. For this activity, we recommend you report as many digits as the rated value of the resistance has. For instance, if the rated resistance is 12,300 ohms, based on a reading of a five color band resistor, you should report the minimum and maximum values of the tolerance range to three significant digits.'
            ],
            inaccurate: [
                'Inaccurate tolerance',
                'The tolerance range that you specified is close but incorrect. You reported ${student’s-tolerance-range} but the correct answer was ${correct-tolerance-range}. See the Calculating Tolerance tutorial for additional help.'
            ],
            wrong: [
                'Wrong tolerance',
                'The tolerance range that you specified is incorrect. You reported ${student’s-tolerance-range} but the correct answer was ${correct-tolerance-range}. See the Calculating Tolerance tutorial for additional help.'
            ]
        };

        this.root.t_range.t_range_value.processPatterns = function (key, messages, subs) {
            if (key === 'correct' || key === 'rounded') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                    '$1<font color="blue"><i>' + subs[1] +
                    '</i></font>$2<font color="blue"><i>' + subs[0] + '</i></font>$3');
            }
            else if (key === 'inaccurate' || key === 'wrong') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                    '$1<font color="red"><i>' + subs[1] +
                    '</i></font>$2<font color="blue"><i>' + subs[0] + '</i></font>$3');
            }
            return messages;
        };

        this.root.t_range.within_tolerance.feedbackSpace = {
            correct: [
                'Measurement recognized as in/out of tolerance',
                'Good work. The measured value, ${your answer-value}, should fall within the tolerance range, that is between the minimum ${min-resistance-value} and the maximum ${max resistance value} that you calculated based on the tolerance percentage. Since the measured value of this resistor ${did|did not} fall within this range, this resistor ${is|is not} within tolerance.'
            ],
            incorrect: [
                'Measurement not recognized as in/out of tolerance',
                'The measured value, ${your answer-value}, should fall within the tolerance range, that is between the minimum ${min-resistance-value} and the maximum ${max resistance value} that you calculated based on the tolerance percentage. Since the measured value ${did|did not} fall within this range, this resistor ${is|is not} within tolerance.'
            ],
            undef: [
                'Previous question(s) incorrect',
                "You answer to either the measuring resistance question or the tolerance range question was incorrect, so you didn't have enough information to answer this question."
            ]
        };

        this.root.t_range.within_tolerance.processPatterns = function (key, messages, subs) {
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

        this.root.time.reading_time.feedbackSpace = {
            efficient: [
                'Very efficient!',
                'For this assessment, remembering and quickly interpreting the color bands on a resistor is the key to entering your answer in less than 20 seconds. You did this! Good work!'
            ],
            semi: [
                'Can you speed it up?',
                'For this assessment, you should be able to remember and interpret the color bands on a resistor, and then enter your answer in less than 20 seconds. Are you still looking up each color? Try memorizing the color code and get familiar with the key strokes to enter the values. See the Color Band tutorial for additional help and try again.'
            ],
            slow: [
                'Too slow',
                'For this assessment, you should be able to remember and interpret the color bands on a resistor, and then enter your answer in less 20 seconds. You took ${your-time} seconds. That’s too long! Are you still having to look up each color? Try memorizing the color code and get familiar with the key strokes to enter the values. See the Color Band tutorial for additional help, then try again and see if you can go faster.'
            ]
        };

        this.root.time.reading_time.processPatterns = function (key, messages, subs) {
            if (key === 'slow') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)/m,
                        '$1<font color="red"><i>' + subs[0] + '</i></font>$2');
            }
            return messages;
        };

        this.root.time.measuring_time.feedbackSpace = {
            efficient: [
                'Very efficient!',
                'For this assessment, setting up the digital multimeter and correctly connecting it to the circuit is the key to entering your answer in less than 20 seconds. You did this! Good work!'
            ],
            semi: [
                'Efficient',
                'For this assessment, you should be familiar with the digital multimeter so you know where to set the knob, where to connect the leads, and how to turn on the meter to obtain a reading in less than 20 seconds.  See the Using the DMM tutorial for additional help.'
            ],
            slow: [
                'Too slow',
                'Your goal is to use the digital multimeter quickly and effectively.  You should be familiar with the DMM so that you know where to set the knob, where to connect the leads, and how to turn I on in order to obtain a reading in less than 20 seconds. You took ${your-time} seconds. That’s too long!. See the Using the DMM tutorial for additional help.'
            ]
        };

        this.root.time.measuring_time.processPatterns = function (key, messages, subs) {
            if (key === 'slow') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)/m,
                        '$1<font color="red"><i>' + subs[0] + '</i></font>$2');
            }
            return messages;
        };

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
                debug('event name=' + this.events[i].name + ' value=' + this.events[i].value);
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

    mr.Grader = function (session) {
        this.session = session;
        this.section = this.session.sections[0];
        this.questions =  this.section.questions;

        this.feedback = new mr.Feedback();
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

            this.feedback.root.updatePoints();

            return this.feedback;
        },

        gradeReadingColorBands: function () {
            var question = this.questions[0];
            var unitCorrect = true;
            var fb = this.feedback.root.reading.rated_r_value;

            fb.correct = 0;
            fb.points = 0;

            if (!unit.ohmCompatible(question.unit)) {
                this.resistanceAnswer = null;
                unitCorrect = false;
                fb.addFeedback('unit', question.unit);
                return;
            }

            if (question.answer === null || isNaN(question.answer)) {
                this.resistanceAnswer = null;
                fb.addFeedback('incorrect');
                return;
            }

            var parsedValue = unit.normalizeToOhms(question.answer, question.unit);
            this.resistanceAnswer = parsedValue;


            if (question.correct_answer != parsedValue) {
                if (unitCorrect) {
                    if (math.equalExceptPowerOfTen(question.correct_answer, parsedValue)) {
                        fb.points = 10;
                        fb.correct = 2;
                        fb.addFeedback('power_ten',
                            this.section.resistor_num_bands - 1,
                            this.section.resistor_num_bands - 2);
                        return;
                    }
                    else if (this.oneOff(question.correct_answer, parsedValue)) {
                        fb.points = 2;
                        fb.correct = 1;
                        fb.addFeedback('difficulty');
                        return;
                    }
                }
                fb.addFeedback('incorrect');
                return;
            }
            fb.points = 20;
            fb.correct = 4;
            fb.addFeedback('correct');
        },

        gradeResistance: function () {
            var question = this.questions[2];
            var fb = this.feedback.root.measuring.measured_r_value;
            var unitCorrect = true;

            fb.points = 0;
            fb.correct = 0;

            if (!unit.ohmCompatible(question.unit)) {
                unitCorrect = false;
                fb.addFeedback('unit', question.unit);
                return;
            }

            if (question.answer === null || isNaN(question.answer)) {
                fb.addFeedback('incorrect');
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
                    fb.addFeedback('incomplete', unit.res_str(question.correct_answer),
                        unit.res_str(parsedValue));
                    return;
                }
                else if (math.equalExceptPowerOfTen(question.correct_answer, parsedValue)) {
                    fb.points = 3;
                    fb.correct = 2;
                    fb.addFeedback('power_ten', question.answer, question.unit,
                            unit.res_unit_str(question.correct_answer),
                            unit.res_unit_str(question.correct_answer, 'k'),
                            unit.res_unit_str(question.correct_answer, 'M'));
                    return;
                }
                fb.addFeedback('incorrect');
                return;
            }

            fb.points = 10;
            fb.correct = 4;
            fb.addFeedback('correct');
        },

        gradeTolerance: function () {
            var question = this.questions[1];
            var fb = this.feedback.root.reading.rated_t_value;

            var correctStr = (question.correct_answer * 100) + '%';
            var answerStr = question.answer + '%';

            fb.correct = 0;
            fb.points = 0;

            if (question.answer === null || isNaN(question.answer)) {
                fb.addFeedback('incorrect', correctStr, answerStr);
                return;
            }
            this.toleranceAnswer = question.answer / 100.0;
            if (question.correct_answer != question.answer / 100.0){
                fb.addFeedback('incorrect', correctStr, answerStr);
                return;
            }

            fb.correct = 4;
            fb.points = 5;
            fb.addFeedback('correct');
        },

        gradeToleranceRange: function () {
            var question = this.questions[3];
            var fb = this.feedback.root.t_range.t_range_value;
            var nominalResistance;

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
                fb.addFeedback('wrong', correctStr, answerStr);
                return;
            }


            if (!unit.ohmCompatible(question.unit[0]) ||
                !unit.ohmCompatible(question.unit[1]))
            {
                fb.addFeedback('wrong');
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
                fb.addFeedback('correct', unit.res_str(nominalResistance),
                    unit.pct_str(tolerance));
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
                fb.addFeedback('rounded', unit.res_str(nominalResistance),
                    unit.pct_str(tolerance));
                return;
            }

            if (Math.abs(math.getRoundedSigDigits(correctMin, n) -
                         math.getRoundedSigDigits(parsedMin, n)) <= 2 &&
                Math.abs(math.getRoundedSigDigits(correctMax, n) -
                         math.getRoundedSigDigits(parsedMax, n)) <= 2)
            {
                fb.points = 3;
                fb.correct = 2;
                fb.addFeedback('inaccurate', correctStr, answerStr);
                return;
            }
            fb.addFeedback('wrong', correctStr, answerStr);
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

            var fb = this.feedback.root.t_range.within_tolerance;

            if (this.feedback.root.measuring.measured_r_value.correct < 4 ||
                this.feedback.root.t_range.t_range_value < 4)
            {
                fb.points = 0;
                fb.correct = 0;
                fb.addFeedback('undef');
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
            var is = (correctAnswer == 'no') ? 'is not' : 'is';

            if (question.answer != correctAnswer) {
                fb.addFeedback('incorrect',
                        unit.res_str(this.measuredResistanceAnswer),
                        unit.res_str(this.rangeMinAnswer),
                        unit.res_str(this.rangeMaxAnswer),
                        did, is);
                return;
            }
            fb.points = 5;
            fb.correct = 4;

            fb.addFeedback('correct',
                    unit.res_str(this.measuredResistanceAnswer),
                    unit.res_str(this.rangeMinAnswer),
                    unit.res_str(this.rangeMaxAnswer),
                    did, is);
        },

        gradeTime: function () {
            var seconds;
            var fb;

            this.feedback.reading_time = this.questions[1].end_time - this.questions[0].start_time;
            seconds = this.feedback.reading_time / 1000;
            fb = this.feedback.root.time.reading_time;
            if (seconds <= 20) {
                fb.points = 5;
                fb.correct = 4;
                fb.addFeedback('efficient');
            }
            else if (seconds <= 40) {
                fb.points = 2;
                fb.correct = 2;
                fb.addFeedback('semi');
            }
            else {
                fb.points = 0;
                fb.correct = 0;
                fb.addFeedback('slow', Math.round(seconds));
            }

            this.feedback.measuring_time = this.questions[2].end_time - this.questions[2].start_time;
            seconds = this.feedback.measuring_time / 1000;
            fb = this.feedback.root.time.measuring_time;
            if (seconds <= 20) {
                fb.points = 5;
                fb.correct = 4;
                fb.addFeedback('efficient');
            }
            else if (seconds <= 40) {
                fb.points = 2;
                fb.correct = 2;
                fb.addFeedback('semi');
            }
            else {
                fb.points = 0;
                fb.correct = 0;
                fb.addFeedback('slow', Math.round(seconds));
            }
        },

        gradeSettings: function () {
            var fb = this.feedback.root.measuring;
            var redProbeConn = this.parser.submit_red_probe_conn;
            var blackProbeConn = this.parser.submit_black_probe_conn;
            var redPlugConn = this.parser.submit_red_plug_conn;
            var blackPlugConn = this.parser.submit_black_plug_conn;


            if ((redProbeConn == 'resistor_lead1' || redProbeConn == 'resistor_lead2') &&
                (blackProbeConn == 'resistor_lead1' || blackProbeConn == 'resistor_lead2') &&
                (redProbeConn != blackProbeConn))
            {
                fb.probe_connection.correct = 4;
                fb.probe_connection.points = 2;
                fb.probe_connection.desc = 'Correct';
                fb.probe_connection.addFeedback('correct');
            }
            else {
                fb.probe_connection.correct = 0;
                fb.probe_connection.points = 0;
                fb.probe_connection.desc = 'Incorrect';
                fb.probe_connection.addFeedback('incorrect');
            }
            debug('probe_connection.points=' + fb.probe_connection.points);

            if (redPlugConn == 'voma_port' && blackPlugConn == 'common_port') {
                fb.plug_connection.points = 5;
                fb.plug_connection.correct = 4;
                fb.plug_connection.desc = 'Correct';
                fb.plug_connection.addFeedback('correct');
            }
            else {
                fb.plug_connection.correct = 0;
                if (redPlugConn == 'common_port' && blackPlugConn == 'voma_port') {
                    fb.plug_connection.points = 3;
                    fb.plug_connection.correct = 3;
                    fb.plug_connection.desc = 'Reversed';
                    fb.plug_connection.addFeedback('reverse');
                }
                else {
                    fb.plug_connection.points = 0;
                    fb.plug_connection.correct = 0;
                    fb.plug_connection.desc = 'Incorrect';
                    fb.plug_connection.addFeedback('incorrect');
                }
            }
            debug('plug_connection.points=' + fb.plug_connection.points);

            var i_knob = this.parser.initial_dial_setting;
            var f_knob = this.parser.submit_dial_setting;
            var o_knob = this.optimalDial(this.section.displayed_resistance);

            this.feedback.initial_dial_setting = i_knob;
            this.feedback.submit_dial_setting = f_knob;
            this.feedback.optimal_dial_setting = o_knob;

            if (f_knob === o_knob) {
                fb.knob_setting.points = 20;
                fb.knob_setting.correct = 4;
                fb.knob_setting.addFeedback('correct');
            }
            else if (this.isResistanceKnob(f_knob)){
                fb.knob_setting.points = 10;
                fb.knob_setting.correct = 2;
                fb.knob_setting.addFeedback('suboptimal', o_knob, f_knob);
            }
            else {
                fb.knob_setting.points = 0;
                fb.knob_setting.correct = 0;
                fb.knob_setting.addFeedback('incorrect');
            }

            if (this.parser.power_on) {
                fb.power_switch.points = 2;
                fb.power_switch.correct = 4;
                fb.power_switch.addFeedback('correct');
            }
            else {
                fb.power_switch.points = 0;
                fb.power_switch.correct = 0;
                fb.power_switch.addFeedback('incorrect');
            }
            debug('power_switch.points=' + fb.power_switch.points);

            if (this.parser.correct_order) {
                fb.task_order.points = 6;
                fb.task_order.correct = 4;
                fb.task_order.addFeedback('correct');
            }
            else {
                fb.task_order.points = 0;
                fb.task_order.correct = 0;
                fb.task_order.addFeedback('incorrect');
            }
            debug('task_order.points=' + fb.task_order.points);
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
