package org.concord.sparks.circuit.resistor
{
    import flash.display.Loader;
    import flash.display.MovieClip;
    import flash.events.ErrorEvent;
    import flash.events.Event;
    import flash.events.IOErrorEvent;
    import flash.geom.Point;
    import flash.net.URLRequest;

    import org.concord.sparks.Activity;
    
    /*
     * Base class for resistors
     */
    public class Resistor implements IResistor
    {
        public var lead1:ResistorLead;
        public var lead2:ResistorLead;
        
        protected var activity:Activity;
        protected var parent;
        protected var swfURL:String; //URL of external swf for the resistor
        protected var container:MovieClip; //MovieClip that contains all the resistor components
        protected var imagePath:String;
        protected var loader:Loader;
        protected var colors:Array = [];
        
        public function Resistor(activity, swfPath, imagePath) {
            this.activity = activity;
            this.swfURL = activity.getRootPath() + swfPath;
            this.imagePath = activity.getRootPath() + imagePath;
            parent = activity.getRoot().target;
             
            loader = new Loader();
            parent.addChild(loader);
            loader.contentLoaderInfo.addEventListener(Event.INIT, swfLoaded);
            
            try { 
                loader.load(new URLRequest(swfURL));
                trace('Loaded ' + swfURL);
            }
            catch (e:IOErrorEvent) {
                trace('Failed to load ' + swfURL);
            }
        }
        
        public function setContainer(container):void {
            this.container = container;
            parent.addChild(container);
        }
        
        public function show():void {
            container.visible = true;
        }
        
        public function hide():void {
            container.visible = false;
        }
        
        public function isVisible():Boolean {
            return container.visible;
        }
        
        public function getColors():Array {
            return colors;
        }

        public function setColors(colors:Array):void {
            throw new ErrorEvent(ErrorEvent.ERROR, false, false,
                "NOT IMPLEMENTED: setColors on Resistor");
        }
        
        protected function loadBandImage(loader:Loader, fname:String):void {
            var s = this.imagePath + '/' + fname;
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
        
        protected function swfLoaded(e:Event):void {
            throw new ErrorEvent(ErrorEvent.ERROR, false, false,
                "NOT IMPLEMENTED: swfLoaded on Resistor");
        }
        
        public function getLeads():Array {
            return [lead1, lead2];
        }
    }
}
