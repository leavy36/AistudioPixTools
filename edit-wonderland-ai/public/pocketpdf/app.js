/* PocketPDF v3 — 100% local image toolkit.
   Modules: Convert (HEIC + universal) · Resize (Icon & Banner) · Optimize (Smart Shrink)
   Batch capped at 15 files. No PDF, no OCR, no server.
*/
"use strict";

const BATCH_MAX = 15;

/* ---------- i18n (compact) ---------- */
const I18N = {
  en:{name:"English",dir:"ltr"},
  fr:{name:"Français",dir:"ltr"},
  es:{name:"Español",dir:"ltr"},
  de:{name:"Deutsch",dir:"ltr"},
  it:{name:"Italiano",dir:"ltr"},
  pt:{name:"Português",dir:"ltr"},
  ar:{name:"العربية",dir:"rtl"},
  zh:{name:"中文",dir:"ltr"},
  ja:{name:"日本語",dir:"ltr"},
  ko:{name:"한국어",dir:"ltr"},
  ru:{name:"Русский",dir:"ltr"},
  hi:{name:"हिन्दी",dir:"ltr"}
};
const STR = {
  nofile:{en:"No file loaded",fr:"Aucun fichier"},
  working:{en:"Working…",fr:"Traitement…"},
  done:{en:"Done",fr:"Terminé"},
  error:{en:"Error",fr:"Erreur"},
  footer:{en:"PocketPDF · runs entirely on your device",fr:"PocketPDF · s'exécute sur votre appareil"}
};
let LANG = localStorage.getItem("ppdf_lang") || "en";
if(!I18N[LANG]) LANG = "en";
function t(k){ const o = STR[k]; if(!o) return k; return o[LANG] || o.en || k; }

/* ---------- Tools registry ---------- */
const TOOLS = [
  { group:"Convert",  id:"heic",     icon:"📱", name:{en:"HEIC → JPG/PNG",fr:"HEIC → JPG/PNG"} },
  { group:"Convert",  id:"convert",  icon:"🔁", name:{en:"Universal converter",fr:"Convertisseur universel"} },
  { group:"Resize",   id:"resize",   icon:"🖼️", name:{en:"Icon & Banner",fr:"Icône & Bannière"} },
  { group:"Optimize", id:"smart",    icon:"🗜️", name:{en:"Smart Shrink",fr:"Smart Shrink"} },
  { group:"About",    id:"about",    icon:"ℹ️", name:{en:"About",fr:"À propos"} }
];
function toolName(tl){ return tl.name[LANG] || tl.name.en; }
let CURRENT = TOOLS[0].id;

/* ---------- UI helpers ---------- */
function toast(msg, ms=2200){
  const el = document.getElementById("toast");
  el.textContent = msg; el.classList.add("show");
  clearTimeout(toast._t); toast._t = setTimeout(()=>el.classList.remove("show"), ms);
}
function downloadBlob(blob, name){
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 5000);
}
function el(tag, props={}, ...kids){
  const e = document.createElement(tag);
  for(const k in props){
    if(k==="style" && typeof props[k]==="object") Object.assign(e.style, props[k]);
    else if(k in e) e[k] = props[k];
    else e.setAttribute(k, props[k]);
  }
  for(const k of kids) e.append(k && k.nodeType ? k : document.createTextNode(k==null?"":k));
  return e;
}
function capBatch(fs){
  if(fs.length > BATCH_MAX){
    toast(`Max ${BATCH_MAX} files per batch — kept the first ${BATCH_MAX}`, 3500);
    return fs.slice(0, BATCH_MAX);
  }
  return fs;
}
function dropzone(label, onfiles, accept="*/*", multiple=true){
  const div = document.createElement("label");
  div.className = "drop";
  const hint = multiple ? `<div style="font-size:11px;color:var(--muted);margin-top:4px">Up to ${BATCH_MAX} files</div>` : "";
  div.innerHTML = `<div style="font-size:28px">⬇️</div><div>${label}</div>${hint}`;
  const inp = document.createElement("input");
  inp.type = "file"; inp.multiple = multiple; inp.accept = accept; inp.style.display = "none";
  inp.onchange = e => onfiles(multiple ? capBatch([...e.target.files]) : [...e.target.files]);
  div.appendChild(inp);
  div.ondragover = e => { e.preventDefault(); div.classList.add("drag"); };
  div.ondragleave = () => div.classList.remove("drag");
  div.ondrop = e => { e.preventDefault(); div.classList.remove("drag"); onfiles(multiple ? capBatch([...e.dataTransfer.files]) : [...e.dataTransfer.files]); };
  return div;
}
function loadScriptOnce(src){
  return new Promise((res, rej)=>{
    if(document.querySelector(`script[data-src="${src}"]`)) return res();
    const s = document.createElement("script");
    s.src = src; s.dataset.src = src;
    s.onload = res; s.onerror = () => rej(new Error("Failed to load "+src));
    document.head.appendChild(s);
  });
}
async function fileToImage(file){
  const url = URL.createObjectURL(file);
  const img = new Image();
  await new Promise((r, j)=>{ img.onload = r; img.onerror = j; img.src = url; });
  return { img, url };
}

