//= require "sparks-config-common"
//= require <jquery/jquery-ui-1.8.custom.min>
//= require <jquery/plugins/jquery.bgiframe.min>
//= require <util>
//= require "flash_version_detection"
//= require "flash_comm"

/* FILE sparks-config-client.js */

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
    initActivity = function () {
    //function onFlashLoad() {
        //debug('ENTER initActivity');

        try {
            var activity = new sparks.config.Activity();
            activity.initDocument();
            activity.onFlashDone();

            activity.learner_id = sparks.util.readCookie('learner_id');
            if (activity.learner_id) {
                var put_path = unescape(sparks.util.readCookie('put_path')) || 'undefined_path';
                debug('initActivity: learner_id=' + activity.learner_id + ' put_path=' + put_path);
                activity.setDataService(new RestDS(null, null, put_path));
            }
            sparks.activity = activity;
        }
        catch (e) {
            alert(e);
        }
    };
    
})();
