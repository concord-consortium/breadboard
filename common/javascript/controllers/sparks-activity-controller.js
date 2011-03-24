/*globals console sparks $ breadModel getBreadBoard */

(function() {
  
  /*
   * Sparks Activity Controller can be accessed by the
   * singleton variable sparks.sparksActivityController
   */
  sparks.SparksActivityController = function(){
    sparks.sparksActivity = new sparks.SparksActivity();
    this.currentSection = null;
  };
  
  sparks.SparksActivityController.prototype = {
    
    addSection: function (jsonSection) {
      var section = sparks.sparksSectionController.createSection(jsonSection);
      sparks.sparksActivity.sections.push(section);
      this.currentSection = section;
    }
    
    
  };

  sparks.sparksActivityController = new sparks.SparksActivityController();
})();