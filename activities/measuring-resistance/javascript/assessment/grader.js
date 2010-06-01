//= require <math>
//= require <string>
//= require <unit>
//= require "../setup-common"
//= require "feedback"
//= require "log-parser"

/* FILE grader.js */

(function () {

    var math = sparks.math;
    var unit = sparks.unit;
    var str = sparks.string;
    var mr = sparks.activities.mr;

    mr.Grader = function (session, rubric) {
        this.session = session;
        this.rubric = rubric;
        
        this.section = this.session.sections[0];
        this.questions =  this.section.questions;

        this.feedback = new mr.Feedback(rubric);
        this.parser = new mr.LogParser(session);

        // Values used by gradeToleranceRange()
        this.resistanceAnswer = null;
        this.toleranceAnswer = null;
        this.measuredResistanceAnswer = null;
        this.rangeMinAnswer = null;
        this.rangeMaxAnswer = null;
    };

    mr.Grader.prototype = {

        grade: function () {
            //console.log('ENTER Grader.grade');
        
            this.realCorrectMin = this.section.nominal_resistance * (1 - this.section.tolerance);
            this.realCorrectMax = this.section.nominal_resistance * (1 + this.section.tolerance);

            this.gradeReadingColorBands();
            this.gradeTolerance();
            this.gradeResistance();
            this.gradeToleranceRange();
            this.gradeWithinTolerance();
            this.gradeTime();
            this.gradeSettings();

            // Update non-leaf node values so they can be saved to json
            // and used later by server.
            this.feedback.updatePoints();
            
            return this.feedback;
        },

        gradeReadingColorBands: function () {
            var question = this.questions[0];
            var unitCorrect = true;
            var fb = this.feedback.root.items.reading.items.rated_r_value;
            
            fb.correct = 0;
            fb.points = 0;

            if (!unit.ohmCompatible(question.unit)) {
                this.resistanceAnswer = null;
                unitCorrect = false;
                this.feedback.addFeedback(fb, 'unit', question.unit);
                return;
            }

            if (question.answer === null || isNaN(question.answer)) {
                this.resistanceAnswer = null;
                this.feedback.addFeedback(fb, 'incorrect');
                return;
            }

            var parsedValue = unit.normalizeToOhms(question.answer, question.unit);
            this.resistanceAnswer = parsedValue;

            //console.log('parsedValue=' + parsedValue + ' correctValue=' + question.correct_answer);

            if (question.correct_answer != parsedValue) {
                if (unitCorrect) {
                    if (math.equalExceptPowerOfTen(question.correct_answer, parsedValue)) {
                        fb.points = 10;
                        fb.correct = 2;
                        this.feedback.addFeedback(fb, 'power_ten',
                            this.section.resistor_num_bands - 1,
                            this.section.resistor_num_bands - 2);
                        return;
                    }
                    else if (this.oneOff(question.correct_answer, parsedValue)) {
                        fb.points = 2;
                        fb.correct = 1;
                        this.feedback.addFeedback(fb, 'difficulty');
                        return;
                    }
                }
                this.feedback.addFeedback(fb, 'incorrect');
                return;
            }
            fb.points = 20;
            fb.correct = 4;
            this.feedback.addFeedback(fb, 'correct');
        },

        gradeResistance: function () {
            var question = this.questions[2];
            var fb = this.feedback.root.items.measuring.items.measured_r_value;
            var unitCorrect = true;

            fb.points = 0;
            fb.correct = 0;

            if (!unit.ohmCompatible(question.unit)) {
                unitCorrect = false;
                this.feedback.addFeedback(fb, 'unit', question.unit);
                return;
            }

            if (question.answer === null || isNaN(question.answer)) {
                this.feedback.addFeedback(fb, 'incorrect');
                return;
            }
            
            var parsedValue = unit.normalizeToOhms(question.answer, question.unit);
            this.measuredResistanceAnswer = parsedValue;

            console.log('parsedValue=' + parsedValue + ' correctValue=' + question.correct_answer);

            if (question.correct_answer != parsedValue) {
                var n = this.section.resistor_num_bands - 2;
                if (this.roundedMatch(question.correct_answer, parsedValue, n)) {
                    fb.points = 5;
                    fb.correct = 3;
                    this.feedback.addFeedback(fb, 'incomplete', unit.res_str(question.correct_answer),
                        unit.res_str(parsedValue));
                    return;
                }
                else if (math.equalExceptPowerOfTen(question.correct_answer, parsedValue)) {
                    fb.points = 3;
                    fb.correct = 2;
                    this.feedback.addFeedback(fb, 'power_ten', question.answer, question.unit,
                            unit.res_unit_str(question.correct_answer),
                            unit.res_unit_str(question.correct_answer, 'k'),
                            unit.res_unit_str(question.correct_answer, 'M'));
                    return;
                }
                this.feedback.addFeedback(fb, 'incorrect');
                return;
            }

            fb.points = 10;
            fb.correct = 4;
            this.feedback.addFeedback(fb, 'correct');
        },

        gradeTolerance: function () {
            var question = this.questions[1];
            var fb = this.feedback.root.items.reading.items.rated_t_value;

            var correctStr = (question.correct_answer * 100) + '%';
            var answerStr = question.answer + '%';

            fb.correct = 0;
            fb.points = 0;

            if (question.answer === null || isNaN(question.answer)) {
                this.feedback.addFeedback(fb, 'incorrect', correctStr, answerStr);
                return;
            }
            this.toleranceAnswer = question.answer / 100.0;
            if (question.correct_answer != question.answer / 100.0){
                this.feedback.addFeedback(fb, 'incorrect', correctStr, answerStr);
                return;
            }

            fb.correct = 4;
            fb.points = 5;
            this.feedback.addFeedback(fb, 'correct');
        },

        gradeToleranceRange: function () {
            //console.log('ENTER Grader.gradeToleranceRange');
            var question = this.questions[3];
            var fb = this.feedback.root.items.t_range.items.range_values;
            var fb_r = this.feedback.root.items.reading.items.rated_r_value;
            var fb_t = this.feedback.root.items.reading.items.rated_t_value;
            var nominalResistance;
            var fbkey;
            
            question.correct_answer = [this.realCorrectMin, this.realCorrectMax];
            
            if (this.resistanceAnswer) {
                nominalResistance = this.resistanceAnswer;
            }
            else {
                nominalResistance = this.section.nominal_resistance;
            }
            var tolerance = this.toleranceAnswer;

            fb.points = 0;
            fb.correct = 0;

            var correctMin = nominalResistance * (1 - tolerance);
            var correctMax = nominalResistance * (1 + tolerance);

            //console.log('nom=' + nominalResistance + ' tol=' + tolerance + ' min=' + correctMin + ' max=' + correctMax);

            var min = question.answer[0];
            var max = question.answer[1];

            var correctStr = '[' + unit.res_str(correctMin) + ', ' +
                unit.res_str(correctMax) + ']';
            var answerStr = '[' + min + ' ' + question.unit[0] + ', ' +
                max + ' ' + question.unit[1] + ']';

            if (min === null || isNaN(min) || max === null || isNaN(max)) {
                this.feedback.addFeedback(fb, 'wrong', correctStr, answerStr);
                return;
            }

            //console.log('correct min=' + correctMin + ' max=' + correctMax);
            //console.log('submitted min=' + min + ' max=' + max);

            if (!unit.ohmCompatible(question.unit[0]) ||
                !unit.ohmCompatible(question.unit[1]))
            {
                this.feedback.addFeedback(fb, 'wrong');
                return;
            }

            var parsedMin = unit.normalizeToOhms(min, question.unit[0]);
            var parsedMax = unit.normalizeToOhms(max, question.unit[1]);
            
            this.rangeMinAnswer = parsedMin;
            this.rangeMaxAnswer = parsedMax;

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
                if (fb_r.correct === 4) {
                    if (fb_t.correct == 4) {
                        this.feedback.addFeedback(fb, 'correct', unit.res_str(nominalResistance), 
                                unit.pct_str(tolerance));
                    }
                    else {
                        this.feedback.addFeedback(fb, 'correct_wrong_prev_t', unit.res_str(nominalResistance), 
                                unit.pct_str(tolerance));
                    }                        
                }
                else if (fb_t.correct == 4) {
                    this.feedback.addFeedback(fb, 'correct_wrong_prev_r', unit.res_str(nominalResistance), 
                            unit.pct_str(tolerance));
                }
                else {
                    this.feedback.addFeedback(fb, 'correct_wrong_prev_rt', unit.res_str(nominalResistance), 
                            unit.pct_str(tolerance));
                }
                return;
            }
            
            var n = this.section.resistor_num_bands - 2;

            if (math.roundToSigDigits(correctMin, n) ===
                math.roundToSigDigits(parsedMin, n) &&
                math.roundToSigDigits(correctMax, n) ===
                math.roundToSigDigits(parsedMax, n))
            {
                fb.points = 10;
                fb.correct = 3;
                if (fb_r.correct === 4) {
                    if (fb_t.correct === 4) {
                        this.feedback.addFeedback(fb, 'rounded', unit.res_str(nominalResistance), 
                                unit.pct_str(tolerance));
                    }
                    else {
                        this.feedback.addFeedback(fb, 'rounded_wrong_prev_t', unit.res_str(nominalResistance), 
                                unit.pct_str(tolerance));
                    }
                }
                else if (fb_t.correct === 4) {
                    this.feedback.addFeedback(fb, 'rounded_wrong_prev_r', unit.res_str(nominalResistance), 
                            unit.pct_str(tolerance));
                }
                else {
                    this.feedback.addFeedback(fb, 'rounded_wrong_prev_rt', unit.res_str(nominalResistance), 
                            unit.pct_str(tolerance));
                }
                return;
            }

            if (Math.abs(math.getRoundedSigDigits(correctMin, n) - 
                         math.getRoundedSigDigits(parsedMin, n)) <= 2 &&
                Math.abs(math.getRoundedSigDigits(correctMax, n) - 
                         math.getRoundedSigDigits(parsedMax, n)) <= 2)
            {
                fb.points = 3;
                fb.correct = 2;
                if (fb_r.correct === 4) {
                    if (fb_t.correct === 4) {
                        this.feedback.addFeedback(fb, 'inaccurate', correctStr, answerStr);
                    }
                    else {
                        this.feedback.addFeedback(fb, 'inaccurate_wrong_prev_t', correctStr, answerStr);
                    }
                }
                else if (fb_t.correct === 4) {
                    this.feedback.addFeedback(fb, 'inaccurate_wrong_prev_r', correctStr, answerStr);
                }
                else {
                    this.feedback.addFeedback(fb, 'inaccurate_wrong_prev_rt', correctStr, answerStr);
                }
                return;
            }
            debugger;
            this.feedback.addFeedback(fb, 'wrong', correctStr, answerStr);
            return;
        },

        gradeWithinTolerance: function () {
            var question = this.questions[4];
            var correctAnswer;
            var nominalResistance = null;
            
            if (this.section.displayed_resistance >= this.realCorrectMin &&
                this.section.displayed_resistance <= this.realCorrectMax)
            {
                question.correct_answer = 'yes';
            }
            else {
                question.correct_answer = 'no';
            }
            
            var fb = this.feedback.root.items.t_range.items.in_out;
            
            if (this.feedback.root.items.measuring.items.measured_r_value.correct < 4 ||
                this.feedback.root.items.t_range.items.range_values < 4)
            {
                fb.points = 0;
                fb.correct = 0;
                this.feedback.addFeedback(fb, 'undef');
                return;
            }
            
            if (this.resistanceAnswer) {
                nominalResistance = this.resistanceAnswer;
            }
            else {
                nominalResistance = this.section.nominal_resistance;
            }
            //var tolerance = this.section.tolerance;
            var tolerance = this.toleranceAnswer;
            
            var displayValue = null;
            if (this.measuredResistanceAnswer) {
                displayValue = this.measuredResistanceAnswer;
            }
            else {
                displayValue = this.section.displayed_resistance;
            }
            var allowance = nominalResistance * tolerance;

            fb.correct = 0;
            fb.points = 0;

            if (displayValue < nominalResistance - allowance ||
                displayValue > nominalResistance + allowance)
            {
                correctAnswer = 'no';
            }
            else {
                correctAnswer = 'yes';
            }

            var did = (correctAnswer === 'no') ? 'did not' : 'did';
            var is = (correctAnswer === 'no') ? 'is not' : 'is';
            
            if (question.answer !== correctAnswer) {
                if (question.correct_answer === correctAnswer) {
                    this.feedback.addFeedback(fb, 'incorrect',
                        unit.res_str(this.measuredResistanceAnswer),
                        unit.res_str(this.rangeMinAnswer),
                        unit.res_str(this.rangeMaxAnswer),
                        did, is);
                }
                else {
                    fb.addFeedback('incorrect_wrong_prev');
                }
                return;
            }
            fb.points = 5;
            fb.correct = 4;

            if (question.correct_answer === correctAnswer) {
                this.feedback.addFeedback(fb, 'correct',
                    unit.res_str(this.measuredResistanceAnswer),
                    unit.res_str(this.rangeMinAnswer),
                    unit.res_str(this.rangeMaxAnswer),
                    did, is);
            }
            else {
                this.feedback.addFeedback(fb, 'correct_wrong_prev');
            }
        },

        gradeTime: function () {
            var seconds;
            var fb;

            this.feedback.reading_time = this.questions[1].end_time - this.questions[0].start_time;
            seconds = this.feedback.reading_time / 1000;
            fb = this.feedback.root.items.time.items.reading;
            if (seconds <= 20) {
                fb.points = 5;
                fb.correct = 4;
                this.feedback.addFeedback(fb, 'efficient');
            }
            else if (seconds <= 40) {
                fb.points = 2;
                fb.correct = 2;
                this.feedback.addFeedback(fb, 'semi');
            }
            else {
                fb.points = 0;
                fb.correct = 0;
                this.feedback.addFeedback(fb, 'slow', Math.round(seconds));
            }

            this.feedback.measuring_time = this.questions[2].end_time - this.questions[2].start_time;
            seconds = this.feedback.measuring_time / 1000;
            fb = this.feedback.root.items.time.items.measuring;
            if (seconds <= 20) {
                fb.points = 5;
                fb.correct = 4;
                this.feedback.addFeedback(fb, 'efficient');
            }
            else if (seconds <= 40) {
                fb.points = 2;
                fb.correct = 2;
                this.feedback.addFeedback(fb, 'semi');
            }
            else {
                fb.points = 0;
                fb.correct = 0;
                this.feedback.addFeedback(fb, 'slow', Math.round(seconds));
            }
        },

        gradeSettings: function () {
            var fb = this.feedback.root.items.measuring;
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
                fb.items.probe_connection.correct = 4;
                fb.items.probe_connection.points = 2;
                fb.items.probe_connection.desc = 'Correct';
                this.feedback.addFeedback(fb.items.probe_connection, 'correct');
            }
            else {
                fb.items.probe_connection.correct = 0;
                fb.items.probe_connection.points = 0;
                fb.items.probe_connection.desc = 'Incorrect';
                this.feedback.addFeedback(fb.items.probe_connection, 'incorrect');
            }
            //console.log('probe_connection.points=' + fb.items.probe_connection.points);

            // Connectin to DMM
            if (redPlugConn == 'voma_port' && blackPlugConn == 'common_port') {
                fb.items.plug_connection.points = 5;
                fb.items.plug_connection.correct = 4;
                fb.items.plug_connection.desc = 'Correct';
                this.feedback.addFeedback(fb.items.plug_connection, 'correct');
            }
            else {
                fb.items.plug_connection.correct = 0;
                if (redPlugConn == 'common_port' && blackPlugConn == 'voma_port') {
                    fb.items.plug_connection.points = 3;
                    fb.items.plug_connection.correct = 3;
                    fb.items.plug_connection.desc = 'Reversed';
                    this.feedback.addFeedback(fb.items.plug_connection, 'reverse');
                }
                else {
                    fb.items.plug_connection.points = 0;
                    fb.items.plug_connection.correct = 0;
                    fb.items.plug_connection.desc = 'Incorrect';
                    this.feedback.addFeedback(fb.items.plug_connection, 'incorrect');
                }
            }
            //console.log('plug_connection.points=' + fb.items.plug_connection.points);

            // DMM knob
            var i_knob = this.parser.initial_dial_setting;
            var f_knob = this.parser.submit_dial_setting;
            var o_knob = this.optimalDial(this.section.displayed_resistance);

            this.feedback.initial_dial_setting = i_knob;
            this.feedback.submit_dial_setting = f_knob;
            this.feedback.optimal_dial_setting = o_knob;

            if (f_knob === o_knob) {
                fb.items.knob_setting.points = 20;
                fb.items.knob_setting.correct = 4;
                this.feedback.addFeedback(fb.items.knob_setting, 'correct');
            }
            else if (this.isResistanceKnob(f_knob)){
                fb.items.knob_setting.points = 10;
                fb.items.knob_setting.correct = 2;
                this.feedback.addFeedback(fb.items.knob_setting, 'suboptimal', o_knob, f_knob);
            }
            else {
                fb.items.knob_setting.points = 0;
                fb.items.knob_setting.correct = 0;
                this.feedback.addFeedback(fb.items.knob_setting, 'incorrect');
            }

            if (this.parser.power_on) {
                fb.items.power_switch.points = 2;
                fb.items.power_switch.correct = 4;
                this.feedback.addFeedback(fb.items.power_switch, 'correct');
            }
            else {
                fb.items.power_switch.points = 0;
                fb.items.power_switch.correct = 0;
                this.feedback.addFeedback(fb.items.power_switch, 'incorrect');
            }
            console.log('power_switch.points=' + fb.items.power_switch.points);

            if (this.parser.correct_order) {
                fb.items.task_order.points = 6;
                fb.items.task_order.correct = 4;
                this.feedback.addFeedback(fb.items.task_order, 'correct');
            }
            else {
                fb.items.task_order.points = 0;
                fb.items.task_order.correct = 0;
                this.feedback.addFeedback(fb.items.task_order, 'incorrect');
            }
            console.log('task_order.points=' + fb.items.task_order.points);
        },

        equalWithTolerance: function (value1, value2, tolerance) {
            return Math.abs(value1 - value2) < tolerance;
        },

        validateNonEmpty: function (inputField, form) {
            if (inputField === null ||
                inputField === undefined ||
                inputField.length < 1)
            {
                form.message = "No Value Entered";
                return false;
            }
            return true;
        },

        validateNumber: function (num, answer) {
            // I don't know if this works correctly IE
            // parseFloat will return all numbers before a non numeric char so 
            // parseFloat('3a') returns 3 which isn't really what we want
            if (isNaN(num)) {
                answer.message = "Value entered is not a number";
                return false;
            }
            return true;
        },

        // True if x rounded to numSig digits equals y
        // Note: the order of x and y is important here
        roundedMatch: function (x, y, numSig) {
            return math.roundToSigDigits(x, numSig) === y;
        },

        // Return true if x and y are equal or different only in one digit
        oneOff: function (x, y) {
            var sx = x.toString();
            var sy = y.toString();
            if (!sx.match(/\./)) {
                sx = sx + '.';
            }
            if (!sy.match(/\./)) {
                sy = sy + '.';
            }
            sx = str.stripZeros(sx);
            sy = str.stripZeros(sy);
            if (sx.length != sy.length) {
                return false;
            }
            var numDiff = 0;
            for (var i = 0; i < sx.length; ++i) {
                if (sx.charAt(i) !== sy.charAt(i)) {
                    numDiff += 1;
                    if (numDiff > 1) {
                        return false;
                    }
                }
            }
            return true;
        },
        
        // A kludge to determine if two number are of same power of 10 magnitude
        // It only compares the number of digits before the decimal point
        // because numbers less than 1 are not expected.
        sameBeforeDot: function (x, y) {
            var lx = String(x).split('.')[0].length;
            var ly = String(y).split('.')[0].length;
            return lx === ly;
        },

        // True if the first numSigDigits digits of x, y are the same 
        // or in reverse order of each other
        // or the order is the same but only 1 digit is different
        semiCorrectDigits: function (x, y, numSigDigits) {
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

        reverseString: function (s) {
            return s.split('').reverse().join('');
        },

        onlyOneDigitDifferent: function (x, y) {
            var numDiff = 0;
            for (var i = 0; i < x.length; ++i) {
                if (x[i] !== y[i]) {
                    ++numDiff;
                }
            }
            return numDiff == 1;
        },

        optimalDial: function (r) {
            if (r < 200) { return 'r_200'; }
            if (r < 2000) { return 'r_2000'; }
            if (r < 20e3) { return 'r_20k'; }
            if (r < 200e3) { return 'r_200k'; }
            return 'r_2000k';
        },

        isResistanceKnob: function (setting) {
            return setting === 'r_200' ||
                setting === 'r_2000' ||
                setting === 'r_20k' ||
                setting === 'r_200k';
        }
    };

})();
