//= require <setup-common>
//= require "breadboard"
//= require "multimeter-base"

/* FILE multimeter2.js */

/*globals console sparks $ breadModel getBreadBoard apMessageBox*/

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
        this.measurements = {};
    };

    sparks.extend(circuit.Multimeter2, circuit.MultimeterBase, {
            
        update: function () {

            if (this.redProbeConnection && this.blackProbeConnection) {
                var measurement = null;
                if (this.dialPosition.indexOf('dcv_') > -1){
                  measurement = "voltage";
                } else if (this.dialPosition.indexOf('dca_') > -1){
                   measurement = "current";
                } else if (this.dialPosition.indexOf('r_') > -1){
                      measurement = "resistance";
                }
                
                if (!!measurement){
                  if (measurement === "voltage"){
                    this.v_value = this.makeMeasurement(measurement);
                  } else if (measurement === "current"){
                    this.i_value = this.makeMeasurement(measurement);
                    if (this.i_value > 0.44){
                      this.blowFuse();
                    }
                  } else if (measurement === "resistance"){
                    this.r_value = this.makeMeasurement(measurement);
                    console.log("r_value = "+this.r_value);
                  }
                }
            }
            else {
                this.v_value = 0;
            }
            
            
            this.updateDisplay();
            
            if (this.redProbeConnection && this.blackProbeConnection) {
              sparks.logController.addEvent(sparks.LogEvent.DMM_MEASUREMENT, {
                "measurement": measurement, 
                "dial_position": this.dialPosition,
                "red_probe": this.redProbeConnection,
                "black_probe": this.blackProbeConnection,
                "result": this.displayText});
            }
        },
        
        makeMeasurement: function(measurementType) {
          var netlist = sparks.circuit.qucsator.makeNetlist(getBreadBoard());
          var measurmentKey = "" + netlist.replace(/\n/g, '') + this.redProbeConnection + this.blackProbeConnection + measurementType;
          var existingMeasurement = this.measurements[measurmentKey];
          if (existingMeasurement !== undefined && existingMeasurement !== null){
            return existingMeasurement;
          } else {
            var measurement = Math.abs(breadModel('query', measurementType, this.redProbeConnection + ',' + this.blackProbeConnection));
            this.measurements[measurmentKey] = measurement;
            return measurement;
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
          sparks.logController.addEvent(sparks.LogEvent.BLEW_FUSE);
        },

        allConnected: function () {
            return this.redProbeConnection !== null && 
                this.blackProbeConnection !== null &&
                this.powerOn;
        }
    });

})();
