function Resistor()
{
    this.value = 0.0; //resistance value
    this.tolerance = 0.0; //tolerance value
    
    this.colorMap = { 0 : 'black', 1 : 'brown', 2 : 'red', 3 : 'orange',
        4 : 'yellow', 5 : 'green', 6 : 'blue', 7 : 'violet', 8 : 'gray',
        9 : 'white' };
    this.colorMap[-1] = 'gold';
    this.colorMap[-2] = 'silver'
        
    this.toleranceColorMap = { 0.01 : 'brown', 0.02 : 'red', 5e-3 : 'green',
        2.5e-3 : 'blue', 1e-3 : 'violet', 5e-4 : 'gray', 5e-2 : 'gold',
        0.1 : 'silver', 0.2 : 'none' };
    this.toleranceValues = [ 0.01, 0.02, 5e-3, 2.5e-3, 1e-3, 5e-4, 5e-2,
        0.1, 0.2];
    
    this.randomize = function() {
        var colors = [];
        
        var band1 = this.randInt(1, 9);
        colors[0] = this.colorMap[band1];
        
        var band2 = this.randInt(0, 9);
        colors[1] = this.colorMap[band2];
        
        var base = band1 * 10 +  band2; // 10..99
        
        // Multiplier: 10^-2..10^9
        var pwr = this.randInt(-2, 9);
        colors[2] = this.colorMap[pwr];
        this.value = base * Math.pow(10, pwr);
        
        var ix = this.randInt(0, 8);
        this.tolerance = this.toleranceValues[ix];
        colors[3] = this.toleranceColorMap[this.tolerance];
        
        console.log('sending colors=' + colors.join('|'));
        
        sendCommand('set_resistor_value', this.value);
        sendCommand('set_resistor_tolerance', this.tolerance);
        sendCommand('set_resistor_label', colors);
    }
    
    this.randInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
