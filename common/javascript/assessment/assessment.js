/*globals sparks $ */

(function() {
  
  var activity = sparks.Activity;
  
  activity.Question = function () {
  	  this.id = 0;
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
      this.score = 0;
      this.options = null;
      this.points_earned = -1;
      this.feedback = null;
      this.isSubQuestion = false;
      this.commonPrompt = '';
  };
  
  activity.Assessment = function (activityLog) {
    this.activityLog = activityLog;
    this.questions = [];
    this.forms = [];
    this.userQuestions = [];
  };
  
  activity.Assessment.prototype = 
  {
    createQuestion: function(jsonQuestion, id){
      function html_entity_decode(str) {
        return $("<div>").html(str).text();
      }
      
      var question = new activity.Question();
      question.id = id;
      question.prompt = jsonQuestion.prompt;
      question.shortPrompt = (jsonQuestion.shortPrompt || jsonQuestion.prompt);
      question.commonPrompt = jsonQuestion.commonPrompt;
      question.isSubQuestion= jsonQuestion.isSubQuestion;
      if (jsonQuestion.correct_answer != null) {
        question.correct_answer = "" + jsonQuestion.correct_answer;
      }
		  	
      question.correct_units = jsonQuestion.correct_units;
      if (!!question.correct_units){
        question.correct_units = question.correct_units.replace("ohms",html_entity_decode("&#x2126;"));
      }
      if (!!jsonQuestion.options) {
      	question.options = jsonQuestion.options;
      }
            
      question.score = (jsonQuestion.score | 0);
      
      return question;
    },
    
    addQuestion: function(jsonQuestion,id) {
    	var question = this.createQuestion(jsonQuestion,id);
      this.questions.push(question);
    },
    
    serializeQuestions: function(jqForms) {
      var self = this;
      var form = $(this);
      form.questions = [];
      self.forms.push(form);
      
      var id = 0;
      $.each(this.questions, function(i, question) {
     	if(!question.options){
     		question.answer = $("#"+id + "_input").val();
     	} else if(question.options) {
     		console.log('else if options');
     		question.answer = $("#"+id + "_options").val();
     		//console.log(question.answer);
     	}	
     	if(question.correct_units){
     		question.units = $("#"+id + "_units").val();	
     	}
     	id++;
     	
     	form.questions.push(question);
        self.userQuestions.push(question);       
      });
    },
    
    scoreAnswers: function() {
      var self = this;
      $.each(this.questions, function(i, question) {
        if (!!self.userQuestions[i]){
          var userQuestion = self.userQuestions[i];
          
          if(!question.options){
          	question.answer = parseFloat(question.answer);
          
          	console.log('question '+ i + ', question.answer, ' +question.answer +' question.correct_answer '+question.correct_answer);

          	// first get numbers to 3 sig figs, then allow errors of 0.05 (rounding differences)
          	var dif = self._sigFigs(question.answer,3) - self._sigFigs(question.correct_answer,3);
          	//if (dif <= 0.5 && dif >= -0.05){  //currents values are calculating impercisely for series-parallel - should fix this problem and restore stricter tolerance
            if(dif <= 15 && dif >= -15){
          	  question.answerIsCorrect = true;
          	}
          } else if(!!question.options) {
            if (!!question.options[0].option){
              var optionChosen;
              var maxPoints = 0;
              question.feedback = "";
              $.each(question.options, function(i, option){
                if (option.option == question.answer){
                  optionChosen = option;
                }
                var points = option.points;
                if (points > maxPoints){
                  maxPoints = points;
                  question.score = points;
                  question.correct_answer = option.option;
                }
              });
              question.points_earned = optionChosen.points;
              question.feedback = optionChosen.feedback;
            }
          	if(question.answer == question.correct_answer){
          		question.answerIsCorrect = true;	
          	}	

          }
          	
          if (!!question.correct_units){
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
        var score;
        if (question.points_earned > -1){
          score = question.points_earned;
        } else {
          score = question.answerIsCorrect && question.unitsIsCorrect ? question.score : 0;
        }
        totalScore += score;
        totalPossibleScore += question.score;
        var feedback = "";

        
        if(!question.feedback){
        	if (answer === '') {
          
        	} else if (!question.answerIsCorrect){
        	  feedback += "The value was wrong";
        	  if (!question.unitsIsCorrect){
        	    feedback += " and the units were wrong";
        	  }
        	} else if (!question.unitsIsCorrect){
        	  feedback += "The units were wrong";
        	}
        } else {
          feedback = question.feedback;
        }
       
        
        $tbl.append(
          $('<tr>').append(
            $('<td>').text(question.shortPrompt),
            $('<td>').html(answer),
            $('<td>').html(correctAnswer),
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
    },
    
    _round: function(num, dec) {
    	var result = Math.round( Math.round( num * Math.pow( 10, dec + 1 ) ) / Math.pow( 10, 1 ) ) / Math.pow(10,dec);
    	return result;
    },
    
    _sigFigs: function(n, sig) {
        var mult = Math.pow(10,
            sig - Math.floor(Math.log(n) / Math.LN10) - 1);
        return Math.round(n * mult) / mult;
    },
    
    readingHintPath: sparks.config.root_dir + '/common/resources/hint1_colorcode.html',
    measuringHintPath: sparks.config.root_dir + '/common/resources/hint1_dmm.html'
    
  };
})();