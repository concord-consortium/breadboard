/*globals console sparks $ breadModel getBreadBoard */

(function() {
  sparks.ActivityConstructor = function(jsonSection){
    sparks.sparksSectionController.reset();
    this.section = sparks.sparksSectionController.createSection(jsonSection);
    
    this.jsonSection = jsonSection;
    
    this.embeddingTargets = {
      $breadboardDiv: null,
      $imageDiv: null,
      $questionsDiv: null
    };
    sparks.activityContstructor = this;
    
  };
  
  sparks.ActivityConstructor.prototype = {
    
    // not usually necessary. Justs for tests?
    setEmbeddingTargets: function(targets) {
      if (!!targets.$breadboardDiv){
        this.embeddingTargets.$breadboardDiv = targets.$breadboardDiv;
      }
      if (!!targets.$imageDiv){
        this.embeddingTargets.$imageDiv = targets.$imageDiv;
      }
      if (!!targets.$questionsDiv){
        this.embeddingTargets.$questionsDiv = targets.$questionsDiv;
      }
    },

   layoutActivity: function() {
     if (!this.embeddingTargets.$imageDiv){
         this.embeddingTargets.$imageDiv = $('#image');
      }
     if (!this.embeddingTargets.$questionsDiv){
        this.embeddingTargets.$questionsDiv = $('#questions_area');
     }
     
     if (!!this.section.image){
       var $imagediv = this.section.view.getImageView();
       this.embeddingTargets.$imageDiv.append($imagediv);
     }
     
     this.layoutPage();
   },
   
   layoutPage: function() {
     if (!!sparks.sparksSectionController.currentPage){
        this.embeddingTargets.$questionsDiv.html('');
        var $page = sparks.sparksSectionController.currentPage.view.getView();
        this.embeddingTargets.$questionsDiv.append($page);
      }
   }
  };
})();