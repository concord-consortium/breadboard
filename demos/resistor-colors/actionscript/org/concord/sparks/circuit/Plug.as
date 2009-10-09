package org.concord.sparks.circuit
{
    import fl.ik.IKArmature;
    import fl.ik.IKManager;
    
    import flash.display.MovieClip;
    import flash.geom.Point;
    
    import org.concord.sparks.util.IK;
    
    public class Plug implements Node
    {
        public var container:MovieClip;
        
        private var _id:String;
        private var armature:IKArmature;
        private var activeShadow:MovieClip = null;
        private var pluggedTo:MultimeterPort = null;
        
        // The ghost plug and wire that replace the real when snapping to the jack
        private var shadows:Array;

        public function Plug(id:String, container:MovieClip,
            armatureName:String, shadows:Array):void
        {
            this.id = id;
            this.container = container;
            this.shadows = shadows;
            
            for (var i = 0; i < shadows.length; ++i) {
                shadows[i].alpha = 0; //Make invisible
            }

            armature = IKManager.getArmatureByName(armatureName);
        }
            
        public function get id():String {
            return _id;
        }
        
        public function set id(val:String):void {
            _id = val;
        }
        
        // Position of the plugging end of the plug
        public function get tip_position():Point {
            return new Point(container.x, container.y).add(IK.getTailJoint(armature.rootJoint).position);
        }
        
        public function get plugged_port():MultimeterPort {
            return pluggedTo;
        }
        
        public function isPluggedIn():Boolean {
            return pluggedTo != null;
        }
        
        // target: 0 for tena_port, 1 for voma_port, 2 for common_port
        public function plugTo(port:MultimeterPort):void {
            trace('ENTER Plug.snapTo');
            container.alpha = 0;
            var num = 0;
            switch (port.id) {
            case 'tena_port':
                num = 0;
                break;
            case 'voma_port':
                num = 1;
                break;
            case 'common_port':
                num = 2;
                break;
            default:
                trace('ERROR invalid port id ' + port.id);
            }
            activeShadow = shadows[num];
            activeShadow.alpha = 1;
            pluggedTo = port;
        }
        
        public function unplug():void {
            container.alpha = 1;
            activeShadow.alpha = 0;
            activeShadow = null;
            pluggedTo = null;
        }
    }
}
