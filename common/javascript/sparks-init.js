/*
 * Common initial setup for SPARKS activities
 */

// Create a dummy console.log when not run in Firebug
if (typeof console == 'undefined') {
    var console = { log: function() {} };
    //var console = { log: alert };
}

// Setup a global namespace to store page variables
jQuery.sparks = {};

// Parse the page params so things can be customized
var value = null;

value = jQuery.url.param("model_height");
jQuery.sparks.modelHeight = value != null ? value : '635';

jQuery.sparks.debug = jQuery.url.param("debug") != null;
jQuery.sparks.debug_mode = jQuery.url.param("debug_mode");

$(document).ready(function() {
    //checkFlashVersion();

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
    console.log('ENTER initActivity');
    
    jQuery.sparks.activity = new ResistorActivity();
    jQuery.sparks.activity.initDocument();
    jQuery.sparks.activity.onFlashDone();
}

function checkFlashVersion() {
    var major = 10;
    var minor = 0;
    var revision = 31;
    
    if (!DetectFlashVer(10, 0, 33)) {
        var msg = 'This activity requires Flash version ';
        msg += major + '.' + minor + '.' + revision + '. ';
        
        $('body').html('<p>' + msg + '</p>');
    }
    document.write('<p>Flash version: ' + GetSwfVer() + '</p>');
}

