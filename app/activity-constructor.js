/*globals console sparks $ breadModel getBreadBoard */

(function() {
  sparks.ActivityConstructor = function(jsonActivity){
    // sparks.sectionController.reset();
    // this.section = sparks.sectionController.createSection(jsonSection);
    
    sparks.activity.view = new sparks.ActivityView();
    
    if (!jsonActivity.type || jsonActivity.type !== "activity"){
      var jsonSection = jsonActivity;
      var section = sparks.activityController.addSection(jsonSection);
      this.loadFirstSection();
    } else {
      sparks.activityController.createActivity(jsonActivity, this.loadFirstSection);
    }
    
    sparks.activityConstructor = this;
    
  };
  
  sparks.ActivityConstructor.prototype = {
    loadFirstSection: function() {
      if (!!sparks.activity.id && sparks.couchDS.user){
        $('#loading-text').text('Loading previous work');
        sparks.couchDS.loadStudentData(sparks.activity.id, sparks.couchDS.user.name,
          function(response){
            var jsonReport = response.rows[response.rows.length-1].value;
            sparks.reportController.loadReport(jsonReport);
            var lastSectionId;
            $.each(sparks.activity.sections, function(i, section){
              if (!!sparks.report.sectionReports[section]){
                lastSectionId = i;
              }
            });
            sparks.activityController.setCurrentSection(lastSectionId);
            sparks.sectionController.loadCurrentSection();
            sparks.activity.view.layoutCurrentSection();
            sparks.sectionController.viewSectionReport();
          },
          function(){
            sparks.activityController.setCurrentSection(0);
            sparks.sectionController.loadCurrentSection();
            sparks.activity.view.layoutCurrentSection();
          }
        );
      } else {
        sparks.activityController.setCurrentSection(0);
        sparks.sectionController.loadCurrentSection();
        sparks.activity.view.layoutCurrentSection();
      }
    }
    
  };
})();