/*globals console sparks $ breadModel getBreadBoard */

(function() {
  
  /*
   * Sparks Activity Controller can be accessed by the
   * singleton variable sparks.sparksActivityController
   */
  sparks.SparksTutorialController = function(){
  };
  
  sparks.SparksTutorialController.prototype = {
    
    showTutorial: function(filename) {
      var url = this._getURL(filename);
      window.open(url,'','menubar=no,height=600,width=800,resizable=yes,toolbar=no,location=no,status=no');
      sparks.sparksLogController.addEvent(sparks.LogEvent.CLICKED_TUTORIAL, url);
    },
    
    _getURL: function(filename) {
      var url;
      if (filename.indexOf("http:") < 0 && filename.indexOf("/") !== 0){
        return sparks.tutorial_base_url + filename;
      } else {
        return filename;
      }
    }
    
    
  };

  sparks.sparksTutorialController = new sparks.SparksTutorialController();
})();