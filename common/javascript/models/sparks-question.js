/*globals console sparks $ breadModel getBreadBoard */

(function() {
  sparks.SparksQuestion = function(){
    this.id = 0;
    this.shownId = 0;
    
    this.prompt = '';
    this.shortPrompt = '';
    this.correct_answer = null;
    this.answer = '';
    this.correct_units = null;
    this.units = '';
    this.start_time = null;
    this.end_time = null;
    
    this.options = null;
    this.radio = false;
    this.checkbox = false;
    
    this.answerIsCorrect = false;
    this.unitsIsCorrect = false;
    this.points = 0;
    this.points_earned = -1;
    this.feedback = null;
    this.tutorial = null;
    
    this.isSubQuestion = false;
    this.subquestionId = -1;
    this.commonPrompt = '';
    
    this.keepOrder = false;
    
    this.view = null;
  };
  
  sparks.SparksQuestion.prototype = {
    toJSON: function() {
      var json = {};
      json.id = this.id;
      json.shortPrompt = this.shortPrompt;
      json.correct_answer = this.correct_answer;
      json.answer = this.answer;
      json.options = this.options;
      json.answerIsCorrect = this.answerIsCorrect;
      json.points = this.points;
      json.points_earned = this.points_earned;
      json.feedback = this.feedback;
      json.tutorial = this.tutorial;
      return json;
    }
  };
  
})();