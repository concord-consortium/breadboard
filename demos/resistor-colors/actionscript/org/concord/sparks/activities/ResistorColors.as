package org.concord.sparks.activities
{
    import flash.events.MouseEvent;
    import flash.external.ExternalInterface;
    import flash.geom.Point;
    
    import org.concord.sparks.Activity;
    import org.concord.sparks.circuit.Multimeter;
    import org.concord.sparks.circuit.MultimeterPort;
    import org.concord.sparks.circuit.Plug;
    import org.concord.sparks.circuit.Probe;
    import org.concord.sparks.circuit.Resistor;
    import org.concord.sparks.circuit.ResistorLead;
    import org.concord.sparks.util.Geom;
    
    public class ResistorColors extends Activity
    {
        public var multimeter:Multimeter;
        public var resistor:Resistor;
        
        var redProbeDefaultPos:Point;
        var blackProbeDefaultPos:Point;
        
        var ports:Array;
        var probes:Array;
        var plugs:Array;
        var leads:Array;
        
        public function ResistorColors(name:String, parent, root):void {
            trace('ENTER ResistorColors');
            super(name, parent, root);
            multimeter = new Multimeter(this, root);
            resistor = new Resistor(root);
            resistor.hide();
            setupEvents();

            //redProbeDefaultPos = multimeter.redProbe.tip_position;
            //blackProbeDefaultPos = multimeter.blackProbe.tip_position;
            redProbeDefaultPos = new Point(536, 153);
            blackProbeDefaultPos = new Point(900, 152);
            
            ports = [multimeter.tenaPort, multimeter.vomaPort, multimeter.commonPort];
            probes = [multimeter.redProbe, multimeter.blackProbe];
            plugs = [multimeter.redPlug, multimeter.blackPlug];
            leads = [resistor.lead1, resistor.lead2];
            
            // initActivity must be called after the ExternalInterface is 
            // ready to communicate with JavaScript.
            ExternalInterface.call('initActivity');
        }
        
        public override function processMessageFromJavaScript(args) {
            trace('processMessageFromJavaScript args=' + args);
            var command:String = args[0];
            switch (command) {
                case 'set_resistor_label':
                    resistor.setLabel(args[1][0], args[1][1], args[1][2],
                        args[1][3], args[1][4]);
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
                         multimeter.redProbe.snapTo(resistor.lead1.position);
                         multimeter.blackProbe.snapTo(resistor.lead2.position);
                         multimeter.redProbe.connect(resistor.lead1);
                         multimeter.blackProbe.connect(resistor.lead2);
                         multimeter.turnOn();
                         javascript.sendEvent("multimeter_power", true);
                    }
                    return 'set_debug_mode';
            }
            return 'UNKNOWN';
        }
        
        private function resetCircuit() {
            multimeter.setDial('acv_750');
            multimeter.turnOff();
            multimeter.redProbe.snapTo(redProbeDefaultPos);
            multimeter.blackProbe.snapTo(blackProbeDefaultPos);
            multimeter.redProbe.disconnect();
            multimeter.blackProbe.disconnect();
            javascript.sendEvent("multimeter_power", false);
        }
        
        private function setupEvents() {
            root.addEventListener(MouseEvent.MOUSE_DOWN, handleMouseDown);
            root.addEventListener(MouseEvent.MOUSE_UP, handleMouseUp);
            root.addEventListener(MouseEvent.CLICK, handleClick);
            root.addEventListener(MouseEvent.MOUSE_MOVE, handleMouseMove);
        }
        
        private function checkProbeResistorConnection(probe:Probe, lead:ResistorLead) {
            //trace('ENTER ResistorColors.checkProbeResistorConnection');
            if (probe.connected_to == null) {
                if (lead.hotspot(probe.tip_position)) {
                    probe.connect(lead);
                    lead.hideRollOver();
                    lead.showEngaged();
                }
            }
        }
        
        private function checkConnectPlug(plug:Plug, port:MultimeterPort) {
            if (multimeter.redPlug.connected_to != port &&
                multimeter.blackPlug.connected_to != port &&
                port.hotspot(plug.tip_position))
            {
                plug.connect(port);
            }
        }
        
        private function checkDisconnectPlug(plug:Plug, port:MultimeterPort) {
            if (plug.drag && port.hotspot(plug.tip_position) &&
                plug.connected_to == port)
            {
                plug.disconnect();
            }
        }
        
        private function probeLeadRollOver(probe:Probe, lead:ResistorLead) {
            //trace('ENTER probeLeadRollOver');
            if (lead.hotspot(probe.tip_position)) {
                lead.showRollOver();
            }
            else {
                lead.hideRollOver();
            }
            if (probe.connected_to == lead) {
                probe.disconnect();
                lead.hideEngaged();
            }
        }
        
        private function handleMouseDown(event:MouseEvent):void {
            //trace('ENTER ResistorColors.handleMouseDown');
            
            // Check for multimeter ports to see if any plug needs to be
            // disconnected.
            for (var i = 0; i < plugs.length; ++i) {
                for (var j = 0; j < ports.length; ++j) {
                    checkDisconnectPlug(plugs[i], ports[j]);
                }
            }
        }
        
        private function handleMouseUp(event:MouseEvent) {
            //trace('ENTER ResistorColors.handleMouseUp');
            var i, j;

            multimeter.dialMouseDown = false;
            multimeter.redProbe.drag = false;
            multimeter.blackProbe.drag = false;
            multimeter.redPlug.drag = false;
            multimeter.blackPlug.drag = false;
            
            // It is very hard to identify the target when it is a part of
            // an IKArmature so checking for connections every time
            for (i = 0; i < probes.length; ++i) {
                for (j = 0; j < leads.length; ++j) {
                    checkProbeResistorConnection(probes[i], leads[j]);
                }
            }
            
            // Check if a plug needs to be snapped into a multimeter port.
            for (i = 0; i < plugs.length; ++i) {
                for (j = 0; j < ports.length; ++j) {
                    checkConnectPlug(plugs[i], ports[j]);
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

        private function handleMouseMove(event:MouseEvent):void {
            for (var i = 0; i < probes.length; ++i) {
                if (probes[i].drag) {
                    for (var j = 0; j < leads.length; ++j) {
                        probeLeadRollOver(probes[i], leads[j]);
                    }
                }
            }
        }
    }
}
