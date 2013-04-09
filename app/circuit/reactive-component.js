/* FILE reactive-component.js */
//= require "component"
/*globals console sparks */

(function () {

  sparks.circuit.ReactiveComponent = function (props, breadBoard) {
    if (typeof props.impedance !== 'undefined') {
      props.impedance = this.getRequestedImpedance( props.impedance );
    }

    sparks.circuit.ReactiveComponent.parentConstructor.call(this, props, breadBoard);

    this.applyFaults();
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

          this._componentParameter = sparks.math.roundToSigDigits(componentParameterFromImpedance(this.impedance, this.referenceFrequency), 3);
        }
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
        this.toNetlist = function () {
          var resistance = self.resistance,
              nodes      = self.getNodes();

          return 'R:' + this.UID + ' ' + nodes.join(' ') + ' R="' + resistance + ' Ohm"';
        };
      }
    }

  });

})();
