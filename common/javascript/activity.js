//= require "setup-common"
//= require <jquery/jquery-1.4.2.min>
//= require <jquery/jquery-ui-1.8.custom.min>
//= require <jquery/plugins/jquery.url.packed>
//= require <jquery/plugins/jquery.cookie>
//= require <jquery/plugins/jquery.bgiframe.min>
//= require <data-service/RestDS-jQuery>
//= require <flash_version_detection>
//= require <flash_version_detection>
//= require <flash_comm>
//= require <util>

/* FILE activity.js */

(function () {
    
    sparks.config.root_dir = '../..';

    $(document).ready(function () {
        //sparks.util.checkFlashVersion();

        // In some cases (e.g. IE) Flash is loaded before document ready,
        // making initActivity() fail because activity isn't set up.
        // So for now creating activity in initActivity

        //sparks.activity = new ResistorActivity();
        //sparks.activity.initDocument();
    });


    /* 
     * This function gets called from Flash after Flash has set up the external
     * interface. Therefore all code that sends messages to Flash should be
     * initiated from this function.
     */
    this.initActivity = function () {
    //function onFlashLoad() {
        console.log('ENTER initActivity');
        try {
            var activity = new sparks.config.Activity();
            activity.learner_id = sparks.util.readCookie('learner_id');
            if (activity.learner_id) {
                var put_path = unescape(sparks.util.readCookie('save_path')) || 'undefined_path';
                console.log('initActivity: learner_id=' + activity.learner_id + ' put_path=' + put_path);
                activity.setDataService(new RestDS(null, null, put_path));
            }
            activity.onDocumentReady();
            activity.onFlashReady();
            sparks.activity = activity;
        }
        catch (e) {
            console.log('ERROR: initActivity: ' + e);
        }
    };
    
    sparks.Activity = function () {
        
    };
    
    sparks.Activity.prototype = {
            
        init: function () {
        },
        
        setDataService: function () {
        },
        
        buttonize: function () {
            $('button').button();
        }
    };
    
})();
