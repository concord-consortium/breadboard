/*globals sparks getBreadBoard breadModel */
/* FILE oscilloscope.js */

(function () {

    sparks.circuit.Oscilloscope = function () {
      this.probeLocation = null;
      this.view = null;
      this.SOURCE_CHANNEL = 1;
      this.PROBE_CHANNEL = 2;
    };

    sparks.circuit.Oscilloscope.prototype = {
      
      setView: function(view) {
        this.view = view;
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
        
        this.addTrace(this.SOURCE_CHANNEL, sourceTrace);
        
        if (this.probeLocation) {
          probeNode = getBreadBoard().getHole(this.probeLocation).nodeName();
          if (probeNode === 'gnd') {
            // short-circuit this operation and just return a flat trace
            this.addTrace(this.PROBE_CHANNEL, {amplitude: 0, frequency: 0, phase: 0});
            return;
          }
          
          data = breadModel('query');
          
          // for our first pass, we're assuming single input frequency
          result = data[probeNode].v[0];

          if (result) {
            probeTrace = {
              frequency: source.frequency,
              amplitude: result.magnitude,
              phase:     result.angle
            };
            
            this.addTrace(this.PROBE_CHANNEL, probeTrace);
          } else {
            this.clearTrace(this.PROBE_CHANNEL);
          }
        } else {
          this.clearTrace(this.PROBE_CHANNEL);
        }
      },
      
      addTrace: function(n, data) {
        this.view.setTrace(n, data.frequency, data.amplitude, data.phase);
      },
      
      clearTrace: function(n) {
        this.view.clearTrace(n);
      }
      
    };

})();
