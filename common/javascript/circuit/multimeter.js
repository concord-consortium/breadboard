/* The following line (global) is for JSLint */
/*global console, jQuery, Flash */

/*
 * Digital Multimeter
 */
function Multimeter()
{
    this.mode = this.modes.ohmmeter;
    this.value = 0; //real value
    this.displayText = '       ';
    
    this.redProbeConnection = null;
    this.blackProbeConnection = null;
    this.redPlugConnection = null;
    this.blackPlugConnecton = null;
    this.dialPosition = 'acv_750';
    this.powerOn = false;
}

Multimeter.prototype =
{
    modes : { ohmmeter : 0, voltmeter : 1, ammeter : 2 },
    
    update : function() {
        console.log('ENTER update powerOn=', this.powerOn + ' ' + (typeof this.powerOn));
        this.value = jQuery.sparks.activity.resistor.getRealValue();
        this.updateDisplay();
    },
    
    updateDisplay : function() {
        if (!this.powerOn) {
            this.displayText = '       ';
            Flash.sendCommand('set_multimeter_display', '       ');
            return;
        }
        console.log('Multimeter.update: resistance=' + this.value + ' dialPosition=' + this.dialPosition);
        
        var text = '';
        if (this.allConnected()) {
            console.log('pos=' + this.dialPosition + ' val=' + this.value);
            if (this.dialPosition == 'r_200') {
                if (this.value < 199.95) {
                    text = (Math.round(this.value * 10) * 0.1).toString();
                    text = this.toDisplayString(text, 1);
                }
                else {
                    text = ' 1   . ';
                }
            }
            else if (this.dialPosition == 'r_2000' || this.dialPosition == 'diode') {
                if (this.value < 1999.5) {
                    text = Math.round(this.value).toString();
                    text = this.toDisplayString(text, 0);
                }
                else {
                    text = ' 1     ';
                }
            }
            else if (this.dialPosition == 'r_20k') {
                if (this.value < 19995) {
                    text = (Math.round(this.value * 0.1) * 0.01).toString();
                    text = this.toDisplayString(text, 2);
                }
                else {
                    text = ' 1 .   ';
                }
            }
            else if (this.dialPosition == 'r_200k') {
                if (this.value < 199950) {
                    text = (Math.round(this.value * 0.01) * 0.1).toString();
                    text = this.toDisplayString(text, 1);
                }
                else {
                    text = ' 1   . ';
                }
            }
            else if (this.dialPosition == 'r_2000k') {
                if (this.value < 1999500) {
                    text = Math.round(this.value * 0.001).toString();
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
        Flash.sendCommand('set_multimeter_display', text);
        this.displayText = text;
    },
    
    toDisplayString : function(s, dec) {
        //debug('s1=' + s + ' dec=' + dec);
        var i;
        var sign = s.charAt(0) == '-' ? s.charAt(0) : ' ';
        s = s.replace('-', '');
        
        //debug('s2=' + s);
        var pointLoc = s.indexOf('.');
        var decLen = pointLoc == -1 ? 0 : s.substring(pointLoc+1).length;
        if (decLen === 0) {
            s = s.concat('.');
        }
        //debug('s3=' + s);
        if (dec < decLen) {
            s = s.substring(0, pointLoc + dec + 1);
        }
        else {
            for (i = 0; i < dec - decLen; ++i) {
                s = s.concat('0');
            }
        }
        //debug('s4=' + s);
        s = s.replace('.', '');
        //debug('s5=' + s);
        var len = s.length;
        if (len < 4) {
            for (i = 0; i < 3 - len; ++i) {
                s = '0' + s;
            }
            s = ' ' + s;
        }
        //debug('s6=' + s);
        
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
        //debug('s7=' + s);
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
        if (decLen === 0) {
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
    
    getDisplayText : function() {
        return this.displayText;
    },

    /*
     * Return value to be shown under optimal setting.
     * This value is to be compared with the student answer for grading.
     *
     * Take three significant digits, four if the first digit is 1.
     */
    makeDisplayText : function(value) {
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
        return this.redProbeConnection !== null && 
            this.blackProbeConnection !== null &&
            this.redProbeConnection !== this.blackProbeConnection &&
            (this.redPlugConnection === 'voma_port' &&
             this.blackPlugConnection === 'common_port' ||
             this.redPlugConnection === 'common_port' &&
             this.blackPlugConnection === 'voma_port') &&
            this.powerOn;
    }
};
