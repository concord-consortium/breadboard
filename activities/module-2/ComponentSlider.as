//sparks.flash.sendCommand('insert_component', 'slider', "woo", "e30,e22", "C10");

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
	import Probe;
    
    public class ComponentSlider extends ComponentObj {
              
        private var graphicsLayer:MovieClip;
		private var sliderKnob:MovieClip;
		private var sliderRunner:MovieClip;
		private var leftEnd:MovieClip;
		private var rightEnd:MovieClip;
		private var cornersLeftEngaged:MovieClip;
		private var cornersRightEngaged:MovieClip;
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
		private var _leadTilt:Number = 60 * Math.PI/180;  //extra rotation for cap/reductor leads in radions 
		
		private var _leadLength:Number;
		
		private var xOffset:Number;
		private var yOffset:Number;
		
		private var bandZoom:Boolean = true;
		private var embedVerdana:Font = new Font1();
		private var embedArialBlack:Font = new Font2();
		
		private var printColor:TextField = new TextField();
		private var labelTextField = new TextField();
		private var format:TextFormat = new TextFormat();
		private var formatLabel:TextFormat = new TextFormat();
		
		private const textTrim:Number = 8;
		
		//variables for sliding knob values
		private var sliderKnobX_LeftPosition:Number; //beginning X position of knob to far left
		private var runnerLength:Number;
		private var segmentLength:Number;
		private var runnerPosX_1:Number;
		private var runnerPosX_2:Number;
		private var runnerPosX_3:Number;
		private var runnerPosX_4:Number;
		private var runnerPosX_5:Number;
		private var runnerPosX_6:Number;
		private var runnerPosX_7:Number;
		private var runnerPosX_8:Number;
		private var runnerPosX_9:Number;
		private var runnerPosX_10:Number;
		private var currentRunnerPosition:Number = 0;
		

		
		
		//private var reset_enable_component_dragging:Boolean = Globe.enable_component_dragging;
        
		
        public function ComponentSlider() {
            
			super();
			
            graphicsLayer = MovieClip(this.getChildByName('slider_mc'));
			sliderKnob = MovieClip(this.graphicsLayer.getChildByName('knob'));
			sliderRunner = MovieClip(this.graphicsLayer.getChildByName('runner'));
			leftEnd = MovieClip(this.graphicsLayer.getChildByName('end_left'));
			rightEnd = MovieClip(this.graphicsLayer.getChildByName('end_right'));
			cornersLeftEngaged = MovieClip(this.graphicsLayer.getChildByName('corners_left_engaged'));
			cornersLeftEngaged.alpha=0;
			cornersRightEngaged = MovieClip(this.graphicsLayer.getChildByName('corners_right_engaged'));
			cornersRightEngaged.alpha=0;
			_leadLength = 45; //5//length of exposed metal ends of wire in pixels
			
			
			//assign runner segment x values
			sliderKnobX_LeftPosition = sliderKnob.x; //start position of knob
			runnerLength = sliderRunner.width;
			segmentLength = runnerLength/10;
			runnerPosX_1 = sliderKnobX_LeftPosition;
			runnerPosX_2 = sliderKnobX_LeftPosition + segmentLength;
			runnerPosX_3 = sliderKnobX_LeftPosition + (segmentLength * 2);
			runnerPosX_4 = sliderKnobX_LeftPosition + (segmentLength * 3);
			runnerPosX_5 = sliderKnobX_LeftPosition + (segmentLength * 4);
			runnerPosX_6 = sliderKnobX_LeftPosition + (segmentLength * 5);
			runnerPosX_7 = sliderKnobX_LeftPosition + (segmentLength * 6);
			runnerPosX_8 = sliderKnobX_LeftPosition + (segmentLength * 7);
			runnerPosX_9 = sliderKnobX_LeftPosition + (segmentLength * 8);
			runnerPosX_10 = sliderKnobX_LeftPosition + (segmentLength * 9);
			

			trace("RUNNERLENGTH= "+runnerLength);
			trace("RUNNERPOSX_1="+runnerPosX_1);
			trace("RUNNERPOSX_2="+runnerPosX_2);
			trace("RUNNERPOSX_3="+runnerPosX_3);
			trace("RUNNERPOSX_4="+runnerPosX_4);
			trace("RUNNERPOSX_5="+runnerPosX_5);
			trace("RUNNERPOSX_6="+runnerPosX_6);
			trace("RUNNERPOSX_7="+runnerPosX_7);
			trace("RUNNERPOSX_8="+runnerPosX_8);
			trace("RUNNERPOSX_9="+runnerPosX_9);
			trace("RUNNERPOSX_10="+runnerPosX_10);
            //get leads and position leads
			this.putLeadsOnBottom();
            lead1 = this.getEnds()[0];
            lead2 = this.getEnds()[1];
 
			this.graphicsLayer.getChildByName('label_mc').visible=false;
			
			this.removeEventListener(MouseEvent.MOUSE_DOWN, beginDrag);//this turns off drag-ability of entire slider
			
		   //Beginning of KPC Code for moving Ends and readjusting wire
			this.addChild(connectLeads);
			//swapChildren(connectLeads, graphicsLayer);
			
			this.addEventListener(Event.ENTER_FRAME, enteringFrame);
			
			//this.sliderKnob.addEventListener(MouseEvent.MOUSE_DOWN, dragKnob);
			//this.addEventListener(MouseEvent.MOUSE_DOWN, turnOffDragging);
			//this.addEventListener(MouseEvent.MOUSE_UP, resetDragging);
            
		}
		
		public function dimensionSlider(x1:Number,y1:Number,x2:Number,y2:Number):void {
			
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
			var leadOffset_x:Number = _leadLength * Math.cos(angle);
			var leadOffset_y:Number = _leadLength * Math.sin(angle);
			
			
			_lead_x1 = _x1 + leadOffset_x;
			_lead_y1 = _y1 + leadOffset_y;
			_lead_x2 = _x2 - leadOffset_x;
			_lead_y2 = _y2 - leadOffset_y;
			
		
			 
			positionLeads(lead1, _x1, _y1, _angle);
            positionLeads(lead2, _x2, _y2, _angle);
			drawLeads();
		}

		
		public function drawLeads():void  {
			
			_leadColor1 = 0xA0A0A0; // the lead's outer color - the lead is two-toned
			_leadColor2 = 0xE5E5E5;
			
			lead1ConnectPointY = lead1.y - 40;
			lead2ConnectPointY = lead2.y + 40;
			
			connectLeads.graphics.clear();
			connectLeads.alpha = 0;
			lead1.alpha = 0;
			lead2.alpha = 0;
			
			
			connectLeads.graphics.lineStyle(8.5, 0x565656, 1.0,false, "normal", CapsStyle.NONE, null, 0);
			//connectLeads.graphics.beginFill(0x00FF00);
			connectLeads.graphics.moveTo(_lead_x1, _lead_y1); 
			connectLeads.graphics.lineTo(_lead_x2, _lead_y2);	
			
			
			connectLeads.graphics.lineStyle(5, _leadColor1, 1.0,false, "normal", CapsStyle.NONE, null, 0);
			//connectLeads.graphics.beginFill(0x00FF00);
			connectLeads.graphics.moveTo(_lead_x1, _lead_y1);  
			connectLeads.graphics.lineTo(_lead_x2, _lead_y2);	
			
			connectLeads.graphics.lineStyle(2, _leadColor2, 1);
			connectLeads.graphics.moveTo(_lead_x1, _lead_y1); 
			connectLeads.graphics.lineTo(_lead_x2, _lead_y2);	
			
			//this.lead1.breakButton.removeEventListener(MouseEvent.MOUSE_DOWN, onBreak);
			// this statement contains many private variables.  Won't work.  KPC
					
			//center the main resistor between the leads KPC 
			
			graphicsLayer.x =  (lead1.x + lead2.x) /2 ;
			graphicsLayer.y = (lead1.y + lead2.y)/2 ;
			graphicsLayer.rotation += _angle*180/Math.PI; 		
			
		}
		
		
		public function setLabel(labelStr:String){
			if(labelStr != ''){
				trace('resistorLabel is: '+labelStr);
				var label_mc:MovieClip = MovieClip(this.graphicsLayer.getChildByName('label_mc'));
				var threeDigitTextWidth:int = 35;
				formatLabel.font = embedArialBlack.fontName;
				formatLabel.color = 0xffffff;
				formatLabel.size = 14;
				formatLabel.bold = false;
			
				
				label_mc.labelTextField = new TextField();
				label_mc.labelTextField.defaultTextFormat = formatLabel;
				label_mc.labelTextField.selectable = false; 
				label_mc.labelTextField.embedFonts = true;
				label_mc.labelTextField.antiAliasType = AntiAliasType.ADVANCED;
				label_mc.labelTextField.x = 0;
				label_mc.labelTextField.y = 2;
				label_mc.labelTextField.text = labelStr;
				label_mc.labelTextField.width = label_mc.labelTextField.textWidth+5;
				label_mc.labelTextField.height = label_mc.labelTextField.textHeight+2;	
				//label_mc.labelTextField.embedFonts = true;
				label_mc.addChild(label_mc.labelTextField);
				//mock centering of label text
				if ( label_mc.labelTextField.textWidth < threeDigitTextWidth ) {
					label_mc.x +=5;
				}
				trace("text width="+label_mc.labelTextField.textWidth);
			
				this.addEventListener(MouseEvent.MOUSE_OVER, labelOn);
				this.addEventListener(MouseEvent.MOUSE_OUT, labelOff);
			}
		}
		
		private function getCurrentRunnerPosition():void {
			trace("SLIDERKNOBX="+sliderKnob.x);
			if ( sliderKnob.x < runnerPosX_2 ){
				currentRunnerPosition = 1;
			}
			
			if ( sliderKnob.x >= runnerPosX_2 && sliderKnob.x < runnerPosX_3){
				currentRunnerPosition = 2;
			}
			
			if ( sliderKnob.x >= runnerPosX_3 && sliderKnob.x < runnerPosX_4){
				currentRunnerPosition = 3;
			}
			
			if ( sliderKnob.x >= runnerPosX_4 && sliderKnob.x < runnerPosX_5){
				currentRunnerPosition = 4;
			}
			
			if ( sliderKnob.x >= runnerPosX_5 && sliderKnob.x < runnerPosX_6){
				currentRunnerPosition = 5;
			}
			
			if ( sliderKnob.x >= runnerPosX_6 && sliderKnob.x < runnerPosX_7){
				currentRunnerPosition = 6;
			}
			
			if ( sliderKnob.x >= runnerPosX_7 && sliderKnob.x < runnerPosX_8){
				currentRunnerPosition = 7;
			}
			
			if ( sliderKnob.x >= runnerPosX_8 && sliderKnob.x < runnerPosX_9){
				currentRunnerPosition = 8;
			}
			
			if ( sliderKnob.x >= runnerPosX_9 && sliderKnob.x < runnerPosX_10){
				currentRunnerPosition = 9;
			}
			
			if ( sliderKnob.x >= runnerPosX_10 ){
				currentRunnerPosition = 10;
			}
			JavaScript.instance().sendEvent('value_changed', this.name, currentRunnerPosition);
		}
		
		
		private function slideKnob():void {
			if(this.sliderKnob.hitTestObject(this.sliderRunner))
			{
			this.sliderKnob.addEventListener(MouseEvent.MOUSE_DOWN, dragKnob);
			 }
			else 
			{
				stage.removeEventListener(MouseEvent.MOUSE_MOVE,moveKnobMC);
				
				if(this.sliderKnob.hitTestObject(this.rightEnd))
					{
						this.sliderKnob.x = (rightEnd.x- 5);
						this.sliderKnob.alpha=1;
					}
				else {
					this.sliderKnob.x = (leftEnd.x + 1);
					this.sliderKnob.alpha=1;
				}
			}
			
		}

		
		private function dragKnob(e:MouseEvent):void {
			this.sliderKnob.alpha=.85;
			
			var bb:Point = parent.globalToLocal(new Point(e.stageX, e.stageY));
				xOffset = bb.x - this.sliderKnob.x;
				yOffset = bb.y - this.sliderKnob.y;
					
			stage.addEventListener(MouseEvent.MOUSE_MOVE,moveKnobMC);
			stage.addEventListener(MouseEvent.MOUSE_UP, stopDragKnob);
		}
		
		private function stopDragKnob(event:MouseEvent):void {
			this.sliderKnob.alpha=1;
			getCurrentRunnerPosition();
			//setProbeEngaged();
			stage.removeEventListener(MouseEvent.MOUSE_MOVE,moveKnobMC);
			stage.removeEventListener(MouseEvent.MOUSE_UP,stopDragKnob);
		}
		
		private function moveKnobMC(e:MouseEvent):void {
			
				
			var bb:Point = parent.globalToLocal(new Point(e.stageX, e.stageY));
			this.sliderKnob.x = bb.x - xOffset;
			getCurrentRunnerPosition();
			trace("CURRENT_RUNNER_POSITION="+currentRunnerPosition);
			trace(this.lead1.rolloverState);
			trace(this.lead2.rolloverState);
			//this.sliderKnob.y = bb.y - yOffset;
			
			e.updateAfterEvent();
			
			}
			
		private function enteringFrame ( e:Event):void {
			setProbeEngaged();
			slideKnob();
			
		}
			
		private function setProbeEngaged():void {
			if (this.lead1.rolloverState == 2) {		
				cornersLeftEngaged.alpha=1;
			}
			else {
				cornersLeftEngaged.alpha=0;
			}
			
		 	if (this.lead2.rolloverState == 2) {
				cornersRightEngaged.alpha=1;
			}
			else {
				cornersRightEngaged.alpha=0;
			} 
		}
		/*	
		private function turnOffDragging(e:MouseEvent) {
			
			Globe.enable_component_dragging = false;
		}
		
		private function resetDragging(e:MouseEvent) {
			
			Globe.enable_component_dragging = reset_enable_component_dragging;
		}*/
		
		
		private function labelOn(event:MouseEvent):void {
			this.graphicsLayer.getChildByName('label_mc').visible=true;
			//this.graphicsLayer.getChildByName('labelBackground_mc').visible=false;
		}
		private function labelOff(event:MouseEvent):void {
			this.graphicsLayer.getChildByName('label_mc').visible=false;
			//this.graphicsLayer.getChildByName('labelBackground_mc').visible=false;
		}  
		
    }
}

	
		