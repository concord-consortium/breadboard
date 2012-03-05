package {

    import flash.display.MovieClip;
	import flash.display.DisplayObjectContainer;
	import flash.display.*;
	
	import flash.display.Loader;
	import flash.display.DisplayObject;
    import flash.display.Sprite;
    import flash.events.Event;
	
    import flash.geom.Point;
	import flash.events.MouseEvent;
    import flash.media.Sound;
    import flash.media.SoundChannel;
    import flash.media.SoundTransform;
	
	import flash.events.MouseEvent; // for debugging, can erase
	
	import flash.display.Shape;
    
    import org.concord.sparks.JavaScript;
    import org.concord.sparks.circuit.multimeter.dmm_centech.DmmCentech2;
	import Resistor4Band;
	import Resistor5Band;
	import Breadboard;
	import ComponentWire;
	import ComponentCapacitor;
	import ComponentInductor;
	import ComponentSlider;
	import ComponentPowerWireBlack;
	import ComponentPowerWireRed;
	
	import Probe;
	import Globe;


    public class Circuit {

        private var activity;
        private var root;

        private var breadboard:MovieClip;
        private var multimeter:DmmCentech2;
		private var redProbe:Probe;
        private var blackProbe:Probe;
		private var pinkProbe:Probe;
		private var yellowProbe:Probe;
        private var components:Array = new Array();
		
		var boardSection:Array = new Array();
		var getRows:Array = new Array();
        
        private var sndClickIt:clickit3;
        private var sndClickItChannel:SoundChannel;
        private var transform1:SoundTransform=new SoundTransform();
		
		private var breadboardMC:ComponentBreadboard;

        public function Circuit(activity, root) {
            this.activity = activity;
            this.root = root;

            breadboard = root.outer_breadboard_mc.breadboard_mc;
			multimeter = root.dmm_mc;
			
            redProbe = breadboard.probe_red;
            redProbe.setCircuit(this);
            blackProbe = breadboard.probe_black;
            blackProbe.setCircuit(this);
			pinkProbe = breadboard.probe_pink;
            pinkProbe.setCircuit(this);
			yellowProbe = breadboard.probe_yellow;
            yellowProbe.setCircuit(this);
            
            multimeter.setDisplayText('  9.0 0');
			
			breadboardMC = root.outer_breadboard_mc;
			breadboardMC.expandOnFocus.setStartX(breadboardMC.x); //kpc comment out for non-zoom BB
			breadboardMC.expandOnFocus.setStartY(breadboardMC.y); //kpc comment out for non-zoom BB
			
			redProbe.visible=false;
			blackProbe.visible=false;
			pinkProbe.visible=true;
			yellowProbe.visible=true;
			multimeter.visible=false;
        }

		//>>> sparks.flash.sendCommand('insert_component','resistor','resistor1','a29,b17','4band','label-text','green,blue,blue,red,red');

/*sparks.flash.sendCommand('insert_component', 'wire', "w1", "g30,a4", "black");

sparks.flash.sendCommand('insert_component', 'resistor', "woo", "f30,f24", '4band', "r1", ["red","red","red","gold"]);

sparks.flash.sendCommand('insert_component', 'capacitor', "woo", "f30,f24", "r1");
*/


		
		public function insertComponent(componentKind:String, componentName:String, position:String, ...values):String {
			
			switch(componentKind) {
				case 'resistor':
					//...values
					var type:String = values[0];
					var tempArr:Array = values[1].toString().split(",");
					var componentLabel = tempArr.shift();
					var colorsArr:Array =tempArr;
					
					var i:int = components.length;  // get length for new resistor array
					if(type == '4band') {
						components[i] = new resistorFourBand_mc;
						components[i].setColorBands(colorsArr);
						components[i].setLabel(componentLabel);
					} else if(type == '5band') {
						components[i] = new resistorFiveBand_mc;
						components[i].setColorBands(colorsArr);
						components[i].setLabel(componentLabel);
					} 
					//components[i].setColorBands(colorsArr); //temporarily moved into resistor type for wireSpecial to work
					positionComponent(componentKind, components[i], position);
					components[i].name = componentName;
					trace(components[i].name);
					//breadboard.addChildAt(components[i],breadboard.numChildren);  // need to fix the level here to be the highest without being on top of probes
					breadboard.getComponentLayer().addChild(components[i]);
					breadboard.sortZindexByVerticalPosition(breadboard.getComponentLayer());
					//breadboard.getComponentLayer().setChildIndex(components[i],0);
					
				break;
				case 'capacitor':
					var newCapacitor:int = components.length;
					var componentLabel2:String = values[0];
					
					//components.push(new ComponentCapacitor(breadboard));
					components[newCapacitor] = new capacitor_mc;
					components[newCapacitor].name = componentName;
					positionComponent(componentKind, components[newCapacitor], position);
					components[newCapacitor].setLabel(componentLabel2);			
					breadboard.getComponentLayer().addChild(components[newCapacitor]);
					breadboard.sortZindexByVerticalPosition(breadboard.getComponentLayer());
	
					//breadboard.getComponentLayer().setChildIndex(components[newCapacitor], breadboard.getComponentLayer().numChildren - 1);
				break;
				case 'inductor':
					var newInductor:int = components.length;
					var componentLabel3:String = values[0];
					
					components[newInductor] = new inductor_mc;
					components[newInductor].name = componentName;
					positionComponent(componentKind, components[newInductor], position);
					components[newInductor].setLabel(componentLabel3);			
					breadboard.getComponentLayer().addChild(components[newInductor]);
					breadboard.sortZindexByVerticalPosition(breadboard.getComponentLayer());
					
					//breadboard.getComponentLayer().setChildIndex(components[newInductor], breadboard.getComponentLayer().numChildren - 1);
				break;
				case 'slider':
					var newSlider:int = components.length;
					var componentLabel4:String = values[0];
					
					components[newSlider] = new slider_mc;
					components[newSlider].name = componentName;
					positionComponent(componentKind, components[newSlider], position);
					components[newSlider].setLabel(componentLabel4);			
					breadboard.getComponentLayer().addChild(components[newSlider]);
					breadboard.sortZindexByVerticalPosition(breadboard.getComponentLayer());
					
					//breadboard.getComponentLayer().setChildIndex(components[newSlider], breadboard.getComponentLayer().numChildren - 1);
				break;
				case 'blackPowerWire':
					var newBlackPowerWire:int = components.length;
					//var componentLabel5:String = values[0];
					
					components[newBlackPowerWire] = new powerWireBlack_mc;
					components[newBlackPowerWire].name = componentName;
					positionComponent(componentKind, components[newBlackPowerWire], position);
					//components[newBlack].setLabel(componentLabel3);			
					breadboard.getComponentLayer().addChild(components[newBlackPowerWire]);
					breadboard.sortZindexByVerticalPosition(breadboard.getComponentLayer());
					
					//breadboard.getComponentLayer().setChildIndex(components[newInductor], breadboard.getComponentLayer().numChildren - 1);
				break;
				case 'redPowerWire':
					var newRedPowerWire:int = components.length;
					//var componentLabel6:String = values[0];
					
					components[newRedPowerWire] = new powerWireRed_mc;
					components[newRedPowerWire].name = componentName;
					positionComponent(componentKind, components[newRedPowerWire], position);
					//components[newBlack].setLabel(componentLabel3);			
					breadboard.getComponentLayer().addChild(components[newRedPowerWire]);
					breadboard.sortZindexByVerticalPosition(breadboard.getComponentLayer());
					
					//breadboard.getComponentLayer().setChildIndex(components[newInductor], breadboard.getComponentLayer().numChildren - 1);
				break;
	
				case 'multimeter':
				break;
				case 'battery':
				break;
				case 'wire':
					var wireColor:String = values[0];
					var newWire:int = components.length;
					
					components.push(new ComponentWire(breadboard));
					components[newWire].name = componentName;
					positionComponent(componentKind, components[newWire], position);
					components[newWire].setColor(wireColor);
					breadboard.sortZindexByVerticalPosition(breadboard.getComponentLayer());
					breadboard.getComponentLayer().setChildIndex(components[i],0);
					//breadboard.getComponentLayer().setChildIndex(components[newWire], breadboard.getComponentLayer().numChildren - 1);
				break;
			}
			return '';
		}

		private function parseCoordinates(coordinateStr:String):Array { //takes a string of two coordinates and outputs in a two dimensional array with row/hole count, such that [0][0] = x1, [0][1] = y1, [1][0] = x2, [1][1] = y2
			var tempCoordinates:Array = coordinateStr.split(",");  // 'a6,a12' -> ['a6','a12']
			var coordinatesArr:Array = new Array();
			trace("KPC PARSING COORDINATES");
			for(var i:int = 0; i<2; i++){
				var coordinate:String = tempCoordinates[i];
				
				// left positive power rail
				if(coordinate.indexOf('left_positive') != -1 ){
					trace('coordinate '+coordinate);
					coordinatesArr[i] = new Array('pos1',coordinate.substring(13,coordinate.length)); //for each element: 'left_positive6' -> [pos1][6]
					trace('coordinate '+coordinatesArr[i]);
				
				// right positive power rail
				} else if(coordinate.indexOf('right_positive') != -1 ) {
					coordinatesArr[i] = new Array('pos2',coordinate.substring(14,coordinate.length)); //for each element: 'right_positive6' -> [pos2][6]
					trace('coordinate '+coordinatesArr[i]);
				
				// left negative power rail
				} else if(coordinate.indexOf('left_negative') != -1 ) {
					coordinatesArr[i] = new Array('neg1',coordinate.substring(13,coordinate.length)); //for each element: 'left_negative6' -> [neg1][6]
				
				// right negative power rail
				} else if(coordinate.indexOf('right_negative') != -1 ) {
					coordinatesArr[i] = new Array('neg2',coordinate.substring(14,coordinate.length)); //for each element: 'right_negative6' -> [neg2][6]
				
				// main board
				} else {
					coordinatesArr[i] = new Array(coordinate.substring(0,1),coordinate.substring(1,coordinate.length)); //for each element: 'a6' -> [a][6]
					var rowLabels:Array = new Array("a","b","c","d","e","f","g","h","i","j"); //,"k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"
					coordinatesArr[i][0] = rowLabels.indexOf(coordinatesArr[i][0])+1; //convert row letter to row number, 'a' = 1, 'b' = 2, etc.    [a][6] -> [1][6]
				}
			}
			return coordinatesArr;
			trace("coordinatesArr="+coordinatesArr);
		}
		
		private function positionComponent(componentKind:String, componentObj:MovieClip, position:String) {  //  ( 'resistor', [object] , 'a6,b12' )
			var xPos:Number;
			var yPos:Number;
			var x2Pos:Number;
			var y2Pos:Number;
			var coordinates:Array;
			var holeNum:int;
			var rowNum:int;
			var hole2Num:int;
			var row2Num:int;

			switch(componentKind) {
				/*case 'resistor': //KPC Sam explained how to put location into array
					coordinates = parseCoordinates(position); // string 'a6,b12' -> 2d array [0][0] = 1, [0][1] = 6, [1][0] = 2, [1][1] = 12
					holeNum = coordinates[0][1];
					rowNum = coordinates[0][0];
					xPos = breadboard.getRows()[rowNum][holeNum].x + breadboard.holeSize/2;
					yPos = breadboard.getRows()[rowNum][holeNum].y + breadboard.holeSize/2;
					componentObj.x = xPos;
					componentObj.y = yPos;
				
					break;
					*/
				case 'resistor':
					coordinates = parseCoordinates(position); // string 'a6,b12' -> 2d array [0][0] = 1, [0][1] = 6, [1][0] = 2, [1][1] = 12
					//trace('coordinates '+coordinates);
					
					
					for(var j:int=0; j<2; j++){
						
						boardSection[j] = 'main';
						
						if(j==0){
							holeNum = coordinates[0][1];
							rowNum = coordinates[0][0];
							xPos = breadboard.getRows()[rowNum][holeNum].x + breadboard.holeSize/2;
							yPos = breadboard.getRows()[rowNum][holeNum].y + breadboard.holeSize/2;						
						}
						
						if(j==1){
							hole2Num = coordinates[1][1];
							row2Num = coordinates[1][0];
							x2Pos = breadboard.getRows()[row2Num][hole2Num].x + breadboard.holeSize/2;
							y2Pos = breadboard.getRows()[row2Num][hole2Num].y + breadboard.holeSize/2;
						}
						
					}
					componentObj.x = xPos; //6
					componentObj.y = yPos;  //a
					componentObj.dimensionResistor(0,0, x2Pos-xPos, y2Pos-yPos); //sets dimensions of the bounding box KPC
				break;
				
				case 'capacitor':
					coordinates = parseCoordinates(position); // string 'a6,b12' -> 2d array [0][0] = 1, [0][1] = 6, [1][0] = 2, [1][1] = 12
					//trace('coordinates '+coordinates);
					
					for(var k:int=0; k<2; k++){
						
						boardSection[k] = 'main';
						
						if(k==0){
							holeNum = coordinates[0][1];
							rowNum = coordinates[0][0];
							xPos = breadboard.getRows()[rowNum][holeNum].x + breadboard.holeSize/2;
							yPos = breadboard.getRows()[rowNum][holeNum].y + breadboard.holeSize/2;						
						}
						
						if(k==1){
							hole2Num = coordinates[1][1];
							row2Num = coordinates[1][0];
							x2Pos = breadboard.getRows()[row2Num][hole2Num].x + breadboard.holeSize/2;
							y2Pos = breadboard.getRows()[row2Num][hole2Num].y + breadboard.holeSize/2;
						}
						
					}
					componentObj.x = xPos; //6
					componentObj.y = yPos;  //a
					componentObj.dimensionCapacitor(0,0, x2Pos-xPos, y2Pos-yPos); //sets dimensions of the bounding box KPC
				break;
				
				case 'inductor':
					coordinates = parseCoordinates(position); // string 'a6,b12' -> 2d array [0][0] = 1, [0][1] = 6, [1][0] = 2, [1][1] = 12
					//trace('coordinates '+coordinates);
					
					for(var m:int=0; m<2; m++){
						
						boardSection[m] = 'main';
						
						if(m==0){
							holeNum = coordinates[0][1];
							rowNum = coordinates[0][0];
							xPos = breadboard.getRows()[rowNum][holeNum].x + breadboard.holeSize/2;
							yPos = breadboard.getRows()[rowNum][holeNum].y + breadboard.holeSize/2;						
						}
						
						if(m==1){
							hole2Num = coordinates[1][1];
							row2Num = coordinates[1][0];
							x2Pos = breadboard.getRows()[row2Num][hole2Num].x + breadboard.holeSize/2;
							y2Pos = breadboard.getRows()[row2Num][hole2Num].y + breadboard.holeSize/2;
						}
						
					}
					componentObj.x = xPos; //6
					componentObj.y = yPos;  //a
					componentObj.dimensionInductor(0,0, x2Pos-xPos, y2Pos-yPos); //sets dimensions of the bounding box KPC
				break;
				
				
				case 'slider':
					coordinates = parseCoordinates(position); // string 'a6,b12' -> 2d array [0][0] = 1, [0][1] = 6, [1][0] = 2, [1][1] = 12
					//trace('coordinates '+coordinates);
					
					for(var p:int=0; p<2; p++){
						
						boardSection[p] = 'main';
						
						if(p==0){
							holeNum = coordinates[0][1];
							rowNum = coordinates[0][0];
							xPos = breadboard.getRows()[rowNum][holeNum].x + breadboard.holeSize/2;
							yPos = breadboard.getRows()[rowNum][holeNum].y + breadboard.holeSize/2;						
						}
						
						if(p==1){
							hole2Num = coordinates[1][1];
							row2Num = coordinates[1][0];
							x2Pos = breadboard.getRows()[row2Num][hole2Num].x + breadboard.holeSize/2;
							y2Pos = breadboard.getRows()[row2Num][hole2Num].y + breadboard.holeSize/2;
						}
						
					}
					componentObj.x = xPos; //6
					componentObj.y = yPos;  //a
					componentObj.dimensionSlider(0,0, x2Pos-xPos, y2Pos-yPos); //sets dimensions of the bounding box KPC
				break;
				
				case 'blackPowerWire':
					coordinates = parseCoordinates(position); // string 'a6,b12' -> 2d array [0][0] = 1, [0][1] = 6, [1][0] = 2, [1][1] = 12
					//trace('coordinates '+coordinates);
					
					for(var q:int=0; q<2; q++){
						if(String(coordinates[r][0]).indexOf('pos') != -1) {
							boardSection[q] = 'pos';
							if(String(coordinates[q][0]) == 'pos1') {
								coordinates[q][0] = 1;
							} else {
								coordinates[q][0] = 2;
							}
						} else if(String(coordinates[q][0]).indexOf('neg') != -1) {
							if(String(coordinates[q][0]) == 'neg1') {
								coordinates[q][0] = 1;
							} else {
								coordinates[q][0] = 2;
							}
							boardSection[q] = 'neg';
						} else {
							boardSection[q] = 'main';
						}
						if(q==0){
							holeNum = coordinates[0][1];
							rowNum = coordinates[0][0];
							//trace('row#  coordinates[0][0] '+coordinates[0][0]);
							//trace('hole# coordinates[0][1] '+coordinates[0][1]);							
						}
						if(q==1){
							hole2Num = coordinates[1][1];
							row2Num = coordinates[1][0];
							//trace('row#  coordinates[1][0] '+coordinates[1][0]);
							//trace('hole# coordinates[1][1] '+coordinates[1][1]);							
						}
						switch(boardSection[q]) {
							case 'pos':
								if(q==0){
									xPos = breadboard.getPosRows()[rowNum][holeNum].x + breadboard.holeSize/2;
									yPos = breadboard.getPosRows()[rowNum][holeNum].y + breadboard.holeSize/2;
								}
								if(q==1){
									x2Pos = breadboard.getPosRows()[row2Num][hole2Num].x + breadboard.holeSize/2;
									y2Pos = breadboard.getPosRows()[row2Num][hole2Num].y + breadboard.holeSize/2;
								}
							break;	
							case 'neg':
								if(q==0){
									xPos = breadboard.getNegRows()[rowNum][holeNum].x + breadboard.holeSize/2;
									yPos = breadboard.getNegRows()[rowNum][holeNum].y + breadboard.holeSize/2;
								}
								if(q==1){
									x2Pos = breadboard.getNegRows()[row2Num][hole2Num].x + breadboard.holeSize/2;
									y2Pos = breadboard.getNegRows()[row2Num][hole2Num].y + breadboard.holeSize/2;
								}
							break;
							case 'main':				
								trace('main');
								if(q==0){
									xPos = breadboard.getRows()[rowNum][holeNum].x + breadboard.holeSize/2;
									yPos = breadboard.getRows()[rowNum][holeNum].y + breadboard.holeSize/2;
								}
								if(q==1){
									x2Pos = breadboard.getRows()[row2Num][hole2Num].x + breadboard.holeSize/2;
									y2Pos = breadboard.getRows()[row2Num][hole2Num].y + breadboard.holeSize/2;
								}
							break;
						}
					}
					componentObj.x = xPos; //6
					componentObj.y = yPos;  //a
					componentObj.dimensionBlackPowerWire(0,0, x2Pos-xPos, y2Pos-yPos); //sets dimensions of the bounding box KPC
				break;
				
				case 'redPowerWire':
					coordinates = parseCoordinates(position); // string 'a6,b12' -> 2d array [0][0] = 1, [0][1] = 6, [1][0] = 2, [1][1] = 12
					//trace('coordinates '+coordinates);
					
					for(var r:int=0; r<2; r++){
						if(String(coordinates[r][0]).indexOf('pos') != -1) {
							boardSection[r] = 'pos';
							if(String(coordinates[r][0]) == 'pos1') {
								coordinates[r][0] = 1;
							} else {
								coordinates[r][0] = 2;
							}
						} else if(String(coordinates[r][0]).indexOf('neg') != -1) {
							if(String(coordinates[r][0]) == 'neg1') {
								coordinates[r][0] = 1;
							} else {
								coordinates[r][0] = 2;
							}
							boardSection[r] = 'neg';
						} else {
							boardSection[r] = 'main';
						}
						if(r==0){
							holeNum = coordinates[0][1];
							rowNum = coordinates[0][0];
							//trace('row#  coordinates[0][0] '+coordinates[0][0]);
							//trace('hole# coordinates[0][1] '+coordinates[0][1]);							
						}
						if(r==1){
							hole2Num = coordinates[1][1];
							row2Num = coordinates[1][0];
							//trace('row#  coordinates[1][0] '+coordinates[1][0]);
							//trace('hole# coordinates[1][1] '+coordinates[1][1]);							
						}
						switch(boardSection[r]) {
							case 'pos':
								if(r==0){
									xPos = breadboard.getPosRows()[rowNum][holeNum].x + breadboard.holeSize/2;
									yPos = breadboard.getPosRows()[rowNum][holeNum].y + breadboard.holeSize/2;
								}
								if(r==1){
									x2Pos = breadboard.getPosRows()[row2Num][hole2Num].x + breadboard.holeSize/2;
									y2Pos = breadboard.getPosRows()[row2Num][hole2Num].y + breadboard.holeSize/2;
								}
							break;	
							case 'neg':
								if(r==0){
									xPos = breadboard.getNegRows()[rowNum][holeNum].x + breadboard.holeSize/2;
									yPos = breadboard.getNegRows()[rowNum][holeNum].y + breadboard.holeSize/2;
								}
								if(r==1){
									x2Pos = breadboard.getNegRows()[row2Num][hole2Num].x + breadboard.holeSize/2;
									y2Pos = breadboard.getNegRows()[row2Num][hole2Num].y + breadboard.holeSize/2;
								}
							break;
							case 'main':				
								trace('main');
								if(r==0){
									xPos = breadboard.getRows()[rowNum][holeNum].x + breadboard.holeSize/2;
									yPos = breadboard.getRows()[rowNum][holeNum].y + breadboard.holeSize/2;
								}
								if(r==1){
									x2Pos = breadboard.getRows()[row2Num][hole2Num].x + breadboard.holeSize/2;
									y2Pos = breadboard.getRows()[row2Num][hole2Num].y + breadboard.holeSize/2;
								}
							break;
						}
					}
					componentObj.x = xPos; //6
					componentObj.y = yPos;  //a
					componentObj.dimensionRedPowerWire(0,0, x2Pos-xPos, y2Pos-yPos); //sets dimensions of the bounding box KPC
				break;
				
				
				
				case 'wire':
					coordinates = parseCoordinates(position); // string 'a6,b12' -> 2d array [0][0] = 1, [0][1] = 6, [1][0] = 2, [1][1] = 12
					//trace('coordinates '+coordinates);
					
					for(var i:int=0; i<2; i++){
						if(String(coordinates[i][0]).indexOf('pos') != -1) {
							boardSection[i] = 'pos';
							if(String(coordinates[i][0]) == 'pos1') {
								coordinates[i][0] = 1;
							} else {
								coordinates[i][0] = 2;
							}
						} else if(String(coordinates[i][0]).indexOf('neg') != -1) {
							if(String(coordinates[i][0]) == 'neg1') {
								coordinates[i][0] = 1;
							} else {
								coordinates[i][0] = 2;
							}
							boardSection[i] = 'neg';
						} else {
							boardSection[i] = 'main';
						}
						if(i==0){
							holeNum = coordinates[0][1];
							rowNum = coordinates[0][0];
							//trace('row#  coordinates[0][0] '+coordinates[0][0]);
							//trace('hole# coordinates[0][1] '+coordinates[0][1]);							
						}
						if(i==1){
							hole2Num = coordinates[1][1];
							row2Num = coordinates[1][0];
							//trace('row#  coordinates[1][0] '+coordinates[1][0]);
							//trace('hole# coordinates[1][1] '+coordinates[1][1]);							
						}
						switch(boardSection[i]) {
							case 'pos':
								if(i==0){
									xPos = breadboard.getPosRows()[rowNum][holeNum].x + breadboard.holeSize/2;
									yPos = breadboard.getPosRows()[rowNum][holeNum].y + breadboard.holeSize/2;
								}
								if(i==1){
									x2Pos = breadboard.getPosRows()[row2Num][hole2Num].x + breadboard.holeSize/2;
									y2Pos = breadboard.getPosRows()[row2Num][hole2Num].y + breadboard.holeSize/2;
								}
							break;	
							case 'neg':
								if(i==0){
									xPos = breadboard.getNegRows()[rowNum][holeNum].x + breadboard.holeSize/2;
									yPos = breadboard.getNegRows()[rowNum][holeNum].y + breadboard.holeSize/2;
								}
								if(i==1){
									x2Pos = breadboard.getNegRows()[row2Num][hole2Num].x + breadboard.holeSize/2;
									y2Pos = breadboard.getNegRows()[row2Num][hole2Num].y + breadboard.holeSize/2;
								}
							break;
							case 'main':				
								trace('main');
								if(i==0){
									xPos = breadboard.getRows()[rowNum][holeNum].x + breadboard.holeSize/2;
									yPos = breadboard.getRows()[rowNum][holeNum].y + breadboard.holeSize/2;
								}
								if(i==1){
									x2Pos = breadboard.getRows()[row2Num][hole2Num].x + breadboard.holeSize/2;
									y2Pos = breadboard.getRows()[row2Num][hole2Num].y + breadboard.holeSize/2;
								}
							break;
						}
					}
					componentObj.x = xPos; //6
					componentObj.y = yPos;  //a
					componentObj.dimension(0,0, x2Pos-xPos, y2Pos-yPos); //sets dimensions of the bounding box KPC
				break;
				
				case 'multimeter':
				break;
				case 'battery':
				break;
			}
		}
	
		
	public function enableProbeDragging(probeColor:String, statStr:String)  {
		switch(probeColor) {
			case "red": 
				switch((statStr).toLowerCase()) {
				case "true":
				case "1":
				case "yes":
				//default:
					Globe.dragRedProbe = true;
					break;
				case "false":
				case "0":
				case "no":
					Globe.dragRedProbe = false;
					break;
				}
			this.redProbe.set_dragability();
			trace("Globe.dragRedProbe="+Globe.dragRedProbe);
			break;
			
			case 'black':
			switch((statStr).toLowerCase()) {
				case "true":
				case "1":
				case "yes":
				//default:
					Globe.dragBlackProbe = true;
					break;
				case "false":
				case "0":
				case "no":
					Globe.dragBlackProbe = false;
					break;
				}
			this.blackProbe.set_dragability();
			break;
			
			case 'yellow':
				switch((statStr).toLowerCase()) {
				case "true":
				case "1":
				case "yes":
				//default:
					Globe.dragYellowProbe = true;
					this.yellowProbe.buttonMode == true;
					break;
				case "false":
				case "0":
				case "no":
					Globe.dragYellowProbe = false;
					break;
				}
			this.yellowProbe.set_dragability();
			break;
			
			case 'pink':
				switch((statStr).toLowerCase()) {
				case "true":
				case "1":
				case "yes":
				//default:
					Globe.dragPinkProbe = true;
					break;
				case "false":
				case "0":
				case "no":
					Globe.dragPinkProbe = false;
					break;
				}
			this.pinkProbe.set_dragability();
			break;
			
			}
		//trace("Globe.dragRedProbe= "+Globe.dragRedProbe);
		return '';
		}
										   
        public function getResistor(id:String) {
            return breadboard[id];
        }
        
        public function getMultimeter():DmmCentech2 {
            return multimeter;
        }
		
		public function getBlackProbe():Probe {
			return blackProbe;
		}
		public function getRedProbe():Probe {
			return redProbe;
		}
		public function getPinkProbe():Probe {
			return pinkProbe;
		}
		
		public function getYellowProbe():Probe {
			return yellowProbe;
		}
		
		public function getProbeVisibility():Boolean {
			return blackProbe.visible; // red probe should be the same
		}
		//visibility can be set from the javascript as follows:
		//flash.sendCommand('set_probe_visiblity','true');
		//
		//or in flash with
		//circuit.blackProbe.setVisibility('true');
		//circuit.redProbe.setVisibility('true');
		
		public function setProbeVisibility(probe, statStr:String) {
			switch((statStr).toLowerCase()) {
 		    	case "true":
				case "1":
				case "yes":
				default:
				if (probe=="dmm_probes") {
  				this.blackProbe.visible = true;
  				this.redProbe.visible = true;
  			} else if (probe=="oscope_probes") {
  				this.pinkProbe.visible = true;
				this.yellowProbe.visible = true;
  			}
				break;
				case "false":
				case "0":
				case "no":
				if (probe=="dmm_probes") {
  				this.blackProbe.visible = false;
  				this.redProbe.visible = false;
  			} else if (probe=="oscope_probes") {
  				this.pinkProbe.visible = false;
				this.yellowProbe.visible = false;
  			}
			}
		}



        public function setProbeConnection(probe:Probe):void {  //same as update probe connection, but with a smaller hit area (to ensure that the probe doesn't fall out of the hit area when a component's leads are lifted and lowered)
            trace('ENTER Circuit#updateProbeConnection');
            var oldConnection:Object = probe.getConnection();
            var connection:Object = null;
            var ends;
            
            for (var i = 0; i < components.length; ++i) {
                ends = components[i].getEnds();
                for (var j = 0; j < 2; ++j) {
					if(probe == ends[j].getProbe()) {
						//ends[j].setProbe(null); //reset lead to not-connected view
						//ends[j].setBrokenOriginal(); //reset lead to default view
						//ends[j].setOriginal();  //reset lead to default view
					}
                    if (ends[j].isBroken()) {
                        if (ends[j].inBrokenHotSpot(probe)) {
                            connection = ends[j];
                            ends[j].setBrokenEngaged();
							ends[j].setProbe(probe);
                        }
                    }
                    else {
                        if (ends[j].inHotSpot(probe)) {
                            connection = ends[j];
                            ends[j].setEngaged();
							ends[j].setProbe(probe);
                        }
                    }
                }
            }
            
            if (connection !== oldConnection) {
                clickSound();
                probe.setConnection(connection);
				JavaScript.instance().sendEvent('connect', 'probe', probe.getId(), connection.getLocation());
                if(connection != null) {
					connection.calcProbeShift();
				} else {
					JavaScript.instance().sendEvent('disconnect', 'probe', probe.getId(), oldConnection.getLocation());
				}
			}
        }


        public function setComponentEndColors(probe:Probe):void {
            //trace('ENTER Circuit#updateResistorEndColor');			
            var ends;
            for (var i = 0; i < components.length; ++i) {
                ends = components[i].getEnds();
                for (var j = 0; j < 2; ++j) {
                    if (ends[j].isBroken()) {
                        if (ends[j].inBrokenHotSpot(probe)) {
                            if (ends[j].getBrokenState() !== Lead.ROLL_OVER) {
                                ends[j].setBrokenRollOver();
								ends[j].setProbe(probe); //if connected, set probe
								//probe.setConnection(ends[j]);//set probe to resistor
                            }
                        }
                        else {
                            if (!probeConnected(ends[j]) && ends[j].getBrokenState() !== Lead.ORIGINAL) {
                            	trace('set to broken-original '+!probeConnected(ends[j]) && ends[j].getBrokenState() !== Lead.ORIGINAL);
                                ends[j].setBrokenOriginal();
								ends[j].setProbe(null); //set resistor to no-probe
								//probe.setConnection(ends[j]);//set probe to null
                            }
                        }
                    }
                    else {
                        if (ends[j].inHotSpot(probe)) {
                            if (ends[j].getState() !== Lead.ROLL_OVER) {
                                ends[j].setRollOver();
								ends[j].setProbe(probe); //if connected, set probe
								//probe.setConnection(ends[j]);//set probe to resistor
                            }
                        }
                        else {
                            if (!probeConnected(ends[j]) && ends[j].getState() !== Lead.ORIGINAL) {
                            	trace('set to original '+!probeConnected(ends[j]) && ends[j].getState() !== Lead.ORIGINAL);
                                ends[j].setOriginal();
								ends[j].setProbe(null); //set resistor to no-probe
								//probe.setConnection(ends[j]);//set probe to no resistor
                            }
                        }
                    }
                }
            }
        }

        
		public function putProbeOnTop(clickedProbe:Probe):void {
			if(redProbe==clickedProbe) {
				if(breadboard.getChildIndex(clickedProbe) < breadboard.getChildIndex(blackProbe)) {
					breadboard.swapChildren(clickedProbe,blackProbe);
				}
				if(breadboard.getChildIndex(clickedProbe) < breadboard.getChildIndex(pinkProbe)) {
					breadboard.swapChildren(clickedProbe,pinkProbe);
				}
				if(breadboard.getChildIndex(clickedProbe) < breadboard.getChildIndex(yellowProbe)) {
					breadboard.swapChildren(clickedProbe,yellowProbe);
				}
			} else if(blackProbe==clickedProbe) {
				if(breadboard.getChildIndex(clickedProbe) < breadboard.getChildIndex(redProbe)) {
					breadboard.swapChildren(clickedProbe,redProbe);
				}
				if(breadboard.getChildIndex(clickedProbe) < breadboard.getChildIndex(pinkProbe)) {
					breadboard.swapChildren(clickedProbe,pinkProbe);
				}
				if(breadboard.getChildIndex(clickedProbe) < breadboard.getChildIndex(yellowProbe)) {
					breadboard.swapChildren(clickedProbe,yellowProbe);
				}
			} else if(pinkProbe==clickedProbe) {
				if(breadboard.getChildIndex(clickedProbe) < breadboard.getChildIndex(blackProbe)) {
					breadboard.swapChildren(clickedProbe,blackProbe);
				}
				if(breadboard.getChildIndex(clickedProbe) < breadboard.getChildIndex(redProbe)) {
					breadboard.swapChildren(clickedProbe,redProbe);
				}
				if(breadboard.getChildIndex(clickedProbe) < breadboard.getChildIndex(yellowProbe)) {
					breadboard.swapChildren(clickedProbe,yellowProbe);
				}
				
			} else if(yellowProbe==clickedProbe) {
				if(breadboard.getChildIndex(clickedProbe) < breadboard.getChildIndex(blackProbe)) {
					breadboard.swapChildren(clickedProbe,blackProbe);
				}
				if(breadboard.getChildIndex(clickedProbe) < breadboard.getChildIndex(redProbe)) {
					breadboard.swapChildren(clickedProbe,redProbe);
				}
				if(breadboard.getChildIndex(clickedProbe) < breadboard.getChildIndex(pinkProbe)) {
					breadboard.swapChildren(clickedProbe,pinkProbe);
				}
				
			} 
		}
		
        private function probeConnected(end:Lead):Boolean {
            return redProbe.getConnection() == end || blackProbe.getConnection() == end || pinkProbe.getConnection() == end || yellowProbe.getConnection() == end;
        }

        private function clickSound():void {
            sndClickIt=new clickit3();
            sndClickItChannel=sndClickIt.play(); 
            transform1.volume=.75;
            sndClickItChannel.soundTransform=transform1;
        }




	}

}
