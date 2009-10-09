package org.concord.sparks.activities
{
    import flash.events.MouseEvent;
    import flash.external.ExternalInterface;
    import flash.geom.Point;
    
    import org.concord.sparks.Activity;
    import org.concord.sparks.circuit.Lead;
    import org.concord.sparks.circuit.Multimeter;
    import org.concord.sparks.circuit.Resistor;
    import org.concord.sparks.circuit.ResistorEnd;
    import org.concord.sparks.util.Geom;
    
    public class ResistorColors extends Activity
    {
        public var multimeter:Multimeter;
        public var resistor:Resistor;
        
        var redLeadDefaultPos:Point;
        var blackLeadDefaultPos:Point;
        
        public function ResistorColors(name:String, parent, root):void {
            trace('ENTER ResistorColors');
            super(name, parent, root);
            multimeter = new Multimeter(this, root['dmm_mc'], root);
            resistor = new Resistor(parent, root);
            resistor.hide();
            setupEvents();

            //redLeadDefaultPos = multimeter.redLead.tip_position;
            //blackLeadDefaultPos = multimeter.blackLead.tip_position;
            redLeadDefaultPos = new Point(536, 153);
            blackLeadDefaultPos = new Point(900, 152);
            
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
                case 'reset_circuit':
                    resetCircuit();
                    return 'reset_circuit';
                case 'set_debug_mode':
                    if (args[1] == 'multimeter') {
                         resistor.show();
                         multimeter.redLead.snapTo(resistor.end1.position);
                         multimeter.blackLead.snapTo(resistor.end2.position);
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
        
        private function resetCircuit() {
            multimeter.setDial('acv_750');
            multimeter.turnOff();
            multimeter.redLead.snapTo(redLeadDefaultPos);
            multimeter.blackLead.snapTo(blackLeadDefaultPos);
            multimeter.redLead.connected = false;
            multimeter.blackLead.connected = false;
            javascript.sendEvent("multimeter_power", false);
            javascript.sendEvent('disconnect', 'red_lead');
            javascript.sendEvent('disconnect', 'black_lead');
        }
        
        private function setupEvents() {
            root.addEventListener(MouseEvent.MOUSE_DOWN, handleMouseDown);
            root.addEventListener(MouseEvent.MOUSE_UP, handleMouseUp);
            root.addEventListener(MouseEvent.CLICK, handleClick);
        }
        
        public function handleMouseDown(event:MouseEvent):void {
            trace('ENTER ResistorColors.handleMouseDown');
            
            // Check for multimeter ports to see if any plug needs to be
            // disconnected.
            var ports = [multimeter.tenaPort, multimeter.vomaPort, multimeter.commonPort];
            var plugs = [multimeter.redPlug, multimeter.blackPlug];
            for (var i = 0; i < ports.length; ++i) {
                for (var j = 0; j < plugs.length; ++j) {
                    if (ports[i].hotspot(new Point(event.stageX, event.stageY)) &&
                        ports[i].hotspot(plugs[j].tip_position) &&
                        plugs[j].plugged_port == ports[i]) {
                            plugs[j].unplug();
                        }
                    }
            }
        }
        
        private function handleMouseUp(event:MouseEvent) {
            trace('ENTER ResistorColors.handleMouseUp');
            trace('target=' + event.target + ' ' + event.target.name);
            
            // As strange as it seems, mouse up event doesn't get 
            // caught by Lead if you move the mouse fast enough when
            // releasing the button, thus necessitating setting drag here.
            // Maybe it's an IK thing.
            multimeter.redLead.drag = false;
            multimeter.blackLead.drag = false;
            
            // It is very hard to identify the target when it is a part of
            // an IKArmature so checking for connections every time
            checkLeadResistorConnection(multimeter.redLead, resistor.end1);
            checkLeadResistorConnection(multimeter.redLead, resistor.end2);
            checkLeadResistorConnection(multimeter.blackLead, resistor.end1);
            checkLeadResistorConnection(multimeter.blackLead, resistor.end2);
            //resistor.removeHighlights();
            
            // Check if a plug needs to be snapped into a multimeter port.
            var ports = [multimeter.tenaPort, multimeter.vomaPort, multimeter.commonPort];
            var plugs = [multimeter.redPlug, multimeter.blackPlug];
            for (var i = 0; i < ports.length; ++i) {
                for (var j = 0; j < plugs.length; ++j) {
                    if (ports[i].hotspot(plugs[j].tip_position) &&
                        !plugs[j].isPluggedIn())
                    {
                        plugs[j].plugTo(ports[i]);
                    }
                }
            }
            trace('Mouse up at ' + event.stageX + ',' + event.stageY);
        }
        
        private function handleClick(event:MouseEvent) {
            trace('ENTER ResistorColors.handleClick');
            if (event.target == multimeter.powerSwitch) {
                javascript.sendEvent("multimeter_power", multimeter.powerOn);
            }
        }

        private function checkLeadResistorConnection(lead:Lead, end:ResistorEnd) {
            trace('ENTER ResistorColors.checkLeadResistorConnection');
            if (!lead.connected) {
                //if (Geom.distance(lead.tip_position, end.position) < resistor.snapRadius) {
                if (end.hotspot(lead.tip_position)) {
                //    lead.snapTo(end.position);
                    lead.connected = true;
                    javascript.sendEvent('connect', lead.id, end.id);
                }
            }
        }
    }
}
