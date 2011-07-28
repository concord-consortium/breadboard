package org.concord.sparks.circuit.resistor
{
    import flash.display.MovieClip;
    import flash.geom.Point;
    
    import org.concord.sparks.circuit.Node;
    
    /* 
     * Represents a lead of the resistor.
     * A resistor has two leads: left and right.
     */
    public class ResistorLead implements Node
    {
        //public var position:Point;
        
        private var _id:String;
        private var resistor_mc:MovieClip; //MovieClip holding all the components of the resistor
        private var rollover_mc:MovieClip; //highlighted are to be shown when mouse is over the lead
        private var engaged_mc:MovieClip; //to be shown when the lead is connected to another component
        
        // Dimensions of the hotspot
        private var min_x:int;
        private var max_x:int;
        private var min_y:int;
        private var max_y:int;
        
        public function ResistorLead(id:String, resistor_mc:MovieClip,
            rollover_mc:MovieClip, engaged_mc:MovieClip)
        {
            _id = id;
            //this.position = new Point(container.x, container.y);
            this.resistor_mc = resistor_mc;
            this.rollover_mc = rollover_mc;
            this.engaged_mc = engaged_mc;
            
            trace('target.x=' + resistor_mc.parent.x);
            trace('resistor_mc.x=' + resistor_mc.x);
            trace('rollover_mc.x=' + rollover_mc.x);
            trace('engaged_mc.x=' + engaged_mc.x);
            trace('rollover_mc.width=' + rollover_mc.width);
            trace('rollover_mc.height=' + rollover_mc.height);
            
            this.min_x = this.resistor_mc.parent.x + this.rollover_mc.x;
            this.max_x = this.min_x + this.rollover_mc.width;
            this.min_y = resistor_mc.parent.y + this.rollover_mc.y;
            this.max_y = this.min_y + this.rollover_mc.height;
            
            rollover_mc.alpha = 0;
            engaged_mc.alpha = 0;
        }
        
        public function get id():String {
            return _id;
        }
        
        public function set id(val:String):void {
            _id = val;
        }
        
        public function hotspot(in_pos:Point):Boolean {
            /*
            return (in_pos.x > position.x - 34 && in_pos.x < position.x + 34 &&
                in_pos.y > position.y - 12 && in_pos.y < position.y + 12);
                 */
            trace('in_pos=' + in_pos + ' hotspot=(' + min_x + ',' + min_y + ') - (' + max_x + ',' + max_y + ')');
            
            return (in_pos.x > this.min_x  && in_pos.x < this.max_x + 2 &&
                in_pos.y > this.min_y && in_pos.y < this.max_y + 7);
        }
        
        public function showRollOver():void {
            rollover_mc.alpha = 1;
        }

        public function hideRollOver():void {
            rollover_mc.alpha = 0;
        }
        
        public function showEngaged():void {
            engaged_mc.alpha = 0.55;
        }

        public function hideEngaged():void {
            trace('ENTER ResistorLead.hideEngaged');
            trace('HIDE ' + engaged_mc.name); 
            engaged_mc.alpha = 0;
        }
    }
}
