/* The following line (global) is for JSLint */
/*global console, document, unescape, jQuery, $, DetectFlashVer, GetSwfVer, RestDS, Util, ResistorActivity */

/*
 * Common initial setup for SPARKS activities
 */

// Create a dummy console.log when not run in Firebug
if (!console) {
    var console = {};
}
if (!console.log) {
    console.log = function() {};
}
var debug = function(x) { console.log(x); };

// Setup a global namespace
jQuery.sparks = {};

// Parse the page params so things can be customized
var value = jQuery.url.param("model_height");
jQuery.sparks.modelHeight = value !== undefined ? value : '635';

jQuery.sparks.debug = jQuery.url.param("debug") !== undefined;
jQuery.sparks.debug_mode = jQuery.url.param("debug_mode");

jQuery.sparks.root_dir = '/sparks-content';

$(document).ready(function() {
    //Util.checkFlashVersion();

    // In some cases (e.g. IE) Flash is loaded before document ready,
    // making initActivity() fail because activity isn't set up.
    // So for now creating activity in initActivity
    
    //jQuery.sparks.activity = new ResistorActivity();
    //jQuery.sparks.activity.initDocument();
});


/* 
 * This function gets called from Flash after Flash has set up the external
 * interface. Therefore all code that sends messages to Flash should be
 * initiated from this function.
 */
function initActivity() {
//function onFlashLoad() {
    //debug('ENTER initActivity');
    
    var activity = new ResistorActivity();
    activity.initDocument();
    activity.onFlashDone();
    
    activity.learner_id = Util.readCookie('learner_id');
    if (activity.learner_id) {
        var put_path = unescape(Util.readCookie('put_path')) || 'undefined_path';
        debug('initActivity: learner_id=' + activity.learner_id + ' put_path=' + put_path);
        activity.setDataService(new RestDS(null, null, put_path));
    }
    jQuery.sparks.activity = activity;
}
