/*global sparks $ alert*/

(function() {

  /*
   * Sparks Class Report Controller can be accessed by the
   * singleton variable sparks.classReportController
   *
   * There is only one singlton sparks.classReport object. This
   * controller creates it when the controller is created.
   */
  sparks.ClassReportController = function(){
    // sparks.classReport = new sparks.ClassReport();
    this.reports = [];

    this.className = "";
    this.teacherName = "";
    // this.view = new sparks.ClassReportView();
  };

  sparks.ClassReportController.prototype = {

    getClassData: function(activityId, learnerIds, classId, callback) {
      var reports = this.reports;
      var self = this;

      if (classId) {
        $.get("http://sparks.portal.concord.org/portal/classes/"+classId, function(data) {
          if (data) {
            var classElem = $(data).find('strong:contains("Class:")'),
                className = classElem ? classElem.text().split(": ")[1] : "",
                teacherElem = $(data).find('li:contains("Teacher")>strong'),
                teacherName = teacherElem ? teacherElem.text().replace(/\n/g, "") : "";
            self.className = className;
            self.teacherName = teacherName;

            if (className && teacherName) {
              $('#title').html(className + " &nbsp; &mdash; &nbsp; " + teacherName);
            }
          }
        });
      }

      var receivedData = function(response){
        if (!!response && !!response.rows && response.rows.length > 0){
          for (var i = 0, ii = response.rows.length; i < ii; i++){
            reports.push(response.rows[i].value);
          }
          callback(reports);
        }
      };

      var fail = function() {
        alert("Failed to load class report");
      };

      sparks.couchDS.loadClassDataWithLearnerIds(activityId, learnerIds, receivedData, fail);
    },

    getLevels: function() {
      if (this.reports.length > 0){
        var reportWithMostSections = 0,
            mostSections = 0;
        for (var i = 0, ii = this.reports.length; i < ii; i++){
          var numSections = this.reports[i].sectionReports.length;
          if (numSections > mostSections){
            mostSections = numSections;
            reportWithMostSections = i;
          }
        }
        var sectionReports = this.reports[reportWithMostSections].sectionReports;
        return $.map(sectionReports, function(report) {
          return (report.sectionTitle);
        });
      }
      return [];
    }

  };

  sparks.classReportController = new sparks.ClassReportController();
})();