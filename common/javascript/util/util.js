/* The following line (global) is for JSLint */
/*global jQuery */

var Util = {};

// The "next" function returns a different value each time
// alternating between the two input values x, y.
Util.Alternator = function(x, y)
{
    this.x = x;
    this.y = y;
    this.cnt = 0;
};
Util.Alternator.prototype =
{
    next : function() {
        ++this.cnt;
        return this.cnt % 2 == 1 ? this.x : this.y;
    }
};

// Return a string representation of time lapsed between start and end
Util.timeLapseStr = function(start, end) {
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
Util.serializeForm = function(form) {
    var result = {};
    form.map(function(){
     return this.elements ? jQuery.makeArray(this.elements) : this;
    })
    .filter(function(){
     return this.name &&
       (this.checked || /select|textarea/i.test(this.nodeName) ||
        /text|hidden|password|search/i.test(this.type));
    })
    .each(function(i){
     var val = jQuery(this).val();
     if(val === null){
       return;
     }
     
     if(jQuery.isArray(val)){
       result[this.name] = jQuery.makeArray(val);
     } else {
       result[this.name] = val;
     }
    });
    return result;
};
