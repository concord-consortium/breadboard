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
        workbenchController;

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
            if (newComponent.getViewArguments && newComponent.hasValidConnections() && newComponent.kind !== "battery" && !newComponent.hide)
              workbenchController.breadboardView.addComponent(newComponent.getViewArguments());
            if (newComponent.kind == "battery" || newComponent.kind == "function generator" && !newComponent.hide) // FIXME
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
            if (component.getViewArguments && component.hasValidConnections() && component.kind !== "battery" && !component.hide) {
              workbenchController.breadboardView.addComponent(component.getViewArguments());
            }
            if (component.kind == "battery" || component.kind == "function generator" && !component.hide) // FIXME
              workbenchController.breadboardView.addBattery("left_negative21,left_positive21");
          });
        }
      };

      // The inward interface between Flash's ExternalInterface and JavaScript's BreadBoard prototype model instance
      this.breadModel = function () {
        if (!workbenchController) {
          workbenchController = require('../controllers/workbench-controller');   // grrr
        }

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
