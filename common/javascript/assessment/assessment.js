/*globals sparks $ */

(function() {
  
  var activity = sparks.Activity;
  
  activity.Question = function () {
      this.prompt = '';
      this.correct_answer = '';
      this.answer = '';
      this.correct_units = '';
      this.units = '';
      this.answerIsCorrect = false;
      this.unitsIsCorrect = false;
      this.start_time = null;
      this.end_time = null;
      this.score = 1;
  };
  
  activity.Assessment = function (activityLog) {
    this.activityLog = activityLog;
    this.questions = [];
    this.forms = [];
    this.userQuestions = [];
  };
  
  activity.Assessment.prototype = 
  {
    addQuestion: function(prompt, correct_answer, correct_units, score) {
      var question = new activity.Question();
      question.prompt = prompt;
      question.correct_answer = correct_answer;
      question.correct_units = correct_units;
      question.score = score;
      this.questions.push(question);
    },
    
    addMeasurmentQuestion: function (prompt, value, units, score){
      
      function html_entity_decode(str) {
        var ta=document.createElement("textarea");
        ta.innerHTML=str.replace(/</g,"&lt;").replace(/>/g,"&gt;");
        return ta.value;
      }
      
      function round(num, dec) {
      	var result = Math.round( Math.round( num * Math.pow( 10, dec + 1 ) ) / Math.pow( 10, 1 ) ) / Math.pow(10,dec);
      	return result;
      }
      
      if (value >= 1000000){
        var MUnits = html_entity_decode('M'+units);
        this.addQuestion(prompt, round(value/1000000,2), MUnits, score);
      } else if (value >= 1000){
        var kUnits = html_entity_decode('k'+units);
        this.addQuestion(prompt, round(value/1000,2), kUnits, score);
      } else if (value < 0.001){
        var uUnits = html_entity_decode('&#x00b5;'+units);
        this.addQuestion(prompt, round(value * 1000000,2), uUnits, score);
      } else if (value < 1) {
        var mUnits = html_entity_decode('m'+units);
        this.addQuestion(prompt, round(value * 1000,2), mUnits, score);
      } else {
        var units = html_entity_decode(units);
        this.addQuestion(prompt, round(value,2), units, score);
      }
    },
    
    serializeQuestions: function(jqForms) {
      var self = this;
      jqForms.each(function (i) {
        var form = $(this);
        form.questions = [];
        self.forms.push(form);
        var inputs = form.find('input');
        inputs.each(function (j) {
          var question = [];
          question.input = $(this).val();
          var next = $(this).next();
          if ($(next).is('select')){
            question.select = next.val();
          }
          form.questions.push(question);
          self.userQuestions.push(question);
        });
      });
    },
    
    scoreAnswers: function() {
      var self = this;
      $.each(this.questions, function(i, question) {
        if (!!self.userQuestions[i]){
          var userQuestion = self.userQuestions[i];
          question.answer = userQuestion.input;
          if (question.answer == question.correct_answer){
            question.answerIsCorrect = true;
          }
          
          if (!!question.correct_units){
            question.units = userQuestion.select;
            if (question.units == question.correct_units){
              question.unitsIsCorrect = true;
            }
          } else {  
            question.unitsIsCorrect = true;
          }
        }
      });
    },
    
    generateReport: function() {
      var $tbl = $('<table>').attr('id', 'basicTable');
      
      $tbl.append(
        $('<tr>').append(
          $('<th>').text("Question"),
          $('<th>').text("Your answer"),
          $('<th>').text("Correct answer"),
          $('<th>').text("Score"),
          $('<th>').text("Notes")
        )
      );
      
      var totalScore = 0;
      var totalPossibleScore = 0;
        
      $.each(this.questions, function(i, question){
        var answer = !!question.answer ? question.answer + (!!question.units ? " "+question.units : '') : '';
        var correctAnswer = question.correct_answer + (!!question.correct_units ? " "+question.correct_units : '');
        var score = question.answerIsCorrect && question.unitsIsCorrect ? question.score : 0;
        totalScore += score;
        totalPossibleScore += question.score;
        var feedback = "";
        if (answer === '') {
          
        } else if (!question.answerIsCorrect){
          feedback += "The value was wrong";
          if (!question.unitsIsCorrect){
            feedback += " and the units were wrong";
          }
        } else if (!question.unitsIsCorrect){
          feedback += "The units were wrong";
        }
        
        $tbl.append(
          $('<tr>').append(
            $('<td>').text(question.prompt),
            $('<td>').text(answer),
            $('<td>').text(correctAnswer),
            $('<td>').text(score +"/" + question.score),
            $('<td>').text(feedback)
          )
        );
      });
      
      $tbl.append(
        $('<tr>').append(
          $('<th>').text("Total Score:"),
          $('<th>').text(""),
          $('<th>').text(""),
          $('<th>').text(totalScore + "/" + totalPossibleScore),
          $('<th>').text("")
        )
      );
      
      return $tbl;
    }
  };
})();