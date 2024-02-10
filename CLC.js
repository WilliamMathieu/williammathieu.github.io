/* global document, math */

var btn = document.getElementById("btn");

btn.addEventListener('click', function(){
  var f = document.getElementById("f").value;
  var L = document.getElementById("L").value;
	
	var fmag = document.getElementById("f_dropdown");
	var f_dropdown = fmag.value;
	var Lmag = document.getElementById("L_dropdown");
	var L_dropvalue = Lmag.value;
	var Cresult;
	switch(f_dropdown){
		case "0":
			switch(L_dropvalue){
				case "10":
					Cresult = (1/(4*(Math.pow(Math.PI,2))*(Math.pow(f*Math.pow(10,3),2))*(L*Math.pow(10,-6))));
					break;
				case "20":
					Cresult = (1/(4*(Math.pow(Math.PI,2))*(Math.pow(f*Math.pow(10,3),2))*(L*Math.pow(10,-9))));
					break;
				case "30":
					Cresult = (1/(4*(Math.pow(Math.PI,2))*(Math.pow(f*Math.pow(10,3),2))*(L*Math.pow(10,-12))));
			}
			break;
		case "1":
			switch(L_dropvalue){
				case "10":
					Cresult = (1/(4*(Math.pow(Math.PI,2))*(Math.pow(f*Math.pow(10,6),2))*(L*Math.pow(10,-6))));
					break;
				case "20":
					Cresult = (1/(4*(Math.pow(Math.PI,2))*(Math.pow(f*Math.pow(10,6),2))*(L*Math.pow(10,-9))));
					break;
				case "30":
					Cresult = (1/(4*(Math.pow(Math.PI,2))*(Math.pow(f*Math.pow(10,6),2))*(L*Math.pow(10,-12))));
			}
			break;
		case "2":
			switch(L_dropvalue){
				case "10":
					Cresult = (1/(4*(Math.pow(Math.PI,2))*(Math.pow(f*Math.pow(10,9),2))*(L*Math.pow(10,-6))));
					break;
				case "20":
					Cresult = (1/(4*(Math.pow(Math.PI,2))*(Math.pow(f*Math.pow(10,9),2))*(L*Math.pow(10,-9))));
					break;
				case "30":
					Cresult = (1/(4*(Math.pow(Math.PI,2))*(Math.pow(f*Math.pow(10,9),2))*(L*Math.pow(10,-12))));
			}
			break;
		case "3":
			switch(L_dropvalue){
				case "10":
					Cresult = (1/(4*(Math.pow(Math.PI,2))*(Math.pow(f*Math.pow(10,12),2))*(L*Math.pow(10,-6))));
					break;
				case "20":
					Cresult = (1/(4*(Math.pow(Math.PI,2))*(Math.pow(f*Math.pow(10,12),2))*(L*Math.pow(10,-9))));
					break;
				case "30":
					Cresult = (1/(4*(Math.pow(Math.PI,2))*(Math.pow(f*Math.pow(10,12),2))*(L*Math.pow(10,-12))));
			}
			break;
		default:
			Cresult = "ERROR";
	}
	
	Cresult = math.format(Cresult, {notation: 'engineering'});
	document.getElementById("C").innerHTML = "C = "+ Cresult +" F";
});