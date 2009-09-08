package org.concord.sparks.activities
{
	import flash.events.MouseEvent;
    import flash.external.ExternalInterface;
    
    import org.concord.sparks.Activity;
    import org.concord.sparks.circuit.Lead;
    import org.concord.sparks.circuit.Multimeter;
    import org.concord.sparks.circuit.Resistor;
    import org.concord.sparks.circuit.ResistorEnd;
    
    public class ResistorColors extends Activity
    {
        public var multimeter;
        public var resistor;
        
        public function ResistorColors(name:String, parent, root):void {
            super(name, parent, root);
            multimeter = new Multimeter(root);
            resistor = new Resistor(parent);
            setupEvents();
            
            // initActivity must be called after the ExternalInterface is 
            // ready to communicate with JavaScript.
            ExternalInterface.call('initActivity');
        }
        
        public override function processMessageFromJavaScript(args) {
            var command:String = args[0];
            switch (command) {
                case "set_resistor_label":
                    resistor.setLabel(args[1][0], args[1][1], args[1][2], args[1][3]);
                    return resistor.getColors().join('|');
            }
            return "UNKNOWN";
        }
        
        private function setupEvents() {
            root.addEventListener(MouseEvent.MOUSE_MOVE, handleMouseMove);
            root.addEventListener(MouseEvent.MOUSE_UP, handleMouseUp);
        }
        
        private function handleMouseMove(event:MouseEvent) {
            //trace('eventPhase=' + event.eventPhase);
            checkLead(multimeter.redLead);
            checkLead(multimeter.blackLead);
            //trace('eventPhase=' + event.eventPhase);
        }
        
        private function handleMouseUp(event:MouseEvent) {
            //trace('eventPhase=' + event.eventPhase);
            checkLeadResistorConnection(multimeter.redLead, resistor.end1);
            checkLeadResistorConnection(multimeter.redLead, resistor.end2);
            checkLeadResistorConnection(multimeter.blackLead, resistor.end1);
            checkLeadResistorConnection(multimeter.blackLead, resistor.end2);
            resistor.removeHighlights();
        }
        
        private function checkLead(lead:Lead) {
            if (lead.mouseDown) {
                resistor.checkHighlight(lead.x, lead.y);
            }
        }
        
        private function checkLeadResistorConnection(lead:Lead, end:ResistorEnd) {
            if (distance(lead.x, lead.y, end.x, end.y) < resistor.snapRadius) {
                lead.snapTo(end.x, end.y);
                javascript.sendEvent('connection', lead.id, end.id)
            }
        }
        
        private function distance(x1:Number, y1:Number, x2:Number, y2:Number) {
            return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        }
    }
}
