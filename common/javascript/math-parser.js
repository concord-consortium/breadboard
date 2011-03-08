(function () {

    this.sparks.mathParser = {};
    
    var p = sparks.mathParser;
    
    p.calculateMeasurement = function(answer){
      if (answer === undefined || answer === null || answer === ""){
        return "";
      }
      if (!isNaN(Number(answer))){
        return answer;
      }
      
      answer = ""+answer;
        
      var sumPattern = /\[[^\]]+\]/g  // find anything between [ ]
      var matches= answer.match(sumPattern);
      if (!!matches){      	
        $.each(matches, function(i, match){
          var expression = match;
          var result = p.calculateSum(expression);
          answer = answer.replace(match,result);
        });
      }
      
      // now we have e.g. "1000 V"
      
      answer = sparks.unit.convertMeasurement(answer);   // convert 1000 V to 1 kiloV, for instance
       
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
      When passed a string such as "100 + ${r1.resistance} / ${r2.nominalResistance}"
      this will first substitute the actual values of the variables in ${...}, assuming
      the components and their properties exist in the circuit, and then perform the
      calculation.
    */
   p.calculateSum = function(sum){
   	  var varPattern = /\${[^}]+}/g  //  ${ X } --> value of X
      var matches = sum.match(varPattern);
      if(!!matches){
       $.each(matches, function(i, match){
        var variable = match.substring(2,match.length-1).split('.');
        var component = variable[0];
        var property = variable[1];
        
        var components = getBreadBoard().components; 
        
        if (!components[component]){
          console.log("ERROR calculating sum: No component name '"+component+"' in circuit");
          sum = -1;
          return;
        }
        
        if (components[component][property] === undefined || components[component][property] === null){
          console.log("ERROR calculating sum: No property name '"+property+"' in component '"+component+"'");
          sum = -1;
          return;
        }
        
        var value = components[component][property];
        sum = sum.replace(match, value);
       });
      }
      
      var calculatedSum = eval(sum);
      if (!isNaN(Number(calculatedSum))){
        return calculatedSum;
      }
      
      console.log("ERROR calculating Sum: Cannot compute the value of "+sum);
      return -1;
   };


})();