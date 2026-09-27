/**
 * Leitura de body JSON com teto de tamanho, sobre a API padrão `Request`.
 *
 * O `req.json()` do Next parseia o payload inteiro antes de qualquer validação:
 * um body de dezenas de MB é carregado na memória só para depois ser recusado.
 * Aqui o `Content-Length` é conferido antes e o stream é lido em pedaços, com
 * corte assim que o teto estoura (a leitura é cancelada, não consumida).
 *
 * Módulo puro (nenhum import de `next/*`) para o teste construir `Request` de
 * verdade e exercitar tamanho, JSON inválido e corpo vazio.
 */

export type BoundedJsonResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; reason: "too_large" | "invalid_json" };

/** Resultado da leitura crua, antes do parse. */
type RawRead = { ok: true; text: string } | { ok: false; reason: "too_large" | "invalid_json" };

/**
 * Lê o corpo como texto respeitando `maxBytes`.
 *
 * `too_large` é só para corpo de fato grande; erro de stream é `invalid_json`
 * (body que não dá para ler não é body grande — e o detalhe exposto ao cliente
 * precisa dizer a verdade).
 */
async function readTextBounded(req: Request, maxBytes: number): Promise<RawRead> {
  // Atalho: se o cliente declarou o tamanho, nem começa a ler.
  const declared = Number(req.headers.get("content-length") ?? "");
  if (Number.isFinite(declared) && declared > maxBytes) {
    return { ok: false, reason: "too_large" };
  }

  if (!req.body) return { ok: true, text: "" };

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return { ok: false, reason: "too_large" };
      }
      chunks.push(value);
    }
  } catch {
    // Stream quebrado no meio da leitura: corpo ilegível, não grande demais.
    return { ok: false, reason: "invalid_json" };
  } finally {
    reader.releaseLock?.();
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  // Decode no buffer inteiro: UTF-8 partido entre chunks é remontado antes.
  return { ok: true, text: new TextDecoder("utf-8").decode(merged) };
}

export async function readJsonBounded(
  req: Request,
  maxBytes: number,
): Promise<BoundedJsonResult> {
  const raw = await readTextBounded(req, maxBytes);
  if (!raw.ok) return raw;
  if (!raw.text.trim()) return { ok: false, reason: "invalid_json" };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.text);
  } catch {
    return { ok: false, reason: "invalid_json" };
  }
  // Só objeto interessa; array/escalar é body inválido para estas rotas.
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, reason: "invalid_json" };
  }
  return { ok: true, data: parsed as Record<string, unknown> };
}
