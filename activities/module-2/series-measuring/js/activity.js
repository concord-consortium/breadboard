//= require <activity>
//= require <string>
//= require <ui>
//= require <circuit/breadboard>
//= require "setup-common"

/* FILE activity.js */

// TODO initActivity should be called from flash

$(document).ready(function () {
   sparks.activity = new sparks.config.Activity();
   sparks.activity.onDocumentReady();
   sparks.activity.onFlashDone();
});


(function () {

    var sm = sparks.activities.sm;
    var flash = sparks.flash;
    var str = sparks.string;
    var util = sparks.util;
    
    sm.Activity = function () {
        sm.Activity.uber.init.apply(this);
        
        var activity = this;
        breadModel('insert', 'wire', 'left_positive_1,a23');
        breadModel('insert', 'wire', 'left_negative_1,c5');
    };
    
    sparks.config.Activity = sparks.activities.sm.Activity;
    
    sparks.extend(sm.Activity, sparks.Activity, {

        // Initial operation on document when it is loaded
        onDocumentReady: function () {
            var self = this;

            this.root_dir = sparks.config.root_dir + '/activities/module-2/series-measuring';
            $('body').scrollTop(0); //scroll to top
            
        },

        // Initializations that can be done only when the flash movie is loaded
        onFlashDone: function () {
            this.startTry();
        },
        
        startTry: function () {
            
        },

        resetCircuit: function () {
        }
        
    });
    
})();
