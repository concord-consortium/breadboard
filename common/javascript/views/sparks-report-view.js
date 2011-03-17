/*globals console sparks $ breadModel getBreadBoard */

(function() {
  
  sparks.SparksReportView = function(){
  };
  
  sparks.SparksReportView.prototype = {
    
    getSessionReportView: function(sessionReport){
      return this._createReportTableForSession(sessionReport);
    },
    
    getActivityReportView: function() {
      var $div = $('<div>');
      $div.append('<h1>Activity results</h1>');
      var pages = sparks.sparksActivity.pages;
      var self = this;
      
      var totalScore = 0;
      var totalMaxScore = 0;
      $.each(pages, function(i, page){
        $div.append('<h2>Page '+(i+1)+"</h2>");
        var bestSessionReport = sparks.sparksReportController.getBestSessionReport(page);
        $div.append(self._createReportTableForSession(bestSessionReport));
        var returnButton = $("<button>").addClass("return").text("Try Page "+(i+1)+" again");
        returnButton.click(function(){
          sparks.sparksActivityController.repeatPage(page);
          });
        $div.append(returnButton);
        totalScore += bestSessionReport.score;
        totalMaxScore += bestSessionReport.maxScore;
      });
      
      $div.find('h1').after("You scored <b>"+totalScore+"</b> out of a maximum of <b>"+totalMaxScore+"</b> points");
      return $div;
    },
    
    _createReportTableForSession: function(sessionReport) {
      
      var $report = $('<table>').addClass('reportTable');
      $report.addClass((sessionReport.score == sessionReport.maxScore) ? "allCorrect" : "notAllCorrect");
      
      $report.append(
        $('<tr>').append(
          $('<th>').text("Question"),
          $('<th>').text("Your answer"),
          $('<th>').text("Correct answer"),
          $('<th>').text("Score"),
          $('<th>').text("Notes")
        )
      );
        
      $.each(sessionReport.questions, function(i, question){
        var answer = !!question.answer ? question.answer + (!!question.units ? " "+question.units : '') : '';
        var correctAnswer = question.correct_answer + (!!question.correct_units ? " "+question.correct_units : '');
        var score = question.points_earned;
        var feedback = "";

        
        if(!question.feedback){
        	if (answer === '') {
          
        	} else if (!question.answerIsCorrect){
        	  feedback += "The value was wrong";
        	}
        } else {
          feedback = question.feedback;
        }
        
        var $tutorialButton = null;
        if (!!question.tutorial){
          $tutorialButton = $("<button>").text("Tutorial").css('padding-left', "10px")
                              .css('padding-right', "10px").css('margin-left', "20px");
          $tutorialButton.click(function(){
            window.open(question.tutorial,'','menubar=no,height=600,width=800,resizable=yes,toolbar=no,location=no,status=no');
          });
        } else {
        }
       
        $report.append(
          $('<tr>').append(
            $('<td>').html(question.shortPrompt),
            $('<td>').html(answer),
            $('<td>').html(correctAnswer),
            $('<td>').html(score +"/" + question.points),
            $('<td>').html(feedback).append($tutorialButton)
          ).addClass(question.answerIsCorrect ? "correct" : "incorrect")
        );
      });
      
      $report.append(
        $('<tr>').append(
          $('<th>').text("Total Score:"),
          $('<th>').text(""),
          $('<th>').text(""),
          $('<th>').text(sessionReport.score + "/" + sessionReport.maxScore),
          $('<th>').text("")
        )
      );
      
      return $report;
    }
    
  };
})();