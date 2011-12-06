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
      $scopeOverlayDiv: $('#oscope_mini_overlay'),
      $fgDiv:           $('#fg_mini'),
      $fgOverlayDiv:    $('#fg_mini_overlay'),
      $fgValueDiv:      $('#fg_value')
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
          fgView.setMiniViewSpan(this.divs.$fgValueDiv, this.divs.$fgOverlayDiv);
          this.doOnFlashLoad(function(){
            self.divs.$fgDiv.show();
            self.divs.$fgOverlayDiv.show();
          });
        }

        if (section.show_multimeter){
          sparks.flash.sendCommand('set_multimeter_visibility','true');
          sparks.flash.sendCommand('set_probe_visibility','true');
        } else if (section.show_oscilloscope){
          var scopeView = new sparks.OscilloscopeView();
          var $scope = scopeView.getMiniView();
          this.divs.$scopeDiv.append($scope);
          sparks.flash.sendCommand('set_probe_visibility','true');
          this.doOnFlashLoad(function(){
            self.divs.$scopeDiv.show();
            self.divs.$scopeOverlayDiv.show();
          });
          section.meter.setView(scopeView);
        }
      }

      this.layoutPage();
    },

    layoutPage: function() {
      if (!!sparks.sectionController.currentPage){
        this.divs.$questionsDiv.html('');
        var $page = sparks.sectionController.currentPage.view.getView();
        this.divs.$questionsDiv.append($page);
      }
      $('body').scrollTop(0);
    },

    loadFlash: function () {
       this.divs.$breadboardDiv.css("z-index", 0);
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