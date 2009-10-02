package org.concord.sparks.circuit
{
    import fl.ik.IKArmature;
    import fl.ik.IKJoint;
    import fl.ik.IKManager;
    import fl.ik.IKMover;
    
    import flash.display.MovieClip;
    import flash.geom.Point;
    import flash.events.Event;
    import flash.events.MouseEvent;
    
    import org.concord.sparks.Activity;
    import org.concord.sparks.util.Geom;
    
    public class Lead implements Node
    {
        public var displayObject:MovieClip;
        
        // Offset used to calculate global coordinates of the end point
        var xOffset:Number;
        var yOffset:Number;
        
        public var drag:Boolean = false;
        public var connected:Boolean = false;
        
        private var _id:String;
        private var armature:IKArmature;
        
        public function Lead(id:String, displayObject:MovieClip, armatureName:String):void
        {
        	this.id = id;
            this.displayObject = displayObject;

            displayObject.addEventListener(MouseEvent.MOUSE_DOWN, handleMouseDown);
            displayObject.addEventListener(MouseEvent.MOUSE_UP, handleMouseUp);
            
            armature = IKManager.getArmatureByName(armatureName);
        }
        
        public function get id():String {
        	return _id;
        }
        
        public function set id(val:String):void {
            _id = val;
        }
        
        // Position of the probing end of the lead
        public function get tip_position():Point {
            return getTailJoint(armature.rootJoint).position;
        }
        
        public function snapTo(target:Point):void {
            trace('ENTER Lead.snapTo');
            var tip:IKJoint = getTailJoint(armature.rootJoint);
            var mover:IKMover = new IKMover(tip, tip.position);
            
            // The IK armature doesn't seem to move to target at once!
            var n = 0;
            while (Geom.distance(tip.position, target) > 2.0) {
                mover.moveTo(target);
                ++n;
            }
            trace('IK joint moved ' + n + ' times');
        }
        
        private function getTailJoint(joint:IKJoint):IKJoint {
            if (joint.numChildren < 1) {
                return joint;
            }
            return getTailJoint(joint.getChildAt(0));
        }
        
        private function handleMouseDown(event:MouseEvent):void {
            drag = true;
        }

        private function handleMouseUp(event:Event):void {
            drag = false;
        }
    }
}
