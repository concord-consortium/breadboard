/*globals console sparks $ breadModel getBreadBoard */

(function() {
  sparks.ActivityConstructor = function(jsonActivity){
    // sparks.sparksSectionController.reset();
    // this.section = sparks.sparksSectionController.createSection(jsonSection);
    
    sparks.sparksActivity.view = new sparks.SparksActivityView();
    
    if (!jsonActivity.type || jsonActivity.type !== "activity"){
      var jsonSection = jsonActivity;
      var section = sparks.sparksActivityController.addSection(jsonSection);
      this.loadFirstSection();
    } else {
      sparks.sparksActivityController.createActivity(jsonActivity, this.loadFirstSection);
    }
    
    sparks.activityConstructor = this;
    
  };
  
  sparks.ActivityConstructor.prototype = {
    loadFirstSection: function() {
      if (!!sparks.sparksActivity.id && sparks.couchDS.user){
        sparks.couchDS.loadStudentData(sparks.sparksActivity.id, sparks.couchDS.user.name,
          function(response){
            jsonReport = response.rows[response.rows.length-1].value;
            sparks.sparksReportController.loadReport(jsonReport);
            var lastSectionId;
            $.each(sparks.sparksActivity.sections, function(i, section){
              if (!!sparks.sparksReport.sectionReports[section]){
                lastSectionId = i;
              }
            })
            console.log(lastSectionId)
            sparks.sparksActivityController.setCurrentSection(lastSectionId);
            sparks.sparksSectionController.loadCurrentSection();
            sparks.sparksActivity.view.layoutCurrentSection();
          }
        );
      } else {
        sparks.sparksActivityController.setCurrentSection(0);
        sparks.sparksSectionController.loadCurrentSection();
        sparks.sparksActivity.view.layoutCurrentSection();
      }
    }
    
  };
})();