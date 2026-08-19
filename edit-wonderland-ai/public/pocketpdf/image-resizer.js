/* PocketPDF · Resize (Icon & Banner) — 100% local. Registers into TOOL_FNS. */
(function () {
  if (typeof TOOL_FNS === "undefined") return;

  const PRESETS = [
    { g:"YouTube",     n:"Thumbnail (16:9)",           w:1280, h:720 },
    { g:"YouTube",     n:"Channel banner (16:9)",      w:2560, h:1440 },
    { g:"YouTube",     n:"Shorts / Vertical (9:16)",   w:1080, h:1920 },
    { g:"YouTube",     n:"Profile picture",            w:800,  h:800 },
    { g:"Instagram",   n:"Square post (1:1)",          w:1080, h:1080 },
    { g:"Instagram",   n:"Portrait post (4:5)",        w:1080, h:1350 },
    { g:"Instagram",   n:"Story / Reel (9:16)",        w:1080, h:1920 },
    { g:"TikTok",      n:"Video / cover (9:16)",       w:1080, h:1920 },
    { g:"X (Twitter)", n:"Post image (16:9)",          w:1600, h:900 },
    { g:"X (Twitter)", n:"Header (3:1)",               w:1500, h:500 },
    { g:"Facebook",    n:"Post (1.91:1)",              w:1200, h:630 },
    { g:"Facebook",    n:"Cover",                      w:851,  h:315 },
    { g:"LinkedIn",    n:"Post (1.91:1)",              w:1200, h:627 },
    { g:"LinkedIn",    n:"Company banner",             w:1128, h:191 },
    { g:"Pinterest",   n:"Standard pin (2:3)",         w:1000, h:1500 },
    { g:"Web / PWA",   n:"Favicon 32×32",              w:32,   h:32 },
    { g:"Web / PWA",   n:"Favicon 64×64",              w:64,   h:64 },
    { g:"Web / PWA",   n:"Apple touch 180×180",        w:180,  h:180 },
    { g:"Web / PWA",   n:"PWA icon 192×192",           w:192,  h:192 },
    { g:"Web / PWA",   n:"PWA icon 512×512",           w:512,  h:512 },
    { g:"Web / PWA",   n:"Open Graph (1.91:1)",        w:1200, h:630 }
  ];

  TOOL_FNS.resize = function (p) {
    p.appendChild(el("h2", {}, "🖼️ Icon & Banner"));
    p.appendChild(el("p", { className:"muted" },
      "Convert PNG/JPEG to platform-ready sizes. Presets match the current official specs (2025-2026). 100% local."));

    // Specs panel
    const specs = document.createElement("details");
    specs.style.cssText = "background:var(--bg2);border:1px solid var(--line);border-radius:10px;padding:10px 14px;margin:6px 0 14px";
    const sum = document.createElement("summary");
    sum.textContent = "📐 Recommended official specs";
    sum.style.cssText = "cursor:pointer;font-weight:600";
    specs.appendChild(sum);
    const grid = document.createElement("div");
    grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px;margin-top:10px;font-size:12px;color:var(--muted)";
    const groups = {};
    PRESETS.forEach(pr => { (groups[pr.g] = groups[pr.g] || []).push(pr); });
    Object.keys(groups).forEach(g => {
      const col = document.createElement("div");
      col.innerHTML = `<div style="color:var(--ink);font-weight:600;margin-bottom:4px">${g}</div>` +
        groups[g].map(pr => `• ${pr.n} — <b>${pr.w}×${pr.h}</b>`).join("<br>");
      grid.appendChild(col);
    });
    specs.appendChild(grid);
    p.appendChild(specs);

    let files = [];
    const BATCH_MAX = (typeof window !== "undefined" && window.BATCH_MAX) || 15;
    p.appendChild(dropzone("Drop PNG/JPEG image(s) here or click", fs => {
      if(fs.length > BATCH_MAX){ toast(`Max ${BATCH_MAX} files — kept the first ${BATCH_MAX}`, 3500); fs = fs.slice(0, BATCH_MAX); }
      files = fs;
      prev.innerHTML = "";
      files.slice(0, 6).forEach(f => {
        const i = document.createElement("img");
        i.src = URL.createObjectURL(f);
        i.style.cssText = "max-height:70px;border-radius:6px;border:1px solid var(--line)";
        prev.appendChild(i);
      });
      status.textContent = files.length + " file(s) loaded";
    }, "image/*"));
    const prev = document.createElement("div");
    prev.style.cssText = "display:flex;gap:6px;flex-wrap:wrap;margin-top:8px";
    p.appendChild(prev);

    // Preset select
    const row1 = el("div", { className:"row", style:{ marginTop:"10px" } });
    const selPr = el("select", { id:"rz_pr", style:{ minWidth:"260px" } });
    selPr.append(new Option("— Custom size —", "custom"));
    Object.keys(groups).forEach(g => {
      const og = document.createElement("optgroup"); og.label = g;
      groups[g].forEach(pr => og.append(new Option(`${pr.n}  (${pr.w}×${pr.h})`, pr.w+"x"+pr.h)));
      selPr.appendChild(og);
    });
    selPr.value = "1280x720";
    row1.append(
      el("div", { className:"field", style:{ minWidth:"280px" } }, el("label", {}, "Preset"), selPr),
      el("div", { className:"field" }, el("label", {}, "Width"),  el("input", { type:"number", id:"rz_w", value:1280, min:8, max:8000 })),
      el("div", { className:"field" }, el("label", {}, "Height"), el("input", { type:"number", id:"rz_h", value:720,  min:8, max:8000 }))
    );
    p.appendChild(row1);

    selPr.onchange = () => {
      if (selPr.value === "custom") return;
      const [w, h] = selPr.value.split("x").map(Number);
      document.getElementById("rz_w").value = w;
      document.getElementById("rz_h").value = h;
    };
    ["rz_w","rz_h"].forEach(id => document.getElementById(id).addEventListener("input", () => {
      const w = +document.getElementById("rz_w").value, h = +document.getElementById("rz_h").value;
      const m = PRESETS.find(pr => pr.w === w && pr.h === h);
      selPr.value = m ? (w+"x"+h) : "custom";
    }));

    const row2 = el("div", { className:"row", style:{ marginTop:"10px" } });
    const selMode = el("select", { id:"rz_mode" });
    [["cover","Cover (crop)"],["contain","Contain (letterbox)"],["stretch","Stretch"]].forEach(([v,n]) => selMode.append(new Option(n,v)));
    const selFmt = el("select", { id:"rz_fmt" });
    [["image/png","PNG"],["image/jpeg","JPEG"],["image/webp","WebP"],["image/x-icon","ICO (favicon)"]].forEach(([v,n]) => selFmt.append(new Option(n,v)));
    row2.append(
      el("div", { className:"field" }, el("label", {}, "Fit mode"), selMode),
      el("div", { className:"field" }, el("label", {}, "Background"), el("input", { type:"color", id:"rz_bg", value:"#ffffff" })),
      el("div", { className:"field" }, el("label", {}, "Output"), selFmt),
      el("div", { className:"field" }, el("label", {}, "JPEG quality"),
        el("input", { type:"number", id:"rz_q", value:0.92, min:0.1, max:1, step:0.02 }))
    );
    p.appendChild(row2);

    const actions = el("div", { className:"row", style:{ marginTop:"12px" } });
    const btn = el("button", { className:"btn" }, "Convert & download");
    const btnZ = el("button", { className:"btn secondary" }, "Batch → ZIP");
    actions.append(btn, btnZ);
    p.appendChild(actions);

    const status = el("p", { className:"muted", style:{ marginTop:"10px" } }, "No file loaded");
    p.appendChild(status);
    const cvPrev = el("canvas", { className:"preview", style:{ marginTop:"10px", maxHeight:"300px" } });
    p.appendChild(cvPrev);

    async function renderOne(file) {
      const w = Math.max(1, +document.getElementById("rz_w").value | 0);
      const h = Math.max(1, +document.getElementById("rz_h").value | 0);
      const mode = selMode.value, bg = document.getElementById("rz_bg").value;
      const fmt = selFmt.value, q = +document.getElementById("rz_q").value;
      const url = URL.createObjectURL(file);
      const img = await new Promise((r, j) => { const i = new Image(); i.onload = () => r(i); i.onerror = j; i.src = url; });
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d"); ctx.imageSmoothingQuality = "high";
      if (fmt !== "image/png" || mode === "contain") { ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h); }
      const iw = img.naturalWidth, ih = img.naturalHeight;
      let sx=0,sy=0,sw=iw,sh=ih, dx=0,dy=0,dw=w,dh=h;
      if (mode === "cover") { const r = Math.max(w/iw, h/ih); sw = w/r; sh = h/r; sx = (iw-sw)/2; sy = (ih-sh)/2; }
      else if (mode === "contain") { const r = Math.min(w/iw, h/ih); dw = iw*r; dh = ih*r; dx = (w-dw)/2; dy = (h-dh)/2; }
      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
      URL.revokeObjectURL(url);
      const outFmt = fmt === "image/x-icon" ? "image/png" : fmt;
      const blob = await new Promise(r => c.toBlob(r, outFmt, q));
      return { canvas: c, blob, ext: ({ "image/png":"png", "image/jpeg":"jpg", "image/webp":"webp", "image/x-icon":"ico" })[fmt] };
    }

    btn.onclick = async () => {
      if (!files.length) return toast("No file loaded");
      btn.disabled = true; toast("Working…");
      try {
        const f = files[0];
        const { canvas, blob, ext } = await renderOne(f);
        const pctx = cvPrev.getContext("2d");
        const s = Math.min(600/canvas.width, 300/canvas.height, 1);
        cvPrev.width = Math.max(1, canvas.width*s);
        cvPrev.height = Math.max(1, canvas.height*s);
        pctx.drawImage(canvas, 0, 0, cvPrev.width, cvPrev.height);
        const base = f.name.replace(/\.[^.]+$/, "");
        downloadBlob(blob, `${base}-${canvas.width}x${canvas.height}.${ext}`);
        status.textContent = `→ ${canvas.width}×${canvas.height} · ${(blob.size/1024|0)} KB`;
        toast("Done");
      } catch(e) { toast("Error: "+e.message); }
      finally { btn.disabled = false; }
    };
    btnZ.onclick = async () => {
      if (!files.length) return toast("No file loaded");
      btnZ.disabled = true; toast("Working…", 6000);
      try {
        const zip = new JSZip();
        for (const f of files) {
          const { canvas, blob, ext } = await renderOne(f);
          const base = f.name.replace(/\.[^.]+$/, "");
          zip.file(`${base}-${canvas.width}x${canvas.height}.${ext}`, blob);
        }
        downloadBlob(await zip.generateAsync({ type: "blob" }), "resized.zip");
        status.textContent = "Batch: " + files.length + " file(s)";
        toast("Done");
      } catch(e) { toast("Error: "+e.message); }
      finally { btnZ.disabled = false; }
    };
  };
})();
