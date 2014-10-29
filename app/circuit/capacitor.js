
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
