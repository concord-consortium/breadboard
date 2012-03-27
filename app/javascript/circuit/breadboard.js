//= require "qucsator"
//= require <circuit/resistor>
//= require <circuit/variable-resistor>
//= require <circuit/component>

/* FILE breadboard.js */

/*globals console sparks $ breadBoard window*/

(function () {

    var q = sparks.circuit.qucsator;

    ////////////////////////////////////////////////////////////////////////////////
    //// GLOBAL DEFAULTS ///////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

      var defs = {
        rows            : 31,
        powerRailHoles  : 25,
        debug           : true
      };

    ////////////////////////////////////////////////////////////////////////////////
    //// HELPER FUNCTIONS //////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

      // Array Remove from John Resig http://ejohn.org
      var remove = function(array, from, to) {
        var rest = array.slice((to || from) + 1 || array.length);
        array.length = from < 0 ? array.length + from : from;
        return array.push.apply(array, rest);
      };

      var HTMLLog = undefined, HTMLbody = undefined;
      this.debug = function(){
      };

    ////////////////////////////////////////////////////////////////////////////////
    //// B R E A D - B O A R D - M O D E L /////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

      //// BREADBOARD Prototype Model //////////////////////////////////////////////
      this.breadBoard = {};

      var Hole = function Hole( strip, name ){
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

      var GhostHole = function GhostHole(name) {
        this.name = !!name ? name : interfaces.getUID('node');
        return this;
      };

      GhostHole.prototype.nodeName = function() {
        return this.name;
      };

      GhostHole.prototype.getName = function() {
        return this.name;
      };

      var Strip = function Strip( holes, name ){
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

      var Breadboard = function Breadboard(){
        var i;
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
            for (sign in this.powerRail[side]) {
              var h = side + '_' + sign + i;
              this.powerRail[side][sign][h] = this.holes[h] = new Hole(this.powerRail[side][sign], h);
            }
          }
        }

        // Create board
        for (i=0, l=defs.rows; i < l; i++) {
          newStripL = this.makeStrip("L" + i);
          newStripR = this.makeStrip("R" + i);
          for (var a=0, ll=5; a < ll; a++ ) {
            var mapCode = String.fromCharCode(a+97)+i;
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
            return new sparks.circuit.Resistor(props, breadBoard);
          }
          if (props.kind === "variable resistor"){
            return new sparks.circuit.VariableResistor(props, breadBoard);
          }
          if (props.kind === 'inductor') {
            return new sparks.circuit.Inductor(props, breadBoard);
          }
          if (props.kind === 'capacitor') {
            return new sparks.circuit.Capacitor(props, breadBoard);
          }
          if (props.kind === 'battery') {
            return new sparks.circuit.Battery(props, breadBoard);
          }
          if (props.kind === 'function generator') {
            return new sparks.circuit.FunctionGenerator(props, breadBoard);
          }
          if (props.kind === 'wire') {
            return new sparks.circuit.Wire(props, breadBoard);
          }
          if (props.kind === 'powerLead') {
            return new sparks.circuit.PowerLead(props, breadBoard);
          }
          return new sparks.circuit.Component(props, breadBoard);
        }
      };

      Breadboard.prototype.clear = function () {
        this.resOrderOfMagnitude = -1;
        var destroyed = 0;
        for( k in this.components ){
          destroyed += !!this.component(k).destroy();
        }
        this.components = {};
        this.faultyComponents = [];
        return !!destroyed;
      };

      // can pass either a hole or a string
      Breadboard.prototype.getHole = function(hole) {
        if (hole.name){
          if (!!this.holeMap[hole.name]){
            return this.getHole(this.holeMap[hole.getName()]);
          }
          return hole;
        }

        // should be a string

        // replace with mapped name
        if (!!this.holeMap[hole]){
          hole = this.holeMap[hole]
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
        for( i in this.components ){
          var comp = this.component(i);
          for (j in comp.connections){
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
          var componentKeys = sparks.util.getKeys(this.components);
          for (var i = 0; i < count; i++){
            var randomComponent = null;
            while (randomComponent === null) {
              var rand = Math.floor(Math.random() * componentKeys.length);
              var component = this.components[componentKeys[rand]];
              if (!!component.applyFaults && (sparks.util.contains(this.faultyComponents, component) === -1)){
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
      var breadBoard = new Breadboard();

      var interfaces = {
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
            props.connections = "left_positive1,left_negative1";
          }

          var newComponent = breadBoard.component(props);
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

          // check if there is any power source, if not, add a battery
          if (!breadBoard.components["source"]) {
            var battery = {
              UID: "source",
              type: "battery",
              voltage: 9
            }
            interfaces.insertComponent("battery", battery);
          }
          
          // add default power leads
          interfaces.insertComponent("powerLead", {
            UID: "redPowerLead",
            type: "powerLead",
            connections: "left_positive21"
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
        insert: function(type, connections){
          console.log("ERROR: 'insert' is deprecated. Use 'insertComponent'");
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
          var comp = interfaces.findComponent(type, connections)
          if (!!comp){
            comp.destroy();
          }
        },
        findComponent: function(type, connections){
          if (!!type && !!connections && connections.split(",").length === 2){
            connections = connections.split(",");
            for (i in breadBoard.components){
              var component = breadBoard.components[i];
              if (component.kind === type && !!component.connections[0] &&
                ((component.connections[0].getName() === connections[0]
                && component.connections[1].getName() === connections[1]) ||
                (component.connections[0].getName() === connections[1]
                  && component.connections[1].getName() === connections[0]))){
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
          console.log("WARNING: addRandomResistor is deprecated")
          var resistor = new sparks.circuit.Resistor4band(name);
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
          var tempComponents = [];

          // add DMM components as necessary
          if (!!type && type === 'resistance') {
            connections = connections.split(',');
            var ghost = new GhostHole();
            var ohmmeterBattery = breadBoard.component({
              UID: 'ohmmeterBattery',
              kind: 'battery',
              voltage: 1,
              connections: [connections[0], ghost]});
            var currentProbe = breadBoard.component({
              UID: 'meter',
              kind: 'iprobe',
              connections: [connections[1], ghost]});
            tempComponents.push(ohmmeterBattery, currentProbe);
          } else if (!!type) {
            if (type === 'voltage'){
              var voltmeterResistor = breadBoard.component({
                UID: 'voltmeterResistor',
                kind: 'resistor',
                resistance: 1e12,
                connections: connections.split(',')});
              tempComponents.push(voltmeterResistor);
            }
            var probe = breadBoard.component({
              UID: 'meter',
              kind: {'current' : 'iprobe', 'voltage' : 'vprobe', 'ac_voltage' : 'vprobe'}[type],
              connections: connections.split(',')});
            tempComponents.push(probe);
          }

          // get the result from qucsator
          var netlist = q.makeNetlist(breadBoard),
              resultObject;

          q.qucsate(netlist, function (results) {
            callback.call(context, results, callbackArgs);
          } );

          // destroy the temporary DMM components
          $.each(tempComponents, function(i, component){
            component.destroy();
          });
        },
        updateFlash: function() {
          $.each(breadBoard.components, function(i, component) {
            if (component.getFlashArguments && component.hasValidConnections()) {
              var flashArguments = component.getFlashArguments();
              flashArguments.unshift('insert_component');
              sparks.flash.sendCommand.apply(this, flashArguments);
            }
          });
        }
      };

      // The inward interface between Flash's ExternalInterface and JavaScript's BreadBoard prototype model instance
      this.breadModel = function () {
        debug(arguments);
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
