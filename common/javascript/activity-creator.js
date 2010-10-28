/*globals breadModel console sparks*/

(function() {
  sparks.ActivityConstructor = function(jsonActivity, assessment){
    this.jsonActivity = jsonActivity;
    this.assessment = assessment;
  };
  
  sparks.ActivityConstructor.prototype = {
    /*
      Creates the breadboard from the JSON representation of the
      circuit. See tests/jspc/spec/spec.common/spec.circuit_constructor
      for examples of json circuits
    */
    createBreadboard: function() {
      if (!this.jsonActivity.circuit){
        console.log("ERROR: No circuit defined");
        return;
      }
      
      breadModel("createCircuit", this.jsonActivity.circuit);
    },
    
    /*
      Creates questions from the JSON represenation of the questions,
      and embeds them in the jquery element provided
    */
    createQuestions: function($element){
      if (!this.jsonActivity.questions){
        console.log("ERROR: No questions defined");
        return;
      }
      
      var assessment = this.assessment;
      var self = this;
      $.each(this.jsonActivity.questions, function(i, val){
        var correct_answer = self.calculateCorrectAnswer(val.correct_answer);
        assessment.addQuestion(val.prompt, correct_answer, val.correct_units, val.score);
      });
    },
    
    calculateCorrectAnswer: function(answer){
      if (!isNaN(Number(answer))){
        return answer;
      }
      
      var varPattern = /\${[^}]+}/g
      var matches = answer.match(varPattern);
      $.each(matches, function(i, match){
        var variable = match.substring(2,match.length-1).split('.');
        var component = variable[0];
        var property = variable[1];
        
        var components = getBreadBoard().components; 
        if (!components[component]){
          console.log("ERROR calculating answer: No component name '"+component+"' in circuit");
          return;
        }
        if (components[component][property] === undefined || components[component][property] === null){
          console.log("ERROR calculating answer: No property name '"+property+"' in component '"+component+"'");
          return;
        }
        
        var value = components[component][property];
        answer = answer.replace(match, value);
      });
      
      var calculatedAnswer = eval(answer);
      if (!isNaN(Number(calculatedAnswer))){
        return calculatedAnswer;
      }
      
      console.log("ERROR calculating answer: Cannot compute the value of "+answer);
      return 0;
    }
  };
})();