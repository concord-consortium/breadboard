var extend            = require('../helpers/util').extend,
    ReactiveComponent = require('./reactive-component');

Inductor = function (props, breadboardController) {
  Inductor.parentConstructor.call(this, props, breadboardController);
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
