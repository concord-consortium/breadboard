/*globals console sparks $ breadModel getBreadBoard */

(function() {

  sparks.ActivityView = function(activity){
    this.activity = activity;
    this.commandQueue = [];

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
        breadboardView.ready(function() {
          sparks.breadboardView = breadboardView.create("breadboard");
          // FIXME: view should accept battery as standard component via API
          sparks.breadboardView.addBattery("left_negative21,left_positive21");
          breadModel('updateView');
        });

        var source = getBreadBoard().components.source;
        if (source.frequency) {
          var fgView = new sparks.FunctionGeneratorView(source);
          var $fg = fgView.getView();
          this.divs.$fgDiv.append($fg);
          this.divs.$fgDiv.show();
        }
        section.meter.reset()

        console.log("will show dmm? "+section.show_multimeter)
        this.showDMM(section.show_multimeter);
        this.showOScope(section.show_oscilloscope);
        this.allowMoveYellowProbe(section.allow_move_yellow_probe);
        this.hidePinkProbe(section.hide_pink_probe);

        section.meter.update();
      }

      this.layoutPage(true);
    },

    layoutPage: function(hidePopups) {
      if (hidePopups) {
        this.hidePopups();
      }
      if (!!sparks.sectionController.currentPage){
        this.divs.$questionsDiv.html('');
        var $page = sparks.sectionController.currentPage.view.getView();
        this.divs.$questionsDiv.append($page);
      }
      $('body').scrollTop(0);
    },

     showOScope: function(visible) {
       this.divs.$scopeDiv.html('');

       if (visible) {
         var scopeView = new sparks.OscilloscopeView();
         var $scope = scopeView.getView();
         this.divs.$scopeDiv.append($scope);
         this.divs.$scopeDiv.show();
         sparks.activityController.currentSection.meter.oscope.setView(scopeView);

         sparks.breadboardView.addOScope({
              "yellow":{
              "connection": "left_positive21",
              "draggable": true
            },"pink": {
              "connection": "f22",
              "draggable": true
            }
          });
       }



         sparks.flash.sendCommand('set_oscope_probe_visibility',visible.toString());

         if (visible) {
          sparks.flash.sendCommand('enable_probe_dragging', "yellow", true);
         }
     },

     showDMM: function(visible) {
      if (visible) {
       sparks.breadboardView.addDMM({
            "dial": "dcv_20",
            "black":{
            "connection": "g12",
            "draggable": true
          },"red": {
            "connection": "f3",
            "draggable": true
          }
        });
      }
       //sparks.flash.sendCommand('set_multimeter_visibility',visible.toString());
       //sparks.flash.sendCommand('set_probe_visibility',visible.toString());
     },

     allowMoveYellowProbe: function(allow) {
       sparks.flash.sendCommand('enable_probe_dragging', "yellow", allow);
     },

     hidePinkProbe: function(allow) {
        // not supported yet
     },

     hidePopups: function() {
       $('.ui-dialog').empty().remove();
       var section = sparks.activityController.currentSection;
       if (section && section.meter) {
        section.meter.reset();
        section.meter.update();
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