/* ---------- Layout ---------- */
function renderNav(){
  const nav = document.getElementById("tabs");
  nav.innerHTML = "";
  let last = "";
  for(const tl of TOOLS){
    if(tl.group !== last){
      const h = document.createElement("div");
      h.className = "navgroup"; h.textContent = tl.group;
      nav.appendChild(h);
      last = tl.group;
    }
    const b = document.createElement("button");
    b.innerHTML = `<span>${tl.icon}</span><span>${toolName(tl)}</span>`;
    if(tl.id === CURRENT) b.classList.add("active");
    b.onclick = () => { CURRENT = tl.id; renderNav(); renderPanel(); };
    nav.appendChild(b);
  }
}
function langSelect(){
  const sel = document.getElementById("lang");
  sel.innerHTML = "";
  for(const c of Object.keys(I18N)){
    const o = document.createElement("option");
    o.value = c; o.textContent = I18N[c].name;
    if(c===LANG) o.selected = true;
    sel.appendChild(o);
  }
  sel.onchange = () => { LANG = sel.value; localStorage.setItem("ppdf_lang", LANG); applyLang(); };
}
function applyLang(){
  document.documentElement.lang = LANG;
  document.documentElement.dir = I18N[LANG].dir;
  document.getElementById("footer").textContent = t("footer");
  renderNav(); renderPanel();
}
function renderPanel(){
  const p = document.getElementById("panel"); p.innerHTML = "";
  const fn = TOOL_FNS[CURRENT];
  if(fn) fn(p); else p.textContent = "Tool not found";
}

/* ==========================================================
   MODULES
   ========================================================== */
const TOOL_FNS = {};

