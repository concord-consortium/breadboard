package org.concord.sparks.activities
{
    import flash.external.ExternalInterface;
    
    import org.concord.sparks.Activity;
    import org.concord.sparks.circuit.Multimeter;
    import org.concord.sparks.circuit.Resistor;
    
    public class ResistorColors extends Activity
    {
        public var multimeter;
        public var resistor;
        
        public function ResistorColors(name:String, parent, root):void {
            super(name, parent, root);
            multimeter = new Multimeter(root);
            resistor = new Resistor(parent);
            ExternalInterface.call('initActivity');
        }
        
        public override function processMessageFromJavaScript(args) {
            root['received_ti'].text = "From JavaScript: " + args.join(', ');
            var command:String = args[0];
            switch (command) {
                case "set_resistor_label":
                    resistor.setLabel(args[1][0], args[1][1], args[1][2], args[1][3]);
                    return resistor.getColors().join('|');
            }
            return "UNKNOWN";
        }
    }
}
