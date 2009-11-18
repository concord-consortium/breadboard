function Reporter(assessment)
{
    //console.log('ENTER Reporter');
    
    this.assessment = assessment;
    this.log = this.assessment.log;
    //console.log('assessment=' + this.assessment + ' log=' + this.log);

}

Reporter.prototype =
{
    assessment : null,
    log : null,
    
    // Load the html template with the report 
    report : function() {
        var date = new Date(this.log.start_time);
        $('#report_date').html(date.toLocaleDateString());
        //$('#report_link_1').click(function() { alert(this.msg1); });
        this.detail();
        $('#report_log').html(this.reportLog());
    },
    
    // Populate the indicator table
    detail : function() {
        var sections = this.log.sections;
        
        // Section 1
        var questions = sections[0].questions;
        $('#rated_r1_correct').text(Unit.res_str(questions[0].correct_answer));
        this.setAnswerTextWithColor('#rated_r1_answer', questions[0].answer + questions[0].unit, questions[0]);
        
        $('#rated_t1_correct').text(questions[1].correct_answer * 100 + '%');
        this.setAnswerTextWithColor('#rated_t1_answer', questions[1].answer + questions[1].unit, questions[1]);
        
        $('#measured_r1_correct').text(Unit.res_str(questions[2].correct_answer));
        this.setAnswerTextWithColor('#measured_r1_answer', questions[2].answer + questions[2].unit, questions[2]);
        
        $('#t_range1_correct').text(Unit.res_str(questions[3].correct_answer[0]) + ' .. ' + Unit.res_str(questions[3].correct_answer[1]));
        this.setAnswerTextWithColor('#t_range1_answer', questions[3].answer[0] + questions[3].unit[0] + ' .. ' + questions[3].answer[1] + questions[3].unit[1], questions[3]);
        
        $('#within1_correct').text(questions[4].correct_answer);
        this.setAnswerTextWithColor('#within1_answer', questions[4].answer, questions[4]);

        var feedback = this.assessment.feedback['rated_r1_time'];
        $('#rated_r1_time').text(util.timeLapseStr(questions[0].start_time, questions[0].end_time));
        $('#rated_r1_time_pts').text(feedback.points + ' (' + feedback.label + ')');

        feedback = this.assessment.feedback['rated_t1_time'];
        $('#rated_t1_time').text(util.timeLapseStr(questions[1].start_time, questions[1].end_time));
        $('#rated_t1_time_pts').text(feedback.points + ' (' + feedback.label + ')');
        
        feedback = this.assessment.feedback['measured_r1_time'];
        $('#measured_r1_time').text(util.timeLapseStr(questions[2].start_time, questions[2].end_time));
        $('#measured_r1_time_pts').text(feedback.points + ' (' + feedback.label + ')');
        
        // Section 2
        questions = sections[1].questions;
        
        $('#rated_r2_correct').text(Unit.res_str(questions[0].correct_answer));
        this.setAnswerTextWithColor('#rated_r2_answer', questions[0].answer + questions[0].unit, questions[0]);
        
        $('#rated_t2_correct').text(questions[1].correct_answer * 100 + '%');
        this.setAnswerTextWithColor('#rated_t2_answer', questions[1].answer + questions[1].unit, questions[1]);
        
        $('#measured_r2_correct').text(Unit.res_str(questions[2].correct_answer));
        this.setAnswerTextWithColor('#measured_r2_answer', questions[2].answer + questions[2].unit, questions[2]);
        
        $('#t_range2_correct').text(Unit.res_str(questions[3].correct_answer[0]) + ' .. ' + Unit.res_str(questions[3].correct_answer[1]));
        this.setAnswerTextWithColor('#t_range2_answer', questions[3].answer[0] + questions[3].unit[0] + ' .. ' + questions[3].answer[1] + questions[3].unit[1], questions[3]);
        
        $('#within2_correct').text(questions[4].correct_answer);
        this.setAnswerTextWithColor('#within2_answer', questions[4].answer, questions[4]);

        feedback = this.assessment.feedback['rated_r2_time'];
        $('#rated_r2_time').text(util.timeLapseStr(questions[0].start_time, questions[0].end_time));
        $('#rated_r2_time_pts').text(feedback.points + ' (' + feedback.label + ')');
        
        feedback = this.assessment.feedback['rated_t2_time'];
        $('#rated_t2_time').text(util.timeLapseStr(questions[1].start_time, questions[1].end_time));
        $('#rated_t2_time_pts').text(feedback.points + ' (' + feedback.label + ')');

        feedback = this.assessment.feedback['measured_r2_time'];
        $('#measured_r2_time').text(util.timeLapseStr(questions[2].start_time, questions[2].end_time));
        $('#measured_r2_time_pts').text(feedback.points + ' (' + feedback.label + ')');
        
        // Section 3
        questions = sections[2].questions;
        $('#rated_r3_correct').text(Unit.res_str(questions[0].correct_answer));
        this.setAnswerTextWithColor('#rated_r3_answer', questions[0].answer + questions[0].unit, questions[0]);
        
        $('#rated_t3_correct').text(questions[1].correct_answer * 100 + '%');
        this.setAnswerTextWithColor('#rated_t3_answer', questions[1].answer + questions[1].unit, questions[1]);
        
        $('#measured_r3_correct').text(Unit.res_str(questions[2].correct_answer));
        this.setAnswerTextWithColor('#measured_r3_answer', questions[2].answer + questions[2].unit, questions[2]);
        
        $('#t_range3_correct').text(Unit.res_str(questions[3].correct_answer[0]) + ' .. ' + Unit.res_str(questions[3].correct_answer[1]));
        this.setAnswerTextWithColor('#t_range3_answer', questions[3].answer[0] + questions[3].unit[0] + ' .. ' + questions[3].answer[1] + questions[3].unit[1], questions[3]);
        
        $('#within3_correct').text(questions[4].correct_answer);
        this.setAnswerTextWithColor('#within3_answer', questions[4].answer, questions[4]);
        
        feedback = this.assessment.feedback['rated_r3_time'];
        $('#rated_r3_time').text(util.timeLapseStr(questions[0].start_time, questions[0].end_time));
        $('#rated_r3_time_pts').text(feedback.points + ' (' + feedback.label + ')');
        
        feedback = this.assessment.feedback['rated_t3_time'];
        $('#rated_t3_time').text(util.timeLapseStr(questions[1].start_time, questions[1].end_time));
        $('#rated_t3_time_pts').text(feedback.points + ' (' + feedback.label + ')');
        
        feedback = this.assessment.feedback['measured_r3_time'];
        $('#measured_r3_time').text(util.timeLapseStr(questions[2].start_time, questions[2].end_time));
        $('#measured_r3_time_pts').text(feedback.points + ' (' + feedback.label + ')');
    },
    
    // Table of indicators
    details2 : function() {
        var alt = new util.Alternator('"tan"', '"burly_wood"');
        var t = '<h4>Details</h4>';
        t += '<table><tr>';
        t += '<td class=' + alt.next() + ' rowspan="2">Section</td>';
        t += '<td class=' + alt.next() + ' colspan="2">Rated Resistance</td>';
        t += '<td class=' + alt.next() + ' colspan="2">Rated Tolerance</td>';
        t += '<td class=' + alt.next() + ' colspan="2">Measured Resistance</td>';
        t += '<td class=' + alt.next() + ' colspan="2">Tolerance Range</td>';
        t += '<td class=' + alt.next() + ' colspan="2">Within Tolerance?</td>';
        t += '<td class=' + alt.next() + ' colspan="2">Time</td>';
        t += '</tr><tr>';
        for (var i = 0; i < 5; ++i) {
            t += '<td class="mocassin">Correct Value</td><td class="navaho_white">Your Answer</td>';
        }
        t += '<td class="mocassin">Your Time</td><td class="navaho_white">Points</td>';
        t += '</tr><tr>';

        for (var i = 1; i < 4; ++i) {
            t += this.sectionRow(i);
        }

        t += '</tr></table>';
        
        return t;
    },
    
    sectionRow : function(sectionNum) {
        var section = this.log.sections[sectionNum-1];
        var questions = section.questions;
        var t = '<tr><td>' + sectionNum + '</td>';
        t += '<td>' + Unit.res_str(questions[0].correct_answer) + '</td>';
        t += this.coloredElem(questions[0].answer + questions[0].unit, questions[0]);
        t += '<td>' + questions[1].correct_answer * 100 + '%</td>';
        t += this.coloredElem(questions[1].answer + questions[1].unit, questions[1]);
        t += '<td>' + Unit.res_str(questions[2].correct_answer) + '</td>';
        t += this.coloredElem(questions[2].answer + questions[2].unit, questions[2]);
        t += '<td>' + Unit.res_str(questions[3].correct_answer[0]) + ' .. ' + Unit.res_str(questions[3].correct_answer[1]) + '</td>';
        t += this.coloredElem(questions[3].answer[0] + questions[3].unit[0] + ' .. ' + questions[3].answer[1] + questions[3].unit[1], questions[3]);
        t += '<td>' + questions[4].correct_answer + '</td>';
        t += this.coloredElem(questions[4].answer, questions[4]);
        t += '<td>' + util.timeLapseStr(section.start_time, section.end_time) + '</td>'
        
        return t + '</tr>';
    },
    
    setAnswerTextWithColor : function(elemId, text, question) {
        $(elemId).text(text);
        var color = question.correct ? '#339933' : '#cc3300';
        $(elemId).attr('style', 'color: ' + color + ';');
    },

    reportLog : function() {
        var t = '<h4>Activity Log</h4><pre>';
        t += this.log.formatDate(this.log.start_time) + ' - Activity Start<br/>';
        t += this.log.formatDate(this.log.sections[0].start_time) + ' - Resistor 1 Start<br/>';
        t += this.log.formatDate(this.log.sections[0].end_time) + ' - Resistor 1 End<br/>';
        t += this.log.formatDate(this.log.sections[1].start_time) + ' - Resistor 2 Start<br/>';
        t += this.log.formatDate(this.log.sections[1].end_time) + ' - Resistor 2 End<br/>';
        t += this.log.formatDate(this.log.sections[2].start_time) + ' - Resistor 3 Start<br/>';
        t += this.log.formatDate(this.log.sections[2].end_time) + ' - Resistor 3 End<br/>';
        t += this.log.formatDate(this.log.end_time) + ' - Activity End</pre>';
        return t;
    }
};