/* ---------- HEIC → JPG/PNG ---------- */
TOOL_FNS.heic = function(p){
  p.appendChild(el("h2", {}, "📱 HEIC → JPG / PNG"));
  p.appendChild(el("p", {className:"muted"}, `Convert Apple HEIC/HEIF photos (iPhone default) into standard JPG or PNG. Small batches up to ${BATCH_MAX} files. 100% local.`));

  let files = [];
  p.appendChild(dropzone("Drop HEIC/HEIF file(s) or click", fs => {
    files = fs.filter(f => /\.(heic|heif)$/i.test(f.name) || /heic|heif/.test(f.type));
    status.textContent = files.length + " file(s) loaded";
  }, ".heic,.heif,image/heic,image/heif"));

  const row = el("div", {className:"row", style:{marginTop:"10px"}});
  const fFmt = el("div", {className:"field"}, el("label", {}, "Output"),
    (()=>{ const s = el("select", {id:"heic_fmt"});
      s.append(new Option("JPEG (smaller)","image/jpeg"), new Option("PNG (lossless)","image/png"));
      return s; })());
  const fQ = el("div", {className:"field"}, el("label", {}, "JPEG quality"),
    el("input", {type:"number", id:"heic_q", value:0.92, min:0.1, max:1, step:0.02}));
  const btn = el("button", {className:"btn"}, "Convert & download");
  const btnZ = el("button", {className:"btn secondary"}, `Batch (≤${BATCH_MAX}) → ZIP`);
  row.append(fFmt, fQ, btn, btnZ);
  p.appendChild(row);
  const status = el("p", {className:"muted", style:{marginTop:"10px"}}, t("nofile"));
  p.appendChild(status);

  async function convertOne(f){
    await loadScriptOnce("https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js");
    const fmt = document.getElementById("heic_fmt").value;
    const q = +document.getElementById("heic_q").value;
    const out = await heic2any({ blob: f, toType: fmt, quality: q });
    return Array.isArray(out) ? out[0] : out;
  }
  btn.onclick = async () => {
    if(!files.length) return toast(t("nofile"));
    btn.disabled = true; toast(t("working"), 4000);
    try {
      const f = files[0];
      const blob = await convertOne(f);
      const ext = blob.type === "image/png" ? "png" : "jpg";
      downloadBlob(blob, f.name.replace(/\.(heic|heif)$/i, "") + "." + ext);
      status.textContent = `${f.name} → ${(blob.size/1024|0)} KB`;
      toast(t("done"));
    } catch(e){ toast(t("error")+": "+e.message); }
    finally { btn.disabled = false; }
  };
  btnZ.onclick = async () => {
    if(!files.length) return toast(t("nofile"));
    btnZ.disabled = true; toast(t("working"), 8000);
    try {
      const zip = new JSZip();
      let i = 0;
      for(const f of files){
        i++; status.textContent = `Converting ${i}/${files.length}…`;
        const blob = await convertOne(f);
        const ext = blob.type === "image/png" ? "png" : "jpg";
        zip.file(f.name.replace(/\.(heic|heif)$/i, "") + "." + ext, blob);
      }
      downloadBlob(await zip.generateAsync({type:"blob"}), "heic-converted.zip");
      status.textContent = `Converted ${files.length} file(s)`;
      toast(t("done"));
    } catch(e){ toast(t("error")+": "+e.message); }
    finally { btnZ.disabled = false; }
  };
};

