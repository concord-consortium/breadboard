//= require <setup-common>
//= require "breadboard"
//= require "multimeter-base"

/* FILE multimeter2.js */

(function () {

    var circuit = sparks.circuit;
    var flash = sparks.flash;
    
    /*
     * Digital Multimeter for breadboard activities
     * 
     */
    circuit.Multimeter2 = function () {
        circuit.Multimeter2.uber.init.apply(this);
        this.dialPosition = 'dcv_20';
        this.powerOn = true;
        this.update();
    };

    sparks.extend(circuit.Multimeter2, circuit.MultimeterBase, {
            
        update: function () {
            console.log('ENTER Multimeter2#update');
            console.log('redProbeConnection=' + this.redProbeConnection);
            console.log('blackProbeConnection=' + this.blackProbeConnection);

            if (this.redProbeConnection && this.blackProbeConnection) {
                this.v_value = Math.abs(breadModel('query', 'voltage', this.redProbeConnection + ',' + this.blackProbeConnection));
                console.log('v=' + this.v_value);
            }
            else {
                this.v_value = 0;
            }
            this.updateDisplay();
        },

        allConnected: function () {
            return this.redProbeConnection !== null && 
                this.blackProbeConnection !== null &&
                this.powerOn;
        }
    });

})();
