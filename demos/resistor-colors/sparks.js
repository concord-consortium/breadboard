var allResults = []

function buttonClicked(event){
  form = jQuery(event.target).parent()
  disableForm(form)
  nextForm = form.nextAll("form:first")
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
  allResults.push(result2)
  
  var resultString = jQuery.map(allResults, function(el, i){
    return jQuery.toJSON(el)
  }).join("<br\>")
  
  $("#result").html("<pre>"+resultString+"</pre>")

  // indication of correctness next to each item
  // show contextual help
  // cycle through the results using the name of each to find
  // the form and then add an icon next to the form
  for (var item in result2) {
    $("#" + item).prepend("<img class='grade' src='../../icons/ok.png'/>")
  }  

  if(allResults.length < 3) {
    $(".next_button").each(function(){
      this.disabled = false
    }).show()
  } else {
    $(".next_button").hide()
    $(".show_report_button").show()    
  }      
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
  $("#report").html("<h3>Report Goes Here</h3>")
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
 });
