package org.concord.sparks.circuit {
    
    import fl.ik.IKManager;

    import flash.display.MovieClip;
    import flash.display.Sprite;
    import flash.events.MouseEvent;
        
    public class Multimeter
    {
        const DCV_1000 = "dcv_1000";
        const DCV_200 = "dcv_200";
        const DCV_20 = "dcv_20";
        const DCV_2000m = "dcv_2000m";
        const DCV_200m = "dcv_200m";
        
        const R_2000k = "r_2000k";
        const R_200k = "r_200k";
        const R_20k = "r_20k";
        const R_2000 = "r_2000";
        const R_200 = "r_200";
        
        const ACV_750 = "acv_750m";
        
        const ACV_200 = "acv_200";
        const P_9V = "p_9v";
        const DCA_200mc = "dca_200mc";
        const DCA_2000mc = "dca_2000mc";
        const DCA_20m = "dca_20m";
        const DCA_200m = "dca_200m";
        const C_10a = "c_10a";
        const HFE = "hfe";
        const DIODE = "diode";
        
        public var redLead;
        public var blackLead;
        
        public var dial:MovieClip;
        public var dialSetting:String; //label representing position of dial
        
        public var powerSwitch:MovieClip;
        public var powerOn:Boolean = false; //true if multimeter is turned on
        
        var root;
        var display; //display for dmm
        
        public function Multimeter(root) {
            this.root = root;
            dial = root['dial'];
            dial.addEventListener(MouseEvent.CLICK, rotateDial);
            dialSetting = ACV_750;
            powerSwitch = root['dmm_switch'];
            powerSwitch.addEventListener(MouseEvent.CLICK, togglePower);
            display = root['multimeter_display'];
            display.text = '';
            
            var redCord = IKManager.getArmatureByName('Armature_9');
            
            redLead = new Lead('red_lead', root['probeRed_mc'], 0, 0, 18, 143, redCord);
            blackLead = new Lead('black_lead', root['probeBlack_mc'], 0, 0, 28, 147, redCord);
        }
        
        public function setDisplayText(s:String) {
        	display.text = s;
        }
        
        public function getDisplayText():String {
        	return display.text;
        }

        private function togglePower(event:MouseEvent):void {
        	powerSwitch.rotation += 180;
        	powerOn = !powerOn;
        	trace('powerOn=' + powerOn);
        }
        
        private function rotateDial(event:MouseEvent):void {
            var x = event.stageX - dial.x;
            var y = dial.y - event.stageY;
            var deg = Math.atan2(y, x) * 180 / Math.PI;
            trace('x=' + x + ' y=' + y + ' deg=' + deg)
            if (deg > 171 || deg <= -171) { 
                dial.rotation = -90;
                dialSetting = DCV_200m;
            }
            else if (deg > 153) {
                dial.rotation = -72;
                dialSetting = DCV_2000m;
            }
            else if (deg > 135) {
                dial.rotation = -54;
                dialSetting = DCV_20;
            }
            else if (deg > 117) {
                dial.rotation = -36;
                dialSetting = DCV_200;
            }
            else if (deg > 99) {
                dial.rotation = -18;
                dialSetting = DCV_1000;
            }
            else if (deg > 81) {
                dial.rotation = 0;
                dialSetting = ACV_750;
            }
            else if (deg > 63) {
                dial.rotation = 18;
                dialSetting = ACV_200;
            }
            else if (deg > 45) {
                dial.rotation = 36;
                dialSetting = P_9V;
            }
            else if (deg > 27) {
                dial.rotation = 54;
                dialSetting = DCA_200mc;
            }
            else if (deg > 9) {
                dial.rotation = 72;
                dialSetting = DCA_2000mc;
            }
            else if (deg > -9) {
                dial.rotation = 90;
                dialSetting = DCA_20m;
            }
            else if (deg > -27) {
                dial.rotation = 108;
                dialSetting = DCA_200m;
            }
            else if (deg > -45) {
                dial.rotation = 126;
                dialSetting = C_10a;
            }
            else if (deg > -63) {
                dial.rotation = 144;
                dialSetting = HFE;
            }
            else if (deg > -81) {
                dial.rotation = 162;
                dialSetting = DIODE;
            }
            else if (deg > -99) {
                dial.rotation = 180;
                dialSetting = R_200;
            }
            else if (deg > -117) {
                dial.rotation = -162;
                dialSetting = R_2000;
            }
            else if (deg > -135) {
                dial.rotation = -144;
                dialSetting = R_20k;
            }
            else if (deg > -153) {
                dial.rotation = -126;
                dialSetting = R_200k;
            }
            else if (deg > -171) {
                dial.rotation = -108;
                dialSetting = R_2000k;
            }
        }
    }
}
