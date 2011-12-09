/*globals sparks getBreadBoard breadModel */
/* FILE oscilloscope.js */

(function () {

    sparks.circuit.Oscilloscope = function () {
      this.probeLocation = null;
      this.view = null;
      this.signals = [];
      this._verticalScale = [];
      this._horizontalScale = null;
    };

    sparks.circuit.Oscilloscope.prototype = {
      
      N_CHANNELS:     2,
      SOURCE_CHANNEL: 1,
      PROBE_CHANNEL:  2,
      
      HORIZONTAL_SCALES: [1e-3, 5e-4, 2.5e-4, 1e-4, 5e-5, 2.5e-5, 1e-5, 5e-6, 2.5e-6, 1e-6],  // sec/div
      VERTICAL_SCALES:   [100,  50,   25,     10,   5,    2.5,    1,    0.5,  0.25,    0.1],  // V/div
      
      INITIAL_HORIZONTAL_SCALE: 1e-5,
      INITIAL_VERTICAL_SCALE:   5,
      
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
          amplitude: source.amplitude,
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
          dataIndex = this._getClosestQucsFrequencyIndex(freqs, source.frequency);
          // find the same index in our data
          result = data[probeNode].v[dataIndex];

          if (result) {
            probeSignal = {
              amplitude: result.magnitude,
              frequency: source.frequency,
              phase:     result.angle
            };

            this.setSignal(this.PROBE_CHANNEL, probeSignal);
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
      },
      
      // When we define, say, a logaritmic sweep of frequencies, we calculate them on our end
      // for the function generator, and QUCS generates them on its end after being given a
      // simulation type. These two series may not be exactly the same after accounting for
      // different precisions, so we want to pick the QUCS value that's closest to what we
      // think we're generating. So, if we think we're generating 1002.2 Hz, and QUCS comes back
      // with [1000, 1002.22222, 1003.33333], we want to return the index '1'
      //
      // @frequencies an array of frequencies, assumed to be complex numbers (ret from QUCS and parsed)
      // @actual the frequency the FG believes it's generating
      _getClosestQucsFrequencyIndex: function(frequencies, actual) {
        var minDiff = Infinity,
            index;
        // this could be shortened as a CS exercise, but it takes 0 ms over an array of
        // 10,000 so it's not really worth it...
        for (var i = 0, ii = frequencies.length; i < ii; i++){
          var diff = Math.abs(frequencies[i].real - actual);
          if (diff < minDiff){
            minDiff = diff;
            index = i;
          }
        }
        return index;
      }
      
    };

})();
