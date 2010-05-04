function SessionReporter()
{
}

SessionReporter.prototype =
{
    red : '#cc3300',
    red2 : '#cc9933',
    orange : '#ff6600',
    blue : '#0099cc',
    green :'#339933',

    dialLabels : { r_2000k: '\u2126 - 2000k',
        r_200k: '\u2126 - 200k',
        r_20k: '\u2126 - 20k',
        r_2000: '\u2126 - 2000',
        r_200: '\u2126 - 200',
        dcv_1000: 'DCV - 1000',
        dcv_200: 'DCV - 200',
        dcv_20: 'DCV - 20',
        dcv_2000m: 'DCV - 2000m',
        dcv_200m: 'DCV - 200m',
        acv_750: 'ACV - 750',
        acv_200: 'ACV - 200',
        p_9v: '1.5V 9V',
        dca_200mc: 'DCA - 200\u03bc',
        dca_2000mc: 'DCA - 2000\u03bc',
        dca_20m: 'DCA - 20m',
        dca_200m: 'DCA - 200m',
        c_10a: '10A',
        hfe: 'hFE',
        diode: 'Diode'
    },
    
    report : function(session, feedback) {
        var text = '';
        var questions = session.sections[0].questions;
        var points = 0;
        var color;
        
        var fb = feedback.root.reading.rated_r_value;
        $('#rated_r_correct').text(Unit.res_str(questions[0].correct_answer));
        text = questions[0].answer ? questions[0].answer + questions[0].unit : 'No Answer';
        this.setAnswerTextWithColor('#rated_r_answer', text, fb);
        $('#rated_r_points').text(fb.getPoints() + ' out of ' + fb.getMaxPoints());
        points = fb.getPoints();
                
        fb = feedback.root.reading.rated_t_value;
        $('#rated_t_correct').text(questions[1].correct_answer * 100 + '%');
        text = questions[1].answer ? questions[1].answer + questions[1].unit : 'No Answer';
        this.setAnswerTextWithColor('#rated_t_answer', text, fb);
        
        $('#reading_pts').text(points + fb.points);
        
        fb = feedback.root.t_range.t_range_value;
        $('#t_range_correct').text(Unit.res_str(questions[3].correct_answer[0]) + ' .. ' + Unit.res_str(questions[3].correct_answer[1]));
        text = (questions[3].answer[0] || questions[3].answer[1]) ? String(questions[3].answer[0]) + questions[3].unit[0] + ' .. ' + questions[3].answer[1] + questions[3].unit[1] : 'No Answer';
        this.setAnswerTextWithColor('#t_range_answer', text, fb);
        $('#t_range_pts').text(fb.points);
        
        fb = feedback.root.t_range.within_tolerance;
        $('#within_correct').text(questions[4].correct_answer);
        text = questions[4].answer ? questions[4].answer : 'No Answer';
        this.setAnswerTextWithColor('#within_answer', text, fb);
        $('#within_pts').text(fb.points);

        fb = feedback.root.time.reading_time;
        points = fb.points;
        this.setAnswerTextWithColor('#reading_time', sparks.util.timeLapseStr(questions[0].start_time, questions[1].end_time), fb);

        fb = feedback.root.time.measuring_time;
        this.setAnswerTextWithColor('#measuring_time', sparks.util.timeLapseStr(questions[2].start_time, questions[2].end_time), fb);
        
        $('#time_pts').text(points + fb.points);
        
        var measuring_pts = 0;
        
        fb = feedback.root.measuring.probe_connection;
        if (fb.correct == 4) {
            this.setTextWithColor('#probe_connection', fb.desc , this.green);
        }
        else {
            this.setTextWithColor('#probe_connection', fb.desc, this.red);
        }
        //$('#probe_connection_pts').text(fb.points);
        measuring_pts += fb.points;
        
        fb = feedback.root.measuring.plug_connection;
        if (fb.correct) {
            this.setTextWithColor('#plug_connection', fb.desc, this.green);
        }
        else {
            this.setTextWithColor('#plug_connection', fb.desc, this.red);
        }
        //$('#plug_connection_pts').text(fb.points);
        measuring_pts += fb.points;

        var i_knob = feedback.initial_dial_setting;
        var f_knob = feedback.submit_dial_setting;
        var o_knob = feedback.optimal_dial_setting;
        
        $('#correct_knob').text(this.dialLabels[feedback.optimal_dial_setting]);
        
        if (i_knob == o_knob) {
        	color = this.green;
        }
        else if (sparks.activities.mr.Grader.prototype.isResistanceKnob(i_knob)) {
        	color = this.orange;
        }
        else {
        	color = this.red;
        }
        this.setTextWithColor('#initial_knob', this.dialLabels[feedback.initial_dial_setting], color);
        
        if (f_knob == o_knob) {
        	color = this.green;
        }
        else if (sparks.activities.mr.Grader.prototype.isResistanceKnob(f_knob)) {
        	color = this.orange;
        }
        else {
        	color = this.red;
        }
        this.setTextWithColor('#final_knob', this.dialLabels[feedback.submit_dial_setting], color);
        
        if (feedback.root.measuring.power_switch.correct == 4) {
        	this.setTextWithColor('#power_switch', 'On', this.green);
        }
        else {
        	this.setTextWithColor('#power_switch', 'Off', this.red);
        }
        
        //console.log('initial=' + this.log.getInitialDialSetting());
        //console.log('final=' + this.log.getFinalDialSetting());
        
        fb = feedback.root.measuring.measured_r_value;
        $('#measured_r_correct').text(Unit.res_str(questions[2].correct_answer));
        text = questions[2].answer ? questions[2].answer + questions[2].unit : 'No Answer';
        this.setAnswerTextWithColor('#measured_r_answer', text, fb);
        
        fb = feedback.root.measuring.task_order;
        if (fb.correct == 4) {
        	this.setTextWithColor('#task_order', 'Correct', this.green);
        }
        else {
        	this.setTextWithColor('#task_order', 'Incorrect', this.red);
        }
        
        //$('#measuring_pts').text(measuring_pts);
        $('#measuring_pts').text(feedback.root.measuring.getPoints());
        $('#measuring_max_pts').text(feedback.root.measuring.getMaxPoints());
        
        $('#total_pts').text(feedback.root.getPoints());
        $('#total_max_pts').text(feedback.root.getMaxPoints());
    },
    
    setAnswerTextWithColor : function(elemId, text, feedback) {
        var color;
        switch (feedback.correct)
        {
        case 0: color = this.red; break;
        case 1: color = this.red2; break;
        case 2: color = this.orange; break;
        case 3: color = this.blue; break;
        case 4: color = this.green; break;
        }
        this.setTextWithColor(elemId, text, color);
    },

    setTextWithColor : function(elemId, text, color) {
        $(elemId).text(text);
        $(elemId).attr('style', 'color: ' + color + ';');
    }
};
