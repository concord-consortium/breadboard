/* FILE reactive-component.js */
//= require "component"
/*globals console sparks */

(function () {

  sparks.circuit.ReactiveComponent = function (props, breadBoard) {
    if (typeof props.impedance !== 'undefined') {
      props.impedance = this.getRequestedImpedance( props.impedance );
    }
    sparks.circuit.ReactiveComponent.parentConstructor.call(this, props, breadBoard);
  };

  sparks.extend(sparks.circuit.ReactiveComponent, sparks.circuit.Component, {

    // return named component parameter ('inductance' or 'capacitance') if it is set directly on the component;
    // otherwise, calculate the component parameter value from the impedance + referenceFrequency of this component.
    getComponentParameter: function (componentParameterName, componentParameterFromImpedance) {
      // if no cached value, calculate one
      if (typeof this._componentParameter === 'undefined') {
        // use a directly specified component parameter if it exists
        if (typeof this[componentParameterName] !== 'undefined') {
          this._componentParameter = this[componentParameterName];
        }
        else {
          // calculate the parameter from referenceFrequency & requested impedance
          if (typeof this.impedance === 'undefined' || typeof this.referenceFrequency === 'undefined') {
            throw new Error("An impedance/referenceFrequency pair is needed, but not defined.");
          }

          this._componentParameter = componentParameterFromImpedance(this.impedance, this.referenceFrequency);
        }
      }

      return this._componentParameter;
    }

  });

})();
