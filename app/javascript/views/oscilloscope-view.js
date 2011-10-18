/*globals sparks Raphael*/

(function () {
  
  sparks.OscilloscopeView = function () {
    this.$view           = null;
    this.raphaelCanvas   = null;
    this.traces          = [];
    this.horizontalScale = null;
    this.verticalScale   = null;
    this.scaleChanged    = false;
  };
  
  sparks.OscilloscopeView.prototype = {
    
    width:    400,
    height:   400,
    nPeriods: 5,
    verticalScreenFraction: 0.8,

    /**
      @returns $view A jQuery object containing a Raphael canvas displaying the oscilloscope traces.
      
      Sets this.$view to be the returned jQuery object.
      
    */
    getView: function () {
      this.$view = $('<div>'); 
      this.raphaelCanvas = Raphael(this.$view[0], this.width, this.height);

      this.drawGrid();
      
      return this.$view;
    },
    
    /**
      Sets trace number n to be a sinusoid of specified amplitude and phase. Rescales the display to show this.nPeriods
      of the signal from left to right and to show 
       
      @param Number n            Which channel (should be 1 or 2)
      @param Number amplitude    Amplitude of the wave, in volts.
      @param Number frequency    Frequency of the wave, in Hz. This is ignored at first.
      @param Number phase        Phase of the wave, in radians. 0 -> cos(t), Math.PI/2 -> -sin(t), Math.PI -> -cos(t), (3*Math.PI)/2 -> sin(t)
    */
    setTrace: function (n, amplitude, frequency, phase) {
      // NB plot "cos (wt + phase)"
      
      if (this.traces[n]) this.clearTrace(n);
      
      this.traces[n] = {
        amplitude: amplitude,
        frequency: frequency,
        phase:     phase
      };
      
      this.setHorizontalScaleFrom(frequency);
      if (n === 1) {
        this.setVerticalScaleFrom(amplitude);
      }
      this.redrawIfScaleChanged();
      
      this.addRaphaelTrace(this.traces[n]);
    },
  
    /**
      Clears trace n (removes it from the screen)
    */
    clearTrace: function (n) {
      this.removeRaphaelTrace(this.traces[n].raphaelObject);
      delete this.traces[n];
    },
    
    drawGrid: function () {
    },
    
    setHorizontalScaleFrom: function (frequency) {
      var scale = 2 * this.nPeriods * Math.PI / this.width;
      
      if (scale !== this.horizontalScale) {
        this.horizontalScale = scale;
        this.scaleChanged = true;
      }
    },
    
    setVerticalScaleFrom: function (amplitude) {
      var scale = this.verticalScreenFraction * this.height / (2 * amplitude);
      
      if (scale !== this.verticalScale) {
        this.verticalScale = scale;
        this.scaleChanged = true;
      }
    },
    
    redrawIfScaleChanged: function () {
      var i, l;
      
      if (this.scaleChanged) {
        for (i = 0, l = this.traces.length; i < l; i++) {
          if (this.traces[i]) this.redrawRaphaelTrace(this.traces[i]);
        } 
        this.scaleChanged = false;
      }
    },
    
    // Private. Remove raphael element el.
    removeRaphaelTrace: function (raphaelObject) {
    },
    
    // Private. Add a raphael element to the graph
    addRaphaelTrace: function (trace) {
      var raphaelObject;
      return raphaelObject;
    },
    
    redrawRaphaelTrace: function (trace) {
    }
      
  };
  
}());
