// Various misc. trial code

import flash.display.Loader;
import flash.external.ExternalInterface;
import flash.net.URLRequest;

trace('my.as this=' + this)


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

trace('Display List:')
traceDisplayList(this.stage);


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

