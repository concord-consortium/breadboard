/* The following line (global) is for JSLint */
/*global console, window, jQuery, $, ActivityLog, Assessment, Flash, Multimeter, Reporter, Resistor, Util */

// Submit button for question
function submitButtonClicked(event) {
    var activity = jQuery.sparks.activity;
    var form = jQuery(event.target).parent();
    activity.disableForm(form);
    var nextForm = form.nextAll("form:first");
    
    activity.log.add('end_question', { section : activity.current_section,
        question : activity.current_question });
    
    if (nextForm.size() === 0) { //all questions answered for current section
        activity.completedTry();
    } else {
        activity.enableForm(nextForm);
        ++activity.current_question;
        activity.log.add('start_question', { section : activity.current_section,
            question : activity.current_question });
        console.log('current_question=' + activity.current_question);
        if (activity.current_question == 3) {
            activity.enableCircuit();
        }
    }
}

function startButtonClicked(event) {
    console.log('EVENT: ' + (typeof event));
    //jQuery(event.target).hide();
    $('#intro_area').hide();
    jQuery.sparks.activity.startTry();
}

function nextButtonClicked(event) {
    $(".next_button").each(function(i){
      this.disabled = true;
    });
    jQuery.sparks.activity.startTry();
}

function showReportButtonClicked(event) {
    var activity = jQuery.sparks.activity;
    activity.reporter.reportOnSection(activity.current_section);
    /*
    $("#report").load("report-templates/report.html", {}, function() {
        jQuery.sparks.activity.reporter.report();
        $("#report").dialog('open');
    });
    */
    /*
    $("#report").load("report-templates/report.html", {}, function() {
        jQuery.sparks.activity.reporter.report();
    }).show();
    */
}

function ResistorActivity() {
    console.log('ENTER ResistorActivity');
    $('body').scrollTop(0); //scroll to top
    
    this.log = new ActivityLog();
    this.assessment = new Assessment(this, this.log);
    this.reporter = new Reporter(this.assessment);

    this.circuit = null;
    this.multimeter = null;
    this.resistor = null;
    
    this.current_section = 0;
    this.current_question = 0;
    this.allResults = [];

    this.sectionTitle = $('#section_title');
    this.endSectionInstruction = $('#instruction_end_section');
    $('#rated_r_feedback').hide();
    $('#rated_t_feedback').hide();
    $('#measured_r_feedback').hide();
    $('#t_range_feedback').hide();
}

