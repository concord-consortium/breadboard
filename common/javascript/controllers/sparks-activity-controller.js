/*globals console sparks $ breadModel getBreadBoard */

(function() {
  sparks.SparksActivityController = function(){
    this.currentPage = null;
  };
  
  sparks.SparksActivityController.prototype = {
    
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
        var pc = new sparks.SparksPageController();
        
        $.each(jsonActivity.pages, function(i, jsonPage){
          var page = pc.createPage(jsonPage);
          activity.pages.push(page);
        });
        
        this.currentPage = activity.pages[0];
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
    }
    
  };
})();