/* The following line (global) is for JSLint */
/*global console, $, Unit, Util */

function Reporter(assessment)
{
    //console.log('ENTER Reporter');
    
    this.assessment = assessment;
    this.log = this.assessment.log;
}

Reporter.prototype =
{
    assessment : null,
    log : null,
    
    reportOnSection : function(sectionNum) {
        var reporter = this;
        $("#report").load("report-templates/report-section.html", {}, function() {
            reporter.sectionReport(sectionNum);
            $('#report').data('title.dialog', 'Report for Resistor #' + sectionNum);
            $('#report').dialog('open');
        });
    },
    
    sectionReport : function(sectionNum) {
        var text = '';
        var questions = this.log.currentSection().questions;
        
        var feedback = this.assessment.feedback.rated_r_value;
        $('#rated_r_correct').text(Unit.res_str(questions[0].correct_answer));
        text = questions[0].answer ? questions[0].answer + questions[0].unit : 'No Answer';
        this.setAnswerTextWithColor('#rated_r_answer', text, questions[0]);
        $('#rated_r_pts').text(feedback.points + ' (' + feedback.label + ')');
        
        $('#rated_t_correct').text(questions[1].correct_answer * 100 + '%');
        text = questions[1].answer ? questions[1].answer + questions[1].unit : 'No Answer';
        this.setAnswerTextWithColor('#rated_t_answer', text, questions[1]);
        
        feedback = this.assessment.feedback.measured_r_value;
        $('#measured_r_correct').text(Unit.res_str(questions[2].correct_answer));
        text = questions[2].answer ? questions[2].answer + questions[2].unit : 'No Answer';
        this.setAnswerTextWithColor('#measured_r_answer', text, questions[2]);
        $('#measured_r_pts').text(feedback.points + ' (' + feedback.label + ')');
        
        feedback = this.assessment.feedback.t_range_value;
        $('#t_range_correct').text(Unit.res_str(questions[3].correct_answer[0]) + ' .. ' + Unit.res_str(questions[3].correct_answer[1]));
        text = (questions[3].answer[0] || questions[3].answer[1]) ? questions[3].answer[0] + questions[3].unit[0] + ' .. ' + questions[3].answer[1] + questions[3].unit[1] : 'No Answer';
        this.setAnswerTextWithColor('#t_range_answer', text, questions[3]);
        $('#t_range_pts').text(feedback.points + ' (' + feedback.label + ')');
        
        feedback = this.assessment.feedback.within_tolerance;
        $('#within_correct').text(questions[4].correct_answer);
        text = questions[4].answer ? questions[4].answer : 'No Answer';
        this.setAnswerTextWithColor('#within_answer', text, questions[4]);
        $('#within_pts').text(feedback.points + ' (' + feedback.label + ')');
        
        //var feedback = this.assessment.feedback.rated_r + sectionNum + '_time'];
        feedback = this.assessment.feedback.rated_r_time;
        $('#rated_r_time').text(Util.timeLapseStr(questions[0].start_time, questions[0].end_time));
        $('#rated_r_time_pts').text(feedback.points + ' (' + feedback.label + ')');

        //feedback = this.assessment.feedback.rated_t + sectionNum + '_time'];
        feedback = this.assessment.feedback.rated_t_time;
        $('#rated_t_time').text(Util.timeLapseStr(questions[1].start_time, questions[1].end_time));
        $('#rated_t_time_pts').text(feedback.points + ' (' + feedback.label + ')');
        
        //feedback = this.assessment.feedback.measured_r + sectionNum + '_time'];
        feedback = this.assessment.feedback.measured_r_time;
        $('#measured_r_time').text(Util.timeLapseStr(questions[2].start_time, questions[2].end_time));
        $('#measured_r_time_pts').text(feedback.points + ' (' + feedback.label + ')');
        
        if (this.assessment.feedback.probe_connection.correct) {
            this.setTextWithColor('#probe_connection', 'Yes', '#339933');
        }
        else {
            this.setTextWithColor('#probe_connection', 'No', '#cc3300');
        }
        
        if (this.assessment.feedback.plug_connection.correct) {
            this.setTextWithColor('#plug_connection', 'Yes', '#339933');
        }
        else {
            this.setTextWithColor('#plug_connection', 'No', '#cc3300');
        }
        
        /* The feedback link is shown next to the question instead
        var ratedValuesFeedback = $('#rated_values_feedback');
        
        if (questions[0].correct && questions[1].correct) {
            ratedValuesFeedback.hide();
        }
        else {
            var t = '';
            if (!questions[0].correct) {
                if (!questions[1].correct) {
                    t = 'Your submitted values of rated resistance and tolerance were incorrect. ';
                }
                else {
                    t = 'Your submitted value of rated resistance was incorrect. '
                }
            }
            else if (!questions[1].correct) {
                t = 'Your submitted value of rated tolerance was incorrect. '
            }
            t += '<br/>Click <a target="feedback" href="../../common/resources/hint1_colorcode.html">here</a> to review the color code.';
            ratedValuesFeedback.html(t);
            ratedValuesFeedback.show();
        }
        */
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
        var events = this.log.currentSection().events;
        
        t += this.log.formatDate(this.log.currentSection().start_time) + ' - Resistor 1 Start<br/>';
        for (var i = 0; i < events.length; ++i) {
            t += this.log.formatDate(events[i].time) + ' - ' + events[i].name + ': ' + events[i].value.split('|').join(', ') + '<br/>';
        }
        t += this.log.formatDate(this.log.currentSection().end_time) + ' - Resistor 1 End<br/>';
        return t;
    }
};
