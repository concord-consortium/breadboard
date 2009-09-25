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
        console.log('#report_link_1.html=' + $('#report_link_1').html());
        console.log('#report_link_1=' + $('#report_link_1'));
        $('#report_link_1').click(function() { alert('link_1'); });
        $('#report').click(function() { alert('mahwah'); });
        
        $('#report_log').html(this.reportLog());
    },
    
    reportLog : function() {
        var t = '<h4>Activity Log</h4>';
        t += 'Activity Start: ' + new Date(this.log.start_time) + '<br/>';
        t += 'Resistor 1 Start: ' + new Date(this.log.resistor1_section.start_time) + '<br/>';
        t += 'Activity End: ' + new Date(this.log.end_time);
        return t;
    }
}
