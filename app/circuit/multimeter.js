//= require <setup-common>
//= require "multimeter-base"

/* FILE multimeter.js */

(function () {

    var circuit = sparks.circuit;

    /*
     * Digital Multimeter
     * Used by Module-1 "Measuring Resistance"
     */
    circuit.Multimeter = function () {
        circuit.Multimeter.uber.init.apply(this);
    };

    sparks.extend(circuit.Multimeter, circuit.MultimeterBase, {

        update : function () {
            this.r_value = sparks.activity.currentResistor.getRealValue();
            this.updateDisplay();
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
    });

})();
