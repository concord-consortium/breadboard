//= require <activity>
//= require <string>
//= require <ui>
//= require <flash_comm>
//= require <circuit/breadboard>
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
    
    sm.Activity = function () {
        sm.Activity.uber.init.apply(this);
        this.log = new sm.ActivityLog();
        this.reporter = new sm.Reporter($('#report_area'));
    };
    
    sparks.config.Activity = sparks.activities.sm.Activity;
    
    sparks.extend(sm.Activity, sparks.Activity, {

        // Initial operation on document when it is loaded
        onDocumentReady: function () {
            var self = this;
            console.log('this=' + this + ' self=' + self);

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
            breadModel('insert', 'wire', 'left_positive_1,a23');
            breadModel('insert', 'wire', 'left_negative_1,c5');
            
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
            this.resistor1 = new sparks.circuit.Resistor4band('resistor1');
            this.resistor2 = new sparks.circuit.Resistor4band('resistor2');
            this.resistor3 = new sparks.circuit.Resistor4band('resistor3');
            
            this.resistor1.randomize();
            this.resistor2.randomize();
            this.resistor3.randomize();
            
            breadModel('insert', 'resistor', 'a23,a17', this.resistor1.getRealValue(), 'resistor1');
            breadModel('insert', 'resistor', 'b17,b11', this.resistor2.getRealValue(), 'resistor2');
            breadModel('insert', 'resistor', 'c11,c5', this.resistor3.getRealValue(), 'resistor3');
            
            $('#dbg_rated_1').text(this.resistor1.getNominalValue());
            $('#dbg_rated_2').text(this.resistor2.getNominalValue());
            $('#dbg_rated_3').text(this.resistor3.getNominalValue());
            $('#dbg_real_1').text(this.resistor1.getRealValue().toFixed(4));
            $('#dbg_real_2').text(this.resistor2.getRealValue().toFixed(4));
            $('#dbg_real_3').text(this.resistor3.getRealValue().toFixed(4));
            $('#dbg_tol_1').text(this.resistor1.getTolerance());
            $('#dbg_tol_2').text(this.resistor2.getTolerance());
            $('#dbg_tol_3').text(this.resistor3.getTolerance());
            
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
        }
    });
    
})();
