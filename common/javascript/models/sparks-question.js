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
    this.answerIsCorrect = false;
    this.unitsIsCorrect = false;
    this.start_time = null;
    this.end_time = null;
    
    this.options = null;
    this.radio = false;
    this.checkbox = false;
    
    this.points = 0;
    this.points_earned = -1;
    this.feedback = null;
    
    this.isSubQuestion = false;
    this.subquestionId = -1;
    this.commonPrompt = '';
    
    this.view = null;
  };
  
  sparks.SparksActivity.prototype = {
  };
  
})();