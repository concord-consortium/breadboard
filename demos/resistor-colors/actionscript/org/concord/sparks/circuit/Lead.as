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
    import org.concord.sparks.JavaScript;
    import org.concord.sparks.util.Geom;
    import org.concord.sparks.util.IK;
    
    public class Lead implements Node
    {
        public var container:MovieClip;
        
        // Offset used to calculate global coordinates of the end point
        var xOffset:Number;
        var yOffset:Number;
        
        public var drag:Boolean = false;
        public var connected:Boolean = false;
        
        private var _id:String;
        private var armature:IKArmature;
        
        private var javascript:JavaScript;
        
        public function Lead(id:String, activity:Activity, container:MovieClip, armatureName:String):void
        {
            this.id = id;
            this.javascript = activity.getJavaScript();
            this.container = container;

            container.addEventListener(MouseEvent.MOUSE_DOWN, handleMouseDown);
            container.addEventListener(MouseEvent.MOUSE_UP, handleMouseUp);
            container.addEventListener(MouseEvent.MOUSE_MOVE, handleMouseMove);
            
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
            return new Point(container.x, container.y).add(IK.getTailJoint(armature.rootJoint).position);
        }
        
        public function snapTo(target:Point):void {
            trace('ENTER Lead.snapTo');
            var localTargetPos:Point = target.subtract(new Point(container.x, container.y));
            var tip:IKJoint = IK.getTailJoint(armature.rootJoint);
            var mover:IKMover  = new IKMover(tip, tip.position);

            // The IK armature doesn't seem to move to target at once!
            for (var i = 0; i < 100; ++i) {
                if (Geom.distance(tip.position, localTargetPos) < 2.0) {
                    break;
                }
                mover.moveTo(localTargetPos);
                //trace('' + i + ': tip pos=' + tip_position);
            }
            trace('IK joint moved ' + i + ' times');
        }
        
        private function disconnect():void {
            this.connected = false;
            this.javascript.sendEvent('disconnect', this.id);
        }
        
        private function handleMouseDown(event:MouseEvent):void {
            this.drag = true;
        }

        private function handleMouseUp(event:MouseEvent):void {
            trace('ENTER Lead.handleMouseUp');
            this.drag = false;
            trace('Lead.handleMouseUp drag=' + this.drag);
        }
        
        private function handleMouseMove(event:MouseEvent) {
            trace('ENTER Lead.handleMouseMove');
            trace('Lead.handleMouseMove drag=' + this.drag);
            if (this.drag && this.connected) {
                disconnect();
            }
        }
    }
}
