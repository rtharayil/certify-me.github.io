#!/usr/bin/env node
// Scoped Phase 4 rendered content checks; does not rerun the earlier technical gates.
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");
const output = ".local/reports/competitor-ai-seo";
const authorities = JSON.parse(fs.readFileSync("_data/ai_authority.json"));
const vendors = JSON.parse(fs.readFileSync("_data/competitor_evidence.json")).vendors;
const targets = [...authorities.map(a=>({url:a.url,id:a.id})),...vendors.map(v=>({
  url:`/blog/certifyme-vs-${v.slug}-2026-comparison.html`,vendor:v.slug,
  expectedEvidenceUrls:[...new Set(v.facts.flatMap(f=>f.sources.map(s=>s.url)))]
}))];
const base = process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null;
if (!base) throw new Error("The preview development domain is required.");
(async()=>{
  process.env.XDG_CACHE_HOME="/tmp/phase4-chromium-cache";
  process.env.XDG_CONFIG_HOME="/tmp/phase4-chromium-config";
  const browser = await chromium.launch({
    executablePath:execFileSync("which",["chromium"],{encoding:"utf8"}).trim(),
    args:["--no-sandbox","--disable-dev-shm-usage"],headless:true
  });
  const context=await browser.newContext({viewport:{width:390,height:844}});
  await context.route(/googletagmanager|google-analytics|clarity\.ms|connect\.facebook|hotjar/,r=>r.abort());
  const page=await context.newPage();
  const results=[],issues=[],runtime=[];
  let current="";
  page.on("pageerror",e=>runtime.push({url:current,error:e.message}));
  for(const target of targets){
    current=target.url;
    const response=await page.goto(base+target.url,{waitUntil:"load",timeout:45000});
    await page.evaluate(async()=>{await document.fonts.ready;});
    await page.waitForTimeout(350);
    const checks=await page.evaluate(target=>{
      const visible=el=>{
        if(!el||!el.textContent.trim()||el.getBoundingClientRect().height<1)return false;
        for(let n=el;n&&n.nodeType===1;n=n.parentElement){
          const s=getComputedStyle(n);
          if(s.display==="none"||s.visibility==="hidden"||Number(s.opacity)===0)return false;
        }return true;
      };
      const lead=target.id?document.querySelector(`[data-ai-answer="${target.id}"]`):null;
      const answers=target.id?document.querySelector(`[data-ai-authority="${target.id}"]`):null;
      const table=target.vendor?document.querySelector(`[data-comparison-evidence="${target.vendor}"]`):null;
      const wrap=table?.parentElement;
      let tableScrollable=null;
      if(table&&wrap){
        const original=wrap.scrollLeft;wrap.scrollLeft=10000;
        tableScrollable=wrap.scrollWidth<=wrap.clientWidth||wrap.scrollLeft>0;
        wrap.scrollLeft=original;
      }
      return {
        h1:document.querySelectorAll("main h1").length,
        horizontalOverflow:Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth,
        leadPresent:target.id?visible(lead):null,
        answers:answers?answers.querySelectorAll("[data-answer-category]").length:null,
        comparisonRows:table?table.querySelectorAll("tbody tr").length:null,
        externalEvidenceLinks:table?document.querySelectorAll('.comparison-sources a[href^="https://"]').length:null,
        evidenceLinksComplete:target.vendor?target.expectedEvidenceUrls.every(url=>
          [...document.querySelectorAll('.comparison-sources a')].some(a=>a.getAttribute('href')===url)):null,
        tableScrollable,
        sourceSans:getComputedStyle(document.querySelector("main")).fontFamily
      };
    },target);
    const result={...target,http:response?.status(),viewport:390,...checks};
    results.push(result);
    if(result.http!==200||result.h1!==1||result.horizontalOverflow>2||
      (target.id&&(!result.leadPresent||result.answers!==8))||
      (target.vendor&&(result.comparisonRows!==22||!result.tableScrollable||!result.evidenceLinksComplete))){
      issues.push(result);
    }
  }
  await page.setViewportSize({width:1365,height:900});
  for(const target of [targets[0],targets.find(t=>t.id==="higher-education"),targets.find(t=>t.id==="comparisons")]){
    current=target.url;
    await page.goto(base+target.url,{waitUntil:"load"});
    const overflow=await page.evaluate(()=>Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth);
    results.push({url:target.url,viewport:1365,horizontalOverflow:overflow});
    if(overflow>2)issues.push({url:target.url,viewport:1365,overflow});
  }
  await browser.close();
  fs.writeFileSync(`${output}/phase4-browser-checks.json`,JSON.stringify({method:"Real preview browser; 15 mobile routes plus three desktop routes; tables scrolled programmatically; analytics requests suppressed.",results,issues,runtime},null,2));
  console.log(JSON.stringify({routes:results.length,issues,runtime},null,2));
  if(issues.length||runtime.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});