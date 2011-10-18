/* FILE oscilloscope.js */
/*globals console sparks breadModel getBreadBoard*/

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
      
      // can be a hole name, like 'a1' or can be null if probe is lifted
      setProbeLocation: function(location) {
        this.probeLocation = location;
        this.update();
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
              amplitude: result.real,
              frequency: source.frequency,
              phase: this._getPhase(result.real, result.i)
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
        this.view.setTrace(n, data.amplitude, data.frequency, data.phase);
      },
      
      clearTrace: function(n) {
        this.view.clearTrace(n);
      },
      
      _getPhase: function(real, imaginary) {
        return Math.atan(real === 0 ? Infinity : imaginary / real);
      }
      
    };

})();
