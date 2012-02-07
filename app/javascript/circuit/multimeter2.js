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
        this.reset();
    };

    sparks.extend(circuit.Multimeter2, circuit.MultimeterBase, {

        reset: function() {
          this.dialPosition = 'dcv_20';
          this.powerOn = true;
          this.redProbeConnection = null;
          this.blackProbeConnection = null;
          this.update();
        },

        update: function () {
            if (this.redProbeConnection && this.blackProbeConnection) {
                var measurement = null;
                if (this.dialPosition.indexOf('dcv_') > -1){
                  measurement = "voltage";
                } else if (this.dialPosition.indexOf('dca_') > -1){
                  measurement = "current";
                } else if (this.dialPosition.indexOf('r_') > -1){
                  measurement = "resistance";
                } else if (this.dialPosition.indexOf('acv_') > -1){
                  measurement = "ac_voltage";
                }

                if (!!measurement){
                  var resultsBlob = this.makeMeasurement(measurement),
                      meterKey = (measurement === 'voltage' || measurement === 'ac_voltage') ? 'v' : 'i';

                  if (!!meterKey && !!resultsBlob.meter[meterKey]){

                    // get the index of the data we want from the returned QUCS array
                    var index = this._getResultsIndex(resultsBlob);

                    var result = resultsBlob.meter[meterKey][index];

                    // result is a complex number. for the DMM, we only care about the magnitude
                    result = result.magnitude;

                    // process the absolute value
                    result = Math.abs(result);

                    // now do any tweaking we need from that result:

                    // if in wrong voltage mode for AC/DC voltage, show zero
                    var source = getBreadBoard().components.source;
                    if (!!source &&
                       ((measurement === 'voltage' && source.getQucsSimulationType().indexOf(".AC") > -1) ||
                        (measurement === 'ac_voltage' && source.getQucsSimulationType().indexOf(".DC") > -1))) {
                      result = 0;
                    } else if (measurement === 'resistance') {
                      result = 1 / result;
                    } else if (measurement === "ac_voltage" ||
                                (measurement === 'current' && source && source.getQucsSimulationType().indexOf(".AC") > -1)){
                      // the following applies to both RMS voltage and RMS current
                      // first, if we are dealing with a function generator, scale by the appropriate scale factor
                      if (!!source.amplitudeScaleFactor || source.amplitudeScaleFactor === 0){
                        result = result * source.amplitudeScaleFactor;
                      }
                      result = result / Math.sqrt(2);         // RMS voltage or RMS cureent
                    }
                    result = Math.round(result*Math.pow(10,8))/Math.pow(10,8);

                    this.absoluteValue = result;

                    if (measurement === "current"){
                      if (this.absoluteValue > 0.44){
                        this.blowFuse();
                      }
                    }
                  } else {
                    this.absoluteValue = 0;
                  }
                }
            }
            else {
                this.absoluteValue = 0;
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
            var measurement = breadModel('query', measurementType, this.redProbeConnection + ',' + this.blackProbeConnection);
            return measurement;
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
        },

        _getResultsIndex: function (results) {
          var i = 0,
              source = getBreadBoard().components.source;
          if (source && source.setFrequency && results.acfrequency){
            i = sparks.util.getClosestIndex(results.acfrequency, source.frequency, true);
          }
          return i;
        }
    });

})();
