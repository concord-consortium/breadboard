if (typeof console == 'undefined') {
    var console = { log: function() {} };
}
var debug = function(x) { console.log(x); };

$(document).ready(function() {
    var reportId = sparks.util.readCookie('report_id');
    var ds = new RestDS(null, null, '/sparks_report/get_report/' + reportId);
    ds.readKey = true;
    ds.load(this, function(data) {
        var grader = new sparks.activities.mr.Grader(data[0]);
        var feedback = grader.grade();
        var reporter = new SessionReporter();
        reporter.report(data[0], feedback);
    }); 
});
