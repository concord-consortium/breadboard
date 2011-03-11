/*globals console sparks $ breadModel getBreadBoard */

(function() {
  sparks.SparksActivity = function(){
    sparks.sparksActivity = this;
    
    sparks.activityLog = new sparks.Activity.ActivityLog();
    sparks.assessment = new sparks.Activity.Assessment();
    
    this.image = null;
    this.circuit = null;
    this.pages = [];
    this.variables = {};
    
    this.hide_circuit = false;
    
    this.activity_url = "";
    this.images_url = "";
    
    this.view = null;
  };
  
  sparks.SparksActivity.prototype = {
    
    toJSON: function () {
      var json = {};
      json.pages = [];
      $.each(this.pages, function(i, page){
        json.pages.push(page.toJSON());
      });
      return json;
    }
    
  };
  
})();