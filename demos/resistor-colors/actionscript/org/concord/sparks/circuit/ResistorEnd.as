package org.concord.sparks.circuit
{
    import flash.geom.Point;
    
    public class ResistorEnd
    {
        public var position:Point;
        
        private var _id:String;
        
        public function ResistorEnd(id:String, position:Point) {
            _id = id;
            this.position = position;
        }
        
        public function get id():String {
            return _id;
        }
        
        public function set id(val:String) {
            _id = val;
        }
        
        public function hotspot(in_pos:Point):Boolean {
            return in_pos.x > position.x - 34 && in_pos.x < position.x + 34 &&
                in_pos.y > position.y - 12 && in_pos.y < position.y + 12;
        }
    }
}
