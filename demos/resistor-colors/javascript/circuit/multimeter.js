function Multimeter()
{
    this.redLeadConnection = null;
    this.blackLeadConnection = null;
    this.dialPosition = 'acv_750'
    
    this.update = function() {
        console.log('ENTER update');
        var resistor = getActivity().resistor;
        console.log('Resistance=' + resistor.realValue);
        
        if (this.redLeadConnection != null && this.blackLeadConnection != null &&
                this.redLeadConnection != this.blackLeadConnection) {
            
            var text = '';
            var value = resistor.realValue;
            console.log('pos=' + this.dialPosition + ' val=' + value);
            if (this.dialPosition == 'r_200' && value < 99.95) {
                text = (Math.round(value * 10) * 0.1).toString();
                text = this.formatDecimalString(text, 3, 1);
            }
            else if (this.dialPosition == 'r_2000' && value < 999.5) {
                text = Math.round(value).toString();
                text = this.formatDecimalString(text, 3, 0);
            }
            else if (this.dialPosition == 'r_20k' && value < 9995) {
                text = (Math.round(value * 0.1) * 0.01).toString();
                text = this.formatDecimalString(text, 3, 2);
            }
            else if (this.dialPosition == 'r_200k' && value < 99950) {
                text = (Math.round(value * 0.01) * 0.1).toString();
                text = this.formatDecimalString(text, 3, 1);
            }
            else if (this.dialPosition == 'r_2000k' && value < 999500) {
                text = Math.round(value * 0.001).toString();
                text = this.formatDecimalString(text, 3, 0);
            }
            else {
                text = '--';
            }
            console.log('text=' + text);
            sendCommand('set_multimeter_display', text);
        }
        else {
            sendCommand('set_multimeter_display', '--');
        }
    }
    
    // Pad 0's to the number text
    // sig: number of significant digits
    // dec: number of digits after decimal points
    this.formatDecimalString = function(s, sig, dec) {
        var pointLoc = s.indexOf('.');
        var decLen = pointLoc == -1 ? 0 : s.substring(pointLoc).length;
        if (decLen == 0) {
            s = s.concat('.');
        }
        for (var i = 0; i < dec - decLen; ++i) {
            s = s.concat('0');
        }
        for (var i = 0; i < sig - s.length + 1; ++i) {
            s = '0' + s;
        }
        return s;
    }
}
