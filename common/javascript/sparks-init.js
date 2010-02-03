/* The following line (global) is for JSLint */
/*global console, document, DetectFlashVer, GetSwfVer, ResistorActivity */

/*
 * Common initial setup for SPARKS activities
 */

// Create a dummy console.log when not run in Firebug
if (typeof console == 'undefined') {
    var console = { log: function() {} };
}
var debug = function(x) { console.log(x); };

// Setup a global namespace
jQuery.sparks = {};

// Parse the page params so things can be customized
var value = jQuery.url.param("model_height");
jQuery.sparks.modelHeight = value != undefined ? value : '635';

jQuery.sparks.debug = jQuery.url.param("debug") != undefined;
jQuery.sparks.debug_mode = jQuery.url.param("debug_mode");

jQuery.sparks.root_dir = '/sparks-content';

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
    
    var activity = new ResistorActivity();
    activity.initDocument();
    activity.onFlashDone();

    var put_path = readCookie('put_path') ||  '/sparks_models/';
    var dataService = new RestDS(null, null, put_path);
    activity.setDataService(dataService);
    
    jQuery.sparks.activity = activity;
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
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

