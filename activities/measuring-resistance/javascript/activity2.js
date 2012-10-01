//= require "setup-common"
//= require <jquery/jquery-1.4.2.min>
//= require <jquery/jquery-ui-1.8.custom.min>
//= require <jquery/plugins/jquery.url.packed>
//= require <jquery/plugins/jquery.cookie>
//= require <jquery/plugins/jquery.flash>
//= require <jquery/plugins/jquery.couch>
//= require <data-source/couch-ds>
//= require <helpers/flash_version_detection>
//= require <helpers/flash_version_detection>
//= require <helpers/flash_comm>
//= require <helpers/util>

/* FILE activity.js */

// Note: This is only used for Module 1, measuring-resistance. This class is not
// used for the breadboard activities

(function () {
    
    sparks.config.root_dir = '../..';

    $(document).ready(function () {
        init();
    });

    this.init = function () {
      console.log('ENTER init');
      try {
          var activity = new sparks.config.Activity();
          this.setSavePath(activity);
          activity.onDocumentReady();
          activity.onFlashReady();
          sparks.activity = activity;
      }
      catch (e) {
          console.log('ERROR: init: ' + e);
      }
    };
    
    this.setSavePath = function (activity) {
      
      activity.learner_id = sparks.util.readCookie('learner_id');
      
      if (activity.learner_id) {
          var put_path = unescape(sparks.util.readCookie('save_path')) || 'undefined_path';
          console.log('initActivity!: learner_id=' + activity.learner_id + ' put_path=' + put_path);
          console.log('woo')
          if (put_path.indexOf("couchdb") > -1){
            var user = {"learner_id": activity.learner_id, "name": sparks.util.readCookie('student_name'),
            "student_id": sparks.util.readCookie('student_id'), "class_id": sparks.util.readCookie('class_id')};
            activity.setDataService(new sparks.CouchDS(put_path, user, sparks.util.readCookie('runnable_id')));
          } else {
            activity.setDataService(new RestDS(null, null, put_path));
          }
          
          function askConfirm(){
            return "Are you sure you want to leave this page?";
          }
          console.log("setting onbeforeunload")
          window.onbeforeunload = askConfirm;
      }
    };

    /* 
     * This function gets called from Flash after Flash has set up the external
     * interface. Therefore all code that sends messages to Flash should be
     * initiated from this function.
     */
    this.initActivity = function () {
        console.log("flash loaded");
        sparks.activity.onActivityReady();
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
