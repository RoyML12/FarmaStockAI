
const OLLAMA = (
  process.env.OLLAMA_URL || "http://farmastock-ollama:11434"
).replace(/\/$/, "");

const QDRANT = (
  process.env.QDRANT_URL || "http://qdrant:6333"
).replace(/\/$/, "");

const CHAT_MODEL = "qwen3:4b-instruct";
const EMBED_MODEL = "qwen3-embedding:0.6b";
const COLLECTION = "farmastock_risks_semantic";

async function postJSON(url, body, timeoutMs = 30000) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
  }

  return data;
}

function formatRisk(r) {
  return {
    producto: r.product_name,
    lote: r.lot_number,
    caducidad: r.expiry_date,
    dias_restantes: r.days_remaining,
    existencias: r.quantity,
    demanda_diaria: r.avg_daily_demand,
    unidades_en_riesgo: r.estimated_leftover,
    nivel_riesgo: r.risk_level
  };
}

async function searchSemantic(question, risks) {
  // 1. Convertir la pregunta en un embedding.
  const embedded = await postJSON(
    `${OLLAMA}/api/embed`,
    {
      model: EMBED_MODEL,
      input: question
    },
    45000
  );

  const vector = embedded.embeddings?.[0];

  if (!Array.isArray(vector) || vector.length !== 1024) {
    throw new Error("Embedding inválido");
  }

  // 2. Recuperar los lotes más similares en Qdrant.
  const result = await postJSON(
    `${QDRANT}/collections/${COLLECTION}/points/query`,
    {
      query: vector,
      limit: 5,
      with_payload: true
    },
    15000
  );

  // 3. Utilizar MySQL como fuente de datos actualizados.
  const byBatch = new Map(
    risks.map(r => [String(r.batch_id), r])
  );

  const matches = (result.result?.points || [])
    .filter(point => byBatch.has(String(point.id)))
    .map(point => ({
      ...byBatch.get(String(point.id)),
      similarity_score: point.score
    }));

  return matches;
}

async function answer(question, risks) {
  const rows = Array.isArray(risks) ? risks : [];

  if (rows.length === 0) {
    return {
      mode: "offline",
      answer: "No hay análisis de caducidad disponibles. Ejecuta un análisis primero."
    };
  }

  const priority = { high: 0, medium: 1, low: 2 };

  const sorted = [...rows].sort((a, b) =>
    (priority[a.risk_level] ?? 3) -
    (priority[b.risk_level] ?? 3)
  );

  const highRisks = sorted.filter(r => r.risk_level === "high");
  const mediumRisks = sorted.filter(r => r.risk_level === "medium");

  const fallback = {
    mode: "offline",
    answer: highRisks.length
      ? `Hay ${highRisks.length} lotes de alto riesgo: ` +
        highRisks.map(r =>
          `${r.product_name} (${r.lot_number}), ` +
          `${r.quantity} unidades y ${r.days_remaining} días restantes`
        ).join("; ")
      : "No hay lotes de riesgo alto en el último análisis."
  };

  let semanticMatches = [];
  let retrieval = "mysql";

  try {
    semanticMatches = await searchSemantic(question, rows);

    if (semanticMatches.length > 0) {
      retrieval = "qdrant";
      console.log(
        "[RAG] Qdrant recuperó",
        semanticMatches.length,
        "lotes"
      );
    }
  } catch (error) {
    console.warn(
      "[RAG] Recuperación no disponible:",
      error.message
    );
  }

  // Priorizar siempre los riesgos importantes.
  // Qdrant añade relevancia semántica; no sustituye
  // la clasificación calculada por FarmaStock AI.
  const selected = new Map();

  for (const r of [
    ...highRisks,
    ...semanticMatches,
    ...mediumRisks
  ]) {
    selected.set(String(r.batch_id), r);
  }

  const context = {
    lotes_analizados: rows.length,
    lotes_recuperados_por_qdrant:
      semanticMatches.map(formatRisk),
    lotes_prioritarios:
      highRisks.map(formatRisk),
    lotes_relevantes:
      [...selected.values()].slice(0, 15).map(formatRisk)
  };

  try {
    const data = await postJSON(
      `${OLLAMA}/api/chat`,
      {
        model: CHAT_MODEL,
        stream: false,
        messages: [
          {
            role: "system",
            content:
              "Eres el asistente de inventarios de FarmaStock AI. " +
              "Responde en español, con texto simple, sin Markdown. " +
              "Usa exclusivamente el contexto proporcionado. " +
              "Los datos son del último análisis disponible. " +
              "No inventes fechas, existencias ni medicamentos. " +
              "Qdrant recupera información por similitud, " +
              "pero la puntuación de similitud no indica riesgo. " +
              "Prioriza los lotes de riesgo alto y aplica FEFO. " +
              "Los lotes de riesgo medio requieren seguimiento. " +
              "No proporciones consejos médicos. " +
              "Responde de forma breve y precisa."
          },
          {
            role: "user",
            content: JSON.stringify({
              pregunta: question,
              contexto_inventario: context
            })
          }
        ],
        options: {
          temperature: 0.1,
          num_predict: 250
        }
      },
      135000
    );

    const generated = data.message?.content?.trim();

    if (!generated) {
      throw new Error("Respuesta vacía del LLM");
    }

    return {
      mode: "llm",
      retrieval,
      matches: semanticMatches.length,
      answer: generated
    };

  } catch (error) {
    console.warn("[LLM] Error:", error.message);
    return fallback;
  }
}

module.exports = { answer };
