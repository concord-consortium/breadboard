(function (){
    RestDS = function (readKey,writeKey,_post_path){
        this.data = "";
        this.enableLoadAndSave = true;
        this.postPath = _post_path || "/models/";
        this.getPath = this.postPath;
        this.setKeys(readKey,writeKey);
    };

    RestDS.prototype =
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
            this.data = _data;
            //var post_to = this.postPath + this.writeKey;
            var post_to = this.postPath;
            debug('post_to=' + post_to);
            /*
            var xmlhttp = HTTP.newRequest();
            xmlhttp.open('PUT', post_to, false);
            xmlhttp.send(this.data);
            */
            jQuery.post(post_to, this.data);
            this.readKey = this.writeKey;
            $('#readKey').text("Your Key:" + this.readKey);
            debug("readKey written: " + this.readKey);
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