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

    sparks.config.debug = jQuery.url.param("debug") !== undefined;
    sparks.config.debug_nbands = jQuery.url.param("n") ? Number(jQuery.url.param("n")) : null;
    sparks.config.debug_rvalue = jQuery.url.param("r") ? Number(jQuery.url.param("r")) : null;
    sparks.config.debug_mvalue = jQuery.url.param("m") ? Number(jQuery.url.param("m")) : null;
    sparks.config.debug_tvalue = jQuery.url.param("t") ? Number(jQuery.url.param("t")) : null;

})();
