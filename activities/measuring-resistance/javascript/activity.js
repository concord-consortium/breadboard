(function () {

    if (!sparks.activities.mr) {
        sparks.activities.mr = {};
    }
    var mr = sparks.activities.mr;

    mr.Activity = function () {
        mr.Activity.uber.init.apply(this);
        
        this.root_dir = sparks.config.root_dir + '/activities/measuring-resistance';
        this.sessionTitle = $('#session_title');
        this.endSessionInstruction = $('.instruction_end_session');
        this.questionsElem = $('#questions_area');
        this.reportElem = $('#report_area').hide();
        
        $('body').scrollTop(0); //scroll to top

        var activity = this;
        this.dataService = null;
        this.log = new ActivityLog();
        this.assessment = new Assessment(this);
        this.reporter = new Reporter(this.assessment);

        this.circuit = null;
        this.multimeter = null;
        this.resistor = null;

        this.current_session = 0;
        this.current_question = 0;
        this.allResults = [];

        $('#rated_r_feedback').hide();
        $('#rated_t_feedback').hide();
        $('#measured_r_feedback').hide();
        $('#t_range_feedback').hide();

        if (sparks.config.debug) {
            $('#json_button').click(function() {
                $('#json_current_log').html('<pre>' + sparks.util.prettyPrint(activity.log.sessions, 4) + '</pre>' + JSON.stringify(activity.log));
            });
        }
        else {
            $('#json').hide();
        }
        
        this.buttonize();
    };
    
    sparks.util.extend(mr.Activity, sparks.Activity, {

        setDataService : function(ds) {
            this.dataService = ds;
        },

        // Initial operation on document when it is loaded
        initDocument : function() {
            var self = this;

            // Disable all form elements
            $('input, select').attr("disabled", "true");

            // Hide the next buttons and their listeners
            $('.next_button').hide().click(function(event) {
                self.nextButtonClicked(self, event);
            });

            // Hide the show report buttons
            $('.show_report_button').hide().click(function(event) {
                self.showReportButtonClicked(self, event);
            });

            // Add start and stop times to all forms
            $('form').append(
              "<input name='start_time' type='hidden'></input><input name='stop_time' type='hidden'></input>");

            $('#start_button').click(function(event) {
                self.startButtonClicked(self, event);
            });
            /*
            this.reportElem.dialog({ autoOpen: false, width: 800,
                height : $(window).height() * 0.9 });
            */
        },

        // Initializations that can be done only when the flash movie is loaded
        onFlashDone : function() {
            this.multimeter = new sparks.circuit.Multimeter();
            this.resistor4band = new sparks.circuit.Resistor4band();
            this.resistor5band = new sparks.circuit.Resistor5band();

            //console.log('Nominal Resistance=' + this.resistor.nominalValue);
            //console.log('Tolerance=' + this.resistor.tolerance * 100 + '%');
            //console.log('Real Resistance=' + this.resistor.realValue);

        },

        // Re-initialize the circuit settings for a new set of questions
        resetCircuit: function() {
            debug('ENTER ResistorActivity.resetCircuit');
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
            Flash.sendCommand('set_current_resistor', this.currentResistor.id);
            this.currentResistor.randomize();
            Flash.sendCommand('reset_circuit');
            this.logResistorState();
            debug('currentResistor=' + sparks.activity.currentResistor);
            this.multimeter.update();
        },

        setCurrentResistor: function(resistor) {
          this.currentResistor = resistor;
          Flash.sendCommand('set_current_resistor', resistor.id);
        },

        enableCircuit: function() {
            Flash.sendCommand('enable_circuit');
        },

        disableCircuit: function () {
            Flash.sendCommand('disable_circuit');
        },

        // Completed a session (finished with one resistor)
        completedTry: function () {
            var result = {};

            $("form").each(function (i) {
                var form = jQuery(this);
                result[this.id] = sparks.util.serializeForm(form);
            });

            if (sparks.config.debug) {
                var resultString = jQuery.map(this.allResults, function(el, i) {
                    return jQuery.toJSON(el);
                }).join("<br/>");
                $("#result").html("<pre>"+resultString+"</pre>");
            }

            this.assessment.receiveResultFromHTML(result);
            this.feedback = this.assessment.grade(this.log.currentSession());
            this.assessment.sendResultToHTML(result, this.feedback);

            // Update forms
            for (var item in result) {
                this.updateItem(result, item);
            }

            //$(".show_report_button").show();
            this.questionsElem.hide();
            this.reportElem.show();
            this.reporter.reportOnSession(this.log.currentSession(), this.feedback);
            
            $(".next_button").each(function() {
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

        updateEndInstruction : function() {
            var t = 'Click on Next to try another resistor.';
            this.endSessionInstruction.text(t);
        },

        updateItem : function(result, name) {
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
        startTry : function() {
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

        showRccDebugInfo : function() {
            var resistor = this.currentResistor;
            var model = $("#rcc_model");
            var debug_div = $("#rcc_debug");

            //console.log('debug_div=' + debug_div.length);

            var html =
              'Nominal Value: ' + resistor.nominalValue + '<br/>' +
              'Tolerance: ' + resistor.tolerance * 100.0 + '%<br/>' +
              'Calculated colors: ' + resistor.getColors(resistor.nominalValue, resistor.tolerance) + '<br/>' +
              'Range: [' + resistor.nominalValue * (1 - resistor.tolerance) + ', ' +
              resistor.nominalValue * (1 + resistor.tolerance) + ']<br/>' + 
              'Real Value: ' + resistor.realValue + '<br/>' +
              'Display Value: ' + this.multimeter.makeDisplayText(resistor.realValue) + '<br/>';

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
          form.find("button").click(function(event) {
              self.submitButtonClicked(self, event);
          }); 
          form.find("input, select").removeAttr("disabled");
          form.find("input, select").keypress(function(event) {
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

        logResistorState : function() {
            this.log.setValue('resistor_num_bands', this.currentResistor.numBands);
            this.log.setValue('nominal_resistance', this.currentResistor.nominalValue);
            this.log.setValue('tolerance', this.currentResistor.tolerance);
            this.log.setValue('real_resistance', this.currentResistor.realValue);
            this.log.setValue('displayed_resistance',
                              this.multimeter.makeDisplayText(this.currentResistor.realValue));
        },

        saveStudentData : function() {
            if (this.dataService) {
                var obj = { learner_id: this.learner_id,
                            content: JSON.stringify([this.log.currentSession()]) };
                this.dataService.save(obj);
            }
            else {
                alert('Not saving the data:\neither not logged in and/or no data service defined');
            }
        },

        // Submit button for question
        submitButtonClicked: function(activity, event) {
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

        startButtonClicked: function(activity, event) {
            //console.log('EVENT: ' + (typeof event));
            $('#intro_area').hide();
            activity.startTry();
        },

        nextButtonClicked: function(activity, event) {
            $(".next_button").each(function(i){
              this.disabled = true;
            });
            $('.show_report_button').hide();
            activity.startTry();
        },

        showReportButtonClicked: function(event) {
            var activity = sparks.activity;
            activity.reporter.reportOnSession(activity.log.currentSession(), activity.feedback);
        }
    });
    
})();
