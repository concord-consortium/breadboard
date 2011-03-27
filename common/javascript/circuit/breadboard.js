//= require "qucsator"
//= require <circuit/resistor>
//= require <circuit/component>

/* FILE breadboard.js */

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
            negative: new Strip( null, "powerNegL")
          },
          right:{
            positive: new Strip( null, "powerPosR" ),
            negative: new Strip( null, "powerNegR" )
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

      Breadboard.prototype.makeStrip = function (name) {
        var stripLen = this.strips.length;
        this.strips[ stripLen ] = new Strip(null, name);
        return this.strips[ stripLen ];
      };

      Breadboard.prototype.component = function (props) {
        if(typeof props=='string'){
          return this.components[props];
        }else {
          if (props.kind === "resistor"){
            return new sparks.circuit.Resistor(props, breadBoard);
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
          
          var newComponent;
          newComponent = breadBoard.component(props);
          return newComponent.UID;
        },
        createCircuit: function(jsonCircuit){
          $.each(jsonCircuit, function(i, spec){
            interfaces.insertComponent(spec.type, spec);
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
        getUID: function(name){
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
          $.each(breadBoard.holeMap, function(oldHoleName, newHoleName){
            interfaces.unmapHole(oldHoleName);
          })
        },
        addRandomResistor: function(name, location, options){
          console.log("WARNING: addRandomResistor is deprecated")
          var resistor = new sparks.circuit.Resistor4band(name);
          resistor.randomize((options | null));
          interfaces.insert('resistor', location, resistor.getRealValue(), name, resistor.colors);
          return resistor;
        },
        query: function(type, connections){
          // Current dummy function will pass query to model
          // Model will then compile SPICE net list and send to server
          // Server will respond with voltage at queried points
          // Power and MultiMeter settings will be assumed

          //debug( breadBoard.query( arguments[1].split(',') ) );
          
          // console.log("at time of measuring, netlist = ");
          // console.log(q.makeNetlist(breadBoard));
          
          var tempComponents = [];
          
          if (type === 'resistance') {
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
              connections: [ghost, connections[1]]});
            tempComponents.push(ohmmeterBattery, currentProbe);
          } else {
            if (type === 'voltage'){
              var voltmeterResistor = breadBoard.component({
                UID: 'voltmeterResistor', 
                kind: 'resistor', 
                resistance: 1000000000000,
                connections: connections.split(',')});
              tempComponents.push(voltmeterResistor);
            }
            var probe = breadBoard.component({
              UID: 'meter',
              kind: {'current' : 'iprobe', 'voltage' : 'vprobe'}[type],
              connections: connections.split(',')});
            tempComponents.push(probe);
          }
          
          // attach batteries to rails on the fly. This is weird -- why don't we
          // attach the batteries from the start, or when user attaches them?
          // if (type != 'resistance') {
          tempComponents.push(breadBoard.component({
            UID: 'leftRailPower', 
            kind: 'battery', 
            voltage: 9,
            connections: ["left_positive1", "left_negative1"]}));

          tempComponents.push(breadBoard.component({
            UID: 'rightRailPower', 
            kind: 'battery', 
            voltage: 9,
            connections:  ["right_positive1", "right_negative1"]}));
          // }

          var result;
          
          q.qucsate(q.makeNetlist(breadBoard),
                  function (r) { result = r.meter; } );

          console.log('result=' + result);
          
          $.each(tempComponents, function(i, component){
            component.destroy();
          });

          if (type === 'resistance') {
            result = (1 / result);
          }
          result = -1 * result;
          
          // round to 8 decimal places
          result = Math.round(result*Math.pow(10,8))/Math.pow(10,8);
          //document.getElementById('dmm-output').innerHTML = "Meter Reading: " + result;
          return  result;
        },
        updateFlash: function() {
          $.each(breadBoard.components, function(name, component) {
            
            if (!!component.connections[0] && !!component.connections[1]){
              var location = component.connections[0].getName() + "," + component.connections[1].getName();
            
              switch (component.kind) {
                case "resistor":
                  if (component.resistance > 0){
                    sparks.flash.sendCommand('insert_component', 'resistor', name, location, '4band', component.label, component.colors);
                  } else {
                    sparks.flash.sendCommand('insert_component', 'resistor', name, location, 'wire', component.label, null);
                  }
                  break;
                case "wire":
                  var color;
                  if (location.indexOf("positive") > -1){
                    color = "0xaa0000";
                  } else if (location.indexOf("negative") > -1){
                    color = "0x000000";
                  } else {
                    if (Math.random() < 0.5){
                      color = "0x008800";
                    } else {
                      color = "0x000088";
                    }
                  }
                  sparks.flash.sendCommand('insert_component', 'wire', component.UID, location, color);
                  break;
              }
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
        
        if (func === 'query') {
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
