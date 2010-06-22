//= require <util>
//= require "setup-common"

/* FILE feedback.js */

(function () {

    var util = sparks.util;
    var sm = sparks.activities.sm;

    // rubric is a json object
    sm.Feedback = function (rubric) {
        this.root = util.cloneSimpleObject(rubric);
        //console.log(JSON.stringify(this.root));
    };
    
    sm.Feedback.prototype = {

    };

})();
