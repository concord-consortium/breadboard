/* The following line (global) is for JSLint */

/*global console, Grader */

/*
 * A FeedbackItem is contains derived information from the activity log:
 * Grader parses the activity log and populates feedback items.
 * Reporter uses feedback items to generate the report.
 */
function FeedbackItem()
{
    this.correct = null;
    this.label = '';
    this.desc = '';
    this.points = 0;
    this.maxPoints = 0;
}

function Feedback() {
    this.rated_r_value = new FeedbackItem();
    this.rated_t_value = new FeedbackItem();
    this.reading_time = new FeedbackItem();
    this.measured_r_value = new FeedbackItem();
    this.measuring_time = new FeedbackItem();
    this.t_range_value = new FeedbackItem();
    this.within_tolerance = new FeedbackItem();
    this.probe_connection = new FeedbackItem();
    this.plug_connection = new FeedbackItem();
}

/* 
 * Meant to hold everything needed for grading, such as rubric and grading
 * routines. Since there's no rubric objects defined yet, it may appear to
 * offer little more than Grader.
 */
function Assessment(activity)
{
    //console.log('ENTER Assessment');
    this.activity = activity;
    this.log = activity.log;
}
Assessment.prototype =
{
    grade : function(session) {
        var grader = new Grader(session);
        return grader.grade(session);
    },
    
    receiveResultFromHTML : function(resultObj) {
        var section = this.log.currentSession().sections[0];
        var questions = section.questions;
        var value;
        
        value = resultObj.rated_resistance.value;
        questions[0].answer = this.fieldIsEmpty(value) ? null : Number(value);
        questions[0].correct_answer = section.nominal_resistance;
        
        value = resultObj.rated_resistance.units;
        questions[0].unit = this.fieldIsEmpty(value) ? null : value;
        
        value = resultObj.rated_tolerance.value;
        questions[1].answer = this.fieldIsEmpty(value) ? null : Number(value);
        questions[1].unit = '%';
        questions[1].correct_answer = section.tolerance;
        
        value = resultObj.measured_resistance.value;
        questions[2].answer = this.fieldIsEmpty(value) ? null : Number(value);
        
        value = resultObj.measured_resistance.units;
        questions[2].unit = this.fieldIsEmpty(value) ? null : value;
        
        questions[2].correct_answer = section.displayed_resistance;
        
        questions[3].answer = [];
        value = resultObj.measured_tolerance.min;
        questions[3].answer[0] = this.fieldIsEmpty(value) ? null : Number(value);
        
        value = resultObj.measured_tolerance.max;
        questions[3].answer[1] = this.fieldIsEmpty(value) ? null : Number(value);
        
        questions[3].unit = [];
        value = resultObj.measured_tolerance.min_unit;
        questions[3].unit[0] = this.fieldIsEmpty(value) ? null : value;
        
        value = resultObj.measured_tolerance.max_unit;
        questions[3].unit[1] = this.fieldIsEmpty(value) ? null : value;
        
        value = resultObj.within_tolerance.value;
        questions[4].answer = this.fieldIsEmpty(value) ? null : value;
    },
    
    sendResultToHTML : function(resultObj, feedback) {
        resultObj.rated_resistance.correct = feedback.rated_r_value.correct;
        resultObj.rated_tolerance.correct = feedback.rated_t_value.correct;
        resultObj.measured_resistance.correct = feedback.measured_r_value.correct;
        resultObj.measured_tolerance.correct = feedback.t_range_value.correct;
        resultObj.within_tolerance.correct = feedback.within_tolerance.correct;
    },

    fieldIsEmpty : function(formInput) {
        return formInput === null || formInput === undefined || formInput.length < 1;
    }
};
