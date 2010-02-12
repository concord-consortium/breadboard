/* The following line (global) is for JSLint */
/*global console, $, Unit, Util */

function Reporter(assessment)
{
    //console.log('ENTER Reporter');
    this.activity = assessment.activity;
    this.log = assessment.activity.log;
}

Reporter.prototype =
{
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
    
    reportOnSession : function(session, sessionNum, feedback) {
        var reporter = this;
        var template = this.activity.root_dir +
        	'/report-templates/report-section.html';
        $("#report").load(template, '', function() {
            reporter.sessionReport(session, feedback);
            $('#report').data('title.dialog', 'Performance Report');
            $('#report').dialog('open');
        });
    },
    
    sessionReport : function(session, feedback) {
        var text = '';
        var questions = session.sections[0].questions;
        var points = 0;
        
        var fb = feedback.root.reading.rated_r_value;
        $('#rated_r_correct').text(Unit.res_str(questions[0].correct_answer));
        text = questions[0].answer ? questions[0].answer + questions[0].unit : 'No Answer';
        this.setAnswerTextWithColor('#rated_r_answer', text, fb);
        points = fb.points;
                
        fb = feedback.root.reading.rated_t_value;
        $('#rated_t_correct').text(questions[1].correct_answer * 100 + '%');
        text = questions[1].answer ? questions[1].answer + questions[1].unit : 'No Answer';
        this.setAnswerTextWithColor('#rated_t_answer', text, fb);
        
        $('#reading_pts').text(points + fb.points);
        
        fb = feedback.root.t_range_value;
        $('#t_range_correct').text(Unit.res_str(questions[3].correct_answer[0]) + ' .. ' + Unit.res_str(questions[3].correct_answer[1]));
        text = (questions[3].answer[0] || questions[3].answer[1]) ? String(questions[3].answer[0]) + questions[3].unit[0] + ' .. ' + questions[3].answer[1] + questions[3].unit[1] : 'No Answer';
        this.setAnswerTextWithColor('#t_range_answer', text, fb);
        $('#t_range_pts').text(fb.points);
        
        fb = feedback.root.within_tolerance;
        $('#within_correct').text(questions[4].correct_answer);
        text = questions[4].answer ? questions[4].answer : 'No Answer';
        this.setAnswerTextWithColor('#within_answer', text, fb);
        $('#within_pts').text(fb.points);

        fb = feedback.root.time.reading_time;
        points = fb.points;
        $('#reading_time').text(Util.timeLapseStr(questions[0].start_time, questions[1].end_time));
        //$('#reading_time_pts').text(points);

        fb = feedback.root.time.measuring_time;
        $('#measuring_time').text(Util.timeLapseStr(questions[2].start_time, questions[2].end_time));
        //$('#measuring_time_pts').text(fb.points);
        
        $('#time_pts').text(points + fb.points);
        
        var measuring_pts = 0;
        
        fb = feedback.root.measuring.probe_connection;
        if (fb.correct) {
            this.setTextWithColor('#probe_connection', fb.desc , '#339933');
        }
        else {
            this.setTextWithColor('#probe_connection', fb.desc, '#cc3300');
        }
        //$('#probe_connection_pts').text(fb.points);
        measuring_pts += fb.points;
        
        fb = feedback.root.measuring.plug_connection;
        if (fb.correct) {
            this.setTextWithColor('#plug_connection', fb.desc, '#339933');
        }
        else {
            this.setTextWithColor('#plug_connection', fb.desc, '#cc3300');
        }
        //$('#plug_connection_pts').text(fb.points);
        measuring_pts += fb.points;
        
        $('#correct_knob').text(this.dialLabels[feedback.optimal_dial_setting]);
        $('#initial_knob').text(this.dialLabels[feedback.initial_dial_setting]);
        $('#final_knob').text(this.dialLabels[feedback.submit_dial_setting]);
        $('#power_switch').text(feedback.root.measuring.power_switch.correct ? 'On' : 'Off')
        
        //console.log('initial=' + this.log.getInitialDialSetting());
        //console.log('final=' + this.log.getFinalDialSetting());
        
        fb = feedback.root.measuring.measured_r_value;
        $('#measured_r_correct').text(Unit.res_str(questions[2].correct_answer));
        text = questions[2].answer ? questions[2].answer + questions[2].unit : 'No Answer';
        this.setAnswerTextWithColor('#measured_r_answer', text, fb);
        
        fb = feedback.root.measuring.task_order;
        $('#task_order').text(fb.correct ? 'Correct' : 'Incorrect');
        
        //$('#measuring_pts').text(measuring_pts);
        $('#measuring_pts').text(feedback.root.measuring.getPoints());
        $('#measuring_max_pts').text(feedback.root.measuring.getMaxPoints());
        
        $('#total_pts').text(feedback.root.getPoints());
        $('#total_max_pts').text(feedback.root.getMaxPoints());
    },
    
    setAnswerTextWithColor : function(elemId, text, feedback) {
        var color = feedback.correct ? '#339933' : '#cc3300';
        this.setTextWithColor(elemId, text, color);
    },

    setTextWithColor : function(elemId, text, color) {
        $(elemId).text(text);
        $(elemId).attr('style', 'color: ' + color + ';');
    }
};
