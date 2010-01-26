/* The following line (global) is for JSLint */
/*global console, $, Unit, Util */

function Reporter(assessment)
{
    //console.log('ENTER Reporter');
    
    this.assessment = assessment;
    this.log = assessment.log;
    this.grader = assessment.grader;
    this.activity = assessment.activity;
}

Reporter.prototype =
{
    dialLabels : { r_2000k: '\u2126 2000k',
        r_200k: '\u2126 - 200k',
        r_20k: '\u2126 - 20k',
        r_2000: '\u2126 - 2000',
        r_200: '\u2126 - 200'
    },
    
    reportOnSession : function(sessionNum) {
        var reporter = this;
        $("#report").load("report-templates/report-section.html", {}, function() {
            reporter.sessionReport(sessionNum);
            $('#report').data('title.dialog', 'Report for Resistor #' + sessionNum);
            $('#report').dialog('open');
        });
    },
    
    sessionReport : function(sessionNum) {
        var text = '';
        var questions = this.log.currentSession().sections[0].questions;
        var points = 0;
        
        var feedback = this.assessment.feedback.rated_r_value;
        $('#rated_r_correct').text(Unit.res_str(questions[0].correct_answer));
        text = questions[0].answer ? questions[0].answer + questions[0].unit : 'No Answer';
        this.setAnswerTextWithColor('#rated_r_answer', text, questions[0]);
        points = feedback.points;
                
        feedback = this.assessment.feedback.rated_t_value;
        $('#rated_t_correct').text(questions[1].correct_answer * 100 + '%');
        text = questions[1].answer ? questions[1].answer + questions[1].unit : 'No Answer';
        this.setAnswerTextWithColor('#rated_t_answer', text, questions[1]);
        
        $('#reading_pts').text(points + feedback.points);
        
        feedback = this.assessment.feedback.t_range_value;
        $('#t_range_correct').text(Unit.res_str(questions[3].correct_answer[0]) + ' .. ' + Unit.res_str(questions[3].correct_answer[1]));
        text = (questions[3].answer[0] || questions[3].answer[1]) ? questions[3].answer[0] + questions[3].unit[0] + ' .. ' + questions[3].answer[1] + questions[3].unit[1] : 'No Answer';
        this.setAnswerTextWithColor('#t_range_answer', text, questions[3]);
        $('#t_range_pts').text(feedback.points);
        
        feedback = this.assessment.feedback.within_tolerance;
        $('#within_correct').text(questions[4].correct_answer);
        text = questions[4].answer ? questions[4].answer : 'No Answer';
        this.setAnswerTextWithColor('#within_answer', text, questions[4]);
        $('#within_pts').text(feedback.points);

        feedback = this.assessment.feedback.reading_time;
        points = feedback.points;
        $('#reading_time').text(Util.timeLapseStr(questions[0].start_time, questions[1].end_time));
        //$('#reading_time_pts').text(points);

        feedback = this.assessment.feedback.measuring_time;
        $('#measuring_time').text(Util.timeLapseStr(questions[2].start_time, questions[2].end_time));
        //$('#measuring_time_pts').text(feedback.points);
        
        $('#time_pts').text(points + feedback.points);
        
        var measuring_pts = 0;
        
        feedback = this.assessment.feedback.probe_connection;
        if (feedback.correct) {
            this.setTextWithColor('#probe_connection', feedback.desc , '#339933');
        }
        else {
            this.setTextWithColor('#probe_connection', feedback.desc, '#cc3300');
        }
        //$('#probe_connection_pts').text(feedback.points);
        measuring_pts += feedback.points;
        
        feedback = this.assessment.feedback.plug_connection;
        if (feedback.correct) {
            this.setTextWithColor('#plug_connection', feedback.desc, '#339933');
        }
        else {
            this.setTextWithColor('#plug_connection', feedback.desc, '#cc3300');
        }
        //$('#plug_connection_pts').text(feedback.points);
        measuring_pts += feedback.points;
        
        $('#correct_knob').text(this.dialLabels[this.grader.optimalDial(this.activity.resistor.realValue)]);
        
        console.log('initial=' + this.log.getInitialDialSetting());
        console.log('final=' + this.log.getFinalDialSetting());
        
        $('#measured_r_correct').text(Unit.res_str(questions[2].correct_answer));
        text = questions[2].answer ? questions[2].answer + questions[2].unit : 'No Answer';
        this.setAnswerTextWithColor('#measured_r_answer', text, questions[2]);
        
        //$('#measuring_pts').text(measuring_pts);
        $('#measuring_pts').text('45');
        
        //$('#report_log').html(this.reportLog());
    },
    
    setAnswerTextWithColor : function(elemId, text, question) {
        var color = question.correct ? '#339933' : '#cc3300';
        console.log('TEXT=' + text + '   !!!!!!!!!!!!!!!!!!!!!!!!');
        this.setTextWithColor(elemId, text, color);
    },

    setTextWithColor : function(elemId, text, color) {
        $(elemId).text(text);
        $(elemId).attr('style', 'color: ' + color + ';');
    },
    
    reportLog : function() {
        var t = '<h4>Activity Log</h4><pre>';
        var events = this.log.currentSession().events;
        
        t += this.log.formatDate(this.log.currentSession().start_time) + ' - Resistor 1 Start<br/>';
        for (var i = 0; i < events.length; ++i) {
            t += this.log.formatDate(events[i].time) + ' - ' + events[i].name + ': ' + events[i].value.split('|').join(', ') + '<br/>';
        }
        t += this.log.formatDate(this.log.currentSession().end_time) + ' - Resistor 1 End<br/>';
        return t;
    }
};
