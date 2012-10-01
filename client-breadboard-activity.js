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
/*! jQuery v@1.8.1 jquery.com | jquery.org/license */
(function(a,b){function G(a){var b=F[a]={};return p.each(a.split(s),function(a,c){b[c]=!0}),b}function J(a,c,d){if(d===b&&a.nodeType===1){var e="data-"+c.replace(I,"-$1").toLowerCase();d=a.getAttribute(e);if(typeof d=="string"){try{d=d==="true"?!0:d==="false"?!1:d==="null"?null:+d+""===d?+d:H.test(d)?p.parseJSON(d):d}catch(f){}p.data(a,c,d)}else d=b}return d}function K(a){var b;for(b in a){if(b==="data"&&p.isEmptyObject(a[b]))continue;if(b!=="toJSON")return!1}return!0}function ba(){return!1}function bb(){return!0}function bh(a){return!a||!a.parentNode||a.parentNode.nodeType===11}function bi(a,b){do a=a[b];while(a&&a.nodeType!==1);return a}function bj(a,b,c){b=b||0;if(p.isFunction(b))return p.grep(a,function(a,d){var e=!!b.call(a,d,a);return e===c});if(b.nodeType)return p.grep(a,function(a,d){return a===b===c});if(typeof b=="string"){var d=p.grep(a,function(a){return a.nodeType===1});if(be.test(b))return p.filter(b,d,!c);b=p.filter(b,d)}return p.grep(a,function(a,d){return p.inArray(a,b)>=0===c})}function bk(a){var b=bl.split("|"),c=a.createDocumentFragment();if(c.createElement)while(b.length)c.createElement(b.pop());return c}function bC(a,b){return a.getElementsByTagName(b)[0]||a.appendChild(a.ownerDocument.createElement(b))}function bD(a,b){if(b.nodeType!==1||!p.hasData(a))return;var c,d,e,f=p._data(a),g=p._data(b,f),h=f.events;if(h){delete g.handle,g.events={};for(c in h)for(d=0,e=h[c].length;d<e;d++)p.event.add(b,c,h[c][d])}g.data&&(g.data=p.extend({},g.data))}function bE(a,b){var c;if(b.nodeType!==1)return;b.clearAttributes&&b.clearAttributes(),b.mergeAttributes&&b.mergeAttributes(a),c=b.nodeName.toLowerCase(),c==="object"?(b.parentNode&&(b.outerHTML=a.outerHTML),p.support.html5Clone&&a.innerHTML&&!p.trim(b.innerHTML)&&(b.innerHTML=a.innerHTML)):c==="input"&&bv.test(a.type)?(b.defaultChecked=b.checked=a.checked,b.value!==a.value&&(b.value=a.value)):c==="option"?b.selected=a.defaultSelected:c==="input"||c==="textarea"?b.defaultValue=a.defaultValue:c==="script"&&b.text!==a.text&&(b.text=a.text),b.removeAttribute(p.expando)}function bF(a){return typeof a.getElementsByTagName!="undefined"?a.getElementsByTagName("*"):typeof a.querySelectorAll!="undefined"?a.querySelectorAll("*"):[]}function bG(a){bv.test(a.type)&&(a.defaultChecked=a.checked)}function bY(a,b){if(b in a)return b;var c=b.charAt(0).toUpperCase()+b.slice(1),d=b,e=bW.length;while(e--){b=bW[e]+c;if(b in a)return b}return d}function bZ(a,b){return a=b||a,p.css(a,"display")==="none"||!p.contains(a.ownerDocument,a)}function b$(a,b){var c,d,e=[],f=0,g=a.length;for(;f<g;f++){c=a[f];if(!c.style)continue;e[f]=p._data(c,"olddisplay"),b?(!e[f]&&c.style.display==="none"&&(c.style.display=""),c.style.display===""&&bZ(c)&&(e[f]=p._data(c,"olddisplay",cc(c.nodeName)))):(d=bH(c,"display"),!e[f]&&d!=="none"&&p._data(c,"olddisplay",d))}for(f=0;f<g;f++){c=a[f];if(!c.style)continue;if(!b||c.style.display==="none"||c.style.display==="")c.style.display=b?e[f]||"":"none"}return a}function b_(a,b,c){var d=bP.exec(b);return d?Math.max(0,d[1]-(c||0))+(d[2]||"px"):b}function ca(a,b,c,d){var e=c===(d?"border":"content")?4:b==="width"?1:0,f=0;for(;e<4;e+=2)c==="margin"&&(f+=p.css(a,c+bV[e],!0)),d?(c==="content"&&(f-=parseFloat(bH(a,"padding"+bV[e]))||0),c!=="margin"&&(f-=parseFloat(bH(a,"border"+bV[e]+"Width"))||0)):(f+=parseFloat(bH(a,"padding"+bV[e]))||0,c!=="padding"&&(f+=parseFloat(bH(a,"border"+bV[e]+"Width"))||0));return f}function cb(a,b,c){var d=b==="width"?a.offsetWidth:a.offsetHeight,e=!0,f=p.support.boxSizing&&p.css(a,"boxSizing")==="border-box";if(d<=0||d==null){d=bH(a,b);if(d<0||d==null)d=a.style[b];if(bQ.test(d))return d;e=f&&(p.support.boxSizingReliable||d===a.style[b]),d=parseFloat(d)||0}return d+ca(a,b,c||(f?"border":"content"),e)+"px"}function cc(a){if(bS[a])return bS[a];var b=p("<"+a+">").appendTo(e.body),c=b.css("display");b.remove();if(c==="none"||c===""){bI=e.body.appendChild(bI||p.extend(e.createElement("iframe"),{frameBorder:0,width:0,height:0}));if(!bJ||!bI.createElement)bJ=(bI.contentWindow||bI.contentDocument).document,bJ.write("<!doctype html><html><body>"),bJ.close();b=bJ.body.appendChild(bJ.createElement(a)),c=bH(b,"display"),e.body.removeChild(bI)}return bS[a]=c,c}function ci(a,b,c,d){var e;if(p.isArray(b))p.each(b,function(b,e){c||ce.test(a)?d(a,e):ci(a+"["+(typeof e=="object"?b:"")+"]",e,c,d)});else if(!c&&p.type(b)==="object")for(e in b)ci(a+"["+e+"]",b[e],c,d);else d(a,b)}function cz(a){return function(b,c){typeof b!="string"&&(c=b,b="*");var d,e,f,g=b.toLowerCase().split(s),h=0,i=g.length;if(p.isFunction(c))for(;h<i;h++)d=g[h],f=/^\+/.test(d),f&&(d=d.substr(1)||"*"),e=a[d]=a[d]||[],e[f?"unshift":"push"](c)}}function cA(a,c,d,e,f,g){f=f||c.dataTypes[0],g=g||{},g[f]=!0;var h,i=a[f],j=0,k=i?i.length:0,l=a===cv;for(;j<k&&(l||!h);j++)h=i[j](c,d,e),typeof h=="string"&&(!l||g[h]?h=b:(c.dataTypes.unshift(h),h=cA(a,c,d,e,h,g)));return(l||!h)&&!g["*"]&&(h=cA(a,c,d,e,"*",g)),h}function cB(a,c){var d,e,f=p.ajaxSettings.flatOptions||{};for(d in c)c[d]!==b&&((f[d]?a:e||(e={}))[d]=c[d]);e&&p.extend(!0,a,e)}function cC(a,c,d){var e,f,g,h,i=a.contents,j=a.dataTypes,k=a.responseFields;for(f in k)f in d&&(c[k[f]]=d[f]);while(j[0]==="*")j.shift(),e===b&&(e=a.mimeType||c.getResponseHeader("content-type"));if(e)for(f in i)if(i[f]&&i[f].test(e)){j.unshift(f);break}if(j[0]in d)g=j[0];else{for(f in d){if(!j[0]||a.converters[f+" "+j[0]]){g=f;break}h||(h=f)}g=g||h}if(g)return g!==j[0]&&j.unshift(g),d[g]}function cD(a,b){var c,d,e,f,g=a.dataTypes.slice(),h=g[0],i={},j=0;a.dataFilter&&(b=a.dataFilter(b,a.dataType));if(g[1])for(c in a.converters)i[c.toLowerCase()]=a.converters[c];for(;e=g[++j];)if(e!=="*"){if(h!=="*"&&h!==e){c=i[h+" "+e]||i["* "+e];if(!c)for(d in i){f=d.split(" ");if(f[1]===e){c=i[h+" "+f[0]]||i["* "+f[0]];if(c){c===!0?c=i[d]:i[d]!==!0&&(e=f[0],g.splice(j--,0,e));break}}}if(c!==!0)if(c&&a["throws"])b=c(b);else try{b=c(b)}catch(k){return{state:"parsererror",error:c?k:"No conversion from "+h+" to "+e}}}h=e}return{state:"success",data:b}}function cL(){try{return new a.XMLHttpRequest}catch(b){}}function cM(){try{return new a.ActiveXObject("Microsoft.XMLHTTP")}catch(b){}}function cU(){return setTimeout(function(){cN=b},0),cN=p.now()}function cV(a,b){p.each(b,function(b,c){var d=(cT[b]||[]).concat(cT["*"]),e=0,f=d.length;for(;e<f;e++)if(d[e].call(a,b,c))return})}function cW(a,b,c){var d,e=0,f=0,g=cS.length,h=p.Deferred().always(function(){delete i.elem}),i=function(){var b=cN||cU(),c=Math.max(0,j.startTime+j.duration-b),d=1-(c/j.duration||0),e=0,f=j.tweens.length;for(;e<f;e++)j.tweens[e].run(d);return h.notifyWith(a,[j,d,c]),d<1&&f?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:p.extend({},b),opts:p.extend(!0,{specialEasing:{}},c),originalProperties:b,originalOptions:c,startTime:cN||cU(),duration:c.duration,tweens:[],createTween:function(b,c,d){var e=p.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(e),e},stop:function(b){var c=0,d=b?j.tweens.length:0;for(;c<d;c++)j.tweens[c].run(1);return b?h.resolveWith(a,[j,b]):h.rejectWith(a,[j,b]),this}}),k=j.props;cX(k,j.opts.specialEasing);for(;e<g;e++){d=cS[e].call(j,a,k,j.opts);if(d)return d}return cV(j,k),p.isFunction(j.opts.start)&&j.opts.start.call(a,j),p.fx.timer(p.extend(i,{anim:j,queue:j.opts.queue,elem:a})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}function cX(a,b){var c,d,e,f,g;for(c in a){d=p.camelCase(c),e=b[d],f=a[c],p.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=p.cssHooks[d];if(g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}}function cY(a,b,c){var d,e,f,g,h,i,j,k,l=this,m=a.style,n={},o=[],q=a.nodeType&&bZ(a);c.queue||(j=p._queueHooks(a,"fx"),j.unqueued==null&&(j.unqueued=0,k=j.empty.fire,j.empty.fire=function(){j.unqueued||k()}),j.unqueued++,l.always(function(){l.always(function(){j.unqueued--,p.queue(a,"fx").length||j.empty.fire()})})),a.nodeType===1&&("height"in b||"width"in b)&&(c.overflow=[m.overflow,m.overflowX,m.overflowY],p.css(a,"display")==="inline"&&p.css(a,"float")==="none"&&(!p.support.inlineBlockNeedsLayout||cc(a.nodeName)==="inline"?m.display="inline-block":m.zoom=1)),c.overflow&&(m.overflow="hidden",p.support.shrinkWrapBlocks||l.done(function(){m.overflow=c.overflow[0],m.overflowX=c.overflow[1],m.overflowY=c.overflow[2]}));for(d in b){f=b[d];if(cP.exec(f)){delete b[d];if(f===(q?"hide":"show"))continue;o.push(d)}}g=o.length;if(g){h=p._data(a,"fxshow")||p._data(a,"fxshow",{}),q?p(a).show():l.done(function(){p(a).hide()}),l.done(function(){var b;p.removeData(a,"fxshow",!0);for(b in n)p.style(a,b,n[b])});for(d=0;d<g;d++)e=o[d],i=l.createTween(e,q?h[e]:0),n[e]=h[e]||p.style(a,e),e in h||(h[e]=i.start,q&&(i.end=i.start,i.start=e==="width"||e==="height"?1:0))}}function cZ(a,b,c,d,e){return new cZ.prototype.init(a,b,c,d,e)}function c$(a,b){var c,d={height:a},e=0;b=b?1:0;for(;e<4;e+=2-b)c=bV[e],d["margin"+c]=d["padding"+c]=a;return b&&(d.opacity=d.width=a),d}function da(a){return p.isWindow(a)?a:a.nodeType===9?a.defaultView||a.parentWindow:!1}var c,d,e=a.document,f=a.location,g=a.navigator,h=a.jQuery,i=a.$,j=Array.prototype.push,k=Array.prototype.slice,l=Array.prototype.indexOf,m=Object.prototype.toString,n=Object.prototype.hasOwnProperty,o=String.prototype.trim,p=function(a,b){return new p.fn.init(a,b,c)},q=/[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source,r=/\S/,s=/\s+/,t=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,u=/^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,v=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,w=/^[\],:{}\s]*$/,x=/(?:^|:|,)(?:\s*\[)+/g,y=/\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,z=/"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g,A=/^-ms-/,B=/-([\da-z])/gi,C=function(a,b){return(b+"").toUpperCase()},D=function(){e.addEventListener?(e.removeEventListener("DOMContentLoaded",D,!1),p.ready()):e.readyState==="complete"&&(e.detachEvent("onreadystatechange",D),p.ready())},E={};p.fn=p.prototype={constructor:p,init:function(a,c,d){var f,g,h,i;if(!a)return this;if(a.nodeType)return this.context=this[0]=a,this.length=1,this;if(typeof a=="string"){a.charAt(0)==="<"&&a.charAt(a.length-1)===">"&&a.length>=3?f=[null,a,null]:f=u.exec(a);if(f&&(f[1]||!c)){if(f[1])return c=c instanceof p?c[0]:c,i=c&&c.nodeType?c.ownerDocument||c:e,a=p.parseHTML(f[1],i,!0),v.test(f[1])&&p.isPlainObject(c)&&this.attr.call(a,c,!0),p.merge(this,a);g=e.getElementById(f[2]);if(g&&g.parentNode){if(g.id!==f[2])return d.find(a);this.length=1,this[0]=g}return this.context=e,this.selector=a,this}return!c||c.jquery?(c||d).find(a):this.constructor(c).find(a)}return p.isFunction(a)?d.ready(a):(a.selector!==b&&(this.selector=a.selector,this.context=a.context),p.makeArray(a,this))},selector:"",jquery:"1.8.1",length:0,size:function(){return this.length},toArray:function(){return k.call(this)},get:function(a){return a==null?this.toArray():a<0?this[this.length+a]:this[a]},pushStack:function(a,b,c){var d=p.merge(this.constructor(),a);return d.prevObject=this,d.context=this.context,b==="find"?d.selector=this.selector+(this.selector?" ":"")+c:b&&(d.selector=this.selector+"."+b+"("+c+")"),d},each:function(a,b){return p.each(this,a,b)},ready:function(a){return p.ready.promise().done(a),this},eq:function(a){return a=+a,a===-1?this.slice(a):this.slice(a,a+1)},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},slice:function(){return this.pushStack(k.apply(this,arguments),"slice",k.call(arguments).join(","))},map:function(a){return this.pushStack(p.map(this,function(b,c){return a.call(b,c,b)}))},end:function(){return this.prevObject||this.constructor(null)},push:j,sort:[].sort,splice:[].splice},p.fn.init.prototype=p.fn,p.extend=p.fn.extend=function(){var a,c,d,e,f,g,h=arguments[0]||{},i=1,j=arguments.length,k=!1;typeof h=="boolean"&&(k=h,h=arguments[1]||{},i=2),typeof h!="object"&&!p.isFunction(h)&&(h={}),j===i&&(h=this,--i);for(;i<j;i++)if((a=arguments[i])!=null)for(c in a){d=h[c],e=a[c];if(h===e)continue;k&&e&&(p.isPlainObject(e)||(f=p.isArray(e)))?(f?(f=!1,g=d&&p.isArray(d)?d:[]):g=d&&p.isPlainObject(d)?d:{},h[c]=p.extend(k,g,e)):e!==b&&(h[c]=e)}return h},p.extend({noConflict:function(b){return a.$===p&&(a.$=i),b&&a.jQuery===p&&(a.jQuery=h),p},isReady:!1,readyWait:1,holdReady:function(a){a?p.readyWait++:p.ready(!0)},ready:function(a){if(a===!0?--p.readyWait:p.isReady)return;if(!e.body)return setTimeout(p.ready,1);p.isReady=!0;if(a!==!0&&--p.readyWait>0)return;d.resolveWith(e,[p]),p.fn.trigger&&p(e).trigger("ready").off("ready")},isFunction:function(a){return p.type(a)==="function"},isArray:Array.isArray||function(a){return p.type(a)==="array"},isWindow:function(a){return a!=null&&a==a.window},isNumeric:function(a){return!isNaN(parseFloat(a))&&isFinite(a)},type:function(a){return a==null?String(a):E[m.call(a)]||"object"},isPlainObject:function(a){if(!a||p.type(a)!=="object"||a.nodeType||p.isWindow(a))return!1;try{if(a.constructor&&!n.call(a,"constructor")&&!n.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}var d;for(d in a);return d===b||n.call(a,d)},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},error:function(a){throw new Error(a)},parseHTML:function(a,b,c){var d;return!a||typeof a!="string"?null:(typeof b=="boolean"&&(c=b,b=0),b=b||e,(d=v.exec(a))?[b.createElement(d[1])]:(d=p.buildFragment([a],b,c?null:[]),p.merge([],(d.cacheable?p.clone(d.fragment):d.fragment).childNodes)))},parseJSON:function(b){if(!b||typeof b!="string")return null;b=p.trim(b);if(a.JSON&&a.JSON.parse)return a.JSON.parse(b);if(w.test(b.replace(y,"@").replace(z,"]").replace(x,"")))return(new Function("return "+b))();p.error("Invalid JSON: "+b)},parseXML:function(c){var d,e;if(!c||typeof c!="string")return null;try{a.DOMParser?(e=new DOMParser,d=e.parseFromString(c,"text/xml")):(d=new ActiveXObject("Microsoft.XMLDOM"),d.async="false",d.loadXML(c))}catch(f){d=b}return(!d||!d.documentElement||d.getElementsByTagName("parsererror").length)&&p.error("Invalid XML: "+c),d},noop:function(){},globalEval:function(b){b&&r.test(b)&&(a.execScript||function(b){a.eval.call(a,b)})(b)},camelCase:function(a){return a.replace(A,"ms-").replace(B,C)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toUpperCase()===b.toUpperCase()},each:function(a,c,d){var e,f=0,g=a.length,h=g===b||p.isFunction(a);if(d){if(h){for(e in a)if(c.apply(a[e],d)===!1)break}else for(;f<g;)if(c.apply(a[f++],d)===!1)break}else if(h){for(e in a)if(c.call(a[e],e,a[e])===!1)break}else for(;f<g;)if(c.call(a[f],f,a[f++])===!1)break;return a},trim:o&&!o.call("﻿ ")?function(a){return a==null?"":o.call(a)}:function(a){return a==null?"":a.toString().replace(t,"")},makeArray:function(a,b){var c,d=b||[];return a!=null&&(c=p.type(a),a.length==null||c==="string"||c==="function"||c==="regexp"||p.isWindow(a)?j.call(d,a):p.merge(d,a)),d},inArray:function(a,b,c){var d;if(b){if(l)return l.call(b,a,c);d=b.length,c=c?c<0?Math.max(0,d+c):c:0;for(;c<d;c++)if(c in b&&b[c]===a)return c}return-1},merge:function(a,c){var d=c.length,e=a.length,f=0;if(typeof d=="number")for(;f<d;f++)a[e++]=c[f];else while(c[f]!==b)a[e++]=c[f++];return a.length=e,a},grep:function(a,b,c){var d,e=[],f=0,g=a.length;c=!!c;for(;f<g;f++)d=!!b(a[f],f),c!==d&&e.push(a[f]);return e},map:function(a,c,d){var e,f,g=[],h=0,i=a.length,j=a instanceof p||i!==b&&typeof i=="number"&&(i>0&&a[0]&&a[i-1]||i===0||p.isArray(a));if(j)for(;h<i;h++)e=c(a[h],h,d),e!=null&&(g[g.length]=e);else for(f in a)e=c(a[f],f,d),e!=null&&(g[g.length]=e);return g.concat.apply([],g)},guid:1,proxy:function(a,c){var d,e,f;return typeof c=="string"&&(d=a[c],c=a,a=d),p.isFunction(a)?(e=k.call(arguments,2),f=function(){return a.apply(c,e.concat(k.call(arguments)))},f.guid=a.guid=a.guid||f.guid||p.guid++,f):b},access:function(a,c,d,e,f,g,h){var i,j=d==null,k=0,l=a.length;if(d&&typeof d=="object"){for(k in d)p.access(a,c,k,d[k],1,g,e);f=1}else if(e!==b){i=h===b&&p.isFunction(e),j&&(i?(i=c,c=function(a,b,c){return i.call(p(a),c)}):(c.call(a,e),c=null));if(c)for(;k<l;k++)c(a[k],d,i?e.call(a[k],k,c(a[k],d)):e,h);f=1}return f?a:j?c.call(a):l?c(a[0],d):g},now:function(){return(new Date).getTime()}}),p.ready.promise=function(b){if(!d){d=p.Deferred();if(e.readyState==="complete")setTimeout(p.ready,1);else if(e.addEventListener)e.addEventListener("DOMContentLoaded",D,!1),a.addEventListener("load",p.ready,!1);else{e.attachEvent("onreadystatechange",D),a.attachEvent("onload",p.ready);var c=!1;try{c=a.frameElement==null&&e.documentElement}catch(f){}c&&c.doScroll&&function g(){if(!p.isReady){try{c.doScroll("left")}catch(a){return setTimeout(g,50)}p.ready()}}()}}return d.promise(b)},p.each("Boolean Number String Function Array Date RegExp Object".split(" "),function(a,b){E["[object "+b+"]"]=b.toLowerCase()}),c=p(e);var F={};p.Callbacks=function(a){a=typeof a=="string"?F[a]||G(a):p.extend({},a);var c,d,e,f,g,h,i=[],j=!a.once&&[],k=function(b){c=a.memory&&b,d=!0,h=f||0,f=0,g=i.length,e=!0;for(;i&&h<g;h++)if(i[h].apply(b[0],b[1])===!1&&a.stopOnFalse){c=!1;break}e=!1,i&&(j?j.length&&k(j.shift()):c?i=[]:l.disable())},l={add:function(){if(i){var b=i.length;(function d(b){p.each(b,function(b,c){var e=p.type(c);e==="function"&&(!a.unique||!l.has(c))?i.push(c):c&&c.length&&e!=="string"&&d(c)})})(arguments),e?g=i.length:c&&(f=b,k(c))}return this},remove:function(){return i&&p.each(arguments,function(a,b){var c;while((c=p.inArray(b,i,c))>-1)i.splice(c,1),e&&(c<=g&&g--,c<=h&&h--)}),this},has:function(a){return p.inArray(a,i)>-1},empty:function(){return i=[],this},disable:function(){return i=j=c=b,this},disabled:function(){return!i},lock:function(){return j=b,c||l.disable(),this},locked:function(){return!j},fireWith:function(a,b){return b=b||[],b=[a,b.slice?b.slice():b],i&&(!d||j)&&(e?j.push(b):k(b)),this},fire:function(){return l.fireWith(this,arguments),this},fired:function(){return!!d}};return l},p.extend({Deferred:function(a){var b=[["resolve","done",p.Callbacks("once memory"),"resolved"],["reject","fail",p.Callbacks("once memory"),"rejected"],["notify","progress",p.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return p.Deferred(function(c){p.each(b,function(b,d){var f=d[0],g=a[b];e[d[1]](p.isFunction(g)?function(){var a=g.apply(this,arguments);a&&p.isFunction(a.promise)?a.promise().done(c.resolve).fail(c.reject).progress(c.notify):c[f+"With"](this===e?c:this,[a])}:c[f])}),a=null}).promise()},promise:function(a){return typeof a=="object"?p.extend(a,d):d}},e={};return d.pipe=d.then,p.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[a^1][2].disable,b[2][2].lock),e[f[0]]=g.fire,e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=k.call(arguments),d=c.length,e=d!==1||a&&p.isFunction(a.promise)?d:0,f=e===1?a:p.Deferred(),g=function(a,b,c){return function(d){b[a]=this,c[a]=arguments.length>1?k.call(arguments):d,c===h?f.notifyWith(b,c):--e||f.resolveWith(b,c)}},h,i,j;if(d>1){h=new Array(d),i=new Array(d),j=new Array(d);for(;b<d;b++)c[b]&&p.isFunction(c[b].promise)?c[b].promise().done(g(b,j,c)).fail(f.reject).progress(g(b,i,h)):--e}return e||f.resolveWith(j,c),f.promise()}}),p.support=function(){var b,c,d,f,g,h,i,j,k,l,m,n=e.createElement("div");n.setAttribute("className","t"),n.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",c=n.getElementsByTagName("*"),d=n.getElementsByTagName("a")[0],d.style.cssText="top:1px;float:left;opacity:.5";if(!c||!c.length||!d)return{};f=e.createElement("select"),g=f.appendChild(e.createElement("option")),h=n.getElementsByTagName("input")[0],b={leadingWhitespace:n.firstChild.nodeType===3,tbody:!n.getElementsByTagName("tbody").length,htmlSerialize:!!n.getElementsByTagName("link").length,style:/top/.test(d.getAttribute("style")),hrefNormalized:d.getAttribute("href")==="/a",opacity:/^0.5/.test(d.style.opacity),cssFloat:!!d.style.cssFloat,checkOn:h.value==="on",optSelected:g.selected,getSetAttribute:n.className!=="t",enctype:!!e.createElement("form").enctype,html5Clone:e.createElement("nav").cloneNode(!0).outerHTML!=="<:nav></:nav>",boxModel:e.compatMode==="CSS1Compat",submitBubbles:!0,changeBubbles:!0,focusinBubbles:!1,deleteExpando:!0,noCloneEvent:!0,inlineBlockNeedsLayout:!1,shrinkWrapBlocks:!1,reliableMarginRight:!0,boxSizingReliable:!0,pixelPosition:!1},h.checked=!0,b.noCloneChecked=h.cloneNode(!0).checked,f.disabled=!0,b.optDisabled=!g.disabled;try{delete n.test}catch(o){b.deleteExpando=!1}!n.addEventListener&&n.attachEvent&&n.fireEvent&&(n.attachEvent("onclick",m=function(){b.noCloneEvent=!1}),n.cloneNode(!0).fireEvent("onclick"),n.detachEvent("onclick",m)),h=e.createElement("input"),h.value="t",h.setAttribute("type","radio"),b.radioValue=h.value==="t",h.setAttribute("checked","checked"),h.setAttribute("name","t"),n.appendChild(h),i=e.createDocumentFragment(),i.appendChild(n.lastChild),b.checkClone=i.cloneNode(!0).cloneNode(!0).lastChild.checked,b.appendChecked=h.checked,i.removeChild(h),i.appendChild(n);if(n.attachEvent)for(k in{submit:!0,change:!0,focusin:!0})j="on"+k,l=j in n,l||(n.setAttribute(j,"return;"),l=typeof n[j]=="function"),b[k+"Bubbles"]=l;return p(function(){var c,d,f,g,h="padding:0;margin:0;border:0;display:block;overflow:hidden;",i=e.getElementsByTagName("body")[0];if(!i)return;c=e.createElement("div"),c.style.cssText="visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px",i.insertBefore(c,i.firstChild),d=e.createElement("div"),c.appendChild(d),d.innerHTML="<table><tr><td></td><td>t</td></tr></table>",f=d.getElementsByTagName("td"),f[0].style.cssText="padding:0;margin:0;border:0;display:none",l=f[0].offsetHeight===0,f[0].style.display="",f[1].style.display="none",b.reliableHiddenOffsets=l&&f[0].offsetHeight===0,d.innerHTML="",d.style.cssText="box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;",b.boxSizing=d.offsetWidth===4,b.doesNotIncludeMarginInBodyOffset=i.offsetTop!==1,a.getComputedStyle&&(b.pixelPosition=(a.getComputedStyle(d,null)||{}).top!=="1%",b.boxSizingReliable=(a.getComputedStyle(d,null)||{width:"4px"}).width==="4px",g=e.createElement("div"),g.style.cssText=d.style.cssText=h,g.style.marginRight=g.style.width="0",d.style.width="1px",d.appendChild(g),b.reliableMarginRight=!parseFloat((a.getComputedStyle(g,null)||{}).marginRight)),typeof d.style.zoom!="undefined"&&(d.innerHTML="",d.style.cssText=h+"width:1px;padding:1px;display:inline;zoom:1",b.inlineBlockNeedsLayout=d.offsetWidth===3,d.style.display="block",d.style.overflow="visible",d.innerHTML="<div></div>",d.firstChild.style.width="5px",b.shrinkWrapBlocks=d.offsetWidth!==3,c.style.zoom=1),i.removeChild(c),c=d=f=g=null}),i.removeChild(n),c=d=f=g=h=i=n=null,b}();var H=/(?:\{[\s\S]*\}|\[[\s\S]*\])$/,I=/([A-Z])/g;p.extend({cache:{},deletedIds:[],uuid:0,expando:"jQuery"+(p.fn.jquery+Math.random()).replace(/\D/g,""),noData:{embed:!0,object:"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",applet:!0},hasData:function(a){return a=a.nodeType?p.cache[a[p.expando]]:a[p.expando],!!a&&!K(a)},data:function(a,c,d,e){if(!p.acceptData(a))return;var f,g,h=p.expando,i=typeof c=="string",j=a.nodeType,k=j?p.cache:a,l=j?a[h]:a[h]&&h;if((!l||!k[l]||!e&&!k[l].data)&&i&&d===b)return;l||(j?a[h]=l=p.deletedIds.pop()||++p.uuid:l=h),k[l]||(k[l]={},j||(k[l].toJSON=p.noop));if(typeof c=="object"||typeof c=="function")e?k[l]=p.extend(k[l],c):k[l].data=p.extend(k[l].data,c);return f=k[l],e||(f.data||(f.data={}),f=f.data),d!==b&&(f[p.camelCase(c)]=d),i?(g=f[c],g==null&&(g=f[p.camelCase(c)])):g=f,g},removeData:function(a,b,c){if(!p.acceptData(a))return;var d,e,f,g=a.nodeType,h=g?p.cache:a,i=g?a[p.expando]:p.expando;if(!h[i])return;if(b){d=c?h[i]:h[i].data;if(d){p.isArray(b)||(b in d?b=[b]:(b=p.camelCase(b),b in d?b=[b]:b=b.split(" ")));for(e=0,f=b.length;e<f;e++)delete d[b[e]];if(!(c?K:p.isEmptyObject)(d))return}}if(!c){delete h[i].data;if(!K(h[i]))return}g?p.cleanData([a],!0):p.support.deleteExpando||h!=h.window?delete h[i]:h[i]=null},_data:function(a,b,c){return p.data(a,b,c,!0)},acceptData:function(a){var b=a.nodeName&&p.noData[a.nodeName.toLowerCase()];return!b||b!==!0&&a.getAttribute("classid")===b}}),p.fn.extend({data:function(a,c){var d,e,f,g,h,i=this[0],j=0,k=null;if(a===b){if(this.length){k=p.data(i);if(i.nodeType===1&&!p._data(i,"parsedAttrs")){f=i.attributes;for(h=f.length;j<h;j++)g=f[j].name,g.indexOf("data-")===0&&(g=p.camelCase(g.substring(5)),J(i,g,k[g]));p._data(i,"parsedAttrs",!0)}}return k}return typeof a=="object"?this.each(function(){p.data(this,a)}):(d=a.split(".",2),d[1]=d[1]?"."+d[1]:"",e=d[1]+"!",p.access(this,function(c){if(c===b)return k=this.triggerHandler("getData"+e,[d[0]]),k===b&&i&&(k=p.data(i,a),k=J(i,a,k)),k===b&&d[1]?this.data(d[0]):k;d[1]=c,this.each(function(){var b=p(this);b.triggerHandler("setData"+e,d),p.data(this,a,c),b.triggerHandler("changeData"+e,d)})},null,c,arguments.length>1,null,!1))},removeData:function(a){return this.each(function(){p.removeData(this,a)})}}),p.extend({queue:function(a,b,c){var d;if(a)return b=(b||"fx")+"queue",d=p._data(a,b),c&&(!d||p.isArray(c)?d=p._data(a,b,p.makeArray(c)):d.push(c)),d||[]},dequeue:function(a,b){b=b||"fx";var c=p.queue(a,b),d=c.length,e=c.shift(),f=p._queueHooks(a,b),g=function(){p.dequeue(a,b)};e==="inprogress"&&(e=c.shift(),d--),e&&(b==="fx"&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return p._data(a,c)||p._data(a,c,{empty:p.Callbacks("once memory").add(function(){p.removeData(a,b+"queue",!0),p.removeData(a,c,!0)})})}}),p.fn.extend({queue:function(a,c){var d=2;return typeof a!="string"&&(c=a,a="fx",d--),arguments.length<d?p.queue(this[0],a):c===b?this:this.each(function(){var b=p.queue(this,a,c);p._queueHooks(this,a),a==="fx"&&b[0]!=="inprogress"&&p.dequeue(this,a)})},dequeue:function(a){return this.each(function(){p.dequeue(this,a)})},delay:function(a,b){return a=p.fx?p.fx.speeds[a]||a:a,b=b||"fx",this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,c){var d,e=1,f=p.Deferred(),g=this,h=this.length,i=function(){--e||f.resolveWith(g,[g])};typeof a!="string"&&(c=a,a=b),a=a||"fx";while(h--)d=p._data(g[h],a+"queueHooks"),d&&d.empty&&(e++,d.empty.add(i));return i(),f.promise(c)}});var L,M,N,O=/[\t\r\n]/g,P=/\r/g,Q=/^(?:button|input)$/i,R=/^(?:button|input|object|select|textarea)$/i,S=/^a(?:rea|)$/i,T=/^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,U=p.support.getSetAttribute;p.fn.extend({attr:function(a,b){return p.access(this,p.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){p.removeAttr(this,a)})},prop:function(a,b){return p.access(this,p.prop,a,b,arguments.length>1)},removeProp:function(a){return a=p.propFix[a]||a,this.each(function(){try{this[a]=b,delete this[a]}catch(c){}})},addClass:function(a){var b,c,d,e,f,g,h;if(p.isFunction(a))return this.each(function(b){p(this).addClass(a.call(this,b,this.className))});if(a&&typeof a=="string"){b=a.split(s);for(c=0,d=this.length;c<d;c++){e=this[c];if(e.nodeType===1)if(!e.className&&b.length===1)e.className=a;else{f=" "+e.className+" ";for(g=0,h=b.length;g<h;g++)~f.indexOf(" "+b[g]+" ")||(f+=b[g]+" ");e.className=p.trim(f)}}}return this},removeClass:function(a){var c,d,e,f,g,h,i;if(p.isFunction(a))return this.each(function(b){p(this).removeClass(a.call(this,b,this.className))});if(a&&typeof a=="string"||a===b){c=(a||"").split(s);for(h=0,i=this.length;h<i;h++){e=this[h];if(e.nodeType===1&&e.className){d=(" "+e.className+" ").replace(O," ");for(f=0,g=c.length;f<g;f++)while(d.indexOf(" "+c[f]+" ")>-1)d=d.replace(" "+c[f]+" "," ");e.className=a?p.trim(d):""}}}return this},toggleClass:function(a,b){var c=typeof a,d=typeof b=="boolean";return p.isFunction(a)?this.each(function(c){p(this).toggleClass(a.call(this,c,this.className,b),b)}):this.each(function(){if(c==="string"){var e,f=0,g=p(this),h=b,i=a.split(s);while(e=i[f++])h=d?h:!g.hasClass(e),g[h?"addClass":"removeClass"](e)}else if(c==="undefined"||c==="boolean")this.className&&p._data(this,"__className__",this.className),this.className=this.className||a===!1?"":p._data(this,"__className__")||""})},hasClass:function(a){var b=" "+a+" ",c=0,d=this.length;for(;c<d;c++)if(this[c].nodeType===1&&(" "+this[c].className+" ").replace(O," ").indexOf(b)>-1)return!0;return!1},val:function(a){var c,d,e,f=this[0];if(!arguments.length){if(f)return c=p.valHooks[f.type]||p.valHooks[f.nodeName.toLowerCase()],c&&"get"in c&&(d=c.get(f,"value"))!==b?d:(d=f.value,typeof d=="string"?d.replace(P,""):d==null?"":d);return}return e=p.isFunction(a),this.each(function(d){var f,g=p(this);if(this.nodeType!==1)return;e?f=a.call(this,d,g.val()):f=a,f==null?f="":typeof f=="number"?f+="":p.isArray(f)&&(f=p.map(f,function(a){return a==null?"":a+""})),c=p.valHooks[this.type]||p.valHooks[this.nodeName.toLowerCase()];if(!c||!("set"in c)||c.set(this,f,"value")===b)this.value=f})}}),p.extend({valHooks:{option:{get:function(a){var b=a.attributes.value;return!b||b.specified?a.value:a.text}},select:{get:function(a){var b,c,d,e,f=a.selectedIndex,g=[],h=a.options,i=a.type==="select-one";if(f<0)return null;c=i?f:0,d=i?f+1:h.length;for(;c<d;c++){e=h[c];if(e.selected&&(p.support.optDisabled?!e.disabled:e.getAttribute("disabled")===null)&&(!e.parentNode.disabled||!p.nodeName(e.parentNode,"optgroup"))){b=p(e).val();if(i)return b;g.push(b)}}return i&&!g.length&&h.length?p(h[f]).val():g},set:function(a,b){var c=p.makeArray(b);return p(a).find("option").each(function(){this.selected=p.inArray(p(this).val(),c)>=0}),c.length||(a.selectedIndex=-1),c}}},attrFn:{},attr:function(a,c,d,e){var f,g,h,i=a.nodeType;if(!a||i===3||i===8||i===2)return;if(e&&p.isFunction(p.fn[c]))return p(a)[c](d);if(typeof a.getAttribute=="undefined")return p.prop(a,c,d);h=i!==1||!p.isXMLDoc(a),h&&(c=c.toLowerCase(),g=p.attrHooks[c]||(T.test(c)?M:L));if(d!==b){if(d===null){p.removeAttr(a,c);return}return g&&"set"in g&&h&&(f=g.set(a,d,c))!==b?f:(a.setAttribute(c,""+d),d)}return g&&"get"in g&&h&&(f=g.get(a,c))!==null?f:(f=a.getAttribute(c),f===null?b:f)},removeAttr:function(a,b){var c,d,e,f,g=0;if(b&&a.nodeType===1){d=b.split(s);for(;g<d.length;g++)e=d[g],e&&(c=p.propFix[e]||e,f=T.test(e),f||p.attr(a,e,""),a.removeAttribute(U?e:c),f&&c in a&&(a[c]=!1))}},attrHooks:{type:{set:function(a,b){if(Q.test(a.nodeName)&&a.parentNode)p.error("type property can't be changed");else if(!p.support.radioValue&&b==="radio"&&p.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}},value:{get:function(a,b){return L&&p.nodeName(a,"button")?L.get(a,b):b in a?a.value:null},set:function(a,b,c){if(L&&p.nodeName(a,"button"))return L.set(a,b,c);a.value=b}}},propFix:{tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder",contenteditable:"contentEditable"},prop:function(a,c,d){var e,f,g,h=a.nodeType;if(!a||h===3||h===8||h===2)return;return g=h!==1||!p.isXMLDoc(a),g&&(c=p.propFix[c]||c,f=p.propHooks[c]),d!==b?f&&"set"in f&&(e=f.set(a,d,c))!==b?e:a[c]=d:f&&"get"in f&&(e=f.get(a,c))!==null?e:a[c]},propHooks:{tabIndex:{get:function(a){var c=a.getAttributeNode("tabindex");return c&&c.specified?parseInt(c.value,10):R.test(a.nodeName)||S.test(a.nodeName)&&a.href?0:b}}}}),M={get:function(a,c){var d,e=p.prop(a,c);return e===!0||typeof e!="boolean"&&(d=a.getAttributeNode(c))&&d.nodeValue!==!1?c.toLowerCase():b},set:function(a,b,c){var d;return b===!1?p.removeAttr(a,c):(d=p.propFix[c]||c,d in a&&(a[d]=!0),a.setAttribute(c,c.toLowerCase())),c}},U||(N={name:!0,id:!0,coords:!0},L=p.valHooks.button={get:function(a,c){var d;return d=a.getAttributeNode(c),d&&(N[c]?d.value!=="":d.specified)?d.value:b},set:function(a,b,c){var d=a.getAttributeNode(c);return d||(d=e.createAttribute(c),a.setAttributeNode(d)),d.value=b+""}},p.each(["width","height"],function(a,b){p.attrHooks[b]=p.extend(p.attrHooks[b],{set:function(a,c){if(c==="")return a.setAttribute(b,"auto"),c}})}),p.attrHooks.contenteditable={get:L.get,set:function(a,b,c){b===""&&(b="false"),L.set(a,b,c)}}),p.support.hrefNormalized||p.each(["href","src","width","height"],function(a,c){p.attrHooks[c]=p.extend(p.attrHooks[c],{get:function(a){var d=a.getAttribute(c,2);return d===null?b:d}})}),p.support.style||(p.attrHooks.style={get:function(a){return a.style.cssText.toLowerCase()||b},set:function(a,b){return a.style.cssText=""+b}}),p.support.optSelected||(p.propHooks.selected=p.extend(p.propHooks.selected,{get:function(a){var b=a.parentNode;return b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex),null}})),p.support.enctype||(p.propFix.enctype="encoding"),p.support.checkOn||p.each(["radio","checkbox"],function(){p.valHooks[this]={get:function(a){return a.getAttribute("value")===null?"on":a.value}}}),p.each(["radio","checkbox"],function(){p.valHooks[this]=p.extend(p.valHooks[this],{set:function(a,b){if(p.isArray(b))return a.checked=p.inArray(p(a).val(),b)>=0}})});var V=/^(?:textarea|input|select)$/i,W=/^([^\.]*|)(?:\.(.+)|)$/,X=/(?:^|\s)hover(\.\S+|)\b/,Y=/^key/,Z=/^(?:mouse|contextmenu)|click/,$=/^(?:focusinfocus|focusoutblur)$/,_=function(a){return p.event.special.hover?a:a.replace(X,"mouseenter$1 mouseleave$1")};p.event={add:function(a,c,d,e,f){var g,h,i,j,k,l,m,n,o,q,r;if(a.nodeType===3||a.nodeType===8||!c||!d||!(g=p._data(a)))return;d.handler&&(o=d,d=o.handler,f=o.selector),d.guid||(d.guid=p.guid++),i=g.events,i||(g.events=i={}),h=g.handle,h||(g.handle=h=function(a){return typeof p!="undefined"&&(!a||p.event.triggered!==a.type)?p.event.dispatch.apply(h.elem,arguments):b},h.elem=a),c=p.trim(_(c)).split(" ");for(j=0;j<c.length;j++){k=W.exec(c[j])||[],l=k[1],m=(k[2]||"").split(".").sort(),r=p.event.special[l]||{},l=(f?r.delegateType:r.bindType)||l,r=p.event.special[l]||{},n=p.extend({type:l,origType:k[1],data:e,handler:d,guid:d.guid,selector:f,namespace:m.join(".")},o),q=i[l];if(!q){q=i[l]=[],q.delegateCount=0;if(!r.setup||r.setup.call(a,e,m,h)===!1)a.addEventListener?a.addEventListener(l,h,!1):a.attachEvent&&a.attachEvent("on"+l,h)}r.add&&(r.add.call(a,n),n.handler.guid||(n.handler.guid=d.guid)),f?q.splice(q.delegateCount++,0,n):q.push(n),p.event.global[l]=!0}a=null},global:{},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,n,o,q,r=p.hasData(a)&&p._data(a);if(!r||!(m=r.events))return;b=p.trim(_(b||"")).split(" ");for(f=0;f<b.length;f++){g=W.exec(b[f])||[],h=i=g[1],j=g[2];if(!h){for(h in m)p.event.remove(a,h+b[f],c,d,!0);continue}n=p.event.special[h]||{},h=(d?n.delegateType:n.bindType)||h,o=m[h]||[],k=o.length,j=j?new RegExp("(^|\\.)"+j.split(".").sort().join("\\.(?:.*\\.|)")+"(\\.|$)"):null;for(l=0;l<o.length;l++)q=o[l],(e||i===q.origType)&&(!c||c.guid===q.guid)&&(!j||j.test(q.namespace))&&(!d||d===q.selector||d==="**"&&q.selector)&&(o.splice(l--,1),q.selector&&o.delegateCount--,n.remove&&n.remove.call(a,q));o.length===0&&k!==o.length&&((!n.teardown||n.teardown.call(a,j,r.handle)===!1)&&p.removeEvent(a,h,r.handle),delete m[h])}p.isEmptyObject(m)&&(delete r.handle,p.removeData(a,"events",!0))},customEvent:{getData:!0,setData:!0,changeData:!0},trigger:function(c,d,f,g){if(!f||f.nodeType!==3&&f.nodeType!==8){var h,i,j,k,l,m,n,o,q,r,s=c.type||c,t=[];if($.test(s+p.event.triggered))return;s.indexOf("!")>=0&&(s=s.slice(0,-1),i=!0),s.indexOf(".")>=0&&(t=s.split("."),s=t.shift(),t.sort());if((!f||p.event.customEvent[s])&&!p.event.global[s])return;c=typeof c=="object"?c[p.expando]?c:new p.Event(s,c):new p.Event(s),c.type=s,c.isTrigger=!0,c.exclusive=i,c.namespace=t.join("."),c.namespace_re=c.namespace?new RegExp("(^|\\.)"+t.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,m=s.indexOf(":")<0?"on"+s:"";if(!f){h=p.cache;for(j in h)h[j].events&&h[j].events[s]&&p.event.trigger(c,d,h[j].handle.elem,!0);return}c.result=b,c.target||(c.target=f),d=d!=null?p.makeArray(d):[],d.unshift(c),n=p.event.special[s]||{};if(n.trigger&&n.trigger.apply(f,d)===!1)return;q=[[f,n.bindType||s]];if(!g&&!n.noBubble&&!p.isWindow(f)){r=n.delegateType||s,k=$.test(r+s)?f:f.parentNode;for(l=f;k;k=k.parentNode)q.push([k,r]),l=k;l===(f.ownerDocument||e)&&q.push([l.defaultView||l.parentWindow||a,r])}for(j=0;j<q.length&&!c.isPropagationStopped();j++)k=q[j][0],c.type=q[j][1],o=(p._data(k,"events")||{})[c.type]&&p._data(k,"handle"),o&&o.apply(k,d),o=m&&k[m],o&&p.acceptData(k)&&o.apply(k,d)===!1&&c.preventDefault();return c.type=s,!g&&!c.isDefaultPrevented()&&(!n._default||n._default.apply(f.ownerDocument,d)===!1)&&(s!=="click"||!p.nodeName(f,"a"))&&p.acceptData(f)&&m&&f[s]&&(s!=="focus"&&s!=="blur"||c.target.offsetWidth!==0)&&!p.isWindow(f)&&(l=f[m],l&&(f[m]=null),p.event.triggered=s,f[s](),p.event.triggered=b,l&&(f[m]=l)),c.result}return},dispatch:function(c){c=p.event.fix(c||a.event);var d,e,f,g,h,i,j,k,l,m,n=(p._data(this,"events")||{})[c.type]||[],o=n.delegateCount,q=[].slice.call(arguments),r=!c.exclusive&&!c.namespace,s=p.event.special[c.type]||{},t=[];q[0]=c,c.delegateTarget=this;if(s.preDispatch&&s.preDispatch.call(this,c)===!1)return;if(o&&(!c.button||c.type!=="click"))for(f=c.target;f!=this;f=f.parentNode||this)if(f.disabled!==!0||c.type!=="click"){h={},j=[];for(d=0;d<o;d++)k=n[d],l=k.selector,h[l]===b&&(h[l]=p(l,this).index(f)>=0),h[l]&&j.push(k);j.length&&t.push({elem:f,matches:j})}n.length>o&&t.push({elem:this,matches:n.slice(o)});for(d=0;d<t.length&&!c.isPropagationStopped();d++){i=t[d],c.currentTarget=i.elem;for(e=0;e<i.matches.length&&!c.isImmediatePropagationStopped();e++){k=i.matches[e];if(r||!c.namespace&&!k.namespace||c.namespace_re&&c.namespace_re.test(k.namespace))c.data=k.data,c.handleObj=k,g=((p.event.special[k.origType]||{}).handle||k.handler).apply(i.elem,q),g!==b&&(c.result=g,g===!1&&(c.preventDefault(),c.stopPropagation()))}}return s.postDispatch&&s.postDispatch.call(this,c),c.result},props:"attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return a.which==null&&(a.which=b.charCode!=null?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,c){var d,f,g,h=c.button,i=c.fromElement;return a.pageX==null&&c.clientX!=null&&(d=a.target.ownerDocument||e,f=d.documentElement,g=d.body,a.pageX=c.clientX+(f&&f.scrollLeft||g&&g.scrollLeft||0)-(f&&f.clientLeft||g&&g.clientLeft||0),a.pageY=c.clientY+(f&&f.scrollTop||g&&g.scrollTop||0)-(f&&f.clientTop||g&&g.clientTop||0)),!a.relatedTarget&&i&&(a.relatedTarget=i===a.target?c.toElement:i),!a.which&&h!==b&&(a.which=h&1?1:h&2?3:h&4?2:0),a}},fix:function(a){if(a[p.expando])return a;var b,c,d=a,f=p.event.fixHooks[a.type]||{},g=f.props?this.props.concat(f.props):this.props;a=p.Event(d);for(b=g.length;b;)c=g[--b],a[c]=d[c];return a.target||(a.target=d.srcElement||e),a.target.nodeType===3&&(a.target=a.target.parentNode),a.metaKey=!!a.metaKey,f.filter?f.filter(a,d):a},special:{load:{noBubble:!0},focus:{delegateType:"focusin"},blur:{delegateType:"focusout"},beforeunload:{setup:function(a,b,c){p.isWindow(this)&&(this.onbeforeunload=c)},teardown:function(a,b){this.onbeforeunload===b&&(this.onbeforeunload=null)}}},simulate:function(a,b,c,d){var e=p.extend(new p.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?p.event.trigger(e,null,b):p.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},p.event.handle=p.event.dispatch,p.removeEvent=e.removeEventListener?function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)}:function(a,b,c){var d="on"+b;a.detachEvent&&(typeof a[d]=="undefined"&&(a[d]=null),a.detachEvent(d,c))},p.Event=function(a,b){if(this instanceof p.Event)a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||a.returnValue===!1||a.getPreventDefault&&a.getPreventDefault()?bb:ba):this.type=a,b&&p.extend(this,b),this.timeStamp=a&&a.timeStamp||p.now(),this[p.expando]=!0;else return new p.Event(a,b)},p.Event.prototype={preventDefault:function(){this.isDefaultPrevented=bb;var a=this.originalEvent;if(!a)return;a.preventDefault?a.preventDefault():a.returnValue=!1},stopPropagation:function(){this.isPropagationStopped=bb;var a=this.originalEvent;if(!a)return;a.stopPropagation&&a.stopPropagation(),a.cancelBubble=!0},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=bb,this.stopPropagation()},isDefaultPrevented:ba,isPropagationStopped:ba,isImmediatePropagationStopped:ba},p.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(a,b){p.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj,g=f.selector;if(!e||e!==d&&!p.contains(d,e))a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b;return c}}}),p.support.submitBubbles||(p.event.special.submit={setup:function(){if(p.nodeName(this,"form"))return!1;p.event.add(this,"click._submit keypress._submit",function(a){var c=a.target,d=p.nodeName(c,"input")||p.nodeName(c,"button")?c.form:b;d&&!p._data(d,"_submit_attached")&&(p.event.add(d,"submit._submit",function(a){a._submit_bubble=!0}),p._data(d,"_submit_attached",!0))})},postDispatch:function(a){a._submit_bubble&&(delete a._submit_bubble,this.parentNode&&!a.isTrigger&&p.event.simulate("submit",this.parentNode,a,!0))},teardown:function(){if(p.nodeName(this,"form"))return!1;p.event.remove(this,"._submit")}}),p.support.changeBubbles||(p.event.special.change={setup:function(){if(V.test(this.nodeName)){if(this.type==="checkbox"||this.type==="radio")p.event.add(this,"propertychange._change",function(a){a.originalEvent.propertyName==="checked"&&(this._just_changed=!0)}),p.event.add(this,"click._change",function(a){this._just_changed&&!a.isTrigger&&(this._just_changed=!1),p.event.simulate("change",this,a,!0)});return!1}p.event.add(this,"beforeactivate._change",function(a){var b=a.target;V.test(b.nodeName)&&!p._data(b,"_change_attached")&&(p.event.add(b,"change._change",function(a){this.parentNode&&!a.isSimulated&&!a.isTrigger&&p.event.simulate("change",this.parentNode,a,!0)}),p._data(b,"_change_attached",!0))})},handle:function(a){var b=a.target;if(this!==b||a.isSimulated||a.isTrigger||b.type!=="radio"&&b.type!=="checkbox")return a.handleObj.handler.apply(this,arguments)},teardown:function(){return p.event.remove(this,"._change"),!V.test(this.nodeName)}}),p.support.focusinBubbles||p.each({focus:"focusin",blur:"focusout"},function(a,b){var c=0,d=function(a){p.event.simulate(b,a.target,p.event.fix(a),!0)};p.event.special[b]={setup:function(){c++===0&&e.addEventListener(a,d,!0)},teardown:function(){--c===0&&e.removeEventListener(a,d,!0)}}}),p.fn.extend({on:function(a,c,d,e,f){var g,h;if(typeof a=="object"){typeof c!="string"&&(d=d||c,c=b);for(h in a)this.on(h,c,d,a[h],f);return this}d==null&&e==null?(e=c,d=c=b):e==null&&(typeof c=="string"?(e=d,d=b):(e=d,d=c,c=b));if(e===!1)e=ba;else if(!e)return this;return f===1&&(g=e,e=function(a){return p().off(a),g.apply(this,arguments)},e.guid=g.guid||(g.guid=p.guid++)),this.each(function(){p.event.add(this,a,e,d,c)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,c,d){var e,f;if(a&&a.preventDefault&&a.handleObj)return e=a.handleObj,p(a.delegateTarget).off(e.namespace?e.origType+"."+e.namespace:e.origType,e.selector,e.handler),this;if(typeof a=="object"){for(f in a)this.off(f,c,a[f]);return this}if(c===!1||typeof c=="function")d=c,c=b;return d===!1&&(d=ba),this.each(function(){p.event.remove(this,a,d,c)})},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},live:function(a,b,c){return p(this.context).on(a,this.selector,b,c),this},die:function(a,b){return p(this.context).off(a,this.selector||"**",b),this},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return arguments.length==1?this.off(a,"**"):this.off(b,a||"**",c)},trigger:function(a,b){return this.each(function(){p.event.trigger(a,b,this)})},triggerHandler:function(a,b){if(this[0])return p.event.trigger(a,b,this[0],!0)},toggle:function(a){var b=arguments,c=a.guid||p.guid++,d=0,e=function(c){var e=(p._data(this,"lastToggle"+a.guid)||0)%d;return p._data(this,"lastToggle"+a.guid,e+1),c.preventDefault(),b[e].apply(this,arguments)||!1};e.guid=c;while(d<b.length)b[d++].guid=c;return this.click(e)},hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}}),p.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){p.fn[b]=function(a,c){return c==null&&(c=a,a=null),arguments.length>0?this.on(b,null,a,c):this.trigger(b)},Y.test(b)&&(p.event.fixHooks[b]=p.event.keyHooks),Z.test(b)&&(p.event.fixHooks[b]=p.event.mouseHooks)}),function(a,b){function $(a,b,c,d){c=c||[],b=b||q;var e,f,g,j,k=b.nodeType;if(k!==1&&k!==9)return[];if(!a||typeof a!="string")return c;g=h(b);if(!g&&!d)if(e=L.exec(a))if(j=e[1]){if(k===9){f=b.getElementById(j);if(!f||!f.parentNode)return c;if(f.id===j)return c.push(f),c}else if(b.ownerDocument&&(f=b.ownerDocument.getElementById(j))&&i(b,f)&&f.id===j)return c.push(f),c}else{if(e[2])return u.apply(c,t.call(b.getElementsByTagName(a),0)),c;if((j=e[3])&&X&&b.getElementsByClassName)return u.apply(c,t.call(b.getElementsByClassName(j),0)),c}return bk(a,b,c,d,g)}function _(a){return function(b){var c=b.nodeName.toLowerCase();return c==="input"&&b.type===a}}function ba(a){return function(b){var c=b.nodeName.toLowerCase();return(c==="input"||c==="button")&&b.type===a}}function bb(a,b,c){if(a===b)return c;var d=a.nextSibling;while(d){if(d===b)return-1;d=d.nextSibling}return 1}function bc(a,b,c,d){var e,g,h,i,j,k,l,m,n,p,r=!c&&b!==q,s=(r?"<s>":"")+a.replace(H,"$1<s>"),u=y[o][s];if(u)return d?0:t.call(u,0);j=a,k=[],m=0,n=f.preFilter,p=f.filter;while(j){if(!e||(g=I.exec(j)))g&&(j=j.slice(g[0].length),h.selector=l),k.push(h=[]),l="",r&&(j=" "+j);e=!1;if(g=J.exec(j))l+=g[0],j=j.slice(g[0].length),e=h.push({part:g.pop().replace(H," "),string:g[0],captures:g});for(i in p)(g=S[i].exec(j))&&(!n[i]||(g=n[i](g,b,c)))&&(l+=g[0],j=j.slice(g[0].length),e=h.push({part:i,string:g.shift(),captures:g}));if(!e)break}return l&&(h.selector=l),d?j.length:j?$.error(a):t.call(y(s,k),0)}function bd(a,b,e,f){var g=b.dir,h=s++;return a||(a=function(a){return a===e}),b.first?function(b){while(b=b[g])if(b.nodeType===1)return a(b)&&b}:f?function(b){while(b=b[g])if(b.nodeType===1&&a(b))return b}:function(b){var e,f=h+"."+c,i=f+"."+d;while(b=b[g])if(b.nodeType===1){if((e=b[o])===i)return b.sizset;if(typeof e=="string"&&e.indexOf(f)===0){if(b.sizset)return b}else{b[o]=i;if(a(b))return b.sizset=!0,b;b.sizset=!1}}}}function be(a,b){return a?function(c){var d=b(c);return d&&a(d===!0?c:d)}:b}function bf(a,b,c){var d,e,g=0;for(;d=a[g];g++)f.relative[d.part]?e=bd(e,f.relative[d.part],b,c):e=be(e,f.filter[d.part].apply(null,d.captures.concat(b,c)));return e}function bg(a){return function(b){var c,d=0;for(;c=a[d];d++)if(c(b))return!0;return!1}}function bh(a,b,c,d){var e=0,f=b.length;for(;e<f;e++)$(a,b[e],c,d)}function bi(a,b,c,d,e,g){var h,i=f.setFilters[b.toLowerCase()];return i||$.error(b),(a||!(h=e))&&bh(a||"*",d,h=[],e),h.length>0?i(h,c,g):[]}function bj(a,c,d,e){var f,g,h,i,j,k,l,m,n,o,p,q,r,s=0,t=a.length,v=S.POS,w=new RegExp("^"+v.source+"(?!"+A+")","i"),x=function(){var a=1,c=arguments.length-2;for(;a<c;a++)arguments[a]===b&&(n[a]=b)};for(;s<t;s++){f=a[s],g="",m=e;for(h=0,i=f.length;h<i;h++){j=f[h],k=j.string;if(j.part==="PSEUDO"){v.exec(""),l=0;while(n=v.exec(k)){o=!0,p=v.lastIndex=n.index+n[0].length;if(p>l){g+=k.slice(l,n.index),l=p,q=[c],J.test(g)&&(m&&(q=m),m=e);if(r=O.test(g))g=g.slice(0,-5).replace(J,"$&*"),l++;n.length>1&&n[0].replace(w,x),m=bi(g,n[1],n[2],q,m,r)}g=""}}o||(g+=k),o=!1}g?J.test(g)?bh(g,m||[c],d,e):$(g,c,d,e?e.concat(m):m):u.apply(d,m)}return t===1?d:$.uniqueSort(d)}function bk(a,b,e,g,h){a=a.replace(H,"$1");var i,k,l,m,n,o,p,q,r,s,v=bc(a,b,h),w=b.nodeType;if(S.POS.test(a))return bj(v,b,e,g);if(g)i=t.call(g,0);else if(v.length===1){if((o=t.call(v[0],0)).length>2&&(p=o[0]).part==="ID"&&w===9&&!h&&f.relative[o[1].part]){b=f.find.ID(p.captures[0].replace(R,""),b,h)[0];if(!b)return e;a=a.slice(o.shift().string.length)}r=(v=N.exec(o[0].string))&&!v.index&&b.parentNode||b,q="";for(n=o.length-1;n>=0;n--){p=o[n],s=p.part,q=p.string+q;if(f.relative[s])break;if(f.order.test(s)){i=f.find[s](p.captures[0].replace(R,""),r,h);if(i==null)continue;a=a.slice(0,a.length-q.length)+q.replace(S[s],""),a||u.apply(e,t.call(i,0));break}}}if(a){k=j(a,b,h),c=k.dirruns++,i==null&&(i=f.find.TAG("*",N.test(a)&&b.parentNode||b));for(n=0;m=i[n];n++)d=k.runs++,k(m)&&e.push(m)}return e}var c,d,e,f,g,h,i,j,k,l,m=!0,n="undefined",o=("sizcache"+Math.random()).replace(".",""),q=a.document,r=q.documentElement,s=0,t=[].slice,u=[].push,v=function(a,b){return a[o]=b||!0,a},w=function(){var a={},b=[];return v(function(c,d){return b.push(c)>f.cacheLength&&delete a[b.shift()],a[c]=d},a)},x=w(),y=w(),z=w(),A="[\\x20\\t\\r\\n\\f]",B="(?:\\\\.|[-\\w]|[^\\x00-\\xa0])+",C=B.replace("w","w#"),D="([*^$|!~]?=)",E="\\["+A+"*("+B+")"+A+"*(?:"+D+A+"*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|("+C+")|)|)"+A+"*\\]",F=":("+B+")(?:\\((?:(['\"])((?:\\\\.|[^\\\\])*?)\\2|([^()[\\]]*|(?:(?:"+E+")|[^:]|\\\\.)*|.*))\\)|)",G=":(nth|eq|gt|lt|first|last|even|odd)(?:\\(((?:-\\d)?\\d*)\\)|)(?=[^-]|$)",H=new RegExp("^"+A+"+|((?:^|[^\\\\])(?:\\\\.)*)"+A+"+$","g"),I=new RegExp("^"+A+"*,"+A+"*"),J=new RegExp("^"+A+"*([\\x20\\t\\r\\n\\f>+~])"+A+"*"),K=new RegExp(F),L=/^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,M=/^:not/,N=/[\x20\t\r\n\f]*[+~]/,O=/:not\($/,P=/h\d/i,Q=/input|select|textarea|button/i,R=/\\(?!\\)/g,S={ID:new RegExp("^#("+B+")"),CLASS:new RegExp("^\\.("+B+")"),NAME:new RegExp("^\\[name=['\"]?("+B+")['\"]?\\]"),TAG:new RegExp("^("+B.replace("w","w*")+")"),ATTR:new RegExp("^"+E),PSEUDO:new RegExp("^"+F),CHILD:new RegExp("^:(only|nth|last|first)-child(?:\\("+A+"*(even|odd|(([+-]|)(\\d*)n|)"+A+"*(?:([+-]|)"+A+"*(\\d+)|))"+A+"*\\)|)","i"),POS:new RegExp(G,"ig"),needsContext:new RegExp("^"+A+"*[>+~]|"+G,"i")},T=function(a){var b=q.createElement("div");try{return a(b)}catch(c){return!1}finally{b=null}},U=T(function(a){return a.appendChild(q.createComment("")),!a.getElementsByTagName("*").length}),V=T(function(a){return a.innerHTML="<a href='#'></a>",a.firstChild&&typeof a.firstChild.getAttribute!==n&&a.firstChild.getAttribute("href")==="#"}),W=T(function(a){a.innerHTML="<select></select>";var b=typeof a.lastChild.getAttribute("multiple");return b!=="boolean"&&b!=="string"}),X=T(function(a){return a.innerHTML="<div class='hidden e'></div><div class='hidden'></div>",!a.getElementsByClassName||!a.getElementsByClassName("e").length?!1:(a.lastChild.className="e",a.getElementsByClassName("e").length===2)}),Y=T(function(a){a.id=o+0,a.innerHTML="<a name='"+o+"'></a><div name='"+o+"'></div>",r.insertBefore(a,r.firstChild);var b=q.getElementsByName&&q.getElementsByName(o).length===2+q.getElementsByName(o+0).length;return e=!q.getElementById(o),r.removeChild(a),b});try{t.call(r.childNodes,0)[0].nodeType}catch(Z){t=function(a){var b,c=[];for(;b=this[a];a++)c.push(b);return c}}$.matches=function(a,b){return $(a,null,null,b)},$.matchesSelector=function(a,b){return $(b,null,null,[a]).length>0},g=$.getText=function(a){var b,c="",d=0,e=a.nodeType;if(e){if(e===1||e===9||e===11){if(typeof a.textContent=="string")return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=g(a)}else if(e===3||e===4)return a.nodeValue}else for(;b=a[d];d++)c+=g(b);return c},h=$.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?b.nodeName!=="HTML":!1},i=$.contains=r.contains?function(a,b){var c=a.nodeType===9?a.documentElement:a,d=b&&b.parentNode;return a===d||!!(d&&d.nodeType===1&&c.contains&&c.contains(d))}:r.compareDocumentPosition?function(a,b){return b&&!!(a.compareDocumentPosition(b)&16)}:function(a,b){while(b=b.parentNode)if(b===a)return!0;return!1},$.attr=function(a,b){var c,d=h(a);return d||(b=b.toLowerCase()),f.attrHandle[b]?f.attrHandle[b](a):W||d?a.getAttribute(b):(c=a.getAttributeNode(b),c?typeof a[b]=="boolean"?a[b]?b:null:c.specified?c.value:null:null)},f=$.selectors={cacheLength:50,createPseudo:v,match:S,order:new RegExp("ID|TAG"+(Y?"|NAME":"")+(X?"|CLASS":"")),attrHandle:V?{}:{href:function(a){return a.getAttribute("href",2)},type:function(a){return a.getAttribute("type")}},find:{ID:e?function(a,b,c){if(typeof b.getElementById!==n&&!c){var d=b.getElementById(a);return d&&d.parentNode?[d]:[]}}:function(a,c,d){if(typeof c.getElementById!==n&&!d){var e=c.getElementById(a);return e?e.id===a||typeof e.getAttributeNode!==n&&e.getAttributeNode("id").value===a?[e]:b:[]}},TAG:U?function(a,b){if(typeof b.getElementsByTagName!==n)return b.getElementsByTagName(a)}:function(a,b){var c=b.getElementsByTagName(a);if(a==="*"){var d,e=[],f=0;for(;d=c[f];f++)d.nodeType===1&&e.push(d);return e}return c},NAME:function(a,b){if(typeof b.getElementsByName!==n)return b.getElementsByName(name)},CLASS:function(a,b,c){if(typeof b.getElementsByClassName!==n&&!c)return b.getElementsByClassName(a)}},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(R,""),a[3]=(a[4]||a[5]||"").replace(R,""),a[2]==="~="&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),a[1]==="nth"?(a[2]||$.error(a[0]),a[3]=+(a[3]?a[4]+(a[5]||1):2*(a[2]==="even"||a[2]==="odd")),a[4]=+(a[6]+a[7]||a[2]==="odd")):a[2]&&$.error(a[0]),a},PSEUDO:function(a,b,c){var d,e;if(S.CHILD.test(a[0]))return null;if(a[3])a[2]=a[3];else if(d=a[4])K.test(d)&&(e=bc(d,b,c,!0))&&(e=d.indexOf(")",d.length-e)-d.length)&&(d=d.slice(0,e),a[0]=a[0].slice(0,e)),a[2]=d;return a.slice(0,3)}},filter:{ID:e?function(a){return a=a.replace(R,""),function(b){return b.getAttribute("id")===a}}:function(a){return a=a.replace(R,""),function(b){var c=typeof b.getAttributeNode!==n&&b.getAttributeNode("id");return c&&c.value===a}},TAG:function(a){return a==="*"?function(){return!0}:(a=a.replace(R,"").toLowerCase(),function(b){return b.nodeName&&b.nodeName.toLowerCase()===a})},CLASS:function(a){var b=x[o][a];return b||(b=x(a,new RegExp("(^|"+A+")"+a+"("+A+"|$)"))),function(a){return b.test(a.className||typeof a.getAttribute!==n&&a.getAttribute("class")||"")}},ATTR:function(a,b,c){return b?function(d){var e=$.attr(d,a),f=e+"";if(e==null)return b==="!=";switch(b){case"=":return f===c;case"!=":return f!==c;case"^=":return c&&f.indexOf(c)===0;case"*=":return c&&f.indexOf(c)>-1;case"$=":return c&&f.substr(f.length-c.length)===c;case"~=":return(" "+f+" ").indexOf(c)>-1;case"|=":return f===c||f.substr(0,c.length+1)===c+"-"}}:function(b){return $.attr(b,a)!=null}},CHILD:function(a,b,c,d){if(a==="nth"){var e=s++;return function(a){var b,f,g=0,h=a;if(c===1&&d===0)return!0;b=a.parentNode;if(b&&(b[o]!==e||!a.sizset)){for(h=b.firstChild;h;h=h.nextSibling)if(h.nodeType===1){h.sizset=++g;if(h===a)break}b[o]=e}return f=a.sizset-d,c===0?f===0:f%c===0&&f/c>=0}}return function(b){var c=b;switch(a){case"only":case"first":while(c=c.previousSibling)if(c.nodeType===1)return!1;if(a==="first")return!0;c=b;case"last":while(c=c.nextSibling)if(c.nodeType===1)return!1;return!0}}},PSEUDO:function(a,b,c,d){var e,g=f.pseudos[a]||f.pseudos[a.toLowerCase()];return g||$.error("unsupported pseudo: "+a),g[o]?g(b,c,d):g.length>1?(e=[a,a,"",b],function(a){return g(a,0,e)}):g}},pseudos:{not:v(function(a,b,c){var d=j(a.replace(H,"$1"),b,c);return function(a){return!d(a)}}),enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return b==="input"&&!!a.checked||b==="option"&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},parent:function(a){return!f.pseudos.empty(a)},empty:function(a){var b;a=a.firstChild;while(a){if(a.nodeName>"@"||(b=a.nodeType)===3||b===4)return!1;a=a.nextSibling}return!0},contains:v(function(a){return function(b){return(b.textContent||b.innerText||g(b)).indexOf(a)>-1}}),has:v(function(a){return function(b){return $(a,b).length>0}}),header:function(a){return P.test(a.nodeName)},text:function(a){var b,c;return a.nodeName.toLowerCase()==="input"&&(b=a.type)==="text"&&((c=a.getAttribute("type"))==null||c.toLowerCase()===b)},radio:_("radio"),checkbox:_("checkbox"),file:_("file"),password:_("password"),image:_("image"),submit:ba("submit"),reset:ba("reset"),button:function(a){var b=a.nodeName.toLowerCase();return b==="input"&&a.type==="button"||b==="button"},input:function(a){return Q.test(a.nodeName)},focus:function(a){var b=a.ownerDocument;return a===b.activeElement&&(!b.hasFocus||b.hasFocus())&&(!!a.type||!!a.href)},active:function(a){return a===a.ownerDocument.activeElement}},setFilters:{first:function(a,b,c){return c?a.slice(1):[a[0]]},last:function(a,b,c){var d=a.pop();return c?a:[d]},even:function(a,b,c){var d=[],e=c?1:0,f=a.length;for(;e<f;e=e+2)d.push(a[e]);return d},odd:function(a,b,c){var d=[],e=c?0:1,f=a.length;for(;e<f;e=e+2)d.push(a[e]);return d},lt:function(a,b,c){return c?a.slice(+b):a.slice(0,+b)},gt:function(a,b,c){return c?a.slice(0,+b+1):a.slice(+b+1)},eq:function(a,b,c){var d=a.splice(+b,1);return c?a:d}}},k=r.compareDocumentPosition?function(a,b){return a===b?(l=!0,0):(!a.compareDocumentPosition||!b.compareDocumentPosition?a.compareDocumentPosition:a.compareDocumentPosition(b)&4)?-1:1}:function(a,b){if(a===b)return l=!0,0;if(a.sourceIndex&&b.sourceIndex)return a.sourceIndex-b.sourceIndex;var c,d,e=[],f=[],g=a.parentNode,h=b.parentNode,i=g;if(g===h)return bb(a,b);if(!g)return-1;if(!h)return 1;while(i)e.unshift(i),i=i.parentNode;i=h;while(i)f.unshift(i),i=i.parentNode;c=e.length,d=f.length;for(var j=0;j<c&&j<d;j++)if(e[j]!==f[j])return bb(e[j],f[j]);return j===c?bb(a,f[j],-1):bb(e[j],b,1)},[0,0].sort(k),m=!l,$.uniqueSort=function(a){var b,c=1;l=m,a.sort(k);if(l)for(;b=a[c];c++)b===a[c-1]&&a.splice(c--,1);return a},$.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},j=$.compile=function(a,b,c){var d,e,f,g=z[o][a];if(g&&g.context===b)return g;d=bc(a,b,c);for(e=0,f=d.length;e<f;e++)d[e]=bf(d[e],b,c);return g=z(a,bg(d)),g.context=b,g.runs=g.dirruns=0,g},q.querySelectorAll&&function(){var a,b=bk,c=/'|\\/g,d=/\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,e=[],f=[":active"],g=r.matchesSelector||r.mozMatchesSelector||r.webkitMatchesSelector||r.oMatchesSelector||r.msMatchesSelector;T(function(a){a.innerHTML="<select><option selected=''></option></select>",a.querySelectorAll("[selected]").length||e.push("\\["+A+"*(?:checked|disabled|ismap|multiple|readonly|selected|value)"),a.querySelectorAll(":checked").length||e.push(":checked")}),T(function(a){a.innerHTML="<p test=''></p>",a.querySelectorAll("[test^='']").length&&e.push("[*^$]="+A+"*(?:\"\"|'')"),a.innerHTML="<input type='hidden'/>",a.querySelectorAll(":enabled").length||e.push(":enabled",":disabled")}),e=e.length&&new RegExp(e.join("|")),bk=function(a,d,f,g,h){if(!g&&!h&&(!e||!e.test(a)))if(d.nodeType===9)try{return u.apply(f,t.call(d.querySelectorAll(a),0)),f}catch(i){}else if(d.nodeType===1&&d.nodeName.toLowerCase()!=="object"){var j,k,l,m=d.getAttribute("id"),n=m||o,p=N.test(a)&&d.parentNode||d;m?n=n.replace(c,"\\$&"):d.setAttribute("id",n),j=bc(a,d,h),n="[id='"+n+"']";for(k=0,l=j.length;k<l;k++)j[k]=n+j[k].selector;try{return u.apply(f,t.call(p.querySelectorAll(j.join(",")),0)),f}catch(i){}finally{m||d.removeAttribute("id")}}return b(a,d,f,g,h)},g&&(T(function(b){a=g.call(b,"div");try{g.call(b,"[test!='']:sizzle"),f.push(S.PSEUDO.source,S.POS.source,"!=")}catch(c){}}),f=new RegExp(f.join("|")),$.matchesSelector=function(b,c){c=c.replace(d,"='$1']");if(!h(b)&&!f.test(c)&&(!e||!e.test(c)))try{var i=g.call(b,c);if(i||a||b.document&&b.document.nodeType!==11)return i}catch(j){}return $(c,null,null,[b]).length>0})}(),f.setFilters.nth=f.setFilters.eq,f.filters=f.pseudos,$.attr=p.attr,p.find=$,p.expr=$.selectors,p.expr[":"]=p.expr.pseudos,p.unique=$.uniqueSort,p.text=$.getText,p.isXMLDoc=$.isXML,p.contains=$.contains}(a);var bc=/Until$/,bd=/^(?:parents|prev(?:Until|All))/,be=/^.[^:#\[\.,]*$/,bf=p.expr.match.needsContext,bg={children:!0,contents:!0,next:!0,prev:!0};p.fn.extend({find:function(a){var b,c,d,e,f,g,h=this;if(typeof a!="string")return p(a).filter(function(){for(b=0,c=h.length;b<c;b++)if(p.contains(h[b],this))return!0});g=this.pushStack("","find",a);for(b=0,c=this.length;b<c;b++){d=g.length,p.find(a,this[b],g);if(b>0)for(e=d;e<g.length;e++)for(f=0;f<d;f++)if(g[f]===g[e]){g.splice(e--,1);break}}return g},has:function(a){var b,c=p(a,this),d=c.length;return this.filter(function(){for(b=0;b<d;b++)if(p.contains(this,c[b]))return!0})},not:function(a){return this.pushStack(bj(this,a,!1),"not",a)},filter:function(a){return this.pushStack(bj(this,a,!0),"filter",a)},is:function(a){return!!a&&(typeof a=="string"?bf.test(a)?p(a,this.context).index(this[0])>=0:p.filter(a,this).length>0:this.filter(a).length>0)},closest:function(a,b){var c,d=0,e=this.length,f=[],g=bf.test(a)||typeof a!="string"?p(a,b||this.context):0;for(;d<e;d++){c=this[d];while(c&&c.ownerDocument&&c!==b&&c.nodeType!==11){if(g?g.index(c)>-1:p.find.matchesSelector(c,a)){f.push(c);break}c=c.parentNode}}return f=f.length>1?p.unique(f):f,this.pushStack(f,"closest",a)},index:function(a){return a?typeof a=="string"?p.inArray(this[0],p(a)):p.inArray(a.jquery?a[0]:a,this):this[0]&&this[0].parentNode?this.prevAll().length:-1},add:function(a,b){var c=typeof a=="string"?p(a,b):p.makeArray(a&&a.nodeType?[a]:a),d=p.merge(this.get(),c);return this.pushStack(bh(c[0])||bh(d[0])?d:p.unique(d))},addBack:function(a){return this.add(a==null?this.prevObject:this.prevObject.filter(a))}}),p.fn.andSelf=p.fn.addBack,p.each({parent:function(a){var b=a.parentNode;return b&&b.nodeType!==11?b:null},parents:function(a){return p.dir(a,"parentNode")},parentsUntil:function(a,b,c){return p.dir(a,"parentNode",c)},next:function(a){return bi(a,"nextSibling")},prev:function(a){return bi(a,"previousSibling")},nextAll:function(a){return p.dir(a,"nextSibling")},prevAll:function(a){return p.dir(a,"previousSibling")},nextUntil:function(a,b,c){return p.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return p.dir(a,"previousSibling",c)},siblings:function(a){return p.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return p.sibling(a.firstChild)},contents:function(a){return p.nodeName(a,"iframe")?a.contentDocument||a.contentWindow.document:p.merge([],a.childNodes)}},function(a,b){p.fn[a]=function(c,d){var e=p.map(this,b,c);return bc.test(a)||(d=c),d&&typeof d=="string"&&(e=p.filter(d,e)),e=this.length>1&&!bg[a]?p.unique(e):e,this.length>1&&bd.test(a)&&(e=e.reverse()),this.pushStack(e,a,k.call(arguments).join(","))}}),p.extend({filter:function(a,b,c){return c&&(a=":not("+a+")"),b.length===1?p.find.matchesSelector(b[0],a)?[b[0]]:[]:p.find.matches(a,b)},dir:function(a,c,d){var e=[],f=a[c];while(f&&f.nodeType!==9&&(d===b||f.nodeType!==1||!p(f).is(d)))f.nodeType===1&&e.push(f),f=f[c];return e},sibling:function(a,b){var c=[];for(;a;a=a.nextSibling)a.nodeType===1&&a!==b&&c.push(a);return c}});var bl="abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",bm=/ jQuery\d+="(?:null|\d+)"/g,bn=/^\s+/,bo=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,bp=/<([\w:]+)/,bq=/<tbody/i,br=/<|&#?\w+;/,bs=/<(?:script|style|link)/i,bt=/<(?:script|object|embed|option|style)/i,bu=new RegExp("<(?:"+bl+")[\\s/>]","i"),bv=/^(?:checkbox|radio)$/,bw=/checked\s*(?:[^=]|=\s*.checked.)/i,bx=/\/(java|ecma)script/i,by=/^\s*<!(?:\[CDATA\[|\-\-)|[\]\-]{2}>\s*$/g,bz={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"],_default:[0,"",""]},bA=bk(e),bB=bA.appendChild(e.createElement("div"));bz.optgroup=bz.option,bz.tbody=bz.tfoot=bz.colgroup=bz.caption=bz.thead,bz.th=bz.td,p.support.htmlSerialize||(bz._default=[1,"X<div>","</div>"]),p.fn.extend({text:function(a){return p.access(this,function(a){return a===b?p.text(this):this.empty().append((this[0]&&this[0].ownerDocument||e).createTextNode(a))},null,a,arguments.length)},wrapAll:function(a){if(p.isFunction(a))return this.each(function(b){p(this).wrapAll(a.call(this,b))});if(this[0]){var b=p(a,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstChild&&a.firstChild.nodeType===1)a=a.firstChild;return a}).append(this)}return this},wrapInner:function(a){return p.isFunction(a)?this.each(function(b){p(this).wrapInner(a.call(this,b))}):this.each(function(){var b=p(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=p.isFunction(a);return this.each(function(c){p(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){p.nodeName(this,"body")||p(this).replaceWith(this.childNodes)}).end()},append:function(){return this.domManip(arguments,!0,function(a){(this.nodeType===1||this.nodeType===11)&&this.appendChild(a)})},prepend:function(){return this.domManip(arguments,!0,function(a){(this.nodeType===1||this.nodeType===11)&&this.insertBefore(a,this.firstChild)})},before:function(){if(!bh(this[0]))return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this)});if(arguments.length){var a=p.clean(arguments);return this.pushStack(p.merge(a,this),"before",this.selector)}},after:function(){if(!bh(this[0]))return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this.nextSibling)});if(arguments.length){var a=p.clean(arguments);return this.pushStack(p.merge(this,a),"after",this.selector)}},remove:function(a,b){var c,d=0;for(;(c=this[d])!=null;d++)if(!a||p.filter(a,[c]).length)!b&&c.nodeType===1&&(p.cleanData(c.getElementsByTagName("*")),p.cleanData([c])),c.parentNode&&c.parentNode.removeChild(c);return this},empty:function(){var a,b=0;for(;(a=this[b])!=null;b++){a.nodeType===1&&p.cleanData(a.getElementsByTagName("*"));while(a.firstChild)a.removeChild(a.firstChild)}return this},clone:function(a,b){return a=a==null?!1:a,b=b==null?a:b,this.map(function(){return p.clone(this,a,b)})},html:function(a){return p.access(this,function(a){var c=this[0]||{},d=0,e=this.length;if(a===b)return c.nodeType===1?c.innerHTML.replace(bm,""):b;if(typeof a=="string"&&!bs.test(a)&&(p.support.htmlSerialize||!bu.test(a))&&(p.support.leadingWhitespace||!bn.test(a))&&!bz[(bp.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(bo,"<$1></$2>");try{for(;d<e;d++)c=this[d]||{},c.nodeType===1&&(p.cleanData(c.getElementsByTagName("*")),c.innerHTML=a);c=0}catch(f){}}c&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(a){return bh(this[0])?this.length?this.pushStack(p(p.isFunction(a)?a():a),"replaceWith",a):this:p.isFunction(a)?this.each(function(b){var c=p(this),d=c.html();c.replaceWith(a.call(this,b,d))}):(typeof a!="string"&&(a=p(a).detach()),this.each(function(){var b=this.nextSibling,c=this.parentNode;p(this).remove(),b?p(b).before(a):p(c).append(a)}))},detach:function(a){return this.remove(a,!0)},domManip:function(a,c,d){a=[].concat.apply([],a);var e,f,g,h,i=0,j=a[0],k=[],l=this.length;if(!p.support.checkClone&&l>1&&typeof j=="string"&&bw.test(j))return this.each(function(){p(this).domManip(a,c,d)});if(p.isFunction(j))return this.each(function(e){var f=p(this);a[0]=j.call(this,e,c?f.html():b),f.domManip(a,c,d)});if(this[0]){e=p.buildFragment(a,this,k),g=e.fragment,f=g.firstChild,g.childNodes.length===1&&(g=f);if(f){c=c&&p.nodeName(f,"tr");for(h=e.cacheable||l-1;i<l;i++)d.call(c&&p.nodeName(this[i],"table")?bC(this[i],"tbody"):this[i],i===h?g:p.clone(g,!0,!0))}g=f=null,k.length&&p.each(k,function(a,b){b.src?p.ajax?p.ajax({url:b.src,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0}):p.error("no ajax"):p.globalEval((b.text||b.textContent||b.innerHTML||"").replace(by,"")),b.parentNode&&b.parentNode.removeChild(b)})}return this}}),p.buildFragment=function(a,c,d){var f,g,h,i=a[0];return c=c||e,c=!c.nodeType&&c[0]||c,c=c.ownerDocument||c,a.length===1&&typeof i=="string"&&i.length<512&&c===e&&i.charAt(0)==="<"&&!bt.test(i)&&(p.support.checkClone||!bw.test(i))&&(p.support.html5Clone||!bu.test(i))&&(g=!0,f=p.fragments[i],h=f!==b),f||(f=c.createDocumentFragment(),p.clean(a,c,f,d),g&&(p.fragments[i]=h&&f)),{fragment:f,cacheable:g}},p.fragments={},p.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){p.fn[a]=function(c){var d,e=0,f=[],g=p(c),h=g.length,i=this.length===1&&this[0].parentNode;if((i==null||i&&i.nodeType===11&&i.childNodes.length===1)&&h===1)return g[b](this[0]),this;for(;e<h;e++)d=(e>0?this.clone(!0):this).get(),p(g[e])[b](d),f=f.concat(d);return this.pushStack(f,a,g.selector)}}),p.extend({clone:function(a,b,c){var d,e,f,g;p.support.html5Clone||p.isXMLDoc(a)||!bu.test("<"+a.nodeName+">")?g=a.cloneNode(!0):(bB.innerHTML=a.outerHTML,bB.removeChild(g=bB.firstChild));if((!p.support.noCloneEvent||!p.support.noCloneChecked)&&(a.nodeType===1||a.nodeType===11)&&!p.isXMLDoc(a)){bE(a,g),d=bF(a),e=bF(g);for(f=0;d[f];++f)e[f]&&bE(d[f],e[f])}if(b){bD(a,g);if(c){d=bF(a),e=bF(g);for(f=0;d[f];++f)bD(d[f],e[f])}}return d=e=null,g},clean:function(a,b,c,d){var f,g,h,i,j,k,l,m,n,o,q,r,s=b===e&&bA,t=[];if(!b||typeof b.createDocumentFragment=="undefined")b=e;for(f=0;(h=a[f])!=null;f++){typeof h=="number"&&(h+="");if(!h)continue;if(typeof h=="string")if(!br.test(h))h=b.createTextNode(h);else{s=s||bk(b),l=b.createElement("div"),s.appendChild(l),h=h.replace(bo,"<$1></$2>"),i=(bp.exec(h)||["",""])[1].toLowerCase(),j=bz[i]||bz._default,k=j[0],l.innerHTML=j[1]+h+j[2];while(k--)l=l.lastChild;if(!p.support.tbody){m=bq.test(h),n=i==="table"&&!m?l.firstChild&&l.firstChild.childNodes:j[1]==="<table>"&&!m?l.childNodes:[];for(g=n.length-1;g>=0;--g)p.nodeName(n[g],"tbody")&&!n[g].childNodes.length&&n[g].parentNode.removeChild(n[g])}!p.support.leadingWhitespace&&bn.test(h)&&l.insertBefore(b.createTextNode(bn.exec(h)[0]),l.firstChild),h=l.childNodes,l.parentNode.removeChild(l)}h.nodeType?t.push(h):p.merge(t,h)}l&&(h=l=s=null);if(!p.support.appendChecked)for(f=0;(h=t[f])!=null;f++)p.nodeName(h,"input")?bG(h):typeof h.getElementsByTagName!="undefined"&&p.grep(h.getElementsByTagName("input"),bG);if(c){q=function(a){if(!a.type||bx.test(a.type))return d?d.push(a.parentNode?a.parentNode.removeChild(a):a):c.appendChild(a)};for(f=0;(h=t[f])!=null;f++)if(!p.nodeName(h,"script")||!q(h))c.appendChild(h),typeof h.getElementsByTagName!="undefined"&&(r=p.grep(p.merge([],h.getElementsByTagName("script")),q),t.splice.apply(t,[f+1,0].concat(r)),f+=r.length)}return t},cleanData:function(a,b){var c,d,e,f,g=0,h=p.expando,i=p.cache,j=p.support.deleteExpando,k=p.event.special;for(;(e=a[g])!=null;g++)if(b||p.acceptData(e)){d=e[h],c=d&&i[d];if(c){if(c.events)for(f in c.events)k[f]?p.event.remove(e,f):p.removeEvent(e,f,c.handle);i[d]&&(delete i[d],j?delete e[h]:e.removeAttribute?e.removeAttribute(h):e[h]=null,p.deletedIds.push(d))}}}}),function(){var a,b;p.uaMatch=function(a){a=a.toLowerCase();var b=/(chrome)[ \/]([\w.]+)/.exec(a)||/(webkit)[ \/]([\w.]+)/.exec(a)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(a)||/(msie) ([\w.]+)/.exec(a)||a.indexOf("compatible")<0&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(a)||[];return{browser:b[1]||"",version:b[2]||"0"}},a=p.uaMatch(g.userAgent),b={},a.browser&&(b[a.browser]=!0,b.version=a.version),b.chrome?b.webkit=!0:b.webkit&&(b.safari=!0),p.browser=b,p.sub=function(){function a(b,c){return new a.fn.init(b,c)}p.extend(!0,a,this),a.superclass=this,a.fn=a.prototype=this(),a.fn.constructor=a,a.sub=this.sub,a.fn.init=function c(c,d){return d&&d instanceof p&&!(d instanceof a)&&(d=a(d)),p.fn.init.call(this,c,d,b)},a.fn.init.prototype=a.fn;var b=a(e);return a}}();var bH,bI,bJ,bK=/alpha\([^)]*\)/i,bL=/opacity=([^)]*)/,bM=/^(top|right|bottom|left)$/,bN=/^(none|table(?!-c[ea]).+)/,bO=/^margin/,bP=new RegExp("^("+q+")(.*)$","i"),bQ=new RegExp("^("+q+")(?!px)[a-z%]+$","i"),bR=new RegExp("^([-+])=("+q+")","i"),bS={},bT={position:"absolute",visibility:"hidden",display:"block"},bU={letterSpacing:0,fontWeight:400},bV=["Top","Right","Bottom","Left"],bW=["Webkit","O","Moz","ms"],bX=p.fn.toggle;p.fn.extend({css:function(a,c){return p.access(this,function(a,c,d){return d!==b?p.style(a,c,d):p.css(a,c)},a,c,arguments.length>1)},show:function(){return b$(this,!0)},hide:function(){return b$(this)},toggle:function(a,b){var c=typeof a=="boolean";return p.isFunction(a)&&p.isFunction(b)?bX.apply(this,arguments):this.each(function(){(c?a:bZ(this))?p(this).show():p(this).hide()})}}),p.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=bH(a,"opacity");return c===""?"1":c}}}},cssNumber:{fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":p.support.cssFloat?"cssFloat":"styleFloat"},style:function(a,c,d,e){if(!a||a.nodeType===3||a.nodeType===8||!a.style)return;var f,g,h,i=p.camelCase(c),j=a.style;c=p.cssProps[i]||(p.cssProps[i]=bY(j,i)),h=p.cssHooks[c]||p.cssHooks[i];if(d===b)return h&&"get"in h&&(f=h.get(a,!1,e))!==b?f:j[c];g=typeof d,g==="string"&&(f=bR.exec(d))&&(d=(f[1]+1)*f[2]+parseFloat(p.css(a,c)),g="number");if(d==null||g==="number"&&isNaN(d))return;g==="number"&&!p.cssNumber[i]&&(d+="px");if(!h||!("set"in h)||(d=h.set(a,d,e))!==b)try{j[c]=d}catch(k){}},css:function(a,c,d,e){var f,g,h,i=p.camelCase(c);return c=p.cssProps[i]||(p.cssProps[i]=bY(a.style,i)),h=p.cssHooks[c]||p.cssHooks[i],h&&"get"in h&&(f=h.get(a,!0,e)),f===b&&(f=bH(a,c)),f==="normal"&&c in bU&&(f=bU[c]),d||e!==b?(g=parseFloat(f),d||p.isNumeric(g)?g||0:f):f},swap:function(a,b,c){var d,e,f={};for(e in b)f[e]=a.style[e],a.style[e]=b[e];d=c.call(a);for(e in b)a.style[e]=f[e];return d}}),a.getComputedStyle?bH=function(b,c){var d,e,f,g,h=a.getComputedStyle(b,null),i=b.style;return h&&(d=h[c],d===""&&!p.contains(b.ownerDocument,b)&&(d=p.style(b,c)),bQ.test(d)&&bO.test(c)&&(e=i.width,f=i.minWidth,g=i.maxWidth,i.minWidth=i.maxWidth=i.width=d,d=h.width,i.width=e,i.minWidth=f,i.maxWidth=g)),d}:e.documentElement.currentStyle&&(bH=function(a,b){var c,d,e=a.currentStyle&&a.currentStyle[b],f=a.style;return e==null&&f&&f[b]&&(e=f[b]),bQ.test(e)&&!bM.test(b)&&(c=f.left,d=a.runtimeStyle&&a.runtimeStyle.left,d&&(a.runtimeStyle.left=a.currentStyle.left),f.left=b==="fontSize"?"1em":e,e=f.pixelLeft+"px",f.left=c,d&&(a.runtimeStyle.left=d)),e===""?"auto":e}),p.each(["height","width"],function(a,b){p.cssHooks[b]={get:function(a,c,d){if(c)return a.offsetWidth===0&&bN.test(bH(a,"display"))?p.swap(a,bT,function(){return cb(a,b,d)}):cb(a,b,d)},set:function(a,c,d){return b_(a,c,d?ca(a,b,d,p.support.boxSizing&&p.css(a,"boxSizing")==="border-box"):0)}}}),p.support.opacity||(p.cssHooks.opacity={get:function(a,b){return bL.test((b&&a.currentStyle?a.currentStyle.filter:a.style.filter)||"")?.01*parseFloat(RegExp.$1)+"":b?"1":""},set:function(a,b){var c=a.style,d=a.currentStyle,e=p.isNumeric(b)?"alpha(opacity="+b*100+")":"",f=d&&d.filter||c.filter||"";c.zoom=1;if(b>=1&&p.trim(f.replace(bK,""))===""&&c.removeAttribute){c.removeAttribute("filter");if(d&&!d.filter)return}c.filter=bK.test(f)?f.replace(bK,e):f+" "+e}}),p(function(){p.support.reliableMarginRight||(p.cssHooks.marginRight={get:function(a,b){return p.swap(a,{display:"inline-block"},function(){if(b)return bH(a,"marginRight")})}}),!p.support.pixelPosition&&p.fn.position&&p.each(["top","left"],function(a,b){p.cssHooks[b]={get:function(a,c){if(c){var d=bH(a,b);return bQ.test(d)?p(a).position()[b]+"px":d}}}})}),p.expr&&p.expr.filters&&(p.expr.filters.hidden=function(a){return a.offsetWidth===0&&a.offsetHeight===0||!p.support.reliableHiddenOffsets&&(a.style&&a.style.display||bH(a,"display"))==="none"},p.expr.filters.visible=function(a){return!p.expr.filters.hidden(a)}),p.each({margin:"",padding:"",border:"Width"},function(a,b){p.cssHooks[a+b]={expand:function(c){var d,e=typeof c=="string"?c.split(" "):[c],f={};for(d=0;d<4;d++)f[a+bV[d]+b]=e[d]||e[d-2]||e[0];return f}},bO.test(a)||(p.cssHooks[a+b].set=b_)});var cd=/%20/g,ce=/\[\]$/,cf=/\r?\n/g,cg=/^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,ch=/^(?:select|textarea)/i;p.fn.extend({serialize:function(){return p.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?p.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||ch.test(this.nodeName)||cg.test(this.type))}).map(function(a,b){var c=p(this).val();return c==null?null:p.isArray(c)?p.map(c,function(a,c){return{name:b.name,value:a.replace(cf,"\r\n")}}):{name:b.name,value:c.replace(cf,"\r\n")}}).get()}}),p.param=function(a,c){var d,e=[],f=function(a,b){b=p.isFunction(b)?b():b==null?"":b,e[e.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};c===b&&(c=p.ajaxSettings&&p.ajaxSettings.traditional);if(p.isArray(a)||a.jquery&&!p.isPlainObject(a))p.each(a,function(){f(this.name,this.value)});else for(d in a)ci(d,a[d],c,f);return e.join("&").replace(cd,"+")};var cj,ck,cl=/#.*$/,cm=/^(.*?):[ \t]*([^\r\n]*)\r?$/mg,cn=/^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,co=/^(?:GET|HEAD)$/,cp=/^\/\//,cq=/\?/,cr=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,cs=/([?&])_=[^&]*/,ct=/^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,cu=p.fn.load,cv={},cw={},cx=["*/"]+["*"];try{cj=f.href}catch(cy){cj=e.createElement("a"),cj.href="",cj=cj.href}ck=ct.exec(cj.toLowerCase())||[],p.fn.load=function(a,c,d){if(typeof a!="string"&&cu)return cu.apply(this,arguments);if(!this.length)return this;var e,f,g,h=this,i=a.indexOf(" ");return i>=0&&(e=a.slice(i,a.length),a=a.slice(0,i)),p.isFunction(c)?(d=c,c=b):c&&typeof c=="object"&&(f="POST"),p.ajax({url:a,type:f,dataType:"html",data:c,complete:function(a,b){d&&h.each(d,g||[a.responseText,b,a])}}).done(function(a){g=arguments,h.html(e?p("<div>").append(a.replace(cr,"")).find(e):a)}),this},p.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),function(a,b){p.fn[b]=function(a){return this.on(b,a)}}),p.each(["get","post"],function(a,c){p[c]=function(a,d,e,f){return p.isFunction(d)&&(f=f||e,e=d,d=b),p.ajax({type:c,url:a,data:d,success:e,dataType:f})}}),p.extend({getScript:function(a,c){return p.get(a,b,c,"script")},getJSON:function(a,b,c){return p.get(a,b,c,"json")},ajaxSetup:function(a,b){return b?cB(a,p.ajaxSettings):(b=a,a=p.ajaxSettings),cB(a,b),a},ajaxSettings:{url:cj,isLocal:cn.test(ck[1]),global:!0,type:"GET",contentType:"application/x-www-form-urlencoded; charset=UTF-8",processData:!0,async:!0,accepts:{xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript","*":cx},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText"},converters:{"* text":a.String,"text html":!0,"text json":p.parseJSON,"text xml":p.parseXML},flatOptions:{context:!0,url:!0}},ajaxPrefilter:cz(cv),ajaxTransport:cz(cw),ajax:function(a,c){function y(a,c,f,i){var k,s,t,u,w,y=c;if(v===2)return;v=2,h&&clearTimeout(h),g=b,e=i||"",x.readyState=a>0?4:0,f&&(u=cC(l,x,f));if(a>=200&&a<300||a===304)l.ifModified&&(w=x.getResponseHeader("Last-Modified"),w&&(p.lastModified[d]=w),w=x.getResponseHeader("Etag"),w&&(p.etag[d]=w)),a===304?(y="notmodified",k=!0):(k=cD(l,u),y=k.state,s=k.data,t=k.error,k=!t);else{t=y;if(!y||a)y="error",a<0&&(a=0)}x.status=a,x.statusText=""+(c||y),k?o.resolveWith(m,[s,y,x]):o.rejectWith(m,[x,y,t]),x.statusCode(r),r=b,j&&n.trigger("ajax"+(k?"Success":"Error"),[x,l,k?s:t]),q.fireWith(m,[x,y]),j&&(n.trigger("ajaxComplete",[x,l]),--p.active||p.event.trigger("ajaxStop"))}typeof a=="object"&&(c=a,a=b),c=c||{};var d,e,f,g,h,i,j,k,l=p.ajaxSetup({},c),m=l.context||l,n=m!==l&&(m.nodeType||m instanceof p)?p(m):p.event,o=p.Deferred(),q=p.Callbacks("once memory"),r=l.statusCode||{},t={},u={},v=0,w="canceled",x={readyState:0,setRequestHeader:function(a,b){if(!v){var c=a.toLowerCase();a=u[c]=u[c]||a,t[a]=b}return this},getAllResponseHeaders:function(){return v===2?e:null},getResponseHeader:function(a){var c;if(v===2){if(!f){f={};while(c=cm.exec(e))f[c[1].toLowerCase()]=c[2]}c=f[a.toLowerCase()]}return c===b?null:c},overrideMimeType:function(a){return v||(l.mimeType=a),this},abort:function(a){return a=a||w,g&&g.abort(a),y(0,a),this}};o.promise(x),x.success=x.done,x.error=x.fail,x.complete=q.add,x.statusCode=function(a){if(a){var b;if(v<2)for(b in a)r[b]=[r[b],a[b]];else b=a[x.status],x.always(b)}return this},l.url=((a||l.url)+"").replace(cl,"").replace(cp,ck[1]+"//"),l.dataTypes=p.trim(l.dataType||"*").toLowerCase().split(s),l.crossDomain==null&&(i=ct.exec(l.url.toLowerCase()),l.crossDomain=!(!i||i[1]==ck[1]&&i[2]==ck[2]&&(i[3]||(i[1]==="http:"?80:443))==(ck[3]||(ck[1]==="http:"?80:443)))),l.data&&l.processData&&typeof l.data!="string"&&(l.data=p.param(l.data,l.traditional)),cA(cv,l,c,x);if(v===2)return x;j=l.global,l.type=l.type.toUpperCase(),l.hasContent=!co.test(l.type),j&&p.active++===0&&p.event.trigger("ajaxStart");if(!l.hasContent){l.data&&(l.url+=(cq.test(l.url)?"&":"?")+l.data,delete l.data),d=l.url;if(l.cache===!1){var z=p.now(),A=l.url.replace(cs,"$1_="+z);l.url=A+(A===l.url?(cq.test(l.url)?"&":"?")+"_="+z:"")}}(l.data&&l.hasContent&&l.contentType!==!1||c.contentType)&&x.setRequestHeader("Content-Type",l.contentType),l.ifModified&&(d=d||l.url,p.lastModified[d]&&x.setRequestHeader("If-Modified-Since",p.lastModified[d]),p.etag[d]&&x.setRequestHeader("If-None-Match",p.etag[d])),x.setRequestHeader("Accept",l.dataTypes[0]&&l.accepts[l.dataTypes[0]]?l.accepts[l.dataTypes[0]]+(l.dataTypes[0]!=="*"?", "+cx+"; q=0.01":""):l.accepts["*"]);for(k in l.headers)x.setRequestHeader(k,l.headers[k]);if(!l.beforeSend||l.beforeSend.call(m,x,l)!==!1&&v!==2){w="abort";for(k in{success:1,error:1,complete:1})x[k](l[k]);g=cA(cw,l,c,x);if(!g)y(-1,"No Transport");else{x.readyState=1,j&&n.trigger("ajaxSend",[x,l]),l.async&&l.timeout>0&&(h=setTimeout(function(){x.abort("timeout")},l.timeout));try{v=1,g.send(t,y)}catch(B){if(v<2)y(-1,B);else throw B}}return x}return x.abort()},active:0,lastModified:{},etag:{}});var cE=[],cF=/\?/,cG=/(=)\?(?=&|$)|\?\?/,cH=p.now();p.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=cE.pop()||p.expando+"_"+cH++;return this[a]=!0,a}}),p.ajaxPrefilter("json jsonp",function(c,d,e){var f,g,h,i=c.data,j=c.url,k=c.jsonp!==!1,l=k&&cG.test(j),m=k&&!l&&typeof i=="string"&&!(c.contentType||"").indexOf("application/x-www-form-urlencoded")&&cG.test(i);if(c.dataTypes[0]==="jsonp"||l||m)return f=c.jsonpCallback=p.isFunction(c.jsonpCallback)?c.jsonpCallback():c.jsonpCallback,g=a[f],l?c.url=j.replace(cG,"$1"+f):m?c.data=i.replace(cG,"$1"+f):k&&(c.url+=(cF.test(j)?"&":"?")+c.jsonp+"="+f),c.converters["script json"]=function(){return h||p.error(f+" was not called"),h[0]},c.dataTypes[0]="json",a[f]=function(){h=arguments},e.always(function(){a[f]=g,c[f]&&(c.jsonpCallback=d.jsonpCallback,cE.push(f)),h&&p.isFunction(g)&&g(h[0]),h=g=b}),"script"}),p.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/javascript|ecmascript/},converters:{"text script":function(a){return p.globalEval(a),a}}}),p.ajaxPrefilter("script",function(a){a.cache===b&&(a.cache=!1),a.crossDomain&&(a.type="GET",a.global=!1)}),p.ajaxTransport("script",function(a){if(a.crossDomain){var c,d=e.head||e.getElementsByTagName("head")[0]||e.documentElement;return{send:function(f,g){c=e.createElement("script"),c.async="async",a.scriptCharset&&(c.charset=a.scriptCharset),c.src=a.url,c.onload=c.onreadystatechange=function(a,e){if(e||!c.readyState||/loaded|complete/.test(c.readyState))c.onload=c.onreadystatechange=null,d&&c.parentNode&&d.removeChild(c),c=b,e||g(200,"success")},d.insertBefore(c,d.firstChild)},abort:function(){c&&c.onload(0,1)}}}});var cI,cJ=a.ActiveXObject?function(){for(var a in cI)cI[a](0,1)}:!1,cK=0;p.ajaxSettings.xhr=a.ActiveXObject?function(){return!this.isLocal&&cL()||cM()}:cL,function(a){p.extend(p.support,{ajax:!!a,cors:!!a&&"withCredentials"in a})}(p.ajaxSettings.xhr()),p.support.ajax&&p.ajaxTransport(function(c){if(!c.crossDomain||p.support.cors){var d;return{send:function(e,f){var g,h,i=c.xhr();c.username?i.open(c.type,c.url,c.async,c.username,c.password):i.open(c.type,c.url,c.async);if(c.xhrFields)for(h in c.xhrFields)i[h]=c.xhrFields[h];c.mimeType&&i.overrideMimeType&&i.overrideMimeType(c.mimeType),!c.crossDomain&&!e["X-Requested-With"]&&(e["X-Requested-With"]="XMLHttpRequest");try{for(h in e)i.setRequestHeader(h,e[h])}catch(j){}i.send(c.hasContent&&c.data||null),d=function(a,e){var h,j,k,l,m;try{if(d&&(e||i.readyState===4)){d=b,g&&(i.onreadystatechange=p.noop,cJ&&delete cI[g]);if(e)i.readyState!==4&&i.abort();else{h=i.status,k=i.getAllResponseHeaders(),l={},m=i.responseXML,m&&m.documentElement&&(l.xml=m);try{l.text=i.responseText}catch(a){}try{j=i.statusText}catch(n){j=""}!h&&c.isLocal&&!c.crossDomain?h=l.text?200:404:h===1223&&(h=204)}}}catch(o){e||f(-1,o)}l&&f(h,j,l,k)},c.async?i.readyState===4?setTimeout(d,0):(g=++cK,cJ&&(cI||(cI={},p(a).unload(cJ)),cI[g]=d),i.onreadystatechange=d):d()},abort:function(){d&&d(0,1)}}}});var cN,cO,cP=/^(?:toggle|show|hide)$/,cQ=new RegExp("^(?:([-+])=|)("+q+")([a-z%]*)$","i"),cR=/queueHooks$/,cS=[cY],cT={"*":[function(a,b){var c,d,e,f=this.createTween(a,b),g=cQ.exec(b),h=f.cur(),i=+h||0,j=1;if(g){c=+g[2],d=g[3]||(p.cssNumber[a]?"":"px");if(d!=="px"&&i){i=p.css(f.elem,a,!0)||c||1;do e=j=j||".5",i=i/j,p.style(f.elem,a,i+d),j=f.cur()/h;while(j!==1&&j!==e)}f.unit=d,f.start=i,f.end=g[1]?i+(g[1]+1)*c:c}return f}]};p.Animation=p.extend(cW,{tweener:function(a,b){p.isFunction(a)?(b=a,a=["*"]):a=a.split(" ");var c,d=0,e=a.length;for(;d<e;d++)c=a[d],cT[c]=cT[c]||[],cT[c].unshift(b)},prefilter:function(a,b){b?cS.unshift(a):cS.push(a)}}),p.Tween=cZ,cZ.prototype={constructor:cZ,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||"swing",this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(p.cssNumber[c]?"":"px")},cur:function(){var a=cZ.propHooks[this.prop];return a&&a.get?a.get(this):cZ.propHooks._default.get(this)},run:function(a){var b,c=cZ.propHooks[this.prop];return this.options.duration?this.pos=b=p.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):this.pos=b=a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):cZ.propHooks._default.set(this),this}},cZ.prototype.init.prototype=cZ.prototype,cZ.propHooks={_default:{get:function(a){var b;return a.elem[a.prop]==null||!!a.elem.style&&a.elem.style[a.prop]!=null?(b=p.css(a.elem,a.prop,!1,""),!b||b==="auto"?0:b):a.elem[a.prop]},set:function(a){p.fx.step[a.prop]?p.fx.step[a.prop](a):a.elem.style&&(a.elem.style[p.cssProps[a.prop]]!=null||p.cssHooks[a.prop])?p.style(a.elem,a.prop,a.now+a.unit):a.elem[a.prop]=a.now}}},cZ.propHooks.scrollTop=cZ.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},p.each(["toggle","show","hide"],function(a,b){var c=p.fn[b];p.fn[b]=function(d,e,f){return d==null||typeof d=="boolean"||!a&&p.isFunction(d)&&p.isFunction(e)?c.apply(this,arguments):this.animate(c$(b,!0),d,e,f)}}),p.fn.extend({fadeTo:function(a,b,c,d){return this.filter(bZ).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=p.isEmptyObject(a),f=p.speed(b,c,d),g=function(){var b=cW(this,p.extend({},a),f);e&&b.stop(!0)};return e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,c,d){var e=function(a){var b=a.stop;delete a.stop,b(d)};return typeof a!="string"&&(d=c,c=a,a=b),c&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,c=a!=null&&a+"queueHooks",f=p.timers,g=p._data(this);if(c)g[c]&&g[c].stop&&e(g[c]);else for(c in g)g[c]&&g[c].stop&&cR.test(c)&&e(g[c]);for(c=f.length;c--;)f[c].elem===this&&(a==null||f[c].queue===a)&&(f[c].anim.stop(d),b=!1,f.splice(c,1));(b||!d)&&p.dequeue(this,a)})}}),p.each({slideDown:c$("show"),slideUp:c$("hide"),slideToggle:c$("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){p.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),p.speed=function(a,b,c){var d=a&&typeof a=="object"?p.extend({},a):{complete:c||!c&&b||p.isFunction(a)&&a,duration:a,easing:c&&b||b&&!p.isFunction(b)&&b};d.duration=p.fx.off?0:typeof d.duration=="number"?d.duration:d.duration in p.fx.speeds?p.fx.speeds[d.duration]:p.fx.speeds._default;if(d.queue==null||d.queue===!0)d.queue="fx";return d.old=d.complete,d.complete=function(){p.isFunction(d.old)&&d.old.call(this),d.queue&&p.dequeue(this,d.queue)},d},p.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2}},p.timers=[],p.fx=cZ.prototype.init,p.fx.tick=function(){var a,b=p.timers,c=0;for(;c<b.length;c++)a=b[c],!a()&&b[c]===a&&b.splice(c--,1);b.length||p.fx.stop()},p.fx.timer=function(a){a()&&p.timers.push(a)&&!cO&&(cO=setInterval(p.fx.tick,p.fx.interval))},p.fx.interval=13,p.fx.stop=function(){clearInterval(cO),cO=null},p.fx.speeds={slow:600,fast:200,_default:400},p.fx.step={},p.expr&&p.expr.filters&&(p.expr.filters.animated=function(a){return p.grep(p.timers,function(b){return a===b.elem}).length});var c_=/^(?:body|html)$/i;p.fn.offset=function(a){if(arguments.length)return a===b?this:this.each(function(b){p.offset.setOffset(this,a,b)});var c,d,e,f,g,h,i,j,k,l,m=this[0],n=m&&m.ownerDocument;if(!n)return;return(e=n.body)===m?p.offset.bodyOffset(m):(d=n.documentElement,p.contains(d,m)?(c=m.getBoundingClientRect(),f=da(n),g=d.clientTop||e.clientTop||0,h=d.clientLeft||e.clientLeft||0,i=f.pageYOffset||d.scrollTop,j=f.pageXOffset||d.scrollLeft,k=c.top+i-g,l=c.left+j-h,{top:k,left:l}):{top:0,left:0})},p.offset={bodyOffset:function(a){var b=a.offsetTop,c=a.offsetLeft;return p.support.doesNotIncludeMarginInBodyOffset&&(b+=parseFloat(p.css(a,"marginTop"))||0,c+=parseFloat(p.css(a,"marginLeft"))||0),{top:b,left:c}},setOffset:function(a,b,c){var d=p.css(a,"position");d==="static"&&(a.style.position="relative");var e=p(a),f=e.offset(),g=p.css(a,"top"),h=p.css(a,"left"),i=(d==="absolute"||d==="fixed")&&p.inArray("auto",[g,h])>-1,j={},k={},l,m;i?(k=e.position(),l=k.top,m=k.left):(l=parseFloat(g)||0,m=parseFloat(h)||0),p.isFunction(b)&&(b=b.call(a,c,f)),b.top!=null&&(j.top=b.top-f.top+l),b.left!=null&&(j.left=b.left-f.left+m),"using"in b?b.using.call(a,j):e.css(j)}},p.fn.extend({position:function(){if(!this[0])return;var a=this[0],b=this.offsetParent(),c=this.offset(),d=c_.test(b[0].nodeName)?{top:0,left:0}:b.offset();return c.top-=parseFloat(p.css(a,"marginTop"))||0,c.left-=parseFloat(p.css(a,"marginLeft"))||0,d.top+=parseFloat(p.css(b[0],"borderTopWidth"))||0,d.left+=parseFloat(p.css(b[0],"borderLeftWidth"))||0,{top:c.top-d.top,left:c.left-d.left}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||e.body;while(a&&!c_.test(a.nodeName)&&p.css(a,"position")==="static")a=a.offsetParent;return a||e.body})}}),p.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(a,c){var d=/Y/.test(c);p.fn[a]=function(e){return p.access(this,function(a,e,f){var g=da(a);if(f===b)return g?c in g?g[c]:g.document.documentElement[e]:a[e];g?g.scrollTo(d?p(g).scrollLeft():f,d?f:p(g).scrollTop()):a[e]=f},a,e,arguments.length,null)}}),p.each({Height:"height",Width:"width"},function(a,c){p.each({padding:"inner"+a,content:c,"":"outer"+a},function(d,e){p.fn[e]=function(e,f){var g=arguments.length&&(d||typeof e!="boolean"),h=d||(e===!0||f===!0?"margin":"border");return p.access(this,function(c,d,e){var f;return p.isWindow(c)?c.document.documentElement["client"+a]:c.nodeType===9?(f=c.documentElement,Math.max(c.body["scroll"+a],f["scroll"+a],c.body["offset"+a],f["offset"+a],f["client"+a])):e===b?p.css(c,d,e,h):p.style(c,d,e,h)},c,g?e:b,g,null)}})}),a.jQuery=a.$=p,typeof define=="function"&&define.amd&&define.amd.jQuery&&define("jquery",[],function(){return p})})(window);
/*!
 * jQuery UI 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI
 *//*
 * jQuery UI 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI
 */
jQuery.ui||(function(a){a.ui={version:"1.8",plugin:{add:function(c,d,f){var e=a.ui[c].prototype;for(var b in f){e.plugins[b]=e.plugins[b]||[];e.plugins[b].push([d,f[b]])}},call:function(b,d,c){var f=b.plugins[d];if(!f||!b.element[0].parentNode){return}for(var e=0;e<f.length;e++){if(b.options[f[e][0]]){f[e][1].apply(b.element,c)}}}},contains:function(d,c){return document.compareDocumentPosition?d.compareDocumentPosition(c)&16:d!==c&&d.contains(c)},hasScroll:function(e,c){if(a(e).css("overflow")=="hidden"){return false}var b=(c&&c=="left")?"scrollLeft":"scrollTop",d=false;if(e[b]>0){return true}e[b]=1;d=(e[b]>0);e[b]=0;return d},isOverAxis:function(c,b,d){return(c>b)&&(c<(b+d))},isOver:function(g,c,f,e,b,d){return a.ui.isOverAxis(g,f,b)&&a.ui.isOverAxis(c,e,d)},keyCode:{BACKSPACE:8,CAPS_LOCK:20,COMMA:188,CONTROL:17,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,INSERT:45,LEFT:37,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SHIFT:16,SPACE:32,TAB:9,UP:38}};a.fn.extend({_focus:a.fn.focus,focus:function(b,c){return typeof b==="number"?this.each(function(){var d=this;setTimeout(function(){a(d).focus();(c&&c.call(d))},b)}):this._focus.apply(this,arguments)},enableSelection:function(){return this.attr("unselectable","off").css("MozUserSelect","").unbind("selectstart.ui")},disableSelection:function(){return this.attr("unselectable","on").css("MozUserSelect","none").bind("selectstart.ui",function(){return false})},scrollParent:function(){var b;if((a.browser.msie&&(/(static|relative)/).test(this.css("position")))||(/absolute/).test(this.css("position"))){b=this.parents().filter(function(){return(/(relative|absolute|fixed)/).test(a.curCSS(this,"position",1))&&(/(auto|scroll)/).test(a.curCSS(this,"overflow",1)+a.curCSS(this,"overflow-y",1)+a.curCSS(this,"overflow-x",1))}).eq(0)}else{b=this.parents().filter(function(){return(/(auto|scroll)/).test(a.curCSS(this,"overflow",1)+a.curCSS(this,"overflow-y",1)+a.curCSS(this,"overflow-x",1))}).eq(0)}return(/fixed/).test(this.css("position"))||!b.length?a(document):b},zIndex:function(e){if(e!==undefined){return this.css("zIndex",e)}if(this.length){var c=a(this[0]),b,d;while(c.length&&c[0]!==document){b=c.css("position");if(b=="absolute"||b=="relative"||b=="fixed"){d=parseInt(c.css("zIndex"));if(!isNaN(d)&&d!=0){return d}}c=c.parent()}}return 0}});a.extend(a.expr[":"],{data:function(d,c,b){return !!a.data(d,b[3])},focusable:function(c){var d=c.nodeName.toLowerCase(),b=a.attr(c,"tabindex");return(/input|select|textarea|button|object/.test(d)?!c.disabled:"a"==d||"area"==d?c.href||!isNaN(b):!isNaN(b))&&!a(c)["area"==d?"parents":"closest"](":hidden").length},tabbable:function(c){var b=a.attr(c,"tabindex");return(isNaN(b)||b>=0)&&a(c).is(":focusable")}})})(jQuery);;/*!
 * jQuery UI Widget 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Widget
 *//*
 * jQuery UI Widget 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Widget
 */
(function(b){var a=b.fn.remove;b.fn.remove=function(c,d){return this.each(function(){if(!d){if(!c||b.filter(c,[this]).length){b("*",this).add(this).each(function(){b(this).triggerHandler("remove")})}}return a.call(b(this),c,d)})};b.widget=function(d,f,c){var e=d.split(".")[0],h;d=d.split(".")[1];h=e+"-"+d;if(!c){c=f;f=b.Widget}b.expr[":"][h]=function(i){return !!b.data(i,d)};b[e]=b[e]||{};b[e][d]=function(i,j){if(arguments.length){this._createWidget(i,j)}};var g=new f();g.options=b.extend({},g.options);b[e][d].prototype=b.extend(true,g,{namespace:e,widgetName:d,widgetEventPrefix:b[e][d].prototype.widgetEventPrefix||d,widgetBaseClass:h},c);b.widget.bridge(d,b[e][d])};b.widget.bridge=function(d,c){b.fn[d]=function(g){var e=typeof g==="string",f=Array.prototype.slice.call(arguments,1),h=this;g=!e&&f.length?b.extend.apply(null,[true,g].concat(f)):g;if(e&&g.substring(0,1)==="_"){return h}if(e){this.each(function(){var i=b.data(this,d),j=i&&b.isFunction(i[g])?i[g].apply(i,f):i;if(j!==i&&j!==undefined){h=j;return false}})}else{this.each(function(){var i=b.data(this,d);if(i){if(g){i.option(g)}i._init()}else{b.data(this,d,new c(g,this))}})}return h}};b.Widget=function(c,d){if(arguments.length){this._createWidget(c,d)}};b.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",options:{disabled:false},_createWidget:function(d,e){this.element=b(e).data(this.widgetName,this);this.options=b.extend(true,{},this.options,b.metadata&&b.metadata.get(e)[this.widgetName],d);var c=this;this.element.bind("remove."+this.widgetName,function(){c.destroy()});this._create();this._init()},_create:function(){},_init:function(){},destroy:function(){this.element.unbind("."+this.widgetName).removeData(this.widgetName);this.widget().unbind("."+this.widgetName).removeAttr("aria-disabled").removeClass(this.widgetBaseClass+"-disabled "+this.namespace+"-state-disabled")},widget:function(){return this.element},option:function(e,f){var d=e,c=this;if(arguments.length===0){return b.extend({},c.options)}if(typeof e==="string"){if(f===undefined){return this.options[e]}d={};d[e]=f}b.each(d,function(g,h){c._setOption(g,h)});return c},_setOption:function(c,d){this.options[c]=d;if(c==="disabled"){this.widget()[d?"addClass":"removeClass"](this.widgetBaseClass+"-disabled "+this.namespace+"-state-disabled").attr("aria-disabled",d)}return this},enable:function(){return this._setOption("disabled",false)},disable:function(){return this._setOption("disabled",true)},_trigger:function(d,e,f){var h=this.options[d];e=b.Event(e);e.type=(d===this.widgetEventPrefix?d:this.widgetEventPrefix+d).toLowerCase();f=f||{};if(e.originalEvent){for(var c=b.event.props.length,g;c;){g=b.event.props[--c];e[g]=e.originalEvent[g]}}this.element.trigger(e,f);return !(b.isFunction(h)&&h.call(this.element[0],e,f)===false||e.isDefaultPrevented())}}})(jQuery);;/*!
 * jQuery UI Mouse 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Mouse
 *
 * Depends:
 *	jquery.ui.widget.js
 *//*
 * jQuery UI Mouse 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Mouse
 *
 * Depends:
 *	jquery.ui.widget.js
 */
(function(a){a.widget("ui.mouse",{options:{cancel:":input,option",distance:1,delay:0},_mouseInit:function(){var b=this;this.element.bind("mousedown."+this.widgetName,function(c){return b._mouseDown(c)}).bind("click."+this.widgetName,function(c){if(b._preventClickEvent){b._preventClickEvent=false;c.stopImmediatePropagation();return false}});this.started=false},_mouseDestroy:function(){this.element.unbind("."+this.widgetName)},_mouseDown:function(d){d.originalEvent=d.originalEvent||{};if(d.originalEvent.mouseHandled){return}(this._mouseStarted&&this._mouseUp(d));this._mouseDownEvent=d;var c=this,e=(d.which==1),b=(typeof this.options.cancel=="string"?a(d.target).parents().add(d.target).filter(this.options.cancel).length:false);if(!e||b||!this._mouseCapture(d)){return true}this.mouseDelayMet=!this.options.delay;if(!this.mouseDelayMet){this._mouseDelayTimer=setTimeout(function(){c.mouseDelayMet=true},this.options.delay)}if(this._mouseDistanceMet(d)&&this._mouseDelayMet(d)){this._mouseStarted=(this._mouseStart(d)!==false);if(!this._mouseStarted){d.preventDefault();return true}}this._mouseMoveDelegate=function(f){return c._mouseMove(f)};this._mouseUpDelegate=function(f){return c._mouseUp(f)};a(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate);(a.browser.safari||d.preventDefault());d.originalEvent.mouseHandled=true;return true},_mouseMove:function(b){if(a.browser.msie&&!b.button){return this._mouseUp(b)}if(this._mouseStarted){this._mouseDrag(b);return b.preventDefault()}if(this._mouseDistanceMet(b)&&this._mouseDelayMet(b)){this._mouseStarted=(this._mouseStart(this._mouseDownEvent,b)!==false);(this._mouseStarted?this._mouseDrag(b):this._mouseUp(b))}return !this._mouseStarted},_mouseUp:function(b){a(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate);if(this._mouseStarted){this._mouseStarted=false;this._preventClickEvent=(b.target==this._mouseDownEvent.target);this._mouseStop(b)}return false},_mouseDistanceMet:function(b){return(Math.max(Math.abs(this._mouseDownEvent.pageX-b.pageX),Math.abs(this._mouseDownEvent.pageY-b.pageY))>=this.options.distance)},_mouseDelayMet:function(b){return this.mouseDelayMet},_mouseStart:function(b){},_mouseDrag:function(b){},_mouseStop:function(b){},_mouseCapture:function(b){return true}})})(jQuery);;/*
 * jQuery UI Position 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Position
 */(function(f){f.ui=f.ui||{};var c=/left|center|right/,e="center",d=/top|center|bottom/,g="center",a=f.fn.position,b=f.fn.offset;f.fn.position=function(i){if(!i||!i.of){return a.apply(this,arguments)}i=f.extend({},i);var l=f(i.of),n=(i.collision||"flip").split(" "),m=i.offset?i.offset.split(" "):[0,0],k,h,j;if(i.of.nodeType===9){k=l.width();h=l.height();j={top:0,left:0}}else{if(i.of.scrollTo&&i.of.document){k=l.width();h=l.height();j={top:l.scrollTop(),left:l.scrollLeft()}}else{if(i.of.preventDefault){i.at="left top";k=h=0;j={top:i.of.pageY,left:i.of.pageX}}else{k=l.outerWidth();h=l.outerHeight();j=l.offset()}}}f.each(["my","at"],function(){var o=(i[this]||"").split(" ");if(o.length===1){o=c.test(o[0])?o.concat([g]):d.test(o[0])?[e].concat(o):[e,g]}o[0]=c.test(o[0])?o[0]:e;o[1]=d.test(o[1])?o[1]:g;i[this]=o});if(n.length===1){n[1]=n[0]}m[0]=parseInt(m[0],10)||0;if(m.length===1){m[1]=m[0]}m[1]=parseInt(m[1],10)||0;if(i.at[0]==="right"){j.left+=k}else{if(i.at[0]===e){j.left+=k/2}}if(i.at[1]==="bottom"){j.top+=h}else{if(i.at[1]===g){j.top+=h/2}}j.left+=m[0];j.top+=m[1];return this.each(function(){var r=f(this),q=r.outerWidth(),p=r.outerHeight(),o=f.extend({},j);if(i.my[0]==="right"){o.left-=q}else{if(i.my[0]===e){o.left-=q/2}}if(i.my[1]==="bottom"){o.top-=p}else{if(i.my[1]===g){o.top-=p/2}}f.each(["left","top"],function(t,s){if(f.ui.position[n[t]]){f.ui.position[n[t]][s](o,{targetWidth:k,targetHeight:h,elemWidth:q,elemHeight:p,offset:m,my:i.my,at:i.at})}});if(f.fn.bgiframe){r.bgiframe()}r.offset(f.extend(o,{using:i.using}))})};f.ui.position={fit:{left:function(h,i){var k=f(window),j=h.left+i.elemWidth-k.width()-k.scrollLeft();h.left=j>0?h.left-j:Math.max(0,h.left)},top:function(h,i){var k=f(window),j=h.top+i.elemHeight-k.height()-k.scrollTop();h.top=j>0?h.top-j:Math.max(0,h.top)}},flip:{left:function(i,j){if(j.at[0]==="center"){return}var l=f(window),k=i.left+j.elemWidth-l.width()-l.scrollLeft(),h=j.my[0]==="left"?-j.elemWidth:j.my[0]==="right"?j.elemWidth:0,m=-2*j.offset[0];i.left+=i.left<0?h+j.targetWidth+m:k>0?h-j.targetWidth+m:0},top:function(i,k){if(k.at[1]==="center"){return}var m=f(window),l=i.top+k.elemHeight-m.height()-m.scrollTop(),h=k.my[1]==="top"?-k.elemHeight:k.my[1]==="bottom"?k.elemHeight:0,j=k.at[1]==="top"?k.targetHeight:-k.targetHeight,n=-2*k.offset[1];i.top+=i.top<0?h+k.targetHeight+n:l>0?h+j+n:0}}};if(!f.offset.setOffset){f.offset.setOffset=function(l,i){if(/static/.test(f.curCSS(l,"position"))){l.style.position="relative"}var k=f(l),n=k.offset(),h=parseInt(f.curCSS(l,"top",true),10)||0,m=parseInt(f.curCSS(l,"left",true),10)||0,j={top:(i.top-n.top)+h,left:(i.left-n.left)+m};if("using" in i){i.using.call(l,j)}else{k.css(j)}};f.fn.offset=function(h){var i=this[0];if(!i||!i.ownerDocument){return null}if(h){return this.each(function(){f.offset.setOffset(this,h)})}return b.call(this)}}}(jQuery));;/*
 * jQuery UI Draggable 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Draggables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */(function(a){a.widget("ui.draggable",a.ui.mouse,{widgetEventPrefix:"drag",options:{addClasses:true,appendTo:"parent",axis:false,connectToSortable:false,containment:false,cursor:"auto",cursorAt:false,grid:false,handle:false,helper:"original",iframeFix:false,opacity:false,refreshPositions:false,revert:false,revertDuration:500,scope:"default",scroll:true,scrollSensitivity:20,scrollSpeed:20,snap:false,snapMode:"both",snapTolerance:20,stack:false,zIndex:false},_create:function(){if(this.options.helper=="original"&&!(/^(?:r|a|f)/).test(this.element.css("position"))){this.element[0].style.position="relative"}(this.options.addClasses&&this.element.addClass("ui-draggable"));(this.options.disabled&&this.element.addClass("ui-draggable-disabled"));this._mouseInit()},destroy:function(){if(!this.element.data("draggable")){return}this.element.removeData("draggable").unbind(".draggable").removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled");this._mouseDestroy();return this},_mouseCapture:function(b){var c=this.options;if(this.helper||c.disabled||a(b.target).is(".ui-resizable-handle")){return false}this.handle=this._getHandle(b);if(!this.handle){return false}return true},_mouseStart:function(b){var c=this.options;this.helper=this._createHelper(b);this._cacheHelperProportions();if(a.ui.ddmanager){a.ui.ddmanager.current=this}this._cacheMargins();this.cssPosition=this.helper.css("position");this.scrollParent=this.helper.scrollParent();this.offset=this.positionAbs=this.element.offset();this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left};a.extend(this.offset,{click:{left:b.pageX-this.offset.left,top:b.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()});this.originalPosition=this.position=this._generatePosition(b);this.originalPageX=b.pageX;this.originalPageY=b.pageY;(c.cursorAt&&this._adjustOffsetFromHelper(c.cursorAt));if(c.containment){this._setContainment()}if(this._trigger("start",b)===false){this._clear();return false}this._cacheHelperProportions();if(a.ui.ddmanager&&!c.dropBehaviour){a.ui.ddmanager.prepareOffsets(this,b)}this.helper.addClass("ui-draggable-dragging");this._mouseDrag(b,true);return true},_mouseDrag:function(b,d){this.position=this._generatePosition(b);this.positionAbs=this._convertPositionTo("absolute");if(!d){var c=this._uiHash();if(this._trigger("drag",b,c)===false){this._mouseUp({});return false}this.position=c.position}if(!this.options.axis||this.options.axis!="y"){this.helper[0].style.left=this.position.left+"px"}if(!this.options.axis||this.options.axis!="x"){this.helper[0].style.top=this.position.top+"px"}if(a.ui.ddmanager){a.ui.ddmanager.drag(this,b)}return false},_mouseStop:function(c){var d=false;if(a.ui.ddmanager&&!this.options.dropBehaviour){d=a.ui.ddmanager.drop(this,c)}if(this.dropped){d=this.dropped;this.dropped=false}if(!this.element[0]||!this.element[0].parentNode){return false}if((this.options.revert=="invalid"&&!d)||(this.options.revert=="valid"&&d)||this.options.revert===true||(a.isFunction(this.options.revert)&&this.options.revert.call(this.element,d))){var b=this;a(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,10),function(){if(b._trigger("stop",c)!==false){b._clear()}})}else{if(this._trigger("stop",c)!==false){this._clear()}}return false},cancel:function(){if(this.helper.is(".ui-draggable-dragging")){this._mouseUp({})}else{this._clear()}return this},_getHandle:function(b){var c=!this.options.handle||!a(this.options.handle,this.element).length?true:false;a(this.options.handle,this.element).find("*").andSelf().each(function(){if(this==b.target){c=true}});return c},_createHelper:function(c){var d=this.options;var b=a.isFunction(d.helper)?a(d.helper.apply(this.element[0],[c])):(d.helper=="clone"?this.element.clone():this.element);if(!b.parents("body").length){b.appendTo((d.appendTo=="parent"?this.element[0].parentNode:d.appendTo))}if(b[0]!=this.element[0]&&!(/(fixed|absolute)/).test(b.css("position"))){b.css("position","absolute")}return b},_adjustOffsetFromHelper:function(b){if(typeof b=="string"){b=b.split(" ")}if(a.isArray(b)){b={left:+b[0],top:+b[1]||0}}if("left" in b){this.offset.click.left=b.left+this.margins.left}if("right" in b){this.offset.click.left=this.helperProportions.width-b.right+this.margins.left}if("top" in b){this.offset.click.top=b.top+this.margins.top}if("bottom" in b){this.offset.click.top=this.helperProportions.height-b.bottom+this.margins.top}},_getParentOffset:function(){this.offsetParent=this.helper.offsetParent();var b=this.offsetParent.offset();if(this.cssPosition=="absolute"&&this.scrollParent[0]!=document&&a.ui.contains(this.scrollParent[0],this.offsetParent[0])){b.left+=this.scrollParent.scrollLeft();b.top+=this.scrollParent.scrollTop()}if((this.offsetParent[0]==document.body)||(this.offsetParent[0].tagName&&this.offsetParent[0].tagName.toLowerCase()=="html"&&a.browser.msie)){b={top:0,left:0}}return{top:b.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:b.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if(this.cssPosition=="relative"){var b=this.element.position();return{top:b.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:b.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}else{return{top:0,left:0}}},_cacheMargins:function(){this.margins={left:(parseInt(this.element.css("marginLeft"),10)||0),top:(parseInt(this.element.css("marginTop"),10)||0)}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var e=this.options;if(e.containment=="parent"){e.containment=this.helper[0].parentNode}if(e.containment=="document"||e.containment=="window"){this.containment=[0-this.offset.relative.left-this.offset.parent.left,0-this.offset.relative.top-this.offset.parent.top,a(e.containment=="document"?document:window).width()-this.helperProportions.width-this.margins.left,(a(e.containment=="document"?document:window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top]}if(!(/^(document|window|parent)$/).test(e.containment)&&e.containment.constructor!=Array){var c=a(e.containment)[0];if(!c){return}var d=a(e.containment).offset();var b=(a(c).css("overflow")!="hidden");this.containment=[d.left+(parseInt(a(c).css("borderLeftWidth"),10)||0)+(parseInt(a(c).css("paddingLeft"),10)||0)-this.margins.left,d.top+(parseInt(a(c).css("borderTopWidth"),10)||0)+(parseInt(a(c).css("paddingTop"),10)||0)-this.margins.top,d.left+(b?Math.max(c.scrollWidth,c.offsetWidth):c.offsetWidth)-(parseInt(a(c).css("borderLeftWidth"),10)||0)-(parseInt(a(c).css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left,d.top+(b?Math.max(c.scrollHeight,c.offsetHeight):c.offsetHeight)-(parseInt(a(c).css("borderTopWidth"),10)||0)-(parseInt(a(c).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top]}else{if(e.containment.constructor==Array){this.containment=e.containment}}},_convertPositionTo:function(f,h){if(!h){h=this.position}var c=f=="absolute"?1:-1;var e=this.options,b=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&a.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,g=(/(html|body)/i).test(b[0].tagName);return{top:(h.top+this.offset.relative.top*c+this.offset.parent.top*c-(a.browser.safari&&a.browser.version<526&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():(g?0:b.scrollTop()))*c)),left:(h.left+this.offset.relative.left*c+this.offset.parent.left*c-(a.browser.safari&&a.browser.version<526&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():g?0:b.scrollLeft())*c))}},_generatePosition:function(e){var h=this.options,b=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&a.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,i=(/(html|body)/i).test(b[0].tagName);var d=e.pageX;var c=e.pageY;if(this.originalPosition){if(this.containment){if(e.pageX-this.offset.click.left<this.containment[0]){d=this.containment[0]+this.offset.click.left}if(e.pageY-this.offset.click.top<this.containment[1]){c=this.containment[1]+this.offset.click.top}if(e.pageX-this.offset.click.left>this.containment[2]){d=this.containment[2]+this.offset.click.left}if(e.pageY-this.offset.click.top>this.containment[3]){c=this.containment[3]+this.offset.click.top}}if(h.grid){var g=this.originalPageY+Math.round((c-this.originalPageY)/h.grid[1])*h.grid[1];c=this.containment?(!(g-this.offset.click.top<this.containment[1]||g-this.offset.click.top>this.containment[3])?g:(!(g-this.offset.click.top<this.containment[1])?g-h.grid[1]:g+h.grid[1])):g;var f=this.originalPageX+Math.round((d-this.originalPageX)/h.grid[0])*h.grid[0];d=this.containment?(!(f-this.offset.click.left<this.containment[0]||f-this.offset.click.left>this.containment[2])?f:(!(f-this.offset.click.left<this.containment[0])?f-h.grid[0]:f+h.grid[0])):f}}return{top:(c-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+(a.browser.safari&&a.browser.version<526&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():(i?0:b.scrollTop())))),left:(d-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+(a.browser.safari&&a.browser.version<526&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():i?0:b.scrollLeft())))}},_clear:function(){this.helper.removeClass("ui-draggable-dragging");if(this.helper[0]!=this.element[0]&&!this.cancelHelperRemoval){this.helper.remove()}this.helper=null;this.cancelHelperRemoval=false},_trigger:function(b,c,d){d=d||this._uiHash();a.ui.plugin.call(this,b,[c,d]);if(b=="drag"){this.positionAbs=this._convertPositionTo("absolute")}return a.Widget.prototype._trigger.call(this,b,c,d)},plugins:{},_uiHash:function(b){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,offset:this.positionAbs}}});a.extend(a.ui.draggable,{version:"1.8"});a.ui.plugin.add("draggable","connectToSortable",{start:function(c,e){var d=a(this).data("draggable"),f=d.options,b=a.extend({},e,{item:d.element});d.sortables=[];a(f.connectToSortable).each(function(){var g=a.data(this,"sortable");if(g&&!g.options.disabled){d.sortables.push({instance:g,shouldRevert:g.options.revert});g._refreshItems();g._trigger("activate",c,b)}})},stop:function(c,e){var d=a(this).data("draggable"),b=a.extend({},e,{item:d.element});a.each(d.sortables,function(){if(this.instance.isOver){this.instance.isOver=0;d.cancelHelperRemoval=true;this.instance.cancelHelperRemoval=false;if(this.shouldRevert){this.instance.options.revert=true}this.instance._mouseStop(c);this.instance.options.helper=this.instance.options._helper;if(d.options.helper=="original"){this.instance.currentItem.css({top:"auto",left:"auto"})}}else{this.instance.cancelHelperRemoval=false;this.instance._trigger("deactivate",c,b)}})},drag:function(c,f){var e=a(this).data("draggable"),b=this;var d=function(i){var n=this.offset.click.top,m=this.offset.click.left;var g=this.positionAbs.top,k=this.positionAbs.left;var j=i.height,l=i.width;var p=i.top,h=i.left;return a.ui.isOver(g+n,k+m,p,h,j,l)};a.each(e.sortables,function(g){this.instance.positionAbs=e.positionAbs;this.instance.helperProportions=e.helperProportions;this.instance.offset.click=e.offset.click;if(this.instance._intersectsWith(this.instance.containerCache)){if(!this.instance.isOver){this.instance.isOver=1;this.instance.currentItem=a(b).clone().appendTo(this.instance.element).data("sortable-item",true);this.instance.options._helper=this.instance.options.helper;this.instance.options.helper=function(){return f.helper[0]};c.target=this.instance.currentItem[0];this.instance._mouseCapture(c,true);this.instance._mouseStart(c,true,true);this.instance.offset.click.top=e.offset.click.top;this.instance.offset.click.left=e.offset.click.left;this.instance.offset.parent.left-=e.offset.parent.left-this.instance.offset.parent.left;this.instance.offset.parent.top-=e.offset.parent.top-this.instance.offset.parent.top;e._trigger("toSortable",c);e.dropped=this.instance.element;e.currentItem=e.element;this.instance.fromOutside=e}if(this.instance.currentItem){this.instance._mouseDrag(c)}}else{if(this.instance.isOver){this.instance.isOver=0;this.instance.cancelHelperRemoval=true;this.instance.options.revert=false;this.instance._trigger("out",c,this.instance._uiHash(this.instance));this.instance._mouseStop(c,true);this.instance.options.helper=this.instance.options._helper;this.instance.currentItem.remove();if(this.instance.placeholder){this.instance.placeholder.remove()}e._trigger("fromSortable",c);e.dropped=false}}})}});a.ui.plugin.add("draggable","cursor",{start:function(c,d){var b=a("body"),e=a(this).data("draggable").options;if(b.css("cursor")){e._cursor=b.css("cursor")}b.css("cursor",e.cursor)},stop:function(b,c){var d=a(this).data("draggable").options;if(d._cursor){a("body").css("cursor",d._cursor)}}});a.ui.plugin.add("draggable","iframeFix",{start:function(b,c){var d=a(this).data("draggable").options;a(d.iframeFix===true?"iframe":d.iframeFix).each(function(){a('<div class="ui-draggable-iframeFix" style="background: #fff;"></div>').css({width:this.offsetWidth+"px",height:this.offsetHeight+"px",position:"absolute",opacity:"0.001",zIndex:1000}).css(a(this).offset()).appendTo("body")})},stop:function(b,c){a("div.ui-draggable-iframeFix").each(function(){this.parentNode.removeChild(this)})}});a.ui.plugin.add("draggable","opacity",{start:function(c,d){var b=a(d.helper),e=a(this).data("draggable").options;if(b.css("opacity")){e._opacity=b.css("opacity")}b.css("opacity",e.opacity)},stop:function(b,c){var d=a(this).data("draggable").options;if(d._opacity){a(c.helper).css("opacity",d._opacity)}}});a.ui.plugin.add("draggable","scroll",{start:function(c,d){var b=a(this).data("draggable");if(b.scrollParent[0]!=document&&b.scrollParent[0].tagName!="HTML"){b.overflowOffset=b.scrollParent.offset()}},drag:function(d,e){var c=a(this).data("draggable"),f=c.options,b=false;if(c.scrollParent[0]!=document&&c.scrollParent[0].tagName!="HTML"){if(!f.axis||f.axis!="x"){if((c.overflowOffset.top+c.scrollParent[0].offsetHeight)-d.pageY<f.scrollSensitivity){c.scrollParent[0].scrollTop=b=c.scrollParent[0].scrollTop+f.scrollSpeed}else{if(d.pageY-c.overflowOffset.top<f.scrollSensitivity){c.scrollParent[0].scrollTop=b=c.scrollParent[0].scrollTop-f.scrollSpeed}}}if(!f.axis||f.axis!="y"){if((c.overflowOffset.left+c.scrollParent[0].offsetWidth)-d.pageX<f.scrollSensitivity){c.scrollParent[0].scrollLeft=b=c.scrollParent[0].scrollLeft+f.scrollSpeed}else{if(d.pageX-c.overflowOffset.left<f.scrollSensitivity){c.scrollParent[0].scrollLeft=b=c.scrollParent[0].scrollLeft-f.scrollSpeed}}}}else{if(!f.axis||f.axis!="x"){if(d.pageY-a(document).scrollTop()<f.scrollSensitivity){b=a(document).scrollTop(a(document).scrollTop()-f.scrollSpeed)}else{if(a(window).height()-(d.pageY-a(document).scrollTop())<f.scrollSensitivity){b=a(document).scrollTop(a(document).scrollTop()+f.scrollSpeed)}}}if(!f.axis||f.axis!="y"){if(d.pageX-a(document).scrollLeft()<f.scrollSensitivity){b=a(document).scrollLeft(a(document).scrollLeft()-f.scrollSpeed)}else{if(a(window).width()-(d.pageX-a(document).scrollLeft())<f.scrollSensitivity){b=a(document).scrollLeft(a(document).scrollLeft()+f.scrollSpeed)}}}}if(b!==false&&a.ui.ddmanager&&!f.dropBehaviour){a.ui.ddmanager.prepareOffsets(c,d)}}});a.ui.plugin.add("draggable","snap",{start:function(c,d){var b=a(this).data("draggable"),e=b.options;b.snapElements=[];a(e.snap.constructor!=String?(e.snap.items||":data(draggable)"):e.snap).each(function(){var g=a(this);var f=g.offset();if(this!=b.element[0]){b.snapElements.push({item:this,width:g.outerWidth(),height:g.outerHeight(),top:f.top,left:f.left})}})},drag:function(u,p){var g=a(this).data("draggable"),q=g.options;var y=q.snapTolerance;var x=p.offset.left,w=x+g.helperProportions.width,f=p.offset.top,e=f+g.helperProportions.height;for(var v=g.snapElements.length-1;v>=0;v--){var s=g.snapElements[v].left,n=s+g.snapElements[v].width,m=g.snapElements[v].top,A=m+g.snapElements[v].height;if(!((s-y<x&&x<n+y&&m-y<f&&f<A+y)||(s-y<x&&x<n+y&&m-y<e&&e<A+y)||(s-y<w&&w<n+y&&m-y<f&&f<A+y)||(s-y<w&&w<n+y&&m-y<e&&e<A+y))){if(g.snapElements[v].snapping){(g.options.snap.release&&g.options.snap.release.call(g.element,u,a.extend(g._uiHash(),{snapItem:g.snapElements[v].item})))}g.snapElements[v].snapping=false;continue}if(q.snapMode!="inner"){var c=Math.abs(m-e)<=y;var z=Math.abs(A-f)<=y;var j=Math.abs(s-w)<=y;var k=Math.abs(n-x)<=y;if(c){p.position.top=g._convertPositionTo("relative",{top:m-g.helperProportions.height,left:0}).top-g.margins.top}if(z){p.position.top=g._convertPositionTo("relative",{top:A,left:0}).top-g.margins.top}if(j){p.position.left=g._convertPositionTo("relative",{top:0,left:s-g.helperProportions.width}).left-g.margins.left}if(k){p.position.left=g._convertPositionTo("relative",{top:0,left:n}).left-g.margins.left}}var h=(c||z||j||k);if(q.snapMode!="outer"){var c=Math.abs(m-f)<=y;var z=Math.abs(A-e)<=y;var j=Math.abs(s-x)<=y;var k=Math.abs(n-w)<=y;if(c){p.position.top=g._convertPositionTo("relative",{top:m,left:0}).top-g.margins.top}if(z){p.position.top=g._convertPositionTo("relative",{top:A-g.helperProportions.height,left:0}).top-g.margins.top}if(j){p.position.left=g._convertPositionTo("relative",{top:0,left:s}).left-g.margins.left}if(k){p.position.left=g._convertPositionTo("relative",{top:0,left:n-g.helperProportions.width}).left-g.margins.left}}if(!g.snapElements[v].snapping&&(c||z||j||k||h)){(g.options.snap.snap&&g.options.snap.snap.call(g.element,u,a.extend(g._uiHash(),{snapItem:g.snapElements[v].item})))}g.snapElements[v].snapping=(c||z||j||k||h)}}});a.ui.plugin.add("draggable","stack",{start:function(c,d){var f=a(this).data("draggable").options;var e=a.makeArray(a(f.stack)).sort(function(h,g){return(parseInt(a(h).css("zIndex"),10)||0)-(parseInt(a(g).css("zIndex"),10)||0)});if(!e.length){return}var b=parseInt(e[0].style.zIndex)||0;a(e).each(function(g){this.style.zIndex=b+g});this[0].style.zIndex=b+e.length}});a.ui.plugin.add("draggable","zIndex",{start:function(c,d){var b=a(d.helper),e=a(this).data("draggable").options;if(b.css("zIndex")){e._zIndex=b.css("zIndex")}b.css("zIndex",e.zIndex)},stop:function(b,c){var d=a(this).data("draggable").options;if(d._zIndex){a(c.helper).css("zIndex",d._zIndex)}}})})(jQuery);;/*
 * jQuery UI Droppable 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Droppables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.mouse.js
 *	jquery.ui.draggable.js
 */(function(a){a.widget("ui.droppable",{widgetEventPrefix:"drop",options:{accept:"*",activeClass:false,addClasses:true,greedy:false,hoverClass:false,scope:"default",tolerance:"intersect"},_create:function(){var c=this.options,b=c.accept;this.isover=0;this.isout=1;this.accept=a.isFunction(b)?b:function(e){return e.is(b)};this.proportions={width:this.element[0].offsetWidth,height:this.element[0].offsetHeight};a.ui.ddmanager.droppables[c.scope]=a.ui.ddmanager.droppables[c.scope]||[];a.ui.ddmanager.droppables[c.scope].push(this);(c.addClasses&&this.element.addClass("ui-droppable"))},destroy:function(){var b=a.ui.ddmanager.droppables[this.options.scope];for(var c=0;c<b.length;c++){if(b[c]==this){b.splice(c,1)}}this.element.removeClass("ui-droppable ui-droppable-disabled").removeData("droppable").unbind(".droppable");return this},_setOption:function(b,c){if(b=="accept"){this.accept=a.isFunction(c)?c:function(e){return e.is(c)}}a.Widget.prototype._setOption.apply(this,arguments)},_activate:function(c){var b=a.ui.ddmanager.current;if(this.options.activeClass){this.element.addClass(this.options.activeClass)}(b&&this._trigger("activate",c,this.ui(b)))},_deactivate:function(c){var b=a.ui.ddmanager.current;if(this.options.activeClass){this.element.removeClass(this.options.activeClass)}(b&&this._trigger("deactivate",c,this.ui(b)))},_over:function(c){var b=a.ui.ddmanager.current;if(!b||(b.currentItem||b.element)[0]==this.element[0]){return}if(this.accept.call(this.element[0],(b.currentItem||b.element))){if(this.options.hoverClass){this.element.addClass(this.options.hoverClass)}this._trigger("over",c,this.ui(b))}},_out:function(c){var b=a.ui.ddmanager.current;if(!b||(b.currentItem||b.element)[0]==this.element[0]){return}if(this.accept.call(this.element[0],(b.currentItem||b.element))){if(this.options.hoverClass){this.element.removeClass(this.options.hoverClass)}this._trigger("out",c,this.ui(b))}},_drop:function(c,d){var b=d||a.ui.ddmanager.current;if(!b||(b.currentItem||b.element)[0]==this.element[0]){return false}var e=false;this.element.find(":data(droppable)").not(".ui-draggable-dragging").each(function(){var f=a.data(this,"droppable");if(f.options.greedy&&!f.options.disabled&&f.options.scope==b.options.scope&&f.accept.call(f.element[0],(b.currentItem||b.element))&&a.ui.intersect(b,a.extend(f,{offset:f.element.offset()}),f.options.tolerance)){e=true;return false}});if(e){return false}if(this.accept.call(this.element[0],(b.currentItem||b.element))){if(this.options.activeClass){this.element.removeClass(this.options.activeClass)}if(this.options.hoverClass){this.element.removeClass(this.options.hoverClass)}this._trigger("drop",c,this.ui(b));return this.element}return false},ui:function(b){return{draggable:(b.currentItem||b.element),helper:b.helper,position:b.position,offset:b.positionAbs}}});a.extend(a.ui.droppable,{version:"1.8"});a.ui.intersect=function(q,j,o){if(!j.offset){return false}var e=(q.positionAbs||q.position.absolute).left,d=e+q.helperProportions.width,n=(q.positionAbs||q.position.absolute).top,m=n+q.helperProportions.height;var g=j.offset.left,c=g+j.proportions.width,p=j.offset.top,k=p+j.proportions.height;switch(o){case"fit":return(g<e&&d<c&&p<n&&m<k);break;case"intersect":return(g<e+(q.helperProportions.width/2)&&d-(q.helperProportions.width/2)<c&&p<n+(q.helperProportions.height/2)&&m-(q.helperProportions.height/2)<k);break;case"pointer":var h=((q.positionAbs||q.position.absolute).left+(q.clickOffset||q.offset.click).left),i=((q.positionAbs||q.position.absolute).top+(q.clickOffset||q.offset.click).top),f=a.ui.isOver(i,h,p,g,j.proportions.height,j.proportions.width);return f;break;case"touch":return((n>=p&&n<=k)||(m>=p&&m<=k)||(n<p&&m>k))&&((e>=g&&e<=c)||(d>=g&&d<=c)||(e<g&&d>c));break;default:return false;break}};a.ui.ddmanager={current:null,droppables:{"default":[]},prepareOffsets:function(e,g){var b=a.ui.ddmanager.droppables[e.options.scope]||[];var f=g?g.type:null;var h=(e.currentItem||e.element).find(":data(droppable)").andSelf();droppablesLoop:for(var d=0;d<b.length;d++){if(b[d].options.disabled||(e&&!b[d].accept.call(b[d].element[0],(e.currentItem||e.element)))){continue}for(var c=0;c<h.length;c++){if(h[c]==b[d].element[0]){b[d].proportions.height=0;continue droppablesLoop}}b[d].visible=b[d].element.css("display")!="none";if(!b[d].visible){continue}b[d].offset=b[d].element.offset();b[d].proportions={width:b[d].element[0].offsetWidth,height:b[d].element[0].offsetHeight};if(f=="mousedown"){b[d]._activate.call(b[d],g)}}},drop:function(b,c){var d=false;a.each(a.ui.ddmanager.droppables[b.options.scope]||[],function(){if(!this.options){return}if(!this.options.disabled&&this.visible&&a.ui.intersect(b,this,this.options.tolerance)){d=d||this._drop.call(this,c)}if(!this.options.disabled&&this.visible&&this.accept.call(this.element[0],(b.currentItem||b.element))){this.isout=1;this.isover=0;this._deactivate.call(this,c)}});return d},drag:function(b,c){if(b.options.refreshPositions){a.ui.ddmanager.prepareOffsets(b,c)}a.each(a.ui.ddmanager.droppables[b.options.scope]||[],function(){if(this.options.disabled||this.greedyChild||!this.visible){return}var e=a.ui.intersect(b,this,this.options.tolerance);var g=!e&&this.isover==1?"isout":(e&&this.isover==0?"isover":null);if(!g){return}var f;if(this.options.greedy){var d=this.element.parents(":data(droppable):eq(0)");if(d.length){f=a.data(d[0],"droppable");f.greedyChild=(g=="isover"?1:0)}}if(f&&g=="isover"){f.isover=0;f.isout=1;f._out.call(f,c)}this[g]=1;this[g=="isout"?"isover":"isout"]=0;this[g=="isover"?"_over":"_out"].call(this,c);if(f&&g=="isout"){f.isout=0;f.isover=1;f._over.call(f,c)}})}}})(jQuery);;/*
 * jQuery UI Resizable 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Resizables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */(function(c){c.widget("ui.resizable",c.ui.mouse,{widgetEventPrefix:"resize",options:{alsoResize:false,animate:false,animateDuration:"slow",animateEasing:"swing",aspectRatio:false,autoHide:false,containment:false,ghost:false,grid:false,handles:"e,s,se",helper:false,maxHeight:null,maxWidth:null,minHeight:10,minWidth:10,zIndex:1000},_create:function(){var e=this,j=this.options;this.element.addClass("ui-resizable");c.extend(this,{_aspectRatio:!!(j.aspectRatio),aspectRatio:j.aspectRatio,originalElement:this.element,_proportionallyResizeElements:[],_helper:j.helper||j.ghost||j.animate?j.helper||"ui-resizable-helper":null});if(this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i)){if(/relative/.test(this.element.css("position"))&&c.browser.opera){this.element.css({position:"relative",top:"auto",left:"auto"})}this.element.wrap(c('<div class="ui-wrapper" style="overflow: hidden;"></div>').css({position:this.element.css("position"),width:this.element.outerWidth(),height:this.element.outerHeight(),top:this.element.css("top"),left:this.element.css("left")}));this.element=this.element.parent().data("resizable",this.element.data("resizable"));this.elementIsWrapper=true;this.element.css({marginLeft:this.originalElement.css("marginLeft"),marginTop:this.originalElement.css("marginTop"),marginRight:this.originalElement.css("marginRight"),marginBottom:this.originalElement.css("marginBottom")});this.originalElement.css({marginLeft:0,marginTop:0,marginRight:0,marginBottom:0});this.originalResizeStyle=this.originalElement.css("resize");this.originalElement.css("resize","none");this._proportionallyResizeElements.push(this.originalElement.css({position:"static",zoom:1,display:"block"}));this.originalElement.css({margin:this.originalElement.css("margin")});this._proportionallyResize()}this.handles=j.handles||(!c(".ui-resizable-handle",this.element).length?"e,s,se":{n:".ui-resizable-n",e:".ui-resizable-e",s:".ui-resizable-s",w:".ui-resizable-w",se:".ui-resizable-se",sw:".ui-resizable-sw",ne:".ui-resizable-ne",nw:".ui-resizable-nw"});if(this.handles.constructor==String){if(this.handles=="all"){this.handles="n,e,s,w,se,sw,ne,nw"}var k=this.handles.split(",");this.handles={};for(var f=0;f<k.length;f++){var h=c.trim(k[f]),d="ui-resizable-"+h;var g=c('<div class="ui-resizable-handle '+d+'"></div>');if(/sw|se|ne|nw/.test(h)){g.css({zIndex:++j.zIndex})}if("se"==h){g.addClass("ui-icon ui-icon-gripsmall-diagonal-se")}this.handles[h]=".ui-resizable-"+h;this.element.append(g)}}this._renderAxis=function(p){p=p||this.element;for(var m in this.handles){if(this.handles[m].constructor==String){this.handles[m]=c(this.handles[m],this.element).show()}if(this.elementIsWrapper&&this.originalElement[0].nodeName.match(/textarea|input|select|button/i)){var n=c(this.handles[m],this.element),o=0;o=/sw|ne|nw|se|n|s/.test(m)?n.outerHeight():n.outerWidth();var l=["padding",/ne|nw|n/.test(m)?"Top":/se|sw|s/.test(m)?"Bottom":/^e$/.test(m)?"Right":"Left"].join("");p.css(l,o);this._proportionallyResize()}if(!c(this.handles[m]).length){continue}}};this._renderAxis(this.element);this._handles=c(".ui-resizable-handle",this.element).disableSelection();this._handles.mouseover(function(){if(!e.resizing){if(this.className){var i=this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i)}e.axis=i&&i[1]?i[1]:"se"}});if(j.autoHide){this._handles.hide();c(this.element).addClass("ui-resizable-autohide").hover(function(){c(this).removeClass("ui-resizable-autohide");e._handles.show()},function(){if(!e.resizing){c(this).addClass("ui-resizable-autohide");e._handles.hide()}})}this._mouseInit()},destroy:function(){this._mouseDestroy();var d=function(f){c(f).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing").removeData("resizable").unbind(".resizable").find(".ui-resizable-handle").remove()};if(this.elementIsWrapper){d(this.element);var e=this.element;e.after(this.originalElement.css({position:e.css("position"),width:e.outerWidth(),height:e.outerHeight(),top:e.css("top"),left:e.css("left")})).remove()}this.originalElement.css("resize",this.originalResizeStyle);d(this.originalElement);return this},_mouseCapture:function(e){var f=false;for(var d in this.handles){if(c(this.handles[d])[0]==e.target){f=true}}return !this.options.disabled&&f},_mouseStart:function(f){var i=this.options,e=this.element.position(),d=this.element;this.resizing=true;this.documentScroll={top:c(document).scrollTop(),left:c(document).scrollLeft()};if(d.is(".ui-draggable")||(/absolute/).test(d.css("position"))){d.css({position:"absolute",top:e.top,left:e.left})}if(c.browser.opera&&(/relative/).test(d.css("position"))){d.css({position:"relative",top:"auto",left:"auto"})}this._renderProxy();var j=b(this.helper.css("left")),g=b(this.helper.css("top"));if(i.containment){j+=c(i.containment).scrollLeft()||0;g+=c(i.containment).scrollTop()||0}this.offset=this.helper.offset();this.position={left:j,top:g};this.size=this._helper?{width:d.outerWidth(),height:d.outerHeight()}:{width:d.width(),height:d.height()};this.originalSize=this._helper?{width:d.outerWidth(),height:d.outerHeight()}:{width:d.width(),height:d.height()};this.originalPosition={left:j,top:g};this.sizeDiff={width:d.outerWidth()-d.width(),height:d.outerHeight()-d.height()};this.originalMousePosition={left:f.pageX,top:f.pageY};this.aspectRatio=(typeof i.aspectRatio=="number")?i.aspectRatio:((this.originalSize.width/this.originalSize.height)||1);var h=c(".ui-resizable-"+this.axis).css("cursor");c("body").css("cursor",h=="auto"?this.axis+"-resize":h);d.addClass("ui-resizable-resizing");this._propagate("start",f);return true},_mouseDrag:function(d){var g=this.helper,f=this.options,l={},p=this,i=this.originalMousePosition,m=this.axis;var q=(d.pageX-i.left)||0,n=(d.pageY-i.top)||0;var h=this._change[m];if(!h){return false}var k=h.apply(this,[d,q,n]),j=c.browser.msie&&c.browser.version<7,e=this.sizeDiff;if(this._aspectRatio||d.shiftKey){k=this._updateRatio(k,d)}k=this._respectSize(k,d);this._propagate("resize",d);g.css({top:this.position.top+"px",left:this.position.left+"px",width:this.size.width+"px",height:this.size.height+"px"});if(!this._helper&&this._proportionallyResizeElements.length){this._proportionallyResize()}this._updateCache(k);this._trigger("resize",d,this.ui());return false},_mouseStop:function(g){this.resizing=false;var h=this.options,l=this;if(this._helper){var f=this._proportionallyResizeElements,d=f.length&&(/textarea/i).test(f[0].nodeName),e=d&&c.ui.hasScroll(f[0],"left")?0:l.sizeDiff.height,j=d?0:l.sizeDiff.width;var m={width:(l.size.width-j),height:(l.size.height-e)},i=(parseInt(l.element.css("left"),10)+(l.position.left-l.originalPosition.left))||null,k=(parseInt(l.element.css("top"),10)+(l.position.top-l.originalPosition.top))||null;if(!h.animate){this.element.css(c.extend(m,{top:k,left:i}))}l.helper.height(l.size.height);l.helper.width(l.size.width);if(this._helper&&!h.animate){this._proportionallyResize()}}c("body").css("cursor","auto");this.element.removeClass("ui-resizable-resizing");this._propagate("stop",g);if(this._helper){this.helper.remove()}return false},_updateCache:function(d){var e=this.options;this.offset=this.helper.offset();if(a(d.left)){this.position.left=d.left}if(a(d.top)){this.position.top=d.top}if(a(d.height)){this.size.height=d.height}if(a(d.width)){this.size.width=d.width}},_updateRatio:function(g,f){var h=this.options,i=this.position,e=this.size,d=this.axis;if(g.height){g.width=(e.height*this.aspectRatio)}else{if(g.width){g.height=(e.width/this.aspectRatio)}}if(d=="sw"){g.left=i.left+(e.width-g.width);g.top=null}if(d=="nw"){g.top=i.top+(e.height-g.height);g.left=i.left+(e.width-g.width)}return g},_respectSize:function(k,f){var i=this.helper,h=this.options,q=this._aspectRatio||f.shiftKey,p=this.axis,s=a(k.width)&&h.maxWidth&&(h.maxWidth<k.width),l=a(k.height)&&h.maxHeight&&(h.maxHeight<k.height),g=a(k.width)&&h.minWidth&&(h.minWidth>k.width),r=a(k.height)&&h.minHeight&&(h.minHeight>k.height);if(g){k.width=h.minWidth}if(r){k.height=h.minHeight}if(s){k.width=h.maxWidth}if(l){k.height=h.maxHeight}var e=this.originalPosition.left+this.originalSize.width,n=this.position.top+this.size.height;var j=/sw|nw|w/.test(p),d=/nw|ne|n/.test(p);if(g&&j){k.left=e-h.minWidth}if(s&&j){k.left=e-h.maxWidth}if(r&&d){k.top=n-h.minHeight}if(l&&d){k.top=n-h.maxHeight}var m=!k.width&&!k.height;if(m&&!k.left&&k.top){k.top=null}else{if(m&&!k.top&&k.left){k.left=null}}return k},_proportionallyResize:function(){var j=this.options;if(!this._proportionallyResizeElements.length){return}var f=this.helper||this.element;for(var e=0;e<this._proportionallyResizeElements.length;e++){var g=this._proportionallyResizeElements[e];if(!this.borderDif){var d=[g.css("borderTopWidth"),g.css("borderRightWidth"),g.css("borderBottomWidth"),g.css("borderLeftWidth")],h=[g.css("paddingTop"),g.css("paddingRight"),g.css("paddingBottom"),g.css("paddingLeft")];this.borderDif=c.map(d,function(k,m){var l=parseInt(k,10)||0,n=parseInt(h[m],10)||0;return l+n})}if(c.browser.msie&&!(!(c(f).is(":hidden")||c(f).parents(":hidden").length))){continue}g.css({height:(f.height()-this.borderDif[0]-this.borderDif[2])||0,width:(f.width()-this.borderDif[1]-this.borderDif[3])||0})}},_renderProxy:function(){var e=this.element,h=this.options;this.elementOffset=e.offset();if(this._helper){this.helper=this.helper||c('<div style="overflow:hidden;"></div>');var d=c.browser.msie&&c.browser.version<7,f=(d?1:0),g=(d?2:-1);this.helper.addClass(this._helper).css({width:this.element.outerWidth()+g,height:this.element.outerHeight()+g,position:"absolute",left:this.elementOffset.left-f+"px",top:this.elementOffset.top-f+"px",zIndex:++h.zIndex});this.helper.appendTo("body").disableSelection()}else{this.helper=this.element}},_change:{e:function(f,e,d){return{width:this.originalSize.width+e}},w:function(g,e,d){var i=this.options,f=this.originalSize,h=this.originalPosition;return{left:h.left+e,width:f.width-e}},n:function(g,e,d){var i=this.options,f=this.originalSize,h=this.originalPosition;return{top:h.top+d,height:f.height-d}},s:function(f,e,d){return{height:this.originalSize.height+d}},se:function(f,e,d){return c.extend(this._change.s.apply(this,arguments),this._change.e.apply(this,[f,e,d]))},sw:function(f,e,d){return c.extend(this._change.s.apply(this,arguments),this._change.w.apply(this,[f,e,d]))},ne:function(f,e,d){return c.extend(this._change.n.apply(this,arguments),this._change.e.apply(this,[f,e,d]))},nw:function(f,e,d){return c.extend(this._change.n.apply(this,arguments),this._change.w.apply(this,[f,e,d]))}},_propagate:function(e,d){c.ui.plugin.call(this,e,[d,this.ui()]);(e!="resize"&&this._trigger(e,d,this.ui()))},plugins:{},ui:function(){return{originalElement:this.originalElement,element:this.element,helper:this.helper,position:this.position,size:this.size,originalSize:this.originalSize,originalPosition:this.originalPosition}}});c.extend(c.ui.resizable,{version:"1.8"});c.ui.plugin.add("resizable","alsoResize",{start:function(e,f){var d=c(this).data("resizable"),h=d.options;var g=function(i){c(i).each(function(){c(this).data("resizable-alsoresize",{width:parseInt(c(this).width(),10),height:parseInt(c(this).height(),10),left:parseInt(c(this).css("left"),10),top:parseInt(c(this).css("top"),10)})})};if(typeof(h.alsoResize)=="object"&&!h.alsoResize.parentNode){if(h.alsoResize.length){h.alsoResize=h.alsoResize[0];g(h.alsoResize)}else{c.each(h.alsoResize,function(i,j){g(i)})}}else{g(h.alsoResize)}},resize:function(f,h){var e=c(this).data("resizable"),i=e.options,g=e.originalSize,k=e.originalPosition;var j={height:(e.size.height-g.height)||0,width:(e.size.width-g.width)||0,top:(e.position.top-k.top)||0,left:(e.position.left-k.left)||0},d=function(l,m){c(l).each(function(){var p=c(this),q=c(this).data("resizable-alsoresize"),o={},n=m&&m.length?m:["width","height","top","left"];c.each(n||["width","height","top","left"],function(r,t){var s=(q[t]||0)+(j[t]||0);if(s&&s>=0){o[t]=s||null}});if(/relative/.test(p.css("position"))&&c.browser.opera){e._revertToRelativePosition=true;p.css({position:"absolute",top:"auto",left:"auto"})}p.css(o)})};if(typeof(i.alsoResize)=="object"&&!i.alsoResize.nodeType){c.each(i.alsoResize,function(l,m){d(l,m)})}else{d(i.alsoResize)}},stop:function(e,f){var d=c(this).data("resizable");if(d._revertToRelativePosition&&c.browser.opera){d._revertToRelativePosition=false;el.css({position:"relative"})}c(this).removeData("resizable-alsoresize-start")}});c.ui.plugin.add("resizable","animate",{stop:function(h,m){var n=c(this).data("resizable"),i=n.options;var g=n._proportionallyResizeElements,d=g.length&&(/textarea/i).test(g[0].nodeName),e=d&&c.ui.hasScroll(g[0],"left")?0:n.sizeDiff.height,k=d?0:n.sizeDiff.width;var f={width:(n.size.width-k),height:(n.size.height-e)},j=(parseInt(n.element.css("left"),10)+(n.position.left-n.originalPosition.left))||null,l=(parseInt(n.element.css("top"),10)+(n.position.top-n.originalPosition.top))||null;n.element.animate(c.extend(f,l&&j?{top:l,left:j}:{}),{duration:i.animateDuration,easing:i.animateEasing,step:function(){var o={width:parseInt(n.element.css("width"),10),height:parseInt(n.element.css("height"),10),top:parseInt(n.element.css("top"),10),left:parseInt(n.element.css("left"),10)};if(g&&g.length){c(g[0]).css({width:o.width,height:o.height})}n._updateCache(o);n._propagate("resize",h)}})}});c.ui.plugin.add("resizable","containment",{start:function(e,q){var s=c(this).data("resizable"),i=s.options,k=s.element;var f=i.containment,j=(f instanceof c)?f.get(0):(/parent/.test(f))?k.parent().get(0):f;if(!j){return}s.containerElement=c(j);if(/document/.test(f)||f==document){s.containerOffset={left:0,top:0};s.containerPosition={left:0,top:0};s.parentData={element:c(document),left:0,top:0,width:c(document).width(),height:c(document).height()||document.body.parentNode.scrollHeight}}else{var m=c(j),h=[];c(["Top","Right","Left","Bottom"]).each(function(p,o){h[p]=b(m.css("padding"+o))});s.containerOffset=m.offset();s.containerPosition=m.position();s.containerSize={height:(m.innerHeight()-h[3]),width:(m.innerWidth()-h[1])};var n=s.containerOffset,d=s.containerSize.height,l=s.containerSize.width,g=(c.ui.hasScroll(j,"left")?j.scrollWidth:l),r=(c.ui.hasScroll(j)?j.scrollHeight:d);s.parentData={element:j,left:n.left,top:n.top,width:g,height:r}}},resize:function(f,p){var s=c(this).data("resizable"),h=s.options,e=s.containerSize,n=s.containerOffset,l=s.size,m=s.position,q=s._aspectRatio||f.shiftKey,d={top:0,left:0},g=s.containerElement;if(g[0]!=document&&(/static/).test(g.css("position"))){d=n}if(m.left<(s._helper?n.left:0)){s.size.width=s.size.width+(s._helper?(s.position.left-n.left):(s.position.left-d.left));if(q){s.size.height=s.size.width/h.aspectRatio}s.position.left=h.helper?n.left:0}if(m.top<(s._helper?n.top:0)){s.size.height=s.size.height+(s._helper?(s.position.top-n.top):s.position.top);if(q){s.size.width=s.size.height*h.aspectRatio}s.position.top=s._helper?n.top:0}s.offset.left=s.parentData.left+s.position.left;s.offset.top=s.parentData.top+s.position.top;var k=Math.abs((s._helper?s.offset.left-d.left:(s.offset.left-d.left))+s.sizeDiff.width),r=Math.abs((s._helper?s.offset.top-d.top:(s.offset.top-n.top))+s.sizeDiff.height);var j=s.containerElement.get(0)==s.element.parent().get(0),i=/relative|absolute/.test(s.containerElement.css("position"));if(j&&i){k-=s.parentData.left}if(k+s.size.width>=s.parentData.width){s.size.width=s.parentData.width-k;if(q){s.size.height=s.size.width/s.aspectRatio}}if(r+s.size.height>=s.parentData.height){s.size.height=s.parentData.height-r;if(q){s.size.width=s.size.height*s.aspectRatio}}},stop:function(e,m){var p=c(this).data("resizable"),f=p.options,k=p.position,l=p.containerOffset,d=p.containerPosition,g=p.containerElement;var i=c(p.helper),q=i.offset(),n=i.outerWidth()-p.sizeDiff.width,j=i.outerHeight()-p.sizeDiff.height;if(p._helper&&!f.animate&&(/relative/).test(g.css("position"))){c(this).css({left:q.left-d.left-l.left,width:n,height:j})}if(p._helper&&!f.animate&&(/static/).test(g.css("position"))){c(this).css({left:q.left-d.left-l.left,width:n,height:j})}}});c.ui.plugin.add("resizable","ghost",{start:function(f,g){var d=c(this).data("resizable"),h=d.options,e=d.size;d.ghost=d.originalElement.clone();d.ghost.css({opacity:0.25,display:"block",position:"relative",height:e.height,width:e.width,margin:0,left:0,top:0}).addClass("ui-resizable-ghost").addClass(typeof h.ghost=="string"?h.ghost:"");d.ghost.appendTo(d.helper)},resize:function(e,f){var d=c(this).data("resizable"),g=d.options;if(d.ghost){d.ghost.css({position:"relative",height:d.size.height,width:d.size.width})}},stop:function(e,f){var d=c(this).data("resizable"),g=d.options;if(d.ghost&&d.helper){d.helper.get(0).removeChild(d.ghost.get(0))}}});c.ui.plugin.add("resizable","grid",{resize:function(d,l){var n=c(this).data("resizable"),g=n.options,j=n.size,h=n.originalSize,i=n.originalPosition,m=n.axis,k=g._aspectRatio||d.shiftKey;g.grid=typeof g.grid=="number"?[g.grid,g.grid]:g.grid;var f=Math.round((j.width-h.width)/(g.grid[0]||1))*(g.grid[0]||1),e=Math.round((j.height-h.height)/(g.grid[1]||1))*(g.grid[1]||1);if(/^(se|s|e)$/.test(m)){n.size.width=h.width+f;n.size.height=h.height+e}else{if(/^(ne)$/.test(m)){n.size.width=h.width+f;n.size.height=h.height+e;n.position.top=i.top-e}else{if(/^(sw)$/.test(m)){n.size.width=h.width+f;n.size.height=h.height+e;n.position.left=i.left-f}else{n.size.width=h.width+f;n.size.height=h.height+e;n.position.top=i.top-e;n.position.left=i.left-f}}}}});var b=function(d){return parseInt(d,10)||0};var a=function(d){return !isNaN(parseInt(d,10))}})(jQuery);;/*
 * jQuery UI Selectable 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Selectables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */(function(a){a.widget("ui.selectable",a.ui.mouse,{options:{appendTo:"body",autoRefresh:true,distance:0,filter:"*",tolerance:"touch"},_create:function(){var b=this;this.element.addClass("ui-selectable");this.dragged=false;var c;this.refresh=function(){c=a(b.options.filter,b.element[0]);c.each(function(){var d=a(this);var e=d.offset();a.data(this,"selectable-item",{element:this,$element:d,left:e.left,top:e.top,right:e.left+d.outerWidth(),bottom:e.top+d.outerHeight(),startselected:false,selected:d.hasClass("ui-selected"),selecting:d.hasClass("ui-selecting"),unselecting:d.hasClass("ui-unselecting")})})};this.refresh();this.selectees=c.addClass("ui-selectee");this._mouseInit();this.helper=a(document.createElement("div")).css({border:"1px dotted black"}).addClass("ui-selectable-helper")},destroy:function(){this.selectees.removeClass("ui-selectee").removeData("selectable-item");this.element.removeClass("ui-selectable ui-selectable-disabled").removeData("selectable").unbind(".selectable");this._mouseDestroy();return this},_mouseStart:function(d){var b=this;this.opos=[d.pageX,d.pageY];if(this.options.disabled){return}var c=this.options;this.selectees=a(c.filter,this.element[0]);this._trigger("start",d);a(c.appendTo).append(this.helper);this.helper.css({"z-index":100,position:"absolute",left:d.clientX,top:d.clientY,width:0,height:0});if(c.autoRefresh){this.refresh()}this.selectees.filter(".ui-selected").each(function(){var e=a.data(this,"selectable-item");e.startselected=true;if(!d.metaKey){e.$element.removeClass("ui-selected");e.selected=false;e.$element.addClass("ui-unselecting");e.unselecting=true;b._trigger("unselecting",d,{unselecting:e.element})}});a(d.target).parents().andSelf().each(function(){var e=a.data(this,"selectable-item");if(e){e.$element.removeClass("ui-unselecting").addClass("ui-selecting");e.unselecting=false;e.selecting=true;e.selected=true;b._trigger("selecting",d,{selecting:e.element});return false}})},_mouseDrag:function(i){var c=this;this.dragged=true;if(this.options.disabled){return}var e=this.options;var d=this.opos[0],h=this.opos[1],b=i.pageX,g=i.pageY;if(d>b){var f=b;b=d;d=f}if(h>g){var f=g;g=h;h=f}this.helper.css({left:d,top:h,width:b-d,height:g-h});this.selectees.each(function(){var j=a.data(this,"selectable-item");if(!j||j.element==c.element[0]){return}var k=false;if(e.tolerance=="touch"){k=(!(j.left>b||j.right<d||j.top>g||j.bottom<h))}else{if(e.tolerance=="fit"){k=(j.left>d&&j.right<b&&j.top>h&&j.bottom<g)}}if(k){if(j.selected){j.$element.removeClass("ui-selected");j.selected=false}if(j.unselecting){j.$element.removeClass("ui-unselecting");j.unselecting=false}if(!j.selecting){j.$element.addClass("ui-selecting");j.selecting=true;c._trigger("selecting",i,{selecting:j.element})}}else{if(j.selecting){if(i.metaKey&&j.startselected){j.$element.removeClass("ui-selecting");j.selecting=false;j.$element.addClass("ui-selected");j.selected=true}else{j.$element.removeClass("ui-selecting");j.selecting=false;if(j.startselected){j.$element.addClass("ui-unselecting");j.unselecting=true}c._trigger("unselecting",i,{unselecting:j.element})}}if(j.selected){if(!i.metaKey&&!j.startselected){j.$element.removeClass("ui-selected");j.selected=false;j.$element.addClass("ui-unselecting");j.unselecting=true;c._trigger("unselecting",i,{unselecting:j.element})}}}});return false},_mouseStop:function(d){var b=this;this.dragged=false;var c=this.options;a(".ui-unselecting",this.element[0]).each(function(){var e=a.data(this,"selectable-item");e.$element.removeClass("ui-unselecting");e.unselecting=false;e.startselected=false;b._trigger("unselected",d,{unselected:e.element})});a(".ui-selecting",this.element[0]).each(function(){var e=a.data(this,"selectable-item");e.$element.removeClass("ui-selecting").addClass("ui-selected");e.selecting=false;e.selected=true;e.startselected=true;b._trigger("selected",d,{selected:e.element})});this._trigger("stop",d);this.helper.remove();return false}});a.extend(a.ui.selectable,{version:"1.8"})})(jQuery);;/*
 * jQuery UI Sortable 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Sortables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */(function(a){a.widget("ui.sortable",a.ui.mouse,{widgetEventPrefix:"sort",options:{appendTo:"parent",axis:false,connectWith:false,containment:false,cursor:"auto",cursorAt:false,dropOnEmpty:true,forcePlaceholderSize:false,forceHelperSize:false,grid:false,handle:false,helper:"original",items:"> *",opacity:false,placeholder:false,revert:false,scroll:true,scrollSensitivity:20,scrollSpeed:20,scope:"default",tolerance:"intersect",zIndex:1000},_create:function(){var b=this.options;this.containerCache={};this.element.addClass("ui-sortable");this.refresh();this.floating=this.items.length?(/left|right/).test(this.items[0].item.css("float")):false;this.offset=this.element.offset();this._mouseInit()},destroy:function(){this.element.removeClass("ui-sortable ui-sortable-disabled").removeData("sortable").unbind(".sortable");this._mouseDestroy();for(var b=this.items.length-1;b>=0;b--){this.items[b].item.removeData("sortable-item")}return this},_mouseCapture:function(e,f){if(this.reverting){return false}if(this.options.disabled||this.options.type=="static"){return false}this._refreshItems(e);var d=null,c=this,b=a(e.target).parents().each(function(){if(a.data(this,"sortable-item")==c){d=a(this);return false}});if(a.data(e.target,"sortable-item")==c){d=a(e.target)}if(!d){return false}if(this.options.handle&&!f){var g=false;a(this.options.handle,d).find("*").andSelf().each(function(){if(this==e.target){g=true}});if(!g){return false}}this.currentItem=d;this._removeCurrentsFromItems();return true},_mouseStart:function(e,f,b){var g=this.options,c=this;this.currentContainer=this;this.refreshPositions();this.helper=this._createHelper(e);this._cacheHelperProportions();this._cacheMargins();this.scrollParent=this.helper.scrollParent();this.offset=this.currentItem.offset();this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left};this.helper.css("position","absolute");this.cssPosition=this.helper.css("position");a.extend(this.offset,{click:{left:e.pageX-this.offset.left,top:e.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()});this.originalPosition=this._generatePosition(e);this.originalPageX=e.pageX;this.originalPageY=e.pageY;(g.cursorAt&&this._adjustOffsetFromHelper(g.cursorAt));this.domPosition={prev:this.currentItem.prev()[0],parent:this.currentItem.parent()[0]};if(this.helper[0]!=this.currentItem[0]){this.currentItem.hide()}this._createPlaceholder();if(g.containment){this._setContainment()}if(g.cursor){if(a("body").css("cursor")){this._storedCursor=a("body").css("cursor")}a("body").css("cursor",g.cursor)}if(g.opacity){if(this.helper.css("opacity")){this._storedOpacity=this.helper.css("opacity")}this.helper.css("opacity",g.opacity)}if(g.zIndex){if(this.helper.css("zIndex")){this._storedZIndex=this.helper.css("zIndex")}this.helper.css("zIndex",g.zIndex)}if(this.scrollParent[0]!=document&&this.scrollParent[0].tagName!="HTML"){this.overflowOffset=this.scrollParent.offset()}this._trigger("start",e,this._uiHash());if(!this._preserveHelperProportions){this._cacheHelperProportions()}if(!b){for(var d=this.containers.length-1;d>=0;d--){this.containers[d]._trigger("activate",e,c._uiHash(this))}}if(a.ui.ddmanager){a.ui.ddmanager.current=this}if(a.ui.ddmanager&&!g.dropBehaviour){a.ui.ddmanager.prepareOffsets(this,e)}this.dragging=true;this.helper.addClass("ui-sortable-helper");this._mouseDrag(e);return true},_mouseDrag:function(f){this.position=this._generatePosition(f);this.positionAbs=this._convertPositionTo("absolute");if(!this.lastPositionAbs){this.lastPositionAbs=this.positionAbs}if(this.options.scroll){var g=this.options,b=false;if(this.scrollParent[0]!=document&&this.scrollParent[0].tagName!="HTML"){if((this.overflowOffset.top+this.scrollParent[0].offsetHeight)-f.pageY<g.scrollSensitivity){this.scrollParent[0].scrollTop=b=this.scrollParent[0].scrollTop+g.scrollSpeed}else{if(f.pageY-this.overflowOffset.top<g.scrollSensitivity){this.scrollParent[0].scrollTop=b=this.scrollParent[0].scrollTop-g.scrollSpeed}}if((this.overflowOffset.left+this.scrollParent[0].offsetWidth)-f.pageX<g.scrollSensitivity){this.scrollParent[0].scrollLeft=b=this.scrollParent[0].scrollLeft+g.scrollSpeed}else{if(f.pageX-this.overflowOffset.left<g.scrollSensitivity){this.scrollParent[0].scrollLeft=b=this.scrollParent[0].scrollLeft-g.scrollSpeed}}}else{if(f.pageY-a(document).scrollTop()<g.scrollSensitivity){b=a(document).scrollTop(a(document).scrollTop()-g.scrollSpeed)}else{if(a(window).height()-(f.pageY-a(document).scrollTop())<g.scrollSensitivity){b=a(document).scrollTop(a(document).scrollTop()+g.scrollSpeed)}}if(f.pageX-a(document).scrollLeft()<g.scrollSensitivity){b=a(document).scrollLeft(a(document).scrollLeft()-g.scrollSpeed)}else{if(a(window).width()-(f.pageX-a(document).scrollLeft())<g.scrollSensitivity){b=a(document).scrollLeft(a(document).scrollLeft()+g.scrollSpeed)}}}if(b!==false&&a.ui.ddmanager&&!g.dropBehaviour){a.ui.ddmanager.prepareOffsets(this,f)}}this.positionAbs=this._convertPositionTo("absolute");if(!this.options.axis||this.options.axis!="y"){this.helper[0].style.left=this.position.left+"px"}if(!this.options.axis||this.options.axis!="x"){this.helper[0].style.top=this.position.top+"px"}for(var d=this.items.length-1;d>=0;d--){var e=this.items[d],c=e.item[0],h=this._intersectsWithPointer(e);if(!h){continue}if(c!=this.currentItem[0]&&this.placeholder[h==1?"next":"prev"]()[0]!=c&&!a.ui.contains(this.placeholder[0],c)&&(this.options.type=="semi-dynamic"?!a.ui.contains(this.element[0],c):true)){this.direction=h==1?"down":"up";if(this.options.tolerance=="pointer"||this._intersectsWithSides(e)){this._rearrange(f,e)}else{break}this._trigger("change",f,this._uiHash());break}}this._contactContainers(f);if(a.ui.ddmanager){a.ui.ddmanager.drag(this,f)}this._trigger("sort",f,this._uiHash());this.lastPositionAbs=this.positionAbs;return false},_mouseStop:function(c,d){if(!c){return}if(a.ui.ddmanager&&!this.options.dropBehaviour){a.ui.ddmanager.drop(this,c)}if(this.options.revert){var b=this;var e=b.placeholder.offset();b.reverting=true;a(this.helper).animate({left:e.left-this.offset.parent.left-b.margins.left+(this.offsetParent[0]==document.body?0:this.offsetParent[0].scrollLeft),top:e.top-this.offset.parent.top-b.margins.top+(this.offsetParent[0]==document.body?0:this.offsetParent[0].scrollTop)},parseInt(this.options.revert,10)||500,function(){b._clear(c)})}else{this._clear(c,d)}return false},cancel:function(){var b=this;if(this.dragging){this._mouseUp();if(this.options.helper=="original"){this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper")}else{this.currentItem.show()}for(var c=this.containers.length-1;c>=0;c--){this.containers[c]._trigger("deactivate",null,b._uiHash(this));if(this.containers[c].containerCache.over){this.containers[c]._trigger("out",null,b._uiHash(this));this.containers[c].containerCache.over=0}}}if(this.placeholder[0].parentNode){this.placeholder[0].parentNode.removeChild(this.placeholder[0])}if(this.options.helper!="original"&&this.helper&&this.helper[0].parentNode){this.helper.remove()}a.extend(this,{helper:null,dragging:false,reverting:false,_noFinalSort:null});if(this.domPosition.prev){a(this.domPosition.prev).after(this.currentItem)}else{a(this.domPosition.parent).prepend(this.currentItem)}return this},serialize:function(d){var b=this._getItemsAsjQuery(d&&d.connected);var c=[];d=d||{};a(b).each(function(){var e=(a(d.item||this).attr(d.attribute||"id")||"").match(d.expression||(/(.+)[-=_](.+)/));if(e){c.push((d.key||e[1]+"[]")+"="+(d.key&&d.expression?e[1]:e[2]))}});return c.join("&")},toArray:function(d){var b=this._getItemsAsjQuery(d&&d.connected);var c=[];d=d||{};b.each(function(){c.push(a(d.item||this).attr(d.attribute||"id")||"")});return c},_intersectsWith:function(m){var e=this.positionAbs.left,d=e+this.helperProportions.width,k=this.positionAbs.top,j=k+this.helperProportions.height;var f=m.left,c=f+m.width,n=m.top,i=n+m.height;var o=this.offset.click.top,h=this.offset.click.left;var g=(k+o)>n&&(k+o)<i&&(e+h)>f&&(e+h)<c;if(this.options.tolerance=="pointer"||this.options.forcePointerForContainers||(this.options.tolerance!="pointer"&&this.helperProportions[this.floating?"width":"height"]>m[this.floating?"width":"height"])){return g}else{return(f<e+(this.helperProportions.width/2)&&d-(this.helperProportions.width/2)<c&&n<k+(this.helperProportions.height/2)&&j-(this.helperProportions.height/2)<i)}},_intersectsWithPointer:function(d){var e=a.ui.isOverAxis(this.positionAbs.top+this.offset.click.top,d.top,d.height),c=a.ui.isOverAxis(this.positionAbs.left+this.offset.click.left,d.left,d.width),g=e&&c,b=this._getDragVerticalDirection(),f=this._getDragHorizontalDirection();if(!g){return false}return this.floating?(((f&&f=="right")||b=="down")?2:1):(b&&(b=="down"?2:1))},_intersectsWithSides:function(e){var c=a.ui.isOverAxis(this.positionAbs.top+this.offset.click.top,e.top+(e.height/2),e.height),d=a.ui.isOverAxis(this.positionAbs.left+this.offset.click.left,e.left+(e.width/2),e.width),b=this._getDragVerticalDirection(),f=this._getDragHorizontalDirection();if(this.floating&&f){return((f=="right"&&d)||(f=="left"&&!d))}else{return b&&((b=="down"&&c)||(b=="up"&&!c))}},_getDragVerticalDirection:function(){var b=this.positionAbs.top-this.lastPositionAbs.top;return b!=0&&(b>0?"down":"up")},_getDragHorizontalDirection:function(){var b=this.positionAbs.left-this.lastPositionAbs.left;return b!=0&&(b>0?"right":"left")},refresh:function(b){this._refreshItems(b);this.refreshPositions();return this},_connectWith:function(){var b=this.options;return b.connectWith.constructor==String?[b.connectWith]:b.connectWith},_getItemsAsjQuery:function(b){var l=this;var g=[];var e=[];var h=this._connectWith();if(h&&b){for(var d=h.length-1;d>=0;d--){var k=a(h[d]);for(var c=k.length-1;c>=0;c--){var f=a.data(k[c],"sortable");if(f&&f!=this&&!f.options.disabled){e.push([a.isFunction(f.options.items)?f.options.items.call(f.element):a(f.options.items,f.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),f])}}}}e.push([a.isFunction(this.options.items)?this.options.items.call(this.element,null,{options:this.options,item:this.currentItem}):a(this.options.items,this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),this]);for(var d=e.length-1;d>=0;d--){e[d][0].each(function(){g.push(this)})}return a(g)},_removeCurrentsFromItems:function(){var d=this.currentItem.find(":data(sortable-item)");for(var c=0;c<this.items.length;c++){for(var b=0;b<d.length;b++){if(d[b]==this.items[c].item[0]){this.items.splice(c,1)}}}},_refreshItems:function(b){this.items=[];this.containers=[this];var h=this.items;var p=this;var f=[[a.isFunction(this.options.items)?this.options.items.call(this.element[0],b,{item:this.currentItem}):a(this.options.items,this.element),this]];var l=this._connectWith();if(l){for(var e=l.length-1;e>=0;e--){var m=a(l[e]);for(var d=m.length-1;d>=0;d--){var g=a.data(m[d],"sortable");if(g&&g!=this&&!g.options.disabled){f.push([a.isFunction(g.options.items)?g.options.items.call(g.element[0],b,{item:this.currentItem}):a(g.options.items,g.element),g]);this.containers.push(g)}}}}for(var e=f.length-1;e>=0;e--){var k=f[e][1];var c=f[e][0];for(var d=0,n=c.length;d<n;d++){var o=a(c[d]);o.data("sortable-item",k);h.push({item:o,instance:k,width:0,height:0,left:0,top:0})}}},refreshPositions:function(b){if(this.offsetParent&&this.helper){this.offset.parent=this._getParentOffset()}for(var d=this.items.length-1;d>=0;d--){var e=this.items[d];var c=this.options.toleranceElement?a(this.options.toleranceElement,e.item):e.item;if(!b){e.width=c.outerWidth();e.height=c.outerHeight()}var f=c.offset();e.left=f.left;e.top=f.top}if(this.options.custom&&this.options.custom.refreshContainers){this.options.custom.refreshContainers.call(this)}else{for(var d=this.containers.length-1;d>=0;d--){var f=this.containers[d].element.offset();this.containers[d].containerCache.left=f.left;this.containers[d].containerCache.top=f.top;this.containers[d].containerCache.width=this.containers[d].element.outerWidth();this.containers[d].containerCache.height=this.containers[d].element.outerHeight()}}return this},_createPlaceholder:function(d){var b=d||this,e=b.options;if(!e.placeholder||e.placeholder.constructor==String){var c=e.placeholder;e.placeholder={element:function(){var f=a(document.createElement(b.currentItem[0].nodeName)).addClass(c||b.currentItem[0].className+" ui-sortable-placeholder").removeClass("ui-sortable-helper")[0];if(!c){f.style.visibility="hidden"}return f},update:function(f,g){if(c&&!e.forcePlaceholderSize){return}if(!g.height()){g.height(b.currentItem.innerHeight()-parseInt(b.currentItem.css("paddingTop")||0,10)-parseInt(b.currentItem.css("paddingBottom")||0,10))}if(!g.width()){g.width(b.currentItem.innerWidth()-parseInt(b.currentItem.css("paddingLeft")||0,10)-parseInt(b.currentItem.css("paddingRight")||0,10))}}}}b.placeholder=a(e.placeholder.element.call(b.element,b.currentItem));b.currentItem.after(b.placeholder);e.placeholder.update(b,b.placeholder)},_contactContainers:function(b){var d=null,k=null;for(var f=this.containers.length-1;f>=0;f--){if(a.ui.contains(this.currentItem[0],this.containers[f].element[0])){continue}if(this._intersectsWith(this.containers[f].containerCache)){if(d&&a.ui.contains(this.containers[f].element[0],d.element[0])){continue}d=this.containers[f];k=f}else{if(this.containers[f].containerCache.over){this.containers[f]._trigger("out",b,this._uiHash(this));this.containers[f].containerCache.over=0}}}if(!d){return}if(this.containers.length===1){this.containers[k]._trigger("over",b,this._uiHash(this));this.containers[k].containerCache.over=1}else{if(this.currentContainer!=this.containers[k]){var h=10000;var g=null;var c=this.positionAbs[this.containers[k].floating?"left":"top"];for(var e=this.items.length-1;e>=0;e--){if(!a.ui.contains(this.containers[k].element[0],this.items[e].item[0])){continue}var l=this.items[e][this.containers[k].floating?"left":"top"];if(Math.abs(l-c)<h){h=Math.abs(l-c);g=this.items[e]}}if(!g&&!this.options.dropOnEmpty){return}this.currentContainer=this.containers[k];g?this._rearrange(b,g,null,true):this._rearrange(b,null,this.containers[k].element,true);this._trigger("change",b,this._uiHash());this.containers[k]._trigger("change",b,this._uiHash(this));this.options.placeholder.update(this.currentContainer,this.placeholder);this.containers[k]._trigger("over",b,this._uiHash(this));this.containers[k].containerCache.over=1}}},_createHelper:function(c){var d=this.options;var b=a.isFunction(d.helper)?a(d.helper.apply(this.element[0],[c,this.currentItem])):(d.helper=="clone"?this.currentItem.clone():this.currentItem);if(!b.parents("body").length){a(d.appendTo!="parent"?d.appendTo:this.currentItem[0].parentNode)[0].appendChild(b[0])}if(b[0]==this.currentItem[0]){this._storedCSS={width:this.currentItem[0].style.width,height:this.currentItem[0].style.height,position:this.currentItem.css("position"),top:this.currentItem.css("top"),left:this.currentItem.css("left")}}if(b[0].style.width==""||d.forceHelperSize){b.width(this.currentItem.width())}if(b[0].style.height==""||d.forceHelperSize){b.height(this.currentItem.height())}return b},_adjustOffsetFromHelper:function(b){if(typeof b=="string"){b=b.split(" ")}if(a.isArray(b)){b={left:+b[0],top:+b[1]||0}}if("left" in b){this.offset.click.left=b.left+this.margins.left}if("right" in b){this.offset.click.left=this.helperProportions.width-b.right+this.margins.left}if("top" in b){this.offset.click.top=b.top+this.margins.top}if("bottom" in b){this.offset.click.top=this.helperProportions.height-b.bottom+this.margins.top}},_getParentOffset:function(){this.offsetParent=this.helper.offsetParent();var b=this.offsetParent.offset();if(this.cssPosition=="absolute"&&this.scrollParent[0]!=document&&a.ui.contains(this.scrollParent[0],this.offsetParent[0])){b.left+=this.scrollParent.scrollLeft();b.top+=this.scrollParent.scrollTop()}if((this.offsetParent[0]==document.body)||(this.offsetParent[0].tagName&&this.offsetParent[0].tagName.toLowerCase()=="html"&&a.browser.msie)){b={top:0,left:0}}return{top:b.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:b.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if(this.cssPosition=="relative"){var b=this.currentItem.position();return{top:b.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:b.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}else{return{top:0,left:0}}},_cacheMargins:function(){this.margins={left:(parseInt(this.currentItem.css("marginLeft"),10)||0),top:(parseInt(this.currentItem.css("marginTop"),10)||0)}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var e=this.options;if(e.containment=="parent"){e.containment=this.helper[0].parentNode}if(e.containment=="document"||e.containment=="window"){this.containment=[0-this.offset.relative.left-this.offset.parent.left,0-this.offset.relative.top-this.offset.parent.top,a(e.containment=="document"?document:window).width()-this.helperProportions.width-this.margins.left,(a(e.containment=="document"?document:window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top]}if(!(/^(document|window|parent)$/).test(e.containment)){var c=a(e.containment)[0];var d=a(e.containment).offset();var b=(a(c).css("overflow")!="hidden");this.containment=[d.left+(parseInt(a(c).css("borderLeftWidth"),10)||0)+(parseInt(a(c).css("paddingLeft"),10)||0)-this.margins.left,d.top+(parseInt(a(c).css("borderTopWidth"),10)||0)+(parseInt(a(c).css("paddingTop"),10)||0)-this.margins.top,d.left+(b?Math.max(c.scrollWidth,c.offsetWidth):c.offsetWidth)-(parseInt(a(c).css("borderLeftWidth"),10)||0)-(parseInt(a(c).css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left,d.top+(b?Math.max(c.scrollHeight,c.offsetHeight):c.offsetHeight)-(parseInt(a(c).css("borderTopWidth"),10)||0)-(parseInt(a(c).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top]}},_convertPositionTo:function(f,h){if(!h){h=this.position}var c=f=="absolute"?1:-1;var e=this.options,b=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&a.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,g=(/(html|body)/i).test(b[0].tagName);return{top:(h.top+this.offset.relative.top*c+this.offset.parent.top*c-(a.browser.safari&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():(g?0:b.scrollTop()))*c)),left:(h.left+this.offset.relative.left*c+this.offset.parent.left*c-(a.browser.safari&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():g?0:b.scrollLeft())*c))}},_generatePosition:function(e){var h=this.options,b=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&a.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,i=(/(html|body)/i).test(b[0].tagName);if(this.cssPosition=="relative"&&!(this.scrollParent[0]!=document&&this.scrollParent[0]!=this.offsetParent[0])){this.offset.relative=this._getRelativeOffset()}var d=e.pageX;var c=e.pageY;if(this.originalPosition){if(this.containment){if(e.pageX-this.offset.click.left<this.containment[0]){d=this.containment[0]+this.offset.click.left}if(e.pageY-this.offset.click.top<this.containment[1]){c=this.containment[1]+this.offset.click.top}if(e.pageX-this.offset.click.left>this.containment[2]){d=this.containment[2]+this.offset.click.left}if(e.pageY-this.offset.click.top>this.containment[3]){c=this.containment[3]+this.offset.click.top}}if(h.grid){var g=this.originalPageY+Math.round((c-this.originalPageY)/h.grid[1])*h.grid[1];c=this.containment?(!(g-this.offset.click.top<this.containment[1]||g-this.offset.click.top>this.containment[3])?g:(!(g-this.offset.click.top<this.containment[1])?g-h.grid[1]:g+h.grid[1])):g;var f=this.originalPageX+Math.round((d-this.originalPageX)/h.grid[0])*h.grid[0];d=this.containment?(!(f-this.offset.click.left<this.containment[0]||f-this.offset.click.left>this.containment[2])?f:(!(f-this.offset.click.left<this.containment[0])?f-h.grid[0]:f+h.grid[0])):f}}return{top:(c-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+(a.browser.safari&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():(i?0:b.scrollTop())))),left:(d-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+(a.browser.safari&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():i?0:b.scrollLeft())))}},_rearrange:function(g,f,c,e){c?c[0].appendChild(this.placeholder[0]):f.item[0].parentNode.insertBefore(this.placeholder[0],(this.direction=="down"?f.item[0]:f.item[0].nextSibling));this.counter=this.counter?++this.counter:1;var d=this,b=this.counter;window.setTimeout(function(){if(b==d.counter){d.refreshPositions(!e)}},0)},_clear:function(d,e){this.reverting=false;var f=[],b=this;if(!this._noFinalSort&&this.currentItem[0].parentNode){this.placeholder.before(this.currentItem)}this._noFinalSort=null;if(this.helper[0]==this.currentItem[0]){for(var c in this._storedCSS){if(this._storedCSS[c]=="auto"||this._storedCSS[c]=="static"){this._storedCSS[c]=""}}this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper")}else{this.currentItem.show()}if(this.fromOutside&&!e){f.push(function(g){this._trigger("receive",g,this._uiHash(this.fromOutside))})}if((this.fromOutside||this.domPosition.prev!=this.currentItem.prev().not(".ui-sortable-helper")[0]||this.domPosition.parent!=this.currentItem.parent()[0])&&!e){f.push(function(g){this._trigger("update",g,this._uiHash())})}if(!a.ui.contains(this.element[0],this.currentItem[0])){if(!e){f.push(function(g){this._trigger("remove",g,this._uiHash())})}for(var c=this.containers.length-1;c>=0;c--){if(a.ui.contains(this.containers[c].element[0],this.currentItem[0])&&!e){f.push((function(g){return function(h){g._trigger("receive",h,this._uiHash(this))}}).call(this,this.containers[c]));f.push((function(g){return function(h){g._trigger("update",h,this._uiHash(this))}}).call(this,this.containers[c]))}}}for(var c=this.containers.length-1;c>=0;c--){if(!e){f.push((function(g){return function(h){g._trigger("deactivate",h,this._uiHash(this))}}).call(this,this.containers[c]))}if(this.containers[c].containerCache.over){f.push((function(g){return function(h){g._trigger("out",h,this._uiHash(this))}}).call(this,this.containers[c]));this.containers[c].containerCache.over=0}}if(this._storedCursor){a("body").css("cursor",this._storedCursor)}if(this._storedOpacity){this.helper.css("opacity",this._storedOpacity)}if(this._storedZIndex){this.helper.css("zIndex",this._storedZIndex=="auto"?"":this._storedZIndex)}this.dragging=false;if(this.cancelHelperRemoval){if(!e){this._trigger("beforeStop",d,this._uiHash());for(var c=0;c<f.length;c++){f[c].call(this,d)}this._trigger("stop",d,this._uiHash())}return false}if(!e){this._trigger("beforeStop",d,this._uiHash())}this.placeholder[0].parentNode.removeChild(this.placeholder[0]);if(this.helper[0]!=this.currentItem[0]){this.helper.remove()}this.helper=null;if(!e){for(var c=0;c<f.length;c++){f[c].call(this,d)}this._trigger("stop",d,this._uiHash())}this.fromOutside=false;return true},_trigger:function(){if(a.Widget.prototype._trigger.apply(this,arguments)===false){this.cancel()}},_uiHash:function(c){var b=c||this;return{helper:b.helper,placeholder:b.placeholder||a([]),position:b.position,originalPosition:b.originalPosition,offset:b.positionAbs,item:b.currentItem,sender:c?c.element:null}}});a.extend(a.ui.sortable,{version:"1.8"})})(jQuery);;/*
 * jQuery UI Accordion 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Accordion
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */(function(a){a.widget("ui.accordion",{options:{active:0,animated:"slide",autoHeight:true,clearStyle:false,collapsible:false,event:"click",fillSpace:false,header:"> li > :first-child,> :not(li):even",icons:{header:"ui-icon-triangle-1-e",headerSelected:"ui-icon-triangle-1-s"},navigation:false,navigationFilter:function(){return this.href.toLowerCase()==location.href.toLowerCase()}},_create:function(){var d=this.options,b=this;this.running=0;this.element.addClass("ui-accordion ui-widget ui-helper-reset");if(this.element[0].nodeName=="UL"){this.element.children("li").addClass("ui-accordion-li-fix")}this.headers=this.element.find(d.header).addClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-all").bind("mouseenter.accordion",function(){a(this).addClass("ui-state-hover")}).bind("mouseleave.accordion",function(){a(this).removeClass("ui-state-hover")}).bind("focus.accordion",function(){a(this).addClass("ui-state-focus")}).bind("blur.accordion",function(){a(this).removeClass("ui-state-focus")});this.headers.next().addClass("ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom");if(d.navigation){var c=this.element.find("a").filter(d.navigationFilter);if(c.length){var e=c.closest(".ui-accordion-header");if(e.length){this.active=e}else{this.active=c.closest(".ui-accordion-content").prev()}}}this.active=this._findActive(this.active||d.active).toggleClass("ui-state-default").toggleClass("ui-state-active").toggleClass("ui-corner-all").toggleClass("ui-corner-top");this.active.next().addClass("ui-accordion-content-active");this._createIcons();if(a.browser.msie){this.element.find("a").css("zoom","1")}this.resize();this.element.attr("role","tablist");this.headers.attr("role","tab").bind("keydown",function(f){return b._keydown(f)}).next().attr("role","tabpanel");this.headers.not(this.active||"").attr("aria-expanded","false").attr("tabIndex","-1").next().hide();if(!this.active.length){this.headers.eq(0).attr("tabIndex","0")}else{this.active.attr("aria-expanded","true").attr("tabIndex","0")}if(!a.browser.safari){this.headers.find("a").attr("tabIndex","-1")}if(d.event){this.headers.bind((d.event)+".accordion",function(f){b._clickHandler.call(b,f,this);f.preventDefault()})}},_createIcons:function(){var b=this.options;if(b.icons){a("<span/>").addClass("ui-icon "+b.icons.header).prependTo(this.headers);this.active.find(".ui-icon").toggleClass(b.icons.header).toggleClass(b.icons.headerSelected);this.element.addClass("ui-accordion-icons")}},_destroyIcons:function(){this.headers.children(".ui-icon").remove();this.element.removeClass("ui-accordion-icons")},destroy:function(){var c=this.options;this.element.removeClass("ui-accordion ui-widget ui-helper-reset").removeAttr("role").unbind(".accordion").removeData("accordion");this.headers.unbind(".accordion").removeClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-all ui-state-active ui-corner-top").removeAttr("role").removeAttr("aria-expanded").removeAttr("tabindex");this.headers.find("a").removeAttr("tabindex");this._destroyIcons();var b=this.headers.next().css("display","").removeAttr("role").removeClass("ui-helper-reset ui-widget-content ui-corner-bottom ui-accordion-content ui-accordion-content-active");if(c.autoHeight||c.fillHeight){b.css("height","")}return this},_setOption:function(b,c){a.Widget.prototype._setOption.apply(this,arguments);if(b=="active"){this.activate(c)}if(b=="icons"){this._destroyIcons();if(c){this._createIcons()}}},_keydown:function(e){var g=this.options,f=a.ui.keyCode;if(g.disabled||e.altKey||e.ctrlKey){return}var d=this.headers.length;var b=this.headers.index(e.target);var c=false;switch(e.keyCode){case f.RIGHT:case f.DOWN:c=this.headers[(b+1)%d];break;case f.LEFT:case f.UP:c=this.headers[(b-1+d)%d];break;case f.SPACE:case f.ENTER:this._clickHandler({target:e.target},e.target);e.preventDefault()}if(c){a(e.target).attr("tabIndex","-1");a(c).attr("tabIndex","0");c.focus();return false}return true},resize:function(){var d=this.options,c;if(d.fillSpace){if(a.browser.msie){var b=this.element.parent().css("overflow");this.element.parent().css("overflow","hidden")}c=this.element.parent().height();if(a.browser.msie){this.element.parent().css("overflow",b)}this.headers.each(function(){c-=a(this).outerHeight(true)});this.headers.next().each(function(){a(this).height(Math.max(0,c-a(this).innerHeight()+a(this).height()))}).css("overflow","auto")}else{if(d.autoHeight){c=0;this.headers.next().each(function(){c=Math.max(c,a(this).height())}).height(c)}}return this},activate:function(b){this.options.active=b;var c=this._findActive(b)[0];this._clickHandler({target:c},c);return this},_findActive:function(b){return b?typeof b=="number"?this.headers.filter(":eq("+b+")"):this.headers.not(this.headers.not(b)):b===false?a([]):this.headers.filter(":eq(0)")},_clickHandler:function(b,f){var d=this.options;if(d.disabled){return}if(!b.target){if(!d.collapsible){return}this.active.removeClass("ui-state-active ui-corner-top").addClass("ui-state-default ui-corner-all").find(".ui-icon").removeClass(d.icons.headerSelected).addClass(d.icons.header);this.active.next().addClass("ui-accordion-content-active");var h=this.active.next(),e={options:d,newHeader:a([]),oldHeader:d.active,newContent:a([]),oldContent:h},c=(this.active=a([]));this._toggle(c,h,e);return}var g=a(b.currentTarget||f);var i=g[0]==this.active[0];d.active=d.collapsible&&i?false:a(".ui-accordion-header",this.element).index(g);if(this.running||(!d.collapsible&&i)){return}this.active.removeClass("ui-state-active ui-corner-top").addClass("ui-state-default ui-corner-all").find(".ui-icon").removeClass(d.icons.headerSelected).addClass(d.icons.header);if(!i){g.removeClass("ui-state-default ui-corner-all").addClass("ui-state-active ui-corner-top").find(".ui-icon").removeClass(d.icons.header).addClass(d.icons.headerSelected);g.next().addClass("ui-accordion-content-active")}var c=g.next(),h=this.active.next(),e={options:d,newHeader:i&&d.collapsible?a([]):g,oldHeader:this.active,newContent:i&&d.collapsible?a([]):c,oldContent:h},j=this.headers.index(this.active[0])>this.headers.index(g[0]);this.active=i?a([]):g;this._toggle(c,h,e,i,j);return},_toggle:function(b,i,g,j,k){var d=this.options,m=this;this.toShow=b;this.toHide=i;this.data=g;var c=function(){if(!m){return}return m._completed.apply(m,arguments)};this._trigger("changestart",null,this.data);this.running=i.size()===0?b.size():i.size();if(d.animated){var f={};if(d.collapsible&&j){f={toShow:a([]),toHide:i,complete:c,down:k,autoHeight:d.autoHeight||d.fillSpace}}else{f={toShow:b,toHide:i,complete:c,down:k,autoHeight:d.autoHeight||d.fillSpace}}if(!d.proxied){d.proxied=d.animated}if(!d.proxiedDuration){d.proxiedDuration=d.duration}d.animated=a.isFunction(d.proxied)?d.proxied(f):d.proxied;d.duration=a.isFunction(d.proxiedDuration)?d.proxiedDuration(f):d.proxiedDuration;var l=a.ui.accordion.animations,e=d.duration,h=d.animated;if(h&&!l[h]&&!a.easing[h]){h="slide"}if(!l[h]){l[h]=function(n){this.slide(n,{easing:h,duration:e||700})}}l[h](f)}else{if(d.collapsible&&j){b.toggle()}else{i.hide();b.show()}c(true)}i.prev().attr("aria-expanded","false").attr("tabIndex","-1").blur();b.prev().attr("aria-expanded","true").attr("tabIndex","0").focus()},_completed:function(b){var c=this.options;this.running=b?0:--this.running;if(this.running){return}if(c.clearStyle){this.toShow.add(this.toHide).css({height:"",overflow:""})}this.toHide.removeClass("ui-accordion-content-active");this._trigger("change",null,this.data)}});a.extend(a.ui.accordion,{version:"1.8",animations:{slide:function(j,h){j=a.extend({easing:"swing",duration:300},j,h);if(!j.toHide.size()){j.toShow.animate({height:"show"},j);return}if(!j.toShow.size()){j.toHide.animate({height:"hide"},j);return}var c=j.toShow.css("overflow"),g=0,d={},f={},e=["height","paddingTop","paddingBottom"],b;var i=j.toShow;b=i[0].style.width;i.width(parseInt(i.parent().width(),10)-parseInt(i.css("paddingLeft"),10)-parseInt(i.css("paddingRight"),10)-(parseInt(i.css("borderLeftWidth"),10)||0)-(parseInt(i.css("borderRightWidth"),10)||0));a.each(e,function(k,m){f[m]="hide";var l=(""+a.css(j.toShow[0],m)).match(/^([\d+-.]+)(.*)$/);d[m]={value:l[1],unit:l[2]||"px"}});j.toShow.css({height:0,overflow:"hidden"}).show();j.toHide.filter(":hidden").each(j.complete).end().filter(":visible").animate(f,{step:function(k,l){if(l.prop=="height"){g=(l.end-l.start===0)?0:(l.now-l.start)/(l.end-l.start)}j.toShow[0].style[l.prop]=(g*d[l.prop].value)+d[l.prop].unit},duration:j.duration,easing:j.easing,complete:function(){if(!j.autoHeight){j.toShow.css("height","")}j.toShow.css("width",b);j.toShow.css({overflow:c});j.complete()}})},bounceslide:function(b){this.slide(b,{easing:b.down?"easeOutBounce":"swing",duration:b.down?1000:200})}}})})(jQuery);;/*
 * jQuery UI Autocomplete 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Autocomplete
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.position.js
 */(function(a){a.widget("ui.autocomplete",{options:{minLength:1,delay:300},_create:function(){var b=this,c=this.element[0].ownerDocument;this.element.addClass("ui-autocomplete-input").attr("autocomplete","off").attr({role:"textbox","aria-autocomplete":"list","aria-haspopup":"true"}).bind("keydown.autocomplete",function(d){var e=a.ui.keyCode;switch(d.keyCode){case e.PAGE_UP:b._move("previousPage",d);break;case e.PAGE_DOWN:b._move("nextPage",d);break;case e.UP:b._move("previous",d);d.preventDefault();break;case e.DOWN:b._move("next",d);d.preventDefault();break;case e.ENTER:if(b.menu.active){d.preventDefault()}case e.TAB:if(!b.menu.active){return}b.menu.select();break;case e.ESCAPE:b.element.val(b.term);b.close(d);break;case e.SHIFT:case e.CONTROL:case 18:break;default:clearTimeout(b.searching);b.searching=setTimeout(function(){b.search(null,d)},b.options.delay);break}}).bind("focus.autocomplete",function(){b.previous=b.element.val()}).bind("blur.autocomplete",function(d){clearTimeout(b.searching);b.closing=setTimeout(function(){b.close(d)},150)});this._initSource();this.response=function(){return b._response.apply(b,arguments)};this.menu=a("<ul></ul>").addClass("ui-autocomplete").appendTo("body",c).menu({focus:function(e,f){var d=f.item.data("item.autocomplete");if(false!==b._trigger("focus",null,{item:d})){b.element.val(d.value)}},selected:function(e,f){var d=f.item.data("item.autocomplete");if(false!==b._trigger("select",e,{item:d})){b.element.val(d.value)}b.close(e);b.previous=b.element.val();if(b.element[0]!==c.activeElement){b.element.focus()}},blur:function(d,e){if(b.menu.element.is(":visible")){b.element.val(b.term)}}}).zIndex(this.element.zIndex()+1).css({top:0,left:0}).hide().data("menu");if(a.fn.bgiframe){this.menu.element.bgiframe()}},destroy:function(){this.element.removeClass("ui-autocomplete-input ui-widget ui-widget-content").removeAttr("autocomplete").removeAttr("role").removeAttr("aria-autocomplete").removeAttr("aria-haspopup");this.menu.element.remove();a.Widget.prototype.destroy.call(this)},_setOption:function(b){a.Widget.prototype._setOption.apply(this,arguments);if(b==="source"){this._initSource()}},_initSource:function(){var c,b;if(a.isArray(this.options.source)){c=this.options.source;this.source=function(e,d){var f=new RegExp(a.ui.autocomplete.escapeRegex(e.term),"i");d(a.grep(c,function(g){return f.test(g.label||g.value||g)}))}}else{if(typeof this.options.source==="string"){b=this.options.source;this.source=function(e,d){a.getJSON(b,e,d)}}else{this.source=this.options.source}}},search:function(c,b){c=c!=null?c:this.element.val();if(c.length<this.options.minLength){return this.close(b)}clearTimeout(this.closing);if(this._trigger("search")===false){return}return this._search(c)},_search:function(b){this.term=this.element.addClass("ui-autocomplete-loading").val();this.source({term:b},this.response)},_response:function(b){if(b.length){b=this._normalize(b);this._suggest(b);this._trigger("open")}else{this.close()}this.element.removeClass("ui-autocomplete-loading")},close:function(b){clearTimeout(this.closing);if(this.menu.element.is(":visible")){this._trigger("close",b);this.menu.element.hide();this.menu.deactivate()}if(this.previous!==this.element.val()){this._trigger("change",b)}},_normalize:function(b){if(b.length&&b[0].label&&b[0].value){return b}return a.map(b,function(c){if(typeof c==="string"){return{label:c,value:c}}return a.extend({label:c.label||c.value,value:c.value||c.label},c)})},_suggest:function(b){var c=this.menu.element.empty().zIndex(this.element.zIndex()+1),d,e;this._renderMenu(c,b);this.menu.deactivate();this.menu.refresh();this.menu.element.show().position({my:"left top",at:"left bottom",of:this.element,collision:"none"});d=c.width("").width();e=this.element.width();c.width(Math.max(d,e))},_renderMenu:function(d,c){var b=this;a.each(c,function(e,f){b._renderItem(d,f)})},_renderItem:function(b,c){return a("<li></li>").data("item.autocomplete",c).append("<a>"+c.label+"</a>").appendTo(b)},_move:function(c,b){if(!this.menu.element.is(":visible")){this.search(null,b);return}if(this.menu.first()&&/^previous/.test(c)||this.menu.last()&&/^next/.test(c)){this.element.val(this.term);this.menu.deactivate();return}this.menu[c]()},widget:function(){return this.menu.element}});a.extend(a.ui.autocomplete,{escapeRegex:function(b){return b.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi,"\\$1")}})}(jQuery));(function(a){a.widget("ui.menu",{_create:function(){var b=this;this.element.addClass("ui-menu ui-widget ui-widget-content ui-corner-all").attr({role:"listbox","aria-activedescendant":"ui-active-menuitem"}).click(function(c){c.preventDefault();b.select()});this.refresh()},refresh:function(){var c=this;var b=this.element.children("li:not(.ui-menu-item):has(a)").addClass("ui-menu-item").attr("role","menuitem");b.children("a").addClass("ui-corner-all").attr("tabindex",-1).mouseenter(function(){c.activate(a(this).parent())}).mouseleave(function(){c.deactivate()})},activate:function(d){this.deactivate();if(this.hasScroll()){var e=d.offset().top-this.element.offset().top,b=this.element.attr("scrollTop"),c=this.element.height();if(e<0){this.element.attr("scrollTop",b+e)}else{if(e>c){this.element.attr("scrollTop",b+e-c+d.height())}}}this.active=d.eq(0).children("a").addClass("ui-state-hover").attr("id","ui-active-menuitem").end();this._trigger("focus",null,{item:d})},deactivate:function(){if(!this.active){return}this.active.children("a").removeClass("ui-state-hover").removeAttr("id");this._trigger("blur");this.active=null},next:function(){this.move("next","li:first")},previous:function(){this.move("prev","li:last")},first:function(){return this.active&&!this.active.prev().length},last:function(){return this.active&&!this.active.next().length},move:function(d,c){if(!this.active){this.activate(this.element.children(c));return}var b=this.active[d]();if(b.length){this.activate(b)}else{this.activate(this.element.children(c))}},nextPage:function(){if(this.hasScroll()){if(!this.active||this.last()){this.activate(this.element.children(":first"));return}var d=this.active.offset().top,c=this.element.height(),b=this.element.children("li").filter(function(){var e=a(this).offset().top-d-c+a(this).height();return e<10&&e>-10});if(!b.length){b=this.element.children(":last")}this.activate(b)}else{this.activate(this.element.children(!this.active||this.last()?":first":":last"))}},previousPage:function(){if(this.hasScroll()){if(!this.active||this.first()){this.activate(this.element.children(":last"));return}var c=this.active.offset().top,b=this.element.height();result=this.element.children("li").filter(function(){var d=a(this).offset().top-c+b-a(this).height();return d<10&&d>-10});if(!result.length){result=this.element.children(":first")}this.activate(result)}else{this.activate(this.element.children(!this.active||this.first()?":last":":first"))}},hasScroll:function(){return this.element.height()<this.element.attr("scrollHeight")},select:function(){this._trigger("selected",null,{item:this.active})}})}(jQuery));;/*
 * jQuery UI Button 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Button
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */(function(f){var d,c="ui-button ui-widget ui-state-default ui-corner-all",b="ui-state-hover ui-state-active ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon ui-button-text-only",e=function(g){f(":ui-button",g.target.form).each(function(){var h=f(this).data("button");setTimeout(function(){h.refresh()},1)})},a=function(h){var g=h.name,i=h.form,j=f([]);if(g){if(i){j=f(i).find("[name='"+g+"']")}else{j=f("[name='"+g+"']",h.ownerDocument).filter(function(){return !this.form})}}return j};f.widget("ui.button",{options:{text:true,label:null,icons:{primary:null,secondary:null}},_create:function(){this.element.closest("form").unbind("reset.button").bind("reset.button",e);this._determineButtonType();this.hasTitle=!!this.buttonElement.attr("title");var g=this,i=this.options,j=this.type==="checkbox"||this.type==="radio",k="ui-state-hover"+(!j?" ui-state-active":""),h="ui-state-focus";if(i.label===null){i.label=this.buttonElement.html()}if(this.element.is(":disabled")){i.disabled=true}this.buttonElement.addClass(c).attr("role","button").bind("mouseenter.button",function(){if(i.disabled){return}f(this).addClass("ui-state-hover");if(this===d){f(this).addClass("ui-state-active")}}).bind("mouseleave.button",function(){if(i.disabled){return}f(this).removeClass(k)}).bind("focus.button",function(){f(this).addClass(h)}).bind("blur.button",function(){f(this).removeClass(h)});if(j){this.element.bind("change.button",function(){g.refresh()})}if(this.type==="checkbox"){this.buttonElement.bind("click.button",function(){if(i.disabled){return false}f(this).toggleClass("ui-state-active");g.buttonElement.attr("aria-pressed",g.element[0].checked)})}else{if(this.type==="radio"){this.buttonElement.bind("click.button",function(){if(i.disabled){return false}f(this).addClass("ui-state-active");g.buttonElement.attr("aria-pressed",true);var l=g.element[0];a(l).not(l).map(function(){return f(this).button("widget")[0]}).removeClass("ui-state-active").attr("aria-pressed",false)})}else{this.buttonElement.bind("mousedown.button",function(){if(i.disabled){return false}f(this).addClass("ui-state-active");d=this;f(document).one("mouseup",function(){d=null})}).bind("mouseup.button",function(){if(i.disabled){return false}f(this).removeClass("ui-state-active")}).bind("keydown.button",function(l){if(i.disabled){return false}if(l.keyCode==f.ui.keyCode.SPACE||l.keyCode==f.ui.keyCode.ENTER){f(this).addClass("ui-state-active")}}).bind("keyup.button",function(){f(this).removeClass("ui-state-active")});if(this.buttonElement.is("a")){this.buttonElement.keyup(function(l){if(l.keyCode===f.ui.keyCode.SPACE){f(this).click()}})}}}this._setOption("disabled",i.disabled)},_determineButtonType:function(){if(this.element.is(":checkbox")){this.type="checkbox"}else{if(this.element.is(":radio")){this.type="radio"}else{if(this.element.is("input")){this.type="input"}else{this.type="button"}}}if(this.type==="checkbox"||this.type==="radio"){this.buttonElement=this.element.parents().last().find("[for="+this.element.attr("id")+"]");this.element.addClass("ui-helper-hidden-accessible");var g=this.element.is(":checked");if(g){this.buttonElement.addClass("ui-state-active")}this.buttonElement.attr("aria-pressed",g)}else{this.buttonElement=this.element}},widget:function(){return this.buttonElement},destroy:function(){this.element.removeClass("ui-helper-hidden-accessible");this.buttonElement.removeClass(c+" "+b).removeAttr("role").removeAttr("aria-pressed").html(this.buttonElement.find(".ui-button-text").html());if(!this.hasTitle){this.buttonElement.removeAttr("title")}f.Widget.prototype.destroy.call(this)},_setOption:function(g,h){f.Widget.prototype._setOption.apply(this,arguments);if(g==="disabled"){if(h){this.element.attr("disabled",true)}else{this.element.removeAttr("disabled")}}this._resetButton()},refresh:function(){var g=this.element.is(":disabled");if(g!==this.options.disabled){this._setOption("disabled",g)}if(this.type==="radio"){a(this.element[0]).each(function(){if(f(this).is(":checked")){f(this).button("widget").addClass("ui-state-active").attr("aria-pressed",true)}else{f(this).button("widget").removeClass("ui-state-active").attr("aria-pressed",false)}})}else{if(this.type==="checkbox"){if(this.element.is(":checked")){this.buttonElement.addClass("ui-state-active").attr("aria-pressed",true)}else{this.buttonElement.removeClass("ui-state-active").attr("aria-pressed",false)}}}},_resetButton:function(){if(this.type==="input"){if(this.options.label){this.element.val(this.options.label)}return}var j=this.buttonElement,i=f("<span></span>").addClass("ui-button-text").html(this.options.label).appendTo(j.empty()).text(),h=this.options.icons,g=h.primary&&h.secondary;if(h.primary||h.secondary){j.addClass("ui-button-text-icon"+(g?"s":""));if(h.primary){j.prepend("<span class='ui-button-icon-primary ui-icon "+h.primary+"'></span>")}if(h.secondary){j.append("<span class='ui-button-icon-secondary ui-icon "+h.secondary+"'></span>")}if(!this.options.text){j.addClass(g?"ui-button-icons-only":"ui-button-icon-only").removeClass("ui-button-text-icons ui-button-text-icon");if(!this.hasTitle){j.attr("title",i)}}}else{j.addClass("ui-button-text-only")}}});f.widget("ui.buttonset",{_create:function(){this.element.addClass("ui-buttonset");this._init()},_init:function(){this.refresh()},_setOption:function(g,h){if(g==="disabled"){this.buttons.button("option",g,h)}f.Widget.prototype._setOption.apply(this,arguments)},refresh:function(){this.buttons=this.element.find(":button, :submit, :reset, :checkbox, :radio, a, :data(button)").filter(":ui-button").button("refresh").end().not(":ui-button").button().end().map(function(){return f(this).button("widget")[0]}).removeClass("ui-corner-all ui-corner-left ui-corner-right").filter(":first").addClass("ui-corner-left").end().filter(":last").addClass("ui-corner-right").end().end()},destroy:function(){this.element.removeClass("ui-buttonset");this.buttons.map(function(){return f(this).button("widget")[0]}).removeClass("ui-corner-left ui-corner-right").end().button("destroy");f.Widget.prototype.destroy.call(this)}})}(jQuery));;/*
 * jQuery UI Dialog 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Dialog
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *  jquery.ui.button.js
 *	jquery.ui.draggable.js
 *	jquery.ui.mouse.js
 *	jquery.ui.position.js
 *	jquery.ui.resizable.js
 */(function(b){var a="ui-dialog ui-widget ui-widget-content ui-corner-all ";b.widget("ui.dialog",{options:{autoOpen:true,buttons:{},closeOnEscape:true,closeText:"close",dialogClass:"",draggable:true,hide:null,height:"auto",maxHeight:false,maxWidth:false,minHeight:150,minWidth:150,modal:false,position:"center",resizable:true,show:null,stack:true,title:"",width:300,zIndex:1000},_create:function(){this.originalTitle=this.element.attr("title");var k=this,l=k.options,i=l.title||k.originalTitle||"&#160;",d=b.ui.dialog.getTitleId(k.element),j=(k.uiDialog=b("<div></div>")).appendTo(document.body).hide().addClass(a+l.dialogClass).css({zIndex:l.zIndex}).attr("tabIndex",-1).css("outline",0).keydown(function(m){if(l.closeOnEscape&&m.keyCode&&m.keyCode===b.ui.keyCode.ESCAPE){k.close(m);m.preventDefault()}}).attr({role:"dialog","aria-labelledby":d}).mousedown(function(m){k.moveToTop(false,m)}),f=k.element.show().removeAttr("title").addClass("ui-dialog-content ui-widget-content").appendTo(j),e=(k.uiDialogTitlebar=b("<div></div>")).addClass("ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix").prependTo(j),h=b('<a href="#"></a>').addClass("ui-dialog-titlebar-close ui-corner-all").attr("role","button").hover(function(){h.addClass("ui-state-hover")},function(){h.removeClass("ui-state-hover")}).focus(function(){h.addClass("ui-state-focus")}).blur(function(){h.removeClass("ui-state-focus")}).click(function(m){k.close(m);return false}).appendTo(e),g=(k.uiDialogTitlebarCloseText=b("<span></span>")).addClass("ui-icon ui-icon-closethick").text(l.closeText).appendTo(h),c=b("<span></span>").addClass("ui-dialog-title").attr("id",d).html(i).prependTo(e);if(b.isFunction(l.beforeclose)&&!b.isFunction(l.beforeClose)){l.beforeClose=l.beforeclose}e.find("*").add(e).disableSelection();if(l.draggable&&b.fn.draggable){k._makeDraggable()}if(l.resizable&&b.fn.resizable){k._makeResizable()}k._createButtons(l.buttons);k._isOpen=false;if(b.fn.bgiframe){j.bgiframe()}},_init:function(){if(this.options.autoOpen){this.open()}},destroy:function(){var c=this;if(c.overlay){c.overlay.destroy()}c.uiDialog.hide();c.element.unbind(".dialog").removeData("dialog").removeClass("ui-dialog-content ui-widget-content").hide().appendTo("body");c.uiDialog.remove();if(c.originalTitle){c.element.attr("title",c.originalTitle)}return c},widget:function(){return this.uiDialog},close:function(e){var c=this,d;if(false===c._trigger("beforeClose",e)){return}if(c.overlay){c.overlay.destroy()}c.uiDialog.unbind("keypress.ui-dialog");c._isOpen=false;if(c.options.hide){c.uiDialog.hide(c.options.hide,function(){c._trigger("close",e)})}else{c.uiDialog.hide();c._trigger("close",e)}b.ui.dialog.overlay.resize();if(c.options.modal){d=0;b(".ui-dialog").each(function(){if(this!==c.uiDialog[0]){d=Math.max(d,b(this).css("z-index"))}});b.ui.dialog.maxZ=d}return c},isOpen:function(){return this._isOpen},moveToTop:function(g,f){var c=this,e=c.options,d;if((e.modal&&!g)||(!e.stack&&!e.modal)){return c._trigger("focus",f)}if(e.zIndex>b.ui.dialog.maxZ){b.ui.dialog.maxZ=e.zIndex}if(c.overlay){b.ui.dialog.maxZ+=1;c.overlay.$el.css("z-index",b.ui.dialog.overlay.maxZ=b.ui.dialog.maxZ)}d={scrollTop:c.element.attr("scrollTop"),scrollLeft:c.element.attr("scrollLeft")};b.ui.dialog.maxZ+=1;c.uiDialog.css("z-index",b.ui.dialog.maxZ);c.element.attr(d);c._trigger("focus",f);return c},open:function(){if(this._isOpen){return}var d=this,e=d.options,c=d.uiDialog;d.overlay=e.modal?new b.ui.dialog.overlay(d):null;if(c.next().length){c.appendTo("body")}d._size();d._position(e.position);c.show(e.show);d.moveToTop(true);if(e.modal){c.bind("keypress.ui-dialog",function(h){if(h.keyCode!==b.ui.keyCode.TAB){return}var g=b(":tabbable",this),i=g.filter(":first"),f=g.filter(":last");if(h.target===f[0]&&!h.shiftKey){i.focus(1);return false}else{if(h.target===i[0]&&h.shiftKey){f.focus(1);return false}}})}b([]).add(c.find(".ui-dialog-content :tabbable:first")).add(c.find(".ui-dialog-buttonpane :tabbable:first")).add(c).filter(":first").focus();d._trigger("open");d._isOpen=true;return d},_createButtons:function(f){var e=this,c=false,d=b("<div></div>").addClass("ui-dialog-buttonpane ui-widget-content ui-helper-clearfix");e.uiDialog.find(".ui-dialog-buttonpane").remove();if(typeof f==="object"&&f!==null){b.each(f,function(){return !(c=true)})}if(c){b.each(f,function(g,i){var h=b('<button type="button"></button>').text(g).click(function(){i.apply(e.element[0],arguments)}).appendTo(d);if(b.fn.button){h.button()}});d.appendTo(e.uiDialog)}},_makeDraggable:function(){var c=this,f=c.options,g=b(document),e;function d(h){return{position:h.position,offset:h.offset}}c.uiDialog.draggable({cancel:".ui-dialog-content, .ui-dialog-titlebar-close",handle:".ui-dialog-titlebar",containment:"document",start:function(h,i){e=f.height==="auto"?"auto":b(this).height();b(this).height(b(this).height()).addClass("ui-dialog-dragging");c._trigger("dragStart",h,d(i))},drag:function(h,i){c._trigger("drag",h,d(i))},stop:function(h,i){f.position=[i.position.left-g.scrollLeft(),i.position.top-g.scrollTop()];b(this).removeClass("ui-dialog-dragging").height(e);c._trigger("dragStop",h,d(i));b.ui.dialog.overlay.resize()}})},_makeResizable:function(h){h=(h===undefined?this.options.resizable:h);var d=this,g=d.options,c=d.uiDialog.css("position"),f=(typeof h==="string"?h:"n,e,s,w,se,sw,ne,nw");function e(i){return{originalPosition:i.originalPosition,originalSize:i.originalSize,position:i.position,size:i.size}}d.uiDialog.resizable({cancel:".ui-dialog-content",containment:"document",alsoResize:d.element,maxWidth:g.maxWidth,maxHeight:g.maxHeight,minWidth:g.minWidth,minHeight:d._minHeight(),handles:f,start:function(i,j){b(this).addClass("ui-dialog-resizing");d._trigger("resizeStart",i,e(j))},resize:function(i,j){d._trigger("resize",i,e(j))},stop:function(i,j){b(this).removeClass("ui-dialog-resizing");g.height=b(this).height();g.width=b(this).width();d._trigger("resizeStop",i,e(j));b.ui.dialog.overlay.resize()}}).css("position",c).find(".ui-resizable-se").addClass("ui-icon ui-icon-grip-diagonal-se")},_minHeight:function(){var c=this.options;if(c.height==="auto"){return c.minHeight}else{return Math.min(c.minHeight,c.height)}},_position:function(d){var e=[],f=[0,0],c;d=d||b.ui.dialog.prototype.options.position;if(typeof d==="string"||(typeof d==="object"&&"0" in d)){e=d.split?d.split(" "):[d[0],d[1]];if(e.length===1){e[1]=e[0]}b.each(["left","top"],function(h,g){if(+e[h]===e[h]){f[h]=e[h];e[h]=g}})}else{if(typeof d==="object"){if("left" in d){e[0]="left";f[0]=d.left}else{if("right" in d){e[0]="right";f[0]=-d.right}}if("top" in d){e[1]="top";f[1]=d.top}else{if("bottom" in d){e[1]="bottom";f[1]=-d.bottom}}}}c=this.uiDialog.is(":visible");if(!c){this.uiDialog.show()}this.uiDialog.css({top:0,left:0}).position({my:e.join(" "),at:e.join(" "),offset:f.join(" "),of:window,collision:"fit",using:function(h){var g=b(this).css(h).offset().top;if(g<0){b(this).css("top",h.top-g)}}});if(!c){this.uiDialog.hide()}},_setOption:function(f,g){var d=this,c=d.uiDialog,h=c.is(":data(resizable)"),e=false;switch(f){case"beforeclose":f="beforeClose";break;case"buttons":d._createButtons(g);break;case"closeText":d.uiDialogTitlebarCloseText.text(""+g);break;case"dialogClass":c.removeClass(d.options.dialogClass).addClass(a+g);break;case"disabled":if(g){c.addClass("ui-dialog-disabled")}else{c.removeClass("ui-dialog-disabled")}break;case"draggable":if(g){d._makeDraggable()}else{c.draggable("destroy")}break;case"height":e=true;break;case"maxHeight":if(h){c.resizable("option","maxHeight",g)}e=true;break;case"maxWidth":if(h){c.resizable("option","maxWidth",g)}e=true;break;case"minHeight":if(h){c.resizable("option","minHeight",g)}e=true;break;case"minWidth":if(h){c.resizable("option","minWidth",g)}e=true;break;case"position":d._position(g);break;case"resizable":if(h&&!g){c.resizable("destroy")}if(h&&typeof g==="string"){c.resizable("option","handles",g)}if(!h&&g!==false){d._makeResizable(g)}break;case"title":b(".ui-dialog-title",d.uiDialogTitlebar).html(""+(g||"&#160;"));break;case"width":e=true;break}b.Widget.prototype._setOption.apply(d,arguments);if(e){d._size()}},_size:function(){var d=this.options,c;this.element.css("width","auto").hide();c=this.uiDialog.css({height:"auto",width:d.width}).height();this.element.css(d.height==="auto"?{minHeight:Math.max(d.minHeight-c,0),height:"auto"}:{minHeight:0,height:Math.max(d.height-c,0)}).show();if(this.uiDialog.is(":data(resizable)")){this.uiDialog.resizable("option","minHeight",this._minHeight())}}});b.extend(b.ui.dialog,{version:"1.8",uuid:0,maxZ:0,getTitleId:function(c){var d=c.attr("id");if(!d){this.uuid+=1;d=this.uuid}return"ui-dialog-title-"+d},overlay:function(c){this.$el=b.ui.dialog.overlay.create(c)}});b.extend(b.ui.dialog.overlay,{instances:[],oldInstances:[],maxZ:0,events:b.map("focus,mousedown,mouseup,keydown,keypress,click".split(","),function(c){return c+".dialog-overlay"}).join(" "),create:function(d){if(this.instances.length===0){setTimeout(function(){if(b.ui.dialog.overlay.instances.length){b(document).bind(b.ui.dialog.overlay.events,function(e){return(b(e.target).zIndex()>=b.ui.dialog.overlay.maxZ)})}},1);b(document).bind("keydown.dialog-overlay",function(e){if(d.options.closeOnEscape&&e.keyCode&&e.keyCode===b.ui.keyCode.ESCAPE){d.close(e);e.preventDefault()}});b(window).bind("resize.dialog-overlay",b.ui.dialog.overlay.resize)}var c=(this.oldInstances.pop()||b("<div></div>").addClass("ui-widget-overlay")).appendTo(document.body).css({width:this.width(),height:this.height()});if(b.fn.bgiframe){c.bgiframe()}this.instances.push(c);return c},destroy:function(c){this.oldInstances.push(this.instances.splice(b.inArray(c,this.instances),1)[0]);if(this.instances.length===0){b([document,window]).unbind(".dialog-overlay")}c.remove();var d=0;b.each(this.instances,function(){d=Math.max(d,this.css("z-index"))});this.maxZ=d},height:function(){var d,c;if(b.browser.msie&&b.browser.version<7){d=Math.max(document.documentElement.scrollHeight,document.body.scrollHeight);c=Math.max(document.documentElement.offsetHeight,document.body.offsetHeight);if(d<c){return b(window).height()+"px"}else{return d+"px"}}else{return b(document).height()+"px"}},width:function(){var c,d;if(b.browser.msie&&b.browser.version<7){c=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth);d=Math.max(document.documentElement.offsetWidth,document.body.offsetWidth);if(c<d){return b(window).width()+"px"}else{return c+"px"}}else{return b(document).width()+"px"}},resize:function(){var c=b([]);b.each(b.ui.dialog.overlay.instances,function(){c=c.add(this)});c.css({width:0,height:0}).css({width:b.ui.dialog.overlay.width(),height:b.ui.dialog.overlay.height()})}});b.extend(b.ui.dialog.overlay.prototype,{destroy:function(){b.ui.dialog.overlay.destroy(this.$el)}})}(jQuery));;/*
 * jQuery UI Slider 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Slider
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */(function(b){var a=5;b.widget("ui.slider",b.ui.mouse,{widgetEventPrefix:"slide",options:{animate:false,distance:0,max:100,min:0,orientation:"horizontal",range:false,step:1,value:0,values:null},_create:function(){var c=this,d=this.options;this._keySliding=false;this._mouseSliding=false;this._animateOff=true;this._handleIndex=null;this._detectOrientation();this._mouseInit();this.element.addClass("ui-slider ui-slider-"+this.orientation+" ui-widget ui-widget-content ui-corner-all");if(d.disabled){this.element.addClass("ui-slider-disabled ui-disabled")}this.range=b([]);if(d.range){if(d.range===true){this.range=b("<div></div>");if(!d.values){d.values=[this._valueMin(),this._valueMin()]}if(d.values.length&&d.values.length!=2){d.values=[d.values[0],d.values[0]]}}else{this.range=b("<div></div>")}this.range.appendTo(this.element).addClass("ui-slider-range");if(d.range=="min"||d.range=="max"){this.range.addClass("ui-slider-range-"+d.range)}this.range.addClass("ui-widget-header")}if(b(".ui-slider-handle",this.element).length==0){b('<a href="#"></a>').appendTo(this.element).addClass("ui-slider-handle")}if(d.values&&d.values.length){while(b(".ui-slider-handle",this.element).length<d.values.length){b('<a href="#"></a>').appendTo(this.element).addClass("ui-slider-handle")}}this.handles=b(".ui-slider-handle",this.element).addClass("ui-state-default ui-corner-all");this.handle=this.handles.eq(0);this.handles.add(this.range).filter("a").click(function(e){e.preventDefault()}).hover(function(){if(!d.disabled){b(this).addClass("ui-state-hover")}},function(){b(this).removeClass("ui-state-hover")}).focus(function(){if(!d.disabled){b(".ui-slider .ui-state-focus").removeClass("ui-state-focus");b(this).addClass("ui-state-focus")}else{b(this).blur()}}).blur(function(){b(this).removeClass("ui-state-focus")});this.handles.each(function(e){b(this).data("index.ui-slider-handle",e)});this.handles.keydown(function(j){var g=true;var f=b(this).data("index.ui-slider-handle");if(c.options.disabled){return}switch(j.keyCode){case b.ui.keyCode.HOME:case b.ui.keyCode.END:case b.ui.keyCode.PAGE_UP:case b.ui.keyCode.PAGE_DOWN:case b.ui.keyCode.UP:case b.ui.keyCode.RIGHT:case b.ui.keyCode.DOWN:case b.ui.keyCode.LEFT:g=false;if(!c._keySliding){c._keySliding=true;b(this).addClass("ui-state-active");c._start(j,f)}break}var h,e,i=c._step();if(c.options.values&&c.options.values.length){h=e=c.values(f)}else{h=e=c.value()}switch(j.keyCode){case b.ui.keyCode.HOME:e=c._valueMin();break;case b.ui.keyCode.END:e=c._valueMax();break;case b.ui.keyCode.PAGE_UP:e=h+((c._valueMax()-c._valueMin())/a);break;case b.ui.keyCode.PAGE_DOWN:e=h-((c._valueMax()-c._valueMin())/a);break;case b.ui.keyCode.UP:case b.ui.keyCode.RIGHT:if(h==c._valueMax()){return}e=h+i;break;case b.ui.keyCode.DOWN:case b.ui.keyCode.LEFT:if(h==c._valueMin()){return}e=h-i;break}c._slide(j,f,e);return g}).keyup(function(f){var e=b(this).data("index.ui-slider-handle");if(c._keySliding){c._keySliding=false;c._stop(f,e);c._change(f,e);b(this).removeClass("ui-state-active")}});this._refreshValue();this._animateOff=false},destroy:function(){this.handles.remove();this.range.remove();this.element.removeClass("ui-slider ui-slider-horizontal ui-slider-vertical ui-slider-disabled ui-widget ui-widget-content ui-corner-all").removeData("slider").unbind(".slider");this._mouseDestroy();return this},_mouseCapture:function(e){var f=this.options;if(f.disabled){return false}this.elementSize={width:this.element.outerWidth(),height:this.element.outerHeight()};this.elementOffset=this.element.offset();var i={x:e.pageX,y:e.pageY};var k=this._normValueFromMouse(i);var d=this._valueMax()-this._valueMin()+1,g;var l=this,j;this.handles.each(function(m){var n=Math.abs(k-l.values(m));if(d>n){d=n;g=b(this);j=m}});if(f.range==true&&this.values(1)==f.min){g=b(this.handles[++j])}this._start(e,j);this._mouseSliding=true;l._handleIndex=j;g.addClass("ui-state-active").focus();var h=g.offset();var c=!b(e.target).parents().andSelf().is(".ui-slider-handle");this._clickOffset=c?{left:0,top:0}:{left:e.pageX-h.left-(g.width()/2),top:e.pageY-h.top-(g.height()/2)-(parseInt(g.css("borderTopWidth"),10)||0)-(parseInt(g.css("borderBottomWidth"),10)||0)+(parseInt(g.css("marginTop"),10)||0)};k=this._normValueFromMouse(i);this._slide(e,j,k);this._animateOff=true;return true},_mouseStart:function(c){return true},_mouseDrag:function(e){var c={x:e.pageX,y:e.pageY};var d=this._normValueFromMouse(c);this._slide(e,this._handleIndex,d);return false},_mouseStop:function(c){this.handles.removeClass("ui-state-active");this._mouseSliding=false;this._stop(c,this._handleIndex);this._change(c,this._handleIndex);this._handleIndex=null;this._clickOffset=null;this._animateOff=false;return false},_detectOrientation:function(){this.orientation=this.options.orientation=="vertical"?"vertical":"horizontal"},_normValueFromMouse:function(e){var d,i;if("horizontal"==this.orientation){d=this.elementSize.width;i=e.x-this.elementOffset.left-(this._clickOffset?this._clickOffset.left:0)}else{d=this.elementSize.height;i=e.y-this.elementOffset.top-(this._clickOffset?this._clickOffset.top:0)}var g=(i/d);if(g>1){g=1}if(g<0){g=0}if("vertical"==this.orientation){g=1-g}var f=this._valueMax()-this._valueMin(),j=g*f,c=j%this.options.step,h=this._valueMin()+j-c;if(c>(this.options.step/2)){h+=this.options.step}return parseFloat(h.toFixed(5))},_start:function(e,d){var c={handle:this.handles[d],value:this.value()};if(this.options.values&&this.options.values.length){c.value=this.values(d);c.values=this.values()}this._trigger("start",e,c)},_slide:function(g,f,e){var h=this.handles[f];if(this.options.values&&this.options.values.length){var c=this.values(f?0:1);if((this.options.values.length==2&&this.options.range===true)&&((f==0&&e>c)||(f==1&&e<c))){e=c}if(e!=this.values(f)){var d=this.values();d[f]=e;var i=this._trigger("slide",g,{handle:this.handles[f],value:e,values:d});var c=this.values(f?0:1);if(i!==false){this.values(f,e,true)}}}else{if(e!=this.value()){var i=this._trigger("slide",g,{handle:this.handles[f],value:e});if(i!==false){this.value(e)}}}},_stop:function(e,d){var c={handle:this.handles[d],value:this.value()};if(this.options.values&&this.options.values.length){c.value=this.values(d);c.values=this.values()}this._trigger("stop",e,c)},_change:function(e,d){if(!this._keySliding&&!this._mouseSliding){var c={handle:this.handles[d],value:this.value()};if(this.options.values&&this.options.values.length){c.value=this.values(d);c.values=this.values()}this._trigger("change",e,c)}},value:function(c){if(arguments.length){this.options.value=this._trimValue(c);this._refreshValue();this._change(null,0)}return this._value()},values:function(e,h){if(arguments.length>1){this.options.values[e]=this._trimValue(h);this._refreshValue();this._change(null,e)}if(arguments.length){if(b.isArray(arguments[0])){var g=this.options.values,d=arguments[0];for(var f=0,c=g.length;f<c;f++){g[f]=this._trimValue(d[f]);this._change(null,f)}this._refreshValue()}else{if(this.options.values&&this.options.values.length){return this._values(e)}else{return this.value()}}}else{return this._values()}},_setOption:function(d,e){var c,f=0;if(jQuery.isArray(this.options.values)){f=this.options.values.length}b.Widget.prototype._setOption.apply(this,arguments);switch(d){case"disabled":if(e){this.handles.filter(".ui-state-focus").blur();this.handles.removeClass("ui-state-hover");this.handles.attr("disabled","disabled");this.element.addClass("ui-disabled")}else{this.handles.removeAttr("disabled");this.element.removeClass("ui-disabled")}case"orientation":this._detectOrientation();this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-"+this.orientation);this._refreshValue();break;case"value":this._animateOff=true;this._refreshValue();this._change(null,0);this._animateOff=false;break;case"values":this._animateOff=true;this._refreshValue();for(c=0;c<f;c++){this._change(null,c)}this._animateOff=false;break}},_step:function(){var c=this.options.step;return c},_value:function(){var c=this.options.value;c=this._trimValue(c);return c},_values:function(d){if(arguments.length){var g=this.options.values[d];g=this._trimValue(g);return g}else{var f=this.options.values.slice();for(var e=0,c=f.length;e<c;e++){f[e]=this._trimValue(f[e])}return f}},_trimValue:function(c){if(c<this._valueMin()){c=this._valueMin()}if(c>this._valueMax()){c=this._valueMax()}return c},_valueMin:function(){var c=this.options.min;return c},_valueMax:function(){var c=this.options.max;return c},_refreshValue:function(){var g=this.options.range,e=this.options,m=this;var d=(!this._animateOff)?e.animate:false;if(this.options.values&&this.options.values.length){var j,i;this.handles.each(function(q,o){var p=(m.values(q)-m._valueMin())/(m._valueMax()-m._valueMin())*100;var n={};n[m.orientation=="horizontal"?"left":"bottom"]=p+"%";b(this).stop(1,1)[d?"animate":"css"](n,e.animate);if(m.options.range===true){if(m.orientation=="horizontal"){(q==0)&&m.range.stop(1,1)[d?"animate":"css"]({left:p+"%"},e.animate);(q==1)&&m.range[d?"animate":"css"]({width:(p-lastValPercent)+"%"},{queue:false,duration:e.animate})}else{(q==0)&&m.range.stop(1,1)[d?"animate":"css"]({bottom:(p)+"%"},e.animate);(q==1)&&m.range[d?"animate":"css"]({height:(p-lastValPercent)+"%"},{queue:false,duration:e.animate})}}lastValPercent=p})}else{var k=this.value(),h=this._valueMin(),l=this._valueMax(),f=l!=h?(k-h)/(l-h)*100:0;var c={};c[m.orientation=="horizontal"?"left":"bottom"]=f+"%";this.handle.stop(1,1)[d?"animate":"css"](c,e.animate);(g=="min")&&(this.orientation=="horizontal")&&this.range.stop(1,1)[d?"animate":"css"]({width:f+"%"},e.animate);(g=="max")&&(this.orientation=="horizontal")&&this.range[d?"animate":"css"]({width:(100-f)+"%"},{queue:false,duration:e.animate});(g=="min")&&(this.orientation=="vertical")&&this.range.stop(1,1)[d?"animate":"css"]({height:f+"%"},e.animate);(g=="max")&&(this.orientation=="vertical")&&this.range[d?"animate":"css"]({height:(100-f)+"%"},{queue:false,duration:e.animate})}}});b.extend(b.ui.slider,{version:"1.8"})})(jQuery);;/*
 * jQuery UI Tabs 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Tabs
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */(function(c){var b=0,a=0;c.widget("ui.tabs",{options:{add:null,ajaxOptions:null,cache:false,cookie:null,collapsible:false,disable:null,disabled:[],enable:null,event:"click",fx:null,idPrefix:"ui-tabs-",load:null,panelTemplate:"<div></div>",remove:null,select:null,show:null,spinner:"<em>Loading&#8230;</em>",tabTemplate:'<li><a href="#{href}"><span>#{label}</span></a></li>'},_create:function(){this._tabify(true)},_setOption:function(d,e){if(d=="selected"){if(this.options.collapsible&&e==this.options.selected){return}this.select(e)}else{this.options[d]=e;this._tabify()}},_tabId:function(d){return d.title&&d.title.replace(/\s/g,"_").replace(/[^A-Za-z0-9\-_:\.]/g,"")||this.options.idPrefix+(++b)},_sanitizeSelector:function(d){return d.replace(/:/g,"\\:")},_cookie:function(){var d=this.cookie||(this.cookie=this.options.cookie.name||"ui-tabs-"+(++a));return c.cookie.apply(null,[d].concat(c.makeArray(arguments)))},_ui:function(e,d){return{tab:e,panel:d,index:this.anchors.index(e)}},_cleanup:function(){this.lis.filter(".ui-state-processing").removeClass("ui-state-processing").find("span:data(label.tabs)").each(function(){var d=c(this);d.html(d.data("label.tabs")).removeData("label.tabs")})},_tabify:function(q){this.list=this.element.find("ol,ul").eq(0);this.lis=c("li:has(a[href])",this.list);this.anchors=this.lis.map(function(){return c("a",this)[0]});this.panels=c([]);var r=this,f=this.options;var e=/^#.+/;this.anchors.each(function(u,o){var s=c(o).attr("href");var v=s.split("#")[0],w;if(v&&(v===location.toString().split("#")[0]||(w=c("base")[0])&&v===w.href)){s=o.hash;o.href=s}if(e.test(s)){r.panels=r.panels.add(r._sanitizeSelector(s))}else{if(s!="#"){c.data(o,"href.tabs",s);c.data(o,"load.tabs",s.replace(/#.*$/,""));var y=r._tabId(o);o.href="#"+y;var x=c("#"+y);if(!x.length){x=c(f.panelTemplate).attr("id",y).addClass("ui-tabs-panel ui-widget-content ui-corner-bottom").insertAfter(r.panels[u-1]||r.list);x.data("destroy.tabs",true)}r.panels=r.panels.add(x)}else{f.disabled.push(u)}}});if(q){this.element.addClass("ui-tabs ui-widget ui-widget-content ui-corner-all");this.list.addClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all");this.lis.addClass("ui-state-default ui-corner-top");this.panels.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom");if(f.selected===undefined){if(location.hash){this.anchors.each(function(s,o){if(o.hash==location.hash){f.selected=s;return false}})}if(typeof f.selected!="number"&&f.cookie){f.selected=parseInt(r._cookie(),10)}if(typeof f.selected!="number"&&this.lis.filter(".ui-tabs-selected").length){f.selected=this.lis.index(this.lis.filter(".ui-tabs-selected"))}f.selected=f.selected||(this.lis.length?0:-1)}else{if(f.selected===null){f.selected=-1}}f.selected=((f.selected>=0&&this.anchors[f.selected])||f.selected<0)?f.selected:0;f.disabled=c.unique(f.disabled.concat(c.map(this.lis.filter(".ui-state-disabled"),function(s,o){return r.lis.index(s)}))).sort();if(c.inArray(f.selected,f.disabled)!=-1){f.disabled.splice(c.inArray(f.selected,f.disabled),1)}this.panels.addClass("ui-tabs-hide");this.lis.removeClass("ui-tabs-selected ui-state-active");if(f.selected>=0&&this.anchors.length){this.panels.eq(f.selected).removeClass("ui-tabs-hide");this.lis.eq(f.selected).addClass("ui-tabs-selected ui-state-active");r.element.queue("tabs",function(){r._trigger("show",null,r._ui(r.anchors[f.selected],r.panels[f.selected]))});this.load(f.selected)}c(window).bind("unload",function(){r.lis.add(r.anchors).unbind(".tabs");r.lis=r.anchors=r.panels=null})}else{f.selected=this.lis.index(this.lis.filter(".ui-tabs-selected"))}this.element[f.collapsible?"addClass":"removeClass"]("ui-tabs-collapsible");if(f.cookie){this._cookie(f.selected,f.cookie)}for(var j=0,p;(p=this.lis[j]);j++){c(p)[c.inArray(j,f.disabled)!=-1&&!c(p).hasClass("ui-tabs-selected")?"addClass":"removeClass"]("ui-state-disabled")}if(f.cache===false){this.anchors.removeData("cache.tabs")}this.lis.add(this.anchors).unbind(".tabs");if(f.event!="mouseover"){var h=function(o,i){if(i.is(":not(.ui-state-disabled)")){i.addClass("ui-state-"+o)}};var l=function(o,i){i.removeClass("ui-state-"+o)};this.lis.bind("mouseover.tabs",function(){h("hover",c(this))});this.lis.bind("mouseout.tabs",function(){l("hover",c(this))});this.anchors.bind("focus.tabs",function(){h("focus",c(this).closest("li"))});this.anchors.bind("blur.tabs",function(){l("focus",c(this).closest("li"))})}var d,k;if(f.fx){if(c.isArray(f.fx)){d=f.fx[0];k=f.fx[1]}else{d=k=f.fx}}function g(i,o){i.css({display:""});if(!c.support.opacity&&o.opacity){i[0].style.removeAttribute("filter")}}var m=k?function(i,o){c(i).closest("li").addClass("ui-tabs-selected ui-state-active");o.hide().removeClass("ui-tabs-hide").animate(k,k.duration||"normal",function(){g(o,k);r._trigger("show",null,r._ui(i,o[0]))})}:function(i,o){c(i).closest("li").addClass("ui-tabs-selected ui-state-active");o.removeClass("ui-tabs-hide");r._trigger("show",null,r._ui(i,o[0]))};var n=d?function(o,i){i.animate(d,d.duration||"normal",function(){r.lis.removeClass("ui-tabs-selected ui-state-active");i.addClass("ui-tabs-hide");g(i,d);r.element.dequeue("tabs")})}:function(o,i,s){r.lis.removeClass("ui-tabs-selected ui-state-active");i.addClass("ui-tabs-hide");r.element.dequeue("tabs")};this.anchors.bind(f.event+".tabs",function(){var o=this,u=c(this).closest("li"),i=r.panels.filter(":not(.ui-tabs-hide)"),s=c(r._sanitizeSelector(this.hash));if((u.hasClass("ui-tabs-selected")&&!f.collapsible)||u.hasClass("ui-state-disabled")||u.hasClass("ui-state-processing")||r._trigger("select",null,r._ui(this,s[0]))===false){this.blur();return false}f.selected=r.anchors.index(this);r.abort();if(f.collapsible){if(u.hasClass("ui-tabs-selected")){f.selected=-1;if(f.cookie){r._cookie(f.selected,f.cookie)}r.element.queue("tabs",function(){n(o,i)}).dequeue("tabs");this.blur();return false}else{if(!i.length){if(f.cookie){r._cookie(f.selected,f.cookie)}r.element.queue("tabs",function(){m(o,s)});r.load(r.anchors.index(this));this.blur();return false}}}if(f.cookie){r._cookie(f.selected,f.cookie)}if(s.length){if(i.length){r.element.queue("tabs",function(){n(o,i)})}r.element.queue("tabs",function(){m(o,s)});r.load(r.anchors.index(this))}else{throw"jQuery UI Tabs: Mismatching fragment identifier."}if(c.browser.msie){this.blur()}});this.anchors.bind("click.tabs",function(){return false})},destroy:function(){var d=this.options;this.abort();this.element.unbind(".tabs").removeClass("ui-tabs ui-widget ui-widget-content ui-corner-all ui-tabs-collapsible").removeData("tabs");this.list.removeClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all");this.anchors.each(function(){var e=c.data(this,"href.tabs");if(e){this.href=e}var f=c(this).unbind(".tabs");c.each(["href","load","cache"],function(g,h){f.removeData(h+".tabs")})});this.lis.unbind(".tabs").add(this.panels).each(function(){if(c.data(this,"destroy.tabs")){c(this).remove()}else{c(this).removeClass(["ui-state-default","ui-corner-top","ui-tabs-selected","ui-state-active","ui-state-hover","ui-state-focus","ui-state-disabled","ui-tabs-panel","ui-widget-content","ui-corner-bottom","ui-tabs-hide"].join(" "))}});if(d.cookie){this._cookie(null,d.cookie)}return this},add:function(g,f,e){if(e===undefined){e=this.anchors.length}var d=this,i=this.options,k=c(i.tabTemplate.replace(/#\{href\}/g,g).replace(/#\{label\}/g,f)),j=!g.indexOf("#")?g.replace("#",""):this._tabId(c("a",k)[0]);k.addClass("ui-state-default ui-corner-top").data("destroy.tabs",true);var h=c("#"+j);if(!h.length){h=c(i.panelTemplate).attr("id",j).data("destroy.tabs",true)}h.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom ui-tabs-hide");if(e>=this.lis.length){k.appendTo(this.list);h.appendTo(this.list[0].parentNode)}else{k.insertBefore(this.lis[e]);h.insertBefore(this.panels[e])}i.disabled=c.map(i.disabled,function(m,l){return m>=e?++m:m});this._tabify();if(this.anchors.length==1){i.selected=0;k.addClass("ui-tabs-selected ui-state-active");h.removeClass("ui-tabs-hide");this.element.queue("tabs",function(){d._trigger("show",null,d._ui(d.anchors[0],d.panels[0]))});this.load(0)}this._trigger("add",null,this._ui(this.anchors[e],this.panels[e]));return this},remove:function(d){var f=this.options,g=this.lis.eq(d).remove(),e=this.panels.eq(d).remove();if(g.hasClass("ui-tabs-selected")&&this.anchors.length>1){this.select(d+(d+1<this.anchors.length?1:-1))}f.disabled=c.map(c.grep(f.disabled,function(j,h){return j!=d}),function(j,h){return j>=d?--j:j});this._tabify();this._trigger("remove",null,this._ui(g.find("a")[0],e[0]));return this},enable:function(d){var e=this.options;if(c.inArray(d,e.disabled)==-1){return}this.lis.eq(d).removeClass("ui-state-disabled");e.disabled=c.grep(e.disabled,function(g,f){return g!=d});this._trigger("enable",null,this._ui(this.anchors[d],this.panels[d]));return this},disable:function(e){var d=this,f=this.options;if(e!=f.selected){this.lis.eq(e).addClass("ui-state-disabled");f.disabled.push(e);f.disabled.sort();this._trigger("disable",null,this._ui(this.anchors[e],this.panels[e]))}return this},select:function(d){if(typeof d=="string"){d=this.anchors.index(this.anchors.filter("[href$="+d+"]"))}else{if(d===null){d=-1}}if(d==-1&&this.options.collapsible){d=this.options.selected}this.anchors.eq(d).trigger(this.options.event+".tabs");return this},load:function(g){var e=this,i=this.options,d=this.anchors.eq(g)[0],f=c.data(d,"load.tabs");this.abort();if(!f||this.element.queue("tabs").length!==0&&c.data(d,"cache.tabs")){this.element.dequeue("tabs");return}this.lis.eq(g).addClass("ui-state-processing");if(i.spinner){var h=c("span",d);h.data("label.tabs",h.html()).html(i.spinner)}this.xhr=c.ajax(c.extend({},i.ajaxOptions,{url:f,success:function(k,j){c(e._sanitizeSelector(d.hash)).html(k);e._cleanup();if(i.cache){c.data(d,"cache.tabs",true)}e._trigger("load",null,e._ui(e.anchors[g],e.panels[g]));try{i.ajaxOptions.success(k,j)}catch(l){}},error:function(l,j,k){e._cleanup();e._trigger("load",null,e._ui(e.anchors[g],e.panels[g]));try{i.ajaxOptions.error(l,j,g,d)}catch(k){}}}));e.element.dequeue("tabs");return this},abort:function(){this.element.queue([]);this.panels.stop(false,true);this.element.queue("tabs",this.element.queue("tabs").splice(-2,2));if(this.xhr){this.xhr.abort();delete this.xhr}this._cleanup();return this},url:function(e,d){this.anchors.eq(e).removeData("cache.tabs").data("load.tabs",d);return this},length:function(){return this.anchors.length}});c.extend(c.ui.tabs,{version:"1.8"});c.extend(c.ui.tabs.prototype,{rotation:null,rotate:function(f,h){var d=this,i=this.options;var e=d._rotate||(d._rotate=function(j){clearTimeout(d.rotation);d.rotation=setTimeout(function(){var k=i.selected;d.select(++k<d.anchors.length?k:0)},f);if(j){j.stopPropagation()}});var g=d._unrotate||(d._unrotate=!h?function(j){if(j.clientX){d.rotate(null)}}:function(j){t=i.selected;e()});if(f){this.element.bind("tabsshow",e);this.anchors.bind(i.event+".tabs",g);e()}else{clearTimeout(d.rotation);this.element.unbind("tabsshow",e);this.anchors.unbind(i.event+".tabs",g);delete this._rotate;delete this._unrotate}return this}})})(jQuery);;/*
 * jQuery UI Datepicker 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Datepicker
 *
 * Depends:
 *	jquery.ui.core.js
 */(function($){$.extend($.ui,{datepicker:{version:"1.8"}});var PROP_NAME="datepicker";var dpuuid=new Date().getTime();function Datepicker(){this.debug=false;this._curInst=null;this._keyEvent=false;this._disabledInputs=[];this._datepickerShowing=false;this._inDialog=false;this._mainDivId="ui-datepicker-div";this._inlineClass="ui-datepicker-inline";this._appendClass="ui-datepicker-append";this._triggerClass="ui-datepicker-trigger";this._dialogClass="ui-datepicker-dialog";this._disableClass="ui-datepicker-disabled";this._unselectableClass="ui-datepicker-unselectable";this._currentClass="ui-datepicker-current-day";this._dayOverClass="ui-datepicker-days-cell-over";this.regional=[];this.regional[""]={closeText:"Done",prevText:"Prev",nextText:"Next",currentText:"Today",monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],monthNamesShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],dayNamesShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],dayNamesMin:["Su","Mo","Tu","We","Th","Fr","Sa"],weekHeader:"Wk",dateFormat:"mm/dd/yy",firstDay:0,isRTL:false,showMonthAfterYear:false,yearSuffix:""};this._defaults={showOn:"focus",showAnim:"show",showOptions:{},defaultDate:null,appendText:"",buttonText:"...",buttonImage:"",buttonImageOnly:false,hideIfNoPrevNext:false,navigationAsDateFormat:false,gotoCurrent:false,changeMonth:false,changeYear:false,yearRange:"c-10:c+10",showOtherMonths:false,selectOtherMonths:false,showWeek:false,calculateWeek:this.iso8601Week,shortYearCutoff:"+10",minDate:null,maxDate:null,duration:"_default",beforeShowDay:null,beforeShow:null,onSelect:null,onChangeMonthYear:null,onClose:null,numberOfMonths:1,showCurrentAtPos:0,stepMonths:1,stepBigMonths:12,altField:"",altFormat:"",constrainInput:true,showButtonPanel:false,autoSize:false};$.extend(this._defaults,this.regional[""]);this.dpDiv=$('<div id="'+this._mainDivId+'" class="ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all ui-helper-hidden-accessible"></div>')}$.extend(Datepicker.prototype,{markerClassName:"hasDatepicker",log:function(){if(this.debug){console.log.apply("",arguments)}},_widgetDatepicker:function(){return this.dpDiv},setDefaults:function(settings){extendRemove(this._defaults,settings||{});return this},_attachDatepicker:function(target,settings){var inlineSettings=null;for(var attrName in this._defaults){var attrValue=target.getAttribute("date:"+attrName);if(attrValue){inlineSettings=inlineSettings||{};try{inlineSettings[attrName]=eval(attrValue)}catch(err){inlineSettings[attrName]=attrValue}}}var nodeName=target.nodeName.toLowerCase();var inline=(nodeName=="div"||nodeName=="span");if(!target.id){target.id="dp"+(++this.uuid)}var inst=this._newInst($(target),inline);inst.settings=$.extend({},settings||{},inlineSettings||{});if(nodeName=="input"){this._connectDatepicker(target,inst)}else{if(inline){this._inlineDatepicker(target,inst)}}},_newInst:function(target,inline){var id=target[0].id.replace(/([^A-Za-z0-9_])/g,"\\\\$1");return{id:id,input:target,selectedDay:0,selectedMonth:0,selectedYear:0,drawMonth:0,drawYear:0,inline:inline,dpDiv:(!inline?this.dpDiv:$('<div class="'+this._inlineClass+' ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>'))}},_connectDatepicker:function(target,inst){var input=$(target);inst.append=$([]);inst.trigger=$([]);if(input.hasClass(this.markerClassName)){return}this._attachments(input,inst);input.addClass(this.markerClassName).keydown(this._doKeyDown).keypress(this._doKeyPress).keyup(this._doKeyUp).bind("setData.datepicker",function(event,key,value){inst.settings[key]=value}).bind("getData.datepicker",function(event,key){return this._get(inst,key)});this._autoSize(inst);$.data(target,PROP_NAME,inst)},_attachments:function(input,inst){var appendText=this._get(inst,"appendText");var isRTL=this._get(inst,"isRTL");if(inst.append){inst.append.remove()}if(appendText){inst.append=$('<span class="'+this._appendClass+'">'+appendText+"</span>");input[isRTL?"before":"after"](inst.append)}input.unbind("focus",this._showDatepicker);if(inst.trigger){inst.trigger.remove()}var showOn=this._get(inst,"showOn");if(showOn=="focus"||showOn=="both"){input.focus(this._showDatepicker)}if(showOn=="button"||showOn=="both"){var buttonText=this._get(inst,"buttonText");var buttonImage=this._get(inst,"buttonImage");inst.trigger=$(this._get(inst,"buttonImageOnly")?$("<img/>").addClass(this._triggerClass).attr({src:buttonImage,alt:buttonText,title:buttonText}):$('<button type="button"></button>').addClass(this._triggerClass).html(buttonImage==""?buttonText:$("<img/>").attr({src:buttonImage,alt:buttonText,title:buttonText})));input[isRTL?"before":"after"](inst.trigger);inst.trigger.click(function(){if($.datepicker._datepickerShowing&&$.datepicker._lastInput==input[0]){$.datepicker._hideDatepicker()}else{$.datepicker._showDatepicker(input[0])}return false})}},_autoSize:function(inst){if(this._get(inst,"autoSize")&&!inst.inline){var date=new Date(2009,12-1,20);var dateFormat=this._get(inst,"dateFormat");if(dateFormat.match(/[DM]/)){var findMax=function(names){var max=0;var maxI=0;for(var i=0;i<names.length;i++){if(names[i].length>max){max=names[i].length;maxI=i}}return maxI};date.setMonth(findMax(this._get(inst,(dateFormat.match(/MM/)?"monthNames":"monthNamesShort"))));date.setDate(findMax(this._get(inst,(dateFormat.match(/DD/)?"dayNames":"dayNamesShort")))+20-date.getDay())}inst.input.attr("size",this._formatDate(inst,date).length)}},_inlineDatepicker:function(target,inst){var divSpan=$(target);if(divSpan.hasClass(this.markerClassName)){return}divSpan.addClass(this.markerClassName).append(inst.dpDiv).bind("setData.datepicker",function(event,key,value){inst.settings[key]=value}).bind("getData.datepicker",function(event,key){return this._get(inst,key)});$.data(target,PROP_NAME,inst);this._setDate(inst,this._getDefaultDate(inst),true);this._updateDatepicker(inst);this._updateAlternate(inst)},_dialogDatepicker:function(input,date,onSelect,settings,pos){var inst=this._dialogInst;if(!inst){var id="dp"+(++this.uuid);this._dialogInput=$('<input type="text" id="'+id+'" style="position: absolute; top: -100px; width: 0px; z-index: -10;"/>');this._dialogInput.keydown(this._doKeyDown);$("body").append(this._dialogInput);inst=this._dialogInst=this._newInst(this._dialogInput,false);inst.settings={};$.data(this._dialogInput[0],PROP_NAME,inst)}extendRemove(inst.settings,settings||{});date=(date&&date.constructor==Date?this._formatDate(inst,date):date);this._dialogInput.val(date);this._pos=(pos?(pos.length?pos:[pos.pageX,pos.pageY]):null);if(!this._pos){var browserWidth=document.documentElement.clientWidth;var browserHeight=document.documentElement.clientHeight;var scrollX=document.documentElement.scrollLeft||document.body.scrollLeft;var scrollY=document.documentElement.scrollTop||document.body.scrollTop;this._pos=[(browserWidth/2)-100+scrollX,(browserHeight/2)-150+scrollY]}this._dialogInput.css("left",(this._pos[0]+20)+"px").css("top",this._pos[1]+"px");inst.settings.onSelect=onSelect;this._inDialog=true;this.dpDiv.addClass(this._dialogClass);this._showDatepicker(this._dialogInput[0]);if($.blockUI){$.blockUI(this.dpDiv)}$.data(this._dialogInput[0],PROP_NAME,inst);return this},_destroyDatepicker:function(target){var $target=$(target);var inst=$.data(target,PROP_NAME);if(!$target.hasClass(this.markerClassName)){return}var nodeName=target.nodeName.toLowerCase();$.removeData(target,PROP_NAME);if(nodeName=="input"){inst.append.remove();inst.trigger.remove();$target.removeClass(this.markerClassName).unbind("focus",this._showDatepicker).unbind("keydown",this._doKeyDown).unbind("keypress",this._doKeyPress).unbind("keyup",this._doKeyUp)}else{if(nodeName=="div"||nodeName=="span"){$target.removeClass(this.markerClassName).empty()}}},_enableDatepicker:function(target){var $target=$(target);var inst=$.data(target,PROP_NAME);if(!$target.hasClass(this.markerClassName)){return}var nodeName=target.nodeName.toLowerCase();if(nodeName=="input"){target.disabled=false;inst.trigger.filter("button").each(function(){this.disabled=false}).end().filter("img").css({opacity:"1.0",cursor:""})}else{if(nodeName=="div"||nodeName=="span"){var inline=$target.children("."+this._inlineClass);inline.children().removeClass("ui-state-disabled")}}this._disabledInputs=$.map(this._disabledInputs,function(value){return(value==target?null:value)})},_disableDatepicker:function(target){var $target=$(target);var inst=$.data(target,PROP_NAME);if(!$target.hasClass(this.markerClassName)){return}var nodeName=target.nodeName.toLowerCase();if(nodeName=="input"){target.disabled=true;inst.trigger.filter("button").each(function(){this.disabled=true}).end().filter("img").css({opacity:"0.5",cursor:"default"})}else{if(nodeName=="div"||nodeName=="span"){var inline=$target.children("."+this._inlineClass);inline.children().addClass("ui-state-disabled")}}this._disabledInputs=$.map(this._disabledInputs,function(value){return(value==target?null:value)});this._disabledInputs[this._disabledInputs.length]=target},_isDisabledDatepicker:function(target){if(!target){return false}for(var i=0;i<this._disabledInputs.length;i++){if(this._disabledInputs[i]==target){return true}}return false},_getInst:function(target){try{return $.data(target,PROP_NAME)}catch(err){throw"Missing instance data for this datepicker"}},_optionDatepicker:function(target,name,value){var inst=this._getInst(target);if(arguments.length==2&&typeof name=="string"){return(name=="defaults"?$.extend({},$.datepicker._defaults):(inst?(name=="all"?$.extend({},inst.settings):this._get(inst,name)):null))}var settings=name||{};if(typeof name=="string"){settings={};settings[name]=value}if(inst){if(this._curInst==inst){this._hideDatepicker()}var date=this._getDateDatepicker(target,true);extendRemove(inst.settings,settings);this._attachments($(target),inst);this._autoSize(inst);this._setDateDatepicker(target,date);this._updateDatepicker(inst)}},_changeDatepicker:function(target,name,value){this._optionDatepicker(target,name,value)},_refreshDatepicker:function(target){var inst=this._getInst(target);if(inst){this._updateDatepicker(inst)}},_setDateDatepicker:function(target,date){var inst=this._getInst(target);if(inst){this._setDate(inst,date);this._updateDatepicker(inst);this._updateAlternate(inst)}},_getDateDatepicker:function(target,noDefault){var inst=this._getInst(target);if(inst&&!inst.inline){this._setDateFromField(inst,noDefault)}return(inst?this._getDate(inst):null)},_doKeyDown:function(event){var inst=$.datepicker._getInst(event.target);var handled=true;var isRTL=inst.dpDiv.is(".ui-datepicker-rtl");inst._keyEvent=true;if($.datepicker._datepickerShowing){switch(event.keyCode){case 9:$.datepicker._hideDatepicker();handled=false;break;case 13:var sel=$("td."+$.datepicker._dayOverClass,inst.dpDiv).add($("td."+$.datepicker._currentClass,inst.dpDiv));if(sel[0]){$.datepicker._selectDay(event.target,inst.selectedMonth,inst.selectedYear,sel[0])}else{$.datepicker._hideDatepicker()}return false;break;case 27:$.datepicker._hideDatepicker();break;case 33:$.datepicker._adjustDate(event.target,(event.ctrlKey?-$.datepicker._get(inst,"stepBigMonths"):-$.datepicker._get(inst,"stepMonths")),"M");break;case 34:$.datepicker._adjustDate(event.target,(event.ctrlKey?+$.datepicker._get(inst,"stepBigMonths"):+$.datepicker._get(inst,"stepMonths")),"M");break;case 35:if(event.ctrlKey||event.metaKey){$.datepicker._clearDate(event.target)}handled=event.ctrlKey||event.metaKey;break;case 36:if(event.ctrlKey||event.metaKey){$.datepicker._gotoToday(event.target)}handled=event.ctrlKey||event.metaKey;break;case 37:if(event.ctrlKey||event.metaKey){$.datepicker._adjustDate(event.target,(isRTL?+1:-1),"D")}handled=event.ctrlKey||event.metaKey;if(event.originalEvent.altKey){$.datepicker._adjustDate(event.target,(event.ctrlKey?-$.datepicker._get(inst,"stepBigMonths"):-$.datepicker._get(inst,"stepMonths")),"M")}break;case 38:if(event.ctrlKey||event.metaKey){$.datepicker._adjustDate(event.target,-7,"D")}handled=event.ctrlKey||event.metaKey;break;case 39:if(event.ctrlKey||event.metaKey){$.datepicker._adjustDate(event.target,(isRTL?-1:+1),"D")}handled=event.ctrlKey||event.metaKey;if(event.originalEvent.altKey){$.datepicker._adjustDate(event.target,(event.ctrlKey?+$.datepicker._get(inst,"stepBigMonths"):+$.datepicker._get(inst,"stepMonths")),"M")}break;case 40:if(event.ctrlKey||event.metaKey){$.datepicker._adjustDate(event.target,+7,"D")}handled=event.ctrlKey||event.metaKey;break;default:handled=false}}else{if(event.keyCode==36&&event.ctrlKey){$.datepicker._showDatepicker(this)}else{handled=false}}if(handled){event.preventDefault();event.stopPropagation()}},_doKeyPress:function(event){var inst=$.datepicker._getInst(event.target);if($.datepicker._get(inst,"constrainInput")){var chars=$.datepicker._possibleChars($.datepicker._get(inst,"dateFormat"));var chr=String.fromCharCode(event.charCode==undefined?event.keyCode:event.charCode);return event.ctrlKey||(chr<" "||!chars||chars.indexOf(chr)>-1)}},_doKeyUp:function(event){var inst=$.datepicker._getInst(event.target);if(inst.input.val()!=inst.lastVal){try{var date=$.datepicker.parseDate($.datepicker._get(inst,"dateFormat"),(inst.input?inst.input.val():null),$.datepicker._getFormatConfig(inst));if(date){$.datepicker._setDateFromField(inst);$.datepicker._updateAlternate(inst);$.datepicker._updateDatepicker(inst)}}catch(event){$.datepicker.log(event)}}return true},_showDatepicker:function(input){input=input.target||input;if(input.nodeName.toLowerCase()!="input"){input=$("input",input.parentNode)[0]}if($.datepicker._isDisabledDatepicker(input)||$.datepicker._lastInput==input){return}var inst=$.datepicker._getInst(input);if($.datepicker._curInst&&$.datepicker._curInst!=inst){$.datepicker._curInst.dpDiv.stop(true,true)}var beforeShow=$.datepicker._get(inst,"beforeShow");extendRemove(inst.settings,(beforeShow?beforeShow.apply(input,[input,inst]):{}));inst.lastVal=null;$.datepicker._lastInput=input;$.datepicker._setDateFromField(inst);if($.datepicker._inDialog){input.value=""}if(!$.datepicker._pos){$.datepicker._pos=$.datepicker._findPos(input);$.datepicker._pos[1]+=input.offsetHeight}var isFixed=false;$(input).parents().each(function(){isFixed|=$(this).css("position")=="fixed";return !isFixed});if(isFixed&&$.browser.opera){$.datepicker._pos[0]-=document.documentElement.scrollLeft;$.datepicker._pos[1]-=document.documentElement.scrollTop}var offset={left:$.datepicker._pos[0],top:$.datepicker._pos[1]};$.datepicker._pos=null;inst.dpDiv.css({position:"absolute",display:"block",top:"-1000px"});$.datepicker._updateDatepicker(inst);offset=$.datepicker._checkOffset(inst,offset,isFixed);inst.dpDiv.css({position:($.datepicker._inDialog&&$.blockUI?"static":(isFixed?"fixed":"absolute")),display:"none",left:offset.left+"px",top:offset.top+"px"});if(!inst.inline){var showAnim=$.datepicker._get(inst,"showAnim");var duration=$.datepicker._get(inst,"duration");var postProcess=function(){$.datepicker._datepickerShowing=true;var borders=$.datepicker._getBorders(inst.dpDiv);inst.dpDiv.find("iframe.ui-datepicker-cover").css({left:-borders[0],top:-borders[1],width:inst.dpDiv.outerWidth(),height:inst.dpDiv.outerHeight()})};inst.dpDiv.zIndex($(input).zIndex()+1);if($.effects&&$.effects[showAnim]){inst.dpDiv.show(showAnim,$.datepicker._get(inst,"showOptions"),duration,postProcess)}else{inst.dpDiv[showAnim||"show"]((showAnim?duration:null),postProcess)}if(!showAnim||!duration){postProcess()}if(inst.input.is(":visible")&&!inst.input.is(":disabled")){inst.input.focus()}$.datepicker._curInst=inst}},_updateDatepicker:function(inst){var self=this;var borders=$.datepicker._getBorders(inst.dpDiv);inst.dpDiv.empty().append(this._generateHTML(inst)).find("iframe.ui-datepicker-cover").css({left:-borders[0],top:-borders[1],width:inst.dpDiv.outerWidth(),height:inst.dpDiv.outerHeight()}).end().find("button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a").bind("mouseout",function(){$(this).removeClass("ui-state-hover");if(this.className.indexOf("ui-datepicker-prev")!=-1){$(this).removeClass("ui-datepicker-prev-hover")}if(this.className.indexOf("ui-datepicker-next")!=-1){$(this).removeClass("ui-datepicker-next-hover")}}).bind("mouseover",function(){if(!self._isDisabledDatepicker(inst.inline?inst.dpDiv.parent()[0]:inst.input[0])){$(this).parents(".ui-datepicker-calendar").find("a").removeClass("ui-state-hover");$(this).addClass("ui-state-hover");if(this.className.indexOf("ui-datepicker-prev")!=-1){$(this).addClass("ui-datepicker-prev-hover")}if(this.className.indexOf("ui-datepicker-next")!=-1){$(this).addClass("ui-datepicker-next-hover")}}}).end().find("."+this._dayOverClass+" a").trigger("mouseover").end();var numMonths=this._getNumberOfMonths(inst);var cols=numMonths[1];var width=17;if(cols>1){inst.dpDiv.addClass("ui-datepicker-multi-"+cols).css("width",(width*cols)+"em")}else{inst.dpDiv.removeClass("ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4").width("")}inst.dpDiv[(numMonths[0]!=1||numMonths[1]!=1?"add":"remove")+"Class"]("ui-datepicker-multi");inst.dpDiv[(this._get(inst,"isRTL")?"add":"remove")+"Class"]("ui-datepicker-rtl");if(inst==$.datepicker._curInst&&$.datepicker._datepickerShowing&&inst.input&&inst.input.is(":visible")&&!inst.input.is(":disabled")){inst.input.focus()}},_getBorders:function(elem){var convert=function(value){return{thin:1,medium:2,thick:3}[value]||value};return[parseFloat(convert(elem.css("border-left-width"))),parseFloat(convert(elem.css("border-top-width")))]},_checkOffset:function(inst,offset,isFixed){var dpWidth=inst.dpDiv.outerWidth();var dpHeight=inst.dpDiv.outerHeight();var inputWidth=inst.input?inst.input.outerWidth():0;var inputHeight=inst.input?inst.input.outerHeight():0;var viewWidth=document.documentElement.clientWidth+$(document).scrollLeft();var viewHeight=document.documentElement.clientHeight+$(document).scrollTop();offset.left-=(this._get(inst,"isRTL")?(dpWidth-inputWidth):0);offset.left-=(isFixed&&offset.left==inst.input.offset().left)?$(document).scrollLeft():0;offset.top-=(isFixed&&offset.top==(inst.input.offset().top+inputHeight))?$(document).scrollTop():0;offset.left-=Math.min(offset.left,(offset.left+dpWidth>viewWidth&&viewWidth>dpWidth)?Math.abs(offset.left+dpWidth-viewWidth):0);offset.top-=Math.min(offset.top,(offset.top+dpHeight>viewHeight&&viewHeight>dpHeight)?Math.abs(dpHeight+inputHeight):0);return offset},_findPos:function(obj){var inst=this._getInst(obj);var isRTL=this._get(inst,"isRTL");while(obj&&(obj.type=="hidden"||obj.nodeType!=1)){obj=obj[isRTL?"previousSibling":"nextSibling"]}var position=$(obj).offset();return[position.left,position.top]},_hideDatepicker:function(input){var inst=this._curInst;if(!inst||(input&&inst!=$.data(input,PROP_NAME))){return}if(this._datepickerShowing){var showAnim=this._get(inst,"showAnim");var duration=this._get(inst,"duration");var postProcess=function(){$.datepicker._tidyDialog(inst);this._curInst=null};if($.effects&&$.effects[showAnim]){inst.dpDiv.hide(showAnim,$.datepicker._get(inst,"showOptions"),duration,postProcess)}else{inst.dpDiv[(showAnim=="slideDown"?"slideUp":(showAnim=="fadeIn"?"fadeOut":"hide"))]((showAnim?duration:null),postProcess)}if(!showAnim){postProcess()}var onClose=this._get(inst,"onClose");if(onClose){onClose.apply((inst.input?inst.input[0]:null),[(inst.input?inst.input.val():""),inst])}this._datepickerShowing=false;this._lastInput=null;if(this._inDialog){this._dialogInput.css({position:"absolute",left:"0",top:"-100px"});if($.blockUI){$.unblockUI();$("body").append(this.dpDiv)}}this._inDialog=false}},_tidyDialog:function(inst){inst.dpDiv.removeClass(this._dialogClass).unbind(".ui-datepicker-calendar")},_checkExternalClick:function(event){if(!$.datepicker._curInst){return}var $target=$(event.target);if($target[0].id!=$.datepicker._mainDivId&&$target.parents("#"+$.datepicker._mainDivId).length==0&&!$target.hasClass($.datepicker.markerClassName)&&!$target.hasClass($.datepicker._triggerClass)&&$.datepicker._datepickerShowing&&!($.datepicker._inDialog&&$.blockUI)){$.datepicker._hideDatepicker()}},_adjustDate:function(id,offset,period){var target=$(id);var inst=this._getInst(target[0]);if(this._isDisabledDatepicker(target[0])){return}this._adjustInstDate(inst,offset+(period=="M"?this._get(inst,"showCurrentAtPos"):0),period);this._updateDatepicker(inst)},_gotoToday:function(id){var target=$(id);var inst=this._getInst(target[0]);if(this._get(inst,"gotoCurrent")&&inst.currentDay){inst.selectedDay=inst.currentDay;inst.drawMonth=inst.selectedMonth=inst.currentMonth;inst.drawYear=inst.selectedYear=inst.currentYear}else{var date=new Date();inst.selectedDay=date.getDate();inst.drawMonth=inst.selectedMonth=date.getMonth();inst.drawYear=inst.selectedYear=date.getFullYear()}this._notifyChange(inst);this._adjustDate(target)},_selectMonthYear:function(id,select,period){var target=$(id);var inst=this._getInst(target[0]);inst._selectingMonthYear=false;inst["selected"+(period=="M"?"Month":"Year")]=inst["draw"+(period=="M"?"Month":"Year")]=parseInt(select.options[select.selectedIndex].value,10);this._notifyChange(inst);this._adjustDate(target)},_clickMonthYear:function(id){var target=$(id);var inst=this._getInst(target[0]);if(inst.input&&inst._selectingMonthYear&&!$.browser.msie){inst.input.focus()}inst._selectingMonthYear=!inst._selectingMonthYear},_selectDay:function(id,month,year,td){var target=$(id);if($(td).hasClass(this._unselectableClass)||this._isDisabledDatepicker(target[0])){return}var inst=this._getInst(target[0]);inst.selectedDay=inst.currentDay=$("a",td).html();inst.selectedMonth=inst.currentMonth=month;inst.selectedYear=inst.currentYear=year;this._selectDate(id,this._formatDate(inst,inst.currentDay,inst.currentMonth,inst.currentYear))},_clearDate:function(id){var target=$(id);var inst=this._getInst(target[0]);this._selectDate(target,"")},_selectDate:function(id,dateStr){var target=$(id);var inst=this._getInst(target[0]);dateStr=(dateStr!=null?dateStr:this._formatDate(inst));if(inst.input){inst.input.val(dateStr)}this._updateAlternate(inst);var onSelect=this._get(inst,"onSelect");if(onSelect){onSelect.apply((inst.input?inst.input[0]:null),[dateStr,inst])}else{if(inst.input){inst.input.trigger("change")}}if(inst.inline){this._updateDatepicker(inst)}else{this._hideDatepicker();this._lastInput=inst.input[0];if(typeof(inst.input[0])!="object"){inst.input.focus()}this._lastInput=null}},_updateAlternate:function(inst){var altField=this._get(inst,"altField");if(altField){var altFormat=this._get(inst,"altFormat")||this._get(inst,"dateFormat");var date=this._getDate(inst);var dateStr=this.formatDate(altFormat,date,this._getFormatConfig(inst));$(altField).each(function(){$(this).val(dateStr)})}},noWeekends:function(date){var day=date.getDay();return[(day>0&&day<6),""]},iso8601Week:function(date){var checkDate=new Date(date.getTime());checkDate.setDate(checkDate.getDate()+4-(checkDate.getDay()||7));var time=checkDate.getTime();checkDate.setMonth(0);checkDate.setDate(1);return Math.floor(Math.round((time-checkDate)/86400000)/7)+1},parseDate:function(format,value,settings){if(format==null||value==null){throw"Invalid arguments"}value=(typeof value=="object"?value.toString():value+"");if(value==""){return null}var shortYearCutoff=(settings?settings.shortYearCutoff:null)||this._defaults.shortYearCutoff;var dayNamesShort=(settings?settings.dayNamesShort:null)||this._defaults.dayNamesShort;var dayNames=(settings?settings.dayNames:null)||this._defaults.dayNames;var monthNamesShort=(settings?settings.monthNamesShort:null)||this._defaults.monthNamesShort;var monthNames=(settings?settings.monthNames:null)||this._defaults.monthNames;var year=-1;var month=-1;var day=-1;var doy=-1;var literal=false;var lookAhead=function(match){var matches=(iFormat+1<format.length&&format.charAt(iFormat+1)==match);if(matches){iFormat++}return matches};var getNumber=function(match){lookAhead(match);var size=(match=="@"?14:(match=="!"?20:(match=="y"?4:(match=="o"?3:2))));var digits=new RegExp("^\\d{1,"+size+"}");var num=value.substring(iValue).match(digits);if(!num){throw"Missing number at position "+iValue}iValue+=num[0].length;return parseInt(num[0],10)};var getName=function(match,shortNames,longNames){var names=(lookAhead(match)?longNames:shortNames);for(var i=0;i<names.length;i++){if(value.substr(iValue,names[i].length)==names[i]){iValue+=names[i].length;return i+1}}throw"Unknown name at position "+iValue};var checkLiteral=function(){if(value.charAt(iValue)!=format.charAt(iFormat)){throw"Unexpected literal at position "+iValue}iValue++};var iValue=0;for(var iFormat=0;iFormat<format.length;iFormat++){if(literal){if(format.charAt(iFormat)=="'"&&!lookAhead("'")){literal=false}else{checkLiteral()}}else{switch(format.charAt(iFormat)){case"d":day=getNumber("d");break;case"D":getName("D",dayNamesShort,dayNames);break;case"o":doy=getNumber("o");break;case"m":month=getNumber("m");break;case"M":month=getName("M",monthNamesShort,monthNames);break;case"y":year=getNumber("y");break;case"@":var date=new Date(getNumber("@"));year=date.getFullYear();month=date.getMonth()+1;day=date.getDate();break;case"!":var date=new Date((getNumber("!")-this._ticksTo1970)/10000);year=date.getFullYear();month=date.getMonth()+1;day=date.getDate();break;case"'":if(lookAhead("'")){checkLiteral()}else{literal=true}break;default:checkLiteral()}}}if(year==-1){year=new Date().getFullYear()}else{if(year<100){year+=new Date().getFullYear()-new Date().getFullYear()%100+(year<=shortYearCutoff?0:-100)}}if(doy>-1){month=1;day=doy;do{var dim=this._getDaysInMonth(year,month-1);if(day<=dim){break}month++;day-=dim}while(true)}var date=this._daylightSavingAdjust(new Date(year,month-1,day));if(date.getFullYear()!=year||date.getMonth()+1!=month||date.getDate()!=day){throw"Invalid date"}return date},ATOM:"yy-mm-dd",COOKIE:"D, dd M yy",ISO_8601:"yy-mm-dd",RFC_822:"D, d M y",RFC_850:"DD, dd-M-y",RFC_1036:"D, d M y",RFC_1123:"D, d M yy",RFC_2822:"D, d M yy",RSS:"D, d M y",TICKS:"!",TIMESTAMP:"@",W3C:"yy-mm-dd",_ticksTo1970:(((1970-1)*365+Math.floor(1970/4)-Math.floor(1970/100)+Math.floor(1970/400))*24*60*60*10000000),formatDate:function(format,date,settings){if(!date){return""}var dayNamesShort=(settings?settings.dayNamesShort:null)||this._defaults.dayNamesShort;var dayNames=(settings?settings.dayNames:null)||this._defaults.dayNames;var monthNamesShort=(settings?settings.monthNamesShort:null)||this._defaults.monthNamesShort;var monthNames=(settings?settings.monthNames:null)||this._defaults.monthNames;var lookAhead=function(match){var matches=(iFormat+1<format.length&&format.charAt(iFormat+1)==match);if(matches){iFormat++}return matches};var formatNumber=function(match,value,len){var num=""+value;if(lookAhead(match)){while(num.length<len){num="0"+num}}return num};var formatName=function(match,value,shortNames,longNames){return(lookAhead(match)?longNames[value]:shortNames[value])};var output="";var literal=false;if(date){for(var iFormat=0;iFormat<format.length;iFormat++){if(literal){if(format.charAt(iFormat)=="'"&&!lookAhead("'")){literal=false}else{output+=format.charAt(iFormat)}}else{switch(format.charAt(iFormat)){case"d":output+=formatNumber("d",date.getDate(),2);break;case"D":output+=formatName("D",date.getDay(),dayNamesShort,dayNames);break;case"o":output+=formatNumber("o",(date.getTime()-new Date(date.getFullYear(),0,0).getTime())/86400000,3);break;case"m":output+=formatNumber("m",date.getMonth()+1,2);break;case"M":output+=formatName("M",date.getMonth(),monthNamesShort,monthNames);break;case"y":output+=(lookAhead("y")?date.getFullYear():(date.getYear()%100<10?"0":"")+date.getYear()%100);break;case"@":output+=date.getTime();break;case"!":output+=date.getTime()*10000+this._ticksTo1970;break;case"'":if(lookAhead("'")){output+="'"}else{literal=true}break;default:output+=format.charAt(iFormat)}}}}return output},_possibleChars:function(format){var chars="";var literal=false;var lookAhead=function(match){var matches=(iFormat+1<format.length&&format.charAt(iFormat+1)==match);if(matches){iFormat++}return matches};for(var iFormat=0;iFormat<format.length;iFormat++){if(literal){if(format.charAt(iFormat)=="'"&&!lookAhead("'")){literal=false}else{chars+=format.charAt(iFormat)}}else{switch(format.charAt(iFormat)){case"d":case"m":case"y":case"@":chars+="0123456789";break;case"D":case"M":return null;case"'":if(lookAhead("'")){chars+="'"}else{literal=true}break;default:chars+=format.charAt(iFormat)}}}return chars},_get:function(inst,name){return inst.settings[name]!==undefined?inst.settings[name]:this._defaults[name]},_setDateFromField:function(inst,noDefault){if(inst.input.val()==inst.lastVal){return}var dateFormat=this._get(inst,"dateFormat");var dates=inst.lastVal=inst.input?inst.input.val():null;var date,defaultDate;date=defaultDate=this._getDefaultDate(inst);var settings=this._getFormatConfig(inst);try{date=this.parseDate(dateFormat,dates,settings)||defaultDate}catch(event){this.log(event);dates=(noDefault?"":dates)}inst.selectedDay=date.getDate();inst.drawMonth=inst.selectedMonth=date.getMonth();inst.drawYear=inst.selectedYear=date.getFullYear();inst.currentDay=(dates?date.getDate():0);inst.currentMonth=(dates?date.getMonth():0);inst.currentYear=(dates?date.getFullYear():0);this._adjustInstDate(inst)},_getDefaultDate:function(inst){return this._restrictMinMax(inst,this._determineDate(inst,this._get(inst,"defaultDate"),new Date()))},_determineDate:function(inst,date,defaultDate){var offsetNumeric=function(offset){var date=new Date();date.setDate(date.getDate()+offset);return date};var offsetString=function(offset){try{return $.datepicker.parseDate($.datepicker._get(inst,"dateFormat"),offset,$.datepicker._getFormatConfig(inst))}catch(e){}var date=(offset.toLowerCase().match(/^c/)?$.datepicker._getDate(inst):null)||new Date();var year=date.getFullYear();var month=date.getMonth();var day=date.getDate();var pattern=/([+-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g;var matches=pattern.exec(offset);while(matches){switch(matches[2]||"d"){case"d":case"D":day+=parseInt(matches[1],10);break;case"w":case"W":day+=parseInt(matches[1],10)*7;break;case"m":case"M":month+=parseInt(matches[1],10);day=Math.min(day,$.datepicker._getDaysInMonth(year,month));break;case"y":case"Y":year+=parseInt(matches[1],10);day=Math.min(day,$.datepicker._getDaysInMonth(year,month));break}matches=pattern.exec(offset)}return new Date(year,month,day)};date=(date==null?defaultDate:(typeof date=="string"?offsetString(date):(typeof date=="number"?(isNaN(date)?defaultDate:offsetNumeric(date)):date)));date=(date&&date.toString()=="Invalid Date"?defaultDate:date);if(date){date.setHours(0);date.setMinutes(0);date.setSeconds(0);date.setMilliseconds(0)}return this._daylightSavingAdjust(date)},_daylightSavingAdjust:function(date){if(!date){return null}date.setHours(date.getHours()>12?date.getHours()+2:0);return date},_setDate:function(inst,date,noChange){var clear=!(date);var origMonth=inst.selectedMonth;var origYear=inst.selectedYear;date=this._restrictMinMax(inst,this._determineDate(inst,date,new Date()));inst.selectedDay=inst.currentDay=date.getDate();inst.drawMonth=inst.selectedMonth=inst.currentMonth=date.getMonth();inst.drawYear=inst.selectedYear=inst.currentYear=date.getFullYear();if((origMonth!=inst.selectedMonth||origYear!=inst.selectedYear)&&!noChange){this._notifyChange(inst)}this._adjustInstDate(inst);if(inst.input){inst.input.val(clear?"":this._formatDate(inst))}},_getDate:function(inst){var startDate=(!inst.currentYear||(inst.input&&inst.input.val()=="")?null:this._daylightSavingAdjust(new Date(inst.currentYear,inst.currentMonth,inst.currentDay)));return startDate},_generateHTML:function(inst){var today=new Date();today=this._daylightSavingAdjust(new Date(today.getFullYear(),today.getMonth(),today.getDate()));var isRTL=this._get(inst,"isRTL");var showButtonPanel=this._get(inst,"showButtonPanel");var hideIfNoPrevNext=this._get(inst,"hideIfNoPrevNext");var navigationAsDateFormat=this._get(inst,"navigationAsDateFormat");var numMonths=this._getNumberOfMonths(inst);var showCurrentAtPos=this._get(inst,"showCurrentAtPos");var stepMonths=this._get(inst,"stepMonths");var isMultiMonth=(numMonths[0]!=1||numMonths[1]!=1);var currentDate=this._daylightSavingAdjust((!inst.currentDay?new Date(9999,9,9):new Date(inst.currentYear,inst.currentMonth,inst.currentDay)));var minDate=this._getMinMaxDate(inst,"min");var maxDate=this._getMinMaxDate(inst,"max");var drawMonth=inst.drawMonth-showCurrentAtPos;var drawYear=inst.drawYear;if(drawMonth<0){drawMonth+=12;drawYear--}if(maxDate){var maxDraw=this._daylightSavingAdjust(new Date(maxDate.getFullYear(),maxDate.getMonth()-(numMonths[0]*numMonths[1])+1,maxDate.getDate()));maxDraw=(minDate&&maxDraw<minDate?minDate:maxDraw);while(this._daylightSavingAdjust(new Date(drawYear,drawMonth,1))>maxDraw){drawMonth--;if(drawMonth<0){drawMonth=11;drawYear--}}}inst.drawMonth=drawMonth;inst.drawYear=drawYear;var prevText=this._get(inst,"prevText");prevText=(!navigationAsDateFormat?prevText:this.formatDate(prevText,this._daylightSavingAdjust(new Date(drawYear,drawMonth-stepMonths,1)),this._getFormatConfig(inst)));var prev=(this._canAdjustMonth(inst,-1,drawYear,drawMonth)?'<a class="ui-datepicker-prev ui-corner-all" onclick="DP_jQuery_'+dpuuid+".datepicker._adjustDate('#"+inst.id+"', -"+stepMonths+", 'M');\" title=\""+prevText+'"><span class="ui-icon ui-icon-circle-triangle-'+(isRTL?"e":"w")+'">'+prevText+"</span></a>":(hideIfNoPrevNext?"":'<a class="ui-datepicker-prev ui-corner-all ui-state-disabled" title="'+prevText+'"><span class="ui-icon ui-icon-circle-triangle-'+(isRTL?"e":"w")+'">'+prevText+"</span></a>"));var nextText=this._get(inst,"nextText");nextText=(!navigationAsDateFormat?nextText:this.formatDate(nextText,this._daylightSavingAdjust(new Date(drawYear,drawMonth+stepMonths,1)),this._getFormatConfig(inst)));var next=(this._canAdjustMonth(inst,+1,drawYear,drawMonth)?'<a class="ui-datepicker-next ui-corner-all" onclick="DP_jQuery_'+dpuuid+".datepicker._adjustDate('#"+inst.id+"', +"+stepMonths+", 'M');\" title=\""+nextText+'"><span class="ui-icon ui-icon-circle-triangle-'+(isRTL?"w":"e")+'">'+nextText+"</span></a>":(hideIfNoPrevNext?"":'<a class="ui-datepicker-next ui-corner-all ui-state-disabled" title="'+nextText+'"><span class="ui-icon ui-icon-circle-triangle-'+(isRTL?"w":"e")+'">'+nextText+"</span></a>"));var currentText=this._get(inst,"currentText");var gotoDate=(this._get(inst,"gotoCurrent")&&inst.currentDay?currentDate:today);currentText=(!navigationAsDateFormat?currentText:this.formatDate(currentText,gotoDate,this._getFormatConfig(inst)));var controls=(!inst.inline?'<button type="button" class="ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all" onclick="DP_jQuery_'+dpuuid+'.datepicker._hideDatepicker();">'+this._get(inst,"closeText")+"</button>":"");var buttonPanel=(showButtonPanel)?'<div class="ui-datepicker-buttonpane ui-widget-content">'+(isRTL?controls:"")+(this._isInRange(inst,gotoDate)?'<button type="button" class="ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all" onclick="DP_jQuery_'+dpuuid+".datepicker._gotoToday('#"+inst.id+"');\">"+currentText+"</button>":"")+(isRTL?"":controls)+"</div>":"";var firstDay=parseInt(this._get(inst,"firstDay"),10);firstDay=(isNaN(firstDay)?0:firstDay);var showWeek=this._get(inst,"showWeek");var dayNames=this._get(inst,"dayNames");var dayNamesShort=this._get(inst,"dayNamesShort");var dayNamesMin=this._get(inst,"dayNamesMin");var monthNames=this._get(inst,"monthNames");var monthNamesShort=this._get(inst,"monthNamesShort");var beforeShowDay=this._get(inst,"beforeShowDay");var showOtherMonths=this._get(inst,"showOtherMonths");var selectOtherMonths=this._get(inst,"selectOtherMonths");var calculateWeek=this._get(inst,"calculateWeek")||this.iso8601Week;var defaultDate=this._getDefaultDate(inst);var html="";for(var row=0;row<numMonths[0];row++){var group="";for(var col=0;col<numMonths[1];col++){var selectedDate=this._daylightSavingAdjust(new Date(drawYear,drawMonth,inst.selectedDay));var cornerClass=" ui-corner-all";var calender="";if(isMultiMonth){calender+='<div class="ui-datepicker-group';if(numMonths[1]>1){switch(col){case 0:calender+=" ui-datepicker-group-first";cornerClass=" ui-corner-"+(isRTL?"right":"left");break;case numMonths[1]-1:calender+=" ui-datepicker-group-last";cornerClass=" ui-corner-"+(isRTL?"left":"right");break;default:calender+=" ui-datepicker-group-middle";cornerClass="";break}}calender+='">'}calender+='<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix'+cornerClass+'">'+(/all|left/.test(cornerClass)&&row==0?(isRTL?next:prev):"")+(/all|right/.test(cornerClass)&&row==0?(isRTL?prev:next):"")+this._generateMonthYearHeader(inst,drawMonth,drawYear,minDate,maxDate,row>0||col>0,monthNames,monthNamesShort)+'</div><table class="ui-datepicker-calendar"><thead><tr>';var thead=(showWeek?'<th class="ui-datepicker-week-col">'+this._get(inst,"weekHeader")+"</th>":"");for(var dow=0;dow<7;dow++){var day=(dow+firstDay)%7;thead+="<th"+((dow+firstDay+6)%7>=5?' class="ui-datepicker-week-end"':"")+'><span title="'+dayNames[day]+'">'+dayNamesMin[day]+"</span></th>"}calender+=thead+"</tr></thead><tbody>";var daysInMonth=this._getDaysInMonth(drawYear,drawMonth);if(drawYear==inst.selectedYear&&drawMonth==inst.selectedMonth){inst.selectedDay=Math.min(inst.selectedDay,daysInMonth)}var leadDays=(this._getFirstDayOfMonth(drawYear,drawMonth)-firstDay+7)%7;var numRows=(isMultiMonth?6:Math.ceil((leadDays+daysInMonth)/7));var printDate=this._daylightSavingAdjust(new Date(drawYear,drawMonth,1-leadDays));for(var dRow=0;dRow<numRows;dRow++){calender+="<tr>";var tbody=(!showWeek?"":'<td class="ui-datepicker-week-col">'+this._get(inst,"calculateWeek")(printDate)+"</td>");for(var dow=0;dow<7;dow++){var daySettings=(beforeShowDay?beforeShowDay.apply((inst.input?inst.input[0]:null),[printDate]):[true,""]);var otherMonth=(printDate.getMonth()!=drawMonth);var unselectable=(otherMonth&&!selectOtherMonths)||!daySettings[0]||(minDate&&printDate<minDate)||(maxDate&&printDate>maxDate);tbody+='<td class="'+((dow+firstDay+6)%7>=5?" ui-datepicker-week-end":"")+(otherMonth?" ui-datepicker-other-month":"")+((printDate.getTime()==selectedDate.getTime()&&drawMonth==inst.selectedMonth&&inst._keyEvent)||(defaultDate.getTime()==printDate.getTime()&&defaultDate.getTime()==selectedDate.getTime())?" "+this._dayOverClass:"")+(unselectable?" "+this._unselectableClass+" ui-state-disabled":"")+(otherMonth&&!showOtherMonths?"":" "+daySettings[1]+(printDate.getTime()==currentDate.getTime()?" "+this._currentClass:"")+(printDate.getTime()==today.getTime()?" ui-datepicker-today":""))+'"'+((!otherMonth||showOtherMonths)&&daySettings[2]?' title="'+daySettings[2]+'"':"")+(unselectable?"":' onclick="DP_jQuery_'+dpuuid+".datepicker._selectDay('#"+inst.id+"',"+printDate.getMonth()+","+printDate.getFullYear()+', this);return false;"')+">"+(otherMonth&&!showOtherMonths?"&#xa0;":(unselectable?'<span class="ui-state-default">'+printDate.getDate()+"</span>":'<a class="ui-state-default'+(printDate.getTime()==today.getTime()?" ui-state-highlight":"")+(printDate.getTime()==currentDate.getTime()?" ui-state-active":"")+(otherMonth?" ui-priority-secondary":"")+'" href="#">'+printDate.getDate()+"</a>"))+"</td>";printDate.setDate(printDate.getDate()+1);printDate=this._daylightSavingAdjust(printDate)}calender+=tbody+"</tr>"}drawMonth++;if(drawMonth>11){drawMonth=0;drawYear++}calender+="</tbody></table>"+(isMultiMonth?"</div>"+((numMonths[0]>0&&col==numMonths[1]-1)?'<div class="ui-datepicker-row-break"></div>':""):"");group+=calender}html+=group}html+=buttonPanel+($.browser.msie&&parseInt($.browser.version,10)<7&&!inst.inline?'<iframe src="javascript:false;" class="ui-datepicker-cover" frameborder="0"></iframe>':"");inst._keyEvent=false;return html},_generateMonthYearHeader:function(inst,drawMonth,drawYear,minDate,maxDate,secondary,monthNames,monthNamesShort){var changeMonth=this._get(inst,"changeMonth");var changeYear=this._get(inst,"changeYear");var showMonthAfterYear=this._get(inst,"showMonthAfterYear");var html='<div class="ui-datepicker-title">';var monthHtml="";if(secondary||!changeMonth){monthHtml+='<span class="ui-datepicker-month">'+monthNames[drawMonth]+"</span>"}else{var inMinYear=(minDate&&minDate.getFullYear()==drawYear);var inMaxYear=(maxDate&&maxDate.getFullYear()==drawYear);monthHtml+='<select class="ui-datepicker-month" onchange="DP_jQuery_'+dpuuid+".datepicker._selectMonthYear('#"+inst.id+"', this, 'M');\" onclick=\"DP_jQuery_"+dpuuid+".datepicker._clickMonthYear('#"+inst.id+"');\">";for(var month=0;month<12;month++){if((!inMinYear||month>=minDate.getMonth())&&(!inMaxYear||month<=maxDate.getMonth())){monthHtml+='<option value="'+month+'"'+(month==drawMonth?' selected="selected"':"")+">"+monthNamesShort[month]+"</option>"}}monthHtml+="</select>"}if(!showMonthAfterYear){html+=monthHtml+(secondary||!(changeMonth&&changeYear)?"&#xa0;":"")}if(secondary||!changeYear){html+='<span class="ui-datepicker-year">'+drawYear+"</span>"}else{var years=this._get(inst,"yearRange").split(":");var thisYear=new Date().getFullYear();var determineYear=function(value){var year=(value.match(/c[+-].*/)?drawYear+parseInt(value.substring(1),10):(value.match(/[+-].*/)?thisYear+parseInt(value,10):parseInt(value,10)));return(isNaN(year)?thisYear:year)};var year=determineYear(years[0]);var endYear=Math.max(year,determineYear(years[1]||""));year=(minDate?Math.max(year,minDate.getFullYear()):year);endYear=(maxDate?Math.min(endYear,maxDate.getFullYear()):endYear);html+='<select class="ui-datepicker-year" onchange="DP_jQuery_'+dpuuid+".datepicker._selectMonthYear('#"+inst.id+"', this, 'Y');\" onclick=\"DP_jQuery_"+dpuuid+".datepicker._clickMonthYear('#"+inst.id+"');\">";for(;year<=endYear;year++){html+='<option value="'+year+'"'+(year==drawYear?' selected="selected"':"")+">"+year+"</option>"}html+="</select>"}html+=this._get(inst,"yearSuffix");if(showMonthAfterYear){html+=(secondary||!(changeMonth&&changeYear)?"&#xa0;":"")+monthHtml}html+="</div>";return html},_adjustInstDate:function(inst,offset,period){var year=inst.drawYear+(period=="Y"?offset:0);var month=inst.drawMonth+(period=="M"?offset:0);var day=Math.min(inst.selectedDay,this._getDaysInMonth(year,month))+(period=="D"?offset:0);var date=this._restrictMinMax(inst,this._daylightSavingAdjust(new Date(year,month,day)));inst.selectedDay=date.getDate();inst.drawMonth=inst.selectedMonth=date.getMonth();inst.drawYear=inst.selectedYear=date.getFullYear();if(period=="M"||period=="Y"){this._notifyChange(inst)}},_restrictMinMax:function(inst,date){var minDate=this._getMinMaxDate(inst,"min");var maxDate=this._getMinMaxDate(inst,"max");date=(minDate&&date<minDate?minDate:date);date=(maxDate&&date>maxDate?maxDate:date);return date},_notifyChange:function(inst){var onChange=this._get(inst,"onChangeMonthYear");if(onChange){onChange.apply((inst.input?inst.input[0]:null),[inst.selectedYear,inst.selectedMonth+1,inst])}},_getNumberOfMonths:function(inst){var numMonths=this._get(inst,"numberOfMonths");return(numMonths==null?[1,1]:(typeof numMonths=="number"?[1,numMonths]:numMonths))},_getMinMaxDate:function(inst,minMax){return this._determineDate(inst,this._get(inst,minMax+"Date"),null)},_getDaysInMonth:function(year,month){return 32-new Date(year,month,32).getDate()},_getFirstDayOfMonth:function(year,month){return new Date(year,month,1).getDay()},_canAdjustMonth:function(inst,offset,curYear,curMonth){var numMonths=this._getNumberOfMonths(inst);var date=this._daylightSavingAdjust(new Date(curYear,curMonth+(offset<0?offset:numMonths[0]*numMonths[1]),1));if(offset<0){date.setDate(this._getDaysInMonth(date.getFullYear(),date.getMonth()))}return this._isInRange(inst,date)},_isInRange:function(inst,date){var minDate=this._getMinMaxDate(inst,"min");var maxDate=this._getMinMaxDate(inst,"max");return((!minDate||date.getTime()>=minDate.getTime())&&(!maxDate||date.getTime()<=maxDate.getTime()))},_getFormatConfig:function(inst){var shortYearCutoff=this._get(inst,"shortYearCutoff");shortYearCutoff=(typeof shortYearCutoff!="string"?shortYearCutoff:new Date().getFullYear()%100+parseInt(shortYearCutoff,10));return{shortYearCutoff:shortYearCutoff,dayNamesShort:this._get(inst,"dayNamesShort"),dayNames:this._get(inst,"dayNames"),monthNamesShort:this._get(inst,"monthNamesShort"),monthNames:this._get(inst,"monthNames")}},_formatDate:function(inst,day,month,year){if(!day){inst.currentDay=inst.selectedDay;inst.currentMonth=inst.selectedMonth;inst.currentYear=inst.selectedYear}var date=(day?(typeof day=="object"?day:this._daylightSavingAdjust(new Date(year,month,day))):this._daylightSavingAdjust(new Date(inst.currentYear,inst.currentMonth,inst.currentDay)));return this.formatDate(this._get(inst,"dateFormat"),date,this._getFormatConfig(inst))}});function extendRemove(target,props){$.extend(target,props);for(var name in props){if(props[name]==null||props[name]==undefined){target[name]=props[name]}}return target}function isArray(a){return(a&&(($.browser.safari&&typeof a=="object"&&a.length)||(a.constructor&&a.constructor.toString().match(/\Array\(\)/))))}$.fn.datepicker=function(options){if(!$.datepicker.initialized){$(document).mousedown($.datepicker._checkExternalClick).find("body").append($.datepicker.dpDiv);$.datepicker.initialized=true}var otherArgs=Array.prototype.slice.call(arguments,1);if(typeof options=="string"&&(options=="isDisabled"||options=="getDate"||options=="widget")){return $.datepicker["_"+options+"Datepicker"].apply($.datepicker,[this[0]].concat(otherArgs))}if(options=="option"&&arguments.length==2&&typeof arguments[1]=="string"){return $.datepicker["_"+options+"Datepicker"].apply($.datepicker,[this[0]].concat(otherArgs))}return this.each(function(){typeof options=="string"?$.datepicker["_"+options+"Datepicker"].apply($.datepicker,[this].concat(otherArgs)):$.datepicker._attachDatepicker(this,options)})};$.datepicker=new Datepicker();$.datepicker.initialized=false;$.datepicker.uuid=new Date().getTime();$.datepicker.version="1.8";window["DP_jQuery_"+dpuuid]=$})(jQuery);;/*
 * jQuery UI Progressbar 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Progressbar
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */(function(a){a.widget("ui.progressbar",{options:{value:0},_create:function(){this.element.addClass("ui-progressbar ui-widget ui-widget-content ui-corner-all").attr({role:"progressbar","aria-valuemin":this._valueMin(),"aria-valuemax":this._valueMax(),"aria-valuenow":this._value()});this.valueDiv=a("<div class='ui-progressbar-value ui-widget-header ui-corner-left'></div>").appendTo(this.element);this._refreshValue()},destroy:function(){this.element.removeClass("ui-progressbar ui-widget ui-widget-content ui-corner-all").removeAttr("role").removeAttr("aria-valuemin").removeAttr("aria-valuemax").removeAttr("aria-valuenow");this.valueDiv.remove();a.Widget.prototype.destroy.apply(this,arguments)},value:function(b){if(b===undefined){return this._value()}this._setOption("value",b);return this},_setOption:function(b,c){switch(b){case"value":this.options.value=c;this._refreshValue();this._trigger("change");break}a.Widget.prototype._setOption.apply(this,arguments)},_value:function(){var b=this.options.value;if(typeof b!=="number"){b=0}if(b<this._valueMin()){b=this._valueMin()}if(b>this._valueMax()){b=this._valueMax()}return b},_valueMin:function(){return 0},_valueMax:function(){return 100},_refreshValue:function(){var b=this.value();this.valueDiv[b===this._valueMax()?"addClass":"removeClass"]("ui-corner-right").width(b+"%");this.element.attr("aria-valuenow",b)}});a.extend(a.ui.progressbar,{version:"1.8"})})(jQuery);;/*
 * jQuery UI Effects 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/
 */jQuery.effects||(function(g){g.effects={};g.each(["backgroundColor","borderBottomColor","borderLeftColor","borderRightColor","borderTopColor","color","outlineColor"],function(l,k){g.fx.step[k]=function(m){if(!m.colorInit){m.start=j(m.elem,k);m.end=i(m.end);m.colorInit=true}m.elem.style[k]="rgb("+Math.max(Math.min(parseInt((m.pos*(m.end[0]-m.start[0]))+m.start[0],10),255),0)+","+Math.max(Math.min(parseInt((m.pos*(m.end[1]-m.start[1]))+m.start[1],10),255),0)+","+Math.max(Math.min(parseInt((m.pos*(m.end[2]-m.start[2]))+m.start[2],10),255),0)+")"}});function i(l){var k;if(l&&l.constructor==Array&&l.length==3){return l}if(k=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(l)){return[parseInt(k[1],10),parseInt(k[2],10),parseInt(k[3],10)]}if(k=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(l)){return[parseFloat(k[1])*2.55,parseFloat(k[2])*2.55,parseFloat(k[3])*2.55]}if(k=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(l)){return[parseInt(k[1],16),parseInt(k[2],16),parseInt(k[3],16)]}if(k=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(l)){return[parseInt(k[1]+k[1],16),parseInt(k[2]+k[2],16),parseInt(k[3]+k[3],16)]}if(k=/rgba\(0, 0, 0, 0\)/.exec(l)){return a.transparent}return a[g.trim(l).toLowerCase()]}function j(m,k){var l;do{l=g.curCSS(m,k);if(l!=""&&l!="transparent"||g.nodeName(m,"body")){break}k="backgroundColor"}while(m=m.parentNode);return i(l)}var a={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0],transparent:[255,255,255]};var e=["add","remove","toggle"],c={border:1,borderBottom:1,borderColor:1,borderLeft:1,borderRight:1,borderTop:1,borderWidth:1,margin:1,padding:1};function f(){var n=document.defaultView?document.defaultView.getComputedStyle(this,null):this.currentStyle,o={},l,m;if(n&&n.length&&n[0]&&n[n[0]]){var k=n.length;while(k--){l=n[k];if(typeof n[l]=="string"){m=l.replace(/\-(\w)/g,function(p,q){return q.toUpperCase()});o[m]=n[l]}}}else{for(l in n){if(typeof n[l]==="string"){o[l]=n[l]}}}return o}function b(l){var k,m;for(k in l){m=l[k];if(m==null||g.isFunction(m)||k in c||(/scrollbar/).test(k)||(!(/color/i).test(k)&&isNaN(parseFloat(m)))){delete l[k]}}return l}function h(k,m){var n={_:0},l;for(l in m){if(k[l]!=m[l]){n[l]=m[l]}}return n}g.effects.animateClass=function(k,l,n,m){if(g.isFunction(n)){m=n;n=null}return this.each(function(){var r=g(this),o=r.attr("style")||" ",s=b(f.call(this)),q,p=r.attr("className");g.each(e,function(t,u){if(k[u]){r[u+"Class"](k[u])}});q=b(f.call(this));r.attr("className",p);r.animate(h(s,q),l,n,function(){g.each(e,function(t,u){if(k[u]){r[u+"Class"](k[u])}});if(typeof r.attr("style")=="object"){r.attr("style").cssText="";r.attr("style").cssText=o}else{r.attr("style",o)}if(m){m.apply(this,arguments)}})})};g.fn.extend({_addClass:g.fn.addClass,addClass:function(l,k,n,m){return k?g.effects.animateClass.apply(this,[{add:l},k,n,m]):this._addClass(l)},_removeClass:g.fn.removeClass,removeClass:function(l,k,n,m){return k?g.effects.animateClass.apply(this,[{remove:l},k,n,m]):this._removeClass(l)},_toggleClass:g.fn.toggleClass,toggleClass:function(m,l,k,o,n){if(typeof l=="boolean"||l===undefined){if(!k){return this._toggleClass(m,l)}else{return g.effects.animateClass.apply(this,[(l?{add:m}:{remove:m}),k,o,n])}}else{return g.effects.animateClass.apply(this,[{toggle:m},l,k,o])}},switchClass:function(k,m,l,o,n){return g.effects.animateClass.apply(this,[{add:m,remove:k},l,o,n])}});g.extend(g.effects,{version:"1.8",save:function(l,m){for(var k=0;k<m.length;k++){if(m[k]!==null){l.data("ec.storage."+m[k],l[0].style[m[k]])}}},restore:function(l,m){for(var k=0;k<m.length;k++){if(m[k]!==null){l.css(m[k],l.data("ec.storage."+m[k]))}}},setMode:function(k,l){if(l=="toggle"){l=k.is(":hidden")?"show":"hide"}return l},getBaseline:function(l,m){var n,k;switch(l[0]){case"top":n=0;break;case"middle":n=0.5;break;case"bottom":n=1;break;default:n=l[0]/m.height}switch(l[1]){case"left":k=0;break;case"center":k=0.5;break;case"right":k=1;break;default:k=l[1]/m.width}return{x:k,y:n}},createWrapper:function(k){if(k.parent().is(".ui-effects-wrapper")){return k.parent()}var l={width:k.outerWidth(true),height:k.outerHeight(true),"float":k.css("float")},m=g("<div></div>").addClass("ui-effects-wrapper").css({fontSize:"100%",background:"transparent",border:"none",margin:0,padding:0});k.wrap(m);m=k.parent();if(k.css("position")=="static"){m.css({position:"relative"});k.css({position:"relative"})}else{g.extend(l,{position:k.css("position"),zIndex:k.css("z-index")});g.each(["top","left","bottom","right"],function(n,o){l[o]=k.css(o);if(isNaN(parseInt(l[o],10))){l[o]="auto"}});k.css({position:"relative",top:0,left:0})}return m.css(l).show()},removeWrapper:function(k){if(k.parent().is(".ui-effects-wrapper")){return k.parent().replaceWith(k)}return k},setTransition:function(l,n,k,m){m=m||{};g.each(n,function(p,o){unit=l.cssUnit(o);if(unit[0]>0){m[o]=unit[0]*k+unit[1]}});return m}});function d(l,k,m,n){if(typeof l=="object"){n=k;m=null;k=l;l=k.effect}if(g.isFunction(k)){n=k;m=null;k={}}if(g.isFunction(m)){n=m;m=null}if(typeof k=="number"||g.fx.speeds[k]){n=m;m=k;k={}}k=k||{};m=m||k.duration;m=g.fx.off?0:typeof m=="number"?m:g.fx.speeds[m]||g.fx.speeds._default;n=n||k.complete;return[l,k,m,n]}g.fn.extend({effect:function(n,m,p,q){var l=d.apply(this,arguments),o={options:l[1],duration:l[2],callback:l[3]},k=g.effects[n];return k&&!g.fx.off?k.call(this,o):this},_show:g.fn.show,show:function(l){if(!l||typeof l=="number"||g.fx.speeds[l]){return this._show.apply(this,arguments)}else{var k=d.apply(this,arguments);k[1].mode="show";return this.effect.apply(this,k)}},_hide:g.fn.hide,hide:function(l){if(!l||typeof l=="number"||g.fx.speeds[l]){return this._hide.apply(this,arguments)}else{var k=d.apply(this,arguments);k[1].mode="hide";return this.effect.apply(this,k)}},__toggle:g.fn.toggle,toggle:function(l){if(!l||typeof l=="number"||g.fx.speeds[l]||typeof l=="boolean"||g.isFunction(l)){return this.__toggle.apply(this,arguments)}else{var k=d.apply(this,arguments);k[1].mode="toggle";return this.effect.apply(this,k)}},cssUnit:function(k){var l=this.css(k),m=[];g.each(["em","px","%","pt"],function(n,o){if(l.indexOf(o)>0){m=[parseFloat(l),o]}});return m}});g.easing.jswing=g.easing.swing;g.extend(g.easing,{def:"easeOutQuad",swing:function(l,m,k,o,n){return g.easing[g.easing.def](l,m,k,o,n)},easeInQuad:function(l,m,k,o,n){return o*(m/=n)*m+k},easeOutQuad:function(l,m,k,o,n){return -o*(m/=n)*(m-2)+k},easeInOutQuad:function(l,m,k,o,n){if((m/=n/2)<1){return o/2*m*m+k}return -o/2*((--m)*(m-2)-1)+k},easeInCubic:function(l,m,k,o,n){return o*(m/=n)*m*m+k},easeOutCubic:function(l,m,k,o,n){return o*((m=m/n-1)*m*m+1)+k},easeInOutCubic:function(l,m,k,o,n){if((m/=n/2)<1){return o/2*m*m*m+k}return o/2*((m-=2)*m*m+2)+k},easeInQuart:function(l,m,k,o,n){return o*(m/=n)*m*m*m+k},easeOutQuart:function(l,m,k,o,n){return -o*((m=m/n-1)*m*m*m-1)+k},easeInOutQuart:function(l,m,k,o,n){if((m/=n/2)<1){return o/2*m*m*m*m+k}return -o/2*((m-=2)*m*m*m-2)+k},easeInQuint:function(l,m,k,o,n){return o*(m/=n)*m*m*m*m+k},easeOutQuint:function(l,m,k,o,n){return o*((m=m/n-1)*m*m*m*m+1)+k},easeInOutQuint:function(l,m,k,o,n){if((m/=n/2)<1){return o/2*m*m*m*m*m+k}return o/2*((m-=2)*m*m*m*m+2)+k},easeInSine:function(l,m,k,o,n){return -o*Math.cos(m/n*(Math.PI/2))+o+k},easeOutSine:function(l,m,k,o,n){return o*Math.sin(m/n*(Math.PI/2))+k},easeInOutSine:function(l,m,k,o,n){return -o/2*(Math.cos(Math.PI*m/n)-1)+k},easeInExpo:function(l,m,k,o,n){return(m==0)?k:o*Math.pow(2,10*(m/n-1))+k},easeOutExpo:function(l,m,k,o,n){return(m==n)?k+o:o*(-Math.pow(2,-10*m/n)+1)+k},easeInOutExpo:function(l,m,k,o,n){if(m==0){return k}if(m==n){return k+o}if((m/=n/2)<1){return o/2*Math.pow(2,10*(m-1))+k}return o/2*(-Math.pow(2,-10*--m)+2)+k},easeInCirc:function(l,m,k,o,n){return -o*(Math.sqrt(1-(m/=n)*m)-1)+k},easeOutCirc:function(l,m,k,o,n){return o*Math.sqrt(1-(m=m/n-1)*m)+k},easeInOutCirc:function(l,m,k,o,n){if((m/=n/2)<1){return -o/2*(Math.sqrt(1-m*m)-1)+k}return o/2*(Math.sqrt(1-(m-=2)*m)+1)+k},easeInElastic:function(l,n,k,u,r){var o=1.70158;var q=0;var m=u;if(n==0){return k}if((n/=r)==1){return k+u}if(!q){q=r*0.3}if(m<Math.abs(u)){m=u;var o=q/4}else{var o=q/(2*Math.PI)*Math.asin(u/m)}return -(m*Math.pow(2,10*(n-=1))*Math.sin((n*r-o)*(2*Math.PI)/q))+k},easeOutElastic:function(l,n,k,u,r){var o=1.70158;var q=0;var m=u;if(n==0){return k}if((n/=r)==1){return k+u}if(!q){q=r*0.3}if(m<Math.abs(u)){m=u;var o=q/4}else{var o=q/(2*Math.PI)*Math.asin(u/m)}return m*Math.pow(2,-10*n)*Math.sin((n*r-o)*(2*Math.PI)/q)+u+k},easeInOutElastic:function(l,n,k,u,r){var o=1.70158;var q=0;var m=u;if(n==0){return k}if((n/=r/2)==2){return k+u}if(!q){q=r*(0.3*1.5)}if(m<Math.abs(u)){m=u;var o=q/4}else{var o=q/(2*Math.PI)*Math.asin(u/m)}if(n<1){return -0.5*(m*Math.pow(2,10*(n-=1))*Math.sin((n*r-o)*(2*Math.PI)/q))+k}return m*Math.pow(2,-10*(n-=1))*Math.sin((n*r-o)*(2*Math.PI)/q)*0.5+u+k},easeInBack:function(l,m,k,p,o,n){if(n==undefined){n=1.70158}return p*(m/=o)*m*((n+1)*m-n)+k},easeOutBack:function(l,m,k,p,o,n){if(n==undefined){n=1.70158}return p*((m=m/o-1)*m*((n+1)*m+n)+1)+k},easeInOutBack:function(l,m,k,p,o,n){if(n==undefined){n=1.70158}if((m/=o/2)<1){return p/2*(m*m*(((n*=(1.525))+1)*m-n))+k}return p/2*((m-=2)*m*(((n*=(1.525))+1)*m+n)+2)+k},easeInBounce:function(l,m,k,o,n){return o-g.easing.easeOutBounce(l,n-m,0,o,n)+k},easeOutBounce:function(l,m,k,o,n){if((m/=n)<(1/2.75)){return o*(7.5625*m*m)+k}else{if(m<(2/2.75)){return o*(7.5625*(m-=(1.5/2.75))*m+0.75)+k}else{if(m<(2.5/2.75)){return o*(7.5625*(m-=(2.25/2.75))*m+0.9375)+k}else{return o*(7.5625*(m-=(2.625/2.75))*m+0.984375)+k}}}},easeInOutBounce:function(l,m,k,o,n){if(m<n/2){return g.easing.easeInBounce(l,m*2,0,o,n)*0.5+k}return g.easing.easeOutBounce(l,m*2-n,0,o,n)*0.5+o*0.5+k}})})(jQuery);;/*
 * jQuery UI Effects Blind 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Blind
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.blind=function(b){return this.queue(function(){var d=a(this),c=["position","top","left"];var h=a.effects.setMode(d,b.options.mode||"hide");var g=b.options.direction||"vertical";a.effects.save(d,c);d.show();var j=a.effects.createWrapper(d).css({overflow:"hidden"});var e=(g=="vertical")?"height":"width";var i=(g=="vertical")?j.height():j.width();if(h=="show"){j.css(e,0)}var f={};f[e]=h=="show"?i:0;j.animate(f,b.duration,b.options.easing,function(){if(h=="hide"){d.hide()}a.effects.restore(d,c);a.effects.removeWrapper(d);if(b.callback){b.callback.apply(d[0],arguments)}d.dequeue()})})}})(jQuery);;/*
 * jQuery UI Effects Bounce 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Bounce
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.bounce=function(b){return this.queue(function(){var e=a(this),l=["position","top","left"];var k=a.effects.setMode(e,b.options.mode||"effect");var n=b.options.direction||"up";var c=b.options.distance||20;var d=b.options.times||5;var g=b.duration||250;if(/show|hide/.test(k)){l.push("opacity")}a.effects.save(e,l);e.show();a.effects.createWrapper(e);var f=(n=="up"||n=="down")?"top":"left";var p=(n=="up"||n=="left")?"pos":"neg";var c=b.options.distance||(f=="top"?e.outerHeight({margin:true})/3:e.outerWidth({margin:true})/3);if(k=="show"){e.css("opacity",0).css(f,p=="pos"?-c:c)}if(k=="hide"){c=c/(d*2)}if(k!="hide"){d--}if(k=="show"){var h={opacity:1};h[f]=(p=="pos"?"+=":"-=")+c;e.animate(h,g/2,b.options.easing);c=c/2;d--}for(var j=0;j<d;j++){var o={},m={};o[f]=(p=="pos"?"-=":"+=")+c;m[f]=(p=="pos"?"+=":"-=")+c;e.animate(o,g/2,b.options.easing).animate(m,g/2,b.options.easing);c=(k=="hide")?c*2:c/2}if(k=="hide"){var h={opacity:0};h[f]=(p=="pos"?"-=":"+=")+c;e.animate(h,g/2,b.options.easing,function(){e.hide();a.effects.restore(e,l);a.effects.removeWrapper(e);if(b.callback){b.callback.apply(this,arguments)}})}else{var o={},m={};o[f]=(p=="pos"?"-=":"+=")+c;m[f]=(p=="pos"?"+=":"-=")+c;e.animate(o,g/2,b.options.easing).animate(m,g/2,b.options.easing,function(){a.effects.restore(e,l);a.effects.removeWrapper(e);if(b.callback){b.callback.apply(this,arguments)}})}e.queue("fx",function(){e.dequeue()});e.dequeue()})}})(jQuery);;/*
 * jQuery UI Effects Clip 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Clip
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.clip=function(b){return this.queue(function(){var f=a(this),j=["position","top","left","height","width"];var i=a.effects.setMode(f,b.options.mode||"hide");var k=b.options.direction||"vertical";a.effects.save(f,j);f.show();var c=a.effects.createWrapper(f).css({overflow:"hidden"});var e=f[0].tagName=="IMG"?c:f;var g={size:(k=="vertical")?"height":"width",position:(k=="vertical")?"top":"left"};var d=(k=="vertical")?e.height():e.width();if(i=="show"){e.css(g.size,0);e.css(g.position,d/2)}var h={};h[g.size]=i=="show"?d:0;h[g.position]=i=="show"?0:d/2;e.animate(h,{queue:false,duration:b.duration,easing:b.options.easing,complete:function(){if(i=="hide"){f.hide()}a.effects.restore(f,j);a.effects.removeWrapper(f);if(b.callback){b.callback.apply(f[0],arguments)}f.dequeue()}})})}})(jQuery);;/*
 * jQuery UI Effects Drop 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Drop
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.drop=function(b){return this.queue(function(){var e=a(this),d=["position","top","left","opacity"];var i=a.effects.setMode(e,b.options.mode||"hide");var h=b.options.direction||"left";a.effects.save(e,d);e.show();a.effects.createWrapper(e);var f=(h=="up"||h=="down")?"top":"left";var c=(h=="up"||h=="left")?"pos":"neg";var j=b.options.distance||(f=="top"?e.outerHeight({margin:true})/2:e.outerWidth({margin:true})/2);if(i=="show"){e.css("opacity",0).css(f,c=="pos"?-j:j)}var g={opacity:i=="show"?1:0};g[f]=(i=="show"?(c=="pos"?"+=":"-="):(c=="pos"?"-=":"+="))+j;e.animate(g,{queue:false,duration:b.duration,easing:b.options.easing,complete:function(){if(i=="hide"){e.hide()}a.effects.restore(e,d);a.effects.removeWrapper(e);if(b.callback){b.callback.apply(this,arguments)}e.dequeue()}})})}})(jQuery);;/*
 * jQuery UI Effects Explode 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Explode
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.explode=function(b){return this.queue(function(){var k=b.options.pieces?Math.round(Math.sqrt(b.options.pieces)):3;var e=b.options.pieces?Math.round(Math.sqrt(b.options.pieces)):3;b.options.mode=b.options.mode=="toggle"?(a(this).is(":visible")?"hide":"show"):b.options.mode;var h=a(this).show().css("visibility","hidden");var l=h.offset();l.top-=parseInt(h.css("marginTop"),10)||0;l.left-=parseInt(h.css("marginLeft"),10)||0;var g=h.outerWidth(true);var c=h.outerHeight(true);for(var f=0;f<k;f++){for(var d=0;d<e;d++){h.clone().appendTo("body").wrap("<div></div>").css({position:"absolute",visibility:"visible",left:-d*(g/e),top:-f*(c/k)}).parent().addClass("ui-effects-explode").css({position:"absolute",overflow:"hidden",width:g/e,height:c/k,left:l.left+d*(g/e)+(b.options.mode=="show"?(d-Math.floor(e/2))*(g/e):0),top:l.top+f*(c/k)+(b.options.mode=="show"?(f-Math.floor(k/2))*(c/k):0),opacity:b.options.mode=="show"?0:1}).animate({left:l.left+d*(g/e)+(b.options.mode=="show"?0:(d-Math.floor(e/2))*(g/e)),top:l.top+f*(c/k)+(b.options.mode=="show"?0:(f-Math.floor(k/2))*(c/k)),opacity:b.options.mode=="show"?1:0},b.duration||500)}}setTimeout(function(){b.options.mode=="show"?h.css({visibility:"visible"}):h.css({visibility:"visible"}).hide();if(b.callback){b.callback.apply(h[0])}h.dequeue();a("div.ui-effects-explode").remove()},b.duration||500)})}})(jQuery);;/*
 * jQuery UI Effects Fold 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Fold
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.fold=function(b){return this.queue(function(){var e=a(this),k=["position","top","left"];var h=a.effects.setMode(e,b.options.mode||"hide");var o=b.options.size||15;var n=!(!b.options.horizFirst);var g=b.duration?b.duration/2:a.fx.speeds._default/2;a.effects.save(e,k);e.show();var d=a.effects.createWrapper(e).css({overflow:"hidden"});var i=((h=="show")!=n);var f=i?["width","height"]:["height","width"];var c=i?[d.width(),d.height()]:[d.height(),d.width()];var j=/([0-9]+)%/.exec(o);if(j){o=parseInt(j[1],10)/100*c[h=="hide"?0:1]}if(h=="show"){d.css(n?{height:0,width:o}:{height:o,width:0})}var m={},l={};m[f[0]]=h=="show"?c[0]:o;l[f[1]]=h=="show"?c[1]:0;d.animate(m,g,b.options.easing).animate(l,g,b.options.easing,function(){if(h=="hide"){e.hide()}a.effects.restore(e,k);a.effects.removeWrapper(e);if(b.callback){b.callback.apply(e[0],arguments)}e.dequeue()})})}})(jQuery);;/*
 * jQuery UI Effects Highlight 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Highlight
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.highlight=function(b){return this.queue(function(){var d=a(this),c=["backgroundImage","backgroundColor","opacity"],f=a.effects.setMode(d,b.options.mode||"show"),e={backgroundColor:d.css("backgroundColor")};if(f=="hide"){e.opacity=0}a.effects.save(d,c);d.show().css({backgroundImage:"none",backgroundColor:b.options.color||"#ffff99"}).animate(e,{queue:false,duration:b.duration,easing:b.options.easing,complete:function(){(f=="hide"&&d.hide());a.effects.restore(d,c);(f=="show"&&!a.support.opacity&&this.style.removeAttribute("filter"));(b.callback&&b.callback.apply(this,arguments));d.dequeue()}})})}})(jQuery);;/*
 * jQuery UI Effects Pulsate 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Pulsate
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.pulsate=function(b){return this.queue(function(){var d=a(this),e=a.effects.setMode(d,b.options.mode||"show");times=((b.options.times||5)*2)-1;duration=b.duration?b.duration/2:a.fx.speeds._default/2,isVisible=d.is(":visible"),animateTo=0;if(!isVisible){d.css("opacity",0).show();animateTo=1}if((e=="hide"&&isVisible)||(e=="show"&&!isVisible)){times--}for(var c=0;c<times;c++){d.animate({opacity:animateTo},duration,b.options.easing);animateTo=(animateTo+1)%2}d.animate({opacity:animateTo},duration,b.options.easing,function(){if(animateTo==0){d.hide()}(b.callback&&b.callback.apply(this,arguments))});d.queue("fx",function(){d.dequeue()}).dequeue()})}})(jQuery);;/*
 * jQuery UI Effects Scale 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Scale
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.puff=function(b){return this.queue(function(){var f=a(this),g=a.effects.setMode(f,b.options.mode||"hide"),e=parseInt(b.options.percent,10)||150,d=e/100,c={height:f.height(),width:f.width()};a.extend(b.options,{fade:true,mode:g,percent:g=="hide"?e:100,from:g=="hide"?c:{height:c.height*d,width:c.width*d}});f.effect("scale",b.options,b.duration,b.callback);f.dequeue()})};a.effects.scale=function(b){return this.queue(function(){var g=a(this);var d=a.extend(true,{},b.options);var j=a.effects.setMode(g,b.options.mode||"effect");var h=parseInt(b.options.percent,10)||(parseInt(b.options.percent,10)==0?0:(j=="hide"?0:100));var i=b.options.direction||"both";var c=b.options.origin;if(j!="effect"){d.origin=c||["middle","center"];d.restore=true}var f={height:g.height(),width:g.width()};g.from=b.options.from||(j=="show"?{height:0,width:0}:f);var e={y:i!="horizontal"?(h/100):1,x:i!="vertical"?(h/100):1};g.to={height:f.height*e.y,width:f.width*e.x};if(b.options.fade){if(j=="show"){g.from.opacity=0;g.to.opacity=1}if(j=="hide"){g.from.opacity=1;g.to.opacity=0}}d.from=g.from;d.to=g.to;d.mode=j;g.effect("size",d,b.duration,b.callback);g.dequeue()})};a.effects.size=function(b){return this.queue(function(){var c=a(this),n=["position","top","left","width","height","overflow","opacity"];var m=["position","top","left","overflow","opacity"];var j=["width","height","overflow"];var p=["fontSize"];var k=["borderTopWidth","borderBottomWidth","paddingTop","paddingBottom"];var f=["borderLeftWidth","borderRightWidth","paddingLeft","paddingRight"];var g=a.effects.setMode(c,b.options.mode||"effect");var i=b.options.restore||false;var e=b.options.scale||"both";var o=b.options.origin;var d={height:c.height(),width:c.width()};c.from=b.options.from||d;c.to=b.options.to||d;if(o){var h=a.effects.getBaseline(o,d);c.from.top=(d.height-c.from.height)*h.y;c.from.left=(d.width-c.from.width)*h.x;c.to.top=(d.height-c.to.height)*h.y;c.to.left=(d.width-c.to.width)*h.x}var l={from:{y:c.from.height/d.height,x:c.from.width/d.width},to:{y:c.to.height/d.height,x:c.to.width/d.width}};if(e=="box"||e=="both"){if(l.from.y!=l.to.y){n=n.concat(k);c.from=a.effects.setTransition(c,k,l.from.y,c.from);c.to=a.effects.setTransition(c,k,l.to.y,c.to)}if(l.from.x!=l.to.x){n=n.concat(f);c.from=a.effects.setTransition(c,f,l.from.x,c.from);c.to=a.effects.setTransition(c,f,l.to.x,c.to)}}if(e=="content"||e=="both"){if(l.from.y!=l.to.y){n=n.concat(p);c.from=a.effects.setTransition(c,p,l.from.y,c.from);c.to=a.effects.setTransition(c,p,l.to.y,c.to)}}a.effects.save(c,i?n:m);c.show();a.effects.createWrapper(c);c.css("overflow","hidden").css(c.from);if(e=="content"||e=="both"){k=k.concat(["marginTop","marginBottom"]).concat(p);f=f.concat(["marginLeft","marginRight"]);j=n.concat(k).concat(f);c.find("*[width]").each(function(){child=a(this);if(i){a.effects.save(child,j)}var q={height:child.height(),width:child.width()};child.from={height:q.height*l.from.y,width:q.width*l.from.x};child.to={height:q.height*l.to.y,width:q.width*l.to.x};if(l.from.y!=l.to.y){child.from=a.effects.setTransition(child,k,l.from.y,child.from);child.to=a.effects.setTransition(child,k,l.to.y,child.to)}if(l.from.x!=l.to.x){child.from=a.effects.setTransition(child,f,l.from.x,child.from);child.to=a.effects.setTransition(child,f,l.to.x,child.to)}child.css(child.from);child.animate(child.to,b.duration,b.options.easing,function(){if(i){a.effects.restore(child,j)}})})}c.animate(c.to,{queue:false,duration:b.duration,easing:b.options.easing,complete:function(){if(c.to.opacity===0){c.css("opacity",c.from.opacity)}if(g=="hide"){c.hide()}a.effects.restore(c,i?n:m);a.effects.removeWrapper(c);if(b.callback){b.callback.apply(this,arguments)}c.dequeue()}})})}})(jQuery);;/*
 * jQuery UI Effects Shake 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Shake
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.shake=function(b){return this.queue(function(){var e=a(this),l=["position","top","left"];var k=a.effects.setMode(e,b.options.mode||"effect");var n=b.options.direction||"left";var c=b.options.distance||20;var d=b.options.times||3;var g=b.duration||b.options.duration||140;a.effects.save(e,l);e.show();a.effects.createWrapper(e);var f=(n=="up"||n=="down")?"top":"left";var p=(n=="up"||n=="left")?"pos":"neg";var h={},o={},m={};h[f]=(p=="pos"?"-=":"+=")+c;o[f]=(p=="pos"?"+=":"-=")+c*2;m[f]=(p=="pos"?"-=":"+=")+c*2;e.animate(h,g,b.options.easing);for(var j=1;j<d;j++){e.animate(o,g,b.options.easing).animate(m,g,b.options.easing)}e.animate(o,g,b.options.easing).animate(h,g/2,b.options.easing,function(){a.effects.restore(e,l);a.effects.removeWrapper(e);if(b.callback){b.callback.apply(this,arguments)}});e.queue("fx",function(){e.dequeue()});e.dequeue()})}})(jQuery);;/*
 * jQuery UI Effects Slide 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Slide
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.slide=function(b){return this.queue(function(){var e=a(this),d=["position","top","left"];var i=a.effects.setMode(e,b.options.mode||"show");var h=b.options.direction||"left";a.effects.save(e,d);e.show();a.effects.createWrapper(e).css({overflow:"hidden"});var f=(h=="up"||h=="down")?"top":"left";var c=(h=="up"||h=="left")?"pos":"neg";var j=b.options.distance||(f=="top"?e.outerHeight({margin:true}):e.outerWidth({margin:true}));if(i=="show"){e.css(f,c=="pos"?-j:j)}var g={};g[f]=(i=="show"?(c=="pos"?"+=":"-="):(c=="pos"?"-=":"+="))+j;e.animate(g,{queue:false,duration:b.duration,easing:b.options.easing,complete:function(){if(i=="hide"){e.hide()}a.effects.restore(e,d);a.effects.removeWrapper(e);if(b.callback){b.callback.apply(this,arguments)}e.dequeue()}})})}})(jQuery);;/*
 * jQuery UI Effects Transfer 1.8
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Transfer
 *
 * Depends:
 *	jquery.effects.core.js
 */(function(a){a.effects.transfer=function(b){return this.queue(function(){var f=a(this),h=a(b.options.to),e=h.offset(),g={top:e.top,left:e.left,height:h.innerHeight(),width:h.innerWidth()},d=f.offset(),c=a('<div class="ui-effects-transfer"></div>').appendTo(document.body).addClass(b.options.className).css({top:d.top,left:d.left,height:f.innerHeight(),width:f.innerWidth(),position:"absolute"}).animate(g,b.duration,b.options.easing,function(){c.remove();(b.callback&&b.callback.apply(f[0],arguments));f.dequeue()})})}})(jQuery);;
jQuery.url=function(){var segments={};var parsed={};var options={url:window.location,strictMode:false,key:["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],q:{name:"queryKey",parser:/(?:^|&)([^&=]*)=?([^&]*)/g},parser:{strict:/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,loose:/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/}};var parseUri=function(){str=decodeURI(options.url);var m=options.parser[options.strictMode?"strict":"loose"].exec(str);var uri={};var i=14;while(i--){uri[options.key[i]]=m[i]||""}uri[options.q.name]={};uri[options.key[12]].replace(options.q.parser,function($0,$1,$2){if($1){uri[options.q.name][$1]=$2}});return uri};var key=function(key){if(!parsed.length){setUp()}if(key=="base"){if(parsed.port!==null&&parsed.port!==""){return parsed.protocol+"://"+parsed.host+":"+parsed.port+"/"}else{return parsed.protocol+"://"+parsed.host+"/"}}return(parsed[key]==="")?null:parsed[key]};var param=function(item){if(!parsed.length){setUp()}return(parsed.queryKey[item]===null)?null:parsed.queryKey[item]};var setUp=function(){parsed=parseUri();getSegments()};var getSegments=function(){var p=parsed.path;segments=[];segments=parsed.path.length==1?{}:(p.charAt(p.length-1)=="/"?p.substring(1,p.length-1):path=p.substring(1)).split("/")};return{setMode:function(mode){strictMode=mode=="strict"?true:false;return this},setUrl:function(newUri){options.url=newUri===undefined?window.location:newUri;setUp();return this},segment:function(pos){if(!parsed.length){setUp()}if(pos===undefined){return segments.length}return(segments[pos]===""||segments[pos]===undefined)?null:segments[pos]},attr:key,param:param}}();
/**
 * Cookie plugin
 *
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

/**
 * Create a cookie with the given name and value and other optional parameters.
 *
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Set the value of a cookie.
 * @example $.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain: 'jquery.com', secure: true });
 * @desc Create a cookie with all available options.
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Create a session cookie.
 * @example $.cookie('the_cookie', null);
 * @desc Delete a cookie by passing null as value. Keep in mind that you have to use the same path and domain
 *       used when the cookie was set.
 *
 * @param String name The name of the cookie.
 * @param String value The value of the cookie.
 * @param Object options An object literal containing key/value pairs to provide optional cookie attributes.
 * @option Number|Date expires Either an integer specifying the expiration date from now on in days or a Date object.
 *                             If a negative value is specified (e.g. a date in the past), the cookie will be deleted.
 *                             If set to null or omitted, the cookie will be a session cookie and will not be retained
 *                             when the the browser exits.
 * @option String path The value of the path atribute of the cookie (default: path of page that created the cookie).
 * @option String domain The value of the domain attribute of the cookie (default: domain of page that created the cookie).
 * @option Boolean secure If true, the secure attribute of the cookie will be set and the cookie transmission will
 *                        require a secure protocol (like HTTPS).
 * @type undefined
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */

/**
 * Get the value of a cookie with the given name.
 *
 * @example $.cookie('the_cookie');
 * @desc Get the value of a cookie.
 *
 * @param String name The name of the cookie.
 * @return The value of the cookie.
 * @type String
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */
jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};
;(function(){

var $$;

$$ = jQuery.fn.flash = function(htmlOptions, pluginOptions, replace, update) {

	var block = replace || $$.replace;

	pluginOptions = $$.copy($$.pluginOptions, pluginOptions);

	if(!$$.hasFlash(pluginOptions.version)) {
		if(pluginOptions.expressInstall && $$.hasFlash(6,0,65)) {
			var expressInstallOptions = {
				flashvars: {
					MMredirectURL: location,
					MMplayerType: 'PlugIn',
					MMdoctitle: jQuery('title').text()
				}
			};
		} else if (pluginOptions.update) {
			block = update || $$.update;
		} else {
			return this;
		}
	}

	htmlOptions = $$.copy($$.htmlOptions, expressInstallOptions, htmlOptions);

	return this.each(function(){
		block.call(this, $$.copy(htmlOptions));
	});

};
$$.copy = function() {
	var options = {}, flashvars = {};
	for(var i = 0; i < arguments.length; i++) {
		var arg = arguments[i];
		if(arg == undefined) continue;
		jQuery.extend(options, arg);
		if(arg.flashvars == undefined) continue;
		jQuery.extend(flashvars, arg.flashvars);
	}
	options.flashvars = flashvars;
	return options;
};
/*
 * @name flash.hasFlash
 * @desc Check if a specific version of the Flash plugin is installed
 * @type Boolean
 *
**/
$$.hasFlash = function() {
	if(/hasFlash\=true/.test(location)) return true;
	if(/hasFlash\=false/.test(location)) return false;
	var pv = $$.hasFlash.playerVersion().match(/\d+/g);
	var rv = String([arguments[0], arguments[1], arguments[2]]).match(/\d+/g) || String($$.pluginOptions.version).match(/\d+/g);
	for(var i = 0; i < 3; i++) {
		pv[i] = parseInt(pv[i] || 0);
		rv[i] = parseInt(rv[i] || 0);
		if(pv[i] < rv[i]) return false;
		if(pv[i] > rv[i]) return true;
	}
	return true;
};
$$.hasFlash.playerVersion = function() {
	try {
		try {
			var axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
			try { axo.AllowScriptAccess = 'always';	}
			catch(e) { return '6,0,0'; }
		} catch(e) {}
		return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
	} catch(e) {
		try {
			if(navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin){
				return (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1];
			}
		} catch(e) {}
	}
	return '0,0,0';
};
$$.htmlOptions = {
	height: 240,
	flashvars: {},
	pluginspage: 'http://www.adobe.com/go/getflashplayer',
	src: '#',
	type: 'application/x-shockwave-flash',
	width: 320
};
$$.pluginOptions = {
	expressInstall: false,
	update: true,
	version: '6.0.65'
};
$$.replace = function(htmlOptions) {
	this.innerHTML = '<div class="alt">'+this.innerHTML+'</div>';
	jQuery(this)
		.addClass('flash-replaced')
		.prepend($$.transform(htmlOptions));
};
$$.update = function(htmlOptions) {
	var url = String(location).split('?');
	url.splice(1,0,'?hasFlash=true&');
	url = url.join('');
	var msg = '<p>This content requires the Flash Player. <a href="http://www.adobe.com/go/getflashplayer">Download Flash Player</a>. Already have Flash Player? <a href="'+url+'">Click here.</a></p>';
	this.innerHTML = '<span class="alt">'+this.innerHTML+'</span>';
	jQuery(this)
		.addClass('flash-update')
		.prepend(msg);
};
function toAttributeString() {
	var s = '';
	for(var key in this)
		if(typeof this[key] != 'function')
			s += key+'="'+this[key]+'" ';
	return s;
};
function toFlashvarsString() {
	var s = '';
	for(var key in this)
		if(typeof this[key] != 'function')
			s += key+'='+encodeURIComponent(this[key])+'&';
	return s.replace(/&$/, '');
};
$$.transform = function(htmlOptions) {
	htmlOptions.toString = toAttributeString;
	if(htmlOptions.flashvars) htmlOptions.flashvars.toString = toFlashvarsString;
	return '<embed ' + String(htmlOptions) + '/>';
};

if (window.attachEvent) {
	window.attachEvent("onbeforeunload", function(){
		__flash_unloadHandler = function() {};
		__flash_savedUnloadHandler = function() {};
	});
}

})();

/**
 * @namespace
 * $.couch is used to communicate with a CouchDB server, the server methods can
 * be called directly without creating an instance. Typically all methods are
 * passed an <code>options</code> object which defines a success callback which
 * is called with the data returned from the http request to CouchDB, you can
 * find the other settings that can be used in the <code>options</code> object
 * from <a href="http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings">
 * jQuery.ajax settings</a>
 * <pre><code>$.couch.activeTasks({
 *   success: function (data) {
 *     console.log(data);
 *   }
 * });</code></pre>
 * Outputs (for example):
 * <pre><code>[
 *  {
 *   "pid" : "<0.11599.0>",
 *   "status" : "Copied 0 of 18369 changes (0%)",
 *   "task" : "recipes",
 *   "type" : "Database Compaction"
 *  }
 *]</code></pre>
 */
(function($) {

  $.couch = $.couch || {};
  /** @lends $.couch */

  /**
   * @private
   */
  function encodeDocId(docID) {
    var parts = docID.split("/");
    if (parts[0] == "_design") {
      parts.shift();
      return "_design/" + encodeURIComponent(parts.join('/'));
    }
    return encodeURIComponent(docID);
  }

  /**
   * @private
   */

  var uuidCache = [];

  $.extend($.couch, {
    urlPrefix: '',

    /**
     * You can obtain a list of active tasks by using the /_active_tasks URL.
     * The result is a JSON array of the currently running tasks, with each task
     * being described with a single object.
     * @see <a href="http://techzone.couchbase.com/sites/default/files/uploads/
     * all/documentation/couchbase-api-misc.html#couchbase-api-misc_active-task
     * s_get">docs for /_active_tasks</a>
     * @param {ajaxSettings} options <a href="http://api.jquery.com/jQuery.ajax
     * /#jQuery-ajax-settings">jQuery ajax settings</a>
     */
    activeTasks: function(options) {
      ajax(
        {url: this.urlPrefix + "/_active_tasks"},
        options,
        "Active task status could not be retrieved"
      );
    },

    /**
     * Returns a list of all the databases in the CouchDB instance
     * @see <a href="http://techzone.couchbase.com/sites/default/files/uploads/
     * all/documentation/couchbase-api-misc.html#couchbase-api-misc_active-task
     * s_get">docs for /_all_dbs</a>
     * @param {ajaxSettings} options <a href="http://api.jquery.com/jQuery.ajax
     * /#jQuery-ajax-settings">jQuery ajax settings</a>
     */
    allDbs: function(options) {
      ajax(
        {url: this.urlPrefix + "/_all_dbs"},
        options,
        "An error occurred retrieving the list of all databases"
      );
    },

    /**
     * View and edit the CouchDB configuration, called with just the options
     * parameter the entire config is returned, you can be more specific by
     * passing the section and option parameters, if you specify a value that
     * value will be stored in the configuration.
     * @see <a href="http://techzone.couchbase.com/sites/default/files/uploads/
     * all/documentation/couchbase-api-config.html#couchbase-api-config_config
     * -section-key_put">docs for /_config</a>
     * @param {ajaxSettings} options
     * <a href="http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings">
     * jQuery ajax settings</a>
     * @param {String} [section] the section of the config
     * @param {String} [option] the particular config option
     * @param {String} [value] value to be set
     */
    config: function(options, section, option, value) {
      var req = {url: this.urlPrefix + "/_config/"};
      if (section) {
        req.url += encodeURIComponent(section) + "/";
        if (option) {
          req.url += encodeURIComponent(option);
        }
      }
      if (value === null) {
        req.type = "DELETE";
      } else if (value !== undefined) {
        req.type = "PUT";
        req.data = toJSON(value);
        req.contentType = "application/json";
        req.processData = false
      }

      ajax(req, options,
        "An error occurred retrieving/updating the server configuration"
      );
    },

    /**
     * Returns the session information for the currently logged in user.
     * @param {ajaxSettings} options
     * <a href="http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings">
     * jQuery ajax settings</a>
     */
    session: function(options) {
      options = options || {};
      ajax({
        type: "GET", url: this.urlPrefix + "/_session",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Accept', 'application/json');
        },
        complete: function(req) {
          var resp = $.parseJSON(req.responseText);
          if (req.status == 200) {
            if (options.success) options.success(resp);
          } else if (options.error) {
            options.error(req.status, resp.error, resp.reason);
          } else {
            throw "An error occurred getting session info: " + resp.reason;
          }
        }
      });
    },

    /**
     * @private
     */
    userDb : function(callback) {
      $.couch.session({
        success : function(resp) {
          var userDb = $.couch.db(resp.info.authentication_db);
          callback(userDb);
        }
      });
    },

    /**
     * Create a new user on the CouchDB server, <code>user_doc</code> is an
     * object with a <code>name</code> field and other information you want
     * to store relating to that user, for example
     * <code>{"name": "daleharvey"}</code>
     * @param {Object} user_doc Users details
     * @param {String} password Users password
     * @param {ajaxSettings} options
     * <a href="http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings">
      * jQuery ajax settings</a>
     */
    signup: function(user_doc, password, options) {
      options = options || {};
      user_doc.password = password;
      user_doc.roles =  user_doc.roles || [];
      user_doc.type =  user_doc.type = "user" || [];
      var user_prefix = "org.couchdb.user:";
      user_doc._id = user_doc._id || user_prefix + user_doc.name;

      $.couch.userDb(function(db) {
        db.saveDoc(user_doc, options);
      });
    },

    /**
     * Authenticate against CouchDB, the <code>options</code> parameter is
      *expected to have <code>name</code> and <code>password</code> fields.
     * @param {ajaxSettings} options
     * <a href="http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings">
     * jQuery ajax settings</a>
     */
    login: function(options) {
      options = options || {};
      $.ajax({
        type: "POST", url: this.urlPrefix + "/_session", dataType: "json",
        data: {name: options.name, password: options.password},
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Accept', 'application/json');
        },
        complete: function(req) {
          var resp = $.parseJSON(req.responseText);
          if (req.status == 200) {
            if (options.success) options.success(resp);
          } else if (options.error) {
            options.error(req.status, resp.error, resp.reason);
          } else {
            throw 'An error occurred logging in: ' + resp.reason;
          }
        }
      });
    },


    /**
     * Delete your current CouchDB user session
     * @param {ajaxSettings} options
     * <a href="http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings">
     * jQuery ajax settings</a>
     */
    logout: function(options) {
      options = options || {};
      $.ajax({
        type: "DELETE", url: this.urlPrefix + "/_session", dataType: "json",
        username : "_", password : "_",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Accept', 'application/json');
        },
        complete: function(req) {
          var resp = $.parseJSON(req.responseText);
          if (req.status == 200) {
            if (options.success) options.success(resp);
          } else if (options.error) {
            options.error(req.status, resp.error, resp.reason);
          } else {
            throw 'An error occurred logging out: ' + resp.reason;
          }
        }
      });
    },

    /**
     * @namespace
     * $.couch.db is used to communicate with a specific CouchDB database
     * <pre><code>var $db = $.couch.db("mydatabase");
     *$db.allApps({
     *  success: function (data) {
     *    ... process data ...
     *  }
     *});
     * </code></pre>
     */
    db: function(name, db_opts) {
      db_opts = db_opts || {};
      var rawDocs = {};
      function maybeApplyVersion(doc) {
        if (doc._id && doc._rev && rawDocs[doc._id] &&
            rawDocs[doc._id].rev == doc._rev) {
          if (typeof Base64 == "undefined") {
            throw 'Base64 support not found.';
          } else {
            doc._attachments = doc._attachments || {};
            doc._attachments["rev-"+doc._rev.split("-")[0]] = {
              content_type :"application/json",
              data : Base64.encode(rawDocs[doc._id].raw)
            };
            return true;
          }
        }
      };
      return /** @lends $.couch.db */{
        name: name,
        uri: this.urlPrefix + "/" + encodeURIComponent(name) + "/",

        /**
         * Request compaction of the specified database.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-db.html#couchbase-api-db_
         * db-compact_post">docs for /db/_compact</a>
         * @param {ajaxSettings} options
         * <a href="http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings">
         * jQuery ajax settings</a>
         */
        compact: function(options) {
          $.extend(options, {successStatus: 202});
          ajax({
              type: "POST", url: this.uri + "_compact",
              data: "", processData: false
            },
            options,
            "The database could not be compacted"
          );
        },

        /**
         * Cleans up the cached view output on disk for a given view.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-db.html#couchbase-api-db
         * _db-view-cleanup_post">docs for /db/_compact</a>
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        viewCleanup: function(options) {
          $.extend(options, {successStatus: 202});
          ajax({
              type: "POST", url: this.uri + "_view_cleanup",
              data: "", processData: false
            },
            options,
            "The views could not be cleaned up"
          );
        },

        /**
         * Compacts the view indexes associated with the specified design
         * document. You can use this in place of the full database compaction
         * if you know a specific set of view indexes have been affected by a
         * recent database change.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/upl
         * oads/all/documentation/couchbase-api-db.html#couchbase-api-db_db-
         * compact-design-doc_post">docs for /db/_compact/design-doc</a>
         * @param {String} groupname Name of design-doc to compact
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        compactView: function(groupname, options) {
          $.extend(options, {successStatus: 202});
          ajax({
              type: "POST", url: this.uri + "_compact/" + groupname,
              data: "", processData: false
            },
            options,
            "The view could not be compacted"
          );
        },

        /**
         * Create a new database
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-db.html#couchbase-api-db_
         * db_put">docs for PUT /db/</a>
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        create: function(options) {
          $.extend(options, {successStatus: 201});
          ajax({
              type: "PUT", url: this.uri, contentType: "application/json",
              data: "", processData: false
            },
            options,
            "The database could not be created"
          );
        },

        /**
         * Deletes the specified database, and all the documents and
         * attachments contained within it.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-db.html#couchbase-api-db_
         * db_delete">docs for DELETE /db/</a>
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        drop: function(options) {
          ajax(
            {type: "DELETE", url: this.uri},
            options,
            "The database could not be deleted"
          );
        },

        /**
         * Gets information about the specified database.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-db.html#couchbase-api-db
         * _db_get">docs for GET /db/</a>
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        info: function(options) {
          ajax(
            {url: this.uri},
            options,
            "Database information could not be retrieved"
          );
        },

        /**
         * @namespace
         * $.couch.db.changes provides an API for subscribing to the changes
         * feed
         * <pre><code>var $changes = $.couch.db("mydatabase").changes();
         *$changes.onChange = function (data) {
         *    ... process data ...
         * }
         * $changes.stop();
         * </code></pre>
         */
        changes: function(since, options) {

          options = options || {};
          var timeout = 100, db = this, active = true,
            listeners = [],
            promise = /** @lends $.couch.db.changes */ {
              /**
               * Add a listener callback
               * @see <a href="http://techzone.couchbase.com/sites/default/
               * files/uploads/all/documentation/couchbase-api-db.html#couch
               * base-api-db_db-changes_get">docs for /db/_changes</a>
               * @param {Function} fun Callback function to run when
               * notified of changes.
               */
            onChange : function(fun) {
              listeners.push(fun);
            },
              /**
               * Stop subscribing to the changes feed
               */
            stop : function() {
              active = false;
            }
          };
          function triggerListeners(resp) {
            $.each(listeners, function() {
              this(resp);
            });
          };
          options.success = function(resp) {
            timeout = 100;
            if (active) {
              since = resp.last_seq;
              triggerListeners(resp);
              getChangesSince();
            };
          };
          options.error = function() {
            if (active) {
              setTimeout(getChangesSince, timeout);
              timeout = timeout * 2;
            }
          };
          function getChangesSince() {
            var opts = $.extend({heartbeat : 10 * 1000}, options, {
              feed : "longpoll",
              since : since
            });
            ajax(
              {url: db.uri + "_changes"+encodeOptions(opts)},
              options,
              "Error connecting to "+db.uri+"/_changes."
            );
          }
          if (since) {
            getChangesSince();
          } else {
            db.info({
              success : function(info) {
                since = info.update_seq;
                getChangesSince();
              }
            });
          }
          return promise;
        },

        /**
         * Fetch all the docs in this db, you can specify an array of keys to
         * fetch by passing the <code>keys</code> field in the
         * <code>options</code>
         * parameter.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-db.html#couchbase-api-db_
         * db-all-docs_get">docs for /db/all_docs/</a>
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        allDocs: function(options) {
          var type = "GET";
          var data = null;
          if (options["keys"]) {
            type = "POST";
            var keys = options["keys"];
            delete options["keys"];
            data = toJSON({ "keys": keys });
          }
          ajax({
              type: type,
              data: data,
              url: this.uri + "_all_docs" + encodeOptions(options)
            },
            options,
            "An error occurred retrieving a list of all documents"
          );
        },

        /**
         * Fetch all the design docs in this db
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        allDesignDocs: function(options) {
          this.allDocs($.extend(
            {startkey:"_design", endkey:"_design0"}, options));
        },

        /**
         * Fetch all the design docs with an index.html, <code>options</code>
         * parameter expects an <code>eachApp</code> field which is a callback
         * called on each app found.
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        allApps: function(options) {
          options = options || {};
          var self = this;
          if (options.eachApp) {
            this.allDesignDocs({
              success: function(resp) {
                $.each(resp.rows, function() {
                  self.openDoc(this.id, {
                    success: function(ddoc) {
                      var index, appPath, appName = ddoc._id.split('/');
                      appName.shift();
                      appName = appName.join('/');
                      index = ddoc.couchapp && ddoc.couchapp.index;
                      if (index) {
                        appPath = ['', name, ddoc._id, index].join('/');
                      } else if (ddoc._attachments &&
                                 ddoc._attachments["index.html"]) {
                        appPath = ['', name, ddoc._id, "index.html"].join('/');
                      }
                      if (appPath) options.eachApp(appName, appPath, ddoc);
                    }
                  });
                });
              }
            });
          } else {
            throw 'Please provide an eachApp function for allApps()';
          }
        },

        /**
         * Returns the specified doc from the specified db.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-dbdoc.html#couchbase-api-
         * dbdoc_db-doc_get">docs for GET /db/doc</a>
         * @param {String} docId id of document to fetch
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         * @param {ajaxSettings} ajaxOptions <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        openDoc: function(docId, options, ajaxOptions) {
          options = options || {};
          if (db_opts.attachPrevRev || options.attachPrevRev) {
            $.extend(options, {
              beforeSuccess : function(req, doc) {
                rawDocs[doc._id] = {
                  rev : doc._rev,
                  raw : req.responseText
                };
              }
            });
          } else {
            $.extend(options, {
              beforeSuccess : function(req, doc) {
                if (doc["jquery.couch.attachPrevRev"]) {
                  rawDocs[doc._id] = {
                    rev : doc._rev,
                    raw : req.responseText
                  };
                }
              }
            });
          }
          ajax({url: this.uri + encodeDocId(docId) + encodeOptions(options)},
            options,
            "The document could not be retrieved",
            ajaxOptions
          );
        },

        /**
         * Create a new document in the specified database, using the supplied
         * JSON document structure. If the JSON structure includes the _id
         * field, then the document will be created with the specified document
         * ID. If the _id field is not specified, a new unique ID will be
         * generated.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-dbdoc.html#couchbase-api-
         * dbdoc_db_post">docs for GET /db/doc</a>
         * @param {String} doc document to save
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        saveDoc: function(doc, options) {
          options = options || {};
          var db = this;
          var beforeSend = fullCommit(options);
          if (doc._id === undefined) {
            var method = "POST";
            var uri = this.uri;
          } else {
            var method = "PUT";
            var uri = this.uri + encodeDocId(doc._id);
          }
          var versioned = maybeApplyVersion(doc);
          $.ajax({
            type: method, url: uri + encodeOptions(options),
            contentType: "application/json",
            dataType: "json", data: toJSON(doc),
            beforeSend : beforeSend,
            complete: function(req) {
              var resp = $.parseJSON(req.responseText);
              if (req.status == 200 || req.status == 201 || req.status == 202) {
                doc._id = resp.id;
                doc._rev = resp.rev;
                if (versioned) {
                  db.openDoc(doc._id, {
                    attachPrevRev : true,
                    success : function(d) {
                      doc._attachments = d._attachments;
                      if (options.success) options.success(resp);
                    }
                  });
                } else {
                  if (options.success) options.success(resp);
                }
              } else if (options.error) {
                options.error(req.status, resp.error, resp.reason);
              } else {
                throw "The document could not be saved: " + resp.reason;
              }
            }
          });
        },

        /**
         * Save a list of documents
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-db.html#couchbase-api-db_
         * db-bulk-docs_post">docs for /db/_bulk_docs</a>
         * @param {Object[]} docs List of documents to save
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        bulkSave: function(docs, options) {
          var beforeSend = fullCommit(options);
          $.extend(options, {successStatus: 201, beforeSend : beforeSend});
          ajax({
              type: "POST",
              url: this.uri + "_bulk_docs" + encodeOptions(options),
              contentType: "application/json", data: toJSON(docs)
            },
            options,
            "The documents could not be saved"
          );
        },

        /**
         * Deletes the specified document from the database. You must supply
         * the current (latest) revision and <code>id</code> of the document
         * to delete eg <code>removeDoc({_id:"mydoc", _rev: "1-2345"})</code>
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-dbdoc.html#couchbase-api
         * -dbdoc_db-doc_delete">docs for DELETE /db/doc</a>
         * @param {Object} doc Document to delete
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        removeDoc: function(doc, options) {
          ajax({
              type: "DELETE",
              url: this.uri +
                   encodeDocId(doc._id) +
                   encodeOptions({rev: doc._rev})
            },
            options,
            "The document could not be deleted"
          );
        },

        /**
         * Remove a set of documents
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-db.html#couchbase-api-db_
         * db-bulk-docs_post">docs for /db/_bulk_docs</a>
         * @param {String[]} docs List of document id's to remove
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        bulkRemove: function(docs, options){
          docs.docs = $.each(
            docs.docs, function(i, doc){
              doc._deleted = true;
            }
          );
          $.extend(options, {successStatus: 201});
          ajax({
              type: "POST",
              url: this.uri + "_bulk_docs" + encodeOptions(options),
              data: toJSON(docs)
            },
            options,
            "The documents could not be deleted"
          );
        },

        /**
         * The COPY command (which is non-standard HTTP) copies an existing
         * document to a new or existing document.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-dbdoc.html#couchbase-api-
         * dbdoc_db-doc_copy">docs for COPY /db/doc</a>
         * @param {String[]} docId document id to copy
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        copyDoc: function(docId, options, ajaxOptions) {
          ajaxOptions = $.extend(ajaxOptions, {
            complete: function(req) {
              var resp = $.parseJSON(req.responseText);
              if (req.status == 201) {
                if (options.success) options.success(resp);
              } else if (options.error) {
                options.error(req.status, resp.error, resp.reason);
              } else {
                throw "The document could not be copied: " + resp.reason;
              }
            }
          });
          ajax({
              type: "COPY",
              url: this.uri + encodeDocId(docId)
            },
            options,
            "The document could not be copied",
            ajaxOptions
          );
        },

        /**
         * Creates (and executes) a temporary view based on the view function
         * supplied in the JSON request.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-db.html#couchbase-api-db
         * _db-temp-view_post">docs for /db/_temp_view</a>
         * @param {Function} mapFun Map function
         * @param {Function} reduceFun Reduce function
         * @param {Function} language Language the map / reduce funs are
         * implemented in
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        query: function(mapFun, reduceFun, language, options) {
          language = language || "javascript";
          if (typeof(mapFun) !== "string") {
            mapFun = mapFun.toSource ? mapFun.toSource()
              : "(" + mapFun.toString() + ")";
          }
          var body = {language: language, map: mapFun};
          if (reduceFun != null) {
            if (typeof(reduceFun) !== "string")
              reduceFun = reduceFun.toSource ? reduceFun.toSource()
                : "(" + reduceFun.toString() + ")";
            body.reduce = reduceFun;
          }
          ajax({
              type: "POST",
              url: this.uri + "_temp_view" + encodeOptions(options),
              contentType: "application/json", data: toJSON(body)
            },
            options,
            "An error occurred querying the database"
          );
        },

        /**
         * Fetch a _list view output, you can specify a list of
         * <code>keys</code> in the options object to recieve only those keys.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-design.html#couchbase-api
         * -design_db-design-designdoc-list-listname-viewname_get">
         * docs for /db/_design/design-doc/_list/l1/v1</a>
         * @param {String} list Listname in the form of ddoc/listname
         * @param {String} view View to run list against
         * @param {options} CouchDB <a href="http://wiki.apache.org/couchdb/
         * HTTP_view_API">View Options</a>
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        list: function(list, view, options, ajaxOptions) {
          var list = list.split('/');
          var options = options || {};
          var type = 'GET';
          var data = null;
          if (options['keys']) {
            type = 'POST';
            var keys = options['keys'];
            delete options['keys'];
            data = toJSON({'keys': keys });
          }
          ajax({
              type: type,
              data: data,
              url: this.uri + '_design/' + list[0] +
                   '/_list/' + list[1] + '/' + view + encodeOptions(options)
              },
              ajaxOptions, 'An error occured accessing the list'
          );
        },

        /**
         * Executes the specified view-name from the specified design-doc
         * design document, you can specify a list of <code>keys</code>
         * in the options object to recieve only those keys.
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api-design.html#couchbase-api-
         * design_db-design-designdoc-view-viewname_get">docs for /db/
         * _design/design-doc/_list/l1/v1</a>
         * @param {String} name View to run list against
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        view: function(name, options) {
          var name = name.split('/');
          var options = options || {};
          var type = "GET";
          var data= null;
          if (options["keys"]) {
            type = "POST";
            var keys = options["keys"];
            delete options["keys"];
            data = toJSON({ "keys": keys });
          }
          ajax({
              type: type,
              data: data,
              url: this.uri + "_design/" + name[0] +
                   "/_view/" + name[1] + encodeOptions(options)
            },
            options, "An error occurred accessing the view"
          );
        },

        /**
         * Fetch an arbitrary CouchDB database property
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api.html">docs for /db/_prop</a>
         * @param {String} propName Propery name to fetch
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         * @param {ajaxSettings} ajaxOptions <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        getDbProperty: function(propName, options, ajaxOptions) {
          ajax({url: this.uri + propName + encodeOptions(options)},
            options,
            "The property could not be retrieved",
            ajaxOptions
          );
        },

        /**
         * Set an arbitrary CouchDB database property
         * @see <a href="http://techzone.couchbase.com/sites/default/files/
         * uploads/all/documentation/couchbase-api.html">docs for /db/_prop</a>
         * @param {String} propName Propery name to fetch
         * @param {String} propValue Propery value to set
         * @param {ajaxSettings} options <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         * @param {ajaxSettings} ajaxOptions <a href="http://api.jquery.com/
         * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
         */
        setDbProperty: function(propName, propValue, options, ajaxOptions) {
          ajax({
            type: "PUT",
            url: this.uri + propName + encodeOptions(options),
            data : JSON.stringify(propValue)
          },
            options,
            "The property could not be updated",
            ajaxOptions
          );
        }
      };
    },

    encodeDocId: encodeDocId,

    /**
     * Accessing the root of a CouchDB instance returns meta information about
     * the instance. The response is a JSON structure containing information
     * about the server, including a welcome message and the version of the
     * server.
     * @see <a href="http://techzone.couchbase.com/sites/default/files/uploads/
     * all/documentation/couchbase-api-misc.html#couchbase-api-misc_root_get">
     * docs for GET /</a>
     * @param {ajaxSettings} options <a href="http://api.jquery.com/
     * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
     */
    info: function(options) {
      ajax(
        {url: this.urlPrefix + "/"},
        options,
        "Server information could not be retrieved"
      );
    },

    /**
     * Request, configure, or stop, a replication operation.
     * @see <a href="http://techzone.couchbase.com/sites/default/files/
     * uploads/all/documentation/couchbase-api-misc.html#couchbase-api-
     * misc_replicate_post">docs for POST /_replicate</a>
     * @param {String} source Path or url to source database
     * @param {String} target Path or url to target database
     * @param {ajaxSettings} ajaxOptions <a href="http://api.jquery.com/
     * jQuery.ajax/#jQuery-ajax-settings">jQuery ajax settings</a>
     * @param {Object} repOpts Additional replication options
     */
    replicate: function(source, target, ajaxOptions, repOpts) {
      repOpts = $.extend({source: source, target: target}, repOpts);
      if (repOpts.continuous && !repOpts.cancel) {
        ajaxOptions.successStatus = 202;
      }
      ajax({
          type: "POST", url: this.urlPrefix + "/_replicate",
          data: JSON.stringify(repOpts),
          contentType: "application/json"
        },
        ajaxOptions,
        "Replication failed"
      );
    },

    /**
     * Fetch a new UUID
     * @see <a href="http://techzone.couchbase.com/sites/default/files/
     * uploads/all/documentation/couchbase-api-misc.html#couchbase-api-
     * misc_uuids_get">docs for /_uuids</a>
     * @param {Int} cacheNum Number of uuids to keep cached for future use
     */
    newUUID: function(cacheNum) {
      if (cacheNum === undefined) {
        cacheNum = 1;
      }
      if (!uuidCache.length) {
        ajax({url: this.urlPrefix + "/_uuids", data: {count: cacheNum}, async:
              false}, {
            success: function(resp) {
              uuidCache = resp.uuids;
            }
          },
          "Failed to retrieve UUID batch."
        );
      }
      return uuidCache.shift();
    }
  });

  /**
   * @private
   */
  function ajax(obj, options, errorMessage, ajaxOptions) {
    var timeStart;
    var defaultAjaxOpts = {
      contentType: "application/json",
      headers:{"Accept": "application/json"}
    };

    options = $.extend({successStatus: 200}, options);
    ajaxOptions = $.extend(defaultAjaxOpts, ajaxOptions);
    errorMessage = errorMessage || "Unknown error";
    timeStart = (new Date()).getTime();
    $.ajax($.extend($.extend({
      type: "GET", dataType: "json", cache : !$.browser.msie,
      beforeSend: function(xhr){
        if(ajaxOptions && ajaxOptions.headers){
          for (var header in ajaxOptions.headers){
            xhr.setRequestHeader(header, ajaxOptions.headers[header]);
          }
        }
      },
      complete: function(req) {
        var reqDuration = (new Date()).getTime() - timeStart;
        try {
          var resp = $.parseJSON(req.responseText);
        } catch(e) {
          if (options.error) {
            options.error(req.status, req, e);
          } else {
            throw errorMessage + ': ' + e;
          }
          return;
        }
        if (options.ajaxStart) {
          options.ajaxStart(resp);
        }
        if (req.status == options.successStatus) {
          if (options.beforeSuccess) options.beforeSuccess(req, resp, reqDuration);
          if (options.success) options.success(resp, reqDuration);
        } else if (options.error) {
          options.error(req.status, resp && resp.error ||
                        errorMessage, resp && resp.reason || "no response",
                        reqDuration);
        } else {
          throw errorMessage + ": " + resp.reason;
        }
      }
    }, obj), ajaxOptions));
  }

  /**
   * @private
   */
  function fullCommit(options) {
    var options = options || {};
    if (typeof options.ensure_full_commit !== "undefined") {
      var commit = options.ensure_full_commit;
      delete options.ensure_full_commit;
      return function(xhr) {
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader("X-Couch-Full-Commit", commit.toString());
      };
    }
  };

  /**
   * @private
   */
  function encodeOptions(options) {
    var buf = [];
    if (typeof(options) === "object" && options !== null) {
      for (var name in options) {
        if ($.inArray(name,
                      ["error", "success", "beforeSuccess", "ajaxStart"]) >= 0)
          continue;
        var value = options[name];
        if ($.inArray(name, ["key", "startkey", "endkey"]) >= 0) {
          value = toJSON(value);
        }
        buf.push(encodeURIComponent(name) + "=" + encodeURIComponent(value));
      }
    }
    return buf.length ? "?" + buf.join("&") : "";
  }

  /**
   * @private
   */
  function toJSON(obj) {
    return obj !== null ? JSON.stringify(obj) : null;
  }

})(jQuery);
/*
 * 	Easy Tooltip 1.0 - jQuery plugin
 *	written by Alen Grakalic
 *	http://cssglobe.com/post/4380/easy-tooltip--jquery-plugin
 *
 *	Copyright (c) 2009 Alen Grakalic (http://cssglobe.com)
 *	Dual licensed under the MIT (MIT-LICENSE.txt)
 *	and GPL (GPL-LICENSE.txt) licenses.
 *
 *	Built for jQuery library
 *	http://jquery.com
 *
 */

(function($) {

	$.fn.easyTooltip = function(options){

		var defaults = {
			xOffset: 10,
			yOffset: 25,
			tooltipId: "easyTooltip",
			clickRemove: false,
			content: "",
			useElement: ""
		};

		var options = $.extend(defaults, options);
		var content;

		this.each(function() {
			var title = $(this).attr("title");
			$(this).hover(function(e){
				content = (options.content != "") ? options.content : title;
				content = (options.useElement != "") ? $("#" + options.useElement).html() : content;
				$(this).attr("title","");
				if (content != "" && content != undefined){
					$("body").append("<div id='"+ options.tooltipId +"'>"+ content +"</div>");
					$("#" + options.tooltipId)
						.css("position","absolute")
						.css("top",(e.pageY - options.yOffset) + "px")
						.css("left",(e.pageX + options.xOffset) + "px")
						.css("display","none")
						.fadeIn("fast")
				}
			},
			function(){
				$("#" + options.tooltipId).remove();
				$(this).attr("title",title);
			});
			$(this).mousemove(function(e){
				$("#" + options.tooltipId)
					.css("top",(e.pageY - options.yOffset) + "px")
					.css("left",(e.pageX + options.xOffset) + "px")
			});
			if(options.clickRemove){
				$(this).mousedown(function(e){
					$("#" + options.tooltipId).remove();
					$(this).attr("title",title);
				});
			}
		});

	};

})(jQuery);

(function($){$.extend({tablesorter:new
function(){var parsers=[],widgets=[];this.defaults={cssHeader:"header",cssAsc:"headerSortUp",cssDesc:"headerSortDown",cssChildRow:"expand-child",sortInitialOrder:"asc",sortMultiSortKey:"shiftKey",sortForce:null,sortAppend:null,sortLocaleCompare:true,textExtraction:"simple",parsers:{},widgets:[],widgetZebra:{css:["even","odd"]},headers:{},widthFixed:false,cancelSelection:true,sortList:[],headerList:[],dateFormat:"us",decimal:'/\.|\,/g',onRenderHeader:null,selectorHeaders:'thead th',debug:false};function benchmark(s,d){log(s+","+(new Date().getTime()-d.getTime())+"ms");}this.benchmark=benchmark;function log(s){if(typeof console!="undefined"&&typeof console.debug!="undefined"){console.log(s);}else{alert(s);}}function buildParserCache(table,$headers){if(table.config.debug){var parsersDebug="";}if(table.tBodies.length==0)return;var rows=table.tBodies[0].rows;if(rows[0]){var list=[],cells=rows[0].cells,l=cells.length;for(var i=0;i<l;i++){var p=false;if($.metadata&&($($headers[i]).metadata()&&$($headers[i]).metadata().sorter)){p=getParserById($($headers[i]).metadata().sorter);}else if((table.config.headers[i]&&table.config.headers[i].sorter)){p=getParserById(table.config.headers[i].sorter);}if(!p){p=detectParserForColumn(table,rows,-1,i);}if(table.config.debug){parsersDebug+="column:"+i+" parser:"+p.id+"\n";}list.push(p);}}if(table.config.debug){log(parsersDebug);}return list;};function detectParserForColumn(table,rows,rowIndex,cellIndex){var l=parsers.length,node=false,nodeValue=false,keepLooking=true;while(nodeValue==''&&keepLooking){rowIndex++;if(rows[rowIndex]){node=getNodeFromRowAndCellIndex(rows,rowIndex,cellIndex);nodeValue=trimAndGetNodeText(table.config,node);if(table.config.debug){log('Checking if value was empty on row:'+rowIndex);}}else{keepLooking=false;}}for(var i=1;i<l;i++){if(parsers[i].is(nodeValue,table,node)){return parsers[i];}}return parsers[0];}function getNodeFromRowAndCellIndex(rows,rowIndex,cellIndex){return rows[rowIndex].cells[cellIndex];}function trimAndGetNodeText(config,node){return $.trim(getElementText(config,node));}function getParserById(name){var l=parsers.length;for(var i=0;i<l;i++){if(parsers[i].id.toLowerCase()==name.toLowerCase()){return parsers[i];}}return false;}function buildCache(table){if(table.config.debug){var cacheTime=new Date();}var totalRows=(table.tBodies[0]&&table.tBodies[0].rows.length)||0,totalCells=(table.tBodies[0].rows[0]&&table.tBodies[0].rows[0].cells.length)||0,parsers=table.config.parsers,cache={row:[],normalized:[]};for(var i=0;i<totalRows;++i){var c=$(table.tBodies[0].rows[i]),cols=[];if(c.hasClass(table.config.cssChildRow)){cache.row[cache.row.length-1]=cache.row[cache.row.length-1].add(c);continue;}cache.row.push(c);for(var j=0;j<totalCells;++j){cols.push(parsers[j].format(getElementText(table.config,c[0].cells[j]),table,c[0].cells[j]));}cols.push(cache.normalized.length);cache.normalized.push(cols);cols=null;};if(table.config.debug){benchmark("Building cache for "+totalRows+" rows:",cacheTime);}return cache;};function getElementText(config,node){var text="";if(!node)return"";if(!config.supportsTextContent)config.supportsTextContent=node.textContent||false;if(config.textExtraction=="simple"){if(config.supportsTextContent){text=node.textContent;}else{if(node.childNodes[0]&&node.childNodes[0].hasChildNodes()){text=node.childNodes[0].innerHTML;}else{text=node.innerHTML;}}}else{if(typeof(config.textExtraction)=="function"){text=config.textExtraction(node);}else{text=$(node).text();}}return text;}function appendToTable(table,cache){if(table.config.debug){var appendTime=new Date()}var c=cache,r=c.row,n=c.normalized,totalRows=n.length,checkCell=(n[0].length-1),tableBody=$(table.tBodies[0]),rows=[];for(var i=0;i<totalRows;i++){var pos=n[i][checkCell];rows.push(r[pos]);if(!table.config.appender){var l=r[pos].length;for(var j=0;j<l;j++){tableBody[0].appendChild(r[pos][j]);}}}if(table.config.appender){table.config.appender(table,rows);}rows=null;if(table.config.debug){benchmark("Rebuilt table:",appendTime);}applyWidget(table);setTimeout(function(){$(table).trigger("sortEnd");},0);};function buildHeaders(table){if(table.config.debug){var time=new Date();}var meta=($.metadata)?true:false;var header_index=computeTableHeaderCellIndexes(table);$tableHeaders=$(table.config.selectorHeaders,table).each(function(index){this.column=header_index[this.parentNode.rowIndex+"-"+this.cellIndex];this.order=formatSortingOrder(table.config.sortInitialOrder);this.count=this.order;if(checkHeaderMetadata(this)||checkHeaderOptions(table,index))this.sortDisabled=true;if(checkHeaderOptionsSortingLocked(table,index))this.order=this.lockedOrder=checkHeaderOptionsSortingLocked(table,index);if(!this.sortDisabled){var $th=$(this).addClass(table.config.cssHeader);if(table.config.onRenderHeader)table.config.onRenderHeader.apply($th);}table.config.headerList[index]=this;});if(table.config.debug){benchmark("Built headers:",time);log($tableHeaders);}return $tableHeaders;};function computeTableHeaderCellIndexes(t){var matrix=[];var lookup={};var thead=t.getElementsByTagName('THEAD')[0];var trs=thead.getElementsByTagName('TR');for(var i=0;i<trs.length;i++){var cells=trs[i].cells;for(var j=0;j<cells.length;j++){var c=cells[j];var rowIndex=c.parentNode.rowIndex;var cellId=rowIndex+"-"+c.cellIndex;var rowSpan=c.rowSpan||1;var colSpan=c.colSpan||1
var firstAvailCol;if(typeof(matrix[rowIndex])=="undefined"){matrix[rowIndex]=[];}for(var k=0;k<matrix[rowIndex].length+1;k++){if(typeof(matrix[rowIndex][k])=="undefined"){firstAvailCol=k;break;}}lookup[cellId]=firstAvailCol;for(var k=rowIndex;k<rowIndex+rowSpan;k++){if(typeof(matrix[k])=="undefined"){matrix[k]=[];}var matrixrow=matrix[k];for(var l=firstAvailCol;l<firstAvailCol+colSpan;l++){matrixrow[l]="x";}}}}return lookup;}function checkCellColSpan(table,rows,row){var arr=[],r=table.tHead.rows,c=r[row].cells;for(var i=0;i<c.length;i++){var cell=c[i];if(cell.colSpan>1){arr=arr.concat(checkCellColSpan(table,headerArr,row++));}else{if(table.tHead.length==1||(cell.rowSpan>1||!r[row+1])){arr.push(cell);}}}return arr;};function checkHeaderMetadata(cell){if(($.metadata)&&($(cell).metadata().sorter===false)){return true;};return false;}function checkHeaderOptions(table,i){if((table.config.headers[i])&&(table.config.headers[i].sorter===false)){return true;};return false;}function checkHeaderOptionsSortingLocked(table,i){if((table.config.headers[i])&&(table.config.headers[i].lockedOrder))return table.config.headers[i].lockedOrder;return false;}function applyWidget(table){var c=table.config.widgets;var l=c.length;for(var i=0;i<l;i++){getWidgetById(c[i]).format(table);}}function getWidgetById(name){var l=widgets.length;for(var i=0;i<l;i++){if(widgets[i].id.toLowerCase()==name.toLowerCase()){return widgets[i];}}};function formatSortingOrder(v){if(typeof(v)!="Number"){return(v.toLowerCase()=="desc")?1:0;}else{return(v==1)?1:0;}}function isValueInArray(v,a){var l=a.length;for(var i=0;i<l;i++){if(a[i][0]==v){return true;}}return false;}function setHeadersCss(table,$headers,list,css){$headers.removeClass(css[0]).removeClass(css[1]);var h=[];$headers.each(function(offset){if(!this.sortDisabled){h[this.column]=$(this);}});var l=list.length;for(var i=0;i<l;i++){h[list[i][0]].addClass(css[list[i][1]]);}}function fixColumnWidth(table,$headers){var c=table.config;if(c.widthFixed){var colgroup=$('<colgroup>');$("tr:first td",table.tBodies[0]).each(function(){colgroup.append($('<col>').css('width',$(this).width()));});$(table).prepend(colgroup);};}function updateHeaderSortCount(table,sortList){var c=table.config,l=sortList.length;for(var i=0;i<l;i++){var s=sortList[i],o=c.headerList[s[0]];o.count=s[1];o.count++;}}function multisort(table,sortList,cache){if(table.config.debug){var sortTime=new Date();}var dynamicExp="var sortWrapper = function(a,b) {",l=sortList.length;for(var i=0;i<l;i++){var c=sortList[i][0];var order=sortList[i][1];var s=(table.config.parsers[c].type=="text")?((order==0)?makeSortFunction("text","asc",c):makeSortFunction("text","desc",c)):((order==0)?makeSortFunction("numeric","asc",c):makeSortFunction("numeric","desc",c));var e="e"+i;dynamicExp+="var "+e+" = "+s;dynamicExp+="if("+e+") { return "+e+"; } ";dynamicExp+="else { ";}var orgOrderCol=cache.normalized[0].length-1;dynamicExp+="return a["+orgOrderCol+"]-b["+orgOrderCol+"];";for(var i=0;i<l;i++){dynamicExp+="}; ";}dynamicExp+="return 0; ";dynamicExp+="}; ";if(table.config.debug){benchmark("Evaling expression:"+dynamicExp,new Date());}eval(dynamicExp);cache.normalized.sort(sortWrapper);if(table.config.debug){benchmark("Sorting on "+sortList.toString()+" and dir "+order+" time:",sortTime);}return cache;};function makeSortFunction(type,direction,index){var a="a["+index+"]",b="b["+index+"]";if(type=='text'&&direction=='asc'){return"("+a+" == "+b+" ? 0 : ("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : ("+a+" < "+b+") ? -1 : 1 )));";}else if(type=='text'&&direction=='desc'){return"("+a+" == "+b+" ? 0 : ("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : ("+b+" < "+a+") ? -1 : 1 )));";}else if(type=='numeric'&&direction=='asc'){return"("+a+" === null && "+b+" === null) ? 0 :("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : "+a+" - "+b+"));";}else if(type=='numeric'&&direction=='desc'){return"("+a+" === null && "+b+" === null) ? 0 :("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : "+b+" - "+a+"));";}};function makeSortText(i){return"((a["+i+"] < b["+i+"]) ? -1 : ((a["+i+"] > b["+i+"]) ? 1 : 0));";};function makeSortTextDesc(i){return"((b["+i+"] < a["+i+"]) ? -1 : ((b["+i+"] > a["+i+"]) ? 1 : 0));";};function makeSortNumeric(i){return"a["+i+"]-b["+i+"];";};function makeSortNumericDesc(i){return"b["+i+"]-a["+i+"];";};function sortText(a,b){if(table.config.sortLocaleCompare)return a.localeCompare(b);return((a<b)?-1:((a>b)?1:0));};function sortTextDesc(a,b){if(table.config.sortLocaleCompare)return b.localeCompare(a);return((b<a)?-1:((b>a)?1:0));};function sortNumeric(a,b){return a-b;};function sortNumericDesc(a,b){return b-a;};function getCachedSortType(parsers,i){return parsers[i].type;};this.construct=function(settings){return this.each(function(){if(!this.tHead||!this.tBodies)return;var $this,$document,$headers,cache,config,shiftDown=0,sortOrder;this.config={};config=$.extend(this.config,$.tablesorter.defaults,settings);$this=$(this);$.data(this,"tablesorter",config);$headers=buildHeaders(this);this.config.parsers=buildParserCache(this,$headers);cache=buildCache(this);var sortCSS=[config.cssDesc,config.cssAsc];fixColumnWidth(this);$headers.click(function(e){var totalRows=($this[0].tBodies[0]&&$this[0].tBodies[0].rows.length)||0;if(!this.sortDisabled&&totalRows>0){$this.trigger("sortStart");var $cell=$(this);var i=this.column;this.order=this.count++%2;if(this.lockedOrder)this.order=this.lockedOrder;if(!e[config.sortMultiSortKey]){config.sortList=[];if(config.sortForce!=null){var a=config.sortForce;for(var j=0;j<a.length;j++){if(a[j][0]!=i){config.sortList.push(a[j]);}}}config.sortList.push([i,this.order]);}else{if(isValueInArray(i,config.sortList)){for(var j=0;j<config.sortList.length;j++){var s=config.sortList[j],o=config.headerList[s[0]];if(s[0]==i){o.count=s[1];o.count++;s[1]=o.count%2;}}}else{config.sortList.push([i,this.order]);}};setTimeout(function(){setHeadersCss($this[0],$headers,config.sortList,sortCSS);appendToTable($this[0],multisort($this[0],config.sortList,cache));},1);return false;}}).mousedown(function(){if(config.cancelSelection){this.onselectstart=function(){return false};return false;}});$this.bind("update",function(){var me=this;setTimeout(function(){me.config.parsers=buildParserCache(me,$headers);cache=buildCache(me);},1);}).bind("updateCell",function(e,cell){var config=this.config;var pos=[(cell.parentNode.rowIndex-1),cell.cellIndex];cache.normalized[pos[0]][pos[1]]=config.parsers[pos[1]].format(getElementText(config,cell),cell);}).bind("sorton",function(e,list){$(this).trigger("sortStart");config.sortList=list;var sortList=config.sortList;updateHeaderSortCount(this,sortList);setHeadersCss(this,$headers,sortList,sortCSS);appendToTable(this,multisort(this,sortList,cache));}).bind("appendCache",function(){appendToTable(this,cache);}).bind("applyWidgetId",function(e,id){getWidgetById(id).format(this);}).bind("applyWidgets",function(){applyWidget(this);});if($.metadata&&($(this).metadata()&&$(this).metadata().sortlist)){config.sortList=$(this).metadata().sortlist;}if(config.sortList.length>0){$this.trigger("sorton",[config.sortList]);}applyWidget(this);});};this.addParser=function(parser){var l=parsers.length,a=true;for(var i=0;i<l;i++){if(parsers[i].id.toLowerCase()==parser.id.toLowerCase()){a=false;}}if(a){parsers.push(parser);};};this.addWidget=function(widget){widgets.push(widget);};this.formatFloat=function(s){var i=parseFloat(s);return(isNaN(i))?0:i;};this.formatInt=function(s){var i=parseInt(s);return(isNaN(i))?0:i;};this.isDigit=function(s,config){return/^[-+]?\d*$/.test($.trim(s.replace(/[,.']/g,'')));};this.clearTableBody=function(table){if($.browser.msie){function empty(){while(this.firstChild)this.removeChild(this.firstChild);}empty.apply(table.tBodies[0]);}else{table.tBodies[0].innerHTML="";}};}});$.fn.extend({tablesorter:$.tablesorter.construct});var ts=$.tablesorter;ts.addParser({id:"text",is:function(s){return true;},format:function(s){return $.trim(s.toLocaleLowerCase());},type:"text"});ts.addParser({id:"digit",is:function(s,table){var c=table.config;return $.tablesorter.isDigit(s,c);},format:function(s){return $.tablesorter.formatFloat(s);},type:"numeric"});ts.addParser({id:"currency",is:function(s){return/^[£$€?.]/.test(s);},format:function(s){return $.tablesorter.formatFloat(s.replace(new RegExp(/[£$€]/g),""));},type:"numeric"});ts.addParser({id:"ipAddress",is:function(s){return/^\d{2,3}[\.]\d{2,3}[\.]\d{2,3}[\.]\d{2,3}$/.test(s);},format:function(s){var a=s.split("."),r="",l=a.length;for(var i=0;i<l;i++){var item=a[i];if(item.length==2){r+="0"+item;}else{r+=item;}}return $.tablesorter.formatFloat(r);},type:"numeric"});ts.addParser({id:"url",is:function(s){return/^(https?|ftp|file):\/\/$/.test(s);},format:function(s){return jQuery.trim(s.replace(new RegExp(/(https?|ftp|file):\/\//),''));},type:"text"});ts.addParser({id:"isoDate",is:function(s){return/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(s);},format:function(s){return $.tablesorter.formatFloat((s!="")?new Date(s.replace(new RegExp(/-/g),"/")).getTime():"0");},type:"numeric"});ts.addParser({id:"percent",is:function(s){return/\%$/.test($.trim(s));},format:function(s){return $.tablesorter.formatFloat(s.replace(new RegExp(/%/g),""));},type:"numeric"});ts.addParser({id:"usLongDate",is:function(s){return s.match(new RegExp(/^[A-Za-z]{3,10}\.? [0-9]{1,2}, ([0-9]{4}|'?[0-9]{2}) (([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(AM|PM)))$/));},format:function(s){return $.tablesorter.formatFloat(new Date(s).getTime());},type:"numeric"});ts.addParser({id:"shortDate",is:function(s){return/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(s);},format:function(s,table){var c=table.config;s=s.replace(/\-/g,"/");if(c.dateFormat=="us"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$1/$2");}else if(c.dateFormat=="uk"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$2/$1");}else if(c.dateFormat=="dd/mm/yy"||c.dateFormat=="dd-mm-yy"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/,"$1/$2/$3");}return $.tablesorter.formatFloat(new Date(s).getTime());},type:"numeric"});ts.addParser({id:"time",is:function(s){return/^(([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(am|pm)))$/.test(s);},format:function(s){return $.tablesorter.formatFloat(new Date("2000/01/01 "+s).getTime());},type:"numeric"});ts.addParser({id:"metadata",is:function(s){return false;},format:function(s,table,cell){var c=table.config,p=(!c.parserMetadataName)?'sortValue':c.parserMetadataName;return $(cell).metadata()[p];},type:"numeric"});ts.addWidget({id:"zebra",format:function(table){if(table.config.debug){var time=new Date();}var $tr,row=-1,odd;$("tr:visible",table.tBodies[0]).each(function(i){$tr=$(this);if(!$tr.hasClass(table.config.cssChildRow))row++;odd=(row%2==0);$tr.removeClass(table.config.widgetZebra.css[odd?0:1]).addClass(table.config.widgetZebra.css[odd?1:0])});if(table.config.debug){$.tablesorter.benchmark("Applying Zebra widget",time);}}});})(jQuery);
/*!
 * jquery.event.drag - v 2.0.0
 * Copyright (c) 2010 Three Dub Media - http://threedubmedia.com
 * Open Source MIT License - http://threedubmedia.com/code/license
 */
;(function(f){f.fn.drag=function(b,a,d){var e=typeof b=="string"?b:"",k=f.isFunction(b)?b:f.isFunction(a)?a:null;if(e.indexOf("drag")!==0)e="drag"+e;d=(b==k?a:d)||{};return k?this.bind(e,d,k):this.trigger(e)};var i=f.event,h=i.special,c=h.drag={defaults:{which:1,distance:0,not:":input",handle:null,relative:false,drop:true,click:false},datakey:"dragdata",livekey:"livedrag",add:function(b){var a=f.data(this,c.datakey),d=b.data||{};a.related+=1;if(!a.live&&b.selector){a.live=true;i.add(this,"draginit."+ c.livekey,c.delegate)}f.each(c.defaults,function(e){if(d[e]!==undefined)a[e]=d[e]})},remove:function(){f.data(this,c.datakey).related-=1},setup:function(){if(!f.data(this,c.datakey)){var b=f.extend({related:0},c.defaults);f.data(this,c.datakey,b);i.add(this,"mousedown",c.init,b);this.attachEvent&&this.attachEvent("ondragstart",c.dontstart)}},teardown:function(){if(!f.data(this,c.datakey).related){f.removeData(this,c.datakey);i.remove(this,"mousedown",c.init);i.remove(this,"draginit",c.delegate);c.textselect(true); this.detachEvent&&this.detachEvent("ondragstart",c.dontstart)}},init:function(b){var a=b.data,d;if(!(a.which>0&&b.which!=a.which))if(!f(b.target).is(a.not))if(!(a.handle&&!f(b.target).closest(a.handle,b.currentTarget).length)){a.propagates=1;a.interactions=[c.interaction(this,a)];a.target=b.target;a.pageX=b.pageX;a.pageY=b.pageY;a.dragging=null;d=c.hijack(b,"draginit",a);if(a.propagates){if((d=c.flatten(d))&&d.length){a.interactions=[];f.each(d,function(){a.interactions.push(c.interaction(this,a))})}a.propagates= a.interactions.length;a.drop!==false&&h.drop&&h.drop.handler(b,a);c.textselect(false);i.add(document,"mousemove mouseup",c.handler,a);return false}}},interaction:function(b,a){return{drag:b,callback:new c.callback,droppable:[],offset:f(b)[a.relative?"position":"offset"]()||{top:0,left:0}}},handler:function(b){var a=b.data;switch(b.type){case !a.dragging&&"mousemove":if(Math.pow(b.pageX-a.pageX,2)+Math.pow(b.pageY-a.pageY,2)<Math.pow(a.distance,2))break;b.target=a.target;c.hijack(b,"dragstart",a); if(a.propagates)a.dragging=true;case "mousemove":if(a.dragging){c.hijack(b,"drag",a);if(a.propagates){a.drop!==false&&h.drop&&h.drop.handler(b,a);break}b.type="mouseup"}case "mouseup":i.remove(document,"mousemove mouseup",c.handler);if(a.dragging){a.drop!==false&&h.drop&&h.drop.handler(b,a);c.hijack(b,"dragend",a)}c.textselect(true);if(a.click===false&&a.dragging){jQuery.event.triggered=true;setTimeout(function(){jQuery.event.triggered=false},20);a.dragging=false}break}},delegate:function(b){var a= [],d,e=f.data(this,"events")||{};f.each(e.live||[],function(k,j){if(j.preType.indexOf("drag")===0)if(d=f(b.target).closest(j.selector,b.currentTarget)[0]){i.add(d,j.origType+"."+c.livekey,j.origHandler,j.data);f.inArray(d,a)<0&&a.push(d)}});if(!a.length)return false;return f(a).bind("dragend."+c.livekey,function(){i.remove(this,"."+c.livekey)})},hijack:function(b,a,d,e,k){if(d){var j={event:b.originalEvent,type:b.type},n=a.indexOf("drop")?"drag":"drop",l,o=e||0,g,m;e=!isNaN(e)?e:d.interactions.length; b.type=a;b.originalEvent=null;d.results=[];do if(g=d.interactions[o])if(!(a!=="dragend"&&g.cancelled)){m=c.properties(b,d,g);g.results=[];f(k||g[n]||d.droppable).each(function(q,p){l=(m.target=p)?i.handle.call(p,b,m):null;if(l===false){if(n=="drag"){g.cancelled=true;d.propagates-=1}if(a=="drop")g[n][q]=null}else if(a=="dropinit")g.droppable.push(c.element(l)||p);if(a=="dragstart")g.proxy=f(c.element(l)||g.drag)[0];g.results.push(l);delete b.result;if(a!=="dropinit")return l});d.results[o]=c.flatten(g.results); if(a=="dropinit")g.droppable=c.flatten(g.droppable);a=="dragstart"&&!g.cancelled&&m.update()}while(++o<e);b.type=j.type;b.originalEvent=j.event;return c.flatten(d.results)}},properties:function(b,a,d){var e=d.callback;e.drag=d.drag;e.proxy=d.proxy||d.drag;e.startX=a.pageX;e.startY=a.pageY;e.deltaX=b.pageX-a.pageX;e.deltaY=b.pageY-a.pageY;e.originalX=d.offset.left;e.originalY=d.offset.top;e.offsetX=b.pageX-(a.pageX-e.originalX);e.offsetY=b.pageY-(a.pageY-e.originalY);e.drop=c.flatten((d.drop||[]).slice()); e.available=c.flatten((d.droppable||[]).slice());return e},element:function(b){if(b&&(b.jquery||b.nodeType==1))return b},flatten:function(b){return f.map(b,function(a){return a&&a.jquery?f.makeArray(a):a&&a.length?c.flatten(a):a})},textselect:function(b){f(document)[b?"unbind":"bind"]("selectstart",c.dontstart).attr("unselectable",b?"off":"on").css("MozUserSelect",b?"":"none")},dontstart:function(){return false},callback:function(){}};c.callback.prototype={update:function(){h.drop&&this.available.length&& f.each(this.available,function(b){h.drop.locate(this,b)})}};h.draginit=h.dragstart=h.dragend=c})(jQuery);
/*globals console sparks $*/

(function (){
    sparks.CouchDS = function (){
        this.saveDocUID = null;
        this.saveDocRevision = null;
        this.user = null;

        this.saveDataPath = "/couchdb/learnerdata";

        this.activityPath = "/couchdb/activities";
    };

    sparks.CouchDS.prototype =
    {

        loadActivity: function(id, callback) {
          $.couch.urlPrefix = this.activityPath;
          $.couch.db('').openDoc(id,
            {
              success: function (response) {
                console.log("Loaded "+response._id);
                callback(response);
              }
            }
          );
        },

        setUser: function(_user) {
          this.user = _user;
        },

        save: function (_data) {
          if (!this.user){
            return;
          }

          $.couch.urlPrefix = this.saveDataPath;

          _data.user = this.user;
          _data.runnable_id = this.runnableId;
          _data.save_time = new Date().valueOf();

          if (!!this.saveDocUID){
            console.log("saving with known id "+this.saveDocUID);
            _data._id = this.saveDocUID;
          }
          if (!!this.saveDocRevision){
            _data._rev = this.saveDocRevision;
          }

          var self = this;
          $.couch.db('').saveDoc(
            _data,
            { success: function(response) {
              console.log("Saved ok, id = "+response.id);
              self.saveDocUID = response.id;
              self.saveDocRevision = response.rev;
             }}
          );

        },

        saveRawData: function(_data) {
          $.couch.urlPrefix = this.saveDataPath;
          $.couch.db(this.db).saveDoc(
            _data,
            { success: function(response) {
              console.log("Saved ok, id = "+response.id);
             }}
          );
        },

        loadStudentData: function (activity, studentName, success, failure) {
          $.couch.urlPrefix = this.saveDataPath;
          if (!studentName){
            studentName = this.user.name;
          }
          var self = this;
          $.couch.db('').view(
            "session_scores/Scores%20per%20activity",
            {
              key:[studentName, activity],
              success: function(response) {
                console.log("success loading");
                console.log(response);
                if (response.rows.length > 0){
                  sparks.couchDS.saveDocUID = response.rows[response.rows.length-1].value._id;
                  sparks.couchDS.saveDocRevision = response.rows[response.rows.length-1].value._rev;
                  console.log("setting id to "+sparks.couchDS.saveDocUID);
                  success(response);
                } else {
                  failure();
                }
            }}
          );
        },

        loadClassData: function (activity, classId, success, failure) {
          $.couch.urlPrefix = this.saveDataPath;
          $.couch.db('').view(
            "class_scores/Scores%20per%20class",
            {
              key:[classId, activity],
              success: function(response) {
                if (response.rows.length > 0){
                  success(response);
                } else {
                  failure();
                }
            }}
          );
        },

        loadClassDataWithLearnerIds: function (activity, studentIds, success, failure) {
          var keys = []
          for (var i=0, ii=studentIds.length; i<ii; i++){
            keys.push([""+studentIds[i], activity]);
          }
          $.couch.urlPrefix = this.saveDataPath;
          $.couch.db('').view(
            "session_scores/Scores%20per%20student_id",
            {
              keys:keys,
              success: function(response) {
                if (response.rows.length > 0){
                  success(response);
                } else {
                  failure();
                }
            }}
          );
        }
    };

    sparks.couchDS = new sparks.CouchDS();
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

sparks.util.todaysDate = function() {
  var monthNames = ["January","February","March","April","May","June","July",
                    "August","September","October","November","December"];

  var now = new Date();
  return monthNames[now.getMonth()] + " " +  now.getDate() + ", " + now.getFullYear();
}

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
  var i = array.length;
    while (i--) {
       if (array[i] === obj) {
           return i;
       }
    }
    return -1;
};

sparks.util.getKeys = function (json) {
  var keys = [];
  $.each(json, function(key){
    keys.push(key);
  })
  return keys;
};

sparks.util.getClosestIndex = function(array, actual, isComplex) {
  var minDiff = Infinity,
      index;
  for (var i = 0, ii = array.length; i < ii; i++){
    var diff = isComplex ? Math.abs(array[i].real - actual) : Math.abs(array[i] - actual);
    if (diff < minDiff){
      minDiff = diff;
      index = i;
    }
  }
  return index;
};


sparks.data;

sparks.getDataArray = function(){
  sparks.data = [];
  $.couch.urlPrefix = "/couchdb/learnerdata";
  $.couch.db('').view(
    "session_scores/Scores%20per%20activity",
    {
      success: function(response) {
        $.each(response.rows, function(i, obj) {
              sparks.data.push(obj);
          }
        );
      }
    }
  );

};

sparks.createPointsCSV = function(data) {
  var csv = "";
  csv += "Activity|Student|Level|Page|Try|Score\n"
  $.each(sparks.data, function(i, obj){
    var sections = obj.value.sectionReports;
    $.each(sections, function(j, sec){
      $.each(sec.pageReports, function(k, page){
        $.each(page.sessionReports, function(l, sess){
          csv += obj.key[1] + "|";
          csv += obj.key[0] + "|";
          csv += (j+1) + ": " + sec.sectionTitle + "|";
          csv += (k+1) + "|";
          csv += (l+1) + "|";
          csv += sess.score + "\n";
        });
      });
    });
  });
  return csv;
};

sparks.createQuestionsCSV = function(data) {
  var csv = "";
  csv += "Activity|Student|Level|Page|Try|Question|Answer|Correct Answer|Feedback|Score\n"
  $.each(sparks.data, function(i, obj){
    var sections = obj.value.sectionReports;
    $.each(sections, function(j, sec){
      $.each(sec.pageReports, function(k, page){
        $.each(page.sessionReports, function(l, sess){
          $.each(sess.questions, function(m, ques){
            csv += obj.key[1] + "|";
            csv += obj.key[0] + "|";
            csv += (j+1) + ": " + sec.sectionTitle + "|";
            csv += (k+1) + "|";
            csv += (l+1) + "|";
            csv += (m+1) + ": " + ques.shortPrompt + "|";
            csv += ques.answer + "|";
            csv += ques.correct_answer + "|";
            csv += ques.feedback + "|";
            csv += ques.points_earned + "\n";
          });
        });
      });
    });
  });
  return csv;
};
/* FILE unit.js */

(function () {

    this.sparks.unit = {};

    var u = sparks.unit;

    u.labels = { ohms : '\u2126', kilo_ohms : 'k\u2126', mega_ohms : 'M\u2126' };

    u.toEngineering = function (value, units){
      value = Number(value);
      var isShort = (units.length === 1 || units === "Hz"),
          prefix  = "";

      if (value >= 1000000){
        prefix = isShort ? "M" : "mega";
        value = u.round(value/1000000,2);
      } else if (value >= 1000){
        prefix = isShort ? "k" : "kilo";
        value = u.round(value/1000,2);
      } else if (value === 0 ) {
        value = 0;
      } else if (value < 0.000001){
        prefix = isShort ? "n" : "nano";
        value = u.round(value * 1000000000,2);
      } else if (value < 0.001){
        prefix = isShort ? "μ" : "micro";
        value = u.round(value * 1000000,2);
      } else if (value < 1) {
        prefix = isShort ? "m" : "milli";
        value = u.round(value * 1000,2);
      } else {
        value = u.round(value,2);
      }
      units = prefix + units;

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

    u.unitEquivalents = {
      "V": ["v", "volts", "volt", "vol", "vs"],
      "A": ["a", "amps", "amp", "amper", "ampers", "as"],
      "Ohms": ["ohms", "oms", "o", "Ω", "os"],
      "deg": ["deg", "degs", "degree", "degrees", "º"],
      "F": ["f", "farads", "farad", "fared", "fareds", "fered", "fereds", "feret", "ferets", "ferret", "ferrets", "fs"],
      "H": ["h", "henries", "henry", "henrys", "hs"],
      "Hz": ["hz", "herz", "hertz"],
      "%": ["%", "perc", "percent"]
    }

    u.prefixEquivalents = {
      "femto": ["femto", "fempto", "f"],
      "pico": ["pico", "picco", "p"],
      "nano": ["nano", "nanno", "n"],
      "micro": ["micro", "micron", "μ"],
      "milli": ["mili", "milli", "millli"],
      "kilo": ["kilo", "killo", "killlo", "k"],
      "mega": ["mega", "meg"],
      "giga": ["giga", "gigga", "g"]
    };

    u.prefixValues = {
      "femto": 1E-15,
      "pico": 1E-12,
      "nano": 1E-9,
      "micro": 1E-6,
      "milli": 1E-3,
      "kilo": 1E3,
      "mega": 1E6,
      "giga": 1E9
    };

    u.parse = function(string) {
      var value, units, prefix, currPrefix, unit, equivalents, equiv, regex;

      string = string.replace(/ /g, '');                    // rm all whitespace
      string = string.replace(/['";:,\/?\\]/g, '');         // rm all non-period, non-dash puncutation
      string = string.replace(/[^\d\.-]*(\d.*)/, '$1');      // if there are numbers, if there are letters before them remove them
      value =  string.match(/^-?[\d\.]+/);                  // find all numbers before the first letter, parse them to a number, store it
      if (value) {
        value = parseFloat(value[0]);
      }
      string = string.replace(/^-?[\d\.]*/, '');             // everything after the first value is the units
      string = string.replace(/['";:,\.\/?\\-]/g, '');       // rm all puncutation

      for (unit in this.unitEquivalents) {                // if the unit can be found in the equivalents table, replace
        equivalents = this.unitEquivalents[unit];
        if (equivalents.length > 0) {
          for (var i = 0, ii = equivalents.length; i<ii; i++) {
            equiv = equivalents[i];
            regex = new RegExp('.*('+equiv+')$', 'i');
            hasUnits =string.match(regex)
            if (hasUnits && hasUnits.length > 1){
              units = unit;
              string = string.replace(hasUnits[1], '');
              break;
            }
          }
        }
        if (units) {
          break;
        }
      }

      if (!units) {
        units = string;
      }

      for (currPrefix in this.prefixEquivalents) {                 // if we can find a prefix at the start of the string, store it and delete it
        equivalents = this.prefixEquivalents[currPrefix];
        if (equivalents.length > 0) {
          for (var i = 0, ii = equivalents.length; i<ii; i++) {
            equiv = equivalents[i];
            regex = new RegExp('^('+equiv+').*', 'i');
            prefixes = string.match(regex);
            if (prefixes && prefixes.length > 1){
              prefix = currPrefix;
              units = units.replace(prefixes[1], '');
              break;
            }
          }
        }
        if (prefix) {
          break;
        }
      }

      if (!prefix) {                                      // if we haven't found a prefix yet, check for case-sensitive m or M at start
        if (string.match(/^m/)) {
          prefix = "milli";
          units = units.replace(/^m/, "");
        } else if (string.match(/^M/)){
          prefix = "mega";
          units = units.replace(/^M/, "");
        }
      }

      if (prefix) {
        value = value * this.prefixValues[prefix];        // if we have a prefix, multiply by that;
      }

      if (!value) {
        value = NaN;
      }

      return {val: value, units: units}
    };


})();
/*globals console sparks $ breadModel getBreadBoard */

(function() {
  sparks.Activity = function(){
    sparks.activity = this;

    this.sections = [];
    this.view = null;
  };

  sparks.Activity.prototype = {

    toJSON: function () {
      var json = {};
      json.sections = [];
      $.each(this.sections, function(i, section){
        json.sections.push(section.toJSON());
      });
      return json;
    }

  };

})();
/*globals console sparks $ breadModel getBreadBoard */

(function() {
  sparks.Section = function(){

    this.title = "";
    this.id = null;

    this.image = null;
    this.circuit = null;
    this.meter = new sparks.Meter();
    this.pages = [];
    this.variables = {};

    this.hide_circuit = false;
    this.show_multimeter = false;
    this.show_oscilloscope = false;
    this.allow_move_yellow_probe = false;

    this.section_url = "";
    this.images_url = "";

    this.visited = false;

    this.nextSection = null;

    this.view = null;
  };

  sparks.Section.prototype = {

    meter: null,

    toJSON: function () {
      var json = {};
      json.pages = [];
      $.each(this.pages, function(i, page){
        json.pages.push(page.toJSON());
      });
      return json;
    },

    toString: function () {
      return "Section "+this.getIndex();
    },

    getIndex: function() {
      var self = this;
      var index = -1;
      $.each(sparks.activity.sections, function(i, section){
        if (section === self){
          index = i;
        }
      });
      return index;
    }

  };

  sparks.Meter = function() {};

  sparks.Meter.prototype = {
    dmm: null,
    oscope: null,

    setProbeLocation: function (probe, loc) {
      if (this.oscope) {
        this.oscope.setProbeLocation(probe, loc);
      }
      if (this.dmm) {
        this.dmm.setProbeLocation(probe, loc);
      }
    },

    update: function () {
      if (this.oscope) {
        this.oscope.update();
      }
      if (this.dmm) {
        this.dmm.update();
      }
    },

    reset: function() {
      if (this.oscope && this.oscope.reset) {
        this.oscope.reset();
      }
      if (this.dmm && this.dmm.reset) {
        this.dmm.reset();
      }
    }
  };

})();
/*globals console sparks $ breadModel getBreadBoard */

(function() {

  sparks.Page = function(id){
    this.id = id;
    this.questions = [];
    this.notes = null;
    this.time = {};
    this.view = null;
    this.currentQuestion = null;
  };

  sparks.Page.prototype = {

    toJSON: function () {
      var json = {};
      json.questions = [];
      $.each(this.questions, function(i, question){
        json.questions.push(question.toJSON());
      });
      return json;
    },

    toString: function () {
      return "Page "+this.id;
    }
  };

})();
/*globals console sparks $ breadModel getBreadBoard */

(function() {
  sparks.Question = function(){
    this.id = 0;
    this.shownId = 0;

    this.prompt = '';
    this.shortPrompt = '';
    this.correct_answer = null;
    this.answer = '';
    this.correct_units = null;
    this.units = '';
    this.start_time = null;
    this.end_time = null;

    this.options = null;
    this.radio = false;
    this.checkbox = false;

    this.answerIsCorrect = false;
    this.unitsIsCorrect = false;
    this.points = 0;
    this.points_earned = -1;
    this.feedback = null;
    this.tutorial = null;
    this.top_tutorial = null;

    this.scoring = null;

    this.isSubQuestion = false;
    this.subquestionId = -1;
    this.commonPrompt = '';

    this.keepOrder = false;

    this.category = {categoryTitle: "", tutorial: ""};

    this.not_scored = false;

    this.beforeScript = null;

    this.meta = null;       // storage for extra info, like circuit state

    this.view = null;
  };

  sparks.Question.prototype = {
    toJSON: function() {
      var json = {};
      json.id = this.id;
      json.shortPrompt = this.shortPrompt;
      json.correct_answer = this.correct_answer;
      json.answer = this.answer;
      json.options = this.options;
      json.answerIsCorrect = this.answerIsCorrect;
      json.points = this.points;
      json.points_earned = this.points_earned;
      json.feedback = this.feedback;
      json.tutorial = this.tutorial;
      json.category = this.category;
      json.not_scored = this.not_scored;
      return json;
    }
  };

})();
/*globals console sparks $ breadModel getBreadBoard */

/**
 * report:
 * {
 *   pageReports: {
 *         pageX:
 *           {
 *             sessionReports: [
 *                       {
 *                         questions: [],
 *                         log: {},
 *                         score: x,
 *                         maxScore: y
 *                       },
 *              highestScore: x,  ?
 *              maxScore: y       ?
 */
(function() {
  sparks.Log = function(startTime){
    this.events = [];
    this.startTime = startTime;
    this.endTime = -1;
  };

  sparks.LogEvent = function(name, value, time){
    this.name = name;
    this.value = value;
    this.time = time;
  };

  sparks.LogEvent.CLICKED_TUTORIAL = "Clicked tutorial";
  sparks.LogEvent.CHANGED_TUTORIAL = "Changed tutorial";
  sparks.LogEvent.BLEW_FUSE = "Blew fuse";
  sparks.LogEvent.DMM_MEASUREMENT = "DMM measurement";
  sparks.LogEvent.CHANGED_CIRCUIT = "Changed circuit";
  sparks.LogEvent.OSCOPE_MEASUREMENT = "OScope measurement";
  sparks.LogEvent.OSCOPE_V1_SCALE_CHANGED = "OScope V1 scale changed";
  sparks.LogEvent.OSCOPE_V2_SCALE_CHANGED = "OScope V2 scale changed";
  sparks.LogEvent.OSCOPE_T_SCALE_CHANGED = "OScope T scale changed";

  sparks.Log.prototype = {

    measurements: function () {
      return sparks.logController.numEvents(this, sparks.LogEvent.DMM_MEASUREMENT);
    },

    uniqueVMeasurements: function () {
      return sparks.logController.numUniqueMeasurements(this, "voltage");
    },

    uniqueIMeasurements: function () {
      return sparks.logController.numUniqueMeasurements(this, "current");
    },

    uniqueRMeasurements: function () {
      return sparks.logController.numUniqueMeasurements(this, "resistance");
    },

    connectionBreaks: function() {
      return sparks.logController.numConnectionChanges(this, "disconnect lead");
    },

    connectionMakes: function() {
      return sparks.logController.numConnectionChanges(this, "connect lead");
    },

    blownFuses: function () {
      return sparks.logController.numEvents(this, sparks.LogEvent.BLEW_FUSE);
    }
  };

})();
/*globals console sparks $ breadModel getBreadBoard */

/**
 * report:
 * {
 *   pageReports: {
 *         pageX:
 *           {
 *             sessionReports: [
 *                       {
 *                         questions: [],
 *                         log: {},
 *                         score: x,
 *                         maxScore: y
 *                       },
 *              highestScore: x,  ?
 *              maxScore: y       ?
 */
(function() {
  sparks.Report = function(){
    this.reportVersion = 1.0;
    this.sectionReports = {};
    this.score = 0;
    this.view = null;
    this.activity = null;
  };

  sparks.SectionReport = function(){
    this.pageReports = {};
    this.view = null;
    this.sectionId = null;
    this.sectionTitle = null;
  };

  sparks.PageReport = function(){
    this.sessionReports = [];
  };

  sparks.SessionReport = function(){
    this.questions = [];
    this.log = null;
    this.timeTaken = -1;
    this.timeScore = -1;
    this.maxTimeScore = -1;
    this.bestTime = -1;
    this.score = -1;
    this.maxScore = -1;
  };

  sparks.Report.prototype = {

    toJSON: function () {
      var json = {};
      json.activity = sparks.activity.id;
      json.sectionReports = [];
      $.each(this.sectionReports, function(i, sectionReport){
        json.sectionReports.push(sectionReport.toJSON());
      });
      json.score = this.score;
      json.reportVersion = this.reportVersion;
      return json;
    }

  };

  sparks.SectionReport.prototype = {

    toJSON: function () {
      var json = {};
      json.sectionId = this.sectionId;
      json.sectionTitle = this.sectionTitle;
      json.pageReports = [];
      $.each(this.pageReports, function(i, pageReport){
        json.pageReports.push(pageReport.toJSON());
      });
      return json;
    }

  };

  sparks.PageReport.prototype = {

    toJSON: function () {
      var json = {};
      json.sessionReports = [];
      $.each(this.sessionReports, function(i, sessionReport){
        json.sessionReports.push(sessionReport);
      });
      return json;
    }

  };

})();
/*globals console sparks $ breadModel getBreadBoard */

(function() {

  sparks.ActivityView = function(activity){
    this.activity = activity;
    this.flashQueue = [];

    this.divs = {
      $breadboardDiv:   $('#breadboard'),
      $imageDiv:        $('#image'),
      $questionsDiv:    $('#questions_area'),
      $titleDiv:        $('#title'),
      $scopeDiv:        $('#oscope_mini'),
      $fgDiv:           $('#fg_mini')
    };
  };

  sparks.ActivityView.prototype = {

    layoutCurrentSection: function() {
      var section = sparks.activityController.currentSection;
      var self = this;

      $('#loading').hide();

      this.divs.$titleDiv.text(section.title);

      this.divs.$imageDiv.html('');

      if (!!section.image){
        var $image = sparks.activityController.currentSection.view.getImageView();
        this.divs.$imageDiv.append($image);
      }

      if (!!section.circuit && !section.hide_circuit){
        if (sparks.flash.loaded){
          sparks.flash.loaded = false;
          this.divs.$breadboardDiv.html('');
        }
        this.loadFlash();
        breadModel('updateFlash');

        var source = getBreadBoard().components.source;
        if (source.frequency) {
          var fgView = new sparks.FunctionGeneratorView(source);
          var $fg = fgView.getView();
          this.divs.$fgDiv.append($fg);
          this.doOnFlashLoad(function(){
            self.divs.$fgDiv.show();
          });
        }

        this.showDMM(section.show_multimeter);
        this.showOScope(section.show_oscilloscope);
        this.allowMoveYellowProbe(section.allow_move_yellow_probe);

        section.meter.reset();
      }

      this.layoutPage();
    },

    layoutPage: function() {
      this.hidePopups();
      if (!!sparks.sectionController.currentPage){
        this.divs.$questionsDiv.html('');
        var $page = sparks.sectionController.currentPage.view.getView();
        this.divs.$questionsDiv.append($page);
      }
      $('body').scrollTop(0);
    },

    loadFlash: function () {
       this.divs.$breadboardDiv.show().css("z-index", 0);
       this.divs.$breadboardDiv.flash({
           src: 'activities/module-2/breadboardActivity1.swf',
           id: 'breadboardActivity1',
           name: 'breadboardActivity1',
           width: 800,
           height: 500,
           quality: 'high',
           allowFullScreen: false,
           allowScriptAccess: 'sameDomain',
           wmode: 'transparent'
       });
     },

     setFlashLoaded: function(flashLoaded) {
       this.flashLoaded = flashLoaded;
       if (flashLoaded){
         for (var i = 0, ii = this.flashQueue.length; i < ii; i++) {
           this.flashQueue[i]();
         }
         this.flashQueue = [];
       }
     },

     doOnFlashLoad: function(func) {
       if (this.flashLoaded) {
         func();
       } else {
         this.flashQueue.push(func);
       }
     },

     showOScope: function(visible) {
       this.divs.$scopeDiv.html('');

       if (visible) {
         var scopeView = new sparks.OscilloscopeView();
         var $scope = scopeView.getView();
         this.divs.$scopeDiv.append($scope);
         var self = this;
         this.doOnFlashLoad(function(){
           self.divs.$scopeDiv.show();
         });
         sparks.activityController.currentSection.meter.oscope.setView(scopeView);
       }

       sparks.flash.sendCommand('set_oscope_probe_visibility',visible.toString());

       if (visible) {
         this.doOnFlashLoad(function() {setTimeout(function() {sparks.flash.sendCommand('connect_probe', "yellow");},1000)});
       }
     },

     showDMM: function(visible) {
       sparks.flash.sendCommand('set_multimeter_visibility',visible.toString());
       sparks.flash.sendCommand('set_probe_visibility',visible.toString());
     },

     allowMoveYellowProbe: function(allow) {
       sparks.flash.sendCommand('enable_probe_dragging', "yellow", allow);
     },

     hidePopups: function() {
       $('.ui-dialog').remove();
     },

     setEmbeddingTargets: function(targets) {
       if (!!targets.$breadboardDiv){
         this.divs.$breadboardDiv = targets.$breadboardDiv;
       }
       if (!!targets.$imageDiv){
         this.divs.$imageDiv = targets.$imageDiv;
       }
       if (!!targets.$questionsDiv){
         this.divs.$questionsDiv = targets.$questionsDiv;
       }
     }
  };
})();
/*globals console sparks $ breadModel getBreadBoard */

(function() {

  sparks.SectionView = function(section){
    this.section = section;
  };

  sparks.SectionView.prototype = {

    clear: function() {
      $('#breadboard').html('');
      $('#image').html('');
      sparks.sectionController.currentPage.view.clear();
    },

    getImageView: function() {
      var $imagediv = $("<div>").addClass("question-image");
      $imagediv.append(
        $("<img>").attr('src', this.getImgSrc(this.section.image))
      );
      return $imagediv;
    },

    getImgSrc: function(fileName) {
      if (fileName.indexOf("http") > -1){
        return fileName;
      } else if (!!this.section.images_url) {
        return this.section.images_url + "/" + fileName;
      }
      console.log(fileName + " appears to be a relative filename, but there is no base activity url.");
      return "";
    }

  };
})();
/*globals console sparks $ breadModel getBreadBoard */

(function() {

  sparks.PageView = function(page){
    this.page = page;

    this.$view = null;
    this.$questionDiv = null;
    this.$notesDiv = null;
    this.$reportsDiv = null;

    this.questionViews = {};
  };

  sparks.PageView.prototype = {

    getView: function() {
      var page = this.page;

      var self = this;

      this.$view = $('<div>').addClass('page');

      this.$questionDiv = $('<div>').addClass('inner-questions').css('float', 'left').css('padding', '10px');
      this.$view.append(this.$questionDiv);

      if (!!page.notes){
        this.$notesDiv = $('<span>').addClass('notes').css('float','right');
        this.$notesDiv.html(page.notes);
        this.$questionDiv.append(this.$notesDiv);
      }


      $.each(page.questions, function(i, question){

        question.answer = '';
        var $question = question.view.getView();
        var $form;

        if (!question.isSubQuestion){
          $form = $("<form>");
          $form.addClass("question_form");

          $form.append($question);

          $question.append($("<button>").addClass("submit").text("Submit").css('margin-left', '30px'));

          self.$questionDiv.append($form);
        } else {
          var $subForms = self.$questionDiv.find('.sub'+question.subquestionId);
          if ($subForms.length > 0){
            $form = $($subForms[0]);
          } else {
            $form = $("<form>");
            $form.addClass("question_form");
            $form.addClass("sub"+question.subquestionId);

            $form.append($("<span>").addClass("prompt").html((question.shownId+1) + ".  " + question.commonPrompt));

            $form.append($("<div>").addClass("subquestions"));

            $form.append($("<button>").addClass("submit").text("Submit").css('align', 'right'));

            self.$questionDiv.append($form);
          }

          $form.find('.subquestions').append($question);
        }

        $form.find('.submit').unbind('click');          // remove any previously-added listeners
        $form.find('.submit').click(function (event) {
          event.preventDefault();
          self.submitButtonClicked(question);
        });

        self.questionViews[question.id] = $form;
      });

      this.enableQuestion(page.currentQuestion);

      return this.$view;
    },

    clear: function() {
      if (!!this.$questionDiv) {this.$questionDiv.html('');}
      if (!!this.$notesDiv) {this.$notesDiv.html('');}
      if (!!this.$reportsDiv) {this.$reportsDiv.html('');}
      if (!!this.$view) {this.$view.html('');}
    },

    enableQuestion: function (question) {
      var self = this;
      $.each(self.questionViews, function(questionKey, view){
        self.enableView(view, false);
      });
      self.enableView(self.questionViews[question.id], true);

      if (!!question.beforeScript) {
        sparks.questionController.runQuestionScript(question.beforeScript, question);
      }
    },

    enableView: function($view, enable) {
      $view.find('input, select, button').attr('disabled', !enable);
      $view.css("background-color", enable ? "rgb(253,255,184)" : "");
      if (enable){
        $view.find('button').removeClass('disabled');
      } else {
        $view.find('button').addClass('disabled');
      }
    },

    showReport: function($report, finalReport){

      if (finalReport){
          sparks.activity.view.hidePopups();
          $('body').scrollTop(0);
      }

      this.$questionDiv.hide();
      if (!!this.$notesDiv) {this.$notesDiv.hide();}

      $('.report').html('');
      if (!!finalReport){
        sparks.flash.loaded = false;
        sparks.activity.view.setFlashLoaded(false);
        $('#image').html('');
        $('#breadboard_wrapper').children().html('').hide();
      }
      this.$reportDiv = $('<div>').addClass('report').css('float', 'left').css('padding-top', '15px').css('padding-left', '40px');
      this.$reportDiv.append($report);

      this.$view.append(this.$reportDiv);

      if (sparks.reportController.getTotalScoreForPage(sparks.sectionController.currentPage) < 0) {
        this.$reportDiv.append($("<div>").html("Thank you. Now you can return to the portal to continue.").css('width', 700).css('padding-top', "20px"));
        return;
      }

      var allCorrect = true;
      var notCorrectTables = $report.find('.notAllCorrect');
      if (notCorrectTables.length > 0 || $report.hasClass('notAllCorrect')){
        allCorrect = false;
      }

      var areMorePage = !!sparks.sectionController.areMorePage();

      var comment;
      if (!finalReport){
      comment = allCorrect ? "You got all the questions correct! "+(!finalReport ? (areMorePage ? "Move on to the next page." : "You can now view the Activity Summary.") : "") :
                              "You can get a higher score on these questions. " +
                              (!finalReport ? "You can repeat the page by clicking the <b>Repeat</b> button" +
                              (areMorePage ? ", or move on to the next page." : ", or click the Summary button to see your total score.") :
                              "You can repeat any page by clicking the <b>Try again</b> button under the table.");
      } else {
        comment = "You can repeat your last level by clicking the <b>Try again</b> button above.";
        if (sparks.activityController.areMoreSections()){
          comment += "<p></p>When you are ready to score more points, move on to the next section!";
        }
      }
      this.$reportDiv.append($("<div>").html(comment).css('width', 700).css('padding-top', "20px"));

      var $buttonDiv = $("<div>").css("padding", "20px").css("text-align", "center");

      if (!finalReport){
        var $repeatButton = $("<button>").text("Repeat").css('padding-left', "10px")
                            .css('padding-right', "10px").css('margin-right', "10px");
        var $nextPageButton = $("<button>").text("Next Page »").css('padding-left', "10px")
                            .css('padding-right', "10px").css('margin-left', "10px");
        var $viewSectionReportButton = $("<button>").text("View your activity summary").css('padding-left', "10px")
                            .css('padding-right', "10px").css('margin-left', "10px");

        $repeatButton.click(function(evt){
          sparks.sectionController.repeatPage();
        });

        $nextPageButton.click(function(evt){
          sparks.sectionController.nextPage();
        });

        $viewSectionReportButton.click(function(evt){
          sparks.sectionController.viewSectionReport();
        });

        if (!!sparks.sectionController.areMorePage()){
          $buttonDiv.append($repeatButton, $nextPageButton);
        } else {
          $buttonDiv.append($repeatButton, $viewSectionReportButton);
        }
      } else if (sparks.activityController.areMoreSections()){
        var $nextActivityButton = $("<button>").text("Go on to the next level").css('padding-left', "10px")
                            .css('padding-right', "10px");

        $nextActivityButton.click(function(evt){
          sparks.activityController.nextSection();
        });

        $buttonDiv.append($nextActivityButton);
      }

      this.$reportDiv.append($buttonDiv);
    },

    submitButtonClicked: function (question) {
      var board = getBreadBoard();

      if (!question.meta) {
        question.meta = {};
        if (board && board.components.source && typeof board.components.source.frequency !== 'undefined') {
          question.meta.amplitude = board.components.source.getAmplitude();
          question.meta.frequency = board.components.source.getFrequency();
        }

        var section = sparks.activityController.currentSection;
        if (section.meter.dmm && section.meter.dmm.dialPosition) {
          question.meta.dmmDial = section.meter.dmm.dialPosition;
          question.meta.blackProbe = section.meter.dmm.blackProbeConnection ? board.getHole(section.meter.dmm.blackProbeConnection).nodeName() : null;
          question.meta.redProbe = section.meter.dmm.redProbeConnection ? board.getHole(section.meter.dmm.redProbeConnection).nodeName() : null;
        }
        if (section.meter.oscope) {
          question.meta.oscopeScaleQuality = section.meter.oscope.getGoodnessOfScale();
          question.meta.pinkProbe = section.meter.oscope.probeLocation[0] ? board.getHole(section.meter.oscope.probeLocation[0]).nodeName() : null;
          question.meta.yellowProbe = section.meter.oscope.probeLocation[1] ? board.getHole(section.meter.oscope.probeLocation[1]).nodeName() : null;
        }
      }

      if (question.isSubQuestion) {
        var questions = sparks.pageController.getSisterSubquestionsOf(sparks.sectionController.currentPage, question);
        $.each(questions, function(i, subquestion){
          if (!subquestion.meta) {
            subquestion.meta = question.meta;
          }
        });
      }

      sparks.pageController.completedQuestion(this.page);
    }

  };
})();
/*globals console sparks $ breadModel getBreadBoard */

(function() {

  sparks.QuestionView = function(question){
    this.question = question;
    this.$view = null;
  };

  sparks.QuestionView.prototype = {

    getView: function() {
      var question = this.question;

      var $question = $("<div>").addClass("question");

      if (!!question.image){
        var $div = $("<div>").addClass("question-image");
        $div.append(
          $("<img>").attr('src', this._getImgSrc(question.image))
        );
        $question.append($div);
      }

      var prompt = question.isSubQuestion ? question.prompt : (question.shownId+1) + ".  " + question.prompt;

      $question.append(
        $("<span>").addClass("prompt").html(prompt), "   "
      );

      var self = this;

      if (!question.options) {

        if (question.show_read_multimeter_button) {
          var $readMultimeterButton = $('<button>Read Multimeter &rarr;</button>'),
              $multimeterReading = $('<div class="passive-input">&nbsp;</div>'),
              $input;

          delete question.answer;

          $readMultimeterButton.click( function(e) {
            var board = getBreadBoard(),
                section = sparks.activityController.currentSection,
                reading,
                amplitude,
                frequency;

            e.preventDefault();

            section.meter.dmm.update();
            value = section.meter.dmm.currentValue;
            units = section.meter.dmm.currentUnits;
            reading = value + " " +  units;

            $multimeterReading.text(reading);

            var parsedAnswer = sparks.unit.parse(reading);
            question.meta = question.meta || {};
            question.meta.val = parsedAnswer.val;
            question.meta.units = parsedAnswer.units;

            question.answer = parsedAnswer.val;

            question.meta.dmmDial = section.meter.dmm.dialPosition;
            question.meta.blackProbe = board.getHole(section.meter.dmm.blackProbeConnection).nodeName();
            question.meta.redProbe = board.getHole(section.meter.dmm.redProbeConnection).nodeName();

            if (board.components.source && typeof board.components.source.frequency !== 'undefined') {
              question.meta.frequency = board.components.source.getFrequency();
              question.meta.amplitude = board.components.source.getAmplitude();
            }
          });
          $input = $('<div style="display: inline-block">').append($readMultimeterButton).append($multimeterReading);
        }
        else {
          $input = $("<input>").attr("id",question.id+"_input");
          $input.keyup(function(args){
            self.valueChanged(args);
          });
          $input.blur(function(args){
            self.valueChanged(args);
          });
        }

        $question.append($input);

      } else {

        if (!question.keepOrder){
          question.options = sparks.util.shuffle(question.options);
        }

        if (!!question.checkbox || !!question.radio){
          $.each(question.options, function(i,answer_option){
            if (!answer_option.option){
            } else {
              answer_option = answer_option.option;
            }

            var type = question.checkbox ? "checkbox" : "radio";

            var groupName = type + "Group" + question.id;

            $question.append($("<br>"));
            var $input = $("<input>").attr("type", type).attr("name", groupName).attr("value", answer_option);
            $question.append($input);
            $question.append("<span> " + answer_option + "</span>");

            $input.blur(function(args){
              self.valueChanged(args);
            });
            $input.change(function(args){
              self.valueChanged(args);
            });
          });
          $question.append('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
        } else {
          var $select = $("<select>").attr("id",question.id+"_options");

          $select.append($("<option>").attr("value", "").html("").attr("defaultSelected",true));

          $.each(question.options, function(i,answer_option){
            if (!answer_option.option){
              answer_option = sparks.mathParser.calculateMeasurement(answer_option);
            } else {
              answer_option = sparks.mathParser.calculateMeasurement(answer_option.option);
            }
            $select.append($("<option>").attr("value", answer_option).html(answer_option).attr("defaultSelected",false));
          });
          $question.append($select, "   ");
          $select.blur(function(args){
            self.valueChanged(args);
          });
        }
      }

      if (!!question.correct_units){
         var $unitsSelect = $("<select>").attr("id", question.id+"_units");
         var options = ["Units...","&#x00b5;V","mV","V","&#x2126;","k&#x2126;","M&#x2126;","&#x00b5;A","mA","A"];
         $.each(options, function(i, val){
           $unitsSelect.append($("<option>").html(val).attr("defaultSelected", i===0));
         });
         $question.append($unitsSelect, "   ");
      }

      return $question;
    },

    _getImgSrc: function(fileName) {
      if (fileName.indexOf("http") > -1){
        return fileName;
      } else if (!!sparks.jsonSection.images_url) {
        return sparks.jsonSection.images_url + "/" + fileName;
      }
      console.log(fileName + " appears to be a relative filename, but there is no base activity url.");
      return "";
    },

    valueChanged: function(args) {
      var value = $(args.target).val();
      this.question.answer = value;
    }

  };

})();
/*globals console sparks $ breadModel getBreadBoard */

(function() {

  sparks.ReportView = function(){
  };

  sparks.ReportView.prototype = {

    getSessionReportView: function(sessionReport){
      var $div = $('<div>');
      $div.append(this._createReportTableForSession(sessionReport));

      var page = sparks.sectionController.currentPage;
      var totalScore = sparks.reportController.getTotalScoreForPage(page);
      if (totalScore > -1){
        $div.append($('<h2>').html("Your total score for this page so far: "+totalScore));
      }
      return $div;
    },

    getActivityReportView: function() {
      var $div = $('<div>');
      $div.append('<h1>Activity results</h1>');

      var totalScore = 0;
      var self = this;
      var currentSection = sparks.activityController.currentSection;

      var $table = $("<table>").addClass('finalReport');

      $table.append(
        $('<tr>').append(
          $('<th>'),
          $('<th>').text("Level"),
          $('<th>').text("Points"),
          $('<th>')
        )
      );

      var passedCurrentSection = false;
      var isNextSection = false;
      var nextSectionDidPass = false;

      $.each(sparks.activity.sections, function(i, section){
        var isThisSection = (section === currentSection);
        if (!nextSectionDidPass && !section.visited){
          isNextSection = true;
          nextSectionDidPass = true;
        } else {
          isNextSection = false;
        }

        if (section.visited) {
          var totalSectionScore = sparks.reportController.getTotalScoreForSection(section);
          var lastThreeSectionScore = sparks.reportController.getLastThreeScoreForSection(section);
          var timesRun = lastThreeSectionScore[1];
          lastThreeSectionScore = lastThreeSectionScore[0];
          totalScore += totalSectionScore;

          var light;
          if (lastThreeSectionScore < 0.30){
            light = "common/icons/light-red.png";
          } else if (lastThreeSectionScore < 0.90) {
            light = "common/icons/light-off.png";
          } else {
            light = "common/icons/light-on.png";
          }
          var $img = $('<img>').attr('src', light).attr('width', 35);
          $img.easyTooltip({
             content: "You scored "+sparks.math.roundToSigDigits(lastThreeSectionScore*100,3)+"% of the possible points from the last "+timesRun+" times you ran this level"
          });
        }
        var $btn = null;
        if (section.visited){
          $btn = $('<button>').addClass("repeat").text("Try this level again");
          $btn.click(function(){
            sparks.sectionController.repeatSection(section);
          });
        } else if (isNextSection){
          $btn = $('<button>').addClass("next").text("Go to the next level");
          $btn.click(function(){
            sparks.activityController.nextSection();
          });
        }

        $table.append(
          $('<tr>').append(
            $('<td>').addClass(section.visited ? "" : "no_check").css('padding-left', '0px').append($img),
            $('<td>').text(section.title),
            $('<td>').text(section.visited ? totalSectionScore : ''),
            $('<td>').append($btn)
          )
        );
      });

      $div.append($table);

      var $score = $("<span>").css("font-size", "11pt").html("<u>You have scored <b>"+totalScore+"</b> points so far.</u>");
      $div.find('h1').after($score);

      $div.append(this._createReportTableForCategories());

      return $div;
    },

    getFinalActivityReportView: function(report) {
      var $div = $('<div>');
      $div.append('<h1>Activity results</h1>');

      var totalScore = 0;
      var self = this;

      $.each(report.sectionReports, function(i, sectionReport){

        $div.append('<h2>Section '+(i+1)+': '+sectionReport.sectionTitle+'</h2>');
        var pageReports = sectionReport.pageReports;

        var $table = $("<table>");
        $.each(pageReports, function(i, pageReport){
          var score = sparks.reportController.getTotalScoreForPageReport(pageReport);

          var $tr = $("<tr>");
          $tr.append("<td>Page "+(i+1)+": "+ score   +" points</td>");
          $table.append($tr);

          totalScore += score;

        });
        $div.append($table);
      });

      var $score = $("<span>").css("font-size", "11pt").html("<u>"+report.user.name.replace("+", " ").trim()+" has scored <b>"+totalScore+"</b> points so far.</u>");
      $div.find('h1').after($score);
      return $div;
    },

    _createReportTableForCategories: function() {

      var categories = sparks.reportController.getCategories(sparks.report);

      var $table = $("<table>").addClass('categoryReport');
      $table.append(
        $('<tr>').append(
          $('<th>'),
          $('<th>').text("Question Categories")
        )
      );

      $.each(categories, function(category, score){
        var $btn = $('<button>').addClass("tutorial").text("View tutorial");
        $btn.click(function(){
          sparks.tutorialController.showTutorial(score[3]);
        });

        var light;
        switch (score[2]) {
          case 0:
            light = "common/icons/light-red.png";
            break;
          case 1:
          case 2:
           light = "common/icons/light-off.png";
           break;
          case 3:
           light = "common/icons/light-on.png";
        }
        var $img = $('<img>').attr('src', light).attr('width', 35);
        $img.easyTooltip({
           content: "You got "+score[2]+" out of the last "+(Math.min(score[1],3))+" questions of this type correct"
        });

        $table.append(
          $('<tr>').append(
            $('<td>').append($img),
            $('<td>').html(category),
            $('<td>').append($btn)
          )
        );
      });
      return $table;
    },

    _createReportTableForSession: function(sessionReport) {

      var $report = $('<table>').addClass('reportTable');
      $report.addClass((sessionReport.score == sessionReport.maxScore) ? "allCorrect" : "notAllCorrect");

      $report.append(
        $('<tr>').append(
          $('<th>').text("Item"),
          $('<th>').text("Your answer"),
          $('<th>').text("Correct answer"),
          $('<th>').text("Score"),
          $('<th>').text("Notes"),
          $('<th>').text("Tutorials")
        )
      );

      $.each(sessionReport.questions, function(i, question){
        if (!!question.not_scored) {
          $report.append(
            $('<tr>').append(
              $('<td>').html(question.shortPrompt),
              $('<td>').html(question.answer)
            )
          );
          $report.find('th').filter(':contains("Correct answer")').hide();
          $report.find('th').filter(':contains("Score")').hide();
          $report.find('th').filter(':contains("Notes")').hide();
          return;
        }
        var answer = !!question.answer ? question.answer + (!!question.units ? " "+question.units : '') : '';
        var correctAnswer = question.correct_answer + (!!question.correct_units ? " "+question.correct_units : '');
        var score = question.points_earned;
        var feedback = "";


        if(!question.feedback){
        	if (answer === '') {

        	} else if (!question.answerIsCorrect){
        	  feedback += "The value was wrong";
        	}
        } else {
          feedback = question.feedback;
        }

        var $tutorialButton = null;
        if (!!question.tutorial){
          $tutorialButton = $("<button>").text(question.tutorial.replace(/-/g, ' ').capFirst()).css('padding-left', "10px")
                              .css('padding-right', "10px").css('margin-left', "20px").css('width', "100px");

          sparks.tutorialController.getTutorialTitle(question.tutorial, function(title){
            var rolloverText = "Click to view \""+title+"\"";
            $tutorialButton.easyTooltip({
               content: rolloverText
            });
          });
          $tutorialButton.click(function(){
            sparks.tutorialController.showTutorial(question.tutorial);
          });
        } else {
        }

        $report.append(
          $('<tr>').append(
            $('<td>').html(question.shortPrompt),
            $('<td>').html(answer),
            $('<td>').html(correctAnswer),
            $('<td>').html(score +"/" + question.points),
            $('<td>').html(feedback),
            $('<td>').append($tutorialButton)
          ).addClass(question.answerIsCorrect ? "correct" : "incorrect")
        );
      });

      if (sessionReport.bestTime > 0){
        var feedback;
        if (sessionReport.timeScore == sessionReport.maxTimeScore){
          feedback = "Excellent! You earned the bonus points for very fast work!";
        } else {
          var rawScore = sessionReport.score - sessionReport.timeScore;
          var rawMaxScore = sessionReport.maxScore - sessionReport.maxTimeScore;
          if (rawScore < rawMaxScore * 0.7){
            feedback = "You didn't score enough points to earn the time bonus";
          } else {
            feedback = "You could score more bonus points by completing this page quicker!";
          }
        }

        $report.append(
          $('<tr>').append(
            $('<td>').html("Time taken"),
            $('<td>').html(Math.round(sessionReport.timeTaken) + " sec."),
            $('<td>').html("< "+sessionReport.bestTime + " sec."),
            $('<td>').html(sessionReport.timeScore +"/" + sessionReport.maxTimeScore),
            $('<td>').html(feedback)
          ).addClass(sessionReport.timeScore == sessionReport.maxTimeScore ? "correct" : "incorrect")
        );
      }

      if (sessionReport.score > -1){
        $report.append(
          $('<tr>').append(
            $('<th>').text("Total Score:"),
            $('<th>').text(""),
            $('<th>').text(""),
            $('<th>').text(sessionReport.score + "/" + sessionReport.maxScore),
            $('<th>').text(""),
            $('<th>').text("")
          )
        );
      }

      return $report;
    }

  };
})();
/*globals sparks Raphael*/

(function () {

  sparks.OscilloscopeView = function () {
    this.$view         = null;
    this.miniRaphaelCanvas = null;
    this.raphaelCanvas = null;
    this.miniTraces    = [];
    this.traces        = [];
    this.model         = null;
    this.popup         = null;
  };

  sparks.OscilloscopeView.prototype = {

    miniViewConfig: {
      width: 132,
      height: 100,
      tickSize: 2
    },

    largeViewConfig: {
      width:    400,
      height:   320,
      tickSize: 3
    },

    nVerticalMarks:   8,
    nHorizontalMarks: 10,
    nMinorTicks:      5,

    faceplateColor:   '#EEEEEE',
    displayAreaColor: '#324569',
    traceBgColor:     '#324569',
    tickColor:        '#9EBDDE',
    textColor:        '#D8E1EB',
    traceOuterColors: ['#FFFF4A', '#FF5C4A', '#33FF33'],
    traceInnerColors: ['#FFFFFF', '#FFD3CF', '#EEFFEE'],
    traceLabelColors: ['#FFFF99', '#FC8F85', '#99FC7B'],
    setModel: function (model) {
      this.model = model;
    },

    getView: function () {
      var $canvasHolder,
          self = this,
          conf = this.miniViewConfig;

      this.$view = $('<div>');
      this.$view.css({
        position: 'relative',
        width: conf.width+160,
        height: conf.height+40
      });


      this.$displayArea = $('<div class="display-area">').css({
        position: 'absolute',
        top: 14,
        left: 19,
        width:    conf.width,
        height:   conf.height,
        backgroundColor: this.displayAreaColor
      }).appendTo(this.$view);

      $canvasHolder = $('<div class="raphael-holder">').css({
        position: 'absolute',
        top:  0,
        left: 0,
        backgroundColor: this.traceBgColor
      }).appendTo(this.$displayArea);

      this.miniRaphaelCanvas = Raphael($canvasHolder[0], conf.width, conf.height);

      this.drawGrid(this.miniRaphaelCanvas, conf);

      $overlayDiv = $('<div id="oscope_mini_overlay"></div>').appendTo(this.$view);

      $overlayDiv.click(function(){
        self.openPopup();
      });
      return this.$view;
    },

    openPopup: function () {
      if (!this.popup) {
        $view = this.getLargeView();
        this.renderSignal(1, true);
        this.renderSignal(2, true);
        this.popup = $view.dialog({
          width: this.largeViewConfig.width + 150,
          height: this.largeViewConfig.height + 80,
          dialogClass: 'tools-dialog oscope_popup',
          title: "Oscilloscope",
          closeOnEscape: false,
          resizable: false,
          autoOpen: false
        });
      }

      var self = this;
      this.popup.bind('remove', function() {
        self.popup = null;
      });

      this.popup.dialog('open').dialog("widget").position({
         my: 'left top',
         at: 'center top',
         of: $("#breadboard_wrapper")
      });
    },

    /**
      @returns $view A jQuery object containing a Raphael canvas displaying the oscilloscope traces.

      Sets this.$view to be the returned jQuery object.
    */
    getLargeView: function () {
      var $canvasHolder,
          self = this,
          conf = this.largeViewConfig;

      this.$view = $('<div>');
      this.$view.css({
        position: 'relative',
        width: conf.width,
        height: conf.height
      });


      this.$displayArea = $('<div class="display-area">').css({
        position: 'absolute',
        top: 25,
        left: 18,
        width:    conf.width + 6,
        height:   conf.height + 30,
        backgroundColor: this.displayAreaColor
      }).appendTo(this.$view);

      $canvasHolder = $('<div class="raphael-holder">').css({
        position: 'absolute',
        top:  5,
        left: 7,
        width:    conf.width,
        height:   conf.height,
        backgroundColor: this.traceBgColor
      }).appendTo(this.$displayArea);

      $canvasHolder
        .drag(function( ev, dd ){
          var viewWidth   = this.getBoundingClientRect().width,
              perc        = dd.deltaX / viewWidth,
              phaseOffset = (-2*Math.PI) * perc;

          self.renderSignal(1, false, phaseOffset);
          self.renderSignal(2, false, phaseOffset);
        })
        .drag("dragend", function (ev, dd) {
          var viewWidth   = this.getBoundingClientRect().width,
              perc        = dd.deltaX / viewWidth,
              phaseOffset = (-2*Math.PI) * perc;

          self.previousPhaseOffset += phaseOffset;
        });

      this.raphaelCanvas = Raphael($canvasHolder[0], conf.width, conf.height);

      this.drawGrid(this.raphaelCanvas, conf);

      $('<p id="cha"><span class="chname">CHA</span> <span class="vscale channel1"></span>V</p>').css({
        position: 'absolute',
        top:   10 + conf.height,
        left:  5,
        color: this.traceLabelColors[0]
      }).appendTo(this.$displayArea);

      $('<p id="chb"><span class="chname">CHB</span> <span class="vscale channel2"></span>V</p>').css({
        position: 'absolute',
        top:   10 + conf.height,
        left:  5 + conf.width / 4,
        color: this.traceLabelColors[1]
      }).appendTo(this.$displayArea);

      $('<p>M <span class="hscale"></span>s</p>').css({
        position: 'absolute',
        top:   10 + conf.height,
        left:  5 + (conf.width*3)/4,
        color: this.textColor
      }).appendTo(this.$displayArea);


      this.$faceplate = $('<div class="faceplate">').css({
        position: 'absolute',
        left:   conf.width + 27,
        top: 15,
        backgroundColor: 'none',
        width: 122,
        height: 364,
        overflow: 'hidden'
      }).appendTo(this.$view);

      this.$controls = $('<div>').css({
        position: 'absolute',
        top:      30,
        left:     0,
        right:    0,
        height:   200
      }).appendTo(this.$faceplate);

      $('<p class="oscope-label">volts/div</p>').css({
        top:       -33,
        left:      14,
        right:     0,
        height:    20,
        position: 'absolute'
      }).appendTo(this.$controls);

      this.$channel1 = $('<div class="channelA">').css({
        position:  'absolute',
        top:       19,
        left:      11,
        width:     122,
        height:    100
      }).appendTo(this.$controls);

      $('<p>CH A</p>').css({
        top:       -2,
        left:      -2,
        right:     0,
        height:    20,
        textAlign: 'center',
        position:  'absolute'
      }).appendTo(this.$channel1);

      this._addScaleControl(this.$channel1, function () {
        self.model.bumpVerticalScale(1, -1);
      }, function () {
        self.model.bumpVerticalScale(1, 1);
      });

      this.$channel2 = $('<div>').css({
        position: 'absolute',
        top:      121,
        left:     11,
        width:    122,
        height:   100
      }).appendTo(this.$controls);

      $('<p>CH B</p>').css({
        top:    -2,
        left:   -2,
        right:  0,
        height: 20,
        textAlign: 'center',
    position: 'absolute'
      }).appendTo(this.$channel2);

      this._addScaleControl(this.$channel2, function () {
        self.model.bumpVerticalScale(2, -1);
      }, function () {
        self.model.bumpVerticalScale(2, 1);
      });

      $('<p class="oscope-label">time/div</p>').css({
        top:       179,
        left:      16,
        right:     0,
        height:    20,
        position:  'absolute'
      }).appendTo(this.$controls);

      this.$horizontal = $('<div>').css({
        position:  'absolute',
        top:       229,
        left:      11,
        width:     122,
        height:    100
      }).appendTo(this.$controls);

      this._addScaleControl(this.$horizontal, function () {
        self.model.bumpHorizontalScale(-1);
      }, function () {
        self.model.bumpHorizontalScale(1);
      });

      this.horizontalScaleChanged();
      for (i = 1; i <= this.model.N_CHANNELS; i++) {
        this.verticalScaleChanged(i);
      }

      $('<button id="AminusB" class="comboButton">A-B</button>').css({
        top:       298,
        left:      33,
        height:    23,
        width:     36,
        position:  'absolute'
      }).click(function(){
        self._toggleComboButton(true);
      }).appendTo(this.$controls);

      $('<button id="AplusB" class="comboButton">A+B</button>').css({
        top:       298,
        left:      74,
        height:    23,
        width:     36,
        position:  'absolute'
      }).click(function(){
        self._toggleComboButton(false);
      }).appendTo(this.$controls);



      $('<p class="goodnessOfScale"></p>').css({
        top:       229,
        left:      55,
        right:     0,
        height:    20,
        position:  'absolute'
      }).appendTo(this.$controls);

      return this.$view;
    },

  _toggleComboButton: function (isAminusB) {
    if (isAminusB) {
        this.model.toggleShowAminusB();
    } else {
        this.model.toggleShowAplusB();
    }

    this.renderSignal(1, true, this.previousPhaseOffset);
    this.renderSignal(2, true, this.previousPhaseOffset);


    $('.comboButton').removeClass('active');

    $('.channelA button').addClass('active')
    $('.vscale.channel2').html($('.vscale.channel1').html());

    if (this.model.showAminusB) {
      $('#AminusB').addClass('active');
    } else if (this.model.showAplusB) {
      $('#AplusB').addClass('active');
    } else {
      $('.channelA button').removeClass('active');
    }
  },

    _addScaleControl: function ($el, minusCallback, plusCallback) {
      $('<button>+</button>').css({
        position: 'absolute',
        top:   25,
        left:  25,
        width: 30
      }).click(plusCallback).appendTo($el);

      $('<button>&mdash;</button>').css({
        position: 'absolute',
        top:   25,
        right: 25,
        width: 30
      }).click(minusCallback).appendTo($el);
    },

    previousPhaseOffset: 0,

    renderSignal: function (channel, forced, _phaseOffset) {
      var s = this.model.getSignal(channel),
          t = this.traces[channel],
          horizontalScale,
          verticalScale,
          phaseOffset = (_phaseOffset || 0) + this.previousPhaseOffset,
          isComboActive = (this.model.showAminusB || this.model.showAplusB);

      if (s) {
        horizontalScale = this.model.getHorizontalScale();
        verticalScale   = isComboActive? this.model.getVerticalScale(1) : this.model.getVerticalScale(channel);

        if (!t || forced || (t.amplitude !== s.amplitude || t.frequency !== s.frequency || t.phase !== (s.phase + phaseOffset) ||
                   t.horizontalScale !== horizontalScale || t.verticalScale !== verticalScale)) {
          this.removeTrace(channel);
          this.traces[channel] = {
            amplitude:          s.amplitude,
            frequency:          s.frequency,
            phase:              (s.phase + phaseOffset),
            horizontalScale:    horizontalScale,
            verticalScale:      verticalScale,
            raphaelObjectMini:  this.drawTrace(this.miniRaphaelCanvas, this.miniViewConfig, s, channel, horizontalScale, verticalScale, phaseOffset, isComboActive),
            raphaelObject:      this.drawTrace(this.raphaelCanvas, this.largeViewConfig, s, channel, horizontalScale, verticalScale, phaseOffset, isComboActive)
          };
        }

        if (channel === 1 && this.traces[2]) {
          if (!!this.traces[2].raphaelObjectMini) this.traces[2].raphaelObjectMini.toFront();
          if (!!this.traces[2].raphaelObject) this.traces[2].raphaelObject.toFront();
        }

        if (sparks.testOscopeScaleQuality) {
          var g = this.model.getGoodnessOfScale();
          console.log(g)
          var g0 = sparks.math.roundToSigDigits(g[0] ? g[0] : -1,4),
              g1 = sparks.math.roundToSigDigits(g[1] ? g[1] : -1,4)
          $(".goodnessOfScale").html("["+g0+","+g1+"]");
        }
      }
      else {
        this.removeTrace(channel);
      }
      this.renderComboTrace(phaseOffset);
    },

    renderComboTrace: function (phaseOffset) {
      this.removeTrace(3);
      if ((this.model.showAminusB || this.model.showAplusB) && this.model.getSignal(1) && this.model.getSignal(2)) {
        var a  = this.model.getSignal(1),
            b  = this.model.getSignal(2),
            bPhase = this.model.showAplusB ? b.phase : (b.phase + Math.PI),     // offset b's phase by Pi if we're subtracting
            rA = a.amplitude * Math.sin(a.phase),
            iA = a.amplitude * Math.cos(a.phase),
            rB = b.amplitude * Math.sin(bPhase),
            iB = b.amplitude * Math.cos(bPhase),
            combo = {
                amplitude: Math.sqrt(Math.pow(rA+rB, 2) + Math.pow(iA+iB, 2)),
                phase: Math.atan((rA+rB) / (iA+iB)) + phaseOffset + ((iA+iB) < 0 ? Math.PI : 0),
                frequency: a.frequency
            };
        this.traces[3] = {
            raphaelObjectMini: this.drawTrace(this.miniRaphaelCanvas, this.miniViewConfig, combo, 3, this.model.getHorizontalScale(), this.model.getVerticalScale(1), 0),
            raphaelObject: this.drawTrace(this.raphaelCanvas, this.largeViewConfig, combo, 3, this.model.getHorizontalScale(), this.model.getVerticalScale(1), 0)
        };
        $('#cha .chname').html(this.model.showAminusB? "A-B" : "A+B");
        $('#cha').css({color: this.traceLabelColors[2]});
      } else {
        $('#cha .chname').html("CHA");
        $('#cha').css({color: this.traceLabelColors[0]});
      }
    },

    removeTrace: function (channel) {
      if (this.traces[channel]) {
        if (this.traces[channel].raphaelObjectMini) this.traces[channel].raphaelObjectMini.remove();
        if (this.traces[channel].raphaelObject) this.traces[channel].raphaelObject.remove();
        delete this.traces[channel];
      }
      if (channel !== 3) {
        this.renderComboTrace(this.previousPhaseOffset);
      }
    },

    humanizeUnits: function (val) {
      var prefixes  = ['M', 'k', '', 'm', 'μ', 'n', 'p'],
          order     = Math.floor(Math.log10(val) + 0.01),    // accounts for: Math.log10(1e-6) = -5.999999999999999
          rank      = Math.ceil(-1 * order / 3),
          prefix    = prefixes[rank+2],
          scaledVal = val * Math.pow(10, rank * 3),


          decimalPlaces = order % 3 >= 0 ? 2 - (order % 3) : -1 * ((order + 1) % 3);

      return scaledVal.toFixed(decimalPlaces) + prefix;
    },

    horizontalScaleChanged: function () {
      var scale = this.model.getHorizontalScale(),
          channel;

      this.$view.find('.hscale').html(this.humanizeUnits(scale));

      for (channel = 1; channel <= this.model.N_CHANNELS; channel++) {
        if (this.traces[channel]) this.renderSignal(channel);
      }
    },

    verticalScaleChanged: function (channel) {
      var scale = this.model.getVerticalScale(channel);

      this.$view.find('.vscale.channel'+channel).html(this.humanizeUnits(scale));
      if (this.traces[channel]) this.renderSignal(channel);
    },

    drawGrid: function (r, conf) {
      var path = [],
          x, dx, y, dy;

      for (x = dx = conf.width / this.nHorizontalMarks; x <= conf.width - dx; x += dx) {
        path.push('M');
        path.push(x);
        path.push(0);

        path.push('L');
        path.push(x);
        path.push(conf.height);
      }

      for (y = dy = conf.height / this.nVerticalMarks; y <= conf.height - dy; y += dy) {
        path.push('M');
        path.push(0);
        path.push(y);

        path.push('L');
        path.push(conf.width);
        path.push(y);
      }

      y = conf.height / 2;

      for (x = dx = conf.width / (this.nHorizontalMarks * this.nMinorTicks); x <= conf.width - dx; x += dx) {
        path.push('M');
        path.push(x);
        path.push(y-conf.tickSize);

        path.push('L');
        path.push(x);
        path.push(y+conf.tickSize);
      }

      x = conf.width / 2;

      for (y = dy = conf.height / (this.nVerticalMarks * this.nMinorTicks); y <= conf.height - dy; y += dy) {
        path.push('M');
        path.push(x-conf.tickSize);
        path.push(y);

        path.push('L');
        path.push(x+conf.tickSize);
        path.push(y);
      }

      return r.path(path.join(' ')).attr({stroke: this.tickColor, opacity: 0.5});
    },

    drawTrace: function (r, conf, signal, channel, horizontalScale, verticalScale, phaseOffset, _isFaint) {
      if (!r) return;
      var path         = [],
          height       = conf.height,
          h            = height / 2,

          overscan     = 5,                       // how many pixels to overscan on either side (see below)
          triggerStart = conf.width / 2,          // horizontal position at which the rising edge of a 0-phase signal should cross zero

          radiansPerPixel = (2 * Math.PI * signal.frequency * horizontalScale) / (conf.width / this.nHorizontalMarks),

          pixelsPerVolt = (conf.height / this.nVerticalMarks) / verticalScale,

          isFaint = _isFaint || false,
          opacity = isFaint ? 0.3 : 1,

          x,
          raphaelObject,
          paths,
          i;

      if (radiansPerPixel > Math.PI / 2) radiansPerPixel = Math.PI / 2;

      function clip(y) {
        return y < 0 ? 0 : y > height ? height : y;
      }

      for (x = 0; x < conf.width + overscan * 2; x++) {
        path.push(x ===  0 ? 'M' : 'L');
        path.push(x);

        path.push(clip(h - signal.amplitude * pixelsPerVolt * Math.sin((x - overscan - triggerStart) * radiansPerPixel + (signal.phase + phaseOffset))));
      }
      path = path.join(' ');

      paths = [];
      paths.push(r.path(path).attr({stroke: this.traceOuterColors[channel-1], 'stroke-width': 4.5, opacity: opacity}));
      paths.push(r.path(path).attr({stroke: this.traceInnerColors[channel-1], 'stroke-width': 2, opacity: opacity}));

      raphaelObject = r.set.apply(r, paths);

      raphaelObject.translate(-1 * overscan, 0);

      return raphaelObject;
    }

  };

}());
/*globals sparks Raphael*/

(function () {

  sparks.FunctionGeneratorView = function (functionGenerator) {
    this.$view          = null;
    this.model          = functionGenerator;
    this.frequencies    = [];
    this.currentFreqString = "";
    this.freqValueViews = [];
    this.popup = null;
  };

  sparks.FunctionGeneratorView.prototype = {

    width:    200,
    height:   100,
    nMinorTicks:      5,

    faceplateColor:   '#EEEEEE',

    getView: function () {
      this.$view = $('<div>');

      $("#fg_value").remove();
      $freq_value = $("<span id='fg_value'></span").appendTo(this.$view);
      this.freqValueViews.push($freq_value);

      this.frequencies = this.model.getPossibleFrequencies();
      this.setFrequency(this.model.frequency);

      $overlayDiv = $('<div id="fg_mini_overlay"></div>').appendTo(this.$view);
      var self = this;
      $overlayDiv.click(function(){
        self.openPopup();
      })

      return this.$view;
    },

    openPopup: function () {
      if (!this.popup) {
        $view = this.getLargeView();
        this.popup = $view.dialog({
          width: this.width + 10,
          height: this.height+37,
          dialogClass: 'tools-dialog fg_popup',
          title: "Function Generator",
          closeOnEscape: false,
          resizable: false,
          autoOpen: false
        });
      }

      var self = this;
      this.popup.bind('remove', function() {
        self.popup = null;
      });

      this.popup.dialog('open').dialog("widget").position({
         my: 'left top',
         at: 'left top',
         offset: '5, 5',
         of: $("#breadboard_wrapper")
      });
    },

    getLargeView: function () {
      var $canvasHolder,
          self = this;

      this.$view = $('<div>');
      this.$view.css({
        position: 'relative',
        width: this.width,
        height: this.height
      });

      this.$faceplate = $('<div class="function_generator">').css({
        position: 'absolute',
        left: 0,
        right: 0,
        height: this.height
      }).appendTo(this.$view);

      $freq_value = $('<p id="freq_value">'+this.currentFreqString+'</p>').css({
        position:  'absolute',
        top:       15,
        left:      15,
        height:    20,
        textAlign: 'center'
      }).appendTo(this.$faceplate);

      this.freqValueViews.push($freq_value);

      this.$controls = $('<div id="controls">').css({
        position: 'absolute',
        top:      28,
        left:     0,
        height:   70
      }).appendTo(this.$faceplate);

      this.$frequency = $('<div>').css({
        position:  'absolute',
        top:       12,
        left:      10,
        width:     150,
        height:    55
      }).appendTo(this.$controls);

      var freqs = this.frequencies;
      var initialStep = sparks.util.getClosestIndex(freqs, this.model.frequency, false);
      this._addSliderControl(this.$frequency, freqs.length, initialStep, function (evt, ui) {
        var i = ui.value;
        if (i < 0) i = 0;
        if (i > freqs.length-1) i = freqs.length-1;
        var freq = freqs[i];
        self.model.setFrequency(freq);
        self.setFrequency(freq);
      });

      $('<span>Frequency</span>').css({
        position:  'absolute',
        top:       43,
        left:      45,
        width:     100,
        height:    15
      }).appendTo(this.$controls);

      if (this.model.maxAmplitude){
        this.$amplitude = $('<div>').css({
          position: 'absolute',
          top:      35,
          left:     10,
          width:    150,
          height:   55
        }).appendTo(this.$controls);

        var minAmp = this.model.minAmplitude,
            maxAmp = this.model.maxAmplitude,
            amplitude = this.model.amplitude,
            range = maxAmp - minAmp,
            steps = 30,
            value = ((amplitude - minAmp) / range) * steps;
        this._addSliderControl(this.$amplitude, steps, value, function (evt, ui) {
          var i = ui.value;
          if (i < 0) i = 0;
          if (i > steps) i = steps;
          var amp = ((i / steps) * range) + minAmp;
          self.model.setAmplitude(amp);
        });

        $('<span>Amplitude</span>').css({
          position: 'absolute',
          top:    66,
          left:   45,
          right:  100,
          height: 15,
          textAlign: 'center'
        }).appendTo(this.$controls);
      }

      return this.$view;
    },

    setFrequency: function (freq) {
      currentFreqString = this.currentFreqString = sparks.mathParser.standardizeUnits(sparks.unit.convertMeasurement(freq + " Hz"));
      this.freqValueViews.forEach(function($view){$view.text(currentFreqString);});
      return this.currentFreqString;
    },

    _addSliderControl: function ($el, steps, value, callback) {
      $slider = $("<div id='fg_slider'>").css({
        position: 'absolute',
        top:   25,
        left:  10,
        right: 10
      }).slider({ max: steps, slide: callback, value: value }).appendTo($el);
      if (steps < 2) {
        $slider.easyTooltip({
           content: "You can't change this frequency in this activity"
        });
      }
    }
  };

}());
/*globals console sparks $ breadModel getBreadBoard */

(function() {

  sparks.ClassReportView = function(){
    this.$wrapperDiv = null;
    this.$classReport = null;
  };

  sparks.ClassReportView.prototype = {

    getClassReportView: function(reports){
      var $div = $('<div>');

      $div.append('<h1>Class results</h1>');
      $div.append('<span id="date">' + sparks.util.todaysDate() + "</span>");
      $div.append(this.createLevelsTable(reports));
      $div.append('<p>');

      $div.append('<h2>Question categories</h2>');
      $div.append(this.createCategoryTable(reports));

      $div.find('.tablesorter').tablesorter(
        {
          sortList: [[0,0]],
          widgets: ['zebra'],
          textExtraction: function(node) {      // convert image to a string so we can sort on it
            var content = node.childNodes[0];
            if (!content) {
              return "A";
            } else if (content.nodeName === "IMG") {
              return "Z"+(content.getAttribute('score'));
            } else {
              return content.textContent;
            }
          }
        });

      this.$classReport = $div;

      this.$wrapperDiv = $("<div>").append(this.$classReport);

      return this.$wrapperDiv;
    },

    createLevelsTable: function(reports) {
      var $table = $("<table>").addClass('classReport').addClass('tablesorter');
      var levels = sparks.classReportController.getLevels();

      var headerRow = "<thead><tr><th class='firstcol'>Student Name</th>";
      for (var i = 0, ii = levels.length; i < ii; i++){
        headerRow += "<th>" + levels[i] + "</th>";
      }
      headerRow += "<th class='lastcol'>Cumulative Points</th></tr></thead>";
      $table.append(headerRow);

      for (i = 0, ii = reports.length; i < ii; i++){
        var $studentRow = this._createStudentRow(reports[i], levels.length);
        $table.append($studentRow);
      }
      return $table;
    },

    _createStudentRow: function(report, numLevels) {
      var $tr = $("<tr>"),
          name = this._cleanStudentName(report.user.name),
          totalScore = 0;

      var $name = $("<td class='firstcol'>" + name + "</td>");
      $tr.append($name);
      var self = this;
      $name.click(function(){self.showStudentReport(report);});
      for (var i = 0, ii = report.sectionReports.length; i < ii; i++){
        var summary = sparks.reportController.getSummaryForSectionReport(report.sectionReports[i]),
            light;
        totalScore += summary[1];

        if (summary[0] < 0.30){
          light = "common/icons/light-red.png";
        } else if (summary[0] < 0.90) {
          light = "common/icons/light-off.png";
        } else {
          light = "common/icons/light-on.png";
        }
        var $img = $('<img>').attr('src', light).attr('width', 35).attr('score', summary[0]);
        $img.easyTooltip({
           content: name + " scored "+sparks.math.roundToSigDigits(summary[0]*100,3)+"% of the possible points from the last "+summary[2]+" times they ran this level"
        });
        $tr.append($('<td>').append($img));
      }

      for (i = 0, ii = numLevels - report.sectionReports.length; i < ii; i++){
        $tr.append("<td/>");
      }

      $tr.append("<td class='lastcol'>"+totalScore+"</td>");
      return $tr;
    },

    _cleanStudentName: function (name) {
      if (name.indexOf('+') > -1){
        return name.split("+").join(" ");
      }
      return name;
    },

    createCategoryTable: function(reports) {
      var $table = $("<table>").addClass('classReport').addClass('tablesorter'),
          categories = [],
          i, ii;
      for (i = 0, ii = reports.length; i < ii; i++){
        var row = [],
            report = reports[i],
            name = this._cleanStudentName(report.user.name),
            catReport = sparks.reportController.getCategories(report);

        for (var category in catReport){
          if (!!category && category !== "undefined" && catReport.hasOwnProperty(category)){
            var catIndex = sparks.util.contains(categories, category);
            if (catIndex < 0){
              categories.push(category);
              catIndex = categories.length - 1;
            }
            row[catIndex] = catReport[category];
          }
        }

        var $tr = $('<tr>').addClass(i%2===0 ? "evenrow" : "oddrow");
        $tr.append('<td class="firstcol">'+name+'</td>');
        for (var j = 0, jj = categories.length; j < jj; j++){
          var score = row[j],
              $td = $('<td>');
          if (!!score){
            var light;
            switch (score[2]) {
              case 0:
                light = "common/icons/light-red.png";
                break;
              case 1:
              case 2:
               light = "common/icons/light-off.png";
               break;
              case 3:
               light = "common/icons/light-on.png";
            }
            var $img = $('<img>').attr('src', light).attr('width', 35).attr('score', score[2]);
            $img.easyTooltip({
               content: name+" got "+score[2]+" out of the last "+(Math.min(score[1],3))+" questions of this type correct"
            });
            $td.append($img);
          }
          $tr.append($td);
        }
        $table.append($tr);
      }

      var header = "<thead><tr><th>Students</th>";
      for (i = 0, ii = categories.length; i < ii; i++){
        header += "<th>" + categories[i] + "</th>";
      }
      header += "</tr></thead>";
      $table.prepend(header);

      $table.find('tr').each(function(i, tr){
        for (j = categories.length, jj = tr.childNodes.length; j >= jj; j--){
          $(tr).append('<td>');
        }
      });

      return $table;
    },

    showStudentReport: function(report) {
      var $div = $("<div>");

      var $returnButton = $("<button>").text("Return to class report").css('padding-left', "10px")
                        .css('padding-right', "10px").css('margin-left', "20px");
      var self = this;
      $returnButton.click(function(){
        $div.hide();
        self.$classReport.show();
      });
      $div.append($returnButton);

      $div.append("<h1>"+this._cleanStudentName(report.user.name)+"</h1>");
      $div.append(this.createStudentReport(report));

      this.$classReport.hide();
      this.$wrapperDiv.append($div);
    },

    createStudentReport: function(report) {
      var $table = $("<table>").addClass('classReport').addClass('tablesorter');
      var levels = sparks.classReportController.getLevels();

      var headerRow = "<thead><tr><th class='firstcol'>Level</th><th>Score per Attempt (%)</th><th>Total score</th></tr></thead>";
      $table.append(headerRow);
      for (var i = 0, ii = levels.length; i < ii; i++){
        var level = levels[i];
        var $tr = $("<tr>").addClass(i%2===0 ? "even":"odd");
        $tr.append("<td class='firstcol'>"+levels[i]+"</td>");

        var $graphTD = $("<td>");//.css('width', '10em').css('overflow-x', 'scroll').css('overflow-y','hidden');
        var $graph = $('<ul class="timeline">');
        var data = sparks.reportController.getSessionScoresAsPercentages(report.sectionReports[i]);
        for (j = 0, jj = data.length; j < jj; j++) {
          var $li = $('<li><a><span class="count" style="height: '+data[j]+'%"></a></li>');
          $li.easyTooltip({
             content: ""+sparks.math.roundToSigDigits(data[j],3)+"% of the possible points in attempt "+(j+1)
          });
          $graph.append($li);
        }
        $tr.append($graphTD.append($graph));

        var score = "";
        if (i < report.sectionReports.length){
          score = sparks.reportController.getTotalScoreForSectionReport(report.sectionReports[i]);
        }
        $tr.append("<td>"+score+"</td>");
        $table.append($tr);
      }
      return $table;
    }
  };
})();
/*globals console sparks $ breadModel getBreadBoard */

(function() {

  /*
   * Sparks Page Controller can be accessed by the
   * singleton variable sparks.questionController
   */
  sparks.QuestionController = function(){
  };

  sparks.QuestionController.prototype = {

    reset: function() {
      this._id = 0;
      this._subquestionId = 0;
      this._shownId = 0;
    },

    createQuestionsArray: function(jsonQuestions) {
      var questionsArray = [];
      var self = this;
      $.each(jsonQuestions, function(i, jsonQuestion){
        self.createQuestion(jsonQuestion, questionsArray);
      });

      return questionsArray;
    },

    _id: 0,

    _subquestionId: 0,

    _shownId: 0,

    createQuestion: function(jsonQuestion, questionsArray) {
      var self = this;


      function addSingleQuestion(jsonQuestion, preprompt){
        var question = new sparks.Question();

        question.id = self._id;
        question.answer = '';
        question.shownId = self._shownId;
        self._id++;

        var oldPrompt = jsonQuestion.prompt;
        if (!!preprompt){
          question.prompt = preprompt + " " + jsonQuestion.prompt;
          question.commonPrompt = preprompt;
          question.isSubQuestion = true;
          question.subquestionId = self._subquestionId;
        } else {
          question.prompt = jsonQuestion.prompt;
        }

        question.shortPrompt = !!jsonQuestion.shortPrompt ? jsonQuestion.shortPrompt : question.prompt;

        function html_entity_decode(str) {
          return $("<div>").html(str).text();
        }

        if (!!jsonQuestion.correct_units){
          question.correct_answer = sparks.mathParser.calculateMeasurement(jsonQuestion.correct_answer);
          if (!isNaN(Number(question.correct_answer))){
            var converted = sparks.unit.toEngineering(question.correct_answer, jsonQuestion.correct_units);
            question.correct_answer = converted.value;
            question.correct_units = sparks.mathParser.standardizeUnits(converted.units);
          }
        } else if (!!jsonQuestion.correct_answer){
          question.correct_answer = sparks.mathParser.calculateMeasurement(jsonQuestion.correct_answer);
        }

        if (!!question.correct_units){
          question.correct_units = question.correct_units.replace("ohms",html_entity_decode("&#x2126;"));
        }

        if (!!jsonQuestion.options){
          question.options = [];
          $.each(jsonQuestion.options, function(i, choice){
            question.options[i] = {};
            if (!!jsonQuestion.options[i].option){
              question.options[i].option = ""+jsonQuestion.options[i].option;
              question.options[i].option = sparks.mathParser.calculateMeasurement(question.options[i].option);
              question.options[i].points = jsonQuestion.options[i].points > 0 ? jsonQuestion.options[i].points : 0;
              question.options[i].feedback = jsonQuestion.options[i].feedback || "";
              question.options[i].tutorial = jsonQuestion.options[i].tutorial || "";
            } else {
              question.options[i] = sparks.mathParser.calculateMeasurement(choice);
            }
          });
          if (jsonQuestion.radio){
            question.radio = true;
          } else if (jsonQuestion.checkbox){
            question.checkbox = true;
          }
          question.keepOrder = !!jsonQuestion.keepOrder;
          question.not_scored = !!jsonQuestion.not_scored;
        }

        question.points = (!!jsonQuestion.points ?  jsonQuestion.points : 1);
        question.image = jsonQuestion.image;
        question.top_tutorial = jsonQuestion.tutorial;

        question.category = sparks.tutorialController.setQuestionCategory(question);

        question.scoring = jsonQuestion.scoring;

        question.beforeScript = jsonQuestion.beforeScript;
        question.show_read_multimeter_button = jsonQuestion.show_read_multimeter_button;

        questionsArray.push(question);

        question.prompt = oldPrompt;

        question.view = new sparks.QuestionView(question);
      }

      if (!jsonQuestion.subquestions){
        addSingleQuestion(jsonQuestion);
      } else {
        $.each(jsonQuestion.subquestions, function(i, subquestion){
          addSingleQuestion(subquestion, jsonQuestion.prompt);
        });
        this._subquestionId++;
      }
      this._shownId++;
    },

    gradeQuestion: function(question) {
      if (!!question.not_scored){
        return;
      }
      if (!!question.scoring){
        this.runQuestionScript(question.scoring, question);
      } else if (!question.options || !question.options[0].option) {
        if (""+question.answer === ""+question.correct_answer){
          question.points_earned = question.points;
        } else {
          question.points_earned = 0;
        }
      } else {
        var maxPoints = 0;
        $.each(question.options, function(i, option){
          if (option.option === question.answer){
            question.points_earned = option.points;
            question.feedback = option.feedback;
            if (!!option.tutorial) {
              question.tutorial = option.tutorial;
            } else {
              question.tutorial = question.top_tutorial;
            }

          }
          var points = option.points;
          if (points > maxPoints){
            maxPoints = points;
            question.points = points;
            question.correct_answer = option.option;
          }
        });
      }

      question.answerIsCorrect = (question.points_earned >= question.points);

      if (!question.answerIsCorrect && !question.tutorial) {
        question.tutorial = question.top_tutorial;
      }

      if (question.answerIsCorrect){
        question.tutorial = null;
      }

      if (question.points_earned < 0) {
        question.points_earned = 0;
      }
    },

    runQuestionScript: function (script, question){
      var functionScript;
      var parsedScript = sparks.mathParser.replaceCircuitVariables(script),
          goodness     = null;

      eval("var functionScript = function(question, log, parse, close, goodness){" + parsedScript + "}");

      var parse = function(string){
        return sparks.unit.parse.call(sparks.unit, string);
      }
      if (sparks.activityController.currentSection.meter.oscope) {
        goodness = sparks.activityController.currentSection.meter.oscope.getGoodnessOfScale();
      }
      functionScript(question, sparks.logController.currentLog, parse, Math.close, goodness);
    }

  };

  sparks.questionController = new sparks.QuestionController();
})();
/*globals console sparks $ breadModel getBreadBoard */

(function() {

  /*
   * Sparks Page Controller can be accessed by the
   * singleton variable sparks.pageController
   */
  sparks.PageController = function(){
  };

  sparks.PageController.prototype = {

    reset: function(){
    },

    createPage: function(id, jsonPage) {
      var page = new sparks.Page(id);

      page.questions = sparks.questionController.createQuestionsArray(jsonPage.questions);
      page.currentQuestion = page.questions[0];

      if (!!jsonPage.notes){
        var notes = sparks.mathParser.calculateMeasurement(jsonPage.notes);
        page.notes = notes;
      }

      page.time = jsonPage.time;

      page.view = new sparks.PageView(page);

      return page;
    },

    enableQuestion: function(page, question) {
      page.view.enableQuestion(question);
    },

    completedQuestion: function(page) {
      var nextQuestion;
      for (var i = 0; i < page.questions.length-1; i++){
        if (page.questions[i] === page.currentQuestion){
          if (page.currentQuestion.isSubQuestion){
            do {
              i++;
              if (i == page.questions.length){
                this.showReport(page);
                return;
              }
            } while (i < page.questions.length && page.questions[i].subquestionId == page.currentQuestion.subquestionId);
            nextQuestion = page.questions[i];
          } else {
            nextQuestion = page.questions[i+1];
          }
        }
      }

      if (!!nextQuestion){
        page.currentQuestion = nextQuestion;
        this.enableQuestion(page, page.currentQuestion);
      } else {
        this.showReport(page);
      }
    },

    showReport: function(page){
      sparks.logController.endSession();
      var sessionReport = sparks.reportController.addNewSessionReport(page);
      sparks.reportController.saveData();
      var $report = sparks.report.view.getSessionReportView(sessionReport);
      page.view.showReport($report);
    },

    getSisterSubquestionsOf: function(page, question){
      var subquestionId = question.subquestionId,
          questions = [];

      for (var i = 0; i < page.questions.length; i++){
        if (page.questions[i].subquestionId === subquestionId) {
          questions.push(page.questions[i]);
        }
      }
      return questions;
    }

  };

  sparks.pageController = new sparks.PageController();
})();
/*globals console sparks $ breadModel getBreadBoard */

(function() {

  /*
   * Sparks Log Controller can be accessed by the
   * singleton variable sparks.logController
   */
  sparks.LogController = function(){
    this.currentLog = null;
  };

  sparks.LogController.prototype = {

    startNewSession: function() {
      this.currentLog = new sparks.Log(new Date().valueOf());
    },

    endSession: function() {
      this.currentLog.endTime = new Date().valueOf();
    },

    addEvent: function (name, value) {
      var evt = new sparks.LogEvent(name, value, new Date().valueOf());
      this.currentLog.events.push(evt);
    },

    numEvents: function(log, name) {
      var count = 0;
      $.each(log.events, function(i, evt){
        if (evt.name == name){
          count ++;
        }
      });
      return count;
    },

    numUniqueMeasurements: function(log, type) {
      var count = 0;
      var positions = [];
      $.each(log.events, function(i, evt){
        if (evt.name == sparks.LogEvent.DMM_MEASUREMENT){
          if (evt.value.measurement == type) {
            var position = evt.value.red_probe + "" + evt.value.black_probe;
            if (sparks.util.contains(positions, position) === -1) {
              count++;
              positions.push(position);
            }
          }
        }
      });
      return count;
    },

    numConnectionChanges: function(log, type) {
      var count = 0;
      $.each(log.events, function(i, evt){
        if (evt.name == sparks.LogEvent.CHANGED_CIRCUIT && evt.value.type == type){
          count ++;
        }
      });
      return count;
    }

  };

  sparks.logController = new sparks.LogController();
})();
/*globals console sparks $ breadModel getBreadBoard */

(function() {

  /*
   * Sparks Activity Controller can be accessed by the
   * singleton variable sparks.sectionController
   */
  sparks.SectionController = function(){
    this.currentPage = null;
    this.currentPageIndex = -1;
    this.pageIndexMap = {};

    this.jsonSection = null;
    this.id = -1;
  };

  sparks.SectionController.prototype = {

    reset: function(){
      sparks.pageController.reset();
      sparks.questionController.reset();
    },

    createSection: function(jsonSection) {
      var section = new sparks.Section();

      section.id = jsonSection._id || this.nextId();
      section.title = jsonSection.title;

      section.section_url = sparks.activity_base_url + section.id;
      section.images_url = sparks.activity_images_base_url + section.id;

      section.image = jsonSection.image;

      section.circuit = jsonSection.circuit;
      if (section.circuit) section.circuit.referenceFrequency = jsonSection.referenceFrequency;
      section.faults = jsonSection.faults;

      section.hide_circuit = !!jsonSection.hide_circuit;
      section.show_multimeter = !(!(jsonSection.show_multimeter) || jsonSection.show_multimeter === "false");     // may be a string
      section.show_oscilloscope = !(!(jsonSection.show_oscilloscope) || jsonSection.show_oscilloscope === "false");
      section.allow_move_yellow_probe = !(!(jsonSection.allow_move_yellow_probe) || jsonSection.allow_move_yellow_probe === "false");
      section.disable_multimeter_position = jsonSection.disable_multimeter_position;

      if (!section.hide_circuit && section.show_multimeter) {
        section.meter.dmm = new sparks.circuit.Multimeter2();
        if(section.disable_multimeter_position){
          section.meter.dmm.set_disable_multimeter_position(section.disable_multimeter_position);
        }
      } else {
        section.meter.dmm = null;
      }

      if (!section.hide_circuit && section.show_oscilloscope) {
        section.meter.oscope = new sparks.circuit.Oscilloscope();
      } else {
        section.meter.oscope = null;
      }

      section.jsonSection = jsonSection;

      if (!!jsonSection.pages){
        $.each(jsonSection.pages, function(id, jsonPage){
          var page = new sparks.Page(id);
          section.pages.push(page);
        });
      }

      section.view = new sparks.SectionView(section);

      return section;
    },

    loadCurrentSection: function() {
      var section = sparks.activityController.currentSection;
      section.visited = true;
      sparks.vars = {};          // used for storing authored script variables

      breadModel("clear");

      if (!!section.circuit){
        breadModel("createCircuit", section.circuit);
      }

      if (!!section.faults){
        breadModel("addFaults", section.faults);
      }

      section.pages = [];
      sparks.questionController.reset();

      var jsonSection = section.jsonSection;
      var self = this;
      if (!!jsonSection.pages){
        $.each(jsonSection.pages, function(i, jsonPage){
          var page = sparks.pageController.createPage(i, jsonPage);
          section.pages.push(page);
          self.pageIndexMap[page] = i;
        });

        if (this.currentPageIndex == -1){
          this.currentPageIndex = 0;
        }
        this.currentPage = section.pages[this.currentPageIndex];
      }

      sparks.logController.startNewSession();
      sparks.reportController.startNewSection(section);

      sparks.GAHelper.userStartedLevel(section.title);
    },

    areMorePage: function() {
      var nextPage;
      var section = sparks.activityController.currentSection;
      if (this.currentPageIndex < section.pages.length - 1){
        return section.pages[this.currentPageIndex+1];
      } else {
        return false;
      }
    },

    nextPage: function() {
      sparks.reportController.saveData();

      var nextPage = this.areMorePage();
      if (!nextPage){
        return;
      }
      this.currentPageIndex = this.currentPageIndex+1;
      this.currentPage = nextPage;

      sparks.activity.view.layoutPage();

      sparks.logController.startNewSession();
    },

    repeatPage: function(page) {
      var section = sparks.activityController.currentSection;
      sparks.GAHelper.userRepeatedLevel(section.title);
      sparks.reportController.saveData();

      if (!!page){
        this.currentPage = page;
        this.currentPageIndex = this.pageIndexMap[page];
      }

      this.loadCurrentSection();
      sparks.activity.view.layoutCurrentSection();

    },

    repeatSection: function(section) {
      sparks.GAHelper.userRepeatedLevel(section.title);
      if (!!section){
        sparks.activityController.currentSection = section;
      }
      this.repeatPage(sparks.activityController.currentSection.pages[0]);
    },

    viewSectionReport: function() {
      sparks.reportController.saveData();

      var $report = sparks.report.view.getActivityReportView();
      this.currentPage.view.showReport($report, true);
    },

    nextId: function() {
      this.id = this.id + 1;
      return this.id;
    },

    setDMMVisibility: function(visible) {
      var section = sparks.activityController.currentSection;
      if (visible) {
        section.meter.dmm = new sparks.circuit.Multimeter2();
        if(section.disable_multimeter_position){
          section.meter.dmm.set_disable_multimeter_position(section.disable_multimeter_position);
        }
      } else {
        section.meter.dmm = null;
      }
      sparks.activity.view.showDMM(visible);
    },

    setOScopeVisibility: function(visible) {
      var section = sparks.activityController.currentSection;
      if (visible) {
        section.meter.oscope = new sparks.circuit.Oscilloscope();
      } else {
        section.meter.oscope = null;
      }
      sparks.activity.view.showOScope(visible);
    }

  };

  sparks.sectionController = new sparks.SectionController();
})();
/*globals console sparks $ breadModel getBreadBoard */

(function() {

  /*
   * Sparks Activity Controller can be accessed by the
   * singleton variable sparks.activityController
   */
  sparks.ActivityController = function(){
    sparks.activity = new sparks.Activity();

    this.currentSection = null;
    this.currentSectionIndex = 0;
    this.sectionMap = {};
  };

  sparks.ActivityController.prototype = {

    createActivity: function(activity, callback) {
      sparks.activity.id = activity._id;
      var self = this;
      var totalCreated = 0;
      $.each(activity.sections, function(i, jsonSection){
        if (!!jsonSection.pages){
          self.addSection(jsonSection, i);
          totalCreated++;
          if (totalCreated == activity.sections.length){
            callback();
          }
        } else {
          sparks.couchDS.loadActivity(jsonSection, function(jsonSection) {
            self.addSection(jsonSection, i);
            totalCreated++;
            if (totalCreated == activity.sections.length){
              callback();
            }
          });
        }
      });
    },

    addSection: function (jsonSection, index) {

      if (!sparks.activity.id){
        sparks.activity.id = jsonSection._id;
      }

      var section = sparks.sectionController.createSection(jsonSection);

      if (index !== undefined){
        sparks.activity.sections[index] = section;
      } else {
        sparks.activity.sections.push(section);
      }
      this.sectionMap[section.id] = section;

      return section;

    },

    setCurrentSection: function(i) {
      this.currentSection = sparks.activity.sections[i];
      this.currentSectionIndex = i;
    },

    areMoreSections: function () {
      return !(this.currentSectionIndex >= sparks.activity.sections.length -1);
    },

    nextSection: function () {
      if (this.currentSectionIndex > sparks.activity.sections.length -1) {
        return;
      }
      this.setCurrentSection(this.currentSectionIndex + 1);
      sparks.sectionController.currentPageIndex = 0;
      sparks.sectionController.loadCurrentSection();
      sparks.activity.view.layoutCurrentSection();
    },

    findSection: function(id){
      return this.sectionMap[id];
    },

    reset: function () {
      sparks.activity.sections = [];

      sparks.sectionController.currentPage = null;
      sparks.sectionController.currentPageIndex = -1;
      sparks.sectionController.pageIndexMap = {};
    }


  };

  sparks.activityController = new sparks.ActivityController();
})();
/*globals console sparks $ breadModel getBreadBoard window */

(function() {

  /*
   * Sparks Report Controller can be accessed by the
   * singleton variable sparks.reportController
   *
   * There is only one singlton sparks.report object. This
   * controller creates it when the controller is created.
   */
  sparks.ReportController = function(){
    sparks.report = new sparks.Report();
    sparks.report.view = new sparks.ReportView();
    this.currentSectionReport = null;
  };

  sparks.ReportController.prototype = {

    startNewSection: function(section) {
      if (!!sparks.report.sectionReports[section]){
        this.currentSectionReport = sparks.report.sectionReports[section];
        return;
      }
      this.currentSectionReport = new sparks.SectionReport();
      this.currentSectionReport.sectionId = section.id;
      this.currentSectionReport.sectionTitle = section.title;
      sparks.report.sectionReports[section] = this.currentSectionReport;
    },

    addNewSessionReport: function(page){
      var sessionReport = new sparks.SessionReport();

      var jsonQuestions = [];
      var score = 0;
      var maxScore = 0;
      $.each(page.questions, function(i, question){

        sparks.questionController.gradeQuestion(question);

        score += question.points_earned;
        maxScore += question.points;

        jsonQuestions.push(question.toJSON());
      });
      sessionReport.questions = jsonQuestions;

      if (sparks.logController.currentLog.endTime < 0){
        sparks.logController.endSession();
      }
      sessionReport.log = sparks.logController.currentLog;
      sessionReport.timeTaken = (sessionReport.log.endTime - sessionReport.log.startTime) / 1000;
      if (!!page.time){
        var t = page.time;

        sessionReport.timeScore = 0;
        sessionReport.maxTimeScore = t.points;

        if (score >= maxScore * 0.7){
          var m = t.points / (t.best - t.worst);
          var k = 0-m * t.worst;
          var timeScore = (m * sessionReport.timeTaken) + k;
          timeScore = timeScore > t.points ? t.points : timeScore;
          timeScore = timeScore < 0 ? 0 : timeScore;
          timeScore = Math.floor(timeScore);

          sessionReport.timeScore = timeScore;
        }
        sessionReport.bestTime = t.best;

        score += sessionReport.timeScore;
        maxScore += sessionReport.maxTimeScore;
      }

      sessionReport.score = score;
      sessionReport.maxScore = maxScore;
      this._addSessionReport(page, sessionReport);
      return sessionReport;
    },

    _addSessionReport: function(page, sessionReport) {
      if (!this.currentSectionReport.pageReports[page]){
        var pageReport = new sparks.PageReport();
        this.currentSectionReport.pageReports[page] = pageReport;
        this.currentSectionReport.pageReports[page].sessionReports = [];
      }
      this.currentSectionReport.pageReports[page].sessionReports.push(sessionReport);
    },

    getTotalScoreForPage: function(page, section) {
      var sectionReport;
      if (!!section){
        sectionReport = sparks.report.sectionReports[section];
      } else {
        sectionReport = this.currentSectionReport;
      }
      if (!sectionReport || !sectionReport.pageReports[page]){
        console.log("ERROR: No session reports for page");
        return 0;
      }
      return this.getTotalScoreForPageReport(sectionReport.pageReports[page]);
    },

    getTotalScoreForPageReport: function(pageReport) {
      var sessionReports = pageReport.sessionReports;
      var totalScore = 0;
      for (var i in sessionReports) {
        var report = sessionReports[i];
        totalScore += report.score;
      }
      return totalScore;
    },

    getSummaryForSectionReport: function(sectionReport) {
      var lastThree = this.getLastThreeScoreForSectionReport(sectionReport),
          lastThreePerc = lastThree[0],
          totalRuns = lastThree[1],
          totalScore = this.getTotalScoreForSectionReport(sectionReport);
      return [lastThreePerc, totalScore, totalRuns];
    },

    getTotalScoreForSection: function(section) {
      var totalScore = 0;
      var self = this;
      $.each(section.pages, function(i, page){
        totalScore += self.getTotalScoreForPage(page, section);
      });
      return totalScore;
    },

    getTotalScoreForSectionReport: function(sectionReport) {
      var totalScore = 0;
      var self = this;
      $.each(sectionReport.pageReports, function(i, pageReport){
        totalScore += self.getTotalScoreForPageReport(pageReport);
      });
      return totalScore;
    },

    getLastThreeScoreForSection: function(section) {
      var totalScore = 0;
      var maxScore = 0;
      var timesRun = 0;
      var self = this;
      $.each(section.pages, function(i, page){
        var scores = self.getLastThreeScoreForPage(page, section);
        totalScore += scores[0];
        maxScore += scores[1];
        timesRun = Math.max(timesRun, scores[2]);
      });

      return [totalScore / maxScore, timesRun];
    },

    getLastThreeScoreForSectionReport: function(sectionReport) {
      var totalScore = 0;
      var maxScore = 0;
      var timesRun = 0;
      var self = this;
      $.each(sectionReport.pageReports, function(i, pageReport){
        var scores = self.getLastThreeScoreForPageReport(pageReport);
        totalScore += scores[0];
        maxScore += scores[1];
        timesRun = Math.max(timesRun, scores[2]);
      });

      return [totalScore / maxScore, timesRun];
    },

    getLastThreeScoreForPage: function(page, section) {
      var sectionReport;
      if (!!section){
        sectionReport = sparks.report.sectionReports[section];
      } else {
        sectionReport = this.currentSectionReport;
      }
      if (!sectionReport || !sectionReport.pageReports[page]){
        console.log("ERROR: No session reports for page");
        return 0;
      }
      return this.getLastThreeScoreForPageReport(sectionReport.pageReports[page]);
    },

    getLastThreeScoreForPageReport: function(pageReport) {
      var sessionReports = pageReport.sessionReports;
      var totalScore = 0;
      var maxScore = 0;
      for (var i = sessionReports.length-1; i >= (sessionReports.length - 3) && i > -1; i--){
        var report = sessionReports[i];
        totalScore += report.score;
        maxScore += report.maxScore;
      }
      numRuns = Math.min(sessionReports.length, 3);
      return [totalScore,maxScore, numRuns];
    },

    getLastSessionReport: function(page) {
      if (!this.currentSectionReport.pageReports[page]){
        console.log("ERROR: No session reports for page");
        return;
      }

      var sessionReports = this.currentSectionReport.pageReports[page].sessionReports;
      return sessionReports[sessionReports.length - 1];
    },

    getBestSessionReport: function(page) {
      if (!this.currentSectionReport.pageReports[page]){
        console.log("ERROR: No session reports for page");
        return;
      }
      var sessionReports = this.currentSectionReport.pageReports[page].sessionReports;
      var bestSessionReport = null;
      var topScore = -1;
      for (var i in sessionReports) {
        var report = sessionReports[i];
        if (report.score >= topScore){       // >= because we want to get *last* top score
          topScore = report.score;
          bestSessionReport = report;
        }
      }
      return bestSessionReport;
    },

    getSessionScoresAsPercentages: function(sectionReport) {
      var scores = [];
      var sessionReports = this._sortSessionsByTime({sectionReports: [sectionReport]});
      for (var i = 0, ii = sessionReports.length; i < ii; i++){
        var sessionReport = sessionReports[i];
        scores[i] = (sessionReport.score / sessionReport.maxScore) * 100;
      }
      return scores;
    },

    getCategories: function(report) {
      var categories = {};
      var self = this;
      var sessions = this._sortSessionsByTime(report);

      $.each(sessions, function(k, sessionReport){
        $.each(sessionReport.questions, function(l, question){
          if (!!question.category){
            var category = question.category;
            if (!categories[category.categoryTitle]){
              categories[category.categoryTitle] = [0,0,0,category.tutorial,[]];
            }
            var right = categories[category.categoryTitle][0];
            var total = categories[category.categoryTitle][1];
            categories[category.categoryTitle][0] = question.answerIsCorrect ? right + 1 : right;
            categories[category.categoryTitle][1] = total + 1;

            categories[category.categoryTitle][4].push( question.answerIsCorrect ? 1 : 0 );
            if (categories[category.categoryTitle][4].length > 3) {
              categories[category.categoryTitle][4].shift();
            }
            categories[category.categoryTitle][2] = 0;
            $.each(categories[category.categoryTitle][4], function(m, val){
              categories[category.categoryTitle][2] += val;
            });
          }
        });
      });

      return categories;
    },

    _sortSessionsByTime: function(report) {
      var sessions = [];
      var length = 0;

      $.each(report.sectionReports, function(i, sectionReport){
        if (!!sectionReport){
          $.each(sectionReport.pageReports, function(j, pageReport){
            $.each(pageReport.sessionReports, function(k, sessionReport){
              if (length === 0) {
                sessions.push(sessionReport);
              } else {
                var time = sessionReport.log.startTime;
                var inserted = false;
                for (var x = 0; x < length; x++){
                  if (time < sessions[x].log.startTime) {
                    sessions.splice(x, 0, sessionReport);
                    inserted = true;
                    break;
                  }
                }
                if (!inserted){
                  sessions.push(sessionReport);
                }
              }
              length++;
            });
          });
        }
      });

      return sessions;
    },

    saveData: function() {
      if (!!sparks.activity.id && !!sparks.couchDS.user){
        console.log("Saving data");
        var score = 0;
        var self = this;
        $.each(sparks.activity.sections, function(i, section){
          score += self.getTotalScoreForSection(section);
        });
        sparks.report.score = score;

        var data = sparks.report.toJSON();
        sparks.couchDS.save(data);
      }
    },

    loadReport: function(jsonReport) {
      sparks.report.score = jsonReport.score;
      $.each(jsonReport.sectionReports, function(i, jsonSectionReport){
        var sectionReport = new sparks.SectionReport();
        var section = sparks.activityController.findSection(jsonSectionReport.sectionId);
        sparks.report.sectionReports[section] = sectionReport;
        sectionReport.sectionId = jsonSectionReport.sectionId;
        sectionReport.sectionTitle = jsonSectionReport.sectionTitle;
        $.each(jsonSectionReport.pageReports, function(j, jsonPageReport){
          var pageReport = new sparks.PageReport();
          var page = section.pages[j];
          sectionReport.pageReports[page] = pageReport;
          $.each(jsonPageReport.sessionReports, function(k, jsonSessionReport){
            var sessionReport = new sparks.SessionReport();
            $.each(jsonSessionReport, function(key, val){
              sessionReport[key] = val;
            });
            if (sessionReport.timeTaken > 0){
              section.visited = true;
            }
            pageReport.sessionReports.push(sessionReport);
          });
        });
      });
    },

    showReport: function(studentName) {
      var ds = new sparks.CouchDS("/couchdb:");
      ds.loadStudentData(studentName);
    },

    fixData: function(jsonReport, callback) {
      if (jsonReport.save_time < 1301500000000){      // reports saved before 3/30/2011 (Tidewater run)
        this.addSectionIds(jsonReport, callback);
      }
    },

    addSectionIds: function(jsonReport, callback) {
      var self = this;
      if (!jsonReport.sectionReports || jsonReport.sectionReports.length < 1 || !!jsonReport.sectionReports[0].sectionId){
        callback(jsonReport);
        return;
      }

      var question = jsonReport.sectionReports[0].pageReports[0].sessionReports[0].questions[0];
      var feedback = [];
      $.each(question.options, function(i, option){
        feedback.push(option.feedback);
      });

      var sections = ["series-a-1d", "series-b-1a", "series-c-1", "series-c-2", "series-d-1",
                      "series-d-2", "series-e-1", "series-e-2", "series-f-1"];
      var sectionTitles = ["Understanding a Breadboard", "Understanding Series Resistances", "Calculating Total Circuit R (Series)",
                            "Calculating V and I in Series Circuits", "Measuring to Calculate Total R",
                            "Measuring V and I in Series Circuits", "Measuring Series Circuits", "Measuring Series R's in Circuits",
                            "Troubleshooting a series circuit"];

      sectionAttempt = 0;

      function trySection(sectionNo){
        if (sectionNo > sections.length-1){
          console.log("ERROR fixing report data");
          console.log(jsonReport);
          alert("tried to fix data for "+jsonReport.user.name+"but failed. Check console");
        }
        $.couch.db("sparks").openDoc(sections[sectionNo], { success: function(response) {
          checkSection(response, sectionNo);
          }}
        );
      }

      trySection(sectionAttempt);

      function arraysAreEquivalent(ar1, ar2){
        var equiv = true;
        $.each(ar1, function(i, val){
          if (sparks.util.contains(ar2, val) === -1){
            equiv = false;
          }
        });
        return equiv;
      }

      function checkSection(section, sectionNo){
        var sectionQuestion = section.pages[0].questions[0];
        var sectionFeedback = [];
        $.each(sectionQuestion.options, function(i, option){
          sectionFeedback.push(option.feedback);
        });
        if (arraysAreEquivalent(feedback, sectionFeedback)){
          setSectionNames(sectionNo);
        } else {
          sectionAttempt++;
          trySection(sectionAttempt);
        }
      }

      function setSectionNames(sectionNo){
        $.each(jsonReport.sectionReports, function(i, sectionReport){
          sectionReport.sectionId = sections[sectionNo + i];
          sectionReport.sectionTitle = sectionTitles[sectionNo + i];
        });


        if (!sparks.activity.dataService){
          var tempDs = new sparks.CouchDS("/couchdb:sparks_data");
          tempDs.saveRawData(jsonReport);
        } else {
          sparks.activity.dataService.saveRawData(jsonReport);
        }

        callback(jsonReport);
      }

    }

  };

  sparks.reportController = new sparks.ReportController();
})();
/*globals console sparks $ breadModel getBreadBoard window alert*/

(function() {

  /*
   * Sparks Class Report Controller can be accessed by the
   * singleton variable sparks.classReportController
   *
   * There is only one singlton sparks.classReport object. This
   * controller creates it when the controller is created.
   */
  sparks.ClassReportController = function(){
    this.reports = [];

    this.className = "";
    this.teacherName = "";
  };

  sparks.ClassReportController.prototype = {

    getClassData: function(activityId, learnerIds, classId, callback) {
      var reports = this.reports;
      var self = this;

      if (classId) {
        $.get("http://sparks.portal.concord.org/portal/classes/"+classId, function(data) {
          if (data) {
            var classElem = $(data).find('strong:contains("Class:")'),
                className = classElem ? classElem.text().split(": ")[1] : "",
                teacherElem = $(data).find('li:contains("Teacher")>strong'),
                teacherName = teacherElem ? teacherElem.text().replace(/\n/g, "") : "";
            self.className = className;
            self.teacherName = teacherName;

            if (className && teacherName) {
              $('#title').html(className + " &nbsp; &mdash; &nbsp; " + teacherName);
            }
          }
        });
      }

      var receivedData = function(response){
        if (!!response && !!response.rows && response.rows.length > 0){
          for (var i = 0, ii = response.rows.length; i < ii; i++){
            reports.push(response.rows[i].value);
          }
          callback(reports);
        }
      };

      var fail = function() {
        alert("Failed to load class report");
      };

      sparks.couchDS.loadClassDataWithLearnerIds(activityId, learnerIds, receivedData, fail);
    },

    getLevels: function() {
      if (this.reports.length > 0){
        var reportWithMostSections = 0,
            mostSections = 0;
        for (var i = 0, ii = this.reports.length; i < ii; i++){
          var numSections = this.reports[i].sectionReports.length;
          if (numSections > mostSections){
            mostSections = numSections;
            reportWithMostSections = i;
          }
        }
        var sectionReports = this.reports[reportWithMostSections].sectionReports;
        return $.map(sectionReports, function(report, i) {
          return (report.sectionTitle);
        });
      }
      return [];
    }

  };

  sparks.classReportController = new sparks.ClassReportController();
})();
/*globals console sparks $ breadModel getBreadBoard */

(function() {

  /*
   * Sparks Tutorial Controller can be accessed by the
   * singleton variable sparks.tutorialController
   *
   * Unlike most controllers, SparksTutorialController is not an
   * object controller. It merely contains functions for dealing with
   * showing tutorials, logging, and other such stuff.
   */
  sparks.TutorialController = function(){
  };

  sparks.TutorialController.prototype = {

    showTutorial: function(filename) {
      var url = this._getURL(filename);
      this.tutorialWindow = window.open(url,'','menubar=no,height=600,width=800,resizable=yes,toolbar=no,location=no,status=no,scrollbars=yes');
      if (this.tutorialWindow) {
        this.tutorialWindow.moveActionCallback = this.tutorialMoveActionCallback;
      }
      sparks.logController.addEvent(sparks.LogEvent.CLICKED_TUTORIAL, url);
      sparks.GAHelper.userVisitedTutorial(filename);
    },

    tutorialWindow: null,

    setQuestionCategory: function(question) {
      var tutorialFilename = question.top_tutorial;
      if (!!tutorialFilename){
        this.getTutorialTitle(tutorialFilename, function(title){
          question.category = {categoryTitle: title, tutorial: tutorialFilename};
        });
      }
    },

    getTutorialTitle: function(filename, callback) {
      $.get(this._getURL(filename), function(data) {
        var title = filename;
        var $title = $(data).find('#tutorial_title');
        if ($title.length > 0){
          title = $title[0].innerHTML;
        } else {
          $title = $(data).find('h3');
          if ($title.length > 0){
            title = $title[0].innerHTML;
          }
        }
        callback(title);
      });
    },

    _getURL: function(filename) {
      var url;
      if (filename.indexOf("http:") < 0 && filename.indexOf("/") !== 0){
        if (filename.indexOf("htm") < 0){
          filename += '.html';
        }
        return sparks.tutorial_base_url + filename;
      } else {
        return filename;
      }
    },

    tutorialMoveActionCallback: function() {
      setTimeout(function() {
        var win = sparks.tutorialController.tutorialWindow;
        if (win && win.location) {
          var tutorialName = win.location.pathname.replace("/","");
          sparks.logController.addEvent(sparks.LogEvent.CHANGED_TUTORIAL, tutorialName);
          win.moveActionCallback = sparks.tutorialController.tutorialMoveActionCallback
          sparks.GAHelper.userVisitedTutorial(tutorialName);
        }
      }, 1000);
    }


  };

  sparks.tutorialController = new sparks.TutorialController();
})();
/*globals console sparks $ breadModel getBreadBoard */

(function() {
  sparks.ActivityConstructor = function(jsonActivity){

    sparks.activity.view = new sparks.ActivityView();

    if (!jsonActivity.type || jsonActivity.type !== "activity"){
      var jsonSection = jsonActivity;
      var section = sparks.activityController.addSection(jsonSection);
      this.loadFirstSection();
    } else {
      sparks.activityController.createActivity(jsonActivity, this.loadFirstSection);
    }

    sparks.activityConstructor = this;

  };

  sparks.ActivityConstructor.prototype = {
    loadFirstSection: function() {
      if (!!sparks.activity.id && sparks.couchDS.user){
        $('#loading-text').text('Loading previous work');
        sparks.couchDS.loadStudentData(sparks.activity.id, sparks.couchDS.user.name,
          function(response){
            var jsonReport = response.rows[response.rows.length-1].value;
            sparks.reportController.loadReport(jsonReport);
            var lastSectionId;
            $.each(sparks.activity.sections, function(i, section){
              if (!!sparks.report.sectionReports[section]){
                lastSectionId = i;
              }
            });
            sparks.activityController.setCurrentSection(lastSectionId);
            sparks.sectionController.loadCurrentSection();
            sparks.activity.view.layoutCurrentSection();
            sparks.sectionController.viewSectionReport();
          },
          function(){
            sparks.activityController.setCurrentSection(0);
            sparks.sectionController.loadCurrentSection();
            sparks.activity.view.layoutCurrentSection();
          }
        );
      } else {
        sparks.activityController.setCurrentSection(0);
        sparks.sectionController.loadCurrentSection();
        sparks.activity.view.layoutCurrentSection();
      }
    }

  };
})();
(function () {

    this.sparks.mathParser = {};

    var p = sparks.mathParser;

    p.calculateMeasurement = function(sum){
      if (sum === undefined || sum === null || sum === ""){
        return "";
      }
      if (!isNaN(Number(sum))){
        return sum;
      }

      answer = ""+sum;

      var sumPattern = /\[[^\]]+\]/g  // find anything between [ ]
      var matches= answer.match(sumPattern);
      if (!!matches){
        $.each(matches, function(i, match){
          var expression = match;
          var result = p.calculateSum(expression.substring(1, expression.length-1));
          answer = answer.replace(match,result);
        });
      }


      answer = sparks.unit.convertMeasurement(answer);   // convert 1000 V to 1 kiloV, for instance

      answer = p.standardizeUnits(answer);

      return answer;
    };

    p.standardizeUnits = function(string) {
      string = string.replace(/ohms/gi,"&#x2126;");
      string = string.replace("micro","&#x00b5;");
      string = string.replace("milli","m");
      string = string.replace("kilo","k");
      string = string.replace("mega","M");
      return string;
    };


    /*
      When passed a string such as "100 + r1.resistance / r2.nominalResistance"
      this will first assign variables for components r1 & r2, assuming
      the components and their properties exist in the circuit, and then perform the
      calculation.
    */
   p.calculateSum = function(sum){
      sum = p.replaceCircuitVariables(sum);

      var calculatedSum = eval(sum);

      return calculatedSum;
   };


    p.replaceCircuitVariables = function(formula){

      $.each(getBreadBoard().components, function(i, component){
        formula = "var " + i + " = getBreadBoard().components['"+i+"']; " + formula;
      });

      formula = "var breadboard = getBreadBoard(); " + formula;

      var varPattern = /\${[^}]+}/g  //  ${ X } --> value of X
      var matches = formula.match(varPattern);
      if(!!matches){
       $.each(matches, function(i, match){
        console.log("WARN: It is not necessary to use the notation '"+match+"', you can simply use "+match.substring(2,match.length-1))
        var variable = match.substring(2,match.length-1).split('.');
        var component = variable[0];
        var property = variable[1];

        var components = getBreadBoard().components;

        if (!components[component]){
          console.log("ERROR calculating sum: No component name '"+component+"' in circuit");
          formula = '-1';
          return;
        }

        if (components[component][property] === undefined || components[component][property] === null){
          console.log("ERROR calculating sum: No property name '"+property+"' in component '"+component+"'");
          formula = '-1';
          return;
        }

        var value = components[component][property];
        formula = formula.replace(match, value);
       });
      }

      return formula;
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


    String.prototype.capFirst = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }


})();
/* FILE ui.js */

(function () {

    this.sparks.ui = {};

    sparks.ui.alert = function (title, msg) {
        var div = $('<div>' + msg + '</div>').attr('title', title);
        var okButton = $('<button>OK</button>)').button().addClass('dialog_button');
        okButton.click(function (event) {
            div.dialog('close');
        });
        div.append($('<p />')).append(okButton);
        div.dialog({ dialogClass: 'alert', modal: true });
    };

})();
/* FILE flash_comm.js */

/*globals console sparks $ document window alert navigator*/

(function () {

    sparks.flash = {};

    sparks.flash.loaded = false;

    sparks.flash.queuedMessages = [];

    sparks.flash.init = function() {
      sparks.flash.loaded = true;
      var length = sparks.flash.queuedMessages.length;
      for (var i = 0; i < length; i++){
        sparks.flash.sendCommand.apply(this, sparks.flash.queuedMessages.pop());
      }
    };

    sparks.flash.getFlashMovie = function (movieName) {
      var isIE = navigator.appName.indexOf("Microsoft") != -1;
      return (isIE) ? window[movieName] : document[movieName];
    };

    sparks.flash.sendCommand = function () {
      if (!sparks.flash.loaded){
        sparks.flash.queuedMessages.push(arguments);
        return;
      }

      try {
        var params = [];
        for (var i = 0; i < arguments.length; ++i) {
          params[i] = arguments[i];
        }
        var flash = sparks.flash.getFlashMovie(sparks.config.flash_id);

        var retVal = flash.sendMessageToFlash.apply(flash, params).split('|');
        if (retVal[0] == 'flash_error') {
          alert('Flash error:\n' + retVal[1]);
        }
      }
      catch (e) {
        alert('Error sending command to Flash:\n' + e.toString());
      }
    };

    this.receiveEvent = function (name, value, time) {
      console.log('Received: ' + name + ', ' + value + ', ' + new Date(parseInt(time, 10)));

      var v;
      var t = '';
      var args = value.split('|');

      var section = sparks.activityController.currentSection;

      if (name === 'connect') {
          if (args[0] === 'probe') {
            section.meter.setProbeLocation(args[1], args[2]);
          }
          if (args[0] === 'component') {
              if (args[2] === "left_positive21" || args[2] === "left_negative21") {
                args[2] = args[2].replace("2", "");
              }
              if (!!args[2]){
                breadModel('unmapHole', args[2]);
              }
              sparks.logController.addEvent(sparks.LogEvent.CHANGED_CIRCUIT, {
                "type": "connect lead",
                "location": args[2]});
              section.meter.update();
          }
      } else if (name === 'disconnect') {
          if (args[0] === 'probe') {
            section.meter.setProbeLocation(args[1], null);
          } else if (args[0] === 'component') {
            var hole = args[2];
            if (hole === "left_positive21" || hole === "left_negative21") {
              hole = hole.replace("2", "");
            }
            var newHole = breadModel('getGhostHole', hole+"ghost");

            breadModel('mapHole', hole, newHole.nodeName());
            sparks.logController.addEvent(sparks.LogEvent.CHANGED_CIRCUIT, {
              "type": "disconnect lead",
              "location": hole});
            section.meter.update();
          }
      } else if (name === 'probe') {
          $('#popup').dialog();

          v = breadModel('query', 'voltage', 'a23,a17');
          t += v.toFixed(3);
          v = breadModel('query', 'voltage', 'b17,b11');
          t += ' ' + v.toFixed(3);
          v = breadModel('query', 'voltage', 'c11,c5');
          t += ' ' + v.toFixed(3);
          $('#dbg_voltage').text(t);

          breadModel('move', 'wire1', 'left_positive1,a22');

          v = breadModel('query', 'resistance', 'a23,a17');
          t = v.toFixed(3);
          v = breadModel('query', 'resistance', 'b17,b11');
          t += ' ' + v.toFixed(3);
          v = breadModel('query', 'resistance', 'c11,c5');
          t += ' ' + v.toFixed(3);

          $('#dbg_resistance').text(t);

          v = breadModel('query', 'current', 'a22,a23');
          t = v.toFixed(3);

          breadModel('move', 'wire1', 'left_positive1,a23');
          breadModel('move', 'resistor1', 'a23,a16');
          v = breadModel('query', 'current', 'a16,b17');
          t += ' ' + v.toFixed(3);

          breadModel('move', 'resistor1', 'a23,a17');
          breadModel('move', 'resistor2', 'b17,b10');
          v = breadModel('query', 'current', 'b10,c11');
          t += ' ' + v.toFixed(3);

          breadModel('move', 'resistor2', 'b17,b11');

          $('#dbg_current').text(t);

          $('#popup').dialog('close');
      } else if (name == 'multimeter_dial') {
          section.meter.dmm.dialPosition = value;
          section.meter.update();
      } else if (name == 'multimeter_power') {
          section.meter.dmm.powerOn = value == 'true' ? true : false;
          section.meter.update();
      } else if (name == 'value_changed') {
        var component = getBreadBoard().components[args[0]];
        if (component.scaleResistance) {
          component.scaleResistance(args[1]);
          section.meter.update();
        }
      }
  }

})();
/* FILE complex_number.js */
/*globals sparks */

(function () {

    sparks.ComplexNumber = function (real, imag) {
      this.real      = real || 0;
      this.imag      = imag || 0;
      this.magnitude = Math.sqrt(this.real*this.real + this.imag*this.imag);
      this.angle     = Math.atan2(this.imag, this.real); // Math.atan2(y, x) -> angle to the point at (x,y) [yes, y comes first!]
    };

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
/* FILE qucsator.js */
/*globals console sparks $ breadModel getBreadBoard debug*/

(function () {

  this.sparks.circuit.qucsator = {};
  var q = sparks.circuit.qucsator;

  var inGroupsOf = function (ary, n) {
    var grouped = [];
    for(var i in ary) {
      if (!grouped[Math.floor(i / 3)]) { grouped[Math.floor(i / 3)] = []; }
      grouped[Math.floor(i / 3)][i % 3] = ary[i];
    }
    return grouped;
  };

  q.previousMeasurements = {};

  q.qucsate = function (netlist, callback, type) {

    var key = netlist.replace(/\n/g, '') + type,
        previousMeasurement = this.previousMeasurements[key];
    if (!!previousMeasurement) {
      callback(previousMeasurement);
      return;
    }

    type = type || 'qucs';
    var data = {};
    data[type || 'qucs'] = netlist;
    var async = (sparks.async === false) ? false : true;
    $.ajax({
        async: async,
        url: sparks.config.qucsate_server_url,
        data: data,
        success: function(ret) {
          var results = q.parse(ret);
          q.previousMeasurements[key] = results;
          callback(results);
        },
        error: function (request, status, error) {
          debug('ERROR: url=' + sparks.config.qucsate_server_url + '\nstatus=' + status + '\nerror=' + error);
        }
    });
  };

  q.parse = function(data) {
    var results = {};

    if ( data.result ) {
      data = data.result;
    }

    data = data.split("\n");


    var currentArray = null;
    for (var i = 0, ii = data.length; i < ii; i++) {
      var line = data[i],
          key,
          dataHeading = /<i?n?dep (.+) /.exec(line);

      if (dataHeading && dataHeading.length) {
        key = dataHeading[1];

        if (key.indexOf('.') > 0) {
          var splitKey = key.split('.');
          if (!results[splitKey[0]]) {
            results[splitKey[0]] = [];
          }
          splitKey[1] = splitKey[1].toLowerCase();      // qucs returns diff cases if in AC or DC mode. We don't want that
          currentArray = results[splitKey[0]][splitKey[1]] = [];
        } else {
          currentArray = results[key] = [];
        }

      } else if (!!currentArray) {
        var val = sparks.ComplexNumber.parse(line);     // Sparks values are always CNs -- in a DC circuit, the i is just ommitted
        if (!!val) {
          currentArray.push(val);
        }
      }
    }


    return results;
  };

  q.makeNetlist = function(board) {
    var components = board.components,
        netlist = '# QUCS Netlist\n';

    $.each(components, function(name, component) {
      var line;

      if ( !component.canInsertIntoNetlist() ) {
        return;
      }

      if ( !component.hasValidConnections() ) {
        throw new Error("Component " + name + " has invalid connections and cannot be inserted into the netlist");
      }

      if ( component.toNetlist ) {
        line = component.toNetlist();
      } else {

        var nodes = component.getNodes();

        switch (component.kind) {
          case "vprobe":
            line = 'VProbe:' + component.UID + ' ';
            line = line + nodes.join(' ');
            break;
          case "iprobe":
            line = 'IProbe:' + component.UID + ' ';
            line = line + nodes.join(' ');
            break;
        }
      }

      netlist += "\n" + line;
    });

    if (components.source && components.source.getQucsSimulationType) {
      netlist += "\n" + components.source.getQucsSimulationType();
    } else {
      netlist += "\n" + sparks.circuit.Battery.prototype.getQucsSimulationType();
    }

    return netlist;
  };

  q.ppNetlist = function (s) {
      return s.replace('\\u000a', '\n');
  };

})();
/* FILE resistor.js */
/* FILE resistor.js */
/*globals console sparks */

(function () {

    sparks.circuit.Component = function (props, breadBoard) {

      for (var i in props) {
        this[i]=props[i];
      }

      this.breadBoard = breadBoard;
      this.breadBoard.components[props.UID] = this;

      if (!this.label){
        this.label = !!this.UID.split("/")[1] ? this.UID.split("/")[1] : "";
      }

      if (typeof this.connections === "string") {
        this.connections = this.connections.replace(/ /g,'').split(",");
      }

      for (i in this.connections) {
        this.connections[i] = this.breadBoard.getHole(this.connections[i]);

        if (!!this.breadBoard.holes[this.connections[i]]) {
          this.breadBoard.holes[this.connections[i]].connections[this.breadBoard.holes[this.connections[i]].connections.length] = this;
        }
      }
      this._ensureInt("resistance");
      this._ensureInt("nominalResistance");
      this._ensureInt("voltage");
    };

    sparks.circuit.Component.prototype =
    {
    	move: function (connections) {
        var i;
        for (i in this.connections) {
          for (var j in this.connections[i].connections) {
            if (this.connections[i].connections[j] === this) {
              this.connections[i].connections = [];
            }
          }
          this.connections[i] = [];
        }
        this.connections = [];
        for (i in connections){
          this.connections[i] = this.breadBoard.holes[connections[i]];
          this.breadBoard.holes[connections[i]].connections[this.breadBoard.holes[connections[i]].connections.length] = this;
        }
      },

      destroy: function (){
        for(var i in this.connections){
          for( var j in this.connections[i].connections ){
            if( this.connections[i].connections[j] === this ){
              this.connections[i].connections = [];
            }
          }
          this.connections[i] = [];
        }
        this.connections = [];
        delete this.breadBoard.components[this.UID];
      },

      _ensureInt: function (val) {
        if (this[val] && typeof this[val] === "string") {
          this[val] = parseInt(this[val], 10);
        }
      },

      getNodes: function () {
        return $.map(this.connections, function (connection) {
          return connection.nodeName();
        });
      },

      getLocation: function () {
        return this.connections[0].getName() + "," + this.connections[1].getName();
      },

      canInsertIntoNetlist: function () {
        return true;
      },

      /**
        hasValidConnections: check that this component has connections that are valid for generating a QUCS netlist.

        The only check performed right now is that there be 2 connections, but this validity check could be enhanced
        to check, for example, that the two connections map to different nodes, etc.
      */
      hasValidConnections: function () {
        return this.connections.length === 2 || (this.type === "powerLead" && this.connections.length === 1);
      },

      getRequestedImpedance: function (spec, steps) {
        var min, max, factor, step, choosableSteps, i, len;

        if (typeof spec === 'string' || typeof spec === 'number') {
          return spec;
        }

        if (spec[0] !== 'uniform') {
          throw new Error("Only uniformly-distributed random impedances/resistances are supported right now; received " + spec);
        }
        if (spec.length < 3) throw new Error("Random impedance/resistance spec does not specify an upper and lower bound");
        if (typeof spec[1] !== 'number' || typeof spec[2] !== 'number') throw new Error("Random impedance/resistance spec lower and upper bound were not both numeric");

        min = Math.min(spec[1], spec[2]);
        max = Math.max(spec[1], spec[2]);

        if (steps) {
          steps = steps.slice().sort();

          factor = Math.pow(10, Math.orderOfMagnitude(min) - Math.orderOfMagnitude(steps[0]));
          choosableSteps = [];
          i = 0;
          len = steps.length;
          do {
            step = steps[i++] * factor;
            if (min <= step && step <= max) choosableSteps.push(step);

            if (i >= len) {
              factor *= 10;
              i = 0;
            }
          } while (step < max);

          if (choosableSteps.length > 0) {
            return choosableSteps[ Math.floor(Math.random() * choosableSteps.length) ];
          }
        }

        return min + Math.random() * (max - min);
      },

      addThisToFaults: function() {
        var breadBoard = getBreadBoard();
        if (!~breadBoard.faultyComponents.indexOf(this)) { breadBoard.faultyComponents.push(this); }
      }

    };

})();
/*globals console sparks getBreadBoard */

(function () {

    var flash = sparks.flash;

    sparks.circuit.Resistor = function (props, breadBoard) {
      var tolerance, steps;

      if (typeof props.resistance !== 'undefined') {
        tolerance = props.tolerance || 0.05;
        steps = (tolerance === 0.05) ? sparks.circuit.r_values.r_values4band5pct : sparks.circuit.r_values.r_values4band10pct;
        props.resistance = this.getRequestedImpedance( props.resistance, steps );
      }

      sparks.circuit.Resistor.parentConstructor.call(this, props, breadBoard);

      if ((this.resistance === undefined) && this.colors){
        this.resistance = this.getResistance( this.colors );
      }

      if ((this.resistance === undefined) && !this.colors) {
        var resistor = new sparks.circuit.Resistor4band(name);
        resistor.randomize(null);
        this.resistance = resistor.getRealValue();
        this.tolerance = resistor.tolerance;
        this.colors = resistor.colors;
      }

      if (!this.colors){
        this.colors = this.getColors4Band( this.resistance, (!!this.tolerance ? this.tolerance : 0.05));
      }

      if (!this.nominalResistance){
        this.nominalResistance =  this.getResistance( this.colors );
      }

      this.applyFaults();
    };

    sparks.extend(sparks.circuit.Resistor, sparks.circuit.Component,
    {
    	nominalValueMagnitude: -1,

        colorMap: { '-1': 'gold', '-2': 'silver',
            0 : 'black', 1 : 'brown', 2 : 'red', 3 : 'orange',
            4 : 'yellow', 5 : 'green', 6 : 'blue', 7 : 'violet', 8 : 'grey',
            9 : 'white' },

        toleranceColorMap: { 0.01 : 'brown', 0.02 : 'red', 5e-3 : 'green',
            2.5e-3 : 'blue', 1e-3 : 'violet', 5e-4 : 'gray', 5e-2 : 'gold',
            0.1 : 'silver', 0.2 : 'none' },

        toleranceValues: [ 0.01, 0.02 ],

        init: function (id) {
              this.id = id;
              this.nominalValue = 0.0; //resistance value specified by band colors;
              this.realValue = 0.0; //real resistance value in Ohms
              this.tolerance = 0.0; //tolerance value
              this.colors = []; //colors for each resistor band
        },

        getNumBands: function () {
            return this.numBands;
        },

        getNominalValue: function () {
            return this.nominalValue;
        },

        setNominalValue: function (value) {
            this.nominalValue = value;
        },

        getTolerance: function () {
            return this.tolerance;
        },

        setTolerance: function(value) {
            this.tolerance = value;
        },

        getRealValue: function () {
            return this.realValue;
        },

        setRealValue: function (value) {
            this.realValue = value;
        },

        updateColors: function (resistance, tolerance) {
            this.colors = this.getColors(resistance, tolerance);
        },

        show : function() {
        },

        calcRealValue: function (nominalValue, tolerance) {
            var chance = Math.random();
            if (chance > 0.8) {
                var chance2 = Math.random();
                if (chance2 < 0.5) {
                    return nominalValue + nominalValue * (tolerance + Math.random() * tolerance);
                }
                else {
                    return nominalValue - nominalValue * (tolerance + Math.random() * tolerance);
                }
            }

            var realTolerance = tolerance * 0.9;
            return nominalValue * this.randFloat(1 - realTolerance, 1 + realTolerance);
        },

        randInt: function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        randFloat: function (min, max) {
            return this.randPseudoGaussian(3) * (max - min) + min;
        },

        randPseudoGaussian: function (n) {
            var r = 0.0;
            for (var i = 0; i < n; ++i) {
                r += Math.random();
            }
            return r / n;
        },

        filter: function (in_values) {
            var values = [];
            for (var i = 0; i < in_values.length; ++i) {
                if (in_values[i] >= 10.0 && in_values[i] < 2e6) {
                    values.push(in_values[i]);
                }
            }
            return values;
        },

        getColors4Band: function (ohms, tolerance) {
            var s = ohms.toString();
            var decIx = s.indexOf('.');
            var decLoc = decIx > -1 ? decIx : s.length;
            s = s.replace('.', '');
            var len = s.length;
            for (var i = 0; i < 2 - len; ++i){ s += '0'; }
            var mult = decLoc > 1 ? decLoc - 2 : 10;
            return [ this.colorMap[s.charAt(0)],
                     this.colorMap[s.charAt(1)],
                     this.colorMap[decLoc - 2],
                     this.toleranceColorMap[tolerance]
                   ];
        },

        getColors5Band: function (ohms, tolerance) {
            var s = ohms.toString();
            var decIx = s.indexOf('.');
            var decLoc = decIx > -1 ? decIx : s.length;
            s = s.replace('.', '');
            var len = s.length;
            for (var i = 0; i < 3 - len; ++i) { s += '0'; }
            return [ this.colorMap[s.charAt(0)],
                     this.colorMap[s.charAt(1)],
                     this.colorMap[s.charAt(2)],
                     this.colorMap[decLoc - 3],
                     this.toleranceColorMap[tolerance]
                   ];
        },

        colorToNumber: function (color) {
          for (var n in this.colorMap) {
            if (this.colorMap[n] == color) { return parseInt(n,10); }
          }
          if (color == "gray") {
            return 8;
          }
          return null;
        },

        getResistance: function(colors){
          if (typeof(colors)==="string"){
            colors = colors.split(",");
          }
          var resistance = this.colorToNumber(colors[0]);
          for (var i = 1; i < colors.length - 2; i++) {
            resistance = resistance * 10;
            resistance += this.colorToNumber(colors[i]);
          }
          return resistance * Math.pow(10, this.colorToNumber(colors[i]));
        },

        toNetlist: function () {
          var resistance = this.resistance || 0,
              nodes      = this.getNodes();

          return 'R:' + this.UID + ' ' + nodes.join(' ') + ' R="' + resistance + ' Ohm"';
        },

        getFlashArguments: function() {
          if (this.resistance > 0) {
            return ['resistor', this.UID, this.getLocation(), '4band', this.label, this.colors];
          } else {
            return ['resistor', this.UID, this.getLocation(), 'wire', this.label, null];
          }
        },

        applyFaults: function() {
          if (!!this.open){
            this.resistance = 1e20;
            this.addThisToFaults();
          } else if (!!this.shorted) {
            this.resistance = 1e-6;
            this.addThisToFaults();
          } else {
            this.open = false;
            this.shorted = false;
          }
        }
    });

})();
/* FILE r-values.js */

(function () {


    this.sparks.circuit.r_values = {};

    var rv = sparks.circuit.r_values;

    rv.r_values5band1pct = [
        1.00, 1.02, 1.05, 1.07, 1.10, 1.13, 1.15, 1.18, 1.21, 1.24, 1.27,
        1.30, 1.33, 1.37, 1.40, 1.43, 1.47, 1.50, 1.54, 1.58, 1.62, 1.65, 1.69,
        1.74, 1.78, 1.82, 1.87, 1.91, 1.96,
        2.00, 2.05, 2.10, 2.15, 2.21, 2.26, 2.32, 2.37, 2.43, 2.49, 2.55, 2.61,
        2.67, 2.74, 2.80, 2.87, 2.94,
        3.01, 3.09, 3.16, 3.24, 3.32, 3.40, 3.48, 3.57, 3.65, 3.74, 3.83, 3.92,
        4.02, 4.12, 4.22, 4.32, 4.42, 4.53, 4.64, 4.75, 4.87, 4.99,
        5.11, 5.23, 5.36, 5.49, 5.62, 5.76, 5.90, 6.04, 6.19, 6.34, 6.49, 6.65,
        6.81, 6.98, 7.15, 7.32, 7.50, 7.68, 7.87, 8.06, 8.25, 8.45, 8.66, 8.87,
        9.09, 9.31, 9.53, 9.76, 10.0, 10.2, 10.5, 10.7, 11.0, 11.3, 11.5, 11.8,
        12.1, 12.4, 12.7, 13.0, 13.3, 13.7, 14.0, 14.3, 14.7,
        15.0, 15.4, 15.8, 16.2, 16.5, 16.9, 17.4, 17.8, 18.2, 18.7, 19.1, 19.6,
        20.0, 20.5, 21.0, 21.5, 22.1, 22.6, 23.2, 23.7, 24.3, 24.9, 25.5, 26.1,
        26.7, 27.4, 28.0, 28.7, 29.4, 30.1, 30.9, 31.6, 32.4, 33.2, 34.0, 34.8,
        35.7, 36.5, 37.4, 38.3, 39.2, 40.2, 41.2, 42.2, 43.2, 44.2, 45.3, 46.4,
        47.5, 48.7, 49.9, 51.1, 52.3, 53.6, 54.9, 56.2, 57.6, 59.0,
        60.4, 61.9, 63.4, 64.9, 66.5, 68.1, 69.8, 71.5, 73.2, 75.0, 76.8, 78.7,
        80.6, 82.5, 84.5, 86.6, 88.7, 90.9, 93.1, 95.3, 97.6,
        100, 102, 105, 107, 110, 113, 115, 118, 121, 124,
        127, 130, 133, 137, 140, 143, 147, 150, 154, 158, 162, 165, 169,
        174, 178, 182, 187, 191, 196,
        200, 205, 210, 215, 221, 226, 232, 237, 243, 249, 255, 261, 267, 274,
        280, 287, 294, 301, 309, 316, 324, 332, 340, 348, 357, 365, 374, 383,
        392, 402, 412, 422, 432, 442, 453, 464, 475, 487, 499,
        511, 523, 536, 549, 562,
        576, 590, 604, 619, 634, 649, 665, 681, 698, 715, 732, 750, 768, 787,
        806, 825, 845, 866, 887, 909, 931, 953, 976,
        1000, 1020, 1050, 1070, 1100, 1130, 1150, 1180, 1210, 1240, 1270,
        1300, 1330, 1370, 1400, 1430, 1470, 1500, 1540, 1580, 1620, 1650, 1690,
        1740, 1780, 1820, 1870, 1910, 1960, 2000, 2050, 2100, 2150, 2210, 2260,
        2320, 2370, 2430, 2490, 2550, 2610, 2670, 2740, 2800, 2870, 2940,
        3010, 3090, 3160, 3240, 3320, 3400, 3480, 3570, 3650, 3740, 3830, 3920,
        4020, 4120, 4220, 4320, 4420, 4530, 4640, 4750, 4870, 4990,
        5110, 5230, 5360, 5490, 5620, 5760, 5900,
        6040, 6190, 6340, 6490, 6650, 6810, 6980, 7150, 7320, 7500, 7680, 7870,
        8060, 8250, 8450, 8660, 8870, 9090, 9310, 9530, 9760,
        10000, 10200, 10500, 10700, 11000, 11300, 11500, 11800, 12100, 12400,
        12700, 13000, 13300, 13700, 14000, 14300, 14700, 15000, 15400, 15800,
        16200, 16500, 16900, 17400, 17800, 18200, 18700, 19100, 19600,
        20000, 20500, 21000, 21500, 22100, 22600, 23200, 23700, 24300, 24900,
        25500, 26100, 26700, 27400, 28000, 28700, 29400, 30100, 30900, 31600,
        32400, 33200, 34000, 34800, 35700, 36500, 37400, 38300, 39200,
        40200, 41200, 42200, 43200, 44200, 45300, 46400, 47500, 48700, 49900,
        51100, 52300, 53600, 54900, 56200, 57600, 59000, 60400, 61900, 63400,
        64900, 66500, 68100, 69800, 71500, 73200, 75000, 76800, 78700,
        80600, 82500, 84500, 86600, 88700, 90900, 93100, 95300, 97600,
        100e3, 102e3, 105e3, 107e3, 110e3, 113e3, 115e3, 118e3, 121e3, 124e3,
        127e3, 130e3, 133e3, 137e3, 140e3, 143e3, 147e3, 150e3, 154e3, 158e3,
        162e3, 165e3, 169e3, 174e3, 178e3, 182e3, 187e3, 191e3, 196e3,
        200e3, 205e3, 210e3, 215e3, 221e3, 226e3, 232e3, 237e3, 243e3, 249e3,
        255e3, 261e3, 267e3, 274e3, 280e3, 287e3, 294e3,
        301e3, 309e3, 316e3, 324e3, 332e3, 340e3, 348e3, 357e3, 365e3, 374e3,
        383e3, 392e3,
        402e3, 412e3, 422e3, 432e3, 442e3, 453e3, 464e3, 475e3, 487e3, 499e3,
        511e3, 523e3, 536e3, 549e3, 562e3,
        576e3, 590e3, 604e3, 619e3, 634e3, 649e3, 665e3, 681e3, 698e3,
        715e3, 732e3, 750e3, 768e3, 787e3, 806e3, 825e3, 845e3, 866e3, 887e3,
        909e3, 931e3, 953e3, 976e3,
        1.00e6, 1.02e6, 1.05e6, 1.07e6, 1.10e6, 1.13e6, 1.15e6, 1.18e6,
        1.21e6, 1.24e6, 1.27e6, 1.30e6, 1.33e6, 1.37e6, 1.40e6, 1.43e6, 1.47e6,
        1.50e6, 1.54e6, 1.58e6, 1.62e6, 1.65e6, 1.69e6, 1.74e6, 1.78e6,
        1.82e6, 1.87e6, 1.91e6, 1.96e6,
        2.00e6, 2.05e6, 2.10e6, 2.15e6, 2.21e6, 2.26e6, 2.32e6, 2.37e6,
        2.43e6, 2.49e6, 2.55e6, 2.61e6, 2.67e6, 2.74e6, 2.80e6, 2.87e6, 2.94e6,
        3.01e6, 3.09e6, 3.16e6, 3.24e6, 3.32e6, 3.40e6, 3.48e6, 3.57e6, 3.65e6,
        3.74e6, 3.83e6, 3.92e6,
        4.02e6, 4.12e6, 4.22e6, 4.32e6, 4.42e6, 4.53e6, 4.64e6, 4.75e6, 4.87e6,
        4.99e6, 5.11e6, 5.23e6, 5.36e6, 5.49e6, 5.62e6, 5.76e6, 5.90e6,
        6.04e6, 6.19e6, 6.34e6, 6.49e6, 6.65e6, 6.81e6, 6.98e6,
        7.15e6, 7.32e6, 7.50e6, 7.68e6, 7.87e6, 8.06e6, 8.25e6, 8.45e6, 8.66e6,
        8.87e6, 9.09e6, 9.31e6, 9.53e6, 9.76e6,
        10.0e6, 10.2e6, 10.5e6, 10.7e6, 11.0e6, 11.3e6, 11.5e6, 11.8e6,
        12.1e6, 12.4e6, 12.7e6, 13.0e6, 13.3e6, 13.7e6, 14.0e6, 14.3e6, 14.7e6,
        15.0e6, 15.4e6, 15.8e6, 16.2e6, 16.5e6, 16.9e6, 17.4e6, 17.8e6,
        18.2e6, 18.7e6, 19.1e6, 19.6e6, 20.0e6, 20.5e6, 21.0e6, 21.5e6,
        22.1e6, 22.6e6, 23.2e6, 23.7e6, 24.3e6, 24.9e6, 25.5e6, 26.1e6, 26.7e6,
        27.4e6, 28.0e6, 28.7e6, 29.4e6, 30.1e6, 30.9e6, 31.6e6, 32.4e6, 33.2e6,
        34.0e6, 34.8e6, 35.7e6, 36.5e6, 37.4e6, 38.3e6, 39.2e6,
        40.2e6, 41.2e6, 42.2e6, 43.2e6, 44.2e6, 45.3e6, 46.4e6, 47.5e6, 48.7e6,
        49.9e6, 51.1e6, 52.3e6, 53.6e6, 54.9e6, 56.2e6, 57.6e6, 59.0e6,
        60.4e6, 61.9e6, 63.4e6, 64.9e6, 66.5e6, 68.1e6, 69.8e6, 71.5e6, 73.2e6,
        75.0e6, 76.8e6, 78.7e6, 80.6e6, 82.5e6, 84.5e6, 86.6e6, 88.7e6,
        90.9e6, 93.1e6, 95.3e6, 97.6e6,
        100e6, 102e6, 105e6, 107e6, 110e6, 113e6, 115e6, 118e6, 121e6, 124e6,
        127e6, 130e6, 133e6, 137e6, 140e6, 143e6, 147e6, 150e6, 154e6, 158e6,
        162e6, 165e6, 169e6, 174e6, 178e6, 182e6, 187e6, 191e6, 196e6, 200e6
    ];

    rv.r_values5band2pct = [
        1.00, 1.05, 1.10, 1.15, 1.21, 1.27, 1.33, 1.40,
        1.47, 1.54, 1.62, 1.69, 1.78, 1.87, 1.96,
        2.05, 2.15, 2.26, 2.37, 2.49, 2.61, 2.74, 2.87,
        3.01, 3.16, 3.32, 3.48, 3.65, 3.83, 4.02, 4.22, 4.42, 4.64, 4.87,
        5.11, 5.36, 5.62, 5.90, 6.19, 6.49, 6.81, 7.15, 7.50, 7.87,
        8.25, 8.66, 9.09, 9.53, 10.0, 10.5, 11.0, 11.5, 12.1, 12.7, 13.3,
        14.0, 14.7, 15.4, 16.2, 16.9, 17.8, 18.7, 19.6,
        20.5, 21.5, 22.6, 23.7, 24.9, 26.1, 27.4,
        28.7, 30.1, 31.6, 33.2, 34.8, 36.5, 38.3, 40.2, 42.2, 44.2, 46.4, 48.7,
        51.1, 53.6, 56.2, 59.0, 61.9, 64.9, 68.1, 71.5, 75.0, 78.7, 82.5, 86.6,
        90.9, 95.3, 100, 105, 110, 115, 121, 127, 133, 140, 147, 154, 162, 169,
        178, 187, 196, 205, 215, 226, 237, 249, 261, 274, 287,
        301, 316, 332, 348, 365, 383, 402, 422, 442, 464, 487,
        511, 536, 562, 590, 619, 649, 681, 715, 750, 787, 825, 866, 909, 953,
        1000, 1050, 1100, 1150, 1210, 1270, 1330, 1400, 1470, 1540, 1620, 1690,
        1780, 1870, 1960, 2050, 2150, 2260, 2370, 2490, 2610, 2740, 2870,
        3010, 3160, 3320, 3480, 3650, 3830,
        4020, 4220, 4420, 4640, 4870, 5110, 5360, 5620, 5900, 6190, 6490, 6810,
        7150, 7500, 7870, 8250, 8660, 9090, 9530,
        10000, 10500, 11000, 11500, 12100, 12700, 13300, 14000, 14700, 15400,
        16200, 16900, 17800, 18700, 19600,
        20500, 21500, 22600, 23700, 24900, 26100, 27400, 28700,
        30100, 31600, 33200, 34800, 36500, 38300,
        40200, 42200, 44200, 46400, 48700,
        51100, 53600, 56200, 59000, 61900, 64900, 68100, 71500, 75000, 78700,
        82500, 86600, 90900, 95300, 100e3, 105e3, 110e3, 115e3, 121e3, 127e3,
        133e3, 140e3, 147e3, 154e3, 162e3, 169e3, 178e3, 187e3, 196e3,
        205e3, 215e3, 226e3, 237e3, 249e3, 261e3, 274e3, 287e3,
        301e3, 316e3, 332e3, 348e3, 365e3, 383e3, 402e3, 422e3, 442e3, 464e3,
        487e3, 511e3, 536e3, 562e3, 590e3, 619e3, 649e3, 681e3,
        715e3, 750e3, 787e3,
        825e3, 866e3, 909e3, 953e3, 1e6, 1.05e6, 1.1e6, 1.15e6, 1.21e6, 1.27e6,
        1.33e6, 1.40e6, 1.47e6, 1.54e6, 1.62e6, 1.69e6, 1.78e6, 1.87e6, 1.96e6,
        2.05e6, 2.15e6, 2.26e6, 2.37e6, 2.49e6, 2.61e6, 2.74e6, 2.87e6,
        3.01e6, 3.16e6, 3.32e6, 3.48e6, 3.65e6, 3.83e6,
        4.02e6, 4.22e6, 4.42e6, 4.64e6, 4.87e6, 5.11e6, 5.36e6, 5.62e6, 5.90e6,
        6.19e6, 6.49e6, 6.81e6, 7.15e6, 7.50e6, 7.87e6, 8.25e6, 8.66e6,
        9.09e6, 9.53e6, 10.0e6, 10.5e6, 11.0e6, 11.5e6, 12.1e6, 12.7e6, 13.3e6,
        14.0e6, 14.7e6, 15.4e6, 16.2e6, 16.9e6, 17.8e6, 18.7e6, 19.6e6,
        20.5e6, 21.5e6, 22.6e6, 23.7e6, 24.9e6, 26.1e6, 27.4e6, 28.7e6,
        30.1e6, 31.6e6, 33.2e6, 34.8e6, 36.5e6, 38.3e6,
        40.2e6, 42.2e6, 44.2e6, 46.4e6, 48.7e6, 51.1e6, 53.6e6, 56.2e6, 59.0e6,
        61.9e6, 64.9e6, 68.1e6, 71.5e6, 75e6, 78.7e6, 82.5e6, 86.6e6,
        90.9e6, 95.3e6,
        100e6, 105e6, 110e6, 115e6, 121e6, 127e6, 133e6, 140e6, 147e6, 154e6,
        162e6, 169e6, 178e6, 187e6, 196e6
    ];

    rv.r_values4band5pct = [
        10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39,
        43, 47, 51, 56, 62, 68, 75, 82, 91
    ];

    rv.r_values4band10pct = [
        10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82
    ];

})();
/*globals console sparks $ breadModel getBreadBoard */

/* FILE variable-resistor.js */

(function () {

    var circuit = sparks.circuit;

    circuit.VariableResistor = function (props, breadBoard) {
      sparks.circuit.Resistor.parentConstructor.call(this, props, breadBoard);
      var superclass = sparks.circuit.VariableResistor.uber;
      superclass.init.apply(this, [props.UID]);
      this.resistance = this.minimumResistance;
    };

    sparks.extend(circuit.VariableResistor, circuit.Resistor, {

      getMinResistance: function() {
        return this.minimumResistance;
      },

      getMaxResistance: function() {
        return this.maximumResistance;
      },

      scaleResistance: function(value) {
        var perc = value / 10,       // values are 0-10
            range = this.maximumResistance - this.minimumResistance,
            newValue = this.minimumResistance + (range * perc);
        this.resistance = newValue;
      },

      getFlashArguments: function() {
        if (this.resistance > 0) {
          return ['slider', this.UID, this.getLocation(), this.label];
        }
      }

    });

})();

/* FILE breadboard.js */

/*globals console sparks $ breadBoard window*/

(function () {

    var q = sparks.circuit.qucsator;


      var defs = {
        rows            : 31,
        powerRailHoles  : 25,
        debug           : true
      };


      var remove = function(array, from, to) {
        var rest = array.slice((to || from) + 1 || array.length);
        array.length = from < 0 ? array.length + from : from;
        return array.push.apply(array, rest);
      };

      var HTMLLog = undefined, HTMLbody = undefined;
      this.debug = function(){
      };


      this.breadBoard = {};

      var Hole = function Hole( strip, name ){
        this.type ='hole';
        this.strip = strip;
        this.name = name;
        this.connections = [];
        return this;
      };

      Hole.prototype.nodeName = function() {
        return this.strip && this.strip.name;
      };

      Hole.prototype.getName = function() {
        return this.name;
      };

      var GhostHole = function GhostHole(name) {
        this.name = !!name ? name : interfaces.getUID('node');
        return this;
      };

      GhostHole.prototype.nodeName = function() {
        return this.name;
      };

      GhostHole.prototype.getName = function() {
        return this.name;
      };

      var Strip = function Strip( holes, name ){
        this.type ='strip';
        this.holes={};
        this.name = name;
        if (holes) {
          for (var i=0, l=holes; i < l; i++) {
            this.holes[''+i] = new Hole();
            this.holes[''+i].strip = this;
          }
        }
        return this;
      };

      var Breadboard = function Breadboard(){
        var i;
        this.type ='Breadboard';

        this.powerRail = { // I was told these were called power-rails
          left:{
            positive: new Strip( null, "powerPosL"),
            negative: new Strip( null, "gnd")
          },
          right:{
            positive: new Strip( null, "powerPosR" ),
            negative: new Strip( null, "gnd" )
          }
        };

        for (i=0, l=defs.powerRailHoles; i < l; i++) {
          for (side in this.powerRail) {
            for (sign in this.powerRail[side]) {
              var h = side + '_' + sign + i;
              this.powerRail[side][sign][h] = this.holes[h] = new Hole(this.powerRail[side][sign], h);
            }
          }
        }

        for (i=0, l=defs.rows; i < l; i++) {
          newStripL = this.makeStrip("L" + i);
          newStripR = this.makeStrip("R" + i);
          for (var a=0, ll=5; a < ll; a++ ) {
            var mapCode = String.fromCharCode(a+97)+i;
            newStripL.holes[mapCode] = this.holes[ mapCode ] = new Hole( newStripL, mapCode );
            mapCode = String.fromCharCode(a+102)+i;
            newStripR.holes[mapCode] = this.holes[ mapCode ] = new Hole( newStripR, mapCode );
          }
        }
        return this;
      };

      Breadboard.prototype.strips=[];
      Breadboard.prototype.components={};
      Breadboard.prototype.holes={};
      Breadboard.prototype.holeMap={};  // map of holes where one replaces the other, e.g. {a1: 'newGhostHole'}
      Breadboard.prototype.faultyComponents=[];

      Breadboard.prototype.makeStrip = function (name) {
        var stripLen = this.strips.length;
        this.strips[ stripLen ] = new Strip(null, name);
        return this.strips[ stripLen ];
      };

      Breadboard.prototype.component = function (props) {
        if(typeof props=='string'){
          return this.components[props];
        } else {


          if (props.kind === "resistor"){
            return new sparks.circuit.Resistor(props, breadBoard);
          }
          if (props.kind === "variable resistor"){
            return new sparks.circuit.VariableResistor(props, breadBoard);
          }
          if (props.kind === 'inductor') {
            return new sparks.circuit.Inductor(props, breadBoard);
          }
          if (props.kind === 'capacitor') {
            return new sparks.circuit.Capacitor(props, breadBoard);
          }
          if (props.kind === 'battery') {
            return new sparks.circuit.Battery(props, breadBoard);
          }
          if (props.kind === 'function generator') {
            return new sparks.circuit.FunctionGenerator(props, breadBoard);
          }
          if (props.kind === 'wire') {
            return new sparks.circuit.Wire(props, breadBoard);
          }
          if (props.kind === 'powerLead') {
            return new sparks.circuit.PowerLead(props, breadBoard);
          }
          return new sparks.circuit.Component(props, breadBoard);
        }
      };

      Breadboard.prototype.clear = function () {
        this.resOrderOfMagnitude = -1;
        var destroyed = 0;
        for( k in this.components ){
          destroyed += !!this.component(k).destroy();
        }
        this.components = {};
        this.faultyComponents = [];
        return !!destroyed;
      };

      Breadboard.prototype.getHole = function(hole) {
        if (hole.name){
          if (!!this.holeMap[hole.name]){
            return this.getHole(this.holeMap[hole.getName()]);
          }
          return hole;
        }


        if (!!this.holeMap[hole]){
          hole = this.holeMap[hole]
        }

        if (!!this.holes[hole]){
          return this.holes[hole];
        }

        return new GhostHole(hole);

      };

      Breadboard.prototype.resetConnections = function(oldHoleName, newHoleName) {
        for( i in this.components ){
          var comp = this.component(i);
          for (j in comp.connections){
            if (!!comp.connections[j] && comp.connections[j].getName() === oldHoleName) {
              comp.connections[j] = this.getHole(newHoleName);
            }
          }
        }
      };

      Breadboard.prototype.resOrderOfMagnitude = -1;

      Breadboard.prototype.addFault = function(fault) {
        if (!!fault.component){
          this.addFaultToComponent(fault, this.components[fault.component]);
        } else {
          var count;
          if (!!fault.count) {
            count = fault.count;
          } else if (!!fault.max) {
            count = Math.floor(Math.random() * fault.max) + 1;    // between 1 and max faults
          }


          var componentKeys = sparks.util.getKeys(this.components);
          for (var i = 0; i < count; i++){
            var randomComponent = null;
            while (randomComponent === null) {
              var rand = Math.floor(Math.random() * componentKeys.length);
              var component = this.components[componentKeys[rand]];
              if (!!component.applyFaults && (sparks.util.contains(this.faultyComponents, component) === -1)){
                randomComponent = component;
              }
            }
            this.addFaultToComponent(fault, randomComponent);
          }
        }
      };

      Breadboard.prototype.addFaultToComponent = function(fault, component) {
        var type;
        if (fault.type instanceof Array){
          type = fault.type[Math.floor(Math.random() * fault.type.length)];
        } else {
          type = fault.type;
        }

        if (type === "open") {
          component.open = true;
          component.shorted = false;
        } else if (type === "shorted") {
          component.shorted = true;
          component.open = false;
        }
        if (component.applyFaults) {
          component.applyFaults();
        }

        this.faultyComponents.push(component);
      };

      Breadboard.prototype.getFaults = function() {
        return this.faultyComponents;
      };

      Breadboard.prototype.getFault = function() {
        if (this.faultyComponents.length > 0){
          return this.faultyComponents[0];
        }
        return null;
      };

      var breadBoard = new Breadboard();

      var interfaces = {
        insertComponent: function(kind, properties){
          var props = {};
          $.each(properties, function(key, property){
            props[key] = property;
          });

          props.kind = kind;

          props.UID = interfaces.getUID(!!props.UID ? props.UID : props.kind);

          if (props.UID === "source" && !props.connections){
            props.connections = "left_positive1,left_negative1";
          }

          var newComponent = breadBoard.component(props);
          return newComponent.UID;
        },
        createCircuit: function(jsonCircuit) {
          var circuitHasReferenceFrequency = typeof jsonCircuit.referenceFrequency === 'number';

          $.each(jsonCircuit, function(i, spec) {
            if (circuitHasReferenceFrequency && typeof spec.referenceFrequency === 'undefined') {
              spec.referenceFrequency = jsonCircuit.referenceFrequency;
            }
            interfaces.insertComponent(spec.type, spec);
          });

          if (!breadBoard.components["source"]) {
            var battery = {
              UID: "source",
              type: "battery",
              voltage: 9
            }
            interfaces.insertComponent("battery", battery);
          }

          interfaces.insertComponent("powerLead", {
            UID: "redPowerLead",
            type: "powerLead",
            connections: "left_positive21"
          });
          interfaces.insertComponent("powerLead", {
            UID: "blackPowerLead",
            type: "powerLead",
            connections: "left_negative21"
          });
        },
        addFaults: function(jsonFaults){
          $.each(jsonFaults, function(i, fault){
            breadBoard.addFault(fault);
          });
        },
        getResOrderOfMagnitude: function(){
          return breadBoard.resOrderOfMagnitude;
        },
        setResOrderOfMagnitude: function(om){
          breadBoard.resOrderOfMagnitude = om;
        },
        insert: function(type, connections){
          console.log("ERROR: 'insert' is deprecated. Use 'insertComponent'");
        },
        getUID: function(_name){
          var name = _name.replace(/ /g, "_");      // no spaces in qucs

          if (!breadBoard.components[name]){
            return name;
          }

          var i = 0;
          while (!!breadBoard.components[""+name+i]){
            i++;
          }
          return ""+name+i;
        },
        remove: function(type, connections){
          var comp = interfaces.findComponent(type, connections)
          if (!!comp){
            comp.destroy();
          }
        },
        findComponent: function(type, connections){
          if (!!type && !!connections && connections.split(",").length === 2){
            connections = connections.split(",");
            for (i in breadBoard.components){
              var component = breadBoard.components[i];
              if (component.kind === type && !!component.connections[0] &&
                ((component.connections[0].getName() === connections[0]
                && component.connections[1].getName() === connections[1]) ||
                (component.connections[0].getName() === connections[1]
                  && component.connections[1].getName() === connections[0]))){
                  return component;
                }
            }
          }
          return null;
        },
        destroy: function(component){
          breadBoard.component(component).destroy();
        },
        clear: function() {
          breadBoard.clear();
          interfaces.clearHoleMap();
        },
        move: function(component, connections){
          breadBoard.component(component).move(connections.split(','));
        },
        getGhostHole: function(name){
          return new GhostHole(name);
        },
        mapHole: function(oldHoleName, newHoleName){
          breadBoard.holeMap[oldHoleName] = newHoleName;
          breadBoard.resetConnections(oldHoleName, newHoleName);
        },
        unmapHole: function(oldHoleName){
          var newHoleName = breadBoard.holeMap[oldHoleName];
          breadBoard.holeMap[oldHoleName] = undefined;
          breadBoard.resetConnections(newHoleName, oldHoleName);
        },
        clearHoleMap: function(){
          breadBoard.holeMap = {};
        },
        addRandomResistor: function(name, location, options){
          console.log("WARNING: addRandomResistor is deprecated")
          var resistor = new sparks.circuit.Resistor4band(name);
          resistor.randomize((options | null));
          interfaces.insert('resistor', location, resistor.getRealValue(), name, resistor.colors);
          return resistor;
        },

        query: function(type, connections, callback, context, callbackArgs){
          var tempComponents = [];

          if (!!type && type === 'resistance') {
            connections = connections.split(',');
            var ghost = new GhostHole();
            var ohmmeterBattery = breadBoard.component({
              UID: 'ohmmeterBattery',
              kind: 'battery',
              voltage: 1,
              connections: [connections[0], ghost]});
            var currentProbe = breadBoard.component({
              UID: 'meter',
              kind: 'iprobe',
              connections: [connections[1], ghost]});
            tempComponents.push(ohmmeterBattery, currentProbe);
          } else if (!!type) {
            if (type === 'voltage'){
              var voltmeterResistor = breadBoard.component({
                UID: 'voltmeterResistor',
                kind: 'resistor',
                resistance: 1e12,
                connections: connections.split(',')});
              tempComponents.push(voltmeterResistor);
            }
            var probe = breadBoard.component({
              UID: 'meter',
              kind: {'current' : 'iprobe', 'voltage' : 'vprobe', 'ac_voltage' : 'vprobe'}[type],
              connections: connections.split(',')});
            tempComponents.push(probe);
          }

          var netlist = q.makeNetlist(breadBoard),
              resultObject;

          q.qucsate(netlist, function (results) {
            callback.call(context, results, callbackArgs);
          } );

          $.each(tempComponents, function(i, component){
            component.destroy();
          });
        },
        updateFlash: function() {
          $.each(breadBoard.components, function(i, component) {
            if (component.getFlashArguments && component.hasValidConnections()) {
              var flashArguments = component.getFlashArguments();
              flashArguments.unshift('insert_component');
              sparks.flash.sendCommand.apply(this, flashArguments);
            }
          });
        }
      };

      this.breadModel = function () {
        debug(arguments);
        var newArgs = [];
        for(var i=1,l=arguments.length;i< l;i++){
          newArgs[newArgs.length] = arguments[i];
        }
        var func = arguments[0];

        if (func === 'query' && !!arguments[2]) {
            var conns = arguments[2].split(',');

            if (conns[0] === 'null' || conns[1] === 'null') {
                return 0;
            }
            var v = interfaces.query.apply(window, newArgs);
            return v;
        }
        else {
          return interfaces[func].apply(window, newArgs);
        }
      };

      this.getBreadBoard = function() {
        return breadBoard;
      };

})();
/* FILE multimeter-base.js */

(function () {

    var flash = sparks.flash;

    /*
     * Digital Multimeter
     * Base for the Centech DMM
     */
    sparks.circuit.MultimeterBase = function () {
    };

    sparks.circuit.MultimeterBase.prototype = {

        modes : { ohmmeter : 0, voltmeter : 1, ammeter : 2 },

        init: function () {
            this.mode = this.modes.ohmmeter;

            this.absoluteValue = 0;   //current meter value

            this.displayText = '       ';

            this.redProbeConnection = null;
            this.blackProbeConnection = null;
            this.redPlugConnection = null;
            this.blackPlugConnecton = null;
            this.dialPosition = 'acv_750';
            this.powerOn = false;
            this.disabledPositions = [];
        },

        setProbeLocation: function (probe, location) {
          if (probe === "probe_red") {
            this.redProbeConnection = location;
          } else if (probe === "probe_black") {
            this.blackProbeConnection = location;
          }
          this.update();
        },

        update : function () {
        },

        updateDisplay : function () {
            if (!this.powerOn) {
                this.displayText = '       ';
                flash.sendCommand('set_multimeter_display', '       ');
                return;
            }

            var text = '';
            if (this.allConnected()) {
                if (this.dialPosition === 'dcv_20') {
                    if (this.absoluteValue < 19.995) {
                        text = (Math.round(this.absoluteValue * 100) * 0.01).toString();
                        text = this.toDisplayString(text, 2);
                    }
                    else {
                        text = ' 1 .   ';
                    }
                    this.currentUnits = "V";

                } else if (this.dialPosition === 'dcv_200') {
                    if (this.absoluteValue < 199.95) {
                        text = (Math.round(this.absoluteValue * 10) * 0.1).toString();
                        text = this.toDisplayString(text, 1);
                    }
                    else {
                        text = ' 1 .   ';
                    }
                    this.currentUnits = "V";

                } else if (this.dialPosition === 'dcv_1000') {
                     if (this.absoluteValue < 999.95) {
                        text = Math.round(this.absoluteValue).toString();
                        text = this.toDisplayString(text, 0);
                        text = "h" + text.substring(1);
                    }
                    else {
                        text = 'h1 .   ';
                    }
                    this.currentUnits = "V";

                } else if (this.dialPosition === 'dcv_2000m') {
                    var vm = this.absoluteValue * 1000;
                    if (vm < 1999.5) {
                        text = Math.round(vm).toString();
                        text = this.toDisplayString(text, 0);
                    }
                    else {
                        text = ' 1 .   ';
                    }
                    this.currentUnits = "mV";

                } else if (this.dialPosition === 'dcv_200m') {
                    var vm = this.absoluteValue * 1000;
                    if (vm < 195){
                      text = (Math.round(vm * 100) * 0.01).toString();
                      text = this.toDisplayString(text, 1);
                    }
                    else {
                        text = ' 1 .   ';
                    }
                    this.currentUnits = "mV";

                } else if (this.dialPosition === 'acv_200') {
                    if (this.absoluteValue < 199.95) {
                        text = (Math.round(this.absoluteValue * 10) * 0.1).toString();
                        text = this.toDisplayString(text, 1);
                    }
                    else {
                        text = ' 1 .   ';
                    }
                    this.currentUnits = "V";

                } else if (this.dialPosition === 'acv_750') {
                    if (this.absoluteValue < 699.5) {
                        text = (Math.round(this.absoluteValue)).toString();
                        text = this.toDisplayString(text, 0);
                        text = "h"+text.substring(1);
                    }
                    else {
                        text = 'h1 .   ';
                    }
                    this.currentUnits = "V";

                } else if (this.dialPosition === 'r_200') {
                    if (this.absoluteValue < 199.95) {
                        text = (Math.round(this.absoluteValue * 10) * 0.1).toString();
                        text = this.toDisplayString(text, 1);
                    }
                    else {
                        text = ' 1   . ';
                    }
                    this.currentUnits = "Ohms";
                } else if (this.dialPosition === 'r_2000') {
                    if (this.absoluteValue < 1999.5) {
                        text = Math.round(this.absoluteValue).toString();
                        text = this.toDisplayString(text, 0);
                    }
                    else {
                        text = ' 1     ';
                    }
                    this.currentUnits = "Ohms";
                }
                else if (this.dialPosition === 'r_20k') {
                    if (this.absoluteValue < 19995) {
                        text = (Math.round(this.absoluteValue * 0.1) * 0.01).toString();
                        text = this.toDisplayString(text, 2);
                    }
                    else {
                        text = ' 1 .   ';
                    }
                    this.currentUnits = "kOhms";
                }
                else if (this.dialPosition === 'r_200k') {
                    if (this.absoluteValue < 199950) {
                        text = (Math.round(this.absoluteValue * 0.01) * 0.1).toString();
                        text = this.toDisplayString(text, 1);
                    }
                    else {
                        text = ' 1   . ';
                    }
                    this.currentUnits = "kOhms";
                }
                else if (this.dialPosition === 'r_2000k') {
                    if (this.absoluteValue < 1999500) {
                        text = Math.round(this.absoluteValue * 0.001).toString();
                        text = this.toDisplayString(text, 0);
                    }
                    else {
                        text = ' 1     ';
                    }
                    this.currentUnits = "kOhms";
                }
                else if (this.dialPosition === 'dca_200mc') {
                  var imc = this.absoluteValue * 1000000
                  if (imc < 195){
                    text = (Math.round(imc * 100) * 0.01).toString();
                    text = this.toDisplayString(text, 1);
                  }
                  else {
                      text = ' 1     ';
                  }
                  this.currentUnits = "μA";
                }
                else if (this.dialPosition === 'dca_2000mc') {
                  var imc = this.absoluteValue * 1000000
                  if (imc < 1950){
                    text = (Math.round(imc * 10) * 0.1).toString();
                    text = this.toDisplayString(text, 0);
                  }
                  else {
                      text = ' 1     ';
                  }
                  this.currentUnits = "μA";
                }
                else if (this.dialPosition === 'dca_20m') {
                  var im = this.absoluteValue * 1000
                  if (im < 19.5){
                    text = (Math.round(im * 100) * 0.01).toString();
                    text = this.toDisplayString(text, 2);
                  }
                  else {
                      text = ' 1     ';
                  }
                  this.currentUnits = "mA";
                }
                else if (this.dialPosition === 'dca_200m') {
                  var im = this.absoluteValue * 1000
                  if (im < 195){
                    text = (Math.round(im * 10) * 0.1).toString();
                    text = this.toDisplayString(text, 1);
                  }
                  else {
                      text = ' 1     ';
                  }
                  this.currentUnits = "mA";
                }
                else if (this.dialPosition === 'dcv_200m' || this.dialPosition === 'dcv_200' ||
                        this.dialPosition === 'acv_200' || this.dialPosition === 'p_9v' ||
                        this.dialPosition === 'dca_200mc' || this.dialPosition === 'dca_200m') {
                    text = '  0 0.0';
                }
                else if (this.dialPosition === 'dcv_2000m' || this.dialPosition === 'dca_2000mc' ||
                        this.dialPosition === 'hfe') {
                    text = '  0 0 0';
                }
                else if (this.dialPosition === 'dcv_20' || this.dialPosition === 'dca_20m' ||
                        this.dialPosition === 'c_10a') {
                    text = '  0.0 0';
                }
                else if (this.dialPosition === 'dcv_1000' || this.dialPosition === 'acv_750') {
                    text = 'h 0 0 0';
                }
                else if (this.dialPosition === 'diode') {
                  text = ' 1     ';
                }
                else {
                    text = '       ';
                }
            }
            else {    // if not connected
                if (this.dialPosition === 'dcv_20') {
                    text = '  0.0 0';
                }
                else if (this.dialPosition === 'r_200') {
                    text = ' 1   . ';
                }
                else if (this.dialPosition === 'r_2000' || this.dialPosition === 'diode') {
                    text = ' 1     ';
                }
                else if (this.dialPosition === 'r_20k') {
                    text = ' 1 .   ';
                }
                else if (this.dialPosition === 'r_200k') {
                    text = ' 1   . ';
                }
                else if (this.dialPosition === 'r_2000k') {
                    text = ' 1     ';
                }
                else if (this.dialPosition === 'dcv_200m' || this.dialPosition === 'dcv_200' ||
                        this.dialPosition === 'acv_200' || this.dialPosition === 'p_9v' ||
                        this.dialPosition === 'dca_200mc' || this.dialPosition === 'dca_200m') {
                    text = '  0 0.0';
                }
                else if (this.dialPosition === 'dcv_2000m' || this.dialPosition === 'dca_2000mc' ||
                        this.dialPosition === 'hfe') {
                    text = '  0 0 0';
                }
                else if (this.dialPosition === 'dcv_20' || this.dialPosition === 'dca_20m' ||
                        this.dialPosition === 'c_10a') {
                    text = '  0.0 0';
                }
                else if (this.dialPosition === 'dcv_1000' || this.dialPosition === 'acv_750') {
                    text = 'h 0 0 0';
                }
                else {
                    text = '       ';
                }
            }
            text = this.disable_multimeter_position(text);
            if (text !== this.displayText) {
              console.log('text=' + text);
              flash.sendCommand('set_multimeter_display', text);
              this.displayText = text;
              this.currentValue = parseFloat(text.replace(/[^\d\.]/g, ""));
            }
        },


		set_disable_multimeter_position: function (disabled) {
			this.disabledPositions = disabled.split(',');
			for(i=0;i<this.disabledPositions.length;i++){
			}
		},


        disable_multimeter_position : function (displayText) {

        	switch (this.dialPosition)
        	{
 			case 'dcv_20':
			case 'dcv_200':
			case 'dcv_1000':
			case 'dcv_2000m':
			case 'dcv_200m':
				for(i=0;i<this.disabledPositions.length;i++){
					if(this.disabledPositions[i] == 'dcv'){
						displayText = '-------';
						break;
					}
				}
				break;
			case 'r_200':
			case 'r_2000':
			case 'r_20k':
			case 'r_200k':
			case 'r_2000k':
				for(i=0;i<this.disabledPositions.length;i++){
					if(this.disabledPositions[i] == 'r'){
						displayText = '-------';
						break;
					}
				}
				break;
			case 'dca_200mc':
			case 'dca_2000mc':
			case 'dca_20m':
			case 'dca_200m':
				for(i=0;i<this.disabledPositions.length;i++){
					if(this.disabledPositions[i] == 'dca'){
						displayText = '-------';
						break;
					}
				}
				break;
			case 'acv_750':
			case 'acv_200':
				for(i=0;i<this.disabledPositions.length;i++){
					if(this.disabledPositions[i] == 'acv'){
						displayText = '-------';
						break;
					}
				}
				break;
			case 'diode':
			case 'hfe':
			case 'c_10a':
			case 'p_9v':
			default:
        	}
        	return displayText;
        },

        toDisplayString : function (s, dec) {
            var i;
            var sign = s.charAt(0) === '-' ? s.charAt(0) : ' ';
            s = s.replace('-', '');

            var pointLoc = s.indexOf('.');
            var decLen = pointLoc == -1 ? 0 : s.substring(pointLoc+1).length;
            if (decLen === 0) {
                s = s.concat('.');
            }
            if (dec < decLen) {
                s = s.substring(0, pointLoc + dec + 1);
            }
            else {
                for (i = 0; i < dec - decLen; ++i) {
                    s = s.concat('0');
                }
            }
            s = s.replace('.', '');
            var len = s.length;
            if (len < 4) {
                for (i = 0; i < 3 - len; ++i) {
                    s = '0' + s;
                }
                s = ' ' + s;
            }

            var dot1;
            var dot2;

            switch (dec) {
            case 0:
                dot1 = ' ';
                dot2 = ' ';
                break;
            case 1:
                dot1 = ' ';
                dot2 = '.';
                break;
            case 2:
                dot1 = '.';
                dot2 = ' ';
                break;
            default:
                console.log('ERROR: invalid dec ' + dec);
            }

            s = sign + s.substring(0, 2) + dot1 + s.charAt(2) + dot2 + s.charAt(3);
            return s;

        },

        formatDecimalString : function (s, dec) {
            var pointLoc = s.indexOf('.');
            var decLen = pointLoc == -1 ? 0 : s.substring(pointLoc+1).length;
            if (decLen === 0) {
                s = s.concat('.');
            }
            if (dec < decLen) {
                s = s.substring(0, pointLoc + dec + 1);
            }
            else {
                for (var i = 0; i < dec - decLen; ++i) {
                    s = s.concat('0');
                }
            }
            return s;
        },

        getDisplayText : function () {
            return this.displayText;
        },

        /*
         * Return value to be shown under optimal setting.
         * This value is to be compared with the student answer for grading.
         *
         * Take three significant digits, four if the first digit is 1.
         */
        makeDisplayText : function (value) {
            var text;
            if (value < 199.95) {
                text = (Math.round(value * 10) * 0.1).toString();
                text = this.formatDecimalString(text, 1);
            }
            else if (value < 1999.5) {
                text = Math.round(value).toString();
                text = this.formatDecimalString(text, 0);
            }
            else if (value < 19995) {
                text = (Math.round(value * 0.1) * 10).toString();
            }
            else if (value < 199950) {
                text = (Math.round(value * 0.01) * 100).toString();
            }
            else if (value < 1999500) {
                text = (Math.round(value * 0.001) * 1000).toString();
            }
            else {
                text = 'NaN';
            }
            return parseFloat(text);
        },

        allConnected : function () {
            return this.redProbeConnection !== null &&
                this.blackProbeConnection !== null &&
                this.redProbeConnection !== this.blackProbeConnection &&
                (this.redPlugConnection === 'voma_port' &&
                 this.blackPlugConnection === 'common_port' ||
                 this.redPlugConnection === 'common_port' &&
                 this.blackPlugConnection === 'voma_port') &&
                this.powerOn;
        }
    };

})();

/* FILE multimeter2.js */

/*globals console sparks $ breadModel getBreadBoard apMessageBox*/

(function () {

    var circuit = sparks.circuit;
    var flash = sparks.flash;

    /*
     * Digital Multimeter for breadboard activities
     *
     */
    circuit.Multimeter2 = function () {
        circuit.Multimeter2.uber.init.apply(this);
        this.reset();
    };

    sparks.extend(circuit.Multimeter2, circuit.MultimeterBase, {

        reset: function() {
          this.dialPosition = 'dcv_20';
          this.powerOn = true;
          this.redProbeConnection = null;
          this.blackProbeConnection = null;
          this.displayText = "";
          this.update();
        },

        currentMeasurement: null,

        update: function () {
          if (this.redProbeConnection && this.blackProbeConnection) {
            if (this.dialPosition.indexOf('dcv_') > -1){
              this.currentMeasurement = "voltage";
            } else if (this.dialPosition.indexOf('dca_') > -1){
              this.currentMeasurement = "current";
            } else if (this.dialPosition.indexOf('r_') > -1){
              this.currentMeasurement = "resistance";
            } else if (this.dialPosition.indexOf('acv_') > -1){
              this.currentMeasurement = "ac_voltage";
            } else {
              this.currentMeasurement = null;
            }

            if (!!this.currentMeasurement){
              breadModel('query', this.currentMeasurement, this.redProbeConnection + ',' + this.blackProbeConnection, this.updateWithData, this);
            }
          } else {
            this.updateWithData();
          }
        },

        updateWithData: function (resultsBlob) {
          var measurement = this.currentMeasurement;
          if (resultsBlob) {
            var meterKey = (measurement === 'voltage' || measurement === 'ac_voltage') ? 'v' : 'i';

            if (!!meterKey && !!resultsBlob.meter[meterKey]){
              var index = this._getResultsIndex(resultsBlob);

              var result = resultsBlob.meter[meterKey][index];

              result = result.magnitude;

              result = Math.abs(result);


              var source = getBreadBoard().components.source;
              if (!!source &&
                 ((measurement === 'voltage' && source.getQucsSimulationType().indexOf(".AC") > -1) ||
                  (measurement === 'ac_voltage' && source.getQucsSimulationType().indexOf(".DC") > -1))) {
                result = 0;
              } else if (measurement === 'resistance') {
                result = 1 / result;
              } else if (measurement === "ac_voltage" ||
                          (measurement === 'current' && source && source.getQucsSimulationType().indexOf(".AC") > -1)){
                if (!!source.amplitudeScaleFactor || source.amplitudeScaleFactor === 0){
                  result = result * source.amplitudeScaleFactor;
                }
                result = result / Math.sqrt(2);         // RMS voltage or RMS cureent
              }
              result = Math.round(result*Math.pow(10,8))/Math.pow(10,8);

              this.absoluteValue = result;

              if (measurement === "current" && this.absoluteValue > 0.44){
                this.blowFuse();
              }
            } else {
              this.absoluteValue = 0;
            }
          } else {
            this.absoluteValue = 0;
          }

          this.updateDisplay();

          if (this.redProbeConnection && this.blackProbeConnection) {
            sparks.logController.addEvent(sparks.LogEvent.DMM_MEASUREMENT, {
              "measurement": measurement,
              "dial_position": this.dialPosition,
              "red_probe": this.redProbeConnection,
              "black_probe": this.blackProbeConnection,
              "result": this.displayText});
          }
        },

        blowFuse: function() {
          sparks.flash.sendCommand('mouse_up');
          apMessageBox.error({
          	title: "POW!",
          	message: "<b>You just blew the fuse in your multimeter!</b><br><br> Remember not to pass too much current through it."+
          	" We've replaced your fuse for you, but you lost some time.",
          	errorImage: "lib/error-32x32.png",
          	width: 400,
          	height: 300
          });
          sparks.logController.addEvent(sparks.LogEvent.BLEW_FUSE);
        },

        allConnected: function () {
            return this.redProbeConnection !== null &&
                this.blackProbeConnection !== null &&
                this.powerOn;
        },

        _getResultsIndex: function (results) {
          var i = 0,
              source = getBreadBoard().components.source;
          if (source && source.setFrequency && results.acfrequency){
            i = sparks.util.getClosestIndex(results.acfrequency, source.frequency, true);
          }
          return i;
        }
    });

})();
/*globals sparks getBreadBoard breadModel */
/* FILE oscilloscope.js */

(function () {

    sparks.circuit.Oscilloscope = function () {
      this.probeLocation = [];
      this.probeLocation[0] = null;     // pink probe
      this.probeLocation[1] = null;     // yellow probe
      this.view = null;
      this.signals = [];
      var initVerticalScale   = this.INITIAL_VERTICAL_SCALE,
          initHorizontalScale = this.INITIAL_HORIZONTAL_SCALE;
      this._verticalScale = [initVerticalScale, initVerticalScale, initVerticalScale];
      this._horizontalScale = initHorizontalScale;
	  this.showAminusB = false;
	  this.showAplusB = false;
    };

    sparks.circuit.Oscilloscope.prototype = {

      N_CHANNELS:     2,
      PROBE_CHANNEL:  [1, 2],

      HORIZONTAL_SCALES: [1e-3, 5e-4, 2.5e-4, 1e-4, 5e-5, 2.5e-5, 1e-5, 5e-6, 2.5e-6, 1e-6],  // sec/div
      VERTICAL_SCALES:   [100,  50,   25,     10,   5,    2.5,    1,    0.5,  0.25,    0.1],  // V/div

      INITIAL_HORIZONTAL_SCALE: 1e-5,
      INITIAL_VERTICAL_SCALE:   5,

      reset: function() {
        this.probeLocation[0] = null;     // pink probe
        this.probeLocation[1] = null;     // yellow probe
        this.setProbeLocation("probe_yellow", "left_positive22");
        this.signals = [];
        var initVerticalScale   = this.INITIAL_VERTICAL_SCALE,
            initHorizontalScale = this.INITIAL_HORIZONTAL_SCALE;
        this._verticalScale = [initVerticalScale, initVerticalScale, initVerticalScale];
        this._horizontalScale = initHorizontalScale;
        this.update();
      },

      setView: function(view) {
        var i;

        this.view = view;
        this.view.setModel(this);
        this.update();         // we can update view immediately with the source trace
      },

      setProbeLocation: function(probe, location) {
        if (probe === "probe_yellow" || probe === "probe_pink") {
          var probeIndex = probe === "probe_yellow" ? 0 : 1;
          this.probeLocation[probeIndex] = location;
          this.update();
        }
      },

      update: function() {
        var breadboard = getBreadBoard(),
            source     = breadboard.components.source,
            sourceSignal,
            probeSignal,
            probeNode,
            data,
            result,
            freqs,
            dataIndex;

        if (!source || !source.frequency || !source.amplitude) {
          return;                                     // we must have a source with a freq and an amplitude
        }

        for (var probeIndex = 0; probeIndex < 2; probeIndex++) {
          if (this.probeLocation[probeIndex]) {
            probeNode = breadboard.getHole(this.probeLocation[probeIndex]).nodeName();
            if (probeNode === 'gnd') {
              this.setSignal(this.PROBE_CHANNEL[probeIndex], {amplitude: 0, frequency: 0, phase: 0});
              continue;
            } else if (~probeNode.indexOf('powerPos')) {
              sourceSignal = {
                amplitude: source.amplitude * source.amplitudeScaleFactor,
                frequency: source.frequency,
                phase: 0
              };
              this.setSignal(this.PROBE_CHANNEL[probeIndex], sourceSignal);
              continue;
            }

            breadModel('query', null, null, this.updateWithData, this, [probeNode, probeIndex]);
          } else {
            this.clearSignal(this.PROBE_CHANNEL[probeIndex]);
          }
        }
      },

      updateWithData: function(data, probeInfo) {
        var breadboard = getBreadBoard(),
            source     = breadboard.components.source,
            probeNode  = probeInfo[0],
            probeIndex = probeInfo[1];
        freqs = data.acfrequency;
        dataIndex = sparks.util.getClosestIndex(freqs, source.frequency, true);
        result = data[probeNode].v[dataIndex];

        if (result) {
          probeSignal = {
            amplitude: result.magnitude * source.amplitudeScaleFactor,
            frequency: source.frequency,
            phase:     result.angle
          };

          this.setSignal(this.PROBE_CHANNEL[probeIndex], probeSignal);

          sparks.logController.addEvent(sparks.LogEvent.OSCOPE_MEASUREMENT, {
              "probe": probeNode
            });
        } else {
          this.clearSignal(this.PROBE_CHANNEL[probeIndex]);
        }
      },

      setSignal: function(channel, signal) {
        this.signals[channel] = signal;
        this.view.renderSignal(channel);
      },

      getSignal: function(channel) {
        return this.signals[channel];
      },

      clearSignal: function(channel) {
        delete this.signals[channel];
        this.view.removeTrace(channel);
      },

      setHorizontalScale: function(scale) {
        this._horizontalScale = scale;
        if (this.view) {
          this.view.horizontalScaleChanged();
        }

        sparks.logController.addEvent(sparks.LogEvent.OSCOPE_T_SCALE_CHANGED, {
            "scale": scale,
            "goodnessOfScale": this.getGoodnessOfScale()
          });
      },

      getHorizontalScale: function() {
        if (!this._horizontalScale) {
          this.setHorizontalScale(this.INITIAL_HORIZONTAL_SCALE);
        }
        return this._horizontalScale;
      },

      setVerticalScale: function(channel, scale) {
        if (this.showAminusB || this.showAplusB){
          if (channel === 1) {
            this._verticalScale[2] = scale;
          } else {
            return;
          }
        }

        this._verticalScale[channel] = scale;
        if (this.view) {
          this.view.verticalScaleChanged(1);
          this.view.verticalScaleChanged(2);
        }

        var logEvent = channel == 1 ? sparks.LogEvent.OSCOPE_V1_SCALE_CHANGED : sparks.LogEvent.OSCOPE_V2_SCALE_CHANGED;
        sparks.logController.addEvent(logEvent, {
          "scale": scale,
          "goodnessOfScale": this.getGoodnessOfScale()
        });
      },

      getVerticalScale: function(channel) {
        if (!this._verticalScale[channel]) {
          this.setVerticalScale(channel, this.INITIAL_VERTICAL_SCALE);
        }
        return this._verticalScale[channel];
      },

      bumpHorizontalScale: function(direction) {
        var currentScale = this.getHorizontalScale(),
            newScale     = this._getNextScaleFromList(currentScale, this.HORIZONTAL_SCALES, direction);

        if (newScale !== currentScale) {
          this.setHorizontalScale(newScale);
        }
      },

      bumpVerticalScale: function(channel, direction) {
        var currentScale = this.getVerticalScale(channel),
            newScale     = this._getNextScaleFromList(currentScale, this.VERTICAL_SCALES, direction);

        if (newScale !== currentScale) {
          this.setVerticalScale(channel, newScale);
        }
      },

      toggleShowAminusB: function() {
        this.showAminusB = !this.showAminusB;
        if (this.showAminusB) {
          this.showAplusB = false;
        }
      },

      toggleShowAplusB: function() {
        this.showAplusB = !this.showAplusB;
        if (this.showAplusB) {
          this.showAminusB = false;
        }
      },

      _getNextScaleFromList: function(scale, scales, direction) {
        var i, len, prevIndex;

        for (i = 0, len = scales.length; i < len; i++) {
          if (scales[i] < scale) {
            break;
          }
        }
        prevIndex = (i > 0) ? i - 1 : 0;

        if (direction === 1 && prevIndex - 1 >= 0) {
          return scales[prevIndex - 1];
        } else if (direction === -1 && prevIndex + 1 < scales.length) {
          return scales[prevIndex + 1];
        } else {
          return scale;
        }
      },

      getGoodnessOfScale: function() {
        var self = this;
        var goodnessOfScale = function(channel) {
          var timeScale  = self.signals[channel].frequency * (self._horizontalScale * 10),            // 0-inf, best is 1
              ampScale   = (self.signals[channel].amplitude * 2) / (self._verticalScale[channel] * 8),
              timeGoodness  = timeScale > 1 ? 1/timeScale : timeScale,                                // 0-1, best is 1
              ampGoodness   = ampScale > 1 ? 1/ampScale : ampScale,
              timeScore  = (timeGoodness - 0.3) / 0.5,                                                // scaled such that 0.3 = 0 and 0.8 = 1
              ampScore   = (ampGoodness - 0.3) / 0.5,
              minScore = Math.max(0,Math.min(timeScore, ampScore, 1)),                                // smallest of the two, no less than 0
              maxScore = Math.min(1,Math.max(timeScore, ampScore, 0));                                // largest of the two, no greater than 1
          return ((minScore * 3) + maxScore) / 4;
        }

        var goodnesses = [null, null];
        if (this.signals[1]) {
          goodnesses[0] = goodnessOfScale([1]);
        }

        if (this.signals[2]) {
          goodnesses[1] = goodnessOfScale([2]);
        }
        return goodnesses;
      }

    };

})();
/*globals console sparks $ breadModel getBreadBoard */

/* FILE resistor-4band.js */

(function () {

    var circuit = sparks.circuit;

    circuit.Resistor4band = function (id) {
        var superclass = sparks.circuit.Resistor4band.uber;
        superclass.init.apply(this, [id]);
        this.numBands = 4;

        if (breadModel('getResOrderOfMagnitude') < 0){
          var om = this.randInt(0, 3);
          breadModel('setResOrderOfMagnitude', om);
        }

        this.r_values5pct = this.filter(circuit.r_values.r_values4band5pct);
        this.r_values10pct = this.filter(circuit.r_values.r_values4band10pct);
    };

    sparks.extend(circuit.Resistor4band, circuit.Resistor, {

        toleranceValues: [0.05, 0.1],

        randomize: function (options) {

            var value = 0;
            do {
              var ix = this.randInt(0, 1);
              var values;

              this.tolerance = this.toleranceValues[ix];

              if (options && options.rvalues) {
                  values = options.rvalues;
              }
              else if (this.tolerance == 0.05) {
                  values = this.r_values5pct;
              }
              else {
                  values = this.r_values10pct;
              }

              var om = breadModel('getResOrderOfMagnitude');
              var extra = this.randInt(0, 1);
              om = om + extra;

              value = values[this.randInt(0, values.length-1)];

              value = value * Math.pow(10,om);
            } while (!this._resistanceIsUnique(value));

            this.nominalValue = value;

            if (options && options.realEqualsNominal) {
                this.realValue = this.nominalValue;
            }
            else {
                this.realValue = this.calcRealValue(this.nominalValue, this.tolerance);
            }

            this.colors = this.getColors(this.nominalValue, this.tolerance);
        },

        _resistanceIsUnique: function (value) {
          var components = getBreadBoard().components;

          for (var i in components){
            var resistor  = components[i];
            var resistance = resistor.nominalResistance;
            if (resistance == value){
              return false;
            }
          }
          return true;
        },

        getColors: function (ohms, tolerance) {
            var s = ohms.toString();
            var decIx = s.indexOf('.'); // real location of the dot in the string
            var decLoc = decIx > -1 ? decIx : s.length;

            s = s.replace('.', '');
            var len = s.length;

            for (var i = 0; i < 2 - len; ++i) {
                s += '0';
            }

            var mult = decLoc > 1 ? decLoc - 2 : 10;

            return [ this.colorMap[s.charAt(0)],
                     this.colorMap[s.charAt(1)],
                     this.colorMap[decLoc - 2],
                     this.toleranceColorMap[tolerance]
                   ];
        }

    });

})();

/* FILE resistor-5band.js */

(function () {

    var circuit = sparks.circuit;

    circuit.Resistor5band = function (id) {
        var superclass = sparks.circuit.Resistor5band.uber;
        superclass.init.apply(this, [id]);
        this.numBands = 5;

        this.r_values1pct = this.filter(circuit.r_values.r_values5band1pct);
        this.r_values2pct = this.filter(circuit.r_values.r_values5band2pct);
    };

    sparks.extend(circuit.Resistor5band, circuit.Resistor, {

        randomize : function() {
          var ix = this.randInt(0, 1);
          var values;

          this.tolerance = this.toleranceValues[ix];
          if (this.tolerance == 0.01) {
              values = this.r_values1pct;
          }
          else {
              values = this.r_values2pct;
          }
          this.nominalValue = values[this.randInt(0, values.length-1)];
          this.realValue = this.calcRealValue(this.nominalValue, this.tolerance);
          this.colors = this.getColors(this.nominalValue, this.tolerance);

          this.colors = this.getColors(this.nominalValue, this.tolerance);
        },

        getColors: function(ohms, tolerance) {
            var s = ohms.toString();
            var decIx = s.indexOf('.'); // real location of the dot in the string
            var decLoc = decIx > -1 ? decIx : s.length;

            s = s.replace('.', '');
            var len = s.length;

            for (var i = 0; i < 3 - len; ++i) {
                s += '0';
            }

            return [ this.colorMap[s.charAt(0)],
                     this.colorMap[s.charAt(1)],
                     this.colorMap[s.charAt(2)],
                     this.colorMap[decLoc - 3],
                     this.toleranceColorMap[tolerance]
                   ];
        }
    });
})();

/*globals console sparks getBreadBoard*/

(function () {
    sparks.circuitMath = function(){};

    sparks.circuitMath.prototype = {

      getResistors: function(resistorNames) {
        var resistors = [];
        var components = getBreadBoard().components;
        $.each(resistorNames, function(i, name){
          if (!!components[name]){
            resistors.push(components[name]);
          } else {
            console.log("ERROR: "+name+" cannot be found on breadboard");
          }
        });
        return resistors;
      },

      rSeries: function() {
        var resistors = this.getResistors(arguments);

        var resistance = 0;
        $.each(resistors, function(i, resistor){
          resistance += resistor.resistance;
        });
        return resistance;
      },

      rParallel: function() {
        var resistors = this.getResistors(arguments);

        var resistance = 0;
        $.each(resistors, function(i, resistor){
          resistance += (1/resistor.resistance);
        });
        return (1/resistance);
      },

      rNominalSeries: function() {
        var resistors = this.getResistors(arguments);
        var resistance = 0;
        $.each(resistors, function(i, resistor){
          resistance += resistor.nominalResistance;
        });
        return resistance;
      },

      rNominalParallel: function() {
        var resistors = this.getResistors(arguments);

        var resistance = 0;
        $.each(resistors, function(i, resistor){
          resistance += (1/resistor.nominalResistance);
        });
        return (1/resistance);
      },

      vDiv: function(x, y){
        var resistors = this.getResistors(arguments);
        return resistors[0].resistance / (resistors[0].resistance + resistors[1].resistance);
      }
    };

    this.cMath = new sparks.circuitMath();

})();
/* FILE inductor.js */
/* FILE reactive-component.js */
/*globals console sparks */

(function () {

  sparks.circuit.ReactiveComponent = function (props, breadBoard) {
    if (typeof props.impedance !== 'undefined') {
      props.impedance = this.getRequestedImpedance( props.impedance );
    }

    sparks.circuit.ReactiveComponent.parentConstructor.call(this, props, breadBoard);

    this.applyFaults();
  };

  sparks.extend(sparks.circuit.ReactiveComponent, sparks.circuit.Component, {

    getComponentParameter: function (componentParameterName, componentParameterFromImpedance) {
      if (typeof this._componentParameter === 'undefined') {
        if (typeof this[componentParameterName] !== 'undefined') {
          this._componentParameter = this[componentParameterName];
        }
        else {
          if (typeof this.impedance === 'undefined' || typeof this.referenceFrequency === 'undefined') {
            throw new Error("An impedance/referenceFrequency pair is needed, but not defined.");
          }

          this._componentParameter = sparks.math.roundToSigDigits(componentParameterFromImpedance(this.impedance, this.referenceFrequency), 3);
        }
      }

      return this._componentParameter;
    },

    applyFaults: function () {
      if (!!this.open){
        this.resistance = 1e20;
        this.addThisToFaults();
      } else if (!!this.shorted) {
        this.resistance = 1e-6;
        this.addThisToFaults();
      } else {
        this.open = false;
        this.shorted = false;
      }

      if (this.resistance > 0) {
        var self = this;
        this.toNetlist = function () {
          var resistance = self.resistance,
              nodes      = self.getNodes();

          return 'R:' + this.UID + ' ' + nodes.join(' ') + ' R="' + resistance + ' Ohm"';
        };
      }
    }

  });

})();
/*globals console sparks */

(function () {

  sparks.circuit.Inductor = function (props, breadBoard) {
    sparks.circuit.Inductor.parentConstructor.call(this, props, breadBoard);
  };

  sparks.extend(sparks.circuit.Inductor, sparks.circuit.ReactiveComponent, {

    getInductance: function () {
      return this.getComponentParameter('inductance', this.inductanceFromImpedance);
    },

    inductanceFromImpedance: function (impedance, frequency) {
      return impedance / (2 * Math.PI * frequency);
    },

    toNetlist: function () {
      var inductance = this.getInductance() || 0,
          nodes      = this.getNodes();

      return 'L:' + this.UID + ' ' + nodes[0] + ' ' + nodes[1] + ' L="' + inductance + ' H"';
    },

    getFlashArguments: function () {
      return ['inductor', this.UID, this.getLocation(), this.label];
    }
  });

})();
/* FILE capacitor.js */
/*globals console sparks */

(function () {

  sparks.circuit.Capacitor = function (props, breadBoard) {
    sparks.circuit.Capacitor.parentConstructor.call(this, props, breadBoard);
  };

  sparks.extend(sparks.circuit.Capacitor, sparks.circuit.ReactiveComponent, {

    getCapacitance: function () {
      return this.getComponentParameter('capacitance', this.capacitanceFromImpedance);
    },

    capacitanceFromImpedance: function (impedance, frequency) {
      return 1 / (impedance * 2 * Math.PI * frequency);
    },

    toNetlist: function () {
      var capacitance = this.getCapacitance() || 0,
          nodes       = this.getNodes();

      return 'C:' + this.UID + ' ' + nodes[0] + ' ' + nodes[1] + ' C="' + capacitance + ' F"';
    },

    getFlashArguments: function () {
      return ['capacitor', this.UID, this.getLocation(), this.label];
    }
  });

})();
/* FILE battery.js */
/*globals console sparks */

(function () {

  sparks.circuit.Battery = function (props, breadBoard) {
    sparks.circuit.Battery.parentConstructor.call(this, props, breadBoard);

    if (this.voltage && this.voltage.length) {
      if (this.voltage.length === 1) {
        this.voltage = this.voltage[0];
      } else {
        var range = this.voltage[1] - this.voltage[0];
        this.voltage = this.voltage[0] + (Math.random() * range);
      }
    }
  };

  sparks.extend(sparks.circuit.Battery, sparks.circuit.Component, {
    toNetlist: function () {
      var voltage = this.voltage || 0,
          nodes      = this.getNodes();

      return 'Vdc:' + this.UID + ' ' + nodes[0] + ' ' + nodes[1] + ' U="' + voltage + ' V"';
    },

    getQucsSimulationType: function() {
      return ".DC:DC1";
    }
  });

})();
/* FILE function-generator.js */
/*globals console sparks */

(function () {

  sparks.circuit.FunctionGenerator = function (props, breadBoard) {
    sparks.circuit.FunctionGenerator.parentConstructor.call(this, props, breadBoard);

    this.amplitudeScaleFactor = 1;

    this.frequency = props.initialFrequency;

    if ( ('undefined' === typeof this.frequency || this.frequency === null) && props.frequencies ) {
      if ('number' === typeof props.frequencies[0]) {
        this.frequency = props.frequencies[0];
      }
      else if (props.frequencies[0] === 'linear' || props.frequencies[0] === 'logarithmic') {
        this.frequency = props.frequencies[1];
      }
    }

    if (props.frequencies) {
      if ('number' === typeof props.frequencies[0]) {
        this.possibleFrequencies = props.frequencies;
      }
      else if (props.frequencies[0] === 'linear' || props.frequencies[0] === 'logarithmic') {
        this.possibleFrequencies = this._calcPossibleFrequencies(props);
      }
    }

    this.baseFrequency = this.frequency;

    if ('undefined' === typeof this.frequency || this.frequency === null) {
      throw new Error("FunctionGenerator: initialFrequency is undefined and an initial frequency could not be inferred from frequency range specification.");
    }

    var amplitude = props.amplitude;
    if ('number' === typeof amplitude){
      this.amplitude = amplitude;
    } else if (amplitude.length && amplitude.length >= 2) {
      this.minAmplitude = amplitude[0];
      this.maxAmplitude = amplitude[1];
      if (amplitude[2]) {
        this.amplitude = amplitude[2];
      } else {
        this.amplitude = (this.minAmplitude + this.maxAmplitude) / 2;
      }
    }
  };

  sparks.extend(sparks.circuit.FunctionGenerator, sparks.circuit.Component, {

    setFrequency: function(frequency) {
      this.frequency = frequency;
      if (sparks.activityController.currentSection.meter) {
        sparks.activityController.currentSection.meter.update();
      }
    },

    setAmplitude: function(newAmplitude) {
      this.amplitudeScaleFactor = newAmplitude / this.amplitude;
      if (sparks.activityController.currentSection.meter) {
        sparks.activityController.currentSection.meter.update();
      }
    },

    getFrequency: function() {
      return this.frequency;
    },

    getAmplitude: function() {
      return this.amplitude * this.amplitudeScaleFactor;
    },

    getPossibleFrequencies: function() {
      return this.possibleFrequencies;
    },

    toNetlist: function () {
      var amplitude = this.amplitude || 0,
          nodes     = this.getNodes();
      return 'Vac:' + this.UID + ' ' + nodes[0] + ' ' + nodes[1] + ' U="' + amplitude + ' V" f="' + this.baseFrequency + '" Phase="0" Theta="0"';
    },

    defaultFrequencySteps: 100,

    getQucsSimulationType: function () {
      var type, nSteps, ret;

      if (this.frequencies && (this.frequencies[0] === 'linear' || this.frequencies[0] === 'logarithmic')) {
        type   = this.frequencies[0] === 'linear' ? 'lin' : 'log';
        nSteps = this.frequencies[3] || this.defaultFrequencySteps;

        return '.AC:AC1 Type="' + type + '" Start="' + this.frequencies[1] + '" Stop="' + this.frequencies[2] + '" Points="' + nSteps + '" Noise="no"';
      }

      if (this.frequencies && typeof this.frequencies[0] === 'number') {

        if (this.frequencies.length === 1) {
          return '.AC:AC1 Type="const" Values="' + this.frequencies[0] + '" Noise="no"';
        }
        else if (this.frequencies.length > 1) {
          return '.AC:AC1 Type="list" Values="[' + this.frequencies.join('; ') + ']" Noise="no"';
        }

      }

    },

    _calcPossibleFrequencies: function(props) {
      var startF   = props.frequencies[1],
          endF     = props.frequencies[2],
          steps    = props.frequencies[3],
          type     = props.frequencies[0],
          diff     = endF - startF,
          multiple = endF / startF,
          stepSize,
          i;

      var frequencies = [];
      if (type === 'linear') {
        stepSize = diff / (steps - 1);
        for (i = 0; i < steps; i++){
          frequencies.push(startF + (stepSize * i));
        }
      } else if (type === 'logarithmic') {
        for (i = 0; i < steps; i++){
          frequencies.push(startF * (Math.pow(multiple, ((i/(steps-1))))));
        }
      }
      return frequencies;
    }

  });

})();

/* FILE battery.js */
/*globals console sparks */

(function () {

  sparks.circuit.Wire = function (props, breadBoard) {
    sparks.circuit.Wire.parentConstructor.call(this, props, breadBoard);
  };

  sparks.extend(sparks.circuit.Wire, sparks.circuit.Component, {
    getColor: function () {
      var location = this.getLocation();
      if (location.indexOf("positive") > -1) {
        return "0xaa0000";
      } else if (location.indexOf("negative") > -1) {
        return "0x000000";
      } else {
        if (Math.random() < 0.5){
          return "0x008800";
        } else {
          return "0x000088";
        }
      }
    },

    toNetlist: function () {
      var voltage = this.voltage || 0,
          nodes      = this.getNodes();

      return 'TLIN:' + this.UID + ' ' + nodes[0] + ' ' + nodes[1] + ' Z="0.000001 Ohm" L="1 mm" Alpha="0 dB"';
    },

    getFlashArguments: function () {
      return ['wire', this.UID, this.getLocation(), this.getColor()];
    }
  });

})();
/* FILE powerlead.js */
/*globals console sparks */

(function () {

  sparks.circuit.PowerLead = function (props, breadBoard) {
    sparks.circuit.PowerLead.parentConstructor.call(this, props, breadBoard);
  };

  sparks.extend(sparks.circuit.PowerLead, sparks.circuit.Component, {

    getColor: function () {
      var location = this.getLocation();
      if (location.indexOf("positive") > -1) {
        return "redPowerWire";
      } else {
        return "blackPowerWire";
      }
    },

    getLocation: function () {
      return this.connections[0].getName() + ",a1";       // Flash coding issue means we need to give this a second argument...
    },

    toNetlist: function () {
      return '';
    },

    getFlashArguments: function () {
      return [this.getColor(), this.UID, this.getLocation()];
    }
  });

})();
/**
 * apMessageBox - apMessageBox is a JavaScript object designed to create quick,
 * easy popup messages in your JavaScript applications.
 *
 * http://www.adampresley.com
 *
 * This file is part of apMessageBox
 *
 * apMessageBox is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * apMessageBox is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with apMessageBox.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @author Adam Presley
 * @copyright Copyright (c) 2010 Adam Presley
 * @param {Object} config
 */
var apMessageBox = apMessageBox || {};

(function($) {

	/**
	 * Basic messagebox functionality. Note that this code relies
	 * on jQuery 1.4 and jQuery UI 1.8. A config object tells this object
	 * how to behave. The config object takes the following arguments:
	 * 	* dialogEl - The name of the dialog <div>. Defaults to "messageDialog"
	 * 	* messageEl - The name of the message <p>. Defaults to "message"
	 * 	* errorImage - Path to an error image icon
	 *  	* informationImage - Path to an information image icon
	 * 	* messageType - Type of message being displayed. Valid values are
	 * 						 "error" and "information"
	 * 	* title - Dialog box title. Defaults to "Notice!"
	 * 	* width - Width of the dialog
	 * 	* height - Height of the dialog
	 * 	* message - The message to display
	 * 	* callback - A method to be executed once the dialog is closed
	 * 	* scope - The scope in which to call the callback method
	 *
	 * @author Adam Presley
	 * @class
	 */
	apMessageBox = function(config)
	{
		/**
		 * Initializes the message box. This uses jQuery UI to do the
		 * dialog box. When the box is closed the added DOM elements
		 * are detached from the DOM.
		 * @author Adam Presley
		 */
		this.initialize = function()
		{
			/*
			 * Call our DOM building method and pass a method to be executed
			 * once the DOM is built. This method will setup the jQuery UI
			 * dialog.
			 */
			__buildDOM(function() {

				$("#" + __config.messageEl).html(__config.message);

				$("#" + __config.dialogEl).dialog({
					modal: true,
					width: __config.width,
					height: __config.height,
					resizable: false,
					close: function(e, ui) {
						$("#" + __config.dialogEl).detach();

						/*
						 * Execute any defined callback.
						 */
						if (__config.callback !== null && __config.callback !== undefined)
						{
							if (__config.scope !== null && __config.scope !== undefined)
							{
								__config.callback.call(__config.scope);
							}
							else
							{
								__config.callback();
							}
						}
					},
					buttons: __config.buttons
				}).css("z-index","100");

			});
		};

		var __buildDOM = function(callback)
		{
			/*
			 * Outer message containing div and message <p>
			 */
			var outer = $("<div />");
			var pEl = $("<p />").attr({
				id: __config.messageEl
			}).css({ "text-align": "left" });
			var img = null;

			/*
			 * If this is an error message attach an error icon.
			 * Otherwise attach an information icon.
			 */
			if (__config.messageType == "error")
			{
				img = $("<img />").attr({
					src: __config.errorImage
				}).css({ "float": "left", "margin-right": "10px" });

				$(outer).append(img);
			}
			else
			{
				img = $("<img />").attr({
					src: __config.informationImage
				}).css({ "float": "left", "margin-right": "10px" });

				$(outer).append(img);
			}

			/*
			 * Append the <p> to the <div>
			 */
			$(outer).append(pEl);

			/*
			 * Build the dialog <div>. Attach the message and icon <div>
			 * to it, then attach the dialog <div> to the body.
			 */
			var dialogEl = $("<div />").attr({
				id: __config.dialogEl,
				title: __config.title
			}).css({
				display: "none"
			});

			$(dialogEl).append(outer);
			$("body").append(dialogEl);

			/*
			 * When all is ready execute our callback which
			 * uses jQuery UI to do the dialog box.
			 */
			$(document).ready(callback);
		};

		var __config = $.extend({
			dialogEl: "messageDialog",
			messageEl: "message",
			errorImage: apMessageBox.errorImage || "error.png",
			informationImage: apMessageBox.informationImage || "information.png",
			messageType: "information",
			title: "Notice!",
			width: 350,
			height: 200,
			message: "",
			callback: null,
			scope: null,
			buttons: {                          // NB: if you write your own buttons, add '$(this).dialog("close");' to the functions.
				Ok: function() {
					$(this).dialog("close");
				}
			}
		}, config);
		var __this = this;

		this.initialize();
	};

	apMessageBox.show = function(config)
	{
		var msg = new apMessageBox(config || {});
	};

	apMessageBox.error = function(config)
	{
		var newConfig = $.extend({
			messageType: "error",
			title: "Error!"
		}, config);

		apMessageBox.show(newConfig);
	};

	apMessageBox.information = function(config)
	{
		var newConfig = $.extend({
			messageType: "information",
			title: "Notice!"
		}, config);

		apMessageBox.show(newConfig);
	};

})(jQuery);

/*globals console sparks */

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
      if (x === 0) {
        return 0;
      }
      var order = Math.ceil(Math.log10(x)),
          factor;

      if (n - order > 0) {
        factor = Math.pow(10, n - order);
        return Math.round(x * factor) / factor;
      } else {
        factor = Math.pow(10, order - n);
        return Math.round(x / factor) * factor;
      }
    };

     math.getRoundedSigDigits = function (x, n) {
         return Math.round(x * Math.pow(10, n - math.leftMostPos(x) - 1));
     };



     Math.log10 = function(x){
       return Math.log(x)/Math.LN10;
     };

     Math.orderOfMagnitude = function(x) {
       if (x === 0) return 0;
       return Math.floor( Math.log(Math.abs(x))/Math.LN10 );
     };

     Math.powNdigits = function(x,n){
       return Math.pow(10,Math.floor(Math.log(x)/Math.LN10-n+1));
     };

     Math.toSigFigs = function(num, sigFigs) {
       num = num.toPrecision(sigFigs);
       return sigFigs > Math.log(num) * Math.LOG10E ? num : ""+parseFloat(num);
     };

     Math.close = function(num, expected, perc) {
       var perc = perc || 5,
            dif = expected * (perc/100);
       return (num >= (expected-dif) && num <= (expected+dif));
     };


     Array.max = function( array ){
         return Math.max.apply( Math, array );
     };
     Array.min = function( array ){
         return Math.min.apply( Math, array );
     };

})();
(function () {
sparks.GAHelper = {};

_gaq = window._gaq;

sparks.GAHelper.USER_TYPE = 1;

sparks.GAHelper.Category = {
  NAVIGATION: "Navigation",
  TUTORIAL: "Tutorial"
}

sparks.GAHelper.setUserLoggedIn = function (isLoggedIn) {
  var userType = isLoggedIn ? "Member" : "Visitor";

  _gaq.push(['_setCustomVar',
    sparks.GAHelper.USER_TYPE,      // This custom var is set to slot #1.  Required parameter.
    'User Type',                    // The name of the custom variable.  Required parameter.
    userType,                       // Sets the value of "User Type" to "Member" or "Visitor" depending on status.  Required parameter.
    2                               // Sets the scope to session-level.  Optional parameter.
   ]);
  _gaq.push(['b._setCustomVar',
    sparks.GAHelper.USER_TYPE,      // This custom var is set to slot #1.  Required parameter.
    'User Type',                    // The name of the custom variable.  Required parameter.
    userType,                       // Sets the value of "User Type" to "Member" or "Visitor" depending on status.  Required parameter.
    2                               // Sets the scope to session-level.  Optional parameter.
   ]);
};

sparks.GAHelper.userStartedLevel = function (levelName) {
   _gaq.push(['_trackEvent',
      sparks.GAHelper.Category.NAVIGATION, // category of activity
      'Started new activity', // Action
      levelName,
   ]);
   _gaq.push(['b._trackEvent',
      sparks.GAHelper.Category.NAVIGATION, // category of activity
      'Started new activity', // Action
      levelName,
   ]);
};

sparks.GAHelper.userRepeatedLevel = function (levelName) {
   _gaq.push(['_trackEvent',
      sparks.GAHelper.Category.NAVIGATION, // category of activity
      'Repeated activity', // Action
      levelName,
   ]);
   _gaq.push(['b._trackEvent',
      sparks.GAHelper.Category.NAVIGATION, // category of activity
      'Repeated activity', // Action
      levelName,
   ]);
};

sparks.GAHelper.userVisitedTutorial = function (tutorialId) {
   _gaq.push(['_trackEvent',
      sparks.GAHelper.Category.TUTORIAL, // category of activity
      'Visited tutorial', // Action
      tutorialId,
   ]);
   _gaq.push(['b._trackEvent',
      sparks.GAHelper.Category.TUTORIAL, // category of activity
      'Visited tutorial', // Action
      tutorialId,
   ]);
};




})();

/* FILE init.js */

/*globals console sparks $ document window onDocumentReady unescape prompt apMessageBox*/

(function () {

  sparks.config.flash_id = 'breadboardActivity1';
  sparks.activity_base_url = "http://couchdb.cosmos.concord.org/sparks/_design/app/_show/activity/";
  sparks.activity_images_base_url = "http://couchdb.cosmos.concord.org/sparks/";
  sparks.tutorial_base_url = "tutorials/";

  window._gaq = window._gaq || [];      // in case this script loads before the GA queue is created

  $(document).ready(function () {
      onDocumentReady();
  });

  this.onDocumentReady = function () {
    if (window.location.pathname.indexOf("class-report") > -1){
      this.loadClassReport();
    } else {
      this.loadActivity();
    }
    this.setupQuitButton();
  };

  this.loadActivity = function () {
    var learner_id = sparks.util.readCookie('learner_id');

    if (learner_id) {
       console.log("setting user "+learner_id);
       var user = {"learner_id": learner_id, "name": sparks.util.readCookie('student_name'),
         "student_id": sparks.util.readCookie('student_id'), "class_id": sparks.util.readCookie('class_id')};
       sparks.couchDS.setUser(user);

       var askConfirm = function(){
         return "Are you sure you want to leave this page?";
       };
       window.onbeforeunload = askConfirm;
    }

    sparks.GAHelper.setUserLoggedIn(!!learner_id);

    var activityName = window.location.hash;
    activityName = activityName.substring(1,activityName.length);
    if (!activityName){
      activityName = "series-interpretive";
    }

    console.log("loading "+activityName);
    sparks.couchDS.loadActivity(activityName, function(activity) {
      console.log(activity);
      var ac = new sparks.ActivityConstructor(activity);
    });

    this.initActivity = function () {
        sparks.flash.init();
        if (!!sparks.activity.view) {
          sparks.activity.view.setFlashLoaded(true);
        }
    };
  };

  this.loadClassReport = function () {
    var classStudents,
        learnerIds = [],
        activity,
        classId;
    if (!!sparks.util.readCookie('class')){
      classId = sparks.util.readCookie('class');
      activity = unescape(sparks.util.readCookie('activity_name')).split('#')[1];
      classStudents = eval(unescape(sparks.util.readCookie('class_students')).replace(/\+/g," "));
      for (var i=0, ii=classStudents.length; i < ii; i++){
        learnerIds.push(classStudents[i].id);
      }
    } else {
      activity = prompt("Enter the activity id", "series-parallel-g1");                       // series-resistances
      classStudents = prompt("Enter a list of learner ids", "568,569");        // 212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228
      learnerIds = classStudents.split(',');
    }

    sparks.classReportController.getClassData(
      activity,
      learnerIds,
      classId,
      function(reports) {
        $('#loading').hide();
        var view = new sparks.ClassReportView(),
            $report = view.getClassReportView(reports);
        $('#report').append($report);
        $("#print-link").show();
      });
  };

  this.setupQuitButton = function () {
    $('#return_to_portal').click(function() {
      if (!!sparks.couchDS.user) {
        sparks.reportController.saveData();
        apMessageBox.information({
        	title: "Ready to leave?",
        	message: "All your work up until this page has been saved.",
        	informationImage: "lib/information-32x32.png",
        	width: 400,
        	height: 200,
        	buttons: {
        	  "Go to the portal": function () {
        	    $(this).dialog("close");
        	    window.onbeforeunload = null;
              window.location.href = "http://sparks.portal.concord.org";
        	  },
        	  "Keep working": function() {
        	    $(this).dialog("close");
        	  }
        	}
        });
      } else {
        window.onbeforeunload = null;
        window.location.href = "http://sparks.portal.concord.org";
      }
    });
  };
})();
