package org.concord.sparks.circuit
{
    import flash.display.MovieClip;
    import flash.geom.Point;
    
    public class ResistorLead implements Node
    {
        public var position:Point;
        
        private var _id:String;
        private var rollOver:MovieClip;
        private var engaged:MovieClip;
        
        public function ResistorLead(id:String, position:Point,
            rollOver:MovieClip, engaged:MovieClip)
        {
            _id = id;
            this.position = position;
            this.rollOver = rollOver;
            this.engaged = engaged;
            
            rollOver.alpha = 0;
            engaged.alpha = 0;
        }
        
        public function get id():String {
            return _id;
        }
        
        public function set id(val:String):void {
            _id = val;
        }
        
        public function hotspot(in_pos:Point):Boolean {
            return in_pos.x > position.x - 34 && in_pos.x < position.x + 34 &&
                in_pos.y > position.y - 12 && in_pos.y < position.y + 12;
        }
        
        public function showRollOver():void {
            rollOver.alpha = 1;
        }

        public function hideRollOver():void {
            rollOver.alpha = 0;
        }
        
        public function showEngaged():void {
            engaged.alpha = 0.55;
        }

        public function hideEngaged():void {
            trace('ENTER ResistorLead.hideEngaged');
            trace('HIDE ' + engaged.name); 
            engaged.alpha = 0;
        }
    }
}
