document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.querySelector(".back");
  if (backBtn) backBtn.addEventListener("click", () => { window.location.href = "../student/student.html"; });

  const tabs = document.querySelectorAll(".tab");
  const panels = {
    overview: document.getElementById("overview"),
    details: document.getElementById("details"),
    path: document.getElementById("path")
  };
  tabs.forEach(tab => tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    Object.values(panels).forEach(p => p.classList.add("hidden-panel"));
    panels[tab.dataset.tab].classList.remove("hidden-panel");
  }));

  const edit = document.getElementById("editGoal");
  const goalEdit = document.getElementById("goalEdit");
  if (edit && goalEdit) {
    edit.addEventListener("click", e => {
      e.stopPropagation();
      goalEdit.classList.toggle("show");
      edit.textContent = goalEdit.classList.contains("show") ? "Done" : "Edit Goal";
    });
  }
});
