//= require <activity>
//= require <string>
//= require <ui>
//= require <circuit/breadboard>
//= require "setup-common"
//= require "activity-log"

/* FILE activity.js */

(function () {

    var sm = sparks.activities.sm;
    var flash = sparks.flash;
    var str = sparks.string;
    var util = sparks.util;
    
    sm.Activity = function () {
        sm.Activity.uber.init.apply(this);
        
        this.log = new sm.ActivityLog();
    };
    
    sparks.config.Activity = sparks.activities.sm.Activity;
    
    sparks.extend(sm.Activity, sparks.Activity, {

        // Initial operation on document when it is loaded
        onDocumentReady: function () {
            var self = this;

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
            this.currentQuestion = 0;
        
            this.enableForm(0);
            for (var i = 1; i < this.forms.length; ++i) {
                this.disableForm(i);
            }
        },
        
        completedTry: function () {
            this.logResults();
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
