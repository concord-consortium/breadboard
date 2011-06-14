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
    
    createPage: function(id, jsonPage) {
      var page = new sparks.SparksPage(id);
      
      page.questions = sparks.sparksQuestionController.createQuestionsArray(jsonPage.questions);
      page.currentQuestion = page.questions[0];
      
      if (!!jsonPage.notes){
        var notes = sparks.mathParser.calculateMeasurement(jsonPage.notes);
        page.notes = notes;
      }
      
      page.time = jsonPage.time;
      
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
      sparks.sparksLogController.endSession();
      sparks.sparksReportController.saveData();
      var sessionReport = sparks.sparksReportController.addNewSessionReport(page);
      var $report = sparks.sparksReport.view.getSessionReportView(sessionReport);
      page.view.showReport($report);
    }
    
  };
  
  sparks.sparksPageController = new sparks.SparksPageController();
})();