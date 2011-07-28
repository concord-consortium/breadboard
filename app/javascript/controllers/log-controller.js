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
    
    endSession: function() {
      this.currentLog.endTime = new Date().valueOf();
    },
    
    addEvent: function (name, value) {
      var evt = new sparks.LogEvent(name, value, new Date().valueOf());
      this.currentLog.events.push(evt);
    },
    
    numEvents: function(log, name) {
      var count = 0;
      $.each(log.events, function(i, evt){
        if (evt.name == name){
          count ++;
        }
      });
      return count;
    },
    
    numUniqueMeasurements: function(log, type) {
      var count = 0;
      var positions = [];
      $.each(log.events, function(i, evt){
        if (evt.name == sparks.LogEvent.DMM_MEASUREMENT){
          if (evt.value.measurement == type) {
            var position = evt.value.red_probe + "" + evt.value.black_probe;
            if (!sparks.util.contains(positions, position)) {
              count++;
              positions.push(position);
            }
          }
        }
      });
      return count;
    },
    
    numConnectionChanges: function(log, type) {
      var count = 0;
      $.each(log.events, function(i, evt){
        if (evt.name == sparks.LogEvent.CHANGED_CIRCUIT && evt.value.type == type){
          count ++;
        }
      });
      return count;
    }
    
  };
  
  sparks.sparksLogController = new sparks.SparksLogController();
})();