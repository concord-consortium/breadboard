// setup a global namespace to store page variables
jQuery.sparks = {}

// parse the page params so things can be customized
var value = null;
value = jQuery.url.param("model_height");
jQuery.sparks.modelHeight = value != null ? value : '560';

jQuery.sparks.debug = jQuery.url.param("debug") != null

jQuery.sparks.allResults = []

function buttonClicked(event){
  var form = jQuery(event.target).parent()
  disableForm(form)
  var nextForm = form.nextAll("form:first")
  if(nextForm.size() == 0){
    completedTry()
  } else {
    enableForm(nextForm)
  }
}

function completedTry(){
  var result2 = {}
  var formData = $("form").each(function (i){
    var form = jQuery(this)
    result2[this.id] = serializeForm(form)
  })
  jQuery.sparks.allResults.push(result2)

  if(jQuery.sparks.debug) {  
    var resultString = jQuery.map(jQuery.sparks.allResults, function(el, i){
      return jQuery.toJSON(el)
    }).join("<br\>")
  
    $("#result").html("<pre>"+resultString+"</pre>")
  }

  // indication of correctness next to each item
  // show contextual help
  // cycle through the results using the name of each to find
  // the form and then add an icon next to the form
  
  // rated resistance
  gradeResistance(result2.rated_resistance, jQuery.sparks.activity.resistor.nominalValue)

  for (var item in result2) {  
    updateItem(result2, item) 
  }  

  if(jQuery.sparks.allResults.length < 3) {
    $(".next_button").each(function(){
      this.disabled = false
    }).show()
  } else {
    $(".next_button").hide()
    $(".show_report_button").show()    
  }      
}

function updateItem(result, name) {
  var itemForm = $("#" + name);
  var titleText = ""
  if(result[name].message){
    titleText = "title='" + result[name].message + "' ";
  }
  
  if(result[name].correct){
    itemForm.prepend("<img class='grade' src='../../icons/ok.png' " + titleText + "/>")    
  } else {
    itemForm.prepend("<img class='grade' src='../../icons/cancel.png' " + titleText + "/>")
  }  
}

function gradeResistance(answer, correctValue){
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

function startTry(){
  // reset fields to their initial value
  $("form").each(function (i){ this.reset()})
  
  // This is an alternative, but it doesn't do the right thing with some form input elements
  // $("form").map(function (){ return jQuery.makeArray(this.elements)})
  // .each(function (i){ $(this).val(null)})
  // for a better example see: http://www.learningjquery.com/2007/08/clearing-form-data
  
  // clear the grading icons
  $(".grade").remove()
  
  // hide the contextual help  

  // generate the resistor numbers
  // display them on the page so people can see it working
  // this is defined in javascript/resistor_activity.js
  var activity = getActivity()
  var resistor = activity.resistor
  
  // re randomzie the resistor
  resistor.randomize()
    
  if(jQuery.sparks.debug){
    model = $("#rcc_model")      
    model.append("<div>" +
      "Nominal Value: " + resistor.nominalValue + "<br/>" +
      "Tolerance: " + resistor.tolerance + "<br/>" +
      "Real Value: " + resistor.realValue + "<br/>" +
      "</div>")
  }
  
  form = $("form:first")
  enableForm(form)     
}

function enableForm(form){
  form.append("<button>Submit</button>")
  form.find("button").click(buttonClicked) 
  form.find("input, select").removeAttr("disabled")
  form.css("background-color", "rgb(253,255,184)")
  form.find("input[name='start_time']").attr("value", "" + (new Date()).getTime())
}

function disableForm(form){
  form.find("input[name='stop_time']").attr("value", "" + (new Date()).getTime())
  form.find("button").remove() 
  form.find("input, select").attr("disabled", "true")
  form.css("background-color", "")
}

/**
   The initial version of this was copied from the serializeArray method of jQuery
 this version returns a result object and uses the names of the input elements
 as the actual keys in the result object.  This requires more careful naming but it
 makes using the returned object easier.  It could be improved to handle dates and
 numbers perhaps using style classes to tag them as such.
 */
function serializeForm(form){
  result = {}
  form.map(function(){
    return this.elements ? jQuery.makeArray(this.elements) : this;
  })
  .filter(function(){
    return this.name &&
      (this.checked || /select|textarea/i.test(this.nodeName) ||
       /text|hidden|password|search/i.test(this.type));
  })
  .each(function(i){
    var val = jQuery(this).val();
    if(val == null){
      return;
    }
    
    if(jQuery.isArray(val)){
      result[this.name] = jQuery.makeArray(val)
    } else {
      result[this.name] = val;
    }
  })
  return result;
}


function nextButtonClick(event){
  $(".next_button").each(function(i){
    this.disabled = true;
  })
  startTry()
}

function showReportClick(event){
  $("#report").dialog('open')
}

$(document).ready(function(){
   // disable all form elements
   $("input, select").attr("disabled", "true")

   // hide the next buttons and their listeners
   $(".next_button").hide().click(nextButtonClick)

   // hide the show report buttons
   $(".show_report_button").hide().click(showReportClick)
 
   // add start and stop times to all forms
   $("form").append(
     "<input name='start_time' type='hidden'></input><input name='stop_time' type='hidden'></input>")   

   $("#start_button").click(function(event){
     jQuery(event.target).hide()
     startTry()
   })   
   
   $(".next_button").hide().click(nextButtonClick)
   
   $("#report").load("fake-report/report.html").dialog({autoOpen: false})
   
 });
