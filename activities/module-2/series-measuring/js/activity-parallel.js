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
        this.reporter = new sm.Reporter($('#report_area'));
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
            
            $('button.submit').click(function (e) {
                self.submitButtonClicked();
                e.preventDefault();
            });
        },

        // Initializations that can be done only when the flash movie is loaded
        onFlashReady: function () {
            breadModel('insert', 'wire', 'left_positive_1,a23', 'wire1');
            breadModel('insert', 'wire', 'left_negative_1,c5', 'wire2');
            this.multimeter = new sparks.circuit.Multimeter2();
            
            this.startTry();
        },
        
        submitButtonClicked: function () {
            if (this.currentQuestion == 3) {
                this.completedTry();
            }
            else {
                ++ this.currentQuestion;
                this.disableForm(this.currentQuestion - 1);
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
            
            var resistor1 = breadModel('addRandomResistor', 'resistor1', 'b23,b17');
            flash.sendCommand('insert_component', 'resistor', 'b23,b17','4band',resistor1.colors);
            
            var resistor2 = breadModel('addRandomResistor', 'resistor2', 'c17,c11');
            flash.sendCommand('insert_component', 'resistor', 'c17,c11','4band',resistor2.colors);
            
            var resistor3 = breadModel('addRandomResistor', 'resistor3', 'a17,a11');
            flash.sendCommand('insert_component', 'resistor', 'a17,a11','4band',resistor3.colors);
            
            var resistor4 = breadModel('addRandomResistor', 'resistor4', 'd11,d5');
            flash.sendCommand('insert_component', 'resistor', 'd11,d5','4band',resistor4.colors);
            
            // this.resistor4 = new sparks.circuit.Resistor4band('resistor4');
            //            this.resistor4.randomize(options);
            //            breadModel('insert', 'resistor', 'c11,c5', this.resistor4.getRealValue(), 'resistor3');
            //            flash.sendCommand('insert_component', 'resistor', 'c11,c5','4band',this.resistor4.colors);
            // 
            // $('#dbg_rated_1').text(this.resistor1.getNominalValue());
            // $('#dbg_rated_2').text(this.resistor2.getNominalValue());
            // $('#dbg_rated_3').text(this.resistor3.getNominalValue());
            // $('#dbg_real_1').text(this.resistor1.getRealValue().toFixed(3));
            // $('#dbg_real_2').text(this.resistor2.getRealValue().toFixed(3));
            // $('#dbg_real_3').text(this.resistor3.getRealValue().toFixed(3));
            // $('#dbg_tol_1').text(this.resistor1.getTolerance());
            // $('#dbg_tol_2').text(this.resistor2.getTolerance());
            // $('#dbg_tol_3').text(this.resistor3.getTolerance());
            
            this.currentQuestion = 0;
        
            this.enableForm(0);
            for (var i = 1; i < this.forms.length; ++i) {
                this.disableForm(i);
            }
        },
        
        completedTry: function () {
            this.logResults();
            grader = new sm.Grader(this.log.session, {});
            feedback = grader.grade();
            this.reporter.report(this.log.session, feedback);
            this.questionsArea.hide();
            this.reportArea.show();
            $('.next_button').show();
        },

        resetCircuit: function () {
        },
        
        enableForm: function (k) {
            $(this.forms[k]).find('input, select, button').attr('disabled', false);
        },
        
        disableForm: function (k) {
            $(this.forms[k]).find('input, select, button').attr('disabled', true);
        },
        
        logResults: function () {
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
            } else if (name === 'probe') {
                $('#popup').dialog();
                
                v = breadModel('query', 'voltage', 'a23,a17');
                t += v.toFixed(3);
                v = breadModel('query', 'voltage', 'b17,b11');
                t += ' ' + v.toFixed(3);
                v = breadModel('query', 'voltage', 'c11,c5');
                t += ' ' + v.toFixed(3);
                $('#dbg_voltage').text(t);

                // Disconnect wire1
                breadModel('move', 'wire1', 'left_positive_1,a22');
                
                v = breadModel('query', 'resistance', 'a23,a17');
                t = v.toFixed(3);
                v = breadModel('query', 'resistance', 'b17,b11');
                t += ' ' + v.toFixed(3);
                v = breadModel('query', 'resistance', 'c11,c5');
                t += ' ' + v.toFixed(3);
                
                $('#dbg_resistance').text(t);
                
                v = breadModel('query', 'current', 'a22,a23');
                t = v.toFixed(3);
                
                breadModel('move', 'wire1', 'left_positive_1,a23');
                breadModel('move', 'resistor1', 'a23,a16');
                v = breadModel('query', 'current', 'a16,b17');
                t += ' ' + v.toFixed(3);
                
                breadModel('move', 'resistor1', 'a23,a17');
                breadModel('move', 'resistor2', 'b17,b10');
                v = breadModel('query', 'current', 'b10,c11');
                t += ' ' + v.toFixed(3);
                
                breadModel('move', 'resistor2', 'b17,b11');
                
                $('#dbg_current').text(t);

                $('#popup').dialog('close');
            } else if (name == 'multimeter_dial') {
                console.log('changed multimeter dial'+value);
                this.multimeter.dialPosition = value;
                this.multimeter.update();
                // activity.log.add(name, { value: this.multimeter.dialPosition });
            } else if (name == 'multimeter_power') {
                this.multimeter.powerOn = value == 'true' ? true : false;
                this.multimeter.update();
                // activity.log.add(name, { value: this.multimeter.powerOn });
                //                 if (value === 'true' && this.multimeter.allConnected()) {
                //                     activity.log.add('make_circuit');
                //                 } else if (value == 'false' && wasConnected) {
                //                     activity.log.add('break_circuit');
                //                 }
            }
        }
        
    });
    
})();
