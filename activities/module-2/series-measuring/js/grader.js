//= require "setup-common"
//= require "feedback"

/* FILE grader.js */

(function () {

    var sm = sparks.activities.sm;

    sm.Grader = function (session, rubric) {
        this.session = session;
        this.rubric = rubric;
        
        this.feedback = new sm.Feedback(rubric);
    };

    sm.Grader.prototype = {

        grade: function () {
            return this.feedback;
        }
        
    };
    
})();
