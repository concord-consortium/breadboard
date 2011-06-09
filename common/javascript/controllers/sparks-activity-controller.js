/*globals console sparks $ breadModel getBreadBoard */

(function() {
  
  /*
   * Sparks Activity Controller can be accessed by the
   * singleton variable sparks.sparksActivityController
   */
  sparks.SparksActivityController = function(){
    sparks.sparksActivity = new sparks.SparksActivity();
    
    this.currentSection = null;
    this.currentSectionIndex = 0;
    this.sectionMap = {};
  };
  
  sparks.SparksActivityController.prototype = {
    
    createActivity: function(activity, callback) {
      sparks.sparksActivity.id = activity._id;
      var self = this;
      var totalCreated = 0;
      $.each(activity.sections, function(i, jsonSectionName){
        sparks.couchDS.loadActivity(jsonSectionName, function(jsonSection) {
          self.addSection(jsonSection, i);
          totalCreated++;
          if (totalCreated == activity.sections.length){
            callback();
          }
        });
      });
    },
    
    addSection: function (jsonSection, index) {
      // var _id = jsonSection._id;
      // var sectionExists = false;
      // var index = -1;
      // $.each(sparks.sparksActivity.sections, function(i, section){
      //   if (section.id === _id){
      //     sectionExists = true;
      //     index = i;
      //   }
      // });
      var section = sparks.sparksSectionController.createSection(jsonSection);
      // this.currentSection = section;
        
      if (index !== undefined){
        sparks.sparksActivity.sections[index] = section;
      } else {
        sparks.sparksActivity.sections.push(section);
      }
      this.sectionMap[section.id] = section;
      
      return section;
      
      // 
    },
    
    setCurrentSection: function(i) {
      this.currentSection = sparks.sparksActivity.sections[i];
      this.currentSectionIndex = i;
    },
    
    areMoreSections: function () {
      return !(this.currentSectionIndex >= sparks.sparksActivity.sections.length -1);
    },
    
    nextSection: function () {
      if (this.currentSectionIndex > sparks.sparksActivity.sections.length -1) {
        console.log("No next section");
        return;
      }
      
      this.setCurrentSection(this.currentSectionIndex + 1);
      sparks.sparksSectionController.loadCurrentSection();
      sparks.sparksActivity.view.layoutCurrentSection();
      // this.currentSection.view.clear();
      //       breadModel('clear');
      //       window.location.hash = this.currentSection.nextSection;
      //       sparks.activity.onDocumentReady();
    },
    
    findSection: function(id){
      return this.sectionMap[id];
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