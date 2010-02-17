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
        
        debug('measurd_r_value.points=' + this.feedback.root.measuring.measured_r_value.points);
        
        return this.feedback;
    },

    gradeReadingColorBands : function()
    {
        var question = this.questions[0];
        var feedback = this.feedback.root.reading.rated_r_value;
        
        feedback.correct = 0;
        feedback.points = 0;
        
        if (question.answer === null || isNaN(question.answer)) { return; }
        if (!Unit.ohmCompatible(question.unit)) { return; }
        
        var parsedValue = Unit.normalizeToOhms(question.answer, question.unit);
        
        console.log('parsedValue=' + parsedValue + ' correctValue=' + question.correct_answer);
        
        if(question.correct_answer != parsedValue){
            if (this.sameBeforeDot(question.correct_answer, parsedValue)) {
                if (this.semiCorrectDigits(question.correct_answer, parsedValue, 3)) {
                    feedback.points = 2;
                    feedback.correct = 1;
                    return;
                }
            }
            else if (this.sameFirstSigDigits(question.correct_answer, parsedValue, 3)) {
                feedback.points = 10;
                feedback.correct = 2;
                return;
            }
            return;
        }
        feedback.points = 20;
        feedback.correct = 4;
    },
    
    gradeResistance : function() {
        var question = this.questions[2];
        var feedback = this.feedback.root.measuring.measured_r_value;
        
        feedback.points = 0;
        feedback.correct = 0;
        
        if (question.answer === null || isNaN(question.answer)) { return; }
        if (!Unit.ohmCompatible(question.unit)) { return; }
        
        var parsedValue = Unit.normalizeToOhms(question.answer, question.unit);
        
        console.log('parsedValue=' + parsedValue + ' correctValue=' + question.correct_answer);
        
        if(question.correct_answer != parsedValue){
            if (this.semiAcceptable(question.correct_answer, parsedValue)) {
                feedback.points = 5;
                feedback.correct = 2;
            }
            return;
        }
        
        feedback.points = 10;
        feedback.correct = 4;
    },
    
    gradeTolerance : function() {
        var question = this.questions[1];
        var feedback = this.feedback.root.reading.rated_t_value;
        
        feedback.correct = 0;
        feedback.points = 0;
        
        if (question.answer === null || isNaN(question.answer)) {
            return;
        }
        if (question.correct_answer != question.answer / 100.0){
            return;
        }
        
        feedback.correct = 4;
        feedback.points = 5;
    },
    
    gradeToleranceRange : function()
    {
        //console.log('ENTER Grader.gradeToleranceRange');
        var question = this.questions[3];
        var feedback = this.feedback.root.t_range_value;
        var nominalResistance = this.section.nominal_resistance;
        var tolerance = this.section.tolerance;

        feedback.points = 0;
        feedback.correct = 0;

        var correctMin = nominalResistance * (1 - tolerance);
        var correctMax = nominalResistance * (1 + tolerance);
        
        //console.log('nom=' + nominalResistance + ' tol=' + tolerance + ' min=' + correctMin + ' max=' + correctMax);
        
        question.correct_answer = [correctMin, correctMax];

        var min = question.answer[0];
        var max = question.answer[1];
        
        if (min === null || isNaN(min) || max === null || isNaN(max)) {
            return;
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
        
        // Allow answers in reverse order
        if (parsedMin > parsedMax) {
            var tmp = parsedMin;
            parsedMin = parsedMax;
            parsedMax = tmp;
        }
        
        if (this.equalWithTolerance(parsedMin, correctMin, 1e-5) &&
            this.equalWithTolerance(parsedMax, correctMax, 1e-5))
        {
            feedback.points = 15;
            feedback.correct = 4;
            return;
        }
        
        if (MyMath.roundToSigDigits(correctMin, 3) ===
            MyMath.roundToSigDigits(parsedMin, 3) &&
            MyMath.roundToSigDigits(correctMax, 3) ===
            MyMath.roundToSigDigits(parsedMax, 3))
        {
            feedback.points = 10;
            feedback.correct = 3;
            return;
        }
        
        if (Math.abs(MyMath.getRoundedSigDigits(correctMin, 3) - 
                     MyMath.getRoundedSigDigits(parsedMin, 3)) <= 2 &&
            Math.abs(MyMath.getRoundedSigDigits(correctMax, 3) - 
                     MyMath.getRoundedSigDigits(parsedMax, 3)) <= 2)
        {
            feedback.points = 3;
            feedback.correct = 2;
            return;
        }
        return;
    },
    
    gradeWithinTolerance : function() {
        var question = this.questions[4];
        var feedback = this.feedback.root.within_tolerance;
        var correctAnswer;
        var nominalValue = this.section.nominal_resistance;
        var tolerance = this.section.tolerance;
        var displayValue = this.section.displayed_resistance;
        var allowance = nominalValue * tolerance;
        
        feedback.correct = 0;
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
        feedback.points = 5;
        feedback.correct = 4;
    },
    
    gradeTime : function() {
        var seconds;
        var feedback;
        
        seconds = (this.questions[1].end_time - this.questions[0].start_time) / 1000;
        feedback = this.feedback.root.time.reading_time;
        if (seconds <= 20) {
            feedback.points = 5;
            feedback.correct = 4;
        }
        else if (seconds <= 40) {
            feedback.points = 2;
            feedback.correct = 2;
        }
        else {
            feedback.points = 0;
            feedback.correct = 0;
        }
        
        seconds = (this.questions[2].end_time - this.questions[2].start_time) / 1000;
        feedback = this.feedback.root.time.measuring_time;
        if (seconds <= 20) {
            feedback.points = 5;
            feedback.correct = 4;
        }
        else if (seconds <= 40) {
            feedback.points = 2;
            feedback.correct = 2;
        }
        else {
            feedback.points = 0;
            feedback.correct = 0;
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
        }
        else {
            fb.probe_connection.correct = 0;
            fb.probe_connection.points = 0;
            fb.probe_connection.desc = 'Incorrect';
        }
        debug('probe_connection.points=' + fb.probe_connection.points);
        
        // Connectin to DMM
        if (redPlugConn == 'voma_port' && blackPlugConn == 'common_port') {
            fb.plug_connection.points = 5;
            fb.plug_connection.correct = 4;
            fb.plug_connection.desc = 'Correct';
        }
        else {
            fb.plug_connection.correct = 0;
            if (redPlugConn == 'common_port' && blackPlugConn == 'voma_port') {
            	fb.plug_connection.points = 3;
            	fb.plug_connection.correct = 3;
                fb.feedback.plug_connection.desc = 'Reversed';
            }
            else {
            	fb.plug_connection.points = 0;
            	fb.plug_connection.correct = 0;
                fb.plug_connection.desc = 'Incorrect';
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
        	if (i_knob === o_knob) {
        		fb.knob_setting.points = 20;
        		fb.knob_setting.correct = 4;
        	}
        	else {
        		fb.knob_setting.points = 15;
        		fb.knob_setting.correct = 3;
        	}
        }
        else if (this.isResistanceKnob(f_knob)){
        	fb.knob_setting.points = 10;
        	fb.knob_setting.correct = 2;
        }
        else {
        	fb.knob_setting.points = 0;
        	fb.knob_setting.correct = 0;
        }
        debug('knob_setting.points=' + fb.knob_setting.points);
    
        if (this.parser.power_on) {
        	fb.power_switch.points = 2;
        	fb.power_switch.correct = 5;;
        }
        else {
        	fb.power_switch.points = 0;
        	fb.power_switch.correct = 0;
        }
        debug('power_switch.points=' + fb.power_switch.points);
        
        if (this.parser.correct_order) {
        	fb.task_order.points = 6;
        	fb.task_order.correct = 5;
        }
        else {
        	fb.task_order.points = 0;
        	fb.task_order.correct = 0;
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
