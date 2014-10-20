/*global sparks $ breadModel */

(function() {

  /*
   * Sparks Activity Controller can be accessed by the
   * singleton variable sparks.workbenchController
   */
  sparks.WorkbenchController = function(){
    //this.workbenchMap = {}
    this.workbench = null;    // for now
  };

  sparks.WorkbenchController.prototype = {

    createWorkbench: function(props, elId) {
      var workbench = new sparks.Workbench();

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
        workbench.meter.dmm = new sparks.circuit.Multimeter2();
        if(workbench.disable_multimeter_position){
          workbench.meter.dmm.set_disable_multimeter_position(workbench.disable_multimeter_position);
        }
      } else {
        workbench.meter.dmm = null;
      }

      if (workbench.show_oscilloscope) {
        workbench.meter.oscope = new sparks.circuit.Oscilloscope();
      } else {
        workbench.meter.oscope = null;
      }

      this.workbench = workbench;

      // this shouldn't be here
      sparks.logController.startNewSession();

      this.loadBreadboard();

      workbench.view = new sparks.WorkbenchView(workbench);
      workbench.view.layout(elId);

      return workbench;
    },

    loadBreadboard: function() {
      var workbench = this.workbench;

      breadModel("clear");

      if (!!workbench.circuit){
        breadModel("createCircuit", workbench.circuit);
      }

      if (!!workbench.faults){
        breadModel("addFaults", workbench.faults);
      }
    },

    setDMMVisibility: function(visible) {
      var workbench = this.workbench;
      if (visible) {
        workbench.meter.dmm = new sparks.circuit.Multimeter2();
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
        workbench.meter.oscope = new sparks.circuit.Oscilloscope();
      } else {
        workbench.meter.oscope = null;
      }
      sparks.activity.view.showOScope(visible);
    }

  };

  sparks.workbenchController = new sparks.WorkbenchController();
})();
