package org.concord.sparks.circuit {
    
    import fl.ik.IKArmature;
    import fl.ik.IKBone;
    import fl.ik.IKManager;

    import flash.display.MovieClip;
    import flash.display.Sprite;
    import flash.events.MouseEvent;
        
    public class Multimeter
    {
        var rotationMap = {
            acv_750:     0, acv_200:  18, p_9v:      36, dca_200mc: 54,
            dca_2000mc: 72, dca_20m:  90, dca_200m: 108, c_10a:    126,
            hfe:       144, diode:   162, r_200:    180, r_2000:  -162,
            r_20k:    -144, r_200k: -126, r_2000k: -108, dcv_200m: -90,
            dcv_2000m: -72, dcv_20:  -54, dcv_200:  -36, dcv_1000: -18
        };
        
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
            setDial('acv_750');
            powerSwitch = root['dmm_switch'];
            powerSwitch.addEventListener(MouseEvent.CLICK, togglePower);
            display = root['multimeter_display'];
            display.text = '';
            
            var redCord = IKManager.getArmatureByName('Armature_9');
            
            //redLead = new Lead('red_lead', root['probeRed_mc'], 0, 0, 18, 143, redCord);
            //blackLead = new Lead('black_lead', root['probeBlack_mc'], 0, 0, 28, 147, redCord);
            redLead = new Lead('red_lead', getBone('Armature_18', 'ikBoneName552'), 0, 0, 18, 143, redCord);
            blackLead = new Lead('black_lead', root['probeBlack_mc'], getBone('Armature_16', 'ikBoneName169'), 0, 0, 28, 147, redCord);
        }
        
        public function setDisplayText(s:String) {
        	display.text = s;
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
        
        public function setDial(label:String) {
            dialSetting = label;
            dial.rotation = rotationMap[label];
        }
        
        private function rotateDial(event:MouseEvent):void {
            var x = event.stageX - dial.x;
            var y = dial.y - event.stageY;
            var deg = Math.atan2(y, x) * 180 / Math.PI;
            trace('x=' + x + ' y=' + y + ' deg=' + deg)
            if (deg > 171 || deg <= -171) { 
                setDial('dcv_200m');
            }
            else if (deg > 153) {
                setDial('dcv_2000m');
            }
            else if (deg > 135) {
                setDial('dcv_20');
            }
            else if (deg > 117) {
                setDial('dcv_200');
            }
            else if (deg > 99) {
                setDial('dcv_1000');
            }
            else if (deg > 81) {
                setDial('acv_750');
            }
            else if (deg > 63) {
                setDial('acv_200');
            }
            else if (deg > 45) {
                setDial('p_9v');
            }
            else if (deg > 27) {
                setDial('dca_200mc');
            }
            else if (deg > 9) {
                setDial('dca_2000mc');
            }
            else if (deg > -9) {
                setDial('dca_20m');
            }
            else if (deg > -27) {
                setDial('dca_200m');
            }
            else if (deg > -45) {
                setDial('c_10a');
            }
            else if (deg > -63) {
                setDial('hfe');
            }
            else if (deg > -81) {
                setDial('diode');
            }
            else if (deg > -99) {
                setDial('r_200');
            }
            else if (deg > -117) {
                setDial('r_2000');
            }
            else if (deg > -135) {
                setDial('r_20k');
            }
            else if (deg > -153) {
                setDial('r_200k');
            }
            else if (deg > -171) {
                setDial('r_2000k');
            }
        }
    }
    
    private function getBone(armatureName:String, boneName:String):IKBone {
        var armature:IKArmature = IKManager.getArmatureByName(armatureName);
        return armature.getBoneByName(boneName);
    }
}