/* ---------- Universal converter (PNG / JPG / WebP) ---------- */
TOOL_FNS.convert = function(p){
  p.appendChild(el("h2", {}, "🔁 Universal converter"));
  p.appendChild(el("p", {className:"muted"}, `Convert any PNG · JPG · WebP image to any of the three formats. Small batches up to ${BATCH_MAX} files. 100% local.`));

  let files = [];
  p.appendChild(dropzone("Drop image(s) here or click", fs => {
    files = fs.filter(f => f.type.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(f.name));
    status.textContent = files.length + " file(s) loaded";
  }, "image/png,image/jpeg,image/webp"));

  const row = el("div", {className:"row", style:{marginTop:"10px"}});
  const selFmt = el("select", {id:"cv_fmt"});
  [["image/png","PNG"],["image/jpeg","JPEG"],["image/webp","WebP"]].forEach(([v,n]) => selFmt.append(new Option(n, v)));
  row.append(
    el("div", {className:"field"}, el("label", {}, "Output format"), selFmt),
    el("div", {className:"field"}, el("label", {}, "JPEG/WebP quality"),
      el("input", {type:"number", id:"cv_q", value:0.92, min:0.1, max:1, step:0.02})),
    el("div", {className:"field"}, el("label", {}, "Background (JPEG)"),
      el("input", {type:"color", id:"cv_bg", value:"#ffffff"}))
  );
  const btn = el("button", {className:"btn"}, "Convert & download");
  const btnZ = el("button", {className:"btn secondary"}, `Batch (≤${BATCH_MAX}) → ZIP`);
  row.append(btn, btnZ);
  p.appendChild(row);
  const status = el("p", {className:"muted", style:{marginTop:"10px"}}, t("nofile"));
  p.appendChild(status);

  async function convOne(f){
    const fmt = selFmt.value;
    const q = +document.getElementById("cv_q").value;
    const bg = document.getElementById("cv_bg").value;
    const { img, url } = await fileToImage(f);
    const c = document.createElement("canvas");
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext("2d");
    if(fmt === "image/jpeg"){ ctx.fillStyle = bg; ctx.fillRect(0,0,c.width,c.height); }
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    const blob = await new Promise(r => c.toBlob(r, fmt, q));
    const ext = ({"image/png":"png","image/jpeg":"jpg","image/webp":"webp"})[fmt];
    return { blob, ext };
  }
  btn.onclick = async () => {
    if(!files.length) return toast(t("nofile"));
    btn.disabled = true; toast(t("working"));
    try {
      const f = files[0];
      const { blob, ext } = await convOne(f);
      downloadBlob(blob, f.name.replace(/\.[^.]+$/, "") + "." + ext);
      status.textContent = `${f.name} → ${ext.toUpperCase()} · ${(blob.size/1024|0)} KB`;
      toast(t("done"));
    } catch(e){ toast(t("error")+": "+e.message); }
    finally { btn.disabled = false; }
  };
  btnZ.onclick = async () => {
    if(!files.length) return toast(t("nofile"));
    btnZ.disabled = true; toast(t("working"), 6000);
    try {
      const zip = new JSZip();
      for(const f of files){
        const { blob, ext } = await convOne(f);
        zip.file(f.name.replace(/\.[^.]+$/, "") + "." + ext, blob);
      }
      downloadBlob(await zip.generateAsync({type:"blob"}), "converted.zip");
      toast(t("done"));
    } catch(e){ toast(t("error")+": "+e.message); }
    finally { btnZ.disabled = false; }
  };
};

