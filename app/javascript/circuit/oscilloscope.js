/*globals sparks getBreadBoard breadModel */
/* FILE oscilloscope.js */

(function () {

    sparks.circuit.Oscilloscope = function () {
      this.probeLocation = null;
      this.view = null;
      this.traces = [];

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
            sourceTrace,
            probeTrace,
            probeNode,
            data,
            result;
            
        if (!source || !source.frequency || !source.amplitude) {
          return;                                     // we must have a source with a freq and an amplitude
        }
        
        sourceTrace = {
          amplitude: source.amplitude,
          frequency: source.frequency,
          phase: 0
        };
        
        this.setTrace(this.SOURCE_CHANNEL, sourceTrace);
        
        if (this.probeLocation) {
          probeNode = getBreadBoard().getHole(this.probeLocation).nodeName();

          if (probeNode === 'gnd') {
            // short-circuit this operation and just return a flat trace
            this.setTrace(this.PROBE_CHANNEL, {amplitude: 0, frequency: 0, phase: 0});
            return;
          }
          
          data = breadModel('query');
          
          // for our first pass, we're assuming single input frequency
          result = data[probeNode].v[0];

          if (result) {
            probeTrace = {
              amplitude: result.magnitude,
              frequency: source.frequency,
              phase:     result.angle
            };

            this.setTrace(this.PROBE_CHANNEL, probeTrace);
          } else {
            this.clearTrace(this.PROBE_CHANNEL);
          }
        } else {
          this.clearTrace(this.PROBE_CHANNEL);
        }
      },
      
      setTrace: function(channel, trace) {
        this.traces[channel] = trace;
        this.view.renderTrace(channel);
      },
      
      getTrace: function(channel) {
        return this.traces[channel];
      },
      
      clearTrace: function(channel) {
        delete this.traces[channel];
        this.view.removeTrace(channel);
      }
      
    };

})();
