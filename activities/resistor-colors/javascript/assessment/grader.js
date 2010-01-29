/* The following line (global) is for JSLint */
/*global console, Unit */


function Grader(session)
{
    this.session = session;
    this.section = this.session.sections[0];
    this.questions =  this.section.questions;
    
    this.feedback = new Feedback();
    this.parser = new LogParser(session);
}

Grader.prototype =
{
    grade : function() {
        //console.log('ENTER Grader.grade');
        this.gradeReadingColorBands();
        this.gradeTolerance();
        this.gradeResistance();
        this.gradeToleranceRange();
        this.gradeWithinTolerance();
        this.gradeTime();
        this.gradeSettings();
        this.feedback.optimal_dial_setting = this.optimalDial(this.section.real_resistance);
        return this.feedback;
    },

    gradeReadingColorBands : function()
    {
        var question = this.questions[0];
        var feedback = this.feedback.rated_r_value;
        
        feedback.correct = false;
        feedback.points = 0;
        
        if (question.answer === null || isNaN(question.answer)) { return; }
        if (!Unit.ohmCompatible(question.unit)) { return; }
        
        var parsedValue = Unit.normalizeToOhms(question.answer, question.unit);
        
        console.log('parsedValue=' + parsedValue + ' correctValue=' + question.correct_answer);
        
        if(question.correct_answer != parsedValue){
            if (this.sameBeforeDot(question.correct_answer, parsedValue)) {
                if (this.semiCorrectDigits(question.correct_answer, parsedValue, 3)) {
                    feedback.points = 2;
                    return;
                }
            }
            else if (this.sameFirstSigDigits(question.correct_answer, parsedValue, 3)) {
                feedback.points = 10;
                return;
            }
            return;
        }
        feedback.points = 20;
        feedback.correct = true;
    },
    
    gradeResistance : function() {
        var question = this.questions[2];
        var feedback = this.feedback.measured_r_value;
        
        feedback.correct = false;
        feedback.points = 0;
        
        if (question.answer === null || isNaN(question.answer)) { return; }
        if (!Unit.ohmCompatible(question.unit)) { return; }
        
        var parsedValue = Unit.normalizeToOhms(question.correct_answer, question.unit);
        
        console.log('parsedValue=' + parsedValue + ' correctValue=' + question.correct_answer);
        
        if(question.correct_answer != parsedValue){
            if (this.semiAcceptable(question.correct_answer, parsedValue)) {
                feedback.points = 5;
            }
            return;
        }
        
        feedback.correct = true;
        feedback.points = 10;
    },
    
    gradeTolerance : function() {
        var question = this.questions[1];
        var feedback = this.feedback.rated_t_value;
        
        feedback.correct =false;
        feedback.points = 0;
        
        if (question.answer === null || isNaN(question.answer)) {
            return;
        }
        if (question.correct_answer != question.answer / 100.0){
            return;
        }
        
        feedback.correct = true;
        feedback.points = 5;
    },
    
    gradeToleranceRange : function()
    {
        //console.log('ENTER Grader.gradeToleranceRange');
        var question = this.questions[3];
        var feedback = this.feedback.t_range_value;
        var nominalResistance = this.section.nominal_resistance;
        var tolerance = this.section.tolerance;

        feedback.correct = false;
        feedback.points = 0;

        var correctMin = nominalResistance * (1 - tolerance);
        var correctMax = nominalResistance * (1 + tolerance);
        
        //console.log('nom=' + nominalResistance + ' tol=' + tolerance + ' min=' + correctMin + ' max=' + correctMax);
        
        question.correct_answer = [correctMin, correctMax];

        var min = question.answer[0];
        var max = question.answer[1];
        
        if (min === null || isNaN(min) || max === null || isNaN(max)) {
            return;
        }
        
        // Allow answers in reverse order
        if (min > max) {
            var tmp = min;
            min = max;
            max = tmp;
        }
        
        //console.log('correct min=' + correctMin + ' max=' + correctMax);
        //console.log('submitted min=' + min + ' max=' + max);
        
        if (!Unit.ohmCompatible(question.unit[0]) ||
            !Unit.ohmCompatible(question.unit[1]))
        {
            return;
        }
        
        var parsedMin = Unit.normalizeToOhms(min, question.unit[0]);
        var parsedMax = Unit.normalizeToOhms(max, question.unit[1]);
        
        if (this.equalWithTolerance(parsedMin, correctMin, 1e-5) &&
            this.equalWithTolerance(parsedMax, correctMax, 1e-5))
        {
            feedback.correct = true;
            feedback.points = 15;
        }
        
        if (MyMath.roundToSigDigits(correctMin, 3) ===
            MyMath.roundToSigDigits(parsedMin, 3) &&
            MyMath.roundToSigDigits(correctMax, 3) ===
            MyMath.roundToSigDigits(parsedMax, 3))
        {
            feedback.points = 10;
            return;
        }
        
        if (Math.abs(MyMath.getRoundedSigDigits(correctMin, 3) - 
                     MyMath.getRoundedSigDigits(parsedMin, 3)) <= 2 &&
            Math.abs(MyMath.getRoundedSigDigits(correctMax, 3) - 
                     MyMath.getRoundedSigDigits(parsedMax, 3)) <= 2)
        {
            feedback.points = 3;
            return;
        }
        return;
    },
    
    gradeWithinTolerance : function() {
        var question = this.questions[4];
        var feedback = this.feedback.within_tolerance;
        var correctAnswer;
        var nominalValue = this.section.nominal_resistance;
        var tolerance = this.section.tolerance;
        var displayValue = this.section.displayed_resistance;
        var allowance = nominalValue * tolerance;
        
        feedback.correct = false;
        feedback.points = 0;
        
        if (displayValue < nominalValue - allowance ||
            displayValue > nominalValue + allowance)
        {
            correctAnswer = 'no';
        }
        else {
            correctAnswer = 'yes';
        }
        
        question.correct_answer = correctAnswer;
        if (question.answer != correctAnswer) {
            return;
        }
        feedback.correct = true;
        feedback.points = 5;
    },
    
    gradeTime : function() {
        var seconds;
        var feedbackItem;
        
        seconds = (this.questions[1].end_time - this.questions[0].start_time) / 1000;
        feedback = this.feedback.reading_time;
        if (seconds <= 20) {
            feedback.points = 5;
        }
        else if (seconds <= 40) {
            feedback.points = 2;
        }
        else {
            feedback.points = 0;
        }
        
        seconds = (this.questions[2].end_time - this.questions[2].start_time) / 1000;
        feedback = this.feedback.measuring_time;
        if (seconds <= 20) {
            feedback.points = 5;
        }
        else if (seconds <= 40) {
            feedback.points = 2;
        }
        else {
            feedback.points = 0;
        }
    },
    
    gradeSettings : function() {
        var redProbeConn = this.parser.last_red_probe_conn;
        var blackProbeConn = this.parser.last_black_probe_conn;
        var redPlugConn = this.parser.last_red_plug_conn;
        var blackPlugConn = this.parser.last_black_plug_conn;
        
        //console.log('redProbe=' + redProbeConn + ' blackProbe=' + blackProbeConn + ' redPlug=' + redPlugConn + ' blackPlug=' + blackPlugConn);
        
        // Connection to R
        if ((redProbeConn == 'resistor_lead1' || redProbeConn == 'resistor_lead2') && 
            (blackProbeConn == 'resistor_lead1' || blackProbeConn == 'resistor_lead2') &&
            (redProbeConn != blackProbeConn))
        {
            this.feedback.probe_connection.correct = true;
            this.feedback.probe_connection.points = 2;
            this.feedback.probe_connection.desc = 'Correct';
        }
        else {
            this.feedback.probe_connection.correct = false;
            this.feedback.probe_connection.points = 0;
            this.feedback.probe_connection.desc = 'Incorrect';
        }
        
        // Connectin to DMM
        if (redPlugConn == 'voma_port' && blackPlugConn == 'common_port') {
            this.feedback.plug_connection.correct = true;
            this.feedback.plug_connection.points = 5;
            this.feedback.plug_connection.desc = 'Correct';
        }
        else {
            this.feedback.plug_connection.correct = false;
            if (redPlugConn == 'common_port' && blackPlugConn == 'voma_port') {
                this.feedback.plug_connection.points = 3;
                this.feedback.plug_connection.desc = 'Reversed';
            }
            else {
                this.feedback.plug_connection.points = 0;
                this.feedback.plug_connection.desc = 'Incorrect';
            }
        }
        
        // DMM knob
        var initialKnob = this.parser.getInitialDialSetting();
        var finalKnob = this.parser.getFinalDialSetting();
    },
    
    equalWithTolerance : function(value1, value2, tolerance) {
        return Math.abs(value1 - value2) < tolerance;
    },
    
    validateNonEmpty : function(inputField, form) {
        if (inputField === null ||
            inputField === undefined ||
            inputField.length < 1)
        {
            form.message = "No Value Entered";
            return false;
        }
        return true;
    },
    
    validateNumber : function(num, answer) {
        // I don't know if this works correctly IE
        // parseFloat will return all numbers before a non numeric char so 
        // parseFloat('3a') returns 3 which isn't really what we want
        if (isNaN(num)) {
            answer.message = "Value entered is not a number";
            return false;
        }
        return true;
    },
    
    semiAcceptable : function(correctAnswer, answer) {
        var a = correctAnswer.toString().replace('.', '');
        var b = answer.toString().replace('.', '');
        return a.substring(0, 3) == b.substring(0, 3);
    },
    
    sameFirstSigDigits : function(x, y, numSigDigits) {
        var sx = String(x).replace('.', '').substring(0, numSigDigits);
        var sy = String(y).replace('.', '').substring(0, numSigDigits);
        return sx === sy;
    },

    // A kludge to determine if two number are of same power of 10 magnitude
    // It only compares the number of digits before the decimal point
    // because numbers less than 1 are not expected.
    sameBeforeDot : function(x, y) {
        var lx = String(x).split('.')[0].length;
        var ly = String(y).split('.')[0].length;
        return lx === ly;
    },
    
    // True if the first numSigDigits digits of x, y are the same 
    // or in reverse order of each other
    // or the order is the same but only 1 digit is different
    semiCorrectDigits : function(x, y, numSigDigits) {
        var sx = String(x).replace('.', '').substring(0, numSigDigits);
        var sy = String(y).replace('.', '').substring(0, numSigDigits);
        if (sx === sy ||
            sx === this.reverseString(sy) ||
            this.onlyOneDigitDifferent(sx, sy))
        {
            return true;
        }
        return false;
    },
    
    reverseString : function (s) {
        return s.split('').reverse().join('');
    },
    
    onlyOneDigitDifferent : function(x, y) {
        var numDiff = 0;
        for (var i = 0; i < x.length; ++i) {
            if (x[i] !== y[i]) {
                ++numDiff;
            }
        }
        return numDiff == 1;
    },
    
    optimalDial : function(r) {
        if (r < 200) { return 'r_200'; }
        if (r < 2000) { return 'r_2000'; }
        if (r < 20e3) { return 'r_20k'; }
        if (r < 200e3) { return 'r_200k'; }
        return 'r_2000k';
    }
};
