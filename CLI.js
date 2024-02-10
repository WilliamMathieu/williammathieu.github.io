/* global document, math */

var btn = document.getElementById("btn");

btn.addEventListener('click', function(){
  var d = document.getElementById("d").value;
  var D = document.getElementById("D").value;
	var Lresult = (1.25663706*Math.pow(10,-6))*(1.0)*((D*Math.pow(10,-3))/2.0)*((Math.log(8.0*(D*Math.pow(10,-3))/(d*Math.pow(10,-3))))-2.0);
	Lresult = math.format(Lresult, {notation: 'engineering'});
  document.getElementById("L").innerHTML = "L = "+ Lresult +" H";
});