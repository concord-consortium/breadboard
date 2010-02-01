package org.concord.sparks
{
    import flash.events.EventDispatcher;
    
    public class Activity extends EventDispatcher
    {
        protected var name:String;
        protected var parent;
        protected var root;
        protected var javascript;
        protected var rootPath = ''; //prepended to path before accessing an external file
        
        public function Activity(name:String, parent, root):void {
            trace("\nActivity: " + name + ' - ' + new Date());
            this.name = name;
            this.parent = parent;
            this.root = root;
            this.javascript = new JavaScript(this);
        }
        
        public function processMessageFromJavaScript(args) {
            trace("Overrided method shouldn't be called");
        }
        
        public function getJavaScript():JavaScript {
            return javascript;
        }
        
        public function getRootPath() {
        	return this.rootPath;
        }
        
        public function setRootPath(path:String) {
        	this.rootPath = path;
        }
    }
}
