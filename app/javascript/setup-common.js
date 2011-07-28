//= require <json2>

/* FILE setup-common.js */

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
      Child.parentConstructor = Parent;
      Child.uber = Parent.prototype;
    };
    
})();
