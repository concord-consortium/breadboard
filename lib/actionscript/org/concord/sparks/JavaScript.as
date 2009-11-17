package org.concord.sparks
{
    import flash.external.ExternalInterface;
    import org.concord.sparks.Activity;
    
    // Interface with external JavaScript
    public class JavaScript
    {
        var activity:Activity;
        
        public function JavaScript(activity) {
            this.activity = activity;
            this.setupCallbacks();
        }
        
        public function setupCallbacks():void {
            ExternalInterface.addCallback("sendMessageToFlash",
                    getMessageFromJavaScript);
        }
        
        public function sendEvent(name:String, ... values) {
            var time = String(new Date().valueOf());
            ExternalInterface.call('receiveEvent', name, values.join('|'), time);
        }
        
        private function parseParameter(parm) {
            var tokens:Array = parm.split(':');
            switch (tokens[1]) {
                case "int":
                    return parseInt(tokens[0]);
                default: //string
                    return tokens[0];
            }
        }

        private function getMessageFromJavaScript(... Arguments):String {
            return activity.processMessageFromJavaScript(Arguments);
        }
    }
}
