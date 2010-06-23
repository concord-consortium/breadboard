package org.concord.sparks
{
    import flash.events.EventDispatcher;
    
    public class Activity extends EventDispatcher
    {
        protected var name:String;
        protected var parent;
        protected var root; //the root of the stage. rootPath doesn't have to do anything with it
        protected var javascript;
        protected var rootPath = ''; //prepended to path before accessing an external file
        
        public function Activity(name:String, root, topDir): void {
            trace("\nActivity: " + name + ' - ' + new Date());
            this.name = name;
            this.root = root;
            rootPath = topDir;
            javascript = JavaScript.instance();
            javascript.setActivity(this);
        }
        
        public function processMessageFromJavaScript(args) {
            trace("Overrided method shouldn't be called");
        }
        
        public function getRoot() {
            return root;
        }
        
        public function getJavaScript():JavaScript {
            return javascript;
        }
        
        public function getRootPath() {
        	return rootPath;
        }
        
        public function setRootPath(path:String) {
        	rootPath = path;
        }
    }
}
