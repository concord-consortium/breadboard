require('./breadboard-svg-view');

var AddComponentsView     = require('./add-components-view'),
    EditComponentsView    = require('./edit-components-view'),
    FunctionGeneratorView = require('./function-generator-view'),
    OscilloscopeView      = require('./oscilloscope-view'),
    sound                 = require('../helpers/sound'),
    workbenchController;

WorkbenchView = function(workbench, breadboardController){
  workbenchController   = require('../controllers/workbench-controller');     // grrr
  this.breadboardController = breadboardController;
  this.workbench = workbench;
};

WorkbenchView.prototype = {
  layout: function(elId) {
    this.container = document.getElementById(elId);

    if (!this.container) {
      throw new Error("No DOM element found with the id "+elId);
    }

    if (this.container.classList)
      this.container.classList.add("breadboard_container");
    else
      this.container.className += ' ' + "breadboard_container";

    this.divs = {
      breadboard:       this.getOrCreateDiv('breadboard'),
      scope:            this.getOrCreateDiv('oscope_mini'),
      fg:               this.getOrCreateDiv('fg_mini', true),
      addCompsWrapper:  this.getOrCreateDiv('add_components')
    };

    var self = this;
    breadboardSVGView.ready(function() {
      if (workbenchController.breadboardView) {
        breadboardSVGView.clear(workbenchController.breadboardView);
      } else {
        self.divs.breadboard.html('');
        workbenchController.breadboardView = breadboardSVGView.create("breadboard");
      }

      // pass queued-up component right-click function to breadboard view
      if (self.rightClickFunction) {
        workbenchController.breadboardView.setRightClickFunction(self.rightClickObj, self.rightClickFunction);
      }

      self.breadboardController.updateView();

      sound.mute = true;

      self.showDMM(self.workbench.show_multimeter);
      self.showOScope(self.workbench.show_oscilloscope);
      // self.allowMoveYellowProbe(self.workbench.allow_move_yellow_probe);
      // self.hidePinkProbe(self.workbench.hide_pink_probe);

      sound.mute = false;

      self.workbench.meter.update();
    });

    var source = this.breadboardController.getComponents().source;
    if (source && source.frequency && !source.hidden) {
      var fgView = new FunctionGeneratorView(source);
      var $fg = fgView.getView();
      this.divs.fg.append($fg);
      this.divs.fg.show();
    }
    this.workbench.meter.reset();

    if (this.workbench.showComponentDrawer || this.workbench.showComponentEditor) {
      this.editComponentsView = new EditComponentsView(workbenchController, this.breadboardController);
    }

    if (this.workbench.showComponentDrawer) {
      var drawer = $('<div class="component_drawer retracted"></div>'),
          button = $('<button class="add_components_btn">Add a new Component</button>');

      this.divs.addCompsWrapper.append(drawer);
      this.divs.addCompsWrapper.append(button);

      var addComponentsView = new AddComponentsView(workbenchController, this.breadboardController);

      if (this.workbench.showComponentDrawer) {
        this.divs.addCompsWrapper.show();
        button.off();
        button.on('click', addComponentsView.openPane);
      }
    }
  },

  showOScope: function(visible) {
    this.divs.scope.html('');

    if (visible) {
     var scopeView = new OscilloscopeView();
     var $scope = scopeView.getView();
     this.divs.scope.append($scope);
     this.divs.scope.show();
     this.workbench.meter.oscope.setView(scopeView);

     workbenchController.breadboardView.addOScope({
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
      workbenchController.breadboardView.addDMM({
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

  setRightClickFunction: function(obj, func) {
    this.rightClickObj = obj;
    this.rightClickFunction = func;
  },

  getOrCreateDiv: function(clazz, hide) {
    $el = $(this.container).find('.'+clazz);
    if (!$el.length)
      $el = $('<div class="'+clazz+'"></div>').appendTo(this.container);
    if (hide) $el.hide();
    return $el;
  },

  showComponentEditor: function(id) {
    this.editComponentsView.showEditor(id);
  }
}

module.exports = WorkbenchView;
