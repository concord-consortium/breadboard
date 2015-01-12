//= require circuit/resistor
//= require circuit/variable-resistor
//= require circuit/component

/* FILE breadboard.js */

/*global sparks CiSo $ breadBoard window console*/

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
    workbenchController,


    defs = {
      rows            : 31,
      powerRailHoles  : 25
    },

    Hole,
    GhostHole,
    Strip,
    Breadboard;

////////////////////////////////////////////////////////////////////////////////
//// B R E A D - B O A R D - M O D E L /////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

//// BREADBOARD Prototype Model //////////////////////////////////////////////

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
  this.name = name;
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

  this.strips = [];
  this.components = {};
  this.holes = {};
  this.holeMap = {};
  this.faultyComponents = [];

  // Create power-rails
  this.powerRail = {
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
};

Breadboard.prototype = {
  makeStrip: function (name) {
    var stripLen = this.strips.length;
    this.strips[ stripLen ] = new Strip(null, name);
    return this.strips[ stripLen ];
  },

  createGhostHole: function(hole) {
    return new GhostHole(hole);
  }
}

module.exports = Breadboard;
