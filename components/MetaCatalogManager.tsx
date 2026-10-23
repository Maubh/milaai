"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { integrationErrorText } from "@/lib/integration-errors";
import "./meta-catalog.css";

/**
 * Resumo da última sincronização, já projetado pelo BFF
 * (`sanitizeSyncSummary` em `@/lib/provider-status`).
 * Espelha `MetaCatalogBatchSummary` do backend (`agent/lib/meta_catalog.ts`).
 */
export interface LastSyncSummary {
  total?: number;
  totalAvaliados?: number;
  totalAptos?: number;
  totalExcluidos?: number;
  enviados?: number;
  falhas?: number;
  erros?: Array<{ item: string; erro: string }>;
  avisos?: Array<{ item: string; aviso: string }>;
  conjuntos?: Array<{ id: string; nome: string; totalProdutos: number }>;
}

export interface MetaProviderData {
  id: string;
  name: string;
  connected: boolean;
  catalog_id?: string | null;
  catalog_name?: string | null;
  business_id?: string | null;
  product_source?: string | null;
  sync_only_published?: boolean;
  last_sync_at?: number | null;
  last_sync_status?: string | null;
  last_sync_summary?: LastSyncSummary | null;
  suggested_source?: string | null;
}

interface MetaCatalogManagerProps {
  meta: MetaProviderData;
  connectedProviders: Array<{ id: string; name: string; connected: boolean }>;
  storeName?: string | null;
}

const FONTES = [
  { id: "site_nuvemshop", nome: "Nuvemshop", providerId: "nuvemshop" },
  { id: "erp_olist", nome: "Olist / Tiny ERP", providerId: "olist" },
  { id: "erp_jueri", nome: "Jueri ERP", providerId: "jueri" },
  { id: "mila", nome: "Mila (WhatsApp)", providerId: null },
];

function nomeDaFonte(id?: string | null): string | null {
  if (!id) return null;
  return FONTES.find((f) => f.id === id)?.nome ?? id;
}

function formatarDataHora(ts?: number | null): string {
  if (!ts) return "Ainda não sincronizado";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    }).format(new Date(ts));
  } catch {
    return "Data recente";
  }
}

