/*globals console sparks $ breadModel getBreadBoard */

(function() {

  /*
   * Sparks Activity Controller can be accessed by the
   * singleton variable sparks.sectionController
   */
  sparks.SectionController = function(){
    this.currentPage = null;
    this.currentPageIndex = -1;
    this.pageIndexMap = {};

    this.jsonSection = null;
    this.id = -1;
  };

  sparks.SectionController.prototype = {

    reset: function(){
      // this.currentPage = null;
      // this.currentPageIndex = -1;
      sparks.pageController.reset();
      sparks.questionController.reset();
    },

    createSection: function(jsonSection) {
      var section = new sparks.Section();

      section.id = jsonSection._id || this.nextId();
      section.title = jsonSection.title;

      section.section_url = sparks.activity_base_url + section.id;
      section.images_url = sparks.activity_images_base_url + section.id;

      section.image = jsonSection.image;

      section.circuit = jsonSection.circuit;
      if (section.circuit) section.circuit.referenceFrequency = jsonSection.referenceFrequency;
      section.faults = jsonSection.faults;

      section.hide_circuit = !!jsonSection.hide_circuit;
      section.show_multimeter = !(!(jsonSection.show_multimeter) || jsonSection.show_multimeter === "false");     // may be a string
      section.show_oscilloscope = !(!(jsonSection.show_oscilloscope) || jsonSection.show_oscilloscope === "false");
      section.allow_move_yellow_probe = !(!(jsonSection.allow_move_yellow_probe) || jsonSection.allow_move_yellow_probe === "false");
      section.disable_multimeter_position = jsonSection.disable_multimeter_position;

      if (!section.hide_circuit && section.show_multimeter) {
        section.meter.dmm = new sparks.circuit.Multimeter2();
        if(section.disable_multimeter_position){
          section.meter.dmm.set_disable_multimeter_position(section.disable_multimeter_position);
        }
      } else {
        section.meter.dmm = null;
      }

      if (!section.hide_circuit && section.show_oscilloscope) {
        section.meter.oscope = new sparks.circuit.Oscilloscope();
      } else {
        section.meter.oscope = null;
      }

      section.jsonSection = jsonSection;

      // cheat and create dummy pages for report
      if (!!jsonSection.pages){
        $.each(jsonSection.pages, function(id, jsonPage){
          var page = new sparks.Page(id);
          section.pages.push(page);
        });
      }

      section.view = new sparks.SectionView(section);

      return section;
    },

    loadCurrentSection: function() {
      var section = sparks.activityController.currentSection;
      section.visited = true;
      sparks.vars = {};          // used for storing authored script variables

      breadModel("clear");

      if (!!section.circuit){
        breadModel("createCircuit", section.circuit);
      }

      if (!!section.faults){
        breadModel("addFaults", section.faults);
      }

      section.pages = [];
      sparks.questionController.reset();

      var jsonSection = section.jsonSection;
      var self = this;
      if (!!jsonSection.pages){
        $.each(jsonSection.pages, function(i, jsonPage){
          var page = sparks.pageController.createPage(i, jsonPage);
          section.pages.push(page);
          self.pageIndexMap[page] = i;
        });

        if (this.currentPageIndex == -1){
          this.currentPageIndex = 0;
        }
        this.currentPage = section.pages[this.currentPageIndex];
      }

      sparks.logController.startNewSession();
      sparks.reportController.startNewSection(section);

      sparks.GAHelper.userStartedLevel(section.title);
    },

    areMorePage: function() {
      var nextPage;
      var section = sparks.activityController.currentSection;
      if (this.currentPageIndex < section.pages.length - 1){
        return section.pages[this.currentPageIndex+1];
      } else {
        return false;
      }
    },

    nextPage: function() {
      sparks.reportController.saveData();

      var nextPage = this.areMorePage();
      if (!nextPage){
        return;
      }
      this.currentPageIndex = this.currentPageIndex+1;
      this.currentPage = nextPage;

      sparks.activity.view.layoutPage(false);

      sparks.logController.startNewSession();
    },

    // if page is null, currentPage will be used
    repeatPage: function(page) {
      var section = sparks.activityController.currentSection;
      sparks.GAHelper.userRepeatedLevel(section.title);
      sparks.reportController.saveData();

      if (!!page){
        this.currentPage = page;
        this.currentPageIndex = this.pageIndexMap[page];
      }

      this.loadCurrentSection();
      sparks.activity.view.layoutCurrentSection();

      // if (!sparks.jsonSection.hide_circuit && !sparks.debug){
      //   sparks.flash.activity.loadFlash();
      // } else {
      //   sparks.flash.activity.onActivityReady();
      // }
    },

    repeatSection: function(section) {
      sparks.GAHelper.userRepeatedLevel(section.title);
      if (!!section){
        sparks.activityController.currentSection = section;
      }
      this.repeatPage(sparks.activityController.currentSection.pages[0]);
    },

    viewSectionReport: function() {
      sparks.reportController.saveData();

      var $report = sparks.report.view.getActivityReportView();
      this.currentPage.view.showReport($report, true);
    },

    nextId: function() {
      this.id = this.id + 1;
      return this.id;
    },

    setDMMVisibility: function(visible) {
      var section = sparks.activityController.currentSection;
      if (visible) {
        section.meter.dmm = new sparks.circuit.Multimeter2();
        if(section.disable_multimeter_position){
          section.meter.dmm.set_disable_multimeter_position(section.disable_multimeter_position);
        }
      } else {
        section.meter.dmm = null;
      }
      sparks.activity.view.showDMM(visible);
    },

    setOScopeVisibility: function(visible) {
      var section = sparks.activityController.currentSection;
      if (visible) {
        section.meter.oscope = new sparks.circuit.Oscilloscope();
      } else {
        section.meter.oscope = null;
      }
      sparks.activity.view.showOScope(visible);
    }

  };

  sparks.sectionController = new sparks.SectionController();
})();