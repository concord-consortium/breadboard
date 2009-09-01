function buttonClicked(event){
  form = jQuery(event.target).parent()
  disableForm(form)
  nextForm = form.nextAll("form:first")
  enableForm(nextForm)
}

function enableForm(form){
  form.append("<button>Submit</button>")
  form.find("button").click(buttonClicked) 
  form.find("input, select").removeAttr("disabled")
  form.css("background-color", "rgb(253,255,184)")
  form.find("input[name='start_time']").text("" + (new Date()).getTime())
}

function disableForm(form){
  form.find("input[name='stop_time']").text("" + (new Date()).getTime())
  form.find("button").remove() 
  form.find("input, select").attr("disabled", "true")
  form.css("background-color", "")
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
