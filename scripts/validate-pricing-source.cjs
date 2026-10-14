#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");

// Mutate an isolated build's data, never the owner's YAML or the preview output.
async function run() {
  const root = path.resolve(__dirname, "..");
  const original = fs.readFileSync(path.join(root, "_data/pricing_features.yml"), "utf8");
  const data = JSON.parse(execFileSync("ruby", ["-ryaml", "-rjson", "-e",
    'puts JSON.generate(YAML.load_file("_data/pricing_features.yml"))'], { cwd: root, encoding: "utf8" }));
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "pricing-source-"));
  let browser;
  try {
    data.hero.heading = "Source-controlled pricing introduction";
    data.security_clarifier = "Source-controlled security clarification";
    data.faqs[0].question = "Source-controlled question";
    data.faqs[0].answer = "Source-controlled answer";
    data.plans.forEach((plan, i) => {
      plan.headline = `Source-controlled card ${i + 1}`;
      plan.capacity.templates = `Source-controlled limit ${i + 1}`;
    });
    const feature = {
      feature: "Source & UI <synchronization> probe",
      essentials: "Source-controlled Essentials value",
      professional: "Source-controlled Professional value",
      enterprise: "Source-controlled Enterprise value",
    };
    data.comparison[0].category = "Source-controlled category";
    data.comparison[0].rows.push(feature);
    const fixture = path.join(temp, "pricing.json");
    const destination = path.join(temp, "site");
    fs.writeFileSync(fixture, JSON.stringify(data));
    execFileSync("bundle", ["exec", "ruby", "-rjekyll", "-rjson", "-e", `
      replacement = JSON.parse(File.read(ARGV[0]))
      Jekyll::Hooks.register :site, :post_read do |site|
        site.data["pricing_features"] = replacement
      end
      site = Jekyll::Site.new(Jekyll.configuration(
        "source" => ARGV[2], "destination" => ARGV[1],
        "cache_dir" => File.join(File.dirname(ARGV[1]), "cache"), "quiet" => true
      ))
      site.process
    `, fixture, destination, root], { cwd: root, stdio: "pipe" });

    browser = await chromium.launch({
      executablePath: execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(),
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
      env: { ...process.env, XDG_CONFIG_HOME: temp, XDG_CACHE_HOME: temp },
    });
    const page = await browser.newPage({ javaScriptEnabled: false });
    await page.route("**/*", route => route.abort());
    await page.setContent(fs.readFileSync(path.join(destination, "pricing.html"), "utf8"));
    assert.equal(await page.locator("main h1").textContent(), data.hero.heading);
    assert.equal(await page.locator(".pricing-model__clarifier").last().textContent(), data.security_clarifier);
    assert.equal(await page.locator(".pricing-faq summary").first().textContent(), data.faqs[0].question);
    assert.equal((await page.locator(".pricing-faq__answer").first().textContent()).trim(), data.faqs[0].answer);
    assert.equal(await page.locator(".pricing-category > summary").first().textContent(), data.comparison[0].category);
    for (const plan of data.plans) {
      const card = page.locator(`#plan-${plan.key}`);
      assert.equal(await card.locator(".pricing-card__headline").textContent(), plan.headline);
      assert.equal(await card.locator(".pricing-capacity__row strong").nth(2).textContent(), plan.capacity.templates);
      const details = await card.locator(".pricing-plan-details li").allTextContents();
      assert(details.some(text => text.trim() === `Credential templates: ${plan.capacity.templates}`));
      assert(details.some(text => text.trim() === `${feature.feature}: ${feature[plan.key]}`));
      const templateRow = page.locator(".pricing-matrix tr").filter({
        has: page.locator("td:first-child", { hasText: /^Credential templates$/ }),
      });
      assert.equal(await templateRow.locator(`td[data-plan="${plan.name}"]`).textContent(), plan.capacity.templates);
      const addedRow = page.locator(".pricing-matrix tr").filter({
        has: page.locator("td:first-child", { hasText: feature.feature }),
      });
      assert.equal(await addedRow.locator(`td[data-plan="${plan.name}"]`).textContent(), feature[plan.key]);
    }
    console.log("PASS isolated YAML edits update the introduction, cards, capacities, detailed plans, comparison, added rows, FAQs and security clarification");
  } finally {
    if (browser) await browser.close();
    fs.rmSync(temp, { recursive: true, force: true });
    assert.equal(fs.readFileSync(path.join(root, "_data/pricing_features.yml"), "utf8"), original,
      "Source test must never modify the real pricing data");
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
