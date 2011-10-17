/*globals sparks*/
(function () {
  
  sparks.OscilloscopeView = function () {
    this.$view = null;
    this.traces = {};
    this.verticalScale = 1;
    this._paper = null;
  };
  
  
  sparks.OscilloscopeView.prototype = {

    /**
      @returns $view A jQuery object containing a Raphael canvas displaying the oscilloscope traces.
      
    */
    getView: function () {
      // set this.$view
      // ...
      // set this.paper;
      
      
      return this.$view;
    },
    
    /**
      Sets trace number n to be a sinusoid of specified amplitude and phase. 
      
      @param Number n            Which channel (should be 1 or 2)
      @param Number amplitude    Amplitude of the wave, in volts.
      @param Number frequency    Frequency of the wave, in Hz. This is ignored at first.
      @param Number phase        Phase of the wave, in radians. 0 -> cos(t), Math.PI/2 -> -sin(t), Math.PI -> -cos(t), (3*Math.PI)/2 -> sin(t)
    */
    setTrace: function (n, amplitude, frequency, phase) {
      // NB plot "cos (wt + phase)"
    },
  
    /**
      Clears trace n (removes it from the screen)
    */
    clearTrace: function (n) {
      this._removeElement(this.traces[n].raphaelTrace);
      delete this.traces[n];
    },
    
    
    // Private. Remove raphael element el.
    _removeRaphaelTrace: function (raphaelObject) {
    },
    
    // Private. Add a raphael element to the graph
    _addRaphaelTrace: function (trace) {
      var raphaelObject;
      
      // put it into this.paper
      // ... 
      
      
      return raphaelObject;
    }
  
  };
  
}());
