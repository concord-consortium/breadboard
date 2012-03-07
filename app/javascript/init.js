//= require "setup-common"
//= require <jquery/jquery-1.4.2.min>
//= require <jquery/jquery-ui-1.8.custom.min>
//= require <jquery/plugins/jquery.url.packed>
//= require <jquery/plugins/jquery.cookie>
//= require <jquery/plugins/jquery.bgiframe.min>
//= require <jquery/plugins/jquery.flash>
//= require <jquery/plugins/jquery.couch>
//= require <jquery/plugins/jquery.easyTooltip>
//= require <jquery/plugins/jquery.tablesorter.min>
//= require <jquery/plugins/jquery.event.drag-2.0.min>
//= require <data-source/couch-ds>
//= require <helpers/util>
//= require <helpers/unit>
//= require <models/activity>
//= require <models/section>
//= require <models/page>
//= require <models/question>
//= require <models/log>
//= require <models/report>
//= require <views/activity-view>
//= require <views/section-view>
//= require <views/page-view>
//= require <views/question-view>
//= require <views/report-view>
//= require <views/oscilloscope-view>
//= require <views/function-generator-view>
//= require <views/class-report-view>
//= require <controllers/question-controller>
//= require <controllers/page-controller>
//= require <controllers/log-controller>
//= require <controllers/section-controller>
//= require <controllers/activity-controller>
//= require <controllers/report-controller>
//= require <controllers/class-report-controller>
//= require <controllers/tutorial-controller>
//= require <activity-constructor>
//= require <helpers/math-parser>
//= require <helpers/string>
//= require <helpers/ui>
//= require <helpers/flash_comm>
//= require <helpers/complex-number>
//= require <circuit/breadboard>
//= require <circuit/multimeter2>
//= require <circuit/oscilloscope>
//= require <circuit/resistor-4band>
//= require <circuit/resistor-5band>
//= require <circuit/circuit-math>
//= require <circuit/inductor>
//= require <circuit/capacitor>
//= require <circuit/battery>
//= require <circuit/function-generator>
//= require <circuit/wire>
//= require <circuit/power-lead>
//= require <apMessageBox>
//= require <helpers/math>
//= require <helpers/ga-helper>

/* FILE init.js */

/*globals console sparks $ document window onDocumentReady unescape prompt apMessageBox*/

(function () {

  sparks.config.flash_id = 'breadboardActivity1';
  sparks.activity_base_url = "http://couchdb.cosmos.concord.org/sparks/_design/app/_show/activity/";
  sparks.activity_images_base_url = "http://couchdb.cosmos.concord.org/sparks/";
  sparks.tutorial_base_url = "tutorials/";

  window._gaq = window._gaq || [];      // in case this script loads before the GA queue is created

  $(document).ready(function () {
      onDocumentReady();
  });

  this.onDocumentReady = function () {
    if (window.location.pathname.indexOf("class-report") > -1){
      this.loadClassReport();
    } else {
      this.loadActivity();
    }
    this.setupQuitButton();
  };

  this.loadActivity = function () {
    var learner_id = sparks.util.readCookie('learner_id');

    if (learner_id) {
       console.log("setting user "+learner_id);
       var user = {"learner_id": learner_id, "name": sparks.util.readCookie('student_name'),
         "student_id": sparks.util.readCookie('student_id'), "class_id": sparks.util.readCookie('class_id')};
       sparks.couchDS.setUser(user);

       // if there's a logged-in user, we want to stop them before they leave
       var askConfirm = function(){
         return "Are you sure you want to leave this page?";
       };
       window.onbeforeunload = askConfirm;
    }

    sparks.GAHelper.setUserLoggedIn(!!learner_id);

    var activityName = window.location.hash;
    activityName = activityName.substring(1,activityName.length);
    if (!activityName){
      activityName = "series-interpretive";
    }

    console.log("loading "+activityName);
    sparks.couchDS.loadActivity(activityName, function(activity) {
      console.log(activity);
      var ac = new sparks.ActivityConstructor(activity);
    });

    // Called by flash model when it is fully loaded
    this.initActivity = function () {
        sparks.flash.init();
        if (!!sparks.activity.view) {
          sparks.activity.view.setFlashLoaded(true);
        }
    };
  };

  this.loadClassReport = function () {
    var classStudents,
        learnerIds = [],
        activity,
        classId;
    if (!!sparks.util.readCookie('class')){
      classId = sparks.util.readCookie('class');
      activity = unescape(sparks.util.readCookie('activity_name')).split('#')[1];
      classStudents = eval(unescape(sparks.util.readCookie('class_students')).replace(/\+/g," "));
      for (var i=0, ii=classStudents.length; i < ii; i++){
        learnerIds.push(classStudents[i].id);
      }
    } else {
      activity = prompt("Enter the activity id", "series-resistances");                       // series-resistances
      classStudents = prompt("Enter a list of learner ids", "212,213,214,215,216,217,218,219,220");        // 212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228
      learnerIds = classStudents.split(',');
    }

    sparks.classReportController.getClassData(
      activity,
      learnerIds,
      classId,
      function(reports) {
        $('#loading').hide();
        var view = new sparks.ClassReportView(),
            $report = view.getClassReportView(reports);
        $('#report').append($report);
        $("#print-link").show();
      });
  };

  this.setupQuitButton = function () {
    $('#return_to_portal').click(function() {
      if (!!sparks.couchDS.user) {
        sparks.reportController.saveData();
        apMessageBox.information({
        	title: "Ready to leave?",
        	message: "All your work up until this page has been saved.",
        	informationImage: "lib/information-32x32.png",
        	width: 400,
        	height: 200,
        	buttons: {
        	  "Go to the portal": function () {
        	    $(this).dialog("close");
        	    window.onbeforeunload = null;
              window.location.href = "http://sparks.portal.concord.org";
        	  },
        	  "Keep working": function() {
        	    $(this).dialog("close");
        	  }
        	}
        });
      } else {
        window.onbeforeunload = null;
        window.location.href = "http://sparks.portal.concord.org";
      }
    });
  };
})();
