/* FILE oscilloscope.js */

(function () {

    sparks.circuit.Oscilloscope = function () {
      this.probeLocation = null;
      this.view = null;
    };

    sparks.circuit.Oscilloscope.prototype = {
      
      setView: function(view) {
        this.view = view;
        this.updateDisplay();         // we can update view immediately with the source trace
      },
      
      // can be a hole name, like 'a1' or can be null if probe is lifted
      setProbeLocation: function(location) {
        this.probeLocation = location;
        this.updateDisplay();
      },
      
      updateDisplay: function() {
        var breadboard = getBreadBoard(),
            source     = breadboard.components.source;
            
        if (!source || !source.frequency || !source.amplitude){
          return;                                     // we must have a source with a freq and an amplitude
        }
        
        var sourceTrace = {
          amplitude: source.amplitude,
          frequency: source.frequency,
          phase: 0
        }
        
        this.addTrace(0, sourceTrace);
        
        if (this.probeLocation){
          var data = breadModel('query');
          var probeNode = getBreadBoard().getHole(this.probeLocation).nodeName();
          
          // for our first pass, we're assuming single input frequency
          var result = data[probeNode].v[0];

          if (!!result){
            var probeTrace = {
              amplitude: result.real,
              frequency: source.frequency,
              phase: result.i
            }
            
            this.addTrace(1, probeTrace);
          } else {
            this.clearTrace(1);
          }
        } else {
          clearTrace(1);
        }
      },
      
      addTrace: function(n, data) {
        this.view.setTrace(n, data.amplitude, data.frequency, data.phase);
      },
      
      clearTrace: function(n) {
        this.view.clearTrace(n);
      }
      
    };

})();
