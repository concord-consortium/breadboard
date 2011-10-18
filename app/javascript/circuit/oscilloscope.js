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
            source     = breadboard.components.source;
            
        if (!source || !source.frequency || !source.amplitude){
          return;                                     // we must have a source with a freq and an amplitude
        }
        
        var sourceTrace = {
          amplitude: source.amplitude,
          frequency: source.frequency,
          phase: 0
        };
        
        this.addTrace(this.SOURCE_CHANNEL, sourceTrace);
        
        if (this.probeLocation){
          var data = breadModel('query');
          var probeNode = getBreadBoard().getHole(this.probeLocation).nodeName();
          
          // for our first pass, we're assuming single input frequency
          var result = data[probeNode].v[0];

          if (!!result){
            var probeTrace = {
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
