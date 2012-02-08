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
      
      var self = this;
      this.popup.bind('remove', function() {
        $('#fg_value').html('');
        self.popup = null;
      });
      
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
        top:      28,
        left:     0,
        height:   70
      }).appendTo(this.$faceplate);

      this.$frequency = $('<div>').css({
        position:  'absolute',
        top:       12,
        left:      10,
        width:     150,
        height:    55
      }).appendTo(this.$controls);
      
      var freqs = this.frequencies;
      var initialStep = sparks.util.getClosestIndex(freqs, this.model.frequency, false);
      this._addSliderControl(this.$frequency, freqs.length, initialStep, function (evt, ui) {
        var i = ui.value;
        if (i < 0) i = 0;
        if (i > freqs.length-1) i = freqs.length-1;
        var freq = freqs[i];
        self.model.setFrequency(freq);
        self.setFrequency(freq);
      });
      
      $('<span>Frequency</span>').css({
        position:  'absolute',
        top:       43,
        left:      45,
        width:     100,
        height:    15
      }).appendTo(this.$controls);
      
      if (this.model.maxAmplitude){
        this.$amplitude = $('<div>').css({
          position: 'absolute',
          top:      35,
          left:     10,
          width:    150,
          height:   55
        }).appendTo(this.$controls);
        
        var minAmp = this.model.minAmplitude,
            maxAmp = this.model.maxAmplitude,
            amplitude = this.model.amplitude,
            range = maxAmp - minAmp,
            steps = 30,
            value = ((amplitude - minAmp) / range) * steps;
        this._addSliderControl(this.$amplitude, steps, value, function (evt, ui) {
          var i = ui.value;
          if (i < 0) i = 0;
          if (i > steps) i = steps;
          var amp = ((i / steps) * range) + minAmp;
          self.model.setAmplitude(amp);
        });

        $('<span>Amplitude</span>').css({
          position: 'absolute',
          top:    66,
          left:   45,
          right:  100,
          height: 15,
          textAlign: 'center'
        }).appendTo(this.$controls);
      }

      return this.$view;
    },

    setFrequency: function (freq) {
      currentFreqString = this.currentFreqString = sparks.mathParser.standardizeUnits(sparks.unit.convertMeasurement(freq + " Hz"));
      this.freqValueViews.forEach(function($view){$view.text(currentFreqString);});
      return this.currentFreqString;
    },

    _addSliderControl: function ($el, steps, value, callback) {
      $slider = $("<div id='fg_slider'>").css({
        position: 'absolute',
        top:   25,
        left:  10,
        right: 10
      }).slider({ max: steps, slide: callback, value: value }).appendTo($el);
      if (steps < 2) {
        $slider.easyTooltip({
           content: "You can't change this frequency in this activity"
        });
      }
    }
  };

}());
