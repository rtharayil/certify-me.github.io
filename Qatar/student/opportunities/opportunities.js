
/* Save button */
const saveBtn = document.getElementById("saveBtn");
let saved = false;

saveBtn.addEventListener("click", function(){
  saved = !saved;

  this.querySelector("span").textContent =
    saved ? "Saved" : "Save Opportunity";

  this.style.background =
    saved ? "#e9f7f2" : "#fff";

  this.style.color =
    saved ? "#087e6e" : "#151d2a";
});

/* Apply button */
document.getElementById("applyBtn").addEventListener("click", function(){
  alert("Application started for QF Sustainability Foundations Workshop.");
});
