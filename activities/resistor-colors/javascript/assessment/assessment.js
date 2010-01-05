/* The following line (global) is for JSLint */
/*global console, Grader */

function FeedbackItem()
{
    this.correct = null;
    this.label = '';
    this.points = 0;
    this.maxPoints = 0;
}

function Assessment(activity, log)
{
    //console.log('ENTER Assessment');
    this.activity = activity;
    this.log = log;
    this.feedback = this.defineFeedback();

    this.grader = new Grader(activity, this.log, this.feedback);
}
Assessment.prototype =
{
    feedback_keys : [
        'rated_r_value',
        'rated_r_time',
        'rated_t_value',
        'rated_t_time',
        'measured_r_value',
        'measured_r_time',
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
