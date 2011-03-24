/*globals console sparks $ breadModel getBreadBoard */

(function() {
  
  /*
   * Sparks Activity Controller can be accessed by the
   * singleton variable sparks.sparksSectionController
   */
  sparks.SparksSectionController = function(){
    this.currentPage = null;
    this.currentPageIndex = -1;
    this.pageIndexMap = {};
  };
  
  sparks.SparksSectionController.prototype = {
    
    reset: function(){
      // this.currentPage = null;
      // this.currentPageIndex = -1;
      sparks.sparksPageController.reset();
      sparks.sparksQuestionController.reset();
    },
    
    createSection: function(jsonSection) {
      var section = new sparks.SparksSection();
      
      if (!!jsonSection.section_url){
        section.section_url = jsonSection.section_url;
      } else {
        section.section_url = sparks.jsonSection.section_url;
      }
      
      if (!!jsonSection.images_url){
        section.images_url = jsonSection.images_url;
      } else {
        section.images_url = sparks.jsonSection.images_url;
      }
      
      section.image = jsonSection.image;
      
      if (!!jsonSection.circuit){
        section.circuit = jsonSection.circuit;
        breadModel("createCircuit", section.circuit);
      }
      
      section.hide_circuit = !!jsonSection.hide_circuit;
      
      var self = this;
      if (!!jsonSection.pages){
        $.each(jsonSection.pages, function(i, jsonPage){
          var page = sparks.sparksPageController.createPage(i, jsonPage);
          section.pages.push(page);
          self.pageIndexMap[page] = i;
        });
        
        if (this.currentPageIndex == -1){
          this.currentPageIndex = 0;
        }
        this.currentPage = section.pages[this.currentPageIndex];
      }
      
      if (!!jsonSection.formulas){
        $.each(this.jsonSection.formulas, function(i, formula){
          var variables = {};
          var variable = formula.match(/.* =/)[0];
          variable = variable.substring(0,variable.length-2);
          formula = "variables."+formula;
          eval(formula);
          var value = variables[0];
          this.sparksActivity.variables[variable] = value;
        });
      }
      
      section.view = new sparks.SparksSectionView(section);
      
      sparks.sparksLogController.startNewSession();
      
      return section;
    },
    
    areMorePage: function() {
      var nextPage;
      var section = sparks.sparksActivityController.currentSection;
      for (var i = 0; i < section.pages.length-1; i++){
        if (section.pages[i] == this.currentPage){
          nextPage = section.pages[i+1];
        }
      }
      if (!nextPage){
        return false;
      }
      return nextPage;
    },
    
    nextPage: function() {
      sparks.sparksReportController.saveData();
      
      var nextPage = this.areMorePage();
      if (!nextPage){
        console.log("No more pages");
        return;
      }
      this.currentPageIndex = this.currentPageIndex+1;
      this.currentPage = nextPage;
      
      sparks.activityContstructor.layoutPage();
      
      sparks.sparksLogController.startNewSession();
    },
    
    // if page is null, currentPage will be used
    repeatPage: function(page) {
      sparks.sparksReportController.saveData();
      
      if (!!page){
        this.currentPage = page;
        this.currentPageIndex = this.pageIndexMap[page];
      }
      
      $('#breadboard').html('');
      $('#image').html('');
      this.currentPage.view.clear();
      
      breadModel('clear');
      if (!sparks.jsonSection.hide_circuit && !sparks.debug){
        sparks.flash.activity.loadFlash();
      } else {
        sparks.flash.activity.onActivityReady();
      }
    },
    
    viewSectionReport: function() {
      sparks.sparksReportController.saveData();
      
      var $report = sparks.sparksReport.view.getActivityReportView();
      this.currentPage.view.showReport($report, true);
    }
    
  };

  sparks.sparksSectionController = new sparks.SparksSectionController();
})();