!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.sparks=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var extend    = require('../helpers/util').extend,
    Component = require('./component');

Battery = function (props, breadBoard) {
  var range;

  Battery.parentConstructor.call(this, props, breadBoard);

  // if voltages are specified as an array, then if it has only value, set the
  // voltage to that value, otherwise set it to a random voltage between the first
  // and second values
  if (this.voltage && this.voltage.length) {
    if (this.voltage.length === 1) {
      this.voltage = this.voltage[0];
    } else {
      range = this.voltage[1] - this.voltage[0];
      this.voltage = this.voltage[0] + (Math.random() * range);
    }
  }
};

extend(Battery, Component, {
  addCiSoComponent: function (ciso) {
    var voltage = this.voltage || 0,
        nodes      = this.getNodes();

    ciso.addVoltageSource(this.UID, voltage, nodes[0], nodes[1]);
  }
});

module.exports = Battery;

},{"../helpers/util":22,"./component":4}],2:[function(require,module,exports){
//= require circuit/resistor
//= require circuit/variable-resistor
//= require circuit/component

/* FILE breadboard.js */

/*global sparks CiSo $ breadBoard window console*/

(function () {

    var util                  = require('../helpers/util'),
        Battery               = require('./battery'),
        Capacitor             = require('./capacitor'),
        FunctionGenerator     = require('./function-generator'),
        Inductor              = require('./inductor'),
        PowerLead             = require('./power-lead'),
        Resistor4band         = require('./resistor-4band'),
        Resistor              = require('./resistor'),
        VariableResistor      = require('./variable-resistor'),
        Component             = require('./component'),
        Wire                  = require('./wire'),
        workbenchController   = require('../controllers/workbench-controller');

    ////////////////////////////////////////////////////////////////////////////////
    //// GLOBAL DEFAULTS ///////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    var defs = {
        rows            : 31,
        powerRailHoles  : 25,
        debug           : true
      },

      Hole,
      GhostHole,
      Strip,
      Breadboard,
      breadBoard,
      interfaces;

      this.debug = function(){
      };

    ////////////////////////////////////////////////////////////////////////////////
    //// B R E A D - B O A R D - M O D E L /////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

      //// BREADBOARD Prototype Model //////////////////////////////////////////////
      this.breadBoard = {};

      Hole = function Hole( strip, name ){
        this.type ='hole';
        this.strip = strip;
        this.name = name;
        this.connections = [];
        return this;
      };

      Hole.prototype.nodeName = function() {
        return this.strip && this.strip.name;
      };

      Hole.prototype.getName = function() {
        return this.name;
      };

      GhostHole = function GhostHole(name) {
        this.name = !!name ? name : interfaces.getUID('node');
        return this;
      };

      GhostHole.prototype.nodeName = function() {
        return this.name;
      };

      GhostHole.prototype.getName = function() {
        return this.name;
      };

      Strip = function Strip( holes, name ){
        this.type ='strip';
        this.holes={};
        this.name = name;
        if (holes) {
          for (var i=0, l=holes; i < l; i++) {
            this.holes[''+i] = new Hole();
            this.holes[''+i].strip = this;
          }
        }
        return this;
      };

      Breadboard = function Breadboard(){
        var i, h, l, ll, a,
            side, sign,
            newStripL, newStripR,
            mapCode;

        this.type ='Breadboard';

        // Create power-rails
        this.powerRail = { // I was told these were called power-rails
          left:{
            positive: new Strip( null, "powerPosL"),
            negative: new Strip( null, "gnd")
          },
          right:{
            positive: new Strip( null, "powerPosR" ),
            negative: new Strip( null, "gnd" )
          }
        };

        for (i=0, l=defs.powerRailHoles; i < l; i++) {
          for (side in this.powerRail) {
            if (!this.powerRail.hasOwnProperty(side)) continue;
            for (sign in this.powerRail[side]) {
              if (!this.powerRail[side].hasOwnProperty(sign)) continue;
              h = side + '_' + sign + i;
              this.powerRail[side][sign][h] = this.holes[h] = new Hole(this.powerRail[side][sign], h);
            }
          }
        }

        // Create board
        for (i=0, l=defs.rows; i < l; i++) {
          newStripL = this.makeStrip("L" + i);
          newStripR = this.makeStrip("R" + i);
          for (a=0, ll=5; a < ll; a++ ) {
            mapCode = String.fromCharCode(a+97)+i;
            newStripL.holes[mapCode] = this.holes[ mapCode ] = new Hole( newStripL, mapCode );
            mapCode = String.fromCharCode(a+102)+i;
            newStripR.holes[mapCode] = this.holes[ mapCode ] = new Hole( newStripR, mapCode );
          }
        }
        return this;
      };

      Breadboard.prototype.strips=[];
      Breadboard.prototype.components={};
      Breadboard.prototype.holes={};
      Breadboard.prototype.holeMap={};  // map of holes where one replaces the other, e.g. {a1: 'newGhostHole'}
      Breadboard.prototype.faultyComponents=[];

      Breadboard.prototype.makeStrip = function (name) {
        var stripLen = this.strips.length;
        this.strips[ stripLen ] = new Strip(null, name);
        return this.strips[ stripLen ];
      };

      Breadboard.prototype.component = function (props) {
        if(typeof props=='string'){
          return this.components[props];
        } else {

          // FIXME refactor this repetitive code

          if (props.kind === "resistor"){
            return new Resistor(props, breadBoard);
          }
          if (props.kind === "variable resistor"){
            return new VariableResistor(props, breadBoard);
          }
          if (props.kind === 'inductor') {
            return new Inductor(props, breadBoard);
          }
          if (props.kind === 'capacitor') {
            return new Capacitor(props, breadBoard);
          }
          if (props.kind === 'battery') {
            return new Battery(props, breadBoard);
          }
          if (props.kind === 'function generator') {
            return new FunctionGenerator(props, breadBoard);
          }
          if (props.kind === 'wire') {
            return new Wire(props, breadBoard);
          }
          if (props.kind === 'powerLead') {
            return new PowerLead(props, breadBoard);
          }
          return new Component(props, breadBoard);
        }
      };

      Breadboard.prototype.clear = function () {
        var destroyed = 0,
            k;

        this.resOrderOfMagnitude = -1;
        for( k in this.components ){
          if (!this.components.hasOwnProperty(k)) continue;
          destroyed += !!this.component(k).destroy();
        }
        this.components = {};
        this.faultyComponents = [];
        return !!destroyed;
      };

      // can pass either a hole or a string
      Breadboard.prototype.getHole = function(hole) {
        if (!hole) return;

        if (hole.name){
          if (!!this.holeMap[hole.name]){
            return this.getHole(this.holeMap[hole.getName()]);
          }
          return hole;
        }

        // should be a string

        // replace with mapped name
        if (!!this.holeMap[hole]){
          hole = this.holeMap[hole];
        }

        // return hole if it is in breadboard
        if (!!this.holes[hole]){
          return this.holes[hole];
        }

        // otherwise, make a new ghosthole
        return new GhostHole(hole);

      };

      // Resets all connections, used when holeMap changes
      Breadboard.prototype.resetConnections = function(oldHoleName, newHoleName) {
        var i, j;

        for( i in this.components ){
          if (!this.components.hasOwnProperty(i)) continue;
          var comp = this.component(i);
          for (j in comp.connections){
            if (!comp.connections.hasOwnProperty(j)) continue;
            if (!!comp.connections[j] && comp.connections[j].getName() === oldHoleName) {
              comp.connections[j] = this.getHole(newHoleName);
            }
          }
        }
      };

      Breadboard.prototype.resOrderOfMagnitude = -1;

      // Adds a fault to an existing circuit. A fault may affect one or
      // more components. If fault.component is set, it will be applied to
      // that component. Otherwise, if fault.count or fault.max are set, it
      // will be applied to a number of random components.
      Breadboard.prototype.addFault = function(fault) {
        if (!!fault.component){
          this.addFaultToComponent(fault, this.components[fault.component]);
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
          var componentKeys = util.getKeys(this.components);
          for (var i = 0; i < count; i++){
            var randomComponent = null;
            while (randomComponent === null) {
              var rand = Math.floor(Math.random() * componentKeys.length);
              var component = this.components[componentKeys[rand]];
              if (!!component.applyFaults && (util.contains(this.faultyComponents, component) === -1)){
                randomComponent = component;
              }
            }
            this.addFaultToComponent(fault, randomComponent);
          }
        }
      };

      // adds a fault to a specific component. If fault.type is an array, a random
      // type will be picked
      Breadboard.prototype.addFaultToComponent = function(fault, component) {
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

        this.faultyComponents.push(component);
      };

      // returns an array of faults
      Breadboard.prototype.getFaults = function() {
        return this.faultyComponents;
      };

      // returns first fault
      Breadboard.prototype.getFault = function() {
        if (this.faultyComponents.length > 0){
          return this.faultyComponents[0];
        }
        return null;
      };

      //// BreadBoard Instance & Interface /////////////////////////////////////////
      breadBoard = new Breadboard();

      interfaces = {
        insertComponent: function(kind, properties){
          // copy props into a new obj, so we don't modify original
          var props = {};
          $.each(properties, function(key, property){
            props[key] = property;
          });

          props.kind = kind;

          // ensure no dupes, using either passed UID or type
          props.UID = interfaces.getUID(!!props.UID ? props.UID : props.kind);

          // if uid is source, and no conections are specified, assume we are connecting to rails
          if (props.UID === "source" && !props.connections){
            props.connections = "left_positive21,left_negative21";
          }

          var newComponent = breadBoard.component(props);

          // update view
          if (workbenchController.breadboardView) {
            if (newComponent.getViewArguments && newComponent.hasValidConnections() && newComponent.kind !== "battery")
              workbenchController.breadboardView.addComponent(newComponent.getViewArguments());
            if (newComponent.kind == "battery" || newComponent.kind == "function generator" ) // FIXME
              workbenchController.breadboardView.addBattery("left_negative21,left_positive21");
          }

          return newComponent.UID;
        },
        createCircuit: function(jsonCircuit) {
          var circuitHasReferenceFrequency = typeof jsonCircuit.referenceFrequency === 'number';

          $.each(jsonCircuit, function(i, spec) {
            // allow each component spec to override the circuit-wide reference frequency, if author desires.
            if (circuitHasReferenceFrequency && typeof spec.referenceFrequency === 'undefined') {
              spec.referenceFrequency = jsonCircuit.referenceFrequency;
            }
            interfaces.insertComponent(spec.type, spec);
          });

          interfaces.insertComponent("powerLead", {
            UID: "blackPowerLead",
            type: "powerLead",
            connections: "left_negative21"
          });
        },
        addFaults: function(jsonFaults){
          $.each(jsonFaults, function(i, fault){
            breadBoard.addFault(fault);
          });
        },
        getResOrderOfMagnitude: function(){
          return breadBoard.resOrderOfMagnitude;
        },
        setResOrderOfMagnitude: function(om){
          breadBoard.resOrderOfMagnitude = om;
        },
        insert: function(){
          console.log("ERROR: 'insert' is deprecated. Use 'insertComponent'");
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
              comp.connections[rightLead] = breadBoard.getHole(newName);
            } else {
              // move left lead one to the left
              newX = comp.coord[leftLead][0] + 1;
              newName = comp.connections[leftLead].name.replace(/\d*$/, newX);
              comp.connections[leftLead] = breadBoard.getHole(newName);
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

          if (!breadBoard.components[name]){
            return name;
          }

          var i = 0;
          while (!!breadBoard.components[""+name+i]){
            i++;
          }
          return ""+name+i;
        },
        remove: function(type, connections){
          var comp = interfaces.findComponent(type, connections);
          if (!!comp){
            comp.destroy();
          }
          workbenchController.breadboardView.removeComponent(uid);
        },
        removeComponent: function(comp){
          var uid = comp.UID;
          comp.destroy();
          if (uid) {
            workbenchController.breadboardView.removeComponent(uid);
          }
        },
        findComponent: function(type, connections){
          var i, component;

          if (!!type && !!connections && connections.split(",").length === 2){
            connections = connections.split(",");
            for (i in breadBoard.components){
              if (!breadBoard.components.hasOwnProperty(i)) continue;
              component = breadBoard.components[i];
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
          breadBoard.component(component).destroy();
        },
        clear: function() {
          breadBoard.clear();
          interfaces.clearHoleMap();
        },
        move: function(component, connections){
          breadBoard.component(component).move(connections.split(','));
        },
        getGhostHole: function(name){
          return new GhostHole(name);
        },
        mapHole: function(oldHoleName, newHoleName){
          breadBoard.holeMap[oldHoleName] = newHoleName;
          breadBoard.resetConnections(oldHoleName, newHoleName);
        },
        unmapHole: function(oldHoleName){
          var newHoleName = breadBoard.holeMap[oldHoleName];
          breadBoard.holeMap[oldHoleName] = undefined;
          breadBoard.resetConnections(newHoleName, oldHoleName);
        },
        clearHoleMap: function(){
          breadBoard.holeMap = {};
        },
        addRandomResistor: function(name, location, options){
          console.log("WARNING: addRandomResistor is deprecated");
          var resistor = new Resistor4band(name);
          resistor.randomize((options | null));
          interfaces.insert('resistor', location, resistor.getRealValue(), name, resistor.colors);
          return resistor;
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
            ghost = new GhostHole();
            ohmmeterBattery = breadBoard.component({
              UID: 'ohmmeterBattery',
              kind: 'battery',
              voltage: 1,
              connections: [connections[0], connections[1]]});
            // var currentProbe = breadBoard.component({
            //   UID: 'meter',
            //   kind: 'iprobe',
            //   connections: [connections[1], ghost]});
            tempComponents.push(ohmmeterBattery);
          } else if (type === 'voltage'){
            voltmeterResistor = breadBoard.component({
              UID: 'voltmeterResistor',
              kind: 'resistor',
              resistance: 1e12,
              connections: connections.split(',')});
            tempComponents.push(voltmeterResistor);
          } else if (type === 'current'){
            ammeterResistor = breadBoard.component({
              UID: 'ammeterResistor',
              kind: 'resistor',
              resistance: 1e-6,
              connections: connections.split(',')});
            tempComponents.push(ammeterResistor);
          } else if (type === 'oscope') {
            oscopeResistor = breadBoard.component({
              UID: 'oscopeResistor',
              kind: 'resistor',
              resistance: 1e12,
              connections: [connections, "gnd"]});
            tempComponents.push(oscopeResistor);
          }

          ciso = new CiSo();

          $.each(breadBoard.components, function(i, component) {
            component.addCiSoComponent(ciso);
          });

          // if ohmmeter, set reference node
          if (type === 'resistance') {
            node = breadBoard.getHole(connections[1]).nodeName();
            ciso.setReferenceNode(node);
          }
          // destroy the temporary DMM components
          $.each(tempComponents, function(i, component){
            component.destroy();
          });

          callback.call(context, ciso, callbackArgs);
        },
        updateView: function() {
          $.each(breadBoard.components, function(i, component) {
            if (component.getViewArguments && component.hasValidConnections() && component.kind !== "battery") {
              workbenchController.breadboardView.addComponent(component.getViewArguments());
            }
            if (component.kind == "battery" || component.kind == "function generator" ) // FIXME
              workbenchController.breadboardView.addBattery("left_negative21,left_positive21");
          });
        }
      };

      // The inward interface between Flash's ExternalInterface and JavaScript's BreadBoard prototype model instance
      this.breadModel = function () {
        var newArgs = [];
        for(var i=1,l=arguments.length;i< l;i++){
          newArgs[newArgs.length] = arguments[i];
        }
        var func = arguments[0];

        if (func === 'query' && !!arguments[2]) {
            var conns = arguments[2].split(',');

            if (conns[0] === 'null' || conns[1] === 'null') {
                return 0;
            }
            var v = interfaces.query.apply(window, newArgs);
            return v;
        }
        else {
          return interfaces[func].apply(window, newArgs);
        }
      };

      this.getBreadBoard = function() {
        return breadBoard;
      };

})();

},{"../controllers/workbench-controller":17,"../helpers/util":22,"./battery":1,"./capacitor":3,"./component":4,"./function-generator":5,"./inductor":6,"./power-lead":9,"./resistor":13,"./resistor-4band":12,"./variable-resistor":14,"./wire":15}],3:[function(require,module,exports){

var extend            = require('../helpers/util').extend,
    ReactiveComponent = require('./reactive-component');

Capacitor = function (props, breadBoard) {
  Capacitor.parentConstructor.call(this, props, breadBoard);
};

extend(Capacitor, ReactiveComponent, {

  getCapacitance: function () {
    return this.getComponentParameter('capacitance', this.capacitanceFromImpedance);
  },

  capacitanceFromImpedance: function (impedance, frequency) {
    return 1 / (impedance * 2 * Math.PI * frequency);
  },

  addCiSoComponent: function (ciso) {
    var capacitance = this.getCapacitance() || 0,
        nodes       = this.getNodes();
    ciso.addComponent(this.UID, "Capacitor", capacitance, nodes);
  },

  componentTypeName: "Capacitor",

  isEditable: true,

  editableProperty: {name: "capacitance", units: "F"},

  changeEditableValue: function(val) {
    this.capacitance = val;
  }
});

module.exports = Capacitor;

},{"../helpers/util":22,"./reactive-component":11}],4:[function(require,module,exports){

Component = function (props, breadBoard) {

  for (var i in props) {
    this[i]=props[i];
  }

  this.breadBoard = breadBoard;
  this.breadBoard.components[props.UID] = this;

  if (!this.label){
    this.label = !!this.UID.split("/")[1] ? this.UID.split("/")[1] : "";
  }

  if (typeof this.connections === "string") {
    this.connections = this.connections.replace(/ /g,'').split(",");
  }

  for (i in this.connections) {
    this.connections[i] = this.breadBoard.getHole(this.connections[i]);

    if (!!this.breadBoard.holes[this.connections[i]]) {
      this.breadBoard.holes[this.connections[i]].connections[this.breadBoard.holes[this.connections[i]].connections.length] = this;
    }
  }
  this._ensureFloat("resistance");
  this._ensureFloat("nominalResistance");
  this._ensureFloat("voltage");
  this._ensureFloat("capacitance");
  this._ensureFloat("inductance");
  this._ensureFloat("impedance");
  this.draggable = !!this.draggable;

  this.viewArguments = {
    type: this.type,
    UID: this.UID,
    connections: this.getLocation(),
    draggable: this.draggable
  };

  if (this.label) {
    this.viewArguments.label = this.label;
  }
};

Component.prototype = {
  setViewArguments: function (args) {
    for (var arg in args) {
      if (!args.hasOwnProperty(arg)) continue;
      this.viewArguments[arg] = args[arg];
    }
  },

  getViewArguments: function () {
    this.viewArguments.connections = this.getLocation(); // update location
    return this.viewArguments;
  },

  move: function (connections) {
    var i, j;
    for (i in this.connections) {
      for (j in this.connections[i].connections) {
        if (this.connections[i].connections[j] === this) {
          this.connections[i].connections = [];
        }
      }
      this.connections[i] = [];
    }
    this.connections = [];
    for (i in connections){
      this.connections[i] = this.breadBoard.holes[connections[i]];
      this.breadBoard.holes[connections[i]].connections[this.breadBoard.holes[connections[i]].connections.length] = this;
    }

    this.setViewArguments({connections: this.getLocation()});
  },

  destroy: function (){
    var i, j;
    for(i in this.connections){
      for(j in this.connections[i].connections ){
        if( this.connections[i].connections[j] === this ){
          this.connections[i].connections = [];
        }
      }
      this.connections[i] = [];
    }
    this.connections = [];
    delete this.breadBoard.components[this.UID];
  },

  _ensureFloat: function (val) {
    if (this[val] && typeof this[val] === "string") {
      this[val] = parseFloat(this[val], 10);
    }
  },

  getNodes: function () {
    return $.map(this.connections, function (connection) {
      return connection.nodeName();
    });
  },

  // converts connections to string, for flash arguments
  getLocation: function () {
    return this.connections[0].getName() + "," + this.connections[1].getName();
  },

  canInsertIntoNetlist: function () {
    return true;
  },

  /**
    hasValidConnections: check that this component has connections that are valid for generating a QUCS netlist.

    The only check performed right now is that there be 2 connections, but this validity check could be enhanced
    to check, for example, that the two connections map to different nodes, etc.
  */
  hasValidConnections: function () {
    return this.connections.length === 2 || (this.type === "powerLead" && this.connections.length === 1);
  },

  getRequestedImpedance: function (spec, steps) {
    var min, max, factor, step, choosableSteps, i, len;

    if (typeof spec === 'string' || typeof spec === 'number') {
      return spec;
    }

    if (spec[0] !== 'uniform') {
      throw new Error("Only uniformly-distributed random impedances/resistances are supported right now; received " + spec);
    }
    if (spec.length < 3) throw new Error("Random impedance/resistance spec does not specify an upper and lower bound");
    if (typeof spec[1] !== 'number' || typeof spec[2] !== 'number') throw new Error("Random impedance/resistance spec lower and upper bound were not both numeric");

    min = Math.min(spec[1], spec[2]);
    max = Math.max(spec[1], spec[2]);

    // if steps array exists, it specifies allowable values, up to the order of magnitude
    if (steps) {
      // copy 'steps' array before sorting it so we don't modify the passed-in array
      steps = steps.slice().sort();

      factor = Math.pow(10, Math.orderOfMagnitude(min) - Math.orderOfMagnitude(steps[0]));
      choosableSteps = [];
      i = 0;
      len = steps.length;
      do {
        step = steps[i++] * factor;
        if (min <= step && step <= max) choosableSteps.push(step);

        if (i >= len) {
          factor *= 10;
          i = 0;
        }
      } while (step < max);

      if (choosableSteps.length > 0) {
        return choosableSteps[ Math.floor(Math.random() * choosableSteps.length) ];
      }
    }

    // if no steps were specified, or none were available between the requested min and max
    return min + Math.random() * (max - min);
  },

  addThisToFaults: function() {
    var breadBoard = getBreadBoard();
    if (!~breadBoard.faultyComponents.indexOf(this)) { breadBoard.faultyComponents.push(this); }
  },

  // used by the component edit view
  componentTypeName: "Component",

  // used by the component edit view
  isEditable: false,

  // used by the component edit view. Right now we assume any editable component
  // has only one single editable property. If we change this assumption, we may
  // want to set an array of properties
  //
  // Returns an array of the possible values this property can take
  getEditablePropertyValues: function() { return [0]; },
  // The name and base units of the editable property
  editableProperty: {name: "", units: ""},

  // used by the component edit view. Right now we assume any editable component
  // has only one single editable property. However, even if we have components with
  // multiple editable properties, we can keep this API and pass in an array
  changeEditableValue: function(val) { }

};

module.exports = Component;


},{}],5:[function(require,module,exports){

var extend              = require('../helpers/util').extend,
    Component           = require('./component'),
    workbenchController;

FunctionGenerator = function (props, breadBoard) {
  workbenchController = require('../controllers/workbench-controller');     // grrrrr....

  FunctionGenerator.parentConstructor.call(this, props, breadBoard);

  this.amplitudeScaleFactor = 1;

  // NOTE on validation of initialFrequency.
  //
  // If the initial frequency is not in the frequencies we request QUCS to simulate, we only find out after we call
  // QUCS and get the simulation result back. It sounds like we're thereby missing an opportunity to validate
  // initialFrequency "up front" at object-creation time, but, really, we're not. From the perspective of an author
  // who creates a JSON circuit spec with such an invalid initialFrequency, the validation failure only occurs when
  // the student (or author) actually runs the activity, whether the validation is done when the FunctionGenerator
  // is created, or whether it is done when QUCS returns. Doing validation at object creation time (below) would
  // require pre-calculating the frequency list which QUCS generates from a sweep spec.
  this.frequency = props.initialFrequency;

  // get an initial frequency from the frequency-range specification, if one exists
  if ( ('undefined' === typeof this.frequency || this.frequency === null) && props.frequencies ) {
    if ('number' === typeof props.frequencies[0]) {
      this.frequency = props.frequencies[0];
    }
    else if (props.frequencies[0] === 'linear' || props.frequencies[0] === 'logarithmic') {
      this.frequency = props.frequencies[1];
    }
  }

  // store (and generate, if nec.) the set of possible frequencies, so that the view can slide through these
  if (props.frequencies) {
    if ('number' === typeof props.frequencies[0]) {
      this.possibleFrequencies = props.frequencies;
    }
    else if (props.frequencies[0] === 'linear' || props.frequencies[0] === 'logarithmic') {
      this.possibleFrequencies = this._calcPossibleFrequencies(props);
    }
  }

  // set a base frequency, so that we don't have to change NetList representation after changing frequency
  this.baseFrequency = this.frequency;

  if ('undefined' === typeof this.frequency || this.frequency === null) {
    throw new Error("FunctionGenerator: initialFrequency is undefined and an initial frequency could not be inferred from frequency range specification.");
  }

  var amplitude = props.amplitude;
  if ('number' === typeof amplitude){
    this.amplitude = amplitude;
  } else if (amplitude.length && amplitude.length >= 2) {
    this.minAmplitude = amplitude[0];
    this.maxAmplitude = amplitude[1];
    if (amplitude[2]) {
      this.amplitude = amplitude[2];
    } else {
      this.amplitude = (this.minAmplitude + this.maxAmplitude) / 2;
    }
  }
};

extend(FunctionGenerator, Component, {

  // for now, no validation on frequency. So we might set something QUCS isn't expecting from the given sim type
  setFrequency: function(frequency) {
    this.frequency = frequency;
    if (workbenchController.workbench.meter) {
      workbenchController.workbench.meter.update();
    }
  },

  // instead of modifying the base amplitude, which would cause us to re-ask QUCS for new values,
  // we simply modify a scale factor, which is read by all meters. This works so long as we have
  // linear circuits -- we'll need to revisit this for nonlinear circuits.
  setAmplitude: function(newAmplitude) {
    this.amplitudeScaleFactor = newAmplitude / this.amplitude;
    if (workbenchController.workbench.meter) {
      workbenchController.workbench.meter.update();
    }
  },

  getFrequency: function() {
    return this.frequency;
  },

  getAmplitude: function() {
    return this.amplitude * this.amplitudeScaleFactor;
  },

  getPossibleFrequencies: function() {
    return this.possibleFrequencies;
  },

  addCiSoComponent: function (ciso) {
    var amplitude   = this.amplitude || 0,
        nodes       = this.getNodes();

    ciso.addVoltageSource(this.UID,amplitude,nodes[0],nodes[1],this.frequency);
  },

  defaultFrequencySteps: 100,

  _calcPossibleFrequencies: function(props) {
    var startF   = props.frequencies[1],
        endF     = props.frequencies[2],
        steps    = props.frequencies[3],
        type     = props.frequencies[0],
        diff     = endF - startF,
        multiple = endF / startF,
        stepSize,
        i;

    var frequencies = [];
    if (type === 'linear') {
      stepSize = diff / (steps - 1);
      for (i = 0; i < steps; i++){
        frequencies.push(startF + (stepSize * i));
      }
    } else if (type === 'logarithmic') {
      for (i = 0; i < steps; i++){
        frequencies.push(startF * (Math.pow(multiple, ((i/(steps-1))))));
      }
    }
    return frequencies;
  },

  getViewArguments: null

});

module.exports = FunctionGenerator;

},{"../controllers/workbench-controller":17,"../helpers/util":22,"./component":4}],6:[function(require,module,exports){

var extend            = require('../helpers/util').extend,
    ReactiveComponent = require('./reactive-component');

Inductor = function (props, breadBoard) {
  Inductor.parentConstructor.call(this, props, breadBoard);
};

extend(Inductor, ReactiveComponent, {

  getInductance: function () {
    return this.getComponentParameter('inductance', this.inductanceFromImpedance);
  },

  inductanceFromImpedance: function (impedance, frequency) {
    return impedance / (2 * Math.PI * frequency);
  },

  addCiSoComponent: function (ciso) {
    var inductance = this.getInductance() || 0,
        nodes       = this.getNodes();
    ciso.addComponent(this.UID, "Inductor", inductance, nodes);
  },

  componentTypeName: "Inductor",

  isEditable: true,

  editableProperty: {name: "inductance", units: "H"},

  changeEditableValue: function(val) {
    this.inductance = val;
  }
});

module.exports = Inductor;

},{"../helpers/util":22,"./reactive-component":11}],7:[function(require,module,exports){

var workbenchController   = require('../controllers/workbench-controller');

/*
 * Digital Multimeter
 * Base for the Centech DMM
 */
MultimeterBase = function () {
};

MultimeterBase.prototype = {

    modes : { ohmmeter : 0, voltmeter : 1, ammeter : 2 },

    init: function () {
        this.mode = this.modes.ohmmeter;

        this.absoluteValue = 0;   //current meter value

        this.displayText = '       ';

        this.redProbeConnection = null;
        this.blackProbeConnection = null;
        this.redPlugConnection = null;
        this.blackPlugConnecton = null;
        this.dialPosition = 'acv_750';
        this.powerOn = false;
        this.disabledPositions = [];
    },

    // @probe Either "red" or "black"
    // @location hole name (e.g. 'a1') or null
    setProbeLocation: function (probe, location) {
      if (probe === "probe_red") {
        this.redProbeConnection = location;
      } else if (probe === "probe_black") {
        this.blackProbeConnection = location;
      }
      this.update();
    },

    moveProbe: function(oldLoc, newLoc) {
      if (this.redProbeConnection === oldLoc) {
        this.redProbeConnection = newLoc;
      }
      if (this.blackProbeConnection === oldLoc) {
        this.blackProbeConnection = newLoc;
      }
      this.update();
    },

    update : function () {
    },

    updateDisplay : function () {
        var text = '',
            vm, imc, im;

        if (!this.powerOn) {
            this.displayText = '       ';
            return;
        }

        if (this.allConnected()) {
            if (this.dialPosition === 'dcv_20') {
                if (this.absoluteValue < 19.995) {
                    text = (Math.round(this.absoluteValue * 100) * 0.01).toString();
                    text = this.toDisplayString(text, 2);
                }
                else {
                    text = ' 1 .   ';
                }
                this.currentUnits = "V";

            } else if (this.dialPosition === 'dcv_200') {
                if (this.absoluteValue < 199.95) {
                    text = (Math.round(this.absoluteValue * 10) * 0.1).toString();
                    text = this.toDisplayString(text, 1);
                }
                else {
                    text = ' 1 .   ';
                }
                this.currentUnits = "V";

            } else if (this.dialPosition === 'dcv_1000') {
                 if (this.absoluteValue < 999.95) {
                    text = Math.round(this.absoluteValue).toString();
                    text = this.toDisplayString(text, 0);
                    text = "h" + text.substring(1);
                }
                else {
                    text = 'h1 .   ';
                }
                this.currentUnits = "V";

            } else if (this.dialPosition === 'dcv_2000m') {
                vm = this.absoluteValue * 1000;
                if (vm < 1999.5) {
                    text = Math.round(vm).toString();
                    text = this.toDisplayString(text, 0);
                }
                else {
                    text = ' 1 .   ';
                }
                this.currentUnits = "mV";

            } else if (this.dialPosition === 'dcv_200m') {
                vm = this.absoluteValue * 1000;
                if (vm < 195){
                  text = (Math.round(vm * 100) * 0.01).toString();
                  text = this.toDisplayString(text, 1);
                }
                else {
                    text = ' 1 .   ';
                }
                this.currentUnits = "mV";

            } else if (this.dialPosition === 'acv_200') {
                if (this.absoluteValue < 199.95) {
                    text = (Math.round(this.absoluteValue * 10) * 0.1).toString();
                    text = this.toDisplayString(text, 1);
                }
                else {
                    text = ' 1 .   ';
                }
                this.currentUnits = "V";

            } else if (this.dialPosition === 'acv_750') {
                if (this.absoluteValue < 699.5) {
                    text = (Math.round(this.absoluteValue)).toString();
                    text = this.toDisplayString(text, 0);
                    text = "h"+text.substring(1);
                }
                else {
                    text = 'h1 .   ';
                }
                this.currentUnits = "V";

            } else if (this.dialPosition === 'r_200') {
                if (this.absoluteValue < 199.95) {
                    text = (Math.round(this.absoluteValue * 10) * 0.1).toString();
                    text = this.toDisplayString(text, 1);
                }
                else {
                    text = ' 1   . ';
                }
                this.currentUnits = "Ohms";
            } else if (this.dialPosition === 'r_2000') {
                if (this.absoluteValue < 1999.5) {
                    text = Math.round(this.absoluteValue).toString();
                    text = this.toDisplayString(text, 0);
                }
                else {
                    text = ' 1     ';
                }
                this.currentUnits = "Ohms";
            }
            else if (this.dialPosition === 'r_20k') {
                if (this.absoluteValue < 19995) {
                    text = (Math.round(this.absoluteValue * 0.1) * 0.01).toString();
                    text = this.toDisplayString(text, 2);
                }
                else {
                    text = ' 1 .   ';
                }
                this.currentUnits = "kOhms";
            }
            else if (this.dialPosition === 'r_200k') {
                if (this.absoluteValue < 199950) {
                    text = (Math.round(this.absoluteValue * 0.01) * 0.1).toString();
                    text = this.toDisplayString(text, 1);
                }
                else {
                    text = ' 1   . ';
                }
                this.currentUnits = "kOhms";
            }
            else if (this.dialPosition === 'r_2000k') {
                if (this.absoluteValue < 1999500) {
                    text = Math.round(this.absoluteValue * 0.001).toString();
                    text = this.toDisplayString(text, 0);
                }
                else {
                    text = ' 1     ';
                }
                this.currentUnits = "kOhms";
            }
            else if (this.dialPosition === 'dca_200mc') {
              imc = this.absoluteValue * 1000000;
              if (imc < 195){
                text = (Math.round(imc * 100) * 0.01).toString();
                text = this.toDisplayString(text, 1);
              }
              else {
                  text = ' 1     ';
              }
              this.currentUnits = "μA";
            }
            else if (this.dialPosition === 'dca_2000mc') {
              imc = this.absoluteValue * 1000000;
              if (imc < 1950){
                text = (Math.round(imc * 10) * 0.1).toString();
                text = this.toDisplayString(text, 0);
              }
              else {
                  text = ' 1     ';
              }
              this.currentUnits = "μA";
            }
            else if (this.dialPosition === 'dca_20m') {
              im = this.absoluteValue * 1000;
              if (im < 19.5){
                text = (Math.round(im * 100) * 0.01).toString();
                text = this.toDisplayString(text, 2);
              }
              else {
                  text = ' 1     ';
              }
              this.currentUnits = "mA";
            }
            else if (this.dialPosition === 'dca_200m') {
              im = this.absoluteValue * 1000;
              if (im < 195){
                text = (Math.round(im * 10) * 0.1).toString();
                text = this.toDisplayString(text, 1);
              }
              else {
                  text = ' 1     ';
              }
              this.currentUnits = "mA";
            }
            else if (this.dialPosition === 'dcv_200m' || this.dialPosition === 'dcv_200' ||
                    this.dialPosition === 'acv_200' || this.dialPosition === 'p_9v' ||
                    this.dialPosition === 'dca_200mc' || this.dialPosition === 'dca_200m') {
                text = '  0 0.0';
            }
            else if (this.dialPosition === 'dcv_2000m' || this.dialPosition === 'dca_2000mc' ||
                    this.dialPosition === 'hfe') {
                text = '  0 0 0';
            }
            else if (this.dialPosition === 'dcv_20' || this.dialPosition === 'dca_20m' ||
                    this.dialPosition === 'c_10a') {
                text = '  0.0 0';
            }
            else if (this.dialPosition === 'dcv_1000' || this.dialPosition === 'acv_750') {
                text = 'h 0 0 0';
            }
            else if (this.dialPosition === 'diode') {
              text = ' 1     ';
            }
            else {
                text = '       ';
            }
        }
        else {    // if not connected
            if (this.dialPosition === 'dcv_20') {
                text = '  0.0 0';
            }
            else if (this.dialPosition === 'r_200') {
                text = ' 1   . ';
            }
            else if (this.dialPosition === 'r_2000' || this.dialPosition === 'diode') {
                text = ' 1     ';
            }
            else if (this.dialPosition === 'r_20k') {
                text = ' 1 .   ';
            }
            else if (this.dialPosition === 'r_200k') {
                text = ' 1   . ';
            }
            else if (this.dialPosition === 'r_2000k') {
                text = ' 1     ';
            }
            else if (this.dialPosition === 'dcv_200m' || this.dialPosition === 'dcv_200' ||
                    this.dialPosition === 'acv_200' || this.dialPosition === 'p_9v' ||
                    this.dialPosition === 'dca_200mc' || this.dialPosition === 'dca_200m') {
                text = '  0 0.0';
            }
            else if (this.dialPosition === 'dcv_2000m' || this.dialPosition === 'dca_2000mc' ||
                    this.dialPosition === 'hfe') {
                text = '  0 0 0';
            }
            else if (this.dialPosition === 'dcv_20' || this.dialPosition === 'dca_20m' ||
                    this.dialPosition === 'c_10a') {
                text = '  0.0 0';
            }
            else if (this.dialPosition === 'dcv_1000' || this.dialPosition === 'acv_750') {
                text = 'h 0 0 0';
            }
            else {
                text = '       ';
            }
        }
        text = this.disable_multimeter_position(text);
        if (text !== this.displayText) {
          if (workbenchController.breadboardView) {
            workbenchController.breadboardView.setDMMText(text);
          }
          this.displayText = text;
          this.currentValue = parseFloat(text.replace(/[^\d\.]/g, ""));
        }
    },


set_disable_multimeter_position: function (disabled) {
  this.disabledPositions = disabled.split(',');
  for(var i=0;i<this.disabledPositions.length;i++){
  }
},


    disable_multimeter_position : function (displayText) {
      var i;
      // how do I pass a variable from the "series" file into here?
      // something like: sparks.jsonSection.disable_multimeter_position  ??

      // right now this is hard wired to disable R dial positions
      switch (this.dialPosition)
      {
  case 'dcv_20':
  case 'dcv_200':
  case 'dcv_1000':
  case 'dcv_2000m':
  case 'dcv_200m':
    for(i=0;i<this.disabledPositions.length;i++){
      if(this.disabledPositions[i] == 'dcv'){
        displayText = '-------';
        break;
      }
    }
    break;
  case 'r_200':
  case 'r_2000':
  case 'r_20k':
  case 'r_200k':
  case 'r_2000k':
    for(i=0;i<this.disabledPositions.length;i++){
      if(this.disabledPositions[i] == 'r'){
        displayText = '-------';
        break;
      }
    }
    break;
  case 'dca_200mc':
  case 'dca_2000mc':
  case 'dca_20m':
  case 'dca_200m':
    for(i=0;i<this.disabledPositions.length;i++){
      if(this.disabledPositions[i] == 'dca'){
        displayText = '-------';
        break;
      }
    }
    break;
  case 'acv_750':
  case 'acv_200':
    for(i=0;i<this.disabledPositions.length;i++){
      if(this.disabledPositions[i] == 'acv'){
        displayText = '-------';
        break;
      }
    }
    break;
  case 'diode':
  case 'hfe':
  case 'c_10a':
  case 'p_9v':
  default:
      }
      return displayText;
    },

    toDisplayString : function (s, dec) {
        //console.log('s1=' + s + ' dec=' + dec);
        var i;
        var sign = s.charAt(0) === '-' ? s.charAt(0) : ' ';
        s = s.replace('-', '');

        //console.log('s2=' + s);
        var pointLoc = s.indexOf('.');
        var decLen = pointLoc == -1 ? 0 : s.substring(pointLoc+1).length;
        if (decLen === 0) {
            s = s.concat('.');
        }
        //console.log('s3=' + s);
        if (dec < decLen) {
            s = s.substring(0, pointLoc + dec + 1);
        }
        else {
            for (i = 0; i < dec - decLen; ++i) {
                s = s.concat('0');
            }
        }
        //console.log('s4=' + s);
        s = s.replace('.', '');
        //console.log('s5=' + s);
        var len = s.length;
        if (len < 4) {
            for (i = 0; i < 3 - len; ++i) {
                s = '0' + s;
            }
            s = ' ' + s;
        }
        //console.log('s6=' + s);

        var dot1;
        var dot2;

        switch (dec) {
        case 0:
            dot1 = ' ';
            dot2 = ' ';
            break;
        case 1:
            dot1 = ' ';
            dot2 = '.';
            break;
        case 2:
            dot1 = '.';
            dot2 = ' ';
            break;
        default:
            console.log('ERROR: invalid dec ' + dec);
        }

        s = sign + s.substring(0, 2) + dot1 + s.charAt(2) + dot2 + s.charAt(3);
        //console.log('s7=' + s);
        return s;

    },

    // Pad 0's to the number text
    // sig: number of significant digits
    // dec: number of digits after decimal points
    formatDecimalString : function (s, dec) {
        //console.log('s=' + s + ' dec=' + dec);
        var pointLoc = s.indexOf('.');
        //console.log('pointLoc=' + pointLoc);
        var decLen = pointLoc == -1 ? 0 : s.substring(pointLoc+1).length;
        //console.log('decLen=' + decLen);
        if (decLen === 0) {
            s = s.concat('.');
        }
        if (dec < decLen) {
            s = s.substring(0, pointLoc + dec + 1);
        }
        else {
            for (var i = 0; i < dec - decLen; ++i) {
                s = s.concat('0');
            }
        }
        //console.log('formatDecimalString: formatted=' + s);
        return s;
    },

    getDisplayText : function () {
        return this.displayText;
    },

    /*
     * Return value to be shown under optimal setting.
     * This value is to be compared with the student answer for grading.
     *
     * Take three significant digits, four if the first digit is 1.
     */
    makeDisplayText : function (value) {
        var text;
        if (value < 199.95) {
            text = (Math.round(value * 10) * 0.1).toString();
            text = this.formatDecimalString(text, 1);
        }
        else if (value < 1999.5) {
            text = Math.round(value).toString();
            text = this.formatDecimalString(text, 0);
        }
        else if (value < 19995) {
            text = (Math.round(value * 0.1) * 10).toString();
        }
        else if (value < 199950) {
            text = (Math.round(value * 0.01) * 100).toString();
        }
        else if (value < 1999500) {
            text = (Math.round(value * 0.001) * 1000).toString();
        }
        else {
            text = 'NaN';
        }
        return parseFloat(text);
    },

    allConnected : function () {
        return this.redProbeConnection !== null &&
            this.blackProbeConnection !== null &&
            this.redProbeConnection !== this.blackProbeConnection &&
            (this.redPlugConnection === 'voma_port' &&
             this.blackPlugConnection === 'common_port' ||
             this.redPlugConnection === 'common_port' &&
             this.blackPlugConnection === 'voma_port') &&
            this.powerOn;
    }
};

module.exports = MultimeterBase;

},{"../controllers/workbench-controller":17}],8:[function(require,module,exports){

var LogEvent        = require('../models/log'),
    util            = require('../helpers/util'),
    logController   = require('../controllers/log-controller'),
    extend          = require('../helpers/util').extend,
    MultimeterBase  = require('./multimeter-base');

/*
 * Digital Multimeter for breadboard activities
 *
 */
Multimeter = function () {
  Multimeter.uber.init.apply(this);
  this.reset();
};

extend(Multimeter, MultimeterBase, {

  reset: function() {
    this.dialPosition = 'dcv_20';
    this.powerOn = true;
    this.redProbeConnection = null;
    this.blackProbeConnection = null;
    this.displayText = "";
    this.update();
  },

  currentMeasurement: null,

  update: function () {
    if (this.redProbeConnection && this.blackProbeConnection) {
      if (this.dialPosition.indexOf('dcv_') > -1){
        this.currentMeasurement = "voltage";
      } else if (this.dialPosition.indexOf('dca_') > -1){
        this.currentMeasurement = "current";
      } else if (this.dialPosition.indexOf('r_') > -1){
        this.currentMeasurement = "resistance";
      } else if (this.dialPosition.indexOf('acv_') > -1){
        this.currentMeasurement = "ac_voltage";
      } else {
        this.currentMeasurement = null;
      }

      if (!!this.currentMeasurement){
        breadModel('query', this.currentMeasurement, this.redProbeConnection + ',' + this.blackProbeConnection, this.updateWithData, this);
      }
    } else {
      this.updateWithData();
    }
  },

  // this is called after update() is called and ciso returns
  updateWithData: function (ciso) {
    var measurement = this.currentMeasurement,
        source, b, p1, p2, v1, v2, current, drop,
        result;

    if (ciso) {
      source = ciso.voltageSources[0],
      b  = getBreadBoard();
      p1 = b.getHole(this.redProbeConnection).nodeName();
      p2 = b.getHole(this.blackProbeConnection).nodeName();
      if (measurement === "resistance") {
        if (p1 === p2) {
          result = 0;
        } else {
          current = ciso.getCurrent('ohmmeterBattery');
          result = 1/current.magnitude;
        }
      } else if (measurement === "voltage" || measurement === "ac_voltage" || measurement === "current") {
          v1 = ciso.getVoltageAt(p1);   // complex
          v2 = ciso.getVoltageAt(p2);

        // exit quickly if ciso was not able to solve circuit
        if (!v1 || !v2) {
          this.absoluteValue = 0;
          this.updateDisplay();
          return;
        }

        drop = v1.subtract(v2).magnitude;

        if (measurement === "current") {
          result = drop / 1e-6;
        } else {
          result = drop;
        }
      }

      if (result){
        // if in wrong voltage mode for AC/DC voltage, show zero
        source = getBreadBoard().components.source;
        if (!!source &&
           ((measurement === 'voltage' && source.frequency) ||
            (measurement === 'ac_voltage' && source.frequency === 0))) {
          result = 0;
        } else if (measurement === "ac_voltage" ||
                    (measurement === 'current' && source && source.frequency)){
          // the following applies to both RMS voltage and RMS current
          // first, if we are dealing with a function generator, scale by the appropriate scale factor
          if (!!source.amplitudeScaleFactor || source.amplitudeScaleFactor === 0){
            result = result * source.amplitudeScaleFactor;
          }
          result = result / Math.sqrt(2);         // RMS voltage or RMS current
        }
        result = Math.round(result*Math.pow(10,8))/Math.pow(10,8);

        this.absoluteValue = Math.abs(result);

        if (measurement === "current" && this.absoluteValue > 0.44){
          this.blowFuse();
        }
      } else {
        this.absoluteValue = 0;
      }
    } else {
      this.absoluteValue = 0;
    }

    this.updateDisplay();

    if (this.redProbeConnection && this.blackProbeConnection) {
      logController.addEvent(LogEvent.DMM_MEASUREMENT, {
        "measurement": measurement,
        "dial_position": this.dialPosition,
        "red_probe": this.redProbeConnection,
        "black_probe": this.blackProbeConnection,
        "result": this.displayText});
    }
  },

  blowFuse: function() {
    apMessageBox.error({
      title: "POW!",
      message: "<b>You just blew the fuse in your multimeter!</b><br><br> Remember not to pass too much current through it."+
      " We've replaced your fuse for you, but you lost some time.",
      errorImage: "lib/error-32x32.png",
      width: 400,
      height: 300
    });
    logController.addEvent(LogEvent.BLEW_FUSE);
  },

  allConnected: function () {
      return this.redProbeConnection !== null &&
          this.blackProbeConnection !== null &&
          this.powerOn;
  },

  _getResultsIndex: function (results) {
    var i = 0,
        source = getBreadBoard().components.source;
    if (source && source.setFrequency && results.acfrequency){
      i = util.getClosestIndex(results.acfrequency, source.frequency, true);
    }
    return i;
  }
});

module.exports = Multimeter;

},{"../controllers/log-controller":16,"../helpers/util":22,"../models/log":27,"./multimeter-base":7}],9:[function(require,module,exports){
var extend    = require('../helpers/util').extend,
    Component = require('./component');

PowerLead = function (props, breadBoard) {
  PowerLead.parentConstructor.call(this, props, breadBoard);
};

extend(PowerLead, Component, {

  getColor: function () {
    var location = this.getLocation();
    if (location.indexOf("positive") > -1) {
      return "redPowerWire";
    } else {
      return "blackPowerWire";
    }
  },

  getLocation: function () {
    return this.connections[0].getName() + ",a1";       // Flash coding issue means we need to give this a second argument...
  },

  addCiSoComponent: function () { },

  getViewArguments: null
});

module.exports = PowerLead;

},{"../helpers/util":22,"./component":4}],10:[function(require,module,exports){

// Allowable resistance values

r_values = {};

// For 1% tolerance (5-band)
r_values.r_values5band1pct = [
    1.00, 1.02, 1.05, 1.07, 1.10, 1.13, 1.15, 1.18, 1.21, 1.24, 1.27,
    1.30, 1.33, 1.37, 1.40, 1.43, 1.47, 1.50, 1.54, 1.58, 1.62, 1.65, 1.69,
    1.74, 1.78, 1.82, 1.87, 1.91, 1.96,
    2.00, 2.05, 2.10, 2.15, 2.21, 2.26, 2.32, 2.37, 2.43, 2.49, 2.55, 2.61,
    2.67, 2.74, 2.80, 2.87, 2.94,
    3.01, 3.09, 3.16, 3.24, 3.32, 3.40, 3.48, 3.57, 3.65, 3.74, 3.83, 3.92,
    4.02, 4.12, 4.22, 4.32, 4.42, 4.53, 4.64, 4.75, 4.87, 4.99,
    5.11, 5.23, 5.36, 5.49, 5.62, 5.76, 5.90, 6.04, 6.19, 6.34, 6.49, 6.65,
    6.81, 6.98, 7.15, 7.32, 7.50, 7.68, 7.87, 8.06, 8.25, 8.45, 8.66, 8.87,
    9.09, 9.31, 9.53, 9.76, 10.0, 10.2, 10.5, 10.7, 11.0, 11.3, 11.5, 11.8,
    12.1, 12.4, 12.7, 13.0, 13.3, 13.7, 14.0, 14.3, 14.7,
    15.0, 15.4, 15.8, 16.2, 16.5, 16.9, 17.4, 17.8, 18.2, 18.7, 19.1, 19.6,
    20.0, 20.5, 21.0, 21.5, 22.1, 22.6, 23.2, 23.7, 24.3, 24.9, 25.5, 26.1,
    26.7, 27.4, 28.0, 28.7, 29.4, 30.1, 30.9, 31.6, 32.4, 33.2, 34.0, 34.8,
    35.7, 36.5, 37.4, 38.3, 39.2, 40.2, 41.2, 42.2, 43.2, 44.2, 45.3, 46.4,
    47.5, 48.7, 49.9, 51.1, 52.3, 53.6, 54.9, 56.2, 57.6, 59.0,
    60.4, 61.9, 63.4, 64.9, 66.5, 68.1, 69.8, 71.5, 73.2, 75.0, 76.8, 78.7,
    80.6, 82.5, 84.5, 86.6, 88.7, 90.9, 93.1, 95.3, 97.6,
    100, 102, 105, 107, 110, 113, 115, 118, 121, 124,
    127, 130, 133, 137, 140, 143, 147, 150, 154, 158, 162, 165, 169,
    174, 178, 182, 187, 191, 196,
    200, 205, 210, 215, 221, 226, 232, 237, 243, 249, 255, 261, 267, 274,
    280, 287, 294, 301, 309, 316, 324, 332, 340, 348, 357, 365, 374, 383,
    392, 402, 412, 422, 432, 442, 453, 464, 475, 487, 499,
    511, 523, 536, 549, 562,
    576, 590, 604, 619, 634, 649, 665, 681, 698, 715, 732, 750, 768, 787,
    806, 825, 845, 866, 887, 909, 931, 953, 976,
    1000, 1020, 1050, 1070, 1100, 1130, 1150, 1180, 1210, 1240, 1270,
    1300, 1330, 1370, 1400, 1430, 1470, 1500, 1540, 1580, 1620, 1650, 1690,
    1740, 1780, 1820, 1870, 1910, 1960, 2000, 2050, 2100, 2150, 2210, 2260,
    2320, 2370, 2430, 2490, 2550, 2610, 2670, 2740, 2800, 2870, 2940,
    3010, 3090, 3160, 3240, 3320, 3400, 3480, 3570, 3650, 3740, 3830, 3920,
    4020, 4120, 4220, 4320, 4420, 4530, 4640, 4750, 4870, 4990,
    5110, 5230, 5360, 5490, 5620, 5760, 5900,
    6040, 6190, 6340, 6490, 6650, 6810, 6980, 7150, 7320, 7500, 7680, 7870,
    8060, 8250, 8450, 8660, 8870, 9090, 9310, 9530, 9760,
    10000, 10200, 10500, 10700, 11000, 11300, 11500, 11800, 12100, 12400,
    12700, 13000, 13300, 13700, 14000, 14300, 14700, 15000, 15400, 15800,
    16200, 16500, 16900, 17400, 17800, 18200, 18700, 19100, 19600,
    20000, 20500, 21000, 21500, 22100, 22600, 23200, 23700, 24300, 24900,
    25500, 26100, 26700, 27400, 28000, 28700, 29400, 30100, 30900, 31600,
    32400, 33200, 34000, 34800, 35700, 36500, 37400, 38300, 39200,
    40200, 41200, 42200, 43200, 44200, 45300, 46400, 47500, 48700, 49900,
    51100, 52300, 53600, 54900, 56200, 57600, 59000, 60400, 61900, 63400,
    64900, 66500, 68100, 69800, 71500, 73200, 75000, 76800, 78700,
    80600, 82500, 84500, 86600, 88700, 90900, 93100, 95300, 97600,
    100e3, 102e3, 105e3, 107e3, 110e3, 113e3, 115e3, 118e3, 121e3, 124e3,
    127e3, 130e3, 133e3, 137e3, 140e3, 143e3, 147e3, 150e3, 154e3, 158e3,
    162e3, 165e3, 169e3, 174e3, 178e3, 182e3, 187e3, 191e3, 196e3,
    200e3, 205e3, 210e3, 215e3, 221e3, 226e3, 232e3, 237e3, 243e3, 249e3,
    255e3, 261e3, 267e3, 274e3, 280e3, 287e3, 294e3,
    301e3, 309e3, 316e3, 324e3, 332e3, 340e3, 348e3, 357e3, 365e3, 374e3,
    383e3, 392e3,
    402e3, 412e3, 422e3, 432e3, 442e3, 453e3, 464e3, 475e3, 487e3, 499e3,
    511e3, 523e3, 536e3, 549e3, 562e3,
    576e3, 590e3, 604e3, 619e3, 634e3, 649e3, 665e3, 681e3, 698e3,
    715e3, 732e3, 750e3, 768e3, 787e3, 806e3, 825e3, 845e3, 866e3, 887e3,
    909e3, 931e3, 953e3, 976e3,
    1.00e6, 1.02e6, 1.05e6, 1.07e6, 1.10e6, 1.13e6, 1.15e6, 1.18e6,
    1.21e6, 1.24e6, 1.27e6, 1.30e6, 1.33e6, 1.37e6, 1.40e6, 1.43e6, 1.47e6,
    1.50e6, 1.54e6, 1.58e6, 1.62e6, 1.65e6, 1.69e6, 1.74e6, 1.78e6,
    1.82e6, 1.87e6, 1.91e6, 1.96e6,
    2.00e6, 2.05e6, 2.10e6, 2.15e6, 2.21e6, 2.26e6, 2.32e6, 2.37e6,
    2.43e6, 2.49e6, 2.55e6, 2.61e6, 2.67e6, 2.74e6, 2.80e6, 2.87e6, 2.94e6,
    3.01e6, 3.09e6, 3.16e6, 3.24e6, 3.32e6, 3.40e6, 3.48e6, 3.57e6, 3.65e6,
    3.74e6, 3.83e6, 3.92e6,
    4.02e6, 4.12e6, 4.22e6, 4.32e6, 4.42e6, 4.53e6, 4.64e6, 4.75e6, 4.87e6,
    4.99e6, 5.11e6, 5.23e6, 5.36e6, 5.49e6, 5.62e6, 5.76e6, 5.90e6,
    6.04e6, 6.19e6, 6.34e6, 6.49e6, 6.65e6, 6.81e6, 6.98e6,
    7.15e6, 7.32e6, 7.50e6, 7.68e6, 7.87e6, 8.06e6, 8.25e6, 8.45e6, 8.66e6,
    8.87e6, 9.09e6, 9.31e6, 9.53e6, 9.76e6,
    10.0e6, 10.2e6, 10.5e6, 10.7e6, 11.0e6, 11.3e6, 11.5e6, 11.8e6,
    12.1e6, 12.4e6, 12.7e6, 13.0e6, 13.3e6, 13.7e6, 14.0e6, 14.3e6, 14.7e6,
    15.0e6, 15.4e6, 15.8e6, 16.2e6, 16.5e6, 16.9e6, 17.4e6, 17.8e6,
    18.2e6, 18.7e6, 19.1e6, 19.6e6, 20.0e6, 20.5e6, 21.0e6, 21.5e6,
    22.1e6, 22.6e6, 23.2e6, 23.7e6, 24.3e6, 24.9e6, 25.5e6, 26.1e6, 26.7e6,
    27.4e6, 28.0e6, 28.7e6, 29.4e6, 30.1e6, 30.9e6, 31.6e6, 32.4e6, 33.2e6,
    34.0e6, 34.8e6, 35.7e6, 36.5e6, 37.4e6, 38.3e6, 39.2e6,
    40.2e6, 41.2e6, 42.2e6, 43.2e6, 44.2e6, 45.3e6, 46.4e6, 47.5e6, 48.7e6,
    49.9e6, 51.1e6, 52.3e6, 53.6e6, 54.9e6, 56.2e6, 57.6e6, 59.0e6,
    60.4e6, 61.9e6, 63.4e6, 64.9e6, 66.5e6, 68.1e6, 69.8e6, 71.5e6, 73.2e6,
    75.0e6, 76.8e6, 78.7e6, 80.6e6, 82.5e6, 84.5e6, 86.6e6, 88.7e6,
    90.9e6, 93.1e6, 95.3e6, 97.6e6,
    100e6, 102e6, 105e6, 107e6, 110e6, 113e6, 115e6, 118e6, 121e6, 124e6,
    127e6, 130e6, 133e6, 137e6, 140e6, 143e6, 147e6, 150e6, 154e6, 158e6,
    162e6, 165e6, 169e6, 174e6, 178e6, 182e6, 187e6, 191e6, 196e6, 200e6
];

// For 2% tolerance (5-band)
r_values.r_values5band2pct = [
    1.00, 1.05, 1.10, 1.15, 1.21, 1.27, 1.33, 1.40,
    1.47, 1.54, 1.62, 1.69, 1.78, 1.87, 1.96,
    2.05, 2.15, 2.26, 2.37, 2.49, 2.61, 2.74, 2.87,
    3.01, 3.16, 3.32, 3.48, 3.65, 3.83, 4.02, 4.22, 4.42, 4.64, 4.87,
    5.11, 5.36, 5.62, 5.90, 6.19, 6.49, 6.81, 7.15, 7.50, 7.87,
    8.25, 8.66, 9.09, 9.53, 10.0, 10.5, 11.0, 11.5, 12.1, 12.7, 13.3,
    14.0, 14.7, 15.4, 16.2, 16.9, 17.8, 18.7, 19.6,
    20.5, 21.5, 22.6, 23.7, 24.9, 26.1, 27.4,
    28.7, 30.1, 31.6, 33.2, 34.8, 36.5, 38.3, 40.2, 42.2, 44.2, 46.4, 48.7,
    51.1, 53.6, 56.2, 59.0, 61.9, 64.9, 68.1, 71.5, 75.0, 78.7, 82.5, 86.6,
    90.9, 95.3, 100, 105, 110, 115, 121, 127, 133, 140, 147, 154, 162, 169,
    178, 187, 196, 205, 215, 226, 237, 249, 261, 274, 287,
    301, 316, 332, 348, 365, 383, 402, 422, 442, 464, 487,
    511, 536, 562, 590, 619, 649, 681, 715, 750, 787, 825, 866, 909, 953,
    1000, 1050, 1100, 1150, 1210, 1270, 1330, 1400, 1470, 1540, 1620, 1690,
    1780, 1870, 1960, 2050, 2150, 2260, 2370, 2490, 2610, 2740, 2870,
    3010, 3160, 3320, 3480, 3650, 3830,
    4020, 4220, 4420, 4640, 4870, 5110, 5360, 5620, 5900, 6190, 6490, 6810,
    7150, 7500, 7870, 8250, 8660, 9090, 9530,
    10000, 10500, 11000, 11500, 12100, 12700, 13300, 14000, 14700, 15400,
    16200, 16900, 17800, 18700, 19600,
    20500, 21500, 22600, 23700, 24900, 26100, 27400, 28700,
    30100, 31600, 33200, 34800, 36500, 38300,
    40200, 42200, 44200, 46400, 48700,
    51100, 53600, 56200, 59000, 61900, 64900, 68100, 71500, 75000, 78700,
    82500, 86600, 90900, 95300, 100e3, 105e3, 110e3, 115e3, 121e3, 127e3,
    133e3, 140e3, 147e3, 154e3, 162e3, 169e3, 178e3, 187e3, 196e3,
    205e3, 215e3, 226e3, 237e3, 249e3, 261e3, 274e3, 287e3,
    301e3, 316e3, 332e3, 348e3, 365e3, 383e3, 402e3, 422e3, 442e3, 464e3,
    487e3, 511e3, 536e3, 562e3, 590e3, 619e3, 649e3, 681e3,
    715e3, 750e3, 787e3,
    825e3, 866e3, 909e3, 953e3, 1e6, 1.05e6, 1.1e6, 1.15e6, 1.21e6, 1.27e6,
    1.33e6, 1.40e6, 1.47e6, 1.54e6, 1.62e6, 1.69e6, 1.78e6, 1.87e6, 1.96e6,
    2.05e6, 2.15e6, 2.26e6, 2.37e6, 2.49e6, 2.61e6, 2.74e6, 2.87e6,
    3.01e6, 3.16e6, 3.32e6, 3.48e6, 3.65e6, 3.83e6,
    4.02e6, 4.22e6, 4.42e6, 4.64e6, 4.87e6, 5.11e6, 5.36e6, 5.62e6, 5.90e6,
    6.19e6, 6.49e6, 6.81e6, 7.15e6, 7.50e6, 7.87e6, 8.25e6, 8.66e6,
    9.09e6, 9.53e6, 10.0e6, 10.5e6, 11.0e6, 11.5e6, 12.1e6, 12.7e6, 13.3e6,
    14.0e6, 14.7e6, 15.4e6, 16.2e6, 16.9e6, 17.8e6, 18.7e6, 19.6e6,
    20.5e6, 21.5e6, 22.6e6, 23.7e6, 24.9e6, 26.1e6, 27.4e6, 28.7e6,
    30.1e6, 31.6e6, 33.2e6, 34.8e6, 36.5e6, 38.3e6,
    40.2e6, 42.2e6, 44.2e6, 46.4e6, 48.7e6, 51.1e6, 53.6e6, 56.2e6, 59.0e6,
    61.9e6, 64.9e6, 68.1e6, 71.5e6, 75e6, 78.7e6, 82.5e6, 86.6e6,
    90.9e6, 95.3e6,
    100e6, 105e6, 110e6, 115e6, 121e6, 127e6, 133e6, 140e6, 147e6, 154e6,
    162e6, 169e6, 178e6, 187e6, 196e6
];

// For 5% tolerance (4-band)
r_values.r_values4band5pct = [
    10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39,
    43, 47, 51, 56, 62, 68, 75, 82, 91
];

// For 10% tolerance (4-band)
r_values.r_values4band10pct = [
    10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82
];

module.exports = r_values;

},{}],11:[function(require,module,exports){

var extend    = require('../helpers/util').extend,
    Component = require('./component'),
    sparksMath = require('../helpers/sparks-math');

ReactiveComponent = function (props, breadBoard) {
  if (typeof props.impedance !== 'undefined') {
    props.impedance = this.getRequestedImpedance( props.impedance );
  }

  ReactiveComponent.parentConstructor.call(this, props, breadBoard);

  this.applyFaults();
};

extend(ReactiveComponent, Component, {

  // return named component parameter ('inductance' or 'capacitance') if it is set directly on the component;
  // otherwise, calculate the component parameter value from the impedance + referenceFrequency of this component.
  getComponentParameter: function (componentParameterName, componentParameterFromImpedance) {
    // use a directly specified component parameter if it exists
    if (typeof this[componentParameterName] !== 'undefined') {
      return this[componentParameterName];
    }

    // otherwise, if no cached value, calculate one
    if (typeof this._componentParameter === 'undefined') {
      if (typeof this.impedance === 'undefined' || typeof this.referenceFrequency === 'undefined') {
        throw new Error("An impedance/referenceFrequency pair is needed, but not defined.");
      }

      this._componentParameter = sparksMath.roundToSigDigits(componentParameterFromImpedance(this.impedance, this.referenceFrequency), 3);
    }

    return this._componentParameter;
  },

  applyFaults: function () {
    // if we're 'open' or 'shorted', we become a broken resistor
    if (!!this.open){
      this.resistance = 1e20;
      this.addThisToFaults();
    } else if (!!this.shorted) {
      this.resistance = 1e-6;
      this.addThisToFaults();
    } else {
      this.open = false;
      this.shorted = false;
    }

    if (this.resistance > 0) {
      var self = this;
    }
  },

  getEditablePropertyValues: function() {
    values = [];
    // standard cap values
    baseValues = [10, 11, 12, 13, 15, 16, 18,
                  20, 22, 24, 27, 30, 33, 36, 39,
                  43, 47, 51, 56, 62, 68, 75, 82, 91];

    for (i = -13; i < -1; i++) {
      for (j = 0; j < baseValues.length; j++) {
        values.push(baseValues[j] * Math.pow(10, i));
      }
    }

    return values;
  }

});

module.exports = ReactiveComponent;

},{"../helpers/sparks-math":20,"../helpers/util":22,"./component":4}],12:[function(require,module,exports){
var extend    = require('../helpers/util').extend,
    Resistor  = require('./resistor'),
    r_values  = require('./r-values');

Resistor4band = function (id) {
  var superclass = Resistor4band.uber;
  superclass.init.apply(this, [id]);
  this.numBands = 4;

  if (breadModel('getResOrderOfMagnitude') < 0){
    var om = this.randInt(0, 3);
    breadModel('setResOrderOfMagnitude', om);
  }

  this.r_values5pct = this.filter(r_values.r_values4band5pct);
  this.r_values10pct = this.filter(r_values.r_values4band10pct);
};

extend(Resistor4band, Resistor, {

  toleranceValues: [0.05, 0.1],

  randomize: function (options) {

      var value = 0;
      do {
        var ix = this.randInt(0, 1);
        var values;

        this.tolerance = this.toleranceValues[ix];

        if (options && options.rvalues) {
            values = options.rvalues;
        }
        else if (this.tolerance == 0.05) {
            values = this.r_values5pct;
        }
        else {
            values = this.r_values10pct;
        }

        var om = breadModel('getResOrderOfMagnitude');
        var extra = this.randInt(0, 1);
        om = om + extra;

        value = values[this.randInt(0, values.length-1)];

        value = value * Math.pow(10,om);
      } while (!this._resistanceIsUnique(value));

      this.nominalValue = value;

      if (options && options.realEqualsNominal) {
          this.realValue = this.nominalValue;
      }
      else {
          this.realValue = this.calcRealValue(this.nominalValue, this.tolerance);
      }

      this.colors = this.getColors(this.nominalValue, this.tolerance);
  },

  _resistanceIsUnique: function (value) {
    var components = getBreadBoard().components;

    for (var i in components){
      var resistor  = components[i];
      var resistance = resistor.nominalResistance;
      if (resistance == value){
        return false;
      }
    }
    return true;
  },

  // rvalue: resistance value
  getColors: function (ohms, tolerance) {
      var s = ohms.toString();
      var decIx = s.indexOf('.'); // real location of the dot in the string
      // virtual location of dot
      // e.g., for "324", decLoc is 3, and for "102000", 6
      var decLoc = decIx > -1 ? decIx : s.length;

      s = s.replace('.', '');
      var len = s.length;

      // Make sure there are at least three significant digits
      for (var i = 0; i < 2 - len; ++i) {
          s += '0';
      }

      var mult = decLoc > 1 ? decLoc - 2 : 10;

      return [ this.colorMap[s.charAt(0)],
               this.colorMap[s.charAt(1)],
               this.colorMap[decLoc - 2],
               this.toleranceColorMap[tolerance]
             ];
  }

});

module.exports = Resistor4band;

},{"../helpers/util":22,"./r-values":10,"./resistor":13}],13:[function(require,module,exports){
var extend                = require('../helpers/util').extend,
    Component             = require('./component'),
    r_values              = require('./r-values'),
    Resistor4band         = require('./resistor-4band'),
    workbenchController   = require('../controllers/workbench-controller');

Resistor = function (props, breadBoard) {
  var tolerance, steps;

  // translate the requested resistance (which may be of the form ["uniform", 10, 100] into a real number
  if (typeof props.resistance !== 'undefined') {
    tolerance = props.tolerance || 0.05;
    steps = (tolerance === 0.05) ? r_values.r_values4band5pct : r_values.r_values4band10pct;
    props.resistance = this.getRequestedImpedance( props.resistance, steps );
  }

  Resistor.parentConstructor.call(this, props, breadBoard);

  // if we have colors defined and not resistance
  if ((this.resistance === undefined) && this.colors){
    this.resistance = this.getResistance( this.colors );
  }

  // if we have neither colors nor resistance
  if ((this.resistance === undefined) && !this.colors) {
    var resistor = new Resistor4band();
    resistor.randomize(null);
    this.resistance = resistor.getRealValue();
    this.tolerance = resistor.tolerance;
    this.colors = resistor.colors;
  }

  // if we have resistance and no colors
  if (!this.colors){
    this.colors = this.getColors4Band( this.resistance, (!!this.tolerance ? this.tolerance : 0.05));
  }

  // at this point, we must have both real resiatance and colors
  // calculate nominal resistance, unless nominalResistance is defined
  if (!this.nominalResistance){
    this.nominalResistance =  this.getResistance( this.colors );
  }

  // now that everything has been set, if we have a fault set it now
  this.applyFaults();

  if (this.resistance > 0) {
    this.setViewArguments({color: this.colors});
  } else {
    this.setViewArguments({type: "wire", color: "green"});      // represent as wire if resistance is zero
  }
};

extend(Resistor, Component,
{
  nominalValueMagnitude: -1,

    colorMap: { '-1': 'gold', '-2': 'silver',
        0 : 'black', 1 : 'brown', 2 : 'red', 3 : 'orange',
        4 : 'yellow', 5 : 'green', 6 : 'blue', 7 : 'violet', 8 : 'grey',
        9 : 'white' },

    toleranceColorMap: { 0.01 : 'brown', 0.02 : 'red', 5e-3 : 'green',
        2.5e-3 : 'blue', 1e-3 : 'violet', 5e-4 : 'gray', 5e-2 : 'gold',
        0.1 : 'silver', 0.2 : 'none' },

    toleranceValues: [ 0.01, 0.02 ],

    init: function (id) {
          this.id = id;
          this.nominalValue = 0.0; //resistance value specified by band colors;
          this.realValue = 0.0; //real resistance value in Ohms
          this.tolerance = 0.0; //tolerance value
          this.colors = []; //colors for each resistor band
    },

    getNumBands: function () {
        return this.numBands;
    },

    getNominalValue: function () {
        return this.nominalValue;
    },

    setNominalValue: function (value) {
        this.nominalValue = value;
    },

    getTolerance: function () {
        return this.tolerance;
    },

    setTolerance: function(value) {
        this.tolerance = value;
    },

    getRealValue: function () {
        return this.realValue;
    },

    setRealValue: function (value) {
        this.realValue = value;
    },

    setResistance: function (value) {
      this.resistance = value;
      this.updateColors();
    },

    updateColors: function (resistance, tolerance) {
        this.colors = this.getColors4Band( this.resistance, (!!this.tolerance ? this.tolerance : 0.05));
        this.setViewArguments({color: this.colors});
    },

    show : function() {
    },

    calcRealValue: function (nominalValue, tolerance) {
        var chance = Math.random();
        if (chance > 0.8) {
            var chance2 = Math.random();
            if (chance2 < 0.5) {
                return nominalValue + nominalValue * (tolerance + Math.random() * tolerance);
            }
            else {
                return nominalValue - nominalValue * (tolerance + Math.random() * tolerance);
            }
        }

        // Multiply 0.9 just to be comfortably within tolerance
        var realTolerance = tolerance * 0.9;
        return nominalValue * this.randFloat(1 - realTolerance, 1 + realTolerance);
    },

    randInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    randFloat: function (min, max) {
        return this.randPseudoGaussian(3) * (max - min) + min;
    },

    randPseudoGaussian: function (n) {
        var r = 0.0;
        for (var i = 0; i < n; ++i) {
            r += Math.random();
        }
        return r / n;
    },

    // Filter resistance values according to the requirements of this resistor
    filter: function (in_values) {
        var values = [];
        for (var i = 0; i < in_values.length; ++i) {
            if (in_values[i] >= 10.0 && in_values[i] < 2e6) {
                values.push(in_values[i]);
            }
        }
        return values;
    },

    getColors4Band: function (ohms, tolerance) {
        var s = ohms.toString(),
            decIx = s.indexOf('.'),
            decLoc = decIx > -1 ? decIx : s.length,
            len, i;
        s = s.replace('.', '');
        len = s.length;
        for (i = 0; i < 2 - len; ++i){ s += '0'; }
        return [ this.colorMap[s.charAt(0)],
                 this.colorMap[s.charAt(1)],
                 this.colorMap[decLoc - 2],
                 this.toleranceColorMap[tolerance]
               ];
    },

    getColors5Band: function (ohms, tolerance) {
        var s = ohms.toString(),
            decIx = s.indexOf('.'),
            decLoc = decIx > -1 ? decIx : s.length,
            len, i;
        s = s.replace('.', '');
        len = s.length;
        for (i = 0; i < 3 - len; ++i) { s += '0'; }
        return [ this.colorMap[s.charAt(0)],
                 this.colorMap[s.charAt(1)],
                 this.colorMap[s.charAt(2)],
                 this.colorMap[decLoc - 3],
                 this.toleranceColorMap[tolerance]
               ];
    },

    colorToNumber: function (color) {
      for (var n in this.colorMap) {
        if (this.colorMap[n] == color) { return parseInt(n,10); }
      }
      // alternate spelling...
      if (color == "gray") {
        return 8;
      }
      return null;
    },

    getResistance: function(colors){
      if (typeof(colors)==="string"){
        colors = colors.split(",");
      }
      var resistance = this.colorToNumber(colors[0]);
      for (var i = 1; i < colors.length - 2; i++) {
        resistance = resistance * 10;
        resistance += this.colorToNumber(colors[i]);
      }
      return resistance * Math.pow(10, this.colorToNumber(colors[i]));
    },

    addCiSoComponent: function (ciso) {
      var resistance  = this.resistance || 0,
          nodes       = this.getNodes();
      ciso.addComponent(this.UID, "Resistor", resistance, nodes);
    },

    applyFaults: function() {
      if (!!this.open){
        this.resistance = 1e20;
        this.addThisToFaults();
      } else if (!!this.shorted) {
        this.resistance = 1e-6;
        this.addThisToFaults();
      } else {
        this.open = false;
        this.shorted = false;
      }
    },

    componentTypeName: "Resistor",

    isEditable: true,

    editableProperty: {name: "resistance", units: "\u2126"},

    getEditablePropertyValues: function() {
      resValues = [];
      baseValues = r_values.r_values4band10pct;

      for (i = 0; i < 6; i++) {
        for (j = 0; j < baseValues.length; j++) {
          resValues.push(baseValues[j] * Math.pow(10, i));
        }
      }

      return resValues;
    },

    changeEditableValue: function(val) {
      this.setResistance(val);
      workbenchController.breadboardView.changeResistorColors(this.UID, this.getViewArguments().color);
    }
});

module.exports = Resistor;

},{"../controllers/workbench-controller":17,"../helpers/util":22,"./component":4,"./r-values":10,"./resistor-4band":12}],14:[function(require,module,exports){
var extend    = require('../helpers/util').extend,
    Resistor  = require('./resistor');

VariableResistor = function (props, breadBoard) {
  Resistor.parentConstructor.call(this, props, breadBoard);
  var superclass = VariableResistor.uber;
  superclass.init.apply(this, [props.UID]);
  this.resistance = this.minimumResistance;
};

extend(VariableResistor, Resistor, {

  getMinResistance: function() {
    return this.minimumResistance;
  },

  getMaxResistance: function() {
    return this.maximumResistance;
  },

  scaleResistance: function(value) {
    var perc = value / 10,       // values are 0-10
        range = this.maximumResistance - this.minimumResistance,
        newValue = this.minimumResistance + (range * perc);
    this.resistance = newValue;
  }

});

module.exports = VariableResistor;

},{"../helpers/util":22,"./resistor":13}],15:[function(require,module,exports){
var extend    = require('../helpers/util').extend,
    Component = require('./component');

Wire = function (props, breadBoard) {
  Wire.parentConstructor.call(this, props, breadBoard);
  this.setViewArguments({color: this.getColor()});
};

extend(Wire, Component, {

  getColor: function () {
    var location = this.getLocation();
    if (location.indexOf("positive") > -1) {
      return "red";
    } else if (location.indexOf("negative") > -1) {
      return "black";
    } else {
      if (Math.random() < 0.5){
        return "green";
      } else {
        return "blue";
      }
    }
  },

  addCiSoComponent: function (ciso) {
    var resistance  = 1e-6,
        nodes       = this.getNodes();
    ciso.addComponent(this.UID, "Resistor", resistance, nodes);
  }
});

module.exports = Wire;

},{"../helpers/util":22,"./component":4}],16:[function(require,module,exports){

var LogEvent  = require('../models/log'),
    util      = require('../helpers/util');

Log = function(startTime){
  this.events = [];
  this.startTime = startTime;
  this.endTime = -1;
};

LogController = function(){
  this.currentLog = null;
};

LogController.prototype = {

  startNewSession: function() {
    this.currentLog = new Log(new Date().valueOf());
  },

  endSession: function() {
    this.currentLog.endTime = new Date().valueOf();
  },

  addEvent: function (name, value) {
    var evt = new LogEvent(name, value, new Date().valueOf());
    this.currentLog.events.push(evt);
  },

  numEvents: function(log, name) {
    var count = 0;
    $.each(log.events, function(i, evt){
      if (evt.name == name){
        count ++;
      }
    });
    return count;
  },

  numUniqueMeasurements: function(log, type) {
    var count = 0;
    var positions = [];
    $.each(log.events, function(i, evt){
      if (evt.name == LogEvent.DMM_MEASUREMENT){
        if (evt.value.measurement == type) {
          var position = evt.value.red_probe + "" + evt.value.black_probe;
          if (util.contains(positions, position) === -1) {
            count++;
            positions.push(position);
          }
        }
      }
    });
    return count;
  },

  numConnectionChanges: function(log, type) {
    var count = 0;
    $.each(log.events, function(i, evt){
      if (evt.name == LogEvent.CHANGED_CIRCUIT && evt.value.type == type){
        count ++;
      }
    });
    return count;
  }

};

logController = new LogController();

module.exports = logController;

},{"../helpers/util":22,"../models/log":27}],17:[function(require,module,exports){
require('../circuit/breadboard');       // until breadboard refactoring....

var Oscilloscope  = require('../models/oscilloscope'),
    Workbench     = require('../models/workbench'),
    Multimeter    = require('../circuit/multimeter'),
    logController = require('../controllers/log-controller');


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

},{"../circuit/breadboard":2,"../circuit/multimeter":8,"../controllers/log-controller":16,"../models/oscilloscope":29,"../models/workbench":30}],18:[function(require,module,exports){
unit = require('./unit');

mathParser = {};

var p = mathParser;

p.calculateMeasurement = function(sum){
  if (sum === undefined || sum === null || sum === ""){
    return "";
  }
  if (!isNaN(Number(sum))){
    return sum;
  }

  answer = ""+sum;

  var sumPattern = /\[[^\]]+\]/g  // find anything between [ ]
  var matches= answer.match(sumPattern);
  if (!!matches){
    $.each(matches, function(i, match){
      var expression = match;
      var result = p.calculateSum(expression.substring(1, expression.length-1));
      answer = answer.replace(match,result);
    });
  }

  // now we have e.g. "1000 V"

  answer = unit.convertMeasurement(answer);   // convert 1000 V to 1 kiloV, for instance

  answer = p.standardizeUnits(answer);

  return answer;
};

p.standardizeUnits = function(string) {
  string = string.replace(/ohms/gi,"&#x2126;");
  string = string.replace("micro","&#x00b5;");
  string = string.replace("milli","m");
  string = string.replace("kilo","k");
  string = string.replace("mega","M");
  return string;
};


/*
  When passed a string such as "100 + r1.resistance / r2.nominalResistance"
  this will first assign variables for components r1 & r2, assuming
  the components and their properties exist in the circuit, and then perform the
  calculation.
*/
p.calculateSum = function(sum){
  sum = p.replaceCircuitVariables(sum);

  var calculatedSum = eval(sum);

  return calculatedSum;
};


p.replaceCircuitVariables = function(formula){

  // first add all the components as circuit variables at the start of the script
  // add all breadboard components as variables
  $.each(getBreadBoard().components, function(i, component){
    formula = "var " + i + " = getBreadBoard().components['"+i+"']; " + formula;
  });

  // add the breadboard itself as a variable
  formula = "var breadboard = getBreadBoard(); " + formula;

  // then support old method of accessing circuit variables using ${...}
  // NOTE: This is obsolete (but tested)
  var varPattern = /\${[^}]+}/g  //  ${ X } --> value of X
  var matches = formula.match(varPattern);
  if(!!matches){
   $.each(matches, function(i, match){
    console.log("WARN: It is not necessary to use the notation '"+match+"', you can simply use "+match.substring(2,match.length-1))
    var variable = match.substring(2,match.length-1).split('.');
    var component = variable[0];
    var property = variable[1];

    var components = getBreadBoard().components;

    if (!components[component]){
      console.log("ERROR calculating sum: No component name '"+component+"' in circuit");
      formula = '-1';
      return;
    }

    if (components[component][property] === undefined || components[component][property] === null){
      console.log("ERROR calculating sum: No property name '"+property+"' in component '"+component+"'");
      formula = '-1';
      return;
    }

    var value = components[component][property];
    formula = formula.replace(match, value);
   });
  }

  return formula;
};

module.exports = mathParser;

},{"./unit":21}],19:[function(require,module,exports){
sound = {};

sound.mute = false;

sound.play = function (sound) {
  if (!!window.Audio && !sound.mute) {
    sound.play();
  }
}

module.exports = sound;

},{}],20:[function(require,module,exports){
//= require helpers/string

/*globals console sparks */

/* FILE math.js */

str = {};

str.strip = function (s) {
    s = s.replace(/\s*([^\s]*)\s*/, '$1');
    return s;
};

// Remove a dot in the string, and then remove 0's on both sides
// e.g. '20100' => '201', '0.0020440' => '2044'
str.stripZerosAndDots = function (s) {
    s = s.replace('.', '');
    s = s.replace(/0*([^0].*)/, '$1');
    s = s.replace(/(.*[^0])0*/, '$1');
    return s;
};

str.stripZeros = function (s) {
    s = s.replace(/0*([^0].*)/, '$1');
    s = s.replace(/(.*[^0])0*/, '$1');
    return s;
};

math = {};

// Return true if number x is 10^z times y where z is an int
math.equalExceptPowerOfTen = function(x, y) {
    var sx = str.stripZerosAndDots(x.toString());
    var sy = str.stripZerosAndDots(y.toString());

    return sx === sy;
};

 // Get 10's power of the most significant digit.
 // e.g. For 4: 0, for 77: 1, for 3753: 3, for 0.02.
 // NOTE: The most significant digit is assumed to be the first non-zero digit,
 // which may be unacceptable for certain applications.
 // NOTE: x is a non-negative number.
 math.leftMostPos = function (x) {
     x = Number(x);
     if (isNaN(x) || x < 0) {
         console.log('ERROR: math.leftMostPos: Invalid input ' + x);
         return 0;
     }
     if (x === 0) {
         return 0;
     }
     var n = 0;
     var y = x;
     if (x < 1) {
         while (y < 1) {
             y *= 10;
             n -= 1;
         }
     }
     else {
         while (y >= 10) {
             y /= 10;
             n += 1;
         }
     }
     return n;
 };

 // Round x to n significant digits
 // e.g. Returns 12700 for 12678 when n = 3.
math.roundToSigDigits = function(x, n) {
  if (x === 0) {
    return 0;
  }
  var order = Math.ceil(Math.log10(x)),
      factor;

  // Divide into 2 cases to get numerically sane results (i.e., no .xxx999999s)
  if (n - order > 0) {
    // Ex. order of x = 1e-4, n = 3 sig digs: so multiply by 1e7, round, then divide by 1e7
    factor = Math.pow(10, n - order);
    return Math.round(x * factor) / factor;
  } else {
    // Ex. order of x = 1e6, n = 2 sig digs: so divide by 1e4, round, then multiply by 1e4
    factor = Math.pow(10, order - n);
    return Math.round(x / factor) * factor;
  }
};

 // Similar to roundToSigDigits but returns number composed only of the n
 // significant digits; e.g., returns 127 for 12678 when n = 3.
 math.getRoundedSigDigits = function (x, n) {
     return Math.round(x * Math.pow(10, n - math.leftMostPos(x) - 1));
 };


 // *** extend the Math object with useful methods ***

 Math.log10 = function(x){
   return Math.log(x)/Math.LN10;
 };

 Math.orderOfMagnitude = function(x) {
   if (x === 0) return 0;
   return Math.floor( Math.log(Math.abs(x))/Math.LN10 );
 };

 Math.powNdigits = function(x,n){
   return Math.pow(10,Math.floor(Math.log(x)/Math.LN10-n+1));
 };

 // Rounds to n sig figs (including adding on trailing zeros if necessary),
 // and returns a string representation of the number.
 Math.toSigFigs = function(num, sigFigs) {
   num = num.toPrecision(sigFigs);
   return sigFigs > Math.log(num) * Math.LOG10E ? num : ""+parseFloat(num);
 };

 Math.close = function(num, expected, perc) {
   var perc = perc || 5,
        dif = expected * (perc/100);
   return (num >= (expected-dif) && num <= (expected+dif));
 };

 // *** extend the Array object with useful methods ***

 Array.max = function( array ){
     return Math.max.apply( Math, array );
 };
 Array.min = function( array ){
     return Math.min.apply( Math, array );
 };

 module.exports = math;


},{}],21:[function(require,module,exports){
unit = {};

var u = unit;

u.labels = { ohms : '\u2126', kilo_ohms : 'k\u2126', mega_ohms : 'M\u2126' };

u.toEngineering = function (value, units){
  value = Number(value);
  var isShort = (units.length === 1 || units === "Hz"),
      prefix  = "";

  if (value >= 1000000){
    prefix = isShort ? "M" : "mega";
    value = u.round(value/1000000,2);
  } else if (value >= 1000){
    prefix = isShort ? "k" : "kilo";
    value = u.round(value/1000,2);
  } else if (value === 0 ) {
    value = 0;
  } else if (value < 0.000000001){
    prefix = isShort ? "p" : "pico";
    value = u.round(value * 1000000000000,2);
  } else if (value < 0.000001){
    prefix = isShort ? "n" : "nano";
    value = u.round(value * 1000000000,2);
  } else if (value < 0.001){
    prefix = isShort ? "μ" : "micro";
    value = u.round(value * 1000000,2);
  } else if (value < 1) {
    prefix = isShort ? "m" : "milli";
    value = u.round(value * 1000,2);
  } else {
    value = u.round(value,2);
  }
  units = prefix + units;

  return {"value": value, "units": units};
};

u.round = function(num, dec) {
	var result = Math.round( Math.round( num * Math.pow( 10, dec + 2 ) ) / Math.pow( 10, 2 ) ) / Math.pow(10,dec);
	return result;
};

u.sigFigs = function(n, sig) {
    var mult = Math.pow(10,
        sig - Math.floor(Math.log(n) / Math.LN10) - 1);
    return Math.round(n * mult) / mult;
};

// returns true if string is of form "50 ohms" or "0.1V"
u.isMeasurement = function(string) {
  var isMeasurementPattern = /^\s?\d+.?\d*\s?\D+\s?$/
  var matched = string.match(isMeasurementPattern);
  return !!matched;
};

/**
* assumes this will be in the form ddd uu
* i.e. a pure number and a unit, separated by an optional space
* '50 ohms' and '50V' are both valid
*/
u.convertMeasurement = function(measurement) {
  if (!this.isMeasurement(measurement)){
    return measurement
  }

  var numPattern = /\d+\.?\d*/g
  var nmatched = measurement.match(numPattern);
  if (!nmatched){
    return measurement;
  }
  var value = nmatched[0];

  var unitPattern =  /(?=\d*.?\d*)[^\d\.\s]+/g
  var umatched = measurement.match(unitPattern);
  if (!umatched){
    return measurement;
  }
  var unit = umatched[0];

  var eng = u.toEngineering(value, unit)
  return eng.value + " " + eng.units;
};

u.normalizeToOhms = function (value, unit) {
    switch (unit) {
    case u.labels.ohms:
        return value;
    case u.labels.kilo_ohms:
        return value * 1000;
    case u.labels.mega_ohms:
        return value * 1e6;
    }
    return null;
};

u.ohmCompatible = function (unit) {
    if (unit == u.labels.ohms || unit == u.labels.kilo_ohms ||
        unit == u.labels.mega_ohms)
    {
        return true;
    }
    return false;
};

// Return a string with a unit representing the resistance value.
// value: resistance value in ohms
u.res_str = function (value) {
    var vstr, unit, val;

    if (typeof value !== 'number' || isNaN(Number(value))) {
        return 'Invalid Value ' + String(value);
    }

    if (value < 1000) {
        val = value;
        unit = u.labels.ohms;
    }
    else if (value < 1e6) {
        val = value / 1000;
        unit = u.labels.kilo_ohms;
    }
    else {
        val = value / 1e6;
        unit = u.labels.mega_ohms;
    }

    if (val.toFixed) {
        val = val.toFixed(6);
    }

    vstr = String(val).replace(/(\.[0-9]*[1-9])0*/, '$1');
    vstr = vstr.replace(/([0-9])\.0+$/, '$1');
    return vstr + ' ' + unit;
};

u.res_unit_str = function (value, mult) {
    var vstr;
    var unit = u.labels.ohms;

    if (mult === 'k') {
        vstr = String(value / 1000.0);
        unit = u.labels.kilo_ohms;
    }
    else if (mult === 'M') {
        vstr = String(value / 1000000.0);
        unit = u.labels.mega_ohms;
    }
    else {
        vstr = String(value);
        unit = u.labels.ohms;
    }
    return vstr + ' ' + unit;
};

u.pct_str = function (value) {
    return (value * 100) + ' %';
};

u.unitEquivalents = {
  "V": ["v", "volts", "volt", "vol", "vs"],
  "A": ["a", "amps", "amp", "amper", "ampers", "as"],
  "Ohms": ["ohms", "oms", "o", "Ω", "os"],
  "deg": ["deg", "degs", "degree", "degrees", "º"],
  "F": ["f", "farads", "farad", "fared", "fareds", "fered", "fereds", "feret", "ferets", "ferret", "ferrets", "fs"],
  "H": ["h", "henries", "henry", "henrys", "hs"],
  "Hz": ["hz", "herz", "hertz"],
  "%": ["%", "perc", "percent"]
}

u.prefixEquivalents = {
  "femto": ["femto", "fempto", "f"],
  "pico": ["pico", "picco", "p"],
  "nano": ["nano", "nanno", "n"],
  "micro": ["micro", "micron", "μ"],
  "milli": ["mili", "milli", "millli"],
  "kilo": ["kilo", "killo", "killlo", "k"],
  "mega": ["mega", "meg"],
  "giga": ["giga", "gigga", "g"]
};

u.prefixValues = {
  "femto": 1E-15,
  "pico": 1E-12,
  "nano": 1E-9,
  "micro": 1E-6,
  "milli": 1E-3,
  "kilo": 1E3,
  "mega": 1E6,
  "giga": 1E9
};

u.parse = function(string) {
  var value, units, prefix, currPrefix, unit, equivalents, equiv, regex;

  string = string.replace(/ /g, '');                    // rm all whitespace
  string = string.replace(/['";:,\/?\\]/g, '');         // rm all non-period, non-dash puncutation
  string = string.replace(/[^\d\.-]*(\d.*)/, '$1');      // if there are numbers, if there are letters before them remove them
  value =  string.match(/^-?[\d\.]+/);                  // find all numbers before the first letter, parse them to a number, store it
  if (value) {
    value = parseFloat(value[0]);
  }
  string = string.replace(/^-?[\d\.]*/, '');             // everything after the first value is the units
  string = string.replace(/['";:,\.\/?\\-]/g, '');       // rm all puncutation

  for (unit in this.unitEquivalents) {                // if the unit can be found in the equivalents table, replace
    equivalents = this.unitEquivalents[unit];
    if (equivalents.length > 0) {
      for (var i = 0, ii = equivalents.length; i<ii; i++) {
        equiv = equivalents[i];
        regex = new RegExp('.*('+equiv+')$', 'i');
        hasUnits =string.match(regex)
        if (hasUnits && hasUnits.length > 1){
          units = unit;
          string = string.replace(hasUnits[1], '');
          break;
        }
      }
    }
    if (units) {
      break;
    }
  }

  if (!units) {
    units = string;
  }

  for (currPrefix in this.prefixEquivalents) {                 // if we can find a prefix at the start of the string, store it and delete it
    equivalents = this.prefixEquivalents[currPrefix];
    if (equivalents.length > 0) {
      for (var i = 0, ii = equivalents.length; i<ii; i++) {
        equiv = equivalents[i];
        regex = new RegExp('^('+equiv+').*', 'i');
        prefixes = string.match(regex);
        if (prefixes && prefixes.length > 1){
          prefix = currPrefix;
          units = units.replace(prefixes[1], '');
          break;
        }
      }
    }
    if (prefix) {
      break;
    }
  }

  if (!prefix) {                                      // if we haven't found a prefix yet, check for case-sensitive m or M at start
    if (string.match(/^m/)) {
      prefix = "milli";
      units = units.replace(/^m/, "");
    } else if (string.match(/^M/)){
      prefix = "mega";
      units = units.replace(/^M/, "");
    }
  }

  if (prefix) {
    value = value * this.prefixValues[prefix];        // if we have a prefix, multiply by that;
  }

  if (!value) {
    value = NaN;
  }

  return {val: value, units: units}
};

module.exports = unit;


},{}],22:[function(require,module,exports){
var util = {};

util.readCookie = function (name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length,c.length);
        }
    }
    return null;
};

/**
 * Naive deep-cloning of an object.
 * Doesn't check against infinite recursion.
 */
util.cloneSimpleObject = function (obj) {
    var ret, key;
    if (obj instanceof Array) {
        ret = [];
        for (key in obj) {
            ret.push(util.cloneSimpleObject(obj[key]));
        }
        return ret;
    }
    else if (typeof obj === 'object') {
        ret = {};
        for (key in obj) {
            ret[key] = util.cloneSimpleObject(obj[key]);
        }
        return ret;
    }
    else {
        return obj;
    }
};

// The "next" function returns a different value each time
// alternating between the two input values x, y.
util.Alternator = function (x, y)
{
    this.x = x;
    this.y = y;
    this.cnt = 0;
};
util.Alternator.prototype =
{
    next : function () {
        ++this.cnt;
        return this.cnt % 2 == 1 ? this.x : this.y;
    }
};

// Return a string representation of time lapsed between start and end
util.timeLapseStr = function (start, end) {
    var seconds = Math.floor((end - start) / 1000);
    var minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    var str = seconds + (seconds == 1 ? ' second' : ' seconds');
    if (minutes > 0) {
        str = minutes + (minutes == 1 ? ' minute ' : ' minutes ') + str;
    }
    return str;
};

/**
The initial version of this was copied from the serializeArray method of jQuery
this version returns a result object and uses the names of the input elements
as the actual keys in the result object.  This requires more careful naming but it
makes using the returned object easier.  It could be improved to handle dates and
numbers perhaps using style classes to tag them as such.
*/
util.serializeForm = function (form) {
    var result = {};
    form.map(function () {
        return this.elements ? jQuery.makeArray(this.elements) : this;
    }).filter(function () {
        return this.name &&
        (this.checked || (/select|textarea/i).test(this.nodeName) ||
        (/text|hidden|password|search/i).test(this.type));
    }).each(function (i) {
        var val = jQuery(this).val();
        if(val === null){
            return;
        }

        if (jQuery.isArray(val)) {
            result[this.name] = jQuery.makeArray(val);
        }
        else {
            result[this.name] = val;
        }
    });
    return result;
};

// Returns a string representation of the input date
// date: either a Date or a number in milliseconds
util.formatDate = function (date) {
    function fillZero(val) {
        return val < 10 ? '0' + val : String(val);
    }
    if (typeof date === 'number') {
        date = new Date(date);
    }
    var s = fillZero(date.getMonth() + 1) + '/';

    s += fillZero(date.getDate()) + '/';
    s += String(date.getFullYear()) + ' ';
    s += fillZero(date.getHours()) + ':';
    s += fillZero(date.getMinutes()) + ':';
    s += fillZero(date.getSeconds()) + ' ';
    return s;
};

util.todaysDate = function() {
  var monthNames = ["January","February","March","April","May","June","July",
                    "August","September","October","November","December"];

  var now = new Date();
  return monthNames[now.getMonth()] + " " +  now.getDate() + ", " + now.getFullYear();
}

// Pretty print an object. Mainly intended for debugging JSON objects
util.prettyPrint = function (obj, indent) {
    var t = '';
    if (typeof obj === 'object') {
        for (var key in obj) {
            if (typeof obj[key] !== 'function') {
                for (var i = 0; i < indent; ++i) {
                    t += ' ';
                }
                t += key + ': ';
                if (typeof obj[key] === 'object') {
                    t += '\n';
                }
                t += util.prettyPrint(obj[key], indent + 4);
            }
        }
        return t;
    }
    else {
        return obj + '\n';
    }
};

util.getRubric = function (id, callback, local) {
    var self = this;
    var url;

    if (local) {
        url = 'rubric.json';
    }
    else {
        //get it from server
        url = unescape(util.readCookie('rubric_path') + '/' + id + '.json');
    }
    console.log('url=' + url);
    $.ajax({
        url: url,
        dataType: 'json',
        success: function (rubric) {
            callback(rubric);
        },
        error: function (request, status, error) {
            console.log('Activity#getRubric ERROR:\nstatus: ' + status + '\nerror: ' + error + '\nurl=' + url);
        }
    });
};

util.shuffle = function (o) {
  for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};

util.contains = function (array, obj) {
  var i = array.length;
    while (i--) {
       if (array[i] === obj) {
           return i;
       }
    }
    return -1;
};

util.getKeys = function (json) {
  var keys = [];
  $.each(json, function(key){
    keys.push(key);
  })
  return keys;
};

// When we define, say, a logaritmic sweep of frequencies, we calculate them on our end
// for the function generator, and QUCS generates them on its end after being given a
// simulation type. These two series may not be exactly the same after accounting for
// different precisions, so we want to pick the QUCS value that's closest to what we
// think we're generating. So, if we think we're generating 1002.2 Hz, and QUCS comes back
// with [1000, 1002.22222, 1003.33333], we want to return the index '1'
//
// @array an array of numbers, complex or real
// @actual the number we want
// @isComplex whether the numbers in the array are complex or real
util.getClosestIndex = function(array, actual, isComplex) {
  var minDiff = Infinity,
      index;
  // this could be shortened as a CS exercise, but it takes 0 ms over an array of
  // 10,000 so it's not really worth it...
  for (var i = 0, ii = array.length; i < ii; i++){
    var diff = isComplex ? Math.abs(array[i].real - actual) : Math.abs(array[i] - actual);
    if (diff < minDiff){
      minDiff = diff;
      index = i;
    }
  }
  return index;
};

// YUI-style inheritance
util.extend = function(Child, Parent, properties) {
  var F = function() {};
  F.prototype = Parent.prototype;
  Child.prototype = new F();
  if (properties) {
      for (var k in properties) {
          Child.prototype[k] = properties[k];
      }
  }
  Child.prototype.constructor = Child;
  Child.parentConstructor = Parent;
  Child.uber = Parent.prototype;
};

module.exports = util;


// Shim to add ECMA262-5 Array methods if not supported natively
if ( !Array.prototype.indexOf ) {
  Array.prototype.indexOf= function(find, i /*opt*/) {
      if (i===undefined) i= 0;
      if (i<0) i+= this.length;
      if (i<0) i= 0;
      for (var n= this.length; i<n; i++)
          if (i in this && this[i]===find)
              return i;
      return -1;
  };
}
if ( !Array.prototype.forEach ) {
  Array.prototype.forEach = function(fn, scope) {
    for(var i = 0, len = this.length; i < len; ++i) {
      fn.call(scope, this[i], i, this);
    }
  }
}

},{}],23:[function(require,module,exports){
require('../lib/jquery/jquery-1.8.1.min');
require('../lib/jquery/jquery-ui-1.8.24.custom.min');
require('../lib/circuitSolver.min');
require('../lib/jquery/plugins/jquery.url.packed');
require('../lib/jquery/plugins/jquery.cookie');
require('../lib/jquery/plugins/jquery.easyTooltip');
require('../lib/jquery/plugins/jquery.tablesorter.min');
require('../lib/jquery/plugins/jquery.event.drag-2.0.min');
require('../lib/jquery/plugins/jquery.flashembed');
require('../lib/apMessageBox');
require('../lib/raphael-min');

var workbenchController = require('./controllers/workbench-controller'),
    sound               = require('./helpers/sound'),
    soundFiles          = {click: "../common/sounds/click.ogg"};

loadSounds = function () {
  var soundName, audio;

  for (soundName in soundFiles) {
    if (!!window.Audio) {
      audio = new Audio();
      audio.src = soundFiles[soundName];
      sound[soundName] = audio;
    }
  }
};

$(document).ready(function () {
    loadSounds();
});

var sparks = {};

sparks.createWorkbench = function(props, elId) {
  workbenchController.createWorkbench(props, elId);
}

module.exports = sparks;

},{"../lib/apMessageBox":37,"../lib/circuitSolver.min":38,"../lib/jquery/jquery-1.8.1.min":39,"../lib/jquery/jquery-ui-1.8.24.custom.min":40,"../lib/jquery/plugins/jquery.cookie":41,"../lib/jquery/plugins/jquery.easyTooltip":42,"../lib/jquery/plugins/jquery.event.drag-2.0.min":43,"../lib/jquery/plugins/jquery.flashembed":44,"../lib/jquery/plugins/jquery.tablesorter.min":45,"../lib/jquery/plugins/jquery.url.packed":46,"../lib/raphael-min":47,"./controllers/workbench-controller":17,"./helpers/sound":19}],24:[function(require,module,exports){
/* Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
 * Version: 1.0
 * LastModified: Dec 25 1999
 * This library is free.  You can redistribute it and/or modify it.
 */

/*
 * Interfaces:
 * b64 = base64encode(data);
 * data = base64decode(b64);
 */

(function() {

var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var base64DecodeChars = new Array(
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
    52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
    -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
    -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

function base64encode(str) {
    var out, i, len;
    var c1, c2, c3;

    len = str.length;
    i = 0;
    out = "";
    while(i < len) {
  c1 = str.charCodeAt(i++) & 0xff;
  if(i == len)
  {
      out += base64EncodeChars.charAt(c1 >> 2);
      out += base64EncodeChars.charAt((c1 & 0x3) << 4);
      out += "==";
      break;
  }
  c2 = str.charCodeAt(i++);
  if(i == len)
  {
      out += base64EncodeChars.charAt(c1 >> 2);
      out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
      out += base64EncodeChars.charAt((c2 & 0xF) << 2);
      out += "=";
      break;
  }
  c3 = str.charCodeAt(i++);
  out += base64EncodeChars.charAt(c1 >> 2);
  out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
  out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6));
  out += base64EncodeChars.charAt(c3 & 0x3F);
    }
    return out;
}

function base64decode(str) {
    var c1, c2, c3, c4;
    var i, len, out;

    len = str.length;
    i = 0;
    out = "";
    while(i < len) {
  /* c1 */
  do {
      c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
  } while(i < len && c1 == -1);
  if(c1 == -1)
      break;

  /* c2 */
  do {
      c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
  } while(i < len && c2 == -1);
  if(c2 == -1)
      break;

  out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

  /* c3 */
  do {
      c3 = str.charCodeAt(i++) & 0xff;
      if(c3 == 61)
    return out;
      c3 = base64DecodeChars[c3];
  } while(i < len && c3 == -1);
  if(c3 == -1)
      break;

  out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

  /* c4 */
  do {
      c4 = str.charCodeAt(i++) & 0xff;
      if(c4 == 61)
    return out;
      c4 = base64DecodeChars[c4];
  } while(i < len && c4 == -1);
  if(c4 == -1)
      break;
  out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
    }
    return out;
}

if (!window.btoa) window.btoa = base64encode;
if (!window.atob) window.atob = base64decode;

})();
},{}],25:[function(require,module,exports){
/*
 * canvg.js - Javascript SVG parser and renderer on Canvas
 * MIT Licensed
 * Gabe Lerner (gabelerner@gmail.com)
 * http://code.google.com/p/canvg/
 *
 */
(function(){

	var RGBColor = require('./rgbcolor');

	// canvg(target, s)
	// empty parameters: replace all 'svg' elements on page with 'canvas' elements
	// target: canvas element or the id of a canvas element
	// s: svg string, url to svg file, or xml document
	// opts: optional hash of options
	//		 ignoreMouse: true => ignore mouse events
	//		 ignoreAnimation: true => ignore animations
	//		 ignoreDimensions: true => does not try to resize canvas
	//		 ignoreClear: true => does not clear canvas
	//		 offsetX: int => draws at a x offset
	//		 offsetY: int => draws at a y offset
	//		 scaleWidth: int => scales horizontally to width
	//		 scaleHeight: int => scales vertically to height
	//		 renderCallback: function => will call the function after the first render is completed
	//		 forceRedraw: function => will call the function on every frame, if it returns true, will redraw
	this.canvg = function (target, s, opts) {
		// no parameters
		if (target == null && s == null && opts == null) {
			var svgTags = document.getElementsByTagName('svg');
			for (var i=0; i<svgTags.length; i++) {
				var svgTag = svgTags[i];
				var c = document.createElement('canvas');
				c.width = svgTag.clientWidth;
				c.height = svgTag.clientHeight;
				svgTag.parentNode.insertBefore(c, svgTag);
				svgTag.parentNode.removeChild(svgTag);
				var div = document.createElement('div');
				div.appendChild(svgTag);
				canvg(c, div.innerHTML);
			}
			return;
		}
		opts = opts || {};

		if (typeof target == 'string') {
			target = document.getElementById(target);
		}

		// store class on canvas
		if (target.svg != null) target.svg.stop();
		target.svg = svg = build();
		svg.opts = opts;

		var ctx = target.getContext('2d');
		if (typeof(s.documentElement) != 'undefined') {
			// load from xml doc
			svg.loadXmlDoc(ctx, s);
		}
		else if (s.substr(0,1) == '<') {
			// load from xml string
			svg.loadXml(ctx, s);
		}
		else {
			// load from url
			svg.load(ctx, s);
		}
	}

	function build() {
		var svg = { };

		svg.FRAMERATE = 30;
		svg.MAX_VIRTUAL_PIXELS = 30000;

		// globals
		svg.init = function(ctx) {
			svg.Definitions = {};
			svg.Styles = {};
			svg.Animations = [];
			svg.Images = [];
			svg.ctx = ctx;
			svg.ViewPort = new (function () {
				this.viewPorts = [];
				this.Clear = function() { this.viewPorts = []; }
				this.SetCurrent = function(width, height) { this.viewPorts.push({ width: width, height: height }); }
				this.RemoveCurrent = function() { this.viewPorts.pop(); }
				this.Current = function() { return this.viewPorts[this.viewPorts.length - 1]; }
				this.width = function() { return this.Current().width; }
				this.height = function() { return this.Current().height; }
				this.ComputeSize = function(d) {
					if (d != null && typeof(d) == 'number') return d;
					if (d == 'x') return this.width();
					if (d == 'y') return this.height();
					return Math.sqrt(Math.pow(this.width(), 2) + Math.pow(this.height(), 2)) / Math.sqrt(2);
				}
			});
		}
		svg.init();

		// images loaded
		svg.ImagesLoaded = function() {
			for (var i=0; i<svg.Images.length; i++) {
				if (!svg.Images[i].loaded) return false;
			}
			return true;
		}

		// trim
		svg.trim = function(s) { return s.replace(/^\s+|\s+$/g, ''); }

		// compress spaces
		svg.compressSpaces = function(s) { return s.replace(/[\s\r\t\n]+/gm,' '); }

		// ajax
		svg.ajax = function(url) {
			var AJAX;
			if(window.XMLHttpRequest){AJAX=new XMLHttpRequest();}
			else{AJAX=new ActiveXObject('Microsoft.XMLHTTP');}
			if(AJAX){
			   AJAX.open('GET',url,false);
			   AJAX.send(null);
			   return AJAX.responseText;
			}
			return null;
		}

		// parse xml
		svg.parseXml = function(xml) {
			if (window.DOMParser)
			{
				var parser = new DOMParser();
				return parser.parseFromString(xml, 'text/xml');
			}
			else
			{
				xml = xml.replace(/<!DOCTYPE svg[^>]*>/, '');
				var xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
				xmlDoc.async = 'false';
				xmlDoc.loadXML(xml);
				return xmlDoc;
			}
		}

		svg.Property = function(name, value) {
			this.name = name;
			this.value = value;
		}
			svg.Property.prototype.getValue = function() {
				return this.value;
			}

			svg.Property.prototype.hasValue = function() {
				return (this.value != null && this.value !== '');
			}

			// return the numerical value of the property
			svg.Property.prototype.numValue = function() {
				if (!this.hasValue()) return 0;

				var n = parseFloat(this.value);
				if ((this.value + '').match(/%$/)) {
					n = n / 100.0;
				}
				return n;
			}

			svg.Property.prototype.valueOrDefault = function(def) {
				if (this.hasValue()) return this.value;
				return def;
			}

			svg.Property.prototype.numValueOrDefault = function(def) {
				if (this.hasValue()) return this.numValue();
				return def;
			}

			// color extensions
				// augment the current color value with the opacity
				svg.Property.prototype.addOpacity = function(opacity) {
					var newValue = this.value;
					if (opacity != null && opacity != '' && typeof(this.value)=='string') { // can only add opacity to colors, not patterns
						var color = new RGBColor(this.value);
						if (color.ok) {
							newValue = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + opacity + ')';
						}
					}
					return new svg.Property(this.name, newValue);
				}

			// definition extensions
				// get the definition from the definitions table
				svg.Property.prototype.getDefinition = function() {
					var name = this.value.replace(/^(url\()?#([^\)]+)\)?$/, '$2');
					return svg.Definitions[name];
				}

				svg.Property.prototype.isUrlDefinition = function() {
					return this.value.indexOf('url(') == 0
				}

				svg.Property.prototype.getFillStyleDefinition = function(e) {
					var def = this.getDefinition();

					// gradient
					if (def != null && def.createGradient) {
						return def.createGradient(svg.ctx, e);
					}

					// pattern
					if (def != null && def.createPattern) {
						return def.createPattern(svg.ctx, e);
					}

					return null;
				}

			// length extensions
				svg.Property.prototype.getDPI = function(viewPort) {
					return 96.0; // TODO: compute?
				}

				svg.Property.prototype.getEM = function(viewPort) {
					var em = 12;

					var fontSize = new svg.Property('fontSize', svg.Font.Parse(svg.ctx.font).fontSize);
					if (fontSize.hasValue()) em = fontSize.toPixels(viewPort);

					return em;
				}

				svg.Property.prototype.getUnits = function() {
					var s = this.value+'';
					return s.replace(/[0-9\.\-]/g,'');
				}

				// get the length as pixels
				svg.Property.prototype.toPixels = function(viewPort) {
					if (!this.hasValue()) return 0;
					var s = this.value+'';
					if (s.match(/em$/)) return this.numValue() * this.getEM(viewPort);
					if (s.match(/ex$/)) return this.numValue() * this.getEM(viewPort) / 2.0;
					if (s.match(/px$/)) return this.numValue();
					if (s.match(/pt$/)) return this.numValue() * this.getDPI(viewPort) * (1.0 / 72.0);
					if (s.match(/pc$/)) return this.numValue() * 15;
					if (s.match(/cm$/)) return this.numValue() * this.getDPI(viewPort) / 2.54;
					if (s.match(/mm$/)) return this.numValue() * this.getDPI(viewPort) / 25.4;
					if (s.match(/in$/)) return this.numValue() * this.getDPI(viewPort);
					if (s.match(/%$/)) return this.numValue() * svg.ViewPort.ComputeSize(viewPort);
					return this.numValue();
				}

			// time extensions
				// get the time as milliseconds
				svg.Property.prototype.toMilliseconds = function() {
					if (!this.hasValue()) return 0;
					var s = this.value+'';
					if (s.match(/s$/)) return this.numValue() * 1000;
					if (s.match(/ms$/)) return this.numValue();
					return this.numValue();
				}

			// angle extensions
				// get the angle as radians
				svg.Property.prototype.toRadians = function() {
					if (!this.hasValue()) return 0;
					var s = this.value+'';
					if (s.match(/deg$/)) return this.numValue() * (Math.PI / 180.0);
					if (s.match(/grad$/)) return this.numValue() * (Math.PI / 200.0);
					if (s.match(/rad$/)) return this.numValue();
					return this.numValue() * (Math.PI / 180.0);
				}

		// fonts
		svg.Font = new (function() {
			this.Styles = 'normal|italic|oblique|inherit';
			this.Variants = 'normal|small-caps|inherit';
			this.Weights = 'normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900|inherit';

			this.CreateFont = function(fontStyle, fontVariant, fontWeight, fontSize, fontFamily, inherit) {
				var f = inherit != null ? this.Parse(inherit) : this.CreateFont('', '', '', '', '', svg.ctx.font);
				return {
					fontFamily: fontFamily || f.fontFamily,
					fontSize: fontSize || f.fontSize,
					fontStyle: fontStyle || f.fontStyle,
					fontWeight: fontWeight || f.fontWeight,
					fontVariant: fontVariant || f.fontVariant,
					toString: function () { return [this.fontStyle, this.fontVariant, this.fontWeight, this.fontSize, this.fontFamily].join(' ') }
				}
			}

			var that = this;
			this.Parse = function(s) {
				var f = {};
				var d = svg.trim(svg.compressSpaces(s || '')).split(' ');
				var set = { fontSize: false, fontStyle: false, fontWeight: false, fontVariant: false }
				var ff = '';
				for (var i=0; i<d.length; i++) {
					if (!set.fontStyle && that.Styles.indexOf(d[i]) != -1) { if (d[i] != 'inherit') f.fontStyle = d[i]; set.fontStyle = true; }
					else if (!set.fontVariant && that.Variants.indexOf(d[i]) != -1) { if (d[i] != 'inherit') f.fontVariant = d[i]; set.fontStyle = set.fontVariant = true;	}
					else if (!set.fontWeight && that.Weights.indexOf(d[i]) != -1) {	if (d[i] != 'inherit') f.fontWeight = d[i]; set.fontStyle = set.fontVariant = set.fontWeight = true; }
					else if (!set.fontSize) { if (d[i] != 'inherit') f.fontSize = d[i].split('/')[0]; set.fontStyle = set.fontVariant = set.fontWeight = set.fontSize = true; }
					else { if (d[i] != 'inherit') ff += d[i]; }
				} if (ff != '') f.fontFamily = ff;
				return f;
			}
		});

		// points and paths
		svg.ToNumberArray = function(s) {
			var a = svg.trim(svg.compressSpaces((s || '').replace(/,/g, ' '))).split(' ');
			for (var i=0; i<a.length; i++) {
				a[i] = parseFloat(a[i]);
			}
			return a;
		}
		svg.Point = function(x, y) {
			this.x = x;
			this.y = y;
		}
			svg.Point.prototype.angleTo = function(p) {
				return Math.atan2(p.y - this.y, p.x - this.x);
			}

			svg.Point.prototype.applyTransform = function(v) {
				var xp = this.x * v[0] + this.y * v[2] + v[4];
				var yp = this.x * v[1] + this.y * v[3] + v[5];
				this.x = xp;
				this.y = yp;
			}

		svg.CreatePoint = function(s) {
			var a = svg.ToNumberArray(s);
			return new svg.Point(a[0], a[1]);
		}
		svg.CreatePath = function(s) {
			var a = svg.ToNumberArray(s);
			var path = [];
			for (var i=0; i<a.length; i+=2) {
				path.push(new svg.Point(a[i], a[i+1]));
			}
			return path;
		}

		// bounding box
		svg.BoundingBox = function(x1, y1, x2, y2) { // pass in initial points if you want
			this.x1 = Number.NaN;
			this.y1 = Number.NaN;
			this.x2 = Number.NaN;
			this.y2 = Number.NaN;

			this.x = function() { return this.x1; }
			this.y = function() { return this.y1; }
			this.width = function() { return this.x2 - this.x1; }
			this.height = function() { return this.y2 - this.y1; }

			this.addPoint = function(x, y) {
				if (x != null) {
					if (isNaN(this.x1) || isNaN(this.x2)) {
						this.x1 = x;
						this.x2 = x;
					}
					if (x < this.x1) this.x1 = x;
					if (x > this.x2) this.x2 = x;
				}

				if (y != null) {
					if (isNaN(this.y1) || isNaN(this.y2)) {
						this.y1 = y;
						this.y2 = y;
					}
					if (y < this.y1) this.y1 = y;
					if (y > this.y2) this.y2 = y;
				}
			}
			this.addX = function(x) { this.addPoint(x, null); }
			this.addY = function(y) { this.addPoint(null, y); }

			this.addBoundingBox = function(bb) {
				this.addPoint(bb.x1, bb.y1);
				this.addPoint(bb.x2, bb.y2);
			}

			this.addQuadraticCurve = function(p0x, p0y, p1x, p1y, p2x, p2y) {
				var cp1x = p0x + 2/3 * (p1x - p0x); // CP1 = QP0 + 2/3 *(QP1-QP0)
				var cp1y = p0y + 2/3 * (p1y - p0y); // CP1 = QP0 + 2/3 *(QP1-QP0)
				var cp2x = cp1x + 1/3 * (p2x - p0x); // CP2 = CP1 + 1/3 *(QP2-QP0)
				var cp2y = cp1y + 1/3 * (p2y - p0y); // CP2 = CP1 + 1/3 *(QP2-QP0)
				this.addBezierCurve(p0x, p0y, cp1x, cp2x, cp1y,	cp2y, p2x, p2y);
			}

			this.addBezierCurve = function(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
				// from http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
				var p0 = [p0x, p0y], p1 = [p1x, p1y], p2 = [p2x, p2y], p3 = [p3x, p3y];
				this.addPoint(p0[0], p0[1]);
				this.addPoint(p3[0], p3[1]);

				for (i=0; i<=1; i++) {
					var f = function(t) {
						return Math.pow(1-t, 3) * p0[i]
						+ 3 * Math.pow(1-t, 2) * t * p1[i]
						+ 3 * (1-t) * Math.pow(t, 2) * p2[i]
						+ Math.pow(t, 3) * p3[i];
					}

					var b = 6 * p0[i] - 12 * p1[i] + 6 * p2[i];
					var a = -3 * p0[i] + 9 * p1[i] - 9 * p2[i] + 3 * p3[i];
					var c = 3 * p1[i] - 3 * p0[i];

					if (a == 0) {
						if (b == 0) continue;
						var t = -c / b;
						if (0 < t && t < 1) {
							if (i == 0) this.addX(f(t));
							if (i == 1) this.addY(f(t));
						}
						continue;
					}

					var b2ac = Math.pow(b, 2) - 4 * c * a;
					if (b2ac < 0) continue;
					var t1 = (-b + Math.sqrt(b2ac)) / (2 * a);
					if (0 < t1 && t1 < 1) {
						if (i == 0) this.addX(f(t1));
						if (i == 1) this.addY(f(t1));
					}
					var t2 = (-b - Math.sqrt(b2ac)) / (2 * a);
					if (0 < t2 && t2 < 1) {
						if (i == 0) this.addX(f(t2));
						if (i == 1) this.addY(f(t2));
					}
				}
			}

			this.isPointInBox = function(x, y) {
				return (this.x1 <= x && x <= this.x2 && this.y1 <= y && y <= this.y2);
			}

			this.addPoint(x1, y1);
			this.addPoint(x2, y2);
		}

		// transforms
		svg.Transform = function(v) {
			var that = this;
			this.Type = {}

			// translate
			this.Type.translate = function(s) {
				this.p = svg.CreatePoint(s);
				this.apply = function(ctx) {
					ctx.translate(this.p.x || 0.0, this.p.y || 0.0);
				}
				this.applyToPoint = function(p) {
					p.applyTransform([1, 0, 0, 1, this.p.x || 0.0, this.p.y || 0.0]);
				}
			}

			// rotate
			this.Type.rotate = function(s) {
				var a = svg.ToNumberArray(s);
				this.angle = new svg.Property('angle', a[0]);
				this.cx = a[1] || 0;
				this.cy = a[2] || 0;
				this.apply = function(ctx) {
					ctx.translate(this.cx, this.cy);
					ctx.rotate(this.angle.toRadians());
					ctx.translate(-this.cx, -this.cy);
				}
				this.applyToPoint = function(p) {
					var a = this.angle.toRadians();
					p.applyTransform([1, 0, 0, 1, this.p.x || 0.0, this.p.y || 0.0]);
					p.applyTransform([Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0]);
					p.applyTransform([1, 0, 0, 1, -this.p.x || 0.0, -this.p.y || 0.0]);
				}
			}

			this.Type.scale = function(s) {
				this.p = svg.CreatePoint(s);
				this.apply = function(ctx) {
					ctx.scale(this.p.x || 1.0, this.p.y || this.p.x || 1.0);
				}
				this.applyToPoint = function(p) {
					p.applyTransform([this.p.x || 0.0, 0, 0, this.p.y || 0.0, 0, 0]);
				}
			}

			this.Type.matrix = function(s) {
				this.m = svg.ToNumberArray(s);
				this.apply = function(ctx) {
					ctx.transform(this.m[0], this.m[1], this.m[2], this.m[3], this.m[4], this.m[5]);
				}
				this.applyToPoint = function(p) {
					p.applyTransform(this.m);
				}
			}

			this.Type.SkewBase = function(s) {
				this.base = that.Type.matrix;
				this.base(s);
				this.angle = new svg.Property('angle', s);
			}
			this.Type.SkewBase.prototype = new this.Type.matrix;

			this.Type.skewX = function(s) {
				this.base = that.Type.SkewBase;
				this.base(s);
				this.m = [1, 0, Math.tan(this.angle.toRadians()), 1, 0, 0];
			}
			this.Type.skewX.prototype = new this.Type.SkewBase;

			this.Type.skewY = function(s) {
				this.base = that.Type.SkewBase;
				this.base(s);
				this.m = [1, Math.tan(this.angle.toRadians()), 0, 1, 0, 0];
			}
			this.Type.skewY.prototype = new this.Type.SkewBase;

			this.transforms = [];

			this.apply = function(ctx) {
				for (var i=0; i<this.transforms.length; i++) {
					this.transforms[i].apply(ctx);
				}
			}

			this.applyToPoint = function(p) {
				for (var i=0; i<this.transforms.length; i++) {
					this.transforms[i].applyToPoint(p);
				}
			}

			var data = svg.trim(svg.compressSpaces(v)).split(/\s(?=[a-z])/);
			for (var i=0; i<data.length; i++) {
				var type = data[i].split('(')[0];
				var s = data[i].split('(')[1].replace(')','');
				var transform = new this.Type[type](s);
				this.transforms.push(transform);
			}
		}

		// aspect ratio
		svg.AspectRatio = function(ctx, aspectRatio, width, desiredWidth, height, desiredHeight, minX, minY, refX, refY) {
			// aspect ratio - http://www.w3.org/TR/SVG/coords.html#PreserveAspectRatioAttribute
			aspectRatio = svg.compressSpaces(aspectRatio);
			aspectRatio = aspectRatio.replace(/^defer\s/,''); // ignore defer
			var align = aspectRatio.split(' ')[0] || 'xMidYMid';
			var meetOrSlice = aspectRatio.split(' ')[1] || 'meet';

			// calculate scale
			var scaleX = width / desiredWidth;
			var scaleY = height / desiredHeight;
			var scaleMin = Math.min(scaleX, scaleY);
			var scaleMax = Math.max(scaleX, scaleY);
			if (meetOrSlice == 'meet') { desiredWidth *= scaleMin; desiredHeight *= scaleMin; }
			if (meetOrSlice == 'slice') { desiredWidth *= scaleMax; desiredHeight *= scaleMax; }

			refX = new svg.Property('refX', refX);
			refY = new svg.Property('refY', refY);
			if (refX.hasValue() && refY.hasValue()) {
				ctx.translate(-scaleMin * refX.toPixels('x'), -scaleMin * refY.toPixels('y'));
			}
			else {
				// align
				if (align.match(/^xMid/) && ((meetOrSlice == 'meet' && scaleMin == scaleY) || (meetOrSlice == 'slice' && scaleMax == scaleY))) ctx.translate(width / 2.0 - desiredWidth / 2.0, 0);
				if (align.match(/YMid$/) && ((meetOrSlice == 'meet' && scaleMin == scaleX) || (meetOrSlice == 'slice' && scaleMax == scaleX))) ctx.translate(0, height / 2.0 - desiredHeight / 2.0);
				if (align.match(/^xMax/) && ((meetOrSlice == 'meet' && scaleMin == scaleY) || (meetOrSlice == 'slice' && scaleMax == scaleY))) ctx.translate(width - desiredWidth, 0);
				if (align.match(/YMax$/) && ((meetOrSlice == 'meet' && scaleMin == scaleX) || (meetOrSlice == 'slice' && scaleMax == scaleX))) ctx.translate(0, height - desiredHeight);
			}

			// scale
			if (align == 'none') ctx.scale(scaleX, scaleY);
			else if (meetOrSlice == 'meet') ctx.scale(scaleMin, scaleMin);
			else if (meetOrSlice == 'slice') ctx.scale(scaleMax, scaleMax);

			// translate
			ctx.translate(minX == null ? 0 : -minX, minY == null ? 0 : -minY);
		}

		// elements
		svg.Element = {}

		svg.EmptyProperty = new svg.Property('EMPTY', '');

		svg.Element.ElementBase = function(node) {
			this.attributes = {};
			this.styles = {};
			this.children = [];

			// get or create attribute
			this.attribute = function(name, createIfNotExists) {
				var a = this.attributes[name];
				if (a != null) return a;

				if (createIfNotExists == true) { a = new svg.Property(name, ''); this.attributes[name] = a; }
				return a || svg.EmptyProperty;
			}

			// get or create style, crawls up node tree
			this.style = function(name, createIfNotExists) {
				var s = this.styles[name];
				if (s != null) return s;

				var a = this.attribute(name);
				if (a != null && a.hasValue()) {
					this.styles[name] = a; // move up to me to cache
					return a;
				}

				var p = this.parent;
				if (p != null) {
					var ps = p.style(name);
					if (ps != null && ps.hasValue()) {
						return ps;
					}
				}

				if (createIfNotExists == true) { s = new svg.Property(name, ''); this.styles[name] = s; }
				return s || svg.EmptyProperty;
			}

			// base render
			this.render = function(ctx) {
				// don't render display=none
				if (this.style('display').value == 'none') return;

				// don't render visibility=hidden
				if (this.attribute('visibility').value == 'hidden') return;

				ctx.save();
					this.setContext(ctx);
						// mask
						if (this.attribute('mask').hasValue()) {
							var mask = this.attribute('mask').getDefinition();
							if (mask != null) mask.apply(ctx, this);
						}
						else if (this.style('filter').hasValue()) {
							var filter = this.style('filter').getDefinition();
							if (filter != null) filter.apply(ctx, this);
						}
						else this.renderChildren(ctx);
					this.clearContext(ctx);
				ctx.restore();
			}

			// base set context
			this.setContext = function(ctx) {
				// OVERRIDE ME!
			}

			// base clear context
			this.clearContext = function(ctx) {
				// OVERRIDE ME!
			}

			// base render children
			this.renderChildren = function(ctx) {
				for (var i=0; i<this.children.length; i++) {
					this.children[i].render(ctx);
				}
			}

			this.addChild = function(childNode, create) {
				var child = childNode;
				if (create) child = svg.CreateElement(childNode);
				child.parent = this;
				this.children.push(child);
			}

			if (node != null && node.nodeType == 1) { //ELEMENT_NODE
				// add children
				for (var i=0; i<node.childNodes.length; i++) {
					var childNode = node.childNodes[i];
					if (childNode.nodeType == 1) this.addChild(childNode, true); //ELEMENT_NODE
				}

				// add attributes
				for (var i=0; i<node.attributes.length; i++) {
					var attribute = node.attributes[i];
					this.attributes[attribute.nodeName] = new svg.Property(attribute.nodeName, attribute.nodeValue);
				}

				// add tag styles
				var styles = svg.Styles[node.nodeName];
				if (styles != null) {
					for (var name in styles) {
						this.styles[name] = styles[name];
					}
				}

				// add class styles
				if (this.attribute('class').hasValue()) {
					var classes = svg.compressSpaces(this.attribute('class').value).split(' ');
					for (var j=0; j<classes.length; j++) {
						styles = svg.Styles['.'+classes[j]];
						if (styles != null) {
							for (var name in styles) {
								this.styles[name] = styles[name];
							}
						}
						styles = svg.Styles[node.nodeName+'.'+classes[j]];
						if (styles != null) {
							for (var name in styles) {
								this.styles[name] = styles[name];
							}
						}
					}
				}

				// add id styles
				if (this.attribute('id').hasValue()) {
					var styles = svg.Styles['#' + this.attribute('id').value];
					if (styles != null) {
						for (var name in styles) {
							this.styles[name] = styles[name];
						}
					}
				}

				// add inline styles
				if (this.attribute('style').hasValue()) {
					var styles = this.attribute('style').value.split(';');
					for (var i=0; i<styles.length; i++) {
						if (svg.trim(styles[i]) != '') {
							var style = styles[i].split(':');
							var name = svg.trim(style[0]);
							var value = svg.trim(style[1]);
							this.styles[name] = new svg.Property(name, value);
						}
					}
				}

				// add id
				if (this.attribute('id').hasValue()) {
					if (svg.Definitions[this.attribute('id').value] == null) {
						svg.Definitions[this.attribute('id').value] = this;
					}
				}
			}
		}

		svg.Element.RenderedElementBase = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.setContext = function(ctx) {
				// fill
				if (this.style('fill').isUrlDefinition()) {
					var fs = this.style('fill').getFillStyleDefinition(this);
					if (fs != null) ctx.fillStyle = fs;
				}
				else if (this.style('fill').hasValue()) {
					var fillStyle = this.style('fill');
					if (fillStyle.value == 'currentColor') fillStyle.value = this.style('color').value;
					ctx.fillStyle = (fillStyle.value == 'none' ? 'rgba(0,0,0,0)' : fillStyle.value);
				}
				if (this.style('fill-opacity').hasValue()) {
					var fillStyle = new svg.Property('fill', ctx.fillStyle);
					fillStyle = fillStyle.addOpacity(this.style('fill-opacity').value);
					ctx.fillStyle = fillStyle.value;
				}

				// stroke
				if (this.style('stroke').isUrlDefinition()) {
					var fs = this.style('stroke').getFillStyleDefinition(this);
					if (fs != null) ctx.strokeStyle = fs;
				}
				else if (this.style('stroke').hasValue()) {
					var strokeStyle = this.style('stroke');
					if (strokeStyle.value == 'currentColor') strokeStyle.value = this.style('color').value;
					ctx.strokeStyle = (strokeStyle.value == 'none' ? 'rgba(0,0,0,0)' : strokeStyle.value);
				}
				if (this.style('stroke-opacity').hasValue()) {
					var strokeStyle = new svg.Property('stroke', ctx.strokeStyle);
					strokeStyle = strokeStyle.addOpacity(this.style('stroke-opacity').value);
					ctx.strokeStyle = strokeStyle.value;
				}
				if (this.style('stroke-width').hasValue()) ctx.lineWidth = this.style('stroke-width').toPixels();
				if (this.style('stroke-linecap').hasValue()) ctx.lineCap = this.style('stroke-linecap').value;
				if (this.style('stroke-linejoin').hasValue()) ctx.lineJoin = this.style('stroke-linejoin').value;
				if (this.style('stroke-miterlimit').hasValue()) ctx.miterLimit = this.style('stroke-miterlimit').value;

				// font
				if (typeof(ctx.font) != 'undefined') {
					ctx.font = svg.Font.CreateFont(
						this.style('font-style').value,
						this.style('font-variant').value,
						this.style('font-weight').value,
						this.style('font-size').hasValue() ? this.style('font-size').toPixels() + 'px' : '',
						this.style('font-family').value).toString();
				}

				// transform
				if (this.attribute('transform').hasValue()) {
					var transform = new svg.Transform(this.attribute('transform').value);
					transform.apply(ctx);
				}

				// clip
				if (this.attribute('clip-path').hasValue()) {
					var clip = this.attribute('clip-path').getDefinition();
					if (clip != null) clip.apply(ctx);
				}

				// opacity
				if (this.style('opacity').hasValue()) {
					ctx.globalAlpha = this.style('opacity').numValue();
				}
			}
		}
		svg.Element.RenderedElementBase.prototype = new svg.Element.ElementBase;

		svg.Element.PathElementBase = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			this.path = function(ctx) {
				if (ctx != null) ctx.beginPath();
				return new svg.BoundingBox();
			}

			this.renderChildren = function(ctx) {
				this.path(ctx);
				svg.Mouse.checkPath(this, ctx);
				if (ctx.fillStyle != '') ctx.fill();
				if (ctx.strokeStyle != '') ctx.stroke();

				var markers = this.getMarkers();
				if (markers != null) {
					if (this.style('marker-start').isUrlDefinition()) {
						var marker = this.style('marker-start').getDefinition();
						marker.render(ctx, markers[0][0], markers[0][1]);
					}
					if (this.style('marker-mid').isUrlDefinition()) {
						var marker = this.style('marker-mid').getDefinition();
						for (var i=1;i<markers.length-1;i++) {
							marker.render(ctx, markers[i][0], markers[i][1]);
						}
					}
					if (this.style('marker-end').isUrlDefinition()) {
						var marker = this.style('marker-end').getDefinition();
						marker.render(ctx, markers[markers.length-1][0], markers[markers.length-1][1]);
					}
				}
			}

			this.getBoundingBox = function() {
				return this.path();
			}

			this.getMarkers = function() {
				return null;
			}
		}
		svg.Element.PathElementBase.prototype = new svg.Element.RenderedElementBase;

		// svg element
		svg.Element.svg = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			this.baseClearContext = this.clearContext;
			this.clearContext = function(ctx) {
				this.baseClearContext(ctx);
				svg.ViewPort.RemoveCurrent();
			}

			this.baseSetContext = this.setContext;
			this.setContext = function(ctx) {
				// initial values
				ctx.strokeStyle = 'rgba(0,0,0,0)';
				ctx.lineCap = 'butt';
				ctx.lineJoin = 'miter';
				ctx.miterLimit = 4;

				this.baseSetContext(ctx);

				// create new view port
				if (!this.attribute('x').hasValue()) this.attribute('x', true).value = 0;
				if (!this.attribute('y').hasValue()) this.attribute('y', true).value = 0;
				ctx.translate(this.attribute('x').toPixels('x'), this.attribute('y').toPixels('y'));

				var width = svg.ViewPort.width();
				var height = svg.ViewPort.height();

				if (!this.attribute('width').hasValue()) this.attribute('width', true).value = '100%';
				if (!this.attribute('height').hasValue()) this.attribute('height', true).value = '100%';
				if (typeof(this.root) == 'undefined') {
					width = this.attribute('width').toPixels('x');
					height = this.attribute('height').toPixels('y');

					var x = 0;
					var y = 0;
					if (this.attribute('refX').hasValue() && this.attribute('refY').hasValue()) {
						x = -this.attribute('refX').toPixels('x');
						y = -this.attribute('refY').toPixels('y');
					}

					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.lineTo(width, y);
					ctx.lineTo(width, height);
					ctx.lineTo(x, height);
					ctx.closePath();
					ctx.clip();
				}
				svg.ViewPort.SetCurrent(width, height);

				// viewbox
				if (this.attribute('viewBox').hasValue()) {
					var viewBox = svg.ToNumberArray(this.attribute('viewBox').value);
					var minX = viewBox[0];
					var minY = viewBox[1];
					width = viewBox[2];
					height = viewBox[3];

					svg.AspectRatio(ctx,
									this.attribute('preserveAspectRatio').value,
									svg.ViewPort.width(),
									width,
									svg.ViewPort.height(),
									height,
									minX,
									minY,
									this.attribute('refX').value,
									this.attribute('refY').value);

					svg.ViewPort.RemoveCurrent();
					svg.ViewPort.SetCurrent(viewBox[2], viewBox[3]);
				}
			}
		}
		svg.Element.svg.prototype = new svg.Element.RenderedElementBase;

		// rect element
		svg.Element.rect = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);

			this.path = function(ctx) {
				var x = this.attribute('x').toPixels('x');
				var y = this.attribute('y').toPixels('y');
				var width = this.attribute('width').toPixels('x');
				var height = this.attribute('height').toPixels('y');
				var rx = this.attribute('rx').toPixels('x');
				var ry = this.attribute('ry').toPixels('y');
				if (this.attribute('rx').hasValue() && !this.attribute('ry').hasValue()) ry = rx;
				if (this.attribute('ry').hasValue() && !this.attribute('rx').hasValue()) rx = ry;

				if (ctx != null) {
					ctx.beginPath();
					ctx.moveTo(x + rx, y);
					ctx.lineTo(x + width - rx, y);
					ctx.quadraticCurveTo(x + width, y, x + width, y + ry)
					ctx.lineTo(x + width, y + height - ry);
					ctx.quadraticCurveTo(x + width, y + height, x + width - rx, y + height)
					ctx.lineTo(x + rx, y + height);
					ctx.quadraticCurveTo(x, y + height, x, y + height - ry)
					ctx.lineTo(x, y + ry);
					ctx.quadraticCurveTo(x, y, x + rx, y)
					ctx.closePath();
				}

				return new svg.BoundingBox(x, y, x + width, y + height);
			}
		}
		svg.Element.rect.prototype = new svg.Element.PathElementBase;

		// circle element
		svg.Element.circle = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);

			this.path = function(ctx) {
				var cx = this.attribute('cx').toPixels('x');
				var cy = this.attribute('cy').toPixels('y');
				var r = this.attribute('r').toPixels();

				if (ctx != null) {
					ctx.beginPath();
					ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
					ctx.closePath();
				}

				return new svg.BoundingBox(cx - r, cy - r, cx + r, cy + r);
			}
		}
		svg.Element.circle.prototype = new svg.Element.PathElementBase;

		// ellipse element
		svg.Element.ellipse = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);

			this.path = function(ctx) {
				var KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);
				var rx = this.attribute('rx').toPixels('x');
				var ry = this.attribute('ry').toPixels('y');
				var cx = this.attribute('cx').toPixels('x');
				var cy = this.attribute('cy').toPixels('y');

				if (ctx != null) {
					ctx.beginPath();
					ctx.moveTo(cx, cy - ry);
					ctx.bezierCurveTo(cx + (KAPPA * rx), cy - ry,  cx + rx, cy - (KAPPA * ry), cx + rx, cy);
					ctx.bezierCurveTo(cx + rx, cy + (KAPPA * ry), cx + (KAPPA * rx), cy + ry, cx, cy + ry);
					ctx.bezierCurveTo(cx - (KAPPA * rx), cy + ry, cx - rx, cy + (KAPPA * ry), cx - rx, cy);
					ctx.bezierCurveTo(cx - rx, cy - (KAPPA * ry), cx - (KAPPA * rx), cy - ry, cx, cy - ry);
					ctx.closePath();
				}

				return new svg.BoundingBox(cx - rx, cy - ry, cx + rx, cy + ry);
			}
		}
		svg.Element.ellipse.prototype = new svg.Element.PathElementBase;

		// line element
		svg.Element.line = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);

			this.getPoints = function() {
				return [
					new svg.Point(this.attribute('x1').toPixels('x'), this.attribute('y1').toPixels('y')),
					new svg.Point(this.attribute('x2').toPixels('x'), this.attribute('y2').toPixels('y'))];
			}

			this.path = function(ctx) {
				var points = this.getPoints();

				if (ctx != null) {
					ctx.beginPath();
					ctx.moveTo(points[0].x, points[0].y);
					ctx.lineTo(points[1].x, points[1].y);
				}

				return new svg.BoundingBox(points[0].x, points[0].y, points[1].x, points[1].y);
			}

			this.getMarkers = function() {
				var points = this.getPoints();
				var a = points[0].angleTo(points[1]);
				return [[points[0], a], [points[1], a]];
			}
		}
		svg.Element.line.prototype = new svg.Element.PathElementBase;

		// polyline element
		svg.Element.polyline = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);

			this.points = svg.CreatePath(this.attribute('points').value);
			this.path = function(ctx) {
				var bb = new svg.BoundingBox(this.points[0].x, this.points[0].y);
				if (ctx != null) {
					ctx.beginPath();
					ctx.moveTo(this.points[0].x, this.points[0].y);
				}
				for (var i=1; i<this.points.length; i++) {
					bb.addPoint(this.points[i].x, this.points[i].y);
					if (ctx != null) ctx.lineTo(this.points[i].x, this.points[i].y);
				}
				return bb;
			}

			this.getMarkers = function() {
				var markers = [];
				for (var i=0; i<this.points.length - 1; i++) {
					markers.push([this.points[i], this.points[i].angleTo(this.points[i+1])]);
				}
				markers.push([this.points[this.points.length-1], markers[markers.length-1][1]]);
				return markers;
			}
		}
		svg.Element.polyline.prototype = new svg.Element.PathElementBase;

		// polygon element
		svg.Element.polygon = function(node) {
			this.base = svg.Element.polyline;
			this.base(node);

			this.basePath = this.path;
			this.path = function(ctx) {
				var bb = this.basePath(ctx);
				if (ctx != null) {
					ctx.lineTo(this.points[0].x, this.points[0].y);
					ctx.closePath();
				}
				return bb;
			}
		}
		svg.Element.polygon.prototype = new svg.Element.polyline;

		// path element
		svg.Element.path = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);

			var d = this.attribute('d').value;
			// TODO: convert to real lexer based on http://www.w3.org/TR/SVG11/paths.html#PathDataBNF
			d = d.replace(/,/gm,' '); // get rid of all commas
			d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm,'$1 $2'); // separate commands from commands
			d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm,'$1 $2'); // separate commands from commands
			d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([^\s])/gm,'$1 $2'); // separate commands from points
			d = d.replace(/([^\s])([MmZzLlHhVvCcSsQqTtAa])/gm,'$1 $2'); // separate commands from points
			d = d.replace(/([0-9])([+\-])/gm,'$1 $2'); // separate digits when no comma
			d = d.replace(/(\.[0-9]*)(\.)/gm,'$1 $2'); // separate digits when no comma
			d = d.replace(/([Aa](\s+[0-9]+){3})\s+([01])\s*([01])/gm,'$1 $3 $4 '); // shorthand elliptical arc path syntax
			d = svg.compressSpaces(d); // compress multiple spaces
			d = svg.trim(d);
			this.PathParser = new (function(d) {
				this.tokens = d.split(' ');

				this.reset = function() {
					this.i = -1;
					this.command = '';
					this.previousCommand = '';
					this.start = new svg.Point(0, 0);
					this.control = new svg.Point(0, 0);
					this.current = new svg.Point(0, 0);
					this.points = [];
					this.angles = [];
				}

				this.isEnd = function() {
					return this.i >= this.tokens.length - 1;
				}

				this.isCommandOrEnd = function() {
					if (this.isEnd()) return true;
					return this.tokens[this.i + 1].match(/^[A-Za-z]$/) != null;
				}

				this.isRelativeCommand = function() {
					switch(this.command)
					{
						case 'm':
						case 'l':
						case 'h':
						case 'v':
						case 'c':
						case 's':
						case 'q':
						case 't':
						case 'a':
						case 'z':
							return true;
							break;
					}
					return false;
				}

				this.getToken = function() {
					this.i++;
					return this.tokens[this.i];
				}

				this.getScalar = function() {
					return parseFloat(this.getToken());
				}

				this.nextCommand = function() {
					this.previousCommand = this.command;
					this.command = this.getToken();
				}

				this.getPoint = function() {
					var p = new svg.Point(this.getScalar(), this.getScalar());
					return this.makeAbsolute(p);
				}

				this.getAsControlPoint = function() {
					var p = this.getPoint();
					this.control = p;
					return p;
				}

				this.getAsCurrentPoint = function() {
					var p = this.getPoint();
					this.current = p;
					return p;
				}

				this.getReflectedControlPoint = function() {
					if (this.previousCommand.toLowerCase() != 'c' && this.previousCommand.toLowerCase() != 's') {
						return this.current;
					}

					// reflect point
					var p = new svg.Point(2 * this.current.x - this.control.x, 2 * this.current.y - this.control.y);
					return p;
				}

				this.makeAbsolute = function(p) {
					if (this.isRelativeCommand()) {
						p.x += this.current.x;
						p.y += this.current.y;
					}
					return p;
				}

				this.addMarker = function(p, from, priorTo) {
					// if the last angle isn't filled in because we didn't have this point yet ...
					if (priorTo != null && this.angles.length > 0 && this.angles[this.angles.length-1] == null) {
						this.angles[this.angles.length-1] = this.points[this.points.length-1].angleTo(priorTo);
					}
					this.addMarkerAngle(p, from == null ? null : from.angleTo(p));
				}

				this.addMarkerAngle = function(p, a) {
					this.points.push(p);
					this.angles.push(a);
				}

				this.getMarkerPoints = function() { return this.points; }
				this.getMarkerAngles = function() {
					for (var i=0; i<this.angles.length; i++) {
						if (this.angles[i] == null) {
							for (var j=i+1; j<this.angles.length; j++) {
								if (this.angles[j] != null) {
									this.angles[i] = this.angles[j];
									break;
								}
							}
						}
					}
					return this.angles;
				}
			})(d);

			this.path = function(ctx) {
				var pp = this.PathParser;
				pp.reset();

				var bb = new svg.BoundingBox();
				if (ctx != null) ctx.beginPath();
				while (!pp.isEnd()) {
					pp.nextCommand();
					switch (pp.command) {
					case 'M':
					case 'm':
						var p = pp.getAsCurrentPoint();
						pp.addMarker(p);
						bb.addPoint(p.x, p.y);
						if (ctx != null) ctx.moveTo(p.x, p.y);
						pp.start = pp.current;
						while (!pp.isCommandOrEnd()) {
							var p = pp.getAsCurrentPoint();
							pp.addMarker(p, pp.start);
							bb.addPoint(p.x, p.y);
							if (ctx != null) ctx.lineTo(p.x, p.y);
						}
						break;
					case 'L':
					case 'l':
						while (!pp.isCommandOrEnd()) {
							var c = pp.current;
							var p = pp.getAsCurrentPoint();
							pp.addMarker(p, c);
							bb.addPoint(p.x, p.y);
							if (ctx != null) ctx.lineTo(p.x, p.y);
						}
						break;
					case 'H':
					case 'h':
						while (!pp.isCommandOrEnd()) {
							var newP = new svg.Point((pp.isRelativeCommand() ? pp.current.x : 0) + pp.getScalar(), pp.current.y);
							pp.addMarker(newP, pp.current);
							pp.current = newP;
							bb.addPoint(pp.current.x, pp.current.y);
							if (ctx != null) ctx.lineTo(pp.current.x, pp.current.y);
						}
						break;
					case 'V':
					case 'v':
						while (!pp.isCommandOrEnd()) {
							var newP = new svg.Point(pp.current.x, (pp.isRelativeCommand() ? pp.current.y : 0) + pp.getScalar());
							pp.addMarker(newP, pp.current);
							pp.current = newP;
							bb.addPoint(pp.current.x, pp.current.y);
							if (ctx != null) ctx.lineTo(pp.current.x, pp.current.y);
						}
						break;
					case 'C':
					case 'c':
						while (!pp.isCommandOrEnd()) {
							var curr = pp.current;
							var p1 = pp.getPoint();
							var cntrl = pp.getAsControlPoint();
							var cp = pp.getAsCurrentPoint();
							pp.addMarker(cp, cntrl, p1);
							bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
							if (ctx != null) ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
						}
						break;
					case 'S':
					case 's':
						while (!pp.isCommandOrEnd()) {
							var curr = pp.current;
							var p1 = pp.getReflectedControlPoint();
							var cntrl = pp.getAsControlPoint();
							var cp = pp.getAsCurrentPoint();
							pp.addMarker(cp, cntrl, p1);
							bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
							if (ctx != null) ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
						}
						break;
					case 'Q':
					case 'q':
						while (!pp.isCommandOrEnd()) {
							var curr = pp.current;
							var cntrl = pp.getAsControlPoint();
							var cp = pp.getAsCurrentPoint();
							pp.addMarker(cp, cntrl, cntrl);
							bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
							if (ctx != null) ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y);
						}
						break;
					case 'T':
					case 't':
						while (!pp.isCommandOrEnd()) {
							var curr = pp.current;
							var cntrl = pp.getReflectedControlPoint();
							pp.control = cntrl;
							var cp = pp.getAsCurrentPoint();
							pp.addMarker(cp, cntrl, cntrl);
							bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
							if (ctx != null) ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y);
						}
						break;
					case 'A':
					case 'a':
						while (!pp.isCommandOrEnd()) {
						    var curr = pp.current;
							var rx = pp.getScalar();
							var ry = pp.getScalar();
							var xAxisRotation = pp.getScalar() * (Math.PI / 180.0);
							var largeArcFlag = pp.getScalar();
							var sweepFlag = pp.getScalar();
							var cp = pp.getAsCurrentPoint();

							// Conversion from endpoint to center parameterization
							// http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
							// x1', y1'
							var currp = new svg.Point(
								Math.cos(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.sin(xAxisRotation) * (curr.y - cp.y) / 2.0,
								-Math.sin(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.cos(xAxisRotation) * (curr.y - cp.y) / 2.0
							);
							// adjust radii
							var l = Math.pow(currp.x,2)/Math.pow(rx,2)+Math.pow(currp.y,2)/Math.pow(ry,2);
							if (l > 1) {
								rx *= Math.sqrt(l);
								ry *= Math.sqrt(l);
							}
							// cx', cy'
							var s = (largeArcFlag == sweepFlag ? -1 : 1) * Math.sqrt(
								((Math.pow(rx,2)*Math.pow(ry,2))-(Math.pow(rx,2)*Math.pow(currp.y,2))-(Math.pow(ry,2)*Math.pow(currp.x,2))) /
								(Math.pow(rx,2)*Math.pow(currp.y,2)+Math.pow(ry,2)*Math.pow(currp.x,2))
							);
							if (isNaN(s)) s = 0;
							var cpp = new svg.Point(s * rx * currp.y / ry, s * -ry * currp.x / rx);
							// cx, cy
							var centp = new svg.Point(
								(curr.x + cp.x) / 2.0 + Math.cos(xAxisRotation) * cpp.x - Math.sin(xAxisRotation) * cpp.y,
								(curr.y + cp.y) / 2.0 + Math.sin(xAxisRotation) * cpp.x + Math.cos(xAxisRotation) * cpp.y
							);
							// vector magnitude
							var m = function(v) { return Math.sqrt(Math.pow(v[0],2) + Math.pow(v[1],2)); }
							// ratio between two vectors
							var r = function(u, v) { return (u[0]*v[0]+u[1]*v[1]) / (m(u)*m(v)) }
							// angle between two vectors
							var a = function(u, v) { return (u[0]*v[1] < u[1]*v[0] ? -1 : 1) * Math.acos(r(u,v)); }
							// initial angle
							var a1 = a([1,0], [(currp.x-cpp.x)/rx,(currp.y-cpp.y)/ry]);
							// angle delta
							var u = [(currp.x-cpp.x)/rx,(currp.y-cpp.y)/ry];
							var v = [(-currp.x-cpp.x)/rx,(-currp.y-cpp.y)/ry];
							var ad = a(u, v);
							if (r(u,v) <= -1) ad = Math.PI;
							if (r(u,v) >= 1) ad = 0;

							if (sweepFlag == 0 && ad > 0) ad = ad - 2 * Math.PI;
							if (sweepFlag == 1 && ad < 0) ad = ad + 2 * Math.PI;

							// for markers
							var halfWay = new svg.Point(
								centp.x + rx * Math.cos((a1 + (a1 + ad)) / 2),
								centp.y + ry * Math.sin((a1 + (a1 + ad)) / 2)
							);
							pp.addMarkerAngle(halfWay, (a1 + (a1 + ad)) / 2 + (sweepFlag == 0 ? -1 : 1) * Math.PI / 2);
							pp.addMarkerAngle(cp, (a1 + ad) + (sweepFlag == 0 ? -1 : 1) * Math.PI / 2);

							bb.addPoint(cp.x, cp.y); // TODO: this is too naive, make it better
							if (ctx != null) {
								var r = rx > ry ? rx : ry;
								var sx = rx > ry ? 1 : rx / ry;
								var sy = rx > ry ? ry / rx : 1;

								ctx.translate(centp.x, centp.y);
								ctx.rotate(xAxisRotation);
								ctx.scale(sx, sy);
								ctx.arc(0, 0, r, a1, a1 + ad, 1 - sweepFlag);
								ctx.scale(1/sx, 1/sy);
								ctx.rotate(-xAxisRotation);
								ctx.translate(-centp.x, -centp.y);
							}
						}
						break;
					case 'Z':
					case 'z':
						if (ctx != null) ctx.closePath();
						pp.current = pp.start;
					}
				}

				return bb;
			}

			this.getMarkers = function() {
				var points = this.PathParser.getMarkerPoints();
				var angles = this.PathParser.getMarkerAngles();

				var markers = [];
				for (var i=0; i<points.length; i++) {
					markers.push([points[i], angles[i]]);
				}
				return markers;
			}
		}
		svg.Element.path.prototype = new svg.Element.PathElementBase;

		// pattern element
		svg.Element.pattern = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.createPattern = function(ctx, element) {
				// render me using a temporary svg element
				var tempSvg = new svg.Element.svg();
				tempSvg.attributes['viewBox'] = new svg.Property('viewBox', this.attribute('viewBox').value);
				tempSvg.attributes['x'] = new svg.Property('x', this.attribute('x').value);
				tempSvg.attributes['y'] = new svg.Property('y', this.attribute('y').value);
				tempSvg.attributes['width'] = new svg.Property('width', this.attribute('width').value);
				tempSvg.attributes['height'] = new svg.Property('height', this.attribute('height').value);
				tempSvg.children = this.children;

				var c = document.createElement('canvas');
				document.body.appendChild(c);
				c.width = this.attribute('width').toPixels('x') + this.attribute('x').toPixels('x');
				c.height = this.attribute('height').toPixels('y')  + this.attribute('y').toPixels('y');
				tempSvg.render(c.getContext('2d'));
				return ctx.createPattern(c, 'repeat');
			}
		}
		svg.Element.pattern.prototype = new svg.Element.ElementBase;

		// marker element
		svg.Element.marker = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.baseRender = this.render;
			this.render = function(ctx, point, angle) {
				ctx.translate(point.x, point.y);
				if (this.attribute('orient').valueOrDefault('auto') == 'auto') ctx.rotate(angle);
				if (this.attribute('markerUnits').valueOrDefault('strokeWidth') == 'strokeWidth') ctx.scale(ctx.lineWidth, ctx.lineWidth);
				ctx.save();

				// render me using a temporary svg element
				var tempSvg = new svg.Element.svg();
				tempSvg.attributes['viewBox'] = new svg.Property('viewBox', this.attribute('viewBox').value);
				tempSvg.attributes['refX'] = new svg.Property('refX', this.attribute('refX').value);
				tempSvg.attributes['refY'] = new svg.Property('refY', this.attribute('refY').value);
				tempSvg.attributes['width'] = new svg.Property('width', this.attribute('markerWidth').value);
				tempSvg.attributes['height'] = new svg.Property('height', this.attribute('markerHeight').value);
				tempSvg.attributes['fill'] = new svg.Property('fill', this.attribute('fill').valueOrDefault('black'));
				tempSvg.attributes['stroke'] = new svg.Property('stroke', this.attribute('stroke').valueOrDefault('none'));
				tempSvg.children = this.children;
				tempSvg.render(ctx);

				ctx.restore();
				if (this.attribute('markerUnits').valueOrDefault('strokeWidth') == 'strokeWidth') ctx.scale(1/ctx.lineWidth, 1/ctx.lineWidth);
				if (this.attribute('orient').valueOrDefault('auto') == 'auto') ctx.rotate(-angle);
				ctx.translate(-point.x, -point.y);
			}
		}
		svg.Element.marker.prototype = new svg.Element.ElementBase;

		// definitions element
		svg.Element.defs = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.render = function(ctx) {
				// NOOP
			}
		}
		svg.Element.defs.prototype = new svg.Element.ElementBase;

		// base for gradients
		svg.Element.GradientBase = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.gradientUnits = this.attribute('gradientUnits').valueOrDefault('objectBoundingBox');

			this.stops = [];
			for (var i=0; i<this.children.length; i++) {
				var child = this.children[i];
				this.stops.push(child);
			}

			this.getGradient = function() {
				// OVERRIDE ME!
			}

			this.createGradient = function(ctx, element) {
				var stopsContainer = this;
				if (this.attribute('xlink:href').hasValue()) {
					stopsContainer = this.attribute('xlink:href').getDefinition();
				}

				var g = this.getGradient(ctx, element);
				if (g == null) return stopsContainer.stops[stopsContainer.stops.length - 1].color;
				for (var i=0; i<stopsContainer.stops.length; i++) {
					g.addColorStop(stopsContainer.stops[i].offset, stopsContainer.stops[i].color);
				}

				if (this.attribute('gradientTransform').hasValue()) {
					// render as transformed pattern on temporary canvas
					var rootView = svg.ViewPort.viewPorts[0];

					var rect = new svg.Element.rect();
					rect.attributes['x'] = new svg.Property('x', -svg.MAX_VIRTUAL_PIXELS/3.0);
					rect.attributes['y'] = new svg.Property('y', -svg.MAX_VIRTUAL_PIXELS/3.0);
					rect.attributes['width'] = new svg.Property('width', svg.MAX_VIRTUAL_PIXELS);
					rect.attributes['height'] = new svg.Property('height', svg.MAX_VIRTUAL_PIXELS);

					var group = new svg.Element.g();
					group.attributes['transform'] = new svg.Property('transform', this.attribute('gradientTransform').value);
					group.children = [ rect ];

					var tempSvg = new svg.Element.svg();
					tempSvg.attributes['x'] = new svg.Property('x', 0);
					tempSvg.attributes['y'] = new svg.Property('y', 0);
					tempSvg.attributes['width'] = new svg.Property('width', rootView.width);
					tempSvg.attributes['height'] = new svg.Property('height', rootView.height);
					tempSvg.children = [ group ];

					var c = document.createElement('canvas');
					c.width = rootView.width;
					c.height = rootView.height;
					var tempCtx = c.getContext('2d');
					tempCtx.fillStyle = g;
					tempSvg.render(tempCtx);
					return tempCtx.createPattern(c, 'no-repeat');
				}

				return g;
			}
		}
		svg.Element.GradientBase.prototype = new svg.Element.ElementBase;

		// linear gradient element
		svg.Element.linearGradient = function(node) {
			this.base = svg.Element.GradientBase;
			this.base(node);

			this.getGradient = function(ctx, element) {
				var bb = element.getBoundingBox();

				var x1 = (this.gradientUnits == 'objectBoundingBox'
					? bb.x() + bb.width() * this.attribute('x1').numValue()
					: this.attribute('x1').toPixels('x'));
				var y1 = (this.gradientUnits == 'objectBoundingBox'
					? bb.y() + bb.height() * this.attribute('y1').numValue()
					: this.attribute('y1').toPixels('y'));
				var x2 = (this.gradientUnits == 'objectBoundingBox'
					? bb.x() + bb.width() * this.attribute('x2').numValue()
					: this.attribute('x2').toPixels('x'));
				var y2 = (this.gradientUnits == 'objectBoundingBox'
					? bb.y() + bb.height() * this.attribute('y2').numValue()
					: this.attribute('y2').toPixels('y'));

				if (x1 == x2 && y1 == y2) return null;
				return ctx.createLinearGradient(x1, y1, x2, y2);
			}
		}
		svg.Element.linearGradient.prototype = new svg.Element.GradientBase;

		// radial gradient element
		svg.Element.radialGradient = function(node) {
			this.base = svg.Element.GradientBase;
			this.base(node);

			this.getGradient = function(ctx, element) {
				var bb = element.getBoundingBox();

				if (!this.attribute('cx').hasValue()) this.attribute('cx', true).value = '50%';
				if (!this.attribute('cy').hasValue()) this.attribute('cy', true).value = '50%';
				if (!this.attribute('r').hasValue()) this.attribute('r', true).value = '50%';

				var cx = (this.gradientUnits == 'objectBoundingBox'
					? bb.x() + bb.width() * this.attribute('cx').numValue()
					: this.attribute('cx').toPixels('x'));
				var cy = (this.gradientUnits == 'objectBoundingBox'
					? bb.y() + bb.height() * this.attribute('cy').numValue()
					: this.attribute('cy').toPixels('y'));

				var fx = cx;
				var fy = cy;
				if (this.attribute('fx').hasValue()) {
					fx = (this.gradientUnits == 'objectBoundingBox'
					? bb.x() + bb.width() * this.attribute('fx').numValue()
					: this.attribute('fx').toPixels('x'));
				}
				if (this.attribute('fy').hasValue()) {
					fy = (this.gradientUnits == 'objectBoundingBox'
					? bb.y() + bb.height() * this.attribute('fy').numValue()
					: this.attribute('fy').toPixels('y'));
				}

				var r = (this.gradientUnits == 'objectBoundingBox'
					? (bb.width() + bb.height()) / 2.0 * this.attribute('r').numValue()
					: this.attribute('r').toPixels());

				return ctx.createRadialGradient(fx, fy, 0, cx, cy, r);
			}
		}
		svg.Element.radialGradient.prototype = new svg.Element.GradientBase;

		// gradient stop element
		svg.Element.stop = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.offset = this.attribute('offset').numValue();

			var stopColor = this.style('stop-color');
			if (this.style('stop-opacity').hasValue()) stopColor = stopColor.addOpacity(this.style('stop-opacity').value);
			this.color = stopColor.value;
		}
		svg.Element.stop.prototype = new svg.Element.ElementBase;

		// animation base element
		svg.Element.AnimateBase = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			svg.Animations.push(this);

			this.duration = 0.0;
			this.begin = this.attribute('begin').toMilliseconds();
			this.maxDuration = this.begin + this.attribute('dur').toMilliseconds();

			this.getProperty = function() {
				var attributeType = this.attribute('attributeType').value;
				var attributeName = this.attribute('attributeName').value;

				if (attributeType == 'CSS') {
					return this.parent.style(attributeName, true);
				}
				return this.parent.attribute(attributeName, true);
			};

			this.initialValue = null;
			this.initialUnits = '';
			this.removed = false;

			this.calcValue = function() {
				// OVERRIDE ME!
				return '';
			}

			this.update = function(delta) {
				// set initial value
				if (this.initialValue == null) {
					this.initialValue = this.getProperty().value;
					this.initialUnits = this.getProperty().getUnits();
				}

				// if we're past the end time
				if (this.duration > this.maxDuration) {
					// loop for indefinitely repeating animations
					if (this.attribute('repeatCount').value == 'indefinite') {
						this.duration = 0.0
					}
					else if (this.attribute('fill').valueOrDefault('remove') == 'remove' && !this.removed) {
						this.removed = true;
						this.getProperty().value = this.initialValue;
						return true;
					}
					else {
						return false; // no updates made
					}
				}
				this.duration = this.duration + delta;

				// if we're past the begin time
				var updated = false;
				if (this.begin < this.duration) {
					var newValue = this.calcValue(); // tween

					if (this.attribute('type').hasValue()) {
						// for transform, etc.
						var type = this.attribute('type').value;
						newValue = type + '(' + newValue + ')';
					}

					this.getProperty().value = newValue;
					updated = true;
				}

				return updated;
			}

			this.from = this.attribute('from');
			this.to = this.attribute('to');
			this.values = this.attribute('values');
			if (this.values.hasValue()) this.values.value = this.values.value.split(';');

			// fraction of duration we've covered
			this.progress = function() {
				var ret = { progress: (this.duration - this.begin) / (this.maxDuration - this.begin) };
				if (this.values.hasValue()) {
					var p = ret.progress * (this.values.value.length - 1);
					var lb = Math.floor(p), ub = Math.ceil(p);
					ret.from = new svg.Property('from', parseFloat(this.values.value[lb]));
					ret.to = new svg.Property('to', parseFloat(this.values.value[ub]));
					ret.progress = (p - lb) / (ub - lb);
				}
				else {
					ret.from = this.from;
					ret.to = this.to;
				}
				return ret;
			}
		}
		svg.Element.AnimateBase.prototype = new svg.Element.ElementBase;

		// animate element
		svg.Element.animate = function(node) {
			this.base = svg.Element.AnimateBase;
			this.base(node);

			this.calcValue = function() {
				var p = this.progress();

				// tween value linearly
				var newValue = p.from.numValue() + (p.to.numValue() - p.from.numValue()) * p.progress;
				return newValue + this.initialUnits;
			};
		}
		svg.Element.animate.prototype = new svg.Element.AnimateBase;

		// animate color element
		svg.Element.animateColor = function(node) {
			this.base = svg.Element.AnimateBase;
			this.base(node);

			this.calcValue = function() {
				var p = this.progress();
				var from = new RGBColor(p.from.value);
				var to = new RGBColor(p.to.value);

				if (from.ok && to.ok) {
					// tween color linearly
					var r = from.r + (to.r - from.r) * p.progress;
					var g = from.g + (to.g - from.g) * p.progress;
					var b = from.b + (to.b - from.b) * p.progress;
					return 'rgb('+parseInt(r,10)+','+parseInt(g,10)+','+parseInt(b,10)+')';
				}
				return this.attribute('from').value;
			};
		}
		svg.Element.animateColor.prototype = new svg.Element.AnimateBase;

		// animate transform element
		svg.Element.animateTransform = function(node) {
			this.base = svg.Element.animate;
			this.base(node);
		}
		svg.Element.animateTransform.prototype = new svg.Element.animate;

		// font element
		svg.Element.font = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.horizAdvX = this.attribute('horiz-adv-x').numValue();

			this.isRTL = false;
			this.isArabic = false;
			this.fontFace = null;
			this.missingGlyph = null;
			this.glyphs = [];
			for (var i=0; i<this.children.length; i++) {
				var child = this.children[i];
				if (child.type == 'font-face') {
					this.fontFace = child;
					if (child.style('font-family').hasValue()) {
						svg.Definitions[child.style('font-family').value] = this;
					}
				}
				else if (child.type == 'missing-glyph') this.missingGlyph = child;
				else if (child.type == 'glyph') {
					if (child.arabicForm != '') {
						this.isRTL = true;
						this.isArabic = true;
						if (typeof(this.glyphs[child.unicode]) == 'undefined') this.glyphs[child.unicode] = [];
						this.glyphs[child.unicode][child.arabicForm] = child;
					}
					else {
						this.glyphs[child.unicode] = child;
					}
				}
			}
		}
		svg.Element.font.prototype = new svg.Element.ElementBase;

		// font-face element
		svg.Element.fontface = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.ascent = this.attribute('ascent').value;
			this.descent = this.attribute('descent').value;
			this.unitsPerEm = this.attribute('units-per-em').numValue();
		}
		svg.Element.fontface.prototype = new svg.Element.ElementBase;

		// missing-glyph element
		svg.Element.missingglyph = function(node) {
			this.base = svg.Element.path;
			this.base(node);

			this.horizAdvX = 0;
		}
		svg.Element.missingglyph.prototype = new svg.Element.path;

		// glyph element
		svg.Element.glyph = function(node) {
			this.base = svg.Element.path;
			this.base(node);

			this.horizAdvX = this.attribute('horiz-adv-x').numValue();
			this.unicode = this.attribute('unicode').value;
			this.arabicForm = this.attribute('arabic-form').value;
		}
		svg.Element.glyph.prototype = new svg.Element.path;

		// text element
		svg.Element.text = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			if (node != null) {
				// add children
				this.children = [];
				for (var i=0; i<node.childNodes.length; i++) {
					var childNode = node.childNodes[i];
					if (childNode.nodeType == 1) { // capture tspan and tref nodes
						this.addChild(childNode, true);
					}
					else if (childNode.nodeType == 3) { // capture text
						this.addChild(new svg.Element.tspan(childNode), false);
					}
				}
			}

			this.baseSetContext = this.setContext;
			this.setContext = function(ctx) {
				this.baseSetContext(ctx);
				if (this.style('dominant-baseline').hasValue()) ctx.textBaseline = this.style('dominant-baseline').value;
				if (this.style('alignment-baseline').hasValue()) ctx.textBaseline = this.style('alignment-baseline').value;
			}

			this.renderChildren = function(ctx) {
				var textAnchor = this.style('text-anchor').valueOrDefault('start');
				var x = this.attribute('x').toPixels('x');
				var y = this.attribute('y').toPixels('y');
				for (var i=0; i<this.children.length; i++) {
					var child = this.children[i];

					if (child.attribute('x').hasValue()) {
						child.x = child.attribute('x').toPixels('x');
					}
					else {
						if (this.attribute('dx').hasValue()) y += this.attribute('dx').toPixels('x');
						if (child.attribute('dx').hasValue()) x += child.attribute('dx').toPixels('x');
						child.x = x;
					}

					var childLength = child.measureText(ctx);
					if (textAnchor != 'start' && (i==0 || child.attribute('x').hasValue())) { // new group?
						// loop through rest of children
						var groupLength = childLength;
						for (var j=i+1; j<this.children.length; j++) {
							var childInGroup = this.children[j];
							if (childInGroup.attribute('x').hasValue()) break; // new group
							groupLength += childInGroup.measureText(ctx);
						}
						child.x -= (textAnchor == 'end' ? groupLength : groupLength / 2.0);
					}
					x = child.x + childLength;

					if (child.attribute('y').hasValue()) {
						child.y = child.attribute('y').toPixels('y');
					}
					else {
						if (this.attribute('dy').hasValue()) y += this.attribute('dy').toPixels('y');
						if (child.attribute('dy').hasValue()) y += child.attribute('dy').toPixels('y');
						child.y = y;
					}
					y = child.y;

					child.render(ctx);
				}
			}
		}
		svg.Element.text.prototype = new svg.Element.RenderedElementBase;

		// text base
		svg.Element.TextElementBase = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			this.getGlyph = function(font, text, i) {
				var c = text[i];
				var glyph = null;
				if (font.isArabic) {
					var arabicForm = 'isolated';
					if ((i==0 || text[i-1]==' ') && i<text.length-2 && text[i+1]!=' ') arabicForm = 'terminal';
					if (i>0 && text[i-1]!=' ' && i<text.length-2 && text[i+1]!=' ') arabicForm = 'medial';
					if (i>0 && text[i-1]!=' ' && (i == text.length-1 || text[i+1]==' ')) arabicForm = 'initial';
					if (typeof(font.glyphs[c]) != 'undefined') {
						glyph = font.glyphs[c][arabicForm];
						if (glyph == null && font.glyphs[c].type == 'glyph') glyph = font.glyphs[c];
					}
				}
				else {
					glyph = font.glyphs[c];
				}
				if (glyph == null) glyph = font.missingGlyph;
				return glyph;
			}

			this.renderChildren = function(ctx) {
				var customFont = this.parent.style('font-family').getDefinition();
				if (customFont != null) {
					var fontSize = this.parent.style('font-size').numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize);
					var fontStyle = this.parent.style('font-style').valueOrDefault(svg.Font.Parse(svg.ctx.font).fontStyle);
					var text = this.getText();
					if (customFont.isRTL) text = text.split("").reverse().join("");

					var dx = svg.ToNumberArray(this.parent.attribute('dx').value);
					for (var i=0; i<text.length; i++) {
						var glyph = this.getGlyph(customFont, text, i);
						var scale = fontSize / customFont.fontFace.unitsPerEm;
						ctx.translate(this.x, this.y);
						ctx.scale(scale, -scale);
						var lw = ctx.lineWidth;
						ctx.lineWidth = ctx.lineWidth * customFont.fontFace.unitsPerEm / fontSize;
						if (fontStyle == 'italic') ctx.transform(1, 0, .4, 1, 0, 0);
						glyph.render(ctx);
						if (fontStyle == 'italic') ctx.transform(1, 0, -.4, 1, 0, 0);
						ctx.lineWidth = lw;
						ctx.scale(1/scale, -1/scale);
						ctx.translate(-this.x, -this.y);

						this.x += fontSize * (glyph.horizAdvX || customFont.horizAdvX) / customFont.fontFace.unitsPerEm;
						if (typeof(dx[i]) != 'undefined' && !isNaN(dx[i])) {
							this.x += dx[i];
						}
					}
					return;
				}

				if (ctx.strokeStyle != '') ctx.strokeText(svg.compressSpaces(this.getText()), this.x, this.y);
				if (ctx.fillStyle != '') ctx.fillText(svg.compressSpaces(this.getText()), this.x, this.y);
			}

			this.getText = function() {
				// OVERRIDE ME
			}

			this.measureText = function(ctx) {
				var customFont = this.parent.style('font-family').getDefinition();
				if (customFont != null) {
					var fontSize = this.parent.style('font-size').numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize);
					var measure = 0;
					var text = this.getText();
					if (customFont.isRTL) text = text.split("").reverse().join("");
					var dx = svg.ToNumberArray(this.parent.attribute('dx').value);
					for (var i=0; i<text.length; i++) {
						var glyph = this.getGlyph(customFont, text, i);
						measure += (glyph.horizAdvX || customFont.horizAdvX) * fontSize / customFont.fontFace.unitsPerEm;
						if (typeof(dx[i]) != 'undefined' && !isNaN(dx[i])) {
							measure += dx[i];
						}
					}
					return measure;
				}

				var textToMeasure = svg.compressSpaces(this.getText());
				if (!ctx.measureText) return textToMeasure.length * 10;

				ctx.save();
				this.setContext(ctx);
				var width = ctx.measureText(textToMeasure).width;
				ctx.restore();
				return width;
			}
		}
		svg.Element.TextElementBase.prototype = new svg.Element.RenderedElementBase;

		// tspan
		svg.Element.tspan = function(node) {
			this.base = svg.Element.TextElementBase;
			this.base(node);

			this.text = node.nodeType == 3 ? node.nodeValue : // text
						node.childNodes.length > 0 ? node.childNodes[0].nodeValue : // element
						node.text;
			this.getText = function() {
				return this.text;
			}
		}
		svg.Element.tspan.prototype = new svg.Element.TextElementBase;

		// tref
		svg.Element.tref = function(node) {
			this.base = svg.Element.TextElementBase;
			this.base(node);

			this.getText = function() {
				var element = this.attribute('xlink:href').getDefinition();
				if (element != null) return element.children[0].getText();
			}
		}
		svg.Element.tref.prototype = new svg.Element.TextElementBase;

		// a element
		svg.Element.a = function(node) {
			this.base = svg.Element.TextElementBase;
			this.base(node);

			this.hasText = true;
			for (var i=0; i<node.childNodes.length; i++) {
				if (node.childNodes[i].nodeType != 3) this.hasText = false;
			}

			// this might contain text
			this.text = this.hasText ? node.childNodes[0].nodeValue : '';
			this.getText = function() {
				return this.text;
			}

			this.baseRenderChildren = this.renderChildren;
			this.renderChildren = function(ctx) {
				if (this.hasText) {
					// render as text element
					this.baseRenderChildren(ctx);
					var fontSize = new svg.Property('fontSize', svg.Font.Parse(svg.ctx.font).fontSize);
					svg.Mouse.checkBoundingBox(this, new svg.BoundingBox(this.x, this.y - fontSize.toPixels('y'), this.x + this.measureText(ctx), this.y));
				}
				else {
					// render as temporary group
					var g = new svg.Element.g();
					g.children = this.children;
					g.parent = this;
					g.render(ctx);
				}
			}

			this.onclick = function() {
				window.open(this.attribute('xlink:href').value);
			}

			this.onmousemove = function() {
				svg.ctx.canvas.style.cursor = 'pointer';
			}
		}
		svg.Element.a.prototype = new svg.Element.TextElementBase;

		// image element
		svg.Element.image = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			var href = this.attribute('xlink:href').value;
			var isSvg = href.match(/\.svg$/)

			svg.Images.push(this);
			this.loaded = false;
			if (!isSvg) {
				this.img = document.createElement('img');
				var self = this;
				this.img.onload = function() { self.loaded = true; }
				this.img.onerror = function() { if (console) console.log('ERROR: image "' + href + '" not found'); self.loaded = true; }
				this.img.src = href;
			}
			else {
				this.img = svg.ajax(href);
				this.loaded = true;
			}

			this.renderChildren = function(ctx) {
				var x = this.attribute('x').toPixels('x');
				var y = this.attribute('y').toPixels('y');

				var width = this.attribute('width').toPixels('x');
				var height = this.attribute('height').toPixels('y');
				if (width == 0 || height == 0) return;

				ctx.save();
				if (isSvg) {
					ctx.drawSvg(this.img, x, y, width, height);
				}
				else {
					ctx.translate(x, y);
					svg.AspectRatio(ctx,
									this.attribute('preserveAspectRatio').value,
									width,
									this.img.width,
									height,
									this.img.height,
									0,
									0);
					ctx.drawImage(this.img, 0, 0);
				}
				ctx.restore();
			}
		}
		svg.Element.image.prototype = new svg.Element.RenderedElementBase;

		// group element
		svg.Element.g = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			this.getBoundingBox = function() {
				var bb = new svg.BoundingBox();
				for (var i=0; i<this.children.length; i++) {
					bb.addBoundingBox(this.children[i].getBoundingBox());
				}
				return bb;
			};
		}
		svg.Element.g.prototype = new svg.Element.RenderedElementBase;

		// symbol element
		svg.Element.symbol = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			this.baseSetContext = this.setContext;
			this.setContext = function(ctx) {
				this.baseSetContext(ctx);

				// viewbox
				if (this.attribute('viewBox').hasValue()) {
					var viewBox = svg.ToNumberArray(this.attribute('viewBox').value);
					var minX = viewBox[0];
					var minY = viewBox[1];
					width = viewBox[2];
					height = viewBox[3];

					svg.AspectRatio(ctx,
									this.attribute('preserveAspectRatio').value,
									this.attribute('width').toPixels('x'),
									width,
									this.attribute('height').toPixels('y'),
									height,
									minX,
									minY);

					svg.ViewPort.SetCurrent(viewBox[2], viewBox[3]);
				}
			}
		}
		svg.Element.symbol.prototype = new svg.Element.RenderedElementBase;

		// style element
		svg.Element.style = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			// text, or spaces then CDATA
			var css = node.childNodes[0].nodeValue + (node.childNodes.length > 1 ? node.childNodes[1].nodeValue : '');
			css = css.replace(/(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(^[\s]*\/\/.*)/gm, ''); // remove comments
			css = svg.compressSpaces(css); // replace whitespace
			var cssDefs = css.split('}');
			for (var i=0; i<cssDefs.length; i++) {
				if (svg.trim(cssDefs[i]) != '') {
					var cssDef = cssDefs[i].split('{');
					var cssClasses = cssDef[0].split(',');
					var cssProps = cssDef[1].split(';');
					for (var j=0; j<cssClasses.length; j++) {
						var cssClass = svg.trim(cssClasses[j]);
						if (cssClass != '') {
							var props = {};
							for (var k=0; k<cssProps.length; k++) {
								var prop = cssProps[k].indexOf(':');
								var name = cssProps[k].substr(0, prop);
								var value = cssProps[k].substr(prop + 1, cssProps[k].length - prop);
								if (name != null && value != null) {
									props[svg.trim(name)] = new svg.Property(svg.trim(name), svg.trim(value));
								}
							}
							svg.Styles[cssClass] = props;
							if (cssClass == '@font-face') {
								var fontFamily = props['font-family'].value.replace(/"/g,'');
								var srcs = props['src'].value.split(',');
								for (var s=0; s<srcs.length; s++) {
									if (srcs[s].indexOf('format("svg")') > 0) {
										var urlStart = srcs[s].indexOf('url');
										var urlEnd = srcs[s].indexOf(')', urlStart);
										var url = srcs[s].substr(urlStart + 5, urlEnd - urlStart - 6);
										var doc = svg.parseXml(svg.ajax(url));
										var fonts = doc.getElementsByTagName('font');
										for (var f=0; f<fonts.length; f++) {
											var font = svg.CreateElement(fonts[f]);
											svg.Definitions[fontFamily] = font;
										}
									}
								}
							}
						}
					}
				}
			}
		}
		svg.Element.style.prototype = new svg.Element.ElementBase;

		// use element
		svg.Element.use = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			this.baseSetContext = this.setContext;
			this.setContext = function(ctx) {
				this.baseSetContext(ctx);
				if (this.attribute('x').hasValue()) ctx.translate(this.attribute('x').toPixels('x'), 0);
				if (this.attribute('y').hasValue()) ctx.translate(0, this.attribute('y').toPixels('y'));
			}

			this.getDefinition = function() {
				var element = this.attribute('xlink:href').getDefinition();
				if (this.attribute('width').hasValue()) element.attribute('width', true).value = this.attribute('width').value;
				if (this.attribute('height').hasValue()) element.attribute('height', true).value = this.attribute('height').value;
				return element;
			}

			this.path = function(ctx) {
				var element = this.getDefinition();
				if (element != null) element.path(ctx);
			}

			this.renderChildren = function(ctx) {
				var element = this.getDefinition();
				if (element != null) {
					// temporarily detach from parent and render
					var oldParent = element.parent;
					element.parent = null;
					element.render(ctx);
					element.parent = oldParent;
				}
			}
		}
		svg.Element.use.prototype = new svg.Element.RenderedElementBase;

		// mask element
		svg.Element.mask = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.apply = function(ctx, element) {
				// render as temp svg
				var x = this.attribute('x').toPixels('x');
				var y = this.attribute('y').toPixels('y');
				var width = this.attribute('width').toPixels('x');
				var height = this.attribute('height').toPixels('y');

				// temporarily remove mask to avoid recursion
				var mask = element.attribute('mask').value;
				element.attribute('mask').value = '';

					var cMask = document.createElement('canvas');
					cMask.width = x + width;
					cMask.height = y + height;
					var maskCtx = cMask.getContext('2d');
					this.renderChildren(maskCtx);

					var c = document.createElement('canvas');
					c.width = x + width;
					c.height = y + height;
					var tempCtx = c.getContext('2d');
					element.render(tempCtx);
					tempCtx.globalCompositeOperation = 'destination-in';
					tempCtx.fillStyle = maskCtx.createPattern(cMask, 'no-repeat');
					tempCtx.fillRect(0, 0, x + width, y + height);

					ctx.fillStyle = tempCtx.createPattern(c, 'no-repeat');
					ctx.fillRect(0, 0, x + width, y + height);

				// reassign mask
				element.attribute('mask').value = mask;
			}

			this.render = function(ctx) {
				// NO RENDER
			}
		}
		svg.Element.mask.prototype = new svg.Element.ElementBase;

		// clip element
		svg.Element.clipPath = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.apply = function(ctx) {
				for (var i=0; i<this.children.length; i++) {
					if (this.children[i].path) {
						this.children[i].path(ctx);
						ctx.clip();
					}
				}
			}

			this.render = function(ctx) {
				// NO RENDER
			}
		}
		svg.Element.clipPath.prototype = new svg.Element.ElementBase;

		// filters
		svg.Element.filter = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.apply = function(ctx, element) {
				// render as temp svg
				var bb = element.getBoundingBox();
				var x = this.attribute('x').toPixels('x');
				var y = this.attribute('y').toPixels('y');
				if (x == 0 || y == 0) {
					x = bb.x1;
					y = bb.y1;
				}
				var width = this.attribute('width').toPixels('x');
				var height = this.attribute('height').toPixels('y');
				if (width == 0 || height == 0) {
					width = bb.width();
					height = bb.height();
				}

				// temporarily remove filter to avoid recursion
				var filter = element.style('filter').value;
				element.style('filter').value = '';

				// max filter distance
				var extraPercent = .20;
				var px = extraPercent * width;
				var py = extraPercent * height;

				var c = document.createElement('canvas');
				c.width = width + 2*px;
				c.height = height + 2*py;
				var tempCtx = c.getContext('2d');
				tempCtx.translate(-x + px, -y + py);
				element.render(tempCtx);

				// apply filters
				for (var i=0; i<this.children.length; i++) {
					this.children[i].apply(tempCtx, 0, 0, width + 2*px, height + 2*py);
				}

				// render on me
				ctx.drawImage(c, 0, 0, width + 2*px, height + 2*py, x - px, y - py, width + 2*px, height + 2*py);

				// reassign filter
				element.style('filter', true).value = filter;
			}

			this.render = function(ctx) {
				// NO RENDER
			}
		}
		svg.Element.filter.prototype = new svg.Element.ElementBase;

		svg.Element.feGaussianBlur = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			function make_fgauss(sigma) {
				sigma = Math.max(sigma, 0.01);
				var len = Math.ceil(sigma * 4.0) + 1;
				mask = [];
				for (var i = 0; i < len; i++) {
					mask[i] = Math.exp(-0.5 * (i / sigma) * (i / sigma));
				}
				return mask;
			}

			function normalize(mask) {
				var sum = 0;
				for (var i = 1; i < mask.length; i++) {
					sum += Math.abs(mask[i]);
				}
				sum = 2 * sum + Math.abs(mask[0]);
				for (var i = 0; i < mask.length; i++) {
					mask[i] /= sum;
				}
				return mask;
			}

			function convolve_even(src, dst, mask, width, height) {
			  for (var y = 0; y < height; y++) {
				for (var x = 0; x < width; x++) {
				  var a = imGet(src, x, y, width, height, 3)/255;
				  for (var rgba = 0; rgba < 4; rgba++) {
					  var sum = mask[0] * (a==0?255:imGet(src, x, y, width, height, rgba)) * (a==0||rgba==3?1:a);
					  for (var i = 1; i < mask.length; i++) {
						var a1 = imGet(src, Math.max(x-i,0), y, width, height, 3)/255;
					    var a2 = imGet(src, Math.min(x+i, width-1), y, width, height, 3)/255;
						sum += mask[i] *
						  ((a1==0?255:imGet(src, Math.max(x-i,0), y, width, height, rgba)) * (a1==0||rgba==3?1:a1) +
						   (a2==0?255:imGet(src, Math.min(x+i, width-1), y, width, height, rgba)) * (a2==0||rgba==3?1:a2));
					  }
					  imSet(dst, y, x, height, width, rgba, sum);
				  }
				}
			  }
			}

			function imGet(img, x, y, width, height, rgba) {
				return img[y*width*4 + x*4 + rgba];
			}

			function imSet(img, x, y, width, height, rgba, val) {
				img[y*width*4 + x*4 + rgba] = val;
			}

			function blur(ctx, width, height, sigma)
			{
				var srcData = ctx.getImageData(0, 0, width, height);
				var mask = make_fgauss(sigma);
				mask = normalize(mask);
				tmp = [];
				convolve_even(srcData.data, tmp, mask, width, height);
				convolve_even(tmp, srcData.data, mask, height, width);
				ctx.clearRect(0, 0, width, height);
				ctx.putImageData(srcData, 0, 0);
			}

			this.apply = function(ctx, x, y, width, height) {
				// assuming x==0 && y==0 for now
				blur(ctx, width, height, this.attribute('stdDeviation').numValue());
			}
		}
		svg.Element.filter.prototype = new svg.Element.feGaussianBlur;

		// title element, do nothing
		svg.Element.title = function(node) {
		}
		svg.Element.title.prototype = new svg.Element.ElementBase;

		// desc element, do nothing
		svg.Element.desc = function(node) {
		}
		svg.Element.desc.prototype = new svg.Element.ElementBase;

		svg.Element.MISSING = function(node) {
			if (console) console.log('ERROR: Element \'' + node.nodeName + '\' not yet implemented.');
		}
		svg.Element.MISSING.prototype = new svg.Element.ElementBase;

		// element factory
		svg.CreateElement = function(node) {
			var className = node.nodeName.replace(/^[^:]+:/,''); // remove namespace
			className = className.replace(/\-/g,''); // remove dashes
			var e = null;
			if (typeof(svg.Element[className]) != 'undefined') {
				e = new svg.Element[className](node);
			}
			else {
				e = new svg.Element.MISSING(node);
			}

			e.type = node.nodeName;
			return e;
		}

		// load from url
		svg.load = function(ctx, url) {
			svg.loadXml(ctx, svg.ajax(url));
		}

		// load from xml
		svg.loadXml = function(ctx, xml) {
			svg.loadXmlDoc(ctx, svg.parseXml(xml));
		}

		svg.loadXmlDoc = function(ctx, dom) {
			svg.init(ctx);

			var mapXY = function(p) {
				var e = ctx.canvas;
				while (e) {
					p.x -= e.offsetLeft;
					p.y -= e.offsetTop;
					e = e.offsetParent;
				}
				if (window.scrollX) p.x += window.scrollX;
				if (window.scrollY) p.y += window.scrollY;
				return p;
			}

			// bind mouse
			if (svg.opts['ignoreMouse'] != true) {
				ctx.canvas.onclick = function(e) {
					var p = mapXY(new svg.Point(e != null ? e.clientX : event.clientX, e != null ? e.clientY : event.clientY));
					svg.Mouse.onclick(p.x, p.y);
				};
				ctx.canvas.onmousemove = function(e) {
					var p = mapXY(new svg.Point(e != null ? e.clientX : event.clientX, e != null ? e.clientY : event.clientY));
					svg.Mouse.onmousemove(p.x, p.y);
				};
			}

			var e = svg.CreateElement(dom.documentElement);
			e.root = true;

			// render loop
			var isFirstRender = true;
			var draw = function() {
				svg.ViewPort.Clear();
				if (ctx.canvas.parentNode) svg.ViewPort.SetCurrent(ctx.canvas.parentNode.clientWidth, ctx.canvas.parentNode.clientHeight);

				if (svg.opts['ignoreDimensions'] != true) {
					// set canvas size
					if (e.style('width').hasValue()) {
						ctx.canvas.width = e.style('width').toPixels('x');
						ctx.canvas.style.width = ctx.canvas.width + 'px';
					}
					if (e.style('height').hasValue()) {
						ctx.canvas.height = e.style('height').toPixels('y');
						ctx.canvas.style.height = ctx.canvas.height + 'px';
					}
				}
				var cWidth = ctx.canvas.clientWidth || ctx.canvas.width;
				var cHeight = ctx.canvas.clientHeight || ctx.canvas.height;
				if (svg.opts['ignoreDimensions'] == true && e.style('width').hasValue() && e.style('height').hasValue()) {
					cWidth = e.style('width').toPixels('x');
					cHeight = e.style('height').toPixels('y');
				}
				svg.ViewPort.SetCurrent(cWidth, cHeight);

				if (svg.opts['offsetX'] != null) e.attribute('x', true).value = svg.opts['offsetX'];
				if (svg.opts['offsetY'] != null) e.attribute('y', true).value = svg.opts['offsetY'];
				if (svg.opts['scaleWidth'] != null && svg.opts['scaleHeight'] != null) {
					var xRatio = 1, yRatio = 1, viewBox = svg.ToNumberArray(e.attribute('viewBox').value);
					if (e.attribute('width').hasValue()) xRatio = e.attribute('width').toPixels('x') / svg.opts['scaleWidth'];
					else if (!isNaN(viewBox[2])) xRatio = viewBox[2] / svg.opts['scaleWidth'];
					if (e.attribute('height').hasValue()) yRatio = e.attribute('height').toPixels('y') / svg.opts['scaleHeight'];
					else if (!isNaN(viewBox[3])) yRatio = viewBox[3] / svg.opts['scaleHeight'];

					e.attribute('width', true).value = svg.opts['scaleWidth'];
					e.attribute('height', true).value = svg.opts['scaleHeight'];
					e.attribute('viewBox', true).value = '0 0 ' + (cWidth * xRatio) + ' ' + (cHeight * yRatio);
					e.attribute('preserveAspectRatio', true).value = 'none';
				}

				// clear and render
				if (svg.opts['ignoreClear'] != true) {
					ctx.clearRect(0, 0, cWidth, cHeight);
				}
				e.render(ctx);
				if (isFirstRender) {
					isFirstRender = false;
					if (typeof(svg.opts['renderCallback']) == 'function') svg.opts['renderCallback']();
				}
			}

			var waitingForImages = true;
			if (svg.ImagesLoaded()) {
				waitingForImages = false;
				draw();
			}
			svg.intervalID = setInterval(function() {
				var needUpdate = false;

				if (waitingForImages && svg.ImagesLoaded()) {
					waitingForImages = false;
					needUpdate = true;
				}

				// need update from mouse events?
				if (svg.opts['ignoreMouse'] != true) {
					needUpdate = needUpdate | svg.Mouse.hasEvents();
				}

				// need update from animations?
				if (svg.opts['ignoreAnimation'] != true) {
					for (var i=0; i<svg.Animations.length; i++) {
						needUpdate = needUpdate | svg.Animations[i].update(1000 / svg.FRAMERATE);
					}
				}

				// need update from redraw?
				if (typeof(svg.opts['forceRedraw']) == 'function') {
					if (svg.opts['forceRedraw']() == true) needUpdate = true;
				}

				// render if needed
				if (needUpdate) {
					draw();
					svg.Mouse.runEvents(); // run and clear our events
				}
			}, 1000 / svg.FRAMERATE);
		}

		svg.stop = function() {
			if (svg.intervalID) {
				clearInterval(svg.intervalID);
			}
		}

		svg.Mouse = new (function() {
			this.events = [];
			this.hasEvents = function() { return this.events.length != 0; }

			this.onclick = function(x, y) {
				this.events.push({ type: 'onclick', x: x, y: y,
					run: function(e) { if (e.onclick) e.onclick(); }
				});
			}

			this.onmousemove = function(x, y) {
				this.events.push({ type: 'onmousemove', x: x, y: y,
					run: function(e) { if (e.onmousemove) e.onmousemove(); }
				});
			}

			this.eventElements = [];

			this.checkPath = function(element, ctx) {
				for (var i=0; i<this.events.length; i++) {
					var e = this.events[i];
					if (ctx.isPointInPath && ctx.isPointInPath(e.x, e.y)) this.eventElements[i] = element;
				}
			}

			this.checkBoundingBox = function(element, bb) {
				for (var i=0; i<this.events.length; i++) {
					var e = this.events[i];
					if (bb.isPointInBox(e.x, e.y)) this.eventElements[i] = element;
				}
			}

			this.runEvents = function() {
				svg.ctx.canvas.style.cursor = '';

				for (var i=0; i<this.events.length; i++) {
					var e = this.events[i];
					var element = this.eventElements[i];
					while (element) {
						e.run(element);
						element = element.parent;
					}
				}

				// done running, clear
				this.events = [];
				this.eventElements = [];
			}
		});

		return svg;
	}
})();

if (CanvasRenderingContext2D) {
	CanvasRenderingContext2D.prototype.drawSvg = function(s, dx, dy, dw, dh) {
		canvg(this.canvas, s, {
			ignoreMouse: true,
			ignoreAnimation: true,
			ignoreDimensions: true,
			ignoreClear: true,
			offsetX: dx,
			offsetY: dy,
			scaleWidth: dw,
			scaleHeight: dh
		});
	}
}

},{"./rgbcolor":26}],26:[function(require,module,exports){
/**
 * A class to parse color values
 * @author Stoyan Stefanov <sstoo@gmail.com>
 * @link   http://www.phpied.com/rgb-color-parser-in-javascript/
 * @license Use it if you like it
 */
function RGBColor(color_string)
{
    this.ok = false;

    // strip any leading #
    if (color_string.charAt(0) == '#') { // remove # if any
        color_string = color_string.substr(1,6);
    }

    color_string = color_string.replace(/ /g,'');
    color_string = color_string.toLowerCase();

    // before getting into regexps, try simple matches
    // and overwrite the input
    var simple_colors = {
        aliceblue: 'f0f8ff',
        antiquewhite: 'faebd7',
        aqua: '00ffff',
        aquamarine: '7fffd4',
        azure: 'f0ffff',
        beige: 'f5f5dc',
        bisque: 'ffe4c4',
        black: '000000',
        blanchedalmond: 'ffebcd',
        blue: '0000ff',
        blueviolet: '8a2be2',
        brown: 'a52a2a',
        burlywood: 'deb887',
        cadetblue: '5f9ea0',
        chartreuse: '7fff00',
        chocolate: 'd2691e',
        coral: 'ff7f50',
        cornflowerblue: '6495ed',
        cornsilk: 'fff8dc',
        crimson: 'dc143c',
        cyan: '00ffff',
        darkblue: '00008b',
        darkcyan: '008b8b',
        darkgoldenrod: 'b8860b',
        darkgray: 'a9a9a9',
        darkgreen: '006400',
        darkkhaki: 'bdb76b',
        darkmagenta: '8b008b',
        darkolivegreen: '556b2f',
        darkorange: 'ff8c00',
        darkorchid: '9932cc',
        darkred: '8b0000',
        darksalmon: 'e9967a',
        darkseagreen: '8fbc8f',
        darkslateblue: '483d8b',
        darkslategray: '2f4f4f',
        darkturquoise: '00ced1',
        darkviolet: '9400d3',
        deeppink: 'ff1493',
        deepskyblue: '00bfff',
        dimgray: '696969',
        dodgerblue: '1e90ff',
        feldspar: 'd19275',
        firebrick: 'b22222',
        floralwhite: 'fffaf0',
        forestgreen: '228b22',
        fuchsia: 'ff00ff',
        gainsboro: 'dcdcdc',
        ghostwhite: 'f8f8ff',
        gold: 'ffd700',
        goldenrod: 'daa520',
        gray: '808080',
        green: '008000',
        greenyellow: 'adff2f',
        honeydew: 'f0fff0',
        hotpink: 'ff69b4',
        indianred : 'cd5c5c',
        indigo : '4b0082',
        ivory: 'fffff0',
        khaki: 'f0e68c',
        lavender: 'e6e6fa',
        lavenderblush: 'fff0f5',
        lawngreen: '7cfc00',
        lemonchiffon: 'fffacd',
        lightblue: 'add8e6',
        lightcoral: 'f08080',
        lightcyan: 'e0ffff',
        lightgoldenrodyellow: 'fafad2',
        lightgrey: 'd3d3d3',
        lightgreen: '90ee90',
        lightpink: 'ffb6c1',
        lightsalmon: 'ffa07a',
        lightseagreen: '20b2aa',
        lightskyblue: '87cefa',
        lightslateblue: '8470ff',
        lightslategray: '778899',
        lightsteelblue: 'b0c4de',
        lightyellow: 'ffffe0',
        lime: '00ff00',
        limegreen: '32cd32',
        linen: 'faf0e6',
        magenta: 'ff00ff',
        maroon: '800000',
        mediumaquamarine: '66cdaa',
        mediumblue: '0000cd',
        mediumorchid: 'ba55d3',
        mediumpurple: '9370d8',
        mediumseagreen: '3cb371',
        mediumslateblue: '7b68ee',
        mediumspringgreen: '00fa9a',
        mediumturquoise: '48d1cc',
        mediumvioletred: 'c71585',
        midnightblue: '191970',
        mintcream: 'f5fffa',
        mistyrose: 'ffe4e1',
        moccasin: 'ffe4b5',
        navajowhite: 'ffdead',
        navy: '000080',
        oldlace: 'fdf5e6',
        olive: '808000',
        olivedrab: '6b8e23',
        orange: 'ffa500',
        orangered: 'ff4500',
        orchid: 'da70d6',
        palegoldenrod: 'eee8aa',
        palegreen: '98fb98',
        paleturquoise: 'afeeee',
        palevioletred: 'd87093',
        papayawhip: 'ffefd5',
        peachpuff: 'ffdab9',
        peru: 'cd853f',
        pink: 'ffc0cb',
        plum: 'dda0dd',
        powderblue: 'b0e0e6',
        purple: '800080',
        red: 'ff0000',
        rosybrown: 'bc8f8f',
        royalblue: '4169e1',
        saddlebrown: '8b4513',
        salmon: 'fa8072',
        sandybrown: 'f4a460',
        seagreen: '2e8b57',
        seashell: 'fff5ee',
        sienna: 'a0522d',
        silver: 'c0c0c0',
        skyblue: '87ceeb',
        slateblue: '6a5acd',
        slategray: '708090',
        snow: 'fffafa',
        springgreen: '00ff7f',
        steelblue: '4682b4',
        tan: 'd2b48c',
        teal: '008080',
        thistle: 'd8bfd8',
        tomato: 'ff6347',
        turquoise: '40e0d0',
        violet: 'ee82ee',
        violetred: 'd02090',
        wheat: 'f5deb3',
        white: 'ffffff',
        whitesmoke: 'f5f5f5',
        yellow: 'ffff00',
        yellowgreen: '9acd32'
    };
    for (var key in simple_colors) {
        if (color_string == key) {
            color_string = simple_colors[key];
        }
    }
    // emd of simple type-in colors

    // array of color definition objects
    var color_defs = [
        {
            re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
            example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
            process: function (bits){
                return [
                    parseInt(bits[1]),
                    parseInt(bits[2]),
                    parseInt(bits[3])
                ];
            }
        },
        {
            re: /^(\w{2})(\w{2})(\w{2})$/,
            example: ['#00ff00', '336699'],
            process: function (bits){
                return [
                    parseInt(bits[1], 16),
                    parseInt(bits[2], 16),
                    parseInt(bits[3], 16)
                ];
            }
        },
        {
            re: /^(\w{1})(\w{1})(\w{1})$/,
            example: ['#fb0', 'f0f'],
            process: function (bits){
                return [
                    parseInt(bits[1] + bits[1], 16),
                    parseInt(bits[2] + bits[2], 16),
                    parseInt(bits[3] + bits[3], 16)
                ];
            }
        }
    ];

    // search through the definitions to find a match
    for (var i = 0; i < color_defs.length; i++) {
        var re = color_defs[i].re;
        var processor = color_defs[i].process;
        var bits = re.exec(color_string);
        if (bits) {
            channels = processor(bits);
            this.r = channels[0];
            this.g = channels[1];
            this.b = channels[2];
            this.ok = true;
        }

    }

    // validate/cleanup values
    this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
    this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
    this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);

    // some getters
    this.toRGB = function () {
        return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
    }
    this.toHex = function () {
        var r = this.r.toString(16);
        var g = this.g.toString(16);
        var b = this.b.toString(16);
        if (r.length == 1) r = '0' + r;
        if (g.length == 1) g = '0' + g;
        if (b.length == 1) b = '0' + b;
        return '#' + r + g + b;
    }

    // help
    this.getHelpXML = function () {

        var examples = new Array();
        // add regexps
        for (var i = 0; i < color_defs.length; i++) {
            var example = color_defs[i].example;
            for (var j = 0; j < example.length; j++) {
                examples[examples.length] = example[j];
            }
        }
        // add type-in colors
        for (var sc in simple_colors) {
            examples[examples.length] = sc;
        }

        var xml = document.createElement('ul');
        xml.setAttribute('id', 'rgbcolor-examples');
        for (var i = 0; i < examples.length; i++) {
            try {
                var list_item = document.createElement('li');
                var list_color = new RGBColor(examples[i]);
                var example_div = document.createElement('div');
                example_div.style.cssText =
                        'margin: 3px; '
                        + 'border: 1px solid black; '
                        + 'background:' + list_color.toHex() + '; '
                        + 'color:' + list_color.toHex()
                ;
                example_div.appendChild(document.createTextNode('test'));
                var list_item_value = document.createTextNode(
                    ' ' + examples[i] + ' -> ' + list_color.toRGB() + ' -> ' + list_color.toHex()
                );
                list_item.appendChild(example_div);
                list_item.appendChild(list_item_value);
                xml.appendChild(list_item);

            } catch(e){}
        }
        return xml;

    }

}

module.exports = RGBColor;

},{}],27:[function(require,module,exports){
LogEvent = function(name, value, time){
  this.name = name;
  this.value = value;
  this.time = time;
};

LogEvent.CLICKED_TUTORIAL = "Clicked tutorial";
LogEvent.CHANGED_TUTORIAL = "Changed tutorial";
LogEvent.BLEW_FUSE = "Blew fuse";
LogEvent.DMM_MEASUREMENT = "DMM measurement";
LogEvent.CHANGED_CIRCUIT = "Changed circuit";
LogEvent.OSCOPE_MEASUREMENT = "OScope measurement";
LogEvent.OSCOPE_V1_SCALE_CHANGED = "OScope V1 scale changed";
LogEvent.OSCOPE_V2_SCALE_CHANGED = "OScope V2 scale changed";
LogEvent.OSCOPE_T_SCALE_CHANGED = "OScope T scale changed";

module.exports = LogEvent;

},{}],28:[function(require,module,exports){
/*global sparks $ */

Meter = function() {};

Meter.prototype = {
  dmm: null,
  oscope: null,

  setProbeLocation: function (probe, loc) {
    if (this.oscope) {
      this.oscope.setProbeLocation(probe, loc);
    }
    if (this.dmm) {
      this.dmm.setProbeLocation(probe, loc);
    }
  },

  // moves any and all probes from oldLoc to newLoc
  // useful for when a lead with connected probes is moved
  moveProbe: function (oldLoc, newLoc) {
    if (this.oscope) {
      this.oscope.moveProbe(oldLoc, newLoc);
    }
    if (this.dmm) {
      this.dmm.moveProbe(oldLoc, newLoc);
    }
  },

  update: function () {
    if (this.oscope) {
      this.oscope.update();
    }
    if (this.dmm) {
      this.dmm.update();
    }
  },

  reset: function() {
    if (this.oscope && this.oscope.reset) {
      this.oscope.reset();
    }
    if (this.dmm && this.dmm.reset) {
      this.dmm.reset();
    }
  }
};

module.exports = Meter;

},{}],29:[function(require,module,exports){
/*global sparks getBreadBoard breadModel */
/* FILE oscilloscope.js */

var LogEvent      = require('./log'),
    logController = require('../controllers/log-controller');

Oscilloscope = function () {
  this.probeLocation = [];
  this.probeLocation[0] = null;     // pink probe
  this.probeLocation[1] = null;     // yellow probe
  this.view = null;
  this.signals = [];
  var initVerticalScale   = this.INITIAL_VERTICAL_SCALE,
      initHorizontalScale = this.INITIAL_HORIZONTAL_SCALE;
  this._verticalScale = [initVerticalScale, initVerticalScale, initVerticalScale];
  this._horizontalScale = initHorizontalScale;
  this.showAminusB = false;
  this.showAplusB = false;
  this.AminusBwasOn = false;  // whether A-B was turned on during current question
  this.AplusBwasOn = false;
};

Oscilloscope.prototype = {

  N_CHANNELS:     2,
  PROBE_CHANNEL:  [1, 2],

  HORIZONTAL_SCALES: [1e-3, 5e-4, 2.5e-4, 1e-4, 5e-5, 2.5e-5, 1e-5, 5e-6, 2.5e-6, 1e-6],  // sec/div
  VERTICAL_SCALES:   [100,  50,   25,     10,   5,    2.5,    1,    0.5,  0.25,    0.1],  // V/div

  INITIAL_HORIZONTAL_SCALE: 1e-5,
  INITIAL_VERTICAL_SCALE:   5,

  reset: function() {
    this.probeLocation[0] = "left_positive21";      // yellow probe
    this.probeLocation[1] = null;                   // pink probe
    this.signals = [];
    var initVerticalScale   = this.INITIAL_VERTICAL_SCALE,
        initHorizontalScale = this.INITIAL_HORIZONTAL_SCALE;
    this._verticalScale = [initVerticalScale, initVerticalScale, initVerticalScale];
    this._horizontalScale = initHorizontalScale;
    this.showAminusB = false;
    this.showAplusB = false;
    this.AminusBwasOn = false;  // whether A-B was turned on during current question
    this.AplusBwasOn = false;
  },

  setView: function(view) {
    this.view = view;
    this.view.setModel(this);
    this.update();         // we can update view immediately with the source trace
  },

  // @probe Name of probe being attached. We ignore everything but "red"
  // @location Hole name, like 'a1' or can be null if probe is lifted
  setProbeLocation: function(probe, location) {
    if (probe === "probe_yellow" || probe === "probe_pink") {
      var probeIndex = probe === "probe_yellow" ? 0 : 1;
      if (this.probeLocation[probeIndex] !== location) {
        this.probeLocation[probeIndex] = location;
        this.update();
      }
    }
  },

  moveProbe: function(oldLoc, newLoc) {
    for (var i = 0; i < 2; i++) {
      if (this.probeLocation[i] === oldLoc) {
        this.probeLocation[i] = newLoc;
      }
    }
    this.update();
  },

  update: function() {
    var breadboard = getBreadBoard(),
        source     = breadboard.components.source,
        probeIndex,
        sourceSignal,
        probeNode;

    if (!source || !source.frequency || !source.amplitude) {
      return;                                     // we must have a source with a freq and an amplitude
    }

    for (probeIndex = 0; probeIndex < 2; probeIndex++) {
      if (this.probeLocation[probeIndex]) {
        probeNode = breadboard.getHole(this.probeLocation[probeIndex]).nodeName();
        if (probeNode === 'gnd') {
          // short-circuit this operation and just return a flat trace
          this.setSignal(this.PROBE_CHANNEL[probeIndex], {amplitude: 0, frequency: 0, phase: 0});
          continue;
        } else if (~probeNode.indexOf('powerPos')) {
          // just return the source
          sourceSignal = {
            amplitude: source.amplitude * source.amplitudeScaleFactor,
            frequency: source.frequency,
            phase: 0
          };
          this.setSignal(this.PROBE_CHANNEL[probeIndex], sourceSignal);
          continue;
        }
        breadModel('query', "oscope", probeNode, this.updateWithData, this, [probeNode, probeIndex]);
      } else {
        this.clearSignal(this.PROBE_CHANNEL[probeIndex]);
      }
    }
  },

  updateWithData: function(ciso, probeInfo) {

    var breadboard = getBreadBoard(),
        source     = breadboard.components.source,
        probeNode  = probeInfo[0],
        probeIndex = probeInfo[1],
        result,
        probeSignal;

    result = ciso.getVoltageAt(probeInfo[0]);

    if (result) {
      probeSignal = {
        amplitude: result.magnitude * source.amplitudeScaleFactor,
        frequency: source.frequency,
        phase:     result.angle
      };

      this.setSignal(this.PROBE_CHANNEL[probeIndex], probeSignal);

      logController.addEvent(LogEvent.OSCOPE_MEASUREMENT, {
          "probe": probeNode
        });
    } else {
      this.clearSignal(this.PROBE_CHANNEL[probeIndex]);
    }
  },

  setSignal: function(channel, signal) {
    if (!this.view) return;
    this.signals[channel] = signal;
    this.view.renderSignal(channel);
  },

  getSignal: function(channel) {
    return this.signals[channel];
  },

  clearSignal: function(channel) {
    delete this.signals[channel];
    if (this.view) {
      this.view.removeTrace(channel);
    }
  },

  setHorizontalScale: function(scale) {
    this._horizontalScale = scale;
    if (this.view) {
      this.view.horizontalScaleChanged();
    }

    logController.addEvent(LogEvent.OSCOPE_T_SCALE_CHANGED, {
        "scale": scale,
        "goodnessOfScale": this.getGoodnessOfScale()
      });
  },

  getHorizontalScale: function() {
    if (!this._horizontalScale) {
      // if you want to randomize the scales, hook something in here
      this.setHorizontalScale(this.INITIAL_HORIZONTAL_SCALE);
    }
    return this._horizontalScale;
  },

  setVerticalScale: function(channel, scale) {
    if (this.showAminusB || this.showAplusB){
      if (channel === 1) {
        this._verticalScale[2] = scale;
      } else {
        return;
      }
    }

    this._verticalScale[channel] = scale;
    if (this.view) {
      this.view.verticalScaleChanged(1);
      this.view.verticalScaleChanged(2);
    }

    var logEvent = channel == 1 ? LogEvent.OSCOPE_V1_SCALE_CHANGED : LogEvent.OSCOPE_V2_SCALE_CHANGED;
    logController.addEvent(logEvent, {
      "scale": scale,
      "goodnessOfScale": this.getGoodnessOfScale()
    });
  },

  getVerticalScale: function(channel) {
    if (!this._verticalScale[channel]) {
      // if you want to randomize the scales, hook something in here
      this.setVerticalScale(channel, this.INITIAL_VERTICAL_SCALE);
    }
    return this._verticalScale[channel];
  },

  bumpHorizontalScale: function(direction) {
    var currentScale = this.getHorizontalScale(),
        newScale     = this._getNextScaleFromList(currentScale, this.HORIZONTAL_SCALES, direction);

    if (newScale !== currentScale) {
      this.setHorizontalScale(newScale);
    }
  },

  bumpVerticalScale: function(channel, direction) {
    var currentScale = this.getVerticalScale(channel),
        newScale     = this._getNextScaleFromList(currentScale, this.VERTICAL_SCALES, direction);

    if (newScale !== currentScale) {
      this.setVerticalScale(channel, newScale);
    }
  },

  toggleShowAminusB: function() {
    this.showAminusB = !this.showAminusB;
    if (this.showAminusB) {
      this.AminusBwasOn = true;
      this.showAplusB = false;
      this.setVerticalScale(1, this._verticalScale[1]);
    }
  },

  toggleShowAplusB: function() {
    this.showAplusB = !this.showAplusB;
    if (this.showAplusB) {
      this.AplusBwasOn = true;
      this.showAminusB = false;
      this.setVerticalScale(1, this._verticalScale[1]);
    }
  },

  /**
    if A-B or A+B is off right now, set AminusBwasOn and/or
    AplusBwasOn to false now.
  */
  resetABforQuestion: function() {
    if (!this.showAminusB) {
      this.AminusBwasOn = false;
    }
    if (!this.showAplusB) {
      this.AplusBwasOn = false;
    }
  },

  _getNextScaleFromList: function(scale, scales, direction) {
    var i, len, prevIndex;

    for (i = 0, len = scales.length; i < len; i++) {
      if (scales[i] < scale) {
        break;
      }
    }
    prevIndex = (i > 0) ? i - 1 : 0;

    if (direction === 1 && prevIndex - 1 >= 0) {
      return scales[prevIndex - 1];
    } else if (direction === -1 && prevIndex + 1 < scales.length) {
      return scales[prevIndex + 1];
    } else {
      return scale;
    }
  },

  // returns how "good" the current scale is, from 0-1.
  // For a single trace, a perfect scale is 1 full wave across the screen and an amplitude
  // that is exactly the screen's height. This will return a 1.0 if the scale is within 20%
  // of these parameters, and 0.0 if it's 200% away from the perfect scale (i.e. if it's 3 times
  // as big or 1/3 as big).
  // There are two scale factors per trace. The goodness ranking for the entire trace is the average
  // of the two with the lower value weighted three times as much.
  // If there are two traces showing, this will return the lower of the two values.
  //
  getGoodnessOfScale: function() {
    var self = this,

        goodnessOfScale = function(channel) {
          var timeScale  = self.signals[channel].frequency * (self._horizontalScale * 10),            // 0-inf, best is 1
              ampScale   = (self.signals[channel].amplitude * 2) / (self._verticalScale[channel] * 8),
              timeGoodness  = timeScale > 1 ? 1/timeScale : timeScale,                                // 0-1, best is 1
              ampGoodness   = ampScale > 1 ? 1/ampScale : ampScale,
              timeScore  = (timeGoodness - 0.3) / 0.5,                                                // scaled such that 0.3 = 0 and 0.8 = 1
              ampScore   = (ampGoodness - 0.3) / 0.5,
              minScore = Math.max(0,Math.min(timeScore, ampScore, 1)),                                // smallest of the two, no less than 0
              maxScore = Math.min(1,Math.max(timeScore, ampScore, 0));                                // largest of the two, no greater than 1
          return ((minScore * 3) + maxScore) / 4;
        },

        goodnesses = [null, null];

    if (this.signals[1]) {
      goodnesses[0] = goodnessOfScale([1]);
    }

    if (this.signals[2]) {
      goodnesses[1] = goodnessOfScale([2]);
    }
    return goodnesses;
  }

};

module.exports = Oscilloscope;

},{"../controllers/log-controller":16,"./log":27}],30:[function(require,module,exports){
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

},{"../views/workbench-view":36,"./meter":28}],31:[function(require,module,exports){
unit = require('../helpers/unit');

var workbenchController = require('../controllers/workbench-controller');


embeddableComponents = {
  resistor: {
    image: "/common/images/blank-resistor.png",
    imageWidth: 108,
    property: "resistance",
    initialValue: 100
  },
  capacitor: {
    image: "/common/images/capacitor.png",
    imageWidth: 48,
    property: "capacitance",
    initialValue: 1e-6
  },
  inductor: {
    image: "/common/images/inductor.png",
    imageWidth: 80,
    property: "inductance",
    initialValue: 1e-6
  },
  wire: {
    image: "/common/images/wire.png",
    imageWidth: 80,
    leadDistance: 5
  }
}

AddComponentsView = function(workbench){
  console.log("AddComponentsView!")
  var self = this,
      component;

  this.section = workbench;
  this.$drawer = $("#component_drawer").empty();

  this.lastHighlightedHole = null;

  if (workbenchController.breadboardView) {
    workbenchController.breadboardView.setRightClickFunction(this.showEditor);
  } else {  // queue it up
    workbench.view.setRightClickFunction(this.showEditor);
  }

  // create drawer
  for (componentName in embeddableComponents) {
    if (!embeddableComponents.hasOwnProperty(componentName)) continue;

    component = embeddableComponents[componentName];

    this.$drawer.append(
     $("<img class='add_"+componentName+"' class='add_component'>")
      .attr("src", component.image)
      .css("width", component.imageWidth)
      .data("type", componentName)
      .draggable({
        containment: "#breadboard_wrapper",
        helper: "clone",
        start: function(evt, ui) {
          $(ui.helper.context).hide().fadeIn(1200);
        },
        drag: function(evt, ui) {
          if (self.lastHighlightedHole) {
            self.lastHighlightedHole.attr("xlink:href", "#$:hole_not_connected");
          }
          loc = {x: ui.offset.left, y: ui.offset.top+(ui.helper.height()/2)};
          var nearestHole = $($.nearest(loc, "use[hole]")[0]);
          nearestHole.attr("xlink:href", "#$:hole_highlighted");
          self.lastHighlightedHole = nearestHole;
        }
      })
    );
  }

  // todo: don't add this twice
  $("#breadboard").droppable({
    drop: function(evt, ui) {
      var type = ui.draggable.data("type"),
          embeddableComponent = embeddableComponents[type],
          hole = self.lastHighlightedHole.attr("hole"),
          loc = hole + "," + hole,
          possibleValues,
          $propertyEditor = null,
          propertyName,
          initialValue, initialValueEng, initialValueText,
          $editor, props, uid, comp;

      if (embeddableComponent.leadDistance) {
        console.log(hole)
        var num = /\d*$/.exec(hole)[0] * 1;
        console.log(num)
        num = Math.max(num-embeddableComponent.leadDistance, 1);
        console.log(num)
        loc = loc.replace(/(\d*)$/, num);
        console.log(loc)
      }

      // insert component into highlighted hole
      props = {
       "type": type,
       "draggable": true,
       "connections": loc
      };
      props[embeddableComponent.property] = embeddableComponent.initialValue;
      uid = breadModel("insertComponent", type, props);

      comp = getBreadBoard().components[uid];

      // move leads to correct width
      breadModel("checkLocation", comp);

      // update meters
      workbench.meter.update();

      // show editor
      self.showEditor(uid);
    }
  })
};

AddComponentsView.prototype = {

  openPane: function() {
    $("#component_drawer").animate({left: 0}, 300, function(){
      $("#add_components").css("overflow", "visible");
    });
  },

  showEditor: function(uid) {
    var comp = getBreadBoard().components[uid],
        section = workbenchController.workbench,
        $propertyEditor = null;
    // create editor tooltip
    possibleValues = comp.getEditablePropertyValues();

    componentValueChanged = function (evt, ui) {
      var val = possibleValues[ui.value],
          eng = unit.toEngineering(val, comp.editableProperty.units);
      $(".prop_value_"+uid).text(eng.value + eng.units);
      comp.changeEditableValue(val);
      section.meter.update();
    }

    if (comp.isEditable) {
      propertyName = comp.editableProperty.name.charAt(0).toUpperCase() + comp.editableProperty.name.slice(1);
      initialValue = comp[comp.editableProperty.name];
      initialValueEng = unit.toEngineering(initialValue, comp.editableProperty.units);
      initialValueText = initialValueEng.value + initialValueEng.units;
      $propertyEditor = $("<div>").append(
        $("<div>").slider({
          max: possibleValues.length-1,
          slide: componentValueChanged,
          value: possibleValues.indexOf(initialValue)
        })
      ).append(
        $("<div>").html(
          propertyName + ": <span class='prop_value_"+uid+"'>"+initialValueText+"</span>"
          )
      );
    }

    $editor = $("<div class='editor'>").append(
      $("<h3>").text("Edit "+comp.componentTypeName)
    ).append(
      $propertyEditor
    ).append(
      $("<button>").text("Remove").on('click', function() {
        breadModel("removeComponent", comp);
        section.meter.update();
        $(".speech-bubble").trigger('mouseleave');
      })
    ).css( { width: 130, textAlign: "right" } );

    workbenchController.breadboardView.showTooltip(uid, $editor);
  }

};

module.exports = AddComponentsView;

},{"../controllers/workbench-controller":17,"../helpers/unit":21}],32:[function(require,module,exports){
/**
 * @author Mobile.Lab (http://mlearner.com)
 **/

require('../libs/base64');
require('../libs/canvg');

var breadboardComm      = require('./svg_view_comm');

window["breadboardSVGView"] = {
  "options" : {
    "rootpath" : "",
    "magnifier" : {
      "time": 400,
      "size": 60,
      "zoom": 2,
      "offset": {
        "x": 80,
        "y": 80
      }
    }
  },
  "util" : {}
};


// window["breadboardSVGView"].connectionMade = function(component, location) {
//   console.log('Received: connect, component|' + component + '|' + location);
// };

// window["breadboardSVGView"].connectionBroken = function(component, location) {
//   console.log('Received: disconnect, component|' + component + '|' + location);
// };

// window["breadboardSVGView"].probeAdded = function(meter, color, location) {
//   console.log('Received: connect, ' + meter + '|probe|' + color + '|' + location);
// };

// window["breadboardSVGView"].probeRemoved = function(meter, color) {
//   console.log('Received: disconnect, ' + meter + '|probe|' + color);
// };

// window["breadboardSVGView"].dmmDialMoved = function(value) {
//   console.log('Received: multimeter_dial >> ' + value);
// };

/**
 * breadboard # util # require
 * >> loading required resources
 **/

(function($, board) {

  board.util.require = function(files, callback) {
    return new LoadingStack(files, callback).load();
  };

  var LoadingStack = function(files, callback) {
    // callback function
    this.callback = callback;
    // downloaded resources
    this.resources = {};
    // main stack of loading files
    this.stack = files;
    // counter of loaded files
    this.loaded = 0;
  };

  LoadingStack.prototype.success = function() {
    if (++this.loaded == this.stack.length) {
      this.callback(this.resources);
    }
  };

  LoadingStack.prototype.attachData = function(file, data) {
    file = file.substring(file.lastIndexOf('\/') + 1, file.lastIndexOf('.'));
    this.resources[file] = data;
  };

  LoadingStack.prototype.load = function() {
    var f;
    for (var i = this.stack.length; i--; ) {
      f = this.stack[i];
      this["load" + f.toUpperCase().substring( f.lastIndexOf('.') + 1 )](f);
    }
  };

  LoadingStack.prototype.loadJS = function(file) {
    file = board.options.rootpath + file;

    $.getScript(file, function(stack) {
      return function() {
        stack.success();
      };
    }(this)).fail(function() {
      console.log("# [error] (while requiring) failed load/compile javascript file: " + file);
    });
  };

  LoadingStack.prototype.loadCSS = function(file) {
    file = board.options.rootpath + file;

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = file;
    document.head.appendChild(link);

    this.success();
  };

  LoadingStack.prototype.loadSVG = function(file) {
    this.loadResource(file);
  };

  LoadingStack.prototype.loadResource = function(file) {
    file = board.options.rootpath + file;

    $.ajax({
      "url" : file,
      "type" : "GET",
      "dataType" : "html",
      "success" : function(stack) {
        return function(data) {
          stack.attachData(file, data);
          stack.success();
        };
      }(this),
      "error" : function() {
        console.log("# [error] (while requiring) failed load resource file: " + file);
      }
    });
  };

})(jQuery, window["breadboardSVGView"]);

/**
 * breadboardView # board
 * >> create board object with API
 **/

(function($, board) {

  // global link to common SVG-jQuery object
  var paper = null;

  // global event model
  var touch = !!('ontouchstart' in document.documentElement);

  var _mousedown = (touch ) ? 'touchstart' : 'mousedown';
  var _mousemove = (touch ) ? 'touchmove' : 'mousemove';
  var _mouseup = (touch ) ? 'touchend' : 'mouseup';
  var _mouseover = (touch ) ? 'xxx' : 'mouseover';
  var _mouseout = (touch ) ? 'xxx' : 'mouseout';

  // object contains electronic and test equipment
  var equipment = function() {
  };
  // object contains components added to breadboard
  var component = function() {
  };
  // parts of more complex components on breadboard(need only for building)
  var primitive = function() {
  };
  // board constructor
  var CircuitBoard = function(id) {
    this.workbenchController = require('../controllers/workbench-controller')

    var self = this;
    // link to main holder
    this.holder = $('.' + id).html('').append(
      SVGStorage.create('board')
    ).addClass('circuit-board');
    this.holder.h = this.holder.height();
    this.holder.w = this.holder.width();

    this.workspace = this.holder.find("[item=components]");
    this.holes = {
      'row' : {}
    };
    // model of links to components by id and as the array
    this.component = {};
    this.itemslist = [];

    // create model of holes
    var p = SVGStorage.point(), bbox, matrix, elem, name;
    this.holder.find("[hole]").first().each(function() {
      bbox = this.getBBox();
      p.x = bbox.x + bbox.width / 2;
      p.y = bbox.y + bbox.height / 2;
    }).end().each(function() {
      matrix = this.getCTM();
      elem = $(this), name = elem.attr("hole");
      elem = new CircuitBoardHole(elem);
      elem.center = p.matrixTransform(matrix);
      if (!self.holes.row[elem.y]) {
        self.holes.row[elem.y] = {};
      }
      self.holes.row[elem.y][elem.x] = elem;
      self.holes[name] = elem;
    });
    this.holes.find = findNearestHole;

    // multimeter (DMM)
    this.multimeter = null;
    // battery
    this.battery = null;
    // probes
    this.probes = [];

    // init all leads draggable
    primitive.prototype.initLeadDraggable(this);
    // init all probes draggable
    primitive.prototype.initProbeDraggable(this);
    // init all components draggable
    primitive.prototype.initComponentDraggable(this);
  };

  CircuitBoard.prototype.sendEventToModel = function(evName, params) {
    breadboardComm[evName](this.workbenchController.workbench, params[0], params[1], params[2]);
  };

  CircuitBoard.prototype.addComponent = function(elem) {
    this.component[elem["UID"]] = new component[ elem["type"] ](elem, this.holes, this);
    this.component[elem["UID"]]["type"] = elem["type"];
    this.component[elem["UID"]]["id"] = elem["UID"];
    this.itemslist.push(this.component[elem["UID"]]);
    this.workspace.append(this.component[elem["UID"]].view);
    this.component[elem["UID"]]["image"] = new SVGImage(this, elem["UID"]);

    if (this.rightClickFunction) {
      var rightClickFunction = this.rightClickFunction;

      this.component[elem["UID"]].view.bind("contextmenu dblclick", function(evt) {
        rightClickFunction($(this).attr("uid"));
        evt.preventDefault();
        return false;
      });
    }
  };

  CircuitBoard.prototype.changeResistorColors = function(id, colors) {
    this.component[id].changeColors(colors);
  };

  CircuitBoard.prototype.removeComponent = function(id) {
    this.component[id].hole[0].disconnected();
    this.component[id].hole[1].disconnected();
    this.component[id].view.remove();
    this.component[id] = null;
    for (var i = this.itemslist.length; i--; ) {
      if (this.itemslist[i].id === id) {
        this.itemslist.splice(i, 1);
      }
    }
  };

  CircuitBoard.prototype.setRightClickFunction = function(func) {
    this.rightClickFunction = func;
    for (uid in this.component) {
      this.component[uid].view.bind("contextmenu dblclick", function(evt) {
        func($(this).attr("uid"));
        evt.preventDefault();
        return false;
      });
    }
  };

  CircuitBoard.prototype.addDMM = function(params) {
    if (!this.multimeter) {
      this.multimeter = new equipment.multimeter(this, params);
      this.probes.push(this.multimeter.probe['black']);
      this.probes.push(this.multimeter.probe['red']);
    }
    this.multimeter.probe['black'].view.show();
    this.multimeter.probe['red'].view.show();
    this.multimeter.mmbox.view.show();
    this.setDMMText('  0.0 0');
  };

  CircuitBoard.prototype.setDMMText = function(text) {
    if (this.multimeter) {
      for (var i = text.length; i--; ) {
        var val = '#:dmm-digit-' + text.charAt(i);
        this.multimeter.mmbox.screen[i].setAttribute('xlink:href', val);
      }
    }
  };

  CircuitBoard.prototype.removeDMM = function() {
    this.multimeter.probe['black'].view.hide();
    this.multimeter.probe['red'].view.hide();
    this.multimeter.mmbox.view.hide();
  };

  CircuitBoard.prototype.addBattery = function(connections) {
    var type = "battery";

    if (!this.battery) {
      this.battery = new equipment.battery(this, connections);
      this.workspace.append(this.battery.view);
      this.itemslist.push(this.battery);

      this.component[type] = this.battery;
      this.battery["type"] = type;
      this.battery["image"] = new SVGImage(this, type);
    }

    this.battery.btbox.view.show();

    this.battery.pts[0].connected();
    this.battery.pts[1].connected();
  };

  CircuitBoard.prototype.removeBattery = function() {
    if (this.battery) {
      this.battery.btbox.view.hide();
      this.battery.blackWire.hide();
      this.battery.redWire.hide();

      this.battery.pts[0].disconnected();
      this.battery.pts[1].disconnected();
    }
  };

  CircuitBoard.prototype.addOScope = function(params) {
    if (!this.oscope) {
      this.oscope = new equipment.oscope(this, params);
      this.probes.push(this.oscope.probe['yellow']);
      this.probes.push(this.oscope.probe['pink']);
    }
    this.oscope.probe['yellow'].view.show();
    this.oscope.probe['pink'].view.show();
  };

  CircuitBoard.prototype.removeOScope = function() {
    this.oscope.probe['yellow'].view.hide();
    this.oscope.probe['pink'].view.hide();
  };

  CircuitBoard.prototype.toFront = function(component) {
    var self = this, redrawId;
    // resolve crash in Google Chrome by changing environment
    setTimeout(function() {
      var i = component.view.index();
      if (component.view[0].ownerSVGElement.suspendRedraw) { // IE9 out
        redrawId = component.view[0].ownerSVGElement.suspendRedraw(50);
      }
      // use prepend to avoid crash in iOS
      self.workspace.prepend(component.view.parent().children(':gt(' + i + ')'));
      if (component.view[0].ownerSVGElement.unsuspendRedraw) { // IE9 out
        component.view[0].ownerSVGElement.unsuspendRedraw(redrawId);
      }
    }, 50);
  };

  CircuitBoard.prototype.initMagnifier = function() {
    var brd = this, x, y, t, hole, show_magnifier = false, time;

    var holder = brd.holder[0], active = false, svghead;
    var dx, dy, z, r, pi2, wm, hm, wb, hb, sh, pos, old;

    time = board.options.magnifier.time;
    hole = SVGStorage.hole;
    svghead = SVGStorage.info.svghead;
    dx = board.options.magnifier.offset.x;
    dy = board.options.magnifier.offset.y;
    z = board.options.magnifier.zoom;
    r = board.options.magnifier.size;
    hm = brd.holder.h * z;
    wm = brd.holder.w * z;
    sh = 60 * z;
    hb = hm - sh;
    wb = wm;

    // not active components buffer
    var comp = context2d();
    comp.canvas.height = hm;
    comp.canvas.width = wm;

    pi2 = Math.PI * 2;
    z--; // for event;

    var magnifier = $('<canvas class="magnifier">').attr({
      'height': brd.holder.h + 'px',
      'width': brd.holder.w + 'px'
    }).appendTo(brd.holder);

    var ctx = magnifier[0].getContext('2d'), buff, lead, elem;

    // create buff image of background and holes
    buff = context2d();
    buff.canvas.height = hm;
    buff.canvas.width = wm;
    buff.fillStyle = '#999181';
    buff.rect(0, 0, wb, sh), buff.fill();
    buff.drawImage(SVGStorage.defs[':bg-green-board'], 0, sh, wb, hb);
    buff.drawSvg( SVGStorage.info.svghole, 0, 0, wm, hm );
    buff.fill();
    //window.document.body.appendChild(ctx.canvas);

    // set default style for canvas context2d object

    holder.addEventListener( _mousedown, function(evt) {
      lead = $(evt.target).data('primitive-lead') || null;
      if (lead) {
        elem = brd.component[lead.name];
        comp.update(elem);
        old = pos = getCoords(evt, brd.holder);
        magnifier.draw();
        active = true;
        show_magnifier = true;
        setTimeout(function() {
          if (show_magnifier) {
            magnifier.show();
          }
        }, time);
      }
      evt.preventDefault();
    }, false);

    holder.addEventListener( _mousemove, function(evt) {
      pos = getCoords(evt, brd.holder);
      if (active && ((pos.x != old.x) || (pos.y != old.y))) {
        magnifier.show();
        magnifier.draw();
        old = pos;
      }
    }, false);

    holder.addEventListener( _mouseup, function(evt) {
      if (active) {
        show_magnifier = false;
        magnifier.hide();
        active = false;
        lead = null;
        elem = null;
      }
    }, false);

    ctx.font = "bold 16px Arial";

    magnifier.draw = function() {
      ctx.save();
      ctx.clearRect(0, 0, brd.holder.w, brd.holder.h);

      ctx.beginPath();
      ctx.arc(pos.x-dx, pos.y-dy, r, 0, pi2, false);
      ctx.closePath();
      ctx.fill();
      ctx.clip();

      x = -z*pos.x - dx;
      y = -z*pos.y - dy;

      ctx.drawImage(buff.canvas, x, y, wm, hm);
      if (brd.hole_target) {
        ctx.save();
        t = brd.hole_target.view[0].getCTM();
        ctx.translate(x, y);
        ctx.scale(z + 1, z + 1);
        ctx.transform(t.a, t.b, t.c, t.d, t.e, t.f);
        for (var i = 0, l = hole.length; i < l; i++) {
          ctx.fillStyle = hole[i].c;
          ctx.beginPath();
          ctx.arc(hole[i].x, hole[i].y, hole[i].r, 0, pi2, false);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.drawImage(comp.canvas, x, y, wm, hm);
      ctx.drawImage(elem.image.update(), x, y, wm, hm);

      ctx.restore();
      ctx.save();
      ctx.strokeStyle = '#3c3c3c';
      ctx.shadowColor = '#000000';
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 8;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pos.x-dx, pos.y-dy, r, 0, pi2, false);
      ctx.closePath();
      ctx.stroke();
      if (brd.hole_target) {
        ctx.save();
        ctx.fillStyle = "#00ff00";
        ctx.fillText(brd.hole_target.name, pos.x - r - dx, pos.y - r - dy);
        ctx.restore();
      }
      ctx.restore();

    };

    comp.update = function(elem) {
      this.clearRect(0, 0, wm, hm);
      for (var i = 0, l = brd.itemslist.length; i < l; i++) {
        if (brd.itemslist[i] != elem ) {
          this.drawImage(brd.itemslist[i].image.cnv.canvas, 0, 0, wm, hm);
        }
      }
      for (var p = 0, d = brd.probes.length; p < d; p++ ) {
        this.drawImage(brd.probes[p].image.cnv.canvas, 0, 0, wm, hm);
      }
    };

    // debugging
    //comp.update();
    //comp.canvas.style.border = '1p solir red';
    //document.body.appendChild(comp.canvas);
  };

  CircuitBoard.prototype.showTooltip = function(uid, $tipPane) {
    var $comp      = this.component[uid].view,
        pos        = $comp.position(),
        rect       = $comp[0].getBoundingClientRect(),
        compWidth  = rect.width,
        compHeight = rect.height,
        tipWidth   = $tipPane.width(),
        yOffset,
        left,
        tipHeight,
        $tooltip;

    if (compWidth > 300) {    // weird bug
      compWidth = 120;
    }

    // wrap pane in bubble pane and then empty pane (for mousout)
    $tooltip = $("<div>").append(
      $("<div class='speech-bubble'>").append($tipPane)
    );

    // FIXME: We need a better cross-browser solution for this
    if(typeof InstallTrigger !== 'undefined'){    // Firefox
      yOffset = 180;
      left = pos.left - (2.5*tipWidth)+ (compWidth*0.4);
    } else {
      yOffset = 50;
      left = pos.left - (tipWidth/2)+ (compWidth*0.4);
    }

    this.holder.append($tooltip);

    tipHeight = $tipPane.height();

    $tooltip.css({
      position: "absolute",
      left:     left,
      top:      pos.top - tipHeight - yOffset,
      height:   tipHeight + compHeight + yOffset,
      zIndex:   1000
    });

    // delete on mouseout
    $tooltip.mouseleave(function(){
      $tooltip.fadeOut( function() { $(this).remove(); });
    });
  };

  var SVGImage = function(brd, uid) {
    this.comp = brd.component[uid];
    this.brd = brd;
    // main model
    this.view = this.comp.element.view;
    this.cnv = context2d();
    this.ctx = context2d();

    // calc most used variables
    this.ozoom = 1 / board.options.magnifier.zoom;
    this.zoom = board.options.magnifier.zoom;
    this.w = this.brd.holder.w * this.zoom;
    this.h = this.brd.holder.h * this.zoom;

    // set dimention (w * h) for canvas
    this.cnv.canvas.height = this.ctx.canvas.height = this.h;
    this.cnv.canvas.width = this.ctx.canvas.width = this.w;

    // add pattern image of element
    SVGImage[this.comp.type].call(this);

    this.update();
  };

  SVGImage.prototype.update = function() {
    var ctx = this.cnv, elem = this.comp, path, trns, p, l, i;

  // clear context, common part
    this.cnv.clearRect(0, 0, this.w, this.h);
    this.cnv.save();
  // set zoom transform, common part
    this.cnv.scale(this.zoom, this.zoom);

  // draw leads, common part
    for (i = elem.leads.length; i--; ) {
      path = elem.leads[i].state.path;
      trns = path[0].getCTM();
      for (p = 0, l = path.length; p < l; p++) {
        SVGImage.draw_path.call(this, ctx, path[p], trns);
      }
    }

  // draw connector, common part
    path = elem.connector.view.path;
    for (p = 0, l = path.length; p < l; p++) {
      trns =  path[p].getCTM();
      SVGImage.draw_path.call(this, ctx, path[p], trns);
    }

  // draw pattern, spetial part
    this.cnv.save();
    // set reversed transforms
    this.cnv.transform(0.05, 0, 0, 0.05, 0, -50);
    this.cnv.transform(0.8, 0, 0, 0.8, 0, 0);
    // set real transform

    var t = this.view.attr('transform');
    // fix bug in IE with transforms
    t = t.replace(/\) rotate/g,')#rotate')
      .replace(/ /g,',').replace(/#/, ' ');
    t = t.split(' ');
    var t1 = getTransform(t[0]);
    var t2 = getTransform(t[1]);
    this.cnv.translate(t1[0], t1[1]);
    this.cnv.translate(t2[1], t2[2]);
    this.cnv.rotate(t2[0]*Math.PI/180);
    this.cnv.translate(-t2[1], -t2[2]);
    // set reversed spetial transform
    this.cnv.translate(-5000, -5000);
    // set other reversed transforms
    this.cnv.transform(1.25, 0, 0, 1.25, 0, 0);
    this.cnv.transform(20, 0, 0, 20, 0, 1000);
    this.cnv.scale(this.ozoom, this.ozoom);
    // draw pattern element
    this.cnv.drawImage(this.ctx.canvas, 0, 0, this.w, this.h);
    // restore context
    this.cnv.restore();

    // debugging
    //this.cnv.canvas.style.border = "1px solid blue";
    //document.body.appendChild(this.cnv.canvas);

    this.cnv.restore();
    return this.cnv.canvas;
  };

  SVGImage.wire = function(elem) {
    // Nothing to do
  };

  SVGImage.battery = function(elem) {
    // Nothing to do
  };

  SVGImage.capacitor = function(elem) {
    var path = this.comp.element.view.path;

    // set zoom transform
    this.ctx.scale(this.zoom, this.zoom);
    // set transform from svg (just copy by hand)
    this.ctx.transform(0.05, 0, 0, 0.05, 0, -50);
    this.ctx.transform(0.8, 0, 0, 0.8, 0, 0);
    // set spetial transform, to make element visible on canvas
    this.ctx.translate(5000, 5000);
    // set this element group transform
    var t = getTransform(this.view.children().first().attr('transform'));
    this.ctx.transform(t[0], t[1], t[2], t[3], t[4], t[5]);

    path = this.view.path;
    for (var p = 0, l = path.length; p < l; p++) {
      SVGImage.draw_path.call(this, this.ctx, path[p]);
    }

    // debugging
    //this.ctx.canvas.style.border = "1px solid red";
    //document.body.appendChild(this.ctx.canvas);
  };

  SVGImage.inductor = function(elem) {
    var path = this.comp.element.view.path, g, t;

    // set zoom transform
    this.ctx.scale(this.zoom, this.zoom);
    // set transform from svg (just copy by hand)
    this.ctx.transform(0.05, 0, 0, 0.05, 0, -50);
    this.ctx.transform(0.8, 0, 0, 0.8, 0, 0);
    // set spetial transform, to make element visible on canvas
    this.ctx.translate(5000, 5000);
    // set this element group transform

    g = this.view.children();
    t = getTransform(g.attr('transform'));
    this.ctx.transform(t[0], t[1], t[2], t[3], t[4], t[5]);

    g = this.view.children().children().not('[type="label"]');
    for (var i = 0, l = g.length; i< l; i++) {
      t = getTransform(g[i].getAttribute('transform'));
      this.ctx.save();
      this.ctx.transform(t[0], t[1], t[2], t[3], t[4], t[5]);
      path = $(g[i]).children()[0];
      SVGImage.draw_path.call(this, this.ctx, path);
      this.ctx.restore();
    }

    // debugging
    //this.ctx.canvas.style.border = "1px solid red";
    //document.body.appendChild(this.ctx.canvas);
  };

  SVGImage.resistor = function(elem) {
    var g, u, t, i, l;

    // set zoom transform
    this.ctx.scale(this.zoom, this.zoom);
    // set transform from svg (just copy by hand)
    this.ctx.transform(0.05, 0, 0, 0.05, 0, -50);
    this.ctx.transform(0.8, 0, 0, 0.8, 0, 0);
    // set spetial transform, to make element visible on canvas
    this.ctx.translate(5000, 5000);
    // set this element group transform

    this.ctx.transform(15, 0, 0, 15, 0, 150);
    this.ctx.scale(0.6, 0.6);

    g = this.view.children().children().not('[type="label"]');

    u = g.children('use').not('[type="hint"]');
    this.ctx.save();
    this.ctx.translate(-94, -32);
    for (i = 0, l = u.length; i< l; i++) {
      SVGImage.draw_use.call(this, this.ctx, u[i]);
    }
    this.ctx.restore();

    g = g.children('g');
    for (i = 0, l = g.length; i< l; i++) {
      this.ctx.save();

      g[i] = $(g[i]);

      t = g[i].attr('transform');
      // fix bug in IE with transforms
      t = t.replace(/\) rotate/g,')#rotate')
        .replace(/ /g,',').replace(/#/, ' ');
      t = t.split(' ');
      var t1 = getTransform(t[0]);
      this.ctx.translate(t1[0], t1[1]);
      if (t[1]) {
        var t2 = getTransform(t[1]);
        this.ctx.scale(t2[0], t2[1]);
      }
      u = g[i].children()[0];
      SVGImage.draw_use.call(this, this.ctx, u);
      this.ctx.restore();
    }

    // debugging
    //this.ctx.canvas.style.border = "1px solid red";
    //document.body.appendChild(this.ctx.canvas);
  };

  SVGImage.probe = function(brd, elem) {
    // main model
    this.view = elem.view;
    this.cnv = context2d();
    this.ctx = context2d();

    // calc most used variables
    this.ozoom = 1 / board.options.magnifier.zoom;
    this.zoom = board.options.magnifier.zoom;
    this.w = brd.holder.w * this.zoom;
    this.h = brd.holder.h * this.zoom;

    // set dimention (w * h) for canvas
    this.cnv.canvas.height = this.ctx.canvas.height = this.h;
    this.cnv.canvas.width = this.ctx.canvas.width = this.w;

    // add pattern image of element
    SVGImage.probe.template.call(this);

    // update
    this.update();
  };

  SVGImage.probe.prototype.update = function() {
    // clear context, common part
    this.cnv.clearRect(0, 0, this.w, this.h);
    this.cnv.save();

    // set real transforms
    this.cnv.scale(this.zoom, this.zoom);
    this.cnv.transform(0.05, 0, 0, 0.05, 0, -100);
    var t = this.view.attr('transform');
    if (t) {
      t = getTransform(t);
      this.cnv.translate(t[0], t[1]);
    }

    t = this.view.children().attr('transform');
    if (t) {
      t = getTransform(t);
      this.cnv.translate(t[0], t[1]);
    }

    t = this.view.children().children().attr('transform');
    t = getTransform(t);

    // set reversed transforms
    this.cnv.translate(this.rt[0], this.rt[1]);
    this.cnv.transform(20, 0, 0, 20, 0, 2000);
    this.cnv.scale(this.ozoom, this.ozoom);

    // draw template image
    this.cnv.drawImage(this.ctx.canvas, 0, 0, this.w, this.h);

    // debugging
    //this.cnv.canvas.style.border = "1px solid blue";
    //document.body.appendChild(this.cnv.canvas);

    this.cnv.restore();
    return this.cnv.canvas;
  };

  SVGImage.probe.template = function() {
    var t = this.view.attr('transform-full-visibility');
    t = getTransform(t);

    this.ctx.save();
    // add pattern image of element
    this.ctx.scale(this.zoom, this.zoom);
    this.ctx.transform(0.05, 0, 0, 0.05, 0, -100);
    this.ctx.translate(t[0], t[1]);

    // draw all elements, skip type="initial". used as (0, 0)
    this.view.children().children().each(
      SVGImage.probe.template_draw(this.ctx)
    );
    this.ctx.restore();

    // save reversed transform, for update
    this.rt = [-t[0], -t[1]];

    // debugging
    //this.ctx.canvas.style.border = "1px solid blue";
    //document.body.appendChild(this.ctx.canvas);
  };

  SVGImage.probe.template_draw = function(ctx) {
    return function() {
      var elem = $(this), name = this.nodeName.toLowerCase();
      if (name == 'g') {
        ctx.save();
        var t = this.getAttribute('transform');
        if (t) {

          t = getTransform(t);
          ctx.transform(t[0], t[1], t[2], t[3], t[4], t[5]);
        }
        //console.log('g >> ', this.getAttribute('transform'));
        elem.children().each(
          SVGImage.probe.template_draw(ctx)
        );
        ctx.restore();
      } else
      if (name == 'path') {
        //console.log('path >> ', this.getAttribute('transform'))
        SVGImage.draw_path(ctx, this);
      }
    };
  };

  SVGImage.draw_use = function(ctx, use, trn) {
    ctx.save();

    if (trn) {
      ctx.transform(trn.a, trn.b, trn.c, trn.d, trn.e, trn.f);
    }

    var xlink = use.getAttribute('xlink:href').replace('#','');
    var img = SVGStorage.defs[xlink];
    var x = parseInt(use.getAttribute('x'), 10);
    var y = parseInt(use.getAttribute('y'), 10);
    var ox = parseInt(img.ox, 10);
    var oy = parseInt(img.oy, 10);

    ctx.drawImage(img, x + ox, y + oy, img.width, img.height);

    ctx.restore();
  };

  SVGImage.draw_path = function(ctx, path, trn) {
    ctx.save();

    if (trn) {
      ctx.transform(trn.a, trn.b, trn.c, trn.d, trn.e, trn.f);
    }

    var str_lj = path.getAttribute('stroke-linejoin') || false;
    var str_lc = path.getAttribute('stroke-linecap') || false;
    var str_w = parseInt(path.getAttribute('stroke-width'), 10);
    var str_c = path.getAttribute('stroke');
    var fill = path.getAttribute('fill'), f;

    if (str_c) {ctx.strokeStyle = str_c;}
    if (str_w) {ctx.lineWidth = str_w;}
    if (str_lj) {ctx.lineJoin = str_lj;}
    if (str_lc) {ctx.lineCap = str_lc;}

    ctx.beginPath();

    var segs = path.pathSegList;
    for (var i = 0, len = segs.numberOfItems; i < len; i++) {
      var seg = segs.getItem(i), c = seg.pathSegTypeAsLetter;
      if (c == "M") {
        ctx.moveTo(seg.x, seg.y);
      } else
      if (c == "L") {
        ctx.lineTo(seg.x, seg.y);
      } else
      if (c == "Q") {
        ctx.quadraticCurveTo(seg.x1, seg.y1, seg.x, seg.y);
      } else
      if (c == "A") {
       ctx.arc(seg.x - seg.r1, seg.y, seg.r1, 0, Math.PI * 2, true);
      } else
      if (c == "Z") {
        ctx.closePath();
      }
    }

    if (str_c) {ctx.stroke();}

    if (fill && fill != 'none') {
      if (fill.substring(0,3) == 'url') {
        fill = fill.replace(/url\(/gm,'');
        fill = fill.replace(/\)/gm,'');
        f = this.brd.holder.find(fill);
        SVGImage["draw_"+ f[0].nodeName.toLowerCase()](ctx, f);
      } else {
        ctx.fillStyle = fill;
        ctx.fill();
      }
    }

    ctx.restore();
  };

  SVGImage.draw_lineargradient = function(ctx, f) {
    var x1 = parseFloat(f.attr('x1'), 10);
    var y1 = parseFloat(f.attr('y1'), 10);
    var x2 = parseFloat(f.attr('x2'), 10);
    var y2 = parseFloat(f.attr('y2'), 10);

    var trn = (f[0].getAttribute('gradientTransform') || '')
         .replace(/\)/,'').replace(/matrix\(/,'').split(' ');

    ctx.save();

    if (trn) {
      ctx.transform(
        parseFloat(trn[0], 10), parseFloat(trn[1], 10),
        parseFloat(trn[2], 10), parseFloat(trn[3], 10),
        parseFloat(trn[4], 10), parseFloat(trn[5], 10)
      );
    }

    var grad = ctx.createLinearGradient(x1, y1, x2, y2);

    var s = f.children('stop'), i, l;
    for (i = 0, l = s.length; i < l; i++) {
      grad.addColorStop(
        parseFloat(s[i].getAttribute('offset'), 10) ,
        s[i].getAttribute('stop-color-rgba')
      );
    }

    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  };

  SVGImage.draw_radialgradient = function(ctx, f) {
    var fx = parseFloat(f.attr('fx'), 10);
    var fy = parseFloat(f.attr('fy'), 10);
    var cx = parseFloat(f.attr('cx'), 10);
    var cy = parseFloat(f.attr('cy'), 10);
    var r = parseFloat(f.attr('r'), 10);
    var trn = (f[0].getAttribute('gradientTransform') || '')
         .replace(/\)/,'').replace(/matrix\(/,'').split(' ');

    ctx.save();

    if (trn) {
      ctx.transform(
        parseFloat(trn[0], 10), parseFloat(trn[1], 10),
        parseFloat(trn[2], 10), parseFloat(trn[3], 10),
        parseFloat(trn[4], 10), parseFloat(trn[5], 10)
      );
    }

    var grad = ctx.createRadialGradient(fx, fy, 0, cx, cy, r);

    var s = f.children('stop'), i, l;
    for (i = 0, l = s.length; i < l; i++) {
      grad.addColorStop(
        parseFloat(s[i].getAttribute('offset'), 10) ,
        s[i].getAttribute('stop-color-rgba')
      );
    }

    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  };

  // holes constructor

  var CircuitBoardHole = function(elem) {
    this.name = elem.attr('hole');
    this.x = parseInt(elem.attr("transform").match(/(-?\d+\.\d+)|-?\d+/g)[4], 10);
    this.y = parseInt(elem.attr("transform").match(/(-?\d+\.\d+)|-?\d+/g)[5], 10);
    this.num = (elem.attr("xlink:href") == "#$:hole_connected") ? 1 : 0;
    this.view = elem;
  };

  CircuitBoardHole.prototype.connected = function() {
    this.num++;
    this.view.attr("xlink:href", "#$:hole_connected");
    return this;
  };

  CircuitBoardHole.prototype.disconnected = function() {
    if (--this.num === 0) {
      this.view.attr("xlink:href", "#$:hole_not_connected");
    }
    return this;
  };

  CircuitBoardHole.prototype.highlight = function() {
    this.view.attr("xlink:href", "#$:hole_highlighted");
    return this;
  };

  CircuitBoardHole.prototype.unhighlight = function() {
    var pref = (this.num) ? '' : '_not';
    this.view.attr("xlink:href", "#$:hole" + pref + "_connected");
    return this;
  };

  /* === #equipments begin === */

  equipment.multimeter = function(board, params) {
    this.mmbox = new primitive.mmbox(board, params);
    this.probe = {
      "black" : new primitive.probe(board, {
        'connection' : (params['black']) ? params.black.connection : false,
        'draggable' : (params['black']) ? params.black.draggable : false,
        'color' : 'black',
        'name' : 'dmm'
      }),
      "red" : new primitive.probe(board, {
        'connection' : (params['red']) ? params.red.connection : false,
        'draggable' : (params['red']) ? params.red.draggable : false,
        'color' : 'red',
        'name' : 'dmm'
      })
    };
  };

  equipment.oscope = function(board, params) {
    this.probe = {
      "yellow" : new primitive.probe(board, {
        'connection' : (params['yellow']) ? params.yellow.connection : false,
        'draggable' : (params['yellow']) ? params.yellow.draggable : false,
        'color' : 'yellow',
        'name' : 'oscope'
      }),
      "pink" : new primitive.probe(board, {
        'connection' : (params['pink']) ? params.pink.connection : false,
        'draggable' : (params['pink']) ? params.pink.draggable : false,
        'color' : 'pink',
        'name' : 'oscope'
      })
    };
  };

  equipment.battery = function(board, connections) {
    this.view = SVGStorage.create('group').attr({
      'component' : 'battery'
    });

    // main model
    this.btbox = new primitive.btbox(board);

    var loc = connections.split(',');
    this.pts = [board.holes[loc[0]], board.holes[loc[1]]];

    // create leads

    this.leads = addLeads(this.pts, [300, 45], loc, 'battery', false, board);

    // create wires
    this.wires = [
      new primitive.battery_wire('black', this.pts[0]),
      new primitive.battery_wire('red', this.pts[1])
    ];

    this.view.append(this.wires[0].view, this.wires[1].view);
    this.view.append(this.leads[0].view, this.leads[1].view);

    // model for SVGImage
    this.connector = {"view": this.wires[0].view};
    this.element = {"view": this.wires[0].view};
    this.connector.view.path = this.view.children('g:lt(2)').find('path');

  };

  /* === #equipments end === */

  /* === #components begin === */

  component.prototype.init = function(params, holes, board) {
    var loc = params["connections"].split(',');
    this.pts = [holes[loc[0]], holes[loc[1]]];
    this.angle = getAngleBetwPoints(this.pts);
    this.leads = addLeads(this.pts, getDegsFromRad(this.angle), loc, params.UID, params.draggable, board);
    this.view = SVGStorage.create('group').attr({
      'component' : params.type,
      'uid' : params.UID
    });
    this.hole = [this.pts[0].connected(), this.pts[1].connected()];
  };

  component.wire = function(params, holes, board) {
    component.prototype.init.call(this, params, holes, board);
    var color = params.color || "rgb(173,1,1)";
    this.element = new primitive.connector(this.pts, this.angle, [color, color]);
    this.connector = this.element;
    this.view.append(this.element.view, this.leads[0].view, this.leads[1].view);
    // add event handler for draggable
    component.prototype.drag.call(this, params.draggable, params.type);
  };

  component.inductor = function(params, holes, board) {
    component.prototype.init.call(this, params, holes, board);
    this.connector = new primitive.connector(this.pts, this.angle, ['rgb(108,27,13)', 'rgb(185,77,42)']);
    this.element = new primitive.inductor(this.pts, this.angle, params.label);
    this.view.append(this.connector.view, this.leads[0].view, this.leads[1].view, this.element.view);
    // add event handler for draggable
    component.prototype.drag.call(this, params.draggable);
  };

  component.resistor = function(params, holes, board) {
    component.prototype.init.call(this, params, holes, board);
    this.connector = new primitive.connector(this.pts, this.angle);
    this.element = new primitive.resistor(this.pts, this.angle, params.label, params.color);
    this.view.append(this.leads[0].view, this.leads[1].view, this.connector.view, this.element.view);
    // add event handler for draggable
    component.prototype.drag.call(this, params.draggable);

    this.changeColors = function(colors) {
      bands = this.view.find('[type^=band]');
      bands.each(function(i) {
        if (i != (colors.length - 1)) {
          $(this).attr('xlink:href', '#:$:band-s-' + colors[i]);
        } else {
          $(this).attr('xlink:href', '#:$:band-b-' + colors[i]);
        }
      });
      tooltips = this.view.find('[tooltip^=band]');
      tooltips.each(function(i) {
        $(this).attr('xlink:href', '#:$:resistor-hint-' + colors[i]);
      });
    }
  };

  component.capacitor = function(params, holes, board) {
    component.prototype.init.call(this, params, holes, board);
    var color = params.color || "rgb(255,0,0)";
    this.connector = new primitive.connector(this.pts, this.angle);
    this.element = new primitive.capacitor(this.pts, this.angle, params.label, color);
    this.view.append(this.leads[0].view, this.leads[1].view, this.connector.view, this.element.view);
    // add event handler for draggable
    component.prototype.drag.call(this, params.draggable);
  };

  component.prototype.drag = function(draggable, type) {
    if (draggable) {
      var self = this;
      this.x = 0;
      this.y = 0;
      if (type == 'wire') {
        this.view.find('[drag=area]').attr('display', 'inline');
      }
      this.element.view[0].addEventListener(_mousedown, function(evt) {
        self.element.view.data('component', self);
        evt._target = this;
      }, false);
    }
  };

  /* === #components end === */

  /* === #primitive begin === */

  primitive.prototype.initComponentDraggable = function(board) {
    var component, s_pos, c_pos, x = 0, y = 0, coeff = 25, dx, dy;
    var l1, l2, ho1, ho2, hn1, hn2, c, deg, angle;
    var hi1, hi2;
    var p1 = {
      x : 0,
      y : 0
    }, p2 = {
      x : 0,
      y : 0
    }, pts = [p2, p1];

    board.holder[0].addEventListener(_mousedown, function(evt) {
      if (!evt.touches || evt.touches.length == 1) {
        component = $(evt._target).data('component') || null;
        if (component) {
          s_pos = getCoords(evt, board.holder);

          l1 = component.leads[0];
          l2 = component.leads[1];

          p1.x = l1.x;
          p1.y = l1.y;
          p2.x = l2.x;
          p2.y = l2.y;

          ho1 = component.hole[0].highlight();
          ho2 = component.hole[1].highlight();
          hi1 = hn1 = ho1;
          hi2 = hn2 = ho2;

          board.toFront(component);
          evt.preventDefault();
        }
      }
    }, false);

    board.holder[0].addEventListener(_mousemove, function(evt) {
      if (!evt.touches || evt.touches.length == 1) {
        if (component) {
          c_pos = getCoords(evt, board.holder);
          dx = c_pos.x - s_pos.x;
          dy = c_pos.y - s_pos.y;
          x = component.x + dx * coeff;
          y = component.y + dy * coeff;
          // update view of component
          component.view.attr('transform', 'translate(' + x + ',' + y + ')');
          // highlight nearest holes
          p1.x = l1.x + dx * coeff;
          p1.y = l1.y + dy * coeff;
          p2.x = l2.x + dx * coeff;
          p2.y = l2.y + dy * coeff;
          hn1 = board.holes.find(p1);
          hn2 = board.holes.find(p2);
          if (hi1 || hi2) {
            hi1.disconnected().highlight();
            hi2.disconnected().highlight();
            hi1 = hi2 = null;
            // sent event to model
            if (l1.state != l1.view_d) {
              l1.board.sendEventToModel("connectionBroken", [l1.name, l1.hole]);
            }
            if (l2.state != l2.view_d) {
              l2.board.sendEventToModel("connectionBroken", [l2.name, l2.hole]);
            }
          }
          if (hn1 != ho1) {
            ho1.unhighlight();
            ho1 = hn1.highlight();
          }
          if (hn2 != ho2) {
            ho2.unhighlight();
            ho2 = hn2.highlight();
          }
        }
      }
    }, false);

    board.holder[0].addEventListener(_mouseup, function(evt) {
      if (!evt.touches || evt.touches.length === 0) {
        if (component) {
          // snap to nearest holes
          component.hole[0] = hn1;
          component.hole[1] = hn2;
          l1.hole = hn1.name;
          l2.hole = hn2.name;
          component.x = 0;
          component.y = 0;
          // update all primitives
          p1.x = l1.x = hn1.x;
          p1.y = l1.y = hn1.y;
          p2.x = l2.x = hn2.x;
          p2.y = l2.y = hn2.y;
          // update view
          hn1.unhighlight();
          hn2.unhighlight();
          if (!hi1) {
            hn1.connected();
            l1.connect();
          }
          if (!hi2) {
            hn2.connected();
            l2.connect();
          }
          updateComponentView();
          // reset temp variables
          component = null;
          hn1 = null;
          hn2 = null;
        }
      }
    }, false);

    var updateComponentView = function() {
      c = {
        x : (p1.x + p2.x) / 2,
        y : (p1.y + p2.y) / 2
      };
      angle = getDegsFromRad(getAngleBetwPoints(pts));
      deg = (angle > 90 || angle < -90) ? (angle + 180) : angle;
      // update view of primitives
      component.view.removeAttr('transform');
      l1.view.attr('transform', 'translate(' + l1.x + ',' + l1.y + ') rotate(' + angle + ',130,130)');
      l2.view.attr('transform', 'translate(' + l2.x + ',' + l2.y + ') rotate(' + angle + ',130,130)');
      component.element.view.attr('transform', 'translate(' + c.x + ',' + c.y + ') rotate(' + deg + ',132.5,132.5)');
      setConnectorView(component.connector.view, pts, angle);
      component.image.update();
    };

  };

  primitive.prototype.initLeadDraggable = function(board) {
    var lead_this, lead_pair, component, coeff = 25;
    // coeff = 1 / (0.05*0.8)
    var s_pos, c_pos, dx, dy, pts, angle, c;
    var p1 = {
      x : 0,
      y : 0
    }, p2 = {
      x : 0,
      y : 0
    }, deg, hi, ho, hn;

    board.holder[0].addEventListener(_mousedown, function(evt) {
      if (!evt.touches || evt.touches.length == 1) {
        lead_this = $(evt.target).data('primitive-lead') || null;
        if (lead_this) {
          component = board.component[lead_this.name];
          lead_pair = findLeadPair(component, lead_this);
          hi = board.holes.find(lead_this).highlight();
          hn = ho = hi;
          s_pos = getCoords(evt, board.holder);
          p2.x = lead_pair.x;
          p2.y = lead_pair.y;
          pts = (lead_this.orientation == 1) ? [p1, p2] : [p2, p1];
          evt.preventDefault();
        }
      }
    }, false);

    board.holder[0].addEventListener(_mousemove, function(evt) {
      if (!evt.touches || evt.touches.length == 1) {
        if (lead_this) {
          // calc move params
          c_pos = getCoords(evt, board.holder);
          dx = c_pos.x - s_pos.x;
          dy = c_pos.y - s_pos.y;
          p1.x = lead_this.x + dx * coeff;
          p1.y = lead_this.y + dy * coeff;
          // update view of component
          updateComponentView();
          // update flag for hover events
          lead_this.isDragged = true;
          // find the nearest hole
          hn = board.holes.find(p1);
          board.hole_target = hn;
          if (hi) {
            hi.disconnected().highlight();
            hi = null;
            // sent event to model
            if (lead_this.state != lead_this.view_d) {
              lead_this.board.sendEventToModel("connectionBroken", [lead_this.name, lead_this.hole]);
            }
          }
          if (hn != ho) {
            ho.unhighlight();
            ho = hn.highlight();
          }
        }
      }
    }, false);

    board.holder[0].addEventListener(_mouseup, function(evt) {
      if (!evt.touches || evt.touches.length === 0) {
        if (lead_this) {
          lead_this.isDragged = false;
          lead_this.x = p1.x = hn.x;
          lead_this.y = p1.y = hn.y;
          lead_this.hole = hn.name;
          component.hole[0] = board.holes[lead_this.hole];
          component.hole[1] = board.holes[lead_pair.hole];
          updateComponentView();
          hn.unhighlight();
          if (!hi) {
            lead_this.connect();
            hn.connected();
          }
          // reset temp links
          hn = null;
          ho = null;
          lead_this = null;
          lead_pair = null;
        }
        if ($(evt.target).data('component-lead')) {
          var name = $(evt.target).data('component-lead');
          board.component[name].image.update();
        }
      }
    }, false);

    var updateComponentView = function() {
      lead_this.arrow.hide();
      c = {
        x : (p1.x + p2.x) / 2,
        y : (p1.y + p2.y) / 2
      };
      angle = getDegsFromRad(getAngleBetwPoints(pts));
      deg = (angle > 90 || angle < -90) ? (angle + 180) : angle;
      // update view of primitives
      lead_this.view.attr('transform', 'translate(' + p1.x + ',' + p1.y + ') rotate(' + angle + ',130,130)');
      lead_pair.view.attr('transform', 'translate(' + p2.x + ',' + p2.y + ') rotate(' + angle + ',130,130)');
      component.element.view.attr('transform', 'translate(' + c.x + ',' + c.y + ') rotate(' + deg + ',132.5,132.5)');
      setConnectorView(component.connector.view, pts, angle);
    };

  };

  primitive.lead = function(type, pos, angle, draggable) {
    var lead = SVGStorage.create('lead').clone(), self = this;
    this.view_d = lead.find('[type="disconnected"]').hide();
    this.view_d.path = this.view_d.find('[type="wire"]>path');
    this.view_c = lead.find('[type="connected"]').show();
    this.view_c.path = this.view_c.find('[type="wire"]>path');

    // name of component
    this.name = pos.name;
    // name of hole
    this.hole = pos.hole;
    // link to change colors
    this.wire = lead.find('[type="wire"] path');
    // link to current visible lead
    this.state = this.view_c;
    // link to probe;
    this.probe = false;

    // set the right direction
    this.orientation = (type == 'left') ? 1 : -1;
    lead.find('[type="orientation"]').attr({
      "transform" : 'matrix(' + self.orientation + ' 0 0 1 0 0)'
    });

    // set the position
    lead.attr("transform", "matrix(1 0 0 1 " + pos.x + " " + pos.y + ") rotate(" + (180 + angle) + ",130,130)");
    this.x = pos.x;
    this.y = pos.y;

    this.arrow = lead.find('.arrow').hide();
    // bind hover events
    var action = lead.find("[type=action]");
    if (!touch) {
      action.bind('mouseover', function() {
        self.arrow.show();
      });
      action.bind('mouseout', function() {
        self.arrow.hide();
      });
    }
    if (draggable) {
      action.data('primitive-lead', this);
    }
    action.data('component-lead', this.name);

    // bind onclick events
    action[0].addEventListener(_mouseup, function(l) {
      var f = false;
      return function() {
        if (!l.isDragged) {
          l[ (f = !f) ? 'disconnect' : 'connect' ]();
        }
      };
    }(this), false);

    this.view = lead;
  };

  primitive.lead.prototype.connect = function() {
    this.state = this.view_c;
    this.view_d.hide();
    this.view_c.show();
    this.snapProbe();
    this.board.sendEventToModel("connectionMade", [this.name, this.hole]);
  };

  primitive.lead.prototype.disconnect = function() {
    this.state = this.view_d;
    this.view_c.hide();
    this.view_d.show();
    this.snapProbe();
    this.board.sendEventToModel("connectionBroken", [this.name, this.hole]);
  };

  primitive.lead.prototype.highlight = function(m) {
    var colors = {// colors for each path
      '0' : ['51, 51, 51', '160,160,160', '229,229,229'],
      '1' : [' 51, 51,255', '160,160,255', '229,229,255'],
      '2' : ['130,110,150', '240,220,160', '255,255,255']
    };

    for (var i = 3; i--; ) {
      this.wire[i + 0].setAttribute('stroke', 'rgb(' + colors[m][i] + ')');
      this.wire[i + 3].setAttribute('stroke', 'rgb(' + colors[m][i] + ')');
    }
  };

  primitive.lead.prototype.calcbbox = function() {
    var matrix = this.state[0].getCTM();
    var bbox = this.state[0].getBBox();
    var p = [SVGStorage.point(), SVGStorage.point(), SVGStorage.point(), SVGStorage.point()];
    // top left point
    p[0].x = bbox.x;
    p[0].y = bbox.y;
    // top right point
    p[1].x = bbox.x + bbox.width;
    p[1].y = bbox.y;
    // bottom right point
    p[2].x = bbox.x + bbox.width;
    p[2].y = bbox.y + bbox.height;
    // bottom left point
    p[3].x = bbox.x;
    p[3].y = bbox.y + bbox.height;
    // apply matrix transform to all points
    for (var i = p.length; i--; ) {
      p[i] = p[i].matrixTransform(matrix);
    }
    // return result
    this.state.bbox = p;
  };

  primitive.lead.prototype.hasPoint = function(p) {
    var a, b, c, sa, sb, sc;
    a = this.state.bbox[0];
    b = this.state.bbox[2];
    // first triangle
    c = this.state.bbox[1];
    sa = (a.x - p.x) * (b.y - a.y) - (b.x - a.x) * (a.y - p.y);
    sb = (b.x - p.x) * (c.y - b.y) - (c.x - b.x) * (b.y - p.y);
    sc = (c.x - p.x) * (a.y - c.y) - (a.x - c.x) * (c.y - p.y);
    if ((sa >= 0 && sb >= 0 && sc >= 0) || (sa <= 0 && sb <= 0 && sc <= 0)) {
      return true;
    }
    //second triangle
    c = this.state.bbox[3];
    sa = (a.x - p.x) * (b.y - a.y) - (b.x - a.x) * (a.y - p.y);
    sb = (b.x - p.x) * (c.y - b.y) - (c.x - b.x) * (b.y - p.y);
    sc = (c.x - p.x) * (a.y - c.y) - (a.x - c.x) * (c.y - p.y);
    if ((sa >= 0 && sb >= 0 && sc >= 0) || (sa <= 0 && sb <= 0 && sc <= 0)) {
      return true;
    }
    // return false if no
    return false;
  };

  primitive.lead.prototype.snapProbe = function() {
    if (this.probe) {
      this.probe.snap();
    }
  };

  primitive.connector = function(pts, angle, color) {
    var connector = SVGStorage.create('connector').clone();
    connector.path = connector.find('path');
    angle = getDegsFromRad(angle) + 180;

    setConnectorView(connector, [pts[1], pts[0]], angle);

    if (color !== undefined) {
      connector.find('[type=line]').eq(1).attr('stroke', color[0]);
      connector.find('[type=line]').eq(2).attr('stroke', color[1]);
    }
    this.view = connector;
  };

  primitive.inductor = function(pts, angle, labelText, draggable) {
    var inductor = SVGStorage.create('inductor').clone();
    angle = getDegsFromRad(angle);

    inductor.path = inductor.find('path').not('[type="label-bg"]');

    if (angle > 90 || angle < -90) {
      angle += 180;
    }
    inductor.attr('transform', 'translate(' + parseInt((pts[0].x + pts[1].x) / 2, 10) + ',' + parseInt((pts[0].y + pts[1].y) / 2, 10) + ') rotate(' + angle + ',132.5,132.5)');

    var label = inductor.find('[type=label]');
    if (!touch && labelText) {
      inductor.bind('mouseover', function() {
        label.show();
      });
      inductor.bind('mouseout', function() {
        label.hide();
      });
    } else if (labelText) {
      label.show();
    }
    inductor.find('[type=label_text]').append(labelText);

    this.view = inductor;
  };

  primitive.capacitor = function(pts, angle, labelText, color) {
    var capacitor = SVGStorage.create('capacitor').clone();
    var label = capacitor.find('[type=label]');
    angle = getDegsFromRad(angle);

    capacitor.path = capacitor.find('path');

    if (angle > 90 || angle < -90) {
      angle += 180;
    }
    capacitor.attr('transform', 'translate('+parseInt((pts[0].x + pts[1].x) / 2, 10) + ',' + parseInt((pts[0].y + pts[1].y) / 2, 10) + ') rotate(' + angle + ',132.5,132.5)');

    if (!touch && labelText) {
      capacitor.bind('mouseover', function() {
        label.show();
      });
      capacitor.bind('mouseout', function() {
        label.hide();
      });
    } else if (labelText) {
      label.show();
    }
    capacitor.find('[type=label_text]').append(labelText);
    if (color !== undefined) {
      capacitor.find('[type=cap]').eq(0).attr('fill', color);
    }
    this.view = capacitor;
  };

  primitive.resistor = function(pts, angle, labelText, colors) {
    var resistor = SVGStorage.create('resistor' + colors.length + 'band').clone();
    var tooltip = {};
    var label = resistor.find('[type=label]');
    var band = resistor.find('[type^=band]');
    angle = getDegsFromRad(angle);

    resistor.path = resistor.find('use')
               .not('[type="label-bg"]')
                  .not('[type="hint"]');

    if (angle > 90 || angle < -90) {
      angle += 180;
    }
    resistor.attr('transform', 'translate(' + parseInt((pts[0].x + pts[1].x) / 2, 10) + ',' + parseInt((pts[0].y + pts[1].y) / 2, 10) + ') rotate(' + angle + ',132.5,132.5)');

    band.each(function(i) {
      if (i != (colors.length - 1)) {
        $(this).attr('xlink:href', '#:$:band-s-' + colors[i]);
      } else {
        $(this).attr('xlink:href', '#:$:band-b-' + colors[i]);
      }
    });
    if (!touch) {
      if (labelText) {
        resistor.bind('mouseover', function() {
          label.show();
        });
        resistor.bind('mouseout', function() {
          label.hide();
        });
      }

      band.each(function(i) {
        tooltip[$(this).attr('type')] = resistor.find('[tooltip=' + $(this).attr('type') + ']').attr('xlink:href', '#:$:resistor-hint-' + colors[i]);

        $(this).bind('mouseover', function() {
          $(this).attr('transform', 'scale(1.6)');
          tooltip[$(this).attr('type')].show();
        });
        $(this).bind('mouseout', function() {
          $(this).attr('transform', 'scale(1)');
          tooltip[$(this).attr('type')].hide();
        });
      });
    } else if (labelText) {
      label.show();
    }

    resistor.find('[type=label_text]').append(labelText);

    this.view = resistor;
  };

  primitive.prototype.initProbeDraggable = function(board) {
    var active, lead_new, lead_old, lead_init, point;
    var s_pos, c_pos, x, y, dx, dy, coeff = 20;

    board.holder.find('[info=probe]').each(function() {
      this.addEventListener(_mousedown, function(evt) {
        if (!evt.touches || evt.touches.length == 1) {
          active = $(this).data('primitive-probe') || {};
          if (active.draggable) {
            active.z.attr('transform', active.z.zoom);
            s_pos = getCoords(evt, board.holder);
            calcLeadsBBox.call(board);
            lead_init = active.lead;
            evt.stopPropagation();
            evt.preventDefault();
            // hack to avoid errors if mousedown+mouseup-mousemove
            x = active.dx;
            y = active.dy;
            dx = dy = 0;
          } else {
            active = null;
          }
        }
      }, false);
    });

    board.holder[0].addEventListener(_mousemove, function(evt) {
      if (!evt.touches || evt.touches.length == 1) {
        if (active) {
          c_pos = getCoords(evt, board.holder);
          dx = c_pos.x - s_pos.x;
          dy = c_pos.y - s_pos.y;
          //coord for view translations
          x = active.dx + dx * coeff;
          y = active.dy + dy * coeff;
          active.view.attr('transform', 'translate(' + x + ',' + y + ')');
          //coord for real probe coords
          point = {
            'x' : (active.x + dx),
            'y' : (active.y + dy)
          };
          lead_new = findLeadUnderProbe(board, point);
          if (lead_init) {
            board.sendEventToModel("probeRemoved", [active.name, active.color]);
            lead_init = null;
          }
          if (lead_new) {
            lead_new.highlight(1);
            lead_old = lead_new;
            //active.lead = lead_new;
          } else {
            if (lead_old) {
              lead_old.highlight(0);
              lead_old = null;
            }
          }
        }
      }
    }, false);

    board.holder[0].addEventListener(_mouseup, function(evt) {
      if (!evt.touches || evt.touches.length === 0) {
        if (active) {
          active.z.attr('transform', active.z.init);
          active.x += dx;
          active.y += dy;
          active.dx = x;
          active.dy = y;
          if (lead_new) {
            active.setState(lead_new);
          } else if (active.lead) {
            active.lead = null;
          }
          active.image.update();
          active = null;
        }
      }
    }, false);
  };

  primitive.probe = function(board, params) {
    // shortcats
    var self = this;
    // temp vars
    var point, coeff = 1.25, lead;

    var elem = board.holder.find('[info=probe][name=' + params.color + ']');
    var initial = elem.find('[type=initial]');

    if (params.connection) {// move to this position
      initial.attr('transform', 'translate(' + (board.holes[params.connection].x / coeff) + ',' + (board.holes[params.connection].y / coeff) + ')');
    }

    this.z = elem.find('[type="zooming"]');
    this.z.zoom = this.z.attr('transform-zoomed');
    this.z.init = this.z.attr('transform');

    // make object
    point = getAttractionPoint(elem);
    this.draggable = params.draggable;
    this.color = params.color;
    this.name = params.name;
    this.x = point.x;
    this.y = point.y;
    this.lead = null;
    this.dx = 0;
    this.dy = 0;
    this.view = elem;
    this.view.show = self.show;
    this.view.hide = self.hide;
    this.view.data('primitive-probe', this);
    this.image = new SVGImage.probe(board, this);

    if (params.connection) {// snap to lead
      calcLeadsBBox.call(board);
      lead = findLeadUnderProbe(board, {
        'x' : this.x,
        'y' : this.y
      });
      if (lead) {
        this.setState(lead);
      }
    }

  };

  primitive.probe.prototype.setState = function(lead) {
    this.lead = lead;
    this.lead.probe = this;
    this.lead.highlight(2);
    this.snap();
    lead.board.sendEventToModel("probeAdded", [this.name, this.color, this.lead.hole]);
  };

  primitive.probe.prototype.snap = function() {
    if (this.lead) {
      var p = getAttractionPoint(this.lead.state);
      var coeff = 20;
      var dx = p.x - this.x;
      var dy = p.y - this.y;
      var x = this.dx + dx * coeff;
      var y = this.dy + dy * coeff;
      this.view.attr('transform', 'translate(' + x + ',' + y + ')');
      //coord for real probe coords
      this.x += dx;
      this.y += dy;
      this.dx = x;
      this.dy = y;
    }
  };

  primitive.probe.prototype.show = function() {
    this.css('visibility', 'visible');
  };

  primitive.probe.prototype.hide = function() {
    this.css('visibility', 'hidden');
  };

  primitive.mmbox = function(board, params) {
    this.view = board.holder.find('[info="multimeter"]');
    this.bttn = this.view.find('[info="dmm-bttn"]');
    this.over = this.view.find('[info="dmm-zoom"]');
    this.item = this.view.find('[info="dmm-box"]');
    this.help = this.view.find('[info="zoom-in"]');
    this.board = board;
    this.zoom = 0;
    // 0-normal view, not zoomed, 1-zoomed
    this.state = null;

    this.screen = this.view.find('[type="dmm-screen-digits"]').children('use');

    this.setState(this.model(params.dial || 0));

    var self = this;

    if (!touch) {
      this.view.bind('mouseenter', function() {
        if (!self.zoom) {
          self.help.show();
        }
      });
      this.view.bind('mouseleave', function() {
        self.help.hide();
        //self.zoomOut();
      });
    }

    // hover helps
    this.view.find('.help').each(function() {
      var elem = $(this);
      var usual = elem.find('.usual').show();
      var hover = elem.find('.hover').hide();
      var bttn = elem.find('.event');

      if (!touch) {
        bttn.bind('mouseenter', function() {
          usual.hide();
          hover.show();
        });
        bttn.bind('mouseleave', function() {
          hover.hide();
          usual.show();
        });
      }
    });

    this.view[0].addEventListener(_mousedown, function(evt) {
      if (!self.zoom) {
        self.zoomIn();
      }
      evt.stopPropagation();
      evt.preventDefault();
    }, false);
    board.holder[0].addEventListener(_mousedown, function(evt) {
      if (self.zoom) {
        self.zoomOut();
      }
    }, false);

    // bind events for bttn (tumbler)
    this.point_center = null;
    this.point_calibr = null;
    var tumbler_on = false;

    this.bttn[0].addEventListener(_mousedown, function(evt) {
      self.point_center = getAttractionPoint(self.view, 'point-center');
      self.point_calibr = getAttractionPoint(self.view, 'point-calibr');
      self.rotate(getCoords(evt, board.holder));
      tumbler_on = true;
    }, false);
    this.bttn[0].addEventListener(_mousemove, function(evt) {
      if (tumbler_on) {
        self.rotate(getCoords(evt, board.holder));
      }
    }, false);
    board.holder[0].addEventListener(_mouseup, function(evt) {
      self.point_center = null;
      self.point_calibr = null;
      tumbler_on = false;
    }, false);
  };

  primitive.mmbox.prototype.model = function(v) {
    var n = isNaN(parseInt(v, 10)) ? 1 : 0;
    var k, i, d, md = 360;
    var stack = [[0, 'acv_750'], [17, 'acv_200'], [35, 'p_9v'], [52, 'dca_200mc'], [70, 'dca_2000mc'], [88, 'dca_20m'], [105, 'dca_200m'], [122, 'c_10a'], [140, 'hfe'], [159, 'diode'], [178, 'r_200'], [196, 'r_2000'], [215, 'r_20k'], [233, 'r_200k'], [252, 'r_2000k'], [270, 'dcv_200m'], [288, 'dcv_2000m'], [306, 'dcv_20'], [324, 'dcv_200'], [342, 'dcv_1000']];
    if (!n) {
      v = parseInt(v, 10);
      for ( i = stack.length; i--; ) {
        d = Math.abs(stack[i][n] - v);
        if (d > 180) {
          d = 360 - d;
        }
        if (d < md) {
          md = d;
          k = i;
        }
      }
      v = stack[k][n];
    }
    for ( i = stack.length; i--; ) {
      if (stack[i][n] == v) {
        return stack[i];
      }
    }
  };

  primitive.mmbox.prototype.rotate = function(p) {
    var p1 = {
      'x' : (this.point_calibr.x - this.point_center.x),
      'y' : (this.point_calibr.y - this.point_center.y)
    };
    var p2 = {
      'x' : (p.x - this.point_center.x),
      'y' : (p.y - this.point_center.y)
    };
    var l1 = Math.sqrt(p1.x * p1.x + p1.y * p1.y);
    var l2 = Math.sqrt(p2.x * p2.x + p2.y * p2.y);

    var angle = getDegsFromRad(Math.acos((p1.x * p2.x + p1.y * p2.y) / (l1 * l2)));

    if (p2.x < 0) {
      angle = 360 - angle;
    }

    var model = this.model(angle);

    if (this.state != model[1]) {
      this.setState(model);
    }
  };

  primitive.mmbox.prototype.setState = function(state) {
    this.bttn.attr('transform', 'rotate(' + state[0] + ')');
    this.state = state[1];
    this.board.sendEventToModel("dmmDialMoved", [this.state]);
  };

  primitive.mmbox.prototype.zoomOut = function() {
    this.item.attr('transform', 'scale(0.50)');
    this.over.show();
    this.zoom = 0;
  };

  primitive.mmbox.prototype.zoomIn = function() {
    this.item.attr('transform', 'scale(1.00)');
    this.help.hide();
    this.over.hide();
    this.zoom = 1;
  };

  primitive.btbox = function(board) {
    var self = this;

    this.view = board.holder.find('[info="battery"]');

    this.view[0].addEventListener(_mouseup, function() {
      self.view.attr('transform', 'scale(1.5)');
      if (touch) {
        setTimeout(function() {
          self.view.attr('transform', 'scale(1)');
        }, 3000);
      }
    });
    this.view[0].addEventListener(_mouseout, function() {
      self.view.attr('transform', 'scale(1)');
    });
  };

  primitive.battery_wire = function(name, point) {
    this.view = SVGStorage.create('battery_wire_' + name).clone();
    this.view.attr('transform', 'translate('+ point.x +','+ point.y +') rotate(0,0,0)');
  };

  /* === #primitive end === */

  /* === #utils start === */

  var context2d = function() {
    return document.createElement('canvas').getContext('2d');
  };
  var addLeads = function(pts, angle, loc, name, drag, board) {
    var leads = ["right", "left"], angles = [];
    angles = ($.isArray(angle)) ? [angle[0], angle[1]] : [angle, angle];

    for (var i = 0; i < leads.length; i++) {
      leads[i] = new primitive.lead(leads[i], {
        x : pts[i].x,
        y : pts[i].y,
        hole : loc[i],
        name : name
      }, angles[i], drag);
      leads[i].board = board;
      leads[i].connect();
    }
    return leads;
  };
  var setConnectorView = function(elem, pts, deg) {
    // calc transforms
    var trn = 'translate(' + parseInt(pts[0].x, 10) + ',' + parseInt(pts[0].y, 10) + ') rotate(' + deg + ',130,130)';
    // calc path
    var leadLenght = 560, coeff = 0.6;
    var dx = pts[0].x - pts[1].x, dy = pts[0].y - pts[1].y;
    var l = Math.sqrt(dx * dx + dy * dy) - leadLenght * 2;
    var path = 'M 0 0 L ' + l / coeff + ' 0';
    if (l > 0) {
      elem.find('[drag=area]').attr('width', l / coeff);
    }
    // set view
    elem.attr('transform', trn);
    elem.find('[type=line]').each(function() {
      this.setAttribute('d', path);
    });
  };
  var calcLeadsBBox = function() {
    for (var i = this.itemslist.length; i--; ) {
      for (var j = this.itemslist[i].leads.length; j--; ) {
        this.itemslist[i].leads[j].calcbbox();
      }
    }
  };
  var findLeadUnderProbe = function(self, point) {
    for (var i = self.itemslist.length; i--; ) {
      for (var j = self.itemslist[i].leads.length; j--; ) {
        var lead = self.itemslist[i].leads[j];
        if (lead.hasPoint(point)) {
          return lead;
        }
      }
    }
    return false;
  };
  var findLeadPair = function(elem, lead) {
    return (elem.leads[0] === lead) ? elem.leads[1] : elem.leads[0];
  };
  var findNearestHole = function(p) {
    p.y = Math.round(p.y / 50) * 50;
    p.x = Math.round(p.x / 50) * 50;
    var yd, yu, xd, xu, x, y;
    yd = yu = p.y, xd = xu = p.x;
    // first, find neares row
    while (true) {
      if (this.row[yd]) {
        y = yd;
        break;
      }
      if (this.row[yu]) {
        y = yu;
        break;
      }
      yd += 50, yu -= 50;
    }
    // second, find nearest cell
    while (true) {
      if (this.row[y][xd]) {
        x = xd;
        break;
      }
      if (this.row[y][xu]) {
        x = xu;
        break;
      }
      xd += 50, xu -= 50;
    }
    // return result
    return this.row[y][x];
  };
  var getAttractionPoint = function(elem, name) {
    name = name || 'attraction';
    var point = elem.find('[type="'+name+'"]')[0];
    var matrix = point.getCTM();
    var bbox = point.getBBox();
    var p = SVGStorage.point();
    p.x = bbox.x + bbox.width / 2;
    p.y = bbox.y + bbox.height / 2;
    return p.matrixTransform(matrix);
  };
  var getAngleBetwPoints = function(pts) {
    return Math.atan2((pts[1].y - pts[0].y), (pts[1].x - pts[0].x));
  };
  var getDegsFromRad = function(rad) {
    return (180 / Math.PI) * rad;
  };
  var getCoords = function(evt, area) {
    evt = evt || window.event;
    var offset = area.offset();

    var posx = 0, posy = 0;

    if (evt.pageX || evt.pageY) {
      posx = evt.pageX;
      posy = evt.pageY;
    } else if (evt.clientX || evt.clientY) {
      posx = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      posy = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    if (evt.changedTouches) {
      posx = evt.changedTouches[0].pageX;
      posy = evt.changedTouches[0].pageY;
    }

    return {
      x : (parseInt(posx, 10) - offset.left),
      y : (parseInt(posy, 10) - offset.top)
    };
  };
  var getTransform = function(trns) {
    trns = trns.replace(/,/g, ' ');
    var name = trns.match(/^[^\(]*/)[0];
    trns = trns.match(/\([^\)]*\)/)[0];
    trns = trns.replace(/\(|\)/g, '');
    trns = trns.split(' ');
    for (var i = trns.length; i--; ) {
      trns[i] = parseFloat(trns[i], 10);
    }
    trns.name = name;
    return trns;
  };
  /* === #utils stop === */

  var SVGStorage = function(data) {
    var h = "data:image/svg+xml;base64,";
    var self = this, svg, a, b;

    // create all image data resources
    this.info = {
      'svghead': data.match(/<svg[^>]*>/)[0] ,
      'boardhl': new Image(),
      'svghole': ''
    };
    // board with holes
    a = data.search('<!-- breadboard start -->');
    b = data.search('<!-- breadboard end -->');
    svg += data.substring( (a + 25), b);
    a = data.search('<!-- breadboard defs holes start -->');
    b = data.search('<!-- breadboard defs holes end -->');
    svg += data.substring( (a + 36), b);
    svg = this.info.svghead + svg + '</svg>';
    this.info.boardhl.src = h + btoa(svg);
    this.info.svghole = svg;

    // create all jQuery DOM resources
    data = $(data);
    this.defs = {};
    this.view = {'board': data};
    data.find('[primitive]').each(function() {
      var elem = $(this), name = elem.attr('primitive');
      elem.removeAttr('primitive');
      self.view[name] = elem.remove();
    });
    // add info about holes
    this.hole = [];
    data.find('[id="$:hole_highlighted"]').each(function(){
      var c = $(this).children('circle');
      for (var i = 0, l = c.length; i < l; i++) {
        self.hole.push({
          'x': parseInt(c[i].getAttribute('cx'), 10),
          'y': parseInt(c[i].getAttribute('cy'), 10),
          'r': parseInt(c[i].getAttribute('r'), 10),
          'c': c[i].getAttribute('fill')
        });
      }
    });
    // set paper value
    paper = this.view.board;
  };

  SVGStorage.prototype.create = function(name) {
    return this.view[name].clone();
  };

  SVGStorage.prototype.point = function() {
    return this.view.board[0].createSVGPoint();
  };

  /* board object */

  var $ready = false;
  // flag, all critical objects built
  var $stack = [];
  // stack of callback functions

  board.util.require(["../common/images/sparks.breadboard.svg"], function(data) {
    // create base element
    SVGStorage = new SVGStorage(data["sparks.breadboard"]);
    // pre-cache all needed images
    var stack = SVGStorage.view.board.find('image[pre-cache]'), all = stack.length;
    // console.log('try cache '+all+' images');
    var cache = function(image) {
      var img = new Image();
      img.onload = function() {
        var opt = {
          'id': image.getAttribute('id'),
          'x': image.getAttribute('x'),
          'y': image.getAttribute('y')
        };
        check(img, opt);
      };
      img.src = image.getAttribute('xlink:href');
    };
    for (var i = 0; i < all; i++) {
      cache(stack[i]);
    }
    var check = function(img, opt) {
      var ctx = document.createElement('canvas').getContext('2d');
      ctx.canvas.height = img.height;
      ctx.canvas.width = img.width;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      SVGStorage.defs[opt.id] = ctx.canvas;
      SVGStorage.defs[opt.id].ox = opt.x;
      SVGStorage.defs[opt.id].oy = opt.y;
      if (!--all) {start_activity();}
    };

    // run callbacks, if have been signed
    var start_activity = function() {
      $ready = true;
      for (var i = 0, l = $stack.length; i < l; i++) {
        $stack[i]();
      }
    };

  });

  board.create = function(id) {
    return new CircuitBoard(id);
  };

  board.ready = function(callback) {
    if ($ready) {
      callback();
    } else {
      $stack.push(callback);
    }
  };

})(jQuery, window["breadboardSVGView"]);

},{"../controllers/workbench-controller":17,"../libs/base64":24,"../libs/canvg":25,"./svg_view_comm":35}],33:[function(require,module,exports){
/*globals sparks Raphael*/

var mathParser  = require('../helpers/math-parser'),
    unit        = require('../helpers/unit'),
    util        = require('../helpers/util');

FunctionGeneratorView = function (functionGenerator) {
  this.$view          = null;
  this.model          = functionGenerator;
  this.frequencies    = [];
  this.currentFreqString = "";
  this.freqValueViews = [];
  this.popup = null;
};

FunctionGeneratorView.prototype = {

  width:    200,
  height:   100,
  nMinorTicks:      5,

  faceplateColor:   '#EEEEEE',

  getView: function () {
    this.$view = $('<div>');

    $("#fg_value").remove();
    $freq_value = $("<span class='fg_value'></span").appendTo(this.$view);
    this.freqValueViews.push($freq_value);

    this.frequencies = this.model.getPossibleFrequencies();
    this.setFrequency(this.model.frequency);

    $overlayDiv = $('<div class="fg_mini_overlay"></div>').appendTo(this.$view);
    var self = this;
    $overlayDiv.click(function(){
      self.openPopup();
    })

    return this.$view;
  },

  openPopup: function () {
    if (!this.popup) {
      $view = this.getLargeView();
      this.popup = $view.dialog({
        width: this.width + 10,
        height: this.height+49,
        dialogClass: 'tools-dialog fg_popup',
        title: "Function Generator",
        closeOnEscape: false,
        resizable: false,
        autoOpen: false
      });
    }

    var self = this;
    this.popup.bind('remove', function() {
      self.popup = null;
    });

    var scrollPosition = [
      self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      self.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop
    ];

    this.popup.dialog('open').dialog("widget").position({
       my: 'left top',
       at: 'left top',
       offset: '5, 5',
       of: $("#breadboard_wrapper")
    });

    window.scrollTo(scrollPosition[0], scrollPosition[1]);
  },

  getLargeView: function () {
    var $canvasHolder,
        self = this;

    this.$view = $('<div>');
    this.$view.css({
      position: 'relative',
      width: this.width,
      height: this.height
    });

    // 'faceplate'
    this.$faceplate = $('<div class="function_generator">').css({
      position: 'absolute',
      left: 0,
      right: 0,
      height: this.height
    }).appendTo(this.$view);

    $freq_value = $('<p class="freq_value">'+this.currentFreqString+'</p>').css({
      position:  'absolute',
      top:       15,
      left:      15,
      height:    20,
      textAlign: 'center'
    }).appendTo(this.$faceplate);

    this.freqValueViews.push($freq_value);

    this.$controls = $('<div class="controls">').css({
      position: 'absolute',
      top:      28,
      left:     0,
      height:   70
    }).appendTo(this.$faceplate);

    this.$frequency = $('<div>').css({
      position:  'absolute',
      top:       12,
      left:      10,
      width:     150,
      height:    55
    }).appendTo(this.$controls);

    var freqs = this.frequencies;
    var initialStep = util.getClosestIndex(freqs, this.model.frequency, false);
    this._addSliderControl(this.$frequency, freqs.length, initialStep, function (evt, ui) {
      var i = ui.value;
      if (i < 0) i = 0;
      if (i > freqs.length-1) i = freqs.length-1;
      var freq = freqs[i];
      self.model.setFrequency(freq);
      self.setFrequency(freq);
    });

    $('<span>Frequency</span>').css({
      position:  'absolute',
      top:       43,
      left:      45,
      width:     100,
      height:    15
    }).appendTo(this.$controls);

    if (this.model.maxAmplitude){
      this.$amplitude = $('<div>').css({
        position: 'absolute',
        top:      35,
        left:     10,
        width:    150,
        height:   55
      }).appendTo(this.$controls);

      var minAmp = this.model.minAmplitude,
          maxAmp = this.model.maxAmplitude,
          amplitude = this.model.amplitude,
          range = maxAmp - minAmp,
          steps = 30,
          value = ((amplitude - minAmp) / range) * steps;
      this._addSliderControl(this.$amplitude, steps, value, function (evt, ui) {
        var i = ui.value;
        if (i < 0) i = 0;
        if (i > steps) i = steps;
        var amp = ((i / steps) * range) + minAmp;
        self.model.setAmplitude(amp);
      });

      $('<span>Amplitude</span>').css({
        position: 'absolute',
        top:    66,
        left:   45,
        right:  100,
        height: 15,
        textAlign: 'center'
      }).appendTo(this.$controls);
    }

    return this.$view;
  },

  setFrequency: function (freq) {
    currentFreqString = this.currentFreqString = mathParser.standardizeUnits(unit.convertMeasurement(freq + " Hz"));
    this.freqValueViews.forEach(function($view){$view.text(currentFreqString);});
    return this.currentFreqString;
  },

  _addSliderControl: function ($el, steps, value, callback) {
    $slider = $("<div class='fg_slider'>").css({
      position: 'absolute',
      top:   25,
      left:  10,
      right: 10
    }).slider({ max: steps, slide: callback, value: value }).appendTo($el);
    if (steps < 2) {
      $slider.easyTooltip({
         content: "You can't change this frequency in this activity"
      });
    }
  }
};

module.exports = FunctionGeneratorView;

},{"../helpers/math-parser":18,"../helpers/unit":21,"../helpers/util":22}],34:[function(require,module,exports){
var sparksMath = require('../helpers/sparks-math');

OscilloscopeView = function () {
  this.$view         = null;
  this.miniRaphaelCanvas = null;
  this.raphaelCanvas = null;
  this.miniTraces    = [];
  this.traces        = [];
  this.model         = null;
  this.popup         = null;
};

OscilloscopeView.prototype = {

  // Note that sizing and placement of the various elements of the view are handled ad-hoc in the getView() method;
  // however, this.width and this.height indicate the dimensions of the gridded area where traces are drawn.
  miniViewConfig: {
    width: 132,
    height: 100,
    tickSize: 2
  },

  largeViewConfig: {
    width:    400,
    height:   320,
    tickSize: 3
  },

  // These define the grid aka 'graticule'. This is pretty standard for scopes.
  nVerticalMarks:   8,
  nHorizontalMarks: 10,
  nMinorTicks:      5,

  faceplateColor:   '#EEEEEE',
  displayAreaColor: '#324569',
  traceBgColor:     '#324569',
  tickColor:        '#9EBDDE',
  textColor:        '#D8E1EB',
  traceOuterColors: ['#FFFF4A', '#FF5C4A', '#33FF33'],
  traceInnerColors: ['#FFFFFF', '#FFD3CF', '#EEFFEE'],
  traceLabelColors: ['#FFFF99', '#FC8F85', '#99FC7B'],
  // The famed "MV" pattern...
  setModel: function (model) {
    this.model = model;
  },

  getView: function () {
    var $canvasHolder,
        self = this,
        conf = this.miniViewConfig;

    this.$view = $('<div>');
    this.$view.css({
      position: 'relative',
      width: conf.width+160,
      height: conf.height+40
    });


    // display area (could split this out into separate method, though not a separate view
    this.$displayArea = $('<div class="display-area">').css({
      position: 'absolute',
      top: 14,
      left: 19,
      width:    conf.width,
      height:   conf.height,
      backgroundColor: this.displayAreaColor
    }).appendTo(this.$view);

    $canvasHolder = $('<div class="raphael-holder">').css({
      position: 'absolute',
      top:  0,
      left: 0,
      backgroundColor: this.traceBgColor
    }).appendTo(this.$displayArea);

    this.miniRaphaelCanvas = Raphael($canvasHolder[0], conf.width, conf.height);

    this.drawGrid(this.miniRaphaelCanvas, conf);

    $overlayDiv = $('<div class="oscope_mini_overlay"></div>').appendTo(this.$view);

    $overlayDiv.click(function(){
      self.openPopup();
    });
    return this.$view;
  },

  openPopup: function () {
    if (!this.popup) {
      $view = this.getLargeView();
      this.renderSignal(1, true);
      this.renderSignal(2, true);
      this.popup = $view.dialog({
        width: this.largeViewConfig.width + 149,
        height: this.largeViewConfig.height + 97,
        dialogClass: 'tools-dialog oscope_popup',
        title: "Oscilloscope",
        closeOnEscape: false,
        resizable: false,
        autoOpen: false
      });
    }

    var self = this;

    var scrollPosition = [
      self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      self.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop
    ];

    this.popup.dialog('open').dialog("widget").position({
       my: 'left top',
       at: 'center top',
       of: $("#breadboard_wrapper")
    });

    window.scrollTo(scrollPosition[0], scrollPosition[1]);

    $('.ui-dialog').bind('remove', function() {
      self.popup = null;
    });
  },

  /**
    @returns $view A jQuery object containing a Raphael canvas displaying the oscilloscope traces.

    Sets this.$view to be the returned jQuery object.
  */
  getLargeView: function () {
    var $canvasHolder,
        self = this,
        conf = this.largeViewConfig;

    this.$view = $('<div>');
    this.$view.css({
      position: 'relative',
      width: conf.width,
      height: conf.height
    });


    // display area (could split this out into separate method, though not a separate view
    this.$displayArea = $('<div class="display-area">').css({
      position: 'absolute',
      top: 25,
      left: 18,
      width:    conf.width + 6,
      height:   conf.height + 30,
      backgroundColor: this.displayAreaColor
    }).appendTo(this.$view);

    $canvasHolder = $('<div class="raphael-holder">').css({
      position: 'absolute',
      top:  5,
      left: 7,
      width:    conf.width,
      height:   conf.height,
      backgroundColor: this.traceBgColor
    }).appendTo(this.$displayArea);

    // add drag handler to canvasHolder
    $canvasHolder
      .drag(function( ev, dd ){
        var viewWidth   = this.getBoundingClientRect().width,
            perc        = dd.deltaX / viewWidth,
            phaseOffset = (-2*Math.PI) * perc;

        self.renderSignal(1, false, phaseOffset);
        self.renderSignal(2, false, phaseOffset);
      })
      .drag("dragend", function (ev, dd) {
        var viewWidth   = this.getBoundingClientRect().width,
            perc        = dd.deltaX / viewWidth,
            phaseOffset = (-2*Math.PI) * perc;

        self.previousPhaseOffset += phaseOffset;
      });

    this.raphaelCanvas = Raphael($canvasHolder[0], conf.width, conf.height);

    this.drawGrid(this.raphaelCanvas, conf);

    $('<p id="cha"><span class="chname">CHA</span> <span class="vscale channel1"></span>V</p>').css({
      position: 'absolute',
      top:   10 + conf.height,
      left:  5,
      color: this.traceLabelColors[0]
    }).appendTo(this.$displayArea);

    $('<p id="chb"><span class="chname">CHB</span> <span class="vscale channel2"></span>V</p>').css({
      position: 'absolute',
      top:   10 + conf.height,
      left:  5 + conf.width / 4,
      color: this.traceLabelColors[1]
    }).appendTo(this.$displayArea);

    $('<p>M <span class="hscale"></span>s</p>').css({
      position: 'absolute',
      top:   10 + conf.height,
      left:  5 + (conf.width*3)/4,
      color: this.textColor
    }).appendTo(this.$displayArea);


    // 'faceplate'
    this.$faceplate = $('<div class="faceplate">').css({
      position: 'absolute',
      left:   conf.width + 27,
      top: 15,
      backgroundColor: 'none',
      width: 122,
      height: 364,
      overflow: 'hidden'
    }).appendTo(this.$view);

    this.$controls = $('<div>').css({
      position: 'absolute',
      top:      30,
      left:     0,
      right:    0,
      height:   200
    }).appendTo(this.$faceplate);

    $('<p class="oscope-label">volts/div</p>').css({
      top:       -33,
      left:      14,
      right:     0,
      height:    20,
      position: 'absolute'
    }).appendTo(this.$controls);

    this.$channel1 = $('<div class="channelA">').css({
      position:  'absolute',
      top:       19,
      left:      11,
      width:     122,
      height:    100
    }).appendTo(this.$controls);

    $('<p>CH A</p>').css({
      top:       -2,
      left:      -2,
      right:     0,
      height:    20,
      textAlign: 'center',
      position:  'absolute'
    }).appendTo(this.$channel1);

    this._addScaleControl(this.$channel1, function () {
      self.model.bumpVerticalScale(1, -1);
    }, function () {
      self.model.bumpVerticalScale(1, 1);
    });

    this.$channel2 = $('<div>').css({
      position: 'absolute',
      top:      121,
      left:     11,
      width:    122,
      height:   100
    }).appendTo(this.$controls);

    $('<p>CH B</p>').css({
      top:    -2,
      left:   -2,
      right:  0,
      height: 20,
      textAlign: 'center',
  position: 'absolute'
    }).appendTo(this.$channel2);

    this._addScaleControl(this.$channel2, function () {
      self.model.bumpVerticalScale(2, -1);
    }, function () {
      self.model.bumpVerticalScale(2, 1);
    });

    $('<p class="oscope-label">time/div</p>').css({
      top:       179,
      left:      16,
      right:     0,
      height:    20,
      position:  'absolute'
    }).appendTo(this.$controls);

    this.$horizontal = $('<div>').css({
      position:  'absolute',
      top:       229,
      left:      11,
      width:     122,
      height:    100
    }).appendTo(this.$controls);

    this._addScaleControl(this.$horizontal, function () {
      self.model.bumpHorizontalScale(-1);
    }, function () {
      self.model.bumpHorizontalScale(1);
    });

    this.horizontalScaleChanged();
    for (i = 1; i <= this.model.N_CHANNELS; i++) {
      this.verticalScaleChanged(i);
    }

    $('<button id="AminusB" class="comboButton">A-B</button>').css({
      top:       298,
      left:      33,
      height:    23,
      width:     36,
      fontSize:  12,
      position:  'absolute'
    }).click(function(){
      self._toggleComboButton(true);
    }).appendTo(this.$controls);

    $('<button id="AplusB" class="comboButton">A+B</button>').css({
      top:       298,
      left:      74,
      height:    23,
      width:     36,
      fontSize:  12,
      position:  'absolute'
    }).click(function(){
      self._toggleComboButton(false);
    }).appendTo(this.$controls);



    // for testing the goodnessOfScale measurement
    $('<p class="goodnessOfScale"></p>').css({
      top:       229,
      left:      55,
      right:     0,
      height:    20,
      position:  'absolute'
    }).appendTo(this.$controls);

    return this.$view;
  },

_toggleComboButton: function (isAminusB) {
  if (isAminusB) {
      this.model.toggleShowAminusB();
  } else {
      this.model.toggleShowAplusB();
  }

  // force-render both signals to make them dim/brighten. Rendering these will
  // automatically call the rendering of the combo trace if applicable
  this.renderSignal(1, true, this.previousPhaseOffset);
  this.renderSignal(2, true, this.previousPhaseOffset);


  $('.comboButton').removeClass('active');

  $('.channelA button').addClass('active')

  if (this.model.showAminusB) {
    $('#AminusB').addClass('active');
  } else if (this.model.showAplusB) {
    $('#AplusB').addClass('active');
  } else {
    $('.channelA button').removeClass('active');
  }
},

  _addScaleControl: function ($el, minusCallback, plusCallback) {
    $('<button>+</button>').css({
      position: 'absolute',
      top:   25,
      left:  25,
      width: 30
    }).click(plusCallback).appendTo($el);

    $('<button>&mdash;</button>').css({
      position: 'absolute',
      top:   25,
      right: 25,
      width: 30
    }).click(minusCallback).appendTo($el);
  },

  previousPhaseOffset: 0,

  renderSignal: function (channel, forced, _phaseOffset) {
    var s = this.model.getSignal(channel),
        t = this.traces[channel],
        horizontalScale,
        verticalScale,
        phaseOffset = (_phaseOffset || 0) + this.previousPhaseOffset,
        isComboActive = (this.model.showAminusB || this.model.showAplusB);

    if (s) {
      horizontalScale = this.model.getHorizontalScale();
      verticalScale   = isComboActive? this.model.getVerticalScale(1) : this.model.getVerticalScale(channel);

      // don't render the signal if we've already drawn it at the same scale
      if (!t || forced || (t.amplitude !== s.amplitude || t.frequency !== s.frequency || t.phase !== (s.phase + phaseOffset) ||
                 t.horizontalScale !== horizontalScale || t.verticalScale !== verticalScale)) {
        this.removeTrace(channel);
        this.traces[channel] = {
          amplitude:          s.amplitude,
          frequency:          s.frequency,
          phase:              (s.phase + phaseOffset),
          horizontalScale:    horizontalScale,
          verticalScale:      verticalScale,
          raphaelObjectMini:  this.drawTrace(this.miniRaphaelCanvas, this.miniViewConfig, s, channel, horizontalScale, verticalScale, phaseOffset, isComboActive),
          raphaelObject:      this.drawTrace(this.raphaelCanvas, this.largeViewConfig, s, channel, horizontalScale, verticalScale, phaseOffset, isComboActive)
        };
      }

      // Make sure channel 2 is always in front
      if (channel === 1 && this.traces[2]) {
        if (!!this.traces[2].raphaelObjectMini) this.traces[2].raphaelObjectMini.toFront();
        if (!!this.traces[2].raphaelObject) this.traces[2].raphaelObject.toFront();
      }

      // testing goodness of scale
      if (sparks.testOscopeScaleQuality) {
        var g = this.model.getGoodnessOfScale();
        console.log(g)
        var g0 = sparksMath.roundToSigDigits(g[0] ? g[0] : -1,4),
            g1 = sparksMath.roundToSigDigits(g[1] ? g[1] : -1,4)
        $(".goodnessOfScale").html("["+g0+","+g1+"]");
      }
    }
    else {
      this.removeTrace(channel);
    }
    this.renderComboTrace(phaseOffset);
  },

  renderComboTrace: function (phaseOffset) {
    this.removeTrace(3);
    if ((this.model.showAminusB || this.model.showAplusB) && this.model.getSignal(1) && this.model.getSignal(2)) {
      var a  = this.model.getSignal(1),
          b  = this.model.getSignal(2),
          bPhase = this.model.showAplusB ? b.phase : (b.phase + Math.PI),     // offset b's phase by Pi if we're subtracting
          rA = a.amplitude * Math.sin(a.phase),
          iA = a.amplitude * Math.cos(a.phase),
          rB = b.amplitude * Math.sin(bPhase),
          iB = b.amplitude * Math.cos(bPhase),
          combo = {
              amplitude: Math.sqrt(Math.pow(rA+rB, 2) + Math.pow(iA+iB, 2)),
              phase: Math.atan((rA+rB) / (iA+iB)) + phaseOffset + ((iA+iB) < 0 ? Math.PI : 0),
              frequency: a.frequency
          };
      this.traces[3] = {
          raphaelObjectMini: this.drawTrace(this.miniRaphaelCanvas, this.miniViewConfig, combo, 3, this.model.getHorizontalScale(), this.model.getVerticalScale(1), 0),
          raphaelObject: this.drawTrace(this.raphaelCanvas, this.largeViewConfig, combo, 3, this.model.getHorizontalScale(), this.model.getVerticalScale(1), 0)
      };
      $('#cha .chname').html(this.model.showAminusB? "A-B" : "A+B");
      $('#cha').css({color: this.traceLabelColors[2]});
    } else {
      $('#cha .chname').html("CHA");
      $('#cha').css({color: this.traceLabelColors[0]});
    }
  },

  removeTrace: function (channel) {
    if (this.traces[channel]) {
      if (this.traces[channel].raphaelObjectMini) this.traces[channel].raphaelObjectMini.remove();
      if (this.traces[channel].raphaelObject) this.traces[channel].raphaelObject.remove();
      delete this.traces[channel];
    }
    if (channel !== 3) {
      this.renderComboTrace(this.previousPhaseOffset);
    }
  },

  // Not moved to sparksMath because it's somewhat specialized for scope display
  humanizeUnits: function (val) {
    var prefixes  = ['M', 'k', '', 'm', 'μ', 'n', 'p'],
        order     = Math.floor(Math.log10(val) + 0.01),    // accounts for: Math.log10(1e-6) = -5.999999999999999
        rank      = Math.ceil(-1 * order / 3),
        prefix    = prefixes[rank+2],
        scaledVal = val * Math.pow(10, rank * 3),

        // Make sure the result has sensible digits ... values in range 1.00 .. 5.00 of whatever unit
        // (e.g, s, ms, μs, or ns) get 2 digits after the decimal point; values in range 10.0 .. 50.0 get 1 digit

        decimalPlaces = order % 3 >= 0 ? 2 - (order % 3) : -1 * ((order + 1) % 3);

    return scaledVal.toFixed(decimalPlaces) + prefix;
  },

  horizontalScaleChanged: function () {
    var scale = this.model.getHorizontalScale(),
        channel;

    // TODO make the units a little more sophisticated.
    this.$view.find('.hscale').html(this.humanizeUnits(scale));

    for (channel = 1; channel <= this.model.N_CHANNELS; channel++) {
      if (this.traces[channel]) this.renderSignal(channel);
    }
  },

  verticalScaleChanged: function (channel) {
    var scale = this.model.getVerticalScale(channel);

    this.$view.find('.vscale.channel'+channel).html(this.humanizeUnits(scale));
    if (this.traces[channel]) this.renderSignal(channel);
  },

  drawGrid: function (r, conf) {
    var path = [],
        x, dx, y, dy;

    for (x = dx = conf.width / this.nHorizontalMarks; x <= conf.width - dx; x += dx) {
      path.push('M');
      path.push(x);
      path.push(0);

      path.push('L');
      path.push(x);
      path.push(conf.height);
    }

    for (y = dy = conf.height / this.nVerticalMarks; y <= conf.height - dy; y += dy) {
      path.push('M');
      path.push(0);
      path.push(y);

      path.push('L');
      path.push(conf.width);
      path.push(y);
    }

    y = conf.height / 2;

    for (x = dx = conf.width / (this.nHorizontalMarks * this.nMinorTicks); x <= conf.width - dx; x += dx) {
      path.push('M');
      path.push(x);
      path.push(y-conf.tickSize);

      path.push('L');
      path.push(x);
      path.push(y+conf.tickSize);
    }

    x = conf.width / 2;

    for (y = dy = conf.height / (this.nVerticalMarks * this.nMinorTicks); y <= conf.height - dy; y += dy) {
      path.push('M');
      path.push(x-conf.tickSize);
      path.push(y);

      path.push('L');
      path.push(x+conf.tickSize);
      path.push(y);
    }

    return r.path(path.join(' ')).attr({stroke: this.tickColor, opacity: 0.5});
  },

  drawTrace: function (r, conf, signal, channel, horizontalScale, verticalScale, phaseOffset, _isFaint) {
    if (!r) return;
    var path         = [],
        height       = conf.height,
        h            = height / 2,

        overscan     = 5,                       // how many pixels to overscan on either side (see below)
        triggerStart = conf.width / 2,          // horizontal position at which the rising edge of a 0-phase signal should cross zero

        // (radians/sec * sec/div) / pixels/div  => radians / pixel
        radiansPerPixel = (2 * Math.PI * signal.frequency * horizontalScale) / (conf.width / this.nHorizontalMarks),

        // pixels/div / volts/div => pixels/volt
        pixelsPerVolt = (conf.height / this.nVerticalMarks) / verticalScale,

        isFaint = _isFaint || false,
        opacity = isFaint ? 0.3 : 1,

        x,
        raphaelObject,
        paths,
        i;

    // if we try and display too many waves on the screen (high radiansPerPixel) we end up with strange effects,
    // like beats or flat lines. Cap radiansPerPixel to Pi/2, which displays a solid block.
    if (radiansPerPixel > Math.PI / 2) radiansPerPixel = Math.PI / 2;

    function clip(y) {
      return y < 0 ? 0 : y > height ? height : y;
    }

    for (x = 0; x < conf.width + overscan * 2; x++) {
      path.push(x ===  0 ? 'M' : 'L');
      path.push(x);

      // Avoid worrying about the odd appearance of the left and right edges of the trace by "overscanning" the trace
      // a few pixels to either side of the scope window; we will translate the path the same # of pixels to the
      // left later. (Done this way we don't have negative, i.e., invalid, x-coords in the path string.)
      path.push(clip(h - signal.amplitude * pixelsPerVolt * Math.sin((x - overscan - triggerStart) * radiansPerPixel + (signal.phase + phaseOffset))));
    }
    path = path.join(' ');

    // slight 3d effect (inspired by CRT scopes) by overlaying a thin, oversaturated line over a fatter colored line
    paths = [];
    paths.push(r.path(path).attr({stroke: this.traceOuterColors[channel-1], 'stroke-width': 4.5, opacity: opacity}));
    paths.push(r.path(path).attr({stroke: this.traceInnerColors[channel-1], 'stroke-width': 2, opacity: opacity}));

    raphaelObject = r.set.apply(r, paths);

    // translate the path to the left to accomodate the overscan
    raphaelObject.translate(-1 * overscan, 0);

    return raphaelObject;
  }

};

module.exports = OscilloscopeView;


},{"../helpers/sparks-math":20}],35:[function(require,module,exports){
/*globals console sparks $ document window alert navigator*/
var LogEvent            = require('../models/log'),
    util                = require('../helpers/util'),
    sound               = require('../helpers/sound'),
    logController       = require('../controllers/log-controller');

breadboardComm = {};

breadboardComm.openConnections = {};

breadboardComm.connectionMade = function(workbench, component, hole) {
  var breadboard, comp, openConnections, openConnectionsArr, connectionReturning, connection;

  if (!!hole){
    openConnections = breadboardComm.openConnections[component];
    if (!openConnections) return; // shouldn't happen

    if (openConnections[hole]) {        // if we're just replacing a lead
      breadModel('unmapHole', hole);
      delete openConnections[hole];
    } else {                            // if we're putting lead in new hole
      breadboard = getBreadBoard();
      comp = breadboard.components[component];
      // transform to array
      openConnectionsArr = util.getKeys(openConnections);
      // pick first open lead
      connectionReturning = openConnectionsArr[0];
      breadModel('unmapHole', connectionReturning);
      //swap
      for (var i = 0; i < comp.connections.length; i++) {
        connection = comp.connections[i].getName();
        if (connection === connectionReturning) {
          comp.connections[i] = breadboard.getHole(hole);
          delete openConnections[connection];
          workbench.meter.moveProbe(connection, hole);
          break;
        }
      }

      // check that we don't have two leads to close together
      breadModel("checkLocation", comp);
    }

  }
  logController.addEvent(LogEvent.CHANGED_CIRCUIT, {
    "type": "connect lead",
    "location": hole});
  workbench.meter.update();
};

breadboardComm.connectionBroken = function(workbench, component, hole) {
  if (!breadboardComm.openConnections[component]) {
    breadboardComm.openConnections[component] = {}
  }
  breadboardComm.openConnections[component][hole] = true;

  var newHole = breadModel('getGhostHole', hole+"ghost");

  breadModel('mapHole', hole, newHole.nodeName());
  logController.addEvent(LogEvent.CHANGED_CIRCUIT, {
    "type": "disconnect lead",
    "location": hole});
  workbench.meter.update();
};

breadboardComm.probeAdded = function(workbench, meter, color, location) {
  workbench.meter.setProbeLocation("probe_"+color, location);
  sound.play(sound.click)
};

breadboardComm.probeRemoved = function(workbench, meter, color) {
  workbench.meter.setProbeLocation("probe_"+color, null);
};

breadboardComm.dmmDialMoved = function(workbench, value) {
  workbench.meter.dmm.dialPosition = value;
  workbench.meter.update();
};

module.exports = breadboardComm;

},{"../controllers/log-controller":16,"../helpers/sound":19,"../helpers/util":22,"../models/log":27}],36:[function(require,module,exports){
require('./breadboard-svg-view');

var AddComponentsView     = require('./add-components-view'),
    FunctionGeneratorView = require('./function-generator-view'),
    OscilloscopeView      = require('./oscilloscope-view'),
    workbenchController   = require('../controllers/workbench-controller'),
    sound                 = require('../helpers/sound');

WorkbenchView = function(workbench){
  this.workbench = workbench;
};

WorkbenchView.prototype = {
  layout: function(elId) {
    this.container = document.getElementById(elId);

    if (!this.container) {
      throw new Error("No DOM element found with the id "+elId);
    }

    this.divs = {
      breadboard:       this.getOrCreateDiv('breadboard'),
      scope:            this.getOrCreateDiv('oscope_mini'),
      fg:               this.getOrCreateDiv('fg_mini', true),
      addCompsWrapper:  this.getOrCreateDiv('add_components')
    };

    this.divs.breadboard.html('');

    var self = this;
    breadboardSVGView.ready(function() {
      workbenchController.breadboardView = breadboardSVGView.create("breadboard");

      // pass queued-up component right-click function to breadboard view
      if (self.rightClickFunction) {
        workbenchController.breadboardView.setRightClickFunction(self.rightClickFunction);
      }

      breadModel('updateView');

      sound.mute = true;

      self.showDMM(self.workbench.show_multimeter);
      self.showOScope(self.workbench.show_oscilloscope);
      // self.allowMoveYellowProbe(self.workbench.allow_move_yellow_probe);
      // self.hidePinkProbe(self.workbench.hide_pink_probe);

      sound.mute = false;

      self.workbench.meter.update();
    });

    var source = getBreadBoard().components.source;
    if (source && source.frequency) {
      var fgView = new FunctionGeneratorView(source);
      var $fg = fgView.getView();
      this.divs.fg.append($fg);
      this.divs.fg.show();
    }
    this.workbench.meter.reset();

    if (this.workbench.showComponentDrawer || this.workbench.showComponentEditor) {
      var drawer = $('<div id="component_drawer" class="retracted"></div>'),
          button = $('<button id="add_components_btn">Add a new Component</button>');

      // this.divs.addCompsWrapper.append(drawer);
      // this.divs.addCompsWrapper.append(button);

      var addComponentsView = new AddComponentsView(this.workbench);

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

module.exports = WorkbenchView;

},{"../controllers/workbench-controller":17,"../helpers/sound":19,"./add-components-view":31,"./breadboard-svg-view":32,"./function-generator-view":33,"./oscilloscope-view":34}],37:[function(require,module,exports){
/**
 * apMessageBox - apMessageBox is a JavaScript object designed to create quick, 
 * easy popup messages in your JavaScript applications. 
 * 
 * http://www.adampresley.com
 * 
 * This file is part of apMessageBox
 *
 * apMessageBox is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * apMessageBox is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with apMessageBox.  If not, see <http://www.gnu.org/licenses/>.
 *  
 * @author Adam Presley
 * @copyright Copyright (c) 2010 Adam Presley
 * @param {Object} config
 */
var apMessageBox = apMessageBox || {};

(function($) {

	/**
	 * Basic messagebox functionality. Note that this code relies
	 * on jQuery 1.4 and jQuery UI 1.8. A config object tells this object
	 * how to behave. The config object takes the following arguments:
	 * 	* dialogEl - The name of the dialog <div>. Defaults to "messageDialog"
	 * 	* messageEl - The name of the message <p>. Defaults to "message"
	 * 	* errorImage - Path to an error image icon
	 *  	* informationImage - Path to an information image icon
	 * 	* messageType - Type of message being displayed. Valid values are
	 * 						 "error" and "information"
	 * 	* title - Dialog box title. Defaults to "Notice!"
	 * 	* width - Width of the dialog
	 * 	* height - Height of the dialog
	 * 	* message - The message to display
	 * 	* callback - A method to be executed once the dialog is closed
	 * 	* scope - The scope in which to call the callback method
	 * 
	 * @author Adam Presley
	 * @class
	 */
	apMessageBox = function(config)
	{
		/**
		 * Initializes the message box. This uses jQuery UI to do the 
		 * dialog box. When the box is closed the added DOM elements
		 * are detached from the DOM.
		 * @author Adam Presley
		 */
		this.initialize = function()
		{
			/*
			 * Call our DOM building method and pass a method to be executed
			 * once the DOM is built. This method will setup the jQuery UI
			 * dialog.
			 */
			__buildDOM(function() {
			
				$("#" + __config.messageEl).html(__config.message);
				
				$("#" + __config.dialogEl).dialog({
					modal: true,
					width: __config.width,
					height: __config.height,
					resizable: false,
					close: function(e, ui) {
						$("#" + __config.dialogEl).detach();

						/*
						 * Execute any defined callback.
						 */
						if (__config.callback !== null && __config.callback !== undefined)
						{
							if (__config.scope !== null && __config.scope !== undefined)
							{
								__config.callback.call(__config.scope);
							}
							else
							{
								__config.callback();
							}
						}
					},
					buttons: __config.buttons
				}).css("z-index","100");
				
			});
		};
		
		var __buildDOM = function(callback)
		{
			/*
			 * Outer message containing div and message <p>
			 */
			var outer = $("<div />");
			var pEl = $("<p />").attr({ 
				id: __config.messageEl
			}).css({ "text-align": "left" });
			var img = null;
			
			/*
			 * If this is an error message attach an error icon.
			 * Otherwise attach an information icon.
			 */
			if (__config.messageType == "error")
			{
				img = $("<img />").attr({
					src: __config.errorImage
				}).css({ "float": "left", "margin-right": "10px" });
				
				$(outer).append(img);
			}
			else
			{
				img = $("<img />").attr({
					src: __config.informationImage
				}).css({ "float": "left", "margin-right": "10px" });
				
				$(outer).append(img);
			}
			
			/*
			 * Append the <p> to the <div>
			 */
			$(outer).append(pEl);
			
			/*
			 * Build the dialog <div>. Attach the message and icon <div>
			 * to it, then attach the dialog <div> to the body.
			 */
			var dialogEl = $("<div />").attr({
				id: __config.dialogEl,
				title: __config.title
			}).css({
				display: "none"
			});

			$(dialogEl).append(outer);
			$("body").append(dialogEl);
			
			/*
			 * When all is ready execute our callback which
			 * uses jQuery UI to do the dialog box.
			 */
			$(document).ready(callback);
		};
		
		var __config = $.extend({
			dialogEl: "messageDialog",
			messageEl: "message",
			errorImage: apMessageBox.errorImage || "error.png",
			informationImage: apMessageBox.informationImage || "information.png",
			messageType: "information",
			title: "Notice!",
			width: 350,
			height: 200,
			message: "",
			callback: null,
			scope: null,
			buttons: {                          // NB: if you write your own buttons, add '$(this).dialog("close");' to the functions.
				Ok: function() {
					$(this).dialog("close");
				}
			}
		}, config);
		var __this = this;
		
		this.initialize();
	};

	apMessageBox.show = function(config)
	{
		var msg = new apMessageBox(config || {});
	};
	
	apMessageBox.error = function(config)
	{
		var newConfig = $.extend({
			messageType: "error",
			title: "Error!"
		}, config);
		
		apMessageBox.show(newConfig);
	};
	
	apMessageBox.information = function(config)
	{
		var newConfig = $.extend({
			messageType: "information",
			title: "Notice!"
		}, config);
		
		apMessageBox.show(newConfig);
	};
	
})(jQuery);

},{}],38:[function(require,module,exports){
(function(){var d=function(){this.components=[];this.nodeMap={};this.nodes=[];this.voltageSources=[];this.AMatrix=[];this.ZMatrix=[];this.referenceNode=null;this.referenceNodeIndex=null};d.prototype.getLinkedComponents=function(e){return this.nodeMap[e]};d.prototype.getDiagonalMatrixElement=function(h,k){var l=this.nodeMap[h],e=$Comp(0,0),g,f;for(f=l.length-1;f>=0;f--){g=l[f].getImpedance(k);e=e.add(g.inverse())}return e};d.prototype.getNodeIndexes=function(f){var e=[];e[0]=this.getNodeIndex(f.nodes[0]);e[1]=this.getNodeIndex(f.nodes[1]);return e};d.prototype.getNodeIndex=function(f){var e=this.nodes.indexOf(f);if(e===this.referenceNodeIndex){return -1}if(e>this.referenceNodeIndex){return e-1}return e};var b=function(h,f,g,e){this.id=h;this.type=f;this.value=g;this.nodes=e};var c=2*Math.PI;b.prototype.getImpedance=function(f){var e=$Comp(0,0);if(this.type==="Resistor"){e.real=this.value;e.imag=0}else{if(this.type=="Capacitor"){e.real=0;e.imag=-1/(c*f*this.value)}else{if(this.type=="Inductor"){e.real=0;e.imag=c*f*this.value}}}return e};b.prototype.getOffDiagonalMatrixElement=function(e){return this.getImpedance(e).inverse().negative()};var a=function(i,h,f,e,g){this.id=i;this.voltage=h;this.positiveNode=f;this.negativeNode=e;this.frequency=g||0};d.prototype.addComponent=function(n,h,m,l){var e=new b(n,h,m,l),f,g,k;this.components.push(e);for(f=0,g=l.length;f<g;f++){k=l[f];if(!this.nodeMap[k]){this.nodeMap[k]=[];this.nodes.push(k)}this.nodeMap[k].push(e)}};d.prototype.addVoltageSource=function(k,i,f,e,h){var g=new a(k,i,f,e,h);this.voltageSources.push(g);if(!this.nodeMap[f]){this.nodeMap[f]=[];this.nodes.push(f)}if(!this.nodeMap[e]){this.nodeMap[e]=[];this.nodes.push(e)}if(!this.referenceNode){this.setReferenceNode(e)}};d.prototype.setReferenceNode=function(e){this.referenceNode=e;this.referenceNodeIndex=this.nodes.indexOf(e)};d.prototype.createAMatrix=function(){this.createEmptyAMatrix();this.addGMatrix();this.addBCMatrix()};d.prototype.createEmptyAMatrix=function(){var g=$Comp(0,0),k=this.nodes.length,e=this.voltageSources.length,l=k-1+e,h,f;this.AMatrix=[];for(h=0;h<l;h++){this.AMatrix[h]=[];for(f=0;f<l;f++){this.AMatrix[h][f]=g.copy()}}};d.prototype.addGMatrix=function(){var l,m,h,g,k,f,n,e;if(this.voltageSources.length>0){l=this.voltageSources[0];m=l.frequency}for(h=0;h<this.nodes.length;h++){k=this.nodes[h];if(k===this.referenceNode){continue}f=this.getNodeIndex(k);this.AMatrix[f][f]=this.getDiagonalMatrixElement(k,m)}for(h=0;h<this.components.length;h++){n=this.getNodeIndexes(this.components[h])[0];e=this.getNodeIndexes(this.components[h])[1];if(n===-1||e===-1){continue}this.AMatrix[n][e]=this.AMatrix[e][n]=this.AMatrix[n][e].add(this.components[h].getOffDiagonalMatrixElement(m))}};d.prototype.addBCMatrix=function(){if(this.voltageSources.length===0){return}var g=$Comp(1,0),n=g.negative(),e=this.voltageSources,k,l,h,m,f;for(f=0;f<e.length;f++){k=e[f];l=k.positiveNode;if(l!==this.referenceNode){m=this.getNodeIndex(l);this.AMatrix[this.nodes.length-1+f][m]=g.copy();this.AMatrix[m][this.nodes.length-1+f]=g.copy()}h=k.negativeNode;if(h!==this.referenceNode){m=this.getNodeIndex(h);this.AMatrix[this.nodes.length-1+f][m]=n.copy();this.AMatrix[m][this.nodes.length-1+f]=n.copy()}}};d.prototype.createZMatrix=function(){var g=$Comp(0,0),k=this.nodes.length,e=this.voltageSources.length,l=k-1+e,f=this.voltageSources,h;this.ZMatrix=[[]];for(h=0;h<l;h++){this.ZMatrix[0][h]=g.copy()}for(h=0;h<f.length;h++){this.ZMatrix[0][k-1+h].real=f[h].voltage}};d.prototype.cleanCircuit=function(){var f=this.nodes,q=this.nodeMap,m=this.components,r,o=this.referenceNode,s=[],e,g,h,t;function p(u){var w=[];for(var v in u){w[v]=u[v]}return w}q=p(q);function k(u){var x=[];for(var v=0,w=u.length;v<w;v++){if(u[v]!==null){x.push(u[v])}}return x}function n(v,B){var x=B[v],C,w,D=[],u,z,E,y,A;if(v===o){return true}if(~s.indexOf(v)){return true}if(!x||x.length===0){return false}delete B[v];for(z=0,E=x.length;z<E;z++){C=x[z];w=p(C.nodes);w.splice(w.indexOf(v),1);D=D.concat(w)}for(y=0,A=D.length;y<A;y++){if(n(D[y],B)){s.push(v);return true}}return false}for(h=0,t=f.length;h<t;h++){g=f[h];if(g){if(!n(g,q)){f[h]=null}}}this.nodes=k(f);q=this.nodeMap;function l(u,y){var x=p(q[y]),v,w;q[y]=[];for(v=0,w=x.length;v<w;v++){if(x[v].id!==u.id){q[y].push(x[v])}}}for(h=0,t=m.length;h<t;h++){r=m[h];if(!(~f.indexOf(r.nodes[0])&&~f.indexOf(r.nodes[1]))){l(r,r.nodes[0]);l(r,r.nodes[1]);m[h]=null}}this.components=k(m);for(h=0,t=this.voltageSources.length;h<t;h++){e=this.voltageSources[h];if(!(~f.indexOf(e.positiveNode)&&~f.indexOf(e.negativeNode))){this.voltageSources[h]=null}}this.voltageSources=k(this.voltageSources);this.referenceNodeIndex=this.nodes.indexOf(o)};d.prototype.solve=function(){this.cleanCircuit();this.createAMatrix();this.createZMatrix();aM=$M(this.AMatrix);zM=$M(this.ZMatrix);invAM=aM.inv();res=zM.x(invAM);return res};d.prototype.getVoltageAt=function(g){if(g===this.referenceNode){return $Comp(0)}try{var f=this.solve();return f.elements[0][this.getNodeIndex(g)]}catch(h){return $Comp(0)}};d.prototype.getVoltageBetween=function(f,e){return this.getVoltageAt(f).subtract(this.getVoltageAt(e))};d.prototype.getCurrent=function(n){var k,g,f=null,h,l;try{k=this.solve()}catch(m){return $Comp(0)}g=this.voltageSources;for(h=0,l=g.length;h<l;h++){if(g[h].id==n){f=h;break}}if(f===null){try{throw Error("No voltage source "+n)}catch(m){return $Comp(0)}}try{return k.elements[0][this.nodes.length-1+f]}catch(m){return $Comp(0)}};window.CiSo=d})();var Complex=function(b,a){if(!(this instanceof Complex)){return new Complex(b,a)}if(typeof b==="string"&&a===null){return Complex.parse(b)}this.real=b||0;this.imag=a||0;this.magnitude=Math.sqrt(this.real*this.real+this.imag*this.imag);this.angle=Math.atan2(this.imag,this.real)};Complex.prototype={copy:function(){return new Complex(this.real,this.imag)},add:function(a){var c,b;if(a instanceof Complex){c=a.real;b=a.imag}else{c=a;b=0}return new Complex(this.real+c,this.imag+b)},subtract:function(a){var c,b;if(a instanceof Complex){c=a.real;b=a.imag}else{c=a;b=0}return new Complex(this.real-c,this.imag-b)},multiply:function(a){var e,d,c,b;if(a instanceof Complex){e=a.real;d=a.imag}else{e=a;d=0}c=this.real*e-this.imag*d;b=this.real*d+this.imag*e;return new Complex(c,b)},divide:function(a){var f,e,b,d,c;if(a instanceof Complex){f=a.real;e=a.imag}else{f=a;e=0}b=f*f+e*e;d=(this.real*f+this.imag*e)/b;c=(this.imag*f-this.real*e)/b;return new Complex(d,c)},inverse:function(){var a=new Complex(1,0);return a.divide(this)},negative:function(){var a=new Complex(0,0);return a.subtract(this)},equals:function(a){if(a instanceof Complex){return this.real===a.real&&this.imag===a.imag}else{if(typeof a==="number"){return this.real===a&&this.imag===0}}return false},toString:function(){return this.real+"i"+this.imag}};Complex.parse=function(c){if(!c){return null}var b=/(.*)([+,\-].*i)/.exec(c),d,a;if(b&&b.length===3){d=parseFloat(b[1]);a=parseFloat(b[2].replace("i",""))}else{d=parseFloat(c);a=0}if(isNaN(d)||isNaN(a)){throw new Error("Invalid input to Complex.parse, expecting a + bi format, instead was: "+c)}return new Complex(d,a)};$Comp=function(){if(typeof arguments[0]==="string"){return Complex.parse(arguments[0])}return new Complex(arguments[0],arguments[1])};var Sylvester={version:"0.1.3-cc",precision:0.000001};function Matrix(){}Matrix.prototype={dup:function(){return Matrix.create(this.elements)},canMultiplyFromLeft:function(a){var b=a.elements||a;if(typeof(b[0][0])=="undefined"){b=Matrix.create(b).elements}return(this.elements[0].length==b.length)},multiply:function(q){if(!q.elements){return this.map(function(c){return c.multiply(q)})}var h=q.modulus?true:false;var n=q.elements||q;if(typeof(n[0][0])=="undefined"){n=Matrix.create(n).elements}if(!this.canMultiplyFromLeft(n)){return null}var e=this.elements.length,f=e,l,b,d=n[0].length,g;var p=this.elements[0].length,a=[],m,k,o;do{l=f-e;a[l]=[];b=d;do{g=d-b;m=$Comp(0,0);k=p;do{o=p-k;m=m.add(this.elements[l][o].multiply(n[o][g]))}while(--k);a[l][g]=m}while(--b)}while(--e);var n=Matrix.create(a);return h?n.col(1):n},x:function(a){return this.multiply(a)},isSquare:function(){return(this.elements.length==this.elements[0].length)},toRightTriangular:function(){var f=this.dup(),d;var b=this.elements.length,c=b,e,g,h=this.elements[0].length,a;do{e=c-b;if(f.elements[e][e].equals(0)){for(j=e+1;j<c;j++){if(!f.elements[j][e].equals(0)){d=[];g=h;do{a=h-g;d.push(f.elements[e][a].add(f.elements[j][a]))}while(--g);f.elements[e]=d;break}}}if(!f.elements[e][e].equals(0)){for(j=e+1;j<c;j++){var l=f.elements[j][e].divide(f.elements[e][e]);d=[];g=h;do{a=h-g;d.push(a<=e?$Comp(0):f.elements[j][a].subtract(f.elements[e][a].multiply(l)))}while(--g);f.elements[j]=d}}}while(--b);return f},toUpperTriangular:function(){return this.toRightTriangular()},determinant:function(){if(!this.isSquare()){return null}var e=this.toRightTriangular();var c=e.elements[0][0],d=e.elements.length-1,a=d,b;do{b=a-d+1;c=c.multiply(e.elements[b][b])}while(--d);return c},det:function(){return this.determinant()},isSingular:function(){return(this.isSquare()&&this.determinant().equals(0))},augment:function(l){var h=l.elements||l;if(typeof(h[0][0])=="undefined"){h=Matrix.create(h).elements}var e=this.dup(),k=e.elements[0].length;var c=e.elements.length,d=c,g,a,b=h[0].length,f;if(c!=h.length){return null}do{g=d-c;a=b;do{f=b-a;e.elements[g][k+f]=h[g][f]}while(--a)}while(--c);return e},inverse:function(){if(!this.isSquare()||this.isSingular()){return null}var c=this.elements.length,d=c,h,g;var k=this.augment(Matrix.I(c)).toRightTriangular();var l,m=k.elements[0].length,a,f,b;var n=[],e;do{h=c-1;f=[];l=m;n[h]=[];b=k.elements[h][h];do{a=m-l;e=k.elements[h][a].divide(b);f.push(e);if(a>=d){n[h].push(e)}}while(--l);k.elements[h]=f;for(g=0;g<h;g++){f=[];l=m;do{a=m-l;f.push(k.elements[g][a].subtract(k.elements[h][a].multiply(k.elements[g][h])))}while(--l);k.elements[g]=f}}while(--c);return Matrix.create(n)},inv:function(){return this.inverse()},setElements:function(h){var m,a=h.elements||h;if(typeof(a[0][0])!="undefined"){var d=a.length,f=d,b,c,l;this.elements=[];do{m=f-d;b=a[m].length;c=b;this.elements[m]=[];do{l=c-b;this.elements[m][l]=a[m][l]}while(--b)}while(--d);return this}var e=a.length,g=e;this.elements=[];do{m=g-e;this.elements.push([a[m]])}while(--e);return this}};Matrix.create=function(a){var b=new Matrix();return b.setElements(a)};Matrix.I=function(f){var e=[],a=f,d,c,b;do{d=a-f;e[d]=[];c=a;do{b=a-c;e[d][b]=(d==b)?$Comp(1,0):$Comp(0)}while(--c)}while(--f);return Matrix.create(e)};var $M=Matrix.create;
},{}],39:[function(require,module,exports){
/*! jQuery v@1.8.1 jquery.com | jquery.org/license */
(function(a,b){function G(a){var b=F[a]={};return p.each(a.split(s),function(a,c){b[c]=!0}),b}function J(a,c,d){if(d===b&&a.nodeType===1){var e="data-"+c.replace(I,"-$1").toLowerCase();d=a.getAttribute(e);if(typeof d=="string"){try{d=d==="true"?!0:d==="false"?!1:d==="null"?null:+d+""===d?+d:H.test(d)?p.parseJSON(d):d}catch(f){}p.data(a,c,d)}else d=b}return d}function K(a){var b;for(b in a){if(b==="data"&&p.isEmptyObject(a[b]))continue;if(b!=="toJSON")return!1}return!0}function ba(){return!1}function bb(){return!0}function bh(a){return!a||!a.parentNode||a.parentNode.nodeType===11}function bi(a,b){do a=a[b];while(a&&a.nodeType!==1);return a}function bj(a,b,c){b=b||0;if(p.isFunction(b))return p.grep(a,function(a,d){var e=!!b.call(a,d,a);return e===c});if(b.nodeType)return p.grep(a,function(a,d){return a===b===c});if(typeof b=="string"){var d=p.grep(a,function(a){return a.nodeType===1});if(be.test(b))return p.filter(b,d,!c);b=p.filter(b,d)}return p.grep(a,function(a,d){return p.inArray(a,b)>=0===c})}function bk(a){var b=bl.split("|"),c=a.createDocumentFragment();if(c.createElement)while(b.length)c.createElement(b.pop());return c}function bC(a,b){return a.getElementsByTagName(b)[0]||a.appendChild(a.ownerDocument.createElement(b))}function bD(a,b){if(b.nodeType!==1||!p.hasData(a))return;var c,d,e,f=p._data(a),g=p._data(b,f),h=f.events;if(h){delete g.handle,g.events={};for(c in h)for(d=0,e=h[c].length;d<e;d++)p.event.add(b,c,h[c][d])}g.data&&(g.data=p.extend({},g.data))}function bE(a,b){var c;if(b.nodeType!==1)return;b.clearAttributes&&b.clearAttributes(),b.mergeAttributes&&b.mergeAttributes(a),c=b.nodeName.toLowerCase(),c==="object"?(b.parentNode&&(b.outerHTML=a.outerHTML),p.support.html5Clone&&a.innerHTML&&!p.trim(b.innerHTML)&&(b.innerHTML=a.innerHTML)):c==="input"&&bv.test(a.type)?(b.defaultChecked=b.checked=a.checked,b.value!==a.value&&(b.value=a.value)):c==="option"?b.selected=a.defaultSelected:c==="input"||c==="textarea"?b.defaultValue=a.defaultValue:c==="script"&&b.text!==a.text&&(b.text=a.text),b.removeAttribute(p.expando)}function bF(a){return typeof a.getElementsByTagName!="undefined"?a.getElementsByTagName("*"):typeof a.querySelectorAll!="undefined"?a.querySelectorAll("*"):[]}function bG(a){bv.test(a.type)&&(a.defaultChecked=a.checked)}function bY(a,b){if(b in a)return b;var c=b.charAt(0).toUpperCase()+b.slice(1),d=b,e=bW.length;while(e--){b=bW[e]+c;if(b in a)return b}return d}function bZ(a,b){return a=b||a,p.css(a,"display")==="none"||!p.contains(a.ownerDocument,a)}function b$(a,b){var c,d,e=[],f=0,g=a.length;for(;f<g;f++){c=a[f];if(!c.style)continue;e[f]=p._data(c,"olddisplay"),b?(!e[f]&&c.style.display==="none"&&(c.style.display=""),c.style.display===""&&bZ(c)&&(e[f]=p._data(c,"olddisplay",cc(c.nodeName)))):(d=bH(c,"display"),!e[f]&&d!=="none"&&p._data(c,"olddisplay",d))}for(f=0;f<g;f++){c=a[f];if(!c.style)continue;if(!b||c.style.display==="none"||c.style.display==="")c.style.display=b?e[f]||"":"none"}return a}function b_(a,b,c){var d=bP.exec(b);return d?Math.max(0,d[1]-(c||0))+(d[2]||"px"):b}function ca(a,b,c,d){var e=c===(d?"border":"content")?4:b==="width"?1:0,f=0;for(;e<4;e+=2)c==="margin"&&(f+=p.css(a,c+bV[e],!0)),d?(c==="content"&&(f-=parseFloat(bH(a,"padding"+bV[e]))||0),c!=="margin"&&(f-=parseFloat(bH(a,"border"+bV[e]+"Width"))||0)):(f+=parseFloat(bH(a,"padding"+bV[e]))||0,c!=="padding"&&(f+=parseFloat(bH(a,"border"+bV[e]+"Width"))||0));return f}function cb(a,b,c){var d=b==="width"?a.offsetWidth:a.offsetHeight,e=!0,f=p.support.boxSizing&&p.css(a,"boxSizing")==="border-box";if(d<=0||d==null){d=bH(a,b);if(d<0||d==null)d=a.style[b];if(bQ.test(d))return d;e=f&&(p.support.boxSizingReliable||d===a.style[b]),d=parseFloat(d)||0}return d+ca(a,b,c||(f?"border":"content"),e)+"px"}function cc(a){if(bS[a])return bS[a];var b=p("<"+a+">").appendTo(e.body),c=b.css("display");b.remove();if(c==="none"||c===""){bI=e.body.appendChild(bI||p.extend(e.createElement("iframe"),{frameBorder:0,width:0,height:0}));if(!bJ||!bI.createElement)bJ=(bI.contentWindow||bI.contentDocument).document,bJ.write("<!doctype html><html><body>"),bJ.close();b=bJ.body.appendChild(bJ.createElement(a)),c=bH(b,"display"),e.body.removeChild(bI)}return bS[a]=c,c}function ci(a,b,c,d){var e;if(p.isArray(b))p.each(b,function(b,e){c||ce.test(a)?d(a,e):ci(a+"["+(typeof e=="object"?b:"")+"]",e,c,d)});else if(!c&&p.type(b)==="object")for(e in b)ci(a+"["+e+"]",b[e],c,d);else d(a,b)}function cz(a){return function(b,c){typeof b!="string"&&(c=b,b="*");var d,e,f,g=b.toLowerCase().split(s),h=0,i=g.length;if(p.isFunction(c))for(;h<i;h++)d=g[h],f=/^\+/.test(d),f&&(d=d.substr(1)||"*"),e=a[d]=a[d]||[],e[f?"unshift":"push"](c)}}function cA(a,c,d,e,f,g){f=f||c.dataTypes[0],g=g||{},g[f]=!0;var h,i=a[f],j=0,k=i?i.length:0,l=a===cv;for(;j<k&&(l||!h);j++)h=i[j](c,d,e),typeof h=="string"&&(!l||g[h]?h=b:(c.dataTypes.unshift(h),h=cA(a,c,d,e,h,g)));return(l||!h)&&!g["*"]&&(h=cA(a,c,d,e,"*",g)),h}function cB(a,c){var d,e,f=p.ajaxSettings.flatOptions||{};for(d in c)c[d]!==b&&((f[d]?a:e||(e={}))[d]=c[d]);e&&p.extend(!0,a,e)}function cC(a,c,d){var e,f,g,h,i=a.contents,j=a.dataTypes,k=a.responseFields;for(f in k)f in d&&(c[k[f]]=d[f]);while(j[0]==="*")j.shift(),e===b&&(e=a.mimeType||c.getResponseHeader("content-type"));if(e)for(f in i)if(i[f]&&i[f].test(e)){j.unshift(f);break}if(j[0]in d)g=j[0];else{for(f in d){if(!j[0]||a.converters[f+" "+j[0]]){g=f;break}h||(h=f)}g=g||h}if(g)return g!==j[0]&&j.unshift(g),d[g]}function cD(a,b){var c,d,e,f,g=a.dataTypes.slice(),h=g[0],i={},j=0;a.dataFilter&&(b=a.dataFilter(b,a.dataType));if(g[1])for(c in a.converters)i[c.toLowerCase()]=a.converters[c];for(;e=g[++j];)if(e!=="*"){if(h!=="*"&&h!==e){c=i[h+" "+e]||i["* "+e];if(!c)for(d in i){f=d.split(" ");if(f[1]===e){c=i[h+" "+f[0]]||i["* "+f[0]];if(c){c===!0?c=i[d]:i[d]!==!0&&(e=f[0],g.splice(j--,0,e));break}}}if(c!==!0)if(c&&a["throws"])b=c(b);else try{b=c(b)}catch(k){return{state:"parsererror",error:c?k:"No conversion from "+h+" to "+e}}}h=e}return{state:"success",data:b}}function cL(){try{return new a.XMLHttpRequest}catch(b){}}function cM(){try{return new a.ActiveXObject("Microsoft.XMLHTTP")}catch(b){}}function cU(){return setTimeout(function(){cN=b},0),cN=p.now()}function cV(a,b){p.each(b,function(b,c){var d=(cT[b]||[]).concat(cT["*"]),e=0,f=d.length;for(;e<f;e++)if(d[e].call(a,b,c))return})}function cW(a,b,c){var d,e=0,f=0,g=cS.length,h=p.Deferred().always(function(){delete i.elem}),i=function(){var b=cN||cU(),c=Math.max(0,j.startTime+j.duration-b),d=1-(c/j.duration||0),e=0,f=j.tweens.length;for(;e<f;e++)j.tweens[e].run(d);return h.notifyWith(a,[j,d,c]),d<1&&f?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:p.extend({},b),opts:p.extend(!0,{specialEasing:{}},c),originalProperties:b,originalOptions:c,startTime:cN||cU(),duration:c.duration,tweens:[],createTween:function(b,c,d){var e=p.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(e),e},stop:function(b){var c=0,d=b?j.tweens.length:0;for(;c<d;c++)j.tweens[c].run(1);return b?h.resolveWith(a,[j,b]):h.rejectWith(a,[j,b]),this}}),k=j.props;cX(k,j.opts.specialEasing);for(;e<g;e++){d=cS[e].call(j,a,k,j.opts);if(d)return d}return cV(j,k),p.isFunction(j.opts.start)&&j.opts.start.call(a,j),p.fx.timer(p.extend(i,{anim:j,queue:j.opts.queue,elem:a})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}function cX(a,b){var c,d,e,f,g;for(c in a){d=p.camelCase(c),e=b[d],f=a[c],p.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=p.cssHooks[d];if(g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}}function cY(a,b,c){var d,e,f,g,h,i,j,k,l=this,m=a.style,n={},o=[],q=a.nodeType&&bZ(a);c.queue||(j=p._queueHooks(a,"fx"),j.unqueued==null&&(j.unqueued=0,k=j.empty.fire,j.empty.fire=function(){j.unqueued||k()}),j.unqueued++,l.always(function(){l.always(function(){j.unqueued--,p.queue(a,"fx").length||j.empty.fire()})})),a.nodeType===1&&("height"in b||"width"in b)&&(c.overflow=[m.overflow,m.overflowX,m.overflowY],p.css(a,"display")==="inline"&&p.css(a,"float")==="none"&&(!p.support.inlineBlockNeedsLayout||cc(a.nodeName)==="inline"?m.display="inline-block":m.zoom=1)),c.overflow&&(m.overflow="hidden",p.support.shrinkWrapBlocks||l.done(function(){m.overflow=c.overflow[0],m.overflowX=c.overflow[1],m.overflowY=c.overflow[2]}));for(d in b){f=b[d];if(cP.exec(f)){delete b[d];if(f===(q?"hide":"show"))continue;o.push(d)}}g=o.length;if(g){h=p._data(a,"fxshow")||p._data(a,"fxshow",{}),q?p(a).show():l.done(function(){p(a).hide()}),l.done(function(){var b;p.removeData(a,"fxshow",!0);for(b in n)p.style(a,b,n[b])});for(d=0;d<g;d++)e=o[d],i=l.createTween(e,q?h[e]:0),n[e]=h[e]||p.style(a,e),e in h||(h[e]=i.start,q&&(i.end=i.start,i.start=e==="width"||e==="height"?1:0))}}function cZ(a,b,c,d,e){return new cZ.prototype.init(a,b,c,d,e)}function c$(a,b){var c,d={height:a},e=0;b=b?1:0;for(;e<4;e+=2-b)c=bV[e],d["margin"+c]=d["padding"+c]=a;return b&&(d.opacity=d.width=a),d}function da(a){return p.isWindow(a)?a:a.nodeType===9?a.defaultView||a.parentWindow:!1}var c,d,e=a.document,f=a.location,g=a.navigator,h=a.jQuery,i=a.$,j=Array.prototype.push,k=Array.prototype.slice,l=Array.prototype.indexOf,m=Object.prototype.toString,n=Object.prototype.hasOwnProperty,o=String.prototype.trim,p=function(a,b){return new p.fn.init(a,b,c)},q=/[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source,r=/\S/,s=/\s+/,t=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,u=/^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,v=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,w=/^[\],:{}\s]*$/,x=/(?:^|:|,)(?:\s*\[)+/g,y=/\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,z=/"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g,A=/^-ms-/,B=/-([\da-z])/gi,C=function(a,b){return(b+"").toUpperCase()},D=function(){e.addEventListener?(e.removeEventListener("DOMContentLoaded",D,!1),p.ready()):e.readyState==="complete"&&(e.detachEvent("onreadystatechange",D),p.ready())},E={};p.fn=p.prototype={constructor:p,init:function(a,c,d){var f,g,h,i;if(!a)return this;if(a.nodeType)return this.context=this[0]=a,this.length=1,this;if(typeof a=="string"){a.charAt(0)==="<"&&a.charAt(a.length-1)===">"&&a.length>=3?f=[null,a,null]:f=u.exec(a);if(f&&(f[1]||!c)){if(f[1])return c=c instanceof p?c[0]:c,i=c&&c.nodeType?c.ownerDocument||c:e,a=p.parseHTML(f[1],i,!0),v.test(f[1])&&p.isPlainObject(c)&&this.attr.call(a,c,!0),p.merge(this,a);g=e.getElementById(f[2]);if(g&&g.parentNode){if(g.id!==f[2])return d.find(a);this.length=1,this[0]=g}return this.context=e,this.selector=a,this}return!c||c.jquery?(c||d).find(a):this.constructor(c).find(a)}return p.isFunction(a)?d.ready(a):(a.selector!==b&&(this.selector=a.selector,this.context=a.context),p.makeArray(a,this))},selector:"",jquery:"1.8.1",length:0,size:function(){return this.length},toArray:function(){return k.call(this)},get:function(a){return a==null?this.toArray():a<0?this[this.length+a]:this[a]},pushStack:function(a,b,c){var d=p.merge(this.constructor(),a);return d.prevObject=this,d.context=this.context,b==="find"?d.selector=this.selector+(this.selector?" ":"")+c:b&&(d.selector=this.selector+"."+b+"("+c+")"),d},each:function(a,b){return p.each(this,a,b)},ready:function(a){return p.ready.promise().done(a),this},eq:function(a){return a=+a,a===-1?this.slice(a):this.slice(a,a+1)},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},slice:function(){return this.pushStack(k.apply(this,arguments),"slice",k.call(arguments).join(","))},map:function(a){return this.pushStack(p.map(this,function(b,c){return a.call(b,c,b)}))},end:function(){return this.prevObject||this.constructor(null)},push:j,sort:[].sort,splice:[].splice},p.fn.init.prototype=p.fn,p.extend=p.fn.extend=function(){var a,c,d,e,f,g,h=arguments[0]||{},i=1,j=arguments.length,k=!1;typeof h=="boolean"&&(k=h,h=arguments[1]||{},i=2),typeof h!="object"&&!p.isFunction(h)&&(h={}),j===i&&(h=this,--i);for(;i<j;i++)if((a=arguments[i])!=null)for(c in a){d=h[c],e=a[c];if(h===e)continue;k&&e&&(p.isPlainObject(e)||(f=p.isArray(e)))?(f?(f=!1,g=d&&p.isArray(d)?d:[]):g=d&&p.isPlainObject(d)?d:{},h[c]=p.extend(k,g,e)):e!==b&&(h[c]=e)}return h},p.extend({noConflict:function(b){return a.$===p&&(a.$=i),b&&a.jQuery===p&&(a.jQuery=h),p},isReady:!1,readyWait:1,holdReady:function(a){a?p.readyWait++:p.ready(!0)},ready:function(a){if(a===!0?--p.readyWait:p.isReady)return;if(!e.body)return setTimeout(p.ready,1);p.isReady=!0;if(a!==!0&&--p.readyWait>0)return;d.resolveWith(e,[p]),p.fn.trigger&&p(e).trigger("ready").off("ready")},isFunction:function(a){return p.type(a)==="function"},isArray:Array.isArray||function(a){return p.type(a)==="array"},isWindow:function(a){return a!=null&&a==a.window},isNumeric:function(a){return!isNaN(parseFloat(a))&&isFinite(a)},type:function(a){return a==null?String(a):E[m.call(a)]||"object"},isPlainObject:function(a){if(!a||p.type(a)!=="object"||a.nodeType||p.isWindow(a))return!1;try{if(a.constructor&&!n.call(a,"constructor")&&!n.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}var d;for(d in a);return d===b||n.call(a,d)},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},error:function(a){throw new Error(a)},parseHTML:function(a,b,c){var d;return!a||typeof a!="string"?null:(typeof b=="boolean"&&(c=b,b=0),b=b||e,(d=v.exec(a))?[b.createElement(d[1])]:(d=p.buildFragment([a],b,c?null:[]),p.merge([],(d.cacheable?p.clone(d.fragment):d.fragment).childNodes)))},parseJSON:function(b){if(!b||typeof b!="string")return null;b=p.trim(b);if(a.JSON&&a.JSON.parse)return a.JSON.parse(b);if(w.test(b.replace(y,"@").replace(z,"]").replace(x,"")))return(new Function("return "+b))();p.error("Invalid JSON: "+b)},parseXML:function(c){var d,e;if(!c||typeof c!="string")return null;try{a.DOMParser?(e=new DOMParser,d=e.parseFromString(c,"text/xml")):(d=new ActiveXObject("Microsoft.XMLDOM"),d.async="false",d.loadXML(c))}catch(f){d=b}return(!d||!d.documentElement||d.getElementsByTagName("parsererror").length)&&p.error("Invalid XML: "+c),d},noop:function(){},globalEval:function(b){b&&r.test(b)&&(a.execScript||function(b){a.eval.call(a,b)})(b)},camelCase:function(a){return a.replace(A,"ms-").replace(B,C)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toUpperCase()===b.toUpperCase()},each:function(a,c,d){var e,f=0,g=a.length,h=g===b||p.isFunction(a);if(d){if(h){for(e in a)if(c.apply(a[e],d)===!1)break}else for(;f<g;)if(c.apply(a[f++],d)===!1)break}else if(h){for(e in a)if(c.call(a[e],e,a[e])===!1)break}else for(;f<g;)if(c.call(a[f],f,a[f++])===!1)break;return a},trim:o&&!o.call("﻿ ")?function(a){return a==null?"":o.call(a)}:function(a){return a==null?"":a.toString().replace(t,"")},makeArray:function(a,b){var c,d=b||[];return a!=null&&(c=p.type(a),a.length==null||c==="string"||c==="function"||c==="regexp"||p.isWindow(a)?j.call(d,a):p.merge(d,a)),d},inArray:function(a,b,c){var d;if(b){if(l)return l.call(b,a,c);d=b.length,c=c?c<0?Math.max(0,d+c):c:0;for(;c<d;c++)if(c in b&&b[c]===a)return c}return-1},merge:function(a,c){var d=c.length,e=a.length,f=0;if(typeof d=="number")for(;f<d;f++)a[e++]=c[f];else while(c[f]!==b)a[e++]=c[f++];return a.length=e,a},grep:function(a,b,c){var d,e=[],f=0,g=a.length;c=!!c;for(;f<g;f++)d=!!b(a[f],f),c!==d&&e.push(a[f]);return e},map:function(a,c,d){var e,f,g=[],h=0,i=a.length,j=a instanceof p||i!==b&&typeof i=="number"&&(i>0&&a[0]&&a[i-1]||i===0||p.isArray(a));if(j)for(;h<i;h++)e=c(a[h],h,d),e!=null&&(g[g.length]=e);else for(f in a)e=c(a[f],f,d),e!=null&&(g[g.length]=e);return g.concat.apply([],g)},guid:1,proxy:function(a,c){var d,e,f;return typeof c=="string"&&(d=a[c],c=a,a=d),p.isFunction(a)?(e=k.call(arguments,2),f=function(){return a.apply(c,e.concat(k.call(arguments)))},f.guid=a.guid=a.guid||f.guid||p.guid++,f):b},access:function(a,c,d,e,f,g,h){var i,j=d==null,k=0,l=a.length;if(d&&typeof d=="object"){for(k in d)p.access(a,c,k,d[k],1,g,e);f=1}else if(e!==b){i=h===b&&p.isFunction(e),j&&(i?(i=c,c=function(a,b,c){return i.call(p(a),c)}):(c.call(a,e),c=null));if(c)for(;k<l;k++)c(a[k],d,i?e.call(a[k],k,c(a[k],d)):e,h);f=1}return f?a:j?c.call(a):l?c(a[0],d):g},now:function(){return(new Date).getTime()}}),p.ready.promise=function(b){if(!d){d=p.Deferred();if(e.readyState==="complete")setTimeout(p.ready,1);else if(e.addEventListener)e.addEventListener("DOMContentLoaded",D,!1),a.addEventListener("load",p.ready,!1);else{e.attachEvent("onreadystatechange",D),a.attachEvent("onload",p.ready);var c=!1;try{c=a.frameElement==null&&e.documentElement}catch(f){}c&&c.doScroll&&function g(){if(!p.isReady){try{c.doScroll("left")}catch(a){return setTimeout(g,50)}p.ready()}}()}}return d.promise(b)},p.each("Boolean Number String Function Array Date RegExp Object".split(" "),function(a,b){E["[object "+b+"]"]=b.toLowerCase()}),c=p(e);var F={};p.Callbacks=function(a){a=typeof a=="string"?F[a]||G(a):p.extend({},a);var c,d,e,f,g,h,i=[],j=!a.once&&[],k=function(b){c=a.memory&&b,d=!0,h=f||0,f=0,g=i.length,e=!0;for(;i&&h<g;h++)if(i[h].apply(b[0],b[1])===!1&&a.stopOnFalse){c=!1;break}e=!1,i&&(j?j.length&&k(j.shift()):c?i=[]:l.disable())},l={add:function(){if(i){var b=i.length;(function d(b){p.each(b,function(b,c){var e=p.type(c);e==="function"&&(!a.unique||!l.has(c))?i.push(c):c&&c.length&&e!=="string"&&d(c)})})(arguments),e?g=i.length:c&&(f=b,k(c))}return this},remove:function(){return i&&p.each(arguments,function(a,b){var c;while((c=p.inArray(b,i,c))>-1)i.splice(c,1),e&&(c<=g&&g--,c<=h&&h--)}),this},has:function(a){return p.inArray(a,i)>-1},empty:function(){return i=[],this},disable:function(){return i=j=c=b,this},disabled:function(){return!i},lock:function(){return j=b,c||l.disable(),this},locked:function(){return!j},fireWith:function(a,b){return b=b||[],b=[a,b.slice?b.slice():b],i&&(!d||j)&&(e?j.push(b):k(b)),this},fire:function(){return l.fireWith(this,arguments),this},fired:function(){return!!d}};return l},p.extend({Deferred:function(a){var b=[["resolve","done",p.Callbacks("once memory"),"resolved"],["reject","fail",p.Callbacks("once memory"),"rejected"],["notify","progress",p.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return p.Deferred(function(c){p.each(b,function(b,d){var f=d[0],g=a[b];e[d[1]](p.isFunction(g)?function(){var a=g.apply(this,arguments);a&&p.isFunction(a.promise)?a.promise().done(c.resolve).fail(c.reject).progress(c.notify):c[f+"With"](this===e?c:this,[a])}:c[f])}),a=null}).promise()},promise:function(a){return typeof a=="object"?p.extend(a,d):d}},e={};return d.pipe=d.then,p.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[a^1][2].disable,b[2][2].lock),e[f[0]]=g.fire,e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=k.call(arguments),d=c.length,e=d!==1||a&&p.isFunction(a.promise)?d:0,f=e===1?a:p.Deferred(),g=function(a,b,c){return function(d){b[a]=this,c[a]=arguments.length>1?k.call(arguments):d,c===h?f.notifyWith(b,c):--e||f.resolveWith(b,c)}},h,i,j;if(d>1){h=new Array(d),i=new Array(d),j=new Array(d);for(;b<d;b++)c[b]&&p.isFunction(c[b].promise)?c[b].promise().done(g(b,j,c)).fail(f.reject).progress(g(b,i,h)):--e}return e||f.resolveWith(j,c),f.promise()}}),p.support=function(){var b,c,d,f,g,h,i,j,k,l,m,n=e.createElement("div");n.setAttribute("className","t"),n.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",c=n.getElementsByTagName("*"),d=n.getElementsByTagName("a")[0],d.style.cssText="top:1px;float:left;opacity:.5";if(!c||!c.length||!d)return{};f=e.createElement("select"),g=f.appendChild(e.createElement("option")),h=n.getElementsByTagName("input")[0],b={leadingWhitespace:n.firstChild.nodeType===3,tbody:!n.getElementsByTagName("tbody").length,htmlSerialize:!!n.getElementsByTagName("link").length,style:/top/.test(d.getAttribute("style")),hrefNormalized:d.getAttribute("href")==="/a",opacity:/^0.5/.test(d.style.opacity),cssFloat:!!d.style.cssFloat,checkOn:h.value==="on",optSelected:g.selected,getSetAttribute:n.className!=="t",enctype:!!e.createElement("form").enctype,html5Clone:e.createElement("nav").cloneNode(!0).outerHTML!=="<:nav></:nav>",boxModel:e.compatMode==="CSS1Compat",submitBubbles:!0,changeBubbles:!0,focusinBubbles:!1,deleteExpando:!0,noCloneEvent:!0,inlineBlockNeedsLayout:!1,shrinkWrapBlocks:!1,reliableMarginRight:!0,boxSizingReliable:!0,pixelPosition:!1},h.checked=!0,b.noCloneChecked=h.cloneNode(!0).checked,f.disabled=!0,b.optDisabled=!g.disabled;try{delete n.test}catch(o){b.deleteExpando=!1}!n.addEventListener&&n.attachEvent&&n.fireEvent&&(n.attachEvent("onclick",m=function(){b.noCloneEvent=!1}),n.cloneNode(!0).fireEvent("onclick"),n.detachEvent("onclick",m)),h=e.createElement("input"),h.value="t",h.setAttribute("type","radio"),b.radioValue=h.value==="t",h.setAttribute("checked","checked"),h.setAttribute("name","t"),n.appendChild(h),i=e.createDocumentFragment(),i.appendChild(n.lastChild),b.checkClone=i.cloneNode(!0).cloneNode(!0).lastChild.checked,b.appendChecked=h.checked,i.removeChild(h),i.appendChild(n);if(n.attachEvent)for(k in{submit:!0,change:!0,focusin:!0})j="on"+k,l=j in n,l||(n.setAttribute(j,"return;"),l=typeof n[j]=="function"),b[k+"Bubbles"]=l;return p(function(){var c,d,f,g,h="padding:0;margin:0;border:0;display:block;overflow:hidden;",i=e.getElementsByTagName("body")[0];if(!i)return;c=e.createElement("div"),c.style.cssText="visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px",i.insertBefore(c,i.firstChild),d=e.createElement("div"),c.appendChild(d),d.innerHTML="<table><tr><td></td><td>t</td></tr></table>",f=d.getElementsByTagName("td"),f[0].style.cssText="padding:0;margin:0;border:0;display:none",l=f[0].offsetHeight===0,f[0].style.display="",f[1].style.display="none",b.reliableHiddenOffsets=l&&f[0].offsetHeight===0,d.innerHTML="",d.style.cssText="box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;",b.boxSizing=d.offsetWidth===4,b.doesNotIncludeMarginInBodyOffset=i.offsetTop!==1,a.getComputedStyle&&(b.pixelPosition=(a.getComputedStyle(d,null)||{}).top!=="1%",b.boxSizingReliable=(a.getComputedStyle(d,null)||{width:"4px"}).width==="4px",g=e.createElement("div"),g.style.cssText=d.style.cssText=h,g.style.marginRight=g.style.width="0",d.style.width="1px",d.appendChild(g),b.reliableMarginRight=!parseFloat((a.getComputedStyle(g,null)||{}).marginRight)),typeof d.style.zoom!="undefined"&&(d.innerHTML="",d.style.cssText=h+"width:1px;padding:1px;display:inline;zoom:1",b.inlineBlockNeedsLayout=d.offsetWidth===3,d.style.display="block",d.style.overflow="visible",d.innerHTML="<div></div>",d.firstChild.style.width="5px",b.shrinkWrapBlocks=d.offsetWidth!==3,c.style.zoom=1),i.removeChild(c),c=d=f=g=null}),i.removeChild(n),c=d=f=g=h=i=n=null,b}();var H=/(?:\{[\s\S]*\}|\[[\s\S]*\])$/,I=/([A-Z])/g;p.extend({cache:{},deletedIds:[],uuid:0,expando:"jQuery"+(p.fn.jquery+Math.random()).replace(/\D/g,""),noData:{embed:!0,object:"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",applet:!0},hasData:function(a){return a=a.nodeType?p.cache[a[p.expando]]:a[p.expando],!!a&&!K(a)},data:function(a,c,d,e){if(!p.acceptData(a))return;var f,g,h=p.expando,i=typeof c=="string",j=a.nodeType,k=j?p.cache:a,l=j?a[h]:a[h]&&h;if((!l||!k[l]||!e&&!k[l].data)&&i&&d===b)return;l||(j?a[h]=l=p.deletedIds.pop()||++p.uuid:l=h),k[l]||(k[l]={},j||(k[l].toJSON=p.noop));if(typeof c=="object"||typeof c=="function")e?k[l]=p.extend(k[l],c):k[l].data=p.extend(k[l].data,c);return f=k[l],e||(f.data||(f.data={}),f=f.data),d!==b&&(f[p.camelCase(c)]=d),i?(g=f[c],g==null&&(g=f[p.camelCase(c)])):g=f,g},removeData:function(a,b,c){if(!p.acceptData(a))return;var d,e,f,g=a.nodeType,h=g?p.cache:a,i=g?a[p.expando]:p.expando;if(!h[i])return;if(b){d=c?h[i]:h[i].data;if(d){p.isArray(b)||(b in d?b=[b]:(b=p.camelCase(b),b in d?b=[b]:b=b.split(" ")));for(e=0,f=b.length;e<f;e++)delete d[b[e]];if(!(c?K:p.isEmptyObject)(d))return}}if(!c){delete h[i].data;if(!K(h[i]))return}g?p.cleanData([a],!0):p.support.deleteExpando||h!=h.window?delete h[i]:h[i]=null},_data:function(a,b,c){return p.data(a,b,c,!0)},acceptData:function(a){var b=a.nodeName&&p.noData[a.nodeName.toLowerCase()];return!b||b!==!0&&a.getAttribute("classid")===b}}),p.fn.extend({data:function(a,c){var d,e,f,g,h,i=this[0],j=0,k=null;if(a===b){if(this.length){k=p.data(i);if(i.nodeType===1&&!p._data(i,"parsedAttrs")){f=i.attributes;for(h=f.length;j<h;j++)g=f[j].name,g.indexOf("data-")===0&&(g=p.camelCase(g.substring(5)),J(i,g,k[g]));p._data(i,"parsedAttrs",!0)}}return k}return typeof a=="object"?this.each(function(){p.data(this,a)}):(d=a.split(".",2),d[1]=d[1]?"."+d[1]:"",e=d[1]+"!",p.access(this,function(c){if(c===b)return k=this.triggerHandler("getData"+e,[d[0]]),k===b&&i&&(k=p.data(i,a),k=J(i,a,k)),k===b&&d[1]?this.data(d[0]):k;d[1]=c,this.each(function(){var b=p(this);b.triggerHandler("setData"+e,d),p.data(this,a,c),b.triggerHandler("changeData"+e,d)})},null,c,arguments.length>1,null,!1))},removeData:function(a){return this.each(function(){p.removeData(this,a)})}}),p.extend({queue:function(a,b,c){var d;if(a)return b=(b||"fx")+"queue",d=p._data(a,b),c&&(!d||p.isArray(c)?d=p._data(a,b,p.makeArray(c)):d.push(c)),d||[]},dequeue:function(a,b){b=b||"fx";var c=p.queue(a,b),d=c.length,e=c.shift(),f=p._queueHooks(a,b),g=function(){p.dequeue(a,b)};e==="inprogress"&&(e=c.shift(),d--),e&&(b==="fx"&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return p._data(a,c)||p._data(a,c,{empty:p.Callbacks("once memory").add(function(){p.removeData(a,b+"queue",!0),p.removeData(a,c,!0)})})}}),p.fn.extend({queue:function(a,c){var d=2;return typeof a!="string"&&(c=a,a="fx",d--),arguments.length<d?p.queue(this[0],a):c===b?this:this.each(function(){var b=p.queue(this,a,c);p._queueHooks(this,a),a==="fx"&&b[0]!=="inprogress"&&p.dequeue(this,a)})},dequeue:function(a){return this.each(function(){p.dequeue(this,a)})},delay:function(a,b){return a=p.fx?p.fx.speeds[a]||a:a,b=b||"fx",this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,c){var d,e=1,f=p.Deferred(),g=this,h=this.length,i=function(){--e||f.resolveWith(g,[g])};typeof a!="string"&&(c=a,a=b),a=a||"fx";while(h--)d=p._data(g[h],a+"queueHooks"),d&&d.empty&&(e++,d.empty.add(i));return i(),f.promise(c)}});var L,M,N,O=/[\t\r\n]/g,P=/\r/g,Q=/^(?:button|input)$/i,R=/^(?:button|input|object|select|textarea)$/i,S=/^a(?:rea|)$/i,T=/^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,U=p.support.getSetAttribute;p.fn.extend({attr:function(a,b){return p.access(this,p.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){p.removeAttr(this,a)})},prop:function(a,b){return p.access(this,p.prop,a,b,arguments.length>1)},removeProp:function(a){return a=p.propFix[a]||a,this.each(function(){try{this[a]=b,delete this[a]}catch(c){}})},addClass:function(a){var b,c,d,e,f,g,h;if(p.isFunction(a))return this.each(function(b){p(this).addClass(a.call(this,b,this.className))});if(a&&typeof a=="string"){b=a.split(s);for(c=0,d=this.length;c<d;c++){e=this[c];if(e.nodeType===1)if(!e.className&&b.length===1)e.className=a;else{f=" "+e.className+" ";for(g=0,h=b.length;g<h;g++)~f.indexOf(" "+b[g]+" ")||(f+=b[g]+" ");e.className=p.trim(f)}}}return this},removeClass:function(a){var c,d,e,f,g,h,i;if(p.isFunction(a))return this.each(function(b){p(this).removeClass(a.call(this,b,this.className))});if(a&&typeof a=="string"||a===b){c=(a||"").split(s);for(h=0,i=this.length;h<i;h++){e=this[h];if(e.nodeType===1&&e.className){d=(" "+e.className+" ").replace(O," ");for(f=0,g=c.length;f<g;f++)while(d.indexOf(" "+c[f]+" ")>-1)d=d.replace(" "+c[f]+" "," ");e.className=a?p.trim(d):""}}}return this},toggleClass:function(a,b){var c=typeof a,d=typeof b=="boolean";return p.isFunction(a)?this.each(function(c){p(this).toggleClass(a.call(this,c,this.className,b),b)}):this.each(function(){if(c==="string"){var e,f=0,g=p(this),h=b,i=a.split(s);while(e=i[f++])h=d?h:!g.hasClass(e),g[h?"addClass":"removeClass"](e)}else if(c==="undefined"||c==="boolean")this.className&&p._data(this,"__className__",this.className),this.className=this.className||a===!1?"":p._data(this,"__className__")||""})},hasClass:function(a){var b=" "+a+" ",c=0,d=this.length;for(;c<d;c++)if(this[c].nodeType===1&&(" "+this[c].className+" ").replace(O," ").indexOf(b)>-1)return!0;return!1},val:function(a){var c,d,e,f=this[0];if(!arguments.length){if(f)return c=p.valHooks[f.type]||p.valHooks[f.nodeName.toLowerCase()],c&&"get"in c&&(d=c.get(f,"value"))!==b?d:(d=f.value,typeof d=="string"?d.replace(P,""):d==null?"":d);return}return e=p.isFunction(a),this.each(function(d){var f,g=p(this);if(this.nodeType!==1)return;e?f=a.call(this,d,g.val()):f=a,f==null?f="":typeof f=="number"?f+="":p.isArray(f)&&(f=p.map(f,function(a){return a==null?"":a+""})),c=p.valHooks[this.type]||p.valHooks[this.nodeName.toLowerCase()];if(!c||!("set"in c)||c.set(this,f,"value")===b)this.value=f})}}),p.extend({valHooks:{option:{get:function(a){var b=a.attributes.value;return!b||b.specified?a.value:a.text}},select:{get:function(a){var b,c,d,e,f=a.selectedIndex,g=[],h=a.options,i=a.type==="select-one";if(f<0)return null;c=i?f:0,d=i?f+1:h.length;for(;c<d;c++){e=h[c];if(e.selected&&(p.support.optDisabled?!e.disabled:e.getAttribute("disabled")===null)&&(!e.parentNode.disabled||!p.nodeName(e.parentNode,"optgroup"))){b=p(e).val();if(i)return b;g.push(b)}}return i&&!g.length&&h.length?p(h[f]).val():g},set:function(a,b){var c=p.makeArray(b);return p(a).find("option").each(function(){this.selected=p.inArray(p(this).val(),c)>=0}),c.length||(a.selectedIndex=-1),c}}},attrFn:{},attr:function(a,c,d,e){var f,g,h,i=a.nodeType;if(!a||i===3||i===8||i===2)return;if(e&&p.isFunction(p.fn[c]))return p(a)[c](d);if(typeof a.getAttribute=="undefined")return p.prop(a,c,d);h=i!==1||!p.isXMLDoc(a),h&&(c=c.toLowerCase(),g=p.attrHooks[c]||(T.test(c)?M:L));if(d!==b){if(d===null){p.removeAttr(a,c);return}return g&&"set"in g&&h&&(f=g.set(a,d,c))!==b?f:(a.setAttribute(c,""+d),d)}return g&&"get"in g&&h&&(f=g.get(a,c))!==null?f:(f=a.getAttribute(c),f===null?b:f)},removeAttr:function(a,b){var c,d,e,f,g=0;if(b&&a.nodeType===1){d=b.split(s);for(;g<d.length;g++)e=d[g],e&&(c=p.propFix[e]||e,f=T.test(e),f||p.attr(a,e,""),a.removeAttribute(U?e:c),f&&c in a&&(a[c]=!1))}},attrHooks:{type:{set:function(a,b){if(Q.test(a.nodeName)&&a.parentNode)p.error("type property can't be changed");else if(!p.support.radioValue&&b==="radio"&&p.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}},value:{get:function(a,b){return L&&p.nodeName(a,"button")?L.get(a,b):b in a?a.value:null},set:function(a,b,c){if(L&&p.nodeName(a,"button"))return L.set(a,b,c);a.value=b}}},propFix:{tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder",contenteditable:"contentEditable"},prop:function(a,c,d){var e,f,g,h=a.nodeType;if(!a||h===3||h===8||h===2)return;return g=h!==1||!p.isXMLDoc(a),g&&(c=p.propFix[c]||c,f=p.propHooks[c]),d!==b?f&&"set"in f&&(e=f.set(a,d,c))!==b?e:a[c]=d:f&&"get"in f&&(e=f.get(a,c))!==null?e:a[c]},propHooks:{tabIndex:{get:function(a){var c=a.getAttributeNode("tabindex");return c&&c.specified?parseInt(c.value,10):R.test(a.nodeName)||S.test(a.nodeName)&&a.href?0:b}}}}),M={get:function(a,c){var d,e=p.prop(a,c);return e===!0||typeof e!="boolean"&&(d=a.getAttributeNode(c))&&d.nodeValue!==!1?c.toLowerCase():b},set:function(a,b,c){var d;return b===!1?p.removeAttr(a,c):(d=p.propFix[c]||c,d in a&&(a[d]=!0),a.setAttribute(c,c.toLowerCase())),c}},U||(N={name:!0,id:!0,coords:!0},L=p.valHooks.button={get:function(a,c){var d;return d=a.getAttributeNode(c),d&&(N[c]?d.value!=="":d.specified)?d.value:b},set:function(a,b,c){var d=a.getAttributeNode(c);return d||(d=e.createAttribute(c),a.setAttributeNode(d)),d.value=b+""}},p.each(["width","height"],function(a,b){p.attrHooks[b]=p.extend(p.attrHooks[b],{set:function(a,c){if(c==="")return a.setAttribute(b,"auto"),c}})}),p.attrHooks.contenteditable={get:L.get,set:function(a,b,c){b===""&&(b="false"),L.set(a,b,c)}}),p.support.hrefNormalized||p.each(["href","src","width","height"],function(a,c){p.attrHooks[c]=p.extend(p.attrHooks[c],{get:function(a){var d=a.getAttribute(c,2);return d===null?b:d}})}),p.support.style||(p.attrHooks.style={get:function(a){return a.style.cssText.toLowerCase()||b},set:function(a,b){return a.style.cssText=""+b}}),p.support.optSelected||(p.propHooks.selected=p.extend(p.propHooks.selected,{get:function(a){var b=a.parentNode;return b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex),null}})),p.support.enctype||(p.propFix.enctype="encoding"),p.support.checkOn||p.each(["radio","checkbox"],function(){p.valHooks[this]={get:function(a){return a.getAttribute("value")===null?"on":a.value}}}),p.each(["radio","checkbox"],function(){p.valHooks[this]=p.extend(p.valHooks[this],{set:function(a,b){if(p.isArray(b))return a.checked=p.inArray(p(a).val(),b)>=0}})});var V=/^(?:textarea|input|select)$/i,W=/^([^\.]*|)(?:\.(.+)|)$/,X=/(?:^|\s)hover(\.\S+|)\b/,Y=/^key/,Z=/^(?:mouse|contextmenu)|click/,$=/^(?:focusinfocus|focusoutblur)$/,_=function(a){return p.event.special.hover?a:a.replace(X,"mouseenter$1 mouseleave$1")};p.event={add:function(a,c,d,e,f){var g,h,i,j,k,l,m,n,o,q,r;if(a.nodeType===3||a.nodeType===8||!c||!d||!(g=p._data(a)))return;d.handler&&(o=d,d=o.handler,f=o.selector),d.guid||(d.guid=p.guid++),i=g.events,i||(g.events=i={}),h=g.handle,h||(g.handle=h=function(a){return typeof p!="undefined"&&(!a||p.event.triggered!==a.type)?p.event.dispatch.apply(h.elem,arguments):b},h.elem=a),c=p.trim(_(c)).split(" ");for(j=0;j<c.length;j++){k=W.exec(c[j])||[],l=k[1],m=(k[2]||"").split(".").sort(),r=p.event.special[l]||{},l=(f?r.delegateType:r.bindType)||l,r=p.event.special[l]||{},n=p.extend({type:l,origType:k[1],data:e,handler:d,guid:d.guid,selector:f,namespace:m.join(".")},o),q=i[l];if(!q){q=i[l]=[],q.delegateCount=0;if(!r.setup||r.setup.call(a,e,m,h)===!1)a.addEventListener?a.addEventListener(l,h,!1):a.attachEvent&&a.attachEvent("on"+l,h)}r.add&&(r.add.call(a,n),n.handler.guid||(n.handler.guid=d.guid)),f?q.splice(q.delegateCount++,0,n):q.push(n),p.event.global[l]=!0}a=null},global:{},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,n,o,q,r=p.hasData(a)&&p._data(a);if(!r||!(m=r.events))return;b=p.trim(_(b||"")).split(" ");for(f=0;f<b.length;f++){g=W.exec(b[f])||[],h=i=g[1],j=g[2];if(!h){for(h in m)p.event.remove(a,h+b[f],c,d,!0);continue}n=p.event.special[h]||{},h=(d?n.delegateType:n.bindType)||h,o=m[h]||[],k=o.length,j=j?new RegExp("(^|\\.)"+j.split(".").sort().join("\\.(?:.*\\.|)")+"(\\.|$)"):null;for(l=0;l<o.length;l++)q=o[l],(e||i===q.origType)&&(!c||c.guid===q.guid)&&(!j||j.test(q.namespace))&&(!d||d===q.selector||d==="**"&&q.selector)&&(o.splice(l--,1),q.selector&&o.delegateCount--,n.remove&&n.remove.call(a,q));o.length===0&&k!==o.length&&((!n.teardown||n.teardown.call(a,j,r.handle)===!1)&&p.removeEvent(a,h,r.handle),delete m[h])}p.isEmptyObject(m)&&(delete r.handle,p.removeData(a,"events",!0))},customEvent:{getData:!0,setData:!0,changeData:!0},trigger:function(c,d,f,g){if(!f||f.nodeType!==3&&f.nodeType!==8){var h,i,j,k,l,m,n,o,q,r,s=c.type||c,t=[];if($.test(s+p.event.triggered))return;s.indexOf("!")>=0&&(s=s.slice(0,-1),i=!0),s.indexOf(".")>=0&&(t=s.split("."),s=t.shift(),t.sort());if((!f||p.event.customEvent[s])&&!p.event.global[s])return;c=typeof c=="object"?c[p.expando]?c:new p.Event(s,c):new p.Event(s),c.type=s,c.isTrigger=!0,c.exclusive=i,c.namespace=t.join("."),c.namespace_re=c.namespace?new RegExp("(^|\\.)"+t.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,m=s.indexOf(":")<0?"on"+s:"";if(!f){h=p.cache;for(j in h)h[j].events&&h[j].events[s]&&p.event.trigger(c,d,h[j].handle.elem,!0);return}c.result=b,c.target||(c.target=f),d=d!=null?p.makeArray(d):[],d.unshift(c),n=p.event.special[s]||{};if(n.trigger&&n.trigger.apply(f,d)===!1)return;q=[[f,n.bindType||s]];if(!g&&!n.noBubble&&!p.isWindow(f)){r=n.delegateType||s,k=$.test(r+s)?f:f.parentNode;for(l=f;k;k=k.parentNode)q.push([k,r]),l=k;l===(f.ownerDocument||e)&&q.push([l.defaultView||l.parentWindow||a,r])}for(j=0;j<q.length&&!c.isPropagationStopped();j++)k=q[j][0],c.type=q[j][1],o=(p._data(k,"events")||{})[c.type]&&p._data(k,"handle"),o&&o.apply(k,d),o=m&&k[m],o&&p.acceptData(k)&&o.apply(k,d)===!1&&c.preventDefault();return c.type=s,!g&&!c.isDefaultPrevented()&&(!n._default||n._default.apply(f.ownerDocument,d)===!1)&&(s!=="click"||!p.nodeName(f,"a"))&&p.acceptData(f)&&m&&f[s]&&(s!=="focus"&&s!=="blur"||c.target.offsetWidth!==0)&&!p.isWindow(f)&&(l=f[m],l&&(f[m]=null),p.event.triggered=s,f[s](),p.event.triggered=b,l&&(f[m]=l)),c.result}return},dispatch:function(c){c=p.event.fix(c||a.event);var d,e,f,g,h,i,j,k,l,m,n=(p._data(this,"events")||{})[c.type]||[],o=n.delegateCount,q=[].slice.call(arguments),r=!c.exclusive&&!c.namespace,s=p.event.special[c.type]||{},t=[];q[0]=c,c.delegateTarget=this;if(s.preDispatch&&s.preDispatch.call(this,c)===!1)return;if(o&&(!c.button||c.type!=="click"))for(f=c.target;f!=this;f=f.parentNode||this)if(f.disabled!==!0||c.type!=="click"){h={},j=[];for(d=0;d<o;d++)k=n[d],l=k.selector,h[l]===b&&(h[l]=p(l,this).index(f)>=0),h[l]&&j.push(k);j.length&&t.push({elem:f,matches:j})}n.length>o&&t.push({elem:this,matches:n.slice(o)});for(d=0;d<t.length&&!c.isPropagationStopped();d++){i=t[d],c.currentTarget=i.elem;for(e=0;e<i.matches.length&&!c.isImmediatePropagationStopped();e++){k=i.matches[e];if(r||!c.namespace&&!k.namespace||c.namespace_re&&c.namespace_re.test(k.namespace))c.data=k.data,c.handleObj=k,g=((p.event.special[k.origType]||{}).handle||k.handler).apply(i.elem,q),g!==b&&(c.result=g,g===!1&&(c.preventDefault(),c.stopPropagation()))}}return s.postDispatch&&s.postDispatch.call(this,c),c.result},props:"attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return a.which==null&&(a.which=b.charCode!=null?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,c){var d,f,g,h=c.button,i=c.fromElement;return a.pageX==null&&c.clientX!=null&&(d=a.target.ownerDocument||e,f=d.documentElement,g=d.body,a.pageX=c.clientX+(f&&f.scrollLeft||g&&g.scrollLeft||0)-(f&&f.clientLeft||g&&g.clientLeft||0),a.pageY=c.clientY+(f&&f.scrollTop||g&&g.scrollTop||0)-(f&&f.clientTop||g&&g.clientTop||0)),!a.relatedTarget&&i&&(a.relatedTarget=i===a.target?c.toElement:i),!a.which&&h!==b&&(a.which=h&1?1:h&2?3:h&4?2:0),a}},fix:function(a){if(a[p.expando])return a;var b,c,d=a,f=p.event.fixHooks[a.type]||{},g=f.props?this.props.concat(f.props):this.props;a=p.Event(d);for(b=g.length;b;)c=g[--b],a[c]=d[c];return a.target||(a.target=d.srcElement||e),a.target.nodeType===3&&(a.target=a.target.parentNode),a.metaKey=!!a.metaKey,f.filter?f.filter(a,d):a},special:{load:{noBubble:!0},focus:{delegateType:"focusin"},blur:{delegateType:"focusout"},beforeunload:{setup:function(a,b,c){p.isWindow(this)&&(this.onbeforeunload=c)},teardown:function(a,b){this.onbeforeunload===b&&(this.onbeforeunload=null)}}},simulate:function(a,b,c,d){var e=p.extend(new p.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?p.event.trigger(e,null,b):p.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},p.event.handle=p.event.dispatch,p.removeEvent=e.removeEventListener?function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)}:function(a,b,c){var d="on"+b;a.detachEvent&&(typeof a[d]=="undefined"&&(a[d]=null),a.detachEvent(d,c))},p.Event=function(a,b){if(this instanceof p.Event)a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||a.returnValue===!1||a.getPreventDefault&&a.getPreventDefault()?bb:ba):this.type=a,b&&p.extend(this,b),this.timeStamp=a&&a.timeStamp||p.now(),this[p.expando]=!0;else return new p.Event(a,b)},p.Event.prototype={preventDefault:function(){this.isDefaultPrevented=bb;var a=this.originalEvent;if(!a)return;a.preventDefault?a.preventDefault():a.returnValue=!1},stopPropagation:function(){this.isPropagationStopped=bb;var a=this.originalEvent;if(!a)return;a.stopPropagation&&a.stopPropagation(),a.cancelBubble=!0},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=bb,this.stopPropagation()},isDefaultPrevented:ba,isPropagationStopped:ba,isImmediatePropagationStopped:ba},p.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(a,b){p.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj,g=f.selector;if(!e||e!==d&&!p.contains(d,e))a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b;return c}}}),p.support.submitBubbles||(p.event.special.submit={setup:function(){if(p.nodeName(this,"form"))return!1;p.event.add(this,"click._submit keypress._submit",function(a){var c=a.target,d=p.nodeName(c,"input")||p.nodeName(c,"button")?c.form:b;d&&!p._data(d,"_submit_attached")&&(p.event.add(d,"submit._submit",function(a){a._submit_bubble=!0}),p._data(d,"_submit_attached",!0))})},postDispatch:function(a){a._submit_bubble&&(delete a._submit_bubble,this.parentNode&&!a.isTrigger&&p.event.simulate("submit",this.parentNode,a,!0))},teardown:function(){if(p.nodeName(this,"form"))return!1;p.event.remove(this,"._submit")}}),p.support.changeBubbles||(p.event.special.change={setup:function(){if(V.test(this.nodeName)){if(this.type==="checkbox"||this.type==="radio")p.event.add(this,"propertychange._change",function(a){a.originalEvent.propertyName==="checked"&&(this._just_changed=!0)}),p.event.add(this,"click._change",function(a){this._just_changed&&!a.isTrigger&&(this._just_changed=!1),p.event.simulate("change",this,a,!0)});return!1}p.event.add(this,"beforeactivate._change",function(a){var b=a.target;V.test(b.nodeName)&&!p._data(b,"_change_attached")&&(p.event.add(b,"change._change",function(a){this.parentNode&&!a.isSimulated&&!a.isTrigger&&p.event.simulate("change",this.parentNode,a,!0)}),p._data(b,"_change_attached",!0))})},handle:function(a){var b=a.target;if(this!==b||a.isSimulated||a.isTrigger||b.type!=="radio"&&b.type!=="checkbox")return a.handleObj.handler.apply(this,arguments)},teardown:function(){return p.event.remove(this,"._change"),!V.test(this.nodeName)}}),p.support.focusinBubbles||p.each({focus:"focusin",blur:"focusout"},function(a,b){var c=0,d=function(a){p.event.simulate(b,a.target,p.event.fix(a),!0)};p.event.special[b]={setup:function(){c++===0&&e.addEventListener(a,d,!0)},teardown:function(){--c===0&&e.removeEventListener(a,d,!0)}}}),p.fn.extend({on:function(a,c,d,e,f){var g,h;if(typeof a=="object"){typeof c!="string"&&(d=d||c,c=b);for(h in a)this.on(h,c,d,a[h],f);return this}d==null&&e==null?(e=c,d=c=b):e==null&&(typeof c=="string"?(e=d,d=b):(e=d,d=c,c=b));if(e===!1)e=ba;else if(!e)return this;return f===1&&(g=e,e=function(a){return p().off(a),g.apply(this,arguments)},e.guid=g.guid||(g.guid=p.guid++)),this.each(function(){p.event.add(this,a,e,d,c)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,c,d){var e,f;if(a&&a.preventDefault&&a.handleObj)return e=a.handleObj,p(a.delegateTarget).off(e.namespace?e.origType+"."+e.namespace:e.origType,e.selector,e.handler),this;if(typeof a=="object"){for(f in a)this.off(f,c,a[f]);return this}if(c===!1||typeof c=="function")d=c,c=b;return d===!1&&(d=ba),this.each(function(){p.event.remove(this,a,d,c)})},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},live:function(a,b,c){return p(this.context).on(a,this.selector,b,c),this},die:function(a,b){return p(this.context).off(a,this.selector||"**",b),this},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return arguments.length==1?this.off(a,"**"):this.off(b,a||"**",c)},trigger:function(a,b){return this.each(function(){p.event.trigger(a,b,this)})},triggerHandler:function(a,b){if(this[0])return p.event.trigger(a,b,this[0],!0)},toggle:function(a){var b=arguments,c=a.guid||p.guid++,d=0,e=function(c){var e=(p._data(this,"lastToggle"+a.guid)||0)%d;return p._data(this,"lastToggle"+a.guid,e+1),c.preventDefault(),b[e].apply(this,arguments)||!1};e.guid=c;while(d<b.length)b[d++].guid=c;return this.click(e)},hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}}),p.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){p.fn[b]=function(a,c){return c==null&&(c=a,a=null),arguments.length>0?this.on(b,null,a,c):this.trigger(b)},Y.test(b)&&(p.event.fixHooks[b]=p.event.keyHooks),Z.test(b)&&(p.event.fixHooks[b]=p.event.mouseHooks)}),function(a,b){function $(a,b,c,d){c=c||[],b=b||q;var e,f,g,j,k=b.nodeType;if(k!==1&&k!==9)return[];if(!a||typeof a!="string")return c;g=h(b);if(!g&&!d)if(e=L.exec(a))if(j=e[1]){if(k===9){f=b.getElementById(j);if(!f||!f.parentNode)return c;if(f.id===j)return c.push(f),c}else if(b.ownerDocument&&(f=b.ownerDocument.getElementById(j))&&i(b,f)&&f.id===j)return c.push(f),c}else{if(e[2])return u.apply(c,t.call(b.getElementsByTagName(a),0)),c;if((j=e[3])&&X&&b.getElementsByClassName)return u.apply(c,t.call(b.getElementsByClassName(j),0)),c}return bk(a,b,c,d,g)}function _(a){return function(b){var c=b.nodeName.toLowerCase();return c==="input"&&b.type===a}}function ba(a){return function(b){var c=b.nodeName.toLowerCase();return(c==="input"||c==="button")&&b.type===a}}function bb(a,b,c){if(a===b)return c;var d=a.nextSibling;while(d){if(d===b)return-1;d=d.nextSibling}return 1}function bc(a,b,c,d){var e,g,h,i,j,k,l,m,n,p,r=!c&&b!==q,s=(r?"<s>":"")+a.replace(H,"$1<s>"),u=y[o][s];if(u)return d?0:t.call(u,0);j=a,k=[],m=0,n=f.preFilter,p=f.filter;while(j){if(!e||(g=I.exec(j)))g&&(j=j.slice(g[0].length),h.selector=l),k.push(h=[]),l="",r&&(j=" "+j);e=!1;if(g=J.exec(j))l+=g[0],j=j.slice(g[0].length),e=h.push({part:g.pop().replace(H," "),string:g[0],captures:g});for(i in p)(g=S[i].exec(j))&&(!n[i]||(g=n[i](g,b,c)))&&(l+=g[0],j=j.slice(g[0].length),e=h.push({part:i,string:g.shift(),captures:g}));if(!e)break}return l&&(h.selector=l),d?j.length:j?$.error(a):t.call(y(s,k),0)}function bd(a,b,e,f){var g=b.dir,h=s++;return a||(a=function(a){return a===e}),b.first?function(b){while(b=b[g])if(b.nodeType===1)return a(b)&&b}:f?function(b){while(b=b[g])if(b.nodeType===1&&a(b))return b}:function(b){var e,f=h+"."+c,i=f+"."+d;while(b=b[g])if(b.nodeType===1){if((e=b[o])===i)return b.sizset;if(typeof e=="string"&&e.indexOf(f)===0){if(b.sizset)return b}else{b[o]=i;if(a(b))return b.sizset=!0,b;b.sizset=!1}}}}function be(a,b){return a?function(c){var d=b(c);return d&&a(d===!0?c:d)}:b}function bf(a,b,c){var d,e,g=0;for(;d=a[g];g++)f.relative[d.part]?e=bd(e,f.relative[d.part],b,c):e=be(e,f.filter[d.part].apply(null,d.captures.concat(b,c)));return e}function bg(a){return function(b){var c,d=0;for(;c=a[d];d++)if(c(b))return!0;return!1}}function bh(a,b,c,d){var e=0,f=b.length;for(;e<f;e++)$(a,b[e],c,d)}function bi(a,b,c,d,e,g){var h,i=f.setFilters[b.toLowerCase()];return i||$.error(b),(a||!(h=e))&&bh(a||"*",d,h=[],e),h.length>0?i(h,c,g):[]}function bj(a,c,d,e){var f,g,h,i,j,k,l,m,n,o,p,q,r,s=0,t=a.length,v=S.POS,w=new RegExp("^"+v.source+"(?!"+A+")","i"),x=function(){var a=1,c=arguments.length-2;for(;a<c;a++)arguments[a]===b&&(n[a]=b)};for(;s<t;s++){f=a[s],g="",m=e;for(h=0,i=f.length;h<i;h++){j=f[h],k=j.string;if(j.part==="PSEUDO"){v.exec(""),l=0;while(n=v.exec(k)){o=!0,p=v.lastIndex=n.index+n[0].length;if(p>l){g+=k.slice(l,n.index),l=p,q=[c],J.test(g)&&(m&&(q=m),m=e);if(r=O.test(g))g=g.slice(0,-5).replace(J,"$&*"),l++;n.length>1&&n[0].replace(w,x),m=bi(g,n[1],n[2],q,m,r)}g=""}}o||(g+=k),o=!1}g?J.test(g)?bh(g,m||[c],d,e):$(g,c,d,e?e.concat(m):m):u.apply(d,m)}return t===1?d:$.uniqueSort(d)}function bk(a,b,e,g,h){a=a.replace(H,"$1");var i,k,l,m,n,o,p,q,r,s,v=bc(a,b,h),w=b.nodeType;if(S.POS.test(a))return bj(v,b,e,g);if(g)i=t.call(g,0);else if(v.length===1){if((o=t.call(v[0],0)).length>2&&(p=o[0]).part==="ID"&&w===9&&!h&&f.relative[o[1].part]){b=f.find.ID(p.captures[0].replace(R,""),b,h)[0];if(!b)return e;a=a.slice(o.shift().string.length)}r=(v=N.exec(o[0].string))&&!v.index&&b.parentNode||b,q="";for(n=o.length-1;n>=0;n--){p=o[n],s=p.part,q=p.string+q;if(f.relative[s])break;if(f.order.test(s)){i=f.find[s](p.captures[0].replace(R,""),r,h);if(i==null)continue;a=a.slice(0,a.length-q.length)+q.replace(S[s],""),a||u.apply(e,t.call(i,0));break}}}if(a){k=j(a,b,h),c=k.dirruns++,i==null&&(i=f.find.TAG("*",N.test(a)&&b.parentNode||b));for(n=0;m=i[n];n++)d=k.runs++,k(m)&&e.push(m)}return e}var c,d,e,f,g,h,i,j,k,l,m=!0,n="undefined",o=("sizcache"+Math.random()).replace(".",""),q=a.document,r=q.documentElement,s=0,t=[].slice,u=[].push,v=function(a,b){return a[o]=b||!0,a},w=function(){var a={},b=[];return v(function(c,d){return b.push(c)>f.cacheLength&&delete a[b.shift()],a[c]=d},a)},x=w(),y=w(),z=w(),A="[\\x20\\t\\r\\n\\f]",B="(?:\\\\.|[-\\w]|[^\\x00-\\xa0])+",C=B.replace("w","w#"),D="([*^$|!~]?=)",E="\\["+A+"*("+B+")"+A+"*(?:"+D+A+"*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|("+C+")|)|)"+A+"*\\]",F=":("+B+")(?:\\((?:(['\"])((?:\\\\.|[^\\\\])*?)\\2|([^()[\\]]*|(?:(?:"+E+")|[^:]|\\\\.)*|.*))\\)|)",G=":(nth|eq|gt|lt|first|last|even|odd)(?:\\(((?:-\\d)?\\d*)\\)|)(?=[^-]|$)",H=new RegExp("^"+A+"+|((?:^|[^\\\\])(?:\\\\.)*)"+A+"+$","g"),I=new RegExp("^"+A+"*,"+A+"*"),J=new RegExp("^"+A+"*([\\x20\\t\\r\\n\\f>+~])"+A+"*"),K=new RegExp(F),L=/^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,M=/^:not/,N=/[\x20\t\r\n\f]*[+~]/,O=/:not\($/,P=/h\d/i,Q=/input|select|textarea|button/i,R=/\\(?!\\)/g,S={ID:new RegExp("^#("+B+")"),CLASS:new RegExp("^\\.("+B+")"),NAME:new RegExp("^\\[name=['\"]?("+B+")['\"]?\\]"),TAG:new RegExp("^("+B.replace("w","w*")+")"),ATTR:new RegExp("^"+E),PSEUDO:new RegExp("^"+F),CHILD:new RegExp("^:(only|nth|last|first)-child(?:\\("+A+"*(even|odd|(([+-]|)(\\d*)n|)"+A+"*(?:([+-]|)"+A+"*(\\d+)|))"+A+"*\\)|)","i"),POS:new RegExp(G,"ig"),needsContext:new RegExp("^"+A+"*[>+~]|"+G,"i")},T=function(a){var b=q.createElement("div");try{return a(b)}catch(c){return!1}finally{b=null}},U=T(function(a){return a.appendChild(q.createComment("")),!a.getElementsByTagName("*").length}),V=T(function(a){return a.innerHTML="<a href='#'></a>",a.firstChild&&typeof a.firstChild.getAttribute!==n&&a.firstChild.getAttribute("href")==="#"}),W=T(function(a){a.innerHTML="<select></select>";var b=typeof a.lastChild.getAttribute("multiple");return b!=="boolean"&&b!=="string"}),X=T(function(a){return a.innerHTML="<div class='hidden e'></div><div class='hidden'></div>",!a.getElementsByClassName||!a.getElementsByClassName("e").length?!1:(a.lastChild.className="e",a.getElementsByClassName("e").length===2)}),Y=T(function(a){a.id=o+0,a.innerHTML="<a name='"+o+"'></a><div name='"+o+"'></div>",r.insertBefore(a,r.firstChild);var b=q.getElementsByName&&q.getElementsByName(o).length===2+q.getElementsByName(o+0).length;return e=!q.getElementById(o),r.removeChild(a),b});try{t.call(r.childNodes,0)[0].nodeType}catch(Z){t=function(a){var b,c=[];for(;b=this[a];a++)c.push(b);return c}}$.matches=function(a,b){return $(a,null,null,b)},$.matchesSelector=function(a,b){return $(b,null,null,[a]).length>0},g=$.getText=function(a){var b,c="",d=0,e=a.nodeType;if(e){if(e===1||e===9||e===11){if(typeof a.textContent=="string")return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=g(a)}else if(e===3||e===4)return a.nodeValue}else for(;b=a[d];d++)c+=g(b);return c},h=$.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?b.nodeName!=="HTML":!1},i=$.contains=r.contains?function(a,b){var c=a.nodeType===9?a.documentElement:a,d=b&&b.parentNode;return a===d||!!(d&&d.nodeType===1&&c.contains&&c.contains(d))}:r.compareDocumentPosition?function(a,b){return b&&!!(a.compareDocumentPosition(b)&16)}:function(a,b){while(b=b.parentNode)if(b===a)return!0;return!1},$.attr=function(a,b){var c,d=h(a);return d||(b=b.toLowerCase()),f.attrHandle[b]?f.attrHandle[b](a):W||d?a.getAttribute(b):(c=a.getAttributeNode(b),c?typeof a[b]=="boolean"?a[b]?b:null:c.specified?c.value:null:null)},f=$.selectors={cacheLength:50,createPseudo:v,match:S,order:new RegExp("ID|TAG"+(Y?"|NAME":"")+(X?"|CLASS":"")),attrHandle:V?{}:{href:function(a){return a.getAttribute("href",2)},type:function(a){return a.getAttribute("type")}},find:{ID:e?function(a,b,c){if(typeof b.getElementById!==n&&!c){var d=b.getElementById(a);return d&&d.parentNode?[d]:[]}}:function(a,c,d){if(typeof c.getElementById!==n&&!d){var e=c.getElementById(a);return e?e.id===a||typeof e.getAttributeNode!==n&&e.getAttributeNode("id").value===a?[e]:b:[]}},TAG:U?function(a,b){if(typeof b.getElementsByTagName!==n)return b.getElementsByTagName(a)}:function(a,b){var c=b.getElementsByTagName(a);if(a==="*"){var d,e=[],f=0;for(;d=c[f];f++)d.nodeType===1&&e.push(d);return e}return c},NAME:function(a,b){if(typeof b.getElementsByName!==n)return b.getElementsByName(name)},CLASS:function(a,b,c){if(typeof b.getElementsByClassName!==n&&!c)return b.getElementsByClassName(a)}},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(R,""),a[3]=(a[4]||a[5]||"").replace(R,""),a[2]==="~="&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),a[1]==="nth"?(a[2]||$.error(a[0]),a[3]=+(a[3]?a[4]+(a[5]||1):2*(a[2]==="even"||a[2]==="odd")),a[4]=+(a[6]+a[7]||a[2]==="odd")):a[2]&&$.error(a[0]),a},PSEUDO:function(a,b,c){var d,e;if(S.CHILD.test(a[0]))return null;if(a[3])a[2]=a[3];else if(d=a[4])K.test(d)&&(e=bc(d,b,c,!0))&&(e=d.indexOf(")",d.length-e)-d.length)&&(d=d.slice(0,e),a[0]=a[0].slice(0,e)),a[2]=d;return a.slice(0,3)}},filter:{ID:e?function(a){return a=a.replace(R,""),function(b){return b.getAttribute("id")===a}}:function(a){return a=a.replace(R,""),function(b){var c=typeof b.getAttributeNode!==n&&b.getAttributeNode("id");return c&&c.value===a}},TAG:function(a){return a==="*"?function(){return!0}:(a=a.replace(R,"").toLowerCase(),function(b){return b.nodeName&&b.nodeName.toLowerCase()===a})},CLASS:function(a){var b=x[o][a];return b||(b=x(a,new RegExp("(^|"+A+")"+a+"("+A+"|$)"))),function(a){return b.test(a.className||typeof a.getAttribute!==n&&a.getAttribute("class")||"")}},ATTR:function(a,b,c){return b?function(d){var e=$.attr(d,a),f=e+"";if(e==null)return b==="!=";switch(b){case"=":return f===c;case"!=":return f!==c;case"^=":return c&&f.indexOf(c)===0;case"*=":return c&&f.indexOf(c)>-1;case"$=":return c&&f.substr(f.length-c.length)===c;case"~=":return(" "+f+" ").indexOf(c)>-1;case"|=":return f===c||f.substr(0,c.length+1)===c+"-"}}:function(b){return $.attr(b,a)!=null}},CHILD:function(a,b,c,d){if(a==="nth"){var e=s++;return function(a){var b,f,g=0,h=a;if(c===1&&d===0)return!0;b=a.parentNode;if(b&&(b[o]!==e||!a.sizset)){for(h=b.firstChild;h;h=h.nextSibling)if(h.nodeType===1){h.sizset=++g;if(h===a)break}b[o]=e}return f=a.sizset-d,c===0?f===0:f%c===0&&f/c>=0}}return function(b){var c=b;switch(a){case"only":case"first":while(c=c.previousSibling)if(c.nodeType===1)return!1;if(a==="first")return!0;c=b;case"last":while(c=c.nextSibling)if(c.nodeType===1)return!1;return!0}}},PSEUDO:function(a,b,c,d){var e,g=f.pseudos[a]||f.pseudos[a.toLowerCase()];return g||$.error("unsupported pseudo: "+a),g[o]?g(b,c,d):g.length>1?(e=[a,a,"",b],function(a){return g(a,0,e)}):g}},pseudos:{not:v(function(a,b,c){var d=j(a.replace(H,"$1"),b,c);return function(a){return!d(a)}}),enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return b==="input"&&!!a.checked||b==="option"&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},parent:function(a){return!f.pseudos.empty(a)},empty:function(a){var b;a=a.firstChild;while(a){if(a.nodeName>"@"||(b=a.nodeType)===3||b===4)return!1;a=a.nextSibling}return!0},contains:v(function(a){return function(b){return(b.textContent||b.innerText||g(b)).indexOf(a)>-1}}),has:v(function(a){return function(b){return $(a,b).length>0}}),header:function(a){return P.test(a.nodeName)},text:function(a){var b,c;return a.nodeName.toLowerCase()==="input"&&(b=a.type)==="text"&&((c=a.getAttribute("type"))==null||c.toLowerCase()===b)},radio:_("radio"),checkbox:_("checkbox"),file:_("file"),password:_("password"),image:_("image"),submit:ba("submit"),reset:ba("reset"),button:function(a){var b=a.nodeName.toLowerCase();return b==="input"&&a.type==="button"||b==="button"},input:function(a){return Q.test(a.nodeName)},focus:function(a){var b=a.ownerDocument;return a===b.activeElement&&(!b.hasFocus||b.hasFocus())&&(!!a.type||!!a.href)},active:function(a){return a===a.ownerDocument.activeElement}},setFilters:{first:function(a,b,c){return c?a.slice(1):[a[0]]},last:function(a,b,c){var d=a.pop();return c?a:[d]},even:function(a,b,c){var d=[],e=c?1:0,f=a.length;for(;e<f;e=e+2)d.push(a[e]);return d},odd:function(a,b,c){var d=[],e=c?0:1,f=a.length;for(;e<f;e=e+2)d.push(a[e]);return d},lt:function(a,b,c){return c?a.slice(+b):a.slice(0,+b)},gt:function(a,b,c){return c?a.slice(0,+b+1):a.slice(+b+1)},eq:function(a,b,c){var d=a.splice(+b,1);return c?a:d}}},k=r.compareDocumentPosition?function(a,b){return a===b?(l=!0,0):(!a.compareDocumentPosition||!b.compareDocumentPosition?a.compareDocumentPosition:a.compareDocumentPosition(b)&4)?-1:1}:function(a,b){if(a===b)return l=!0,0;if(a.sourceIndex&&b.sourceIndex)return a.sourceIndex-b.sourceIndex;var c,d,e=[],f=[],g=a.parentNode,h=b.parentNode,i=g;if(g===h)return bb(a,b);if(!g)return-1;if(!h)return 1;while(i)e.unshift(i),i=i.parentNode;i=h;while(i)f.unshift(i),i=i.parentNode;c=e.length,d=f.length;for(var j=0;j<c&&j<d;j++)if(e[j]!==f[j])return bb(e[j],f[j]);return j===c?bb(a,f[j],-1):bb(e[j],b,1)},[0,0].sort(k),m=!l,$.uniqueSort=function(a){var b,c=1;l=m,a.sort(k);if(l)for(;b=a[c];c++)b===a[c-1]&&a.splice(c--,1);return a},$.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},j=$.compile=function(a,b,c){var d,e,f,g=z[o][a];if(g&&g.context===b)return g;d=bc(a,b,c);for(e=0,f=d.length;e<f;e++)d[e]=bf(d[e],b,c);return g=z(a,bg(d)),g.context=b,g.runs=g.dirruns=0,g},q.querySelectorAll&&function(){var a,b=bk,c=/'|\\/g,d=/\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,e=[],f=[":active"],g=r.matchesSelector||r.mozMatchesSelector||r.webkitMatchesSelector||r.oMatchesSelector||r.msMatchesSelector;T(function(a){a.innerHTML="<select><option selected=''></option></select>",a.querySelectorAll("[selected]").length||e.push("\\["+A+"*(?:checked|disabled|ismap|multiple|readonly|selected|value)"),a.querySelectorAll(":checked").length||e.push(":checked")}),T(function(a){a.innerHTML="<p test=''></p>",a.querySelectorAll("[test^='']").length&&e.push("[*^$]="+A+"*(?:\"\"|'')"),a.innerHTML="<input type='hidden'/>",a.querySelectorAll(":enabled").length||e.push(":enabled",":disabled")}),e=e.length&&new RegExp(e.join("|")),bk=function(a,d,f,g,h){if(!g&&!h&&(!e||!e.test(a)))if(d.nodeType===9)try{return u.apply(f,t.call(d.querySelectorAll(a),0)),f}catch(i){}else if(d.nodeType===1&&d.nodeName.toLowerCase()!=="object"){var j,k,l,m=d.getAttribute("id"),n=m||o,p=N.test(a)&&d.parentNode||d;m?n=n.replace(c,"\\$&"):d.setAttribute("id",n),j=bc(a,d,h),n="[id='"+n+"']";for(k=0,l=j.length;k<l;k++)j[k]=n+j[k].selector;try{return u.apply(f,t.call(p.querySelectorAll(j.join(",")),0)),f}catch(i){}finally{m||d.removeAttribute("id")}}return b(a,d,f,g,h)},g&&(T(function(b){a=g.call(b,"div");try{g.call(b,"[test!='']:sizzle"),f.push(S.PSEUDO.source,S.POS.source,"!=")}catch(c){}}),f=new RegExp(f.join("|")),$.matchesSelector=function(b,c){c=c.replace(d,"='$1']");if(!h(b)&&!f.test(c)&&(!e||!e.test(c)))try{var i=g.call(b,c);if(i||a||b.document&&b.document.nodeType!==11)return i}catch(j){}return $(c,null,null,[b]).length>0})}(),f.setFilters.nth=f.setFilters.eq,f.filters=f.pseudos,$.attr=p.attr,p.find=$,p.expr=$.selectors,p.expr[":"]=p.expr.pseudos,p.unique=$.uniqueSort,p.text=$.getText,p.isXMLDoc=$.isXML,p.contains=$.contains}(a);var bc=/Until$/,bd=/^(?:parents|prev(?:Until|All))/,be=/^.[^:#\[\.,]*$/,bf=p.expr.match.needsContext,bg={children:!0,contents:!0,next:!0,prev:!0};p.fn.extend({find:function(a){var b,c,d,e,f,g,h=this;if(typeof a!="string")return p(a).filter(function(){for(b=0,c=h.length;b<c;b++)if(p.contains(h[b],this))return!0});g=this.pushStack("","find",a);for(b=0,c=this.length;b<c;b++){d=g.length,p.find(a,this[b],g);if(b>0)for(e=d;e<g.length;e++)for(f=0;f<d;f++)if(g[f]===g[e]){g.splice(e--,1);break}}return g},has:function(a){var b,c=p(a,this),d=c.length;return this.filter(function(){for(b=0;b<d;b++)if(p.contains(this,c[b]))return!0})},not:function(a){return this.pushStack(bj(this,a,!1),"not",a)},filter:function(a){return this.pushStack(bj(this,a,!0),"filter",a)},is:function(a){return!!a&&(typeof a=="string"?bf.test(a)?p(a,this.context).index(this[0])>=0:p.filter(a,this).length>0:this.filter(a).length>0)},closest:function(a,b){var c,d=0,e=this.length,f=[],g=bf.test(a)||typeof a!="string"?p(a,b||this.context):0;for(;d<e;d++){c=this[d];while(c&&c.ownerDocument&&c!==b&&c.nodeType!==11){if(g?g.index(c)>-1:p.find.matchesSelector(c,a)){f.push(c);break}c=c.parentNode}}return f=f.length>1?p.unique(f):f,this.pushStack(f,"closest",a)},index:function(a){return a?typeof a=="string"?p.inArray(this[0],p(a)):p.inArray(a.jquery?a[0]:a,this):this[0]&&this[0].parentNode?this.prevAll().length:-1},add:function(a,b){var c=typeof a=="string"?p(a,b):p.makeArray(a&&a.nodeType?[a]:a),d=p.merge(this.get(),c);return this.pushStack(bh(c[0])||bh(d[0])?d:p.unique(d))},addBack:function(a){return this.add(a==null?this.prevObject:this.prevObject.filter(a))}}),p.fn.andSelf=p.fn.addBack,p.each({parent:function(a){var b=a.parentNode;return b&&b.nodeType!==11?b:null},parents:function(a){return p.dir(a,"parentNode")},parentsUntil:function(a,b,c){return p.dir(a,"parentNode",c)},next:function(a){return bi(a,"nextSibling")},prev:function(a){return bi(a,"previousSibling")},nextAll:function(a){return p.dir(a,"nextSibling")},prevAll:function(a){return p.dir(a,"previousSibling")},nextUntil:function(a,b,c){return p.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return p.dir(a,"previousSibling",c)},siblings:function(a){return p.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return p.sibling(a.firstChild)},contents:function(a){return p.nodeName(a,"iframe")?a.contentDocument||a.contentWindow.document:p.merge([],a.childNodes)}},function(a,b){p.fn[a]=function(c,d){var e=p.map(this,b,c);return bc.test(a)||(d=c),d&&typeof d=="string"&&(e=p.filter(d,e)),e=this.length>1&&!bg[a]?p.unique(e):e,this.length>1&&bd.test(a)&&(e=e.reverse()),this.pushStack(e,a,k.call(arguments).join(","))}}),p.extend({filter:function(a,b,c){return c&&(a=":not("+a+")"),b.length===1?p.find.matchesSelector(b[0],a)?[b[0]]:[]:p.find.matches(a,b)},dir:function(a,c,d){var e=[],f=a[c];while(f&&f.nodeType!==9&&(d===b||f.nodeType!==1||!p(f).is(d)))f.nodeType===1&&e.push(f),f=f[c];return e},sibling:function(a,b){var c=[];for(;a;a=a.nextSibling)a.nodeType===1&&a!==b&&c.push(a);return c}});var bl="abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",bm=/ jQuery\d+="(?:null|\d+)"/g,bn=/^\s+/,bo=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,bp=/<([\w:]+)/,bq=/<tbody/i,br=/<|&#?\w+;/,bs=/<(?:script|style|link)/i,bt=/<(?:script|object|embed|option|style)/i,bu=new RegExp("<(?:"+bl+")[\\s/>]","i"),bv=/^(?:checkbox|radio)$/,bw=/checked\s*(?:[^=]|=\s*.checked.)/i,bx=/\/(java|ecma)script/i,by=/^\s*<!(?:\[CDATA\[|\-\-)|[\]\-]{2}>\s*$/g,bz={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"],_default:[0,"",""]},bA=bk(e),bB=bA.appendChild(e.createElement("div"));bz.optgroup=bz.option,bz.tbody=bz.tfoot=bz.colgroup=bz.caption=bz.thead,bz.th=bz.td,p.support.htmlSerialize||(bz._default=[1,"X<div>","</div>"]),p.fn.extend({text:function(a){return p.access(this,function(a){return a===b?p.text(this):this.empty().append((this[0]&&this[0].ownerDocument||e).createTextNode(a))},null,a,arguments.length)},wrapAll:function(a){if(p.isFunction(a))return this.each(function(b){p(this).wrapAll(a.call(this,b))});if(this[0]){var b=p(a,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstChild&&a.firstChild.nodeType===1)a=a.firstChild;return a}).append(this)}return this},wrapInner:function(a){return p.isFunction(a)?this.each(function(b){p(this).wrapInner(a.call(this,b))}):this.each(function(){var b=p(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=p.isFunction(a);return this.each(function(c){p(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){p.nodeName(this,"body")||p(this).replaceWith(this.childNodes)}).end()},append:function(){return this.domManip(arguments,!0,function(a){(this.nodeType===1||this.nodeType===11)&&this.appendChild(a)})},prepend:function(){return this.domManip(arguments,!0,function(a){(this.nodeType===1||this.nodeType===11)&&this.insertBefore(a,this.firstChild)})},before:function(){if(!bh(this[0]))return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this)});if(arguments.length){var a=p.clean(arguments);return this.pushStack(p.merge(a,this),"before",this.selector)}},after:function(){if(!bh(this[0]))return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this.nextSibling)});if(arguments.length){var a=p.clean(arguments);return this.pushStack(p.merge(this,a),"after",this.selector)}},remove:function(a,b){var c,d=0;for(;(c=this[d])!=null;d++)if(!a||p.filter(a,[c]).length)!b&&c.nodeType===1&&(p.cleanData(c.getElementsByTagName("*")),p.cleanData([c])),c.parentNode&&c.parentNode.removeChild(c);return this},empty:function(){var a,b=0;for(;(a=this[b])!=null;b++){a.nodeType===1&&p.cleanData(a.getElementsByTagName("*"));while(a.firstChild)a.removeChild(a.firstChild)}return this},clone:function(a,b){return a=a==null?!1:a,b=b==null?a:b,this.map(function(){return p.clone(this,a,b)})},html:function(a){return p.access(this,function(a){var c=this[0]||{},d=0,e=this.length;if(a===b)return c.nodeType===1?c.innerHTML.replace(bm,""):b;if(typeof a=="string"&&!bs.test(a)&&(p.support.htmlSerialize||!bu.test(a))&&(p.support.leadingWhitespace||!bn.test(a))&&!bz[(bp.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(bo,"<$1></$2>");try{for(;d<e;d++)c=this[d]||{},c.nodeType===1&&(p.cleanData(c.getElementsByTagName("*")),c.innerHTML=a);c=0}catch(f){}}c&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(a){return bh(this[0])?this.length?this.pushStack(p(p.isFunction(a)?a():a),"replaceWith",a):this:p.isFunction(a)?this.each(function(b){var c=p(this),d=c.html();c.replaceWith(a.call(this,b,d))}):(typeof a!="string"&&(a=p(a).detach()),this.each(function(){var b=this.nextSibling,c=this.parentNode;p(this).remove(),b?p(b).before(a):p(c).append(a)}))},detach:function(a){return this.remove(a,!0)},domManip:function(a,c,d){a=[].concat.apply([],a);var e,f,g,h,i=0,j=a[0],k=[],l=this.length;if(!p.support.checkClone&&l>1&&typeof j=="string"&&bw.test(j))return this.each(function(){p(this).domManip(a,c,d)});if(p.isFunction(j))return this.each(function(e){var f=p(this);a[0]=j.call(this,e,c?f.html():b),f.domManip(a,c,d)});if(this[0]){e=p.buildFragment(a,this,k),g=e.fragment,f=g.firstChild,g.childNodes.length===1&&(g=f);if(f){c=c&&p.nodeName(f,"tr");for(h=e.cacheable||l-1;i<l;i++)d.call(c&&p.nodeName(this[i],"table")?bC(this[i],"tbody"):this[i],i===h?g:p.clone(g,!0,!0))}g=f=null,k.length&&p.each(k,function(a,b){b.src?p.ajax?p.ajax({url:b.src,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0}):p.error("no ajax"):p.globalEval((b.text||b.textContent||b.innerHTML||"").replace(by,"")),b.parentNode&&b.parentNode.removeChild(b)})}return this}}),p.buildFragment=function(a,c,d){var f,g,h,i=a[0];return c=c||e,c=!c.nodeType&&c[0]||c,c=c.ownerDocument||c,a.length===1&&typeof i=="string"&&i.length<512&&c===e&&i.charAt(0)==="<"&&!bt.test(i)&&(p.support.checkClone||!bw.test(i))&&(p.support.html5Clone||!bu.test(i))&&(g=!0,f=p.fragments[i],h=f!==b),f||(f=c.createDocumentFragment(),p.clean(a,c,f,d),g&&(p.fragments[i]=h&&f)),{fragment:f,cacheable:g}},p.fragments={},p.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){p.fn[a]=function(c){var d,e=0,f=[],g=p(c),h=g.length,i=this.length===1&&this[0].parentNode;if((i==null||i&&i.nodeType===11&&i.childNodes.length===1)&&h===1)return g[b](this[0]),this;for(;e<h;e++)d=(e>0?this.clone(!0):this).get(),p(g[e])[b](d),f=f.concat(d);return this.pushStack(f,a,g.selector)}}),p.extend({clone:function(a,b,c){var d,e,f,g;p.support.html5Clone||p.isXMLDoc(a)||!bu.test("<"+a.nodeName+">")?g=a.cloneNode(!0):(bB.innerHTML=a.outerHTML,bB.removeChild(g=bB.firstChild));if((!p.support.noCloneEvent||!p.support.noCloneChecked)&&(a.nodeType===1||a.nodeType===11)&&!p.isXMLDoc(a)){bE(a,g),d=bF(a),e=bF(g);for(f=0;d[f];++f)e[f]&&bE(d[f],e[f])}if(b){bD(a,g);if(c){d=bF(a),e=bF(g);for(f=0;d[f];++f)bD(d[f],e[f])}}return d=e=null,g},clean:function(a,b,c,d){var f,g,h,i,j,k,l,m,n,o,q,r,s=b===e&&bA,t=[];if(!b||typeof b.createDocumentFragment=="undefined")b=e;for(f=0;(h=a[f])!=null;f++){typeof h=="number"&&(h+="");if(!h)continue;if(typeof h=="string")if(!br.test(h))h=b.createTextNode(h);else{s=s||bk(b),l=b.createElement("div"),s.appendChild(l),h=h.replace(bo,"<$1></$2>"),i=(bp.exec(h)||["",""])[1].toLowerCase(),j=bz[i]||bz._default,k=j[0],l.innerHTML=j[1]+h+j[2];while(k--)l=l.lastChild;if(!p.support.tbody){m=bq.test(h),n=i==="table"&&!m?l.firstChild&&l.firstChild.childNodes:j[1]==="<table>"&&!m?l.childNodes:[];for(g=n.length-1;g>=0;--g)p.nodeName(n[g],"tbody")&&!n[g].childNodes.length&&n[g].parentNode.removeChild(n[g])}!p.support.leadingWhitespace&&bn.test(h)&&l.insertBefore(b.createTextNode(bn.exec(h)[0]),l.firstChild),h=l.childNodes,l.parentNode.removeChild(l)}h.nodeType?t.push(h):p.merge(t,h)}l&&(h=l=s=null);if(!p.support.appendChecked)for(f=0;(h=t[f])!=null;f++)p.nodeName(h,"input")?bG(h):typeof h.getElementsByTagName!="undefined"&&p.grep(h.getElementsByTagName("input"),bG);if(c){q=function(a){if(!a.type||bx.test(a.type))return d?d.push(a.parentNode?a.parentNode.removeChild(a):a):c.appendChild(a)};for(f=0;(h=t[f])!=null;f++)if(!p.nodeName(h,"script")||!q(h))c.appendChild(h),typeof h.getElementsByTagName!="undefined"&&(r=p.grep(p.merge([],h.getElementsByTagName("script")),q),t.splice.apply(t,[f+1,0].concat(r)),f+=r.length)}return t},cleanData:function(a,b){var c,d,e,f,g=0,h=p.expando,i=p.cache,j=p.support.deleteExpando,k=p.event.special;for(;(e=a[g])!=null;g++)if(b||p.acceptData(e)){d=e[h],c=d&&i[d];if(c){if(c.events)for(f in c.events)k[f]?p.event.remove(e,f):p.removeEvent(e,f,c.handle);i[d]&&(delete i[d],j?delete e[h]:e.removeAttribute?e.removeAttribute(h):e[h]=null,p.deletedIds.push(d))}}}}),function(){var a,b;p.uaMatch=function(a){a=a.toLowerCase();var b=/(chrome)[ \/]([\w.]+)/.exec(a)||/(webkit)[ \/]([\w.]+)/.exec(a)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(a)||/(msie) ([\w.]+)/.exec(a)||a.indexOf("compatible")<0&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(a)||[];return{browser:b[1]||"",version:b[2]||"0"}},a=p.uaMatch(g.userAgent),b={},a.browser&&(b[a.browser]=!0,b.version=a.version),b.chrome?b.webkit=!0:b.webkit&&(b.safari=!0),p.browser=b,p.sub=function(){function a(b,c){return new a.fn.init(b,c)}p.extend(!0,a,this),a.superclass=this,a.fn=a.prototype=this(),a.fn.constructor=a,a.sub=this.sub,a.fn.init=function c(c,d){return d&&d instanceof p&&!(d instanceof a)&&(d=a(d)),p.fn.init.call(this,c,d,b)},a.fn.init.prototype=a.fn;var b=a(e);return a}}();var bH,bI,bJ,bK=/alpha\([^)]*\)/i,bL=/opacity=([^)]*)/,bM=/^(top|right|bottom|left)$/,bN=/^(none|table(?!-c[ea]).+)/,bO=/^margin/,bP=new RegExp("^("+q+")(.*)$","i"),bQ=new RegExp("^("+q+")(?!px)[a-z%]+$","i"),bR=new RegExp("^([-+])=("+q+")","i"),bS={},bT={position:"absolute",visibility:"hidden",display:"block"},bU={letterSpacing:0,fontWeight:400},bV=["Top","Right","Bottom","Left"],bW=["Webkit","O","Moz","ms"],bX=p.fn.toggle;p.fn.extend({css:function(a,c){return p.access(this,function(a,c,d){return d!==b?p.style(a,c,d):p.css(a,c)},a,c,arguments.length>1)},show:function(){return b$(this,!0)},hide:function(){return b$(this)},toggle:function(a,b){var c=typeof a=="boolean";return p.isFunction(a)&&p.isFunction(b)?bX.apply(this,arguments):this.each(function(){(c?a:bZ(this))?p(this).show():p(this).hide()})}}),p.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=bH(a,"opacity");return c===""?"1":c}}}},cssNumber:{fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":p.support.cssFloat?"cssFloat":"styleFloat"},style:function(a,c,d,e){if(!a||a.nodeType===3||a.nodeType===8||!a.style)return;var f,g,h,i=p.camelCase(c),j=a.style;c=p.cssProps[i]||(p.cssProps[i]=bY(j,i)),h=p.cssHooks[c]||p.cssHooks[i];if(d===b)return h&&"get"in h&&(f=h.get(a,!1,e))!==b?f:j[c];g=typeof d,g==="string"&&(f=bR.exec(d))&&(d=(f[1]+1)*f[2]+parseFloat(p.css(a,c)),g="number");if(d==null||g==="number"&&isNaN(d))return;g==="number"&&!p.cssNumber[i]&&(d+="px");if(!h||!("set"in h)||(d=h.set(a,d,e))!==b)try{j[c]=d}catch(k){}},css:function(a,c,d,e){var f,g,h,i=p.camelCase(c);return c=p.cssProps[i]||(p.cssProps[i]=bY(a.style,i)),h=p.cssHooks[c]||p.cssHooks[i],h&&"get"in h&&(f=h.get(a,!0,e)),f===b&&(f=bH(a,c)),f==="normal"&&c in bU&&(f=bU[c]),d||e!==b?(g=parseFloat(f),d||p.isNumeric(g)?g||0:f):f},swap:function(a,b,c){var d,e,f={};for(e in b)f[e]=a.style[e],a.style[e]=b[e];d=c.call(a);for(e in b)a.style[e]=f[e];return d}}),a.getComputedStyle?bH=function(b,c){var d,e,f,g,h=a.getComputedStyle(b,null),i=b.style;return h&&(d=h[c],d===""&&!p.contains(b.ownerDocument,b)&&(d=p.style(b,c)),bQ.test(d)&&bO.test(c)&&(e=i.width,f=i.minWidth,g=i.maxWidth,i.minWidth=i.maxWidth=i.width=d,d=h.width,i.width=e,i.minWidth=f,i.maxWidth=g)),d}:e.documentElement.currentStyle&&(bH=function(a,b){var c,d,e=a.currentStyle&&a.currentStyle[b],f=a.style;return e==null&&f&&f[b]&&(e=f[b]),bQ.test(e)&&!bM.test(b)&&(c=f.left,d=a.runtimeStyle&&a.runtimeStyle.left,d&&(a.runtimeStyle.left=a.currentStyle.left),f.left=b==="fontSize"?"1em":e,e=f.pixelLeft+"px",f.left=c,d&&(a.runtimeStyle.left=d)),e===""?"auto":e}),p.each(["height","width"],function(a,b){p.cssHooks[b]={get:function(a,c,d){if(c)return a.offsetWidth===0&&bN.test(bH(a,"display"))?p.swap(a,bT,function(){return cb(a,b,d)}):cb(a,b,d)},set:function(a,c,d){return b_(a,c,d?ca(a,b,d,p.support.boxSizing&&p.css(a,"boxSizing")==="border-box"):0)}}}),p.support.opacity||(p.cssHooks.opacity={get:function(a,b){return bL.test((b&&a.currentStyle?a.currentStyle.filter:a.style.filter)||"")?.01*parseFloat(RegExp.$1)+"":b?"1":""},set:function(a,b){var c=a.style,d=a.currentStyle,e=p.isNumeric(b)?"alpha(opacity="+b*100+")":"",f=d&&d.filter||c.filter||"";c.zoom=1;if(b>=1&&p.trim(f.replace(bK,""))===""&&c.removeAttribute){c.removeAttribute("filter");if(d&&!d.filter)return}c.filter=bK.test(f)?f.replace(bK,e):f+" "+e}}),p(function(){p.support.reliableMarginRight||(p.cssHooks.marginRight={get:function(a,b){return p.swap(a,{display:"inline-block"},function(){if(b)return bH(a,"marginRight")})}}),!p.support.pixelPosition&&p.fn.position&&p.each(["top","left"],function(a,b){p.cssHooks[b]={get:function(a,c){if(c){var d=bH(a,b);return bQ.test(d)?p(a).position()[b]+"px":d}}}})}),p.expr&&p.expr.filters&&(p.expr.filters.hidden=function(a){return a.offsetWidth===0&&a.offsetHeight===0||!p.support.reliableHiddenOffsets&&(a.style&&a.style.display||bH(a,"display"))==="none"},p.expr.filters.visible=function(a){return!p.expr.filters.hidden(a)}),p.each({margin:"",padding:"",border:"Width"},function(a,b){p.cssHooks[a+b]={expand:function(c){var d,e=typeof c=="string"?c.split(" "):[c],f={};for(d=0;d<4;d++)f[a+bV[d]+b]=e[d]||e[d-2]||e[0];return f}},bO.test(a)||(p.cssHooks[a+b].set=b_)});var cd=/%20/g,ce=/\[\]$/,cf=/\r?\n/g,cg=/^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,ch=/^(?:select|textarea)/i;p.fn.extend({serialize:function(){return p.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?p.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||ch.test(this.nodeName)||cg.test(this.type))}).map(function(a,b){var c=p(this).val();return c==null?null:p.isArray(c)?p.map(c,function(a,c){return{name:b.name,value:a.replace(cf,"\r\n")}}):{name:b.name,value:c.replace(cf,"\r\n")}}).get()}}),p.param=function(a,c){var d,e=[],f=function(a,b){b=p.isFunction(b)?b():b==null?"":b,e[e.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};c===b&&(c=p.ajaxSettings&&p.ajaxSettings.traditional);if(p.isArray(a)||a.jquery&&!p.isPlainObject(a))p.each(a,function(){f(this.name,this.value)});else for(d in a)ci(d,a[d],c,f);return e.join("&").replace(cd,"+")};var cj,ck,cl=/#.*$/,cm=/^(.*?):[ \t]*([^\r\n]*)\r?$/mg,cn=/^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,co=/^(?:GET|HEAD)$/,cp=/^\/\//,cq=/\?/,cr=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,cs=/([?&])_=[^&]*/,ct=/^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,cu=p.fn.load,cv={},cw={},cx=["*/"]+["*"];try{cj=f.href}catch(cy){cj=e.createElement("a"),cj.href="",cj=cj.href}ck=ct.exec(cj.toLowerCase())||[],p.fn.load=function(a,c,d){if(typeof a!="string"&&cu)return cu.apply(this,arguments);if(!this.length)return this;var e,f,g,h=this,i=a.indexOf(" ");return i>=0&&(e=a.slice(i,a.length),a=a.slice(0,i)),p.isFunction(c)?(d=c,c=b):c&&typeof c=="object"&&(f="POST"),p.ajax({url:a,type:f,dataType:"html",data:c,complete:function(a,b){d&&h.each(d,g||[a.responseText,b,a])}}).done(function(a){g=arguments,h.html(e?p("<div>").append(a.replace(cr,"")).find(e):a)}),this},p.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),function(a,b){p.fn[b]=function(a){return this.on(b,a)}}),p.each(["get","post"],function(a,c){p[c]=function(a,d,e,f){return p.isFunction(d)&&(f=f||e,e=d,d=b),p.ajax({type:c,url:a,data:d,success:e,dataType:f})}}),p.extend({getScript:function(a,c){return p.get(a,b,c,"script")},getJSON:function(a,b,c){return p.get(a,b,c,"json")},ajaxSetup:function(a,b){return b?cB(a,p.ajaxSettings):(b=a,a=p.ajaxSettings),cB(a,b),a},ajaxSettings:{url:cj,isLocal:cn.test(ck[1]),global:!0,type:"GET",contentType:"application/x-www-form-urlencoded; charset=UTF-8",processData:!0,async:!0,accepts:{xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript","*":cx},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText"},converters:{"* text":a.String,"text html":!0,"text json":p.parseJSON,"text xml":p.parseXML},flatOptions:{context:!0,url:!0}},ajaxPrefilter:cz(cv),ajaxTransport:cz(cw),ajax:function(a,c){function y(a,c,f,i){var k,s,t,u,w,y=c;if(v===2)return;v=2,h&&clearTimeout(h),g=b,e=i||"",x.readyState=a>0?4:0,f&&(u=cC(l,x,f));if(a>=200&&a<300||a===304)l.ifModified&&(w=x.getResponseHeader("Last-Modified"),w&&(p.lastModified[d]=w),w=x.getResponseHeader("Etag"),w&&(p.etag[d]=w)),a===304?(y="notmodified",k=!0):(k=cD(l,u),y=k.state,s=k.data,t=k.error,k=!t);else{t=y;if(!y||a)y="error",a<0&&(a=0)}x.status=a,x.statusText=""+(c||y),k?o.resolveWith(m,[s,y,x]):o.rejectWith(m,[x,y,t]),x.statusCode(r),r=b,j&&n.trigger("ajax"+(k?"Success":"Error"),[x,l,k?s:t]),q.fireWith(m,[x,y]),j&&(n.trigger("ajaxComplete",[x,l]),--p.active||p.event.trigger("ajaxStop"))}typeof a=="object"&&(c=a,a=b),c=c||{};var d,e,f,g,h,i,j,k,l=p.ajaxSetup({},c),m=l.context||l,n=m!==l&&(m.nodeType||m instanceof p)?p(m):p.event,o=p.Deferred(),q=p.Callbacks("once memory"),r=l.statusCode||{},t={},u={},v=0,w="canceled",x={readyState:0,setRequestHeader:function(a,b){if(!v){var c=a.toLowerCase();a=u[c]=u[c]||a,t[a]=b}return this},getAllResponseHeaders:function(){return v===2?e:null},getResponseHeader:function(a){var c;if(v===2){if(!f){f={};while(c=cm.exec(e))f[c[1].toLowerCase()]=c[2]}c=f[a.toLowerCase()]}return c===b?null:c},overrideMimeType:function(a){return v||(l.mimeType=a),this},abort:function(a){return a=a||w,g&&g.abort(a),y(0,a),this}};o.promise(x),x.success=x.done,x.error=x.fail,x.complete=q.add,x.statusCode=function(a){if(a){var b;if(v<2)for(b in a)r[b]=[r[b],a[b]];else b=a[x.status],x.always(b)}return this},l.url=((a||l.url)+"").replace(cl,"").replace(cp,ck[1]+"//"),l.dataTypes=p.trim(l.dataType||"*").toLowerCase().split(s),l.crossDomain==null&&(i=ct.exec(l.url.toLowerCase()),l.crossDomain=!(!i||i[1]==ck[1]&&i[2]==ck[2]&&(i[3]||(i[1]==="http:"?80:443))==(ck[3]||(ck[1]==="http:"?80:443)))),l.data&&l.processData&&typeof l.data!="string"&&(l.data=p.param(l.data,l.traditional)),cA(cv,l,c,x);if(v===2)return x;j=l.global,l.type=l.type.toUpperCase(),l.hasContent=!co.test(l.type),j&&p.active++===0&&p.event.trigger("ajaxStart");if(!l.hasContent){l.data&&(l.url+=(cq.test(l.url)?"&":"?")+l.data,delete l.data),d=l.url;if(l.cache===!1){var z=p.now(),A=l.url.replace(cs,"$1_="+z);l.url=A+(A===l.url?(cq.test(l.url)?"&":"?")+"_="+z:"")}}(l.data&&l.hasContent&&l.contentType!==!1||c.contentType)&&x.setRequestHeader("Content-Type",l.contentType),l.ifModified&&(d=d||l.url,p.lastModified[d]&&x.setRequestHeader("If-Modified-Since",p.lastModified[d]),p.etag[d]&&x.setRequestHeader("If-None-Match",p.etag[d])),x.setRequestHeader("Accept",l.dataTypes[0]&&l.accepts[l.dataTypes[0]]?l.accepts[l.dataTypes[0]]+(l.dataTypes[0]!=="*"?", "+cx+"; q=0.01":""):l.accepts["*"]);for(k in l.headers)x.setRequestHeader(k,l.headers[k]);if(!l.beforeSend||l.beforeSend.call(m,x,l)!==!1&&v!==2){w="abort";for(k in{success:1,error:1,complete:1})x[k](l[k]);g=cA(cw,l,c,x);if(!g)y(-1,"No Transport");else{x.readyState=1,j&&n.trigger("ajaxSend",[x,l]),l.async&&l.timeout>0&&(h=setTimeout(function(){x.abort("timeout")},l.timeout));try{v=1,g.send(t,y)}catch(B){if(v<2)y(-1,B);else throw B}}return x}return x.abort()},active:0,lastModified:{},etag:{}});var cE=[],cF=/\?/,cG=/(=)\?(?=&|$)|\?\?/,cH=p.now();p.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=cE.pop()||p.expando+"_"+cH++;return this[a]=!0,a}}),p.ajaxPrefilter("json jsonp",function(c,d,e){var f,g,h,i=c.data,j=c.url,k=c.jsonp!==!1,l=k&&cG.test(j),m=k&&!l&&typeof i=="string"&&!(c.contentType||"").indexOf("application/x-www-form-urlencoded")&&cG.test(i);if(c.dataTypes[0]==="jsonp"||l||m)return f=c.jsonpCallback=p.isFunction(c.jsonpCallback)?c.jsonpCallback():c.jsonpCallback,g=a[f],l?c.url=j.replace(cG,"$1"+f):m?c.data=i.replace(cG,"$1"+f):k&&(c.url+=(cF.test(j)?"&":"?")+c.jsonp+"="+f),c.converters["script json"]=function(){return h||p.error(f+" was not called"),h[0]},c.dataTypes[0]="json",a[f]=function(){h=arguments},e.always(function(){a[f]=g,c[f]&&(c.jsonpCallback=d.jsonpCallback,cE.push(f)),h&&p.isFunction(g)&&g(h[0]),h=g=b}),"script"}),p.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/javascript|ecmascript/},converters:{"text script":function(a){return p.globalEval(a),a}}}),p.ajaxPrefilter("script",function(a){a.cache===b&&(a.cache=!1),a.crossDomain&&(a.type="GET",a.global=!1)}),p.ajaxTransport("script",function(a){if(a.crossDomain){var c,d=e.head||e.getElementsByTagName("head")[0]||e.documentElement;return{send:function(f,g){c=e.createElement("script"),c.async="async",a.scriptCharset&&(c.charset=a.scriptCharset),c.src=a.url,c.onload=c.onreadystatechange=function(a,e){if(e||!c.readyState||/loaded|complete/.test(c.readyState))c.onload=c.onreadystatechange=null,d&&c.parentNode&&d.removeChild(c),c=b,e||g(200,"success")},d.insertBefore(c,d.firstChild)},abort:function(){c&&c.onload(0,1)}}}});var cI,cJ=a.ActiveXObject?function(){for(var a in cI)cI[a](0,1)}:!1,cK=0;p.ajaxSettings.xhr=a.ActiveXObject?function(){return!this.isLocal&&cL()||cM()}:cL,function(a){p.extend(p.support,{ajax:!!a,cors:!!a&&"withCredentials"in a})}(p.ajaxSettings.xhr()),p.support.ajax&&p.ajaxTransport(function(c){if(!c.crossDomain||p.support.cors){var d;return{send:function(e,f){var g,h,i=c.xhr();c.username?i.open(c.type,c.url,c.async,c.username,c.password):i.open(c.type,c.url,c.async);if(c.xhrFields)for(h in c.xhrFields)i[h]=c.xhrFields[h];c.mimeType&&i.overrideMimeType&&i.overrideMimeType(c.mimeType),!c.crossDomain&&!e["X-Requested-With"]&&(e["X-Requested-With"]="XMLHttpRequest");try{for(h in e)i.setRequestHeader(h,e[h])}catch(j){}i.send(c.hasContent&&c.data||null),d=function(a,e){var h,j,k,l,m;try{if(d&&(e||i.readyState===4)){d=b,g&&(i.onreadystatechange=p.noop,cJ&&delete cI[g]);if(e)i.readyState!==4&&i.abort();else{h=i.status,k=i.getAllResponseHeaders(),l={},m=i.responseXML,m&&m.documentElement&&(l.xml=m);try{l.text=i.responseText}catch(a){}try{j=i.statusText}catch(n){j=""}!h&&c.isLocal&&!c.crossDomain?h=l.text?200:404:h===1223&&(h=204)}}}catch(o){e||f(-1,o)}l&&f(h,j,l,k)},c.async?i.readyState===4?setTimeout(d,0):(g=++cK,cJ&&(cI||(cI={},p(a).unload(cJ)),cI[g]=d),i.onreadystatechange=d):d()},abort:function(){d&&d(0,1)}}}});var cN,cO,cP=/^(?:toggle|show|hide)$/,cQ=new RegExp("^(?:([-+])=|)("+q+")([a-z%]*)$","i"),cR=/queueHooks$/,cS=[cY],cT={"*":[function(a,b){var c,d,e,f=this.createTween(a,b),g=cQ.exec(b),h=f.cur(),i=+h||0,j=1;if(g){c=+g[2],d=g[3]||(p.cssNumber[a]?"":"px");if(d!=="px"&&i){i=p.css(f.elem,a,!0)||c||1;do e=j=j||".5",i=i/j,p.style(f.elem,a,i+d),j=f.cur()/h;while(j!==1&&j!==e)}f.unit=d,f.start=i,f.end=g[1]?i+(g[1]+1)*c:c}return f}]};p.Animation=p.extend(cW,{tweener:function(a,b){p.isFunction(a)?(b=a,a=["*"]):a=a.split(" ");var c,d=0,e=a.length;for(;d<e;d++)c=a[d],cT[c]=cT[c]||[],cT[c].unshift(b)},prefilter:function(a,b){b?cS.unshift(a):cS.push(a)}}),p.Tween=cZ,cZ.prototype={constructor:cZ,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||"swing",this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(p.cssNumber[c]?"":"px")},cur:function(){var a=cZ.propHooks[this.prop];return a&&a.get?a.get(this):cZ.propHooks._default.get(this)},run:function(a){var b,c=cZ.propHooks[this.prop];return this.options.duration?this.pos=b=p.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):this.pos=b=a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):cZ.propHooks._default.set(this),this}},cZ.prototype.init.prototype=cZ.prototype,cZ.propHooks={_default:{get:function(a){var b;return a.elem[a.prop]==null||!!a.elem.style&&a.elem.style[a.prop]!=null?(b=p.css(a.elem,a.prop,!1,""),!b||b==="auto"?0:b):a.elem[a.prop]},set:function(a){p.fx.step[a.prop]?p.fx.step[a.prop](a):a.elem.style&&(a.elem.style[p.cssProps[a.prop]]!=null||p.cssHooks[a.prop])?p.style(a.elem,a.prop,a.now+a.unit):a.elem[a.prop]=a.now}}},cZ.propHooks.scrollTop=cZ.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},p.each(["toggle","show","hide"],function(a,b){var c=p.fn[b];p.fn[b]=function(d,e,f){return d==null||typeof d=="boolean"||!a&&p.isFunction(d)&&p.isFunction(e)?c.apply(this,arguments):this.animate(c$(b,!0),d,e,f)}}),p.fn.extend({fadeTo:function(a,b,c,d){return this.filter(bZ).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=p.isEmptyObject(a),f=p.speed(b,c,d),g=function(){var b=cW(this,p.extend({},a),f);e&&b.stop(!0)};return e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,c,d){var e=function(a){var b=a.stop;delete a.stop,b(d)};return typeof a!="string"&&(d=c,c=a,a=b),c&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,c=a!=null&&a+"queueHooks",f=p.timers,g=p._data(this);if(c)g[c]&&g[c].stop&&e(g[c]);else for(c in g)g[c]&&g[c].stop&&cR.test(c)&&e(g[c]);for(c=f.length;c--;)f[c].elem===this&&(a==null||f[c].queue===a)&&(f[c].anim.stop(d),b=!1,f.splice(c,1));(b||!d)&&p.dequeue(this,a)})}}),p.each({slideDown:c$("show"),slideUp:c$("hide"),slideToggle:c$("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){p.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),p.speed=function(a,b,c){var d=a&&typeof a=="object"?p.extend({},a):{complete:c||!c&&b||p.isFunction(a)&&a,duration:a,easing:c&&b||b&&!p.isFunction(b)&&b};d.duration=p.fx.off?0:typeof d.duration=="number"?d.duration:d.duration in p.fx.speeds?p.fx.speeds[d.duration]:p.fx.speeds._default;if(d.queue==null||d.queue===!0)d.queue="fx";return d.old=d.complete,d.complete=function(){p.isFunction(d.old)&&d.old.call(this),d.queue&&p.dequeue(this,d.queue)},d},p.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2}},p.timers=[],p.fx=cZ.prototype.init,p.fx.tick=function(){var a,b=p.timers,c=0;for(;c<b.length;c++)a=b[c],!a()&&b[c]===a&&b.splice(c--,1);b.length||p.fx.stop()},p.fx.timer=function(a){a()&&p.timers.push(a)&&!cO&&(cO=setInterval(p.fx.tick,p.fx.interval))},p.fx.interval=13,p.fx.stop=function(){clearInterval(cO),cO=null},p.fx.speeds={slow:600,fast:200,_default:400},p.fx.step={},p.expr&&p.expr.filters&&(p.expr.filters.animated=function(a){return p.grep(p.timers,function(b){return a===b.elem}).length});var c_=/^(?:body|html)$/i;p.fn.offset=function(a){if(arguments.length)return a===b?this:this.each(function(b){p.offset.setOffset(this,a,b)});var c,d,e,f,g,h,i,j,k,l,m=this[0],n=m&&m.ownerDocument;if(!n)return;return(e=n.body)===m?p.offset.bodyOffset(m):(d=n.documentElement,p.contains(d,m)?(c=m.getBoundingClientRect(),f=da(n),g=d.clientTop||e.clientTop||0,h=d.clientLeft||e.clientLeft||0,i=f.pageYOffset||d.scrollTop,j=f.pageXOffset||d.scrollLeft,k=c.top+i-g,l=c.left+j-h,{top:k,left:l}):{top:0,left:0})},p.offset={bodyOffset:function(a){var b=a.offsetTop,c=a.offsetLeft;return p.support.doesNotIncludeMarginInBodyOffset&&(b+=parseFloat(p.css(a,"marginTop"))||0,c+=parseFloat(p.css(a,"marginLeft"))||0),{top:b,left:c}},setOffset:function(a,b,c){var d=p.css(a,"position");d==="static"&&(a.style.position="relative");var e=p(a),f=e.offset(),g=p.css(a,"top"),h=p.css(a,"left"),i=(d==="absolute"||d==="fixed")&&p.inArray("auto",[g,h])>-1,j={},k={},l,m;i?(k=e.position(),l=k.top,m=k.left):(l=parseFloat(g)||0,m=parseFloat(h)||0),p.isFunction(b)&&(b=b.call(a,c,f)),b.top!=null&&(j.top=b.top-f.top+l),b.left!=null&&(j.left=b.left-f.left+m),"using"in b?b.using.call(a,j):e.css(j)}},p.fn.extend({position:function(){if(!this[0])return;var a=this[0],b=this.offsetParent(),c=this.offset(),d=c_.test(b[0].nodeName)?{top:0,left:0}:b.offset();return c.top-=parseFloat(p.css(a,"marginTop"))||0,c.left-=parseFloat(p.css(a,"marginLeft"))||0,d.top+=parseFloat(p.css(b[0],"borderTopWidth"))||0,d.left+=parseFloat(p.css(b[0],"borderLeftWidth"))||0,{top:c.top-d.top,left:c.left-d.left}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||e.body;while(a&&!c_.test(a.nodeName)&&p.css(a,"position")==="static")a=a.offsetParent;return a||e.body})}}),p.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(a,c){var d=/Y/.test(c);p.fn[a]=function(e){return p.access(this,function(a,e,f){var g=da(a);if(f===b)return g?c in g?g[c]:g.document.documentElement[e]:a[e];g?g.scrollTo(d?p(g).scrollLeft():f,d?f:p(g).scrollTop()):a[e]=f},a,e,arguments.length,null)}}),p.each({Height:"height",Width:"width"},function(a,c){p.each({padding:"inner"+a,content:c,"":"outer"+a},function(d,e){p.fn[e]=function(e,f){var g=arguments.length&&(d||typeof e!="boolean"),h=d||(e===!0||f===!0?"margin":"border");return p.access(this,function(c,d,e){var f;return p.isWindow(c)?c.document.documentElement["client"+a]:c.nodeType===9?(f=c.documentElement,Math.max(c.body["scroll"+a],f["scroll"+a],c.body["offset"+a],f["offset"+a],f["client"+a])):e===b?p.css(c,d,e,h):p.style(c,d,e,h)},c,g?e:b,g,null)}})}),a.jQuery=a.$=p,typeof define=="function"&&define.amd&&define.amd.jQuery&&define("jquery",[],function(){return p})})(window);
},{}],40:[function(require,module,exports){
/*! jQuery UI - v1.8.24 - 2012-09-28
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.core.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){function c(b,c){var e=b.nodeName.toLowerCase();if("area"===e){var f=b.parentNode,g=f.name,h;return!b.href||!g||f.nodeName.toLowerCase()!=="map"?!1:(h=a("img[usemap=#"+g+"]")[0],!!h&&d(h))}return(/input|select|textarea|button|object/.test(e)?!b.disabled:"a"==e?b.href||c:c)&&d(b)}function d(b){return!a(b).parents().andSelf().filter(function(){return a.curCSS(this,"visibility")==="hidden"||a.expr.filters.hidden(this)}).length}a.ui=a.ui||{};if(a.ui.version)return;a.extend(a.ui,{version:"1.8.24",keyCode:{ALT:18,BACKSPACE:8,CAPS_LOCK:20,COMMA:188,COMMAND:91,COMMAND_LEFT:91,COMMAND_RIGHT:93,CONTROL:17,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,INSERT:45,LEFT:37,MENU:93,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SHIFT:16,SPACE:32,TAB:9,UP:38,WINDOWS:91}}),a.fn.extend({propAttr:a.fn.prop||a.fn.attr,_focus:a.fn.focus,focus:function(b,c){return typeof b=="number"?this.each(function(){var d=this;setTimeout(function(){a(d).focus(),c&&c.call(d)},b)}):this._focus.apply(this,arguments)},scrollParent:function(){var b;return a.browser.msie&&/(static|relative)/.test(this.css("position"))||/absolute/.test(this.css("position"))?b=this.parents().filter(function(){return/(relative|absolute|fixed)/.test(a.curCSS(this,"position",1))&&/(auto|scroll)/.test(a.curCSS(this,"overflow",1)+a.curCSS(this,"overflow-y",1)+a.curCSS(this,"overflow-x",1))}).eq(0):b=this.parents().filter(function(){return/(auto|scroll)/.test(a.curCSS(this,"overflow",1)+a.curCSS(this,"overflow-y",1)+a.curCSS(this,"overflow-x",1))}).eq(0),/fixed/.test(this.css("position"))||!b.length?a(document):b},zIndex:function(c){if(c!==b)return this.css("zIndex",c);if(this.length){var d=a(this[0]),e,f;while(d.length&&d[0]!==document){e=d.css("position");if(e==="absolute"||e==="relative"||e==="fixed"){f=parseInt(d.css("zIndex"),10);if(!isNaN(f)&&f!==0)return f}d=d.parent()}}return 0},disableSelection:function(){return this.bind((a.support.selectstart?"selectstart":"mousedown")+".ui-disableSelection",function(a){a.preventDefault()})},enableSelection:function(){return this.unbind(".ui-disableSelection")}}),a("<a>").outerWidth(1).jquery||a.each(["Width","Height"],function(c,d){function h(b,c,d,f){return a.each(e,function(){c-=parseFloat(a.curCSS(b,"padding"+this,!0))||0,d&&(c-=parseFloat(a.curCSS(b,"border"+this+"Width",!0))||0),f&&(c-=parseFloat(a.curCSS(b,"margin"+this,!0))||0)}),c}var e=d==="Width"?["Left","Right"]:["Top","Bottom"],f=d.toLowerCase(),g={innerWidth:a.fn.innerWidth,innerHeight:a.fn.innerHeight,outerWidth:a.fn.outerWidth,outerHeight:a.fn.outerHeight};a.fn["inner"+d]=function(c){return c===b?g["inner"+d].call(this):this.each(function(){a(this).css(f,h(this,c)+"px")})},a.fn["outer"+d]=function(b,c){return typeof b!="number"?g["outer"+d].call(this,b):this.each(function(){a(this).css(f,h(this,b,!0,c)+"px")})}}),a.extend(a.expr[":"],{data:a.expr.createPseudo?a.expr.createPseudo(function(b){return function(c){return!!a.data(c,b)}}):function(b,c,d){return!!a.data(b,d[3])},focusable:function(b){return c(b,!isNaN(a.attr(b,"tabindex")))},tabbable:function(b){var d=a.attr(b,"tabindex"),e=isNaN(d);return(e||d>=0)&&c(b,!e)}}),a(function(){var b=document.body,c=b.appendChild(c=document.createElement("div"));c.offsetHeight,a.extend(c.style,{minHeight:"100px",height:"auto",padding:0,borderWidth:0}),a.support.minHeight=c.offsetHeight===100,a.support.selectstart="onselectstart"in c,b.removeChild(c).style.display="none"}),a.curCSS||(a.curCSS=a.css),a.extend(a.ui,{plugin:{add:function(b,c,d){var e=a.ui[b].prototype;for(var f in d)e.plugins[f]=e.plugins[f]||[],e.plugins[f].push([c,d[f]])},call:function(a,b,c){var d=a.plugins[b];if(!d||!a.element[0].parentNode)return;for(var e=0;e<d.length;e++)a.options[d[e][0]]&&d[e][1].apply(a.element,c)}},contains:function(a,b){return document.compareDocumentPosition?a.compareDocumentPosition(b)&16:a!==b&&a.contains(b)},hasScroll:function(b,c){if(a(b).css("overflow")==="hidden")return!1;var d=c&&c==="left"?"scrollLeft":"scrollTop",e=!1;return b[d]>0?!0:(b[d]=1,e=b[d]>0,b[d]=0,e)},isOverAxis:function(a,b,c){return a>b&&a<b+c},isOver:function(b,c,d,e,f,g){return a.ui.isOverAxis(b,d,f)&&a.ui.isOverAxis(c,e,g)}})})(jQuery);;/*! jQuery UI - v1.8.24 - 2012-09-28
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.widget.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){if(a.cleanData){var c=a.cleanData;a.cleanData=function(b){for(var d=0,e;(e=b[d])!=null;d++)try{a(e).triggerHandler("remove")}catch(f){}c(b)}}else{var d=a.fn.remove;a.fn.remove=function(b,c){return this.each(function(){return c||(!b||a.filter(b,[this]).length)&&a("*",this).add([this]).each(function(){try{a(this).triggerHandler("remove")}catch(b){}}),d.call(a(this),b,c)})}}a.widget=function(b,c,d){var e=b.split(".")[0],f;b=b.split(".")[1],f=e+"-"+b,d||(d=c,c=a.Widget),a.expr[":"][f]=function(c){return!!a.data(c,b)},a[e]=a[e]||{},a[e][b]=function(a,b){arguments.length&&this._createWidget(a,b)};var g=new c;g.options=a.extend(!0,{},g.options),a[e][b].prototype=a.extend(!0,g,{namespace:e,widgetName:b,widgetEventPrefix:a[e][b].prototype.widgetEventPrefix||b,widgetBaseClass:f},d),a.widget.bridge(b,a[e][b])},a.widget.bridge=function(c,d){a.fn[c]=function(e){var f=typeof e=="string",g=Array.prototype.slice.call(arguments,1),h=this;return e=!f&&g.length?a.extend.apply(null,[!0,e].concat(g)):e,f&&e.charAt(0)==="_"?h:(f?this.each(function(){var d=a.data(this,c),f=d&&a.isFunction(d[e])?d[e].apply(d,g):d;if(f!==d&&f!==b)return h=f,!1}):this.each(function(){var b=a.data(this,c);b?b.option(e||{})._init():a.data(this,c,new d(e,this))}),h)}},a.Widget=function(a,b){arguments.length&&this._createWidget(a,b)},a.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",options:{disabled:!1},_createWidget:function(b,c){a.data(c,this.widgetName,this),this.element=a(c),this.options=a.extend(!0,{},this.options,this._getCreateOptions(),b);var d=this;this.element.bind("remove."+this.widgetName,function(){d.destroy()}),this._create(),this._trigger("create"),this._init()},_getCreateOptions:function(){return a.metadata&&a.metadata.get(this.element[0])[this.widgetName]},_create:function(){},_init:function(){},destroy:function(){this.element.unbind("."+this.widgetName).removeData(this.widgetName),this.widget().unbind("."+this.widgetName).removeAttr("aria-disabled").removeClass(this.widgetBaseClass+"-disabled "+"ui-state-disabled")},widget:function(){return this.element},option:function(c,d){var e=c;if(arguments.length===0)return a.extend({},this.options);if(typeof c=="string"){if(d===b)return this.options[c];e={},e[c]=d}return this._setOptions(e),this},_setOptions:function(b){var c=this;return a.each(b,function(a,b){c._setOption(a,b)}),this},_setOption:function(a,b){return this.options[a]=b,a==="disabled"&&this.widget()[b?"addClass":"removeClass"](this.widgetBaseClass+"-disabled"+" "+"ui-state-disabled").attr("aria-disabled",b),this},enable:function(){return this._setOption("disabled",!1)},disable:function(){return this._setOption("disabled",!0)},_trigger:function(b,c,d){var e,f,g=this.options[b];d=d||{},c=a.Event(c),c.type=(b===this.widgetEventPrefix?b:this.widgetEventPrefix+b).toLowerCase(),c.target=this.element[0],f=c.originalEvent;if(f)for(e in f)e in c||(c[e]=f[e]);return this.element.trigger(c,d),!(a.isFunction(g)&&g.call(this.element[0],c,d)===!1||c.isDefaultPrevented())}}})(jQuery);;/*! jQuery UI - v1.8.24 - 2012-09-28
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.mouse.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){var c=!1;a(document).mouseup(function(a){c=!1}),a.widget("ui.mouse",{options:{cancel:":input,option",distance:1,delay:0},_mouseInit:function(){var b=this;this.element.bind("mousedown."+this.widgetName,function(a){return b._mouseDown(a)}).bind("click."+this.widgetName,function(c){if(!0===a.data(c.target,b.widgetName+".preventClickEvent"))return a.removeData(c.target,b.widgetName+".preventClickEvent"),c.stopImmediatePropagation(),!1}),this.started=!1},_mouseDestroy:function(){this.element.unbind("."+this.widgetName),this._mouseMoveDelegate&&a(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate)},_mouseDown:function(b){if(c)return;this._mouseStarted&&this._mouseUp(b),this._mouseDownEvent=b;var d=this,e=b.which==1,f=typeof this.options.cancel=="string"&&b.target.nodeName?a(b.target).closest(this.options.cancel).length:!1;if(!e||f||!this._mouseCapture(b))return!0;this.mouseDelayMet=!this.options.delay,this.mouseDelayMet||(this._mouseDelayTimer=setTimeout(function(){d.mouseDelayMet=!0},this.options.delay));if(this._mouseDistanceMet(b)&&this._mouseDelayMet(b)){this._mouseStarted=this._mouseStart(b)!==!1;if(!this._mouseStarted)return b.preventDefault(),!0}return!0===a.data(b.target,this.widgetName+".preventClickEvent")&&a.removeData(b.target,this.widgetName+".preventClickEvent"),this._mouseMoveDelegate=function(a){return d._mouseMove(a)},this._mouseUpDelegate=function(a){return d._mouseUp(a)},a(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate),b.preventDefault(),c=!0,!0},_mouseMove:function(b){return!a.browser.msie||document.documentMode>=9||!!b.button?this._mouseStarted?(this._mouseDrag(b),b.preventDefault()):(this._mouseDistanceMet(b)&&this._mouseDelayMet(b)&&(this._mouseStarted=this._mouseStart(this._mouseDownEvent,b)!==!1,this._mouseStarted?this._mouseDrag(b):this._mouseUp(b)),!this._mouseStarted):this._mouseUp(b)},_mouseUp:function(b){return a(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate),this._mouseStarted&&(this._mouseStarted=!1,b.target==this._mouseDownEvent.target&&a.data(b.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(b)),!1},_mouseDistanceMet:function(a){return Math.max(Math.abs(this._mouseDownEvent.pageX-a.pageX),Math.abs(this._mouseDownEvent.pageY-a.pageY))>=this.options.distance},_mouseDelayMet:function(a){return this.mouseDelayMet},_mouseStart:function(a){},_mouseDrag:function(a){},_mouseStop:function(a){},_mouseCapture:function(a){return!0}})})(jQuery);;/*! jQuery UI - v1.8.24 - 2012-09-28
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.position.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){a.ui=a.ui||{};var c=/left|center|right/,d=/top|center|bottom/,e="center",f={},g=a.fn.position,h=a.fn.offset;a.fn.position=function(b){if(!b||!b.of)return g.apply(this,arguments);b=a.extend({},b);var h=a(b.of),i=h[0],j=(b.collision||"flip").split(" "),k=b.offset?b.offset.split(" "):[0,0],l,m,n;return i.nodeType===9?(l=h.width(),m=h.height(),n={top:0,left:0}):i.setTimeout?(l=h.width(),m=h.height(),n={top:h.scrollTop(),left:h.scrollLeft()}):i.preventDefault?(b.at="left top",l=m=0,n={top:b.of.pageY,left:b.of.pageX}):(l=h.outerWidth(),m=h.outerHeight(),n=h.offset()),a.each(["my","at"],function(){var a=(b[this]||"").split(" ");a.length===1&&(a=c.test(a[0])?a.concat([e]):d.test(a[0])?[e].concat(a):[e,e]),a[0]=c.test(a[0])?a[0]:e,a[1]=d.test(a[1])?a[1]:e,b[this]=a}),j.length===1&&(j[1]=j[0]),k[0]=parseInt(k[0],10)||0,k.length===1&&(k[1]=k[0]),k[1]=parseInt(k[1],10)||0,b.at[0]==="right"?n.left+=l:b.at[0]===e&&(n.left+=l/2),b.at[1]==="bottom"?n.top+=m:b.at[1]===e&&(n.top+=m/2),n.left+=k[0],n.top+=k[1],this.each(function(){var c=a(this),d=c.outerWidth(),g=c.outerHeight(),h=parseInt(a.curCSS(this,"marginLeft",!0))||0,i=parseInt(a.curCSS(this,"marginTop",!0))||0,o=d+h+(parseInt(a.curCSS(this,"marginRight",!0))||0),p=g+i+(parseInt(a.curCSS(this,"marginBottom",!0))||0),q=a.extend({},n),r;b.my[0]==="right"?q.left-=d:b.my[0]===e&&(q.left-=d/2),b.my[1]==="bottom"?q.top-=g:b.my[1]===e&&(q.top-=g/2),f.fractions||(q.left=Math.round(q.left),q.top=Math.round(q.top)),r={left:q.left-h,top:q.top-i},a.each(["left","top"],function(c,e){a.ui.position[j[c]]&&a.ui.position[j[c]][e](q,{targetWidth:l,targetHeight:m,elemWidth:d,elemHeight:g,collisionPosition:r,collisionWidth:o,collisionHeight:p,offset:k,my:b.my,at:b.at})}),a.fn.bgiframe&&c.bgiframe(),c.offset(a.extend(q,{using:b.using}))})},a.ui.position={fit:{left:function(b,c){var d=a(window),e=c.collisionPosition.left+c.collisionWidth-d.width()-d.scrollLeft();b.left=e>0?b.left-e:Math.max(b.left-c.collisionPosition.left,b.left)},top:function(b,c){var d=a(window),e=c.collisionPosition.top+c.collisionHeight-d.height()-d.scrollTop();b.top=e>0?b.top-e:Math.max(b.top-c.collisionPosition.top,b.top)}},flip:{left:function(b,c){if(c.at[0]===e)return;var d=a(window),f=c.collisionPosition.left+c.collisionWidth-d.width()-d.scrollLeft(),g=c.my[0]==="left"?-c.elemWidth:c.my[0]==="right"?c.elemWidth:0,h=c.at[0]==="left"?c.targetWidth:-c.targetWidth,i=-2*c.offset[0];b.left+=c.collisionPosition.left<0?g+h+i:f>0?g+h+i:0},top:function(b,c){if(c.at[1]===e)return;var d=a(window),f=c.collisionPosition.top+c.collisionHeight-d.height()-d.scrollTop(),g=c.my[1]==="top"?-c.elemHeight:c.my[1]==="bottom"?c.elemHeight:0,h=c.at[1]==="top"?c.targetHeight:-c.targetHeight,i=-2*c.offset[1];b.top+=c.collisionPosition.top<0?g+h+i:f>0?g+h+i:0}}},a.offset.setOffset||(a.offset.setOffset=function(b,c){/static/.test(a.curCSS(b,"position"))&&(b.style.position="relative");var d=a(b),e=d.offset(),f=parseInt(a.curCSS(b,"top",!0),10)||0,g=parseInt(a.curCSS(b,"left",!0),10)||0,h={top:c.top-e.top+f,left:c.left-e.left+g};"using"in c?c.using.call(b,h):d.css(h)},a.fn.offset=function(b){var c=this[0];return!c||!c.ownerDocument?null:b?a.isFunction(b)?this.each(function(c){a(this).offset(b.call(this,c,a(this).offset()))}):this.each(function(){a.offset.setOffset(this,b)}):h.call(this)}),a.curCSS||(a.curCSS=a.css),function(){var b=document.getElementsByTagName("body")[0],c=document.createElement("div"),d,e,g,h,i;d=document.createElement(b?"div":"body"),g={visibility:"hidden",width:0,height:0,border:0,margin:0,background:"none"},b&&a.extend(g,{position:"absolute",left:"-1000px",top:"-1000px"});for(var j in g)d.style[j]=g[j];d.appendChild(c),e=b||document.documentElement,e.insertBefore(d,e.firstChild),c.style.cssText="position: absolute; left: 10.7432222px; top: 10.432325px; height: 30px; width: 201px;",h=a(c).offset(function(a,b){return b}).offset(),d.innerHTML="",e.removeChild(d),i=h.top+h.left+(b?2e3:0),f.fractions=i>21&&i<22}()})(jQuery);;/*! jQuery UI - v1.8.24 - 2012-09-28
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.draggable.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){a.widget("ui.draggable",a.ui.mouse,{widgetEventPrefix:"drag",options:{addClasses:!0,appendTo:"parent",axis:!1,connectToSortable:!1,containment:!1,cursor:"auto",cursorAt:!1,grid:!1,handle:!1,helper:"original",iframeFix:!1,opacity:!1,refreshPositions:!1,revert:!1,revertDuration:500,scope:"default",scroll:!0,scrollSensitivity:20,scrollSpeed:20,snap:!1,snapMode:"both",snapTolerance:20,stack:!1,zIndex:!1},_create:function(){this.options.helper=="original"&&!/^(?:r|a|f)/.test(this.element.css("position"))&&(this.element[0].style.position="relative"),this.options.addClasses&&this.element.addClass("ui-draggable"),this.options.disabled&&this.element.addClass("ui-draggable-disabled"),this._mouseInit()},destroy:function(){if(!this.element.data("draggable"))return;return this.element.removeData("draggable").unbind(".draggable").removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled"),this._mouseDestroy(),this},_mouseCapture:function(b){var c=this.options;return this.helper||c.disabled||a(b.target).is(".ui-resizable-handle")?!1:(this.handle=this._getHandle(b),this.handle?(c.iframeFix&&a(c.iframeFix===!0?"iframe":c.iframeFix).each(function(){a('<div class="ui-draggable-iframeFix" style="background: #fff;"></div>').css({width:this.offsetWidth+"px",height:this.offsetHeight+"px",position:"absolute",opacity:"0.001",zIndex:1e3}).css(a(this).offset()).appendTo("body")}),!0):!1)},_mouseStart:function(b){var c=this.options;return this.helper=this._createHelper(b),this.helper.addClass("ui-draggable-dragging"),this._cacheHelperProportions(),a.ui.ddmanager&&(a.ui.ddmanager.current=this),this._cacheMargins(),this.cssPosition=this.helper.css("position"),this.scrollParent=this.helper.scrollParent(),this.offset=this.positionAbs=this.element.offset(),this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left},a.extend(this.offset,{click:{left:b.pageX-this.offset.left,top:b.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()}),this.originalPosition=this.position=this._generatePosition(b),this.originalPageX=b.pageX,this.originalPageY=b.pageY,c.cursorAt&&this._adjustOffsetFromHelper(c.cursorAt),c.containment&&this._setContainment(),this._trigger("start",b)===!1?(this._clear(),!1):(this._cacheHelperProportions(),a.ui.ddmanager&&!c.dropBehaviour&&a.ui.ddmanager.prepareOffsets(this,b),this._mouseDrag(b,!0),a.ui.ddmanager&&a.ui.ddmanager.dragStart(this,b),!0)},_mouseDrag:function(b,c){this.position=this._generatePosition(b),this.positionAbs=this._convertPositionTo("absolute");if(!c){var d=this._uiHash();if(this._trigger("drag",b,d)===!1)return this._mouseUp({}),!1;this.position=d.position}if(!this.options.axis||this.options.axis!="y")this.helper[0].style.left=this.position.left+"px";if(!this.options.axis||this.options.axis!="x")this.helper[0].style.top=this.position.top+"px";return a.ui.ddmanager&&a.ui.ddmanager.drag(this,b),!1},_mouseStop:function(b){var c=!1;a.ui.ddmanager&&!this.options.dropBehaviour&&(c=a.ui.ddmanager.drop(this,b)),this.dropped&&(c=this.dropped,this.dropped=!1);var d=this.element[0],e=!1;while(d&&(d=d.parentNode))d==document&&(e=!0);if(!e&&this.options.helper==="original")return!1;if(this.options.revert=="invalid"&&!c||this.options.revert=="valid"&&c||this.options.revert===!0||a.isFunction(this.options.revert)&&this.options.revert.call(this.element,c)){var f=this;a(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,10),function(){f._trigger("stop",b)!==!1&&f._clear()})}else this._trigger("stop",b)!==!1&&this._clear();return!1},_mouseUp:function(b){return a("div.ui-draggable-iframeFix").each(function(){this.parentNode.removeChild(this)}),a.ui.ddmanager&&a.ui.ddmanager.dragStop(this,b),a.ui.mouse.prototype._mouseUp.call(this,b)},cancel:function(){return this.helper.is(".ui-draggable-dragging")?this._mouseUp({}):this._clear(),this},_getHandle:function(b){var c=!this.options.handle||!a(this.options.handle,this.element).length?!0:!1;return a(this.options.handle,this.element).find("*").andSelf().each(function(){this==b.target&&(c=!0)}),c},_createHelper:function(b){var c=this.options,d=a.isFunction(c.helper)?a(c.helper.apply(this.element[0],[b])):c.helper=="clone"?this.element.clone().removeAttr("id"):this.element;return d.parents("body").length||d.appendTo(c.appendTo=="parent"?this.element[0].parentNode:c.appendTo),d[0]!=this.element[0]&&!/(fixed|absolute)/.test(d.css("position"))&&d.css("position","absolute"),d},_adjustOffsetFromHelper:function(b){typeof b=="string"&&(b=b.split(" ")),a.isArray(b)&&(b={left:+b[0],top:+b[1]||0}),"left"in b&&(this.offset.click.left=b.left+this.margins.left),"right"in b&&(this.offset.click.left=this.helperProportions.width-b.right+this.margins.left),"top"in b&&(this.offset.click.top=b.top+this.margins.top),"bottom"in b&&(this.offset.click.top=this.helperProportions.height-b.bottom+this.margins.top)},_getParentOffset:function(){this.offsetParent=this.helper.offsetParent();var b=this.offsetParent.offset();this.cssPosition=="absolute"&&this.scrollParent[0]!=document&&a.ui.contains(this.scrollParent[0],this.offsetParent[0])&&(b.left+=this.scrollParent.scrollLeft(),b.top+=this.scrollParent.scrollTop());if(this.offsetParent[0]==document.body||this.offsetParent[0].tagName&&this.offsetParent[0].tagName.toLowerCase()=="html"&&a.browser.msie)b={top:0,left:0};return{top:b.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:b.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if(this.cssPosition=="relative"){var a=this.element.position();return{top:a.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:a.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.element.css("marginLeft"),10)||0,top:parseInt(this.element.css("marginTop"),10)||0,right:parseInt(this.element.css("marginRight"),10)||0,bottom:parseInt(this.element.css("marginBottom"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var b=this.options;b.containment=="parent"&&(b.containment=this.helper[0].parentNode);if(b.containment=="document"||b.containment=="window")this.containment=[b.containment=="document"?0:a(window).scrollLeft()-this.offset.relative.left-this.offset.parent.left,b.containment=="document"?0:a(window).scrollTop()-this.offset.relative.top-this.offset.parent.top,(b.containment=="document"?0:a(window).scrollLeft())+a(b.containment=="document"?document:window).width()-this.helperProportions.width-this.margins.left,(b.containment=="document"?0:a(window).scrollTop())+(a(b.containment=="document"?document:window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top];if(!/^(document|window|parent)$/.test(b.containment)&&b.containment.constructor!=Array){var c=a(b.containment),d=c[0];if(!d)return;var e=c.offset(),f=a(d).css("overflow")!="hidden";this.containment=[(parseInt(a(d).css("borderLeftWidth"),10)||0)+(parseInt(a(d).css("paddingLeft"),10)||0),(parseInt(a(d).css("borderTopWidth"),10)||0)+(parseInt(a(d).css("paddingTop"),10)||0),(f?Math.max(d.scrollWidth,d.offsetWidth):d.offsetWidth)-(parseInt(a(d).css("borderLeftWidth"),10)||0)-(parseInt(a(d).css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left-this.margins.right,(f?Math.max(d.scrollHeight,d.offsetHeight):d.offsetHeight)-(parseInt(a(d).css("borderTopWidth"),10)||0)-(parseInt(a(d).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top-this.margins.bottom],this.relative_container=c}else b.containment.constructor==Array&&(this.containment=b.containment)},_convertPositionTo:function(b,c){c||(c=this.position);var d=b=="absolute"?1:-1,e=this.options,f=this.cssPosition=="absolute"&&(this.scrollParent[0]==document||!a.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,g=/(html|body)/i.test(f[0].tagName);return{top:c.top+this.offset.relative.top*d+this.offset.parent.top*d-(a.browser.safari&&a.browser.version<526&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():g?0:f.scrollTop())*d),left:c.left+this.offset.relative.left*d+this.offset.parent.left*d-(a.browser.safari&&a.browser.version<526&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():g?0:f.scrollLeft())*d)}},_generatePosition:function(b){var c=this.options,d=this.cssPosition=="absolute"&&(this.scrollParent[0]==document||!a.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,e=/(html|body)/i.test(d[0].tagName),f=b.pageX,g=b.pageY;if(this.originalPosition){var h;if(this.containment){if(this.relative_container){var i=this.relative_container.offset();h=[this.containment[0]+i.left,this.containment[1]+i.top,this.containment[2]+i.left,this.containment[3]+i.top]}else h=this.containment;b.pageX-this.offset.click.left<h[0]&&(f=h[0]+this.offset.click.left),b.pageY-this.offset.click.top<h[1]&&(g=h[1]+this.offset.click.top),b.pageX-this.offset.click.left>h[2]&&(f=h[2]+this.offset.click.left),b.pageY-this.offset.click.top>h[3]&&(g=h[3]+this.offset.click.top)}if(c.grid){var j=c.grid[1]?this.originalPageY+Math.round((g-this.originalPageY)/c.grid[1])*c.grid[1]:this.originalPageY;g=h?j-this.offset.click.top<h[1]||j-this.offset.click.top>h[3]?j-this.offset.click.top<h[1]?j+c.grid[1]:j-c.grid[1]:j:j;var k=c.grid[0]?this.originalPageX+Math.round((f-this.originalPageX)/c.grid[0])*c.grid[0]:this.originalPageX;f=h?k-this.offset.click.left<h[0]||k-this.offset.click.left>h[2]?k-this.offset.click.left<h[0]?k+c.grid[0]:k-c.grid[0]:k:k}}return{top:g-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+(a.browser.safari&&a.browser.version<526&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollTop():e?0:d.scrollTop()),left:f-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+(a.browser.safari&&a.browser.version<526&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():e?0:d.scrollLeft())}},_clear:function(){this.helper.removeClass("ui-draggable-dragging"),this.helper[0]!=this.element[0]&&!this.cancelHelperRemoval&&this.helper.remove(),this.helper=null,this.cancelHelperRemoval=!1},_trigger:function(b,c,d){return d=d||this._uiHash(),a.ui.plugin.call(this,b,[c,d]),b=="drag"&&(this.positionAbs=this._convertPositionTo("absolute")),a.Widget.prototype._trigger.call(this,b,c,d)},plugins:{},_uiHash:function(a){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,offset:this.positionAbs}}}),a.extend(a.ui.draggable,{version:"1.8.24"}),a.ui.plugin.add("draggable","connectToSortable",{start:function(b,c){var d=a(this).data("draggable"),e=d.options,f=a.extend({},c,{item:d.element});d.sortables=[],a(e.connectToSortable).each(function(){var c=a.data(this,"sortable");c&&!c.options.disabled&&(d.sortables.push({instance:c,shouldRevert:c.options.revert}),c.refreshPositions(),c._trigger("activate",b,f))})},stop:function(b,c){var d=a(this).data("draggable"),e=a.extend({},c,{item:d.element});a.each(d.sortables,function(){this.instance.isOver?(this.instance.isOver=0,d.cancelHelperRemoval=!0,this.instance.cancelHelperRemoval=!1,this.shouldRevert&&(this.instance.options.revert=!0),this.instance._mouseStop(b),this.instance.options.helper=this.instance.options._helper,d.options.helper=="original"&&this.instance.currentItem.css({top:"auto",left:"auto"})):(this.instance.cancelHelperRemoval=!1,this.instance._trigger("deactivate",b,e))})},drag:function(b,c){var d=a(this).data("draggable"),e=this,f=function(b){var c=this.offset.click.top,d=this.offset.click.left,e=this.positionAbs.top,f=this.positionAbs.left,g=b.height,h=b.width,i=b.top,j=b.left;return a.ui.isOver(e+c,f+d,i,j,g,h)};a.each(d.sortables,function(f){this.instance.positionAbs=d.positionAbs,this.instance.helperProportions=d.helperProportions,this.instance.offset.click=d.offset.click,this.instance._intersectsWith(this.instance.containerCache)?(this.instance.isOver||(this.instance.isOver=1,this.instance.currentItem=a(e).clone().removeAttr("id").appendTo(this.instance.element).data("sortable-item",!0),this.instance.options._helper=this.instance.options.helper,this.instance.options.helper=function(){return c.helper[0]},b.target=this.instance.currentItem[0],this.instance._mouseCapture(b,!0),this.instance._mouseStart(b,!0,!0),this.instance.offset.click.top=d.offset.click.top,this.instance.offset.click.left=d.offset.click.left,this.instance.offset.parent.left-=d.offset.parent.left-this.instance.offset.parent.left,this.instance.offset.parent.top-=d.offset.parent.top-this.instance.offset.parent.top,d._trigger("toSortable",b),d.dropped=this.instance.element,d.currentItem=d.element,this.instance.fromOutside=d),this.instance.currentItem&&this.instance._mouseDrag(b)):this.instance.isOver&&(this.instance.isOver=0,this.instance.cancelHelperRemoval=!0,this.instance.options.revert=!1,this.instance._trigger("out",b,this.instance._uiHash(this.instance)),this.instance._mouseStop(b,!0),this.instance.options.helper=this.instance.options._helper,this.instance.currentItem.remove(),this.instance.placeholder&&this.instance.placeholder.remove(),d._trigger("fromSortable",b),d.dropped=!1)})}}),a.ui.plugin.add("draggable","cursor",{start:function(b,c){var d=a("body"),e=a(this).data("draggable").options;d.css("cursor")&&(e._cursor=d.css("cursor")),d.css("cursor",e.cursor)},stop:function(b,c){var d=a(this).data("draggable").options;d._cursor&&a("body").css("cursor",d._cursor)}}),a.ui.plugin.add("draggable","opacity",{start:function(b,c){var d=a(c.helper),e=a(this).data("draggable").options;d.css("opacity")&&(e._opacity=d.css("opacity")),d.css("opacity",e.opacity)},stop:function(b,c){var d=a(this).data("draggable").options;d._opacity&&a(c.helper).css("opacity",d._opacity)}}),a.ui.plugin.add("draggable","scroll",{start:function(b,c){var d=a(this).data("draggable");d.scrollParent[0]!=document&&d.scrollParent[0].tagName!="HTML"&&(d.overflowOffset=d.scrollParent.offset())},drag:function(b,c){var d=a(this).data("draggable"),e=d.options,f=!1;if(d.scrollParent[0]!=document&&d.scrollParent[0].tagName!="HTML"){if(!e.axis||e.axis!="x")d.overflowOffset.top+d.scrollParent[0].offsetHeight-b.pageY<e.scrollSensitivity?d.scrollParent[0].scrollTop=f=d.scrollParent[0].scrollTop+e.scrollSpeed:b.pageY-d.overflowOffset.top<e.scrollSensitivity&&(d.scrollParent[0].scrollTop=f=d.scrollParent[0].scrollTop-e.scrollSpeed);if(!e.axis||e.axis!="y")d.overflowOffset.left+d.scrollParent[0].offsetWidth-b.pageX<e.scrollSensitivity?d.scrollParent[0].scrollLeft=f=d.scrollParent[0].scrollLeft+e.scrollSpeed:b.pageX-d.overflowOffset.left<e.scrollSensitivity&&(d.scrollParent[0].scrollLeft=f=d.scrollParent[0].scrollLeft-e.scrollSpeed)}else{if(!e.axis||e.axis!="x")b.pageY-a(document).scrollTop()<e.scrollSensitivity?f=a(document).scrollTop(a(document).scrollTop()-e.scrollSpeed):a(window).height()-(b.pageY-a(document).scrollTop())<e.scrollSensitivity&&(f=a(document).scrollTop(a(document).scrollTop()+e.scrollSpeed));if(!e.axis||e.axis!="y")b.pageX-a(document).scrollLeft()<e.scrollSensitivity?f=a(document).scrollLeft(a(document).scrollLeft()-e.scrollSpeed):a(window).width()-(b.pageX-a(document).scrollLeft())<e.scrollSensitivity&&(f=a(document).scrollLeft(a(document).scrollLeft()+e.scrollSpeed))}f!==!1&&a.ui.ddmanager&&!e.dropBehaviour&&a.ui.ddmanager.prepareOffsets(d,b)}}),a.ui.plugin.add("draggable","snap",{start:function(b,c){var d=a(this).data("draggable"),e=d.options;d.snapElements=[],a(e.snap.constructor!=String?e.snap.items||":data(draggable)":e.snap).each(function(){var b=a(this),c=b.offset();this!=d.element[0]&&d.snapElements.push({item:this,width:b.outerWidth(),height:b.outerHeight(),top:c.top,left:c.left})})},drag:function(b,c){var d=a(this).data("draggable"),e=d.options,f=e.snapTolerance,g=c.offset.left,h=g+d.helperProportions.width,i=c.offset.top,j=i+d.helperProportions.height;for(var k=d.snapElements.length-1;k>=0;k--){var l=d.snapElements[k].left,m=l+d.snapElements[k].width,n=d.snapElements[k].top,o=n+d.snapElements[k].height;if(!(l-f<g&&g<m+f&&n-f<i&&i<o+f||l-f<g&&g<m+f&&n-f<j&&j<o+f||l-f<h&&h<m+f&&n-f<i&&i<o+f||l-f<h&&h<m+f&&n-f<j&&j<o+f)){d.snapElements[k].snapping&&d.options.snap.release&&d.options.snap.release.call(d.element,b,a.extend(d._uiHash(),{snapItem:d.snapElements[k].item})),d.snapElements[k].snapping=!1;continue}if(e.snapMode!="inner"){var p=Math.abs(n-j)<=f,q=Math.abs(o-i)<=f,r=Math.abs(l-h)<=f,s=Math.abs(m-g)<=f;p&&(c.position.top=d._convertPositionTo("relative",{top:n-d.helperProportions.height,left:0}).top-d.margins.top),q&&(c.position.top=d._convertPositionTo("relative",{top:o,left:0}).top-d.margins.top),r&&(c.position.left=d._convertPositionTo("relative",{top:0,left:l-d.helperProportions.width}).left-d.margins.left),s&&(c.position.left=d._convertPositionTo("relative",{top:0,left:m}).left-d.margins.left)}var t=p||q||r||s;if(e.snapMode!="outer"){var p=Math.abs(n-i)<=f,q=Math.abs(o-j)<=f,r=Math.abs(l-g)<=f,s=Math.abs(m-h)<=f;p&&(c.position.top=d._convertPositionTo("relative",{top:n,left:0}).top-d.margins.top),q&&(c.position.top=d._convertPositionTo("relative",{top:o-d.helperProportions.height,left:0}).top-d.margins.top),r&&(c.position.left=d._convertPositionTo("relative",{top:0,left:l}).left-d.margins.left),s&&(c.position.left=d._convertPositionTo("relative",{top:0,left:m-d.helperProportions.width}).left-d.margins.left)}!d.snapElements[k].snapping&&(p||q||r||s||t)&&d.options.snap.snap&&d.options.snap.snap.call(d.element,b,a.extend(d._uiHash(),{snapItem:d.snapElements[k].item})),d.snapElements[k].snapping=p||q||r||s||t}}}),a.ui.plugin.add("draggable","stack",{start:function(b,c){var d=a(this).data("draggable").options,e=a.makeArray(a(d.stack)).sort(function(b,c){return(parseInt(a(b).css("zIndex"),10)||0)-(parseInt(a(c).css("zIndex"),10)||0)});if(!e.length)return;var f=parseInt(e[0].style.zIndex)||0;a(e).each(function(a){this.style.zIndex=f+a}),this[0].style.zIndex=f+e.length}}),a.ui.plugin.add("draggable","zIndex",{start:function(b,c){var d=a(c.helper),e=a(this).data("draggable").options;d.css("zIndex")&&(e._zIndex=d.css("zIndex")),d.css("zIndex",e.zIndex)},stop:function(b,c){var d=a(this).data("draggable").options;d._zIndex&&a(c.helper).css("zIndex",d._zIndex)}})})(jQuery);;/*! jQuery UI - v1.8.24 - 2012-09-28
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.droppable.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){a.widget("ui.droppable",{widgetEventPrefix:"drop",options:{accept:"*",activeClass:!1,addClasses:!0,greedy:!1,hoverClass:!1,scope:"default",tolerance:"intersect"},_create:function(){var b=this.options,c=b.accept;this.isover=0,this.isout=1,this.accept=a.isFunction(c)?c:function(a){return a.is(c)},this.proportions={width:this.element[0].offsetWidth,height:this.element[0].offsetHeight},a.ui.ddmanager.droppables[b.scope]=a.ui.ddmanager.droppables[b.scope]||[],a.ui.ddmanager.droppables[b.scope].push(this),b.addClasses&&this.element.addClass("ui-droppable")},destroy:function(){var b=a.ui.ddmanager.droppables[this.options.scope];for(var c=0;c<b.length;c++)b[c]==this&&b.splice(c,1);return this.element.removeClass("ui-droppable ui-droppable-disabled").removeData("droppable").unbind(".droppable"),this},_setOption:function(b,c){b=="accept"&&(this.accept=a.isFunction(c)?c:function(a){return a.is(c)}),a.Widget.prototype._setOption.apply(this,arguments)},_activate:function(b){var c=a.ui.ddmanager.current;this.options.activeClass&&this.element.addClass(this.options.activeClass),c&&this._trigger("activate",b,this.ui(c))},_deactivate:function(b){var c=a.ui.ddmanager.current;this.options.activeClass&&this.element.removeClass(this.options.activeClass),c&&this._trigger("deactivate",b,this.ui(c))},_over:function(b){var c=a.ui.ddmanager.current;if(!c||(c.currentItem||c.element)[0]==this.element[0])return;this.accept.call(this.element[0],c.currentItem||c.element)&&(this.options.hoverClass&&this.element.addClass(this.options.hoverClass),this._trigger("over",b,this.ui(c)))},_out:function(b){var c=a.ui.ddmanager.current;if(!c||(c.currentItem||c.element)[0]==this.element[0])return;this.accept.call(this.element[0],c.currentItem||c.element)&&(this.options.hoverClass&&this.element.removeClass(this.options.hoverClass),this._trigger("out",b,this.ui(c)))},_drop:function(b,c){var d=c||a.ui.ddmanager.current;if(!d||(d.currentItem||d.element)[0]==this.element[0])return!1;var e=!1;return this.element.find(":data(droppable)").not(".ui-draggable-dragging").each(function(){var b=a.data(this,"droppable");if(b.options.greedy&&!b.options.disabled&&b.options.scope==d.options.scope&&b.accept.call(b.element[0],d.currentItem||d.element)&&a.ui.intersect(d,a.extend(b,{offset:b.element.offset()}),b.options.tolerance))return e=!0,!1}),e?!1:this.accept.call(this.element[0],d.currentItem||d.element)?(this.options.activeClass&&this.element.removeClass(this.options.activeClass),this.options.hoverClass&&this.element.removeClass(this.options.hoverClass),this._trigger("drop",b,this.ui(d)),this.element):!1},ui:function(a){return{draggable:a.currentItem||a.element,helper:a.helper,position:a.position,offset:a.positionAbs}}}),a.extend(a.ui.droppable,{version:"1.8.24"}),a.ui.intersect=function(b,c,d){if(!c.offset)return!1;var e=(b.positionAbs||b.position.absolute).left,f=e+b.helperProportions.width,g=(b.positionAbs||b.position.absolute).top,h=g+b.helperProportions.height,i=c.offset.left,j=i+c.proportions.width,k=c.offset.top,l=k+c.proportions.height;switch(d){case"fit":return i<=e&&f<=j&&k<=g&&h<=l;case"intersect":return i<e+b.helperProportions.width/2&&f-b.helperProportions.width/2<j&&k<g+b.helperProportions.height/2&&h-b.helperProportions.height/2<l;case"pointer":var m=(b.positionAbs||b.position.absolute).left+(b.clickOffset||b.offset.click).left,n=(b.positionAbs||b.position.absolute).top+(b.clickOffset||b.offset.click).top,o=a.ui.isOver(n,m,k,i,c.proportions.height,c.proportions.width);return o;case"touch":return(g>=k&&g<=l||h>=k&&h<=l||g<k&&h>l)&&(e>=i&&e<=j||f>=i&&f<=j||e<i&&f>j);default:return!1}},a.ui.ddmanager={current:null,droppables:{"default":[]},prepareOffsets:function(b,c){var d=a.ui.ddmanager.droppables[b.options.scope]||[],e=c?c.type:null,f=(b.currentItem||b.element).find(":data(droppable)").andSelf();g:for(var h=0;h<d.length;h++){if(d[h].options.disabled||b&&!d[h].accept.call(d[h].element[0],b.currentItem||b.element))continue;for(var i=0;i<f.length;i++)if(f[i]==d[h].element[0]){d[h].proportions.height=0;continue g}d[h].visible=d[h].element.css("display")!="none";if(!d[h].visible)continue;e=="mousedown"&&d[h]._activate.call(d[h],c),d[h].offset=d[h].element.offset(),d[h].proportions={width:d[h].element[0].offsetWidth,height:d[h].element[0].offsetHeight}}},drop:function(b,c){var d=!1;return a.each(a.ui.ddmanager.droppables[b.options.scope]||[],function(){if(!this.options)return;!this.options.disabled&&this.visible&&a.ui.intersect(b,this,this.options.tolerance)&&(d=this._drop.call(this,c)||d),!this.options.disabled&&this.visible&&this.accept.call(this.element[0],b.currentItem||b.element)&&(this.isout=1,this.isover=0,this._deactivate.call(this,c))}),d},dragStart:function(b,c){b.element.parents(":not(body,html)").bind("scroll.droppable",function(){b.options.refreshPositions||a.ui.ddmanager.prepareOffsets(b,c)})},drag:function(b,c){b.options.refreshPositions&&a.ui.ddmanager.prepareOffsets(b,c),a.each(a.ui.ddmanager.droppables[b.options.scope]||[],function(){if(this.options.disabled||this.greedyChild||!this.visible)return;var d=a.ui.intersect(b,this,this.options.tolerance),e=!d&&this.isover==1?"isout":d&&this.isover==0?"isover":null;if(!e)return;var f;if(this.options.greedy){var g=this.options.scope,h=this.element.parents(":data(droppable)").filter(function(){return a.data(this,"droppable").options.scope===g});h.length&&(f=a.data(h[0],"droppable"),f.greedyChild=e=="isover"?1:0)}f&&e=="isover"&&(f.isover=0,f.isout=1,f._out.call(f,c)),this[e]=1,this[e=="isout"?"isover":"isout"]=0,this[e=="isover"?"_over":"_out"].call(this,c),f&&e=="isout"&&(f.isout=0,f.isover=1,f._over.call(f,c))})},dragStop:function(b,c){b.element.parents(":not(body,html)").unbind("scroll.droppable"),b.options.refreshPositions||a.ui.ddmanager.prepareOffsets(b,c)}}})(jQuery);;/*! jQuery UI - v1.8.24 - 2012-09-28
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.resizable.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){a.widget("ui.resizable",a.ui.mouse,{widgetEventPrefix:"resize",options:{alsoResize:!1,animate:!1,animateDuration:"slow",animateEasing:"swing",aspectRatio:!1,autoHide:!1,containment:!1,ghost:!1,grid:!1,handles:"e,s,se",helper:!1,maxHeight:null,maxWidth:null,minHeight:10,minWidth:10,zIndex:1e3},_create:function(){var b=this,c=this.options;this.element.addClass("ui-resizable"),a.extend(this,{_aspectRatio:!!c.aspectRatio,aspectRatio:c.aspectRatio,originalElement:this.element,_proportionallyResizeElements:[],_helper:c.helper||c.ghost||c.animate?c.helper||"ui-resizable-helper":null}),this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i)&&(this.element.wrap(a('<div class="ui-wrapper" style="overflow: hidden;"></div>').css({position:this.element.css("position"),width:this.element.outerWidth(),height:this.element.outerHeight(),top:this.element.css("top"),left:this.element.css("left")})),this.element=this.element.parent().data("resizable",this.element.data("resizable")),this.elementIsWrapper=!0,this.element.css({marginLeft:this.originalElement.css("marginLeft"),marginTop:this.originalElement.css("marginTop"),marginRight:this.originalElement.css("marginRight"),marginBottom:this.originalElement.css("marginBottom")}),this.originalElement.css({marginLeft:0,marginTop:0,marginRight:0,marginBottom:0}),this.originalResizeStyle=this.originalElement.css("resize"),this.originalElement.css("resize","none"),this._proportionallyResizeElements.push(this.originalElement.css({position:"static",zoom:1,display:"block"})),this.originalElement.css({margin:this.originalElement.css("margin")}),this._proportionallyResize()),this.handles=c.handles||(a(".ui-resizable-handle",this.element).length?{n:".ui-resizable-n",e:".ui-resizable-e",s:".ui-resizable-s",w:".ui-resizable-w",se:".ui-resizable-se",sw:".ui-resizable-sw",ne:".ui-resizable-ne",nw:".ui-resizable-nw"}:"e,s,se");if(this.handles.constructor==String){this.handles=="all"&&(this.handles="n,e,s,w,se,sw,ne,nw");var d=this.handles.split(",");this.handles={};for(var e=0;e<d.length;e++){var f=a.trim(d[e]),g="ui-resizable-"+f,h=a('<div class="ui-resizable-handle '+g+'"></div>');h.css({zIndex:c.zIndex}),"se"==f&&h.addClass("ui-icon ui-icon-gripsmall-diagonal-se"),this.handles[f]=".ui-resizable-"+f,this.element.append(h)}}this._renderAxis=function(b){b=b||this.element;for(var c in this.handles){this.handles[c].constructor==String&&(this.handles[c]=a(this.handles[c],this.element).show());if(this.elementIsWrapper&&this.originalElement[0].nodeName.match(/textarea|input|select|button/i)){var d=a(this.handles[c],this.element),e=0;e=/sw|ne|nw|se|n|s/.test(c)?d.outerHeight():d.outerWidth();var f=["padding",/ne|nw|n/.test(c)?"Top":/se|sw|s/.test(c)?"Bottom":/^e$/.test(c)?"Right":"Left"].join("");b.css(f,e),this._proportionallyResize()}if(!a(this.handles[c]).length)continue}},this._renderAxis(this.element),this._handles=a(".ui-resizable-handle",this.element).disableSelection(),this._handles.mouseover(function(){if(!b.resizing){if(this.className)var a=this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i);b.axis=a&&a[1]?a[1]:"se"}}),c.autoHide&&(this._handles.hide(),a(this.element).addClass("ui-resizable-autohide").hover(function(){if(c.disabled)return;a(this).removeClass("ui-resizable-autohide"),b._handles.show()},function(){if(c.disabled)return;b.resizing||(a(this).addClass("ui-resizable-autohide"),b._handles.hide())})),this._mouseInit()},destroy:function(){this._mouseDestroy();var b=function(b){a(b).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing").removeData("resizable").unbind(".resizable").find(".ui-resizable-handle").remove()};if(this.elementIsWrapper){b(this.element);var c=this.element;c.after(this.originalElement.css({position:c.css("position"),width:c.outerWidth(),height:c.outerHeight(),top:c.css("top"),left:c.css("left")})).remove()}return this.originalElement.css("resize",this.originalResizeStyle),b(this.originalElement),this},_mouseCapture:function(b){var c=!1;for(var d in this.handles)a(this.handles[d])[0]==b.target&&(c=!0);return!this.options.disabled&&c},_mouseStart:function(b){var d=this.options,e=this.element.position(),f=this.element;this.resizing=!0,this.documentScroll={top:a(document).scrollTop(),left:a(document).scrollLeft()},(f.is(".ui-draggable")||/absolute/.test(f.css("position")))&&f.css({position:"absolute",top:e.top,left:e.left}),this._renderProxy();var g=c(this.helper.css("left")),h=c(this.helper.css("top"));d.containment&&(g+=a(d.containment).scrollLeft()||0,h+=a(d.containment).scrollTop()||0),this.offset=this.helper.offset(),this.position={left:g,top:h},this.size=this._helper?{width:f.outerWidth(),height:f.outerHeight()}:{width:f.width(),height:f.height()},this.originalSize=this._helper?{width:f.outerWidth(),height:f.outerHeight()}:{width:f.width(),height:f.height()},this.originalPosition={left:g,top:h},this.sizeDiff={width:f.outerWidth()-f.width(),height:f.outerHeight()-f.height()},this.originalMousePosition={left:b.pageX,top:b.pageY},this.aspectRatio=typeof d.aspectRatio=="number"?d.aspectRatio:this.originalSize.width/this.originalSize.height||1;var i=a(".ui-resizable-"+this.axis).css("cursor");return a("body").css("cursor",i=="auto"?this.axis+"-resize":i),f.addClass("ui-resizable-resizing"),this._propagate("start",b),!0},_mouseDrag:function(b){var c=this.helper,d=this.options,e={},f=this,g=this.originalMousePosition,h=this.axis,i=b.pageX-g.left||0,j=b.pageY-g.top||0,k=this._change[h];if(!k)return!1;var l=k.apply(this,[b,i,j]),m=a.browser.msie&&a.browser.version<7,n=this.sizeDiff;this._updateVirtualBoundaries(b.shiftKey);if(this._aspectRatio||b.shiftKey)l=this._updateRatio(l,b);return l=this._respectSize(l,b),this._propagate("resize",b),c.css({top:this.position.top+"px",left:this.position.left+"px",width:this.size.width+"px",height:this.size.height+"px"}),!this._helper&&this._proportionallyResizeElements.length&&this._proportionallyResize(),this._updateCache(l),this._trigger("resize",b,this.ui()),!1},_mouseStop:function(b){this.resizing=!1;var c=this.options,d=this;if(this._helper){var e=this._proportionallyResizeElements,f=e.length&&/textarea/i.test(e[0].nodeName),g=f&&a.ui.hasScroll(e[0],"left")?0:d.sizeDiff.height,h=f?0:d.sizeDiff.width,i={width:d.helper.width()-h,height:d.helper.height()-g},j=parseInt(d.element.css("left"),10)+(d.position.left-d.originalPosition.left)||null,k=parseInt(d.element.css("top"),10)+(d.position.top-d.originalPosition.top)||null;c.animate||this.element.css(a.extend(i,{top:k,left:j})),d.helper.height(d.size.height),d.helper.width(d.size.width),this._helper&&!c.animate&&this._proportionallyResize()}return a("body").css("cursor","auto"),this.element.removeClass("ui-resizable-resizing"),this._propagate("stop",b),this._helper&&this.helper.remove(),!1},_updateVirtualBoundaries:function(a){var b=this.options,c,e,f,g,h;h={minWidth:d(b.minWidth)?b.minWidth:0,maxWidth:d(b.maxWidth)?b.maxWidth:Infinity,minHeight:d(b.minHeight)?b.minHeight:0,maxHeight:d(b.maxHeight)?b.maxHeight:Infinity};if(this._aspectRatio||a)c=h.minHeight*this.aspectRatio,f=h.minWidth/this.aspectRatio,e=h.maxHeight*this.aspectRatio,g=h.maxWidth/this.aspectRatio,c>h.minWidth&&(h.minWidth=c),f>h.minHeight&&(h.minHeight=f),e<h.maxWidth&&(h.maxWidth=e),g<h.maxHeight&&(h.maxHeight=g);this._vBoundaries=h},_updateCache:function(a){var b=this.options;this.offset=this.helper.offset(),d(a.left)&&(this.position.left=a.left),d(a.top)&&(this.position.top=a.top),d(a.height)&&(this.size.height=a.height),d(a.width)&&(this.size.width=a.width)},_updateRatio:function(a,b){var c=this.options,e=this.position,f=this.size,g=this.axis;return d(a.height)?a.width=a.height*this.aspectRatio:d(a.width)&&(a.height=a.width/this.aspectRatio),g=="sw"&&(a.left=e.left+(f.width-a.width),a.top=null),g=="nw"&&(a.top=e.top+(f.height-a.height),a.left=e.left+(f.width-a.width)),a},_respectSize:function(a,b){var c=this.helper,e=this._vBoundaries,f=this._aspectRatio||b.shiftKey,g=this.axis,h=d(a.width)&&e.maxWidth&&e.maxWidth<a.width,i=d(a.height)&&e.maxHeight&&e.maxHeight<a.height,j=d(a.width)&&e.minWidth&&e.minWidth>a.width,k=d(a.height)&&e.minHeight&&e.minHeight>a.height;j&&(a.width=e.minWidth),k&&(a.height=e.minHeight),h&&(a.width=e.maxWidth),i&&(a.height=e.maxHeight);var l=this.originalPosition.left+this.originalSize.width,m=this.position.top+this.size.height,n=/sw|nw|w/.test(g),o=/nw|ne|n/.test(g);j&&n&&(a.left=l-e.minWidth),h&&n&&(a.left=l-e.maxWidth),k&&o&&(a.top=m-e.minHeight),i&&o&&(a.top=m-e.maxHeight);var p=!a.width&&!a.height;return p&&!a.left&&a.top?a.top=null:p&&!a.top&&a.left&&(a.left=null),a},_proportionallyResize:function(){var b=this.options;if(!this._proportionallyResizeElements.length)return;var c=this.helper||this.element;for(var d=0;d<this._proportionallyResizeElements.length;d++){var e=this._proportionallyResizeElements[d];if(!this.borderDif){var f=[e.css("borderTopWidth"),e.css("borderRightWidth"),e.css("borderBottomWidth"),e.css("borderLeftWidth")],g=[e.css("paddingTop"),e.css("paddingRight"),e.css("paddingBottom"),e.css("paddingLeft")];this.borderDif=a.map(f,function(a,b){var c=parseInt(a,10)||0,d=parseInt(g[b],10)||0;return c+d})}if(!a.browser.msie||!a(c).is(":hidden")&&!a(c).parents(":hidden").length)e.css({height:c.height()-this.borderDif[0]-this.borderDif[2]||0,width:c.width()-this.borderDif[1]-this.borderDif[3]||0});else continue}},_renderProxy:function(){var b=this.element,c=this.options;this.elementOffset=b.offset();if(this._helper){this.helper=this.helper||a('<div style="overflow:hidden;"></div>');var d=a.browser.msie&&a.browser.version<7,e=d?1:0,f=d?2:-1;this.helper.addClass(this._helper).css({width:this.element.outerWidth()+f,height:this.element.outerHeight()+f,position:"absolute",left:this.elementOffset.left-e+"px",top:this.elementOffset.top-e+"px",zIndex:++c.zIndex}),this.helper.appendTo("body").disableSelection()}else this.helper=this.element},_change:{e:function(a,b,c){return{width:this.originalSize.width+b}},w:function(a,b,c){var d=this.options,e=this.originalSize,f=this.originalPosition;return{left:f.left+b,width:e.width-b}},n:function(a,b,c){var d=this.options,e=this.originalSize,f=this.originalPosition;return{top:f.top+c,height:e.height-c}},s:function(a,b,c){return{height:this.originalSize.height+c}},se:function(b,c,d){return a.extend(this._change.s.apply(this,arguments),this._change.e.apply(this,[b,c,d]))},sw:function(b,c,d){return a.extend(this._change.s.apply(this,arguments),this._change.w.apply(this,[b,c,d]))},ne:function(b,c,d){return a.extend(this._change.n.apply(this,arguments),this._change.e.apply(this,[b,c,d]))},nw:function(b,c,d){return a.extend(this._change.n.apply(this,arguments),this._change.w.apply(this,[b,c,d]))}},_propagate:function(b,c){a.ui.plugin.call(this,b,[c,this.ui()]),b!="resize"&&this._trigger(b,c,this.ui())},plugins:{},ui:function(){return{originalElement:this.originalElement,element:this.element,helper:this.helper,position:this.position,size:this.size,originalSize:this.originalSize,originalPosition:this.originalPosition}}}),a.extend(a.ui.resizable,{version:"1.8.24"}),a.ui.plugin.add("resizable","alsoResize",{start:function(b,c){var d=a(this).data("resizable"),e=d.options,f=function(b){a(b).each(function(){var b=a(this);b.data("resizable-alsoresize",{width:parseInt(b.width(),10),height:parseInt(b.height(),10),left:parseInt(b.css("left"),10),top:parseInt(b.css("top"),10)})})};typeof e.alsoResize=="object"&&!e.alsoResize.parentNode?e.alsoResize.length?(e.alsoResize=e.alsoResize[0],f(e.alsoResize)):a.each(e.alsoResize,function(a){f(a)}):f(e.alsoResize)},resize:function(b,c){var d=a(this).data("resizable"),e=d.options,f=d.originalSize,g=d.originalPosition,h={height:d.size.height-f.height||0,width:d.size.width-f.width||0,top:d.position.top-g.top||0,left:d.position.left-g.left||0},i=function(b,d){a(b).each(function(){var b=a(this),e=a(this).data("resizable-alsoresize"),f={},g=d&&d.length?d:b.parents(c.originalElement[0]).length?["width","height"]:["width","height","top","left"];a.each(g,function(a,b){var c=(e[b]||0)+(h[b]||0);c&&c>=0&&(f[b]=c||null)}),b.css(f)})};typeof e.alsoResize=="object"&&!e.alsoResize.nodeType?a.each(e.alsoResize,function(a,b){i(a,b)}):i(e.alsoResize)},stop:function(b,c){a(this).removeData("resizable-alsoresize")}}),a.ui.plugin.add("resizable","animate",{stop:function(b,c){var d=a(this).data("resizable"),e=d.options,f=d._proportionallyResizeElements,g=f.length&&/textarea/i.test(f[0].nodeName),h=g&&a.ui.hasScroll(f[0],"left")?0:d.sizeDiff.height,i=g?0:d.sizeDiff.width,j={width:d.size.width-i,height:d.size.height-h},k=parseInt(d.element.css("left"),10)+(d.position.left-d.originalPosition.left)||null,l=parseInt(d.element.css("top"),10)+(d.position.top-d.originalPosition.top)||null;d.element.animate(a.extend(j,l&&k?{top:l,left:k}:{}),{duration:e.animateDuration,easing:e.animateEasing,step:function(){var c={width:parseInt(d.element.css("width"),10),height:parseInt(d.element.css("height"),10),top:parseInt(d.element.css("top"),10),left:parseInt(d.element.css("left"),10)};f&&f.length&&a(f[0]).css({width:c.width,height:c.height}),d._updateCache(c),d._propagate("resize",b)}})}}),a.ui.plugin.add("resizable","containment",{start:function(b,d){var e=a(this).data("resizable"),f=e.options,g=e.element,h=f.containment,i=h instanceof a?h.get(0):/parent/.test(h)?g.parent().get(0):h;if(!i)return;e.containerElement=a(i);if(/document/.test(h)||h==document)e.containerOffset={left:0,top:0},e.containerPosition={left:0,top:0},e.parentData={element:a(document),left:0,top:0,width:a(document).width(),height:a(document).height()||document.body.parentNode.scrollHeight};else{var j=a(i),k=[];a(["Top","Right","Left","Bottom"]).each(function(a,b){k[a]=c(j.css("padding"+b))}),e.containerOffset=j.offset(),e.containerPosition=j.position(),e.containerSize={height:j.innerHeight()-k[3],width:j.innerWidth()-k[1]};var l=e.containerOffset,m=e.containerSize.height,n=e.containerSize.width,o=a.ui.hasScroll(i,"left")?i.scrollWidth:n,p=a.ui.hasScroll(i)?i.scrollHeight:m;e.parentData={element:i,left:l.left,top:l.top,width:o,height:p}}},resize:function(b,c){var d=a(this).data("resizable"),e=d.options,f=d.containerSize,g=d.containerOffset,h=d.size,i=d.position,j=d._aspectRatio||b.shiftKey,k={top:0,left:0},l=d.containerElement;l[0]!=document&&/static/.test(l.css("position"))&&(k=g),i.left<(d._helper?g.left:0)&&(d.size.width=d.size.width+(d._helper?d.position.left-g.left:d.position.left-k.left),j&&(d.size.height=d.size.width/d.aspectRatio),d.position.left=e.helper?g.left:0),i.top<(d._helper?g.top:0)&&(d.size.height=d.size.height+(d._helper?d.position.top-g.top:d.position.top),j&&(d.size.width=d.size.height*d.aspectRatio),d.position.top=d._helper?g.top:0),d.offset.left=d.parentData.left+d.position.left,d.offset.top=d.parentData.top+d.position.top;var m=Math.abs((d._helper?d.offset.left-k.left:d.offset.left-k.left)+d.sizeDiff.width),n=Math.abs((d._helper?d.offset.top-k.top:d.offset.top-g.top)+d.sizeDiff.height),o=d.containerElement.get(0)==d.element.parent().get(0),p=/relative|absolute/.test(d.containerElement.css("position"));o&&p&&(m-=d.parentData.left),m+d.size.width>=d.parentData.width&&(d.size.width=d.parentData.width-m,j&&(d.size.height=d.size.width/d.aspectRatio)),n+d.size.height>=d.parentData.height&&(d.size.height=d.parentData.height-n,j&&(d.size.width=d.size.height*d.aspectRatio))},stop:function(b,c){var d=a(this).data("resizable"),e=d.options,f=d.position,g=d.containerOffset,h=d.containerPosition,i=d.containerElement,j=a(d.helper),k=j.offset(),l=j.outerWidth()-d.sizeDiff.width,m=j.outerHeight()-d.sizeDiff.height;d._helper&&!e.animate&&/relative/.test(i.css("position"))&&a(this).css({left:k.left-h.left-g.left,width:l,height:m}),d._helper&&!e.animate&&/static/.test(i.css("position"))&&a(this).css({left:k.left-h.left-g.left,width:l,height:m})}}),a.ui.plugin.add("resizable","ghost",{start:function(b,c){var d=a(this).data("resizable"),e=d.options,f=d.size;d.ghost=d.originalElement.clone(),d.ghost.css({opacity:.25,display:"block",position:"relative",height:f.height,width:f.width,margin:0,left:0,top:0}).addClass("ui-resizable-ghost").addClass(typeof e.ghost=="string"?e.ghost:""),d.ghost.appendTo(d.helper)},resize:function(b,c){var d=a(this).data("resizable"),e=d.options;d.ghost&&d.ghost.css({position:"relative",height:d.size.height,width:d.size.width})},stop:function(b,c){var d=a(this).data("resizable"),e=d.options;d.ghost&&d.helper&&d.helper.get(0).removeChild(d.ghost.get(0))}}),a.ui.plugin.add("resizable","grid",{resize:function(b,c){var d=a(this).data("resizable"),e=d.options,f=d.size,g=d.originalSize,h=d.originalPosition,i=d.axis,j=e._aspectRatio||b.shiftKey;e.grid=typeof e.grid=="number"?[e.grid,e.grid]:e.grid;var k=Math.round((f.width-g.width)/(e.grid[0]||1))*(e.grid[0]||1),l=Math.round((f.height-g.height)/(e.grid[1]||1))*(e.grid[1]||1);/^(se|s|e)$/.test(i)?(d.size.width=g.width+k,d.size.height=g.height+l):/^(ne)$/.test(i)?(d.size.width=g.width+k,d.size.height=g.height+l,d.position.top=h.top-l):/^(sw)$/.test(i)?(d.size.width=g.width+k,d.size.height=g.height+l,d.position.left=h.left-k):(d.size.width=g.width+k,d.size.height=g.height+l,d.position.top=h.top-l,d.position.left=h.left-k)}});var c=function(a){return parseInt(a,10)||0},d=function(a){return!isNaN(parseInt(a,10))}})(jQuery);;/*! jQuery UI - v1.8.24 - 2012-09-28
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.selectable.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){a.widget("ui.selectable",a.ui.mouse,{options:{appendTo:"body",autoRefresh:!0,distance:0,filter:"*",tolerance:"touch"},_create:function(){var b=this;this.element.addClass("ui-selectable"),this.dragged=!1;var c;this.refresh=function(){c=a(b.options.filter,b.element[0]),c.addClass("ui-selectee"),c.each(function(){var b=a(this),c=b.offset();a.data(this,"selectable-item",{element:this,$element:b,left:c.left,top:c.top,right:c.left+b.outerWidth(),bottom:c.top+b.outerHeight(),startselected:!1,selected:b.hasClass("ui-selected"),selecting:b.hasClass("ui-selecting"),unselecting:b.hasClass("ui-unselecting")})})},this.refresh(),this.selectees=c.addClass("ui-selectee"),this._mouseInit(),this.helper=a("<div class='ui-selectable-helper'></div>")},destroy:function(){return this.selectees.removeClass("ui-selectee").removeData("selectable-item"),this.element.removeClass("ui-selectable ui-selectable-disabled").removeData("selectable").unbind(".selectable"),this._mouseDestroy(),this},_mouseStart:function(b){var c=this;this.opos=[b.pageX,b.pageY];if(this.options.disabled)return;var d=this.options;this.selectees=a(d.filter,this.element[0]),this._trigger("start",b),a(d.appendTo).append(this.helper),this.helper.css({left:b.clientX,top:b.clientY,width:0,height:0}),d.autoRefresh&&this.refresh(),this.selectees.filter(".ui-selected").each(function(){var d=a.data(this,"selectable-item");d.startselected=!0,!b.metaKey&&!b.ctrlKey&&(d.$element.removeClass("ui-selected"),d.selected=!1,d.$element.addClass("ui-unselecting"),d.unselecting=!0,c._trigger("unselecting",b,{unselecting:d.element}))}),a(b.target).parents().andSelf().each(function(){var d=a.data(this,"selectable-item");if(d){var e=!b.metaKey&&!b.ctrlKey||!d.$element.hasClass("ui-selected");return d.$element.removeClass(e?"ui-unselecting":"ui-selected").addClass(e?"ui-selecting":"ui-unselecting"),d.unselecting=!e,d.selecting=e,d.selected=e,e?c._trigger("selecting",b,{selecting:d.element}):c._trigger("unselecting",b,{unselecting:d.element}),!1}})},_mouseDrag:function(b){var c=this;this.dragged=!0;if(this.options.disabled)return;var d=this.options,e=this.opos[0],f=this.opos[1],g=b.pageX,h=b.pageY;if(e>g){var i=g;g=e,e=i}if(f>h){var i=h;h=f,f=i}return this.helper.css({left:e,top:f,width:g-e,height:h-f}),this.selectees.each(function(){var i=a.data(this,"selectable-item");if(!i||i.element==c.element[0])return;var j=!1;d.tolerance=="touch"?j=!(i.left>g||i.right<e||i.top>h||i.bottom<f):d.tolerance=="fit"&&(j=i.left>e&&i.right<g&&i.top>f&&i.bottom<h),j?(i.selected&&(i.$element.removeClass("ui-selected"),i.selected=!1),i.unselecting&&(i.$element.removeClass("ui-unselecting"),i.unselecting=!1),i.selecting||(i.$element.addClass("ui-selecting"),i.selecting=!0,c._trigger("selecting",b,{selecting:i.element}))):(i.selecting&&((b.metaKey||b.ctrlKey)&&i.startselected?(i.$element.removeClass("ui-selecting"),i.selecting=!1,i.$element.addClass("ui-selected"),i.selected=!0):(i.$element.removeClass("ui-selecting"),i.selecting=!1,i.startselected&&(i.$element.addClass("ui-unselecting"),i.unselecting=!0),c._trigger("unselecting",b,{unselecting:i.element}))),i.selected&&!b.metaKey&&!b.ctrlKey&&!i.startselected&&(i.$element.removeClass("ui-selected"),i.selected=!1,i.$element.addClass("ui-unselecting"),i.unselecting=!0,c._trigger("unselecting",b,{unselecting:i.element})))}),!1},_mouseStop:function(b){var c=this;this.dragged=!1;var d=this.options;return a(".ui-unselecting",this.element[0]).each(function(){var d=a.data(this,"selectable-item");d.$element.removeClass("ui-unselecting"),d.unselecting=!1,d.startselected=!1,c._trigger("unselected",b,{unselected:d.element})}),a(".ui-selecting",this.element[0]).each(function(){var d=a.data(this,"selectable-item");d.$element.removeClass("ui-selecting").addClass("ui-selected"),d.selecting=!1,d.selected=!0,d.startselected=!0,c._trigger("selected",b,{selected:d.element})}),this._trigger("stop",b),this.helper.remove(),!1}}),a.extend(a.ui.selectable,{version:"1.8.24"})})(jQuery);;/*! jQuery UI - v1.8.24 - 2012-09-28
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.button.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){var c,d,e,f,g="ui-button ui-widget ui-state-default ui-corner-all",h="ui-state-hover ui-state-active ",i="ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon-primary ui-button-text-icon-secondary ui-button-text-only",j=function(){var b=a(this).find(":ui-button");setTimeout(function(){b.button("refresh")},1)},k=function(b){var c=b.name,d=b.form,e=a([]);return c&&(d?e=a(d).find("[name='"+c+"']"):e=a("[name='"+c+"']",b.ownerDocument).filter(function(){return!this.form})),e};a.widget("ui.button",{options:{disabled:null,text:!0,label:null,icons:{primary:null,secondary:null}},_create:function(){this.element.closest("form").unbind("reset.button").bind("reset.button",j),typeof this.options.disabled!="boolean"?this.options.disabled=!!this.element.propAttr("disabled"):this.element.propAttr("disabled",this.options.disabled),this._determineButtonType(),this.hasTitle=!!this.buttonElement.attr("title");var b=this,h=this.options,i=this.type==="checkbox"||this.type==="radio",l="ui-state-hover"+(i?"":" ui-state-active"),m="ui-state-focus";h.label===null&&(h.label=this.buttonElement.html()),this.buttonElement.addClass(g).attr("role","button").bind("mouseenter.button",function(){if(h.disabled)return;a(this).addClass("ui-state-hover"),this===c&&a(this).addClass("ui-state-active")}).bind("mouseleave.button",function(){if(h.disabled)return;a(this).removeClass(l)}).bind("click.button",function(a){h.disabled&&(a.preventDefault(),a.stopImmediatePropagation())}),this.element.bind("focus.button",function(){b.buttonElement.addClass(m)}).bind("blur.button",function(){b.buttonElement.removeClass(m)}),i&&(this.element.bind("change.button",function(){if(f)return;b.refresh()}),this.buttonElement.bind("mousedown.button",function(a){if(h.disabled)return;f=!1,d=a.pageX,e=a.pageY}).bind("mouseup.button",function(a){if(h.disabled)return;if(d!==a.pageX||e!==a.pageY)f=!0})),this.type==="checkbox"?this.buttonElement.bind("click.button",function(){if(h.disabled||f)return!1;a(this).toggleClass("ui-state-active"),b.buttonElement.attr("aria-pressed",b.element[0].checked)}):this.type==="radio"?this.buttonElement.bind("click.button",function(){if(h.disabled||f)return!1;a(this).addClass("ui-state-active"),b.buttonElement.attr("aria-pressed","true");var c=b.element[0];k(c).not(c).map(function(){return a(this).button("widget")[0]}).removeClass("ui-state-active").attr("aria-pressed","false")}):(this.buttonElement.bind("mousedown.button",function(){if(h.disabled)return!1;a(this).addClass("ui-state-active"),c=this,a(document).one("mouseup",function(){c=null})}).bind("mouseup.button",function(){if(h.disabled)return!1;a(this).removeClass("ui-state-active")}).bind("keydown.button",function(b){if(h.disabled)return!1;(b.keyCode==a.ui.keyCode.SPACE||b.keyCode==a.ui.keyCode.ENTER)&&a(this).addClass("ui-state-active")}).bind("keyup.button",function(){a(this).removeClass("ui-state-active")}),this.buttonElement.is("a")&&this.buttonElement.keyup(function(b){b.keyCode===a.ui.keyCode.SPACE&&a(this).click()})),this._setOption("disabled",h.disabled),this._resetButton()},_determineButtonType:function(){this.element.is(":checkbox")?this.type="checkbox":this.element.is(":radio")?this.type="radio":this.element.is("input")?this.type="input":this.type="button";if(this.type==="checkbox"||this.type==="radio"){var a=this.element.parents().filter(":last"),b="label[for='"+this.element.attr("id")+"']";this.buttonElement=a.find(b),this.buttonElement.length||(a=a.length?a.siblings():this.element.siblings(),this.buttonElement=a.filter(b),this.buttonElement.length||(this.buttonElement=a.find(b))),this.element.addClass("ui-helper-hidden-accessible");var c=this.element.is(":checked");c&&this.buttonElement.addClass("ui-state-active"),this.buttonElement.attr("aria-pressed",c)}else this.buttonElement=this.element},widget:function(){return this.buttonElement},destroy:function(){this.element.removeClass("ui-helper-hidden-accessible"),this.buttonElement.removeClass(g+" "+h+" "+i).removeAttr("role").removeAttr("aria-pressed").html(this.buttonElement.find(".ui-button-text").html()),this.hasTitle||this.buttonElement.removeAttr("title"),a.Widget.prototype.destroy.call(this)},_setOption:function(b,c){a.Widget.prototype._setOption.apply(this,arguments);if(b==="disabled"){c?this.element.propAttr("disabled",!0):this.element.propAttr("disabled",!1);return}this._resetButton()},refresh:function(){var b=this.element.is(":disabled");b!==this.options.disabled&&this._setOption("disabled",b),this.type==="radio"?k(this.element[0]).each(function(){a(this).is(":checked")?a(this).button("widget").addClass("ui-state-active").attr("aria-pressed","true"):a(this).button("widget").removeClass("ui-state-active").attr("aria-pressed","false")}):this.type==="checkbox"&&(this.element.is(":checked")?this.buttonElement.addClass("ui-state-active").attr("aria-pressed","true"):this.buttonElement.removeClass("ui-state-active").attr("aria-pressed","false"))},_resetButton:function(){if(this.type==="input"){this.options.label&&this.element.val(this.options.label);return}var b=this.buttonElement.removeClass(i),c=a("<span></span>",this.element[0].ownerDocument).addClass("ui-button-text").html(this.options.label).appendTo(b.empty()).text(),d=this.options.icons,e=d.primary&&d.secondary,f=[];d.primary||d.secondary?(this.options.text&&f.push("ui-button-text-icon"+(e?"s":d.primary?"-primary":"-secondary")),d.primary&&b.prepend("<span class='ui-button-icon-primary ui-icon "+d.primary+"'></span>"),d.secondary&&b.append("<span class='ui-button-icon-secondary ui-icon "+d.secondary+"'></span>"),this.options.text||(f.push(e?"ui-button-icons-only":"ui-button-icon-only"),this.hasTitle||b.attr("title",c))):f.push("ui-button-text-only"),b.addClass(f.join(" "))}}),a.widget("ui.buttonset",{options:{items:":button, :submit, :reset, :checkbox, :radio, a, :data(button)"},_create:function(){this.element.addClass("ui-buttonset")},_init:function(){this.refresh()},_setOption:function(b,c){b==="disabled"&&this.buttons.button("option",b,c),a.Widget.prototype._setOption.apply(this,arguments)},refresh:function(){var b=this.element.css("direction")==="rtl";this.buttons=this.element.find(this.options.items).filter(":ui-button").button("refresh").end().not(":ui-button").button().end().map(function(){return a(this).button("widget")[0]}).removeClass("ui-corner-all ui-corner-left ui-corner-right").filter(":first").addClass(b?"ui-corner-right":"ui-corner-left").end().filter(":last").addClass(b?"ui-corner-left":"ui-corner-right").end().end()},destroy:function(){this.element.removeClass("ui-buttonset"),this.buttons.map(function(){return a(this).button("widget")[0]}).removeClass("ui-corner-left ui-corner-right").end().button("destroy"),a.Widget.prototype.destroy.call(this)}})})(jQuery);;/*! jQuery UI - v1.8.24 - 2012-09-28
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.dialog.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){var c="ui-dialog ui-widget ui-widget-content ui-corner-all ",d={buttons:!0,height:!0,maxHeight:!0,maxWidth:!0,minHeight:!0,minWidth:!0,width:!0},e={maxHeight:!0,maxWidth:!0,minHeight:!0,minWidth:!0};a.widget("ui.dialog",{options:{autoOpen:!0,buttons:{},closeOnEscape:!0,closeText:"close",dialogClass:"",draggable:!0,hide:null,height:"auto",maxHeight:!1,maxWidth:!1,minHeight:150,minWidth:150,modal:!1,position:{my:"center",at:"center",collision:"fit",using:function(b){var c=a(this).css(b).offset().top;c<0&&a(this).css("top",b.top-c)}},resizable:!0,show:null,stack:!0,title:"",width:300,zIndex:1e3},_create:function(){this.originalTitle=this.element.attr("title"),typeof this.originalTitle!="string"&&(this.originalTitle=""),this.options.title=this.options.title||this.originalTitle;var b=this,d=b.options,e=d.title||"&#160;",f=a.ui.dialog.getTitleId(b.element),g=(b.uiDialog=a("<div></div>")).appendTo(document.body).hide().addClass(c+d.dialogClass).css({zIndex:d.zIndex}).attr("tabIndex",-1).css("outline",0).keydown(function(c){d.closeOnEscape&&!c.isDefaultPrevented()&&c.keyCode&&c.keyCode===a.ui.keyCode.ESCAPE&&(b.close(c),c.preventDefault())}).attr({role:"dialog","aria-labelledby":f}).mousedown(function(a){b.moveToTop(!1,a)}),h=b.element.show().removeAttr("title").addClass("ui-dialog-content ui-widget-content").appendTo(g),i=(b.uiDialogTitlebar=a("<div></div>")).addClass("ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix").prependTo(g),j=a('<a href="#"></a>').addClass("ui-dialog-titlebar-close ui-corner-all").attr("role","button").hover(function(){j.addClass("ui-state-hover")},function(){j.removeClass("ui-state-hover")}).focus(function(){j.addClass("ui-state-focus")}).blur(function(){j.removeClass("ui-state-focus")}).click(function(a){return b.close(a),!1}).appendTo(i),k=(b.uiDialogTitlebarCloseText=a("<span></span>")).addClass("ui-icon ui-icon-closethick").text(d.closeText).appendTo(j),l=a("<span></span>").addClass("ui-dialog-title").attr("id",f).html(e).prependTo(i);a.isFunction(d.beforeclose)&&!a.isFunction(d.beforeClose)&&(d.beforeClose=d.beforeclose),i.find("*").add(i).disableSelection(),d.draggable&&a.fn.draggable&&b._makeDraggable(),d.resizable&&a.fn.resizable&&b._makeResizable(),b._createButtons(d.buttons),b._isOpen=!1,a.fn.bgiframe&&g.bgiframe()},_init:function(){this.options.autoOpen&&this.open()},destroy:function(){var a=this;return a.overlay&&a.overlay.destroy(),a.uiDialog.hide(),a.element.unbind(".dialog").removeData("dialog").removeClass("ui-dialog-content ui-widget-content").hide().appendTo("body"),a.uiDialog.remove(),a.originalTitle&&a.element.attr("title",a.originalTitle),a},widget:function(){return this.uiDialog},close:function(b){var c=this,d,e;if(!1===c._trigger("beforeClose",b))return;return c.overlay&&c.overlay.destroy(),c.uiDialog.unbind("keypress.ui-dialog"),c._isOpen=!1,c.options.hide?c.uiDialog.hide(c.options.hide,function(){c._trigger("close",b)}):(c.uiDialog.hide(),c._trigger("close",b)),a.ui.dialog.overlay.resize(),c.options.modal&&(d=0,a(".ui-dialog").each(function(){this!==c.uiDialog[0]&&(e=a(this).css("z-index"),isNaN(e)||(d=Math.max(d,e)))}),a.ui.dialog.maxZ=d),c},isOpen:function(){return this._isOpen},moveToTop:function(b,c){var d=this,e=d.options,f;return e.modal&&!b||!e.stack&&!e.modal?d._trigger("focus",c):(e.zIndex>a.ui.dialog.maxZ&&(a.ui.dialog.maxZ=e.zIndex),d.overlay&&(a.ui.dialog.maxZ+=1,d.overlay.$el.css("z-index",a.ui.dialog.overlay.maxZ=a.ui.dialog.maxZ)),f={scrollTop:d.element.scrollTop(),scrollLeft:d.element.scrollLeft()},a.ui.dialog.maxZ+=1,d.uiDialog.css("z-index",a.ui.dialog.maxZ),d.element.attr(f),d._trigger("focus",c),d)},open:function(){if(this._isOpen)return;var b=this,c=b.options,d=b.uiDialog;return b.overlay=c.modal?new a.ui.dialog.overlay(b):null,b._size(),b._position(c.position),d.show(c.show),b.moveToTop(!0),c.modal&&d.bind("keydown.ui-dialog",function(b){if(b.keyCode!==a.ui.keyCode.TAB)return;var c=a(":tabbable",this),d=c.filter(":first"),e=c.filter(":last");if(b.target===e[0]&&!b.shiftKey)return d.focus(1),!1;if(b.target===d[0]&&b.shiftKey)return e.focus(1),!1}),a(b.element.find(":tabbable").get().concat(d.find(".ui-dialog-buttonpane :tabbable").get().concat(d.get()))).eq(0).focus(),b._isOpen=!0,b._trigger("open"),b},_createButtons:function(b){var c=this,d=!1,e=a("<div></div>").addClass("ui-dialog-buttonpane ui-widget-content ui-helper-clearfix"),f=a("<div></div>").addClass("ui-dialog-buttonset").appendTo(e);c.uiDialog.find(".ui-dialog-buttonpane").remove(),typeof b=="object"&&b!==null&&a.each(b,function(){return!(d=!0)}),d&&(a.each(b,function(b,d){d=a.isFunction(d)?{click:d,text:b}:d;var e=a('<button type="button"></button>').click(function(){d.click.apply(c.element[0],arguments)}).appendTo(f);a.each(d,function(a,b){if(a==="click")return;a in e?e[a](b):e.attr(a,b)}),a.fn.button&&e.button()}),e.appendTo(c.uiDialog))},_makeDraggable:function(){function f(a){return{position:a.position,offset:a.offset}}var b=this,c=b.options,d=a(document),e;b.uiDialog.draggable({cancel:".ui-dialog-content, .ui-dialog-titlebar-close",handle:".ui-dialog-titlebar",containment:"document",start:function(d,g){e=c.height==="auto"?"auto":a(this).height(),a(this).height(a(this).height()).addClass("ui-dialog-dragging"),b._trigger("dragStart",d,f(g))},drag:function(a,c){b._trigger("drag",a,f(c))},stop:function(g,h){c.position=[h.position.left-d.scrollLeft(),h.position.top-d.scrollTop()],a(this).removeClass("ui-dialog-dragging").height(e),b._trigger("dragStop",g,f(h)),a.ui.dialog.overlay.resize()}})},_makeResizable:function(c){function h(a){return{originalPosition:a.originalPosition,originalSize:a.originalSize,position:a.position,size:a.size}}c=c===b?this.options.resizable:c;var d=this,e=d.options,f=d.uiDialog.css("position"),g=typeof c=="string"?c:"n,e,s,w,se,sw,ne,nw";d.uiDialog.resizable({cancel:".ui-dialog-content",containment:"document",alsoResize:d.element,maxWidth:e.maxWidth,maxHeight:e.maxHeight,minWidth:e.minWidth,minHeight:d._minHeight(),handles:g,start:function(b,c){a(this).addClass("ui-dialog-resizing"),d._trigger("resizeStart",b,h(c))},resize:function(a,b){d._trigger("resize",a,h(b))},stop:function(b,c){a(this).removeClass("ui-dialog-resizing"),e.height=a(this).height(),e.width=a(this).width(),d._trigger("resizeStop",b,h(c)),a.ui.dialog.overlay.resize()}}).css("position",f).find(".ui-resizable-se").addClass("ui-icon ui-icon-grip-diagonal-se")},_minHeight:function(){var a=this.options;return a.height==="auto"?a.minHeight:Math.min(a.minHeight,a.height)},_position:function(b){var c=[],d=[0,0],e;if(b){if(typeof b=="string"||typeof b=="object"&&"0"in b)c=b.split?b.split(" "):[b[0],b[1]],c.length===1&&(c[1]=c[0]),a.each(["left","top"],function(a,b){+c[a]===c[a]&&(d[a]=c[a],c[a]=b)}),b={my:c.join(" "),at:c.join(" "),offset:d.join(" ")};b=a.extend({},a.ui.dialog.prototype.options.position,b)}else b=a.ui.dialog.prototype.options.position;e=this.uiDialog.is(":visible"),e||this.uiDialog.show(),this.uiDialog.css({top:0,left:0}).position(a.extend({of:window},b)),e||this.uiDialog.hide()},_setOptions:function(b){var c=this,f={},g=!1;a.each(b,function(a,b){c._setOption(a,b),a in d&&(g=!0),a in e&&(f[a]=b)}),g&&this._size(),this.uiDialog.is(":data(resizable)")&&this.uiDialog.resizable("option",f)},_setOption:function(b,d){var e=this,f=e.uiDialog;switch(b){case"beforeclose":b="beforeClose";break;case"buttons":e._createButtons(d);break;case"closeText":e.uiDialogTitlebarCloseText.text(""+d);break;case"dialogClass":f.removeClass(e.options.dialogClass).addClass(c+d);break;case"disabled":d?f.addClass("ui-dialog-disabled"):f.removeClass("ui-dialog-disabled");break;case"draggable":var g=f.is(":data(draggable)");g&&!d&&f.draggable("destroy"),!g&&d&&e._makeDraggable();break;case"position":e._position(d);break;case"resizable":var h=f.is(":data(resizable)");h&&!d&&f.resizable("destroy"),h&&typeof d=="string"&&f.resizable("option","handles",d),!h&&d!==!1&&e._makeResizable(d);break;case"title":a(".ui-dialog-title",e.uiDialogTitlebar).html(""+(d||"&#160;"))}a.Widget.prototype._setOption.apply(e,arguments)},_size:function(){var b=this.options,c,d,e=this.uiDialog.is(":visible");this.element.show().css({width:"auto",minHeight:0,height:0}),b.minWidth>b.width&&(b.width=b.minWidth),c=this.uiDialog.css({height:"auto",width:b.width}).height(),d=Math.max(0,b.minHeight-c);if(b.height==="auto")if(a.support.minHeight)this.element.css({minHeight:d,height:"auto"});else{this.uiDialog.show();var f=this.element.css("height","auto").height();e||this.uiDialog.hide(),this.element.height(Math.max(f,d))}else this.element.height(Math.max(b.height-c,0));this.uiDialog.is(":data(resizable)")&&this.uiDialog.resizable("option","minHeight",this._minHeight())}}),a.extend(a.ui.dialog,{version:"1.8.24",uuid:0,maxZ:0,getTitleId:function(a){var b=a.attr("id");return b||(this.uuid+=1,b=this.uuid),"ui-dialog-title-"+b},overlay:function(b){this.$el=a.ui.dialog.overlay.create(b)}}),a.extend(a.ui.dialog.overlay,{instances:[],oldInstances:[],maxZ:0,events:a.map("focus,mousedown,mouseup,keydown,keypress,click".split(","),function(a){return a+".dialog-overlay"}).join(" "),create:function(b){this.instances.length===0&&(setTimeout(function(){a.ui.dialog.overlay.instances.length&&a(document).bind(a.ui.dialog.overlay.events,function(b){if(a(b.target).zIndex()<a.ui.dialog.overlay.maxZ)return!1})},1),a(document).bind("keydown.dialog-overlay",function(c){b.options.closeOnEscape&&!c.isDefaultPrevented()&&c.keyCode&&c.keyCode===a.ui.keyCode.ESCAPE&&(b.close(c),c.preventDefault())}),a(window).bind("resize.dialog-overlay",a.ui.dialog.overlay.resize));var c=(this.oldInstances.pop()||a("<div></div>").addClass("ui-widget-overlay")).appendTo(document.body).css({width:this.width(),height:this.height()});return a.fn.bgiframe&&c.bgiframe(),this.instances.push(c),c},destroy:function(b){var c=a.inArray(b,this.instances);c!=-1&&this.oldInstances.push(this.instances.splice(c,1)[0]),this.instances.length===0&&a([document,window]).unbind(".dialog-overlay"),b.remove();var d=0;a.each(this.instances,function(){d=Math.max(d,this.css("z-index"))}),this.maxZ=d},height:function(){var b,c;return a.browser.msie&&a.browser.version<7?(b=Math.max(document.documentElement.scrollHeight,document.body.scrollHeight),c=Math.max(document.documentElement.offsetHeight,document.body.offsetHeight),b<c?a(window).height()+"px":b+"px"):a(document).height()+"px"},width:function(){var b,c;return a.browser.msie?(b=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth),c=Math.max(document.documentElement.offsetWidth,document.body.offsetWidth),b<c?a(window).width()+"px":b+"px"):a(document).width()+"px"},resize:function(){var b=a([]);a.each(a.ui.dialog.overlay.instances,function(){b=b.add(this)}),b.css({width:0,height:0}).css({width:a.ui.dialog.overlay.width(),height:a.ui.dialog.overlay.height()})}}),a.extend(a.ui.dialog.overlay.prototype,{destroy:function(){a.ui.dialog.overlay.destroy(this.$el)}})})(jQuery);;/*! jQuery UI - v1.8.24 - 2012-09-28
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.slider.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){var c=5;a.widget("ui.slider",a.ui.mouse,{widgetEventPrefix:"slide",options:{animate:!1,distance:0,max:100,min:0,orientation:"horizontal",range:!1,step:1,value:0,values:null},_create:function(){var b=this,d=this.options,e=this.element.find(".ui-slider-handle").addClass("ui-state-default ui-corner-all"),f="<a class='ui-slider-handle ui-state-default ui-corner-all' href='#'></a>",g=d.values&&d.values.length||1,h=[];this._keySliding=!1,this._mouseSliding=!1,this._animateOff=!0,this._handleIndex=null,this._detectOrientation(),this._mouseInit(),this.element.addClass("ui-slider ui-slider-"+this.orientation+" ui-widget"+" ui-widget-content"+" ui-corner-all"+(d.disabled?" ui-slider-disabled ui-disabled":"")),this.range=a([]),d.range&&(d.range===!0&&(d.values||(d.values=[this._valueMin(),this._valueMin()]),d.values.length&&d.values.length!==2&&(d.values=[d.values[0],d.values[0]])),this.range=a("<div></div>").appendTo(this.element).addClass("ui-slider-range ui-widget-header"+(d.range==="min"||d.range==="max"?" ui-slider-range-"+d.range:"")));for(var i=e.length;i<g;i+=1)h.push(f);this.handles=e.add(a(h.join("")).appendTo(b.element)),this.handle=this.handles.eq(0),this.handles.add(this.range).filter("a").click(function(a){a.preventDefault()}).hover(function(){d.disabled||a(this).addClass("ui-state-hover")},function(){a(this).removeClass("ui-state-hover")}).focus(function(){d.disabled?a(this).blur():(a(".ui-slider .ui-state-focus").removeClass("ui-state-focus"),a(this).addClass("ui-state-focus"))}).blur(function(){a(this).removeClass("ui-state-focus")}),this.handles.each(function(b){a(this).data("index.ui-slider-handle",b)}),this.handles.keydown(function(d){var e=a(this).data("index.ui-slider-handle"),f,g,h,i;if(b.options.disabled)return;switch(d.keyCode){case a.ui.keyCode.HOME:case a.ui.keyCode.END:case a.ui.keyCode.PAGE_UP:case a.ui.keyCode.PAGE_DOWN:case a.ui.keyCode.UP:case a.ui.keyCode.RIGHT:case a.ui.keyCode.DOWN:case a.ui.keyCode.LEFT:d.preventDefault();if(!b._keySliding){b._keySliding=!0,a(this).addClass("ui-state-active"),f=b._start(d,e);if(f===!1)return}}i=b.options.step,b.options.values&&b.options.values.length?g=h=b.values(e):g=h=b.value();switch(d.keyCode){case a.ui.keyCode.HOME:h=b._valueMin();break;case a.ui.keyCode.END:h=b._valueMax();break;case a.ui.keyCode.PAGE_UP:h=b._trimAlignValue(g+(b._valueMax()-b._valueMin())/c);break;case a.ui.keyCode.PAGE_DOWN:h=b._trimAlignValue(g-(b._valueMax()-b._valueMin())/c);break;case a.ui.keyCode.UP:case a.ui.keyCode.RIGHT:if(g===b._valueMax())return;h=b._trimAlignValue(g+i);break;case a.ui.keyCode.DOWN:case a.ui.keyCode.LEFT:if(g===b._valueMin())return;h=b._trimAlignValue(g-i)}b._slide(d,e,h)}).keyup(function(c){var d=a(this).data("index.ui-slider-handle");b._keySliding&&(b._keySliding=!1,b._stop(c,d),b._change(c,d),a(this).removeClass("ui-state-active"))}),this._refreshValue(),this._animateOff=!1},destroy:function(){return this.handles.remove(),this.range.remove(),this.element.removeClass("ui-slider ui-slider-horizontal ui-slider-vertical ui-slider-disabled ui-widget ui-widget-content ui-corner-all").removeData("slider").unbind(".slider"),this._mouseDestroy(),this},_mouseCapture:function(b){var c=this.options,d,e,f,g,h,i,j,k,l;return c.disabled?!1:(this.elementSize={width:this.element.outerWidth(),height:this.element.outerHeight()},this.elementOffset=this.element.offset(),d={x:b.pageX,y:b.pageY},e=this._normValueFromMouse(d),f=this._valueMax()-this._valueMin()+1,h=this,this.handles.each(function(b){var c=Math.abs(e-h.values(b));f>c&&(f=c,g=a(this),i=b)}),c.range===!0&&this.values(1)===c.min&&(i+=1,g=a(this.handles[i])),j=this._start(b,i),j===!1?!1:(this._mouseSliding=!0,h._handleIndex=i,g.addClass("ui-state-active").focus(),k=g.offset(),l=!a(b.target).parents().andSelf().is(".ui-slider-handle"),this._clickOffset=l?{left:0,top:0}:{left:b.pageX-k.left-g.width()/2,top:b.pageY-k.top-g.height()/2-(parseInt(g.css("borderTopWidth"),10)||0)-(parseInt(g.css("borderBottomWidth"),10)||0)+(parseInt(g.css("marginTop"),10)||0)},this.handles.hasClass("ui-state-hover")||this._slide(b,i,e),this._animateOff=!0,!0))},_mouseStart:function(a){return!0},_mouseDrag:function(a){var b={x:a.pageX,y:a.pageY},c=this._normValueFromMouse(b);return this._slide(a,this._handleIndex,c),!1},_mouseStop:function(a){return this.handles.removeClass("ui-state-active"),this._mouseSliding=!1,this._stop(a,this._handleIndex),this._change(a,this._handleIndex),this._handleIndex=null,this._clickOffset=null,this._animateOff=!1,!1},_detectOrientation:function(){this.orientation=this.options.orientation==="vertical"?"vertical":"horizontal"},_normValueFromMouse:function(a){var b,c,d,e,f;return this.orientation==="horizontal"?(b=this.elementSize.width,c=a.x-this.elementOffset.left-(this._clickOffset?this._clickOffset.left:0)):(b=this.elementSize.height,c=a.y-this.elementOffset.top-(this._clickOffset?this._clickOffset.top:0)),d=c/b,d>1&&(d=1),d<0&&(d=0),this.orientation==="vertical"&&(d=1-d),e=this._valueMax()-this._valueMin(),f=this._valueMin()+d*e,this._trimAlignValue(f)},_start:function(a,b){var c={handle:this.handles[b],value:this.value()};return this.options.values&&this.options.values.length&&(c.value=this.values(b),c.values=this.values()),this._trigger("start",a,c)},_slide:function(a,b,c){var d,e,f;this.options.values&&this.options.values.length?(d=this.values(b?0:1),this.options.values.length===2&&this.options.range===!0&&(b===0&&c>d||b===1&&c<d)&&(c=d),c!==this.values(b)&&(e=this.values(),e[b]=c,f=this._trigger("slide",a,{handle:this.handles[b],value:c,values:e}),d=this.values(b?0:1),f!==!1&&this.values(b,c,!0))):c!==this.value()&&(f=this._trigger("slide",a,{handle:this.handles[b],value:c}),f!==!1&&this.value(c))},_stop:function(a,b){var c={handle:this.handles[b],value:this.value()};this.options.values&&this.options.values.length&&(c.value=this.values(b),c.values=this.values()),this._trigger("stop",a,c)},_change:function(a,b){if(!this._keySliding&&!this._mouseSliding){var c={handle:this.handles[b],value:this.value()};this.options.values&&this.options.values.length&&(c.value=this.values(b),c.values=this.values()),this._trigger("change",a,c)}},value:function(a){if(arguments.length){this.options.value=this._trimAlignValue(a),this._refreshValue(),this._change(null,0);return}return this._value()},values:function(b,c){var d,e,f;if(arguments.length>1){this.options.values[b]=this._trimAlignValue(c),this._refreshValue(),this._change(null,b);return}if(!arguments.length)return this._values();if(!a.isArray(arguments[0]))return this.options.values&&this.options.values.length?this._values(b):this.value();d=this.options.values,e=arguments[0];for(f=0;f<d.length;f+=1)d[f]=this._trimAlignValue(e[f]),this._change(null,f);this._refreshValue()},_setOption:function(b,c){var d,e=0;a.isArray(this.options.values)&&(e=this.options.values.length),a.Widget.prototype._setOption.apply(this,arguments);switch(b){case"disabled":c?(this.handles.filter(".ui-state-focus").blur(),this.handles.removeClass("ui-state-hover"),this.handles.propAttr("disabled",!0),this.element.addClass("ui-disabled")):(this.handles.propAttr("disabled",!1),this.element.removeClass("ui-disabled"));break;case"orientation":this._detectOrientation(),this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-"+this.orientation),this._refreshValue();break;case"value":this._animateOff=!0,this._refreshValue(),this._change(null,0),this._animateOff=!1;break;case"values":this._animateOff=!0,this._refreshValue();for(d=0;d<e;d+=1)this._change(null,d);this._animateOff=!1}},_value:function(){var a=this.options.value;return a=this._trimAlignValue(a),a},_values:function(a){var b,c,d;if(arguments.length)return b=this.options.values[a],b=this._trimAlignValue(b),b;c=this.options.values.slice();for(d=0;d<c.length;d+=1)c[d]=this._trimAlignValue(c[d]);return c},_trimAlignValue:function(a){if(a<=this._valueMin())return this._valueMin();if(a>=this._valueMax())return this._valueMax();var b=this.options.step>0?this.options.step:1,c=(a-this._valueMin())%b,d=a-c;return Math.abs(c)*2>=b&&(d+=c>0?b:-b),parseFloat(d.toFixed(5))},_valueMin:function(){return this.options.min},_valueMax:function(){return this.options.max},_refreshValue:function(){var b=this.options.range,c=this.options,d=this,e=this._animateOff?!1:c.animate,f,g={},h,i,j,k;this.options.values&&this.options.values.length?this.handles.each(function(b,i){f=(d.values(b)-d._valueMin())/(d._valueMax()-d._valueMin())*100,g[d.orientation==="horizontal"?"left":"bottom"]=f+"%",a(this).stop(1,1)[e?"animate":"css"](g,c.animate),d.options.range===!0&&(d.orientation==="horizontal"?(b===0&&d.range.stop(1,1)[e?"animate":"css"]({left:f+"%"},c.animate),b===1&&d.range[e?"animate":"css"]({width:f-h+"%"},{queue:!1,duration:c.animate})):(b===0&&d.range.stop(1,1)[e?"animate":"css"]({bottom:f+"%"},c.animate),b===1&&d.range[e?"animate":"css"]({height:f-h+"%"},{queue:!1,duration:c.animate}))),h=f}):(i=this.value(),j=this._valueMin(),k=this._valueMax(),f=k!==j?(i-j)/(k-j)*100:0,g[d.orientation==="horizontal"?"left":"bottom"]=f+"%",this.handle.stop(1,1)[e?"animate":"css"](g,c.animate),b==="min"&&this.orientation==="horizontal"&&this.range.stop(1,1)[e?"animate":"css"]({width:f+"%"},c.animate),b==="max"&&this.orientation==="horizontal"&&this.range[e?"animate":"css"]({width:100-f+"%"},{queue:!1,duration:c.animate}),b==="min"&&this.orientation==="vertical"&&this.range.stop(1,1)[e?"animate":"css"]({height:f+"%"},c.animate),b==="max"&&this.orientation==="vertical"&&this.range[e?"animate":"css"]({height:100-f+"%"},{queue:!1,duration:c.animate}))}}),a.extend(a.ui.slider,{version:"1.8.24"})})(jQuery);;
},{}],41:[function(require,module,exports){
/**
 * Cookie plugin
 *
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

/**
 * Create a cookie with the given name and value and other optional parameters.
 *
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Set the value of a cookie.
 * @example $.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain: 'jquery.com', secure: true });
 * @desc Create a cookie with all available options.
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Create a session cookie.
 * @example $.cookie('the_cookie', null);
 * @desc Delete a cookie by passing null as value. Keep in mind that you have to use the same path and domain
 *       used when the cookie was set.
 *
 * @param String name The name of the cookie.
 * @param String value The value of the cookie.
 * @param Object options An object literal containing key/value pairs to provide optional cookie attributes.
 * @option Number|Date expires Either an integer specifying the expiration date from now on in days or a Date object.
 *                             If a negative value is specified (e.g. a date in the past), the cookie will be deleted.
 *                             If set to null or omitted, the cookie will be a session cookie and will not be retained
 *                             when the the browser exits.
 * @option String path The value of the path atribute of the cookie (default: path of page that created the cookie).
 * @option String domain The value of the domain attribute of the cookie (default: domain of page that created the cookie).
 * @option Boolean secure If true, the secure attribute of the cookie will be set and the cookie transmission will
 *                        require a secure protocol (like HTTPS).
 * @type undefined
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */

/**
 * Get the value of a cookie with the given name.
 *
 * @example $.cookie('the_cookie');
 * @desc Get the value of a cookie.
 *
 * @param String name The name of the cookie.
 * @return The value of the cookie.
 * @type String
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */
jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};
},{}],42:[function(require,module,exports){
/*
 * 	Easy Tooltip 1.0 - jQuery plugin
 *	written by Alen Grakalic	
 *	http://cssglobe.com/post/4380/easy-tooltip--jquery-plugin
 *
 *	Copyright (c) 2009 Alen Grakalic (http://cssglobe.com)
 *	Dual licensed under the MIT (MIT-LICENSE.txt)
 *	and GPL (GPL-LICENSE.txt) licenses.
 *
 *	Built for jQuery library
 *	http://jquery.com
 *
 */
 
(function($) {

	$.fn.easyTooltip = function(options){
	  
		// default configuration properties
		var defaults = {	
			xOffset: 10,		
			yOffset: 25,
			tooltipId: "easyTooltip",
			clickRemove: false,
			content: "",
			useElement: ""
		}; 
			
		var options = $.extend(defaults, options);  
		var content;
				
		this.each(function() {  				
			var title = $(this).attr("title");				
			$(this).hover(function(e){											 							   
				content = (options.content != "") ? options.content : title;
				content = (options.useElement != "") ? $("#" + options.useElement).html() : content;
				$(this).attr("title","");									  				
				if (content != "" && content != undefined){			
					$("body").append("<div id='"+ options.tooltipId +"'>"+ content +"</div>");		
					$("#" + options.tooltipId)
						.css("position","absolute")
						.css("top",(e.pageY - options.yOffset) + "px")
						.css("left",(e.pageX + options.xOffset) + "px")						
						.css("display","none")
						.fadeIn("fast")
				}
			},
			function(){	
				$("#" + options.tooltipId).remove();
				$(this).attr("title",title);
			});	
			$(this).mousemove(function(e){
				$("#" + options.tooltipId)
					.css("top",(e.pageY - options.yOffset) + "px")
					.css("left",(e.pageX + options.xOffset) + "px")					
			});	
			if(options.clickRemove){
				$(this).mousedown(function(e){
					$("#" + options.tooltipId).remove();
					$(this).attr("title",title);
				});				
			}
		});
	  
	};

})(jQuery);

},{}],43:[function(require,module,exports){
/*! 
 * jquery.event.drag - v 2.0.0 
 * Copyright (c) 2010 Three Dub Media - http://threedubmedia.com
 * Open Source MIT License - http://threedubmedia.com/code/license
 */
;(function(f){f.fn.drag=function(b,a,d){var e=typeof b=="string"?b:"",k=f.isFunction(b)?b:f.isFunction(a)?a:null;if(e.indexOf("drag")!==0)e="drag"+e;d=(b==k?a:d)||{};return k?this.bind(e,d,k):this.trigger(e)};var i=f.event,h=i.special,c=h.drag={defaults:{which:1,distance:0,not:":input",handle:null,relative:false,drop:true,click:false},datakey:"dragdata",livekey:"livedrag",add:function(b){var a=f.data(this,c.datakey),d=b.data||{};a.related+=1;if(!a.live&&b.selector){a.live=true;i.add(this,"draginit."+ c.livekey,c.delegate)}f.each(c.defaults,function(e){if(d[e]!==undefined)a[e]=d[e]})},remove:function(){f.data(this,c.datakey).related-=1},setup:function(){if(!f.data(this,c.datakey)){var b=f.extend({related:0},c.defaults);f.data(this,c.datakey,b);i.add(this,"mousedown",c.init,b);this.attachEvent&&this.attachEvent("ondragstart",c.dontstart)}},teardown:function(){if(!f.data(this,c.datakey).related){f.removeData(this,c.datakey);i.remove(this,"mousedown",c.init);i.remove(this,"draginit",c.delegate);c.textselect(true); this.detachEvent&&this.detachEvent("ondragstart",c.dontstart)}},init:function(b){var a=b.data,d;if(!(a.which>0&&b.which!=a.which))if(!f(b.target).is(a.not))if(!(a.handle&&!f(b.target).closest(a.handle,b.currentTarget).length)){a.propagates=1;a.interactions=[c.interaction(this,a)];a.target=b.target;a.pageX=b.pageX;a.pageY=b.pageY;a.dragging=null;d=c.hijack(b,"draginit",a);if(a.propagates){if((d=c.flatten(d))&&d.length){a.interactions=[];f.each(d,function(){a.interactions.push(c.interaction(this,a))})}a.propagates= a.interactions.length;a.drop!==false&&h.drop&&h.drop.handler(b,a);c.textselect(false);i.add(document,"mousemove mouseup",c.handler,a);return false}}},interaction:function(b,a){return{drag:b,callback:new c.callback,droppable:[],offset:f(b)[a.relative?"position":"offset"]()||{top:0,left:0}}},handler:function(b){var a=b.data;switch(b.type){case !a.dragging&&"mousemove":if(Math.pow(b.pageX-a.pageX,2)+Math.pow(b.pageY-a.pageY,2)<Math.pow(a.distance,2))break;b.target=a.target;c.hijack(b,"dragstart",a); if(a.propagates)a.dragging=true;case "mousemove":if(a.dragging){c.hijack(b,"drag",a);if(a.propagates){a.drop!==false&&h.drop&&h.drop.handler(b,a);break}b.type="mouseup"}case "mouseup":i.remove(document,"mousemove mouseup",c.handler);if(a.dragging){a.drop!==false&&h.drop&&h.drop.handler(b,a);c.hijack(b,"dragend",a)}c.textselect(true);if(a.click===false&&a.dragging){jQuery.event.triggered=true;setTimeout(function(){jQuery.event.triggered=false},20);a.dragging=false}break}},delegate:function(b){var a= [],d,e=f.data(this,"events")||{};f.each(e.live||[],function(k,j){if(j.preType.indexOf("drag")===0)if(d=f(b.target).closest(j.selector,b.currentTarget)[0]){i.add(d,j.origType+"."+c.livekey,j.origHandler,j.data);f.inArray(d,a)<0&&a.push(d)}});if(!a.length)return false;return f(a).bind("dragend."+c.livekey,function(){i.remove(this,"."+c.livekey)})},hijack:function(b,a,d,e,k){if(d){var j={event:b.originalEvent,type:b.type},n=a.indexOf("drop")?"drag":"drop",l,o=e||0,g,m;e=!isNaN(e)?e:d.interactions.length; b.type=a;b.originalEvent=null;d.results=[];do if(g=d.interactions[o])if(!(a!=="dragend"&&g.cancelled)){m=c.properties(b,d,g);g.results=[];f(k||g[n]||d.droppable).each(function(q,p){l=(m.target=p)?i.handle.call(p,b,m):null;if(l===false){if(n=="drag"){g.cancelled=true;d.propagates-=1}if(a=="drop")g[n][q]=null}else if(a=="dropinit")g.droppable.push(c.element(l)||p);if(a=="dragstart")g.proxy=f(c.element(l)||g.drag)[0];g.results.push(l);delete b.result;if(a!=="dropinit")return l});d.results[o]=c.flatten(g.results); if(a=="dropinit")g.droppable=c.flatten(g.droppable);a=="dragstart"&&!g.cancelled&&m.update()}while(++o<e);b.type=j.type;b.originalEvent=j.event;return c.flatten(d.results)}},properties:function(b,a,d){var e=d.callback;e.drag=d.drag;e.proxy=d.proxy||d.drag;e.startX=a.pageX;e.startY=a.pageY;e.deltaX=b.pageX-a.pageX;e.deltaY=b.pageY-a.pageY;e.originalX=d.offset.left;e.originalY=d.offset.top;e.offsetX=b.pageX-(a.pageX-e.originalX);e.offsetY=b.pageY-(a.pageY-e.originalY);e.drop=c.flatten((d.drop||[]).slice()); e.available=c.flatten((d.droppable||[]).slice());return e},element:function(b){if(b&&(b.jquery||b.nodeType==1))return b},flatten:function(b){return f.map(b,function(a){return a&&a.jquery?f.makeArray(a):a&&a.length?c.flatten(a):a})},textselect:function(b){f(document)[b?"unbind":"bind"]("selectstart",c.dontstart).attr("unselectable",b?"off":"on").css("MozUserSelect",b?"":"none")},dontstart:function(){return false},callback:function(){}};c.callback.prototype={update:function(){h.drop&&this.available.length&& f.each(this.available,function(b){h.drop.locate(this,b)})}};h.draginit=h.dragstart=h.dragend=c})(jQuery);
},{}],44:[function(require,module,exports){
/**
 * @license
 * jQuery Tools @VERSION / Flashembed - New wave Flash embedding
 *
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 *
 * http://flowplayer.org/tools/toolbox/flashembed.html
 *
 * Since : March 2008
 * Date  : @DATE
 */
(function() {

        var IE = document.all,
                 URL = 'http://www.adobe.com/go/getflashplayer',
                 JQUERY = typeof jQuery == 'function',
                 RE = /(\d+)[^\d]+(\d+)[^\d]*(\d*)/,
                 GLOBAL_OPTS = {
                        // very common opts
                        width: '100%',
                        height: '100%',
                        id: "_" + ("" + Math.random()).slice(9),

                        // flashembed defaults
                        allowfullscreen: true,
                        allowscriptaccess: 'always',
                        quality: 'high',

                        // flashembed specific options
                        version: [3, 0],
                        onFail: null,
                        expressInstall: null,
                        w3c: false,
                        cachebusting: false
        };

        // version 9 bugfix: (http://blog.deconcept.com/2006/07/28/swfobject-143-released/)
        if (window.attachEvent) {
                window.attachEvent("onbeforeunload", function() {
                        __flash_unloadHandler = function() {};
                        __flash_savedUnloadHandler = function() {};
                });
        }

        // simple extend
        function extend(to, from) {
                if (from) {
                        for (key in from) {
                                if (from.hasOwnProperty(key)) {
                                        to[key] = from[key];
                                }
                        }
                }
                return to;
        }

        // used by asString method
        function map(arr, func) {
                var newArr = [];
                for (var i in arr) {
                        if (arr.hasOwnProperty(i)) {
                                newArr[i] = func(arr[i]);
                        }
                }
                return newArr;
        }

        window.flashembed = function(root, opts, conf) {

                // root must be found / loaded
                if (typeof root == 'string') {
                        root = document.getElementById(root.replace("#", ""));
                }

                // not found
                if (!root) { return; }

                if (typeof opts == 'string') {
                        opts = {src: opts};
                }

                return new Flash(root, extend(extend({}, GLOBAL_OPTS), opts), conf);
        };

        // flashembed "static" API
        var f = extend(window.flashembed, {

                conf: GLOBAL_OPTS,

                getVersion: function()  {
                        var ver;

                        try {
                                ver = navigator.plugins["Shockwave Flash"].description.slice(16);
                        } catch(e) {

                                try  {
                                        var fo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
                                        ver = fo && fo.GetVariable("$version");
                                } catch(err) {

                                }
                        }

                        ver = RE.exec(ver);
                        return ver ? [ver[1], ver[3]] : [0, 0];
                },

                asString: function(obj) {

                        if (obj === null || obj === undefined) { return null; }
                        var type = typeof obj;
                        if (type == 'object' && obj.push) { type = 'array'; }

                        switch (type){

                                case 'string':
                                        obj = obj.replace(new RegExp('(["\\\\])', 'g'), '\\$1');

                                        // flash does not handle %- characters well. transforms "50%" to "50pct" (a dirty hack, I admit)
                                        obj = obj.replace(/^\s?(\d+\.?\d+)%/, "$1pct");
                                        return '"' +obj+ '"';

                                case 'array':
                                        return '['+ map(obj, function(el) {
                                                return f.asString(el);
                                        }).join(',') +']';

                                case 'function':
                                        return '"function()"';

                                case 'object':
                                        var str = [];
                                        for (var prop in obj) {
                                                if (obj.hasOwnProperty(prop)) {
                                                        str.push('"'+prop+'":'+ f.asString(obj[prop]));
                                                }
                                        }
                                        return '{'+str.join(',')+'}';
                        }

                        // replace ' --> "  and remove spaces
                        return String(obj).replace(/\s/g, " ").replace(/\'/g, "\"");
                },

                getHTML: function(opts, conf) {

                        opts = extend({}, opts);

                        /******* OBJECT tag and it's attributes *******/
                        var html = '<object width="' + opts.width +
                                '" height="' + opts.height +
                                '" id="' + opts.id +
                                '" name="' + opts.id + '"';

                        if (opts.cachebusting) {
                                opts.src += ((opts.src.indexOf("?") != -1 ? "&" : "?") + Math.random());
                        }

                        if (opts.w3c || !IE) {
                                html += ' data="' +opts.src+ '" type="application/x-shockwave-flash"';
                        } else {
                                html += ' classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"';
                        }

                        html += '>';

                        /******* nested PARAM tags *******/
                        if (opts.w3c || IE) {
                                html += '<param name="movie" value="' +opts.src+ '" />';
                        }

                        // not allowed params
                        opts.width = opts.height = opts.id = opts.w3c = opts.src = null;
                        opts.onFail = opts.version = opts.expressInstall = null;

                        for (var key in opts) {
                                if (opts[key]) {
                                        html += '<param name="'+ key +'" value="'+ opts[key] +'" />';
                                }
                        }

                        /******* FLASHVARS *******/
                        var vars = "";

                        if (conf) {
                                for (var k in conf) {
                                        if (conf[k]) {
                                                var val = conf[k];
                                                vars += k +'='+ (/function|object/.test(typeof val) ? f.asString(val) : val) + '&';
                                        }
                                }
                                vars = vars.slice(0, -1);
                                html += '<param name="flashvars" value=\'' + vars + '\' />';
                        }

                        html += "</object>";

                        return html;
                },

                isSupported: function(ver) {
                        return VERSION[0] > ver[0] || VERSION[0] == ver[0] && VERSION[1] >= ver[1];
                }

        });

        var VERSION = f.getVersion();

        function Flash(root, opts, conf) {

                // version is ok
                if (f.isSupported(opts.version)) {
                        root.innerHTML = f.getHTML(opts, conf);

                // express install
                } else if (opts.expressInstall && f.isSupported([6, 65])) {
                        root.innerHTML = f.getHTML(extend(opts, {src: opts.expressInstall}), {
                                MMredirectURL: location.href,
                                MMplayerType: 'PlugIn',
                                MMdoctitle: document.title
                        });

                } else {

                        // fail #2.1 custom content inside container
                        if (!root.innerHTML.replace(/\s/g, '')) {
                                root.innerHTML =
                                        "<h2>Flash version " + opts.version + " or greater is required</h2>" +
                                        "<h3>" +
                                                (VERSION[0] > 0 ? "Your version is " + VERSION : "You have no flash plugin installed") +
                                        "</h3>" +

                                        (root.tagName == 'A' ? "<p>Click here to download latest version</p>" :
                                                "<p>Download latest version from <a href='" + URL + "'>here</a></p>");

                                if (root.tagName == 'A') {
                                        root.onclick = function() {
                                                location.href = URL;
                                        };
                                }
                        }

                        // onFail
                        if (opts.onFail) {
                                var ret = opts.onFail.call(this);
                                if (typeof ret == 'string') { root.innerHTML = ret; }
                        }
                }

                // http://flowplayer.org/forum/8/18186#post-18593
                if (IE) {
                        window[opts.id] = document.getElementById(opts.id);
                }

                // API methods for callback
                extend(this, {

                        getRoot: function() {
                                return root;
                        },

                        getOptions: function() {
                                return opts;
                        },


                        getConf: function() {
                                return conf;
                        },

                        getApi: function() {
                                return root.firstChild;
                        }

                });
        }

        // setup jquery support
        if (JQUERY) {

                // tools version number
                jQuery.tools = jQuery.tools || {version: '@VERSION'};

                jQuery.tools.flashembed = {
                        conf: GLOBAL_OPTS
                };

                jQuery.fn.flashembed = function(opts, conf) {
                        return this.each(function() {
                                $(this).data("flashembed", flashembed(this, opts, conf));
                        });
                };
        }

})();
},{}],45:[function(require,module,exports){

(function($){$.extend({tablesorter:new
function(){var parsers=[],widgets=[];this.defaults={cssHeader:"header",cssAsc:"headerSortUp",cssDesc:"headerSortDown",cssChildRow:"expand-child",sortInitialOrder:"asc",sortMultiSortKey:"shiftKey",sortForce:null,sortAppend:null,sortLocaleCompare:true,textExtraction:"simple",parsers:{},widgets:[],widgetZebra:{css:["even","odd"]},headers:{},widthFixed:false,cancelSelection:true,sortList:[],headerList:[],dateFormat:"us",decimal:'/\.|\,/g',onRenderHeader:null,selectorHeaders:'thead th',debug:false};function benchmark(s,d){log(s+","+(new Date().getTime()-d.getTime())+"ms");}this.benchmark=benchmark;function log(s){if(typeof console!="undefined"&&typeof console.debug!="undefined"){console.log(s);}else{alert(s);}}function buildParserCache(table,$headers){if(table.config.debug){var parsersDebug="";}if(table.tBodies.length==0)return;var rows=table.tBodies[0].rows;if(rows[0]){var list=[],cells=rows[0].cells,l=cells.length;for(var i=0;i<l;i++){var p=false;if($.metadata&&($($headers[i]).metadata()&&$($headers[i]).metadata().sorter)){p=getParserById($($headers[i]).metadata().sorter);}else if((table.config.headers[i]&&table.config.headers[i].sorter)){p=getParserById(table.config.headers[i].sorter);}if(!p){p=detectParserForColumn(table,rows,-1,i);}if(table.config.debug){parsersDebug+="column:"+i+" parser:"+p.id+"\n";}list.push(p);}}if(table.config.debug){log(parsersDebug);}return list;};function detectParserForColumn(table,rows,rowIndex,cellIndex){var l=parsers.length,node=false,nodeValue=false,keepLooking=true;while(nodeValue==''&&keepLooking){rowIndex++;if(rows[rowIndex]){node=getNodeFromRowAndCellIndex(rows,rowIndex,cellIndex);nodeValue=trimAndGetNodeText(table.config,node);if(table.config.debug){log('Checking if value was empty on row:'+rowIndex);}}else{keepLooking=false;}}for(var i=1;i<l;i++){if(parsers[i].is(nodeValue,table,node)){return parsers[i];}}return parsers[0];}function getNodeFromRowAndCellIndex(rows,rowIndex,cellIndex){return rows[rowIndex].cells[cellIndex];}function trimAndGetNodeText(config,node){return $.trim(getElementText(config,node));}function getParserById(name){var l=parsers.length;for(var i=0;i<l;i++){if(parsers[i].id.toLowerCase()==name.toLowerCase()){return parsers[i];}}return false;}function buildCache(table){if(table.config.debug){var cacheTime=new Date();}var totalRows=(table.tBodies[0]&&table.tBodies[0].rows.length)||0,totalCells=(table.tBodies[0].rows[0]&&table.tBodies[0].rows[0].cells.length)||0,parsers=table.config.parsers,cache={row:[],normalized:[]};for(var i=0;i<totalRows;++i){var c=$(table.tBodies[0].rows[i]),cols=[];if(c.hasClass(table.config.cssChildRow)){cache.row[cache.row.length-1]=cache.row[cache.row.length-1].add(c);continue;}cache.row.push(c);for(var j=0;j<totalCells;++j){cols.push(parsers[j].format(getElementText(table.config,c[0].cells[j]),table,c[0].cells[j]));}cols.push(cache.normalized.length);cache.normalized.push(cols);cols=null;};if(table.config.debug){benchmark("Building cache for "+totalRows+" rows:",cacheTime);}return cache;};function getElementText(config,node){var text="";if(!node)return"";if(!config.supportsTextContent)config.supportsTextContent=node.textContent||false;if(config.textExtraction=="simple"){if(config.supportsTextContent){text=node.textContent;}else{if(node.childNodes[0]&&node.childNodes[0].hasChildNodes()){text=node.childNodes[0].innerHTML;}else{text=node.innerHTML;}}}else{if(typeof(config.textExtraction)=="function"){text=config.textExtraction(node);}else{text=$(node).text();}}return text;}function appendToTable(table,cache){if(table.config.debug){var appendTime=new Date()}var c=cache,r=c.row,n=c.normalized,totalRows=n.length,checkCell=(n[0].length-1),tableBody=$(table.tBodies[0]),rows=[];for(var i=0;i<totalRows;i++){var pos=n[i][checkCell];rows.push(r[pos]);if(!table.config.appender){var l=r[pos].length;for(var j=0;j<l;j++){tableBody[0].appendChild(r[pos][j]);}}}if(table.config.appender){table.config.appender(table,rows);}rows=null;if(table.config.debug){benchmark("Rebuilt table:",appendTime);}applyWidget(table);setTimeout(function(){$(table).trigger("sortEnd");},0);};function buildHeaders(table){if(table.config.debug){var time=new Date();}var meta=($.metadata)?true:false;var header_index=computeTableHeaderCellIndexes(table);$tableHeaders=$(table.config.selectorHeaders,table).each(function(index){this.column=header_index[this.parentNode.rowIndex+"-"+this.cellIndex];this.order=formatSortingOrder(table.config.sortInitialOrder);this.count=this.order;if(checkHeaderMetadata(this)||checkHeaderOptions(table,index))this.sortDisabled=true;if(checkHeaderOptionsSortingLocked(table,index))this.order=this.lockedOrder=checkHeaderOptionsSortingLocked(table,index);if(!this.sortDisabled){var $th=$(this).addClass(table.config.cssHeader);if(table.config.onRenderHeader)table.config.onRenderHeader.apply($th);}table.config.headerList[index]=this;});if(table.config.debug){benchmark("Built headers:",time);log($tableHeaders);}return $tableHeaders;};function computeTableHeaderCellIndexes(t){var matrix=[];var lookup={};var thead=t.getElementsByTagName('THEAD')[0];var trs=thead.getElementsByTagName('TR');for(var i=0;i<trs.length;i++){var cells=trs[i].cells;for(var j=0;j<cells.length;j++){var c=cells[j];var rowIndex=c.parentNode.rowIndex;var cellId=rowIndex+"-"+c.cellIndex;var rowSpan=c.rowSpan||1;var colSpan=c.colSpan||1
var firstAvailCol;if(typeof(matrix[rowIndex])=="undefined"){matrix[rowIndex]=[];}for(var k=0;k<matrix[rowIndex].length+1;k++){if(typeof(matrix[rowIndex][k])=="undefined"){firstAvailCol=k;break;}}lookup[cellId]=firstAvailCol;for(var k=rowIndex;k<rowIndex+rowSpan;k++){if(typeof(matrix[k])=="undefined"){matrix[k]=[];}var matrixrow=matrix[k];for(var l=firstAvailCol;l<firstAvailCol+colSpan;l++){matrixrow[l]="x";}}}}return lookup;}function checkCellColSpan(table,rows,row){var arr=[],r=table.tHead.rows,c=r[row].cells;for(var i=0;i<c.length;i++){var cell=c[i];if(cell.colSpan>1){arr=arr.concat(checkCellColSpan(table,headerArr,row++));}else{if(table.tHead.length==1||(cell.rowSpan>1||!r[row+1])){arr.push(cell);}}}return arr;};function checkHeaderMetadata(cell){if(($.metadata)&&($(cell).metadata().sorter===false)){return true;};return false;}function checkHeaderOptions(table,i){if((table.config.headers[i])&&(table.config.headers[i].sorter===false)){return true;};return false;}function checkHeaderOptionsSortingLocked(table,i){if((table.config.headers[i])&&(table.config.headers[i].lockedOrder))return table.config.headers[i].lockedOrder;return false;}function applyWidget(table){var c=table.config.widgets;var l=c.length;for(var i=0;i<l;i++){getWidgetById(c[i]).format(table);}}function getWidgetById(name){var l=widgets.length;for(var i=0;i<l;i++){if(widgets[i].id.toLowerCase()==name.toLowerCase()){return widgets[i];}}};function formatSortingOrder(v){if(typeof(v)!="Number"){return(v.toLowerCase()=="desc")?1:0;}else{return(v==1)?1:0;}}function isValueInArray(v,a){var l=a.length;for(var i=0;i<l;i++){if(a[i][0]==v){return true;}}return false;}function setHeadersCss(table,$headers,list,css){$headers.removeClass(css[0]).removeClass(css[1]);var h=[];$headers.each(function(offset){if(!this.sortDisabled){h[this.column]=$(this);}});var l=list.length;for(var i=0;i<l;i++){h[list[i][0]].addClass(css[list[i][1]]);}}function fixColumnWidth(table,$headers){var c=table.config;if(c.widthFixed){var colgroup=$('<colgroup>');$("tr:first td",table.tBodies[0]).each(function(){colgroup.append($('<col>').css('width',$(this).width()));});$(table).prepend(colgroup);};}function updateHeaderSortCount(table,sortList){var c=table.config,l=sortList.length;for(var i=0;i<l;i++){var s=sortList[i],o=c.headerList[s[0]];o.count=s[1];o.count++;}}function multisort(table,sortList,cache){if(table.config.debug){var sortTime=new Date();}var dynamicExp="var sortWrapper = function(a,b) {",l=sortList.length;for(var i=0;i<l;i++){var c=sortList[i][0];var order=sortList[i][1];var s=(table.config.parsers[c].type=="text")?((order==0)?makeSortFunction("text","asc",c):makeSortFunction("text","desc",c)):((order==0)?makeSortFunction("numeric","asc",c):makeSortFunction("numeric","desc",c));var e="e"+i;dynamicExp+="var "+e+" = "+s;dynamicExp+="if("+e+") { return "+e+"; } ";dynamicExp+="else { ";}var orgOrderCol=cache.normalized[0].length-1;dynamicExp+="return a["+orgOrderCol+"]-b["+orgOrderCol+"];";for(var i=0;i<l;i++){dynamicExp+="}; ";}dynamicExp+="return 0; ";dynamicExp+="}; ";if(table.config.debug){benchmark("Evaling expression:"+dynamicExp,new Date());}eval(dynamicExp);cache.normalized.sort(sortWrapper);if(table.config.debug){benchmark("Sorting on "+sortList.toString()+" and dir "+order+" time:",sortTime);}return cache;};function makeSortFunction(type,direction,index){var a="a["+index+"]",b="b["+index+"]";if(type=='text'&&direction=='asc'){return"("+a+" == "+b+" ? 0 : ("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : ("+a+" < "+b+") ? -1 : 1 )));";}else if(type=='text'&&direction=='desc'){return"("+a+" == "+b+" ? 0 : ("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : ("+b+" < "+a+") ? -1 : 1 )));";}else if(type=='numeric'&&direction=='asc'){return"("+a+" === null && "+b+" === null) ? 0 :("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : "+a+" - "+b+"));";}else if(type=='numeric'&&direction=='desc'){return"("+a+" === null && "+b+" === null) ? 0 :("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : "+b+" - "+a+"));";}};function makeSortText(i){return"((a["+i+"] < b["+i+"]) ? -1 : ((a["+i+"] > b["+i+"]) ? 1 : 0));";};function makeSortTextDesc(i){return"((b["+i+"] < a["+i+"]) ? -1 : ((b["+i+"] > a["+i+"]) ? 1 : 0));";};function makeSortNumeric(i){return"a["+i+"]-b["+i+"];";};function makeSortNumericDesc(i){return"b["+i+"]-a["+i+"];";};function sortText(a,b){if(table.config.sortLocaleCompare)return a.localeCompare(b);return((a<b)?-1:((a>b)?1:0));};function sortTextDesc(a,b){if(table.config.sortLocaleCompare)return b.localeCompare(a);return((b<a)?-1:((b>a)?1:0));};function sortNumeric(a,b){return a-b;};function sortNumericDesc(a,b){return b-a;};function getCachedSortType(parsers,i){return parsers[i].type;};this.construct=function(settings){return this.each(function(){if(!this.tHead||!this.tBodies)return;var $this,$document,$headers,cache,config,shiftDown=0,sortOrder;this.config={};config=$.extend(this.config,$.tablesorter.defaults,settings);$this=$(this);$.data(this,"tablesorter",config);$headers=buildHeaders(this);this.config.parsers=buildParserCache(this,$headers);cache=buildCache(this);var sortCSS=[config.cssDesc,config.cssAsc];fixColumnWidth(this);$headers.click(function(e){var totalRows=($this[0].tBodies[0]&&$this[0].tBodies[0].rows.length)||0;if(!this.sortDisabled&&totalRows>0){$this.trigger("sortStart");var $cell=$(this);var i=this.column;this.order=this.count++%2;if(this.lockedOrder)this.order=this.lockedOrder;if(!e[config.sortMultiSortKey]){config.sortList=[];if(config.sortForce!=null){var a=config.sortForce;for(var j=0;j<a.length;j++){if(a[j][0]!=i){config.sortList.push(a[j]);}}}config.sortList.push([i,this.order]);}else{if(isValueInArray(i,config.sortList)){for(var j=0;j<config.sortList.length;j++){var s=config.sortList[j],o=config.headerList[s[0]];if(s[0]==i){o.count=s[1];o.count++;s[1]=o.count%2;}}}else{config.sortList.push([i,this.order]);}};setTimeout(function(){setHeadersCss($this[0],$headers,config.sortList,sortCSS);appendToTable($this[0],multisort($this[0],config.sortList,cache));},1);return false;}}).mousedown(function(){if(config.cancelSelection){this.onselectstart=function(){return false};return false;}});$this.bind("update",function(){var me=this;setTimeout(function(){me.config.parsers=buildParserCache(me,$headers);cache=buildCache(me);},1);}).bind("updateCell",function(e,cell){var config=this.config;var pos=[(cell.parentNode.rowIndex-1),cell.cellIndex];cache.normalized[pos[0]][pos[1]]=config.parsers[pos[1]].format(getElementText(config,cell),cell);}).bind("sorton",function(e,list){$(this).trigger("sortStart");config.sortList=list;var sortList=config.sortList;updateHeaderSortCount(this,sortList);setHeadersCss(this,$headers,sortList,sortCSS);appendToTable(this,multisort(this,sortList,cache));}).bind("appendCache",function(){appendToTable(this,cache);}).bind("applyWidgetId",function(e,id){getWidgetById(id).format(this);}).bind("applyWidgets",function(){applyWidget(this);});if($.metadata&&($(this).metadata()&&$(this).metadata().sortlist)){config.sortList=$(this).metadata().sortlist;}if(config.sortList.length>0){$this.trigger("sorton",[config.sortList]);}applyWidget(this);});};this.addParser=function(parser){var l=parsers.length,a=true;for(var i=0;i<l;i++){if(parsers[i].id.toLowerCase()==parser.id.toLowerCase()){a=false;}}if(a){parsers.push(parser);};};this.addWidget=function(widget){widgets.push(widget);};this.formatFloat=function(s){var i=parseFloat(s);return(isNaN(i))?0:i;};this.formatInt=function(s){var i=parseInt(s);return(isNaN(i))?0:i;};this.isDigit=function(s,config){return/^[-+]?\d*$/.test($.trim(s.replace(/[,.']/g,'')));};this.clearTableBody=function(table){if($.browser.msie){function empty(){while(this.firstChild)this.removeChild(this.firstChild);}empty.apply(table.tBodies[0]);}else{table.tBodies[0].innerHTML="";}};}});$.fn.extend({tablesorter:$.tablesorter.construct});var ts=$.tablesorter;ts.addParser({id:"text",is:function(s){return true;},format:function(s){return $.trim(s.toLocaleLowerCase());},type:"text"});ts.addParser({id:"digit",is:function(s,table){var c=table.config;return $.tablesorter.isDigit(s,c);},format:function(s){return $.tablesorter.formatFloat(s);},type:"numeric"});ts.addParser({id:"currency",is:function(s){return/^[£$€?.]/.test(s);},format:function(s){return $.tablesorter.formatFloat(s.replace(new RegExp(/[£$€]/g),""));},type:"numeric"});ts.addParser({id:"ipAddress",is:function(s){return/^\d{2,3}[\.]\d{2,3}[\.]\d{2,3}[\.]\d{2,3}$/.test(s);},format:function(s){var a=s.split("."),r="",l=a.length;for(var i=0;i<l;i++){var item=a[i];if(item.length==2){r+="0"+item;}else{r+=item;}}return $.tablesorter.formatFloat(r);},type:"numeric"});ts.addParser({id:"url",is:function(s){return/^(https?|ftp|file):\/\/$/.test(s);},format:function(s){return jQuery.trim(s.replace(new RegExp(/(https?|ftp|file):\/\//),''));},type:"text"});ts.addParser({id:"isoDate",is:function(s){return/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(s);},format:function(s){return $.tablesorter.formatFloat((s!="")?new Date(s.replace(new RegExp(/-/g),"/")).getTime():"0");},type:"numeric"});ts.addParser({id:"percent",is:function(s){return/\%$/.test($.trim(s));},format:function(s){return $.tablesorter.formatFloat(s.replace(new RegExp(/%/g),""));},type:"numeric"});ts.addParser({id:"usLongDate",is:function(s){return s.match(new RegExp(/^[A-Za-z]{3,10}\.? [0-9]{1,2}, ([0-9]{4}|'?[0-9]{2}) (([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(AM|PM)))$/));},format:function(s){return $.tablesorter.formatFloat(new Date(s).getTime());},type:"numeric"});ts.addParser({id:"shortDate",is:function(s){return/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(s);},format:function(s,table){var c=table.config;s=s.replace(/\-/g,"/");if(c.dateFormat=="us"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$1/$2");}else if(c.dateFormat=="uk"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$2/$1");}else if(c.dateFormat=="dd/mm/yy"||c.dateFormat=="dd-mm-yy"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/,"$1/$2/$3");}return $.tablesorter.formatFloat(new Date(s).getTime());},type:"numeric"});ts.addParser({id:"time",is:function(s){return/^(([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(am|pm)))$/.test(s);},format:function(s){return $.tablesorter.formatFloat(new Date("2000/01/01 "+s).getTime());},type:"numeric"});ts.addParser({id:"metadata",is:function(s){return false;},format:function(s,table,cell){var c=table.config,p=(!c.parserMetadataName)?'sortValue':c.parserMetadataName;return $(cell).metadata()[p];},type:"numeric"});ts.addWidget({id:"zebra",format:function(table){if(table.config.debug){var time=new Date();}var $tr,row=-1,odd;$("tr:visible",table.tBodies[0]).each(function(i){$tr=$(this);if(!$tr.hasClass(table.config.cssChildRow))row++;odd=(row%2==0);$tr.removeClass(table.config.widgetZebra.css[odd?0:1]).addClass(table.config.widgetZebra.css[odd?1:0])});if(table.config.debug){$.tablesorter.benchmark("Applying Zebra widget",time);}}});})(jQuery);
},{}],46:[function(require,module,exports){
jQuery.url=function(){var segments={};var parsed={};var options={url:window.location,strictMode:false,key:["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],q:{name:"queryKey",parser:/(?:^|&)([^&=]*)=?([^&]*)/g},parser:{strict:/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,loose:/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/}};var parseUri=function(){str=decodeURI(options.url);var m=options.parser[options.strictMode?"strict":"loose"].exec(str);var uri={};var i=14;while(i--){uri[options.key[i]]=m[i]||""}uri[options.q.name]={};uri[options.key[12]].replace(options.q.parser,function($0,$1,$2){if($1){uri[options.q.name][$1]=$2}});return uri};var key=function(key){if(!parsed.length){setUp()}if(key=="base"){if(parsed.port!==null&&parsed.port!==""){return parsed.protocol+"://"+parsed.host+":"+parsed.port+"/"}else{return parsed.protocol+"://"+parsed.host+"/"}}return(parsed[key]==="")?null:parsed[key]};var param=function(item){if(!parsed.length){setUp()}return(parsed.queryKey[item]===null)?null:parsed.queryKey[item]};var setUp=function(){parsed=parseUri();getSegments()};var getSegments=function(){var p=parsed.path;segments=[];segments=parsed.path.length==1?{}:(p.charAt(p.length-1)=="/"?p.substring(1,p.length-1):path=p.substring(1)).split("/")};return{setMode:function(mode){strictMode=mode=="strict"?true:false;return this},setUrl:function(newUri){options.url=newUri===undefined?window.location:newUri;setUp();return this},segment:function(pos){if(!parsed.length){setUp()}if(pos===undefined){return segments.length}return(segments[pos]===""||segments[pos]===undefined)?null:segments[pos]},attr:key,param:param}}();
},{}],47:[function(require,module,exports){
// ┌─────────────────────────────────────────────────────────────────────┐ \\
// │ Raphaël 2.0 - JavaScript Vector Library                             │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
// └─────────────────────────────────────────────────────────────────────┘ \\
(function(a){var b="0.3.2",c="hasOwnProperty",d=/[\.\/]/,e="*",f=function(){},g=function(a,b){return a-b},h,i,j={n:{}},k=function(a,b){var c=j,d=i,e=Array.prototype.slice.call(arguments,2),f=k.listeners(a),l=0,m=!1,n,o=[],p={},q=[],r=[];h=a,i=0;for(var s=0,t=f.length;s<t;s++)"zIndex"in f[s]&&(o.push(f[s].zIndex),f[s].zIndex<0&&(p[f[s].zIndex]=f[s]));o.sort(g);while(o[l]<0){n=p[o[l++]],q.push(n.apply(b,e));if(i){i=d;return q}}for(s=0;s<t;s++){n=f[s];if("zIndex"in n)if(n.zIndex==o[l]){q.push(n.apply(b,e));if(i){i=d;return q}do{l++,n=p[o[l]],n&&q.push(n.apply(b,e));if(i){i=d;return q}}while(n)}else p[n.zIndex]=n;else{q.push(n.apply(b,e));if(i){i=d;return q}}}i=d;return q.length?q:null};k.listeners=function(a){var b=a.split(d),c=j,f,g,h,i,k,l,m,n,o=[c],p=[];for(i=0,k=b.length;i<k;i++){n=[];for(l=0,m=o.length;l<m;l++){c=o[l].n,g=[c[b[i]],c[e]],h=2;while(h--)f=g[h],f&&(n.push(f),p=p.concat(f.f||[]))}o=n}return p},k.on=function(a,b){var c=a.split(d),e=j;for(var g=0,h=c.length;g<h;g++)e=e.n,!e[c[g]]&&(e[c[g]]={n:{}}),e=e[c[g]];e.f=e.f||[];for(g=0,h=e.f.length;g<h;g++)if(e.f[g]==b)return f;e.f.push(b);return function(a){+a==+a&&(b.zIndex=+a)}},k.stop=function(){i=1},k.nt=function(a){if(a)return(new RegExp("(?:\\.|\\/|^)"+a+"(?:\\.|\\/|$)")).test(h);return h},k.unbind=function(a,b){var f=a.split(d),g,h,i,k=[j];for(var l=0,m=f.length;l<m;l++)for(var n=0;n<k.length;n+=i.length-2){i=[n,1],g=k[n].n;if(f[l]!=e)g[f[l]]&&i.push(g[f[l]]);else for(h in g)g[c](h)&&i.push(g[h]);k.splice.apply(k,i)}for(l=0,m=k.length;l<m;l++){g=k[l];while(g.n){if(b){if(g.f){for(n=0,jj=g.f.length;n<jj;n++)if(g.f[n]==b){g.f.splice(n,1);break}!g.f.length&&delete g.f}for(h in g.n)if(g.n[c](h)&&g.n[h].f){var o=g.n[h].f;for(n=0,jj=o.length;n<jj;n++)if(o[n]==b){o.splice(n,1);break}!o.length&&delete g.n[h].f}}else{delete g.f;for(h in g.n)g.n[c](h)&&g.n[h].f&&delete g.n[h].f}g=g.n}}},k.version=b,k.toString=function(){return"You are running Eve "+b},typeof module!="undefined"&&module.exports?module.exports=k:a.eve=k})(this),function(){function cr(b,d,e,f,h,i){e=Q(e);var j,k,l,m=[],o,p,q,t=b.ms,u={},v={},w={};if(f)for(y=0,z=cl.length;y<z;y++){var x=cl[y];if(x.el.id==d.id&&x.anim==b){x.percent!=e?(cl.splice(y,1),l=1):k=x,d.attr(x.totalOrigin);break}}else f=+v;for(var y=0,z=b.percents.length;y<z;y++){if(b.percents[y]==e||b.percents[y]>f*b.top){e=b.percents[y],p=b.percents[y-1]||0,t=t/b.top*(e-p),o=b.percents[y+1],j=b.anim[e];break}f&&d.attr(b.anim[b.percents[y]])}if(!!j){if(!k){for(attr in j)if(j[g](attr))if(U[g](attr)||d.paper.customAttributes[g](attr)){u[attr]=d.attr(attr),u[attr]==null&&(u[attr]=T[attr]),v[attr]=j[attr];switch(U[attr]){case C:w[attr]=(v[attr]-u[attr])/t;break;case"colour":u[attr]=a.getRGB(u[attr]);var A=a.getRGB(v[attr]);w[attr]={r:(A.r-u[attr].r)/t,g:(A.g-u[attr].g)/t,b:(A.b-u[attr].b)/t};break;case"path":var B=bG(u[attr],v[attr]),D=B[1];u[attr]=B[0],w[attr]=[];for(y=0,z=u[attr].length;y<z;y++){w[attr][y]=[0];for(var E=1,F=u[attr][y].length;E<F;E++)w[attr][y][E]=(D[y][E]-u[attr][y][E])/t}break;case"transform":var G=d._,H=bQ(G[attr],v[attr]);if(H){u[attr]=H.from,v[attr]=H.to,w[attr]=[],w[attr].real=!0;for(y=0,z=u[attr].length;y<z;y++){w[attr][y]=[u[attr][y][0]];for(E=1,F=u[attr][y].length;E<F;E++)w[attr][y][E]=(v[attr][y][E]-u[attr][y][E])/t}}else{var I=d.matrix||new bR,J={_:{transform:G.transform},getBBox:function(){return d.getBBox(1)}};u[attr]=[I.a,I.b,I.c,I.d,I.e,I.f],bO(J,v[attr]),v[attr]=J._.transform,w[attr]=[(J.matrix.a-I.a)/t,(J.matrix.b-I.b)/t,(J.matrix.c-I.c)/t,(J.matrix.d-I.d)/t,(J.matrix.e-I.e)/t,(J.matrix.e-I.f)/t]}break;case"csv":var K=r(j[attr])[s](c),L=r(u[attr])[s](c);if(attr=="clip-rect"){u[attr]=L,w[attr]=[],y=L.length;while(y--)w[attr][y]=(K[y]-u[attr][y])/t}v[attr]=K;break;default:K=[][n](j[attr]),L=[][n](u[attr]),w[attr]=[],y=d.paper.customAttributes[attr].length;while(y--)w[attr][y]=((K[y]||0)-(L[y]||0))/t}}var M=j.easing,O=a.easing_formulas[M];if(!O){O=r(M).match(N);if(O&&O.length==5){var P=O;O=function(a){return cp(a,+P[1],+P[2],+P[3],+P[4],t)}}else O=be}q=j.start||b.start||+(new Date),x={anim:b,percent:e,timestamp:q,start:q+(b.del||0),status:0,initstatus:f||0,stop:!1,ms:t,easing:O,from:u,diff:w,to:v,el:d,callback:j.callback,prev:p,next:o,repeat:i||b.times,origin:d.attr(),totalOrigin:h},cl.push(x);if(f&&!k&&!l){x.stop=!0,x.start=new Date-t*f;if(cl.length==1)return cn()}l&&(x.start=new Date-x.ms*f),cl.length==1&&cm(cn)}else k.initstatus=f,k.start=new Date-k.ms*f;eve("anim.start."+d.id,d,b)}}function cq(a,b){var c=[],d={};this.ms=b,this.times=1;if(a){for(var e in a)a[g](e)&&(d[Q(e)]=a[e],c.push(Q(e)));c.sort(bc)}this.anim=d,this.top=c[c.length-1],this.percents=c}function cp(a,b,c,d,e,f){function o(a,b){var c,d,e,f,j,k;for(e=a,k=0;k<8;k++){f=m(e)-a;if(z(f)<b)return e;j=(3*i*e+2*h)*e+g;if(z(j)<1e-6)break;e=e-f/j}c=0,d=1,e=a;if(e<c)return c;if(e>d)return d;while(c<d){f=m(e);if(z(f-a)<b)return e;a>f?c=e:d=e,e=(d-c)/2+c}return e}function n(a,b){var c=o(a,b);return((l*c+k)*c+j)*c}function m(a){return((i*a+h)*a+g)*a}var g=3*b,h=3*(d-b)-g,i=1-g-h,j=3*c,k=3*(e-c)-j,l=1-j-k;return n(a,1/(200*f))}function cd(){return this.x+q+this.y+q+this.width+" × "+this.height}function cc(){return this.x+q+this.y}function bR(a,b,c,d,e,f){a!=null?(this.a=+a,this.b=+b,this.c=+c,this.d=+d,this.e=+e,this.f=+f):(this.a=1,this.b=0,this.c=0,this.d=1,this.e=0,this.f=0)}function bw(a){var b=[];for(var c=0,d=a.length;d-2>c;c+=2){var e=[{x:+a[c],y:+a[c+1]},{x:+a[c],y:+a[c+1]},{x:+a[c+2],y:+a[c+3]},{x:+a[c+4],y:+a[c+5]}];d-4==c?(e[0]={x:+a[c-2],y:+a[c-1]},e[3]=e[2]):c&&(e[0]={x:+a[c-2],y:+a[c-1]}),b.push(["C",(-e[0].x+6*e[1].x+e[2].x)/6,(-e[0].y+6*e[1].y+e[2].y)/6,(e[1].x+6*e[2].x-e[3].x)/6,(e[1].y+6*e[2].y-e[3].y)/6,e[2].x,e[2].y])}return b}function bv(){return this.hex}function bt(a,b,c){function d(){var e=Array.prototype.slice.call(arguments,0),f=e.join("␀"),h=d.cache=d.cache||{},i=d.count=d.count||[];if(h[g](f)){bs(i,f);return c?c(h[f]):h[f]}i.length>=1e3&&delete h[i.shift()],i.push(f),h[f]=a[m](b,e);return c?c(h[f]):h[f]}return d}function bs(a,b){for(var c=0,d=a.length;c<d;c++)if(a[c]===b)return a.push(a.splice(c,1)[0])}function a(c){if(a.is(c,"function"))return b?c():eve.on("DOMload",c);if(a.is(c,E)){var e=c,f=a._engine.create[m](a,e.splice(0,3+a.is(e[0],C))),h=f.set(),i=0,j=e.length,k;for(;i<j;i++)k=e[i]||{},d[g](k.type)&&h.push(f[k.type]().attr(k));return h}var l=Array.prototype.slice.call(arguments,0);if(a.is(l[l.length-1],"function")){var n=l.pop();return b?n.call(a._engine.create[m](a,l)):eve.on("DOMload",function(){n.call(a._engine.create[m](a,l))})}return a._engine.create[m](a,arguments)}a.version="2.0.0",a.eve=eve;var b,c=/[, ]+/,d={circle:1,rect:1,path:1,ellipse:1,text:1,image:1},e=/\{(\d+)\}/g,f="prototype",g="hasOwnProperty",h={doc:document,win:window},i={was:Object.prototype[g].call(h.win,"Raphael"),is:h.win.Raphael},j=function(){this.ca=this.customAttributes={}},k,l="appendChild",m="apply",n="concat",o="createTouch"in h.doc,p="",q=" ",r=String,s="split",t="click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend touchcancel"[s](q),u={mousedown:"touchstart",mousemove:"touchmove",mouseup:"touchend"},v=r.prototype.toLowerCase,w=Math,x=w.max,y=w.min,z=w.abs,A=w.pow,B=w.PI,C="number",D="string",E="array",F="toString",G="fill",H=Object.prototype.toString,I={},J="push",K=a._ISURL=/^url\(['"]?([^\)]+?)['"]?\)$/i,L=/^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i,M={NaN:1,Infinity:1,"-Infinity":1},N=/^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,O=w.round,P="setAttribute",Q=parseFloat,R=parseInt,S=r.prototype.toUpperCase,T=a._availableAttrs={"arrow-end":"none","arrow-start":"none",blur:0,"clip-rect":"0 0 1e9 1e9",cursor:"default",cx:0,cy:0,fill:"#fff","fill-opacity":1,font:'10px "Arial"',"font-family":'"Arial"',"font-size":"10","font-style":"normal","font-weight":400,gradient:0,height:0,href:"http://raphaeljs.com/",opacity:1,path:"M0,0",r:0,rx:0,ry:0,src:"",stroke:"#000","stroke-dasharray":"","stroke-linecap":"butt","stroke-linejoin":"butt","stroke-miterlimit":0,"stroke-opacity":1,"stroke-width":1,target:"_blank","text-anchor":"middle",title:"Raphael",transform:"",width:0,x:0,y:0},U=a._availableAnimAttrs={blur:C,"clip-rect":"csv",cx:C,cy:C,fill:"colour","fill-opacity":C,"font-size":C,height:C,opacity:C,path:"path",r:C,rx:C,ry:C,stroke:"colour","stroke-opacity":C,"stroke-width":C,transform:"transform",width:C,x:C,y:C},V=/\s*,\s*/,W={hs:1,rg:1},X=/,?([achlmqrstvxz]),?/gi,Y=/([achlmrqstvz])[\s,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?\s*,?\s*)+)/ig,Z=/([rstm])[\s,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?\s*,?\s*)+)/ig,$=/(-?\d*\.?\d*(?:e[\-+]?\d+)?)\s*,?\s*/ig,_=a._radial_gradient=/^r(?:\(([^,]+?)\s*,\s*([^\)]+?)\))?/,ba={},bb=function(a,b){return a.key-b.key},bc=function(a,b){return Q(a)-Q(b)},bd=function(){},be=function(a){return a},bf=a._rectPath=function(a,b,c,d,e){if(e)return[["M",a+e,b],["l",c-e*2,0],["a",e,e,0,0,1,e,e],["l",0,d-e*2],["a",e,e,0,0,1,-e,e],["l",e*2-c,0],["a",e,e,0,0,1,-e,-e],["l",0,e*2-d],["a",e,e,0,0,1,e,-e],["z"]];return[["M",a,b],["l",c,0],["l",0,d],["l",-c,0],["z"]]},bg=function(a,b,c,d){d==null&&(d=c);return[["M",a,b],["m",0,-d],["a",c,d,0,1,1,0,2*d],["a",c,d,0,1,1,0,-2*d],["z"]]},bh=a._getPath={path:function(a){return a.attr("path")},circle:function(a){var b=a.attrs;return bg(b.cx,b.cy,b.r)},ellipse:function(a){var b=a.attrs;return bg(b.cx,b.cy,b.rx,b.ry)},rect:function(a){var b=a.attrs;return bf(b.x,b.y,b.width,b.height,b.r)},image:function(a){var b=a.attrs;return bf(b.x,b.y,b.width,b.height)},text:function(a){var b=a._getBBox();return bf(b.x,b.y,b.width,b.height)}},bi=a.mapPath=function(a,b){if(!b)return a;var c,d,e,f,g;a=bG(a);for(e=0,ii=a.length;e<ii;e++){g=a[e];for(f=1,jj=g.length;f<jj;f+=2)c=b.x(g[f],g[f+1]),d=b.y(g[f],g[f+1]),g[f]=c,g[f+1]=d}return a};a._g=h,a.type=h.win.SVGAngle||h.doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure","1.1")?"SVG":"VML";if(a.type=="VML"){var bj=h.doc.createElement("div"),bk;bj.innerHTML='<v:shape adj="1"/>',bk=bj.firstChild,bk.style.behavior="url(#default#VML)";if(!bk||typeof bk.adj!="object")return a.type=p;bj=null}a.svg=!(a.vml=a.type=="VML"),a._Paper=j,a.fn=k=j.prototype=a.prototype,a._id=0,a._oid=0,a.is=function(a,b){b=v.call(b);if(b=="finite")return!M[g](+a);if(b=="array")return a instanceof Array;return b=="null"&&a===null||b==typeof a&&a!==null||b=="object"&&a===Object(a)||b=="array"&&Array.isArray&&Array.isArray(a)||H.call(a).slice(8,-1).toLowerCase()==b},a.angle=function(b,c,d,e,f,g){if(f==null){var h=b-d,i=c-e;if(!h&&!i)return 0;return(180+w.atan2(-i,-h)*180/B+360)%360}return a.angle(b,c,f,g)-a.angle(d,e,f,g)},a.rad=function(a){return a%360*B/180},a.deg=function(a){return a*180/B%360},a.snapTo=function(b,c,d){d=a.is(d,"finite")?d:10;if(a.is(b,E)){var e=b.length;while(e--)if(z(b[e]-c)<=d)return b[e]}else{b=+b;var f=c%b;if(f<d)return c-f;if(f>b-d)return c-f+b}return c};var bl=a.createUUID=function(a,b){return function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(a,b).toUpperCase()}}(/[xy]/g,function(a){var b=w.random()*16|0,c=a=="x"?b:b&3|8;return c.toString(16)});a.setWindow=function(b){eve("setWindow",a,h.win,b),h.win=b,h.doc=h.win.document,initWin&&initWin(h.win)};var bm=function(b){if(a.vml){var c=/^\s+|\s+$/g,d;try{var e=new ActiveXObject("htmlfile");e.write("<body>"),e.close(),d=e.body}catch(f){d=createPopup().document.body}var g=d.createTextRange();bm=bt(function(a){try{d.style.color=r(a).replace(c,p);var b=g.queryCommandValue("ForeColor");b=(b&255)<<16|b&65280|(b&16711680)>>>16;return"#"+("000000"+b.toString(16)).slice(-6)}catch(e){return"none"}})}else{var i=h.doc.createElement("i");i.title="Raphaël Colour Picker",i.style.display="none",h.doc.body.appendChild(i),bm=bt(function(a){i.style.color=a;return h.doc.defaultView.getComputedStyle(i,p).getPropertyValue("color")})}return bm(b)},bn=function(){return"hsb("+[this.h,this.s,this.b]+")"},bo=function(){return"hsl("+[this.h,this.s,this.l]+")"},bp=function(){return this.hex},bq=function(b,c,d){c==null&&a.is(b,"object")&&"r"in b&&"g"in b&&"b"in b&&(d=b.b,c=b.g,b=b.r);if(c==null&&a.is(b,D)){var e=a.getRGB(b);b=e.r,c=e.g,d=e.b}if(b>1||c>1||d>1)b/=255,c/=255,d/=255;return[b,c,d]},br=function(b,c,d,e){b*=255,c*=255,d*=255;var f={r:b,g:c,b:d,hex:a.rgb(b,c,d),toString:bp};a.is(e,"finite")&&(f.opacity=e);return f};a.color=function(b){var c;a.is(b,"object")&&"h"in b&&"s"in b&&"b"in b?(c=a.hsb2rgb(b),b.r=c.r,b.g=c.g,b.b=c.b,b.hex=c.hex):a.is(b,"object")&&"h"in b&&"s"in b&&"l"in b?(c=a.hsl2rgb(b),b.r=c.r,b.g=c.g,b.b=c.b,b.hex=c.hex):(a.is(b,"string")&&(b=a.getRGB(b)),a.is(b,"object")&&"r"in b&&"g"in b&&"b"in b?(c=a.rgb2hsl(b),b.h=c.h,b.s=c.s,b.l=c.l,c=a.rgb2hsb(b),b.v=c.b):(b={hex:"none"},crl.r=b.g=b.b=b.h=b.s=b.v=b.l=-1)),b.toString=bp;return b},a.hsb2rgb=function(a,b,c,d){this.is(a,"object")&&"h"in a&&"s"in a&&"b"in a&&(c=a.b,b=a.s,a=a.h,d=a.o),a*=360;var e,f,g,h,i;a=a%360/60,i=c*b,h=i*(1-z(a%2-1)),e=f=g=c-i,a=~~a,e+=[i,h,0,0,h,i][a],f+=[h,i,i,h,0,0][a],g+=[0,0,h,i,i,h][a];return br(e,f,g,d)},a.hsl2rgb=function(a,b,c,d){this.is(a,"object")&&"h"in a&&"s"in a&&"l"in a&&(c=a.l,b=a.s,a=a.h);if(a>1||b>1||c>1)a/=360,b/=100,c/=100;a*=360;var e,f,g,h,i;a=a%360/60,i=2*b*(c<.5?c:1-c),h=i*(1-z(a%2-1)),e=f=g=c-i/2,a=~~a,e+=[i,h,0,0,h,i][a],f+=[h,i,i,h,0,0][a],g+=[0,0,h,i,i,h][a];return br(e,f,g,d)},a.rgb2hsb=function(a,b,c){c=bq(a,b,c),a=c[0],b=c[1],c=c[2];var d,e,f,g;f=x(a,b,c),g=f-y(a,b,c),d=g==0?null:f==a?(b-c)/g:f==b?(c-a)/g+2:(a-b)/g+4,d=(d+360)%6*60/360,e=g==0?0:g/f;return{h:d,s:e,b:f,toString:bn}},a.rgb2hsl=function(a,b,c){c=bq(a,b,c),a=c[0],b=c[1],c=c[2];var d,e,f,g,h,i;g=x(a,b,c),h=y(a,b,c),i=g-h,d=i==0?null:g==a?(b-c)/i:g==b?(c-a)/i+2:(a-b)/i+4,d=(d+360)%6*60/360,f=(g+h)/2,e=i==0?0:f<.5?i/(2*f):i/(2-2*f);return{h:d,s:e,l:f,toString:bo}},a._path2string=function(){return this.join(",").replace(X,"$1")};var bu=a._preload=function(a,b){var c=h.doc.createElement("img");c.style.cssText="position:absolute;left:-9999em;top-9999em",c.onload=function(){b.call(this),this.onload=null,h.doc.body.removeChild(this)},c.onerror=function(){h.doc.body.removeChild(this)},h.doc.body.appendChild(c),c.src=a};a.getRGB=bt(function(b){if(!b||!!((b=r(b)).indexOf("-")+1))return{r:-1,g:-1,b:-1,hex:"none",error:1,toString:bv};if(b=="none")return{r:-1,g:-1,b:-1,hex:"none",toString:bv};!W[g](b.toLowerCase().substring(0,2))&&b.charAt()!="#"&&(b=bm(b));var c,d,e,f,h,i,j,k=b.match(L);if(k){k[2]&&(f=R(k[2].substring(5),16),e=R(k[2].substring(3,5),16),d=R(k[2].substring(1,3),16)),k[3]&&(f=R((i=k[3].charAt(3))+i,16),e=R((i=k[3].charAt(2))+i,16),d=R((i=k[3].charAt(1))+i,16)),k[4]&&(j=k[4][s](V),d=Q(j[0]),j[0].slice(-1)=="%"&&(d*=2.55),e=Q(j[1]),j[1].slice(-1)=="%"&&(e*=2.55),f=Q(j[2]),j[2].slice(-1)=="%"&&(f*=2.55),k[1].toLowerCase().slice(0,4)=="rgba"&&(h=Q(j[3])),j[3]&&j[3].slice(-1)=="%"&&(h/=100));if(k[5]){j=k[5][s](V),d=Q(j[0]),j[0].slice(-1)=="%"&&(d*=2.55),e=Q(j[1]),j[1].slice(-1)=="%"&&(e*=2.55),f=Q(j[2]),j[2].slice(-1)=="%"&&(f*=2.55),(j[0].slice(-3)=="deg"||j[0].slice(-1)=="°")&&(d/=360),k[1].toLowerCase().slice(0,4)=="hsba"&&(h=Q(j[3])),j[3]&&j[3].slice(-1)=="%"&&(h/=100);return a.hsb2rgb(d,e,f,h)}if(k[6]){j=k[6][s](V),d=Q(j[0]),j[0].slice(-1)=="%"&&(d*=2.55),e=Q(j[1]),j[1].slice(-1)=="%"&&(e*=2.55),f=Q(j[2]),j[2].slice(-1)=="%"&&(f*=2.55),(j[0].slice(-3)=="deg"||j[0].slice(-1)=="°")&&(d/=360),k[1].toLowerCase().slice(0,4)=="hsla"&&(h=Q(j[3])),j[3]&&j[3].slice(-1)=="%"&&(h/=100);return a.hsl2rgb(d,e,f,h)}k={r:d,g:e,b:f,toString:bv},k.hex="#"+(16777216|f|e<<8|d<<16).toString(16).slice(1),a.is(h,"finite")&&(k.opacity=h);return k}return{r:-1,g:-1,b:-1,hex:"none",error:1,toString:bv}},a),a.hsb=bt(function(b,c,d){return a.hsb2rgb(b,c,d).hex}),a.hsl=bt(function(b,c,d){return a.hsl2rgb(b,c,d).hex}),a.rgb=bt(function(a,b,c){return"#"+(16777216|c|b<<8|a<<16).toString(16).slice(1)}),a.getColor=function(a){var b=this.getColor.start=this.getColor.start||{h:0,s:1,b:a||.75},c=this.hsb2rgb(b.h,b.s,b.b);b.h+=.075,b.h>1&&(b.h=0,b.s-=.2,b.s<=0&&(this.getColor.start={h:0,s:1,b:b.b}));return c.hex},a.getColor.reset=function(){delete this.start},a.parsePathString=bt(function(b){if(!b)return null;var c={a:7,c:6,h:1,l:2,m:2,r:4,q:4,s:4,t:2,v:1,z:0},d=[];a.is(b,E)&&a.is(b[0],E)&&(d=by(b)),d.length||r(b).replace(Y,function(a,b,e){var f=[],g=b.toLowerCase();e.replace($,function(a,b){b&&f.push(+b)}),g=="m"&&f.length>2&&(d.push([b][n](f.splice(0,2))),g="l",b=b=="m"?"l":"L");if(g=="r")d.push([b][n](f));else while(f.length>=c[g]){d.push([b][n](f.splice(0,c[g])));if(!c[g])break}}),d.toString=a._path2string;return d}),a.parseTransformString=bt(function(b){if(!b)return null;var c={r:3,s:4,t:2,m:6},d=[];a.is(b,E)&&a.is(b[0],E)&&(d=by(b)),d.length||r(b).replace(Z,function(a,b,c){var e=[],f=v.call(b);c.replace($,function(a,b){b&&e.push(+b)}),d.push([b][n](e))}),d.toString=a._path2string;return d}),a.findDotsAtSegment=function(a,b,c,d,e,f,g,h,i){var j=1-i,k=A(j,3),l=A(j,2),m=i*i,n=m*i,o=k*a+l*3*i*c+j*3*i*i*e+n*g,p=k*b+l*3*i*d+j*3*i*i*f+n*h,q=a+2*i*(c-a)+m*(e-2*c+a),r=b+2*i*(d-b)+m*(f-2*d+b),s=c+2*i*(e-c)+m*(g-2*e+c),t=d+2*i*(f-d)+m*(h-2*f+d),u=j*a+i*c,v=j*b+i*d,x=j*e+i*g,y=j*f+i*h,z=90-w.atan2(q-s,r-t)*180/B;(q>s||r<t)&&(z+=180);return{x:o,y:p,m:{x:q,y:r},n:{x:s,y:t},start:{x:u,y:v},end:{x:x,y:y},alpha:z}};var bx=bt(function(a){if(!a)return{x:0,y:0,width:0,height:0};a=bG(a);var b=0,c=0,d=[],e=[],f;for(var g=0,h=a.length;g<h;g++){f=a[g];if(f[0]=="M")b=f[1],c=f[2],d.push(b),e.push(c);else{var i=bF(b,c,f[1],f[2],f[3],f[4],f[5],f[6]);d=d[n](i.min.x,i.max.x),e=e[n](i.min.y,i.max.y),b=f[5],c=f[6]}}var j=y[m](0,d),k=y[m](0,e);return{x:j,y:k,width:x[m](0,d)-j,height:x[m](0,e)-k}},null,function(a){return{x:a.x,y:a.y,width:a.width,height:a.height}}),by=function(b){var c=[];if(!a.is(b,E)||!a.is(b&&b[0],E))b=a.parsePathString(b);for(var d=0,e=b.length;d<e;d++){c[d]=[];for(var f=0,g=b[d].length;f<g;f++)c[d][f]=b[d][f]}c.toString=a._path2string;return c},bz=a._pathToRelative=bt(function(b){if(!a.is(b,E)||!a.is(b&&b[0],E))b=a.parsePathString(b);var c=[],d=0,e=0,f=0,g=0,h=0;b[0][0]=="M"&&(d=b[0][1],e=b[0][2],f=d,g=e,h++,c.push(["M",d,e]));for(var i=h,j=b.length;i<j;i++){var k=c[i]=[],l=b[i];if(l[0]!=v.call(l[0])){k[0]=v.call(l[0]);switch(k[0]){case"a":k[1]=l[1],k[2]=l[2],k[3]=l[3],k[4]=l[4],k[5]=l[5],k[6]=+(l[6]-d).toFixed(3),k[7]=+(l[7]-e).toFixed(3);break;case"v":k[1]=+(l[1]-e).toFixed(3);break;case"m":f=l[1],g=l[2];default:for(var m=1,n=l.length;m<n;m++)k[m]=+(l[m]-(m%2?d:e)).toFixed(3)}}else{k=c[i]=[],l[0]=="m"&&(f=l[1]+d,g=l[2]+e);for(var o=0,p=l.length;o<p;o++)c[i][o]=l[o]}var q=c[i].length;switch(c[i][0]){case"z":d=f,e=g;break;case"h":d+=+c[i][q-1];break;case"v":e+=+c[i][q-1];break;default:d+=+c[i][q-2],e+=+c[i][q-1]}}c.toString=a._path2string;return c},0,by),bA=a._pathToAbsolute=bt(function(b){if(!a.is(b,E)||!a.is(b&&b[0],E))b=a.parsePathString(b);if(!b||!b.length)return[["M",0,0]];var c=[],d=0,e=0,f=0,g=0,h=0;b[0][0]=="M"&&(d=+b[0][1],e=+b[0][2],f=d,g=e,h++,c[0]=["M",d,e]);for(var i,j,k=h,l=b.length;k<l;k++){c.push(i=[]),j=b[k];if(j[0]!=S.call(j[0])){i[0]=S.call(j[0]);switch(i[0]){case"A":i[1]=j[1],i[2]=j[2],i[3]=j[3],i[4]=j[4],i[5]=j[5],i[6]=+(j[6]+d),i[7]=+(j[7]+e);break;case"V":i[1]=+j[1]+e;break;case"H":i[1]=+j[1]+d;break;case"R":var m=[d,e][n](j.slice(1));for(var o=2,p=m.length;o<p;o++)m[o]=+m[o]+d,m[++o]=+m[o]+e;c.pop(),c=c[n](bw(m));break;case"M":f=+j[1]+d,g=+j[2]+e;default:for(o=1,p=j.length;o<p;o++)i[o]=+j[o]+(o%2?d:e)}}else if(j[0]=="R")m=[d,e][n](j.slice(1)),c.pop(),c=c[n](bw(m)),i=["R"][n](j.slice(-2));else for(var q=0,r=j.length;q<r;q++)i[q]=j[q];switch(i[0]){case"Z":d=f,e=g;break;case"H":d=i[1];break;case"V":e=i[1];break;case"M":f=i[i.length-2],g=i[i.length-1];default:d=i[i.length-2],e=i[i.length-1]}}c.toString=a._path2string;return c},null,by),bB=function(a,b,c,d){return[a,b,c,d,c,d]},bC=function(a,b,c,d,e,f){var g=1/3,h=2/3;return[g*a+h*c,g*b+h*d,g*e+h*c,g*f+h*d,e,f]},bD=function(a,b,c,d,e,f,g,h,i,j){var k=B*120/180,l=B/180*(+e||0),m=[],o,p=bt(function(a,b,c){var d=a*w.cos(c)-b*w.sin(c),e=a*w.sin(c)+b*w.cos(c);return{x:d,y:e}});if(!j){o=p(a,b,-l),a=o.x,b=o.y,o=p(h,i,-l),h=o.x,i=o.y;var q=w.cos(B/180*e),r=w.sin(B/180*e),t=(a-h)/2,u=(b-i)/2,v=t*t/(c*c)+u*u/(d*d);v>1&&(v=w.sqrt(v),c=v*c,d=v*d);var x=c*c,y=d*d,A=(f==g?-1:1)*w.sqrt(z((x*y-x*u*u-y*t*t)/(x*u*u+y*t*t))),C=A*c*u/d+(a+h)/2,D=A*-d*t/c+(b+i)/2,E=w.asin(((b-D)/d).toFixed(9)),F=w.asin(((i-D)/d).toFixed(9));E=a<C?B-E:E,F=h<C?B-F:F,E<0&&(E=B*2+E),F<0&&(F=B*2+F),g&&E>F&&(E=E-B*2),!g&&F>E&&(F=F-B*2)}else E=j[0],F=j[1],C=j[2],D=j[3];var G=F-E;if(z(G)>k){var H=F,I=h,J=i;F=E+k*(g&&F>E?1:-1),h=C+c*w.cos(F),i=D+d*w.sin(F),m=bD(h,i,c,d,e,0,g,I,J,[F,H,C,D])}G=F-E;var K=w.cos(E),L=w.sin(E),M=w.cos(F),N=w.sin(F),O=w.tan(G/4),P=4/3*c*O,Q=4/3*d*O,R=[a,b],S=[a+P*L,b-Q*K],T=[h+P*N,i-Q*M],U=[h,i];S[0]=2*R[0]-S[0],S[1]=2*R[1]-S[1];if(j)return[S,T,U][n](m);m=[S,T,U][n](m).join()[s](",");var V=[];for(var W=0,X=m.length;W<X;W++)V[W]=W%2?p(m[W-1],m[W],l).y:p(m[W],m[W+1],l).x;return V},bE=function(a,b,c,d,e,f,g,h,i){var j=1-i;return{x:A(j,3)*a+A(j,2)*3*i*c+j*3*i*i*e+A(i,3)*g,y:A(j,3)*b+A(j,2)*3*i*d+j*3*i*i*f+A(i,3)*h}},bF=bt(function(a,b,c,d,e,f,g,h){var i=e-2*c+a-(g-2*e+c),j=2*(c-a)-2*(e-c),k=a-c,l=(-j+w.sqrt(j*j-4*i*k))/2/i,n=(-j-w.sqrt(j*j-4*i*k))/2/i,o=[b,h],p=[a,g],q;z(l)>"1e12"&&(l=.5),z(n)>"1e12"&&(n=.5),l>0&&l<1&&(q=bE(a,b,c,d,e,f,g,h,l),p.push(q.x),o.push(q.y)),n>0&&n<1&&(q=bE(a,b,c,d,e,f,g,h,n),p.push(q.x),o.push(q.y)),i=f-2*d+b-(h-2*f+d),j=2*(d-b)-2*(f-d),k=b-d,l=(-j+w.sqrt(j*j-4*i*k))/2/i,n=(-j-w.sqrt(j*j-4*i*k))/2/i,z(l)>"1e12"&&(l=.5),z(n)>"1e12"&&(n=.5),l>0&&l<1&&(q=bE(a,b,c,d,e,f,g,h,l),p.push(q.x),o.push(q.y)),n>0&&n<1&&(q=bE(a,b,c,d,e,f,g,h,n),p.push(q.x),o.push(q.y));return{min:{x:y[m](0,p),y:y[m](0,o)},max:{x:x[m](0,p),y:x[m](0,o)}}}),bG=a._path2curve=bt(function(a,b){var c=bA(a),d=b&&bA(b),e={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null},f={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null},g=function(a,b){var c,d;if(!a)return["C",b.x,b.y,b.x,b.y,b.x,b.y];!(a[0]in{T:1,Q:1})&&(b.qx=b.qy=null);switch(a[0]){case"M":b.X=a[1],b.Y=a[2];break;case"A":a=["C"][n](bD[m](0,[b.x,b.y][n](a.slice(1))));break;case"S":c=b.x+(b.x-(b.bx||b.x)),d=b.y+(b.y-(b.by||b.y)),a=["C",c,d][n](a.slice(1));break;case"T":b.qx=b.x+(b.x-(b.qx||b.x)),b.qy=b.y+(b.y-(b.qy||b.y)),a=["C"][n](bC(b.x,b.y,b.qx,b.qy,a[1],a[2]));break;case"Q":b.qx=a[1],b.qy=a[2],a=["C"][n](bC(b.x,b.y,a[1],a[2],a[3],a[4]));break;case"L":a=["C"][n](bB(b.x,b.y,a[1],a[2]));break;case"H":a=["C"][n](bB(b.x,b.y,a[1],b.y));break;case"V":a=["C"][n](bB(b.x,b.y,b.x,a[1]));break;case"Z":a=["C"][n](bB(b.x,b.y,b.X,b.Y))}return a},h=function(a,b){if(a[b].length>7){a[b].shift();var e=a[b];while(e.length)a.splice(b++,0,["C"][n](e.splice(0,6)));a.splice(b,1),k=x(c.length,d&&d.length||0)}},i=function(a,b,e,f,g){a&&b&&a[g][0]=="M"&&b[g][0]!="M"&&(b.splice(g,0,["M",f.x,f.y]),e.bx=0,e.by=0,e.x=a[g][1],e.y=a[g][2],k=x(c.length,d&&d.length||0))};for(var j=0,k=x(c.length,d&&d.length||0);j<k;j++){c[j]=g(c[j],e),h(c,j),d&&(d[j]=g(d[j],f)),d&&h(d,j),i(c,d,e,f,j),i(d,c,f,e,j);var l=c[j],o=d&&d[j],p=l.length,q=d&&o.length;e.x=l[p-2],e.y=l[p-1],e.bx=Q(l[p-4])||e.x,e.by=Q(l[p-3])||e.y,f.bx=d&&(Q(o[q-4])||f.x),f.by=d&&(Q(o[q-3])||f.y),f.x=d&&o[q-2],f.y=d&&o[q-1]}return d?[c,d]:c},null,by),bH=a._parseDots=bt(function(b){var c=[];for(var d=0,e=b.length;d<e;d++){var f={},g=b[d].match(/^([^:]*):?([\d\.]*)/);f.color=a.getRGB(g[1]);if(f.color.error)return null;f.color=f.color.hex,g[2]&&(f.offset=g[2]+"%"),c.push(f)}for(d=1,e=c.length-1;d<e;d++)if(!c[d].offset){var h=Q(c[d-1].offset||0),i=0;for(var j=d+1;j<e;j++)if(c[j].offset){i=c[j].offset;break}i||(i=100,j=e),i=Q(i);var k=(i-h)/(j-d+1);for(;d<j;d++)h+=k,c[d].offset=h+"%"}return c}),bI=a._tear=function(a,b){a==b.top&&(b.top=a.prev),a==b.bottom&&(b.bottom=a.next),a.next&&(a.next.prev=a.prev),a.prev&&(a.prev.next=a.next)},bJ=a._tofront=function(a,b){b.top!==a&&(bI(a,b),a.next=null,a.prev=b.top,b.top.next=a,b.top=a)},bK=a._toback=function(a,b){b.bottom!==a&&(bI(a,b),a.next=b.bottom,a.prev=null,b.bottom.prev=a,b.bottom=a)},bL=a._insertafter=function(a,b,c){bI(a,c),b==c.top&&(c.top=a),b.next&&(b.next.prev=a),a.next=b.next,a.prev=b,b.next=a},bM=a._insertbefore=function(a,b,c){bI(a,c),b==c.bottom&&(c.bottom=a),b.prev&&(b.prev.next=a),a.prev=b.prev,b.prev=a,a.next=b},bN=function(a){return function(){throw new Error("Raphaël: you are calling to method “"+a+"” of removed object")}},bO=a._extractTransform=function(b,c){if(c==null)return b._.transform;c=r(c).replace(/\.{3}|\u2026/g,b._.transform||p);var d=a.parseTransformString(c),e=0,f=0,g=0,h=1,i=1,j=b._,k=new bR;j.transform=d||[];if(d)for(var l=0,m=d.length;l<m;l++){var n=d[l],o=n.length,q=r(n[0]).toLowerCase(),s=n[0]!=q,t=s?k.invert():0,u,v,w,x,y;q=="t"&&o==3?s?(u=t.x(0,0),v=t.y(0,0),w=t.x(n[1],n[2]),x=t.y(n[1],n[2]),k.translate(w-u,x-v)):k.translate(n[1],n[2]):q=="r"?o==2?(y=y||b.getBBox(1),k.rotate(n[1],y.x+y.width/2,y.y+y.height/2),e+=n[1]):o==4&&(s?(w=t.x(n[2],n[3]),x=t.y(n[2],n[3]),k.rotate(n[1],w,x)):k.rotate(n[1],n[2],n[3]),e+=n[1]):q=="s"?o==2||o==3?(y=y||b.getBBox(1),k.scale(n[1],n[o-1],y.x+y.width/2,y.y+y.height/2),h*=n[1],i*=n[o-1]):o==5&&(s?(w=t.x(n[3],n[4]),x=t.y(n[3],n[4]),k.scale(n[1],n[2],w,x)):k.scale(n[1],n[2],n[3],n[4]),h*=n[1],i*=n[2]):q=="m"&&o==7&&k.add(n[1],n[2],n[3],n[4],n[5],n[6]),j.dirtyT=1,b.matrix=k}b.matrix=k,j.sx=h,j.sy=i,j.deg=e,j.dx=f=k.e,j.dy=g=k.f,h==1&&i==1&&!e&&j.bbox?(j.bbox.x+=+f,j.bbox.y+=+g):j.dirtyT=1},bP=function(a){var b=a[0];switch(b.toLowerCase()){case"t":return[b,0,0];case"m":return[b,1,0,0,1,0,0];case"r":return a.length==4?[b,0,a[2],a[3]]:[b,0];case"s":return a.length==5?[b,1,1,a[3],a[4]]:a.length==3?[b,1,1]:[b,1]}},bQ=a._equaliseTransform=function(b,c){c=r(c).replace(/\.{3}|\u2026/g,b),b=a.parseTransformString(b)||[],c=a.parseTransformString(c)||[];var d=x(b.length,c.length),e=[],f=[],g=0,h,i,j,k;for(;g<d;g++){j=b[g]||bP(c[g]),k=c[g]||bP(j);if(j[0]!=k[0]||j[0].toLowerCase()=="r"&&(j[2]!=k[2]||j[3]!=k[3])||j[0].toLowerCase()=="s"&&(j[3]!=k[3]||j[4]!=k[4]))return;e[g]=[],f[g]=[];for(h=0,i=x(j.length,k.length);h<i;h++)h in j&&(e[g][h]=j[h]),h in k&&(f[g][h]=k[h])}return{from:e,to:f}};a._getContainer=function(b,c,d,e){var f;f=e==null&&!a.is(b,"object")?h.doc.getElementById(b):b;if(f!=null){if(f.tagName)return c==null?{container:f,width:f.style.pixelWidth||f.offsetWidth,height:f.style.pixelHeight||f.offsetHeight}:{container:f,width:c,height:d};return{container:1,x:b,y:c,width:d,height:e}}},a.pathToRelative=bz,a._engine={},a.path2curve=bG,a.matrix=function(a,b,c,d,e,f){return new bR(a,b,c,d,e,f)},function(b){function d(a){var b=w.sqrt(c(a));a[0]&&(a[0]/=b),a[1]&&(a[1]/=b)}function c(a){return a[0]*a[0]+a[1]*a[1]}b.add=function(a,b,c,d,e,f){var g=[[],[],[]],h=[[this.a,this.c,this.e],[this.b,this.d,this.f],[0,0,1]],i=[[a,c,e],[b,d,f],[0,0,1]],j,k,l,m;a&&a instanceof bR&&(i=[[a.a,a.c,a.e],[a.b,a.d,a.f],[0,0,1]]);for(j=0;j<3;j++)for(k=0;k<3;k++){m=0;for(l=0;l<3;l++)m+=h[j][l]*i[l][k];g[j][k]=m}this.a=g[0][0],this.b=g[1][0],this.c=g[0][1],this.d=g[1][1],this.e=g[0][2],this.f=g[1][2]},b.invert=function(){var a=this,b=a.a*a.d-a.b*a.c;return new bR(a.d/b,-a.b/b,-a.c/b,a.a/b,(a.c*a.f-a.d*a.e)/b,(a.b*a.e-a.a*a.f)/b)},b.clone=function(){return new bR(this.a,this.b,this.c,this.d,this.e,this.f)},b.translate=function(a,b){this.add(1,0,0,1,a,b)},b.scale=function(a,b,c,d){b==null&&(b=a),(c||d)&&this.add(1,0,0,1,c,d),this.add(a,0,0,b,0,0),(c||d)&&this.add(1,0,0,1,-c,-d)},b.rotate=function(b,c,d){b=a.rad(b),c=c||0,d=d||0;var e=+w.cos(b).toFixed(9),f=+w.sin(b).toFixed(9);this.add(e,f,-f,e,c,d),this.add(1,0,0,1,-c,-d)},b.x=function(a,b){return a*this.a+b*this.c+this.e},b.y=function(a,b){return a*this.b+b*this.d+this.f},b.get=function(a){return+this[r.fromCharCode(97+a)].toFixed(4)},b.toString=function(){return a.svg?"matrix("+[this.get(0),this.get(1),this.get(2),this.get(3),this.get(4),this.get(5)].join()+")":[this.get(0),this.get(2),this.get(1),this.get(3),0,0].join()},b.toFilter=function(){return"progid:DXImageTransform.Microsoft.Matrix(M11="+this.get(0)+", M12="+this.get(2)+", M21="+this.get(1)+", M22="+this.get(3)+", Dx="+this.get(4)+", Dy="+this.get(5)+", sizingmethod='auto expand')"},b.offset=function(){return[this.e.toFixed(4),this.f.toFixed(4)]},b.split=function(){var b={};b.dx=this.e,b.dy=this.f;var e=[[this.a,this.c],[this.b,this.d]];b.scalex=w.sqrt(c(e[0])),d(e[0]),b.shear=e[0][0]*e[1][0]+e[0][1]*e[1][1],e[1]=[e[1][0]-e[0][0]*b.shear,e[1][1]-e[0][1]*b.shear],b.scaley=w.sqrt(c(e[1])),d(e[1]),b.shear/=b.scaley;var f=-e[0][1],g=e[1][1];g<0?(b.rotate=a.deg(w.acos(g)),f<0&&(b.rotate=360-b.rotate)):b.rotate=a.deg(w.asin(f)),b.isSimple=!+b.shear.toFixed(9)&&(b.scalex.toFixed(9)==b.scaley.toFixed(9)||!b.rotate),b.isSuperSimple=!+b.shear.toFixed(9)&&b.scalex.toFixed(9)==b.scaley.toFixed(9)&&!b.rotate,b.noRotation=!+b.shear.toFixed(9)&&!b.rotate;return b},b.toTransformString=function(a){var b=a||this[s]();return b.isSimple?"t"+[b.dx,b.dy]+"s"+[b.scalex,b.scaley,0,0]+"r"+[b.rotate,0,0]:"m"+[this.get(0),this.get(1),this.get(2),this.get(3),this.get(4),this.get(5)]}}(bR.prototype);var bS=navigator.userAgent.match(/Version\/(.*?)\s/)||navigator.userAgent.match(/Chrome\/(\d+)/);navigator.vendor=="Apple Computer, Inc."&&(bS&&bS[1]<4||navigator.platform.slice(0,2)=="iP")||navigator.vendor=="Google Inc."&&bS&&bS[1]<8?k.safari=function(){var a=this.rect(-99,-99,this.width+99,this.height+99).attr({stroke:"none"});setTimeout(function(){a.remove()})}:k.safari=bd;var bT=function(){this.returnValue=!1},bU=function(){return this.originalEvent.preventDefault()},bV=function(){this.cancelBubble=!0},bW=function(){return this.originalEvent.stopPropagation()},bX=function(){if(h.doc.addEventListener)return function(a,b,c,d){var e=o&&u[b]?u[b]:b,f=function(e){var f=h.doc.documentElement.scrollTop||h.doc.body.scrollTop,i=h.doc.documentElement.scrollLeft||h.doc.body.scrollLeft,j=e.clientX+i,k=e.clientY+f;if(o&&u[g](b))for(var l=0,m=e.targetTouches&&e.targetTouches.length;l<m;l++)if(e.targetTouches[l].target==a){var n=e;e=e.targetTouches[l],e.originalEvent=n,e.preventDefault=bU,e.stopPropagation=bW;break}return c.call(d,e,j,k)};a.addEventListener(e,f,!1);return function(){a.removeEventListener(e,f,!1);return!0}};if(h.doc.attachEvent)return function(a,b,c,d){var e=function(a){a=a||h.win.event;var b=h.doc.documentElement.scrollTop||h.doc.body.scrollTop,e=h.doc.documentElement.scrollLeft||h.doc.body.scrollLeft,f=a.clientX+e,g=a.clientY+b;a.preventDefault=a.preventDefault||bT,a.stopPropagation=a.stopPropagation||bV;return c.call(d,a,f,g)};a.attachEvent("on"+b,e);var f=function(){a.detachEvent("on"+b,e);return!0};return f}}(),bY=[],bZ=function(a){var b=a.clientX,c=a.clientY,d=h.doc.documentElement.scrollTop||h.doc.body.scrollTop,e=h.doc.documentElement.scrollLeft||h.doc.body.scrollLeft,f,g=bY.length;while(g--){f=bY[g];if(o){var i=a.touches.length,j;while(i--){j=a.touches[i];if(j.identifier==f.el._drag.id){b=j.clientX,c=j.clientY,(a.originalEvent?a.originalEvent:a).preventDefault();break}}}else a.preventDefault();var k=f.el.node,l,m=k.nextSibling,n=k.parentNode,p=k.style.display;h.win.opera&&n.removeChild(k),k.style.display="none",l=f.el.paper.getElementByPoint(b,c),k.style.display=p,h.win.opera&&(m?n.insertBefore(k,m):n.appendChild(k)),l&&eve("drag.over."+f.el.id,f.el,l),b+=e,c+=d,eve("drag.move."+f.el.id,f.move_scope||f.el,b-f.el._drag.x,c-f.el._drag.y,b,c,a)}},b$=function(b){a.unmousemove(bZ).unmouseup(b$);var c=bY.length,d;while(c--)d=bY[c],d.el._drag={},eve("drag.end."+d.el.id,d.end_scope||d.start_scope||d.move_scope||d.el,b);bY=[]},b_=a.el={};for(var ca=t.length;ca--;)(function(b){a[b]=b_[b]=function(c,d){a.is(c,"function")&&(this.events=this.events||[],this.events.push({name:b,f:c,unbind:bX(this.shape||this.node||h.doc,b,c,d||this)}));return this},a["un"+b]=b_["un"+b]=function(a){var c=this.events,d=c.length;while(d--)if(c[d].name==b&&c[d].f==a){c[d].unbind(),c.splice(d,1),!c.length&&delete this.events;return this}return this}})(t[ca]);b_.data=function(b,c){var d=ba[this.id]=ba[this.id]||{};if(arguments.length==1){if(a.is(b,"object")){for(var e in b)b[g](e)&&this.data(e,b[e]);return this}eve("data.get."+this.id,this,d[b],b);return d[b]}d[b]=c,eve("data.set."+this.id,this,c,b);return this},b_.removeData=function(a){a==null?ba[this.id]={}:ba[this.id]&&delete ba[this.id][a];return this},b_.hover=function(a,b,c,d){return this.mouseover(a,c).mouseout(b,d||c)},b_.unhover=function(a,b){return this.unmouseover(a).unmouseout(b)},b_.drag=function(b,c,d,e,f,g){function i(i){(i.originalEvent||i).preventDefault();var j=h.doc.documentElement.scrollTop||h.doc.body.scrollTop,k=h.doc.documentElement.scrollLeft||h.doc.body.scrollLeft;this._drag.x=i.clientX+k,this._drag.y=i.clientY+j,this._drag.id=i.identifier,!bY.length&&a.mousemove(bZ).mouseup(b$),bY.push({el:this,move_scope:e,start_scope:f,end_scope:g}),c&&eve.on("drag.start."+this.id,c),b&&eve.on("drag.move."+this.id,b),d&&eve.on("drag.end."+this.id,d),eve("drag.start."+this.id,f||e||this,i.clientX+k,i.clientY+j,i)}this._drag={},this.mousedown(i);return this},b_.onDragOver=function(a){a?eve.on("drag.over."+this.id,a):eve.unbind("drag.over."+this.id)},b_.undrag=function(){var b=bY.length;while(b--)bY[b].el==this&&(a.unmousedown(bY[b].start),bY.splice(b++,1),eve.unbind("drag.*."+this.id));!bY.length&&a.unmousemove(bZ).unmouseup(b$)},k.circle=function(b,c,d){var e=a._engine.circle(this,b||0,c||0,d||0);this.__set__&&this.__set__.push(e);return e},k.rect=function(b,c,d,e,f){var g=a._engine.rect(this,b||0,c||0,d||0,e||0,f||0);this.__set__&&this.__set__.push(g);return g},k.ellipse=function(b,c,d,e){var f=a._engine.ellipse(this,b||0,c||0,d||0,e||0);this.__set__&&this.__set__.push(f);return f},k.path=function(b){b&&!a.is(b,D)&&!a.is(b[0],E)&&(b+=p);var c=a._engine.path(a.format[m](a,arguments),this);this.__set__&&this.__set__.push(c);return c},k.image=function(b,c,d,e,f){var g=a._engine.image(this,b||"about:blank",c||0,d||0,e||0,f||0);this.__set__&&this.__set__.push(g);return g},k.text=function(b,c,d){var e=a._engine.text(this,b||0,c||0,r(d));this.__set__&&this.__set__.push(e);return e},k.set=function(b){!a.is(b,"array")&&(b=Array.prototype.splice.call(arguments,0,arguments.length));var c=new cs(b);this.__set__&&this.__set__.push(c);return c},k.setStart=function(a){this.__set__=a||this.set()},k.setFinish=function(a){var b=this.__set__;delete this.__set__;return b},k.setSize=function(b,c){return a._engine.setSize.call(this,b,c)},k.setViewBox=function(b,c,d,e,f){return a._engine.setViewBox.call(this,b,c,d,e,f)},k.top=k.bottom=null,k.raphael=a;var cb=function(a){var b=a.getBoundingClientRect(),c=a.ownerDocument,d=c.body,e=c.documentElement,f=e.clientTop||d.clientTop||0,g=e.clientLeft||d.clientLeft||0,i=b.top+(h.win.pageYOffset||e.scrollTop||d.scrollTop)-f,j=b.left+(h.win.pageXOffset||e.scrollLeft||d.scrollLeft)-g;return{y:i,x:j}};k.getElementByPoint=function(a,b){var c=this,d=c.canvas,e=h.doc.elementFromPoint(a,b);if(h.win.opera&&e.tagName=="svg"){var f=cb(d),g=d.createSVGRect();g.x=a-f.x,g.y=b-f.y,g.width=g.height=1;var i=d.getIntersectionList(g,null);i.length&&(e=i[i.length-1])}if(!e)return null;while(e.parentNode&&e!=d.parentNode&&!e.raphael)e=e.parentNode;e==c.canvas.parentNode&&(e=d),e=e&&e.raphael?c.getById(e.raphaelid):null;return e},k.getById=function(a){var b=this.bottom;while(b){if(b.id==a)return b;b=b.next}return null},k.forEach=function(a,b){var c=this.bottom;while(c){if(a.call(b,c)===!1)return this;c=c.next}return this},b_.getBBox=function(a){if(this.removed)return{};var b=this._;if(a){if(b.dirty||!b.bboxwt)this.realPath=bh[this.type](this),b.bboxwt=bx(this.realPath),b.bboxwt.toString=cd,b.dirty=0;return b.bboxwt}if(b.dirty||b.dirtyT||!b.bbox){if(b.dirty||!this.realPath)b.bboxwt=0,this.realPath=bh[this.type](this);b.bbox=bx(bi(this.realPath,this.matrix)),b.bbox.toString=cd,b.dirty=b.dirtyT=0}return b.bbox},b_.clone=function(){if(this.removed)return null;var a=this.paper[this.type]().attr(this.attr());this.__set__&&this.__set__.push(a);return a},b_.glow=function(a){if(this.type=="text")return null;a=a||{};var b={width:(a.width||10)+(+this.attr("stroke-width")||1),fill:a.fill||!1,opacity:a.opacity||.5,offsetx:a.offsetx||0,offsety:a.offsety||0,color:a.color||"#000"},c=b.width/2,d=this.paper,e=d.set(),f=this.realPath||bh[this.type](this);f=this.matrix?bi(f,this.matrix):f;for(var g=1;g<c+1;g++)e.push(d.path(f).attr({stroke:b.color,fill:b.fill?b.color:"none","stroke-linejoin":"round","stroke-linecap":"round","stroke-width":+(b.width/c*g).toFixed(3),opacity:+(b.opacity/c).toFixed(3)}));return e.insertBefore(this).translate(b.offsetx,b.offsety)};var ce={},cf=function(b,c,d,e,f,g,h,i,j){var k=0,l=100,m=[b,c,d,e,f,g,h,i].join(),n=ce[m],o,p;!n&&(ce[m]=n={data:[]}),n.timer&&clearTimeout(n.timer),n.timer=setTimeout(function(){delete ce[m]},2e3);if(j!=null&&!n.precision){var q=cf(b,c,d,e,f,g,h,i);n.precision=~~q*10,n.data=[]}l=n.precision||l;for(var r=0;r<l+1;r++){n.data[r*l]?p=n.data[r*l]:(p=a.findDotsAtSegment(b,c,d,e,f,g,h,i,r/l),n.data[r*l]=p),r&&(k+=A(A(o.x-p.x,2)+A(o.y-p.y,2),.5));if(j!=null&&k>=j)return p;o=p}if(j==null)return k},cg=function(b,c){return function(d,e,f){d=bG(d);var g,h,i,j,k="",l={},m,n=0;for(var o=0,p=d.length;o<p;o++){i=d[o];if(i[0]=="M")g=+i[1],h=+i[2];else{j=cf(g,h,i[1],i[2],i[3],i[4],i[5],i[6]);if(n+j>e){if(c&&!l.start){m=cf(g,h,i[1],i[2],i[3],i[4],i[5],i[6],e-n),k+=["C"+m.start.x,m.start.y,m.m.x,m.m.y,m.x,m.y];if(f)return k;l.start=k,k=["M"+m.x,m.y+"C"+m.n.x,m.n.y,m.end.x,m.end.y,i[5],i[6]].join(),n+=j,g=+i[5],h=+i[6];continue}if(!b&&!c){m=cf(g,h,i[1],i[2],i[3],i[4],i[5],i[6],e-n);return{x:m.x,y:m.y,alpha:m.alpha}}}n+=j,g=+i[5],h=+i[6]}k+=i.shift()+i}l.end=k,m=b?n:c?l:a.findDotsAtSegment(g,h,i[0],i[1],i[2],i[3],i[4],i[5],1),m.alpha&&(m={x:m.x,y:m.y,alpha:m.alpha});return m}},ch=cg(1),ci=cg(),cj=cg(0,1);a.getTotalLength=ch,a.getPointAtLength=ci,a.getSubpath=function(a,b,c){if(this.getTotalLength(a)-c<1e-6)return cj(a,b).end;var d=cj(a,c,1);return b?cj(d,b).end:d},b_.getTotalLength=function(){if(this.type=="path"){if(this.node.getTotalLength)return this.node.getTotalLength();return ch(this.attrs.path)}},b_.getPointAtLength=function(a){if(this.type=="path")return ci(this.attrs.path,a)},b_.getSubpath=function(b,c){if(this.type=="path")return a.getSubpath(this.attrs.path,b,c)};var ck=a.easing_formulas={linear:function(a){return a},"<":function(a){return A(a,1.7)},">":function(a){return A(a,.48)},"<>":function(a){var b=.48-a/1.04,c=w.sqrt(.1734+b*b),d=c-b,e=A(z(d),1/3)*(d<0?-1:1),f=-c-b,g=A(z(f),1/3)*(f<0?-1:1),h=e+g+.5;return(1-h)*3*h*h+h*h*h},backIn:function(a){var b=1.70158;return a*a*((b+1)*a-b)},backOut:function(a){a=a-1;var b=1.70158;return a*a*((b+1)*a+b)+1},elastic:function(a){if(a==!!a)return a;return A(2,-10*a)*w.sin((a-.075)*2*B/.3)+1},bounce:function(a){var b=7.5625,c=2.75,d;a<1/c?d=b*a*a:a<2/c?(a-=1.5/c,d=b*a*a+.75):a<2.5/c?(a-=2.25/c,d=b*a*a+.9375):(a-=2.625/c,d=b*a*a+.984375);return d}};ck.easeIn=ck["ease-in"]=ck["<"],ck.easeOut=ck["ease-out"]=ck[">"],ck.easeInOut=ck["ease-in-out"]=ck["<>"],ck["back-in"]=ck.backIn,ck["back-out"]=ck.backOut;var cl=[],cm=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a){setTimeout(a,16)},cn=function(){var b=+(new Date),c=0;for(;c<cl.length;c++){var d=cl[c];if(d.el.removed||d.paused)continue;var e=b-d.start,f=d.ms,h=d.easing,i=d.from,j=d.diff,k=d.to,l=d.t,m=d.el,o={},p,r={},s;d.initstatus?(e=(d.initstatus*d.anim.top-d.prev)/(d.percent-d.prev)*f,d.status=d.initstatus,delete d.initstatus,d.stop&&cl.splice(c--,1)):d.status=(d.prev+(d.percent-d.prev)*(e/f))/d.anim.top;if(e<0)continue;if(e<f){var t=h(e/f);for(var u in i)if(i[g](u)){switch(U[u]){case C:p=+i[u]+t*f*j[u];break;case"colour":p="rgb("+[co(O(i[u].r+t*f*j[u].r)),co(O(i[u].g+t*f*j[u].g)),co(O(i[u].b+t*f*j[u].b))].join(",")+")";break;case"path":p=[];for(var v=0,w=i[u].length;v<w;v++){p[v]=[i[u][v][0]];for(var x=1,y=i[u][v].length;x<y;x++)p[v][x]=+i[u][v][x]+t*f*j[u][v][x];p[v]=p[v].join(q)}p=p.join(q);break;case"transform":if(j[u].real){p=[];for(v=0,w=i[u].length;v<w;v++){p[v]=[i[u][v][0]];for(x=1,y=i[u][v].length;x<y;x++)p[v][x]=i[u][v][x]+t*f*j[u][v][x]}}else{var z=function(a){return+i[u][a]+t*f*j[u][a]};p=[["m",z(0),z(1),z(2),z(3),z(4),z(5)]]}break;case"csv":if(u=="clip-rect"){p=[],v=4;while(v--)p[v]=+i[u][v]+t*f*j[u][v]}break;default:var A=[][n](i[u]);p=[],v=m.paper.customAttributes[u].length;while(v--)p[v]=+A[v]+t*f*j[u][v]}o[u]=p}m.attr(o),function(a,b,c){setTimeout(function(){eve("anim.frame."+a,b,c)})}(m.id,m,d.anim)}else{(function(b,c,d){setTimeout(function(){eve("anim.frame."+c.id,c,d),eve("anim.finish."+c.id,c,d),a.is(b,"function")&&b.call(c)})})(d.callback,m,d.anim),m.attr(k),cl.splice(c--,1);if(d.repeat>1&&!d.next){for(s in k)k[g](s)&&(r[s]=d.totalOrigin[s]);d.el.attr(r),cr(d.anim,d.el,d.anim.percents[0],null,d.totalOrigin,d.repeat-1)}d.next&&!d.stop&&cr(d.anim,d.el,d.next,null,d.totalOrigin,d.repeat)}}a.svg&&m&&m.paper&&m.paper.safari(),cl.length&&cm(cn)},co=function(a){return a>255?255:a<0?0:a};b_.animateWith=function(b,c,d,e,f,g){var h=d?a.animation(d,e,f,g):c;status=b.status(c);return this.animate(h).status(h,status*c.ms/h.ms)},b_.onAnimation=function(a){a?eve.on("anim.frame."+this.id,a):eve.unbind("anim.frame."+this.id);return this},cq.prototype.delay=function(a){var b=new cq(this.anim,this.ms);b.times=this.times,b.del=+a||0;return b},cq.prototype.repeat=function(a){var b=new cq(this.anim,this.ms);b.del=this.del,b.times=w.floor(x(a,0))||1;return b},a.animation=function(b,c,d,e){if(b instanceof cq)return b;if(a.is(d,"function")||!d)e=e||d||null,d=null;b=Object(b),c=+c||0;var f={},h,i;for(i in b)b[g](i)&&Q(i)!=i&&Q(i)+"%"!=i&&(h=!0,f[i]=b[i]);if(!h)return new cq(b,c);d&&(f.easing=d),e&&(f.callback=e);return new cq({100:f},c)},b_.animate=function(b,c,d,e){var f=this;if(f.removed){e&&e.call(f);return f}var g=b instanceof cq?b:a.animation(b,c,d,e);cr(g,f,g.percents[0],null,f.attr());return f},b_.setTime=function(a,b){a&&b!=null&&this.status(a,y(b,a.ms)/a.ms);return this},b_.status=function(a,b){var c=[],d=0,e,f;if(b!=null){cr(a,this,-1,y(b,1));return this}e=cl.length;for(;d<e;d++){f=cl[d];if(f.el.id==this.id&&(!a||f.anim==a)){if(a)return f.status;c.push({anim:f.anim,status:f.status})}}if(a)return 0;return c},b_.pause=function(a){for(var b=0;b<cl.length;b++)cl[b].el.id==this.id&&(!a||cl[b].anim==a)&&eve("anim.pause."+this.id,this,cl[b].anim)!==!1&&(cl[b].paused=!0);return this},b_.resume=function(a){for(var b=0;b<cl.length;b++)if(cl[b].el.id==this.id&&(!a||cl[b].anim==a)){var c=cl[b];eve("anim.resume."+this.id,this,c.anim)!==!1&&(delete c.paused,this.status(c.anim,c.status))}return this},b_.stop=function(a){for(var b=0;b<cl.length;b++)cl[b].el.id==this.id&&(!a||cl[b].anim==a)&&eve("anim.stop."+this.id,this,cl[b].anim)!==!1&&cl.splice(b--,1);return this},b_.toString=function(){return"Raphaël’s object"};var cs=function(a){this.items=[],this.length=0,this.type="set";if(a)for(var b=0,c=a.length;b<c;b++)a[b]&&(a[b].constructor==b_.constructor||a[b].constructor==cs)&&(this[this.items.length]=this.items[this.items.length]=a[b],this.length++)},ct=cs.prototype;ct.push=function(){var a,b;for(var c=0,d=arguments.length;c<d;c++)a=arguments[c],a&&(a.constructor==b_.constructor||a.constructor==cs)&&(b=this.items.length,this[b]=this.items[b]=a,this.length++);return this},ct.pop=function(){this.length&&delete this[this.length--];return this.items.pop()},ct.forEach=function(a,b){for(var c=0,d=this.items.length;c<d;c++)if(a.call(b,this.items[c],c)===!1)return this;return this};for(var cu in b_)b_[g](cu)&&(ct[cu]=function(a){return function(){var b=arguments;return this.forEach(function(c){c[a][m](c,b)})}}(cu));ct.attr=function(b,c){if(b&&a.is(b,E)&&a.is(b[0],"object"))for(var d=0,e=b.length;d<e;d++)this.items[d].attr(b[d]);else for(var f=0,g=this.items.length;f<g;f++)this.items[f].attr(b,c);return this},ct.clear=function(){while(this.length)this.pop()},ct.splice=function(a,b,c){a=a<0?x(this.length+a,0):a,b=x(0,y(this.length-a,b));var d=[],e=[],f=[],g;for(g=2;g<arguments.length;g++)f.push(arguments[g]);for(g=0;g<b;g++)e.push(this[a+g]);for(;g<this.length-a;g++)d.push(this[a+g]);var h=f.length;for(g=0;g<h+d.length;g++)this.items[a+g]=this[a+g]=g<h?f[g]:d[g-h];g=this.items.length=this.length-=b-h;while(this[g])delete this[g++];return new cs(e)},ct.exclude=function(a){for(var b=0,c=this.length;b<c;b++)if(this[b]==a){this.splice(b,1);return!0}},ct.animate=function(b,c,d,e){(a.is(d,"function")||!d)&&(e=d||null);var f=this.items.length,g=f,h,i=this,j;if(!f)return this;e&&(j=function(){!--f&&e.call(i)}),d=a.is(d,D)?d:j;var k=a.animation(b,c,d,j);h=this.items[--g].animate(k);while(g--)this.items[g]&&!this.items[g].removed&&this.items[g].animateWith(h,k);return this},ct.insertAfter=function(a){var b=this.items.length;while(b--)this.items[b].insertAfter(a);return this},ct.getBBox=function(){var a=[],b=[],c=[],d=[];for(var e=this.items.length;e--;)if(!this.items[e].removed){var f=this.items[e].getBBox();a.push(f.x),b.push(f.y),c.push(f.x+f.width),d.push(f.y+f.height)}a=y[m](0,a),b=y[m](0,b);return{x:a,y:b,width:x[m](0,c)-a,height:x[m](0,d)-b}},ct.clone=function(a){a=new cs;for(var b=0,c=this.items.length;b<c;b++)a.push(this.items[b].clone());return a},ct.toString=function(){return"Raphaël‘s set"},a.registerFont=function(a){if(!a.face)return a;this.fonts=this.fonts||{};var b={w:a.w,face:{},glyphs:{}},c=a.face["font-family"];for(var d in a.face)a.face[g](d)&&(b.face[d]=a.face[d]);this.fonts[c]?this.fonts[c].push(b):this.fonts[c]=[b];if(!a.svg){b.face["units-per-em"]=R(a.face["units-per-em"],10);for(var e in a.glyphs)if(a.glyphs[g](e)){var f=a.glyphs[e];b.glyphs[e]={w:f.w,k:{},d:f.d&&"M"+f.d.replace(/[mlcxtrv]/g,function(a){return{l:"L",c:"C",x:"z",t:"m",r:"l",v:"c"}[a]||"M"})+"z"};if(f.k)for(var h in f.k)f[g](h)&&(b.glyphs[e].k[h]=f.k[h])}}return a},k.getFont=function(b,c,d,e){e=e||"normal",d=d||"normal",c=+c||{normal:400,bold:700,lighter:300,bolder:800}[c]||400;if(!!a.fonts){var f=a.fonts[b];if(!f){var h=new RegExp("(^|\\s)"+b.replace(/[^\w\d\s+!~.:_-]/g,p)+"(\\s|$)","i");for(var i in a.fonts)if(a.fonts[g](i)&&h.test(i)){f=a.fonts[i];break}}var j;if(f)for(var k=0,l=f.length;k<l;k++){j=f[k];if(j.face["font-weight"]==c&&(j.face["font-style"]==d||!j.face["font-style"])&&j.face["font-stretch"]==e)break}return j}},k.print=function(b,d,e,f,g,h,i){h=h||"middle",i=x(y(i||0,1),-1);var j=this.set(),k=r(e)[s](p),l=0,m=p,n;a.is(f,e)&&(f=this.getFont(f));if(f){n=(g||16)/f.face["units-per-em"];var o=f.face.bbox[s](c),q=+o[0],t=+o[1]+(h=="baseline"?o[3]-o[1]+ +f.face.descent:(o[3]-o[1])/2);for(var u=0,v=k.length;u<v;u++){var w=u&&f.glyphs[k[u-1]]||{},z=f.glyphs[k[u]];l+=u?(w.w||f.w)+(w.k&&w.k[k[u]]||0)+f.w*i:0,z&&z.d&&j.push(this.path(z.d).attr({fill:"#000",stroke:"none",transform:[["t",l*n,0]]}))}j.transform(["...s",n,n,q,t,"t",(b-q)/n,(d-t)/n])}return j},a.format=function(b,c){var d=a.is(c,E)?[0][n](c):arguments;b&&a.is(b,D)&&d.length-1&&(b=b.replace(e,function(a,b){return d[++b]==null?p:d[b]}));return b||p},a.fullfill=function(){var a=/\{([^\}]+)\}/g,b=/(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g,c=function(a,c,d){var e=d;c.replace(b,function(a,b,c,d,f){b=b||d,e&&(b in e&&(e=e[b]),typeof e=="function"&&f&&(e=e()))}),e=(e==null||e==d?a:e)+"";return e};return function(b,d){return String(b).replace(a,function(a,b){return c(a,b,d)})}}(),a.ninja=function(){i.was?h.win.Raphael=i.is:delete Raphael;return a},a.st=ct,function(b,c,d){function e(){/in/.test(b.readyState)?setTimeout(e,9):a.eve("DOMload")}b.readyState==null&&b.addEventListener&&(b.addEventListener(c,d=function(){b.removeEventListener(c,d,!1),b.readyState="complete"},!1),b.readyState="loading"),e()}(document,"DOMContentLoaded"),i.was?h.win.Raphael=a:Raphael=a,eve.on("DOMload",function(){b=!0})}(),window.Raphael.svg&&function(a){var b="hasOwnProperty",c=String,d=parseFloat,e=parseInt,f=Math,g=f.max,h=f.abs,i=f.pow,j=/[, ]+/,k=a.eve,l="",m=" ",n="http://www.w3.org/1999/xlink",o={block:"M5,0 0,2.5 5,5z",classic:"M5,0 0,2.5 5,5 3.5,3 3.5,2z",diamond:"M2.5,0 5,2.5 2.5,5 0,2.5z",open:"M6,1 1,3.5 6,6",oval:"M2.5,0A2.5,2.5,0,0,1,2.5,5 2.5,2.5,0,0,1,2.5,0z"},p={};a.toString=function(){return"Your browser supports SVG.\nYou are running Raphaël "+this.version};var q=function(d,e){if(e){typeof d=="string"&&(d=q(d));for(var f in e)e[b](f)&&(f.substring(0,6)=="xlink:"?d.setAttributeNS(n,f.substring(6),c(e[f])):d.setAttribute(f,c(e[f])))}else d=a._g.doc.createElementNS("http://www.w3.org/2000/svg",d),d.style&&(d.style.webkitTapHighlightColor="rgba(0,0,0,0)");return d},r={},s=/^url\(#(.*)\)$/,t=function(b,c){var d=b.getAttribute("fill");d=d&&d.match(s),d&&!--r[d[1]]&&(delete r[d[1]],c.defs.removeChild(a._g.doc.getElementById(d[1])))},u=function(b,e){var j="linear",k=b.id+e,m=.5,n=.5,o=b.node,p=b.paper,r=o.style,s=a._g.doc.getElementById(k);if(!s){e=c(e).replace(a._radial_gradient,function(a,b,c){j="radial";if(b&&c){m=d(b),n=d(c);var e=(n>.5)*2-1;i(m-.5,2)+i(n-.5,2)>.25&&(n=f.sqrt(.25-i(m-.5,2))*e+.5)&&n!=.5&&(n=n.toFixed(5)-1e-5*e)}return l}),e=e.split(/\s*\-\s*/);if(j=="linear"){var t=e.shift();t=-d(t);if(isNaN(t))return null;var u=[0,0,f.cos(a.rad(t)),f.sin(a.rad(t))],v=1/(g(h(u[2]),h(u[3]))||1);u[2]*=v,u[3]*=v,u[2]<0&&(u[0]=-u[2],u[2]=0),u[3]<0&&(u[1]=-u[3],u[3]=0)}var w=a._parseDots(e);if(!w)return null;b.gradient&&(p.defs.removeChild(b.gradient),delete b.gradient),k=k.replace(/[\(\)\s,\xb0#]/g,"-"),s=q(j+"Gradient",{id:k}),b.gradient=s,q(s,j=="radial"?{fx:m,fy:n}:{x1:u[0],y1:u[1],x2:u[2],y2:u[3],gradientTransform:b.matrix.invert()}),p.defs.appendChild(s);for(var x=0,y=w.length;x<y;x++)s.appendChild(q("stop",{offset:w[x].offset?w[x].offset:x?"100%":"0%","stop-color":w[x].color||"#fff"}))}q(o,{fill:"url(#"+k+")",opacity:1,"fill-opacity":1}),r.fill=l,r.opacity=1,r.fillOpacity=1;return 1},v=function(a){var b=a.getBBox(1);q(a.pattern,{patternTransform:a.matrix.invert()+" translate("+b.x+","+b.y+")"})},w=function(d,e,f){if(d.type=="path"){var g=c(e).toLowerCase().split("-"),h=d.paper,i=f?"end":"start",j=d.node,k=d.attrs,l=k["stroke-width"],n=g.length,r="classic",s,t,u,v,w,x=3,y=3,z=5;while(n--)switch(g[n]){case"block":case"classic":case"oval":case"diamond":case"open":case"none":r=g[n];break;case"wide":y=5;break;case"narrow":y=2;break;case"long":x=5;break;case"short":x=2}r=="open"?(x+=2,y+=2,z+=2,u=1,v=f?4:1,w={fill:"none",stroke:k.stroke}):(v=u=x/2,w={fill:k.stroke,stroke:"none"}),d._.arrows?f?(d._.arrows.endPath&&p[d._.arrows.endPath]--,d._.arrows.endMarker&&p[d._.arrows.endMarker]--):(d._.arrows.startPath&&p[d._.arrows.startPath]--,d._.arrows.startMarker&&p[d._.arrows.startMarker]--):d._.arrows={};if(r!="none"){var A="raphael-marker-"+r,B="raphael-marker-"+i+r+x+y;a._g.doc.getElementById(A)?p[A]++:(h.defs.appendChild(q(q("path"),{"stroke-linecap":"round",d:o[r],id:A})),p[A]=1);var C=a._g.doc.getElementById(B),D;C?(p[B]++,D=C.getElementsByTagName("use")[0]):(C=q(q("marker"),{id:B,markerHeight:y,markerWidth:x,orient:"auto",refX:v,refY:y/2}),D=q(q("use"),{"xlink:href":"#"+A,transform:(f?" rotate(180 "+x/2+" "+y/2+") ":m)+"scale("+x/z+","+y/z+")","stroke-width":1/((x/z+y/z)/2)}),C.appendChild(D),h.defs.appendChild(C),p[B]=1),q(D,w);var E=u*(r!="diamond"&&r!="oval");f?(s=d._.arrows.startdx*l||0,t=a.getTotalLength(k.path)-E*l):(s=E*l,t=a.getTotalLength(k.path)-(d._.arrows.enddx*l||0)),w={},w["marker-"+i]="url(#"+B+")";if(t||s)w.d=Raphael.getSubpath(k.path,s,t);q(j,w),d._.arrows[i+"Path"]=A,d._.arrows[i+"Marker"]=B,d._.arrows[i+"dx"]=E,d._.arrows[i+"Type"]=r,d._.arrows[i+"String"]=e}else f?(s=d._.arrows.startdx*l||0,t=a.getTotalLength(k.path)-s):(s=0,t=a.getTotalLength(k.path)-(d._.arrows.enddx*l||0)),d._.arrows[i+"Path"]&&q(j,{d:Raphael.getSubpath(k.path,s,t)}),delete d._.arrows[i+"Path"],delete d._.arrows[i+"Marker"],delete d._.arrows[i+"dx"],delete d._.arrows[i+"Type"],delete d._.arrows[i+"String"];for(w in p)if(p[b](w)&&!p[w]){var F=a._g.doc.getElementById(w);F&&F.parentNode.removeChild(F)}}},x={"":[0],none:[0],"-":[3,1],".":[1,1],"-.":[3,1,1,1],"-..":[3,1,1,1,1,1],". ":[1,3],"- ":[4,3],"--":[8,3],"- .":[4,3,1,3],"--.":[8,3,1,3],"--..":[8,3,1,3,1,3]},y=function(a,b,d){b=x[c(b).toLowerCase()];if(b){var e=a.attrs["stroke-width"]||"1",f={round:e,square:e,butt:0}[a.attrs["stroke-linecap"]||d["stroke-linecap"]]||0,g=[],h=b.length;while(h--)g[h]=b[h]*e+(h%2?1:-1)*f;q(a.node,{"stroke-dasharray":g.join(",")})}},z=function(d,f){var i=d.node,k=d.attrs,m=i.style.visibility;i.style.visibility="hidden";for(var o in f)if(f[b](o)){if(!a._availableAttrs[b](o))continue;var p=f[o];k[o]=p;switch(o){case"blur":d.blur(p);break;case"href":case"title":case"target":var r=i.parentNode;if(r.tagName.toLowerCase()!="a"){var s=q("a");r.insertBefore(s,i),s.appendChild(i),r=s}o=="target"&&p=="blank"?r.setAttributeNS(n,"show","new"):r.setAttributeNS(n,o,p);break;case"cursor":i.style.cursor=p;break;case"transform":d.transform(p);break;case"arrow-start":w(d,p);break;case"arrow-end":w(d,p,1);break;case"clip-rect":var t=c(p).split(j);if(t.length==4){d.clip&&d.clip.parentNode.parentNode.removeChild(d.clip.parentNode);var x=q("clipPath"),z=q("rect");x.id=a.createUUID(),q(z,{x:t[0],y:t[1],width:t[2],height:t[3]}),x.appendChild(z),d.paper.defs.appendChild(x),q(i,{"clip-path":"url(#"+x.id+")"}),d.clip=z}if(!p){var A=a._g.doc.getElementById(i.getAttribute("clip-path").replace(/(^url\(#|\)$)/g,l));A&&A.parentNode.removeChild(A),q(i,{"clip-path":l}),delete d.clip}break;case"path":d.type=="path"&&(q(i,{d:p?k.path=a._pathToAbsolute(p):"M0,0"}),d._.dirty=1,d._.arrows&&("startString"in d._.arrows&&w(d,d._.arrows.startString),"endString"in d._.arrows&&w(d,d._.arrows.endString,1)));break;case"width":i.setAttribute(o,p),d._.dirty=1;if(k.fx)o="x",p=k.x;else break;case"x":k.fx&&(p=-k.x-(k.width||0));case"rx":if(o=="rx"&&d.type=="rect")break;case"cx":i.setAttribute(o,p),d.pattern&&v(d),d._.dirty=1;break;case"height":i.setAttribute(o,p),d._.dirty=1;if(k.fy)o="y",p=k.y;else break;case"y":k.fy&&(p=-k.y-(k.height||0));case"ry":if(o=="ry"&&d.type=="rect")break;case"cy":i.setAttribute(o,p),d.pattern&&v(d),d._.dirty=1;break;case"r":d.type=="rect"?q(i,{rx:p,ry:p}):i.setAttribute(o,p),d._.dirty=1;break;case"src":d.type=="image"&&i.setAttributeNS(n,"href",p);break;case"stroke-width":if(d._.sx!=1||d._.sy!=1)p/=g(h(d._.sx),h(d._.sy))||1;d.paper._vbSize&&(p*=d.paper._vbSize),i.setAttribute(o,p),k["stroke-dasharray"]&&y(d,k["stroke-dasharray"],f),d._.arrows&&("startString"in d._.arrows&&w(d,d._.arrows.startString),"endString"in d._.arrows&&w(d,d._.arrows.endString,1));break;case"stroke-dasharray":y(d,p,f);break;case"fill":var C=c(p).match(a._ISURL);if(C){x=q("pattern");var D=q("image");x.id=a.createUUID(),q(x,{x:0,y:0,patternUnits:"userSpaceOnUse",height:1,width:1}),q(D,{x:0,y:0,"xlink:href":C[1]}),x.appendChild(D),function(b){a._preload(C[1],function(){var a=this.offsetWidth,c=this.offsetHeight;q(b,{width:a,height:c}),q(D,{width:a,height:c}),d.paper.safari()})}(x),d.paper.defs.appendChild(x),i.style.fill="url(#"+x.id+")",q(i,{fill:"url(#"+x.id+")"}),d.pattern=x,d.pattern&&v(d);break}var E=a.getRGB(p);if(!E.error)delete f.gradient,delete k.gradient,!a.is(k.opacity,"undefined")&&a.is(f.opacity,"undefined")&&q(i,{opacity:k.opacity}),!a.is(k["fill-opacity"],"undefined")&&a.is(f["fill-opacity"],"undefined")&&q(i,{"fill-opacity":k["fill-opacity"]});else if((d.type=="circle"||d.type=="ellipse"||c(p).charAt()!="r")&&u(d,p)){if("opacity"in k||"fill-opacity"in k){var F=a._g.doc.getElementById(i.getAttribute("fill").replace(/^url\(#|\)$/g,l));if(F){var G=F.getElementsByTagName("stop");q(G[G.length-1],{"stop-opacity":("opacity"in k?k.opacity:1)*("fill-opacity"in k?k["fill-opacity"]:1)})}}k.gradient=p,k.fill="none";break}E[b]("opacity")&&q(i,{"fill-opacity":E.opacity>1?E.opacity/100:E.opacity});case"stroke":E=a.getRGB(p),i.setAttribute(o,E.hex),o=="stroke"&&E[b]("opacity")&&q(i,{"stroke-opacity":E.opacity>1?E.opacity/100:E.opacity}),o=="stroke"&&d._.arrows&&("startString"in d._.arrows&&w(d,d._.arrows.startString),"endString"in d._.arrows&&w(d,d._.arrows.endString,1));break;case"gradient":(d.type=="circle"||d.type=="ellipse"||c(p).charAt()!="r")&&u(d,p);break;case"opacity":k.gradient&&!k[b]("stroke-opacity")&&q(i,{"stroke-opacity":p>1?p/100:p});case"fill-opacity":if(k.gradient){F=a._g.doc.getElementById(i.getAttribute("fill").replace(/^url\(#|\)$/g,l)),F&&(G=F.getElementsByTagName("stop"),q(G[G.length-1],{"stop-opacity":p}));break};default:o=="font-size"&&(p=e(p,10)+"px");var H=o.replace(/(\-.)/g,function(a){return a.substring(1).toUpperCase()});i.style[H]=p,d._.dirty=1,i.setAttribute(o,p)}}B(d,f),i.style.visibility=m},A=1.2,B=function(d,f){if(d.type=="text"&&!!(f[b]("text")||f[b]("font")||f[b]("font-size")||f[b]("x")||f[b]("y"))){var g=d.attrs,h=d.node,i=h.firstChild?e(a._g.doc.defaultView.getComputedStyle(h.firstChild,l).getPropertyValue("font-size"),10):10;if(f[b]("text")){g.text=f.text;while(h.firstChild)h.removeChild(h.firstChild);var j=c(f.text).split("\n"),k=[],m;for(var n=0,o=j.length;n<o;n++)m=q("tspan"),n&&q(m,{dy:i*A,x:g.x}),m.appendChild(a._g.doc.createTextNode(j[n])),h.appendChild(m),k[n]=m}else{k=h.getElementsByTagName("tspan");for(n=0,o=k.length;n<o;n++)n?q(k[n],{dy:i*A,x:g.x}):q(k[0],{dy:0})}q(h,{x:g.x,y:g.y}),d._.dirty=1;var p=d._getBBox(),r=g.y-(p.y+p.height/2);r&&a.is(r,"finite")&&q(k[0],{dy:r})}},C=function(b,c){var d=0,e=0;this[0]=this.node=b,b.raphael=!0,this.id=a._oid++,b.raphaelid=this.id,this.matrix=a.matrix(),this.realPath=null,this.paper=c,this.attrs=this.attrs||{},this._={transform:[],sx:1,sy:1,deg:0,dx:0,dy:0,dirty:1},!c.bottom&&(c.bottom=this),this.prev=c.top,c.top&&(c.top.next=this),c.top=this,this.next=null},D=a.el;C.prototype=D,D.constructor=C,a._engine.path=function(a,b){var c=q("path");b.canvas&&b.canvas.appendChild(c);var d=new C(c,b);d.type="path",z(d,{fill:"none",stroke:"#000",path:a});return d},D.rotate=function(a,b,e){if(this.removed)return this;a=c(a).split(j),a.length-1&&(b=d(a[1]),e=d(a[2])),a=d(a[0]),e==null&&(b=e);if(b==null||e==null){var f=this.getBBox(1);b=f.x+f.width/2,e=f.y+f.height/2}this.transform(this._.transform.concat([["r",a,b,e]]));return this},D.scale=function(a,b,e,f){if(this.removed)return this;a=c(a).split(j),a.length-1&&(b=d(a[1]),e=d(a[2]),f=d(a[3])),a=d(a[0]),b==null&&(b=a),f==null&&(e=f);if(e==null||f==null)var g=this.getBBox(1);e=e==null?g.x+g.width/2:e,f=f==null?g.y+g.height/2:f,this.transform(this._.transform.concat([["s",a,b,e,f]]));return this},D.translate=function(a,b){if(this.removed)return this;a=c(a).split(j),a.length-1&&(b=d(a[1])),a=d(a[0])||0,b=+b||0,this.transform(this._.transform.concat([["t",a,b]]));return this},D.transform=function(c){var d=this._;if(c==null)return d.transform;a._extractTransform(this,c),this.clip&&q(this.clip,{transform:this.matrix.invert()}),this.pattern&&v(this),this.node&&q(this.node,{transform:this.matrix});if(d.sx!=1||d.sy!=1){var e=this.attrs[b]("stroke-width")?this.attrs["stroke-width"]:1;this.attr({"stroke-width":e})}return this},D.hide=function(){!this.removed&&this.paper.safari(this.node.style.display="none");return this},D.show=function(){!this.removed&&this.paper.safari(this.node.style.display="");return this},D.remove=function(){if(!this.removed){this.paper.__set__&&this.paper.__set__.exclude(this),k.unbind("*.*."+this.id),a._tear(this,this.paper),this.node.parentNode.removeChild(this.node);for(var b in this)delete this[b];this.removed=!0}},D._getBBox=function(){if(this.node.style.display=="none"){this.show();var a=!0}var b={};try{b=this.node.getBBox()}catch(c){}finally{b=b||{}}a&&this.hide();return b},D.attr=function(c,d){if(this.removed)return this;if(c==null){var e={};for(var f in this.attrs)this.attrs[b](f)&&(e[f]=this.attrs[f]);e.gradient&&e.fill=="none"&&(e.fill=e.gradient)&&delete e.gradient,e.transform=this._.transform;return e}if(d==null&&a.is(c,"string")){if(c=="fill"&&this.attrs.fill=="none"&&this.attrs.gradient)return this.attrs.gradient;if(c=="transform")return this._.transform;var g=c.split(j),h={};for(var i=0,l=g.length;i<l;i++)c=g[i],c in this.attrs?h[c]=this.attrs[c]:a.is(this.paper.customAttributes[c],"function")?h[c]=this.paper.customAttributes[c].def:h[c]=a._availableAttrs[c];return l-1?h:h[g[0]]}if(d==null&&a.is(c,"array")){h={};for(i=0,l=c.length;i<l;i++)h[c[i]]=this.attr(c[i]);return h}if(d!=null){var m={};m[c]=d}else c!=null&&a.is(c,"object")&&(m=c);for(var n in m)k("attr."+n+"."+this.id,this,m[n]);for(n in this.paper.customAttributes)if(this.paper.customAttributes[b](n)&&m[b](n)&&a.is(this.paper.customAttributes[n],"function")){var o=this.paper.customAttributes[n].apply(this,[].concat(m[n]));this.attrs[n]=m[n];for(var p in o)o[b](p)&&(m[p]=o[p])}z(this,m);return this},D.toFront=function(){if(this.removed)return this;this.node.parentNode.appendChild(this.node);var b=this.paper;b.top!=this&&a._tofront(this,b);return this},D.toBack=function(){if(this.removed)return this;if(this.node.parentNode.firstChild!=this.node){this.node.parentNode.insertBefore(this.node,this.node.parentNode.firstChild),a._toback(this,this.paper);var b=this.paper}return this},D.insertAfter=function(b){if(this.removed)return this;var c=b.node||b[b.length-1].node;c.nextSibling?c.parentNode.insertBefore(this.node,c.nextSibling):c.parentNode.appendChild(this.node),a._insertafter(this,b,this.paper);return this},D.insertBefore=function(b){if(this.removed)return this;var c=b.node||b[0].node;c.parentNode.insertBefore(this.node,c),a._insertbefore(this,b,this.paper);return this},D.blur=function(b){var c=this;if(+b!==0){var d=q("filter"),e=q("feGaussianBlur");c.attrs.blur=b,d.id=a.createUUID(),q(e,{stdDeviation:+b||1.5}),d.appendChild(e),c.paper.defs.appendChild(d),c._blur=d,q(c.node,{filter:"url(#"+d.id+")"})}else c._blur&&(c._blur.parentNode.removeChild(c._blur),delete c._blur,delete c.attrs.blur),c.node.removeAttribute("filter")},a._engine.circle=function(a,b,c,d){var e=q("circle");a.canvas&&a.canvas.appendChild(e);var f=new C(e,a);f.attrs={cx:b,cy:c,r:d,fill:"none",stroke:"#000"},f.type="circle",q(e,f.attrs);return f},a._engine.rect=function(a,b,c,d,e,f){var g=q("rect");a.canvas&&a.canvas.appendChild(g);var h=new C(g,a);h.attrs={x:b,y:c,width:d,height:e,r:f||0,rx:f||0,ry:f||0,fill:"none",stroke:"#000"},h.type="rect",q(g,h.attrs);return h},a._engine.ellipse=function(a,b,c,d,e){var f=q("ellipse");a.canvas&&a.canvas.appendChild(f);var g=new C(f,a);g.attrs={cx:b,cy:c,rx:d,ry:e,fill:"none",stroke:"#000"},g.type="ellipse",q(f,g.attrs);return g},a._engine.image=function(a,b,c,d,e,f){var g=q("image");q(g,{x:c,y:d,width:e,height:f,preserveAspectRatio:"none"}),g.setAttributeNS(n,"href",b),a.canvas&&a.canvas.appendChild(g);var h=new C(g,a);h.attrs={x:c,y:d,width:e,height:f,src:b},h.type="image";return h},a._engine.text=function(b,c,d,e){var f=q("text");b.canvas&&b.canvas.appendChild(f);var g=new C(f,b);g.attrs={x:c,y:d,"text-anchor":"middle",text:e,font:a._availableAttrs.font,stroke:"none",fill:"#000"},g.type="text",z(g,g.attrs);return g},a._engine.setSize=function(a,b){this.width=a||this.width,this.height=b||this.height,this.canvas.setAttribute("width",this.width),this.canvas.setAttribute("height",this.height),this._viewBox&&this.setViewBox.apply(this,this._viewBox);return this},a._engine.create=function(){var b=a._getContainer.apply(0,arguments),c=b&&b.container,d=b.x,e=b.y,f=b.width,g=b.height;if(!c)throw new Error("SVG container not found.");var h=q("svg"),i="overflow:hidden;",j;d=d||0,e=e||0,f=f||512,g=g||342,q(h,{height:g,version:1.1,width:f,xmlns:"http://www.w3.org/2000/svg"}),c==1?(h.style.cssText=i+"position:absolute;left:"+d+"px;top:"+e+"px",a._g.doc.body.appendChild(h),j=1):(h.style.cssText=i+"position:relative",c.firstChild?c.insertBefore(h,c.firstChild):c.appendChild(h)),c=new a._Paper,c.width=f,c.height=g,c.canvas=h,c.clear(),c._left=c._top=0,j&&(c.renderfix=function(){}),c.renderfix();return c},a._engine.setViewBox=function(a,b,c,d,e){k("setViewBox",this,this._viewBox,[a,b,c,d,e]);var f=g(c/this.width,d/this.height),h=this.top,i=e?"meet":"xMinYMin",j,l;a==null?(this._vbSize&&(f=1),delete this._vbSize,j="0 0 "+this.width+m+this.height):(this._vbSize=f,j=a+m+b+m+c+m+d),q(this.canvas,{viewBox:j,preserveAspectRatio:i});while(f&&h)l="stroke-width"in h.attrs?h.attrs["stroke-width"]:1,h.attr({"stroke-width":l}),h._.dirty=1,h._.dirtyT=1,h=h.prev;this._viewBox=[a,b,c,d,!!e];return this},a.prototype.renderfix=function(){var a=this.canvas,b=a.style,c=a.getScreenCTM()||a.createSVGMatrix(),d=-c.e%1,e=-c.f%1;if(d||e)d&&(this._left=(this._left+d)%1,b.left=this._left+"px"),e&&(this._top=(this._top+e)%1,b.top=this._top+"px")},a.prototype.clear=function(){a.eve("clear",this);var b=this.canvas;while(b.firstChild)b.removeChild(b.firstChild);this.bottom=this.top=null,(this.desc=q("desc")).appendChild(a._g.doc.createTextNode("Created with Raphaël "+a.version)),b.appendChild(this.desc),b.appendChild(this.defs=q("defs"))},a.prototype.remove=function(){k("remove",this),this.canvas.parentNode&&this.canvas.parentNode.removeChild(this.canvas);for(var a in this)this[a]=removed(a)};var E=a.st;for(var F in D)D[b](F)&&!E[b](F)&&(E[F]=function(a){return function(){var b=arguments;return this.forEach(function(c){c[a].apply(c,b)})}}(F))}(window.Raphael),window.Raphael.vml&&function(a){var b="hasOwnProperty",c=String,d=parseFloat,e=Math,f=e.round,g=e.max,h=e.min,i=e.abs,j="fill",k=/[, ]+/,l=a.eve,m=" progid:DXImageTransform.Microsoft",n=" ",o="",p={M:"m",L:"l",C:"c",Z:"x",m:"t",l:"r",c:"v",z:"x"},q=/([clmz]),?([^clmz]*)/gi,r=/ progid:\S+Blur\([^\)]+\)/g,s=/-?[^,\s-]+/g,t="position:absolute;left:0;top:0;width:1px;height:1px",u=21600,v={path:1,rect:1,image:1},w={circle:1,ellipse:1},x=function(b){var d=/[ahqstv]/ig,e=a._pathToAbsolute;c(b).match(d)&&(e=a._path2curve),d=/[clmz]/g;if(e==a._pathToAbsolute&&!c(b).match(d)){var g=c(b).replace(q,function(a,b,c){var d=[],e=b.toLowerCase()=="m",g=p[b];c.replace(s,function(a){e&&d.length==2&&(g+=d+p[b=="m"?"l":"L"],d=[]),d.push(f(a*u))});return g+d});return g}var h=e(b),i,j;g=[];for(var k=0,l=h.length;k<l;k++){i=h[k],j=h[k][0].toLowerCase(),j=="z"&&(j="x");for(var m=1,r=i.length;m<r;m++)j+=f(i[m]*u)+(m!=r-1?",":o);g.push(j)}return g.join(n)},y=function(b,c,d){var e=a.matrix();e.rotate(-b,.5,.5);return{dx:e.x(c,d),dy:e.y(c,d)}},z=function(a,b,c,d,e,f){var g=a._,h=a.matrix,k=g.fillpos,l=a.node,m=l.style,o=1,p="",q,r=u/b,s=u/c;m.visibility="hidden";if(!!b&&!!c){l.coordsize=i(r)+n+i(s),m.rotation=f*(b*c<0?-1:1);if(f){var t=y(f,d,e);d=t.dx,e=t.dy}b<0&&(p+="x"),c<0&&(p+=" y")&&(o=-1),m.flip=p,l.coordorigin=d*-r+n+e*-s;if(k||g.fillsize){var v=l.getElementsByTagName(j);v=v&&v[0],l.removeChild(v),k&&(t=y(f,h.x(k[0],k[1]),h.y(k[0],k[1])),v.position=t.dx*o+n+t.dy*o),g.fillsize&&(v.size=g.fillsize[0]*i(b)+n+g.fillsize[1]*i(c)),l.appendChild(v)}m.visibility="visible"}};a.toString=function(){return"Your browser doesn’t support SVG. Falling down to VML.\nYou are running Raphaël "+this.version},addArrow=function(a,b,d){var e=c(b).toLowerCase().split("-"),f=d?"end":"start",g=e.length,h="classic",i="medium",j="medium";while(g--)switch(e[g]){case"block":case"classic":case"oval":case"diamond":case"open":case"none":h=e[g];break;case"wide":case"narrow":j=e[g];break;case"long":case"short":i=e[g]}var k=a.node.getElementsByTagName("stroke")[0];k[f+"arrow"]=h,k[f+"arrowlength"]=i,k[f+"arrowwidth"]=j},setFillAndStroke=function(e,i){e.attrs=e.attrs||{};var l=e.node,m=e.attrs,p=l.style,q,r=v[e.type]&&(i.x!=m.x||i.y!=m.y||i.width!=m.width||i.height!=m.height||i.cx!=m.cx||i.cy!=m.cy||i.rx!=m.rx||i.ry!=m.ry||i.r!=m.r),s=w[e.type]&&(m.cx!=i.cx||m.cy!=i.cy||m.r!=i.r||m.rx!=i.rx||m.ry!=i.ry),t=e;for(var y in i)i[b](y)&&(m[y]=i[y]);r&&(m.path=a._getPath[e.type](e),e._.dirty=1),i.href&&(l.href=i.href),i.title&&(l.title=i.title),i.target&&(l.target=i.target),i.cursor&&(p.cursor=i.cursor),"blur"in i&&e.blur(i.blur);if(i.path&&e.type=="path"||r)l.path=x(~c(m.path).toLowerCase().indexOf("r")?a._pathToAbsolute(m.path):m.path),e.type=="image"&&(e._.fillpos=[m.x,m.y],e._.fillsize=[m.width,m.height],z(e,1,1,0,0,0));"transform"in i&&e.transform(i.transform);if(s){var A=+m.cx,C=+m.cy,D=+m.rx||+m.r||0,E=+m.ry||+m.r||0;l.path=a.format("ar{0},{1},{2},{3},{4},{1},{4},{1}x",f((A-D)*u),f((C-E)*u),f((A+D)*u),f((C+E)*u),f(A*u))}if("clip-rect"in i){var F=c(i["clip-rect"]).split(k);if(F.length==4){F[2]=+F[2]+ +F[0],F[3]=+F[3]+ +F[1];var G=l.clipRect||a._g.doc.createElement("div"),H=G.style;H.clip=a.format("rect({1}px {2}px {3}px {0}px)",F),l.clipRect||(H.position="absolute",H.top=0,H.left=0,H.width=e.paper.width+"px",H.height=e.paper.height+"px",l.parentNode.insertBefore(G,l),G.appendChild(l),l.clipRect=G)}i["clip-rect"]||l.clipRect&&(l.clipRect.style.clip=o)}if(e.textpath){var I=e.textpath.style;i.font&&(I.font=i.font),i["font-family"]&&(I.fontFamily='"'+i["font-family"].split(",")[0].replace(/^['"]+|['"]+$/g,o)+'"'),i["font-size"]&&(I.fontSize=i["font-size"]),i["font-weight"]&&(I.fontWeight=i["font-weight"]),i["font-style"]&&(I.fontStyle=i["font-style"])}"arrow-start"in i&&addArrow(t,i["arrow-start"]),"arrow-end"in i&&addArrow(t,i["arrow-end"],1);if(i.opacity!=null||i["stroke-width"]!=null||i.fill!=null||i.src!=null||i.stroke!=null||i["stroke-width"]!=null||i["stroke-opacity"]!=null||i["fill-opacity"]!=null||i["stroke-dasharray"]!=null||i["stroke-miterlimit"]!=null||i["stroke-linejoin"]!=null||i["stroke-linecap"]!=null){var J=l.getElementsByTagName(j),K=!1;J=J&&J[0],!J&&(K=J=B(j)),e.type=="image"&&i.src&&(J.src=i.src),i.fill&&(J.on=!0);if(J.on==null||i.fill=="none"||i.fill===null)J.on=!1;if(J.on&&i.fill){var L=c(i.fill).match(a._ISURL);if(L){J.parentNode==l&&l.removeChild(J),J.rotate=!0,J.src=L[1],J.type="tile";var M=e.getBBox(1);J.position=M.x+n+M.y,e._.fillpos=[M.x,M.y],a._preload(L[1],function(){e._.fillsize=[this.offsetWidth,this.offsetHeight]})}else J.color=a.getRGB(i.fill).hex,J.src=o,J.type="solid",a.getRGB(i.fill).error&&(t.type in{circle:1,ellipse:1}||c(i.fill).charAt()!="r")&&addGradientFill(t,i.fill,J)&&(m.fill="none",m.gradient=i.fill,J.rotate=!1)}if("fill-opacity"in i||"opacity"in i){var N=((+m["fill-opacity"]+1||2)-1)*((+m.opacity+1||2)-1)*((+a.getRGB(i.fill).o+1||2)-1);N=h(g(N,0),1),J.opacity=N,J.src&&(J.color="none")}l.appendChild(J);var O=l.getElementsByTagName("stroke")&&l.getElementsByTagName("stroke")[0],P=!1;!O&&(P=O=B("stroke"));if(i.stroke&&i.stroke!="none"||i["stroke-width"]||i["stroke-opacity"]!=null||i["stroke-dasharray"]||i["stroke-miterlimit"]||i["stroke-linejoin"]||i["stroke-linecap"])O.on=!0;(i.stroke=="none"||i.stroke===null||O.on==null||i.stroke==0||i["stroke-width"]==0)&&(O.on=!1);var Q=a.getRGB(i.stroke);O.on&&i.stroke&&(O.color=Q.hex),N=((+m["stroke-opacity"]+1||2)-1)*((+m.opacity+1||2)-1)*((+Q.o+1||2)-1);var T=(d(i["stroke-width"])||1)*.75;N=h(g(N,0),1),i["stroke-width"]==null&&(T=m["stroke-width"]),i["stroke-width"]&&(O.weight=T),T&&T<1&&(N*=T)&&(O.weight=1),O.opacity=N,i["stroke-linejoin"]&&(O.joinstyle=i["stroke-linejoin"]||"miter"),O.miterlimit=i["stroke-miterlimit"]||8,i["stroke-linecap"]&&(O.endcap=i["stroke-linecap"]=="butt"?"flat":i["stroke-linecap"]=="square"?"square":"round");if(i["stroke-dasharray"]){var U={"-":"shortdash",".":"shortdot","-.":"shortdashdot","-..":"shortdashdotdot",". ":"dot","- ":"dash","--":"longdash","- .":"dashdot","--.":"longdashdot","--..":"longdashdotdot"};O.dashstyle=U[b](i["stroke-dasharray"])?U[i["stroke-dasharray"]]:o}P&&l.appendChild(O)}if(t.type=="text"){t.paper.canvas.style.display=o;var V=t.paper.span,W=100,X=m.font&&m.font.match(/\d+(?:\.\d*)?(?=px)/);p=V.style,m.font&&(p.font=m.font),m["font-family"]&&(p.fontFamily=m["font-family"]),m["font-weight"]&&(p.fontWeight=m["font-weight"]),m["font-style"]&&(p.fontStyle=m["font-style"]),X=d(X?X[0]:m["font-size"]),p.fontSize=X*W+"px",t.textpath.string&&(V.innerHTML=c(t.textpath.string).replace(/</g,"&#60;").replace(/&/g,"&#38;").replace(/\n/g,"<br>"));var Y=V.getBoundingClientRect();t.W=m.w=(Y.right-Y.left)/W,t.H=m.h=(Y.bottom-Y.top)/W,t.X=m.x,t.Y=m.y+t.H/2,("x"in i||"y"in i)&&(t.path.v=a.format("m{0},{1}l{2},{1}",f(m.x*u),f(m.y*u),f(m.x*u)+1));var Z=["x","y","text","font","font-family","font-weight","font-style","font-size"];for(var $=0,_=Z.length;$<_;$++)if(Z[$]in i){t._.dirty=1;break}switch(m["text-anchor"]){case"start":t.textpath.style["v-text-align"]="left",t.bbx=t.W/2;break;case"end":t.textpath.style["v-text-align"]="right",t.bbx=-t.W/2;break;default:t.textpath.style["v-text-align"]="center",t.bbx=0}t.textpath.style["v-text-kern"]=!0}},addGradientFill=function(b,f,g){b.attrs=b.attrs||{};var h=b.attrs,i=Math.pow,j,k,l="linear",m=".5 .5";b.attrs.gradient=f,f=c(f).replace(a._radial_gradient,function(a,b,c){l="radial",b&&c&&(b=d(b),c=d(c),i(b-.5,2)+i(c-.5,2)>.25&&(c=e.sqrt(.25-i(b-.5,2))*((c>.5)*2-1)+.5),m=b+n+c);return o}),f=f.split(/\s*\-\s*/);if(l=="linear"){var p=f.shift();p=-d(p);if(isNaN(p))return null}var q=a._parseDots(f);if(!q)return null;b=b.shape||b.node;if(q.length){b.removeChild(g),g.on=!0,g.method="none",g.color=q[0].color,g.color2=q[q.length-1].color;var r=[];for(var s=0,t=q.length;s<t;s++)q[s].offset&&r.push(q[s].offset+n+q[s].color);g.colors=r.length?r.join():"0% "+g.color,l=="radial"?(g.type="gradientTitle",g.focus="100%",g.focussize="0 0",g.focusposition=m,g.angle=0):(g.type="gradient",g.angle=(270-p)%360),b.appendChild(g)}return 1},Element=function(b,c){this[0]=this.node=b,b.raphael=!0,this.id=a._oid++,b.raphaelid=this.id,this.X=0,this.Y=0,this.attrs={},this.paper=c,this.matrix=a.matrix(),this._={transform:[],sx:1,sy:1,dx:0,dy:0,deg:0,dirty:1,dirtyT:1},!c.bottom&&(c.bottom=this),this.prev=c.top,c.top&&(c.top.next=this),c.top=this,this.next=null};var A=a.el;Element.prototype=A,A.constructor=Element,A.transform=function(b){if(b==null)return this._.transform;var d=this.paper._viewBoxShift,e=d?"s"+[d.scale,d.scale]+"-1-1t"+[d.dx,d.dy]:o,f;d&&(f=b=c(b).replace(/\.{3}|\u2026/g,this._.transform||o)),a._extractTransform(this,e+b);var g=this.matrix.clone(),h=this.skew,i=this.node,j,k=~c(this.attrs.fill).indexOf("-"),l=!c(this.attrs.fill).indexOf("url(");g.translate(-0.5,-0.5);if(l||k||this.type=="image"){h.matrix="1 0 0 1",h.offset="0 0",j=g.split();if(k&&j.noRotation||!j.isSimple){i.style.filter=g.toFilter();var m=this.getBBox(),p=this.getBBox(1),q=m.x-p.x,r=m.y-p.y;i.coordorigin=q*-u+n+r*-u,z(this,1,1,q,r,0)}else i.style.filter=o,z(this,j.scalex,j.scaley,j.dx,j.dy,j.rotate)}else i.style.filter=o,h.matrix=c(g),h.offset=g.offset();f&&(this._.transform=f);return this},A.rotate=function(a,b,e){if(this.removed)return this;if(a!=null){a=c(a).split(k),a.length-1&&(b=d(a[1]),e=d(a[2])),a=d(a[0]),e==null&&(b=e);if(b==null||e==null){var f=this.getBBox(1);b=f.x+f.width/2,e=f.y+f.height/2}this._.dirtyT=1,this.transform(this._.transform.concat([["r",a,b,e]]));return this}},A.translate=function(a,b){if(this.removed)return this;a=c(a).split(k),a.length-1&&(b=d(a[1])),a=d(a[0])||0,b=+b||0,this._.bbox&&(this._.bbox.x+=a,this._.bbox.y+=b),this.transform(this._.transform.concat([["t",a,b]]));return this},A.scale=function(a,b,e,f){if(this.removed)return this;a=c(a).split(k),a.length-1&&(b=d(a[1]),e=d(a[2]),f=d(a[3]),isNaN(e)&&(e=null),isNaN(f)&&(f=null)),a=d(a[0]),b==null&&(b=a),f==null&&(e=f);if(e==null||f==null)var g=this.getBBox(1);e=e==null?g.x+g.width/2:e,f=f==null?g.y+g.height/2:f,this.transform(this._.transform.concat([["s",a,b,e,f]])),this._.dirtyT=1;return this},A.hide=function(){!this.removed&&(this.node.style.display="none");return this},A.show=function(){!this.removed&&(this.node.style.display=o);return this},A._getBBox=function(){if(this.removed)return{};return this.type=="text"?{x:this.X+(this.bbx||0)-this.W/2,y:this.Y-this.H,width:this.W,height:this.H}:pathDimensions(this.attrs.path)},A.remove=function(){if(!this.removed){this.paper.__set__&&this.paper.__set__.exclude(this),a.eve.unbind("*.*."+this.id),a._tear(this,this.paper),this.node.parentNode.removeChild(this.node),this.shape&&this.shape.parentNode.removeChild(this.shape);for(var b in this)delete this[b];this.removed=!0}},A.attr=function(c,d){if(this.removed)return this;if(c==null){var e={};for(var f in this.attrs)this.attrs[b](f)&&(e[f]=this.attrs[f]);e.gradient&&e.fill=="none"&&(e.fill=e.gradient)&&delete e.gradient,e.transform=this._.transform;return e}if(d==null&&a.is(c,"string")){if(c==j&&this.attrs.fill=="none"&&this.attrs.gradient)return this.attrs.gradient;var g=c.split(k),h={};for(var i=0,m=g.length;i<m;i++)c=g[i],c in this.attrs?h[c]=this.attrs[c]:a.is(this.paper.customAttributes[c],"function")?h[c]=this.paper.customAttributes[c].def:h[c]=a._availableAttrs[c];return m-1?h:h[g[0]]}if(this.attrs&&d==null&&a.is(c,"array")){h={};for(i=0,m=c.length;i<m;i++)h[c[i]]=this.attr(c[i]);return h}var n;d!=null&&(n={},n[c]=d),d==null&&a.is(c,"object")&&(n=c);for(var o in n)l("attr."+o+"."+this.id,this,n[o]);if(n){for(o in this.paper.customAttributes)if(this.paper.customAttributes[b](o)&&n[b](o)&&a.is(this.paper.customAttributes[o],"function")){var p=this.paper.customAttributes[o].apply(this,[].concat(n[o]));this.attrs[o]=n[o];for(var q in p)p[b](q)&&(n[q]=p[q])}n.text&&this.type=="text"&&(this.textpath.string=n.text),setFillAndStroke(this,n)}return this},A.toFront=function(){!this.removed&&this.node.parentNode.appendChild(this.node),this.paper&&this.paper.top!=this&&a._tofront(this,this.paper);return this},A.toBack=function(){if(this.removed)return this;this.node.parentNode.firstChild!=this.node&&(this.node.parentNode.insertBefore(this.node,this.node.parentNode.firstChild),a._toback(this,this.paper));return this},A.insertAfter=function(b){if(this.removed)return this;b.constructor==a.st.constructor&&(b=b[b.length-1]),b.node.nextSibling?b.node.parentNode.insertBefore(this.node,b.node.nextSibling):b.node.parentNode.appendChild(this.node),a._insertafter(this,b,this.paper);return this},A.insertBefore=function(b){if(this.removed)return this;b.constructor==a.st.constructor&&(b=b[0]),b.node.parentNode.insertBefore(this.node,b.node),a._insertbefore(this,b,this.paper);return this},A.blur=function(b){var c=this.node.runtimeStyle,d=c.filter;d=d.replace(r,o),+b!==0?(this.attrs.blur=b,c.filter=d+n+m+".Blur(pixelradius="+(+b||1.5)+")",c.margin=a.format("-{0}px 0 0 -{0}px",f(+b||1.5))):(c.filter=d,c.margin=0,delete this.attrs.blur)},a._engine.path=function(a,b){var c=B("shape");c.style.cssText=t,c.coordsize=u+n+u,c.coordorigin=b.coordorigin;var d=new Element(c,b),e={fill:"none",stroke:"#000"};a&&(e.path=a),d.type="path",d.path=[],d.Path=o,setFillAndStroke(d,e),b.canvas.appendChild(c);var f=B("skew");f.on=!0,c.appendChild(f),d.skew=f,d.transform(o);return d},a._engine.rect=function(b,c,d,e,f,g){var h=a._rectPath(c,d,e,f,g),i=b.path(h),j=i.attrs;i.X=j.x=c,i.Y=j.y=d,i.W=j.width=e,i.H=j.height=f,j.r=g,j.path=h,i.type="rect";return i},a._engine.ellipse=function(a,b,c,d,e){var f=a.path(),g=f.attrs;f.X=b-d,f.Y=c-e,f.W=d*2,f.H=e*2,f.type="ellipse",setFillAndStroke(f,{cx:b,cy:c,rx:d,ry:e});return f},a._engine.circle=function(a,b,c,d){var e=a.path(),f=e.attrs;e.X=b-d,e.Y=c-d,e.W=e.H=d*2,e.type="circle",setFillAndStroke(e,{cx:b,cy:c,r:d});return e},a._engine.image=function(b,c,d,e,f,g){var h=a._rectPath(d,e,f,g),i=b.path(h).attr({stroke:"none"}),k=i.attrs,l=i.node,m=l.getElementsByTagName(j)[0];k.src=c,i.X=k.x=d,i.Y=k.y=e,i.W=k.width=f,i.H=k.height=g,k.path=h,i.type="image",m.parentNode==l&&l.removeChild(m),m.rotate=!0,m.src=c,m.type="tile",i._.fillpos=[d,e],i._.fillsize=[f,g],l.appendChild(m),z(i,1,1,0,0,0);return i},a._engine.text=function(b,d,e,g){var h=B("shape"),i=B("path"),j=B("textpath");d=d||0,e=e||0,g=g||"",i.v=a.format("m{0},{1}l{2},{1}",f(d*u),f(e*u),f(d*u)+1),i.textpathok=!0,j.string=c(g),j.on=!0,h.style.cssText=t,h.coordsize=u+n+u,h.coordorigin="0 0";var k=new Element(h,b),l={fill:"#000",stroke:"none",font:a._availableAttrs.font,text:g};k.shape=h,k.path=i,k.textpath=j,k.type="text",k.attrs.text=c(g),k.attrs.x=d,k.attrs.y=e,k.attrs.w=1,k.attrs.h=1,setFillAndStroke(k,l),h.appendChild(j),h.appendChild(i),b.canvas.appendChild(h);var m=B("skew");m.on=!0,h.appendChild(m),k.skew=m,k.transform(o);return k},a._engine.setSize=function(a,b){var c=this.canvas.style;this.width=a,this.height=b,a==+a&&(a+="px"),b==+b&&(b+="px"),c.width=a,c.height=b,c.clip="rect(0 "+a+" "+b+" 0)",this._viewBox&&setViewBox.apply(this,this._viewBox);return this},a._engine.setViewBox=function(b,c,d,e,f){a.eve("setViewBox",this,this._viewBox,[b,c,d,e,f]);var h=this.width,i=this.height,j=1/g(d/h,e/i),k,l;f&&(k=i/e,l=h/d,d*k<h&&(b-=(h-d*k)/2/k),e*l<i&&(c-=(i-e*l)/2/l)),this._viewBox=[b,c,d,e,!!f],this._viewBoxShift={dx:-b,dy:-c,scale:j},this.forEach(function(a){a.transform("...")});return this};var B,C=function(a){var b=a.document;b.createStyleSheet().addRule(".rvml","behavior:url(#default#VML)");try{!b.namespaces.rvml&&b.namespaces.add("rvml","urn:schemas-microsoft-com:vml"),B=function(a){return b.createElement("<rvml:"+a+' class="rvml">')}}catch(c){B=function(a){return b.createElement("<"+a+' xmlns="urn:schemas-microsoft.com:vml" class="rvml">')}}};C(a._g.win),a._engine.create=function(){var b=a._getContainer.apply(0,arguments),c=b.container,d=b.height,e,f=b.width,g=b.x,h=b.y;if(!c)throw new Error("VML container not found.");var i=new a._Paper,j=i.canvas=a._g.doc.createElement("div"),k=j.style;g=g||0,h=h||0,f=f||512,d=d||342,i.width=f,i.height=d,f==+f&&(f+="px"),d==+d&&(d+="px"),i.coordsize=u*1e3+n+u*1e3,i.coordorigin="0 0",i.span=a._g.doc.createElement("span"),i.span.style.cssText="position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;",j.appendChild(i.span),k.cssText=a.format("top:0;left:0;width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden",f,d),c==1?(a._g.doc.body.appendChild(j),k.left=g+"px",k.top=h+"px",k.position="absolute"):c.firstChild?c.insertBefore(j,c.firstChild):c.appendChild(j),i.renderfix=function(){};return i},a.prototype.clear=function(){a.eve("clear",this),this.canvas.innerHTML=o,this.span=a._g.doc.createElement("span"),this.span.style.cssText="position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;",this.canvas.appendChild(this.span),this.bottom=this.top=null},a.prototype.remove=function(){a.eve("remove",this),this.canvas.parentNode.removeChild(this.canvas);for(var b in this)this[b]=removed(b);return!0};var D=a.st;for(var E in A)A[b](E)&&!D[b](E)&&(D[E]=function(a){return function(){var b=arguments;return this.forEach(function(c){c[a].apply(c,b)})}}(E))}(window.Raphael)
},{}]},{},[23])(23)
});