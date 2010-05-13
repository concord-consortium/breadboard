$(document).ready(function() {
    var mr = sparks.activities.mr;
    
    var reportId = sparks.util.readCookie('report_id');
    var ds = new RestDS(null, null, '/sparks_report/get_report/' + reportId);
    ds.readKey = true;
    ds.load(this, function(data) {
        var grader = new sparks.activities.mr.Grader(data[0]);
        var feedback = grader.grade();
        //var reporter = new SessionReporter();
        var reporter = new mr.Reporter($('#report_area'));
        reporter.report(data[0], feedback);
    }); 
});
