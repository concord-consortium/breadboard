/*globals console sparks $ breadModel getBreadBoard */

(function() {
  sparks.Section = function(){
    // sparks.activity = this;
    
    this.title = "";
    this.id = null;
    
    this.image = null;
    this.circuit = null;
    this.pages = [];
    this.variables = {};
    
    this.meter = null;        // may become either the dmm or the oscilloscope
    
    this.hide_circuit = false;
    this.show_multimeter = false;
    this.show_oscilloscope = false;
    
    this.section_url = "";
    this.images_url = "";
    
    this.visited = false;
    
    this.nextSection = null;
    
    this.view = null;
  };
  
  sparks.Section.prototype = {
    
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
      $.each(sparks.activity.sections, function(i, section){
        if (section === self){
          index = i;
        }
      });
      return index;
    }
    
  };
  
})();