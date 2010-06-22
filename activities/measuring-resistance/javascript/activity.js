//= require <activity>
//= require <string>
//= require <ui>
//= require <circuit/multimeter>
//= require <circuit/resistor-4band>
//= require <circuit/resistor-5band>
//= require "activity-dom-helper"
//= require "assessment/activity-log"
//= require "assessment/assessment"
//= require "assessment/reporter"

/* FILE activity.js */

(function () {

    var mr = sparks.activities.mr;
    var flash = sparks.flash;
    var str = sparks.string;
    var util = sparks.util;
    
    sparks.config.flash_id = 'resistor_colors';
    
    sparks.config.debug = jQuery.url.param("debug") !== undefined;
    sparks.config.debug_nbands = jQuery.url.param("n") ? Number(jQuery.url.param("n")) : null;
    sparks.config.debug_rvalue = jQuery.url.param("r") ? Number(jQuery.url.param("r")) : null;
    sparks.config.debug_mvalue = jQuery.url.param("m") ? Number(jQuery.url.param("m")) : null;
    sparks.config.debug_tvalue = jQuery.url.param("t") ? Number(jQuery.url.param("t")) : null;

    mr.Activity = function () {
        mr.Activity.uber.init.apply(this);
        
        var activity = this;
        this.dataService = null;
        this.log = new mr.ActivityLog();
        this.assessment = new mr.Assessment(this);
        this.reporter = new mr.Reporter($('#report_area'));

        this.circuit = null;
        this.multimeter = null;
        this.resistor = null;

        this.current_session = 0;
        this.current_question = 0;
        this.allResults = [];

    };
    
    sparks.config.Activity = sparks.activities.mr.Activity;
    
    sparks.extend(mr.Activity, sparks.Activity, {

        setDataService: function (ds) {
            this.dataService = ds;
        },

        // Initial operation on document when it is loaded
        onDocumentReady: function () {
            var self = this;

            this.dom = mr.ActivityDomHelper;
            
            this.root_dir = sparks.config.root_dir + '/activities/measuring-resistance';
            this.sessionTitle = $('#session_title');
            this.endSessionInstruction = $('.instruction_end_session');
            this.questionsElem = $('#questions_area');
            this.reportElem = $('#report_area').hide();
            
            if (sparks.config.debug) {
                $('#json_button').click(function () {
                    $('#json_current_log').html('<pre>' + sparks.util.prettyPrint(activity.log.sessions, 4) + '</pre>' + JSON.stringify(activity.log));
                });
            }
            else {
                $('#json').hide();
            }
            
            this.buttonize();
            
            $('body').scrollTop(0); //scroll to top
            
            // Disable all form elements
            $('input, select').attr("disabled", "true");

            // Hide the next buttons and their listeners
            $('.next_button').hide().click(function (event) {
                self.nextButtonClicked(self, event);
            });

            // Add start and stop times to all forms
            $('form').append(
              "<input name='start_time' type='hidden'></input><input name='stop_time' type='hidden'></input>");

            $('#start_button').click(function (event) {
                self.startButtonClicked(self, event);
            });
            var local = this.dataService ? false : true;
            this.rubic = util.getRubric(1, function (rubric) { self.rubric = rubric; }, local);
        },

        // Initializations that can be done only when the flash movie is loaded
        onFlashReady: function () {
            this.multimeter = new sparks.circuit.Multimeter();
            this.resistor4band = new sparks.circuit.Resistor4band('resistor_4band');
            this.resistor5band = new sparks.circuit.Resistor5band('resistor_5band');

            //console.log('Nominal Resistance=' + this.resistor.nominalValue);
            //console.log('Tolerance=' + this.resistor.tolerance * 100 + '%');
            //console.log('Real Resistance=' + this.resistor.realValue);

        },
        
        // Re-initialize the circuit settings for a new set of questions
        resetCircuit: function () {
            console.log('ENTER ResistorActivity.resetCircuit');
            if (sparks.config.debug_nbands) {
                this.setCurrentResistor(sparks.config.debug_nbands == 4 ? this.resistor4band : this.resistor5band);
            }
            else {
                if (Math.random() < 0.75) {
                    this.setCurrentResistor(this.resistor4band);
                }
                else {
                    this.setCurrentResistor(this.resistor5band);
                }
            }
            flash.sendCommand('set_current_resistor', this.currentResistor.id);

            var r = this.currentResistor;
            
            if (sparks.config.debug_rvalue || sparks.config.debug_mvalue ||
                sparks.config.debug_tvalue)
            {
                if (sparks.config.debug_rvalue) {
                    r.setNominalValue(sparks.config.debug_rvalue);
                }
                if (sparks.config.debug_mvalue) {
                    r.setRealValue(sparks.config.debug_mvalue);
                }
                if (sparks.config.debug_tvalue) {
                    r.setTolerance(sparks.config.debug_tvalue);
                }
                r.updateColors(r.getNominalValue(), r.getTolerance());
            }
            else {
                r.randomize();
            }
            flash.sendCommand('reset_circuit');
            this.logResistorState();
            console.log('currentResistor=' + sparks.activity.currentResistor);
            this.multimeter.update();
        },

        setCurrentResistor: function (resistor) {
          this.currentResistor = resistor;
          flash.sendCommand('set_current_resistor', resistor.id);
        },

        enableCircuit: function () {
            flash.sendCommand('enable_circuit');
        },

        disableCircuit: function () {
            flash.sendCommand('disable_circuit');
        },

        // Completed a session (finished with one resistor)
        completedTry: function () {
            var result = {};

            $("form").each(function (i) {
                var form = jQuery(this);
                result[this.id] = sparks.util.serializeForm(form);
            });

            if (sparks.config.debug) {
                var resultString = jQuery.map(this.allResults, function (el, i) {
                    return jQuery.toJSON(el);
                }).join("<br/>");
                $("#result").html("<pre>"+resultString+"</pre>");
            }

            this.assessment.receiveResultFromHTML(result);
            this.feedback = this.assessment.grade(this.log.currentSession(), this.rubric);
            this.assessment.sendResultToHTML(result, this.feedback);

            // Update forms
            for (var item in result) {
                this.updateItem(result, item);
            }

            //$(".show_report_button").show();
            this.questionsElem.hide();
            this.reportElem.show();
            this.reporter.report(this.log.currentSession(), this.feedback);
            
            $(".next_button").each(function () {
                //this.disabled = false;
                $(this).button('enable');
            }).show();

            this.updateEndInstruction();
            this.endSessionInstruction.show();
            this.log.add('end_section');
            this.log.add('end_session');

            this.saveStudentData();
            $('body').scrollTop(this.reportElem.offset().top);
        },

        updateEndInstruction : function () {
            var t = 'Click on Next to try another resistor.';
            this.endSessionInstruction.text(t);
        },

        updateItem : function (result, name) {
          var itemForm = $("#" + name);
          var titleText = '';
          var image = '';

          if(result[name].message){
            titleText = "title='" + result[name].message + "' ";
          }

          if (result[name].correct == 4) {
            image = 'ok.png';
            label = 'Correct!';
          }
          else if (result[name].correct > 0) {
            image = 'yellow-circle.png';
            label = 'Partially correct, Click Help in the report!';
          }
          else {
            image = 'cancel.png';
            label = 'Incorrect, Click Help in the report!';
          }

          itemForm.prepend('<img title="' + label + '" class="grade" src="' + sparks.config.root_dir + '/common/icons/' + image + '"'  + titleText + "/>");
        },

        // Start new session (new resistor)
        startTry : function () {
          ++ this.current_session;
          this.log.beginNextSession();
          this.current_question = 1;

          this.reportElem.hide();
          this.endSessionInstruction.hide();
          this.questionsElem.show();
          this.sessionTitle.html('<h3>Resistor #' + this.current_session + '</h3>');
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

          if (sparks.config.debug) {
              this.showRccDebugInfo();
          }

          var form = $("form:first");
          this.enableForm(form);

          this.disableCircuit();

          //console.log('current_session changed to: ' + this.current_session);
          // Logging initial conditions
          this.log.add('start_session');
          if (this.multimeter.redPlugConnection) {
            this.log.add('connect', { conn1: 'red_plug', conn2: this.multimeter.redPlugConnection });
          }
          if (this.multimeter.blackPlugConnection) {
            this.log.add('connect', { conn1: 'black_plug', conn2: this.multimeter.blackPlugConnection });
          }
          this.log.add('start_section');
          this.log.add('start_question', { section : this.current_section, question : 1 });
          $('body').scrollTop(0); //scroll to top
          this.buttonize();
        },

        showRccDebugInfo : function () {
            var resistor = this.currentResistor;
            var model = $("#rcc_model");
            var debug_div = $("#rcc_debug");
            var min = resistor.getNominalValue() * (1 - resistor.getTolerance());
            var max = resistor.getNominalValue() * (1 + resistor.getTolerance());

            //console.log('debug_div=' + debug_div.length);

            var html =
              'Type: ' + resistor.getNumBands() + '-band<br />' +
              'Nominal Value: ' + resistor.getNominalValue() + '<br />' +
              'Tolerance: ' + resistor.getTolerance() * 100.0 + '%<br />' +
              'Calculated colors: ' + resistor.getColors(resistor.getNominalValue(), resistor.getTolerance()) + '<br />' +
              'Range: [' + sparks.unit.res_str(min) + ', ' + sparks.unit.res_str(max) + ']<br />' + 
              'Real Value: ' + resistor.getRealValue() + '<br />' +
              'Display Value: ' + this.multimeter.makeDisplayText(resistor.getRealValue()) + '<br />';

            if (debug_div.length > 0) {
                debug_div.html(html);
            }
            else {
                model.append('<div id="rcc_debug">' + html + '</div>');
            }
        },

        enableForm: function (form) {
          var self = this;
          form.append("<button>Submit</button>");
          this.buttonize();
          form.find("button").click(function (event) {
              self.submitButtonClicked(self, event);
              event.preventDefault();
          }); 
          form.find("input, select").removeAttr("disabled");
          form.find("input, select").keypress(function (event) {
              if (event.keyCode == '13') { //13: Enter key
                return false; //to prevent IE from reloading the page
              }
          });
          form.css("background-color", "rgb(253,255,184)");
          form.find("input[name='start_time']").attr("value", "" + (new Date()).getTime());
        },

        disableForm: function (form) {
          form.find("input[name='stop_time']").attr("value", "" + (new Date()).getTime());
          form.find("button").remove(); 
          form.find("input, select").attr("disabled", "true");
          form.css("background-color", "");
        },

        logResistorState : function () {
            this.log.setValue('resistor_num_bands', this.currentResistor.numBands);
            this.log.setValue('nominal_resistance', this.currentResistor.nominalValue);
            this.log.setValue('tolerance', this.currentResistor.tolerance);
            this.log.setValue('real_resistance', this.currentResistor.realValue);
            this.log.setValue('displayed_resistance',
                              this.multimeter.makeDisplayText(this.currentResistor.realValue));
        },

        saveStudentData : function () {
            if (this.dataService) {
                var obj = { learner_id: this.learner_id,
                            content: JSON.stringify([this.log.currentSession()]),
                            graded_result: JSON.stringify(this.feedback)
                };
                this.dataService.save(obj);
            }
            else {
                alert('Not saving the data:\neither not logged in and/or no data service defined');
            }
        },
        
        validateAnswer: function (questionNum) {
            var value, unit, msg;
            var title = 'Alert';
            
            var answer = this.dom.getAnswer(questionNum);
            
            switch (questionNum) {
            case 1:
            case 3:
                if (!this.dom.validateNumberString(answer[0])) {
                    msg = "I can't recognize the value you entered. Please enter a number.";
                    sparks.ui.alert(title, msg);
                    return false;
                }
                if (answer[1] === 'Units...') {
                    msg = 'Please select a unit before submitting your answer.';
                    sparks.ui.alert(title, msg);
                    return false;
                }
                return true;
            case 2:
                if (answer === 'Select one') {
                    msg = 'Please select a tolerance value before submitting your answer.';
                    sparks.ui.alert(title, msg);
                    return false;
                }
                return true;
            case 4:
                if (!this.dom.validateNumberString(answer[0]) ||
                    !this.dom.validateNumberString(answer[2]))
                {
                    msg = "I can't recognize the values you entered. Please enter numbers.";
                    sparks.ui.alert(title, msg);
                    return false;
                }
                if (answer[1] === 'Units...' ||
                    answer[3] === 'Units...')
                {
                    msg = 'Please select a unit for each value before submitting your answer.';
                    sparks.ui.alert(title, msg);
                    return false;
                }
                return true;
            case 5:
                if (answer === undefined || answer === null || str.strip(answer) === '') {
                    msg = 'Please check yes or no before submitting your answer.';
                    sparks.ui.alert(title, msg);
                    return false;
                }
                return true;
            default:
                alert('ERROR: wrong question number ' + questionNum);
                return false;
            }
            return true;
        },

        // Submit button for question
        submitButtonClicked: function (activity, event) {
            if (!activity.validateAnswer(activity.current_question)) {
                return;
            }

            // Using parents() because:
            // parent() won't work on Sarari and some versions of IE,
            // parentsUntil().parent() won't work on FireFox
            var form = jQuery(event.target).parents('.question_form');
            activity.disableForm(form);
            var nextForm = form.nextAll("form:first");
            activity.log.add('end_question', { question : activity.current_question });
            
            if (nextForm.size() === 0) { //all questions answered for current session
                activity.completedTry();
            }
            else {
                activity.enableForm(nextForm);
                ++activity.current_question;
                activity.log.add('start_question', { question : activity.current_question });
                //console.log('current_question=' + activity.current_question);
                if (activity.current_question === 3) {
                    activity.enableCircuit();
                }
            }
        },

        startButtonClicked: function (activity, event) {
            //console.log('EVENT: ' + (typeof event));
            $('#intro_area').hide();
            activity.startTry();
        },

        nextButtonClicked: function (activity, event) {
            $(".next_button").each(function (i){
              this.disabled = true;
            });
            $('.show_report_button').hide();
            activity.startTry();
        }
    });
    
})();
