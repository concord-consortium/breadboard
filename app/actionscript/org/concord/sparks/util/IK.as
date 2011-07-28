package org.concord.sparks.util
{
    import fl.ik.IKJoint;
    
    public class IK
    {
        // Traverse the list of joints and get the last one.
        // Assumes each joint has only one child.
        public static function getTailJoint(joint:IKJoint):IKJoint {
            if (joint.numChildren < 1) {
                return joint;
            }
            return getTailJoint(joint.getChildAt(0));
        }
    }
}
