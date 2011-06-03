﻿package
{
	import flash.display.MovieClip;
	import flash.display.Shape;
	import flash.display.Graphics;
	import flash.display.DisplayObject;
	import flash.display.DisplayObjectContainer;
	import flash.display.CapsStyle;
	import flash.display.Sprite;

	import Lead;
	
	public class ComponentWire extends ComponentObj {	
	
		private var _x1:Number;
		private var _y1:Number;
		private var _x2:Number;
		private var _y2:Number;
		private var _angle:Number;
		private var _insulation_x1:Number;
		private var _insulation_y1:Number;
		private var _insulation_x2:Number;
		private var _insulation_y2:Number;
		
		private var _breadboard:MovieClip;
		private var _leadLength:Number;
		private var _leadColor1:uint;
		private var _leadColor2:uint;
		private var _insulationColor:uint;
		private var _graphicsLayer:MovieClip;
		private var _wire:Shape;
		private var _insulation:Shape;
		private var _lead1:Lead;
		private var _lead2:Lead;
	
		public function ComponentWire(breadboard:MovieClip) {
			trace('ENTER ComponentWire');

			super();
			_graphicsLayer = new MovieClip();
			_wire = new Shape();
			_insulation = new Shape();
			
			_leadLength = 45; //5//length of exposed metal ends of wire in pixels
			_leadColor1 = 0xA0A0A0; // the lead's outer color - the lead is two-toned
			_leadColor2 = 0xE5E5E5; // the lead's inner color
			_breadboard = breadboard;
			_breadboard.getComponentLayer().addChild(this);
			this.addChild(_graphicsLayer);
			_graphicsLayer.addChild(_wire);
			_graphicsLayer.addChild(_insulation);

			//get leads
			this.putLeadsOnBottom();
            _lead1 = this.getEnds()[0];
            _lead2 = this.getEnds()[1];
		}
		
		public function dimension(x1:Number,y1:Number,x2:Number,y2:Number):void {
			_insulationColor = uint('0x006600');//default color - green
			if(x1<=x2) {
				_x1 = x1;
				_y1 = y1;
				_x2 = x2;
				_y2 = y2;
			} else {
				_x1 = x2;
				_y1 = y2;
				_x2 = x1;
				_y2 = y1;
			}
			
			var angle:Number = Math.atan( (_y2-_y1) / (_x2-_x1) );  // angle of the line's slope in radians
			_angle = angle;
			var insulationOffset_x:Number = _leadLength * Math.cos(angle);
			var insulationOffset_y:Number = _leadLength * Math.sin(angle);
			
			_insulation_x1 = _x1 + insulationOffset_x;
			_insulation_y1 = _y1 + insulationOffset_y;
			_insulation_x2 = _x2 - insulationOffset_x;
			_insulation_y2 = _y2 - insulationOffset_y;
			
			drawLines();
		}
		
		public function setColor(insulationColor:String):void {
			_insulationColor = uint(insulationColor);//set color
			drawLines();
		}
		
		private function drawLines():void {
			_graphicsLayer.removeChild(_wire);
			_graphicsLayer.removeChild(_insulation);
			_wire = new Shape();
			_insulation = new Shape();
			_graphicsLayer.addChild(_wire);
			_graphicsLayer.addChild(_insulation);

			/*_wire.graphics.lineStyle(8, _leadColor1, 1);
			_wire.graphics.moveTo(_x1,_y1);
			_wire.graphics.lineTo(_x2,_y2);
			_wire.graphics.lineStyle(2, _leadColor2, 1);
			_wire.graphics.moveTo(_x1,_y1);
			_wire.graphics.lineTo(_x2,_y2);*/
			
			_insulation.graphics.lineStyle(8, _insulationColor, 1.0,false, "normal", CapsStyle.NONE, null, 0); //CapsStyle.ROUND, and CapsStyle.SQUARE
			_insulation.graphics.moveTo(_insulation_x1,_insulation_y1);
			_insulation.graphics.lineTo(_insulation_x2,_insulation_y2);
			//lineStyle(thickness:Number = NaN, color:uint = 0, alpha:Number = 1.0, pixelHinting:Boolean = false, scaleMode:String = "normal", caps:String = null, joints:String = null, miterLimit:Number = 3)

			positionLeads(_lead1, _x1, _y1, _angle);
            positionLeads(_lead2, _x2, _y2, _angle);
		}

}
}