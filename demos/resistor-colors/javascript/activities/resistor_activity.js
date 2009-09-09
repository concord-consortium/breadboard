function initActivity() {
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
    flash = getFlashMovie('resistor_colors');
    this.multimeter = new Multimeter();
    this.resistor = new Resistor();
    this.resistor.randomize();
    console.log(4);
    console.log('Nominal Resistance=' + this.resistor.nominalValue);
    console.log('Tolerance=' + this.resistor.tolerance * 100 + '%');
    console.log('Real Resistance=' + this.resistor.realValue);
}
