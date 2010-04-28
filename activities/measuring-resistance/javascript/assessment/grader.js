/* The following line (global) is for JSLint */
/*global console, Unit */


function Grader(session)
{
    this.session = session;
    this.section = this.session.sections[0];
    this.questions =  this.section.questions;
    
    this.feedback = new Feedback();
    this.parser = new LogParser(session);
    
    // Values used by gradeToleranceRange()
    this.resistanceAnswer = null;
    this.toleranceAnswer = null;
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
        
        debug('measurd_r_value.points=' + this.feedback.root.measuring.measured_r_value.points);
        
        return this.feedback;
    },

    gradeReadingColorBands : function() {
        var question = this.questions[0];
        var fb = this.feedback.root.reading.rated_r_value;
        var unitCorrect = true;
        
        fb.correct = 0;
        fb.points = 0;
        
        if (!Unit.ohmCompatible(question.unit)) {
            unitCorrect = false;
            fb.addFeedback('unit', question.unit);
            return;
        }
        
        if (question.answer === null || isNaN(question.answer)) {
            fb.addFeedback('incorrect');
            return;
        }
        
        var parsedValue = Unit.normalizeToOhms(question.answer, question.unit);
        this.resistanceAnswer = parsedValue;
        
        console.log('parsedValue=' + parsedValue + ' correctValue=' + question.correct_answer);
        
        if (question.correct_answer != parsedValue) {
            if (unitCorrect) {
                if (this.sameBeforeDot(question.correct_answer, parsedValue)) {
                    if (this.semiCorrectDigits(question.correct_answer, parsedValue, 3)) {
                        fb.points = 2;
                        fb.correct = 1;
                        fb.addFeedback('difficulty');
                        return;
                    }
                }
                else if (this.sameFirstSigDigits(question.correct_answer, parsedValue, 3)) {
                    fb.points = 10;
                    fb.correct = 2;
                    fb.addFeedback('power_ten');
                    return;
                }
            }
            fb.addFeedback('incorrect');
            return;
        }
        fb.points = 20;
        fb.correct = 4;
        fb.addFeedback('correct');
    },
    
    gradeResistance : function() {
        var question = this.questions[2];
        var fb = this.feedback.root.measuring.measured_r_value;
        
        fb.points = 0;
        fb.correct = 0;
        
        if (question.answer === null || isNaN(question.answer)) {
            fb.addFeedback('incorrect');
            return;
        }
        if (!Unit.ohmCompatible(question.unit)) { return; }
        
        var parsedValue = Unit.normalizeToOhms(question.answer, question.unit);
        
        console.log('parsedValue=' + parsedValue + ' correctValue=' + question.correct_answer);
        
        if(question.correct_answer != parsedValue){
            if (this.semiAcceptable(question.correct_answer, parsedValue)) {
                fb.points = 5;
                fb.correct = 2;
                fb.addFeedback('power_ten');
            }
            return;
        }
        
        fb.points = 10;
        fb.correct = 4;
        fb.addFeedback('correct');
    },
    
    gradeTolerance : function() {
        var question = this.questions[1];
        var fb = this.feedback.root.reading.rated_t_value;
        
        fb.correct = 0;
        fb.points = 0;
        
        if (question.answer === null || isNaN(question.answer)) {
            fb.addFeedback('incorrect');
            return;
        }
        this.toleranceAnswer = question.answer / 100.0;
        if (question.correct_answer != question.answer / 100.0){
            fb.addFeedback('incorrect');
            return;
        }
        
        fb.correct = 4;
        fb.points = 5;
        fb.addFeedback('correct');
    },
    
    gradeToleranceRange : function () {
        //console.log('ENTER Grader.gradeToleranceRange');
        var question = this.questions[3];
        var fb = this.feedback.root.t_range_value;
        //var nominalResistance = this.section.nominal_resistance;
        //var tolerance = this.section.tolerance;
        var nominalResistance = this.resistanceAnswer;
        var tolerance = this.toleranceAnswer;

        fb.points = 0;
        fb.correct = 0;

        var correctMin = nominalResistance * (1 - tolerance);
        var correctMax = nominalResistance * (1 + tolerance);
        
        //console.log('nom=' + nominalResistance + ' tol=' + tolerance + ' min=' + correctMin + ' max=' + correctMax);
        
        question.correct_answer = [correctMin, correctMax];

        var min = question.answer[0];
        var max = question.answer[1];
        
        var correctStr = '[' + Unit.res_str(correctMin) + ', ' +
            Unit.res_str(correctMax) + ']';
        var answerStr = '[' + min + question.unit[0] + ', ' +
            max + question.unit[1] + ']';
        
        if (min === null || isNaN(min) || max === null || isNaN(max)) {
            fb.addFeedback('wrong', correctStr, answerStr);
            return;
        }
        
        //console.log('correct min=' + correctMin + ' max=' + correctMax);
        //console.log('submitted min=' + min + ' max=' + max);
        
        if (!Unit.ohmCompatible(question.unit[0]) ||
            !Unit.ohmCompatible(question.unit[1]))
        {
            fb.addFeedback('wrong');
            return;
        }
        
        var parsedMin = Unit.normalizeToOhms(min, question.unit[0]);
        var parsedMax = Unit.normalizeToOhms(max, question.unit[1]);
        
        // Allow answers in reverse order
        if (parsedMin > parsedMax) {
            var tmp = parsedMin;
            parsedMin = parsedMax;
            parsedMax = tmp;
        }
        
        if (this.equalWithTolerance(parsedMin, correctMin, 1e-5) &&
            this.equalWithTolerance(parsedMax, correctMax, 1e-5))
        {
            fb.points = 15;
            fb.correct = 4;
            fb.addFeedback('correct');
            return;
        }
        
        if (MyMath.roundToSigDigits(correctMin, 3) ===
            MyMath.roundToSigDigits(parsedMin, 3) &&
            MyMath.roundToSigDigits(correctMax, 3) ===
            MyMath.roundToSigDigits(parsedMax, 3))
        {
            fb.points = 10;
            fb.correct = 3;
            fb.addFeedback('rounded');
            return;
        }
        
        if (Math.abs(MyMath.getRoundedSigDigits(correctMin, 3) - 
                     MyMath.getRoundedSigDigits(parsedMin, 3)) <= 2 &&
            Math.abs(MyMath.getRoundedSigDigits(correctMax, 3) - 
                     MyMath.getRoundedSigDigits(parsedMax, 3)) <= 2)
        {
            fb.points = 3;
            fb.correct = 2;
            fb.addFeedback('inaccurate');
            return;
        }
        return;
    },
    
    gradeWithinTolerance : function() {
        var question = this.questions[4];
        var fb = this.feedback.root.within_tolerance;
        var correctAnswer;
        var nominalValue = this.section.nominal_resistance;
        var tolerance = this.section.tolerance;
        var displayValue = this.section.displayed_resistance;
        var allowance = nominalValue * tolerance;
        
        fb.correct = 0;
        fb.points = 0;
        
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
            fb.addFeedback('incorrect');
            return;
        }
        fb.points = 5;
        fb.correct = 4;
        fb.addFeedback('correct');
    },
    
    gradeTime : function() {
        var seconds;
        var fb;
        
        seconds = (this.questions[1].end_time - this.questions[0].start_time) / 1000;
        fb = this.feedback.root.time.reading_time;
        if (seconds <= 30) {
            fb.points = 5;
            fb.correct = 4;
            fb.addFeedback('efficient');
        }
        else if (seconds <= 60) {
            fb.points = 2;
            fb.correct = 2;
            fb.addFeedback('semi');
        }
        else {
            fb.points = 0;
            fb.correct = 0;
            fb.addFeedback('slow');
        }
        
        seconds = (this.questions[2].end_time - this.questions[2].start_time) / 1000;
        fb = this.feedback.root.time.measuring_time;
        if (seconds <= 30) {
            fb.points = 5;
            fb.correct = 4;
            fb.addFeedback('efficient');
        }
        else if (seconds <= 60) {
            fb.points = 2;
            fb.correct = 2;
            fb.addFeedback('semi');
        }
        else {
            fb.points = 0;
            fb.correct = 0;
            fb.addFeedback('slow');
        }
    },
    
    gradeSettings : function() {
        var fb = this.feedback.root.measuring;
        var redProbeConn = this.parser.submit_red_probe_conn;
        var blackProbeConn = this.parser.submit_black_probe_conn;
        var redPlugConn = this.parser.submit_red_plug_conn;
        var blackPlugConn = this.parser.submit_black_plug_conn;
        
        //console.log('redProbe=' + redProbeConn + ' blackProbe=' + blackProbeConn + ' redPlug=' + redPlugConn + ' blackPlug=' + blackPlugConn);
        
        // Connection to R
        if ((redProbeConn == 'resistor_lead1' || redProbeConn == 'resistor_lead2') && 
            (blackProbeConn == 'resistor_lead1' || blackProbeConn == 'resistor_lead2') &&
            (redProbeConn != blackProbeConn))
        {
            fb.probe_connection.correct = 4;
            fb.probe_connection.points = 2;
            fb.probe_connection.desc = 'Correct';
            fb.probe_connection.addFeedback('correct');
        }
        else {
            fb.probe_connection.correct = 0;
            fb.probe_connection.points = 0;
            fb.probe_connection.desc = 'Incorrect';
            fb.probe_connection.addFeedback('incorrect');
        }
        debug('probe_connection.points=' + fb.probe_connection.points);
        
        // Connectin to DMM
        if (redPlugConn == 'voma_port' && blackPlugConn == 'common_port') {
            fb.plug_connection.points = 5;
            fb.plug_connection.correct = 4;
            fb.plug_connection.desc = 'Correct';
            fb.plug_connection.addFeedback('correct');
        }
        else {
            fb.plug_connection.correct = 0;
            if (redPlugConn == 'common_port' && blackPlugConn == 'voma_port') {
                fb.plug_connection.points = 3;
                fb.plug_connection.correct = 3;
                fb.plug_connection.desc = 'Reversed';
                fb.plug_connection.addFeedback('reverse');
            }
            else {
                fb.plug_connection.points = 0;
                fb.plug_connection.correct = 0;
                fb.plug_connection.desc = 'Incorrect';
                fb.plug_connection.addFeedback('incorrect');
            }
        }
        debug('plug_connection.points=' + fb.plug_connection.points);
        
        // DMM knob
        var i_knob = this.parser.initial_dial_setting;
        var f_knob = this.parser.submit_dial_setting;
        var o_knob = this.optimalDial(this.section.displayed_resistance);
        
        this.feedback.initial_dial_setting = i_knob;
        this.feedback.submit_dial_setting = f_knob;
        this.feedback.optimal_dial_setting = o_knob;
        
        if (f_knob === o_knob) {
            fb.knob_setting.points = 20;
            fb.knob_setting.correct = 4;
            fb.knob_setting.addFeedback('correct');
        }
        else if (this.isResistanceKnob(f_knob)){
            fb.knob_setting.points = 10;
            fb.knob_setting.correct = 2;
            fb.knob_setting.addFeedback('suboptimal');
        }
        else {
            fb.knob_setting.points = 0;
            fb.knob_setting.correct = 0;
            fb.knob_setting.addFeedback('incorrect');
        }
    
        if (this.parser.power_on) {
            fb.power_switch.points = 2;
            fb.power_switch.correct = 4;
            fb.power_switch.addFeedback('correct');
        }
        else {
            fb.power_switch.points = 0;
            fb.power_switch.correct = 0;
            fb.power_switch.addFeedback('incorrect');
        }
        debug('power_switch.points=' + fb.power_switch.points);
        
        if (this.parser.correct_order) {
            fb.task_order.points = 6;
            fb.task_order.correct = 4;
            fb.task_order.addFeedback('correct');
        }
        else {
            fb.task_order.points = 0;
            fb.task_order.correct = 0;
            fb.task_order.addFeedback('incorrect');
        }
        debug('task_order.points=' + fb.task_order.points);
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
    },
    
    isResistanceKnob : function(setting) {
        return setting === 'r_200' ||
            setting === 'r_2000' ||
            setting === 'r_20k' ||
            setting === 'r_200k';
    }
};
