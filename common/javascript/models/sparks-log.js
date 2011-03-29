/*globals console sparks $ breadModel getBreadBoard */

/**
 * report:
 * {
 *   pageReports: {
 *         pageX:
 *           {
 *             sessionReports: [
 *                       {
 *                         questions: [],
 *                         log: {},
 *                         score: x,
 *                         maxScore: y
 *                       },
 *              highestScore: x,  ?
 *              maxScore: y       ?
 */
(function() {
  sparks.SparksLog = function(startTime){
    this.events = [];
    this.startTime = startTime;
    this.endTime = -1;
  };
  
  sparks.LogEvent = function(name, value, time){
    this.name = name;
    this.value = value;
    this.time = time;
  };
  
  sparks.LogEvent.CLICKED_TUTORIAL = "Clicked tutorial";
  sparks.LogEvent.BLEW_FUSE = "Blew fuse";
  sparks.LogEvent.DMM_MEASUREMENT = "DMM measurement";
  
})();