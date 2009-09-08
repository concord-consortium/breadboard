function initActivity() {
    document.sparks_activity = new ResistorActivity();
}

function ResistorActivity() {
    flash = getFlashMovie('resistor_colors');
    this.resistor = new Resistor();
    this.resistor.randomize();
    console.log('Resistance=' + this.resistor.value);
    console.log('Tolerance=' + this.resistor.tolerance * 100 + '%');
}
