const btn = document.getElementById("btn");

btn.addEventListener('click', function(){
  var d = document.getElementById("d").value;
  var D = document.getElementById("D").value;
	var Lresult = (1.25663706*10**-6)*(1.0)*((D*10**-3)/2)*((Math.log(8.0*(D*10**-3)/(d*10**-3)))-2.0);
  document.getElementById("L").innerHTML = "L = "+ Lresult +" H";
});