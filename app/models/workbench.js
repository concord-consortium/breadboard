/*global sparks $ */

(function() {
  sparks.Workbench = function(props){
    this.circuit = null;
    this.meter = new sparks.Meter();

    this.show_multimeter          = false;
    this.show_oscilloscope        = false;
    this.allow_move_yellow_probe  = false;
    this.hide_pink_probe          = false;
    this.showComponentDrawer      = false;

    this.view = new sparks.WorkbenchView(this);
  };

  sparks.Workbench.prototype = {

    toJSON: function () {
      var json = {};
      return json;
    }

  };

})();
