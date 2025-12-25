import express from "express";

const app = express();
app.use(express.json());

// Optionaler API-Key Schutz (empfohlen):
// In Render.com später als Env Var setzen: RENDER_API_KEY=dein_geheimer_key
const API_KEY = process.env.RENDER_API_KEY || "";

// Helper: Bearer Token check
function checkAuth(req) {
  if (!API_KEY) return true; // wenn kein Key gesetzt ist, lassen wir alles durch (für Tests)
  const auth = req.headers["authorization"] || "";
  return auth === `Bearer ${API_KEY}`;
}

// Healthcheck (zum Testen)
app.get("/healthz", (req, res) => {
  res.json({ ok: true });
});

/**
 * RenderStart Stub:
 * Erwartet: contentJsonFileId (Pflicht), renderJobId (optional)
 * Antwortet: renderJobId (immer), status
 */
app.post("/render/start", (req, res) => {
  if (!checkAuth(req)) return res.status(401).json({ error: "Unauthorized" });

  const { contentJsonFileId, renderJobId } = req.body || {};
  if (!contentJsonFileId) {
    return res.status(400).json({ error: "contentJsonFileId is required" });
  }

  // Wir erzeugen eine Server-JobId (oder nutzen die vom Client)
  const jobId = renderJobId || `job_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  // Stub: Wir tun so, als ob der Job "accepted" wurde
  return res.status(200).json({
    ok: true,
    renderJobId: jobId,
    status: "RENDERING"
  });
});

/**
 * Status Endpoint Stub:
 * Keine DB nötig: Wir leiten Status aus Timestamp ab.
 * Nach 60s => RENDERED
 */
app.get("/render/status/:renderJobId", (req, res) => {
  if (!checkAuth(req)) return res.status(401).json({ error: "Unauthorized" });

  const { renderJobId } = req.params;

  // Versuch: Timestamp aus "job_<ts>_..." extrahieren
  const match = String(renderJobId).match(/job_(\d+)_/);
  const ts = match ? Number(match[1]) : null;

  let status = "RENDERING";
  if (ts && Date.now() - ts > 60_000) status = "RENDERED";

  res.json({
    ok: true,
    renderJobId,
    status,
    // Stub IDs (später ersetzt du das mit echten File-IDs)
    videoFileId: status === "RENDERED" ? `video_${renderJobId}` : "",
    thumbnailFileId: status === "RENDERED" ? `thumb_${renderJobId}` : "",
    subtitlesFileId: status === "RENDERED" ? `subs_${renderJobId}` : ""
  });
});

// Render verlangt Port über ENV PORT (Default 10000). :contentReference[oaicite:2]{index=2}
const port = process.env.PORT || 10000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Render API listening on ${port}`);
});
