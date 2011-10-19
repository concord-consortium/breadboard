/*globals sparks Raphael*/

(function () {
  
  sparks.OscilloscopeView = function () {
    this.$view           = null;
    this.raphaelCanvas   = null;
    this.traces          = [];
    this.horizontalScale = null;
    this.verticalScale   = null;
    this.scaleChanged    = false;
    this.raphaelGrid     = null;
  };
  
  sparks.OscilloscopeView.prototype = {
    
    width:    400,
    height:   320,
    nPeriods: 50 / 36,
    verticalScreenFraction: 0.8,
    
    nVerticalMarks:   8,
    nHorizontalMarks: 10,
    nMinorTicks:      5,
    
    bgColor:         '#324569',
    tickColor:       '#9EBDDE',//'#141C2B',
    textColor:       '#D8E1EB',
    traceInnerColor: '#FFFFFF',
    traceOuterColor: '#00E3AE',

    /**
      @returns $view A jQuery object containing a Raphael canvas displaying the oscilloscope traces.
      
      Sets this.$view to be the returned jQuery object.
    */
    getView: function () {
      this.$view = $('<div>');
      this.$view.css({
        position: 'relative',
        width:    this.width +100,
        height:   this.height+50,
        backgroundColor: '#2F85E0'
      });
      
      this.$holder = $('<div class="raphael-holder">').css({
        paddingTop:  10,
        paddingLeft: 10
      }).appendTo(this.$view);
      
      this.raphaelCanvas = Raphael(this.$holder[0], this.width, this.height);

      $('<p>CH1 <span class="vscale channel1"></span>V</p>').css({
        position: 'absolute',
        left: 5,
        color: this.textColor
      }).appendTo(this.$view);
      
      $('<p>CH2 <span class="vscale channel2"></span>V</p>').css({
        position: 'absolute',
        left: 5 + this.width / 4,
        color: this.textColor
      }).appendTo(this.$view);
      
      $('<p>M <span class="hscale"></span>μs</p>').css({
        position: 'absolute',
        left: 5 + this.width / 2,
        color: this.textColor
      }).appendTo(this.$view);
      
      this.drawGrid();
      
      return this.$view;
    },
    
    /**
      Sets trace number n to be a sinusoid of specified amplitude and phase. Rescales the display to show this.nPeriods
      of the signal from left to right and to show 
       
      @param Number n            Which channel (should be 1 or 2)
      @param Number frequency    Frequency of the wave, in Hz. This is used to autoscale the y axis
      @param Number amplitude    Amplitude of the wave, in volts
      @param Number phase        Phase of the wave, in radians.
    */
    setTrace: function (n, frequency, amplitude, phase) {
    
      if (n !== 1 && n !== 2) {
        throw new Error("OscilloscopeView: attempted to set nonexistent channel number " + n);
      }
      
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
      
      r.rect(0, 0, this.width, this.height).attr({fill: this.bgColor, 'stroke-width': 0});
      
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
      
      this.raphaelGrid = r.path(path.join(' ')).attr({stroke: this.tickColor, opacity: 0.5});
    },
    
    setHorizontalScaleFrom: function (frequency) {
      var scale          = 2 * this.nPeriods * Math.PI / this.width,
          millisecPerDiv = (1 / frequency) * this.nPeriods / this.nHorizontalMarks * 1000;

      if (scale !== this.horizontalScale) {
        this.horizontalScale = scale;
        this.$view.find('.hscale').html(sparks.math.roundToSigDigits(millisecPerDiv * 1000, 3).toString());
        this.scaleChanged = true;
      }
    },
    
    setVerticalScaleFrom: function (amplitude) {
      var scale       = this.verticalScreenFraction * this.height / (2 * amplitude),
          voltsPerDiv = (amplitude / this.verticalScreenFraction) / (this.nVerticalMarks / 2);
      
      if (scale !== this.verticalScale) {
        this.verticalScale = scale;
        this.$view.find('.vscale').html(sparks.math.roundToSigDigits(voltsPerDiv, 3).toString());
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
          h      = this.height / 2,
          overscan = 50,
          raphaelObject,
          paths,
          i;
          
      for (x = 0; x < this.width + overscan * 2; x++) {
        path.push(x ===  0 ? 'M' : 'L');
        path.push(x);
        
        // "overscan" the trace 5 pixels to either side of the scope window, but translate 5 pixels to the right so we 
        // don't have negative x-coords (which are invalid) in the path string
        path.push(h - trace.amplitude * vScale * Math.sin((x - overscan) * hScale + trace.phase));
      }
      
      path = path.join(' ');
      
      paths = [];
      for (i = 1; i < 10; i++ ) {
        paths.push( r.path(path).attr({stroke: this.traceOuterColor, 'stroke-width': 15 * i, opacity: 0.01}) );
      }
      paths.push(r.path(path).attr({stroke: this.traceOuterColor, 'stroke-width': 4.5}));
      paths.push(r.path(path).attr({stroke: this.traceInnerColor, 'stroke-width': 2}));

      raphaelObject = r.set.apply(r, paths);
      
      // "glowy green line" effect by tracing overlaying an oversaturated (greenish white) line over a fatter green line
      
      this.raphaelGrid.toFront();

      // translate the path 5 pixels to the left to accomodate the overscan
      raphaelObject.translate(-1 * overscan, 0);

      trace.raphaelObject = raphaelObject;
      return raphaelObject;
    }
          
  };
  
}());
