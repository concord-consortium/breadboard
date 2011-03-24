/*globals console sparks $ breadModel getBreadBoard */

(function() {
  sparks.SparksSection = function(){
    // sparks.sparksActivity = this;
    
    this.image = null;
    this.circuit = null;
    this.pages = [];
    this.variables = {};
    
    this.hide_circuit = false;
    
    this.section_url = "";
    this.images_url = "";
    
    this.view = null;
  };
  
  sparks.SparksSection.prototype = {
    
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