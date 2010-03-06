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
            hide();
        }
        
        public override function setColors(colors:Array):void {
            trace('Enter setColors');
            this.colors = colors;
            loadBandImage(band1Loader, 't_' + colors[0] + '.png');
            loadBandImage(band2Loader, 's_' + colors[1] + '.png');
            loadBandImage(band3Loader, 's_' + colors[2] + '.png');
            loadBandImage(band4Loader, 's_' + colors[3] + '.png');
        }
    }
}
