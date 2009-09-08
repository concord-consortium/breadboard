package org.concord.sparks.circuit
{
    import flash.display.Graphics;
    import flash.display.Shape;
    
    public class Resistor
    {
        const RED = 0xe94023;
        const BROWN = 0x9d611f;
        const ORANGE = 0xf4b53d;
        const YELLOW = 0xfff950;
        const GREEN = 0xb5d058;
        const BLUE = 0x80a9eb;
        const VIOLET = 0xe3a2ed;
        const WHITE = 0xffffff;
        const GRAY = 0xe3a2ed;
        const BLACK = 0x000000;
        const GOLD = 0xd5bf5e;
        const SILVER = 0xcbcbcb;
        const BG_COLOR = 0x00eeee;
        
        const ColorMap = { 'red' : RED, 'brown' : BROWN, 'orange' : ORANGE,
            'yellow' : YELLOW, 'green' : GREEN, 'blue' : BLUE,
            'violet' : VIOLET, 'white' : WHITE, 'gray' : GRAY, 'black': BLACK,
            'gold' : GOLD, 'silver': SILVER };
        
        private static var instance;
        
        var parent;
        var shape:Shape;
        var value:Number;
        //var colors = [BLACK, BLACK, BLACK, BLACK];
        var colors = [RED, GREEN, ORANGE, YELLOW];
        
        var x = 430;
        var y = 200;
        var width = 260;
        var height = 80;
        
        public var end1 = new ResistorEnd('resistor_end1', 430, 240);
        public var end2 = new ResistorEnd('resistor_end2', 690, 240);
        
        public var snapRadius = 20;
        
        var highlightShape1:Shape;
        var highlightShape2:Shape;
        
        public function Resistor(parent) {
            this.parent = parent;
            shape = new Shape();
            parent.addChildAt(shape, 0);
            
            highlightShape1 = new Shape();
            highlightShape1.visible = false;
            parent.addChild(highlightShape1);
            
            highlightShape2 = new Shape();
            highlightShape2.visible = false;
            parent.addChild(highlightShape2);
            
            drawColorBands();
            drawHighlights();
        }
        
        public function setLabel(color1, color2, color3, color4) {
            trace('ENTER setLabel');
            colors[0] = ColorMap[color1];
            colors[1] = ColorMap[color2];
            colors[2] = ColorMap[color3];
            colors[3] = ColorMap[color4];
            trace('color4=' + color4);
            if (color4 == 'none') {
                colors[3] = 'none';
            }
            else {
                colors[3] = ColorMap[color4];
            }
            trace('colors[3]=' + colors[3]);
            trace('colors=' + colors);
            drawColorBands();
        }
        
        public function getColors() {
            return colors;
        }
        
        public function drawColorBands():void {
            trace('REDRAW colors=' + colors);
            var g = shape.graphics;
            var alpha = 1.0;
            g.lineStyle(2, 0x000000, alpha)
            g.beginFill(BG_COLOR);
            g.drawRect(x+2, y+2, width-4, height-4);
            g.beginFill(colors[0]);
            g.drawRect(x+20, y+2, 30, height-4);
            g.beginFill(colors[1]);
            g.drawRect(x+70, y+2, 30, height-4);
            g.beginFill(colors[2]);
            g.drawRect(x+120, y+2, 30, height-4);
            if (colors[3] == 'none') {
                alpha = 0.0;
            }
            else {
                alpha = 1.0;
            }
            g.lineStyle(2, 0x000000, alpha);
            g.beginFill(colors[3], alpha);
            g.drawRect(x+210, y+2, 30, height-4);
        }
        
        private function drawHighlights() {
            drawHighlightCircle(highlightShape1.graphics, end1.x, end1.y);
            drawHighlightCircle(highlightShape2.graphics, end2.x, end2.y);
        }
        
        private function drawHighlightCircle(g:Graphics, x:Number, y:Number) {
            g.lineStyle(1, 0x000000, 0.0);
            g.beginFill(0xdd00dd, 0.5);
            g.drawCircle(x, y, snapRadius);
        }
        
        // Set color labels
        public function setColors(band1, band2, band3, band4):void {
            colors = [band1, band2, band3, band4];
            drawColorBands();
        }
        
        // Set real resistance
        public function setValue(r):void {
            value = r;
        }

        public function checkHighlight(leadX:Number, leadY:Number) {
            if (distance(leadX, leadY, end1.x, end1.y) < snapRadius) {
                highlightShape1.visible = true;
            }
            else {
                highlightShape1.visible = false;
            }
            if (distance(leadX, leadY, end2.x, end2.y) < snapRadius) {
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
        
        public function doConnection() {
            
        }
        
        private function distance(x1:Number, y1:Number, x2:Number, y2:Number) {
            return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        }
     }
}
