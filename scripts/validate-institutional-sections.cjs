const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");
const { visibleLabelContrast } = require("./lib/visible-label-contrast.cjs");

const base = process.env.INSTITUTIONAL_SECTIONS_BASE_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;
const targets = JSON.parse(execFileSync("bundle", ["exec", "ruby", "-rjson", "-ryaml", "-e", `
  native = {}
  (Dir.glob('*.{html,md}') + Dir.glob('_blog/*.{html,md}')).each do |file|
    front = File.read(file).match(/\\A---\\s*\\n(.*?)\\n---/m)
    next unless front
    data = YAML.unsafe_load(front[1])
    if data.is_a?(Hash)
      url = data['permalink'] || (file.start_with?('_blog/') && '/blog/' + File.basename(file, '.*') + '.html')
      native[url] = data['faqs'] || [] if url
    end
  end
  editorial = JSON.parse(File.read('_data/authority_editorial.json'))
  puts JSON.generate(JSON.parse(File.read('_data/ai_authority.json')).map do |record|
    record.merge('questions' => (native[record['url']] || []) +
      (editorial.find { |e| e['url'] == record['url'] } || {}).fetch('faq', []) +
      record['answers'])
  end)
`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));

function checkGeneratedPages(dir) {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) count += checkGeneratedPages(file);
    else if (entry.name.endsWith(".html")) {
      const html = fs.readFileSync(file, "utf8");
      if (!html.includes('class="institutional-links"')) continue;
      assert(html.includes("/assets4/css/institutional-sections.css"), `${file}: shared stylesheet missing`);
      assert.equal((html.match(/class="institutional-links__group"/g) || []).length, 3, `${file}: navigation groups missing`);
      assert(html.includes('id="supporting-resources-title"'), `${file}: resources heading missing`);
      count++;
    }
  }
  return count;
}

async function check() {
  const count = checkGeneratedPages("_site");
  assert(count >= 10);
  console.log(`PASS: grouped navigation and shared styling emitted on ${count} pages.`);
  const browser = await chromium.launch({
    executablePath: execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    await context.route(/googletagmanager|google-analytics|clarity\.ms|connect\.facebook|hotjar/, route => route.abort());
    const links = new Set();
    for (const width of [1440, 768, 390, 320]) {
      const page = await context.newPage();
      await page.setViewportSize({ width, height: 1000 });
      for (const target of targets) {
        const response = await page.goto(base + target.url, { waitUntil: "domcontentloaded", timeout: 30000 });
        assert.equal(response.status(), 200);
        await page.locator(".institutional-links__grid").waitFor();
        const result = await page.evaluate(() => {
          const normalise = value => value.replace(/\s+/g, " ").trim().toLowerCase();
          const section = document.querySelector(".institutional-faqs");
          const summaries = [...section.querySelectorAll("summary")];
          const allHeadings = [...document.querySelectorAll("main h2, main h3")].map(el => el.textContent.trim());
          const blocks = [...document.querySelectorAll(".institutional-links, .institutional-faqs")];
          const overflow = blocks.flatMap(el => [el, ...el.querySelectorAll("a, summary, h2, h3")])
            .some(el => { const r = el.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1; });
          const schemaErrors = [];
          function visit(value) {
            if (!value || typeof value !== "object") return;
            if (value["@type"] === "FAQPage") {
              for (const faq of value.mainEntity) {
                const summary = summaries.find(el => normalise(el.textContent) === normalise(faq.name));
                const answer = summary?.parentElement.querySelector(".institutional-faqs__answer");
                if (!answer || !normalise(answer.textContent).includes(normalise(faq.acceptedAnswer.text)))
                  schemaErrors.push(faq.name);
              }
            }
            Object.values(value).forEach(child => {
              if (Array.isArray(child)) child.forEach(visit);
              else if (child && typeof child === "object") visit(child);
            });
          }
          document.querySelectorAll('script[type="application/ld+json"]').forEach(el => visit(JSON.parse(el.textContent)));
          return {
            faqSections: document.querySelectorAll(".institutional-faqs").length,
            faqHeadings: allHeadings.filter(text => /^Common questions/i.test(text)).length,
            oldSections: document.querySelectorAll("main .he-faq, main .clr-faqs, main .stm-faq-list, main .wi-answers, main .faqs-section, main .blog-faq-section").length,
            questions: summaries.map(el => normalise(el.textContent)),
            categories: section.querySelectorAll("[data-answer-category]").length,
            links: [...document.querySelectorAll(".institutional-links a")].map(el => el.getAttribute("href")),
            groups: document.querySelectorAll(".institutional-links__group").length,
            resources: document.querySelectorAll(".institutional-resources__grid li").length,
            overflow, schemaErrors,
          };
        });
        assert.equal(result.faqSections, 1, `${target.url}: multiple FAQ sections`);
        assert.equal(result.faqHeadings, 1, `${target.url}: duplicate Common questions headings`);
        assert.equal(result.oldSections, 0, `${target.url}: legacy FAQ block remains`);
        assert.equal(result.overflow, false, `${target.url}: section overflow at ${width}px`);
        assert.equal(result.groups, 3);
        assert.equal(result.resources, 4);
        assert.equal(result.categories, 8, `${target.url}: answer category coverage changed`);
        assert.deepEqual(result.schemaErrors, [], `${target.url}: FAQ schema no longer matches rendered answers`);
        const expected = [...new Set(target.questions.map(faq => faq.question.trim().toLowerCase()))];
        assert.deepEqual(result.questions, expected, `${target.url}: questions were lost or duplicated`);
        assert.equal(result.questions.length, new Set(result.questions).size);
        result.links.forEach(link => links.add(link));
        const first = page.locator(".institutional-faqs summary").first();
        await first.scrollIntoViewIfNeeded();
        await first.focus();
        await page.keyboard.press("Space");
        assert(await first.evaluate(el => el.parentElement.open), `${target.url}: keyboard cannot open FAQ`);
        assert(await first.locator("..").locator(".institutional-faqs__answer").isVisible());
        await page.keyboard.press("Enter");
        assert.equal(await first.evaluate(el => el.parentElement.open), false);
        const last = page.locator(".institutional-faqs summary").last();
        await last.click();
        assert(await last.evaluate(el => el.parentElement.open), `${target.url}: pointer cannot open FAQ`);
        await last.click();
        if (width === 1440 || width === 320) {
          for (const link of await page.locator(".institutional-links a").all()) {
            const segments = await link.evaluate(visibleLabelContrast);
            assert(segments.length && segments.every(s => !s.provisional && s.ratio + .01 >= s.required),
              `${target.url}: unreadable navigation/resource link`);
          }
        }
      }
      console.log(`PASS ${width}px: ${targets.length} pages, one FAQ, all unique questions retained, schema, keyboard/pointer interaction and responsive sections.`);
      await page.close();
    }
    for (const link of links) {
      const response = await context.request.get(base + link);
      assert.equal(response.status(), 200, `Broken navigation/resource destination ${link}`);
    }
    console.log(`PASS: all ${links.size} navigation and resource destinations are reachable.`);
  } finally {
    await browser.close();
  }
}

check().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
