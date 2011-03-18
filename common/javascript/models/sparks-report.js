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
  sparks.SparksReport = function(){
    this.pageReports = {};
    this.view = null;
  };
  
  sparks.SparksPageReport = function(){
    this.sessionReports = [];
  };
  
  sparks.SparksSessionReport = function(){
    this.questions = [];
    this.log = null;
    this.score = -1;
    this.maxScore = -1;
  };
  
  sparks.SparksReport.prototype = {
    
    toJSON: function () {
      var json = {};
      json.pageReports = [];
      $.each(this.pageReports, function(i, pageReport){
        json.pageReports.push(pageReport.toJSON());
      });
      return json;
    }
    
  };
  
  sparks.SparksPageReport.prototype = {
    
    toJSON: function () {
      var json = {};
      json.sessionReports = [];
      $.each(this.sessionReports, function(i, sessionReport){
        json.sessionReports.push(sessionReport);
      });
      return json;
    }
    
  };
  // 
  // sparks.SparksSessionReport.prototype = {
  //   
  //   toJSON: function () {
  //     var json = {};
  //     json.questions = this.questions;
  //     
  //     return json;
  //   }
  //   
  // };
  
})();