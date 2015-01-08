var Oscilloscope  = require('../models/oscilloscope'),
    Workbench     = require('../models/workbench'),
    Multimeter    = require('../circuit/multimeter'),
    logController = require('../controllers/log-controller'),
    Breadboard    = require('../circuit/breadboard');


WorkbenchController = function(){
  //this.workbenchMap = {}
  this.workbench = null;    // for now
};

WorkbenchController.prototype = {

  createWorkbench: function(props, elId) {
    var workbench = new Workbench();
    this.workbench = workbench;

    workbench.circuit = props.circuit;
    if (workbench.circuit) workbench.circuit.referenceFrequency = props.referenceFrequency;

    workbench.faults = props.faults;

    workbench.show_multimeter = !(!(props.show_multimeter) || props.show_multimeter === "false");     // may be a string
    workbench.show_oscilloscope = !(!(props.show_oscilloscope) || props.show_oscilloscope === "false");
    workbench.allow_move_yellow_probe = !(!(props.allow_move_yellow_probe) || props.allow_move_yellow_probe === "false");
    workbench.hide_pink_probe = !(!(props.hide_pink_probe) || props.hide_pink_probe === "false");
    workbench.disable_multimeter_position = props.disable_multimeter_position;

    workbench.showComponentDrawer = !(!(props.showComponentDrawer) || props.showComponentDrawer === "false");
    workbench.showComponentEditor = !(!(props.showComponentEditor) || props.showComponentEditor === "false");

    if (workbench.show_multimeter) {
      workbench.meter.dmm = new Multimeter();
      if(workbench.disable_multimeter_position){
        workbench.meter.dmm.set_disable_multimeter_position(workbench.disable_multimeter_position);
      }
    } else {
      workbench.meter.dmm = null;
    }

    if (workbench.show_oscilloscope) {
      workbench.meter.oscope = new Oscilloscope();
    } else {
      workbench.meter.oscope = null;
    }

    // this shouldn't be here
    logController.startNewSession();

    this.loadBreadboard();

    workbench.view.layout(elId);

    return workbench;
  },

  loadBreadboard: function() {
    var workbench = this.workbench;

    Breadboard.breadModel("clear");

    if (!!workbench.circuit){
      Breadboard.breadModel("createCircuit", workbench.circuit);
    }

    if (!!workbench.faults){
      Breadboard.breadModel("addFaults", workbench.faults);
    }
  },

  setDMMVisibility: function(visible) {
    var workbench = this.workbench;
    if (visible) {
      workbench.meter.dmm = new Multimeter();
      if(workbench.disable_multimeter_position){
        workbench.meter.dmm.set_disable_multimeter_position(workbench.disable_multimeter_position);
      }
    } else {
      workbench.meter.dmm = null;
    }
    sparks.activity.view.showDMM(visible);
  },

  setOScopeVisibility: function(visible) {
    var workbench = this.workbench;
    if (visible) {
      workbench.meter.oscope = new Oscilloscope();
    } else {
      workbench.meter.oscope = null;
    }
    sparks.activity.view.showOScope(visible);
  }

};

//var workbenchController = new WorkbenchController();

module.exports = new WorkbenchController();
