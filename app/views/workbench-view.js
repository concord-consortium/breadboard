(function() {

  sparks.WorkbenchView = function(workbench){
    this.workbench = workbench;
  };

  sparks.WorkbenchView.prototype = {
    layout: function(elId) {
      this.container = document.getElementById(elId);

      if (!this.container) {
        throw new Error("No DOM element found with the id "+elId);
      }

      this.divs = {
        breadboard:       this.getOrCreateDiv('breadboard'),
        scope:            this.getOrCreateDiv('oscope_mini'),
        fg:               this.getOrCreateDiv('fg_mini', true),
        addCompsWrapper:  this.getOrCreateDiv('add_components'),
        addCompsBtn:      this.getOrCreateDiv('add_components_btn')
      };

      this.divs.breadboard.html('');

      var self = this;
      breadboardView.ready(function() {
        sparks.breadboardView = breadboardView.create("breadboard");

        // pass queued-up component right-click function to breadboard view
        if (self.rightClickFunction) {
          sparks.breadboardView.setRightClickFunction(self.rightClickFunction);
        }

        breadModel('updateView');

        sparks.sound.mute = true;

        self.showDMM(self.workbench.show_multimeter);
        self.showOScope(self.workbench.show_oscilloscope);
        // self.allowMoveYellowProbe(self.workbench.allow_move_yellow_probe);
        // self.hidePinkProbe(self.workbench.hide_pink_probe);

        sparks.sound.mute = false;

        self.workbench.meter.update();
      });

      var source = getBreadBoard().components.source;
      if (source && source.frequency) {
        var fgView = new sparks.FunctionGeneratorView(source);
        var $fg = fgView.getView();
        this.divs.fg.append($fg);
        this.divs.fg.show();
      }
      this.workbench.meter.reset();

      if (this.workbench.showComponentDrawer || this.workbench.showComponentEditor) {
        var addComponentsView = new sparks.AddComponentsView(this.workbench);

        if (this.workbench.showComponentDrawer) {
          this.divs.addCompsWrapper.show();
          this.divs.addCompsBtn.off();
          this.divs.addCompsBtn.on('click', addComponentsView.openPane);
        }
      }
    },

    showOScope: function(visible) {
      this.divs.scope.html('');

      if (visible) {
       var scopeView = new sparks.OscilloscopeView();
       var $scope = scopeView.getView();
       this.divs.scope.append($scope);
       this.divs.scope.show();
       this.workbench.meter.oscope.setView(scopeView);

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
    },

    allowMoveYellowProbe: function() {
    },

    hidePinkProbe: function() {
    },

    setRightClickFunction: function(func) {
      this.rightClickFunction = func;
    },

    getOrCreateDiv: function(clazz, hide) {
      $el = $(this.container).find('.'+clazz);
      if (!$el.length)
        $el = $('<div class="'+clazz+'"></div>').appendTo(this.container);
      if (hide) $el.hide();
      return $el;
    }
  }

})();
