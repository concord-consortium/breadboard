package org.concord.sparks.circuit {

    import fl.ik.IKArmature;
    import fl.ik.IKBone;
    import fl.ik.IKJoint;
    import fl.ik.IKManager;

    import flash.display.Loader;
    import flash.display.MovieClip;
    import flash.display.Sprite;
    import flash.events.MouseEvent;
    import flash.events.IOErrorEvent;
    import flash.geom.Point;
    import flash.net.URLRequest;
    
    import org.concord.sparks.Activity;
    import org.concord.sparks.util.Geom;
    
    public class Multimeter
    {
        public var redLead:Lead;
        public var blackLead:Lead;
        
        public var redPlug:Plug;
        public var blackPlug:Plug;
        
        public var tenaPort:MultimeterPort; // 10A jack
        public var vomaPort:MultimeterPort; // V, Ohm, mA jack
        public var commonPort:MultimeterPort; // Common jack
        
        public var portSnapRadius = 22;
        
        public var dial:MovieClip;
        public var dialSetting:String = ''; //label representing position of dial
        
        public var powerSwitch:MovieClip;
        public var powerOn:Boolean = false; //true if multimeter is turned on
        
        private var rotationMap = {
            acv_750:     0, acv_200:  18, p_9v:      36, dca_200mc: 54,
            dca_2000mc: 72, dca_20m:  90, dca_200m: 108, c_10a:    126,
            hfe:       144, diode:   162, r_200:    180, r_2000:  -162,
            r_20k:    -144, r_200k: -126, r_2000k: -108, dcv_200m: -90,
            dcv_2000m: -72, dcv_20:  -54, dcv_200:  -36, dcv_1000: -18
        };
        
        private var container:MovieClip;
        private var activity:Activity;
        private var root;
        private var display; //display for dmm

        private var minus_hv_loader:Loader = new Loader();
        private var digit1_loader:Loader = new Loader();
        private var digit2_loader:Loader = new Loader();
        private var dot1_loader:Loader = new Loader();
        private var digit3_loader:Loader = new Loader();
        private var dot2_loader:Loader = new Loader();
        private var digit4_loader:Loader = new Loader();
        
        private var dialMouseDown:Boolean = false;
        
        public function Multimeter(activity:Activity, container:MovieClip, root) {
            trace('ENTER Multimeter');

            this.activity = activity;
            this.container = container;
            this.root = root;
            
            dial = root['dial'];
            dial.addEventListener(MouseEvent.MOUSE_DOWN, handleDialMouseDown);
            dial.addEventListener(MouseEvent.MOUSE_UP, handleDialMouseUp);
            dial.addEventListener(MouseEvent.MOUSE_MOVE, handleDialMouseMove);
            
            setDial('acv_750', false);

            powerSwitch = root['dmm_switch'];
            powerSwitch.addEventListener(MouseEvent.CLICK, togglePower);
            
            display = root['dmm_display'];
            display.text = '';
            
            redLead = new Lead('red_lead', activity, root['probe_red'], 'Armature_62');
            blackLead = new Lead('black_lead', activity, root['probe_black'], 'Armature_64');
            
            redPlug = new Plug('red_plug', root['plug_red'], 'Armature_81',
                [root['plug_red_IN1'], root['plug_red_IN2'], root['plug_red_IN3']]);
            blackPlug = new Plug('black_plug', root['plug_black'], 'Armature_58',
                [root['plug_black_IN1'], root['plug_black_IN2'], root['plug_black_IN3']]);
            
            tenaPort = new MultimeterPort('tena_port', new Point(270, 391));
            vomaPort = new MultimeterPort('voma_port', new Point(270, 436));
            commonPort = new MultimeterPort('common_port', new Point(264, 480));
            
            display.minus_hv.addChild(minus_hv_loader);
            display.thousand.addChild(digit1_loader);
            display.hundred.addChild(digit2_loader);
            display.decimalPoint_one.addChild(dot1_loader);
            display.ten.addChild(digit3_loader);
            display.decimalPoint_two.addChild(dot2_loader);
            display.one.addChild(digit4_loader);
        }
        
        public function setDisplayText(s:String) {
            var origLen = s.length;
            for (var i = 0; i < 7 - origLen; ++i) {
                s = ' ' + s;
            }
            var symbols = s.split('');
            trace('symbols=' + symbols);
            
            loadDisplayImage(minus_hv_loader, symbols[0]);
            loadDisplayImage(digit1_loader, symbols[1]);
            loadDisplayImage(digit2_loader, symbols[2]);
            loadDisplayImage(dot1_loader, symbols[3]);
            loadDisplayImage(digit3_loader, symbols[4]);
            loadDisplayImage(dot2_loader, symbols[5]);
            loadDisplayImage(digit4_loader, symbols[6]);
        }
        
        public function getDisplayText():String {
        	return display.text;
        }

        public function turnOn():void {
            if (!powerOn) {
                powerSwitch.rotation += 180;
                powerOn = true;
            }
        }
        
        public function turnOff():void {
            if (powerOn) {
                powerSwitch.rotation += 180;
                powerOn = false;
            }
        }
        
        private function togglePower(event:MouseEvent):void {
            if (powerOn) {
                turnOff();
            }
            else {
                turnOn();
            }
            trace('powerOn=' + powerOn);
        }
        
        public function setDial(label:String, sendEvent:Boolean = true) {
            if (dialSetting != label) {
                dialSetting = label;
                dial.rotation = rotationMap[label];
                if (sendEvent) {
                    activity.getJavaScript().sendEvent("multimeter_dial", dialSetting);
                }
            }
        }
        
        private function loadDisplayImage(loader:Loader, char:String):void {
            var fname;
            //trace('char=' + char);
            switch (char) {
            case ' ':
                fname = 'blank.png';
                break;
            case 'h':
                fname = 'hv.png';
                break;
            case '-':
                fname = 'minus.png';
                break;
            case '.':
                fname = 'point.png';
                break;
            default:
                fname = char + '.png';
            }
            var path = 'images/multimeter/' + fname;
            //trace('path=' + path);
            try {
                var req:URLRequest = new URLRequest(path);
                loader.load(req);
                //trace('Loaded ' + path);
            }
            catch (e:IOErrorEvent) {
                trace("Failed to load " + path);
            }
        }
        
        private function getDialPositionFromAngle(deg) {
            if (deg > 171 || deg <= -171) { 
                return 'dcv_200m';
            }
            else if (deg > 153) {
                return 'dcv_2000m';
            }
            else if (deg > 135) {
                return 'dcv_20';
            }
            else if (deg > 117) {
                return 'dcv_200';
            }
            else if (deg > 99) {
                return 'dcv_1000';
            }
            else if (deg > 81) {
                return 'acv_750';
            }
            else if (deg > 63) {
                return 'acv_200';
            }
            else if (deg > 45) {
                return 'p_9v';
            }
            else if (deg > 27) {
                return 'dca_200mc';
            }
            else if (deg > 9) {
                return 'dca_2000mc';
            }
            else if (deg > -9) {
                return 'dca_20m';
            }
            else if (deg > -27) {
                return 'dca_200m';
            }
            else if (deg > -45) {
                return 'c_10a';
            }
            else if (deg > -63) {
                return 'hfe';
            }
            else if (deg > -81) {
                return 'diode';
            }
            else if (deg > -99) {
                return 'r_200';
            }
            else if (deg > -117) {
                return 'r_2000';
            }
            else if (deg > -135) {
                return 'r_20k';
            }
            else if (deg > -153) {
                return 'r_200k';
            }
            else if (deg > -171) {
                return 'r_2000k';
            }
        }

        /*
         * Return angular position (in degrees) of a point with respect to
         * the origin (0, 0) which is the center of the dial.
         *
         * x, y: global (stage) coordinates of a point
         * The angle is 0 degrees when the point is at 3 o'clock w.r.t. origin,
         * and increases anti-clockwise.
         */ 
        private function angularPosition(x:Number, y:Number) {
            return Math.atan2(dial.y - y, x - dial.x) * 180 / Math.PI;
        }
        
        private function handleDialMouseDown(event:MouseEvent):void {
            dialMouseDown = true;
        }
        
        private function handleDialMouseUp(event:MouseEvent):void {
            dialMouseDown = false;
            var deg = angularPosition(event.stageX, event.stageY);
            setDial(getDialPositionFromAngle(deg));
        }
    
        private function handleDialMouseMove(event:MouseEvent):void {
            if (dialMouseDown) {
                var deg = angularPosition(event.stageX, event.stageY);
                setDial(getDialPositionFromAngle(deg));
            }
        }
    }
}
