/* CareerIQ's public demo uses local examples, not authenticated learner or live job data. */
(() => {
  "use strict";

  const root = document.querySelector("#careeriq");
  if (!root) return;
  const $ = (selector) => root.querySelector(selector);
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
  const storageKey = "careeriq-public-demo-v1";
  let dataset;
  let state = { saved: [], drafts: [] };
  let storageAvailable = true;
  let activeJob = null;

  const skillName = (id) => dataset.profile.skills.find((skill) => skill.id === id)?.name
    || dataset.additionalSkills[id] || id;
  const formatSalary = (job) => {
    const fmt = new Intl.NumberFormat("en-GB", {
      style: "currency", currency: job.currency, maximumFractionDigits: 0
    });
    return `${fmt.format(job.salaryMin)}–${fmt.format(job.salaryMax)}`;
  };
  const matching = (job) => {
    const known = new Set(dataset.profile.skills.map((skill) => skill.id));
    const matched = job.requiredSkills.filter((skill) => known.has(skill));
    const missing = job.requiredSkills.filter((skill) => !known.has(skill));
    const coverage = matched.length / job.requiredSkills.length;
    const locationPoints = job.location === dataset.profile.location ? 10 : 0;
    const modePoints = job.mode === dataset.profile.preferredMode ? 10 : 0;
    const score = matched.length ? Math.round(coverage * 80 + locationPoints + modePoints) : 0;
    return { matched, missing, coverage, locationPoints, modePoints, score };
  };

  function showNotice(message) {
    let notice = $("#ci-notice");
    if (!notice) {
      notice = document.createElement("div");
      notice.id = "ci-notice";
      notice.setAttribute("role", "status");
      notice.className = "ci-notice";
      root.querySelector(".ci-shell").prepend(notice);
    }
    notice.textContent = message;
    notice.hidden = false;
  }

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
      const ids = new Set(dataset.jobs.map((job) => job.id));
      state.saved = Array.isArray(stored.saved) ? stored.saved.filter((id) => ids.has(id)) : [];
      state.drafts = Array.isArray(stored.drafts)
        ? stored.drafts.filter((draft) => ids.has(draft.jobId)).map((draft) => ({
            jobId: draft.jobId,
            skills: Array.isArray(draft.skills) ? draft.skills.filter((id) => dataset.profile.skills.some((s) => s.id === id)) : [],
            shareCredential: draft.shareCredential === true,
            savedAt: typeof draft.savedAt === "string" ? draft.savedAt : ""
          }))
        : [];
    } catch (_) {
      storageAvailable = false;
      showNotice("Browser storage is unavailable. You can explore jobs, but saved roles and drafts will not persist.");
    }
  }

  function persist() {
    if (!storageAvailable) return false;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      return true;
    } catch (_) {
      storageAvailable = false;
      showNotice("This browser blocked storage. Your saved roles and drafts cannot persist.");
      return false;
    }
  }

  const tags = (values, missing = false) => values.length
    ? `<div class="ci-skill-tags${missing ? " ci-gaps" : ""}">${values.map((id) =>
        `<span>${escapeHtml(skillName(id))}</span>`).join("")}</div>`
    : `<span class="ci-caption">None in this example</span>`;

  function renderMetrics() {
    const jobs = dataset.jobs;
    const employers = new Set(jobs.map((job) => job.employer));
    const locations = new Set(jobs.map((job) => job.location));
    const median = [...jobs].sort((a, b) => a.salaryMin - b.salaryMin);
    const middle = (median[1].salaryMin + median[2].salaryMin) / 2;
    $("#ci-metrics").innerHTML = [
      [jobs.length, "Example roles in this demo"],
      [employers.size, "Fictional employers"],
      [locations.size, "Example locations"],
      [new Intl.NumberFormat("en-GB", {style:"currency",currency:"GBP",maximumFractionDigits:0}).format(middle), "Median starting salary · examples only"]
    ].map(([value, label]) => `<div class="ci-metric"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`).join("");
    $("#ci-credential-name").textContent = dataset.profile.credential;
    $("#ci-credential-issuer").textContent = dataset.profile.issuer;
  }

  function populateFilters() {
    for (const [id, key] of [["#ci-location", "location"], ["#ci-mode", "mode"], ["#ci-type", "type"], ["#ci-level", "level"]]) {
      const select = $(id);
      [...new Set(dataset.jobs.map((job) => job[key]))].sort().forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.append(option);
      });
    }
  }

  function renderJobs() {
    const query = $("#ci-search").value.trim().toLowerCase();
    const location = $("#ci-location").value;
    const mode = $("#ci-mode").value;
    const type = $("#ci-type").value;
    const level = $("#ci-level").value;
    const minimum = Number($("#ci-min").value);
    $("#ci-min-label").value = `${minimum}%`;
    const jobs = dataset.jobs
      .filter((job) => {
        const searchable = [job.title, job.employer, job.location, job.industry, job.summary,
          ...job.requiredSkills.map(skillName)].join(" ").toLowerCase();
        return (!query || searchable.includes(query)) &&
          (!location || job.location === location) &&
          (!mode || job.mode === mode) &&
          (!type || job.type === type) &&
          (!level || job.level === level) &&
          matching(job).score >= minimum;
      })
      .sort((a, b) => matching(b).score - matching(a).score);
    $("#ci-result-count").textContent = `${jobs.length} of ${dataset.jobs.length} example roles`;
    $("#ci-job-list").innerHTML = jobs.length ? jobs.map((job) => {
      const match = matching(job);
      const saved = state.saved.includes(job.id);
      return `<article class="ci-job">
        <div class="ci-job-top"><div><span class="ci-job-eyebrow">Fictional employer · Example role</span><h3>${escapeHtml(job.title)}</h3><span class="ci-job-org">${escapeHtml(job.employer)}</span></div><div class="ci-match" aria-label="${match.score} percent example match"><strong>${match.score}%</strong><small>example match</small></div></div>
        <div class="ci-tags"><span class="ci-tag">${escapeHtml(job.location)}</span><span class="ci-tag">${escapeHtml(job.mode)}</span><span class="ci-tag">${escapeHtml(job.type)}</span><span class="ci-tag">${escapeHtml(job.level)}</span><span class="ci-tag">${escapeHtml(formatSalary(job))} · example</span></div>
        <p>${escapeHtml(job.summary)}</p>
        <div class="ci-job-skill-row"><span>Skills shown</span>${tags(match.matched)}</div>
        <div class="ci-job-skill-row"><span>Skills to explore</span>${tags(match.missing, true)}</div>
        <div class="ci-job-actions"><button type="button" class="ci-button" data-action="save" data-job="${escapeHtml(job.id)}" aria-pressed="${saved}">${saved ? "Saved ✓" : "Save role"}</button><a class="ci-button" href="/jobs/${encodeURIComponent(job.id)}">View role &amp; match</a><button type="button" class="ci-button ci-button-primary" data-action="apply" data-job="${escapeHtml(job.id)}">Prepare application</button></div>
      </article>`;
    }).join("") : `<div class="ci-empty"><h3>No example roles match these filters</h3><p>Try a broader search or lower the minimum match.</p><button class="ci-button" type="button" data-action="reset">Reset filters</button></div>`;
  }

  function renderSkills() {
    $("#ci-skills-list").innerHTML = dataset.profile.skills.map((skill) =>
      `<button type="button" class="ci-skill-card" data-action="skill" data-skill="${escapeHtml(skill.id)}"><strong>${escapeHtml(skill.name)} <span aria-hidden="true">↗</span></strong><span>Example evidence: ${escapeHtml(skill.evidence)}</span></button>`
    ).join("");
  }

  function renderEmployers() {
    const grouped = new Map();
    dataset.jobs.forEach((job) => grouped.set(job.employer, (grouped.get(job.employer) || 0) + 1));
    $("#ci-employers-list").innerHTML = [...grouped].map(([employer, count]) =>
      `<button type="button" class="ci-employer-card" data-action="employer" data-employer="${escapeHtml(employer)}"><strong>${escapeHtml(employer)}</strong><span>${count} example ${count === 1 ? "role" : "roles"} · Filter roles →</span></button>`
    ).join("");
  }

  function renderPathways() {
    $("#ci-pathways-list").innerHTML = [...dataset.jobs].sort((a,b) => matching(b).score - matching(a).score).slice(0,3).map((job) => {
      const match = matching(job);
      return `<article class="ci-pathway-card"><strong>${escapeHtml(job.title)}</strong><span>${match.matched.length} of ${job.requiredSkills.length} required skills represented in this example · ${match.score}% example match</span><span>Explore: ${escapeHtml(match.missing.map(skillName).join(", ") || "No gaps shown")}</span><a href="/jobs/${encodeURIComponent(job.id)}">See role details →</a></article>`;
    }).join("");
  }

  function renderApplications() {
    const drafts = new Map(state.drafts.map((draft) => [draft.jobId, draft]));
    const ids = [...new Set([...state.saved, ...drafts.keys()])];
    $("#ci-applications-list").innerHTML = ids.length ? ids.map((id) => {
      const job = dataset.jobs.find((item) => item.id === id);
      const draft = drafts.get(id);
      return `<div class="ci-draft"><div><strong>${escapeHtml(job.title)}</strong><p>${escapeHtml(job.employer)} · ${draft ? "Draft saved locally; not sent" : "Saved example role"}${draft ? ` · ${draft.skills.length} skills selected` : ""}</p></div><div class="ci-draft-actions"><a class="ci-button" href="/jobs/${encodeURIComponent(id)}">View role</a>${draft ? `<button class="ci-button" type="button" data-action="apply" data-job="${escapeHtml(id)}">Edit draft</button>` : ""}<button class="ci-button" type="button" data-action="remove" data-job="${escapeHtml(id)}">Remove local ${draft ? "draft & role" : "role"}</button></div></div>`;
    }).join("") : `<div class="ci-empty"><p>No saved roles or drafts yet. Explore the example jobs to start.</p><a class="ci-button" href="/career-opportunities#jobs">Find jobs</a></div>`;
  }

  function showSkill(id) {
    const skill = dataset.profile.skills.find((entry) => entry.id === id);
    if (!skill) return;
    $("#ci-skill-detail").innerHTML = `<p class="ci-eyebrow">Example skill evidence</p><h2 id="ci-skill-dialog-title">${escapeHtml(skill.name)}</h2><p>This sample profile associates the skill with an illustrative achievement. It is not independently verified.</p><div class="ci-detail-grid"><div><small>Example evidence</small><strong>${escapeHtml(skill.evidence)}</strong></div><div><small>Taxonomy context</small><strong>${escapeHtml(skill.taxonomy)}</strong></div></div><p>No external taxonomy identifier or reviewed ESCO, O*NET or NACE mapping is asserted for this example.</p><a href="/skills-taxonomy-mapping">How institutional mapping works →</a>`;
    $("#ci-skill-dialog").showModal();
  }

  function showJob(id) {
    const job = dataset.jobs.find((entry) => entry.id === id);
    if (!job) return;
    const match = matching(job);
    $("#ci-job-detail").innerHTML = `<p class="ci-eyebrow">Fictional role · Example match</p><h2 id="ci-job-dialog-title">${escapeHtml(job.title)}</h2><p>${escapeHtml(job.employer)} · ${escapeHtml(job.summary)}</p>
      <div class="ci-detail-grid"><div><small>Location</small><strong>${escapeHtml(job.location)}, ${escapeHtml(job.country)}</strong></div><div><small>Example salary range</small><strong>${escapeHtml(formatSalary(job))}</strong></div><div><small>Employment</small><strong>${escapeHtml(job.type)} · ${escapeHtml(job.level)}</strong></div><div><small>Work mode</small><strong>${escapeHtml(job.mode)}</strong></div></div>
      <h3>Why this is a ${match.score}% example match</h3><p>${match.matched.length} of ${job.requiredSkills.length} listed skills appear in the example profile (${Math.round(match.coverage * 100)}% skill coverage). Skill coverage contributes up to 80 points; matching the example location adds ${match.locationPoints} points and work mode adds ${match.modePoints} points. This is not an employer suitability assessment.</p>
      <h3>Skills with example evidence</h3>${tags(match.matched)}<p class="ci-caption">Each skill has a named achievement in the example learner profile. No external validation has been performed.</p><h3>Skills not shown in the profile</h3>${tags(match.missing, true)}
      <h3>Responsibilities</h3><ul>${job.responsibilities.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul><h3>Requirements</h3><ul>${job.requirements.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      <div class="ci-apply-note">This is not a live vacancy. You can prepare a local demonstration draft, but cannot apply to this fictional employer.</div><div class="ci-form-actions"><button class="ci-button ci-button-primary" type="button" data-action="apply" data-job="${escapeHtml(job.id)}">Prepare application draft</button><button class="ci-button" type="button" data-action="save" data-job="${escapeHtml(job.id)}">${state.saved.includes(job.id) ? "Saved ✓" : "Save role"}</button></div>`;
    $("#ci-job-dialog").showModal();
  }

  function showApply(id) {
    const job = dataset.jobs.find((entry) => entry.id === id);
    if (!job) return;
    activeJob = job;
    const existing = state.drafts.find((draft) => draft.jobId === id);
    $("#ci-apply-detail").innerHTML = `<p class="ci-eyebrow">Local-only application draft</p><h2 id="ci-apply-dialog-title">Prepare for ${escapeHtml(job.title)}</h2><p>${escapeHtml(job.employer)} is fictional. You can choose example evidence to include in a draft, but nothing will be sent or shared.</p>
      <form id="ci-apply-form"><h3>What would you share?</h3><div class="ci-form-row"><label><input type="checkbox" name="credential" ${existing?.shareCredential ? "checked" : ""}> Example certificate in forensic accounting</label></div>
      <h3>Skills to include</h3>${dataset.profile.skills.map((skill) => `<div class="ci-form-row"><label><input type="checkbox" name="skill" value="${escapeHtml(skill.id)}" ${existing?.skills.includes(skill.id) ? "checked" : ""}> ${escapeHtml(skill.name)} · ${escapeHtml(skill.evidence)}</label></div>`).join("")}
      <div class="ci-apply-note">This demo does not request a name, contact details, résumé or cover letter. A real application would require a secure employer submission channel and explicit learner consent.</div><div class="ci-form-row"><label><input type="checkbox" name="acknowledge" required> I understand this is a local draft, not an application to an employer.</label></div><div class="ci-form-actions"><button class="ci-button ci-button-primary" type="submit">Save demo draft</button><button class="ci-button" type="button" data-close>Cancel</button></div></form>`;
    $("#ci-job-dialog").close();
    $("#ci-apply-dialog").showModal();
  }

  function saveDraft(form) {
    if (!activeJob) return;
    const data = new FormData(form);
    const draft = {
      jobId: activeJob.id,
      shareCredential: data.has("credential"),
      skills: data.getAll("skill"),
      savedAt: new Date().toISOString()
    };
    state.drafts = state.drafts.filter((entry) => entry.jobId !== activeJob.id).concat(draft);
    if (!state.saved.includes(activeJob.id)) state.saved.push(activeJob.id);
    const saved = persist();
    renderJobs();
    renderApplications();
    $("#ci-apply-dialog").close();
    if (saved) showNotice("Demo application draft saved in this browser. It has not been sent to an employer.");
    root.querySelector("#applications").scrollIntoView({behavior:"smooth"});
  }

  function resetFilters() {
    for (const id of ["#ci-search", "#ci-location", "#ci-mode", "#ci-type", "#ci-level"]) $(id).value = "";
    $("#ci-min").value = "0";
    renderJobs();
  }

  function bindEvents() {
    for (const id of ["#ci-search", "#ci-location", "#ci-mode", "#ci-type", "#ci-level", "#ci-min"]) {
      $(id).addEventListener(id === "#ci-search" || id === "#ci-min" ? "input" : "change", renderJobs);
    }
    $("#ci-reset").addEventListener("click", resetFilters);
    root.addEventListener("click", (event) => {
      const close = event.target.closest("[data-close]");
      if (close) { close.closest("dialog")?.close(); return; }
      const button = event.target.closest("[data-action]");
      if (!button) return;
      const id = button.dataset.job;
      switch (button.dataset.action) {
        case "reset": resetFilters(); break;
        case "skill": showSkill(button.dataset.skill); break;
        case "apply": showApply(id); break;
        case "save": {
          state.saved = state.saved.includes(id) ? state.saved.filter((item) => item !== id) : [...state.saved, id];
          persist(); renderJobs(); renderApplications();
          if ($("#ci-job-dialog").open) {
            button.textContent = state.saved.includes(id) ? "Saved ✓" : "Save role";
          }
          showNotice(state.saved.includes(id) ? "Example role saved in this browser." : "Example role removed from saved jobs.");
          break;
        }
        case "remove":
          if (!window.confirm("Remove this saved role and any local application draft? This cannot be undone.")) break;
          state.saved = state.saved.filter((item) => item !== id);
          state.drafts = state.drafts.filter((item) => item.jobId !== id);
          persist(); renderJobs(); renderApplications(); showNotice("Local example role and draft removed."); break;
        case "employer":
          resetFilters();
          $("#ci-search").value = button.dataset.employer;
          renderJobs();
          $("#jobs").scrollIntoView({behavior:"smooth"}); break;
      }
    });
    root.addEventListener("submit", (event) => {
      if (event.target.id !== "ci-apply-form") return;
      event.preventDefault();
      saveDraft(event.target);
    });
    $("#ci-job-dialog").addEventListener("close", () => {
      if (location.pathname.startsWith("/jobs/") && !$("#ci-apply-dialog").open && !$("#ci-job-dialog").open) {
        location.href = "/career-opportunities#jobs";
      }
    });
  }

  async function init() {
    try {
      const response = await fetch("/assets4/data/careeriq-demo.json", {cache:"no-store"});
      if (!response.ok) throw new Error(`Demo data could not load (${response.status})`);
      dataset = await response.json();
      if (!dataset.demo || !Array.isArray(dataset.jobs) || !dataset.jobs.length || !dataset.profile?.skills) {
        throw new Error("Demo data is incomplete");
      }
      loadState();
      populateFilters();
      if (window.matchMedia("(max-width: 760px)").matches) $("#ci-filter-panel").open = false;
      renderMetrics();
      renderJobs();
      renderSkills();
      renderEmployers();
      renderPathways();
      renderApplications();
      bindEvents();
      if (location.pathname.startsWith("/jobs/")) {
        const id = location.pathname.split("/").filter(Boolean).pop();
        if (dataset.jobs.some((job) => job.id === id)) showJob(id);
        else showNotice("This example role was not found.");
      } else if (location.pathname === "/applications") {
        $("#applications").scrollIntoView();
      }
    } catch (error) {
      $("#ci-job-list").innerHTML = `<div class="ci-empty"><h3>Unable to load example roles</h3><p>Please reload the page or try again later.</p></div>`;
      showNotice(`CareerIQ demo could not start: ${error.message}`);
      console.error(error);
    }
  }
  init();
})();