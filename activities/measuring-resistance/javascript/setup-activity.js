//= require "setup-common"

/* FILE setup-activity.js */

(function () {

    sparks.config.debug = jQuery.url.param("debug") !== undefined;
    sparks.config.debug_nbands = jQuery.url.param("n") ? Number(jQuery.url.param("n")) : null;
    sparks.config.debug_rvalue = jQuery.url.param("r") ? Number(jQuery.url.param("r")) : null;
    sparks.config.debug_mvalue = jQuery.url.param("m") ? Number(jQuery.url.param("m")) : null;
    sparks.config.debug_tvalue = jQuery.url.param("t") ? Number(jQuery.url.param("t")) : null;
    
})();
