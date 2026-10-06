(function () {
  "use strict";

  var sources = {
    sis: {
      title: "Award authority begins with the institution.",
      description: "Approved award and learner references can inform credential access and the issuer’s defined claim. The institution determines which source is authoritative and which fields may be used.",
      route: "Access → Standards → Trust → Skills → Learner record → Workforce intelligence",
      layers: [1, 2, 3, 4, 5, 6]
    },
    learning: {
      title: "Learning activity becomes achievement evidence.",
      description: "Selected course completion and learning-outcome evidence can support an award. The institution defines its criteria; approved skill mappings and connected records can give that achievement additional context.",
      route: "Access → Standards → Trust → Skills → Learner record → Workforce intelligence",
      layers: [1, 2, 3, 4, 5, 6]
    },
    assessment: {
      title: "Assessment evidence gives an achievement meaning.",
      description: "Institution-approved results, criteria or evidence can inform what a credential asserts. Structured claims can be represented against standards, checked through trust mechanisms and connected to reviewed skills.",
      route: "Standards → Trust → Skills → Learner record → Workforce intelligence",
      layers: [2, 3, 4, 5, 6]
    },
    experience: {
      title: "Learning happens beyond the course boundary.",
      description: "Research, service and co-curricular activity may contribute to institutional recognition when the institution defines and approves the achievement. That recognition can be made accessible and connected with other learner evidence.",
      route: "Access → Standards → Trust → Skills → Learner record → Workforce intelligence",
      layers: [1, 2, 3, 4, 5, 6]
    },
    career: {
      title: "Workforce context can meet reviewed learning evidence.",
      description: "Separately sourced occupation and job information can add context to structured skills and learner evidence. It complements institutional judgement; it does not decide what an academic achievement means.",
      route: "Standards → Trust → Skills → Learner record → Workforce intelligence",
      layers: [2, 3, 4, 5, 6]
    },
    workflow: {
      title: "The connection follows the agreed institutional workflow.",
      description: "Evidence may enter through a configured workflow, an API or another scoped method agreed for the use case. The source, fields, approvals and connection approach are established during discovery—not assumed in advance.",
      route: "Access → Standards → Trust → Skills → Learner record → Workforce intelligence",
      layers: [1, 2, 3, 4, 5, 6]
    }
  };

  function init(root) {
    var buttons = Array.prototype.slice.call(root.querySelectorAll("[data-ecosystem-source]"));
    var detail = root.querySelector("[data-ecosystem-detail]");
    var title = detail && detail.querySelector("h3");
    var description = detail && detail.querySelector("[data-eco-description]");
    var route = detail && detail.querySelector("[data-eco-route]");
    var label = detail && detail.querySelector(".dci-ecosystem__detail-label");
    var layerNodes = Array.prototype.slice.call(root.querySelectorAll("[data-eco-layer]"));
    if (!buttons.length || !detail || !title || !description || !route || !label) return;

    function activate(button, moveFocus) {
      var key = button.getAttribute("data-ecosystem-source");
      var item = sources[key];
      if (!item) return;
      buttons.forEach(function (candidate) {
        var selected = candidate === button;
        candidate.setAttribute("aria-pressed", selected ? "true" : "false");
        candidate.classList.toggle("is-selected", selected);
      });
      title.textContent = item.title;
      description.textContent = item.description;
      route.textContent = item.route;
      label.textContent = "Evidence path · " + button.querySelector("b").textContent;
      layerNodes.forEach(function (node) {
        var active = item.layers.indexOf(Number(node.getAttribute("data-eco-layer"))) !== -1;
        node.classList.toggle("is-lit", active);
        node.setAttribute("aria-label", node.textContent.trim() + (active ? " — relevant to the selected source" : ""));
      });
      if (moveFocus) button.focus();
    }

    buttons.forEach(function (button, index) {
      button.addEventListener("click", function () { activate(button, false); });
      button.addEventListener("keydown", function (event) {
        var next = index;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % buttons.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + buttons.length) % buttons.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = buttons.length - 1;
        else return;
        event.preventDefault();
        activate(buttons[next], true);
      });
    });
    var initiallySelected = buttons.filter(function (button) { return button.getAttribute("aria-pressed") === "true"; })[0];
    activate(initiallySelected || buttons[0], false);
  }

  function start() {
    document.querySelectorAll("[data-ecosystem]").forEach(init);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
