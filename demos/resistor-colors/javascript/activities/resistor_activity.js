/* 
 * This function gets called from Flash after Flash has set up the external
 * interface. Therefore all code that sends messages to Flash should be
 * initiated from this function.
 */
function initActivity() {
    // Create a dummy console.log when not run in Firebug
    if (typeof console == 'undefined') {
        console = { log: function() {} };
    }
    console.log('ENTER initActivity');
    jQuery.sparks.activity = new ResistorActivity();
    
    if (jQuery.sparks.debug_mode == 'multimeter') {
        var activity = jQuery.sparks.activity;
        sendCommand('set_debug_mode', 'multimeter');
        showRccDebugInfo(activity);
    }
}

function ResistorActivity() {
    console.log('ENTER ResistorActivity');
    this.assessment = new Assessment(this);
    
    var flash = getFlashMovie('resistor_colors');
    this.multimeter = new Multimeter();
    this.resistor = new Resistor();

    console.log('Nominal Resistance=' + this.resistor.nominalValue);
    console.log('Tolerance=' + this.resistor.tolerance * 100 + '%');
    console.log('Real Resistance=' + this.resistor.realValue);
    
    // Re-initialize the circuit settings for a new set of questions
    this.resetCircuit = function() {
        console.log('ENTER ResistorActivity.resetCircuit');
        this.resistor.randomize();
        sendCommand('reset_circuit');
        this.multimeter.update();
    }
}
