#!/usr/bin/env node
// Production-safe CSS build. Images are generated separately in development.
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),esbuild=require("esbuild");
const file="_data/performance_assets.json";
const manifest=JSON.parse(fs.readFileSync(file));
for(const [original,entry] of Object.entries(manifest.styles)){
  const source=fs.readFileSync(original.slice(1),"utf8");
  const code=esbuild.transformSync(source,{loader:"css",minify:true,legalComments:"inline"}).code;
  const hash=crypto.createHash("sha256").update(code).digest("hex").slice(0,12);
  const output=original.replace(/\.css$/,`.${hash}.min.css`);
  fs.writeFileSync(output.slice(1),code);
  entry.href=output;entry.original_bytes=Buffer.byteLength(source);entry.bytes=Buffer.byteLength(code);
}
for(const [original,entry] of Object.entries(manifest.images)){
  const sourceHash=crypto.createHash("sha256").update(fs.readFileSync(original.slice(1))).digest("hex");
  if(entry.source_sha256&&entry.source_sha256!==sourceHash)
    throw new Error("Artwork source changed; regenerate its variants before building: "+original);
  entry.source_sha256=sourceHash;
  for(const v of entry.variants||[entry]){
    if(!fs.existsSync(v.src.slice(1)))throw new Error("Optimized media missing: "+v.src);
  }
}
fs.writeFileSync(file,JSON.stringify(manifest,null,2)+"\n");
console.log(`Built ${Object.keys(manifest.styles).length} content-hashed stylesheets; verified committed media variants.`);