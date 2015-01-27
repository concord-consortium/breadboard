var unit                  = require('./unit');

mathParser = {};

var p = mathParser;

p.standardizeUnits = function(string) {
  string = string.replace(/ohms/gi,"&#x2126;");
  string = string.replace("micro","&#x00b5;");
  string = string.replace("milli","m");
  string = string.replace("kilo","k");
  string = string.replace("mega","M");
  return string;
};

module.exports = mathParser;
