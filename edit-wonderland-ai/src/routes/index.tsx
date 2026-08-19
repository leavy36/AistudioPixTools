import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PocketPDF — Local PDF, OCR, Translate & Photo Toolkit" },
      { name: "description", content: "Free offline PDF editor, merger, splitter, compressor, OCR, translator and photo enhancer. 100% in your browser — no upload, no signup." },
      { property: "og:title", content: "PocketPDF — Local PDF Toolkit" },
      { property: "og:description", content: "Edit, merge, split, compress, OCR and translate PDFs locally in your browser." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div style={{ minHeight: "100vh", background: "#ECE4D3", color: "#1A1A1A", fontFamily: "ui-sans-serif,system-ui,sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ fontFamily: "Iowan Old Style,Georgia,serif", fontSize: 14, letterSpacing: 2, color: "#6F6552" }}>
          2026 EDITION · LOCAL TOOLS
        </div>
        <h1 style={{ fontFamily: "Iowan Old Style,Georgia,serif", fontSize: 64, lineHeight: 1.05, margin: "16px 0 24px", fontWeight: 400 }}>
          Edit, OCR &amp; translate PDFs, <span style={{ fontStyle: "italic", color: "#C97B4A" }}>actually</span>, without uploading anything.
        </h1>
        <p style={{ fontSize: 18, color: "#3a3328", maxWidth: 640 }}>
          PocketPDF runs 100% in your browser. Merge, split, compress, rotate, watermark, convert images ↔ PDF, enhance photos, OCR images and translate text — all offline, no signup.
        </p>
        <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/pocketpdf/index.html" style={{ background: "linear-gradient(135deg,#E89B6C,#C97B4A)", color: "#fff", padding: "14px 22px", borderRadius: 12, textDecoration: "none", fontWeight: 600, boxShadow: "0 8px 20px rgba(201,123,74,.3)" }}>
            Open the app →
          </a>
          <a href="/pocketpdf/index.html" style={{ border: "1px solid #D9CFB6", padding: "14px 22px", borderRadius: 12, textDecoration: "none", color: "#1A1A1A", background: "#F7F1E3" }}>
            Install as PWA
          </a>
        </div>
        <p style={{ marginTop: 40, color: "#6F6552", fontSize: 13 }}>
          Background palette: <strong>Eggshell / Parchment (#ECE4D3)</strong> · accent <strong>Peach (#E89B6C)</strong>
        </p>
      </div>
    </div>
  );
}
