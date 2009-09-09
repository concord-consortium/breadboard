function one(){
  my_var = {}
  my_var['hi'] = "hello from one"
  two()
  $("#result_1").html(my_var.hi)
}

function two(){
  my_var.hi  = "hello from two"
}

$(document).ready(function(){
   one()
   two()  
 })
