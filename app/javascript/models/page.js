/*globals console sparks $ breadModel getBreadBoard */

(function() {
  
  sparks.Page = function(id){
    this.id = id;
    this.questions = [];
    this.notes = null;
    this.time = {};
    this.view = null;
    this.currentQuestion = null;
  };
  
  sparks.Page.prototype = {
    
    toJSON: function () {
      var json = {};
      json.questions = [];
      $.each(this.questions, function(i, question){
        json.questions.push(question.toJSON());
      });
      return json;
    },
    
    toString: function () {
      return "Page "+this.id;
    }
  };
  
})();