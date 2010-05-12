(function () {

    /*
     * Common initial setup for SPARKS activities
     */

    // Create a dummy console.log if it's not implemented
    if (typeof console === 'undefined' || !console) {
        this.console = {};
    }
    if (!console.log) {
        console.log = function () {};
    }
    
    if (typeof debug === 'undefined' || !debug) {
        this.debug = function (x) { console.log(x); };
    }
    
    // Setup namespaces
    if (typeof sparks === 'undefined' || !sparks) {
        this.sparks = {};
    }
    
    if (!sparks.config) {
        sparks.config = {};
    }
    
    if (!sparks.circuit) {
        sparks.circuit = {};
    }
    
    if (!sparks.util) {
        sparks.util = {};
    }
    
    if (!sparks.activities) {
        sparks.activities = {};
    }

    sparks.config.root_dir = '../..';

    sparks.config.debug = jQuery.url.param("debug") !== undefined;
    sparks.config.debug_nbands = jQuery.url.param("n") ? Number(jQuery.url.param("n")) : null;
    sparks.config.debug_rvalue = jQuery.url.param("r") ? Number(jQuery.url.param("r")) : null;
    sparks.config.debug_mvalue = jQuery.url.param("m") ? Number(jQuery.url.param("m")) : null;
    sparks.config.debug_tvalue = jQuery.url.param("t") ? Number(jQuery.url.param("t")) : null;

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
    };

})();
