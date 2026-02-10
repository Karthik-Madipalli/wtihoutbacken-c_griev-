let complaints = JSON.parse(localStorage.getItem("complaints")) || [];

// HOME COUNTS
function loadStats(){
document.getElementById("total").innerText = complaints.length;
document.getElementById("solved").innerText = complaints.filter(c=>c.status=="Solved").length;
document.getElementById("progress").innerText = complaints.filter(c=>c.status=="In Progress").length;
}

// LOGIN
let role="student";

function setRole(r){
role=r;
document.getElementById("email").placeholder =
r=="student" ? "Enter Student Username" : "Enter Staff Username";
}

function login(){
localStorage.setItem("role",role);
if(role=="student") location="student.html";
else location="staff.html";
}

// ADD COMPLAINT
function addComplaint(){
let c={
id:Date.now(),
title:title.value,
desc:desc.value,
category:category.value,
status:"In Progress",
img:URL.createObjectURL(photo.files[0])
};

complaints.push(c);
localStorage.setItem("complaints",JSON.stringify(complaints));
alert("Complaint Registered");
location="student.html";
}

// STUDENT SEARCH
function searchComplaint(){
let id=document.getElementById("search").value;
let c=complaints.find(x=>x.id==id);

if(c) alert("Status: "+c.status);
else alert("Not Found");
}

// STAFF LOAD
function loadStaff(){
let box=document.getElementById("staffBox");
box.innerHTML="";

complaints.forEach((c,i)=>{
box.innerHTML+=`
<div class="block">
<h3>${c.title}</h3>
<p>${c.desc}</p>
<img src="${c.img}" width="150"><br>
<button onclick="solve(${i})">Solved</button>
</div>`;
});
}

function solve(i){
complaints[i].status="Solved";
localStorage.setItem("complaints",JSON.stringify(complaints));
loadStaff();
}
