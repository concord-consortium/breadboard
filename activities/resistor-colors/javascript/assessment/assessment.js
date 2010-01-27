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

/* 
 * Meant to hold everything needed for grading, such as rubric and grading
 * routines. Since there's no rubric objects defined yet, it may appear to
 * offer little more than Grader.
 */
function Assessment(activity)
{
    //console.log('ENTER Assessment');
    this.activity = activity;
    this.feedback = this.defineFeedback();

    this.grader = new Grader(activity, this.feedback);
}
Assessment.prototype =
{
    feedback_keys : [
        'rated_r_value',
        'rated_t_value',
        'reading_time',
        'measured_r_value',
        'measuring_time',
        't_range_value',
        'within_tolerance',
        'probe_connection',
        'plug_connection'
    ],
        
    defineFeedback : function() {
        var map = {};
        for (var i = 0; i < this.feedback_keys.length; ++i) {
            map[this.feedback_keys[i]] = new FeedbackItem();
        }
        return map;
    }
};
