function gradeResistance(answer, correctValue) {
    // rated resistance
    answer.message = "Unknown Error";
    answer.correct = false;
    
    if(answer.value == null || answer.value.length < 1) {
        answer.message = "No Value Entered";
        return;
    }

    // I don't know if this works correctly IE
    // parseFloat will return all numbers before a non numeric char so 
    // parseFloat('3a') returns 3 which isn't really what we want
    value_num = Number(answer.value)
    if(isNaN(value_num)){
        answer.message = "Value entered is not a number";
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

function gradeTolerance(answer, correctValue) {
    answer.message = "Unknown Error";
    answer.correct = false;
    
    if(answer.value == null || answer.value.length < 1) {
        answer.message = "No Value Entered";
        return;
    }

    value_num = Number(answer.value);
    if(isNaN(value_num)){
        answer.message = "Value entered is not a number";
        return;
    }
    
    if(correctValue != value_num / 100.0){
        answer.message = "The entered value is incorrect.";
        return;
    }
    
    answer.correct = true;
    answer.message = "Correct";
}
