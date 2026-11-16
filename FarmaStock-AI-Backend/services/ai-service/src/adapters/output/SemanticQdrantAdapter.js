const QDRANT = (
  process.env.QDRANT_URL || "http://qdrant:6333"
).replace(/\/$/, "");

const OLLAMA = (
  process.env.OLLAMA_URL || "http://farmastock-ollama:11434"
).replace(/\/$/, "");

const COLLECTION = "farmastock_risks_semantic";
const MODEL = "qwen3-embedding:0.6b";

async function request(url, method = "GET", body) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(180000)
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

async function indexSemanticRisks(risks) {
  if (!Array.isArray(risks) || risks.length === 0) return;

  const url = `${QDRANT}/collections/${COLLECTION}`;
  const check = await fetch(url);

  if (check.status === 404) {
    await request(url, "PUT", {
      vectors: { size: 1024, distance: "Cosine" }
    });
  } else if (check.ok) {
    const info = await check.json();
    const size = info.result?.config?.params?.vectors?.size;

    if (size !== 1024) {
      throw new Error(`Dimensión incompatible: ${size}`);
    }
  } else {
    throw new Error(`Qdrant HTTP ${check.status}`);
  }

  for (let i = 0; i < risks.length; i += 4) {
    const batch = risks.slice(i, i + 4);

    const texts = batch.map(r =>
      `Medicamento: ${r.product_name}. ` +
      `Lote: ${r.lot_number}. ` +
      `Caducidad: ${r.expiry_date}. ` +
      `Riesgo: ${r.risk_level}. ` +
      `Días restantes: ${r.days_remaining}. ` +
      `Existencias: ${r.quantity}. ` +
      `Unidades estimadas en riesgo: ${r.estimated_leftover}.`
    );

    const embedded = await request(
      `${OLLAMA}/api/embed`,
      "POST",
      { model: MODEL, input: texts }
    );

    if (
      !Array.isArray(embedded.embeddings) ||
      embedded.embeddings.length !== batch.length ||
      embedded.embeddings.some(v => v.length !== 1024)
    ) {
      throw new Error("Embeddings incompletos");
    }

    await request(`${url}/points?wait=true`, "PUT", {
      points: batch.map((r, j) => ({
        id: Number(r.batch_id),
        vector: embedded.embeddings[j],
        payload: {
          product_name: r.product_name,
          lot_number: r.lot_number,
          risk_level: r.risk_level,
          days_remaining: r.days_remaining,
          text: texts[j]
        }
      }))
    });
  }

  console.log(
    "[RAG] Índice semántico actualizado:",
    risks.length,
    "lotes"
  );
}

module.exports = { indexSemanticRisks };