export default function MetaCatalogManager({
  meta,
  connectedProviders,
  storeName,
}: MetaCatalogManagerProps) {
  const router = useRouter();

  const initialSource =
    meta.product_source || meta.suggested_source || "site_nuvemshop";
  const [fonte, setFonte] = useState<string>(initialSource);
  const [apenasPublicados, setApenasPublicados] = useState<boolean>(
    meta.sync_only_published !== false
  );

  const [salvando, setSalvando] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [bloqueioDuplicacao, setBloqueioDuplicacao] = useState<{
    mensagem: string;
  } | null>(null);

  // Status de conexão da fonte selecionada
  const fonteAtualObj = FONTES.find((f) => f.id === fonte);
  const fonteConectada = fonteAtualObj?.providerId
    ? connectedProviders.find((p) => p.id === fonteAtualObj.providerId)?.connected
    : true;
  const fonteSalva = !!meta.product_source;
  const syncBloqueado = fonteAtualObj?.providerId ? !fonteConectada : false;
  // Configuração abre sozinha quando há algo a resolver: fonte não salva ou desconectada.
  const [configAberta, setConfigAberta] = useState<boolean>(!fonteSalva || syncBloqueado);
  const configId = useId();
  const motivoId = useId();

  const catalogId = meta.catalog_id || "Não identificado";
  const defaultCatalogName =
    storeName && !storeName.toLowerCase().includes("sua loja")
      ? `Catálogo ${storeName}`
      : "Catálogo da Loja";
  const catalogName = meta.catalog_name || defaultCatalogName;

  async function salvarFonte() {
    setSalvando(true);
    setErro(null);
    setMensagemSucesso(null);
    try {
      const res = await fetch("/api/meta/catalog/source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_source: fonte,
          sync_only_published: apenasPublicados,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        detail?: string;
        error?: string;
      };
      if (res.ok && data.ok) {
        setMensagemSucesso("Fonte oficial salva com sucesso.");
        router.refresh();
      } else {
        setErro(data.error || integrationErrorText(data.detail));
      }
    } catch {
      setErro("Não foi possível salvar a fonte agora. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  async function sincronizarAgora(confirmDuplication = false) {
    setSincronizando(true);
    setErro(null);
    setMensagemSucesso(null);
    setBloqueioDuplicacao(null);

    try {
      // 1. Garante que a fonte e a opção de apenas publicados estejam salvas.
      // Se o save falhar, aborta: rodar o sync com fonte divergente/stale
      // enviaria os produtos errados para o catálogo.
      try {
        const resSave = await fetch("/api/meta/catalog/source", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_source: fonte,
            sync_only_published: apenasPublicados,
          }),
        });
        const dataSave = (await resSave.json().catch(() => ({}))) as {
          ok?: boolean;
          detail?: string;
        };
        if (!resSave.ok || !dataSave.ok) {
          setErro(
            `Não foi possível salvar a fonte antes de sincronizar (${integrationErrorText(dataSave.detail)}). Ajuste a fonte e tente de novo.`,
          );
          return;
        }
      } catch {
        setErro("Não foi possível salvar a fonte antes de sincronizar. Tente novamente.");
        return;
      }

      // 2. Dispara a sincronização
      const res = await fetch("/api/meta/catalog/sync-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirm_duplication: confirmDuplication,
          source_override: fonte,
          sync_only_published: apenasPublicados,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        status?: string;
        mensagem?: string;
        enviados?: number;
        totalAvaliados?: number;
        summary?: {
          enviados?: number;
          conjuntos?: Array<{ id: string; nome: string; totalProdutos: number }>;
        };
        detail?: string;
      };

      if (res.status === 409 || data.status === "bloqueado_duplicacao") {
        setBloqueioDuplicacao({
          mensagem:
            data.mensagem ||
            "Este catálogo já possui produtos ou feeds de outra fonte. Se a Mila enviar agora, os produtos podem ser duplicados na Meta.",
        });
        return;
      }

      if (res.ok && data.ok) {
        const enviados = data.enviados ?? data.summary?.enviados ?? 0;
        const colecoes = data.summary?.conjuntos?.length ?? 0;
        setMensagemSucesso(
          `Sincronização concluída com sucesso! ${enviados} produtos enviados para a Meta${
            colecoes > 0 ? ` e ${colecoes} coleções criadas no Instagram.` : "."
          }`
        );
        router.refresh();
      } else {
        setErro(data.mensagem || integrationErrorText(data.detail));
      }
    } catch {
      setErro("Falha na comunicação durante a sincronização. Verifique sua conexão e tente novamente.");
    } finally {
      setSincronizando(false);
    }
  }

  const summary = meta.last_sync_summary;
  const statusLabel =
    meta.last_sync_status === "sucesso"
      ? "sincronizado"
      : meta.last_sync_status === "parcial"
      ? "parcial, com ressalvas"
      : meta.last_sync_status === "erro"
      ? "falhou"
      : "concluído";
  // Sem sincronização registrada, a linha diz só isso: nada de "Pendente" ao lado.
  const linhaSync = meta.last_sync_at
    ? `Última sincronização ${formatarDataHora(meta.last_sync_at)} · ${statusLabel}`
    : "Ainda não sincronizado";
  // O resumo mostra o que será enviado: a seleção atual, marcada quando difere do que está salvo.
  const filtroSalvo = meta.sync_only_published !== false;
  const fonteAlterada = fonteSalva && fonte !== meta.product_source;
  const filtroAlterado = fonteSalva && apenasPublicados !== filtroSalvo;
  const pendente = fonteAlterada || filtroAlterado;
  const linhaFonte = fonteSalva
    ? `Fonte: ${nomeDaFonte(fonte)}${pendente ? ` · ${fonteAlterada && filtroAlterado ? "fonte e filtro alterados, não salvos" : fonteAlterada ? "alteração não salva" : "filtro alterado, não salvo"}` : ""}`
    : `Fonte escolhida: ${nomeDaFonte(fonte)} · ainda não salva${meta.suggested_source === fonte ? " (sugestão da mila)" : ""}`;
  const motivoBloqueio = syncBloqueado && fonteAtualObj
    ? `Para sincronizar, conecte ${fonteAtualObj.nome.split(" ")[0]} nesta loja ou escolha outra fonte em Configurar.`
    : null;
  const temDetalhes = !!summary || !!meta.catalog_id;

  return (
    <div className="meta-catalog-frame">
    <div className="meta-catalog">
      <div className="meta-catalog-summary">
        <div className="meta-catalog-summary-copy">
          <p className="meta-catalog-name">{catalogName}</p>
          <p>{linhaFonte}</p>
          <p suppressHydrationWarning>
            {linhaSync}
            {summary?.falhas && summary.falhas > 0 ? <span className="meta-catalog-fail"> · {summary.falhas} {summary.falhas === 1 ? "item falhou" : "itens falharam"}</span> : null}
          </p>
        </div>
        <div className="meta-catalog-summary-actions">
          <button
            type="button"
            className="ledger-button ledger-button-quiet"
            aria-expanded={configAberta}
            aria-controls={configId}
            onClick={() => setConfigAberta(!configAberta)}
          >
            Configurar
          </button>
          <button
            type="button"
            className="ledger-button ledger-button-primary meta-catalog-sync"
            onClick={() => sincronizarAgora(false)}
            disabled={sincronizando || salvando || syncBloqueado}
            aria-describedby={motivoBloqueio ? motivoId : undefined}
          >
            {sincronizando ? <><span className="meta-sync-spinner" aria-hidden="true" /> Sincronizando…</> : "Sincronizar"}
          </button>
        </div>
      </div>

      {motivoBloqueio ? <p id={motivoId} className="meta-catalog-note" data-tone="warn">{motivoBloqueio}</p> : null}
      {(!fonteSalva || pendente) && !syncBloqueado ? <p className="meta-catalog-note">Ao sincronizar, a mila salva antes {fonteSalva ? "a alteração" : "a fonte escolhida"} e envia com ela.</p> : null}

      {bloqueioDuplicacao ? (
        <div className="meta-catalog-alert" role="alert">
          <strong>Catálogo já existente na Meta</strong>
          <p>{bloqueioDuplicacao.mensagem}</p>
          <div className="meta-catalog-alert-actions">
            <button
              type="button"
              className="ledger-button meta-catalog-confirm"
              onClick={() => sincronizarAgora(true)}
              disabled={sincronizando}
            >
              {sincronizando ? "Sincronizando…" : "Sim, sincronizar mesmo assim"}
            </button>
            <button
              type="button"
              className="ledger-button ledger-button-quiet"
              onClick={() => setBloqueioDuplicacao(null)}
              disabled={sincronizando}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {mensagemSucesso ? (
        <p className="meta-catalog-feedback" data-tone="positive" role="status">{mensagemSucesso}</p>
      ) : null}
      {erro ? (
        <p className="meta-catalog-feedback" data-tone="error" role="alert">{erro}</p>
      ) : null}

      <div id={configId} className="meta-catalog-config" hidden={!configAberta}>
        <div className="meta-catalog-field">
          <label htmlFor="meta-product-source-select">Fonte dos produtos</label>
          <select
            id="meta-product-source-select"
            className="meta-catalog-select"
            value={fonte}
            onChange={(e) => {
              setFonte(e.target.value);
              setMensagemSucesso(null);
            }}
            disabled={salvando || sincronizando}
            aria-describedby={`${configId}-fonte`}
          >
            {FONTES.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
          <p id={`${configId}-fonte`} className="meta-catalog-hint" data-tone={fonteAtualObj?.providerId && !fonteConectada ? "warn" : undefined}>
            {fonteAtualObj?.providerId
              ? fonteConectada
                ? `${fonteAtualObj.nome.split(" ")[0]} está conectada nesta loja.`
                : `${fonteAtualObj.nome.split(" ")[0]} não está conectada nesta loja. Conecte-a para importar seus produtos.`
              : "Produtos cadastrados pela conversa com a mila."}
            {!fonteSalva && meta.suggested_source === fonte ? " Sugestão da mila, ainda não salva." : ""}
          </p>
        </div>

        <label className="meta-catalog-checkbox-label">
          <input
            type="checkbox"
            checked={apenasPublicados}
            onChange={(e) => {
              setApenasPublicados(e.target.checked);
              setMensagemSucesso(null);
            }}
            disabled={salvando || sincronizando}
          />
          <span>Enviar apenas produtos publicados e visíveis na loja</span>
        </label>

        <div>
          <button
            type="button"
            className="ledger-button"
            onClick={salvarFonte}
            disabled={salvando || sincronizando}
          >
            {salvando ? "Salvando…" : "Salvar fonte"}
          </button>
        </div>
      </div>

      {temDetalhes ? (
        <details className="meta-catalog-details">
          <summary>Detalhes da sincronização</summary>
          {summary ? (
            <dl className="meta-catalog-stats">
              <div><dt>Avaliados</dt><dd>{summary.totalAvaliados ?? 0}</dd></div>
              <div><dt>Enviados</dt><dd>{summary.enviados ?? 0}</dd></div>
              <div><dt>Coleções Instagram</dt><dd>{summary.conjuntos?.length ?? 0}</dd></div>
            </dl>
          ) : <p>Os números aparecem depois da primeira sincronização.</p>}
          {summary?.erros && summary.erros.length > 0 ? (
            <>
              <p className="meta-catalog-list-title">{summary.erros.length} erros no envio</p>
              <ul>
                {summary.erros.slice(0, 10).map((e, idx) => (
                  <li key={idx}>
                    {e.item ? <strong>{e.item}: </strong> : null}{e.erro}
                  </li>
                ))}
                {summary.erros.length > 10 ? (
                  <li>… e mais {summary.erros.length - 10} erros.</li>
                ) : null}
              </ul>
            </>
          ) : null}
          {summary?.avisos && summary.avisos.length > 0 ? (
            <>
              <p className="meta-catalog-list-title">{summary.avisos.length} avisos de fotos ou itens ignorados</p>
              <ul>
                {summary.avisos.slice(0, 10).map((av, idx) => (
                  <li key={idx}>
                    {av.item ? <strong>{av.item}: </strong> : null}{av.aviso}
                  </li>
                ))}
                {summary.avisos.length > 10 ? (
                  <li>… e mais {summary.avisos.length - 10} avisos.</li>
                ) : null}
              </ul>
            </>
          ) : null}
          <p className="meta-catalog-id" title="Identificador do catálogo no Gerenciador de Comércio da Meta">ID do catálogo: {catalogId}</p>
        </details>
      ) : null}
    </div>
    </div>
  );
}
