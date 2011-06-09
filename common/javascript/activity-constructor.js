/*globals console sparks $ breadModel getBreadBoard */

(function() {
  sparks.ActivityConstructor = function(jsonActivity){
    // sparks.sparksSectionController.reset();
    // this.section = sparks.sparksSectionController.createSection(jsonSection);
    
    sparks.sparksActivity.view = new sparks.SparksActivityView();
    
    if (!jsonActivity.type || jsonActivity.type !== "activity"){
      var jsonSection = jsonActivity;
      var section = sparks.sparksActivityController.addSection(jsonSection);
      sparks.sparksActivityController.setCurrentSection(0);
      sparks.sparksSectionController.loadCurrentSection();
      sparks.sparksActivity.view.layoutCurrentSection();
    } else {
      sparks.sparksActivityController.createActivity(jsonActivity, function(){
        sparks.sparksActivityController.setCurrentSection(0);
        sparks.sparksSectionController.loadCurrentSection();
        sparks.sparksActivity.view.layoutCurrentSection();
      });
    }
    
    sparks.activityConstructor = this;
    
  };
  
  sparks.ActivityConstructor.prototype = {
    
  };
})();