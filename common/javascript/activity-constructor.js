/*globals console sparks $ breadModel getBreadBoard */

(function() {
  sparks.ActivityConstructor = function(jsonActivity){
    this.sparksActivityController = new sparks.SparksActivityController();
    this.activity = this.sparksActivityController.createActivity(jsonActivity);
    
    this.jsonActivity = jsonActivity;
    
    this.embeddingTargets = {
      $breadboardDiv: null,
      $imageDiv: null,
      $questionsDiv: null
    };
    
  };
  
  sparks.ActivityConstructor.prototype = {
  
    layoutActivity: function() {
      console.log("THIS IS OBSOLETE. USE layoutActivity");
    },
    
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
     
     if (!!this.activity.image){
       var $imagediv = this.activity.view.getImageView();
       this.embeddingTargets.$imageDiv.append($imagediv);
     }
     
     if (!!this.sparksActivityController.currentPage){
       var $page = this.sparksActivityController.currentPage.view.getView();
       this.embeddingTargets.$questionsDiv.append($page);
     }
   }
  };
})();