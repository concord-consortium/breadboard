/*globals console sparks $ breadModel getBreadBoard */

(function() {
  
  /*
   * Sparks Activity Controller can be accessed by the
   * singleton variable sparks.sparksActivityController
   */
  sparks.SparksActivityController = function(){
    sparks.sparksActivity = new sparks.SparksActivity();
    sparks.sparksActivity.view = new sparks.SparksActivityView(sparks.sparksActivity);
    
    this.currentSection = null;
  };
  
  sparks.SparksActivityController.prototype = {
    
    addSection: function (jsonSection) {
      var _id = jsonSection._id;
      var sectionExists = false;
      var index = -1;
      $.each(sparks.sparksActivity.sections, function(i, section){
        if (section.id === _id){
          sectionExists = true;
          index = i;
        }
      });
      var section = sparks.sparksSectionController.createSection(jsonSection);
      this.currentSection = section;
        
      if (index > -1){
        sparks.sparksActivity.sections[index] = section;
      } else {
        sparks.sparksActivity.sections.push(section);
        if (!!sparks.sparksSectionController.currentPage){
          sparks.sparksSectionController.currentPageIndex = 0;
          sparks.sparksSectionController.currentPage = section.pages[0];
        }
      }
      
      sparks.sparksReportController.startNewSection(this.currentSection);
    },
    
    nextActivity: function () {
      if (!this.currentSection.nextSection){
        console.log("No next section");
        return;
      }
      this.currentSection.view.clear();
      breadModel('clear');
      window.location.hash = this.currentSection.nextSection;
      sparks.activity.onDocumentReady();
    },
    
    reset: function () {
      sparks.sparksActivity.sections = [];
      
      sparks.sparksSectionController.currentPage = null;
      sparks.sparksSectionController.currentPageIndex = -1;
      sparks.sparksSectionController.pageIndexMap = {};
    }
    
    
  };

  sparks.sparksActivityController = new sparks.SparksActivityController();
})();