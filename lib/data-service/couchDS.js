(function (){
    sparks.CouchDS = function (readKey,writeKey,_post_path){
        this.data = "";
        this.enableLoadAndSave = true;
        
        // assumes portal will give us a save path of the form 'couch_url:db_name/junk'
        this.postPath = _post_path.split(":")[0];
        this.db = _post_path.split(":")[1].split("/")[0];
        
        $.couch.urlPrefix = this.postPath;
        
        this.getPath = this.postPath;
        this.setKeys(readKey,writeKey);
    };

    sparks.CouchDS.prototype =
    {
        setKeys: function (read,write) {
            if (read) {
                this.load(this,function (){});// just load data
                this.readKey = read;
            }
            if (write) {
                this.writeKey = write;
            }
            else {
                this.writeKey= this.randomString();
            }
        },
        
        randomString: function () {
            var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
            var string_length = 8;
            var randomstring = '';
            for (var i=0; i<string_length; i++) {
                var rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum,rnum+1);
            }
            return randomstring;
        },
        
        // write the data
        save: function (_data) {
          $.couch.db(this.db).saveDoc(  
            _data,  
            {success: function() { console.log("Saved ok") }}  
          );
        },
    
        load: function (context,callback) {
            if (this.readKey) {
                //var key = prompt("Please enter the model to load: ", this.readKey);
            	var key = this.readKey;
                this.writeKey = key;
                this.readKey = key;
            }
            else {
                if (this.writeKey) {
                    this.readKey = this.writeKey;
                }
                else {
                    this.readKey = this.writeKey = this.randomString();
                }
            }
            //var get_from = this.getPath  + this.readKey;
            var get_from = this.getPath;
            var self = this;
            debug("just about to load with " + this.readKey);
            if (this.readKey) {
                self = this;
                /*
                new Ajax.Request(get_from, {
                    asynchronous: true,
                    method: 'GET',
                    onSuccess: function (rsp) {
                        var text = rsp.responseText;
                        var _data = eval(text);
                        self.data = _data;
                        callback(_data,context,callback);
                        debug("returned from load");
                    },
                    onFailure: function (req,err) {
                        debug("failed!");
                    }
                });
                */
                jQuery.get(get_from, function (rsp, textStatus) {
                    console.log('rsp=' + rsp);
                    //var text = rsp.responseText;
                    var _data = eval(rsp);
                    self.data = _data;
                    callback(_data,context,callback);
                    debug("returned from load");
                });
            }
            else {
                debug("load caleld, but no read key specified...");
            }
        },

        toString: function () {
            return "Data Service (" + this.postPath + "" + this.writeKey + ")";
        }
    };
})();