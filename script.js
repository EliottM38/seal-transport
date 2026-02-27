fetch("passages.json")
.then(r=>r.json())
.then(data=>{
 const c=document.getElementById("passages");
 data.forEach(p=>{
  const d=document.createElement("div");
  d.innerHTML="Ligne "+p.ligne+" → "+p.minutes+" min";
  c.appendChild(d);
 });
});
