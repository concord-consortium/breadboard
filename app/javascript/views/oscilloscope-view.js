/*globals sparks Raphael*/

(function () {

  sparks.OscilloscopeView = function () {
    this.$view         = null;
    this.miniRaphaelCanvas = null;
    this.raphaelCanvas = null;
    this.miniTraces    = [];
    this.traces        = [];
    this.model         = null;
    this.popup         = null;
  };

  sparks.OscilloscopeView.prototype = {

    // Note that sizing and placement of the various elements of the view are handled ad-hoc in the getView() method;
    // however, this.width and this.height indicate the dimensions of the gridded area where traces are drawn.
    miniViewConfig: {
      width: 132,
      height: 100,
      tickSize: 2
    },

    largeViewConfig: {
      width:    400,
      height:   320,
      tickSize: 3
    },

    // These define the grid aka 'graticule'. This is pretty standard for scopes.
    nVerticalMarks:   8,
    nHorizontalMarks: 10,
    nMinorTicks:      5,

    faceplateColor:   '#EEEEEE',
    displayAreaColor: '#324569',
    traceBgColor:     '#324569',
    tickColor:        '#9EBDDE',
    textColor:        '#D8E1EB',
    traceOuterColors: ['#FFFF4A', '#FF5C4A', '#33FF33'],
    traceInnerColors: ['#FFFFFF', '#FFD3CF', '#EEFFEE'],
    traceLabelColors: ['#FFFF99', '#FC8F85', '#99FC7B'],
    // The famed "MV" pattern...
    setModel: function (model) {
      this.model = model;
    },

    getView: function () {
      var $canvasHolder,
          self = this,
          conf = this.miniViewConfig;

      this.$view = $('<div>');
      this.$view.css({
        position: 'relative',
        width: conf.width+160,
        height: conf.height+40
      });


      // display area (could split this out into separate method, though not a separate view
      this.$displayArea = $('<div class="display-area">').css({
        position: 'absolute',
        top: 14,
        left: 19,
        width:    conf.width,
        height:   conf.height,
        backgroundColor: this.displayAreaColor
      }).appendTo(this.$view);

      $canvasHolder = $('<div class="raphael-holder">').css({
        position: 'absolute',
        top:  0,
        left: 0,
        backgroundColor: this.traceBgColor
      }).appendTo(this.$displayArea);

      this.miniRaphaelCanvas = Raphael($canvasHolder[0], conf.width, conf.height);

      this.drawGrid(this.miniRaphaelCanvas, conf);

      $overlayDiv = $('<div id="oscope_mini_overlay"></div>').appendTo(this.$view);

      $overlayDiv.click(function(){
        self.openPopup();
      });
      return this.$view;
    },

    openPopup: function () {
      if (!this.popup) {
        $view = this.getLargeView();
        this.renderSignal(1, true);
        this.renderSignal(2, true);
        this.popup = $view.dialog({
          width: this.largeViewConfig.width + 149,
          height: this.largeViewConfig.height + 97,
          dialogClass: 'tools-dialog oscope_popup',
          title: "Oscilloscope",
          closeOnEscape: false,
          resizable: false,
          autoOpen: false
        });
      }

      var self = this;
      this.popup.bind('remove', function() {
        self.popup = null;
      });

      var scrollPosition = [
        self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
        self.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop
      ];

      this.popup.dialog('open').dialog("widget").position({
         my: 'left top',
         at: 'center top',
         of: $("#breadboard_wrapper")
      });

      window.scrollTo(scrollPosition[0], scrollPosition[1]);
    },

    /**
      @returns $view A jQuery object containing a Raphael canvas displaying the oscilloscope traces.

      Sets this.$view to be the returned jQuery object.
    */
    getLargeView: function () {
      var $canvasHolder,
          self = this,
          conf = this.largeViewConfig;

      this.$view = $('<div>');
      this.$view.css({
        position: 'relative',
        width: conf.width,
        height: conf.height
      });


      // display area (could split this out into separate method, though not a separate view
      this.$displayArea = $('<div class="display-area">').css({
        position: 'absolute',
        top: 25,
        left: 18,
        width:    conf.width + 6,
        height:   conf.height + 30,
        backgroundColor: this.displayAreaColor
      }).appendTo(this.$view);

      $canvasHolder = $('<div class="raphael-holder">').css({
        position: 'absolute',
        top:  5,
        left: 7,
        width:    conf.width,
        height:   conf.height,
        backgroundColor: this.traceBgColor
      }).appendTo(this.$displayArea);

      // add drag handler to canvasHolder
      $canvasHolder
        .drag(function( ev, dd ){
          var viewWidth   = this.getBoundingClientRect().width,
              perc        = dd.deltaX / viewWidth,
              phaseOffset = (-2*Math.PI) * perc;

          self.renderSignal(1, false, phaseOffset);
          self.renderSignal(2, false, phaseOffset);
        })
        .drag("dragend", function (ev, dd) {
          var viewWidth   = this.getBoundingClientRect().width,
              perc        = dd.deltaX / viewWidth,
              phaseOffset = (-2*Math.PI) * perc;

          self.previousPhaseOffset += phaseOffset;
        });

      this.raphaelCanvas = Raphael($canvasHolder[0], conf.width, conf.height);

      this.drawGrid(this.raphaelCanvas, conf);

      $('<p id="cha"><span class="chname">CHA</span> <span class="vscale channel1"></span>V</p>').css({
        position: 'absolute',
        top:   10 + conf.height,
        left:  5,
        color: this.traceLabelColors[0]
      }).appendTo(this.$displayArea);

      $('<p id="chb"><span class="chname">CHB</span> <span class="vscale channel2"></span>V</p>').css({
        position: 'absolute',
        top:   10 + conf.height,
        left:  5 + conf.width / 4,
        color: this.traceLabelColors[1]
      }).appendTo(this.$displayArea);

      $('<p>M <span class="hscale"></span>s</p>').css({
        position: 'absolute',
        top:   10 + conf.height,
        left:  5 + (conf.width*3)/4,
        color: this.textColor
      }).appendTo(this.$displayArea);


      // 'faceplate'
      this.$faceplate = $('<div class="faceplate">').css({
        position: 'absolute',
        left:   conf.width + 27,
        top: 15,
        backgroundColor: 'none',
        width: 122,
        height: 364,
        overflow: 'hidden'
      }).appendTo(this.$view);

      this.$controls = $('<div>').css({
        position: 'absolute',
        top:      30,
        left:     0,
        right:    0,
        height:   200
      }).appendTo(this.$faceplate);

      $('<p class="oscope-label">volts/div</p>').css({
        top:       -33,
        left:      14,
        right:     0,
        height:    20,
        position: 'absolute'
      }).appendTo(this.$controls);

      this.$channel1 = $('<div class="channelA">').css({
        position:  'absolute',
        top:       19,
        left:      11,
        width:     122,
        height:    100
      }).appendTo(this.$controls);

      $('<p>CH A</p>').css({
        top:       -2,
        left:      -2,
        right:     0,
        height:    20,
        textAlign: 'center',
        position:  'absolute'
      }).appendTo(this.$channel1);

      this._addScaleControl(this.$channel1, function () {
        self.model.bumpVerticalScale(1, -1);
      }, function () {
        self.model.bumpVerticalScale(1, 1);
      });

      this.$channel2 = $('<div>').css({
        position: 'absolute',
        top:      121,
        left:     11,
        width:    122,
        height:   100
      }).appendTo(this.$controls);

      $('<p>CH B</p>').css({
        top:    -2,
        left:   -2,
        right:  0,
        height: 20,
        textAlign: 'center',
    position: 'absolute'
      }).appendTo(this.$channel2);

      this._addScaleControl(this.$channel2, function () {
        self.model.bumpVerticalScale(2, -1);
      }, function () {
        self.model.bumpVerticalScale(2, 1);
      });

      $('<p class="oscope-label">time/div</p>').css({
        top:       179,
        left:      16,
        right:     0,
        height:    20,
        position:  'absolute'
      }).appendTo(this.$controls);

      this.$horizontal = $('<div>').css({
        position:  'absolute',
        top:       229,
        left:      11,
        width:     122,
        height:    100
      }).appendTo(this.$controls);

      this._addScaleControl(this.$horizontal, function () {
        self.model.bumpHorizontalScale(-1);
      }, function () {
        self.model.bumpHorizontalScale(1);
      });

      this.horizontalScaleChanged();
      for (i = 1; i <= this.model.N_CHANNELS; i++) {
        this.verticalScaleChanged(i);
      }

      $('<button id="AminusB" class="comboButton">A-B</button>').css({
        top:       298,
        left:      33,
        height:    23,
        width:     36,
        position:  'absolute'
      }).click(function(){
        self._toggleComboButton(true);
      }).appendTo(this.$controls);

      $('<button id="AplusB" class="comboButton">A+B</button>').css({
        top:       298,
        left:      74,
        height:    23,
        width:     36,
        position:  'absolute'
      }).click(function(){
        self._toggleComboButton(false);
      }).appendTo(this.$controls);



      // for testing the goodnessOfScale measurement
      $('<p class="goodnessOfScale"></p>').css({
        top:       229,
        left:      55,
        right:     0,
        height:    20,
        position:  'absolute'
      }).appendTo(this.$controls);

      return this.$view;
    },

  _toggleComboButton: function (isAminusB) {
    if (isAminusB) {
        this.model.toggleShowAminusB();
    } else {
        this.model.toggleShowAplusB();
    }

    // force-render both signals to make them dim/brighten. Rendering these will
    // automatically call the rendering of the combo trace is applicable
    this.renderSignal(1, true, this.previousPhaseOffset);
    this.renderSignal(2, true, this.previousPhaseOffset);


    $('.comboButton').removeClass('active');

    $('.channelA button').addClass('active')
    $('.vscale.channel2').html($('.vscale.channel1').html());

    if (this.model.showAminusB) {
      $('#AminusB').addClass('active');
    } else if (this.model.showAplusB) {
      $('#AplusB').addClass('active');
    } else {
      $('.channelA button').removeClass('active');
    }
  },

    _addScaleControl: function ($el, minusCallback, plusCallback) {
      $('<button>+</button>').css({
        position: 'absolute',
        top:   25,
        left:  25,
        width: 30
      }).click(plusCallback).appendTo($el);

      $('<button>&mdash;</button>').css({
        position: 'absolute',
        top:   25,
        right: 25,
        width: 30
      }).click(minusCallback).appendTo($el);
    },

    previousPhaseOffset: 0,

    renderSignal: function (channel, forced, _phaseOffset) {
      var s = this.model.getSignal(channel),
          t = this.traces[channel],
          horizontalScale,
          verticalScale,
          phaseOffset = (_phaseOffset || 0) + this.previousPhaseOffset,
          isComboActive = (this.model.showAminusB || this.model.showAplusB);

      if (s) {
        horizontalScale = this.model.getHorizontalScale();
        verticalScale   = isComboActive? this.model.getVerticalScale(1) : this.model.getVerticalScale(channel);

        // don't render the signal if we've already drawn it at the same scale
        if (!t || forced || (t.amplitude !== s.amplitude || t.frequency !== s.frequency || t.phase !== (s.phase + phaseOffset) ||
                   t.horizontalScale !== horizontalScale || t.verticalScale !== verticalScale)) {
          this.removeTrace(channel);
          this.traces[channel] = {
            amplitude:          s.amplitude,
            frequency:          s.frequency,
            phase:              (s.phase + phaseOffset),
            horizontalScale:    horizontalScale,
            verticalScale:      verticalScale,
            raphaelObjectMini:  this.drawTrace(this.miniRaphaelCanvas, this.miniViewConfig, s, channel, horizontalScale, verticalScale, phaseOffset, isComboActive),
            raphaelObject:      this.drawTrace(this.raphaelCanvas, this.largeViewConfig, s, channel, horizontalScale, verticalScale, phaseOffset, isComboActive)
          };
        }

        // Make sure channel 2 is always in front
        if (channel === 1 && this.traces[2]) {
          if (!!this.traces[2].raphaelObjectMini) this.traces[2].raphaelObjectMini.toFront();
          if (!!this.traces[2].raphaelObject) this.traces[2].raphaelObject.toFront();
        }

        // testing goodness of scale
        if (sparks.testOscopeScaleQuality) {
          var g = this.model.getGoodnessOfScale();
          console.log(g)
          var g0 = sparks.math.roundToSigDigits(g[0] ? g[0] : -1,4),
              g1 = sparks.math.roundToSigDigits(g[1] ? g[1] : -1,4)
          $(".goodnessOfScale").html("["+g0+","+g1+"]");
        }
      }
      else {
        this.removeTrace(channel);
      }
      this.renderComboTrace(phaseOffset);
    },

    renderComboTrace: function (phaseOffset) {
      this.removeTrace(3);
      if ((this.model.showAminusB || this.model.showAplusB) && this.model.getSignal(1) && this.model.getSignal(2)) {
        var a  = this.model.getSignal(1),
            b  = this.model.getSignal(2),
            bPhase = this.model.showAplusB ? b.phase : (b.phase + Math.PI),     // offset b's phase by Pi if we're subtracting
            rA = a.amplitude * Math.sin(a.phase),
            iA = a.amplitude * Math.cos(a.phase),
            rB = b.amplitude * Math.sin(bPhase),
            iB = b.amplitude * Math.cos(bPhase),
            combo = {
                amplitude: Math.sqrt(Math.pow(rA+rB, 2) + Math.pow(iA+iB, 2)),
                phase: Math.atan((rA+rB) / (iA+iB)) + phaseOffset + ((iA+iB) < 0 ? Math.PI : 0),
                frequency: a.frequency
            };
        this.traces[3] = {
            raphaelObjectMini: this.drawTrace(this.miniRaphaelCanvas, this.miniViewConfig, combo, 3, this.model.getHorizontalScale(), this.model.getVerticalScale(1), 0),
            raphaelObject: this.drawTrace(this.raphaelCanvas, this.largeViewConfig, combo, 3, this.model.getHorizontalScale(), this.model.getVerticalScale(1), 0)
        };
        $('#cha .chname').html(this.model.showAminusB? "A-B" : "A+B");
        $('#cha').css({color: this.traceLabelColors[2]});
      } else {
        $('#cha .chname').html("CHA");
        $('#cha').css({color: this.traceLabelColors[0]});
      }
    },

    removeTrace: function (channel) {
      if (this.traces[channel]) {
        if (this.traces[channel].raphaelObjectMini) this.traces[channel].raphaelObjectMini.remove();
        if (this.traces[channel].raphaelObject) this.traces[channel].raphaelObject.remove();
        delete this.traces[channel];
      }
      if (channel !== 3) {
        this.renderComboTrace(this.previousPhaseOffset);
      }
    },

    // Not moved to sparks.math because it's somewhat specialized for scope display
    humanizeUnits: function (val) {
      var prefixes  = ['M', 'k', '', 'm', 'μ', 'n', 'p'],
          order     = Math.floor(Math.log10(val) + 0.01),    // accounts for: Math.log10(1e-6) = -5.999999999999999
          rank      = Math.ceil(-1 * order / 3),
          prefix    = prefixes[rank+2],
          scaledVal = val * Math.pow(10, rank * 3),

          // Make sure the result has sensible digits ... values in range 1.00 .. 5.00 of whatever unit
          // (e.g, s, ms, μs, or ns) get 2 digits after the decimal point; values in range 10.0 .. 50.0 get 1 digit

          decimalPlaces = order % 3 >= 0 ? 2 - (order % 3) : -1 * ((order + 1) % 3);

      return scaledVal.toFixed(decimalPlaces) + prefix;
    },

    horizontalScaleChanged: function () {
      var scale = this.model.getHorizontalScale(),
          channel;

      // TODO make the units a little more sophisticated.
      this.$view.find('.hscale').html(this.humanizeUnits(scale));

      for (channel = 1; channel <= this.model.N_CHANNELS; channel++) {
        if (this.traces[channel]) this.renderSignal(channel);
      }
    },

    verticalScaleChanged: function (channel) {
      var scale = this.model.getVerticalScale(channel);

      this.$view.find('.vscale.channel'+channel).html(this.humanizeUnits(scale));
      if (this.traces[channel]) this.renderSignal(channel);
    },

    drawGrid: function (r, conf) {
      var path = [],
          x, dx, y, dy;

      for (x = dx = conf.width / this.nHorizontalMarks; x <= conf.width - dx; x += dx) {
        path.push('M');
        path.push(x);
        path.push(0);

        path.push('L');
        path.push(x);
        path.push(conf.height);
      }

      for (y = dy = conf.height / this.nVerticalMarks; y <= conf.height - dy; y += dy) {
        path.push('M');
        path.push(0);
        path.push(y);

        path.push('L');
        path.push(conf.width);
        path.push(y);
      }

      y = conf.height / 2;

      for (x = dx = conf.width / (this.nHorizontalMarks * this.nMinorTicks); x <= conf.width - dx; x += dx) {
        path.push('M');
        path.push(x);
        path.push(y-conf.tickSize);

        path.push('L');
        path.push(x);
        path.push(y+conf.tickSize);
      }

      x = conf.width / 2;

      for (y = dy = conf.height / (this.nVerticalMarks * this.nMinorTicks); y <= conf.height - dy; y += dy) {
        path.push('M');
        path.push(x-conf.tickSize);
        path.push(y);

        path.push('L');
        path.push(x+conf.tickSize);
        path.push(y);
      }

      return r.path(path.join(' ')).attr({stroke: this.tickColor, opacity: 0.5});
    },

    drawTrace: function (r, conf, signal, channel, horizontalScale, verticalScale, phaseOffset, _isFaint) {
      if (!r) return;
      var path         = [],
          height       = conf.height,
          h            = height / 2,

          overscan     = 5,                       // how many pixels to overscan on either side (see below)
          triggerStart = conf.width / 2,          // horizontal position at which the rising edge of a 0-phase signal should cross zero

          // (radians/sec * sec/div) / pixels/div  => radians / pixel
          radiansPerPixel = (2 * Math.PI * signal.frequency * horizontalScale) / (conf.width / this.nHorizontalMarks),

          // pixels/div / volts/div => pixels/volt
          pixelsPerVolt = (conf.height / this.nVerticalMarks) / verticalScale,

          isFaint = _isFaint || false,
          opacity = isFaint ? 0.3 : 1,

          x,
          raphaelObject,
          paths,
          i;

      // if we try and display too many waves on the screen (high radiansPerPixel) we end up with strange effects,
      // like beats or flat lines. Cap radiansPerPixel to Pi/2, which displays a solid block.
      if (radiansPerPixel > Math.PI / 2) radiansPerPixel = Math.PI / 2;

      function clip(y) {
        return y < 0 ? 0 : y > height ? height : y;
      }

      for (x = 0; x < conf.width + overscan * 2; x++) {
        path.push(x ===  0 ? 'M' : 'L');
        path.push(x);

        // Avoid worrying about the odd appearance of the left and right edges of the trace by "overscanning" the trace
        // a few pixels to either side of the scope window; we will translate the path the same # of pixels to the
        // left later. (Done this way we don't have negative, i.e., invalid, x-coords in the path string.)
        path.push(clip(h - signal.amplitude * pixelsPerVolt * Math.sin((x - overscan - triggerStart) * radiansPerPixel + (signal.phase + phaseOffset))));
      }
      path = path.join(' ');

      // slight 3d effect (inspired by CRT scopes) by overlaying a thin, oversaturated line over a fatter colored line
      paths = [];
      paths.push(r.path(path).attr({stroke: this.traceOuterColors[channel-1], 'stroke-width': 4.5, opacity: opacity}));
      paths.push(r.path(path).attr({stroke: this.traceInnerColors[channel-1], 'stroke-width': 2, opacity: opacity}));

      raphaelObject = r.set.apply(r, paths);

      // translate the path to the left to accomodate the overscan
      raphaelObject.translate(-1 * overscan, 0);

      return raphaelObject;
    }

  };

}());
