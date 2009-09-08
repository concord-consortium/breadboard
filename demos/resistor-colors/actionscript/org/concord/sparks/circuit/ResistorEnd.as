package org.concord.sparks.circuit
{
	public class ResistorEnd
	{
		public var x:Number;
		public var y:Number;
		
		private var _id:String;
		
		public function ResistorEnd(id:String, x:Number, y:Number) {
			_id = id;
			this.x = x;
			this.y = y;
		}
		
		public function get id():String {
			return _id;
		}
		
		public function set id(val:String) {
			_id = val;
		}
	}
}
