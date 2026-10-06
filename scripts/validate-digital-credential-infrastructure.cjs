const assert = require("node:assert/strict");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");
const { visibleLabelContrast } = require("./lib/visible-label-contrast.cjs");

const base = process.env.DCI_BASE_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;
const route = "/solutions/digital-credential-infrastructure";
const headline = "The infrastructure behind trusted, interoperable and intelligent digital credentials";
const pdf = fs.readFileSync("assets4/docs/dci-credential.pdf");
const changed = Buffer.concat([pdf, Buffer.from("\n%Changed document\n")]);
fs.mkdirSync(".local/dci-checks", { recursive: true });

async function run() {
  const browser = await chromium.launch({
    executablePath: execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    for (const width of [1440, 768, 390, 320]) {
      const context = await browser.newContext({
        viewport: { width, height: 950 }, reducedMotion: "reduce",
        permissions: ["clipboard-read", "clipboard-write"], acceptDownloads: true,
      });
      const page = await context.newPage();
      page.setDefaultTimeout(12000);
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      assert.equal((await page.goto(base + route, { waitUntil: "domcontentloaded" })).status(), 200);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator("#dci-title").textContent(), headline);
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await page.title(), "Digital Credential Infrastructure for Universities | CertifyMe");
      assert((await page.locator('meta[name="description"]').getAttribute("content")).includes("digital credential infrastructure"));
      assert.equal(await page.locator('#wsmenu-main a[href="/solutions/digital-credential-infrastructure"]').count(), 1);
      assert.equal(await page.locator(".dci-layer").count(), 6);
      assert.equal(await page.locator(".dci-buyer-grid article").count(), 4);
      assert.equal(await page.locator("[data-template]").count(), 7);
      assert.equal(await page.locator(".dci-system__outputs > div").count(), 6);
      assert.equal(await page.locator("[data-eco-layer]").count(), 6);
      assert.equal(await page.locator(".dci-implementation__phase").count(), 5);
      assert.equal(await page.locator(".dci-implementation__workscope article").count(), 3);
      assert((await page.locator(".dci-implementation").textContent()).includes("custom development"));
      for (const source of await page.locator("[data-ecosystem-source]").all()) {
        await source.click();
        assert.equal(await source.getAttribute("aria-pressed"), "true");
        assert.equal(await page.locator('[data-ecosystem-source][aria-pressed="true"]').count(), 1);
        assert((await page.locator(".dci-ecosystem__detail-label").textContent()).includes(await source.locator("b").textContent()));
      }
      await page.locator('[data-ecosystem-source="workflow"]').press("Home");
      assert.equal(await page.locator('[data-ecosystem-source="sis"]').getAttribute("aria-pressed"), "true");
      await page.locator('[data-ecosystem-source="sis"]').press("ArrowDown");
      assert.equal(await page.locator('[data-ecosystem-source="learning"]').getAttribute("aria-pressed"), "true");
      const undersizedText = await page.evaluate(() => {
        const walker = document.createTreeWalker(document.getElementById("dci-page"), NodeFilter.SHOW_TEXT);
        const issues = [];
        while (walker.nextNode()) {
          const node = walker.currentNode;
          const element = node.parentElement;
          if (!/[A-Za-z0-9]/.test(node.textContent) || !element.getClientRects().length ||
              ["SCRIPT", "STYLE"].includes(element.tagName)) continue;
          const style = getComputedStyle(element);
          if (style.visibility === "hidden") continue;
          if (parseFloat(style.fontSize) < 13) issues.push({text: node.textContent.trim().slice(0, 60), class: element.className, size: style.fontSize});
        }
        return issues;
      });
      assert.deepEqual(undersizedText, [], `${width}px undersized text`);
      for (const input of await page.locator(".dci-fields input").all()) {
        assert(await input.evaluate(node => parseFloat(getComputedStyle(node).fontSize) >= 16), "Editor input must be at least 16px");
      }
      const layout = await page.evaluate(() => {
        const root = document.querySelector(".dci");
        const lead = document.querySelector(".dci-hero__lead");
        const ids = Array.from(root.querySelectorAll("[id]"), item => item.id);
        return {
          documentWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth,
          heroLines: Math.round(lead.getBoundingClientRect().height / parseFloat(getComputedStyle(lead).lineHeight)),
          duplicateIds: ids.filter((id, i) => ids.indexOf(id) !== i),
          words: Array.from(document.querySelectorAll(".dci-layer"), section => section.textContent.trim().split(/\s+/).length),
          emptyLinks: Array.from(root.querySelectorAll("a"), link => link.getAttribute("href")).filter(href => !href || href === "#"),
          overflowing: Array.from(root.querySelectorAll("button,input,svg,.dci-system,.dci-stack__row,.dci-signature__stack,.dci-record-card,.dci-table-scroll"))
            .filter(element => element.getClientRects().length && getComputedStyle(element).position !== "absolute")
            .filter(element => {
              const bounds = element.getBoundingClientRect();
              return bounds.left < -1 || bounds.right > innerWidth + 1;
            }).map(element => element.className?.baseVal || element.className),
        };
      });
      assert(layout.documentWidth <= width + 1 && layout.bodyWidth <= width + 1, `${width}px page overflow: ${JSON.stringify(layout)}`);
      assert(layout.heroLines <= 3, `${width}px hero has ${layout.heroLines} lines`);
      assert.deepEqual(layout.duplicateIds, []);
      assert.deepEqual(layout.emptyLinks, []);
      assert.deepEqual(layout.overflowing, [], `${width}px clipped interface elements`);
      const certificateIssues = await page.locator(".dci-paper").evaluate(paper => {
        const issues = [], bounds = paper.getBoundingClientRect();
        const contents = Array.from(paper.querySelectorAll("span,strong,a,img")).filter(node => node.getClientRects().length);
        for (const node of contents) {
          const rect = node.getBoundingClientRect();
          if (rect.left < bounds.left || rect.right > bounds.right || rect.bottom > bounds.bottom) issues.push(`Outside certificate: ${node.className}`);
        }
        const qr = paper.querySelector(".dci-paper__qr").getBoundingClientRect();
        const metadata = paper.querySelector(".dci-paper__metadata").getBoundingClientRect();
        if (qr.left < metadata.right && qr.right > metadata.left && qr.top < metadata.bottom && qr.bottom > metadata.top) issues.push("QR overlaps credential metadata");
        const annotation = paper.parentElement.querySelector(".dci-credential-art__annotation").getBoundingClientRect();
        if (annotation.top < bounds.bottom) issues.push("Access-point caption overlaps certificate");
        return issues;
      });
      assert.deepEqual(certificateIssues, [], `${width}px certificate alignment`);
      assert(Math.min(...layout.words.slice(0, 3)) > Math.max(...layout.words.slice(3)) * 1.3, "Foundation layers must be materially deeper");

      for (let index = 1; index <= 6; index++) {
        const id = `layer-0${index}`;
        if (index === 1) await page.locator(`.dci-stack [href="#${id}"]`).click();
        else await page.locator(`.dci-layer-nav [href="#${id}"]`).click();
        await page.waitForFunction(layer => document.querySelector(`.dci-layer-nav [href="#${layer}"]`).getAttribute("aria-current") === "location", id);
        assert.equal(new URL(page.url()).hash, `#${id}`);
        const bounds = await page.evaluate(layer => {
          const nav = document.querySelector(".dci-layer-nav").getBoundingClientRect();
          const section = document.getElementById(layer).getBoundingClientRect();
          return { navTop: nav.top, navBottom: nav.bottom, sectionTop: section.top, width: innerWidth };
        }, id);
        assert(bounds.navTop >= 0 && bounds.navTop < 200, `Sticky navigation is not visible: ${JSON.stringify(bounds)}`);
        assert(bounds.sectionTop >= bounds.navBottom - 2 && bounds.sectionTop < bounds.navBottom + 100, `Anchor is covered by navigation: ${JSON.stringify(bounds)}`);
        const activeIsVisible = await page.locator(`.dci-layer-nav [href="#${id}"]`).evaluate(node => {
          const item = node.getBoundingClientRect(), track = node.parentElement.getBoundingClientRect();
          return item.left >= track.left - 2 && item.right <= track.right + 2;
        });
        assert(activeIsVisible, `${width}px active layer must remain visible in the readable navigation`);
      }
      assert(parseFloat(await page.locator("#dci-progress-bar").evaluate(node => node.style.width)) > 30, "Scroll progress did not update");

      for (const template of ["Digital Badge", "University Certificate"]) {
        await page.locator(`[data-template="${template}"]`).click();
        assert.equal(await page.locator(`[data-template="${template}"]`).getAttribute("aria-pressed"), "true");
        assert.equal(await page.locator("#dci-template-preview-name").textContent(), template);
      }
      await page.locator("#dci-recipient-input").fill("Taylor Chen");
      assert.equal(await page.locator("#dci-preview-recipient").textContent(), "Taylor Chen");
      assert.equal(await page.locator("#dci-record-recipient").textContent(), "Taylor Chen");
      await page.locator("#dci-recipient-input").fill("Alex Morgan");
      await page.locator('[data-issuance="bulk"]').click();
      assert.equal(await page.locator("#dci-issuance-action").textContent(), "Bulk cohort issuance");
      await page.locator('[data-issuance="automated"]').click();
      assert((await page.locator("#dci-issuance-source").textContent()).includes("LMS / SIS"));

      await page.locator('[data-action="copy"]').click();
      await page.waitForFunction(() => document.getElementById("dci-share-status").textContent === "Credential link copied.");
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), new URL("/sample-credential", base).href);
      await page.locator('[data-action="share"]').click();
      assert((await page.locator("#dci-share-status").textContent()).includes("copied"));
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.locator('.dci-actions--small a[download]').click(),
      ]);
      assert.equal(download.suggestedFilename(), "dci-credential.pdf");

      await page.locator("#dci-tab-id").click();
      await page.locator("#dci-tab-id").press("ArrowRight");
      assert.equal(await page.locator("#dci-tab-otp").getAttribute("aria-selected"), "true");
      assert(await page.locator("#dci-panel-otp").isVisible());
      assert(!(await page.locator("#dci-panel-id").isVisible()));
      await page.locator("#dci-tab-otp").press("End");
      assert.equal(await page.locator("#dci-tab-vc").getAttribute("aria-selected"), "true");
      await page.locator("#dci-tab-pdf").click();
      const [chooser] = await Promise.all([page.waitForEvent("filechooser"), page.locator(".dci-drop__choose").click()]);
      await chooser.setFiles({ name: "credential.pdf", mimeType: "application/pdf", buffer: pdf });
      await page.waitForFunction(() => document.getElementById("dci-pdf-result").dataset.state === "match");
      await page.locator("#dci-pdf-file").setInputFiles({ name: "changed.pdf", mimeType: "application/pdf", buffer: changed });
      await page.waitForFunction(() => document.getElementById("dci-pdf-result").dataset.state === "mismatch");
      await page.locator("#dci-pdf-file").setInputFiles({ name: "not-a-pdf.pdf", mimeType: "application/pdf", buffer: Buffer.from("not PDF data") });
      await page.waitForFunction(() => document.getElementById("dci-pdf-result").dataset.state === "error");
      assert((await page.locator("#dci-pdf-result").textContent()).includes("not a PDF"));
      await page.locator("#dci-pdf-file").setInputFiles({ name: "large.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(5 * 1024 * 1024 + 1) });
      assert((await page.locator("#dci-pdf-result").textContent()).includes("smaller than 5 MB"));
      await page.evaluate(bytes => {
        const file = new File([Uint8Array.from(bytes)], "credential.pdf", { type: "application/pdf" });
        const data = new DataTransfer();
        data.items.add(file);
        document.getElementById("dci-pdf-drop").dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: data }));
      }, Array.from(pdf));
      await page.waitForFunction(() => document.getElementById("dci-pdf-result").dataset.state === "match");
      if (width === 1440 || width === 390) {
        await page.locator(".dci-verify-tabs").scrollIntoViewIfNeeded();
        await page.screenshot({ path: `.local/dci-checks/verification-${width}.png` });
      }
      for (const disclosure of await page.locator(".dci-disclosure").all()) {
        await disclosure.locator("summary").click();
        assert.equal(await disclosure.getAttribute("open"), "");
        await disclosure.locator("summary").click();
        assert.equal(await disclosure.getAttribute("open"), null);
      }
      const contrastIssues = [];
      for (const control of await page.locator('.dci button,.dci a').all()) {
        if (!(await control.isVisible())) continue;
        const segments = await control.evaluate(visibleLabelContrast);
        for (const segment of segments.filter(segment => segment.ratio !== null && segment.ratio < 4.5)) {
          contrastIssues.push(segment);
        }
      }
      assert.deepEqual(contrastIssues, [], `${width}px control contrast`);
      assert.deepEqual(errors, [], `Browser errors at ${width}px`);
       console.log(`${width}px: connected ecosystem, keyboard source selection, discovery-led implementation, legible text, layout, six anchors, sticky navigation, progress, templates, preview, issuance, share/copy/download, keyboard tabs, signature match/mismatch, invalid/large file, drag/drop and contrast passed.`);
      if (width === 1440) {
        const links = [...new Set(await page.locator('.dci a[href^="/"]').evaluateAll(nodes => nodes.map(node => node.getAttribute("href"))))];
        for (const href of links) {
          const url = new URL(href, base);
          const response = await context.request.get(url.href);
          assert.equal(response.status(), 200, `Broken destination: ${href}`);
          if (url.hash) assert((await response.text()).includes(`id="${url.hash.slice(1)}"`), `Missing target: ${href}`);
        }
        for (const existing of ["/", "/platform-overview"]) {
          assert.equal((await context.request.get(base + existing)).status(), 200);
        }
      }
      await context.close();
    }
    // A missing trust resource must not generate a successful verification.
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.route("**/assets4/docs/dci-proof.json", handler => handler.fulfill({ status: 503, body: "Unavailable" }));
    await page.goto(base + route);
    await page.locator("#dci-tab-pdf").click();
    await page.locator("#dci-pdf-file").setInputFiles({ name: "credential.pdf", mimeType: "application/pdf", buffer: pdf });
    await page.waitForFunction(() => document.getElementById("dci-pdf-result").dataset.state === "error");
    assert((await page.locator("#dci-pdf-result").textContent()).includes("no verification result"));
    await context.close();
    console.log("Missing signature resource fails explicitly. All new-page internal destinations and existing homepage/Platform Overview respond successfully.");
  } finally {
    await browser.close();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
