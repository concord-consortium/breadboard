var unit        = require('./unit'),
    Breadboard  = require('../circuit/breadboard');

mathParser = {};

var p = mathParser;

p.calculateMeasurement = function(sum){
  if (sum === undefined || sum === null || sum === ""){
    return "";
  }
  if (!isNaN(Number(sum))){
    return sum;
  }

  answer = ""+sum;

  var sumPattern = /\[[^\]]+\]/g  // find anything between [ ]
  var matches= answer.match(sumPattern);
  if (!!matches){
    $.each(matches, function(i, match){
      var expression = match;
      var result = p.calculateSum(expression.substring(1, expression.length-1));
      answer = answer.replace(match,result);
    });
  }

  // now we have e.g. "1000 V"

  answer = unit.convertMeasurement(answer);   // convert 1000 V to 1 kiloV, for instance

  answer = p.standardizeUnits(answer);

  return answer;
};

p.standardizeUnits = function(string) {
  string = string.replace(/ohms/gi,"&#x2126;");
  string = string.replace("micro","&#x00b5;");
  string = string.replace("milli","m");
  string = string.replace("kilo","k");
  string = string.replace("mega","M");
  return string;
};


/*
  When passed a string such as "100 + r1.resistance / r2.nominalResistance"
  this will first assign variables for components r1 & r2, assuming
  the components and their properties exist in the circuit, and then perform the
  calculation.
*/
p.calculateSum = function(sum){
  sum = p.replaceCircuitVariables(sum);

  var calculatedSum = eval(sum);

  return calculatedSum;
};


p.replaceCircuitVariables = function(formula){

  // first add all the components as circuit variables at the start of the script
  // add all breadboard components as variables
  $.each(Breadboard.getBreadBoard().components, function(i, component){
    formula = "var " + i + " = Breadboard.getBreadBoard().components['"+i+"']; " + formula;
  });

  // add the breadboard itself as a variable
  formula = "var breadboard = Breadboard.getBreadBoard(); " + formula;

  // then support old method of accessing circuit variables using ${...}
  // NOTE: This is obsolete (but tested)
  var varPattern = /\${[^}]+}/g  //  ${ X } --> value of X
  var matches = formula.match(varPattern);
  if(!!matches){
   $.each(matches, function(i, match){
    console.log("WARN: It is not necessary to use the notation '"+match+"', you can simply use "+match.substring(2,match.length-1))
    var variable = match.substring(2,match.length-1).split('.');
    var component = variable[0];
    var property = variable[1];

    var components = Breadboard.getBreadBoard().components;

    if (!components[component]){
      console.log("ERROR calculating sum: No component name '"+component+"' in circuit");
      formula = '-1';
      return;
    }

    if (components[component][property] === undefined || components[component][property] === null){
      console.log("ERROR calculating sum: No property name '"+property+"' in component '"+component+"'");
      formula = '-1';
      return;
    }

    var value = components[component][property];
    formula = formula.replace(match, value);
   });
  }

  return formula;
};

module.exports = mathParser;
