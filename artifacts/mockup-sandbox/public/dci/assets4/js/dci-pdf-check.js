(() => {
  "use strict";
  const input = document.getElementById("dci-pdf-file");
  const drop = document.getElementById("dci-pdf-drop");
  const result = document.getElementById("dci-pdf-result");
  if (!input || !drop || !result) return;
  const maximum = 5 * 1024 * 1024;
  let attempt = 0;
  let proofPromise;

  function show(state, message) {
    result.dataset.state = state;
    result.textContent = message;
    result.setAttribute("aria-busy", state === "checking" ? "true" : "false");
  }

  async function proof() {
    if (!proofPromise) {
      proofPromise = fetch("/__mockup/dci/assets4/docs/dci-proof.json")
        .then(response => {
          if (!response.ok) throw new Error("Public signature unavailable");
          return response.json();
        }).then(async data => {
          if (data.algorithm !== "ECDSA" || data.curve !== "P-256" || data.hash !== "SHA-256") {
            throw new Error("Unsupported signature profile");
          }
          return {
            key: await crypto.subtle.importKey("jwk", data.publicKey,
              { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]),
            signature: Uint8Array.from(atob(data.signature), char => char.charCodeAt(0)),
          };
        }).catch(error => { proofPromise = undefined; throw error; });
    }
    return proofPromise;
  }

  async function check(file) {
    const current = ++attempt;
    drop.classList.remove("is-dragging");
    if (!file) {
      show("idle", "Download the credential PDF, then drop it here to check its document signature.");
      return;
    }
    if (file.size > maximum) {
      show("error", "Choose a PDF smaller than 5 MB.");
      return;
    }
    if (!window.crypto?.subtle) {
      show("error", "Document checking requires a browser with Web Crypto on a secure connection.");
      return;
    }
    show("checking", "Checking the document signature in your browser…");
    try {
      const bytes = await file.arrayBuffer();
      if (current !== attempt) return;
      if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") {
        show("error", "This file is not a PDF. Download the credential PDF to check its signature.");
        return;
      }
      const data = await proof();
      const matches = await crypto.subtle.verify(
        { name: "ECDSA", hash: "SHA-256" }, data.key, data.signature, bytes);
      if (current !== attempt) return;
      show(matches ? "match" : "mismatch", matches
        ? "MATCH — the document signature is valid for this credential. This confirms document integrity, not recipient identity."
        : "MISMATCH — this PDF does not match this credential’s signed document. It may be a different document or contain changed bytes.");
    } catch {
      if (current === attempt) show("error", "The signature check is unavailable. Please try again; no verification result has been established.");
    }
  }

  input.addEventListener("change", () => { check(input.files[0]); input.value = ""; });
  drop.querySelector(".dci-drop__choose")?.addEventListener("click", () => input.click());
  drop.addEventListener("dragover", event => {
    event.preventDefault();
    drop.classList.add("is-dragging");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("is-dragging"));
  drop.addEventListener("drop", event => {
    event.preventDefault();
    check(event.dataTransfer?.files[0]);
  });
  drop.addEventListener("keydown", event => {
    if (event.target === drop && ["Enter", " "].includes(event.key)) {
      event.preventDefault();
      input.click();
    }
  });
  drop.addEventListener("click", event => {
    if (!event.target.closest("input,a,button,label")) input.click();
  });
  show("idle", "Download the credential PDF, then drop it here. Files stay in your browser; the check tests this document’s signature.");
})();
