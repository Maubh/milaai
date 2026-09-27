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

/**
 * Lê o corpo como texto respeitando `maxBytes`.
 * Devolve `null` quando o corpo passa do teto (corte antes de decodificar).
 */
async function readTextBounded(req: Request, maxBytes: number): Promise<string | null> {
  // Atalho: se o cliente declarou o tamanho, nem começa a ler.
  const declared = Number(req.headers.get("content-length") ?? "");
  if (Number.isFinite(declared) && declared > maxBytes) return null;

  if (!req.body) return "";

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
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null; // stream quebrado: trata como grande demais, não vaza detalhe
  } finally {
    reader.releaseLock?.();
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return new TextDecoder("utf-8", { fatal: false }).decode(merged);
  } catch {
    return "";
  }
}

export async function readJsonBounded(
  req: Request,
  maxBytes: number,
): Promise<BoundedJsonResult> {
  const text = await readTextBounded(req, maxBytes);
  if (text === null) return { ok: false, reason: "too_large" };
  if (!text.trim()) return { ok: false, reason: "invalid_json" };
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, reason: "invalid_json" };
  }
  // Só objeto interessa; array/escalar é body inválido para estas rotas.
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, reason: "invalid_json" };
  }
  return { ok: true, data: parsed as Record<string, unknown> };
}
