//= require <http>
//= require <json2>
//= require <jquery/jquery-1.4.2.min>
//= require <jquery/plugins/jquery.cookie>
//= require <jquery/plugins/jquery.url.packed>

/* FILE sparks-config-common.js */

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

    sparks.config.root_dir = '/sparks-content';
    
    sparks.config.debug = jQuery.url.param("debug") !== undefined;
    sparks.config.debug_nbands = jQuery.url.param("n") ? Number(jQuery.url.param("n")) : null;
    sparks.config.debug_rvalue = jQuery.url.param("r") ? Number(jQuery.url.param("r")) : null;
    sparks.config.debug_mvalue = jQuery.url.param("m") ? Number(jQuery.url.param("m")) : null;
    sparks.config.debug_tvalue = jQuery.url.param("t") ? Number(jQuery.url.param("t")) : null;
    
    // YUI-style inheritance
    sparks.extend = function(Child, Parent, properties) {
      var F = function() {};
      F.prototype = Parent.prototype;
      Child.prototype = new F();
      if (properties) {
          for (var k in properties) {
              Child.prototype[k] = properties[k];
          }
      }
      Child.prototype.constructor = Child;
      Child.uber = Parent.prototype;
    };

    
})();
