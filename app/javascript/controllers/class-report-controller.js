/*globals console sparks $ breadModel getBreadBoard window */

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
    // this.view = new sparks.ClassReportView();
  };
  
  sparks.ClassReportController.prototype = {
    
    getStudentData: function(activityId, studentIds, callback) {
      var totalStudents = studentIds.length,
          responsesReceived = 0,
          reports = this.reports;
          
      function receivedData(response){
        if (!!response && !!response.rows){
          var jsonReport = response.rows[response.rows.length-1].value;
          reports.push(jsonReport);
        }
        responsesReceived++;
        if (responsesReceived === totalStudents){
          callback(reports);
        }
      }
      
      for (var i = 0; i < totalStudents; i++){
        sparks.couchDS.loadStudentData(activityId, studentIds[i], receivedData, receivedData);
      }
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
        return $.map(sectionReports, function(report, i) {
          return (report.sectionTitle);
        });
      }
      return [];
    }
    
  };
  
  sparks.classReportController = new sparks.ClassReportController();
})();