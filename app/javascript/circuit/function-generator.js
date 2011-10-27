/* FILE function-generator.js */
//= require "component"
/*globals console sparks */

(function () {

  sparks.circuit.FunctionGenerator = function (props, breadBoard) {
    sparks.circuit.FunctionGenerator.parentConstructor.call(this, props, breadBoard);
    
    // NOTE on validation of initialFrequency.
    //
    // If the initial frequency is not in the frequencies we request QUCS to simulate, we only find out after we call 
    // QUCS and get the simulation result back. It sounds like we're thereby missing an opportunity to validate
    // initialFrequency "up front" at object-creation time, but, really, we're not. From the perspective of an author 
    // who creates a JSON circuit spec with such an invalid initialFrequency, the validation failure only occurs when
    // the student (or author) actually runs the activity, whether the validation is done when the FunctionGenerator
    // is created, or whether it is done when QUCS returns. Doing validation at object creation time (below) would
    // require pre-calculating the frequency list which QUCS generates from a sweep spec.
    this.frequency = props.initialFrequency;
    
    // get an initial frequency from the frequency-range specification, if one exists
    if ( ('undefined' === typeof this.frequency || this.frequency === null) && props.frequencies ) {
      if ('number' === typeof props.frequencies[0]) {
        this.frequency = props.frequencies[0];
      }
      else if (props.frequencies[0] === 'linear' || props.frequencies[0] === 'logarithmic') {
        this.frequency = props.frequencies[1];
      }
    }
    
    if ('undefined' === typeof this.frequency || this.frequency === null) {
      throw new Error("FunctionGenerator: initialFrequency is undefined and an initial frequency could not be inferred from frequency range specification.");
    }
  };

  sparks.extend(sparks.circuit.FunctionGenerator, sparks.circuit.Component, {
    
    // for now, no validation on frequency. So we might set something QUCS isn't expecting from the given sim type
    setFrequency: function(frequency) {
      this.frequency = frequency;
      if (sparks.activityController.currentSection.meter) {
        sparks.activityController.currentSection.meter.update();
      }
    },
    
    setAmplitude: function(amplitude) {
      this.amplitude = amplitude;
      if (sparks.activityController.currentSection.meter) {
        sparks.activityController.currentSection.meter.update();
      }
    },

    toNetlist: function () {
      var amplitude = this.amplitude || 0,
          nodes     = this.getNodes();
      return 'Vac:' + this.UID + ' ' + nodes[0] + ' ' + nodes[1] + ' U="' + amplitude + ' V" f="' + this.frequency + '" Phase="0" Theta="0"';
    },
    
    defaultFrequencySteps: 100,
    
    getQucsSimulationType: function () {  
      var type, nSteps, ret;
      
      if (this.frequencies && (this.frequencies[0] === 'linear' || this.frequencies[0] === 'logarithmic')) {
        type   = this.frequencies[0] === 'linear' ? 'lin' : 'log';
        nSteps = this.frequencies[3] || this.defaultFrequencySteps;
        
        return '.AC:AC1 Type="' + type + '" Start="' + this.frequencies[1] + '" Stop="' + this.frequencies[2] + '" Points="' + nSteps + '" Noise="no"';
      }
      
      if (this.frequencies && typeof this.frequencies[0] === 'number') {
        
        if (this.frequencies.length === 1) {
          return '.AC:AC1 Type="const" Values="' + this.frequencies[0] + '" Noise="no"';
        }
        else if (this.frequencies.length > 1) {
          return '.AC:AC1 Type="list" Values="[' + this.frequencies.join('; ') + ']" Noise="no"';
        }
        
      }
      
    }
    
  });

})();