/* ---------- Smart Shrink (compress & optimize) ---------- */
TOOL_FNS.smart = function(p){
  p.appendChild(el("h2", {}, "🗜️ Smart Shrink — compress & optimize"));
  p.appendChild(el("p", {className:"muted"},
    "Reduce image file size for email, forms and messaging. Pick a preset or target size — Smart Shrink adjusts quality (and optionally width) so the file gets 5–10× lighter while staying visually identical. PNG/JPG/WebP · 100% local."));

  let files = [];
  const drop = dropzone("Drop image(s) here or click", fs => {
    files = fs.filter(f => f.type.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(f.name));
    status.textContent = files.length + " file(s) loaded";
    if(files.length === 1) previewOne();
  }, "image/png,image/jpeg,image/webp");
  p.appendChild(drop);

  const row1 = el("div", {className:"row", style:{marginTop:"10px"}});
  const selPre = el("select", {id:"sm_pre"});
  [
    ["visually","Visually identical (q 0.85, keep size) — recommended"],
    ["email",   "Email friendly (≤ 500 KB, max 1920 px)"],
    ["msg",     "Messaging (≤ 200 KB, max 1600 px)"],
    ["web",     "Web / blog (max 1600 px, q 0.8)"],
    ["thumb",   "Thumbnail (max 800 px, q 0.75)"],
    ["custom",  "Custom (use fields below)"]
  ].forEach(([v,n]) => selPre.append(new Option(n, v)));
  const selFmt = el("select", {id:"sm_fmt"});
  [["auto","Auto (WebP)"],["image/webp","WebP (best ratio)"],["image/jpeg","JPEG"],["image/png","PNG (lossless)"]].forEach(([v,n])=>selFmt.append(new Option(n,v)));
  row1.append(
    el("div", {className:"field", style:{minWidth:"280px"}}, el("label", {}, "Preset"), selPre),
    el("div", {className:"field"}, el("label", {}, "Format"), selFmt)
  );
  p.appendChild(row1);

  const row2 = el("div", {className:"row", style:{marginTop:"10px"}});
  row2.append(
    el("div", {className:"field"}, el("label", {}, "Quality (0.1–1)"),
      el("input", {type:"number", id:"sm_q", value:0.85, min:0.1, max:1, step:0.02})),
    el("div", {className:"field"}, el("label", {}, "Max width (px, 0 = keep)"),
      el("input", {type:"number", id:"sm_mw", value:0, min:0, max:8000, step:100})),
    el("div", {className:"field"}, el("label", {}, "Target size (KB, 0 = off)"),
      el("input", {type:"number", id:"sm_tgt", value:0, min:0, max:20000, step:50}))
  );
  p.appendChild(row2);

  const actions = el("div", {className:"row", style:{marginTop:"10px"}});
  const btn = el("button", {className:"btn"}, "Shrink & download");
  const btnZ = el("button", {className:"btn secondary"}, `Batch (≤${BATCH_MAX}) → ZIP`);
  actions.append(btn, btnZ);
  p.appendChild(actions);

  const status = el("p", {className:"muted", style:{marginTop:"10px"}}, t("nofile"));
  p.appendChild(status);
  const cv = el("canvas", {className:"preview", style:{marginTop:"10px", maxHeight:"320px"}});
  p.appendChild(cv);

  function applyPreset(){
    const v = selPre.value;
    const set = (id, val) => { document.getElementById(id).value = val; };
    if(v === "visually"){ set("sm_q",0.85); set("sm_mw",0);    set("sm_tgt",0);   selFmt.value="auto"; }
    else if(v === "email"){ set("sm_q",0.82); set("sm_mw",1920); set("sm_tgt",500); selFmt.value="auto"; }
    else if(v === "msg"){   set("sm_q",0.78); set("sm_mw",1600); set("sm_tgt",200); selFmt.value="auto"; }
    else if(v === "web"){   set("sm_q",0.8);  set("sm_mw",1600); set("sm_tgt",0);   selFmt.value="auto"; }
    else if(v === "thumb"){ set("sm_q",0.75); set("sm_mw",800);  set("sm_tgt",0);   selFmt.value="auto"; }
  }
  selPre.onchange = applyPreset;
  applyPreset();

  async function encode(canvas, fmt, q){
    return new Promise(r => canvas.toBlob(r, fmt, q));
  }
  async function shrinkOne(f){
    const { img, url } = await fileToImage(f);
    let w = img.naturalWidth, h = img.naturalHeight;
    const mw = +document.getElementById("sm_mw").value;
    if(mw > 0 && w > mw){ const r = mw / w; w = mw; h = Math.round(h * r); }
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    if(selFmt.value === "image/jpeg"){ ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,w,h); }
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);

    let fmt = selFmt.value;
    if(fmt === "auto"){
      fmt = /png$/i.test(f.name) ? "image/webp" : "image/webp"; // WebP wins in almost every case
    }
    const targetKB = +document.getElementById("sm_tgt").value;
    let q = +document.getElementById("sm_q").value;
    let blob = await encode(c, fmt === "image/png" ? "image/png" : fmt, q);

    // Iteratively lower quality until we hit target size (only when target set and format supports quality)
    if(targetKB > 0 && fmt !== "image/png"){
      let tries = 0;
      while(blob.size / 1024 > targetKB && q > 0.35 && tries < 8){
        q = Math.max(0.35, q - 0.08);
        blob = await encode(c, fmt, q);
        tries++;
      }
      // still too big? downscale progressively
      let curW = w, curH = h, tries2 = 0;
      while(blob.size / 1024 > targetKB && curW > 320 && tries2 < 6){
        curW = Math.round(curW * 0.85); curH = Math.round(curH * 0.85);
        const c2 = document.createElement("canvas");
        c2.width = curW; c2.height = curH;
        const cx2 = c2.getContext("2d");
        cx2.imageSmoothingQuality = "high";
        if(fmt === "image/jpeg"){ cx2.fillStyle = "#ffffff"; cx2.fillRect(0,0,curW,curH); }
        cx2.drawImage(c, 0, 0, curW, curH);
        blob = await encode(c2, fmt, q);
        tries2++;
      }
    }
    const ext = fmt === "image/webp" ? "webp" : fmt === "image/jpeg" ? "jpg" : "png";
    return { blob, ext, q, w, h };
  }

  async function previewOne(){
    if(!files.length) return;
    try {
      const { img, url } = await fileToImage(files[0]);
      const s = Math.min(600 / img.naturalWidth, 300 / img.naturalHeight, 1);
      cv.width = Math.max(1, img.naturalWidth * s);
      cv.height = Math.max(1, img.naturalHeight * s);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
    } catch(_){}
  }

  btn.onclick = async () => {
    if(!files.length) return toast(t("nofile"));
    btn.disabled = true; toast(t("working"));
    try {
      const f = files[0];
      const before = f.size;
      const { blob, ext, q, w, h } = await shrinkOne(f);
      downloadBlob(blob, f.name.replace(/\.[^.]+$/, "") + "-shrunk." + ext);
      const pct = ((1 - blob.size/before)*100).toFixed(1);
      const ratio = (before / blob.size).toFixed(1);
      status.textContent = `${(before/1024|0)} KB → ${(blob.size/1024|0)} KB · ${pct}% saved · ×${ratio} lighter · ${w}×${h} · q=${q.toFixed(2)}`;
      toast(t("done"));
    } catch(e){ toast(t("error")+": "+e.message); }
    finally { btn.disabled = false; }
  };
  btnZ.onclick = async () => {
    if(!files.length) return toast(t("nofile"));
    btnZ.disabled = true; toast(t("working"), 8000);
    try {
      const zip = new JSZip();
      let sumBefore = 0, sumAfter = 0;
      for(const f of files){
        const { blob, ext } = await shrinkOne(f);
        sumBefore += f.size; sumAfter += blob.size;
        zip.file(f.name.replace(/\.[^.]+$/, "") + "-shrunk." + ext, blob);
      }
      downloadBlob(await zip.generateAsync({type:"blob"}), "shrunk.zip");
      const pct = ((1 - sumAfter/sumBefore)*100).toFixed(1);
      status.textContent = `${files.length} files: ${(sumBefore/1024|0)} KB → ${(sumAfter/1024|0)} KB · ${pct}% saved`;
      toast(t("done"));
    } catch(e){ toast(t("error")+": "+e.message); }
    finally { btnZ.disabled = false; }
  };
};

/* ---------- About ---------- */
TOOL_FNS.about = function(p){
  p.appendChild(el("h2", {}, "ℹ️ About PocketPDF"));
  p.appendChild(el("p", {}, "PocketPDF is a lightweight image toolkit that runs 100% in your browser. No server, no upload, no tracking, no cost."));
  const modules = [
    ["Convert",  "HEIC → JPG/PNG (iPhone photos) · Universal PNG/JPG/WebP converter"],
    ["Resize",   "Icon & Banner presets for YouTube, Instagram, TikTok, X, Facebook, LinkedIn, Pinterest, PWA…"],
    ["Optimize", "Smart Shrink — auto-tune quality & size to hit an email/messaging-friendly file weight, 5–10× lighter, invisible to the eye"]
  ];
  const ul = el("ul");
  modules.forEach(([g, txt]) => ul.appendChild(el("li", {}, el("b", {}, g + ": "), txt)));
  p.appendChild(ul);
  p.appendChild(el("p", {className:"muted"}, `v3.0 · batches capped at ${BATCH_MAX} files · powered by JSZip and heic2any.`));
};

/* ---------- Resize (Icon & Banner) is registered by image-resizer.js ---------- */

/* ---------- boot ---------- */
langSelect();
applyLang();
