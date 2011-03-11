/*globals console sparks $ breadModel getBreadBoard */

(function() {
  
  /*
   * Sparks Activity Controller can be accessed by the
   * singleton variable sparks.sparksActivityController
   */
  sparks.SparksActivityController = function(){
    this.currentPage = null;
    this.currentPageIndex = -1;
  };
  
  sparks.SparksActivityController.prototype = {
    
    reset: function(){
      // this.currentPage = null;
      // this.currentPageIndex = -1;
      sparks.sparksPageController.reset();
      sparks.sparksQuestionController.reset();
    },
    
    createActivity: function(jsonActivity) {
      var activity = new sparks.SparksActivity();
      
      if (!!jsonActivity.activity_url){
        activity.activity_url = jsonActivity.activity_url;
      } else {
        activity.activity_url = sparks.jsonActivity.activity_url;
      }
      
      if (!!jsonActivity.images_url){
        activity.images_url = jsonActivity.images_url;
      } else {
        activity.images_url = sparks.jsonActivity.images_url;
      }
      
      activity.image = jsonActivity.image;
      
      if (!!jsonActivity.circuit){
        activity.circuit = jsonActivity.circuit;
        breadModel("createCircuit", activity.circuit);
      }
      
      activity.hide_circuit = !!jsonActivity.hide_circuit;
      
      
      if (!!jsonActivity.pages){
        $.each(jsonActivity.pages, function(i, jsonPage){
          var page = sparks.sparksPageController.createPage(jsonPage);
          activity.pages.push(page);
        });
        
        if (this.currentPageIndex == -1){
          this.currentPageIndex = 0;
        }
        this.currentPage = activity.pages[this.currentPageIndex];
      }
      
      if (!!jsonActivity.formulas){
        $.each(this.jsonActivity.formulas, function(i, formula){
          var variables = {};
          var variable = formula.match(/.* =/)[0];
          variable = variable.substring(0,variable.length-2);
          formula = "variables."+formula;
          eval(formula);
          var value = variables[0];
          this.sparksActivity.variables[variable] = value;
        });
      }
      
      activity.view = new sparks.SparksActivityView(activity);
      
      return activity;
    },
    
    areMorePage: function() {
      var nextPage;
      for (var i = 0; i < sparks.sparksActivity.pages.length-1; i++){
        if (sparks.sparksActivity.pages[i] == this.currentPage){
          nextPage = sparks.sparksActivity.pages[i+1];
        }
      }
      if (!nextPage){
        return false;
      }
      return nextPage;
    },
    
    nextPage: function() {
      var nextPage = this.areMorePage();
      if (!nextPage){
        console.log("No more pages");
      }
      this.currentPageIndex = this.currentPageIndex+1;
      this.currentPage = nextPage;
      sparks.activityContstructor.layoutPage();
    },
    
    repeatPage: function() {
      console.log("repeating page");
      console.log("this.currentPage = "+this.currentPage);
      $('#breadboard').html('');
      $('#image').html('');
      this.currentPage.view.clear();
      
      if (!sparks.jsonActivity.hide_circuit){
        breadModel('clear');
        sparks.flash.activity.loadFlash();
      } else {
        sparks.flash.activity.onActivityReady();
      }
      // breadModel("createCircuit", sparks.sparksActivity.circuit);
      // breadModel("createCircuit", sparks.sparksActivity.circuit);
      // breadModel('updateFlash');
    }
    
  };

  sparks.sparksActivityController = new sparks.SparksActivityController();
})();