ResistorActivity.prototype =
{
    // Initial operation on document when it is loaded
    initDocument : function() {
        // Disable all form elements
        $('input, select').attr("disabled", "true");

        // Hide the next buttons and their listeners
        $('.next_button').hide().click(nextButtonClicked);

        // Hide the show report buttons
        $('.show_report_button').hide().click(showReportButtonClicked);
      
        // Add start and stop times to all forms
        $('form').append(
          "<input name='start_time' type='hidden'></input><input name='stop_time' type='hidden'></input>");
        
        $('#start_button').click(startButtonClicked);
        
        $('#report').dialog({ autoOpen: false, width: 800,
            height : $(window).height() * 0.9 });
    },

    // Initializations that can be done only when the flash movie is loaded
    onFlashDone : function() {
        this.multimeter = new Multimeter();
        this.resistor = new Resistor();
        
        console.log('Nominal Resistance=' + this.resistor.nominalValue);
        console.log('Tolerance=' + this.resistor.tolerance * 100 + '%');
        console.log('Real Resistance=' + this.resistor.realValue);
        
        if (jQuery.sparks.debug_mode == 'multimeter') {
            Flash.sendCommand('set_debug_mode', 'multimeter');
            this.resistor.randomize();
            this.showRccDebugInfo();
        }
    },
    
    // Re-initialize the circuit settings for a new set of questions
    resetCircuit : function() {
        console.log('ENTER ResistorActivity.resetCircuit');
        this.resistor.randomize();
        Flash.sendCommand('reset_circuit');
        this.multimeter.update();
    },
    
    enableCircuit : function() {
        Flash.sendCommand('enable_circuit');
    },
    
    disableCircuit : function() {
        Flash.sendCommand('disable_circuit');
    },
    
    // Completed a section (finished with one resistor)
    completedTry : function() {
        var result = {};
      
        $("form").each(function(i) {
            var form = jQuery(this);
            result[this.id] = Util.serializeForm(form);
        });

        if (jQuery.sparks.debug) {
            var resultString = jQuery.map(this.allResults, function(el, i) {
                return jQuery.toJSON(el);
            }).join("<br/>");
            $("#result").html("<pre>"+resultString+"</pre>");
        }

        this.assessment.grader.grade(result, this.current_section);

        // Update forms
        for (var item in result) {
            this.updateItem(result, item);
        }

        if (!this.log.currentSection().questions[0].correct) {
            $('#rated_r_feedback').show();
        }
        if (!this.log.currentSection().questions[1].correct) {
            $('#rated_t_feedback').show();
        }
        if (!this.log.currentSection().questions[2].correct) {
            $('#measured_r_feedback').show();
        }
        if (!this.log.currentSection().questions[3].correct) {
            $('#t_range_feedback').show();
        }
      
        $(".show_report_button").show();
    
        $(".next_button").each(function() {
            this.disabled = false;
        }).show();
        
        this.updateEndInstruction();
        this.endSectionInstruction.show();
    },
    
    updateEndInstruction : function() {
        var t = 'You have completed resistor #' + this.current_section + '. ';
        t += 'Click on Show Report to see the current result. Click on Next to try another resistor.';
        this.endSectionInstruction.text(t);
    },
    
    updateItem : function(result, name) {
      var itemForm = $("#" + name);
      var titleText = "";
      if(result[name].message){
        titleText = "title='" + result[name].message + "' ";
      }
      
      if(result[name].correct){
        itemForm.prepend("<img class='grade' src='../../common/icons/ok.png' " + titleText + "/>");
      } else {
        itemForm.prepend("<img class='grade' src='../../common/icons/cancel.png' " + titleText + "/>");
      }  
    },
    
    // Start new section (set of questions)
    startTry : function() {
      ++ this.current_section;
      this.log.beginNextSection();
      this.current_question = 1;

      this.endSectionInstruction.hide();
      this.sectionTitle.html('<h3>Resistor #' + this.current_section + '</h3>');
      $('#rated_r_feedback').hide();
      $('#rated_t_feedback').hide();
      $('#measured_r_feedback').hide();
      $('#t_range_feedback').hide();
      
      // reset fields to their initial value
      $("form").each(function (i){ this.reset(); });
      
      // This is an alternative, but it doesn't do the right thing with some form input elements
      // $("form").map(function (){ return jQuery.makeArray(this.elements)})
      // .each(function (i){ $(this).val(null)})
      // for a better example see: http://www.learningjquery.com/2007/08/clearing-form-data
      
      // clear the grading icons
      $(".grade").remove();
      
      // hide the contextual help  
    
      // generate the resistor numbers
      // display them on the page so people can see it working
      // this is defined in javascript/resistor_activity.js
      this.resetCircuit();
      this.resistor.show();
    
      if(jQuery.sparks.debug){
        this.showRccDebugInfo();
      }
      
      var form = $("form:first");
      this.enableForm(form);
      
      this.disableCircuit();
      
      console.log('current_section changed to: ' + this.current_section);
      this.log.add('start_section');
      this.log.add('start_question', { section : this.current_section, question : 1 });
      $('body').scrollTop(0); //scroll to top
    },
    
    showRccDebugInfo : function() {
        var resistor = this.resistor;
        var model = $("#rcc_model");
        var debug_div = $("#rcc_debug");
        
        console.log('debug_div=' + debug_div.length);
        
        var html =
          "Nominal Value: " + resistor.nominalValue + "<br/>" +
          "Tolerance: " + resistor.tolerance * 100.0 + "%<br/>" +
          "Real Value: " + resistor.realValue + "<br/>" +
          "Display Value: " + this.multimeter.makeDisplayText(resistor.realValue) + "<br/>";
        
        if (debug_div.length > 0) {
            debug_div.html(html);
        }
        else {
            model.append('<div id="rcc_debug">' + html + '</div>');
        }
    },
    
    enableForm : function(form) {
      form.append("<button>Submit</button>");
      form.find("button").click(submitButtonClicked); 
      form.find("input, select").removeAttr("disabled");
      form.css("background-color", "rgb(253,255,184)");
      form.find("input[name='start_time']").attr("value", "" + (new Date()).getTime());
    },
    
    disableForm : function(form) {
      form.find("input[name='stop_time']").attr("value", "" + (new Date()).getTime());
      form.find("button").remove(); 
      form.find("input, select").attr("disabled", "true");
      form.css("background-color", "");
    }
};
