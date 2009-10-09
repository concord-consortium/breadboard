package org.concord.sparks.circuit
{
    import flash.geom.Point;
    
    public class MultimeterPort implements Node
    {
        private var _id:String;
        private var _position:Point;
            
        public function MultimeterPort(id:String, position:Point) {
            this.id = id;
            _position = position;
        }
            
        public function get id():String {
            return _id;
        }
        
        public function set id(val:String):void {
            _id = val;
        }
        
        public function get position():Point {
            return _position;
        }
        
        // Return true if in_pos is in the hotspot of the port
        public function hotspot(in_pos:Point) {
            var t = (in_pos.x > _position.x - 22 && in_pos.x < _position.x + 28 &&
                in_pos.y > _position.y - 22 && in_pos.y < _position.y + 22);
            return t;
        }
    }
}
