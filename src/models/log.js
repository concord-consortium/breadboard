LogEvent = function(name, value, time){
  this.name = name;
  this.value = value;
  this.time = time;
};

LogEvent.CLICKED_TUTORIAL = "Clicked tutorial";
LogEvent.CHANGED_TUTORIAL = "Changed tutorial";
LogEvent.BLEW_FUSE = "Blew fuse";
LogEvent.DMM_MEASUREMENT = "DMM measurement";
LogEvent.CHANGED_CIRCUIT = "Changed circuit";
LogEvent.ATTACHED_PROBE = "Attached probe";
LogEvent.DETACHED_PROBE = "Detached probe";
LogEvent.DROPPED_PROBE = "Dropped probe";
LogEvent.MOVED_DMM_DIAL = "Moved DMM dial";
LogEvent.OSCOPE_MEASUREMENT = "OScope measurement";
LogEvent.OSCOPE_V1_SCALE_CHANGED = "OScope V1 scale changed";
LogEvent.OSCOPE_V2_SCALE_CHANGED = "OScope V2 scale changed";
LogEvent.OSCOPE_T_SCALE_CHANGED = "OScope T scale changed";

module.exports = LogEvent;
