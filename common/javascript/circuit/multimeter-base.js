/* FILE multimeter-base.js */

(function () {

    var flash = sparks.flash;
    
    /*
     * Digital Multimeter
     * Base for the Centech DMM
     */
    sparks.circuit.MultimeterBase = function () {
    };

    sparks.circuit.MultimeterBase.prototype = {
            
        modes : { ohmmeter : 0, voltmeter : 1, ammeter : 2 },
        
        init: function () {
            this.mode = this.modes.ohmmeter;
            
            this.v_value = 0; //voltage value
            this.i_value = 0; //current value
            this.r_value = 0; //resistance value
            
            this.displayText = '       ';

            this.redProbeConnection = null;
            this.blackProbeConnection = null;
            this.redPlugConnection = null;
            this.blackPlugConnecton = null;
            this.dialPosition = 'acv_750';
            this.powerOn = false;
        },

        update : function () {
            console.log('ENTER MultimeterBase#update');
        },

        updateDisplay : function () {
            if (!this.powerOn) {
                this.displayText = '       ';
                flash.sendCommand('set_multimeter_display', '       ');
                return;
            }
            console.log('Multimeter.update: v=' + this.v_value + ' i=' + this.i_value + ' r=' + this.r_value + ' dial=' + this.dialPosition);

            var text = '';
            if (this.allConnected()) {
                if (this.dialPosition === 'dcv_20') {
                    if (this.v_value < 19.995) {
                        text = (Math.round(this.v_value * 100) * 0.01).toString();
                        text = this.toDisplayString(text, 2);
                    }
                    else {
                        text = ' 1 .   ';
                    }
                    
                }
                else if (this.dialPosition === 'r_200') {
                    if (this.r_value < 199.95) {
                        text = (Math.round(this.r_value * 10) * 0.1).toString();
                        text = this.toDisplayString(text, 1);
                    }
                    else {
                        text = ' 1   . ';
                    }
                }
                else if (this.dialPosition === 'r_2000' || this.dialPosition === 'diode') {
                    if (this.r_value < 1999.5) {
                        text = Math.round(this.r_value).toString();
                        text = this.toDisplayString(text, 0);
                    }
                    else {
                        text = ' 1     ';
                    }
                }
                else if (this.dialPosition === 'r_20k') {
                    if (this.r_value < 19995) {
                        text = (Math.round(this.r_value * 0.1) * 0.01).toString();
                        text = this.toDisplayString(text, 2);
                    }
                    else {
                        text = ' 1 .   ';
                    }
                }
                else if (this.dialPosition === 'r_200k') {
                    if (this.r_value < 199950) {
                        text = (Math.round(this.r_value * 0.01) * 0.1).toString();
                        text = this.toDisplayString(text, 1);
                    }
                    else {
                        text = ' 1   . ';
                    }
                }
                else if (this.dialPosition === 'r_2000k') {
                    if (this.r_value < 1999500) {
                        text = Math.round(this.r_value * 0.001).toString();
                        text = this.toDisplayString(text, 0);
                    }
                    else {
                        text = ' 1     ';
                    }
                } 
                else if (this.dialPosition === 'dca_200mc') {
                  var imc = this.i_value * 1000000
                  if (imc < 195){
                    text = (Math.round(imc * 100) * 0.01).toString();
                    text = this.toDisplayString(text, 1);
                  }
                  else {
                      text = ' 1     ';
                  }
                }
                else if (this.dialPosition === 'dca_2000mc') {
                  var imc = this.i_value * 1000000
                  if (imc < 1950){
                    text = (Math.round(imc * 10) * 0.1).toString();
                    text = this.toDisplayString(text, 0);
                  }
                  else {
                      text = ' 1     ';
                  }
                }
                else if (this.dialPosition === 'dca_20m') {
                  var im = this.i_value * 1000
                  if (im < 19.5){
                    text = (Math.round(im * 100) * 0.01).toString();
                    text = this.toDisplayString(text, 2);
                  }
                  else {
                      text = ' 1     ';
                  }
                }
                else if (this.dialPosition === 'dca_200m') {
                  var im = this.i_value * 1000
                  if (im < 195){
                    text = (Math.round(im * 10) * 0.1).toString();
                    text = this.toDisplayString(text, 1);
                  }
                  else {
                      text = ' 1     ';
                  }
                }
                else if (this.dialPosition === 'dcv_200m' || this.dialPosition === 'dcv_200' ||
                        this.dialPosition === 'acv_200' || this.dialPosition === 'p_9v' ||
                        this.dialPosition === 'dca_200mc' || this.dialPosition === 'dca_200m') {
                    text = '  0 0.0';
                }
                else if (this.dialPosition === 'dcv_2000m' || this.dialPosition === 'dca_2000mc' ||
                        this.dialPosition === 'hfe') {
                    text = '  0 0 0';
                }
                else if (this.dialPosition === 'dcv_20' || this.dialPosition === 'dca_20m' ||
                        this.dialPosition === 'c_10a') {
                    text = '  0.0 0';
                }
                else if (this.dialPosition === 'dcv_1000' || this.dialPosition === 'acv_750') {
                    text = 'h 0 0 0';
                }
                else {
                    text = '       ';
                }
            }
            else {    // if not connected
                if (this.dialPosition === 'dcv_20') {
                    text = '  0.0 0';
                }
                else if (this.dialPosition === 'r_200') {
                    text = ' 1   . ';
                }
                else if (this.dialPosition === 'r_2000' || this.dialPosition === 'diode') {
                    text = ' 1     ';
                }
                else if (this.dialPosition === 'r_20k') {
                    text = ' 1 .   ';
                }
                else if (this.dialPosition === 'r_200k') {
                    text = ' 1   . ';
                }
                else if (this.dialPosition === 'r_2000k') {
                    text = ' 1     ';
                }
                else if (this.dialPosition === 'dcv_200m' || this.dialPosition === 'dcv_200' ||
                        this.dialPosition === 'acv_200' || this.dialPosition === 'p_9v' ||
                        this.dialPosition === 'dca_200mc' || this.dialPosition === 'dca_200m') {
                    text = '  0 0.0';
                }
                else if (this.dialPosition === 'dcv_2000m' || this.dialPosition === 'dca_2000mc' ||
                        this.dialPosition === 'hfe') {
                    text = '  0 0 0';
                }
                else if (this.dialPosition === 'dcv_20' || this.dialPosition === 'dca_20m' ||
                        this.dialPosition === 'c_10a') {
                    text = '  0.0 0';
                }
                else if (this.dialPosition === 'dcv_1000' || this.dialPosition === 'acv_750') {
                    text = 'h 0 0 0';
                }
                else {
                    text = '       ';
                }
            }
            console.log('text=' + text);
            flash.sendCommand('set_multimeter_display', text);
            this.displayText = text;
        },

        toDisplayString : function (s, dec) {
            //console.log('s1=' + s + ' dec=' + dec);
            var i;
            var sign = s.charAt(0) === '-' ? s.charAt(0) : ' ';
            s = s.replace('-', '');

            //console.log('s2=' + s);
            var pointLoc = s.indexOf('.');
            var decLen = pointLoc == -1 ? 0 : s.substring(pointLoc+1).length;
            if (decLen === 0) {
                s = s.concat('.');
            }
            //console.log('s3=' + s);
            if (dec < decLen) {
                s = s.substring(0, pointLoc + dec + 1);
            }
            else {
                for (i = 0; i < dec - decLen; ++i) {
                    s = s.concat('0');
                }
            }
            //console.log('s4=' + s);
            s = s.replace('.', '');
            //console.log('s5=' + s);
            var len = s.length;
            if (len < 4) {
                for (i = 0; i < 3 - len; ++i) {
                    s = '0' + s;
                }
                s = ' ' + s;
            }
            //console.log('s6=' + s);

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
            //console.log('s7=' + s);
            return s;

        },

        // Pad 0's to the number text
        // sig: number of significant digits
        // dec: number of digits after decimal points
        formatDecimalString : function (s, dec) {
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

        getDisplayText : function () {
            return this.displayText;
        },

        /*
         * Return value to be shown under optimal setting.
         * This value is to be compared with the student answer for grading.
         *
         * Take three significant digits, four if the first digit is 1.
         */
        makeDisplayText : function (value) {
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

        allConnected : function () {
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

})();
