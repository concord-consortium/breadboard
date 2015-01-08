
var LogEvent        = require('../models/log'),
    util            = require('../helpers/util'),
    logController   = require('../controllers/log-controller'),
    extend          = require('../helpers/util').extend,
    MultimeterBase  = require('./multimeter-base'),
    Breadboard      = require('./breadboard');

/*
 * Digital Multimeter for breadboard activities
 *
 */
Multimeter = function () {
  Multimeter.uber.init.apply(this);
  this.reset();
};

extend(Multimeter, MultimeterBase, {

  reset: function() {
    this.dialPosition = 'dcv_20';
    this.powerOn = true;
    this.redProbeConnection = null;
    this.blackProbeConnection = null;
    this.displayText = "";
    this.update();
  },

  currentMeasurement: null,

  update: function () {
    if (this.redProbeConnection && this.blackProbeConnection) {
      if (this.dialPosition.indexOf('dcv_') > -1){
        this.currentMeasurement = "voltage";
      } else if (this.dialPosition.indexOf('dca_') > -1){
        this.currentMeasurement = "current";
      } else if (this.dialPosition.indexOf('r_') > -1){
        this.currentMeasurement = "resistance";
      } else if (this.dialPosition.indexOf('acv_') > -1){
        this.currentMeasurement = "ac_voltage";
      } else {
        this.currentMeasurement = null;
      }

      if (!!this.currentMeasurement){
        Breadboard.breadModel('query', this.currentMeasurement, this.redProbeConnection + ',' + this.blackProbeConnection, this.updateWithData, this);
      }
    } else {
      this.updateWithData();
    }
  },

  // this is called after update() is called and ciso returns
  updateWithData: function (ciso) {
    var measurement = this.currentMeasurement,
        source, b, p1, p2, v1, v2, current, drop,
        result;

    if (ciso) {
      source = ciso.voltageSources[0],
      b  = Breadboard.getBreadBoard();
      p1 = b.getHole(this.redProbeConnection).nodeName();
      p2 = b.getHole(this.blackProbeConnection).nodeName();
      if (measurement === "resistance") {
        if (p1 === p2) {
          result = 0;
        } else {
          current = ciso.getCurrent('ohmmeterBattery');
          result = 1/current.magnitude;
        }
      } else if (measurement === "voltage" || measurement === "ac_voltage" || measurement === "current") {
          v1 = ciso.getVoltageAt(p1);   // complex
          v2 = ciso.getVoltageAt(p2);

        // exit quickly if ciso was not able to solve circuit
        if (!v1 || !v2) {
          this.absoluteValue = 0;
          this.updateDisplay();
          return;
        }

        drop = v1.subtract(v2).magnitude;

        if (measurement === "current") {
          result = drop / 1e-6;
        } else {
          result = drop;
        }
      }

      if (result){
        // if in wrong voltage mode for AC/DC voltage, show zero
        source = Breadboard.getBreadBoard().components.source;
        if (!!source &&
           ((measurement === 'voltage' && source.frequency) ||
            (measurement === 'ac_voltage' && source.frequency === 0))) {
          result = 0;
        } else if (measurement === "ac_voltage" ||
                    (measurement === 'current' && source && source.frequency)){
          // the following applies to both RMS voltage and RMS current
          // first, if we are dealing with a function generator, scale by the appropriate scale factor
          if (!!source.amplitudeScaleFactor || source.amplitudeScaleFactor === 0){
            result = result * source.amplitudeScaleFactor;
          }
          result = result / Math.sqrt(2);         // RMS voltage or RMS current
        }
        result = Math.round(result*Math.pow(10,8))/Math.pow(10,8);

        this.absoluteValue = Math.abs(result);

        if (measurement === "current" && this.absoluteValue > 0.44){
          this.blowFuse();
        }
      } else {
        this.absoluteValue = 0;
      }
    } else {
      this.absoluteValue = 0;
    }

    this.updateDisplay();

    if (this.redProbeConnection && this.blackProbeConnection) {
      logController.addEvent(LogEvent.DMM_MEASUREMENT, {
        "measurement": measurement,
        "dial_position": this.dialPosition,
        "red_probe": this.redProbeConnection,
        "black_probe": this.blackProbeConnection,
        "result": this.displayText});
    }
  },

  blowFuse: function() {
    apMessageBox.error({
      title: "POW!",
      message: "<b>You just blew the fuse in your multimeter!</b><br><br> Remember not to pass too much current through it."+
      " We've replaced your fuse for you, but you lost some time.",
      errorImage: "common/error-32x32.png",
      width: 400,
      height: 300
    });
    logController.addEvent(LogEvent.BLEW_FUSE);
  },

  allConnected: function () {
      return this.redProbeConnection !== null &&
          this.blackProbeConnection !== null &&
          this.powerOn;
  },

  _getResultsIndex: function (results) {
    var i = 0,
        source = Breadboard.getBreadBoard().components.source;
    if (source && source.setFrequency && results.acfrequency){
      i = util.getClosestIndex(results.acfrequency, source.frequency, true);
    }
    return i;
  }
});

module.exports = Multimeter;
