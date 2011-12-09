/*globals sparks Raphael*/

(function () {

  sparks.FunctionGeneratorView = function (functionGenerator) {
    this.$view          = null;
    this.model          = functionGenerator;
    this.frequencies    = [];
    this.currentFreqString = "";
    this.freqValueViews = [];
    this.popup = null;
  };

  sparks.FunctionGeneratorView.prototype = {

    width:    200,
    height:   100,
    nMinorTicks:      5,

    faceplateColor:   '#EEEEEE',
    
    getView: function () {
      this.$view = $('<div>');
      
      $freq_value = $("<span id='fg_value'></span").appendTo(this.$view);
      this.freqValueViews.push($freq_value);
      
      this.frequencies = this.model.getPossibleFrequencies();
      this.setFrequency(this.model.frequency);
      
      $overlayDiv = $('<div id="fg_mini_overlay"></div>').appendTo(this.$view);
      var self = this;
      $overlayDiv.click(function(){
        self.openPopup();
      })
      
      return this.$view;
    },
    
    openPopup: function () {
      if (!this.popup) {
        $view = this.getLargeView();
        this.popup = $view.dialog({
          width: this.width + 10,
          height: this.height+37,
          dialogClass: 'tools-dialog fg_popup',
          title: "Function Generator",
          closeOnEscape: false,
          resizable: false,
          autoOpen: false
        });
      }
      
      this.popup.dialog('open').dialog("widget").position({
         my: 'left top',
         at: 'left top',
         offset: '5, 5',
         of: $("#breadboard_wrapper")
      });
    },
    
    getLargeView: function () {
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
        height: this.height
      }).appendTo(this.$view);
      
      $freq_value = $('<p id="freq_value">'+this.currentFreqString+'</p>').css({
        position:  'absolute',
        top:       15,
        left:      15,
        height:    20,
        textAlign: 'center'
      }).appendTo(this.$faceplate);
      
      this.freqValueViews.push($freq_value);

      this.$controls = $('<div id="controls">').css({
        position: 'absolute',
        top:      30,
        left:     0,
        height:   70
      }).appendTo(this.$faceplate);

      this.$frequency = $('<div>').css({
        position:  'absolute',
        top:       10,
        left:      10,
        width:     150,
        height:    55
      }).appendTo(this.$controls);
      
      var freqs = this.frequencies;
      
      this._addSliderControl(this.$frequency, freqs.length, function (evt, ui) {
        var i = ui.value;
        if (i < 0) i = 0;
        if (i > freqs.length-1) i = freqs.length-1;
        var freq = freqs[i];
        self.model.setFrequency(freq);
        self.setFrequency(freq);
      });
      
      $('<span>Frequency</span>').css({
        position:  'absolute',
        top:       45,
        left:      45,
        width:     100,
        height:    15
      }).appendTo(this.$controls);

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

    setFrequency: function (freq) {
      currentFreqString = this.currentFreqString = sparks.mathParser.standardizeUnits(sparks.unit.convertMeasurement(freq + " Hz"));
      this.freqValueViews.forEach(function($view){$view.text(currentFreqString);});
      return this.currentFreqString;
    },

    _addSliderControl: function ($el, steps, callback) {
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
