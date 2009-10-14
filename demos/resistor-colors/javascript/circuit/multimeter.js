function Multimeter() {
}
Multimeter.prototype =
{
    redProbeConnection : null,
    blackProbeConnection : null,
    redPlugConnection : null,
    blackPlugConnecton : null,
    dialPosition : 'acv_750',
    powerOn : false,
    
    update : function() {
        console.log('ENTER update powerOn=', this.powerOn + ' ' + (typeof this.powerOn));
        
        if (!this.powerOn) {
            sendCommand('set_multimeter_display', '       ');
            return;
        }
        
        var resistor = jQuery.sparks.activity.resistor;
        console.log('Multimeter.update: resistance=' + resistor.realValue + ' dialPosition=' + this.dialPosition);
        
        var text = '';
        if (this.allConnected()) {
            var value = resistor.realValue;
            console.log('pos=' + this.dialPosition + ' val=' + value);
            if (this.dialPosition == 'r_200') {
                if (value < 199.95) {
                    text = (Math.round(value * 10) * 0.1).toString();
                    text = this.toDisplayString(text, 1);
                }
                else {
                    text = ' 1   . ';
                }
            }
            else if (this.dialPosition == 'r_2000' || this.dialPosition == 'diode') {
                if (value < 1999.5) {
                    text = Math.round(value).toString();
                    text = this.toDisplayString(text, 0);
                }
                else {
                    text = ' 1     ';
                }
            }
            else if (this.dialPosition == 'r_20k') {
                if (value < 19995) {
                    text = (Math.round(value * 0.1) * 0.01).toString();
                    text = this.toDisplayString(text, 2);
                }
                else {
                    text = ' 1 .   ';
                }
            }
            else if (this.dialPosition == 'r_200k') {
                if (value < 199950) {
                    text = (Math.round(value * 0.01) * 0.1).toString();
                    text = this.toDisplayString(text, 1);
                }
                else {
                    text = ' 1   . ';
                }
            }
            else if (this.dialPosition == 'r_2000k') {
                if (value < 1999500) {
                    text = Math.round(value * 0.001).toString();
                    text = this.toDisplayString(text, 0);
                }
                else {
                    text = ' 1     ';
                }
            }
            else if (this.dialPosition == 'dcv_200m' || this.dialPosition == 'dcv_200' ||
                    this.dialPosition == 'acv_200' || this.dialPosition == 'p_9v' ||
                    this.dialPosition == 'dca_200mc' || this.dialPosition == 'dca_200m') {
                text = '  0 0.0';
            }
            else if (this.dialPosition == 'dcv_2000m' || this.dialPosition == 'dca_2000mc' ||
                    this.dialPosition == 'hfe') {
                text = '  0 0 0';
            }
            else if (this.dialPosition == 'dcv_20' || this.dialPosition == 'dca_20m' ||
                    this.dialPosition == 'c_10a') {
                text = '  0.0 0';
            }
            else if (this.dialPosition == 'dcv_1000' || this.dialPosition == 'acv_750') {
                text = 'h 0 0 0';
            }
            else {
                text = '       ';
            }
        }
        else {
            if (this.dialPosition == 'r_200') {
                text = ' 1   . ';
            }
            else if (this.dialPosition == 'r_2000' || this.dialPosition == 'diode') {
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
            else if (this.dialPosition == 'dcv_200m' || this.dialPosition == 'dcv_200' ||
                    this.dialPosition == 'acv_200' || this.dialPosition == 'p_9v' ||
                    this.dialPosition == 'dca_200mc' || this.dialPosition == 'dca_200m') {
                text = '  0 0.0';
            }
            else if (this.dialPosition == 'dcv_2000m' || this.dialPosition == 'dca_2000mc' ||
                    this.dialPosition == 'hfe') {
                text = '  0 0 0';
            }
            else if (this.dialPosition == 'dcv_20' || this.dialPosition == 'dca_20m' ||
                    this.dialPosition == 'c_10a') {
                text = '  0.0 0';
            }
            else if (this.dialPosition == 'dcv_1000' || this.dialPosition == 'acv_750') {
                text = 'h 0 0 0';
            }
            else {
                text = '       ';
            }
        }
        console.log('text=' + text);
        sendCommand('set_multimeter_display', text);
        this.displayValue = this.getDisplayValue(resistor.realValue);
    },
    
    toDisplayString : function(s, dec) {
        console.log('s1=' + s + ' dec=' + dec);
        var sign = s.charAt(0) == '-' ? s.charAt(0) : ' ';
        s = s.replace('-', '');
        
        console.log('s2=' + s);
        var pointLoc = s.indexOf('.');
        var decLen = pointLoc == -1 ? 0 : s.substring(pointLoc+1).length;
        if (decLen == 0) {
            s = s.concat('.');
        }
        console.log('s3=' + s);
        if (dec < decLen) {
            s = s.substring(0, pointLoc + dec + 1);
        }
        else {
            for (var i = 0; i < dec - decLen; ++i) {
                s = s.concat('0');
            }
        }
        console.log('s4=' + s);
        s = s.replace('.', '');
        console.log('s5=' + s);
        var len = s.length;
        if (len < 4) {
            for (var i = 0; i < 3 - len; ++i) {
                s = '0' + s;
            }
            s = ' ' + s;
        }
        console.log('s6=' + s);
        
        var dot1;
        var dot2;
        
        switch (dec) {
        case 0:
            dot1 = ' ';
            dot2 = ' ';
            break;
        case 1:
            dot1 = ' ';
            dot2 = '.';
            break;
        case 2:
            dot1 = '.';
            dot2 = ' ';
            break;
        default:
            console.log('ERROR: invalid dec ' + dec);
        }
        
        s = sign + s.substring(0, 2) + dot1 + s.charAt(2) + dot2 + s.charAt(3);
        console.log('s7=' + s);
        return s;
        
    },
    
    // Pad 0's to the number text
    // sig: number of significant digits
    // dec: number of digits after decimal points
    formatDecimalString : function(s, dec) {
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
    },

    /*
     * Return value to be shown under optimal setting.
     * This value is to be compared with the student answer for grading.
     *
     * Take three significant digits, four if the first digit is 1.
     */
    getDisplayValue : function(value) {
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
    },
    
    allConnected : function() {
        return this.redProbeConnection != null && 
            this.blackProbeConnection != null &&
            this.redProbeConnection != this.blackProbeConnection &&
            this.redPlugConnection == 'voma_port' &&
            this.blackPlugConnection == 'common_port';
    }
};
