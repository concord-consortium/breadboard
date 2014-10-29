var Meter         = require('./meter'),
    WorkbenchView = require('../views/workbench-view');

Workbench = function(props){
  this.circuit = null;
  this.meter = new Meter();

  this.show_multimeter          = false;
  this.show_oscilloscope        = false;
  this.allow_move_yellow_probe  = false;
  this.hide_pink_probe          = false;
  this.showComponentDrawer      = false;

  this.view = new WorkbenchView(this);
};

Workbench.prototype = {

  toJSON: function () {
    var json = {};
    return json;
  }

};

module.exports = Workbench;
