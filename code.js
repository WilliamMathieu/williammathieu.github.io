const btn= document.getElementById("btn");

btn.addEventListener('click', function(){
  var f = document.getElementById("f").value;
  var L = document.getElementById("L").value;
  document.getElementById("C").innerHTML = "C = "+ (1/(4*(Math.PI**2)*(f**2)*L)) +" F";
});
