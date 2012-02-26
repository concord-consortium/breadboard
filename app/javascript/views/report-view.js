/*globals console sparks $ breadModel getBreadBoard */

(function() {
  
  sparks.ReportView = function(){
  };
  
  sparks.ReportView.prototype = {
    
    getSessionReportView: function(sessionReport){
      var $div = $('<div>');
      $div.append(this._createReportTableForSession(sessionReport));
      
      var page = sparks.sectionController.currentPage;
      var totalScore = sparks.reportController.getTotalScoreForPage(page);
      if (totalScore > -1){
        $div.append($('<h2>').html("Your total score for this page so far: "+totalScore));
      }
      return $div;
    },
    
    getActivityReportView: function() {
      var $div = $('<div>');
      $div.append('<h1>Activity results</h1>');
      
      var totalScore = 0;
      var self = this;
      var currentSection = sparks.activityController.currentSection;
      
      var $table = $("<table>").addClass('finalReport');
      
      $table.append(
        $('<tr>').append(
          $('<th>'),
          $('<th>').text("Level"),
          $('<th>').text("Points"),
          $('<th>')
        )
      );
      
      var passedCurrentSection = false;
      var isNextSection = false;
      var nextSectionDidPass = false;
      
      $.each(sparks.activity.sections, function(i, section){
        var isThisSection = (section === currentSection);
        if (!nextSectionDidPass && !section.visited){
          isNextSection = true;
          nextSectionDidPass = true;
        } else {
          isNextSection = false;
        }
        
        if (section.visited) {
          var totalSectionScore = sparks.reportController.getTotalScoreForSection(section);
          var lastThreeSectionScore = sparks.reportController.getLastThreeScoreForSection(section);
          var timesRun = lastThreeSectionScore[1];
          lastThreeSectionScore = lastThreeSectionScore[0];
          totalScore += totalSectionScore;
          
          var light;
          if (lastThreeSectionScore < 0.30){
            light = "common/icons/light-red.png";
          } else if (lastThreeSectionScore < 0.90) {  
            light = "common/icons/light-off.png";
          } else {  
            light = "common/icons/light-on.png";
          }
          var $img = $('<img>').attr('src', light).attr('width', 35);
          $img.easyTooltip({
             content: "You scored "+sparks.math.roundToSigDigits(lastThreeSectionScore*100,3)+"% of the possible points from the last "+timesRun+" times you ran this level"
          });
        }
        var $btn = null;
        if (section.visited){
          $btn = $('<button>').addClass("repeat").text("Try this level again");
          $btn.click(function(){
            sparks.sectionController.repeatSection(section);
          });
        } else if (isNextSection){
          $btn = $('<button>').addClass("next").text("Go to the next level");
          $btn.click(function(){
            sparks.activityController.nextSection();
          });
        }
        
        $table.append(
          $('<tr>').append(
            $('<td>').addClass(section.visited ? "" : "no_check").css('padding-left', '0px').append($img),
            $('<td>').text(section.title),
            $('<td>').text(section.visited ? totalSectionScore : ''),
            $('<td>').append($btn)
          )
        );
      });
      
      $div.append($table);
      
      var $score = $("<span>").css("font-size", "11pt").html("<u>You have scored <b>"+totalScore+"</b> points so far.</u>");
      $div.find('h1').after($score);
      
      $div.append(this._createReportTableForCategories());
      
      return $div;
    },
    
    // *** It looks like this is not used anymore
    getFinalActivityReportView: function(report) {
      var $div = $('<div>');
      $div.append('<h1>Activity results</h1>');
      
      var totalScore = 0;
      var self = this;
      
      $.each(report.sectionReports, function(i, sectionReport){
        
        $div.append('<h2>Section '+(i+1)+': '+sectionReport.sectionTitle+'</h2>');
        var pageReports = sectionReport.pageReports;
        
        var $table = $("<table>");
        $.each(pageReports, function(i, pageReport){
          // $div.append('<h3>Page '+(i+1)+"</h3>");
          // var bestSessionReport = sparks.reportController.getBestSessionReport(page);
          // $div.append(self._createReportTableForSession(bestSessionReport));
          var score = sparks.reportController.getTotalScoreForPageReport(pageReport);
          
          var $tr = $("<tr>");
          $tr.append("<td>Page "+(i+1)+": "+ score   +" points</td>");
          $table.append($tr);
          
          totalScore += score;
          
        });
        $div.append($table);
      });
      
      var $score = $("<span>").css("font-size", "11pt").html("<u>"+report.user.name.replace("+", " ").trim()+" has scored <b>"+totalScore+"</b> points so far.</u>");
      $div.find('h1').after($score);
      return $div;
    },
    
    _createReportTableForCategories: function() {
      
      var categories = sparks.reportController.getCategories(sparks.report);
      
      var $table = $("<table>").addClass('categoryReport');
      $table.append(
        $('<tr>').append(
          $('<th>'),
          $('<th>').text("Question Categories")
        )
      );
      
      $.each(categories, function(category, score){
        var $btn = $('<button>').addClass("tutorial").text("View tutorial");
        $btn.click(function(){
          sparks.tutorialController.showTutorial(score[3]);
        });
        
        var light;
        switch (score[2]) {
          case 0:
            light = "common/icons/light-red.png";
            break;
          case 1:
          case 2:
           light = "common/icons/light-off.png";
           break;
          case 3:
           light = "common/icons/light-on.png";
        }
        var $img = $('<img>').attr('src', light).attr('width', 35);
        $img.easyTooltip({
           content: "You got "+score[2]+" out of the last "+(Math.min(score[1],3))+" questions of this type correct"
        });
        
        $table.append(
          $('<tr>').append(
            $('<td>').append($img),
            $('<td>').html(category),
            $('<td>').append($btn)
          )
        );
      });
      return $table;
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
          $('<th>').text("Notes"),
          $('<th>').text("Tutorials")
        )
      );
        
      $.each(sessionReport.questions, function(i, question){
        if (!!question.not_scored) {
          $report.append(
            $('<tr>').append(
              $('<td>').html(question.shortPrompt),
              $('<td>').html(question.answer)
            )
          );
          $report.find('th').filter(':contains("Correct answer")').hide();
          $report.find('th').filter(':contains("Score")').hide();
          $report.find('th').filter(':contains("Notes")').hide();
          return;
        }
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
          $tutorialButton = $("<button>").text(question.tutorial.replace(/-/g, ' ').capFirst()).css('padding-left', "10px")
                              .css('padding-right', "10px").css('margin-left', "20px");
          
          sparks.tutorialController.getTutorialTitle(question.tutorial, function(title){
            var rolloverText = "Click to view "+title;
            $tutorialButton.easyTooltip({
               content: rolloverText
            });
          });
          $tutorialButton.click(function(){
            sparks.tutorialController.showTutorial(question.tutorial);
          });
        } else {
        }
       
        $report.append(
          $('<tr>').append(
            $('<td>').html(question.shortPrompt),
            $('<td>').html(answer),
            $('<td>').html(correctAnswer),
            $('<td>').html(score +"/" + question.points),
            $('<td>').html(feedback),
            $('<td>').append($tutorialButton)
          ).addClass(question.answerIsCorrect ? "correct" : "incorrect")
        );
      });
      
      if (sessionReport.bestTime > 0){
        var feedback;
        if (sessionReport.timeScore == sessionReport.maxTimeScore){
          feedback = "Excellent! You earned the bonus points for very fast work!";
        } else {
          var rawScore = sessionReport.score - sessionReport.timeScore;
          var rawMaxScore = sessionReport.maxScore - sessionReport.maxTimeScore;
          if (rawScore < rawMaxScore * 0.7){
            feedback = "You didn't score enough points to earn the time bonus";
          } else {
            feedback = "You could score more bonus points by completing this page quicker!";
          }
        }
        
        $report.append(
          $('<tr>').append(
            $('<td>').html("Time taken"),
            $('<td>').html(Math.round(sessionReport.timeTaken) + " sec."),
            $('<td>').html("< "+sessionReport.bestTime + " sec."),
            $('<td>').html(sessionReport.timeScore +"/" + sessionReport.maxTimeScore),
            $('<td>').html(feedback)
          ).addClass(sessionReport.timeScore == sessionReport.maxTimeScore ? "correct" : "incorrect")
        );
      }
      
      if (sessionReport.score > -1){
        $report.append(
          $('<tr>').append(
            $('<th>').text("Total Score:"),
            $('<th>').text(""),
            $('<th>').text(""),
            $('<th>').text(sessionReport.score + "/" + sessionReport.maxScore),
            $('<th>').text(""),
            $('<th>').text("")
          )
        );
      }
      
      return $report;
    }
    
  };
})();