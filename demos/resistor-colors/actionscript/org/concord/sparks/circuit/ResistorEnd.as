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
    }
}
