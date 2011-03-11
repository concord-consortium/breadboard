//= require <activity>
//= require <models/sparks-activity>
//= require <models/sparks-page>
//= require <models/sparks-question>
//= require <views/sparks-activity-view>
//= require <views/sparks-page-view>
//= require <views/sparks-question-view>
//= require <controllers/sparks-activity-controller>
//= require <controllers/sparks-page-controller>
//= require <controllers/sparks-question-controller>
//= require <activity-constructor>
//= require <math-parser>
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
    
    sparks.activity_base_url = "http://couchdb.cosmos.concord.org/sparks/_design/app/_show/activity/";
    sparks.activity_images_base_url = "http://couchdb.cosmos.concord.org/sparks/";
    
    sparks.config.flash_id = 'breadboardActivity1';
    
    sparks.config.debug = jQuery.url.param("debug") !== undefined;
    
    sm.Activity = function () {
        sm.Activity.uber.init.apply(this);
        
        // this.reporter = new sm.Reporter($('#report_area'));
        sparks.flash.activity = this;
    };
    
    sparks.config.Activity = sparks.activities.sm.Activity;
    
    sparks.extend(sm.Activity, sparks.Activity, {
      
      setDataService: function (ds) {
          this.dataService = ds;
      },
      
        // Initial operation on document when it is loaded
        onDocumentReady: function () {
          console.log("document ready")
            var self = this;
            
            var jsonActivityName = window.location.hash;
            jsonActivityName = jsonActivityName.substring(1,jsonActivityName.length);
            if (!jsonActivityName){
              jsonActivityName = "series-interpretive";
            }
            
            if (sparks.debug && !!sparks.jsonActivity){
              self.activityLoaded();
            } else {
              console.log("loading script for "+jsonActivityName);
              var self = this;
              $.getScript(sparks.activity_base_url+jsonActivityName, function() {
                if (!sparks.jsonActivity){
                  console.log("Activity failed to load from "+sparks.activity_base_url+jsonActivityName);
                  return;
                }
                sparks.jsonActivity.activity_url = sparks.activity_base_url+jsonActivityName
                sparks.jsonActivity.images_url = sparks.activity_images_base_url+jsonActivityName
                self.activityLoaded();
              });
            }
        },
        
        activityLoaded: function() {
          console.log("ENTER: activityLoaded")
          if (!!sparks.jsonActivity.circuit && !sparks.jsonActivity.hide_circuit){
            this.loadFlash();
            // this will then call the other activity.js's initActivity (to be changed)
            // which will call onActivityReady
          } else {
            this.onActivityReady();
          }
        },
        
        loadFlash: function () {
          $('#breadboard').flash({
              src: 'breadboardActivity1.swf',
              id: 'breadboardActivity1',
              name: 'breadboardActivity1',
              width: 900,
              height: 600,
              quality: 'high',
              allowFullScreen: false,
              allowScriptAccess: 'sameDomain'
          });
        },
        
        onActivityReady: function () {
          console.log("activity ready")
          $('#title').text(sparks.jsonActivity.title);
          
          var ac = new sparks.ActivityConstructor(sparks.jsonActivity);
          
          ac.layoutActivity();
          
          if (!!sparks.jsonActivity.circuit && !sparks.jsonActivity.hide_circuit){
            this.multimeter = new sparks.circuit.Multimeter2();
            
            if (sparks.jsonActivity.show_multimeter === "true"){
              sparks.flash.sendCommand('set_multimeter_visibility','true');
              sparks.flash.sendCommand('set_probe_visibility','true');
            
              if(sparks.jsonActivity.disable_multimeter_position){
                this.multimeter.set_disable_multimeter_position(sparks.jsonActivity.disable_multimeter_position);
              }
            }
          }
          
          
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

          this.root_dir = sparks.config.root_dir + '/activities/module-2';
          $('body').scrollTop(0); //scroll to top
          
          this.forms = $('form');
          this.questionsArea = $('#questions_area');
          this.reportArea = $('#report_area').hide();
          
          var self = this;
          // $('button.submit').click(function (event) {
          //     self.submitButtonClicked(self, event);
          //     event.preventDefault();
          // });
          
          
          this.startTry();
        },

        // Initializations that can be done only when the flash movie is loaded
        onFlashReady: function () {
            //this.multimeter = new sparks.circuit.Multimeter2();
        },
        
        // submitButtonClicked: function (activity, event) {
        //     
        //     var form = jQuery(event.target).parents('.question_form');
        //     activity.disableForm(this.currentQuestion);
        //     var nextForm = form.nextAll("form:first");
        //     var $buttons = form.nextAll('.next-questions');
        //     
        //     if (nextForm.size() > 0) {
        //       this.currentQuestion++;
        //       this.enableForm(this.currentQuestion);
        //     } else if ($buttons.length > 0){
        //       $($buttons[0]).removeAttr('disabled');
        //       this.currentQuestion++;
        //       this.enableForm(this.currentQuestion);
        //     } else {
        //       this.completedTry();
        //     }
        // },
        
        startTry: function () {
            $('.next_button').hide();
            
            var options = null;
            
            if (!sparks.jsonActivity.hide_circuit){
              breadModel('updateFlash');
            }
            
            this.currentQuestion = 0;
        
            // this.enableForm(0);
            // for (var i = 1; i < this.forms.length; ++i) {
            //     this.disableForm(i);
            // }
            $('.next-questions').attr('disabled', 'disabled');
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
        
        // enableForm: function (k) {
        //     $(this.forms[k]).find('input, select, button').attr('disabled', false);
        //     
        //     $(this.forms[k]).css("background-color", "rgb(253,255,184)");
        // },
        
        // disableForm: function (k) {
        //     $(this.forms[k]).find('input, select, button').attr('disabled', true);
        //     
        //     $(this.forms[k]).css("background-color", "");
        // },
        
        logResults: function () {
          console.log("generatingReport");
          // sparks.assessment.serializeQuestions($("form"));
          // sparks.assessment.scoreAnswers();
          // var table = sparks.assessment.generateReport();
          var pc = new sparks.SparksPageController();
          var $report = pc.createReportForPage(sparks.sparksActivity.pages[0]);
          this.reportArea.append($report);
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
                if (args[0] === 'component') {
                    // for now, we're just dealing with the situation of replacing one lead that had been lifted
                    if (!!args[2]){
                      breadModel('unmapHole', args[2]);
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
                } else if (args[0] === 'component') {
                  var hole = args[2];
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
                breadModel('move', 'wire1', 'left_positive1,a22');
                
                v = breadModel('query', 'resistance', 'a23,a17');
                t = v.toFixed(3);
                v = breadModel('query', 'resistance', 'b17,b11');
                t += ' ' + v.toFixed(3);
                v = breadModel('query', 'resistance', 'c11,c5');
                t += ' ' + v.toFixed(3);
                
                $('#dbg_resistance').text(t);
                
                v = breadModel('query', 'current', 'a22,a23');
                t = v.toFixed(3);
                
                breadModel('move', 'wire1', 'left_positive1,a23');
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