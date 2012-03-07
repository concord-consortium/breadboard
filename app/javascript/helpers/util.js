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

// The "next" function returns a different value each time
// alternating between the two input values x, y.
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

// Return a string representation of time lapsed between start and end
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

// Returns a string representation of the input date
// date: either a Date or a number in milliseconds
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

// Pretty print an object. Mainly intended for debugging JSON objects
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
        //get it from server
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

// When we define, say, a logaritmic sweep of frequencies, we calculate them on our end
// for the function generator, and QUCS generates them on its end after being given a
// simulation type. These two series may not be exactly the same after accounting for
// different precisions, so we want to pick the QUCS value that's closest to what we
// think we're generating. So, if we think we're generating 1002.2 Hz, and QUCS comes back
// with [1000, 1002.22222, 1003.33333], we want to return the index '1'
//
// @array an array of numbers, complex or real
// @actual the number we want
// @isComplex whether the numbers in the array are complex or real
sparks.util.getClosestIndex = function(array, actual, isComplex) {
  var minDiff = Infinity,
      index;
  // this could be shortened as a CS exercise, but it takes 0 ms over an array of
  // 10,000 so it's not really worth it...
  for (var i = 0, ii = array.length; i < ii; i++){
    var diff = isComplex ? Math.abs(array[i].real - actual) : Math.abs(array[i] - actual);
    if (diff < minDiff){
      minDiff = diff;
      index = i;
    }
  }
  return index;
};

////// data work

sparks.data;

sparks.getDataArray = function(){
  sparks.data = [];
  $.couch.urlPrefix = "/couchdb/learnerdata";
  $.couch.db('').view(
    "session_scores/Scores%20per%20activity", 
    {
      success: function(response) { 
        $.each(response.rows, function(i, obj) {
            // if (sparks.util.contains(obj.key, activityName)) {
              sparks.data.push(obj);
            // }
          }
        );
        console.log("done");
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