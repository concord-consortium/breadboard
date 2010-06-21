package org.concord.sparks.util {
    
    import fl.ik.IKArmature;
    import fl.ik.IKJoint;
    import fl.ik.IKManager;
    
    import flash.display.DisplayObject;
    import flash.display.DisplayObjectContainer;

    public class Debug {

        /**        
         * Print out the hierarchy of display objects
         * e.g. traceDisplayList(this.stage);
         */
        public static function traceDisplayList(container:DisplayObjectContainer, indentString:String = ""):void {
            var child:DisplayObject;
            trace(indentString + container, container.name);
            for (var i:uint=0; i < container.numChildren; i++) { 
                child = container.getChildAt(i); 
                if (container.getChildAt(i) is DisplayObjectContainer) { 
                    traceDisplayList(DisplayObjectContainer(child), indentString + "    ") 
                } 
            } 
        }

        public static function traceArmatures():void {
            for (var i = 0; i < IKManager.numArmatures; ++i) {
                var armature:IKArmature = IKManager.getArmatureAt(i);
                trace('Armature: ' + armature.name);
                var rootJoint:IKJoint = armature.rootJoint;
                traceJoint(rootJoint, 1);
            }
        }

        public static function traceJoint(joint:IKJoint, level:int):void {
            var s:String = '';
            for (var i = 0; i < level; ++i) {
                s += '  ';
            }
            trace(s + 'Joint: ' + joint.name + ' Bone: ' + joint.bone.name);
            for (var j = 0; j < joint.numChildren; ++j) {
                var child:IKJoint = joint.getChildAt(j);
                traceJoint(child, level + 1);
            }
        }

    }
}
