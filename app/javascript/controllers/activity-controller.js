/*globals console sparks $ breadModel getBreadBoard */

(function() {

  /*
   * Sparks Activity Controller can be accessed by the
   * singleton variable sparks.activityController
   */
  sparks.ActivityController = function(){
    sparks.activity = new sparks.Activity();

    this.currentSection = null;
    this.currentSectionIndex = 0;
    this.sectionMap = {};
  };

  sparks.ActivityController.prototype = {

    createActivity: function(activity, callback) {
      sparks.activity.id = activity._id;
      var self = this;
      var totalCreated = 0;
      $.each(activity.sections, function(i, jsonSection){
        if (!!jsonSection.pages){
          self.addSection(jsonSection, i);
          totalCreated++;
          if (totalCreated == activity.sections.length){
            callback();
          }
        } else {
          sparks.couchDS.loadActivity(jsonSection, function(jsonSection) {
            self.addSection(jsonSection, i);
            totalCreated++;
            if (totalCreated == activity.sections.length){
              callback();
            }
          });
        }
      });
    },

    addSection: function (jsonSection, index) {
      // var _id = jsonSection._id;
      // var sectionExists = false;
      // var index = -1;
      // $.each(sparks.activity.sections, function(i, section){
      //   if (section.id === _id){
      //     sectionExists = true;
      //     index = i;
      //   }
      // });

      // if we're just making a one-section activity
      if (!sparks.activity.id){
        sparks.activity.id = jsonSection._id;
      }

      var section = sparks.sectionController.createSection(jsonSection);
      // this.currentSection = section;

      if (index !== undefined){
        sparks.activity.sections[index] = section;
      } else {
        sparks.activity.sections.push(section);
      }
      this.sectionMap[section.id] = section;

      return section;

      //
    },

    setCurrentSection: function(i) {
      this.currentSection = sparks.activity.sections[i];
      this.currentSectionIndex = i;
    },

    areMoreSections: function () {
      return !(this.currentSectionIndex >= sparks.activity.sections.length -1);
    },

    nextSection: function () {
      if (this.currentSectionIndex > sparks.activity.sections.length -1) {
        return;
      }
      this.setCurrentSection(this.currentSectionIndex + 1);
      sparks.sectionController.currentPageIndex = 0;
      sparks.sectionController.loadCurrentSection();
      sparks.activity.view.layoutCurrentSection();
      // this.currentSection.view.clear();
      //       breadModel('clear');
      //       window.location.hash = this.currentSection.nextSection;
      //       sparks.activity.onDocumentReady();
    },

    findSection: function(id){
      return this.sectionMap[id];
    },

    reset: function () {
      sparks.activity.sections = [];

      sparks.sectionController.currentPage = null;
      sparks.sectionController.currentPageIndex = -1;
      sparks.sectionController.pageIndexMap = {};
    }


  };

  sparks.activityController = new sparks.ActivityController();
})();