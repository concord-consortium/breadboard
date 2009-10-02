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
        
        var resistor = jQuery.sparks.activity.resistor;
        console.log('Multimeter.update: resistance=' + resistor.realValue + ' dialPosition=' + this.dialPosition);
        
        var text = '';
        if (this.redLeadConnection != null && this.blackLeadConnection != null &&
            this.redLeadConnection != this.blackLeadConnection)
        {
            var value = resistor.realValue;
            console.log('pos=' + this.dialPosition + ' val=' + value);
            if (this.dialPosition == 'r_200' && value < 199.95) {
                text = (Math.round(value * 10) * 0.1).toString();
                text = this.toDisplayString(text, 1);
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
                text = '       ';
            }
        }
        else {
            if (this.dialPosition == 'r_200') {
                text = ' 1   . ';
            }
            else if (this.dialPosition == 'r_2000') {
                text = ' 1     ';
            }
            else if (this.dialPosition == 'r_20k') {
                text = ' 1 .   ';
            }
            else if (this.dialPosition == 'r_200k') {
                text = ' 1   . ';
            }
            else if (this.dialPosition == 'r_2000k') {
                text = ' 1     ';
            }
            else {
                text = '       ';
            }
        }
        console.log('text=' + text);
        sendCommand('set_multimeter_display', text);
        this.displayValue = this.getDisplayValue(resistor.realValue);
    }
    
    this.toDisplayString = function(s, dec) {
        trace('s1=' + s);
        var sign = s[0] == '-' ? s[0] : ' ';
        s = s.replace('-', '');
        
        trace('s2=' + s);
        var pointLoc = s.indexOf('.');
        var decLen = pointLoc == -1 ? 0 : s.substring(pointLoc+1).length;
        if (decLen == 0) {
            s = s.concat('.');
        }
        trace('s3=' + s);
        if (dec < decLen) {
            s = s.substring(0, pointLoc + dec + 1);
        }
        else {
            for (var i = 0; i < dec - decLen; ++i) {
                s = s.concat('0');
            }
        }
        trace('s4=' + s);
        s = s.replace('.', '');
        trace('s5=' + s);
        var len = s.length;
        if (len < 4) {
            for (var i = 0; i < 3 - len; ++i) {
                s = '0' + s;
            }
            s = ' ' + s;
        }
        trace('s6=' + s);
        
        s = sign + s.substring[0, 2] + dot1 + s[2] + dot2 + s[3];
        trace('s7=' + s);
        return s;
        
    }
    
    // Pad 0's to the number text
    // sig: number of significant digits
    // dec: number of digits after decimal points
    this.formatDecimalString = function(s, dec) {
        //console.log('s=' + s + ' dec=' + dec);
        var pointLoc = s.indexOf('.');
        //console.log('pointLoc=' + pointLoc);
        var decLen = pointLoc == -1 ? 0 : s.substring(pointLoc+1).length;
        //console.log('decLen=' + decLen);
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
        //console.log('formatDecimalString: formatted=' + s);
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
            text = (Math.round(value * 0.1) * 10).toString();
        }
        else if (value < 199950) {
            text = (Math.round(value * 0.01) * 100).toString();
        }
        else if (value < 1999500) {
            text = (Math.round(value * 0.001) * 1000).toString();
        }
        else {
            text = 'NaN';
        }
        return parseFloat(text);
    }
}
