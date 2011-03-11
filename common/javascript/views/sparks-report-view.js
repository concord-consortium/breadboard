/*globals console sparks $ breadModel getBreadBoard */

(function() {
  
  sparks.SparksReportView = function(){
  };
  
  sparks.SparksReportView.prototype = {
    
    getPageReportView: function(page){
      return this.createReportTableForPage(page);
    },
    
    createReportTableForPage: function(page) {
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
})();