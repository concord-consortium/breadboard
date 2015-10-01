var util                  = require('../helpers/util'),
    Breadboard            = require('../circuit/breadboard'),
    Battery               = require('../circuit/battery'),
    Capacitor             = require('../circuit/capacitor'),
    FunctionGenerator     = require('../circuit/function-generator'),
    Inductor              = require('../circuit/inductor'),
    PowerLead             = require('../circuit/power-lead'),
    Resistor4band         = require('../circuit/resistor-4band'),
    Resistor              = require('../circuit/resistor'),
    VariableResistor      = require('../circuit/variable-resistor'),
    Component             = require('../circuit/component'),
    Wire                  = require('../circuit/wire'),
    componentTypes = {
      "resistor": Resistor,
      "variable resistor": VariableResistor,
      "inductor": Inductor,
      "capacitor": Capacitor,
      "battery": Battery,
      "function generator": FunctionGenerator,
      "wire": Wire,
      "powerLead": PowerLead
    },
    breadboard,
    workbenchController,
    BreadboardController,
    breadboardController;



BreadboardController = function() {
  breadboard = new Breadboard();
}

BreadboardController.prototype = {

  init: function (_workbenchController) {
    workbenchController = _workbenchController;
  },

  component: function (props) {
    if(typeof props=='string'){
      return breadboard.components[props];
    } else {
      var component;

      if (componentTypes[props.kind]){
        component = new componentTypes[props.kind](props, this, workbenchController);
      } else {
        component = new Component(props, this);
      }
      breadboard.components[props.UID] = component;
      return component;
    }
  },

  clear: function () {
    var destroyed = 0,
        k;

    this.resOrderOfMagnitude = -1;
    for( k in breadboard.components ){
      if (!breadboard.components.hasOwnProperty(k)) continue;
      this.removeComponent(breadboard.components[k]);
    }
    breadboard.components = {};
    breadboard.faultyComponents = [];

    this.clearHoleMap();
  },

  // can pass either a hole or a string
  getHole: function(hole) {
    if (!hole) return;

    if (hole.name){
      if (!!breadboard.holeMap[hole.name]){
        return this.getHole(breadboard.holeMap[hole.getName()]);
      }
      return hole;
    }

    // should be a string

    // replace with mapped name
    if (!!breadboard.holeMap[hole]){
      hole = breadboard.holeMap[hole];
    }

    // return hole if it is in breadboard
    if (!!breadboard.holes[hole]){
      return breadboard.holes[hole];
    }

    // otherwise, make a new ghosthole
    return breadboard.createGhostHole(hole);
  },

  getHoles: function() {
    return breadboard.holes;
  },

  // Resets all connections, used when holeMap changes
  resetConnections: function(oldHoleName, newHoleName) {
    var i, j;

    for( i in breadboard.components ){
      if (!breadboard.components.hasOwnProperty(i)) continue;
      var comp = this.component(i);
      for (j in comp.connections){
        if (!comp.connections.hasOwnProperty(j)) continue;
        if (!!comp.connections[j] && comp.connections[j].getName() === oldHoleName) {
          comp.connections[j] = this.getHole(newHoleName);
        }
      }
    }
  },

  // Adds a fault to an existing circuit. A fault may affect one or
  // more components. If fault.component is set, it will be applied to
  // that component. Otherwise, if fault.count or fault.max are set, it
  // will be applied to a number of random components.
  addFault: function(fault) {
    if (!!fault.component){
      this.addFaultToComponent(fault, breadboard.components[fault.component]);
    } else {
      // find out how many components we should be applying this to
      var count;
      if (!!fault.count) {
        count = fault.count;
      } else if (!!fault.max) {
        count = Math.floor(Math.random() * fault.max) + 1;    // between 1 and max faults
      }


      // apply fault to valid components 'count' times, with no repitition. No checking is
      // done to see if there are sufficient valid components for this to be possible, so
      // application will hang if authored badly.
      var componentKeys = util.getKeys(breadboard.components);
      for (var i = 0; i < count; i++){
        var randomComponent = null;
        while (randomComponent === null) {
          var rand = Math.floor(Math.random() * componentKeys.length);
          var component = breadboard.components[componentKeys[rand]];
          if (!!component.applyFaults && (util.contains(breadboard.faultyComponents, component) === -1)){
            randomComponent = component;
          }
        }
        this.addFaultToComponent(fault, randomComponent);
      }
    }
  },

  // adds a fault to a specific component. If fault.type is an array, a random
  // type will be picked
  addFaultToComponent: function(fault, component) {
    var type;
    if (fault.type instanceof Array){
      type = fault.type[Math.floor(Math.random() * fault.type.length)];
    } else {
      type = fault.type;
    }

    if (type === "open") {
      component.open = true;
      component.shorted = false;
    } else if (type === "shorted") {
      component.shorted = true;
      component.open = false;
    }
    if (component.applyFaults) {
      component.applyFaults();
    }

    breadboard.faultyComponents.push(component);
  },

  addFaultyComponent: function(comp) {
    if (!~breadboard.faultyComponents.indexOf(this)) {
      brebreadboardadBoard.faultyComponents.push(this);
    }
  },

  getFaults: function() {
    return breadboard.faultyComponents;
  },

  getFault: function() {
    if (breadboard.faultyComponents.length > 0){
      return breadboard.faultyComponents[0];
    }
    return null;
  },



  // "Public" functions. These used to be the old "interfaces" object
  insertComponent: function(kind, properties){
    // copy props into a new obj, so we don't modify original
    var props = {};
    $.each(properties, function(key, property){
      props[key] = property;
    });

    props.kind = kind;

    // ensure no dupes, using either passed UID or type
    props.UID = this.getUID(!!props.UID ? props.UID : props.kind);

    // if uid is source, and no conections are specified, assume we are connecting to rails
    if (props.UID === "source" && !props.connections){
      props.connections = "left_positive21,left_negative21";
    }

    var newComponent = this.component(props);

    // update view
    if (workbenchController.breadboardView) {
      if (newComponent.getViewArguments && newComponent.hasValidConnections() && newComponent.kind !== "battery" && !newComponent.hidden) {
        workbenchController.breadboardView.addComponent(newComponent.getViewArguments());
      }
      if ((newComponent.kind == "battery" || newComponent.kind == "function generator") && !newComponent.hidden){ // FIXME
        workbenchController.breadboardView.addBattery("left_negative21,left_positive21");
      }
    }

    return newComponent.UID;
  },

  createCircuit: function(jsonCircuit) {
    var circuitHasReferenceFrequency = typeof jsonCircuit.referenceFrequency === 'number';
    var self = this;
    $.each(jsonCircuit, function(i, spec) {
      // allow each component spec to override the circuit-wide reference frequency, if author desires.
      if (circuitHasReferenceFrequency && typeof spec.referenceFrequency === 'undefined') {
        spec.referenceFrequency = jsonCircuit.referenceFrequency;
      }
      self.insertComponent(spec.type, spec);
    });

    this.insertComponent("powerLead", {
      UID: "blackPowerLead",
      type: "powerLead",
      connections: "left_negative21"
    });
  },

  addFaults: function(jsonFaults){
    var self = this;
    $.each(jsonFaults, function(i, fault){
      self.addFault(fault);
    });
  },

  getResOrderOfMagnitude: function(){
    return breadboard.resOrderOfMagnitude;
  },

  setResOrderOfMagnitude: function(om){
    breadboard.resOrderOfMagnitude = om;
  },

  checkLocation: function(comp){     // ensure that a component's leads aren't too close
    var minDistance = {
          resistor: 6,
          inductor: 5,
          capacitor: 3,
          wire: 3
        },
        yValue = {
          left_positive: 1,
          left_negative: 2,
          a: 4, b: 5, c: 6, d: 7, e: 8,
          f: 10, g: 11, h: 12, i: 13, j: 14,
          right_positive: 16,
          right_negative: 17
        },
        getCoordinate = function(hole) {      // returns [20, 4] for "a20"
          var name  = hole.name,
              split = /(\D*)(.*)/.exec(name),
              row   = yValue[split[1]];
          return [split[2]*1, row];
        },
        leadsAreTooClose = function() {
          var dx, dy, leadDistance;

          comp.coord = [];
          comp.coord[0] = getCoordinate(comp.connections[0]);
          comp.coord[1] = getCoordinate(comp.connections[1]);
          dx = comp.coord[1][0] - comp.coord[0][0];
          dy = comp.coord[1][1] - comp.coord[0][1];
          leadDistance = Math.sqrt(dx*dx + dy*dy);

          return (leadDistance < minDistance[comp.type]);
        },
        leadsWereTooClose = false;

    while (leadsAreTooClose()) {
      leadsWereTooClose = true;
      var rightLead = comp.coord[0][0] < comp.coord[1][0] ? 0 : 1,
          leftLead = (rightLead - 1) * -1,
          newX, newName;

      if (comp.coord[rightLead][0] > 1) {
        // move right lead one to the right
        newX = comp.coord[rightLead][0] - 1;
        newName = comp.connections[rightLead].name.replace(/\d*$/, newX);
        comp.connections[rightLead] = this.getHole(newName);
      } else {
        // move left lead one to the left
        newX = comp.coord[leftLead][0] + 1;
        newName = comp.connections[leftLead].name.replace(/\d*$/, newX);
        comp.connections[leftLead] = this.getHole(newName);
      }
    }

    // update view
    if (leadsWereTooClose && workbenchController.breadboardView) {
      workbenchController.breadboardView.removeComponent(comp.UID);
      workbenchController.breadboardView.addComponent(comp.getViewArguments());
    }

  },

  getUID: function(_name){
    var name = _name.replace(/ /g, "_");      // no spaces in qucs

    if (!breadboard.components[name]){
      return name;
    }

    var i = 0;
    while (!!breadboard.components[""+name+i]){
      i++;
    }
    return ""+name+i;
  },

  // clean up these three overlapping functions
  remove: function(type, connections){
    var comp = this.findComponent(type, connections);
    workbenchController.breadboardView.removeComponent(comp.UID);
    if (!!comp){
      comp.destroy();
    }
  },

  removeComponent: function(comp){
    var uid = comp.UID;
    comp.destroy();
    if (uid && workbenchController.breadboardView) {
      workbenchController.breadboardView.removeComponent(uid);
    }
  },

  deleteComponentFromMap: function(id) {
    delete breadboard.components[id];
  },

  findComponent: function(type, connections){
    var i, component;

    if (!!type && !!connections && connections.split(",").length === 2){
      connections = connections.split(",");
      for (i in breadboard.components){
        if (!breadboard.components.hasOwnProperty(i)) continue;
        component = breadboard.components[i];
        if (component.kind === type && !!component.connections[0] &&
          ((component.connections[0].getName() === connections[0] &&
            component.connections[1].getName() === connections[1]) ||
          (component.connections[0].getName() === connections[1] &&
            component.connections[1].getName() === connections[0]))){
            return component;
          }
      }
    }
    return null;
  },

  destroy: function(component){
    this.component(component).destroy();
  },

  move: function(component, connections){
    this.component(component).move(connections.split(','));
  },

  getGhostHole: function(name){
    return breadboard.createGhostHole(name);
  },

  mapHole: function(oldHoleName, newHoleName){
    breadboard.holeMap[oldHoleName] = newHoleName;
    this.resetConnections(oldHoleName, newHoleName);
  },

  unmapHole: function(oldHoleName){
    var newHoleName = breadboard.holeMap[oldHoleName];
    breadboard.holeMap[oldHoleName] = undefined;
    this.resetConnections(newHoleName, oldHoleName);
  },

  clearHoleMap: function(){
    breadboard.holeMap = {};
  },

  addRandomResistor: function(name, location, options){
    console.log("WARNING: addRandomResistor is deprecated");
    var resistor = new Resistor4band(name);
    resistor.randomize((options | null));
    this.insert('resistor', location, resistor.getRealValue(), name, resistor.colors);
    return resistor;
  },

  getComponents: function() {
    return breadboard.components;
  },

  // this method will modify the breadboard as necessary to create additional temporary components
  // that correspond to the measurement-type's circuit changes (e.g. large resistor for a voltmeter),
  // and then simply call qucsator.qucsate, and return the resulting results object.
  // NB: This function used to return the final value required by the DMM. It no longer does so, as
  // it does not assume a DMM is doing the requesting, and instead returns the entire results object.
  query: function(type, connections, callback, context, callbackArgs){
    var tempComponents = [],
        ghost, ohmmeterBattery,
        voltmeterResistor,
        ammeterResistor,
        oscopeResistor,
        ciso,
        node;

    // add DMM components as necessary
    if (type === 'resistance') {
      connections = connections.split(',');
      ghost = breadboard.createGhostHole();
      ohmmeterBattery = this.component({
        UID: 'ohmmeterBattery',
        kind: 'battery',
        voltage: 1,
        connections: [connections[0], connections[1]]});
      // var currentProbe = this.component({
      //   UID: 'meter',
      //   kind: 'iprobe',
      //   connections: [connections[1], ghost]});
      tempComponents.push(ohmmeterBattery);
    } else if (type === 'voltage'){
      voltmeterResistor = this.component({
        UID: 'voltmeterResistor',
        kind: 'resistor',
        resistance: 1e12,
        connections: connections.split(',')});
      tempComponents.push(voltmeterResistor);
    } else if (type === 'current'){
      ammeterResistor = this.component({
        UID: 'ammeterResistor',
        kind: 'resistor',
        resistance: 1e-6,
        connections: connections.split(',')});
      tempComponents.push(ammeterResistor);
    } else if (type === 'oscope') {
      oscopeResistor = this.component({
        UID: 'oscopeResistor',
        kind: 'resistor',
        resistance: 1e12,
        connections: [connections, "gnd"]});
      tempComponents.push(oscopeResistor);
    }

    ciso = new CiSo();

    $.each(breadboard.components, function(i, component) {
      component.addCiSoComponent(ciso);
    });

    // if ohmmeter, set reference node
    if (type === 'resistance') {
      node = this.getHole(connections[1]).nodeName();
      ciso.setReferenceNode(node);
    }
    // destroy the temporary DMM components
    $.each(tempComponents, function(i, component){
      component.destroy();
    });

    callback.call(context, ciso, callbackArgs);
  },

  updateView: function() {
    $.each(breadboard.components, function(i, component) {
      if (component.getViewArguments && component.hasValidConnections() && component.kind !== "battery" && !component.hidden) {
        workbenchController.breadboardView.addComponent(component.getViewArguments());
      }
      if ((component.kind == "battery" || component.kind == "function generator") && !component.hidden) { // FIXME
        workbenchController.breadboardView.addBattery("left_negative21,left_positive21");
      }
    });
  },

  // returns an array of serialized components
  serialize: function() {
    var circuit = [];

    $.each(breadboard.components, function(i, component) {
      circuit.push(component.serialize());
    });

    return circuit;
  }

}

//// BreadBoard Instance & Interface /////////////////////////////////////////
breadboardController = new BreadboardController();

module.exports = breadboardController;
