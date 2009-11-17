package org.concord.sparks.circuit.multimeter.dmm_centech
{
    import flash.geom.Point;
    
    import org.concord.sparks.Activity;
    import org.concord.sparks.circuit.Node;
    import org.concord.sparks.util.Geom;
    
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
            /*
            var t = (in_pos.x > _position.x - 20 && in_pos.x < _position.x + 20 &&
                in_pos.y > _position.y - 20 && in_pos.y < _position.y + 20);
            return t;
            */
           return Geom.distance(_position, in_pos) < 20;
        }
    }
}
