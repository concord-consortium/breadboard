package org.concord.sparks.circuit
{
    import fl.ik.IKArmature;
    import fl.ik.IKBone;
    import fl.ik.IKMover;
    
    import flash.geom.Point;
    import flash.events.Event;
    import flash.events.MouseEvent;
    
    import org.concord.sparks.Activity;
    
    public class Lead implements Node
    {
        // Global coordinates of the end point of the lead
        public var x:Number;
        public var y:Number;

        public var displayObject;
        
        // Offset used to calculate global coordinates of the end point
        var xOffset:Number;
        var yOffset:Number;
        
        // Local coordinates of the tip of the lead
        var headLocalX:Number; 
        var headLocalY:Number;
        
        // Local coordinates of the rear end of the lead
        var tailLocalX:Number; 
        var tailLocalY:Number; 
        
        public var drag:Boolean = false;
        public var connected:Boolean = false;
        
        var cord:IKArmature;
        
        private var _id:String;
        
        public function Lead(id, displayObject,
            headLocalX:Number, headLocalY:Number,
            tailLocalX:Number, tailLocalY:Number, 
            cord:IKArmature)
        {
        	this.id = id;
            this.displayObject = displayObject;
            this.headLocalX = headLocalX;
            this.headLocalY = headLocalY;
            this.tailLocalX = tailLocalX;
            this.tailLocalY = tailLocalY;
            this.cord = cord;
            displayObject.addEventListener(MouseEvent.MOUSE_DOWN, handleMouseDown);
            displayObject.addEventListener(MouseEvent.MOUSE_UP, handleMouseUp);
            displayObject.addEventListener(MouseEvent.MOUSE_MOVE,handleMouseMove);
        }
        
        public function get id():String {
        	return _id;
        }
        
        public function set id(val:String):void {
            _id = val;
        }
        
        public function snapTo(x:Number, y:Number) {
            displayObject.x = x - headLocalX;
            displayObject.y = y - headLocalY;
        }
        
        function handleMouseDown(event:MouseEvent):void {
            xOffset = headLocalX - event.localX;
            yOffset = headLocalY - event.localY;
            displayObject.startDrag();
            drag = true;
        }

        function handleMouseUp(event:Event):void {
            drag = false;
            displayObject.stopDrag();
        }
        
        function handleMouseMove(event:MouseEvent):void {
            if (drag) {
                x = event.stageX + xOffset;
                y = event.stageY + yOffset;
                
                /*
                //trace('------------');
                //trace('tipX=' + x + ' tipY=' + y);
                trace('stageX=' + event.stageX + ' stageY=' + event.stageY);
                trace('locX=' + event.localX + ' locY=' + event.localY);
                //trace('xOffset=' + xOffset + ' yOffset=' + yOffset);
                
                trace('rot=' + displayObject.rotation);
                var tailStageX = displayObject.x + tailLocalX;
                var tailStageY = displayObject.y + tailLocalY;
                
                var bone:IKBone = cord.getBoneByName('ikBoneName142');
                var mover:IKMover = new IKMover(bone.tailJoint,
                bone.tailJoint.position);
                mover.moveTo(new Point(tailStageX, tailStageY));
                trace('headJoint at ' + bone.tailJoint.position);
                trace('tailStage=' + tailStageX + ',' + tailStageY);
                if (Math.abs(tailStageX - bone.headJoint.position.x) > 2 ||
                    Math.abs(tailStageY - bone.headJoint.position.y) > 2)
                {
                    //drag = false;
                    //displayObject.stopDrag();
                }
                 */
            }
        }
    }
}
