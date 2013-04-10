/*global sparks $ */

(function() {
  sparks.Activity = function(){
    sparks.activity = this;

    this.sections = [];
    this.view = null;
  };

  sparks.Activity.prototype = {

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