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
            trace('ENTER ResistorColors');
            super(name, parent, root);
            multimeter = new Multimeter(root);
            resistor = new Resistor(parent, root);
            resistor.hide();
            setupEvents();
            
            // initActivity must be called after the ExternalInterface is 
            // ready to communicate with JavaScript.
            ExternalInterface.call('initActivity');
        }
        
        public override function processMessageFromJavaScript(args) {
            trace('processMessageFromJavaScript args=' + args);
            var command:String = args[0];
            switch (command) {
                case 'set_resistor_label':
                    resistor.setLabel(args[1][0], args[1][1], args[1][2], args[1][3]);
                    return resistor.getColors().join('|');
                case 'set_multimeter_display':
                    multimeter.setDisplayText(args[1]);
                    return multimeter.getDisplayText();
                case 'show_resistor':
                    resistor.show();
                    return 'show_resistor';
                case 'set_debug_mode':
                    if (args[1] == 'multimeter') {
                         resistor.show();
                         multimeter.redLead.snapTo(resistor.end1.x, resistor.end1.y);
                         multimeter.blackLead.snapTo(resistor.end2.x, resistor.end2.y);
                         multimeter.redLead.connected = true;
                         multimeter.blackLead.connected = true;
                         multimeter.turnOn();
                         javascript.sendEvent("multimeter_power", true);
                         javascript.sendEvent('connect', 'red_lead', 'resistor_end1');
                         javascript.sendEvent('connect', 'black_lead', 'resistor_end2');
                    }
                    return 'set_debug_mode';
            }
            return 'UNKNOWN';
        }
        
        private function setupEvents() {
            root.addEventListener(MouseEvent.MOUSE_MOVE, handleMouseMove);
            root.addEventListener(MouseEvent.MOUSE_UP, handleMouseUp);
            root.addEventListener(MouseEvent.CLICK, handleClick);
        }
        
        private function handleMouseMove(event:MouseEvent) {
            //trace('eventPhase=' + event.eventPhase);
            checkLead(multimeter.redLead);
            checkLead(multimeter.blackLead);
        }
        
        private function handleMouseUp(event:MouseEvent) {
            if (event.target == multimeter.redLead.displayObject) {
                checkLeadResistorConnection(multimeter.redLead, resistor.end1);
                checkLeadResistorConnection(multimeter.redLead, resistor.end2);
                resistor.removeHighlights();
            }
            else if (event.target == multimeter.blackLead.displayObject) {
                checkLeadResistorConnection(multimeter.blackLead, resistor.end1);
                checkLeadResistorConnection(multimeter.blackLead, resistor.end2);
                resistor.removeHighlights();
            }
        }
        
        private function handleClick(event:MouseEvent) {
            if (event.target == multimeter.dial) {
                javascript.sendEvent("multimeter_dial", multimeter.dialSetting);
            }
            else if (event.target == multimeter.powerSwitch) {
                javascript.sendEvent("multimeter_power", multimeter.powerOn);
            }
        }

        private function checkLead(lead:Lead) {
            if (lead.drag) {
                resistor.checkHighlight(lead.x, lead.y);
                if (lead.connected) {
                    lead.connected = false;
                    javascript.sendEvent('disconnect', lead.id);
                }
            }
        }
        
        private function checkLeadResistorConnection(lead:Lead, end:ResistorEnd) {
            if (!lead.connected && distance(lead.x, lead.y, end.x, end.y) < resistor.snapRadius) {
                lead.snapTo(end.x, end.y);
                lead.connected = true;
                javascript.sendEvent('connect', lead.id, end.id);
            }
        }
        
        private function distance(x1:Number, y1:Number, x2:Number, y2:Number) {
            return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        }
    }
}
