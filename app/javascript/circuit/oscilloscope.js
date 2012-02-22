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
            "scale": scale
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
            "scale": scale
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
      }
      
    };

})();
