/*globals console sparks $ breadModel getBreadBoard */

(function() {

  sparks.ActivityView = function(activity){
    this.activity = activity;
    this.flashQueue = [];

    this.divs = {
      $breadboardDiv:   $('#breadboard'),
      $imageDiv:        $('#image'),
      $questionsDiv:    $('#questions_area'),
      $titleDiv:        $('#title'),
      $scopeDiv:        $('#oscope_mini'),
      $fgDiv:           $('#fg_mini')
    };
  };

  sparks.ActivityView.prototype = {

    layoutCurrentSection: function() {
      var section = sparks.activityController.currentSection;
      var self = this;

      $('#loading').hide();

      this.divs.$titleDiv.text(section.title);

      this.divs.$imageDiv.html('');

      if (!!section.image){
        var $image = sparks.activityController.currentSection.view.getImageView();
        this.divs.$imageDiv.append($image);
      }

      if (!!section.circuit && !section.hide_circuit){
        if (sparks.flash.loaded){
          sparks.flash.loaded = false;
          this.divs.$breadboardDiv.html('');
        }
        this.loadFlash();
        breadModel('updateFlash');

        var source = getBreadBoard().components.source;
        if (source.frequency) {
          var fgView = new sparks.FunctionGeneratorView(source);
          var $fg = fgView.getView();
          this.divs.$fgDiv.append($fg);
          this.doOnFlashLoad(function(){
            self.divs.$fgDiv.show();
          });
        }

        this.showDMM(section.show_multimeter);
        this.showOScope(section.show_oscilloscope);

        section.meter.reset();
      }

      this.layoutPage();
    },

    layoutPage: function() {
      this.hidePopups();
      if (!!sparks.sectionController.currentPage){
        this.divs.$questionsDiv.html('');
        var $page = sparks.sectionController.currentPage.view.getView();
        this.divs.$questionsDiv.append($page);
      }
      $('body').scrollTop(0);
    },

    loadFlash: function () {
       this.divs.$breadboardDiv.show().css("z-index", 0);
       this.divs.$breadboardDiv.flash({
           src: 'activities/module-2/breadboardActivity1.swf',
           id: 'breadboardActivity1',
           name: 'breadboardActivity1',
           width: 800,
           height: 500,
           quality: 'high',
           allowFullScreen: false,
           allowScriptAccess: 'sameDomain',
           wmode: 'transparent'
       });
     },

     setFlashLoaded: function(flashLoaded) {
       this.flashLoaded = flashLoaded;
       if (flashLoaded){
         for (var i = 0, ii = this.flashQueue.length; i < ii; i++) {
           this.flashQueue[i]();
         }
         this.flashQueue = [];
       }
     },

     doOnFlashLoad: function(func) {
       if (this.flashLoaded) {
         func();
       } else {
         this.flashQueue.push(func);
       }
     },
     
     showOScope: function(visible) {
       this.divs.$scopeDiv.html('');
       
       if (visible) {
         var scopeView = new sparks.OscilloscopeView();
         var $scope = scopeView.getView();
         this.divs.$scopeDiv.append($scope);
         var self = this;
         this.doOnFlashLoad(function(){
           self.divs.$scopeDiv.show();
         });
         sparks.activityController.currentSection.meter.oscope.setView(scopeView);
       }
       
       
       sparks.flash.sendCommand('set_oscope_probe_visibility',visible.toString());
     },
     
     showDMM: function(visible) {
       sparks.flash.sendCommand('set_multimeter_visibility',visible.toString());
       sparks.flash.sendCommand('set_probe_visibility',visible.toString());
     },
     
     hidePopups: function() {
       $('.ui-dialog').remove();
     },

     // not usually necessary. Justs for tests?
     setEmbeddingTargets: function(targets) {
       if (!!targets.$breadboardDiv){
         this.divs.$breadboardDiv = targets.$breadboardDiv;
       }
       if (!!targets.$imageDiv){
         this.divs.$imageDiv = targets.$imageDiv;
       }
       if (!!targets.$questionsDiv){
         this.divs.$questionsDiv = targets.$questionsDiv;
       }
     }
  };
})();