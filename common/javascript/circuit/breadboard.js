//= require "qucsator"

/* FILE breadboard.js */

(function () {

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
        if(defs.debug){
          if(typeof console!=='undefined'){
            console.log(arguments[0]);
          }else{
            if(!HTMLLog){
              HTMLLog = document.createElement('div');
              HTMLLog.setAttribute("id", "HTMLLog");
              HTMLBody = document.getElementsByTagName('body')[0];
              HTMLBody.appendChild(HTMLLog);
              HTMLLog.innerHTML += '<b>HTML-DEBUG-LOG:</b></b><br />';
            }
            HTMLLog.innerHTML += arguments[0] + '<br />';
          }
        }
      };

    ////////////////////////////////////////////////////////////////////////////////
    //// R E S I S T O R ///////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

      this.Resistor = {
        colorMap : { '-1': 'gold', '-2': 'silver',
            0 : 'black', 1 : 'brown', 2 : 'red', 3 : 'orange',
            4 : 'yellow', 5 : 'green', 6 : 'blue', 7 : 'violet', 8 : 'grey',
            9 : 'white' },
        toleranceColorMap : { 0.01 : 'brown', 0.02 : 'red', 5e-3 : 'green',
            2.5e-3 : 'blue', 1e-3 : 'violet', 5e-4 : 'gray', 5e-2 : 'gold',
            0.1 : 'silver', 0.2 : 'none' },
        getColors4Band: function (ohms, tolerance) {
            var s = ohms.toString();
            var decIx = s.indexOf('.');
            var decLoc = decIx > -1 ? decIx : s.length;
            s = s.replace('.', '');
            var len = s.length;
            for (var i = 0; i < 2 - len; ++i){ s += '0'; }
            var mult = decLoc > 1 ? decLoc - 2 : 10;
            return [ this.colorMap[s.charAt(0)],
                     this.colorMap[s.charAt(1)],
                     this.colorMap[decLoc - 2],
                     this.toleranceColorMap[tolerance]
                   ];
        },
        getColors5Band: function (ohms, tolerance) {
            var s = ohms.toString();
            var decIx = s.indexOf('.');
            var decLoc = decIx > -1 ? decIx : s.length;
            s = s.replace('.', '');
            var len = s.length;
            for (var i = 0; i < 3 - len; ++i) { s += '0'; }
            return [ this.colorMap[s.charAt(0)],
                     this.colorMap[s.charAt(1)],
                     this.colorMap[s.charAt(2)],
                     this.colorMap[decLoc - 3],
                     this.toleranceColorMap[tolerance]
                   ];
        },
        colorToNumber : function(color) {
          for (n in Resistor.colorMap) {
            if (Resistor.colorMap[n] == color) { return parseInt(n); }
          }
        },
        getResistance: function(colors){
          var resistance = Resistor.colorToNumber(colors[0]);
          for ( var i = 1; i < colors.length - 2; i++) {
            resistance = resistance * 10;
            resistance += Resistor.colorToNumber(colors[i]);
          }
          return resistance * Math.pow(10, Resistor.colorToNumber(colors[i]));
        }
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
      }

      var GhostHole = function GhostHole(name) {
        this.name = 'node' + calls;
        return this;
      }

      GhostHole.prototype.nodeName = function() {
        return this.name;
      }

      var Strip = function Strip( holes, name ){
        this.type ='strip';
        this.holes={};
        this.name = name;
        if( holes ){
          for(var i=0, l=holes; i < l; i++){
            this.holes[''+i] = new Hole();
            this.holes[''+i].strip = this;
          }
        }
        return this;
      };

      var Breadboard = function Breadboard(){
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

        for(var i=0, l=defs.powerRailHoles; i < l; i++){
          for(side in this.powerRail) {
            for(end in this.powerRail[side]) {
              var h = side + '_' + end + '_' + i
              this.powerRail[side][end][h] = this.holes[h] = new Hole(this.powerRail[side][end], h);
            }
          }
        }

        // Create board
        for(var i=0, l=defs.rows; i < l; i++ ){
          newStripL = this.makeStrip("L" + i);
          newStripR = this.makeStrip("R" + i);
          for(var a=0, ll=5; a < ll; a++ ){
            var mapCode = String.fromCharCode(a+97)+i;
            newStripL.holes[mapCode] = this.holes[ mapCode ] = new Hole( newStripL, mapCode );
            var mapCode = String.fromCharCode(a+102)+i;
            newStripR.holes[mapCode] = this.holes[ mapCode ] = new Hole( newStripR, mapCode );
          }
        }
        return this;
      };

      Breadboard.prototype.strips=[];
      Breadboard.prototype.components={};
      Breadboard.prototype.holes={};

      Breadboard.prototype.makeStrip = function(name){
        var stripLen = this.strips.length;
        this.strips[ stripLen ] = new Strip(null, name);
        return this.strips[ stripLen ];
      };

      Breadboard.prototype.component = function component(props){
        if(typeof props=='string'){
          return this.components[props];
        }else {
          return new Component(props);
        }
      };

      Breadboard.prototype.clear = function clear(){
        var destroyed = 0;
        for( k in this.components ){
          destroyed += !!this.component(k).destroy();
        }
        return !!destroyed;
      };

      //// COMPONENT MODEL /////////////////////////////////////////////////////////
      var Component = function Component(props){
        console.log('ENTER Component');
        for(var i in props){
          this[i]=props[i];
        }
        this.breadBoard = breadBoard;
        this.breadBoard.components[props.UID] = this;

        this.connections=[];
        for(var i in props.connections){
          console.log('i=' + i);
          if (props.connections[i].nodeName) {
            this.connections[i] = props.connections[i];
          } else {
            this.connections[i] = this.breadBoard.holes[props.connections[i]];
            this.breadBoard.holes[props.connections[i]].connections[this.breadBoard.holes[props.connections[i]].connections.length] = this;
          }
        }
        return this;
      };

      Component.prototype.move = function move(connections){
        for(var i in this.connections){
          for( var j in this.connections[i].connections ){
            if( this.connections[i].connections[j] === this ){
              this.connections[i].connections = [];
            }
          }
          this.connections[i] = [];
        }
        this.connections = [];
        for(var i in connections){
          this.connections[i] = this.breadBoard.holes[connections[i]];
          this.breadBoard.holes[connections[i]].connections[this.breadBoard.holes[connections[i]].connections.length] = this;
        }
        return this;
      };

      Component.prototype.destroy = function destroy(){
        for(var i in this.connections){
          for( var j in this.connections[i].connections ){
            if( this.connections[i].connections[j] === this ){
              this.connections[i].connections = [];
            }
          }
          this.connections[i] = [];
        }
        this.connections = [];
        return delete this.breadBoard.components[this.name];
      };

      //// BreadBoard Instance & Interface /////////////////////////////////////////
      var breadBoard = new Breadboard();

      var interfaces = {
        insert: function(){
          var props = {
            UID         : arguments[0]+calls,
            kind        : arguments[0],
            connections : arguments[1].split(",")
          };

          switch(props.kind) {
            case "resistor":
              if (typeof(arguments[2])==="string") {
                props.resistance = Resistor.getResistance( arguments[2].split(",") );
              }
              else if (typeof(arguments[2])=="number") {
                props.resistance = arguments[2];
              }
              $('#rated_values').text($('#rated_values').text() + ' ' + props.resistance);
              break;
          }
          var newComponent;
          newComponent = breadBoard.component(props);
          return newComponent.UID;
        },
        destroy: function(){
          breadBoard.component(arguments[0]).destroy();
        },
        clear: function() {
          breadBoard.clear();
        },
        move: function(){
          breadBoard.component(arguments[0]).move(arguments[1].split(','));
        },
        query: function(){
          // Current dummy function will pass query to model
          // Model will then compile SPICE net list and send to server
          // Server will respond with voltage at queried points
          // Power and MultiMeter settings will be assumed

          //debug( breadBoard.query( arguments[1].split(',') ) );

          if (arguments[0] === 'resistance') {
            var connections = arguments[1].split(',');
            var ghost = new GhostHole();
            breadBoard.component({
              UID: 'meterBat', 
              kind: 'battery', 
              voltage: 1,
              connections: [connections[0], ghost]});
            breadBoard.component({
              UID: 'meter', 
              kind: 'iprobe',
              connections: [ghost, connections[1]]});
          } else {
            breadBoard.component({
              UID: 'meter', 
              kind: {'current' : 'iprobe', 'voltage' : 'vprobe'}[arguments[0]],
              connections: arguments[1].split(',')});
          }

          breadBoard.component({
            UID: 'bat1', 
            kind: 'battery', 
            voltage: 9,
            connections: ["left_positive_1", "left_negative_1"]});

          breadBoard.component({
            UID: 'bat2', 
            kind: 'battery', 
            voltage: 9,
            connections:  ["right_positive_1", "right_negative_1"]});

          var result;
          
          sparks.circuit.qucsate(sparks.circuit.qucsate.makeNetlist(breadBoard),
                  function(r){ result = r.meter; } );

          console.log('result=' + result);

          breadBoard.component('meter').destroy();
          breadBoard.component('bat1').destroy();
          breadBoard.component('bat2').destroy();

          if (arguments[0] === 'resistance') {
            result = (1 / result)
          }
          result = -1 * result;
          document.getElementById('dmm-output').innerHTML = "Meter Reading: " + result;
          return  result;
        }
      };

      //Stored the number of calls made to the Model: used to create UID
      var calls=0;

      // The inward interface between Flash's ExternalInterface and JavaScript's BreadBoard prototype model instance
      this.breadModel = function () {
        debug(arguments);

        calls++;
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
            $('#popup').text('Calculating...');
            $('#popup').dialog();
            
            var r = interfaces.query.apply(window, ['resistance', arguments[2], arguments[3]]);
            $('#resistance').text(r);
            var c = interfaces.query.apply(window, ['current', arguments[2], arguments[3]]);
            $('#current').text(c);
            var v = interfaces.query.apply(window, ['voltage', arguments[2], arguments[3]]);
            $('#voltage').text(v);
            
            $('#popup').dialog('close');
            return v;
        }
        else {
          return interfaces[func].apply(window, newArgs);
        }
      };

      // The outward interface between JS & Flash
      /*
      this.toFlash = function toFlash(){
        console.log(arguments[0]);
        document.getElementById('swf').fromBreadModel(arguments[0]);
      };
      document.addEventListener('click', function(){ flash("testing!","test2") }, false);
      */

})();
