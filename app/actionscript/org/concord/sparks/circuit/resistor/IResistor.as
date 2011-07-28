package org.concord.sparks.circuit.resistor
{
    public interface IResistor
    {
        function show():void;
        function hide():void;
        function isVisible():Boolean;
        function getColors():Array;
        function setColors(colors:Array):void;
        function getLeads():Array;
    }
}
