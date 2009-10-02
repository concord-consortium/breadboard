package org.concord.sparks.circuit
{
    import flash.display.Graphics;
    import flash.display.Loader;
    import flash.display.MovieClip;
    import flash.display.Shape;
    import flash.events.IOErrorEvent;
    import flash.geom.Point;
    import flash.net.URLRequest;
    
    public class Resistor
    {
        var parent;
        var root;
        var displayObject:MovieClip;
        
        var value:Number;
        
        var x = 430;
        var y = 200;
        var width = 260;
        var height = 80;
        
        public var end1 = new ResistorEnd('resistor_end1', 536, 163);
        public var end2 = new ResistorEnd('resistor_end2', 812, 161);
        
        public var snapRadius = 35;
        
        var highlightShape1:Shape;
        var highlightShape2:Shape;
        
        var band1Loader:Loader = new Loader(); 
        var band2Loader:Loader = new Loader(); 
        var band3Loader:Loader = new Loader();
        var band4Loader:Loader = new Loader();
        
        var colors = [];
        
        public function Resistor(parent, root) {
            this.parent = parent;
            this.root = root;
            displayObject = root['resistor_mc'];
            
            displayObject.band1.addChild(band1Loader);
            displayObject.band2.addChild(band2Loader);
            displayObject.band3.addChild(band3Loader);
            displayObject.band4.addChild(band4Loader);
            
            highlightShape1 = new Shape();
            highlightShape1.visible = false;
            parent.addChild(highlightShape1);
            
            highlightShape2 = new Shape();
            highlightShape2.visible = false;
            parent.addChild(highlightShape2);
            
            setLabel('red', 'white', 'blue', 'black');
            drawHighlights();
        }
        
        public function show() {
            displayObject.visible = true;
        }
        
        public function hide() {
            displayObject.visible = false;
        }
        
        public function isVisible():Boolean {
            return displayObject.visible;
        }
        
        public function getColors() {
            return colors;
        }
        
        public function setLabel(color1, color2, color3, color4):void {
            trace('Enter setLabel');
            colors = [color1, color2, color3, color4];

            loadBandImage(band1Loader, 't_' + color1 + '.png');
            loadBandImage(band2Loader, 's_' + color2 + '.png');
            loadBandImage(band3Loader, 's_' + color3 + '.png');
            loadBandImage(band4Loader, 's_' + color4 + '.png');
        }
        
        private function loadBandImage(loader:Loader, fname:String):void {
            var s = 'images/resistor/' + fname;
            trace('path=' + s);
            try {
                var req:URLRequest = new URLRequest(s);
                loader.load(req);
                trace('Loaded ' + s);
            }
            catch (e:IOErrorEvent) {
                trace("Failed to load " + s);
            }
        }
        
        private function drawHighlights():void {
            drawHighlightCircle(highlightShape1.graphics, end1.x, end1.y);
            drawHighlightCircle(highlightShape2.graphics, end2.x, end2.y);
        }
        
        private function drawHighlightCircle(g:Graphics, x:Number, y:Number) {
            g.lineStyle(1, 0x000000, 0.0);
            g.beginFill(0xcc00ee, 0.15);
            g.drawCircle(x, y, snapRadius);
        }
        
        public function checkHighlight(lead:Point) {
            if (distance(lead.x, lead.y, end1.x, end1.y) < snapRadius && isVisible()) {
                highlightShape1.visible = true;
            }
            else {
                highlightShape1.visible = false;
            }
            if (distance(lead.x, lead.y, end2.x, end2.y) < snapRadius && isVisible()) {
                highlightShape2.visible = true;
            }
            else {
               highlightShape2.visible = false;
            }
        }
        
        public function removeHighlights() {
            highlightShape1.visible = false;
            highlightShape2.visible = false;
        }
        
        private function distance(x1:Number, y1:Number, x2:Number, y2:Number) {
            return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        }
        
     }
}
