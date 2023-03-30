const btn= document.getElementById("btn");

btn.addEventListener('click', function(){
  var C = document.getElementById("C").value;
  var L = document.getElementById("L").value;
  var f_result = (1/(2*Math.PI*((L*C)**(0.5))));
	document.getElementById("f").innerHTML = "f = "+ f_result +" Hz";
});