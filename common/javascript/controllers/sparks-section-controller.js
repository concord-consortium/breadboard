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
    
    this.multimeter = null; // this is a kind of strange place for this, yes
    
    this.jsonSection = null;
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
      
      section.id = jsonSection._id;
      section.title = jsonSection.title;
      
      section.section_url = sparks.activity_base_url + section.id;
      section.images_url = sparks.activity_images_base_url + section.id;
      
      section.image = jsonSection.image;
      
      section.circuit = jsonSection.circuit;
      section.faults = jsonSection.faults;
      section.hide_circuit = !!jsonSection.hide_circuit;
      section.show_multimeter = !(!(jsonSection.show_multimeter) || jsonSection.show_multimeter === "false");
      section.disable_multimeter_position = jsonSection.disable_multimeter_position;
      
      section.jsonSection = jsonSection;
      
      // cheat and create dummy pages for report
      if (!!jsonSection.pages){
        $.each(jsonSection.pages, function(id, jsonPage){
          var page = new sparks.SparksPage(id);
          section.pages.push(page);
        });
      }
      
      section.view = new sparks.SparksSectionView(section);
      
      return section;
    },
    
    loadCurrentSection: function() {
      var section = sparks.sparksActivityController.currentSection;
      breadModel("clear");
      
      if (!!section.circuit){
        breadModel("createCircuit", section.circuit);
        
        this.multimeter = new sparks.circuit.Multimeter2();
        if(section.disable_multimeter_position){
          this.multimeter.set_disable_multimeter_position(section.disable_multimeter_position);
        }
      }
      
      if (!!section.faults){
        breadModel("addFaults", section.faults);
      }
      
      section.pages = [];
      sparks.sparksQuestionController.reset();
      
      var jsonSection = section.jsonSection;
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
      
      sparks.vars = {};          // used for storing authored script variables
      
      sparks.sparksLogController.startNewSession();
      sparks.sparksReportController.startNewSection(section);
    },
    
    areMorePage: function() {
      var nextPage;
      var section = sparks.sparksActivityController.currentSection;
      if (this.currentPageIndex < section.pages.length - 1){
        return section.pages[this.currentPageIndex+1];
      } else {
        return false;
      }
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
      
      sparks.sparksActivity.view.layoutPage();
      
      sparks.sparksLogController.startNewSession();
    },
    
    // if page is null, currentPage will be used
    repeatPage: function(page) {
      sparks.sparksReportController.saveData();
      
      if (!!page){
        this.currentPage = page;
        this.currentPageIndex = this.pageIndexMap[page];
      }
      
      var section = sparks.sparksActivityController.currentSection;
      // section.view.clear();
      
      this.loadCurrentSection();
      sparks.sparksActivity.view.layoutCurrentSection();
      
      // if (!sparks.jsonSection.hide_circuit && !sparks.debug){
      //   sparks.flash.activity.loadFlash();
      // } else {
      //   sparks.flash.activity.onActivityReady();
      // }
    },
    
    repeatSection: function() {
      this.repeatPage(sparks.sparksActivityController.currentSection.pages[0]);
    },
    
    viewSectionReport: function() {
      sparks.sparksReportController.saveData();
      
      var $report = sparks.sparksReport.view.getActivityReportView();
      this.currentPage.view.showReport($report, true);
    }
    
  };

  sparks.sparksSectionController = new sparks.SparksSectionController();
})();