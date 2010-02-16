if (typeof console == 'undefined') {
    var console = { log: function() {} };
}
var debug = function(x) { console.log(x); };

$(document).ready(function() {
	var reportId = 2;
    var ds = new RestDS(null, null, '/sparks_report/get_report/' + reportId);
    ds.readKey = true;
    ds.load(this, function(data) {
        var grader = new Grader(data[0]);
        var feedback = grader.grade();
        var reporter = new SessionReporter();
        reporter.report(data[0], feedback);
    }); 
});
