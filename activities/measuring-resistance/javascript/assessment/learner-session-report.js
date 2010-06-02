//= require <jquery/jquery-1.4.2.min>
//= require <jquery/jquery-ui-1.8.custom.min>
//= require <jquery/plugins/jquery.cookie>
//= require <data-service/RestDS-jQuery>
//= require <util>
//= require "grader"
//= require "reporter"

/* FILE learner-session-report.js */

/*
 * Report for individual student/session
 */

$(document).ready(function () {
    try {
        var mr = sparks.activities.mr;
        var util = sparks.util;
    
        var reportId = sparks.util.readCookie('report_id');
        var ds = new RestDS(null, null, '/sparks/report/get_report/' + reportId);
        ds.readKey = true;
        ds.load(this, function (data) {
            try {
                var log = JSON.parse(data.measuring_resistance_report.content)[0];
                var feedback = JSON.parse(data.measuring_resistance_report.graded_result);
                console.log('feedback=' + feedback);
                var reporter = new mr.Reporter($('#report_area'));
                reporter.report(log, feedback);
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
