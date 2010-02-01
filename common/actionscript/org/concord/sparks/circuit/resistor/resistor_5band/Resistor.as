package org.concord.sparks.circuit.resistor.resistor_5band
{
    import flash.display.Graphics;
    import flash.display.Loader;
    import flash.display.MovieClip;
    import flash.display.Shape;
    import flash.events.MouseEvent;
    import flash.events.IOErrorEvent;
    import flash.geom.Point;
    import flash.net.URLRequest;
    
    import org.concord.sparks.util.Assert;
    
    public class Resistor
    {
        // Instance names in Flash movie
        public static var names = {
            resistorContainer : 'resistor_5band_mc',
            leftLeadRollOver : 'resistor_rollover',
            rightLeadRollOver : 'resistor_rollover_right',
            leftLeadEngaged : 'probe_engaged',
            rightLeadEngaged : 'probe_engaged_right'
        };
        
        var root;
        var container:MovieClip;
        
        var value:Number;
        
        var x = 430;
        var y = 200;
        var width = 260;
        var height = 80;
        
        public var lead1:ResistorLead;
        public var lead2:ResistorLead;
        
        public var snapRadius = 35;
        
        var band1Loader:Loader = new Loader(); 
        var band2Loader:Loader = new Loader(); 
        var band3Loader:Loader = new Loader();
        var band4Loader:Loader = new Loader();
        var band5Loader:Loader = new Loader();
        
        var colors = [];
        
        public function Resistor(root) {
            this.root = root;

            // Assert the root has the named objects
            for each (var name:String in names) {
                Assert.assertContains(root, name);
            }
            
            lead1 = new ResistorLead('resistor_lead1', new Point(591, 104),
                root[names.leftLeadRollOver], root[names.leftLeadEngaged]); 
            lead2 = new ResistorLead('resistor_lead2', new Point(867, 102),
                root[names.rightLeadRollOver], root[names.rightLeadEngaged]);
            
            container = root[names.resistorContainer];

            container.band1.addChild(band1Loader);
            container.band2.addChild(band2Loader);
            container.band3.addChild(band3Loader);
            container.band4.addChild(band4Loader);
            container.band5.addChild(band5Loader);
            
            setLabel('red', 'white', 'blue', 'black', 'silver');
        }
        
        public function show() {
            container.visible = true;
        }
        
        public function hide() {
            container.visible = false;
        }
        
        public function isVisible():Boolean {
            return container.visible;
        }
        
        public function getColors() {
            return colors;
        }
        
        public function setLabel(color1, color2, color3, color4, color5):void {
            trace('Enter setLabel');
            this.colors = [color1, color2, color3, color4, color5];
            loadBandImage(band1Loader, 't_' + color1 + '.png');
            loadBandImage(band2Loader, 's_' + color2 + '.png');
            loadBandImage(band3Loader, 's_' + color3 + '.png');
            loadBandImage(band4Loader, 's_' + color4 + '.png');
            loadBandImage(band5Loader, 's_' + color5 + '.png');
        }
        
        private function loadBandImage(loader:Loader, fname:String):void {
            var s = '/sparks-content/common/images/resistor/' + fname;
            //trace('path=' + s);
            try {
                var req:URLRequest = new URLRequest(s);
                loader.load(req);
                //trace('Loaded ' + s);
            }
            catch (e:IOErrorEvent) {
                trace("Failed to load " + s);
            }
        }
    }
}
