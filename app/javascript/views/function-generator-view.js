/*globals sparks Raphael*/

(function () {
  
  sparks.FunctionGeneratorView = function (functionGenerator) {
    this.$view         = null;
    this.model         = functionGenerator;
    this.frequencies   = [];
  };
    
  sparks.FunctionGeneratorView.prototype = {
    
    width:    200,
    height:   100,
    nMinorTicks:      5,

    faceplateColor:   '#EEEEEE',
    
    /**
      @returns $view A jQuery object containing a Raphael canvas displaying the oscilloscope traces.
      
      Sets this.$view to be the returned jQuery object.
    */
    getView: function () {
      var $canvasHolder,
          self = this;
      
      this.$view = $('<div>');
      this.$view.css({
        position: 'relative',
        width: this.width,
        height: this.height
      });
      
      // 'faceplate'
      this.$faceplate = $('<div class="function_generator">').css({
        position: 'absolute',
        left: 0,
        right: 0,
        height: this.height,        
        backgroundColor: this.faceplateColor,
        border: '5px groove'
      }).appendTo(this.$view);
      
      $('<p>Function Generator</p>').css({
        top:       10,
        left:      0,
        right:     0,
        height:    20,
        textAlign: 'center',
        'font-weight': 'bold'
      }).appendTo(this.$faceplate);
      
      this.$controls = $('<div>').css({
        position: 'absolute',
        top:      20,
        left:     0,
        right:    0,
        height:   100
      }).appendTo(this.$faceplate);
        
      this.$frequency = $('<div>').css({
        position:  'absolute',
        top:       10,
        left:      0,
        width:     150,
        height:    100
      }).appendTo(this.$controls);
      
      $('<p>Frequency</p>').css({
        top:       0,
        left:      0,
        right:     0,
        height:    20,
        textAlign: 'center'
      }).appendTo(this.$frequency);
      
      var freqs = self.model.getPossibleFrequencies();
      
      this._addSliderControl(this.$frequency, freqs.length, function (evt, ui) {
        var i = ui.value;
        if (i < 0) i = 0;
        if (i > freqs.length-1) i = freqs.length-1;
        var freq = freqs[i];
        self.model.setFrequency(freq);
        $('#freq_value').text(sparks.mathParser.standardizeUnits(sparks.unit.convertMeasurement(freq + " Hz")))
      });
      
      $('<p id="freq_value">' + sparks.mathParser.standardizeUnits(sparks.unit.convertMeasurement(freqs[0] + " Hz")) + '</p>').css({
        position:  'absolute',
        top:       45,
        left:      0,
        right:     0,
        height:    20,
        textAlign: 'center'
      }).appendTo(this.$frequency);
      
      // this.$amplitude = $('<div>').css({
      //   position: 'absolute',
      //   top:      10,
      //   left:     150,
      //   width:    150,
      //   height:   100
      // }).appendTo(this.$controls);
      // 
      // $('<p>Amplitude</p>').css({
      //   top:    0,
      //   left:   0,
      //   right:  0,
      //   height: 20,
      //   textAlign: 'center'
      // }).appendTo(this.$amplitude);
      // 
      // this._addScaleControl(this.$amplitude, function () {
      //   self.model.setAmplitude(self.model.amplitude * 1.1);
      // }, function () {
      //   self.model.setAmplitude(self.model.amplitude / 1.1);
      // });
      
      return this.$view;
    },
    
    _addSliderControl: function ($el, steps, callback) {
      console.log("steps = "+steps)
      $("<div id='fg_slider'>").css({
        position: 'absolute',
        top:   25,
        left:  10,
        right: 10
      }).slider({ max: steps, slide: callback }).appendTo($el);
    },
    
    _addScaleControl: function ($el, minusCallback, plusCallback) {
      $('<button>+</button>').css({
        position: 'absolute',
        top:   25,
        left:  35,
        width: 30
      }).click(plusCallback).appendTo($el);
      
      $('<button>-</button>').css({
        position: 'absolute',
        top:   25,
        right: 35,
        width: 30
      }).click(minusCallback).appendTo($el);
    }      
  };
  
}());
