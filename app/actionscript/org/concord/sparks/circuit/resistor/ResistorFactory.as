package org.concord.sparks.circuit.resistor
{
    public class ResistorFactory
    {
        public static function create4bandResistor(parent):IResistor {
            return new Resistor4band(parent);
        }
        
        public static function create5bandResistor(parent):IResistor {
            return new Resistor5band(parent);
        }
    }
}
