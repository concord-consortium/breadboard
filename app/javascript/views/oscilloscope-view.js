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
    height:   320,
    nPeriods: 3,
    verticalScreenFraction: 0.8,
    
    nVerticalMarks:   8,
    nHorizontalMarks: 10,
    nMinorTicks:      5,
    
    bgColor:         '#74A6A6',//'#DEF7F7',//'#C6F7F7',
    tickColor:       '#C6F7F7',//'#7A9E9D',
    traceInnerColor: '#DEFFFA',
    traceOuterColor: '#00FFD5',//'#2FF50C', //'#2EED0C',//'#D1FA02',//'#02FA3C',

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
      @param Number frequency    Frequency of the wave, in Hz. This is used to autoscale the y axis
      @param Number amplitude    Amplitude of the wave, in volts
      @param Number phase        Phase of the wave, in radians. 0 -> cos(t), Math.PI/2 -> -sin(t), Math.PI -> -cos(t), (3*Math.PI)/2 -> sin(t)
    */
    setTrace: function (n, frequency, amplitude, phase) {
      // NB plot "cos (wt + phase)"
      
      console.log("setTrace(%d, %f, %f, %f)", n, frequency, amplitude, phase);
      
      this.clearTrace(n);
      
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
      if (this.traces[n]) {
        if (this.traces[n].raphaelObject) this.traces[n].raphaelObject.remove();
        delete this.traces[n];
      }
    },
    
    drawGrid: function () {
      var r = this.raphaelCanvas,
          path = [],
          x, dx, y, dy;
      
      r.rect(0, 0, this.width, this.height, 10).attr({fill: this.bgColor, 'stroke-width': 0});
      
      for (x = dx = this.width / this.nHorizontalMarks; x <= this.width - dx; x += dx) {
        path.push('M');
        path.push(x);
        path.push(0);
        
        path.push('L');
        path.push(x);
        path.push(this.height);      
      }
      
      for (y = dy = this.height / this.nVerticalMarks; y <= this.height - dy; y += dy) {
        path.push('M');
        path.push(0);
        path.push(y);
        
        path.push('L');
        path.push(this.width);
        path.push(y);      
      }
      
      y = this.height / 2;
      
      for (x = dx = this.width / (this.nHorizontalMarks * this.nMinorTicks); x <= this.width - dx; x += dx) {
        path.push('M');
        path.push(x);
        path.push(y-3);
        
        path.push('L');
        path.push(x);
        path.push(y+3);
      }
      
      x = this.width / 2;
      
      for (y = dy = this.height / (this.nVerticalMarks * this.nMinorTicks); y <= this.height - dy; y += dy) {
        path.push('M');
        path.push(x-3);
        path.push(y);
        
        path.push('L');
        path.push(x+3);
        path.push(y);
      }
      
      r.path(path.join(' ')).attr({stroke: this.tickColor});
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
          if (this.traces[i] && this.traces[i].raphaelObject) {
            this.traces[i].raphaelObject.remove();
            this.addRaphaelTrace(this.traces[i]);
          }
        }
        this.scaleChanged = false;
      }
    },
    
    // Private. Add a raphael element to the graph
    addRaphaelTrace: function (trace) {
      var r    = this.raphaelCanvas,
          path = [],
          x    = 0,
          hScale = this.horizontalScale,
          vScale = this.verticalScale,
          h    = this.height / 2,
          overscan = 5,
          raphaelObject;
          
      for (x = 0; x < this.width + overscan * 2; x++) {
        path.push(x ===  0 ? 'M' : 'L');
        path.push(x);
        
        // "overscan" the trace 5 pixels to either side of the scope window, but translate 5 pixels to the right so we 
        // don't have negative x-coords (which are invalid) in the path string
        path.push(h - trace.amplitude * vScale * Math.sin((x - overscan) * hScale - trace.phase));
      }
      
      path = path.join(' ');
      
      // "glowy green line" effect by tracing overlaying an oversaturated (greenish white) line over a fatter green line
      raphaelObject = r.set(
        r.path(path).attr({stroke: this.traceOuterColor, 'stroke-width': 5}),
        r.path(path).attr({stroke: this.traceInnerColor, 'stroke-width': 3})
      );

      // translate the path 5 pixels to the left to accomodate the overscan
      raphaelObject.translate(-1 * overscan, 0);

      trace.raphaelObject = raphaelObject;
      return raphaelObject;
    }
          
  };
  
}());
