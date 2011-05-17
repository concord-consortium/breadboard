/*globals console sparks $ breadModel getBreadBoard window */

(function() {
  
  /*
   * Sparks Report Controller can be accessed by the
   * singleton variable sparks.sparksReportController
   *
   * There is only one singlton sparks.sparksReport object. This
   * controller creates it when the controller is created.
   */
  sparks.SparksReportController = function(){
    sparks.sparksReport = new sparks.SparksReport();
    sparks.sparksReport.view = new sparks.SparksReportView();
    this.currentSectionReport = null;
  };
  
  sparks.SparksReportController.prototype = {
    
    startNewSection: function(section) {
      if (!!sparks.sparksReport.sectionReports[section]){
        this.currentSectionReport = sparks.sparksReport.sectionReports[section];
        return;
      }
      this.currentSectionReport = new sparks.SparksSectionReport();
      sparks.sparksReport.sectionReports[section] = this.currentSectionReport;
    },
    
    addNewSessionReport: function(page){
      var sessionReport = new sparks.SparksSessionReport();
      
      var jsonQuestions = [];
      var score = 0;
      var maxScore = 0;
      $.each(page.questions, function(i, question){
        
        sparks.sparksQuestionController.gradeQuestion(question);
        
        score += question.points_earned;
        maxScore += question.points;
        
        jsonQuestions.push(question.toJSON());
      });
      sessionReport.questions = jsonQuestions;
      
      if (sparks.sparksLogController.currentLog.endTime < 0){
        sparks.sparksLogController.endSession();
      }
      sessionReport.log = sparks.sparksLogController.currentLog;
      sessionReport.timeTaken = (sessionReport.log.endTime - sessionReport.log.startTime) / 1000;
      if (!!page.time){
        var t = page.time;
        
        sessionReport.timeScore = 0;
        sessionReport.maxTimeScore = t.points;
        
        if (score >= maxScore * 0.7){
          var m = t.points / (t.best - t.worst);
          var k = 0-m * t.worst;
          var timeScore = (m * sessionReport.timeTaken) + k;
          timeScore = timeScore > t.points ? t.points : timeScore;
          timeScore = timeScore < 0 ? 0 : timeScore;
          timeScore = Math.floor(timeScore);
        
          sessionReport.timeScore = timeScore;
        }
        sessionReport.bestTime = t.best;
        
        score += sessionReport.timeScore;
        maxScore += sessionReport.maxTimeScore;
      }
      
      sessionReport.score = score;
      sessionReport.maxScore = maxScore;
      this._addSessionReport(page, sessionReport);
      return sessionReport;
    },
    
    _addSessionReport: function(page, sessionReport) {
      if (!this.currentSectionReport.pageReports[page]){
        var pageReport = new sparks.SparksPageReport();
        this.currentSectionReport.pageReports[page] = pageReport;
        this.currentSectionReport.pageReports[page].sessionReports = [];
      }
      this.currentSectionReport.pageReports[page].sessionReports.push(sessionReport);
    },
    
    getTotalScoreForPage: function(page, section) {
      var sectionReport;
      if (!!section){
        sectionReport = sparks.sparksReport.sectionReports[section];
      } else {
        sectionReport = this.currentSectionReport;
      }
      if (!sectionReport.pageReports[page]){
        console.log("ERROR: No session reports for page");
        return;
      }
      return this.getTotalScoreForPageReport(sectionReport.pageReports[page]);
    },
    
    getTotalScoreForPageReport: function(pageReport) {
      var sessionReports = pageReport.sessionReports;
      var totalScore = 0;
      for (var i in sessionReports) {
        var report = sessionReports[i];
        totalScore += report.score;
      }
      return totalScore;
    },
    
    getTotalScoreForSection: function(section) {
      var totalScore = 0;
      var self = this;
      $.each(section.pages, function(i, page){
        totalScore += self.getTotalScoreForPage(page, section);
      });
      return totalScore;
    },
    
    getLastSessionReport: function(page) {
      if (!this.currentSectionReport.pageReports[page]){
        console.log("ERROR: No session reports for page");
        return;
      }
      
      var sessionReports = this.currentSectionReport.pageReports[page].sessionReports;
      return sessionReports[sessionReports.length - 1];
    },
    
    getBestSessionReport: function(page) {
      if (!this.currentSectionReport.pageReports[page]){
        console.log("ERROR: No session reports for page");
        return;
      }
      var sessionReports = this.currentSectionReport.pageReports[page].sessionReports;
      var bestSessionReport = null;
      var topScore = -1;
      for (var i in sessionReports) {
        var report = sessionReports[i];
        if (report.score >= topScore){       // >= because we want to get *last* top score
          topScore = report.score;
          bestSessionReport = report;
        }
      }
      return bestSessionReport;
    },
    
    showTutorial: function (_url) {
      var url;
      if (_url.indexOf("http:") < 0 && _url.indexOf("/") !== 0){
        url = sparks.tutorial_base_url + _url;
      } else {
        url = _url;
      }
      window.open(url,'','menubar=no,height=600,width=800,resizable=yes,toolbar=no,location=no,status=no');
      sparks.sparksLogController.addEvent(sparks.LogEvent.CLICKED_TUTORIAL, url);
    },
    
    getCategories: function(report) {
      var categories = {};
      var self = this;
      $.each(report.sectionReports, function(i, sectionReport){
        $.each(sectionReport.pageReports, function(j, pageReport){
          $.each(pageReport.sessionReports, function(k, sessionReport){
            $.each(sessionReport.questions, function(l, question){
              if (!!question.category){
                var category = question.category;
                if (!categories[category]){
                  categories[category] = [0,0];
                }
                var right = categories[category][0];
                var total = categories[category][1];
                categories[category][0] = question.answerIsCorrect ? right + 1 : right;
                categories[category][1] = total + 1;
              }
            });
          });
        });
      });
      return categories;
    },

    saveData: function() {
      if (!!sparks.activity && !!sparks.activity.dataService){
        
        var score = 0;
        var self = this;
        $.each(sparks.sparksActivity.sections, function(i, section){
          score += self.getTotalScoreForSection(section);
        });
        sparks.sparksReport.score = score;
        
        var data = sparks.sparksReport.toJSON();
        sparks.activity.dataService.save(data);
      }
    },
    
    loadReport: function(jsonReport) {
      this.fixData(jsonReport, function(fixedReport){
        var $reportView = sparks.sparksReport.view.getFinalActivityReportView(jsonReport);
        $('#questions_area').append($reportView);
      });
    },
    
    showReport: function(studentName) {
      var ds = new sparks.CouchDS("/couchdb:sparks_data");
      ds.loadStudentData(studentName);
    },
    
    fixData: function(jsonReport, callback) {
      if (jsonReport.save_time < 1301500000000){      // reports saved before 3/30/2011 (Tidewater run)
        this.addSectionIds(jsonReport, callback);
      }
    },
    
    addSectionIds: function(jsonReport, callback) {
      var self = this;
      if (!jsonReport.sectionReports || jsonReport.sectionReports.length < 1 || !!jsonReport.sectionReports[0].sectionId){
        callback(jsonReport);
        return;
      }
      
      var question = jsonReport.sectionReports[0].pageReports[0].sessionReports[0].questions[0];
      var feedback = [];
      $.each(question.options, function(i, option){
        feedback.push(option.feedback);
      });
      
      var sections = ["series-a-1d", "series-b-1a", "series-c-1", "series-c-2", "series-d-1",
                      "series-d-2", "series-e-1", "series-e-2", "series-f-1"];
      var sectionTitles = ["Understanding a Breadboard", "Understanding Series Resistances", "Calculating Total Circuit R (Series)", 
                            "Calculating V and I in Series Circuits", "Measuring to Calculate Total R",
                            "Measuring V and I in Series Circuits", "Measuring Series Circuits", "Measuring Series R's in Circuits", 
                            "Troubleshooting a series circuit"];               
      
      sectionAttempt = 0;
      trySection(sectionAttempt);
      
      function trySection(sectionNo){
        if (sectionNo > sections.length-1){
          console.log("ERROR fixing report data");
          console.log(jsonReport);
          alert("tried to fix data for "+jsonReport.user.name+"but failed. Check console");
        }
        $.couch.db("sparks").openDoc(sections[sectionNo], { success: function(response) { 
          checkSection(response, sectionNo);
          }}
        );
      }
      
      function arraysAreEquivalent(ar1, ar2){
        var equiv = true;
        $.each(ar1, function(i, val){
          if (!sparks.util.contains(ar2, val)){
            equiv = false;
          }
        });
        return equiv;
      }
      
      function checkSection(section, sectionNo){
        var sectionQuestion = section.pages[0].questions[0];
        var sectionFeedback = [];
        $.each(sectionQuestion.options, function(i, option){
          sectionFeedback.push(option.feedback);
        });
        if (arraysAreEquivalent(feedback, sectionFeedback)){
          setSectionNames(sectionNo);
        } else {
          sectionAttempt++;
          trySection(sectionAttempt);
        }
      }
      
      function setSectionNames(sectionNo){
        $.each(jsonReport.sectionReports, function(i, sectionReport){
          sectionReport.sectionId = sections[sectionNo + i];
          sectionReport.sectionTitle = sectionTitles[sectionNo + i];
        });
        
        
        // FIXME: Should use regular save, so _rev changes if we fix multiple things
        if (!sparks.activity.dataService){
          var tempDs = new sparks.CouchDS("/couchdb:sparks_data");
          tempDs.saveRawData(jsonReport);
        } else {
          sparks.activity.dataService.saveRawData(jsonReport);
        }
        
        callback(jsonReport);
      }
      
    }
    
  };
  
  sparks.sparksReportController = new sparks.SparksReportController();
})();