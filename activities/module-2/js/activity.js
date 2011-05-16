//= require <activity>
//= require <models/sparks-activity>
//= require <models/sparks-section>
//= require <models/sparks-page>
//= require <models/sparks-question>
//= require <models/sparks-log>
//= require <models/sparks-report>
//= require <views/sparks-activity-view>
//= require <views/sparks-section-view>
//= require <views/sparks-page-view>
//= require <views/sparks-question-view>
//= require <views/sparks-report-view>
//= require <controllers/sparks-question-controller>
//= require <controllers/sparks-page-controller>
//= require <controllers/sparks-log-controller>
//= require <controllers/sparks-section-controller>
//= require <controllers/sparks-activity-controller>
//= require <controllers/sparks-report-controller>
//= require <activity-constructor>
//= require <math-parser>
//= require <string>
//= require <ui>
//= require <flash_comm>
//= require <circuit/breadboard>
//= require <circuit/multimeter2>
//= require <circuit/resistor-4band>
//= require <circuit/resistor-5band>
//= require <circuit/circuit-math>
//= require "setup-common"
//= require "activity-log"
//= require "grader"
//= require "reporter"
//= require <assessment/activity-log>
//= require <assessment/assessment>
//= require <apMessageBox>
//= require <math>

/* FILE activity.js */

(function () {
    
    var sm = sparks.activities.sm;
    var flash = sparks.flash;
    var str = sparks.string;
    var util = sparks.util;
    
    sparks.activity_base_url = "http://couchdb.cosmos.concord.org/sparks/_design/app/_show/activity/";
    sparks.activity_images_base_url = "http://couchdb.cosmos.concord.org/sparks/";
    sparks.tutorial_base_url = "http://sparks.portal.concord.org/sparks-content/tutorials/";
    
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
            
            var jsonSectionName = window.location.hash;
            jsonSectionName = jsonSectionName.substring(1,jsonSectionName.length);
            if (!jsonSectionName){
              jsonSectionName = "series-interpretive";
            }
            if (jsonSectionName.indexOf("report") == 0){
              studentName = jsonSectionName.split("/")[1];
              sparks.sparksReportController.showReport(studentName);
              return;
            }
            if (jsonSectionName.indexOf("local") == 0){
              sparks.activity_base_url = "/activities/module-2/activities/";
              jsonSectionName = jsonSectionName.split("/")[1] + ".js";
            }
            
            if (sparks.debug && !!sparks.jsonSection){
              self.sectionLoaded();
            } else {
              console.log("loading script for "+jsonSectionName);
              var self = this;
              $.getScript(sparks.activity_base_url+jsonSectionName, function() {
                if (!sparks.jsonSection){
                  console.log("Activity failed to load from "+sparks.activity_base_url+jsonSectionName);
                  return;
                }
                sparks.jsonSection.section_url = sparks.activity_base_url+jsonSectionName
                sparks.jsonSection.images_url = sparks.activity_images_base_url+jsonSectionName
                self.sectionLoaded();
              });
            }
        },
        
        sectionLoaded: function() {
          console.log("ENTER: sectionLoaded")
          if (!!sparks.jsonSection.circuit && !sparks.jsonSection.hide_circuit && !sparks.debug){
            this.loadFlash();
            // this will then call the other activity.js's initActivity (to be changed)
            // which will call onActivityReady
          } else {
            this.onActivityReady();
          }
        },
        
        loadFlash: function () {
          $('#breadboard').css("z-index", 0);
          $('#breadboard').flash({
              src: 'breadboardActivity1.swf',
              id: 'breadboardActivity1',
              name: 'breadboardActivity1',
              width: 900,
              height: 600,
              quality: 'high',
              allowFullScreen: false,
              allowScriptAccess: 'sameDomain',
              wmode: 'transparent'
          });
        },
        
        onActivityReady: function () {
          console.log("section ready")
          $('#title').text(sparks.jsonSection.title);
          
          var ac = new sparks.ActivityConstructor(sparks.jsonSection);
          
          ac.layoutActivity();
          
          if (!!sparks.jsonSection.circuit && !sparks.jsonSection.hide_circuit){
            this.multimeter = new sparks.circuit.Multimeter2();
            
            if (sparks.jsonSection.show_multimeter === "true"){
              sparks.flash.sendCommand('set_multimeter_visibility','true');
              sparks.flash.sendCommand('set_probe_visibility','true');
            
              if(sparks.jsonSection.disable_multimeter_position){
                this.multimeter.set_disable_multimeter_position(sparks.jsonSection.disable_multimeter_position);
              }
            }
          }
          
          $('#popup').hide();
          
          this.root_dir = sparks.config.root_dir + '/activities/module-2';
          $('body').scrollTop(0); //scroll to top
          
          this.forms = $('form');
          this.questionsArea = $('#questions_area');
          this.reportArea = $('#report_area').hide();
          
          var self = this;
          
          if (!sparks.jsonSection.hide_circuit){
            breadModel('updateFlash');
          }
        },

        // Initializations that can be done only when the flash movie is loaded
        onFlashReady: function () {
            //this.multimeter = new sparks.circuit.Multimeter2();
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
                    sparks.sparksLogController.addEvent(sparks.LogEvent.CHANGED_CIRCUIT, {
                      "type": "connect lead", 
                      "location": args[2]});
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
                  sparks.sparksLogController.addEvent(sparks.LogEvent.CHANGED_CIRCUIT, {
                    "type": "disconnect lead", 
                    "location": hole});
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