/*globals console sparks $ breadModel getBreadBoard */

(function() {
  sparks.SparksActivity = function(){
    sparks.sparksActivity = this;
    
    this.sections = [];
  };
  
  sparks.SparksActivity.prototype = {
    
    toJSON: function () {
      var json = {};
      json.sections = [];
      $.each(this.sections, function(i, section){
        json.sections.push(section.toJSON());
      });
      return json;
    }
    
  };
  
})();