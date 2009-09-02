function buttonClicked(event){
  form = jQuery(event.target).parent()
  disableForm(form)
  nextForm = form.nextAll("form:first")
  if(nextForm.size() == 0){
    completed()
  } else {
    enableForm(nextForm)
  }
}

function completed(){
  result2 = {}
  formData = $("form").each(function (i){
    form = jQuery(this)
    result2[this.id] = serializeForm(form)
  })
  $("#result").append("<pre>"+$.toJSON(result2)+"</pre>")  
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


$(document).ready(function(){
   // disable all form elements
   $("input, select").attr("disabled", "true")

   // add start and stop times to all forms
   $("form").append(
     "<input name='start_time' type='hidden'></input><input name='stop_time' type='hidden'></input>")   

   button = $("button[name='start']").click(function(event){
     form = $("form:first")
     enableForm(form)     
   })
 });
