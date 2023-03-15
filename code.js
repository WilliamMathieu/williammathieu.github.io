const btn= document.getElementById("btn");

btn.addEventListener('click', function(){
  var num1 = document.getElementById("num1").value;
  var num2 = document.getElementById("num2").value;
  document.getElementById("result").innerHTML = "Result = "+ num1*num2;
});
