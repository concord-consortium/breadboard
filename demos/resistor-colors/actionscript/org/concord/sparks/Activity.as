package org.concord.sparks
{
    import flash.events.EventDispatcher;
    
    public class Activity extends EventDispatcher
    {
        protected var name:String;
        protected var parent;
        protected var root;
        protected var javascript;
        
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
    }
}
