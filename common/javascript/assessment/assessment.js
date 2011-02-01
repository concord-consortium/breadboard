/*globals sparks $ */

(function() {
  
  var activity = sparks.Activity;
  
  activity.Question = function () {
  	  this.id = 0;
      this.prompt = '';
      this.shortPrompt = '';
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
    addQuestion: function(jsonQuestion,id) {
    	function html_entity_decode(str) {
        return $("<div>").html(str).text();
      }
      
      var question = new activity.Question();
      question.id = id;
      question.prompt = jsonQuestion.prompt;
      question.shortPrompt = (jsonQuestion.shortPrompt || jsonQuestion.prompt);
      question.correct_answer = jsonQuestion.correct_answer;
      
      question.correct_answer = question.correct_answer.replace("ohms",html_entity_decode("&#x2126;")); //reformat "ohms" to the letter omega
      question.correct_answer = question.correct_answer.replace("micro","&#x00b5;"); //reformat "micro" to greek letter mu
		  	
      question.correct_units = jsonQuestion.correct_units;
      if (question.correct_units === "ohms"){
        question.correct_units = "&#x2126;";
      }
      if (!!jsonQuestion.multichoice) {
      	question.multichoice = jsonQuestion.multichoice;
      }
            
      question.score = (jsonQuestion.score | 1);
      
      if (!!question.correct_units){
        this.makeMeasurmentQuestion(question);
      }
      
      this.questions.push(question);
    },
    
    makeMeasurmentQuestion: function(question){
      function html_entity_decode(str) {
        return $("<div>").html(str).text();
      }
      
      var value = question.correct_answer;
      var units = question.correct_units;
      
      if (value >= 1000000){
        var MUnits = html_entity_decode('M'+units);
        question.correct_units = MUnits;
        question.correct_answer = this._round(value/1000000,2);
      } else if (value >= 1000){
        var kUnits = html_entity_decode('k'+units);
        question.correct_units = kUnits;
        question.correct_answer = this._round(value/1000,2);
      } else if (value < 0.001){
        var uUnits = html_entity_decode('&#x00b5;'+units);
        question.correct_units = uUnits;
        question.correct_answer = this._round(value * 1000000,2);
      } else if (value < 1) {
        var mUnits = html_entity_decode('m'+units);
        question.correct_units = mUnits;
        question.correct_answer = this._round(value * 1000,2);
      } else {
        question.correct_units = html_entity_decode(units);
        question.correct_answer = this._round(value,2);
      }
    },
    
    serializeQuestions: function(jqForms) {
      var self = this;
      var form = $(this);
      form.questions = [];
      self.forms.push(form);
      
      var id = 0;
      $.each(this.questions, function(i, question) {
     	if(!question.multichoice){
     		question.answer = $("#"+id + "_input").val();
     	} else if(question.multichoice) {
     		console.log('else if multichoice');
     		question.answer = $("#"+id + "_multichoice").val();
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
          
          if(!question.multichoice){
          	question.answer = parseFloat(question.answer);
          
          	console.log('question '+ i + ', question.answer, ' +question.answer +' question.correct_answer '+question.correct_answer);

          	// first get numbers to 3 sig figs, then allow errors of 0.05 (rounding differences)
          	var dif = self._sigFigs(question.answer,3) - self._sigFigs(question.correct_answer,3);
          	//if (dif <= 0.5 && dif >= -0.05){  //currents values are calculating impercisely for series-parallel - should fix this problem and restore stricter tolerance
            if(dif <= 15 && dif >= -15){
          	  question.answerIsCorrect = true;
          	}
          } else if(!!question.multichoice) {
			console.log('question.correct_answer '+ question.correct_answer +'question.answer '+ question.answer );

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
        var score = question.answerIsCorrect && question.unitsIsCorrect ? question.score : 0;
        totalScore += score;
        totalPossibleScore += question.score;
        var feedback = "";

        
        //if(!question.multichoice){
        	if (answer === '') {
          
        	} else if (!question.answerIsCorrect){
        	  feedback += "The value was wrong";
        	  if (!question.unitsIsCorrect){
        	    feedback += " and the units were wrong";
        	  }
        	} else if (!question.unitsIsCorrect){
        	  feedback += "The units were wrong";
        	}
        //} else if(!!question.multichoice){
        	
        	// needs to be filled in!  custom feedback from activity setup
        //}
       
        
        $tbl.append(
          $('<tr>').append(
            $('<td>').text(question.shortPrompt),
            $('<td>').text(answer),
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