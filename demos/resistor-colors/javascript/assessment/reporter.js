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
        
        $('#report_questions').html(this.details());
        $('#report_log').html(this.reportLog());
    },
    
    details : function() {
        var t = '<h4>Details</h4>';
        t += '<table><tr>';
        t += '<td class="tan" rowspan="2">Section</td>';
        t += '<td class="burly_wood" colspan="2">Rated Resistance</td>';
        t += '<td class="tan" colspan="2">Rated Tolerance</td>';
        t += '<td class="burly_wood" colspan="2">Measured Resistance</td>';
        t += '<td class="tan" colspan="2">Tolerance Range</td>';
        t += '<td class="burly_wood" colspan="2">Within Tolerance?</td>';
        t += '</tr><tr>';
        for (var i = 0; i < 5; ++i) {
            t += '<td class="mocassin">Correct Value</td><td class="navaho_white">Your Answer</td>';
        }
        t += '</tr><tr>';
        console.log('KK');

        for (var i = 1; i < 4; ++i) {
            t += this.sectionRow(i);
        }

        t += '</tr></table>';
        
        return t;
    },
    
    sectionRow : function(sectionNum) {
        var questions = this.log.sections[sectionNum-1].questions;
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
        return t + '</tr>';
    },
    
    coloredElem : function(text, question) {
        var color = question.correct ? '#339933' : '#cc3300';
        return '<td style="color: ' + color + ';">' + text + '</td>';
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
