/* The following line (global) is for JSLint */
/*global console, Unit */

function Grader(activity, activityLog, feedback)
{
    this.activity = activity;
    this.log = activityLog;
    this.feedback = feedback;
}

Grader.prototype =
{
    grade : function(resultObject, sectionNum) {
        console.log('ENTER Grader.grade');
        var questions =  this.log.currentSection().questions;
        
        var multimeter = this.activity.multimeter;
        var resistor = this.activity.resistor;

        this.gradeReadingColorBands(questions[0],
                                    resultObject.rated_resistance,
                                    resistor.nominalValue,
                                    this.feedback.rated_r_value);
        this.gradeTolerance(questions[1], resultObject.rated_tolerance, 
                resistor.tolerance, this.feedback.rated_t_value);
        this.gradeResistance(questions[2], resultObject.measured_resistance,
                multimeter.makeDisplayText(resistor.realValue),
                this.feedback.measured_r_value);
        this.gradeToleranceRange(questions[3], resultObject.measured_tolerance,
                resistor.nominalValue, resistor.tolerance,
                this.feedback.t_range_value);
        this.gradeWithinTolerance(questions[4], resultObject.within_tolerance,
                resistor,this.feedback.within_tolerance);
        this.gradeTime();
        this.gradeSettings();
    },

    gradeReadingColorBands : function(question, formAnswer, correctValue,
            feedback)
    {
        formAnswer.message = "Unknown Error";
        formAnswer.correct = false;
        question.correct_answer = String(correctValue);
        question.answer = formAnswer.value;
        question.unit = formAnswer.units;
        question.correct = false;
        //feedback.label = 'Lack of understanding';
        feedback.points = 0;
        
        if (!this.validateNonEmpty(formAnswer.value, formAnswer)) {
            return;
        }
        
        var valueNum = Number(formAnswer.value);
        if (!this.validateNumber(valueNum, formAnswer)) {
            return;
        }
        
        if (formAnswer.units === null ||
            formAnswer.units === undefined ||
            formAnswer.units.length < 1)
        {
             formAnswer.message = "No Unit Entered";
             return;
        }

        console.log('unit=' + formAnswer.units);

        if (!Unit.ohmCompatible(formAnswer.units)) {
            formAnswer.message = "Incorrect Unit";
            return;
        }   
        var parsedValue = Unit.normalizeToOhms(valueNum, formAnswer.units);
        
        console.log('parsedValue=' + parsedValue + ' correctValue=' + correctValue);
        
        if(correctValue != parsedValue){
            if (this.sameBeforeDot(correctValue, parsedValue)) {
                if (this.semiCorrectDigits(correctValue, parsedValue, 3)) {
                    feedback.points = 2;
                    return;
                }
            }
            else if (this.sameFirstSigDigits(correctValue, parsedValue, 3)) {
                feedback.points = 10;
                return;
            }
            
            //formAnswer.message = "The entered value or unit is incorrect.";
            return;
        }
        
        formAnswer.correct = true;
        formAnswer.message = 'Correct';
        //feedback.label = 'Excellent';
        feedback.points = 20;
        question.correct = true;
    },
    
    gradeResistance : function(question, formAnswer, correctValue, feedback) {
        formAnswer.message = "Unknown Error";
        formAnswer.correct = false;
        question.correct_answer = String(correctValue);
        question.answer = formAnswer.value;
        question.unit = formAnswer.units;
        question.correct = false;
        feedback.label = 'Lack of understanding';
        feedback.points = 0;
        
        if (!this.validateNonEmpty(formAnswer.value, formAnswer)) {
            return;
        }
        
        var valueNum = Number(formAnswer.value);
        if (!this.validateNumber(valueNum, formAnswer)) {
            return;
        }
        
        if (formAnswer.units === null ||
            formAnswer.units === undefined ||
            formAnswer.units.length < 1)
        {
             formAnswer.message = "No Unit Entered";
             return;
        }

        console.log('unit=' + formAnswer.units);

        if (!Unit.ohmCompatible(formAnswer.units)) {
            formAnswer.message = "Incorrect Unit";
            return;
        }   
        var parsedValue = Unit.normalizeToOhms(valueNum, formAnswer.units);
        
        console.log('parsedValue=' + parsedValue + ' correctValue=' + correctValue);
        
        if(correctValue != parsedValue){
            formAnswer.message = "The entered value or unit is incorrect.";
            if (this.semiAcceptable(correctValue, parsedValue)) {
                feedback.label = 'Learning';
                feedback.points = 5;
            }
            return;
        }
        
        formAnswer.correct = true;
        formAnswer.message = 'Correct';
        feedback.label = 'Excellent';
        feedback.points = 10;
        question.correct = true;
    },
    
    gradeTolerance : function(question, answer, correctValue, feedback) {
        answer.message = "Unknown Error";
        answer.correct = false;
        question.correct_answer = String(correctValue);
        question.answer = answer.value;
        question.unit = '%';
        question.correct = false;
        feedback.points = 0;
        
        if (!this.validateNonEmpty(answer.value, answer)) {
            return;
        }

        var value_num = Number(answer.value);
        if (!this.validateNumber(value_num, answer)) {
            return;
        }
        
        if(correctValue != value_num / 100.0){
            answer.message = "The entered value is incorrect.";
            return;
        }
        
        answer.correct = true;
        answer.message = "Correct";
        question.correct = true;
        feedback.points = 5;
    },
    
    gradeToleranceRange : function(question, answer, nominalResistance,
        tolerance, feedback)
    {
        console.log('ENTER Grader.gradeToleranceRange');
        feedback.label = 'Lack of understanding';
        feedback.points = 0;

        
        var correctMin = nominalResistance * (1 - tolerance);
        var correctMax = nominalResistance * (1 + tolerance);
        
        console.log('nom=' + nominalResistance + ' tol=' + tolerance + ' min=' + correctMin + ' max=' + correctMax);
        
        answer.message = "Unknown Error";
        answer.correct = false;
        question.correct_answer = [correctMin, correctMax];
        question.answer = [answer.min, answer.max];
        question.unit = [answer.min_unit, answer.max_unit];
        question.correct = false;

        if (!this.validateNonEmpty(answer.min, answer) || !this.validateNonEmpty(answer.max, answer)) {
            return;
        }

        var min = Number(answer.min);
        var max = Number(answer.max);
        
        if (!this.validateNumber(min, answer) || !this.validateNumber(max, answer)) {
            return;
        }
        
        // Allow answers in reverse order
        if (min > max) {
            var tmp = min;
            min = max;
            max = tmp;
        }
        
        console.log('correct min=' + correctMin + ' max=' + correctMax);
        console.log('submitted min=' + min + ' max=' + max);
        
        if (!Unit.ohmCompatible(answer.min_unit) ||
            !Unit.ohmCompatible(answer.max_unit))
        {
            answer.message = "Incorrect Unit";
            return;
        }
        
        var parsedMin = Unit.normalizeToOhms(min, answer.min_unit);
        var parsedMax = Unit.normalizeToOhms(max, answer.max_unit);
        
        if (this.equalWithTolerance(parsedMin, correctMin, 1e-5) &&
            this.equalWithTolerance(parsedMax, correctMax, 1e-5))
        {
            answer.correct = true;
            answer.message = "Correct";
            question.correct = true;
            //feedback.label = 'Excellent';
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
    
    gradeWithinTolerance : function(question, answer, resistor, feedback) {
        var correctAnswer;
        var tolerance = resistor.nominalValue * resistor.tolerance;
        
        feedback.label = 'Lack of understanding';
        feedback.points = 0;
        
        /*
        console.log('nominal=' + resistor.nominalValue + 
         ' tolerance=' + resistor.tolerance + ' real=' + resistor.realValue);
        console.log('min=' + (resistor.nominalValue - tolerance));
        console.log('max=' + (resistor.nominalValue + tolerance));
        */
        
        if (resistor.realValue < resistor.nominalValue - tolerance ||
            resistor.realValue > resistor.nominalValue + tolerance)
        {
            correctAnswer = 'no';
        }
        else {
            correctAnswer = 'yes';
        }
        
        answer.message = "Unknown Error";
        answer.correct = false;
        question.correct_answer = correctAnswer;
        question.answer = answer.value;
        question.correct = false;
        
        if (!this.validateNonEmpty(answer.value, answer)) {
            return;
        }

        if (answer.value != correctAnswer) {
            return;
        }
        answer.correct = true;
        answer.message = "Correct";
        question.correct = true;
        feedback.label = 'Excellent';
        feedback.points = 10;
    },
    
    gradeTime : function() {
        var i;
        var question;
        var seconds;
        var feedbackItem;
        
        for (i = 0; i < this.log.sections.length; ++i) {
            question = this.log.sections[i].questions[0];
            seconds = (question.end_time - question.start_time) / 1000;
            //var feedbackItem = this.feedback[rated_r_labels[i]];
            feedbackItem = this.feedback.rated_r_time;
            if (seconds < 20) {
                feedbackItem.label = 'Excellent';
                feedbackItem.points = 10;
            }
            else if (seconds < 45) {
                feedbackItem.label = 'Fast';
                feedbackItem.points = 8;
            }
            else if (seconds < 120) {
                feedbackItem.label = 'Learning';
                feedbackItem.points = 6;
            }
            else {
                feedbackItem.label = 'Too slow';
                feedbackItem.points = 2;
            }
        }
        
        for (i = 0; i < this.log.sections.length; ++i) {
            question = this.log.sections[i].questions[1];
            seconds = (question.end_time - question.start_time) / 1000;
            //var feedbackItem = this.feedback[rated_t_labels[i]];
            feedbackItem = this.feedback.rated_t_time;
            if (seconds < 10) {
                feedbackItem.label = 'Excellent';
                feedbackItem.points = 10;
            }
            else if (seconds < 20) {
                feedbackItem.label = 'Fast';
                feedbackItem.points = 8;
            }
            else if (seconds < 50) {
                feedbackItem.label = 'Learning';
                feedbackItem.points = 6;
            }
            else {
                feedbackItem.label = 'Too slow';
                feedbackItem.points = 2;
            }
        }
        
        for (i = 0; i < this.log.sections.length; ++i) {
            question = this.log.sections[i].questions[2];
            seconds = (question.end_time - question.start_time) / 1000;
            //var feedbackItem = this.feedback[measured_r_labels[i]];
            feedbackItem = this.feedback.measured_r_time;
            if (seconds < 30) {
                feedbackItem.label = 'Excellent';
                feedbackItem.points = 10;
            }
            else if (seconds < 60) {
                feedbackItem.label = 'Fast';
                feedbackItem.points = 8;
            }
            else if (seconds < 120) {
                feedbackItem.label = 'Learning';
                feedbackItem.points = 6;
            }
            else {
                feedbackItem.label = 'Too slow';
                feedbackItem.points = 2;
            }
        }
    },
    
    gradeSettings : function() {
        var redProbeConn = this.activity.multimeter.redProbeConnection;
        var blackProbeConn = this.activity.multimeter.blackProbeConnection;
        var redPlugConn = this.activity.multimeter.redPlugConnection;
        var blackPlugConn = this.activity.multimeter.blackPlugConnection;
        
        console.log('redProbe=' + redProbeConn + ' blackProbe=' + blackProbeConn + ' redPlug=' + redPlugConn + ' blackPlug=' + blackPlugConn);
        
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
