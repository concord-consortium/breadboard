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
        var questions =  this.log.sections[sectionNum-1].questions;
        
        var multimeter = this.activity.multimeter;
        var resistor = this.activity.resistor;
        
        this.gradeResistance(questions[0], resultObject.rated_resistance,
                resistor.nominalValue);
        this.gradeTolerance(questions[1], resultObject.rated_tolerance, resistor.tolerance);
        this.gradeResistance(questions[2], resultObject.measured_resistance,
                multimeter.makeDisplayText(resistor.realValue));
        this.gradeToleranceRange(questions[3], resultObject.measured_tolerance,
                resistor.nominalValue, resistor.tolerance);
        this.gradeWithinTolerance(questions[4], resultObject.within_tolerance, resistor);
        this.gradeTime();
    },
    
    gradeResistance : function(question, formAnswer, correctValue) {
        formAnswer.message = "Unknown Error";
        formAnswer.correct = false;
        question.correct_answer = String(correctValue);
        question.answer = formAnswer.value;
        question.unit = formAnswer.units;
        question.correct = false;
        
        if (!this.validateNonEmpty(formAnswer.value, formAnswer)) {
            return;
        }
        
        var valueNum = Number(formAnswer.value);
        if (!this.validateNumber(valueNum, formAnswer)) {
            return;
        }
        
        if (formAnswer.units == null || formAnswer.units.length < 1) {
             formAnswer.message = "No Unit Entered";
             return;
        }
        
        var multiplier = -1
        
        console.log('unit=' + formAnswer.units);
        
        if (!Unit.ohmCompatible(formAnswer.units)) {
            formAnswer.message = "Incorrect Unit";
            return;
        }   
        var parsedValue = Unit.normalizeToOhms(valueNum, formAnswer.units);
        
        console.log('parsedValue=' + parsedValue + ' correctValue=' + correctValue);
        
        if(correctValue != parsedValue){
            formAnswer.message = "The entered value or unit is incorrect.";
            return;
        }
        
        formAnswer.correct = true;
        formAnswer.message = "Correct";
        question.correct = true;
    },
    
    gradeTolerance : function(question, answer, correctValue) {
        answer.message = "Unknown Error";
        answer.correct = false;
        question.correct_answer = String(correctValue);
        question.answer = answer.value;
        question.unit = '%';
        question.correct = false;
        
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
    },
    
    gradeToleranceRange : function(question, answer, nominalResistance, tolerance) {
        console.log('ENTER Grader.gradeToleranceRange');
        
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
        
        if (!this.validateNumber(min, answer) || !this.validateNumber(max.answer)) {
            return;
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
        
        if (this.equalWithTolerance(parsedMin, correctMin, 1e-6) &&
            this.equalWithTolerance(parsedMax, correctMax, 1e-6))
        {
            answer.correct = true;
            answer.message = "Correct";
            question.correct = true;
        }
        return;
    },
    
    gradeWithinTolerance : function(question, answer, resistor) {
        var correctAnswer;
        var tolerance = resistor.nominalValue * resistor.tolerance;
        
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
    },
    
    gradeTime : function() {
        var rated_r_labels = ['rated_r1_time', 'rated_r2_time', 'rated_r3_time'];
        
        for (var i in this.log.sections) {
            var question = this.log.sections[i].questions[0]
            var seconds = (question.end_time - question.start_time) / 1000;
            var feedbackItem = this.feedback[rated_r_labels[i]];
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
        
        var rated_t_labels = ['rated_t1_time', 'rated_t2_time', 'rated_t3_time'];
        
        for (var i in this.log.sections) {
            var question = this.log.sections[i].questions[1]
            var seconds = (question.end_time - question.start_time) / 1000;
            var feedbackItem = this.feedback[rated_t_labels[i]];
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
        
        var measured_r_labels = ['measured_r1_time', 'measured_r2_time', 'measured_r3_time'];
        
        for (var i in this.log.sections) {
            var question = this.log.sections[i].questions[2]
            var seconds = (question.end_time - question.start_time) / 1000;
            var feedbackItem = this.feedback[measured_r_labels[i]];
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
    
    equalWithTolerance : function(value1, value2, tolerance) {
        return Math.abs(value1 - value2) < tolerance;
    },
    
    validateNonEmpty : function(inputField, form) {
        if (inputField == null || inputField.length < 1) {
            form.message = "No Value Entered";
            return false;
        }
        return true;;
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
    }
}
