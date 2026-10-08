const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");
const { visibleLabelContrast } = require("./lib/visible-label-contrast.cjs");

const base = process.env.DCI_BASE_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;
const route = "/solutions/digital-credential-infrastructure";
const layers = [
  "Credential Access & Sharing", "Standards & Interoperability",
  "Verification & Trust", "Skill Taxonomy Mapping",
  "Comprehensive Learner Record", "Workforce Intelligence & Opportunity",
];
const metadata = {
  title: "Digital Credential Infrastructure | CertifyMe",
  description: "CertifyMe provides digital credential infrastructure to create, issue, manage, verify and share secure, interoperable digital credentials.",
};

async function run() {
  const browser = await chromium.launch({
    executablePath: execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    for (const width of [320, 390, 768, 1024, 1440, 1920]) {
      const context = await browser.newContext({
        viewport: { width, height: 1000 }, reducedMotion: "reduce",
      });
      await context.addInitScript(`window.dciContrast = ${visibleLabelContrast.toString()}`);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      assert.equal((await page.goto(base + route, { waitUntil: "load" })).status(), 200);
      await page.evaluate(() => document.fonts.ready);
      const root = page.locator("#dci-page");
      assert.equal(await page.title(), metadata.title);
      assert.equal(await page.locator('meta[name="description"]').getAttribute("content"), metadata.description);
      assert((await page.locator('link[rel="canonical"]').getAttribute("href")).endsWith(route));
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await page.locator("main").count(), 1);
      assert.equal(await root.locator("h1").textContent(), "Digital Credential Infrastructure");
      assert.equal(await root.locator(".dci-hero__headline").textContent(), "The Infrastructure Behind Trusted Digital Credentials");
      assert.equal(await root.locator(".dci-hero__lead").textContent(), "CertifyMe provides the infrastructure to create, issue, manage, verify and share digital credentials across the systems organisations already use.");
      assert.deepEqual(await root.locator(".dci-source-list > span").allTextContents(),
        ["SIS", "LMS", "HRIS", "Training", "Assessment", "Membership", "APIs"]);
      assert.deepEqual(await root.locator(".dci-architecture__lifecycle > span").allTextContents(),
        ["Create", "Issue", "Verify", "Manage", "Share"]);
      for (let i = 0; i < layers.length; i++) {
        assert.equal(await root.locator(`#layer-0${i + 1} h3`).textContent(), layers[i]);
      }
      assert(!(await root.textContent()).includes("Skill Taxonomy Alignment"));
      assert.equal(await root.locator("#dci-final-title").textContent(), "Build Your Digital Credential Infrastructure");
      assert.equal(await root.locator(".dci-hero a.dci-button--primary").getAttribute("href"), "https://info.certifyme.online/request-demo");
      const layout = await page.evaluate(() => {
        const root = document.getElementById("dci-page");
        const ids = [...document.querySelectorAll("[id]")].map(node => node.id);
        return {
          overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
          duplicateIds: ids.filter((id, i) => ids.indexOf(id) !== i),
          emptyLinks: [...root.querySelectorAll("a")].filter(a => !a.getAttribute("href") || a.getAttribute("href") === "#").length,
          details: root.querySelectorAll("details").length,
          sections: [...root.querySelectorAll("section > div")].map(node => node.querySelector("h2")?.id).filter(Boolean),
        };
      });
      assert(layout.overflow <= 1, `${width}px overflow ${layout.overflow}`);
      assert.deepEqual(layout.duplicateIds, []);
      assert.equal(layout.emptyLinks, 0);
      assert(layout.details >= 6, "Technical detail must be progressively disclosed");
      assert.deepEqual(layout.sections, [
        "", "dci-definition-title", "dci-lifecycle-title", "dci-layers-title",
        "dci-connect-title", "dci-standards-title", "dci-trust-title",
        "dci-governance-title", "dci-extensions-title",
        "dci-implementation-title", "dci-final-title",
      ].filter(Boolean));
      await root.locator('.dci-hero a[href="#dci-lifecycle"]').click();
      assert.equal(new URL(page.url()).hash, "#dci-lifecycle");
      for (const detail of await root.locator("details").all()) {
        await detail.locator("summary").click();
        assert(await detail.evaluate(node => node.open), "Disclosure did not open");
        await detail.locator("summary").click();
        assert(!(await detail.evaluate(node => node.open)), "Disclosure did not close");
      }
      await root.locator('a[href="#layer-01-details"]').click();
      assert(await root.locator("#layer-01-details").evaluate(node => node.open), "Explore more must reveal its detail");
      const contrast = await root.evaluate(node => window.dciContrast(node));
      assert.deepEqual(contrast.filter(x => x.ratio < x.required - 0.05), [], `${width}px text contrast`);
      assert.deepEqual(errors, [], `${width}px browser errors`);
      console.log(`PASS ${width}px: content, architecture, disclosures, links, contrast, no overflow`);
      await context.close();
    }
    const page = await browser.newPage();
    await page.goto(base + route);
    const hrefs = await page.locator("#dci-page a").evaluateAll(nodes => [...new Set(nodes.map(a => a.getAttribute("href")))]);
    for (const href of hrefs.filter(href => href.startsWith("/"))) {
      const url = new URL(href, base);
      assert.equal((await page.request.get(url.href)).status(), 200, `Broken link ${href}`);
      if (url.hash) {
        await page.goto(url.href);
        assert.equal(await page.locator(`[id="${url.hash.slice(1)}"]`).count(), 1, `Missing anchor ${href}`);
      }
    }
    await page.goto(base + route);
    for (const href of hrefs.filter(href => href.startsWith("#"))) {
      assert.equal(await page.locator(`[id="${href.slice(1)}"]`).count(), 1, `Missing anchor ${href}`);
    }
    const nojs = await browser.newContext({ javaScriptEnabled: false });
    const nojsPage = await nojs.newPage();
    await nojsPage.goto(base + route);
    await nojsPage.locator("#dci-page details").first().locator("summary").click();
    assert(await nojsPage.locator("#dci-page details").first().evaluate(node => node.open));
    await nojs.close();
    console.log("PASS internal destinations, fragment anchors and no-JavaScript disclosures");
  } finally {
    await browser.close();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
