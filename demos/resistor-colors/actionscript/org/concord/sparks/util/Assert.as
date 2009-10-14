package org.concord.sparks.util
{
    import fl.ik.IKArmature;
    import fl.ik.IKManager;
    
    public class Assert
    {
        // Throw error if object[name] is undefined
        public static function assertContains(object, name:String):void {
            if (typeof object[name] == 'undefined') {
                throw new Error('Object ' + object + " doesn't have property [" + name + ']');
            }
        }
        
        // Throw error if IKArmature with the name doesn't exist
        public static function assertArmature(name) {
            var armature = IKManager.getArmatureByName(name);
            if (typeof armature == 'undefined') {
                throw new Error('No armature named [' + name + ']');
            }
        }
    }
}
