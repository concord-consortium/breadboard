/*globals sparks getBreadBoard breadModel */
/* FILE oscilloscope.js */

(function () {

    sparks.circuit.Oscilloscope = function () {
      this.probeLocation = null;
      this.view = null;
      this.signals = [];

    };

    sparks.circuit.Oscilloscope.prototype = {
      
      N_CHANNELS:     2,
      SOURCE_CHANNEL: 1,
      PROBE_CHANNEL:  2,
      
      setView: function(view) {
        this.view = view;
        this.view.setModel(this);
        this.update();         // we can update view immediately with the source trace
      },
      
      // @probe Name of probe being attached. We ignore everything but "red"
      // @location Hole name, like 'a1' or can be null if probe is lifted
      setProbeLocation: function(probe, location) {
        if (probe === "red") {
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
            result;
            
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
          
          // for our first pass, we're assuming single input frequency
          result = data[probeNode].v[0];

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
      }
      
    };

})();
