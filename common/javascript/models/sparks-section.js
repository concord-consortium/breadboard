/*globals console sparks $ breadModel getBreadBoard */

(function() {
  sparks.SparksSection = function(){
    // sparks.sparksActivity = this;
    
    this.title = "";
    this.id = null;
    
    this.image = null;
    this.circuit = null;
    this.pages = [];
    this.variables = {};
    
    this.hide_circuit = false;
    
    this.section_url = "";
    this.images_url = "";
    
    this.nextSection = null;
    
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
    },
    
    toString: function () {
      return "Section "+this.getIndex();
    },
    
    getIndex: function() {
      var self = this;
      var index = -1;
      $.each(sparks.sparksActivity.sections, function(i, section){
        if (section === self){
          index = i;
        }
      });
      return index;
    }
    
  };
  
})();