/* global document, math */

var btn = document.getElementById("btn");



btn.addEventListener('click', function(){
    var d = document.getElementById("d").value;
    var D = document.getElementById("D").value;
	var Lresult = (1.25663706*Math.pow(10,-6))*(1.0)*((D*Math.pow(10,-3))/2.0)*((Math.log(8.0*(D*Math.pow(10,-3))/(d*Math.pow(10,-3))))-2.0);

    
    
    var f = document.getElementById("f").value;
    //var L = document.getElementById("L").value;
	
	var fmag = document.getElementById("f_dropdown");
	var f_dropdown = fmag.value;
	//var Lmag = document.getElementById("L_dropdown");
	//var L_dropvalue = Lmag.value;
	var Cresult;


    switch(f_dropdown){
        case "0":
            Cresult = (1/(4*(Math.pow(Math.PI,2))*(Math.pow(f*Math.pow(10,3),2))*(Lresult)));
            break;
        case "1":
            Cresult = (1/(4*(Math.pow(Math.PI,2))*(Math.pow(f*Math.pow(10,6),2))*(Lresult)));
            break;
        case "2":
            Cresult = (1/(4*(Math.pow(Math.PI,2))*(Math.pow(f*Math.pow(10,9),2))*(Lresult)));
            break;
        case "3":
            Cresult = (1/(4*(Math.pow(Math.PI,2))*(Math.pow(f*Math.pow(10,12),2))*(Lresult)));
    }

    Lresult = math.format(Lresult, {notation: 'engineering'});
    document.getElementById("L").innerHTML = "L = "+ Lresult +" H";
	Cresult = math.format(Cresult, {notation: 'engineering'});
	document.getElementById("C").innerHTML = "C = "+ Cresult +" F";
});