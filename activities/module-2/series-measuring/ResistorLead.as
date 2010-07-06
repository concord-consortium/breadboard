package {
    
    import flash.display.DisplayObject;
    import flash.geom.Point;
    import flash.geom.Rectangle;
    
    import org.concord.sparks.util.Display;
    
    /* 
     * Represents a lead of the resistor.
     * A resistor has two leads: left and right.
     */
    public class ResistorLead {
        
        protected var id:String;
        protected var lead:DisplayObject;
        private var rollover:DisplayObject; //highlighted are to be shown when mouse is over the lead
        private var engaged:DisplayObject; //to be shown when the lead is connected to another component
        private var brokenLead:DisplayObject;
    
        private var location:String; //coordinate on breadboard, e.g. c21
    
        public function ResistorLead(id:String, lead:DisplayObject,
            rollover:DisplayObject, engaged:DisplayObject, brokenLead:DisplayObject)
        {
            trace('ENTER ResistorLead#ResistorLead');
            this.id = id;
            this.lead = lead;
            this.rollover = rollover;
            this.engaged = engaged;
            this.brokenLead = brokenLead;
            
            trace('lead.x=' + lead.x + ' lead.y=' + lead.y);
            
            rollover.alpha = 0;
            engaged.alpha = 0;
            brokenLead.alpha = 0;
        }
        
        public function getId():String {
            return id;
        }
        
        public function getLocation():String {
            return location;
        }
        
        public function setLocation(loc:String):void {
            location = loc;
        }
        
        public function showRollOver():void {
            rollover.alpha = 1;
        }

        public function hideRollOver():void {
            rollover.alpha = 0;
        }
        
        public function showEngaged():void {
            engaged.alpha = 0.55;
        }

        public function hideEngaged():void {
            trace('ENTER ResistorLead.hideEngaged');
            trace('HIDE ' + engaged.name); 
            engaged.alpha = 0;
        }
    }
}
