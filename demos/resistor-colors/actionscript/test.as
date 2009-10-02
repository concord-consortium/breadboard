// Various misc. trial code

import fl.ik.IKArmature;
import fl.ik.IKBone;
import fl.ik.IKJoint;
import fl.ik.IKManager;

import flash.display.Loader;
import flash.external.ExternalInterface;
import flash.net.URLRequest;

trace('my.as this=' + this)

// Print out the hierarchy of display objects
function traceDisplayList(container:DisplayObjectContainer, indentString:String = ""):void {
    var child:DisplayObject;
    trace(indentString + container, container.name);
    for (var i:uint=0; i < container.numChildren; i++) { 
        child = container.getChildAt(i); 
        if (container.getChildAt(i) is DisplayObjectContainer) { 
            traceDisplayList(DisplayObjectContainer(child), indentString + "    ") 
        } 
    } 
}

trace('Display List:');
traceDisplayList(this.stage);

function traceArmatures():void {
    for (var i = 0; i < IKManager.numArmatures; ++i) {
        var armature:IKArmature = IKManager.getArmatureAt(i);
        trace('Armature: ' + armature.name);
        var rootJoint:IKJoint = armature.rootJoint;
        traceJoint(rootJoint, 1);
    }
}

function traceJoint(joint:IKJoint, level:int):void {
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

trace('Armatures:');
traceArmatures();

/*
function clickSend(event:Event):void {
    var jsArgument:String = sending_ti.text;
    var result:Object = ExternalInterface.call("getTextFromFlash", jsArgument);

    received_ti.text = "Returned: " + result;
}
send_button.addEventListener(MouseEvent.CLICK, clickSend);
 */

/*
var request:URLRequest = new URLRequest("breadboard.swf");
var loader:Loader = new Loader();
loader.load(request);
addChild(loader);
swapChildren(loader, blue_circle);
*/

/*
function handleMouseDown(event:Event):void {
    blue_circle.startDrag();
}

function handleMouseUp(event:Event):void {
    blue_circle.stopDrag();
}

blue_circle.addEventListener(MouseEvent.MOUSE_DOWN, handleMouseDown);
blue_circle.addEventListener(MouseEvent.MOUSE_UP, handleMouseUp);
*/

