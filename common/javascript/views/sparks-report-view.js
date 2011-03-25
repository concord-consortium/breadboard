/*globals console sparks $ breadModel getBreadBoard */

(function() {
  
  sparks.SparksReportView = function(){
  };
  
  sparks.SparksReportView.prototype = {
    
    getSessionReportView: function(sessionReport){
      var $div = $('<div>');
      $div.append(this._createReportTableForSession(sessionReport));
      
      var page = sparks.sparksSectionController.currentPage;
      var totalScore = sparks.sparksReportController.getTotalScoreForPage(page);
      $div.append($('<h2>').html("Your total score for this page so far: "+totalScore));
      return $div;
    },
    
    getActivityReportView: function() {
      var $div = $('<div>');
      $div.append('<h1>Activity results</h1>');
      
      var totalScore = 0;
      var self = this;
      var currentSection = sparks.sparksActivityController.currentSection;
      $.each(sparks.sparksActivity.sections, function(i, section){
        
        $div.append('<h2>Section '+(i+1)+': '+section.title+'</h2>');
        console.log("making report for "+section.toString()+" ("+section.title+") here");
        var pages = section.pages;
        
        var $table = $("<table>");
        $.each(pages, function(i, page){
          // $div.append('<h3>Page '+(i+1)+"</h3>");
          // var bestSessionReport = sparks.sparksReportController.getBestSessionReport(page);
          // $div.append(self._createReportTableForSession(bestSessionReport));
          var score = sparks.sparksReportController.getTotalScoreForPage(page, section);
          
          var $tr = $("<tr>");
          $tr.append("<td>Page "+(i+1)+": "+ score   +" points</td>");
          if (section === currentSection){
            var $td = $("<td>").css("border","0");
            var returnButton = $("<button>").addClass("return").text("Try Page "+(i+1)+" again");
            $td.append(returnButton);
            $tr.append($td);
            returnButton.click(function(){
              sparks.sparksSectionController.repeatPage(page, section);
              });

          }
          $table.append($tr);
          
          totalScore += score;
          
        });
        $div.append($table);
      });
      // 
      // 
      // 
      // var section = sparks.sparksActivityController.currentSection;
      // var pages = section.pages;
      // var self = this;
      // 
      // var totalScore = 0;
      // var totalMaxScore = 0;
      // $.each(pages, function(i, page){
      //   // $div.append('<h3>Page '+(i+1)+"</h3>");
      //   // var bestSessionReport = sparks.sparksReportController.getBestSessionReport(page);
      //   // $div.append(self._createReportTableForSession(bestSessionReport));
      //   var score = sparks.sparksReportController.getTotalScoreForPage(page);
      //   $div.append("Page "+(i+1)+": "+ score   +" points");
      //   var returnButton = $("<button>").addClass("return").text("Try Page "+(i+1)+" again");
      //   returnButton.click(function(){
      //     sparks.sparksSectionController.repeatPage(page);
      //     });
      //   $div.append(returnButton);
      //   totalScore += score;
      // });
      $score = $("<span>").css("font-size", "11pt").html("<u>You have scored <b>"+totalScore+"</b> points so far.</u>");
      $div.find('h1').after($score);
      return $div;
    },
    
    _createReportTableForSession: function(sessionReport) {
      
      var $report = $('<table>').addClass('reportTable');
      $report.addClass((sessionReport.score == sessionReport.maxScore) ? "allCorrect" : "notAllCorrect");
      
      $report.append(
        $('<tr>').append(
          $('<th>').text("Item"),
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
            sparks.sparksReportController.showTutorial(question.tutorial);
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
      
      if (sessionReport.bestTime > 0){
        $report.append(
          $('<tr>').append(
            $('<td>').html("Time taken"),
            $('<td>').html(Math.round(sessionReport.timeTaken) + " sec."),
            $('<td>').html("< "+sessionReport.bestTime + " sec."),
            $('<td>').html(sessionReport.timeScore +"/" + sessionReport.maxTimeScore),
            $('<td>').html(sessionReport.timeScore == sessionReport.maxTimeScore ? "Excellent! You earned the bonus points for very fast work!" :
                                "You could score more bonus points by completing this page quicker!")
          ).addClass(sessionReport.timeScore == sessionReport.maxTimeScore ? "correct" : "incorrect")
        );
      }
      
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