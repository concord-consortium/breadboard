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

        public function updateProbeConnection(probe:Probe) {
            trace('ENTER Circuit#updateProbeConnection');
            var oldConnection:Object = probe.getConnection();
            var connection:Object = null;
            
            for (var i = 0; i < resistors.length; ++i) {
                if (resistors[i].getLeftEnd().inHotSpot(probe.getTipPos())) {
                    trace('Probe ' + probe.getId() + 'on left of resistor ' + i);
                    connection = resistors[i].getLeftEnd();
                }
                else if (resistors[i].getRightEnd().inHotSpot(probe.getTipPos())) {
                    trace('Probe ' + probe.getId() + 'on right of resistor ' + i);
                    connection = resistors[i].getRightEnd();
                }
            }
            
            if (connection !== oldConnection) {
                clickSound();
                probe.setConnection(connection);
                JavaScript.instance().sendEvent('connect', 'probe', probe.getId(), connection.getId());
            }
        }
        
        private function clickSound() {
            sndClickIt=new clickit3();
            sndClickItChannel=sndClickIt.play(); 
            transform1.volume=.75;
            sndClickItChannel.soundTransform=transform1;
        }

    }

}
