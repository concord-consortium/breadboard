//= require <activity>
//= require <string>
//= require <ui>
//= require <flash_comm>
//= require <circuit/breadboard>
//= require <circuit/multimeter2>
//= require <circuit/resistor-4band>
//= require <circuit/resistor-5band>
//= require "setup-common"
//= require "activity-log"
//= require "grader"
//= require "reporter"
//= require <assessment/activity-log>
//= require <assessment/assessment>

/* FILE activity.js */

(function () {


    var sm = sparks.activities.sm;
    var flash = sparks.flash;
    var str = sparks.string;
    var util = sparks.util;
    
    sparks.config.flash_id = 'breadboardActivity1';
    
    sparks.config.debug = jQuery.url.param("debug") !== undefined;
    
    sm.Activity = function () {
        sm.Activity.uber.init.apply(this);
        this.log = new sm.ActivityLog();
        this.assessment = new sparks.Activity.Assessment();
        // this.reporter = new sm.Reporter($('#report_area'));
        sparks.flash.activity = this;
    };
    
    sparks.config.Activity = sparks.activities.sm.Activity;
    
    sparks.extend(sm.Activity, sparks.Activity, {

        // Initial operation on document when it is loaded
        onDocumentReady: function () {
            var self = this;
            
            if (sparks.config.debug) {
                $('.debug_area').show();
            }
            else {
               $('.debug_area').hide();
            }
            $('#popup').hide();
            $('.next_button').click(function () {
                window.location.reload();
            });

            this.root_dir = sparks.config.root_dir + '/activities/module-2/series-measuring';
            $('body').scrollTop(0); //scroll to top
            
            this.forms = $('form');
            this.questionsArea = $('#questions_area');
            this.reportArea = $('#report_area').hide();
            
            $('button.submit').click(function (event) {
                self.submitButtonClicked(self, event);
                event.preventDefault();
            });
        },

        // Initializations that can be done only when the flash movie is loaded
        onFlashReady: function () {
            this.multimeter = new sparks.circuit.Multimeter2();
            
            this.startTry();
        },
        
        submitButtonClicked: function (activity, event) {
            
            var form = jQuery(event.target).parents('.question_form');
            activity.disableForm(this.currentQuestion);
            var nextForm = form.nextAll("form:first");
            
            if (nextForm.size() === 0) { //all questions answered for current session
                this.completedTry();
            }
            else {
              this.currentQuestion++;
              this.enableForm(this.currentQuestion);
            }
        },
        
        startTry: function () {
            $('.next_button').hide();
            
            var options = null;
            // this.resistor1 = new sparks.circuit.Resistor4band('resistor1');
            //             this.resistor1.randomize(options);
            //             breadModel('insert', 'resistor', 'b23,b17', this.resistor1.getRealValue(), 'resistor1');
            //             flash.sendCommand('insert_component', 'resistor', 'b23,b17','4band',this.resistor1.colors);
            
            var resistor1 = breadModel('addRandomResistor', 'resistor1/R1', 'b23,b17');
            var resistor2 = breadModel('addRandomResistor', 'resistor2/R2', 'c17,c11');
            var resistor3 = breadModel('addRandomResistor', 'resistor3/R3', 'd11,d5');
            
            breadModel('insert', 'wire', 'left_positive20,a23', 'wire1');
            breadModel('insert', 'wire', 'left_negative3,a5', 'wire2');
            
            breadModel('updateFlash');
            
            this.currentQuestion = 0;
        
            this.enableForm(0);
            for (var i = 1; i < this.forms.length; ++i) {
                this.disableForm(i);
            }
            
            var r1 = resistor1.getNominalValue();
            var r2 = resistor2.getNominalValue();
            var r3 = resistor3.getNominalValue();
            var rTot = r1+r2+r3;
            
            this.assessment.addMeasurmentQuestion("Resistance of R1", r1, "&#x2126;", 1);
            this.assessment.addMeasurmentQuestion("Resistance of R2", r2, "&#x2126;", 1);
            this.assessment.addMeasurmentQuestion("Resistance of R3", r3, "&#x2126;", 1);
            
            this.assessment.addMeasurmentQuestion("Total Resistance", rTot, "&#x2126;", 2);
            
            this.assessment.addMeasurmentQuestion("Voltage across R1", 9 * (r1/rTot), "V", 1);
            this.assessment.addMeasurmentQuestion("Voltage across R2", 9 * (r2/rTot), "V", 1);
            
            this.assessment.addMeasurmentQuestion("Current through R1", 9 / rTot, "A", 1);
            this.assessment.addMeasurmentQuestion("Current through R2", 9 / rTot, "A", 1);
        },
        
        completedTry: function () {
            this.logResults();
            // grader = new sm.Grader(this.log.session, {});
            // feedback = grader.grade();
            // this.reporter.report(this.log.session, feedback);
            this.questionsArea.hide();
            this.reportArea.show();
            $('.next_button').show();
        },

        resetCircuit: function () {
        },
        
        enableForm: function (k) {
            $(this.forms[k]).find('input, select, button').attr('disabled', false);
            
            $(this.forms[k]).css("background-color", "rgb(253,255,184)");
        },
        
        disableForm: function (k) {
            $(this.forms[k]).find('input, select, button').attr('disabled', true);
            
            $(this.forms[k]).css("background-color", "");
        },
        
        logResults: function () {
          console.log("generatingReport");
          this.assessment.serializeQuestions($("form"));
          this.assessment.scoreAnswers();
          var table = this.assessment.generateReport();
          this.reportArea.append(table);
        },
        
        receiveEvent: function (name, value, time) {
            console.log('ENTER sm.Activity#receiveEvent');
            console.log('Received: ' + name + ', ' + value + ', ' + new Date(parseInt(time, 10)));
            
            var v;
            var t = '';
            var args = value.split('|');
            
            if (name === 'connect') {
                if (args[0] === 'probe') {
                    if (args[1] === 'probe_red') {
                        this.multimeter.redProbeConnection = args[2];
                    }
                    else if (args[1] === 'probe_black') {
                        this.multimeter.blackProbeConnection = args[2];
                    }
                    else {
                        alert('Activity#receiveEvent: connect: unknonw probe name ' + args[1]);
                    }
                }
                if (args[0] === 'resistor') {
                    // for now, we're just dealing with the situation of replacing one lead that had been lifted
                    if (!!args[3]){
                      breadModel('unmapHole', args[3]);
                    }
                }
                this.multimeter.update();
            } else if (name === 'disconnect') {
                if (args[0] === 'probe') {
                    if (args[1] === 'probe_red') {
                        this.multimeter.redProbeConnection = null;
                    }
                    else if (args[1] === 'probe_black') {
                        this.multimeter.blackProbeConnection = null;
                    }
                    else {
                        alert('Activity#receiveEvent: disconnect: Unknonw probe name ' + args[1]);
                    }
                } else if (args[0] === 'resistor') {
                  var location = args[2].split(",");
                  var hole = args[3];
                  var remainingHole = location[0] === hole ? location[1] : location[0];
                  var newHole = breadModel('getGhostHole', hole+"ghost");
                  
                  breadModel('mapHole', hole, newHole.nodeName());
                }
                this.multimeter.update();
            } else if (name == 'multimeter_dial') {
                console.log('changed multimeter dial'+value);
                this.multimeter.dialPosition = value;
                this.multimeter.update();
                // activity.log.add(name, { value: this.multimeter.dialPosition });
            } else if (name == 'multimeter_power') {
                this.multimeter.powerOn = value == 'true' ? true : false;
                this.multimeter.update();
            }
        }
        
    });
    
})();
