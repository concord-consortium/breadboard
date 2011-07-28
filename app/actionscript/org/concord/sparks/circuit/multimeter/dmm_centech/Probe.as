package org.concord.sparks.circuit.multimeter.dmm_centech
{
    import fl.ik.IKArmature;
    import fl.ik.IKJoint;
    import fl.ik.IKManager;
    import fl.ik.IKMover;
    
    import flash.display.MovieClip;
    import flash.geom.Point;
    import flash.events.Event;
    import flash.events.MouseEvent;
    import flash.media.Sound;
    import flash.media.SoundChannel;
    import flash.media.SoundTransform;
    
    import org.concord.sparks.Activity;
    import org.concord.sparks.JavaScript;
    import org.concord.sparks.circuit.Node;
    import org.concord.sparks.util.Geom;
    import org.concord.sparks.util.IK;
    
    public class Probe extends MovieClip implements Node
    {
        public var container:MovieClip;
        
        public var drag:Boolean = false;
        
        private var _id:String;
        private var armature:IKArmature;
        private var connectedTo:Node = null;
        
        private var javascript:JavaScript;
        
        public function Probe(id:String, activity:Activity, container:MovieClip, armature:IKArmature):void
        {
            this.id = id;
            this.javascript = activity.getJavaScript();
            this.container = container;
            this.armature = armature;

            container.addEventListener(MouseEvent.MOUSE_DOWN, handleMouseDown);
            container.addEventListener(MouseEvent.MOUSE_UP, handleMouseUp);
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
        
        public function get connected_to():Node {
            return connectedTo;
        }
        
        public function connect(node:Node):void {
            // Play sound
            var transform1:SoundTransform=new SoundTransform();
            var sndClickIt = new clickit3();
            var sndClickItChannel:SoundChannel =sndClickIt.play(); 
            transform1.volume=.75;
            sndClickItChannel.soundTransform=transform1;
                
            connectedTo = node;
            javascript.sendEvent('connect', this.id, node.id);
        }
        
        public function disconnect():void {
            connectedTo = null;
            javascript.sendEvent('disconnect', this.id);
        }
        
        public function snapTo(target:Point):void {
            //trace('ENTER Lead.snapTo');
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
        
        private function handleMouseDown(event:MouseEvent):void {
            drag = true;
        }

        private function handleMouseUp(event:MouseEvent):void {
            //trace('ENTER Lead.handleMouseUp');
            drag = false;
        }
    }
}
