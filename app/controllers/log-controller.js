
var LogEvent  = require('../models/log'),
    util      = require('../helpers/util');

Log = function(startTime){
  this.events = [];
  this.startTime = startTime;
  this.endTime = -1;
};

LogController = function(){
  this.currentLog = null;
};

LogController.prototype = {

  startNewSession: function() {
    this.currentLog = new Log(new Date().valueOf());
  },

  endSession: function() {
    this.currentLog.endTime = new Date().valueOf();
  },

  addEvent: function (name, value) {
    var evt = new LogEvent(name, value, new Date().valueOf());
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
      if (evt.name == LogEvent.DMM_MEASUREMENT){
        if (evt.value.measurement == type) {
          var position = evt.value.red_probe + "" + evt.value.black_probe;
          if (util.contains(positions, position) === -1) {
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
      if (evt.name == LogEvent.CHANGED_CIRCUIT && evt.value.type == type){
        count ++;
      }
    });
    return count;
  }

};

logController = new LogController();

module.exports = logController;
