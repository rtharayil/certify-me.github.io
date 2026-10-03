#!/usr/bin/env node
// Round 2 deliberately reads the serving application, not Round 1's JSON/HTML parser.
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const { execFileSync } = require("node:child_process");
const BASE = `https://${process.env.REPLIT_DEV_DOMAIN}`;
const OUT = path.resolve(".local/reports/enterprise-seo/round-2");
const PRIORITY = [
  "/", "/platform-overview", "/credentials-higher-education",
  "/blog/why-institutions-should-embrace-open-badges-3-0-standards",
  "/blog/Understanding-W3C-Verifiable-Credentials.html", "/skills-taxonomy-mapping",
  "/comprehensive-learner-record", "/workforce-intelligence", "/certificate-verification",
  "/security/", "/compare/", "/case-studies.html",
  ...["parchment", "credly", "accredible", "certifier", "sertifier"].map(v => `/blog/certifyme-vs-${v}-2026-comparison.html`),
];
const WIDTHS = [320, 375, 390, 430, 768, 1440];
const INTENTS = [
  ["digital credential platform", "/platform-overview"], ["digital credentials", "/platform-overview"],
  ["digital credential infrastructure", "/platform-overview"], ["digital badges", "/digital-badges.html"],
  ["digital badge platform", "/digital-badges.html"], ["credential verification", "/certificate-verification"],
  ["Open Badges 3.0", PRIORITY[3]], ["W3C Verifiable Credentials", PRIORITY[4]], ["verifiable credentials", PRIORITY[4]],
  ["comprehensive learner record", "/comprehensive-learner-record"], ["CLR", "/comprehensive-learner-record"],
  ["digital learner record", "/comprehensive-learner-record"], ["skills taxonomy", "/skills-taxonomy-mapping"],
  ["skills taxonomy mapping", "/skills-taxonomy-mapping"], ["credential-to-skill mapping", "/skills-taxonomy-mapping"],
  ["ESCO skills", "/skills-taxonomy-mapping"], ["O*NET skills", "/skills-taxonomy-mapping"],
  ["microcredentials", "/micro-credentials"], ["digital credentials for universities", "/credentials-higher-education"],
  ["digital badges for universities", "/credentials-higher-education"], ["digital transcripts", "/credentials-higher-education"],
  ["digital diplomas", "/credentials-higher-education"], ["student skill passport", "/skills-passport"],
  ["graduate employability", "/workforce-intelligence"], ["workforce intelligence", "/workforce-intelligence"],
  ["credential analytics", "/credential-analytics.html"], ["digital credential API", "/api/"],
  ["digital credential integrations", "/allIntegrations.html"],
];
const QUESTIONS = [
  ["What is CertifyMe?", "/platform-overview", ["infrastructure", "institution", "credential"]],
  ["What is CertifyMe's primary market?", "/", ["institution", "universit"]],
  ["What is a digital credential?", "/credentials-higher-education", ["achievement", "issuer", "credential"]],
  ["How does CertifyMe support Open Badges 3.0?", PRIORITY[3], ["issuer", "1edtech", "3.0"]],
  ["How does credential verification work?", "/certificate-verification", ["proof", "issuer", "status"]],
  ["How does CertifyMe map credentials to skills?", "/skills-taxonomy-mapping", ["learning outcome", "evidence", "skill"]],
  ["What is CertifyMe's Comprehensive Learner Record?", "/comprehensive-learner-record", ["achievement", "provenance", "transcript"]],
  ["How do skills connect to workforce intelligence?", "/workforce-intelligence", ["occupation", "skill", "market"]],
  ["How does CertifyMe differ from a certificate generator?", "/platform-overview", ["govern", "verification", "record"]],
  ["How does CertifyMe differ from Accredible, Certifier and Credly?", "/compare/", ["accredible", "certifier", "credly"]],
  ["Why would a university use CertifyMe?", "/credentials-higher-education", ["achievement", "record", "skill"]],
  ["What security capabilities does CertifyMe provide?", "/security/", ["sso", "mfa", "iso", "soc"]],
];
async function main() {
  if (!process.env.REPLIT_DEV_DOMAIN) throw new Error("REPLIT_DEV_DOMAIN required");
  fs.mkdirSync(OUT, { recursive: true });
  const xml = await fetch(BASE + "/sitemap.xml");
  if (!xml.ok) throw new Error(`Sitemap HTTP ${xml.status}`);
  const urls = [...(await xml.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname);
  const statuses = [];
  let cursor = 0;
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (cursor < urls.length) {
      const route = urls[cursor++];
      try {
        const response = await fetch(BASE + route, { redirect: "follow" });
        statuses.push({ route, status: response.status, contentType: response.headers.get("content-type") });
        await response.body.cancel();
      } catch (e) { statuses.push({ route, status: 0, error: e.message }); }
    }
  }));
  const browser = await chromium.launch({ executablePath: execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(), headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  const layouts = [], documents = new Map(), errors = [];
  page.on("pageerror", e => errors.push(e.message));
  // Suppress only unrelated analytics/ad traffic; keep application JS, CSS and images.
  await page.route(/googletagmanager\.com|google-analytics\.com|doubleclick\.net/, r => r.abort());
  const destinations = [...new Set([...PRIORITY, ...INTENTS.map(i => i[1])])];
  for (const route of destinations) {
    for (const width of (PRIORITY.includes(route) ? WIDTHS : [390, 1440])) {
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForTimeout(220);
      const result = await page.evaluate(() => {
        const main = document.querySelector("main") || document.body;
        return {
          title: document.title, h1: [...document.querySelectorAll("h1")].map(x => x.textContent.trim()),
          text: main.textContent.replace(/\s+/g, " ").trim(),
          links: [...main.querySelectorAll("a[href]")].map(a => ({ href: a.getAttribute("href"), label: a.textContent.trim() })),
          overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
          description: document.querySelector("meta[name=description]")?.content,
          canonical: document.querySelector("link[rel=canonical]")?.href,
          robots: document.querySelector("meta[name=robots]")?.content,
          jsonErrors: [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(s => {
            try { JSON.parse(s.textContent); return []; } catch (e) { return [e.message]; }
          }),
          brokenImages: [...main.querySelectorAll("img")].filter(i => i.complete && i.currentSrc && i.naturalWidth === 0).map(i => i.getAttribute("src")),
          timing: performance.getEntriesByType("navigation").map(n => ({ domContentLoadedMs: n.domContentLoadedEventEnd, loadMs: n.loadEventEnd })),
        };
      });
      const row = { route, width, status: response.status(), overflow: result.overflow, h1Count: result.h1.length,
                    jsonErrors: result.jsonErrors, brokenImages: result.brokenImages, timing: result.timing };
      layouts.push(row);
      documents.set(route, result);
      if (width === 390 && ["/", "/security/", PRIORITY[4], "/case-studies.html"].includes(route))
        await page.screenshot({ path: path.join(OUT, `${route === "/" ? "home" : route.replace(/[^a-z0-9]/gi, "-")}-390.png`) });
    }
  }
  const intents = INTENTS.map(([query, route]) => {
    const d = documents.get(route), tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const text = (d?.text.toLowerCase() || "").replace(/micro[- ]credentials/g, "microcredentials");
    const overlap = tokens.filter(t => text.includes(t)).length / tokens.length;
    return { query, bestPage: route, existingPage: Boolean(d), intentStatus: overlap >= .66 ? "PASS" : "PARTIAL",
      indexed: "UNKNOWN — no Search Console access", title: d?.title, h1: d?.h1,
      competingCandidates: [...documents.entries()].filter(([u, v]) => u !== route && tokens.every(t => (v.title + " " + v.h1.join(" ")).toLowerCase().includes(t))).map(([u]) => u),
      supportingIncomingPages: [...documents.entries()].filter(([u, v]) => u !== route && v.links.some(l => l.href?.split("#")[0] === route)).map(([u]) => u),
      note: "Term coverage is triage, not a ranking or a manual editorial-quality score." };
  });
  const answers = QUESTIONS.map(([question, route, terms]) => {
    const d = documents.get(route), text = d?.text || "", lower = text.toLowerCase();
    const missing = terms.filter(t => !lower.includes(t));
    const paragraphs = text.match(/[^.!?]+[.!?]?/g) || [];
    return { question, route, status: missing.length ? "PARTIAL" : "PASS", missing,
      evidence: paragraphs.filter(p => terms.some(t => p.toLowerCase().includes(t))).slice(0, 4).map(p => p.trim()),
      note: "Evidence extracted from fresh DOM text; final interpretation must be reviewed, not inferred from this token test alone." };
  });
  const interactions = [];
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(BASE + "/platform-overview", { waitUntil: "domcontentloaded" });
  const summary = page.locator("#platform-faq-title").locator("..").locator("details summary").first();
  await summary.click();
  interactions.push({ name: "Native FAQ expands", pass: await summary.evaluate(el => el.parentElement.open) });
  await summary.click();
  interactions.push({ name: "Native FAQ collapses", pass: await summary.evaluate(el => !el.parentElement.open) });
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  const menu = page.locator(".wsanimated-arrow").first();
  if (await menu.isVisible()) {
    await menu.click();
    interactions.push({ name: "Mobile menu opens", pass: await page.locator("body").evaluate(el => el.classList.contains("wsactive")) });
    await menu.click();
  }
  await browser.close();
  const issues = [
    ...statuses.filter(r => r.status !== 200).map(r => ({ severity: "critical", ...r, issue: "Sitemap HTTP destination not 200" })),
    ...layouts.filter(r => r.overflow > 2 || r.status !== 200 || r.h1Count !== 1 || r.jsonErrors.length || r.brokenImages.length)
      .map(r => ({ severity: "high", ...r, issue: "Rendered layout/heading/schema/image check" })),
    ...interactions.filter(i => !i.pass).map(i => ({ severity: "high", ...i })),
  ];
  const report = { round: "SEO TEST ROUND 2 — ADVERSARIAL VALIDATION",
    method: "Independent live HTTP requests and Chromium DOM checks; no Round 1 report read",
    status: issues.length ? "FAIL" : "PASS", sitemapResponses: statuses, layouts, intents, answers, interactions,
    browserErrors: [...new Set(errors)], issues,
    limitations: ["Published host redirects and Google indexing are not inferred from preview checks.",
      "Analytics/ad requests were suppressed in layout checks; analytics delivery was not verified.",
      "External demo/contact forms were not submitted; CTA destinations were retained.",
      "Timing is local synthetic data, not production Core Web Vitals."] };
  fs.writeFileSync(path.join(OUT, "adversarial.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ status: report.status, httpChecks: statuses.length, layoutChecks: layouts.length,
    issues, partialIntents: intents.filter(i => i.intentStatus !== "PASS"), partialAnswers: answers.filter(a => a.status !== "PASS"),
    interactions, browserErrors: report.browserErrors }, null, 2));
  if (issues.length) process.exitCode = 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });