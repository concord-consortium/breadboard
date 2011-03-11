/*globals console sparks $ breadModel getBreadBoard */

(function() {
  
  /*
   * Sparks Page Controller can be accessed by the
   * singleton variable sparks.sparksPageController
   */
  sparks.SparksPageController = function(){
  };
  
  sparks.SparksPageController.prototype = {
    
    reset: function(){
    },
    
    createPage: function(jsonPage) {
      var page = new sparks.SparksPage();
      
      page.questions = sparks.sparksQuestionController.createQuestionsArray(jsonPage.questions);
      page.currentQuestion = page.questions[0];
      
      if (!!jsonPage.notes){
        var notes = sparks.mathParser.calculateMeasurement(jsonPage.notes);
        page.notes = notes;
      }
      
      page.view = new sparks.SparksPageView(page);
      
      return page;
    },
    
    enableQuestion: function(page, question) {
      page.view.enableQuestion(question);
    },
    
    // enables next question if available, or shows report otherwise
    completedQuestion: function(page) {
      var nextQuestion;
      for (var i = 0; i < page.questions.length-1; i++){
        if (page.questions[i] === page.currentQuestion){
          if (page.currentQuestion.isSubQuestion){
            do {
              i++;
              if (i == page.questions.length){
                this.showReport(page);
                return;
              }
            } while (i < page.questions.length && page.questions[i].subquestionId == page.currentQuestion.subquestionId);
            nextQuestion = page.questions[i];
          } else {
            nextQuestion = page.questions[i+1];
          }
        }
      }
      
      if (!!nextQuestion){
        page.currentQuestion = nextQuestion;
        this.enableQuestion(page, page.currentQuestion);
      } else {
        this.showReport(page);
      }
    },
    
    showReport: function(page){
      var $report = this.createReportForPage(page);
      page.view.showReport($report);
      
      this.saveData();
    },
    
    saveData: function() {
      if (!!sparks.activity.dataService){
        var data = sparks.sparksActivity.toJSON();
        sparks.activity.dataService.save(data);
      }
    },
    
    createReportForPage: function(page) {
      var self = this;
      $.each(page.questions, function(i, question){
        sparks.sparksQuestionController.gradeQuestion(question);
      });
      
      var $report = $('<table>').addClass('reportTable');
      
      $report.append(
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
        
      $.each(page.questions, function(i, question){
        var answer = !!question.answer ? question.answer + (!!question.units ? " "+question.units : '') : '';
        var correctAnswer = question.correct_answer + (!!question.correct_units ? " "+question.correct_units : '');
        var score = question.points_earned;
        totalScore += score;
        totalPossibleScore += question.points;
        var feedback = "";

        
        if(!question.feedback){
        	if (answer === '') {
          
        	} else if (!question.answerIsCorrect){
        	  feedback += "The value was wrong";
        	}
        } else {
          feedback = question.feedback;
        }
       
        $report.append(
          $('<tr>').append(
            $('<td>').html(question.shortPrompt),
            $('<td>').html(answer),
            $('<td>').html(correctAnswer),
            $('<td>').html(score +"/" + question.points),
            $('<td>').html(feedback)
          ).addClass(question.answerIsCorrect ? "correct" : "incorrect")
        );
      });
      
      $report.append(
        $('<tr>').append(
          $('<th>').text("Total Score:"),
          $('<th>').text(""),
          $('<th>').text(""),
          $('<th>').text(totalScore + "/" + totalPossibleScore),
          $('<th>').text("")
        )
      );
      
      return $report;
    }
    
  };
  
  sparks.sparksPageController = new sparks.SparksPageController();
})();