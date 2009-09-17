function Grader(activity)
{
    this.activity = activity;
    
    this.grade = function(resultObject) {
        console.log('ENTER Grader.grade');
        var multimeter = this.activity.multimeter;
        var resistor = this.activity.resistor;
        
        this.gradeResistance(resultObject.rated_resistance,
                resistor.nominalValue);
        this.gradeTolerance(resultObject.rated_tolerance, resistor.tolerance);
        this.gradeResistance(resultObject.measured_resistance,
                multimeter.getDisplayValue(resistor.realValue));
        this.gradeToleranceRange(resultObject.measured_tolerance,
                resistor.nominalValue, resistor.tolerance);
    }
    
    this.gradeResistance = function(answer, correctValue) {
        answer.message = "Unknown Error";
        answer.correct = false;
        
        if (!this.validateNonEmpty(answer.value, answer)) {
            return;
        }
        
        var value_num = Number(answer.value)
        if (!this.validateNumber(value_num)){
            return;
        }
        
        if(answer.units == null || 
             answer.units.length < 1){
             answer.message = "No Unit Entered";
             return;
        }
        
        var multiplier = -1
        
        switch (answer.units) {
        case 'Ohms':
            multiplier = 1;
            break;
        case 'KOhms':
            multiplier = 1000;
            break;
        case 'MOhms':
            multiplier = 1000000;
            break;
        default:
            answer.message = "Incorrect Unit";
            return;
        }    
        
        parsed_value = value_num * multiplier;
        
        if(correctValue != parsed_value){
            answer.message = "The entered value or unit is incorrect.";
            return;
        }
        
        answer.correct = true;
        answer.message = "Correct";
    }
    
    this.gradeTolerance = function(answer, correctValue) {
        answer.message = "Unknown Error";
        answer.correct = false;
        
        if (!this.validateNonEmpty(answer.value, answer)) {
            return;
        }

        var value_num = Number(answer.value);
        if (!this.validateNumber(value_num)) {
            return;
        }
        
        if(correctValue != value_num / 100.0){
            answer.message = "The entered value is incorrect.";
            return;
        }
        
        answer.correct = true;
        answer.message = "Correct";
    }
    
    this.gradeToleranceRange = function(answer, nominalResistance, tolerance) {
        console.log('ENTER Grader.gradeToleranceRange');
        answer.message = "Unknown Error";
        answer.correct = false;

        if (!this.validateNonEmpty(answer.min, answer) || !this.validateNonEmpty(answer.max, answer)) {
            return;
        }

        var min = Number(answer.min);
        var max = Number(answer.max);
        
        if (!this.validateNumber(min) || !this.validateNumber(max)) {
            return;
        }
        
        var correctMin = nominalResistance * (1 - tolerance);
        var correctMax = nominalResistance * (1 + tolerance);
        
        console.log('correct min=' + correctMin + ' max=' + correctMax);
        console.log('submitted min=' + min + ' max=' + max);
        
        if (equalWithTolerance(min, correctMin, 1e-6) &&
            equalWithTolerance(max, correctMax, 1e-6))
        {
            answer.correct = true;
            answer.message = "Correct";
        }
        return;
    }
    
    this.equalWithTolerance = function(value1, value2, tolerance) {
        return Math.abs(value1 - value2) < tolerance;
    }
    
    this.validateNonEmpty = function(inputField, form) {
        if (inputField == null || inputField.length < 1) {
            form.message = "No Value Entered";
            return false;
        }
        return true;;
    }
    
    this.validateNumber = function(num) {
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
