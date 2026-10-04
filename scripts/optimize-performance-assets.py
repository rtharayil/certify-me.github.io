#!/usr/bin/env python3
"""Optimize measured local resources; retain originals and lossless artwork."""
import base64
import hashlib
import io
import json
import re
import subprocess
from pathlib import Path
from urllib.parse import unquote, urlparse
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT / ".local/reports/performance-closure"
baseline=json.loads((OUT / "performance-before-raw.json").read_text())
candidates={}
css=set()
for r in baseline["records"]:
    for resource in r["resources"]:
        path=unquote(urlparse(resource["url"]).path).lstrip("/")
        file=ROOT / path
        if not file.is_file():continue
        if resource["type"]=="Image" and file.stat().st_size>50000 and file.suffix.lower() in {".png",".jpg",".jpeg",".svg"}:
            candidates[path]=file
        if resource["type"]=="Stylesheet" and file.stat().st_size>15000 and path.startswith("assets4/css/") and ".min." not in path:
            css.add(path)
dest=ROOT / "assets4/performance/images"
dest.mkdir(parents=True,exist_ok=True)
manifest={"images":{},"styles":{},"method":"Measured resources only; lossless WebP, unchanged SVG vectors with smaller lossless embedded rasters; originals retained. CSS parser minification, no unused-rule purge."}
for path,file in candidates.items():
    digest=hashlib.sha256(file.read_bytes()).hexdigest()[:12]
    stem=re.sub(r"[^a-zA-Z0-9_-]+","-",file.stem)[:65]
    if file.suffix.lower()==".svg":
        source=file.read_text()
        # Moving SVGs with external relative references could change their semantics.
        refs=re.findall(r'(?:href|xlink:href)=["\']([^"\']+)',source)
        if any(not ref.startswith(("data:","#","http:","https:","/")) for ref in refs):continue
        count=[0]
        def embedded(m):
            raw=base64.b64decode(m[2])
            with Image.open(io.BytesIO(raw)) as img:
                buf=io.BytesIO();img.convert("RGBA").save(buf,format="WEBP",lossless=True,method=6)
            if len(buf.getvalue())>=len(raw):return m[0]
            count[0]+=1
            return "data:image/webp;base64,"+base64.b64encode(buf.getvalue()).decode()
        converted=re.sub(r"data:image/(png|jpeg);base64,([A-Za-z0-9+/=]+)",embedded,source)
        if count[0] and len(converted.encode())<file.stat().st_size*.95:
            digest=hashlib.sha256(converted.encode()).hexdigest()[:12]
            target=dest / f"{stem}.{digest}.svg";target.write_text(converted)
            manifest["images"]["/"+path]={"src":"/"+str(target.relative_to(ROOT)),"original_bytes":file.stat().st_size,"bytes":target.stat().st_size,"embedded_rasters":count[0],"lossless":True}
        continue
    with Image.open(file) as image:
        original=image.convert("RGBA")
        widths=sorted(set(min(w,original.width) for w in [480,960,1440]))
        variants=[]
        for width in widths:
            height=round(original.height*width/original.width)
            resized=original if width==original.width else original.resize((width,height),Image.Resampling.LANCZOS)
            buf=io.BytesIO();resized.save(buf,format="WEBP",lossless=True,method=6)
            digest=hashlib.sha256(buf.getvalue()).hexdigest()[:12]
            target=dest / f"{stem}.{digest}-{width}.webp"
            target.write_bytes(buf.getvalue())
            variants.append({"src":"/"+str(target.relative_to(ROOT)),"width":width,"height":height,"bytes":target.stat().st_size})
        largest=variants[-1]
        if largest["bytes"]<file.stat().st_size*.95:
            manifest["images"]["/"+path]={"src":largest["src"],"width":largest["width"],"height":largest["height"],
                "original_width":original.width,"original_height":original.height,
                "original_bytes":file.stat().st_size,"bytes":largest["bytes"],"variants":variants,
                "lossless_encoding":True,"resampling":"Lanczos only for responsive smaller variants; no crop"}
for path in sorted(css):
    file=ROOT / path
    code="const fs=require('fs'),e=require('esbuild');const src=fs.readFileSync(process.argv[1],'utf8');process.stdout.write(e.transformSync(src,{loader:'css',minify:true,legalComments:'inline'}).code)"
    result=subprocess.run(["node","-e",code,str(file)],cwd=ROOT,capture_output=True,text=True,check=True)
    digest=hashlib.sha256(result.stdout.encode()).hexdigest()[:12]
    target=file.with_name(file.stem+"."+digest+".min.css")
    target.write_text(result.stdout)
    if target.stat().st_size<file.stat().st_size*.95:
        manifest["styles"]["/"+path]={"href":"/"+str(target.relative_to(ROOT)),"original_bytes":file.stat().st_size,"bytes":target.stat().st_size}
for original,entry in manifest["images"].items():
    entry["source_sha256"]=hashlib.sha256((ROOT / original.lstrip("/")).read_bytes()).hexdigest()
(ROOT / "_data/performance_assets.json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n")
(OUT / "asset-optimization.json").write_text(json.dumps(manifest,indent=2))
print(json.dumps({"image_resources":len(manifest["images"]),"css_resources":len(manifest["styles"]),"original_bytes":sum(v["original_bytes"] for k in ["images","styles"] for v in manifest[k].values()),"optimized_default_bytes":sum(v["bytes"] for k in ["images","styles"] for v in manifest[k].values())},indent=2))