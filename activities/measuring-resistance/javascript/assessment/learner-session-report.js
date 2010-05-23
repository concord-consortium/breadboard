//= require "../setup-activity"
//= require <jquery/jquery-ui-1.8.custom.min>
//= require <data-service/RestDS-jQuery>
//= require <util>
//= require "grader"
//= require "reporter"

/* FILE learner-session-report.js */

$(document).ready(function () {
    try {
        var mr = sparks.activities.mr;
    
        var reportId = sparks.util.readCookie('report_id');
        var ds = new RestDS(null, null, '/sparks/report/get_report/' + reportId);
        ds.readKey = true;
        ds.load(this, function (data) {
            try {
                var grader = new sparks.activities.mr.Grader(data[0]);
                var feedback = grader.grade();
                var reporter = new mr.Reporter($('#report_area'));
                reporter.report(data[0], feedback);
            }
            catch (e) {
                alert(e);
            }
        });
    }
    catch (e) {
        alert(e);
    }
});
