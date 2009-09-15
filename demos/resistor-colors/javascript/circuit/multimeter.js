function Multimeter()
{
    this.redLeadConnection = null;
    this.blackLeadConnection = null;
    this.dialPosition = 'acv_750'
    this.powerOn = false;
    
    this.update = function() {
        console.log('ENTER update powerOn=', this.powerOn + ' ' + (typeof this.powerOn));
        
        if (!this.powerOn) {
            sendCommand('set_multimeter_display', '');
            return;
        }
        
        var resistor = getActivity().resistor;
        console.log('Resistance=' + resistor.realValue);
        
        if (this.redLeadConnection != null && this.blackLeadConnection != null &&
                this.redLeadConnection != this.blackLeadConnection) {
            
            var text = '';
            var value = resistor.realValue;
            console.log('pos=' + this.dialPosition + ' val=' + value);
            if (this.dialPosition == 'r_200' && value < 199.95) {
                text = (Math.round(value * 10) * 0.1).toString();
                text = this.formatDecimalString(text, 1);
            }
            else if (this.dialPosition == 'r_2000' && value < 1999.5) {
                text = Math.round(value).toString();
                text = this.formatDecimalString(text, 0);
            }
            else if (this.dialPosition == 'r_20k' && value < 19995) {
                text = (Math.round(value * 0.1) * 0.01).toString();
                text = this.formatDecimalString(text, 2);
            }
            else if (this.dialPosition == 'r_200k' && value < 199950) {
                text = (Math.round(value * 0.01) * 0.1).toString();
                text = this.formatDecimalString(text, 1);
            }
            else if (this.dialPosition == 'r_2000k' && value < 1999500) {
                text = Math.round(value * 0.001).toString();
                text = this.formatDecimalString(text, 0);
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
        
        this.displayValue = this.getDisplayValue(resistor.realValue);
    }
    
    // Pad 0's to the number text
    // sig: number of significant digits
    // dec: number of digits after decimal points
    this.formatDecimalString = function(s, dec) {
        console.log('s=' + s + ' dec=' + dec);
        var pointLoc = s.indexOf('.');
        console.log('pointLoc=' + pointLoc);
        var decLen = pointLoc == -1 ? 0 : s.substring(pointLoc+1).length;
        console.log('decLen=' + decLen);
        if (decLen == 0) {
            s = s.concat('.');
        }
        if (dec < decLen) {
            s = s.substring(0, pointLoc + dec + 1);
        }
        else {
            for (var i = 0; i < dec - decLen; ++i) {
                s = s.concat('0');
            }
        }
        console.log('out=' + s);
        return s;
    }

      /*
     * Return value to be shown under optimal setting.
     * This value is to be compared with the student answer for grading.
     *
     * Take three significant digits, four if the first digit is 1.
     */
    this.getDisplayValue = function(value) {
        var text;
        if (value < 199.95) {
            text = (Math.round(value * 10) * 0.1).toString();
            text = this.formatDecimalString(text, 1);
        }
        else if (value < 1999.5) {
            text = Math.round(value).toString();
            text = this.formatDecimalString(text, 0);
        }
        else if (value < 19995) {
            text = (Math.round(value * 0.1) * 0.01).toString();
            text = this.formatDecimalString(text, 2);
        }
        else if (value < 199950) {
            text = (Math.round(value * 0.01) * 0.1).toString();
            text = this.formatDecimalString(text, 1);
        }
        else if (value < 1999500) {
            text = Math.round(value * 0.001).toString();
            text = this.formatDecimalString(text, 0);
        }
        else {
            text = 'NaN';
        }
        return parseFloat(text);
    }
}
