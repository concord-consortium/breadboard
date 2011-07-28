package org.concord.sparks.util
{
    import flash.display.DisplayObject;
    import flash.geom.Point;
    
    public class Display
    {
        public static function localToStage(obj:DisplayObject, point:Point) {
            if (obj === obj.stage) {
                return point;
            }
            else {
                return localToStage(obj.parent, new Point(point.x + obj.x, point.y + obj.y));
            }
        }
        
        // 2D Euclidean distance between two points
        public static function distance(p1:Point, p2:Point) {
            return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
        }
    }
}
