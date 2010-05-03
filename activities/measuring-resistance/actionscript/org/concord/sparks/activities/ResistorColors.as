package org.concord.sparks.activities {
    
    import flash.events.Event;
    import flash.events.MouseEvent;
    import flash.external.ExternalInterface;
    import flash.geom.Point;
    
    import org.concord.sparks.Activity;
    import org.concord.sparks.circuit.resistor.IResistor;
    import org.concord.sparks.circuit.resistor.ResistorFactory;
    import org.concord.sparks.circuit.resistor.ResistorLead;
    import org.concord.sparks.circuit.multimeter.dmm_centech.DmmCentech;
    import org.concord.sparks.circuit.multimeter.dmm_centech.MultimeterPort;
    import org.concord.sparks.circuit.multimeter.dmm_centech.Plug;
    import org.concord.sparks.circuit.multimeter.dmm_centech.Probe;
    import org.concord.sparks.util.Geom;
    
    public class ResistorColors extends Activity
    {
        public var multimeter:DmmCentech;

        public var resistor4band:IResistor;
        public var resistor5band:IResistor;
        public var currentResistor:IResistor;
        
        var redProbeDefaultPos:Point;
        var blackProbeDefaultPos:Point;
        
        var ports:Array;
        var probes:Array;
        var plugs:Array;
        var leads:Array;
        
        var circuitReady:Boolean = false;
        var powerSwitchDragStartX:Number = 0;
        
        public function ResistorColors(name:String, root, topDir):void {
            trace('ENTER ResistorColors ' + new Date());
            super(name, root, topDir);
            multimeter = new DmmCentech(this, root);
            resistor4band = ResistorFactory.create4bandResistor(this);
            resistor5band = ResistorFactory.create5bandResistor(this);
            //resistor4band.hide();
            //resistor5band.hide();
            setupEvents();

            //redProbeDefaultPos = multimeter.redProbe.tip_position;
            //blackProbeDefaultPos = multimeter.blackProbe.tip_position;
            redProbeDefaultPos = new Point(536, 153);
            blackProbeDefaultPos = new Point(900, 152);
            
            ports = [multimeter.tenaPort, multimeter.vomaPort, multimeter.commonPort];
            probes = [multimeter.redProbe, multimeter.blackProbe];
            plugs = [multimeter.redPlug, multimeter.blackPlug];
            
            // initActivity must be called after the ExternalInterface is 
            // ready to communicate with JavaScript.
            ExternalInterface.call('initActivity');
        }
        
        public override function processMessageFromJavaScript(args) {
            trace('processMessageFromJavaScript args=' + args);
            trace('currentResistor=' + currentResistor);
            var command:String = args[0];
            switch (command) {
                case 'set_resistor_label':
                    currentResistor.setColors(args[1]);
                    return currentResistor.getColors().join('|');
                case 'set_multimeter_display':
                    multimeter.setDisplayText(args[1]);
                    return multimeter.getDisplayText();
                case 'show_resistor':
                    currentResistor.show();
                    return 'show_resistor';
                case 'reset_circuit':
                    resetCircuit();
                    return 'reset_circuit';
                case 'enable_circuit':
                    circuitReady = true;
                    return 'enable_circuit';
                case 'disable_circuit':
                    circuitReady = false;
                    return 'disable_circuit';
                case 'set_current_resistor':
                    if (args[1] == 'resistor_4band') {
                        resistor5band.hide();
                        currentResistor = resistor4band;
                        currentResistor.show();
                    }
                    else {
                        resistor4band.hide();
                        currentResistor = resistor5band;
                        currentResistor.show();
                    }
                    leads = currentResistor.getLeads();
                    return 'set_current_resistor'
            }
            return 'UNKNOWN';
        }
        
        private function resetCircuit() {
            trace('ENTER resetCircuit');
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
            root.addEventListener(MouseEvent.MOUSE_DOWN, handleClickCapture, true, 1000);
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
            
            if (event.target == multimeter.powerSwitch) {
                this.powerSwitchDragStartX = event.stageX;
            }
        }
        
        private function handleMouseUp(event:MouseEvent) {
            //trace('ENTER ResistorColors.handleMouseUp');
            var i, j;
            
            if (event.target == multimeter.powerSwitch) {
                if (event.stageX == powerSwitchDragStartX) {
                    multimeter.togglePower(null);
                    javascript.sendEvent('multimeter_power', multimeter.powerOn);
                }
            }
            this.powerSwitchDragStartX = 0;

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
        
        private function handleClickCapture(event:MouseEvent) {
            if (!circuitReady) {
                event.stopImmediatePropagation();
                javascript.sendEvent('not_ready');
            }
        }
        
        private function handleClick(event:MouseEvent) {
            trace('ENTER ResistorColors.handleClick');
            if (inPowerOnLabelArea(event.stageX, event.stageY) &&
                !multimeter.powerOn)
            {
                multimeter.turnOn();
                javascript.sendEvent('multimeter_power', true);
            }
            else if (inPowerOffLabelArea(event.stageX, event.stageY) &&
                multimeter.powerOn)
            {
                multimeter.turnOff();
                javascript.sendEvent('multimeter_power', false);
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
            
            if (inPowerSwitchArea(event.stageX, event.stageY)) {
                if (this.powerSwitchDragStartX > 0) {
                    if (event.stageX > this.powerSwitchDragStartX &&
                        !multimeter.powerOn)
                    {
                        powerSwitchDragStartX = 0;
                        multimeter.turnOn();
                        javascript.sendEvent('multimeter_power', true);
                    }
                    else if (event.stageX < this.powerSwitchDragStartX &&
                        multimeter.powerOn)
                    {
                        powerSwitchDragStartX = 0;
                        multimeter.turnOff();
                        javascript.sendEvent('multimeter_power', false);
                    }
                }
            }
            else {
                this.powerSwitchDragStartX = 0;
            }
        }
        
        // Area including the power switch and the ON/OFF labels
        private function inPowerSwitchArea(x, y) {
            return x > 123 && x < 219 && y > 390 && y < 413;
        }
        
        private function inPowerOffLabelArea(x, y) {
            return x > 123 && x < 160 && y > 390 && y < 413;
        }

        private function inPowerOnLabelArea(x, y) {
            return x > 188 && x < 219 && y > 390 && y < 413;
        }
    }
}
