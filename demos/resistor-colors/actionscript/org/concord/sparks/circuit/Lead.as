package org.concord.sparks.circuit
{
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
        
        // Local coordinates of the end point of the lead
        var endLocalX:Number; 
        var endLocalY:Number;
        
        public var mouseDown:Boolean = false;
        public var connected:Boolean = false;
        
        private var _id:String; 
        
        public function Lead(id, displayObject, endLocalX:Number, endLocalY:Number) {
        	this.id = id;
            this.displayObject = displayObject;
            this.endLocalX = endLocalX;
            this.endLocalY = endLocalY;
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
            displayObject.x = x - endLocalX;
            displayObject.y = y - endLocalY;
        }
        
        function handleMouseDown(event:MouseEvent):void {
            mouseDown = true;
            xOffset = endLocalX - event.localX;
            yOffset = endLocalY - event.localY;
            displayObject.startDrag();
        }

        function handleMouseUp(event:Event):void {
            displayObject.stopDrag();
            mouseDown = false;
        }
        
        function handleMouseMove(event:MouseEvent):void {
            if (mouseDown) {
                x = event.stageX + xOffset;
                y = event.stageY + yOffset;
            }
        }
    }
}
