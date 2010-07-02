package {
    
    import flash.display.DisplayObject;
    import flash.geom.Point;
    import flash.geom.Rectangle;
    
    import org.concord.sparks.util.Display;
    
    public class ResistorRightLead extends ResistorLead {

        public function ResistorRightLead(id:String, lead:DisplayObject, 
            rollover:DisplayObject, engaged:DisplayObject, brokenLead:DisplayObject)
        {
            trace('ENTER ResistorLeftLead#ResistorLeftLead');
            super(id, lead, rollover, engaged, brokenLead);
        }
        
        public function inHotSpot(loc:Point):Boolean {
            trace('ENTER ResistorLead#inHotSpot id=' + id);
            
            var stageLoc = Display.localToStage(lead.parent, new Point(lead.x, lead.y));
            var hotspot = new Rectangle(stageLoc.x, stageLoc.y - 35, lead.width, 40);
            
            trace('hotspot=' + hotspot + ' point=' + loc);
            
            return hotspot.containsPoint(loc);
        }
            
    }
}
