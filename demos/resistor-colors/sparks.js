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
}

function disableForm(form){
  form.find("button").remove() 
  form.find("input, select").attr("disabled", "true")
  form.css("background-color", "")
}

$(document).ready(function(){
   $("input, select").attr("disabled", "true")

   form = $("form:first")
   enableForm(form)
 });
