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
                    if (this.i_value > .44){
                      this.blowFuse();
                    }
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
            
            if (this.redProbeConnection && this.blackProbeConnection) {
              sparks.sparksLogController.addEvent(sparks.LogEvent.DMM_MEASUREMENT, {
                "measurement": measurement, 
                "dial_position": this.dialPosition,
                "red_probe": this.redProbeConnection,
                "black_probe": this.blackProbeConnection,
                "result": this.displayText});
            }
        },
        
        blowFuse: function() {
          sparks.flash.sendCommand('mouse_up');
          apMessageBox.error({
          	title: "POW!",
          	message: "<b>You just blew the fuse in your multimeter!</b><br><br> Remember not to pass too much current through it."+
          	" We've replaced your fuse for you, but you lost some time.",
          	errorImage: "../../lib/error-32x32.png",
          	width: 400,
          	height: 300
          });
          sparks.sparksLogController.addEvent(sparks.LogEvent.BLEW_FUSE);
        },

        allConnected: function () {
            return this.redProbeConnection !== null && 
                this.blackProbeConnection !== null &&
                this.powerOn;
        }
    });

})();
