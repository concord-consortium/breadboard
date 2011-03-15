
			
package org.concord.sparks.circuit.resistor
{
    import flash.display.Graphics;

    import flash.display.Loader;
    import flash.display.MovieClip;
    import flash.display.Shape;
    import flash.events.Event;
    import flash.events.MouseEvent;
    import flash.events.IOErrorEvent;
    import flash.geom.Point;
    import org.concord.sparks.util.Assert;
    import flash.text.TextField;
    import flash.text.TextFormat;
    import flash.text.TextFieldAutoSize;
    import flash.display.Sprite;
    
    public class Resistor4band extends Resistor
    {
        // Instance names in Flash movie
        public static var names = {
            //resistorContainer : 'resistor_mc',
            //leftLeadRollOver : 'resistor_rollover',
            //rightLeadRollOver : 'resistor_rollover_right',
            //leftLeadEngaged : 'probe_engaged',
            //rightLeadEngaged : 'probe_engaged_right'
        };
        
        //var value:Number;
        /*
        var x = 430;
        var y = 200;
        var width = 260;
        var height = 80;
        */
        //public var snapRadius = 35;
        
        var band1Loader:Loader = new Loader(); 
        var band2Loader:Loader = new Loader(); 
        var band3Loader:Loader = new Loader();
        var band4Loader:Loader = new Loader();
        var band5Loader:Loader = new Loader();
        
        var printColor1:TextField = new TextField();
        var printColor2:TextField = new TextField();
        var printColor3:TextField = new TextField();
        var printColor4:TextField = new TextField();
        
        var format:TextFormat = new TextFormat();
        

        
        
        public function Resistor4band(activity) {
            super(activity,
                '/common/flash/resistor4band.swf',
                '/common/images/resistor/4band');
                //names.resistorContainer);
        }
        
        protected override function swfLoaded(e:Event):void {
            trace('ENTER swfLoaded');
            
            setContainer(loader.content as MovieClip);

            // Assert the parent has the named objects
            for each (var name:String in names) {
                Assert.assertContains(parent, name);
            }
            /*
            lead1 = new ResistorLead('resistor_lead1', new Point(591, 104),
                parent[names.leftLeadRollOver], parent[names.leftLeadEngaged]); 
            lead2 = new ResistorLead('resistor_lead2', new Point(867, 102),
                parent[names.rightLeadRollOver], parent[names.rightLeadEngaged]);
            */
            lead1 = new ResistorLead('resistor_lead1', container,
                container.resistor_rollover_left, container.probe_engaged_left); 
            lead2 = new ResistorLead('resistor_lead2', container,
                container.resistor_rollover_right, container.probe_engaged_right);
           
            container.band1.addChild(band1Loader);
            container.band2.addChild(band2Loader);
            container.band3.addChild(band3Loader);
            container.band4.addChild(band4Loader);
            
            setColors(['red', 'white', 'black', 'silver']);
            
            //sendEvent('Attaching a callback');
            container.band1.addEventListener(MouseEvent.MOUSE_OVER, zoomBand1);
            container.band1.addEventListener(MouseEvent.MOUSE_OUT, unzoomBand1);
            container.band2.addEventListener(MouseEvent.MOUSE_OVER, zoomBand2);
 	 		container.band2.addEventListener(MouseEvent.MOUSE_OUT, unzoomBand2);
            container.band3.addEventListener(MouseEvent.MOUSE_OVER, zoomBand3);
 	 		container.band3.addEventListener(MouseEvent.MOUSE_OUT, unzoomBand3);
            container.band4.addEventListener(MouseEvent.MOUSE_OVER, zoomBand4);
 	 		container.band4.addEventListener(MouseEvent.MOUSE_OUT, unzoomBand4);
 	 		
 	 		format.font = "Verdana";
        	format.color = 0xFFFFFF;
        	format.size = 14;
        	format.bold = true;
        	
        	printColor1.defaultTextFormat = format;
        	printColor2.defaultTextFormat = format;
        	printColor3.defaultTextFormat = format;
        	printColor4.defaultTextFormat = format;
            
            hide();
        }
        	

        private function zoomBand1 (event:MouseEvent):void
		{
			//sendEvent('ENTER zoomBand1');
			var band = container.band1;
			var printColor = printColor1;
			band.scaleX = 1.75;
			band.scaleY = 2.5;
			band.x -=6;
			band.y -=50;
					
			printColor.x = (band.x - 5);
			printColor.y = (band.y - 25);
			printColor.text = colors[0];
			printColor.height=20;

			container.addChild(printColor);
			
		
			
		}
		
		private function unzoomBand1 (event:MouseEvent):void
		{
			var band = container.band1;
			var printColor = printColor1;
			band.scaleX = 1;
			band.scaleY = 1;
			band.x +=6;
			band.y +=50;
			container.removeChild(printColor);
		}
		
		private function zoomBand2 (event:MouseEvent):void
		{
			var band = container.band2;
			var printColor = printColor2;
			band.scaleX = 1.75;
			band.scaleY = 3;
			band.x -=6;
			band.y -=50;	
        	
			printColor.x = (band.x - 5);
			printColor.y = (band.y - 25);
			printColor.text = colors[1];
			printColor.height=20;

			container.addChild(printColor);

		}

		private function unzoomBand2 (event:MouseEvent):void
		{
			var band = container.band2;
			var printColor = printColor2;
			band.scaleX = 1;
			band.scaleY = 1;
			band.x +=6;
			band.y +=50;
			container.removeChild(printColor);
		}

   		private function zoomBand3 (event:MouseEvent):void
		{
			var band = container.band3;
			var printColor = printColor3;
			band.scaleX = 1.75;
			band.scaleY = 3;
			band.x -=6;
			band.y -=50;
			
			printColor.x = (band.x - 5);
			printColor.y = (band.y - 25);
			printColor.text = colors[2];
			printColor.height=20;

			container.addChild(printColor);
		}

		private function unzoomBand3 (event:MouseEvent):void
		{
			var band = container.band3;
			var printColor = printColor3;
			band.scaleX = 1;
			band.scaleY = 1;
			band.x +=6;
			band.y +=50;
			container.removeChild(printColor);
		}
		
		private function zoomBand4 (event:MouseEvent):void
		{
			var band = container.band4;
			var printColor = printColor4;
			band.scaleX = 1.75;
			band.scaleY = 3;
			band.x -=6;
			band.y -=50;
			
			printColor.x = (band.x - 5);
			printColor.y = (band.y - 25);
			printColor.text = colors[3];
			printColor.height=20;

			container.addChild(printColor);
		}

		private function unzoomBand4 (event:MouseEvent):void
		{
			var band = container.band4;
			var printColor = printColor4;
			band.scaleX = 1;
			band.scaleY = 1;
			band.x +=6;
			band.y +=50;
			container.removeChild(printColor);
		}

  

       
        public override function setColors(colors:Array):void {
            trace('Enter setColors');
            this.colors = colors;
            loadBandImage(band1Loader, 's_' + colors[0] + '.png');
            loadBandImage(band2Loader, 's_' + colors[1] + '.png');
            loadBandImage(band3Loader, 's_' + colors[2] + '.png');
            loadBandImage(band4Loader, 't_' + colors[3] + '.png');
        }
    }
}
