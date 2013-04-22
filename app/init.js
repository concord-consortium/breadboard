//= require setup-common
//= require jquery/jquery-1.8.1.min
//= require jquery/jquery-ui-1.8.24.custom.min
//= require circuitSolver.min
//= require jquery/plugins/jquery.url.packed
//= require jquery/plugins/jquery.cookie
//= require jquery/plugins/jquery.easyTooltip
//= require jquery/plugins/jquery.tablesorter.min
//= require jquery/plugins/jquery.event.drag-2.0.min
//= require jquery/plugins/jquery.flashembed
//= require data-source/couch-ds
//= require helpers/util
//= require helpers/unit
//= require models/activity
//= require models/section
//= require models/page
//= require models/question
//= require models/log
//= require models/report
//= require views/activity-view
//= require views/section-view
//= require views/page-view
//= require views/question-view
//= require views/report-view
//= require views/oscilloscope-view
//= require views/function-generator-view
//= require views/class-report-view
//= require views/breadboard-svg-view
//= require views/add-components-view
//= require views/svg_view_comm
//= require controllers/question-controller
//= require controllers/page-controller
//= require controllers/log-controller
//= require controllers/section-controller
//= require controllers/activity-controller
//= require controllers/report-controller
//= require controllers/class-report-controller
//= require controllers/tutorial-controller
//= require activity-constructor
//= require helpers/math-parser
//= require helpers/string
//= require helpers/ui
//= require helpers/complex-number
//= require circuit/breadboard
//= require circuit/multimeter2
//= require circuit/oscilloscope
//= require circuit/resistor-4band
//= require circuit/resistor-5band
//= require circuit/circuit-math
//= require circuit/inductor
//= require circuit/capacitor
//= require circuit/battery
//= require circuit/function-generator
//= require circuit/wire
//= require circuit/power-lead
//= require apMessageBox
//= require helpers/math
//= require helpers/ga-helper

/* FILE init.js */

/*global Audio console sparks $ document window onDocumentReady unescape prompt apMessageBox*/

(function () {

  sparks.activity_base_url = "/sparks-activities/";
  sparks.activity_images_base_url = "http://couchdb.cosmos.concord.org/sparks/";
  sparks.tutorial_base_url = "tutorials/";
  sparks.soundFiles = {click: "common/sounds/click.ogg"};

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
    this.setupAboutDialog();
  };

  this.loadActivity = function () {
    // We won't be having logged-in users for the foreseeable future. Remove this
    // code for now, commented-out for easy uncommenting some time in the future.
     var learner_id = null;
    // var learner_id = sparks.util.readCookie('learner_id');

    // if (learner_id) {
    //    console.log("setting user "+learner_id);
    //    var user = {"learner_id": learner_id, "name": sparks.util.readCookie('student_name'),
    //      "student_id": sparks.util.readCookie('student_id'), "class_id": sparks.util.readCookie('class_id')};
    //    sparks.couchDS.setUser(user);

    //    // if there's a logged-in user, we want to stop them before they leave
    //    var askConfirm = function(){
    //      return "Are you sure you want to leave this page?";
    //    };
    //    window.onbeforeunload = askConfirm;
    // }

    sparks.GAHelper.setUserLoggedIn(!!learner_id);

    var activityName = window.location.hash;
    activityName = activityName.substring(1,activityName.length);

    if (!activityName){
      activityName = "local/oscilloscope-1";
    }

    this.loadSounds();

    var startActivity = function(activity) {
      new sparks.ActivityConstructor(activity);
    };

    if (activityName.indexOf("local/") === 0) {
      activityName = activityName.replace("local", "activities") + ".json";
    } else {
      activityName = sparks.activity_base_url + activityName + ".json";
    }
    $.get(activityName, startActivity);
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
      activity = prompt("Enter the activity id", "series-parallel-g1");                       // series-resistances
      classStudents = prompt("Enter a list of learner ids", "568,569");        // 212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228
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

  this.setupAboutDialog = function() {
    $("#credits").on("click", function() {
      $("#about").toggle();
    });

    $("#close-about").on("click", function() {
      $("#about").hide();
    });

    // share dialog
    $("#share-prompt").on("click", function() {
      $("#about").hide();
      $("#share-link").text("http://sparks.portal.concord.org/activities.html"+window.location.hash);
      var iframeText = $("#share-iframe-content").html();
      var hash = /html([^"]*)"/.exec(iframeText)[1];
      $("#share-iframe-content").html(iframeText.replace(hash, window.location.hash));
      $("#share-panel").toggle();
    })

    $("#close-share").on("click", function() {
      $("#share-panel").hide();
    });
  }

  this.loadSounds = function () {
    var soundName, audio;

    sparks.sound = {};

    sparks.sound.mute = false;

    sparks.sound.play = function (sound) {
      if (!!window.Audio && !sparks.sound.mute) {
        sound.play();
      }
    }

    for (soundName in sparks.soundFiles) {
      if (!!window.Audio) {
        audio = new Audio();
        audio.src = sparks.soundFiles[soundName];
        sparks.sound[soundName] = audio;
      }
    }
  };
})();
