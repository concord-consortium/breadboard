/*globals console sparks $ breadModel getBreadBoard */

(function() {
  
  sparks.SparksPage = function(){
    this.questions = [];
    this.notes = null;
    this.view = null;
    this.currentQuestion = null;
  };
  
  sparks.SparksPage.prototype = {
    
    toJSON: function () {
      var json = {};
      json.questions = [];
      $.each(this.questions, function(i, question){
        json.questions.push(question.toJSON());
      });
      return json;
    }
  };
  
})();