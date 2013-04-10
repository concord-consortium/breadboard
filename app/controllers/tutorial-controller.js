/*global sparks window setTimeout $ */

(function() {

  /*
   * Sparks Tutorial Controller can be accessed by the
   * singleton variable sparks.tutorialController
   *
   * Unlike most controllers, SparksTutorialController is not an
   * object controller. It merely contains functions for dealing with
   * showing tutorials, logging, and other such stuff.
   */
  sparks.TutorialController = function(){
  };

  sparks.TutorialController.prototype = {

    showTutorial: function(filename) {
      var url = this._getURL(filename);
      this.tutorialWindow = window.open(url,'','menubar=no,height=600,width=800,resizable=yes,toolbar=no,location=no,status=no,scrollbars=yes');
      if (this.tutorialWindow) {
        this.tutorialWindow.moveActionCallback = this.tutorialMoveActionCallback;
      }
      sparks.logController.addEvent(sparks.LogEvent.CLICKED_TUTORIAL, url);
      sparks.GAHelper.userVisitedTutorial(filename);
    },

    tutorialWindow: null,

    setQuestionCategory: function(question) {
      var tutorialFilename = question.top_tutorial;
      if (!!tutorialFilename){
        this.getTutorialTitle(tutorialFilename, function(title){
          question.category = {categoryTitle: title, tutorial: tutorialFilename};
        });
      }
    },

    getTutorialTitle: function(filename, callback) {
      $.get(this._getURL(filename), function(data) {
        var title = filename,
            $title = $(data).find('#tutorial_title');

        if ($title.length > 0){
          title = $title[0].innerHTML;
        } else {
          $title = $(data).find('h3');
          if ($title.length > 0){
            title = $title[0].innerHTML;
          }
        }
        callback(title);
      });
    },

    _getURL: function(filename) {
      if (filename.indexOf("http:") < 0 && filename.indexOf("/") !== 0){
        if (filename.indexOf("htm") < 0){
          filename += '.html';
        }
        return sparks.tutorial_base_url + filename;
      } else {
        return filename;
      }
    },

    tutorialMoveActionCallback: function() {
      setTimeout(function() {
        var win = sparks.tutorialController.tutorialWindow,
            tutorialName;

        if (win && win.location) {
          tutorialName = win.location.pathname.replace("/","");
          sparks.logController.addEvent(sparks.LogEvent.CHANGED_TUTORIAL, tutorialName);
          win.moveActionCallback = sparks.tutorialController.tutorialMoveActionCallback;
          sparks.GAHelper.userVisitedTutorial(tutorialName);
        }
      }, 1000);
    }


  };

  sparks.tutorialController = new sparks.TutorialController();
})();