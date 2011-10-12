/*globals console sparks $ breadModel getBreadBoard window */

(function() {
  
  /*
   * Sparks Report Controller can be accessed by the
   * singleton variable sparks.reportController
   *
   * There is only one singlton sparks.report object. This
   * controller creates it when the controller is created.
   */
  sparks.ReportController = function(){
    sparks.report = new sparks.Report();
    sparks.report.view = new sparks.ReportView();
    this.currentSectionReport = null;
  };
  
  sparks.ReportController.prototype = {
    
    startNewSection: function(section) {
      if (!!sparks.report.sectionReports[section]){
        this.currentSectionReport = sparks.report.sectionReports[section];
        return;
      }
      this.currentSectionReport = new sparks.SectionReport();
      this.currentSectionReport.sectionId = section.id;
      this.currentSectionReport.sectionTitle = section.title;
      sparks.report.sectionReports[section] = this.currentSectionReport;
    },
    
    addNewSessionReport: function(page){
      var sessionReport = new sparks.SessionReport();
      
      var jsonQuestions = [];
      var score = 0;
      var maxScore = 0;
      $.each(page.questions, function(i, question){
        
        sparks.questionController.gradeQuestion(question);
        
        score += question.points_earned;
        maxScore += question.points;
        
        jsonQuestions.push(question.toJSON());
      });
      sessionReport.questions = jsonQuestions;
      
      if (sparks.logController.currentLog.endTime < 0){
        sparks.logController.endSession();
      }
      sessionReport.log = sparks.logController.currentLog;
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
        var pageReport = new sparks.PageReport();
        this.currentSectionReport.pageReports[page] = pageReport;
        this.currentSectionReport.pageReports[page].sessionReports = [];
      }
      this.currentSectionReport.pageReports[page].sessionReports.push(sessionReport);
    },
    
    getTotalScoreForPage: function(page, section) {
      var sectionReport;
      if (!!section){
        sectionReport = sparks.report.sectionReports[section];
      } else {
        sectionReport = this.currentSectionReport;
      }
      if (!sectionReport || !sectionReport.pageReports[page]){
        console.log("ERROR: No session reports for page");
        return 0;
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
    
    getSummaryForSectionReport: function(sectionReport) {
      var lastThree = this.getLastThreeScoreForSectionReport(sectionReport),
          lastThreePerc = lastThree[0],
          totalRuns = lastThree[1],
          totalScore = this.getTotalScoreForSectionReport(sectionReport);
      return [lastThreePerc, totalScore, totalRuns];
    },
    
    // To be refactored
    getTotalScoreForSection: function(section) {
      var totalScore = 0;
      var self = this;
      $.each(section.pages, function(i, page){
        totalScore += self.getTotalScoreForPage(page, section);
      });
      return totalScore;
    },
    
   // To be refactored
    getTotalScoreForSectionReport: function(sectionReport) {
      var totalScore = 0;
      var self = this;
      $.each(sectionReport.pageReports, function(i, pageReport){
        totalScore += self.getTotalScoreForPageReport(pageReport);
      });
      return totalScore;
    },
    
    // this is not very DRY. To be refactored
    getLastThreeScoreForSection: function(section) {
      var totalScore = 0;
      var maxScore = 0;
      var timesRun = 0;
      var self = this;
      $.each(section.pages, function(i, page){
        var scores = self.getLastThreeScoreForPage(page, section);
        totalScore += scores[0];
        maxScore += scores[1];
        timesRun = Math.max(timesRun, scores[2]);
      });
      
      return [totalScore / maxScore, timesRun];
    },
    
    // this is not very DRY. To be refactored
    getLastThreeScoreForSectionReport: function(sectionReport) {
      var totalScore = 0;
      var maxScore = 0;
      var timesRun = 0;
      var self = this;
      $.each(sectionReport.pageReports, function(i, pageReport){
        var scores = self.getLastThreeScoreForPageReport(pageReport);
        totalScore += scores[0];
        maxScore += scores[1];
        timesRun = Math.max(timesRun, scores[2]);
      });
      
      return [totalScore / maxScore, timesRun];
    },
    
    getLastThreeScoreForPage: function(page, section) {
      var sectionReport;
      if (!!section){
        sectionReport = sparks.report.sectionReports[section];
      } else {
        sectionReport = this.currentSectionReport;
      }
      if (!sectionReport || !sectionReport.pageReports[page]){
        console.log("ERROR: No session reports for page");
        return 0;
      }
      return this.getLastThreeScoreForPageReport(sectionReport.pageReports[page]);
    },
    
    getLastThreeScoreForPageReport: function(pageReport) {
      var sessionReports = pageReport.sessionReports;
      var totalScore = 0;
      var maxScore = 0;
      for (var i = sessionReports.length-1; i >= (sessionReports.length - 3) && i > -1; i--){
        var report = sessionReports[i];
        totalScore += report.score;
        maxScore += report.maxScore;
      }
      numRuns = Math.min(sessionReports.length, 3);
      return [totalScore,maxScore, numRuns];
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
    
    getSessionScoresAsPercentages: function(sectionReport) {
      var scores = [];
      var sessionReports = this._sortSessionsByTime({sectionReports: [sectionReport]});
      for (var i = 0, ii = sessionReports.length; i < ii; i++){
        var sessionReport = sessionReports[i];
        scores[i] = (sessionReport.score / sessionReport.maxScore) * 100;
      }
      return scores;
    },
    
    // each category is stored as an array:
    // [total answered correctly, total, total of previous 3 answered correctly, tutorial url]
    // categories = {
    //   'breadboards': [0, 1, 0, 'tutorial-1'].
    //   'voltage': [4, 5, 2, 'tutorial-2']  
    // }
    getCategories: function(report) {
      var categories = {};
      var self = this;
      var sessions = this._sortSessionsByTime(report);
      
      $.each(sessions, function(k, sessionReport){
        $.each(sessionReport.questions, function(l, question){
          if (!!question.category){
            var category = question.category;
            if (!categories[category.categoryTitle]){
              categories[category.categoryTitle] = [0,0,0,category.tutorial,[]];
            }
            var right = categories[category.categoryTitle][0];
            var total = categories[category.categoryTitle][1];
            categories[category.categoryTitle][0] = question.answerIsCorrect ? right + 1 : right;
            categories[category.categoryTitle][1] = total + 1;
            
            // this is ugly. There is a more efficient way to do this
            categories[category.categoryTitle][4].push( question.answerIsCorrect ? 1 : 0 );
            if (categories[category.categoryTitle][4].length > 3) {
              categories[category.categoryTitle][4].shift();
            }
            categories[category.categoryTitle][2] = 0;
            $.each(categories[category.categoryTitle][4], function(m, val){
              categories[category.categoryTitle][2] += val;
            });
          }
        });
      });
      
      return categories;
    },
    
    _sortSessionsByTime: function(report) {
      var sessions = [];
      var length = 0;
      
      $.each(report.sectionReports, function(i, sectionReport){
        $.each(sectionReport.pageReports, function(j, pageReport){
          $.each(pageReport.sessionReports, function(k, sessionReport){
            if (length === 0) {
              sessions.push(sessionReport);
            } else {
              var time = sessionReport.log.startTime;
              var inserted = false;
              for (var x = 0; x < length; x++){
                if (time < sessions[x].log.startTime) {
                  sessions.splice(x, 0, sessionReport);
                  inserted = true;
                  break;
                }
              }
              if (!inserted){
                sessions.push(sessionReport);
              }
            }
            length++;
          });
        });
      });
      
      return sessions;
    },

    saveData: function() {
      if (!!sparks.activity.id && !!sparks.couchDS.user){
        console.log("Saving data");
        var score = 0;
        var self = this;
        $.each(sparks.activity.sections, function(i, section){
          score += self.getTotalScoreForSection(section);
        });
        sparks.report.score = score;
        
        var data = sparks.report.toJSON();
        sparks.couchDS.save(data);
      }
    },
    
    loadReport: function(jsonReport) {
      sparks.report.score = jsonReport.score;
      $.each(jsonReport.sectionReports, function(i, jsonSectionReport){
        var sectionReport = new sparks.SectionReport();
        var section = sparks.activityController.findSection(jsonSectionReport.sectionId);
        sparks.report.sectionReports[section] = sectionReport;
        sectionReport.sectionId = jsonSectionReport.sectionId;
        sectionReport.sectionTitle = jsonSectionReport.sectionTitle;
        $.each(jsonSectionReport.pageReports, function(j, jsonPageReport){
          var pageReport = new sparks.PageReport();
          var page = section.pages[j];
          sectionReport.pageReports[page] = pageReport;
          $.each(jsonPageReport.sessionReports, function(k, jsonSessionReport){
            var sessionReport = new sparks.SessionReport();
            $.each(jsonSessionReport, function(key, val){
              sessionReport[key] = val;
            });
            if (sessionReport.timeTaken > 0){
              section.visited = true;
            }
            pageReport.sessionReports.push(sessionReport);
          });
        });
      });
    },
    
    showReport: function(studentName) {
      var ds = new sparks.CouchDS("/couchdb:");
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
      
      trySection(sectionAttempt);
      
      function arraysAreEquivalent(ar1, ar2){
        var equiv = true;
        $.each(ar1, function(i, val){
          if (sparks.util.contains(ar2, val) === -1){
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
  
  sparks.reportController = new sparks.ReportController();
})();