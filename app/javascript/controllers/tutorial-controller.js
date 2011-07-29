/*globals console sparks $ breadModel getBreadBoard */

(function() {
  
  /*
   * Sparks Tutorial Controller can be accessed by the
   * singleton variable sparks.sparksTutorialController
   *
   * Unlike most controllers, SparksTutorialController is not an
   * object controller. It merely contains functions for dealing with
   * showing tutorials, logging, and other such stuff.
   */
  sparks.SparksTutorialController = function(){
  };
  
  sparks.SparksTutorialController.prototype = {
    
    showTutorial: function(filename) {
      var url = this._getURL(filename);
      window.open(url,'','menubar=no,height=600,width=800,resizable=yes,toolbar=no,location=no,status=no');
      sparks.sparksLogController.addEvent(sparks.LogEvent.CLICKED_TUTORIAL, url);
    },
    
    setQuestionCategoryName: function(question) {
      var tutorialFilename = question.top_tutorial;
      if (!!tutorialFilename){
        this.getTutorialTitle(tutorialFilename, function(title){
          question.category = title;
        });
      }
    },
    
    getTutorialTitle: function(filename, callback) {
      $.get(this._getURL(filename), function(data) {
        var title = filename;
        var $title = $(data).find('#tutorial_title');
        if ($title.length > 0){
          title = $title[0].innerHTML
        }
        callback(title);
      });
    },
    
    _getURL: function(filename) {
      var url;
      if (filename.indexOf("http:") < 0 && filename.indexOf("/") !== 0){
        if (filename.indexOf("htm") < 0){
          filename += '.html';
        }
        return sparks.tutorial_base_url + filename;
      } else {
        return filename;
      }
    }
    
    
  };

  sparks.sparksTutorialController = new sparks.SparksTutorialController();
})();