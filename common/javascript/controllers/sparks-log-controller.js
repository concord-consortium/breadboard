/*globals console sparks $ breadModel getBreadBoard */

(function() {
  
  /*
   * Sparks Log Controller can be accessed by the
   * singleton variable sparks.sparksLogController
   */
  sparks.SparksLogController = function(){
    this.currentLog = null;
  };
  
  sparks.SparksLogController.prototype = {
    
    startNewSession: function() {
      this.currentLog = new sparks.SparksLog(new Date().valueOf());
    },
    
    addEvent: function (name, value) {
      var evt = new sparks.LogEvent(name, value, new Date().valueOf());
      this.currentLog.events.push(evt);
      console.log(this.currentLog.events[0].name);
    }
    
  };
  
  sparks.sparksLogController = new sparks.SparksLogController();
})();