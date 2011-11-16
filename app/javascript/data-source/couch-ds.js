/*globals console sparks $*/

(function (){
    sparks.CouchDS = function (){
        this.saveDocUID = null;
        this.saveDocRevision = null;
        this.user = null;
        
        this.saveDataPath = "/couchdb/learnerdata";
        
        this.activityPath = "/couchdb/activities";
    };

    sparks.CouchDS.prototype =
    {
      
        loadActivity: function(id, callback) {
          $.couch.urlPrefix = this.activityPath;
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
          
          $.couch.urlPrefix = this.saveDataPath;
          
          _data.user = this.user;
          _data.runnable_id = this.runnableId;
          _data.save_time = new Date().valueOf();
          
          if (!!this.saveDocUID){
            console.log("saving with known id "+this.saveDocUID);
            _data._id = this.saveDocUID;
          }
          if (!!this.saveDocRevision){
            _data._rev = this.saveDocRevision;
          }
          
          var self = this;
          $.couch.db('').saveDoc(  
            _data,  
            { success: function(response) { 
              console.log("Saved ok, id = "+response.id);
              self.saveDocUID = response.id;
              self.saveDocRevision = response.rev;
             }}  
          );
          
        },
        
        // saves and does not try to modify _rev or other data
        saveRawData: function(_data) {
          $.couch.urlPrefix = this.saveDataPath;
          $.couch.db(this.db).saveDoc(  
            _data,  
            { success: function(response) { 
              console.log("Saved ok, id = "+response.id);
             }}  
          );
        },
    
        loadStudentData: function (activity, studentName, success, failure) {
          $.couch.urlPrefix = this.saveDataPath;
          if (!studentName){
            studentName = this.user.name;
          }
          var self = this;
          $.couch.db('').view(
            "session_scores/Scores%20per%20activity", 
            {
              key:[studentName, activity],
              success: function(response) { 
                console.log("success loading");
                console.log(response);
                if (response.rows.length > 0){
                  sparks.couchDS.saveDocUID = response.rows[response.rows.length-1].value._id;
                  sparks.couchDS.saveDocRevision = response.rows[response.rows.length-1].value._rev;
                  console.log("setting id to "+sparks.couchDS.saveDocUID);
                  success(response);
                } else {
                  failure();
                }
            }}
          );
        },
        
        loadClassData: function (activity, classId, success, failure) {
          $.couch.urlPrefix = this.saveDataPath;
          $.couch.db('').view(
            "class_scores/Scores%20per%20class", 
            {
              key:[classId, activity],
              success: function(response) { 
                if (response.rows.length > 0){
                  success(response);
                } else {
                  failure();
                }
            }}
          );
        },
        
        loadClassDataWithLearnerIds: function (activity, studentIds, success, failure) {
          var keys = []
          for (var i=0, ii=studentIds.length; i<ii; i++){
            keys.push([studentIds[i], activity]);
          }
          $.couch.urlPrefix = this.saveDataPath;
          $.couch.db('').view(
            "session_scores/Scores%20per%20student_id", 
            {
              keys:keys,
              success: function(response) { 
                if (response.rows.length > 0){
                  success(response);
                } else {
                  failure();
                }
            }}
          );
        }
    };
    
    sparks.couchDS = new sparks.CouchDS();
})();