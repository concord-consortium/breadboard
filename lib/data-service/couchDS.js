/*globals console sparks $ jQuery debug */

(function (){
    sparks.CouchDS = function (_post_path, _user, _runnable_id){
        this.docUID = null;
        this.revision = null;
        this.user = _user;
        this.runnableId = _runnable_id;
        this.enableLoadAndSave = true;
        
        // assumes portal will give us a save path of the form 'couch_url:db_name/junk'
        this.postPath = _post_path.split(":")[0];
        this.db = _post_path.split(":")[1].split("/")[0];
        
        $.couch.urlPrefix = this.postPath;
    };

    sparks.CouchDS.prototype =
    {
        // write the data
        save: function (_data) {
          _data.user = this.user;
          _data.runnable_id = this.runnableId;
          _data.save_time = new Date().valueOf();
          
          if (!!this.docUID){
            _data._id = this.docUID;
          }
          if (!! this.revision){
            _data._rev = this.revision;
          }
          
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
})();