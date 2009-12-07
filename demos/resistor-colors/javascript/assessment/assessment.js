function FeedbackItem()
{
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
        'rated_t_time',
        'measured_r_value',
        'measured_r_time',
        'rated_r1_time', // Time taken answering 'rated resistance' question for resistor 1
        'rated_r2_time', // Time taken answering 'rated resistance' question for resistor 2
        'rated_r3_time',  // Time taken answering 'rated resistance' question for resistor 3
        'rated_t1_time',
        'rated_t2_time',
        'rated_t3_time',
        'measured_r1_time',
        'measured_r2_time',
        'measured_r3_time'
    ],
        
    defineFeedback : function() {
        map = {}
        for (var i in this.feedback_keys) {
            map[this.feedback_keys[i]] = new FeedbackItem();
        }
        return map;
    }
}
