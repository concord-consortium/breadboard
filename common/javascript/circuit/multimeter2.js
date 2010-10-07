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
                var measurement = null;
                if (this.dialPosition.indexOf('dcv_') > -1){
                  measurement = "voltage"
                } else if (this.dialPosition.indexOf('dca_') > -1){
                   measurement = "current"
                } else if (this.dialPosition.indexOf('r_') > -1){
                      measurement = "resistance"
                }
                console.log("measurement = "+measurement+", this.dialPosition = "+this.dialPosition);
                
                if (!!measurement){
                  if (measurement === "voltage"){
                    console.log("going to measure voltage, m="+measurement);
                    this.v_value = Math.abs(breadModel('query', measurement, this.redProbeConnection + ',' + this.blackProbeConnection));
                  } else if (measurement === "current"){
                      console.log("going to measure current, m="+measurement);
                    this.i_value = Math.abs(breadModel('query', measurement, this.redProbeConnection + ',' + this.blackProbeConnection));
                  } else if (measurement === "resistance"){
                      console.log("going to measure resistance, m="+measurement);
                    this.r_value = Math.abs(breadModel('query', measurement, this.redProbeConnection + ',' + this.blackProbeConnection));
                    console.log("r_value = "+this.r_value);
                  }
                }
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
