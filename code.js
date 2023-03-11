const btn= document.getElementById("btn");

btn.addEventListener('click', function(){
  var name = document.getElementById("myName").value;
  document.getElementById("name").innerHTML = "Your text is: "+ name;
});
