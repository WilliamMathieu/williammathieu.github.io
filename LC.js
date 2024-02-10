/* global document, math */

var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var C = document.getElementById("C").value;
  var L = document.getElementById("L").value;
	
	var e = document.getElementById("H_dropdown");
	var H_dropvalue = e.value;
	var f = document.getElementById("F_dropdown");
	var F_dropvalue = f.value;
	var f_result;
	switch(H_dropvalue){
		case "1":
			switch(F_dropvalue){
				case "10":
					f_result = (1/(2*Math.PI*(Math.pow((L*Math.pow(10,-6)*C*Math.pow(10,-6)),0.5))));
					break;
				case "20":
					f_result = (1/(2*Math.PI*(Math.pow((L*Math.pow(10,-6)*C*Math.pow(10,-9)),0.5))));
					break;
				case "30":
					f_result = (1/(2*Math.PI*(Math.pow((L*Math.pow(10,-6)*C*Math.pow(10,-12)),0.5))));
			}
			break;
		case "2":
			switch(F_dropvalue){
				case "10":
					f_result = (1/(2*Math.PI*(Math.pow((L*Math.pow(10,-9)*C*Math.pow(10,-6)),0.5))));
					break;
				case "20":
					f_result = (1/(2*Math.PI*(Math.pow((L*Math.pow(10,-9)*C*Math.pow(10,-9)),0.5))));
					break;
				case "30":
					f_result = (1/(2*Math.PI*(Math.pow((L*Math.pow(10,-9)*C*Math.pow(10,-12)),0.5))));
			}
			break;
		case "3":
			switch(F_dropvalue){
				case "10":
					f_result = (1/(2*Math.PI*(Math.pow((L*Math.pow(10,-12)*C*Math.pow(10,-6)),0.5))));
					break;
				case "20":
					f_result = (1/(2*Math.PI*(Math.pow((L*Math.pow(10,-12)*C*Math.pow(10,-9)),0.5))));
					break;
				case "30":
					f_result = (1/(2*Math.PI*(Math.pow((L*Math.pow(10,-12)*C*Math.pow(10,-12)),0.5))));
			}
			break;
		default:
			f_result = "ERROR";
	}
	//let x = new BigNumber(f_result);
	//BigNumber.config({ ENGINEERING: true });
	//x.toExponential();
	//f_result = Number.parseFloat(f_result).toExponential(5);
	f_result = math.format(f_result, {notation: 'engineering'});
	document.getElementById("f").innerHTML = "f = "+ f_result +" Hz";
});