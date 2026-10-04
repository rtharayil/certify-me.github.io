#!/usr/bin/env node
// Repeatable mobile lab measurements, not Lighthouse/CrUX or field INP.
const fs=require("node:fs");
const {execFileSync}=require("node:child_process");
const {chromium}=require("playwright");
const phase=process.argv[2];
let browser;
if(!["before","after"].includes(phase))throw new Error("Use before or after.");
const output=".local/reports/performance-closure";
fs.mkdirSync(output,{recursive:true});
const base=`https://${process.env.REPLIT_DEV_DOMAIN}`;
const targets=[
  ["Homepage","/"],["Platform Overview","/platform-overview"],
  ["Higher Education","/credentials-higher-education"],["Skills Taxonomy","/skills-taxonomy-mapping"],
  ["CLR","/comprehensive-learner-record"],["Workforce Intelligence","/workforce-intelligence"],
  ["Security","/security/"],["Comparison Hub","/compare/"],
  ["Comparison article","/blog/certifyme-vs-accredible-2026-comparison.html"],
  ["Long blog article","/blog/what-is-an-academic-transcript.html"],
  ["Case study","/blog/association-case.html"]
];
const quote=v=>`"${String(v??"NOT MEASURED").replaceAll('"','""')}"`;
const median=values=>{const v=values.filter(Number.isFinite).sort((a,b)=>a-b);return v.length?v.length%2?v[(v.length-1)/2]:(v[v.length/2-1]+v[v.length/2])/2:null;};
(async()=>{
  process.env.XDG_CACHE_HOME="/tmp/performance-chromium-cache";
  process.env.XDG_CONFIG_HOME="/tmp/performance-chromium-config";
  browser=await chromium.launch({executablePath:execFileSync("which",["chromium"],{encoding:"utf8"}).trim(),headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
  const existing=`${output}/performance-${phase}-raw.json`;
  const all=process.argv.includes("--resume")&&fs.existsSync(existing)?JSON.parse(fs.readFileSync(existing)).records:[];
  for(const [name,url] of targets){
    for(let run=1;run<=2;run++){
      if(all.some(r=>r.url===url&&r.run===run))continue;
      const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
      const page=await context.newPage(),cdp=await context.newCDPSession(page);
      await cdp.send("Network.enable");await cdp.send("Network.clearBrowserCache");
      await cdp.send("Network.setCacheDisabled",{cacheDisabled:true});
      await cdp.send("Network.emulateNetworkConditions",{offline:false,latency:40,downloadThroughput:1250000,uploadThroughput:625000});
      await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});
      const requests=new Map(),errors=[];
      page.on("pageerror",e=>errors.push(e.message));
      cdp.on("Network.requestWillBeSent",e=>requests.set(e.requestId,{url:e.request.url,type:e.type,method:e.request.method}));
      cdp.on("Network.responseReceived",e=>Object.assign(requests.get(e.requestId)||{},{
        status:e.response.status,mime:e.response.mimeType,
        headers:Object.fromEntries(Object.entries(e.response.headers).filter(([k])=>/^(content-type|content-encoding|cache-control|content-length|etag|last-modified|vary|age|x-cache|server|location)$/i.test(k))),type:e.type,
        fromDiskCache:e.response.fromDiskCache,fromServiceWorker:e.response.fromServiceWorker
      }));
      cdp.on("Network.loadingFinished",e=>{const r=requests.get(e.requestId);if(r)r.encodedBytes=e.encodedDataLength;});
      cdp.on("Network.loadingFailed",e=>{const r=requests.get(e.requestId);if(r)r.failure=e.errorText;});
      await page.addInitScript(()=>{
        window.__perf={lcp:null,lcpElement:null,shifts:[],events:[],longTasks:[]};
        for(const [type,fn] of [
          ["largest-contentful-paint",e=>{window.__perf.lcp=e.startTime;window.__perf.lcpElement=e.element?.outerHTML.slice(0,450)||null;}],
          ["layout-shift",e=>{if(!e.hadRecentInput)window.__perf.shifts.push({time:e.startTime,value:e.value});}],
          ["event",e=>{if(e.interactionId)window.__perf.events.push({duration:e.duration,id:e.interactionId,name:e.name});}],
          ["longtask",e=>window.__perf.longTasks.push(e.duration)]
        ])try{new PerformanceObserver(l=>l.getEntries().forEach(fn)).observe({type,buffered:true,durationThreshold:16});}catch{}
      });
      const start=Date.now();
      const response=await page.goto(base+url,{waitUntil:"domcontentloaded",timeout:60000});
      await page.waitForTimeout(Math.max(0,8000-(Date.now()-start)));
      const initialWire=[...requests.values()].reduce((n,r)=>n+(r.encodedBytes||0),0);
      const initial=await page.evaluate(()=>{
        let maxCLS=0,value=0,start=0,last=0;
        for(const s of window.__perf.shifts){if(s.time-last>1000||s.time-start>5000){value=0;start=s.time;}value+=s.value;last=s.time;maxCLS=Math.max(maxCLS,value);}
        const resources=performance.getEntriesByType("resource");
        return {
          lcp_ms:window.__perf.lcp,cls:maxCLS,lcp_element:window.__perf.lcpElement,
          dom_nodes:document.querySelectorAll("*").length,
          render_blocking:resources.filter(r=>r.renderBlockingStatus==="blocking").map(r=>r.name),
          preloads:[...document.querySelectorAll('link[rel="preload"]')].map(e=>({href:e.href,as:e.as})),
          lazy_images:document.querySelectorAll('img[loading="lazy"]').length,
          eager_images:document.querySelectorAll('img:not([loading="lazy"])').length,
          fonts:[...document.fonts].map(f=>({family:f.family,weight:f.weight,display:f.display,status:f.status})),
          images:[...document.images].map(i=>({src:i.currentSrc||i.src,width:i.getBoundingClientRect().width,height:i.getBoundingClientRect().height,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,loading:i.loading,priority:i.fetchPriority})),
          scripts:[...document.scripts].filter(s=>s.src).map(s=>({src:s.src,defer:s.defer,async:s.async})),
          styles:[...document.querySelectorAll('link[rel="stylesheet"]')].map(s=>s.href),
          mainFont:getComputedStyle(document.querySelector("main")||document.body).fontFamily,
          headingFont:getComputedStyle(document.querySelector("h1")||document.body).fontFamily
        };
      });
      if(run===1&&["/","/credentials-higher-education","/compare/"].includes(url))
        await page.screenshot({path:`${output}/${phase}-${name.toLowerCase().replaceAll(" ","-")}.jpg`,type:"jpeg",quality:85});
      const menu=page.locator("#wsnavtoggle");
      if(await menu.count())try{await menu.click({timeout:1500});await page.waitForTimeout(150);await menu.click({timeout:1500});}catch{}
      const summary=page.locator("main details summary").first();
      if(await summary.count())try{await summary.click({timeout:2000});await page.waitForTimeout(200);await summary.click({timeout:2000});}catch{}
      const interactions=await page.evaluate(()=>window.__perf.events);
      // Explicit lazy sweep: page totals mean assets observed after this sweep, not every possible modal.
      for(let step=1;step<=6;step++){
        await page.evaluate(step=>{
          const height=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight);
          const y=(height-innerHeight)*step/6;window.scrollTo(0,y);document.body.scrollTop=y;
        },step);
        await page.waitForTimeout(350);
      }
      await page.waitForTimeout(800);
      const resources=[...requests.values()];
      const bytes=type=>resources.filter(r=>r.type===type).reduce((n,r)=>n+(r.encodedBytes||0),0);
      const header=(r,key)=>Object.entries(r?.headers||{}).find(([k])=>k.toLowerCase()===key)?.[1]||"NOT PRESENT";
      const document=resources.find(r=>r.type==="Document");
      const third=resources.filter(r=>{try{return new URL(r.url).origin!==new URL(base).origin;}catch{return false;}});
      const record={name,url,run,environment:"LOCAL/REPLIT VERIFIED",http_status:response?.status(),
        html_transfer_bytes:bytes("Document"),initial_transfer_bytes:initialWire,
        total_observed_transfer_bytes:resources.reduce((n,r)=>n+(r.encodedBytes||0),0),
        js_transfer_bytes:bytes("Script"),css_transfer_bytes:bytes("Stylesheet"),font_transfer_bytes:bytes("Font"),image_transfer_bytes:bytes("Image"),
        request_count:resources.length,third_party_requests:third.length,third_party_scripts:third.filter(r=>r.type==="Script").length,
        third_party_transfer_bytes:third.reduce((n,r)=>n+(r.encodedBytes||0),0),
        render_blocking_resources:initial.render_blocking.length,lazy_images:initial.lazy_images,eager_images:initial.eager_images,preloads:initial.preloads.length,
        dom_nodes:initial.dom_nodes,lcp_ms:initial.lcp_ms,cls:initial.cls,
        lab_interaction_max_ms:interactions.length?Math.max(...interactions.map(e=>e.duration)):null,
        inp:"NOT FIELD MEASURABLE — lab interaction candidate recorded separately",
        html_content_encoding:header(document,"content-encoding"),html_cache_control:header(document,"cache-control"),
        compressed_responses:resources.filter(r=>header(r,"content-encoding")!=="NOT PRESENT").length,
        failed_requests:resources.filter(r=>r.failure).length,runtime_errors:errors.length,
        image_formats:[...new Set(resources.filter(r=>r.type==="Image").map(r=>r.mime))].join("; "),
        details:initial,resources,errors};
      all.push(record);
      fs.writeFileSync(`${output}/performance-${phase}-raw.json`,JSON.stringify({method:"2 cold-cache mobile runs; 390x844; 4x CPU; 10 Mbps download/5 Mbps upload, 40ms latency; all analytics retained. Initial observation at 8 seconds, then menu/FAQ input and a six-step lazy sweep. Wire byte totals include completed CDP responses/header overhead. LCP/CLS are initial lab observations, not field CWV.",records:all},null,2));
      console.log(`${phase}: ${name} ${run}/2 LCP=${record.lcp_ms}ms initial=${initialWire} total=${record.total_observed_transfer_bytes}`);
      await context.close();
    }
  }
  await browser.close();
  const columns=Object.keys(all[0]).filter(k=>!["run","details","resources","errors"].includes(k));
  const numeric=columns.filter(k=>typeof all[0][k]==="number"||k==="lcp_ms"||k==="lab_interaction_max_ms");
  const summary=targets.map(([name,url])=>{
    const samples=all.filter(r=>r.url===url),row={...samples[0],run:"median of 2"};
    for(const key of numeric)row[key]=median(samples.map(r=>r[key]));
    return row;
  });
  fs.writeFileSync(`${output}/performance-${phase}.csv`,[columns.map(quote).join(","),...summary.map(r=>columns.map(k=>quote(r[k])).join(","))].join("\n")+"\n");
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1;});