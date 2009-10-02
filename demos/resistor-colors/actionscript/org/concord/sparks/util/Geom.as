package org.concord.sparks.util
{
    import flash.geom.Point;
    
    public class Geom
    {
        // 2D Euclidean distance between two points
        public static function distance(p1:Point, p2:Point) {
            return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
        }
    }
}
