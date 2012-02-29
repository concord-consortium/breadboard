/*globals sparks getBreadBoard breadModel */
/* FILE oscilloscope.js */

(function () {

    sparks.circuit.Oscilloscope = function () {
      this.probeLocation = null;
      this.view = null;
      this.signals = [];
      var initVerticalScale   = this.INITIAL_VERTICAL_SCALE,
          initHorizontalScale = this.INITIAL_HORIZONTAL_SCALE;
      this._verticalScale = [initVerticalScale, initVerticalScale, initVerticalScale];
      this._horizontalScale = initHorizontalScale;
	  this.showAminusB = false;
	  this.showAplusB = false;
    };

    sparks.circuit.Oscilloscope.prototype = {
      
      N_CHANNELS:     2,
      SOURCE_CHANNEL: 1,
      PROBE_CHANNEL:  2,
      
      HORIZONTAL_SCALES: [1e-3, 5e-4, 2.5e-4, 1e-4, 5e-5, 2.5e-5, 1e-5, 5e-6, 2.5e-6, 1e-6],  // sec/div
      VERTICAL_SCALES:   [100,  50,   25,     10,   5,    2.5,    1,    0.5,  0.25,    0.1],  // V/div
      
      INITIAL_HORIZONTAL_SCALE: 1e-5,
      INITIAL_VERTICAL_SCALE:   5,
      
      reset: function() {
        this.probeLocation = null;
        this.signals = [];
        var initVerticalScale   = this.INITIAL_VERTICAL_SCALE,
            initHorizontalScale = this.INITIAL_HORIZONTAL_SCALE;
        this._verticalScale = [initVerticalScale, initVerticalScale, initVerticalScale];
        this._horizontalScale = initHorizontalScale;
        this.update();
      },
      
      setView: function(view) {
        var i;
        
        this.view = view;
        this.view.setModel(this);
        this.update();         // we can update view immediately with the source trace
      },
      
      // @probe Name of probe being attached. We ignore everything but "red"
      // @location Hole name, like 'a1' or can be null if probe is lifted
      setProbeLocation: function(probe, location) {
        if (probe === "probe_oscope") {
          this.probeLocation = location;
          this.update();
        }
      },
      
      update: function() {
        var breadboard = getBreadBoard(),
            source     = breadboard.components.source,
            sourceSignal,
            probeSignal,
            probeNode,
            data,
            result,
            freqs,
            dataIndex;
            
        if (!source || !source.frequency || !source.amplitude) {
          return;                                     // we must have a source with a freq and an amplitude
        }
        
        sourceSignal = {
          amplitude: source.amplitude * source.amplitudeScaleFactor,
          frequency: source.frequency,
          phase: 0
        };
        
        this.setSignal(this.SOURCE_CHANNEL, sourceSignal);
        
        if (this.probeLocation) {
          probeNode = getBreadBoard().getHole(this.probeLocation).nodeName();

          if (probeNode === 'gnd') {
            // short-circuit this operation and just return a flat trace
            this.setSignal(this.PROBE_CHANNEL, {amplitude: 0, frequency: 0, phase: 0});
            return;
          }
          
          data = breadModel('query');
          
          // first go through the returned frequencies, and find the one that matches our source frequency
          freqs = data.acfrequency;
          dataIndex = sparks.util.getClosestIndex(freqs, source.frequency, true);
          // find the same index in our data
          result = data[probeNode].v[dataIndex];

          if (result) {
            probeSignal = {
              amplitude: result.magnitude * source.amplitudeScaleFactor,
              frequency: source.frequency,
              phase:     result.angle
            };

            this.setSignal(this.PROBE_CHANNEL, probeSignal);
            
            sparks.logController.addEvent(sparks.LogEvent.OSCOPE_MEASUREMENT, {
                "probe": probeNode
              });
          } else {
            this.clearSignal(this.PROBE_CHANNEL);
          }
        } else {
          this.clearSignal(this.PROBE_CHANNEL);
        }
      },
      
      setSignal: function(channel, signal) {
        this.signals[channel] = signal;
        this.view.renderSignal(channel);
      },
      
      getSignal: function(channel) {
        return this.signals[channel];
      },
      
      clearSignal: function(channel) {
        delete this.signals[channel];
        this.view.removeTrace(channel);
      },
      
      setHorizontalScale: function(scale) {
        this._horizontalScale = scale;
        if (this.view) {
          this.view.horizontalScaleChanged();
        }
        
        sparks.logController.addEvent(sparks.LogEvent.OSCOPE_T_SCALE_CHANGED, {
            "scale": scale,
            "goodnessOfScale": this.getGoodnessOfScale()
          });
      },
      
      getHorizontalScale: function() {
        if (!this._horizontalScale) {
          // if you want to randomize the scales, hook something in here
          this.setHorizontalScale(this.INITIAL_HORIZONTAL_SCALE);
        }
        return this._horizontalScale;
      },
      
      setVerticalScale: function(channel, scale) {
        this._verticalScale[channel] = scale;
        if (this.view) {
          this.view.verticalScaleChanged(channel);
        }
        
        var logEvent = channel == 1 ? sparks.LogEvent.OSCOPE_V1_SCALE_CHANGED : sparks.LogEvent.OSCOPE_V2_SCALE_CHANGED;
        sparks.logController.addEvent(logEvent, {
            "scale": scale,
            "goodnessOfScale": this.getGoodnessOfScale()
          });
      },
      
      getVerticalScale: function(channel) {
        if (!this._verticalScale[channel]) {
          // if you want to randomize the scales, hook something in here
          this.setVerticalScale(channel, this.INITIAL_VERTICAL_SCALE);
        }
        return this._verticalScale[channel];
      },
      
      bumpHorizontalScale: function(direction) {
        var currentScale = this.getHorizontalScale(),
            newScale     = this._getNextScaleFromList(currentScale, this.HORIZONTAL_SCALES, direction);
        
        if (newScale !== currentScale) {
          this.setHorizontalScale(newScale);
        }
      },
      
      bumpVerticalScale: function(channel, direction) {
        var currentScale = this.getVerticalScale(channel),
            newScale     = this._getNextScaleFromList(currentScale, this.VERTICAL_SCALES, direction);
            
        if (newScale !== currentScale) {
          this.setVerticalScale(channel, newScale);
        }
      },

      toggleShowAminusB: function() {
        this.showAminusB = !this.showAminusB;
        if (this.showAminusB) {
          this.showAplusB = false;
        }
      },

      toggleShowAplusB: function() {
        this.showAplusB = !this.showAplusB;
        if (this.showAplusB) {
          this.showAminusB = false;
        }
      },

      _getNextScaleFromList: function(scale, scales, direction) {
        var i, len, prevIndex;
        
        for (i = 0, len = scales.length; i < len; i++) {
          if (scales[i] < scale) {
            break;
          }
        }
        prevIndex = (i > 0) ? i - 1 : 0;
        
        if (direction === 1 && prevIndex - 1 >= 0) {
          return scales[prevIndex - 1];
        } else if (direction === -1 && prevIndex + 1 < scales.length) {
          return scales[prevIndex + 1];
        } else {
          return scale;
        }
      },

      // returns how "good" the current scale is, from 0-1.
      // For a single trace, a perfect scale is 1 full wave across the screen and an amplitude
      // that is exactly the screen's height. This will return a 1.0 if the scale is within 20%
      // of these parameters, and 0.0 if it's 200% away from the perfect scale (i.e. if it's 3 times
      // as big or 1/3 as big).
      // There are two scale factors per trace. The goodness ranking for the entire trace is the average
      // of the two with the lower value weighted three times as much.
      // If there are two traces showing, this will return the lower of the two values.
      //
      getGoodnessOfScale: function() {
        var self = this;
        var goodnessOfScale = function(channel) {
          var timeScale  = self.signals[channel].frequency * (self._horizontalScale * 10),            // 0-inf, best is 1
              ampScale   = (self.signals[channel].amplitude * 2) / (self._verticalScale[channel] * 8),
              timeGoodness  = timeScale > 1 ? 1/timeScale : timeScale,                                // 0-1, best is 1
              ampGoodness   = ampScale > 1 ? 1/ampScale : ampScale,
              timeScore  = (timeGoodness - 0.3) / 0.5,                                                // scaled such that 0.3 = 0 and 0.8 = 1
              ampScore   = (ampGoodness - 0.3) / 0.5,
              minScore = Math.max(0,Math.min(timeScore, ampScore, 1)),                                // smallest of the two, no less than 0
              maxScore = Math.min(1,Math.max(timeScore, ampScore, 0));                                // largest of the two, no greater than 1
          return ((minScore * 3) + maxScore) / 4;
        }

        var goodnesses = [];
        if (this.signals[this.SOURCE_CHANNEL]) {
          goodnesses.push(goodnessOfScale([this.SOURCE_CHANNEL]));
        }

        if (this.signals[this.PROBE_CHANNEL]) {
          goodnesses.push(goodnessOfScale([this.PROBE_CHANNEL]));
        }
        return Array.min(goodnesses);
      }
      
    };

})();
