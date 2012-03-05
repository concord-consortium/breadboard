//sparks.flash.sendCommand('insert_component', 'blackPowerWire', "woo", "e30, e25", "C10");

package {

    import flash.display.Loader;
    import flash.display.MovieClip;
	import flash.display.DisplayObject;
	import flash.display.DisplayObjectContainer;
	import flash.display.Shape;
	import flash.display.Graphics;
    import flash.display.Sprite;
	import fl.motion.*;
    import flash.events.Event;
    import flash.events.MouseEvent;
    import flash.geom.ColorTransform;
	import flash.geom.Rectangle;//kpc
    import flash.geom.Matrix;//kpc
	import flash.geom.Point;
	import flash.display.CapsStyle; //KPC
    import flash.net.URLRequest;
    import flash.media.Sound;
    import flash.media.SoundChannel;
    import flash.media.SoundTransform;
	import flash.events.KeyboardEvent;
	import flash.text.*;

	import Lead;
    import org.concord.sparks.JavaScript;
    import Globe;
    
    public class ComponentPowerWireBlack extends ComponentObj {
              
        private var graphicsLayer:MovieClip;
		private var lead1:Lead;
		private var lead2:Lead;
		private var lead:Lead; //KPC for drawleads registration point
		private var lead1ConnectPointX:Number;  //KPC
		private var lead2ConnectPointX:Number;  //KPC
		private var lead1ConnectPointY:Number;  //KPC
		private var lead2ConnectPointY:Number;  //KPC
		
		var angle:Number;  
		var leadOffset_x:Number;
		var leadOffset_y:Number;
		
		
		private var _leadColor1:uint; //KPC copy from wire
		private var _leadColor2:uint;  //KPC copy from wire
		private var connectLeads:Shape = new Shape(); //KPC
		
		private var _x1:Number;
		private var _y1:Number;
		private var _x2:Number;
		private var _y2:Number;
		private var _angle:Number;
		
		private var _lead_x1:Number;
		private var _lead_y1:Number;
		private var _lead_x2:Number;
		private var _lead_y2:Number;
		private var _leadTilt:Number = 65 * Math.PI/180;  //extra rotation for cap/reductor leads in radions 
		
		private var _leadLength:Number;
		
	
        
        public function ComponentPowerWireBlack() {
            
			super();
            graphicsLayer = MovieClip(this.getChildByName('powerWireBlack_mc'));
			_leadLength = 45; //5//length of exposed metal ends of wire in pixels
			
            //get leads and position leads
				this.putLeadsOnBottom();
				lead1 = this.getEnds()[0];
	 			lead2 = this.getEnds()[1];
				
				//graphicsLayer.alpha = .5;
			   //Beginning of KPC Code for moving Ends and readjusting wire
				this.addChild(connectLeads);
				swapChildren(connectLeads, graphicsLayer);
				
        }

		
		public function dimensionBlackPowerWire(x1:Number,y1:Number,x2:Number,y2:Number):void {
			
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
			
			angle = Math.atan( (_y2-_y1) / (_x2-_x1) );  // angle of the line's slope in radians
			_angle = angle;
			leadOffset_x = _leadLength * Math.cos(_angle);
			leadOffset_y = _leadLength * Math.sin(_angle);
			
			 
			positionLeads(lead1, _x1, _y1, _angle-_leadTilt);
            positionLeads(lead2, _x2, _y2, _angle+_leadTilt);
			
			///KPC variables for getting curve to correct point on end of Lead. Luke's help with Trig
			_lead_x1 = _x1 + Math.cos(_angle - _leadTilt) * _leadLength;
 		    _lead_y1 = _y1 + Math.sin(_angle - _leadTilt) * _leadLength;
			_lead_x2 = _x2 - Math.cos(_angle + _leadTilt) * _leadLength;
    		_lead_y2 = _y2 - Math.sin(_angle + _leadTilt) * _leadLength;
			
			positionWire();

			//drawLeads();
			
		}
		
		public function positionWire():void {  //gets rid of right lead and rotates left lead
		
			//var leadEndPoint:Point=new Point(_lead_x2, _lead_y2);
			//lead1.rotation -= 45;
			graphicsLayer.x = _lead_x1;
			graphicsLayer.y = _lead_y1;
			lead2.x -= 2000;
			lead2.alpha = 0;
			
			
		}
		//sparks.flash.sendCommand('insert_component', 'capacitor', "woo", "e30,e22", "C10");
		/*public function drawLeads():void  {
			
			
			var center_mc:MovieClip = MovieClip(this.graphicsLayer.getChildByName('center_mc'));
			var curveToPointY:Number;
			_leadColor1 = 0xA0A0A0; // the lead's outer color - the lead is two-toned
			_leadColor2 = 0xE5E5E5;
			
			
			
			//KPC curveToPoint vector coordinates - I don't know why these coordinates works, but they do.
			var curveToPoint:Point=new Point(graphicsLayer.x + leadOffset_y*2, graphicsLayer.y - leadOffset_x*2);
			
			connectLeads.graphics.clear();
			
			connectLeads.graphics.lineStyle(8.5, 0x565656, 1.0,false, "normal", CapsStyle.NONE, null, 0);
			connectLeads.graphics.moveTo(_lead_x1, _lead_y1);
			connectLeads.graphics.curveTo(curveToPoint.x, curveToPoint.y, _lead_x2, _lead_y2);	
			
			
			connectLeads.graphics.lineStyle(5, _leadColor1, 1.0,false, "normal", CapsStyle.NONE, null, 0);
			connectLeads.graphics.moveTo(_lead_x1, _lead_y1);
			connectLeads.graphics.curveTo(curveToPoint.x, curveToPoint.y, _lead_x2, _lead_y2);	
			
			connectLeads.graphics.lineStyle(2, _leadColor2, 1);
			connectLeads.graphics.moveTo(_lead_x1, _lead_y1);
			connectLeads.graphics.curveTo(curveToPoint.x, curveToPoint.y, _lead_x2, _lead_y2);	
		} */
						    
    }
}