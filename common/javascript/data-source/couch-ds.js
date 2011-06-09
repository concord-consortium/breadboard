/*globals console sparks $*/

(function (){
    sparks.CouchDS = function (){
        this.saveDocUID = null;
        this.saveDocRevision = null;
        this.user = null;
        
        this.saveDataPostPath = "/couchdb/learnerdata";
        
        this.activityLoadPath = "/couchdb/activities";
    };

    sparks.CouchDS.prototype =
    {
      
        loadActivity: function(id, callback) {
          $.couch.urlPrefix = this.activityLoadPath;
          $.couch.db('').openDoc(id, 
            {
              success: function (response) {
                console.log("Loaded "+response._id);
                callback(response);
              }
            }
          );
        },
        
        setUser: function(_user) {
          this.user = _user;
        },
        
        // write the data
        save: function (_data) {
          if (!this.user){
            return;
          }
          
          _data.user = this.user;
          _data.runnable_id = this.runnableId;
          _data.save_time = new Date().valueOf();
          
          if (!!this.saveDocUID){
            _data._id = this.saveDocUID;
          }
          if (!!this.saveDocRevision){
            _data._rev = this.saveDocRevision;
          }
          
          $.couch.urlPrefix = this.saveDataPostPath;
          
          var self = this;
          $.couch.db(this.db).saveDoc(  
            _data,  
            { success: function(response) { 
              console.log("Saved ok, id = "+response.id);
              self.docUID = response.id;
              self.revision = response.rev;
             }}  
          );
          
        },
        
        // saves and does not try to modify _rev or other data
        saveRawData: function(_data) {
          $.couch.db(this.db).saveDoc(  
            _data,  
            { success: function(response) { 
              console.log("Saved ok, id = "+response.id);
             }}  
          );
        },
    
        loadStudentData: function (studentName) {
          var self = this;
          $.couch.db(this.db).view(
            "session_scores/Scores%20per%20session", 
            {
              keys:[studentName],
              success: function(response) { 
                console.log("success");
                console.log(response);
                var id = response.rows[0].id;
                self.handleData(id);             // temporary. Next we should handle entire array
            }}
          );
        },
        
        handleData: function (id) {
          $.couch.db(this.db).openDoc(id,
            { success: function(response) { 
              sparks.sparksReportController.loadReport(response);
             }}
          );
        }
    };
    
    sparks.couchDS = new sparks.CouchDS();
})();