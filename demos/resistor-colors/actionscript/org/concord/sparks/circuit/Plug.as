package org.concord.sparks.circuit
{
    import fl.ik.IKArmature;
    import fl.ik.IKManager;
    
    import flash.display.MovieClip;
    import flash.events.MouseEvent;
    import flash.geom.Point;
    
    import org.concord.sparks.Activity;
    import org.concord.sparks.JavaScript;
    import org.concord.sparks.util.Assert;
    import org.concord.sparks.util.IK;
    
    public class Plug implements Node
    {
        public var container:MovieClip;
        
        private var _id:String;
        private var armature:IKArmature;
        private var activeShadow:MovieClip = null;
        private var color;
        
        // The ghost plug and wire that replace the real when snapping to the jack
        private var shadows:Array;
        
        private var connectedTo:Node = null;
        private var javascript:JavaScript;
        
        public var drag:Boolean = false;

        public function Plug(id:String, activity:Activity, container:MovieClip,
            armatureName:String, shadows:Array):void
        {
            this.id = id;
            this.container = container;
            this.shadows = shadows;
            javascript = activity.getJavaScript();
            
            color = id.match(/red/) ? 'red' : 'black';
            
            armature = IKManager.getArmatureByName(armatureName);
            container.addEventListener(MouseEvent.MOUSE_DOWN, handleMouseDown);
            container.addEventListener(MouseEvent.MOUSE_UP, handleMouseUp);
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
        
        public function get connected_to():Node {
            return connectedTo;
        }
        
        // target: 0 for tena_port, 1 for voma_port, 2 for common_port
        public function connect(port:MultimeterPort):void {
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
            activeShadow.gotoAndStop(this.color);
            connectedTo = port;
            javascript.sendEvent('connect', this.id, port.id);
        }
        
        public function disconnect():void {
            container.alpha = 1;
            activeShadow.alpha = 0;
            activeShadow = null;
            connectedTo = null;
            javascript.sendEvent('disconnect', this.id);
        }
        
        private function handleMouseDown(event:MouseEvent):void {
            drag = true;
        }

        private function handleMouseUp(event:MouseEvent):void {
            //trace('ENTER Lead.handleMouseUp');
            drag = false;
        }
    }
}
