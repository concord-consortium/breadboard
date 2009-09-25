function ResistorActivity() {
    console.log('ENTER ResistorActivity');
    
    this.log = new ActivityLog();
    console.log('log=' + this.log);
    this.assessment = new Assessment(this, this.log);
    this.reporter = new Reporter(this.assessment);

    this.flash = null;
    this.multimeter = null;
    this.resistor = null;
}

ResistorActivity.prototype =
{
    log : null,
    assessment : null,
    reporter : null,
    flash : null,
    multimeter : null,
    resistor : null,

    // Initial operation on document when it is loaded
    initDocument : function() {
        // Disable all form elements
        $("input, select").attr("disabled", "true");

        // Hide the next buttons and their listeners
        $(".next_button").hide().click(nextButtonClicked);

        // Hide the show report buttons
        $(".show_report_button").hide().click(showReportClicked);
      
        // Add start and stop times to all forms
        $("form").append(
          "<input name='start_time' type='hidden'></input><input name='stop_time' type='hidden'></input>");
        
        $("#start_button").click(startButtonClicked);

        var dialog = $("#report").load("fake-report/report.html").dialog({autoOpen: false, width: 600});
    },

    // Initializations that can be done only when the flash movie is loaded
    onFlashDone : function() {
        var flash = getFlashMovie('resistor_colors');
        this.multimeter = new Multimeter();
        this.resistor = new Resistor();
        
        console.log('Nominal Resistance=' + this.resistor.nominalValue);
        console.log('Tolerance=' + this.resistor.tolerance * 100 + '%');
        console.log('Real Resistance=' + this.resistor.realValue);
        
        if (jQuery.sparks.debug_mode == 'multimeter') {
            sendCommand('set_debug_mode', 'multimeter');
            this.resistor.randomize();
            this.showRccDebugInfo(activity);
        }
    },
    
    // Re-initialize the circuit settings for a new set of questions
    resetCircuit : function() {
        console.log('ENTER ResistorActivity.resetCircuit');
        this.resistor.randomize();
        sendCommand('reset_circuit');
        this.multimeter.update();
    },
    
    completedTry : function() {
      var activity = jQuery.sparks.activity;
      var grader = activity.assessment.grader;
      
      var result2 = {}
      var formData = $("form").each(function (i) {
        var form = jQuery(this);
        result2[this.id] = serializeForm(form);
      });
      jQuery.sparks.allResults.push(result2)
    
      if(jQuery.sparks.debug) {  
        var resultString = jQuery.map(jQuery.sparks.allResults, function(el, i){
          return jQuery.toJSON(el)
        }).join("<br\>")
      
        $("#result").html("<pre>"+resultString+"</pre>")
      }
    
      // indication of correctness next to each item
      // show contextual help
      // cycle through the results using the name of each to find
      // the form and then add an icon next to the form
      
      // rated resistance
      
      grader.grade(result2);
    
      for (var item in result2) {  
        this.updateItem(result2, item) 
      }  
    
      if(jQuery.sparks.allResults.length < 3) {
        $(".next_button").each(function(){
          this.disabled = false
        }).show()
      } else {
        $(".next_button").hide();
        $(".show_report_button").show();
        jQuery.sparks.activity.log.add('end_activity');
      }
    },
    
    updateItem : function(result, name) {
      var itemForm = $("#" + name);
      var titleText = ""
      if(result[name].message){
        titleText = "title='" + result[name].message + "' ";
      }
      
      if(result[name].correct){
        itemForm.prepend("<img class='grade' src='../../icons/ok.png' " + titleText + "/>")    
      } else {
        itemForm.prepend("<img class='grade' src='../../icons/cancel.png' " + titleText + "/>")
      }  
    },
    
    startTry : function() {
      // reset fields to their initial value
      $("form").each(function (i){ this.reset()})
      
      // This is an alternative, but it doesn't do the right thing with some form input elements
      // $("form").map(function (){ return jQuery.makeArray(this.elements)})
      // .each(function (i){ $(this).val(null)})
      // for a better example see: http://www.learningjquery.com/2007/08/clearing-form-data
      
      // clear the grading icons
      $(".grade").remove()
      
      // hide the contextual help  
    
      // generate the resistor numbers
      // display them on the page so people can see it working
      // this is defined in javascript/resistor_activity.js
      var activity = jQuery.sparks.activity;
      
      activity.resetCircuit();
      activity.resistor.show();
    
      if(jQuery.sparks.debug){
          console.log('1 activity=' + activity);
        this.showRccDebugInfo(activity);
      }
      
      form = $("form:first")
      this.enableForm(form)
    },
    
    showRccDebugInfo : function(activity) {
        var resistor = activity.resistor;
        var model = $("#rcc_model");
        var debug_div = $("#rcc_debug");
        
        console.log('debug_div=' + debug_div.length);
        
        var html =
          "Nominal Value: " + resistor.nominalValue + "<br/>" +
          "Tolerance: " + resistor.tolerance * 100.0 + "%<br/>" +
          "Real Value: " + resistor.realValue + "<br/>" +
          "Display Value: " + activity.multimeter.getDisplayValue(resistor.realValue) + "<br/>";
        
        if (debug_div.length > 0) {
            debug_div.html(html);
        }
        else {
            model.append('<div id="rcc_debug">' + html + '</div>');
        }
    },
    
    enableForm : function(form) {
      form.append("<button>Submit</button>")
      form.find("button").click(buttonClicked) 
      form.find("input, select").removeAttr("disabled")
      form.css("background-color", "rgb(253,255,184)")
      form.find("input[name='start_time']").attr("value", "" + (new Date()).getTime())
    },
    
    disableForm : function(form) {
      form.find("input[name='stop_time']").attr("value", "" + (new Date()).getTime())
      form.find("button").remove() 
      form.find("input, select").attr("disabled", "true")
      form.css("background-color", "")
    }
}

function buttonClicked(event) {
    var form = jQuery(event.target).parent();
    jQuery.sparks.activity.disableForm(form);
    var nextForm = form.nextAll("form:first");
    if(nextForm.size() == 0){
      jQuery.sparks.activity.completedTry();
    } else {
      jQuery.sparks.activity.enableForm(nextForm);
    }
  }
  
function startButtonClicked(event) {
    console.log('EVENT: ' + (typeof event));
    for (x in event) {
        console.log('event ' + x);
    }
    jQuery(event.target).hide();
    jQuery.sparks.activity.log.add('start_activity');
    jQuery.sparks.activity.startTry();
}

function nextButtonClicked(event) {
    $(".next_button").each(function(i){
      this.disabled = true;
    })
    jQuery.sparks.activity.startTry()
}

function showReportClicked(event) {
    jQuery.sparks.activity.reporter.report();
    $("#report").dialog('open');
}
