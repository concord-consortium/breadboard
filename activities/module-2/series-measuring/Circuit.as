package {

    import flash.display.MovieClip;
    import flash.geom.Point;
    import flash.media.Sound;
    import flash.media.SoundChannel;
    import flash.media.SoundTransform;
    
    import org.concord.sparks.JavaScript;
    import org.concord.sparks.circuit.multimeter.dmm_centech.DmmCentech2;

    public class Circuit {

        private var activity;
        private var root;

        private var breadboard:MovieClip;
        private var multimeter:DmmCentech2;
        private var redProbe:Probe;
        private var blackProbe:Probe;
        private var resistors:Array = new Array();
        
        private var sndClickIt:clickit3;
        private var sndClickItChannel:SoundChannel;
        private var transform1:SoundTransform=new SoundTransform();

        public function Circuit(activity, root) {
            this.activity = activity;
            this.root = root;

            breadboard = root.outer_breadboard_mc.breadboard_mc;
            multimeter = new DmmCentech2({ activity: activity, root: root });
            redProbe = breadboard.probe_red;
            redProbe.setCircuit(this);
            blackProbe = breadboard.probe_black;
            blackProbe.setCircuit(this);
            resistors.push(breadboard.resistor1);
            resistors.push(breadboard.resistor2);
            resistors.push(breadboard.resistor3);
            
            multimeter.setDisplayText('  9.0 0');
        }

        public function getResistor(id:String) {
            return breadboard[id];
        }
        
        public function getMultimeter():DmmCentech2 {
            return multimeter;
        }

        public function updateProbeConnection(probe:Probe):void {
            trace('ENTER Circuit#updateProbeConnection');
            var oldConnection:Object = probe.getConnection();
            var connection:Object = null;
            var ends;
            
            for (var i = 0; i < resistors.length; ++i) {
                ends = resistors[i].getEnds();
                for (var j = 0; j < 2; ++j) {
                    if (ends[j].isBroken()) {
                        if (ends[j].inBrokenHotSpot(probe)) {
                            connection = ends[j];
                            ends[j].setBrokenEngaged();
                        }
                    }
                    else {
                        if (ends[j].inHotSpot(probe.getTipPos())) {
                            connection = ends[j];
                            ends[j].setEngaged();
                        }
                    }
                }
            }
            
            if (connection !== oldConnection) {
                clickSound();
                probe.setConnection(connection);
                JavaScript.instance().sendEvent('connect', 'probe', probe.getId(), connection.getLocation());
            }
        }
        
        public function updateResistorEndColors(probe:Probe):void {
            //trace('ENTER Circuit#updateResistorEndColor');
            var ends;
            for (var i = 0; i < resistors.length; ++i) {
                ends = resistors[i].getEnds();
                for (var j = 0; j < 2; ++j) {
                    if (ends[j].isBroken()) {
                        if (ends[j].inBrokenHotSpot(probe)) {
                            if (ends[j].getBrokenState() !== ResistorLead.ROLL_OVER) {
                                ends[j].setBrokenRollOver();
                            }
                        }
                        else {
                            if (!probeConnected(ends[j]) && ends[j].getBrokenState() !== ResistorLead.ORIGINAL) {
                                ends[j].setBrokenOriginal();
                            }
                        }
                    }
                    else {
                        if (ends[j].inHotSpot(probe.getTipPos())) {
                            if (ends[j].getState() !== ResistorLead.ROLL_OVER) {
                                ends[j].setRollOver();
                            }
                        }
                        else {
                            if (!probeConnected(ends[j]) && ends[j].getState() !== ResistorLead.ORIGINAL) {
                                ends[j].setOriginal();
                            }
                        }
                    }
                }
            }
        }
        
        private function probeConnected(end:ResistorLead):Boolean {
            return redProbe.getConnection() == end || blackProbe.getConnection() == end;
        }

        private function clickSound():void {
            sndClickIt=new clickit3();
            sndClickItChannel=sndClickIt.play(); 
            transform1.volume=.75;
            sndClickItChannel.soundTransform=transform1;
        }
    }

}
