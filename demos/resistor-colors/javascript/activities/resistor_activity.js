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
    window.sparks_activity = new ResistorActivity();
}

function getActivity() {
    return window.sparks_activity;
}

function ResistorActivity() {
    console.log('ENTER ResistorActivity');
    
    var flash = getFlashMovie('resistor_colors');
    this.multimeter = new Multimeter();
    this.resistor = new Resistor();
    this.resistor.randomize();

    console.log('Nominal Resistance=' + this.resistor.nominalValue);
    console.log('Tolerance=' + this.resistor.tolerance * 100 + '%');
    console.log('Real Resistance=' + this.resistor.realValue);
}
