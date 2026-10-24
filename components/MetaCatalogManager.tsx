"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { integrationErrorText } from "@/lib/integration-errors";
import { META_SOURCES as FONTES } from "@/lib/meta-catalog";

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

interface CatalogoOpcao {
  id: string;
  name: string | null;
  business_name: string | null;
}

/**
 * Escolha do catálogo da Meta. Com vários catálogos na conta, a Mila não
 * escolhe sozinha: a lojista escolhe uma vez e a escolha vale até ela trocar.
 */
function SeletorCatalogo({ atual, onCancelar }: { atual: string | null; onCancelar?: () => void }) {
  const router = useRouter();
  const [catalogos, setCatalogos] = useState<CatalogoOpcao[] | null>(null);
  const [semPermissao, setSemPermissao] = useState(false);
  const [escolha, setEscolha] = useState<string>(atual ?? "");
  const [gravando, setGravando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    fetch("/api/meta/catalog/catalogs", { cache: "no-store" })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          detail?: string;
          business_permission?: boolean;
          catalogs?: CatalogoOpcao[];
        };
        if (!ativo) return;
        if (!res.ok || !data.ok) {
          setErro(integrationErrorText(data.detail));
          setCatalogos([]);
          return;
        }
        setSemPermissao(data.business_permission === false);
        setCatalogos(data.catalogs ?? []);
      })
      .catch(() => {
        if (ativo) {
          setErro("Não foi possível buscar seus catálogos na Meta agora. Tente novamente.");
          setCatalogos([]);
        }
      });
    return () => {
      ativo = false;
    };
  }, []);

  async function usarCatalogo() {
    if (!escolha) return;
    setGravando(true);
    setErro(null);
    try {
      const res = await fetch("/api/meta/catalog/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catalog_id: escolha }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; detail?: string; error?: string };
      if (res.ok && data.ok) {
        router.refresh();
        onCancelar?.();
      } else {
        setErro(data.error || integrationErrorText(data.detail));
      }
    } catch {
      setErro("Não foi possível salvar o catálogo agora. Tente novamente.");
    } finally {
      setGravando(false);
    }
  }

  if (catalogos === null) {
    return <p className="meta-catalog-summary-date">Buscando seus catálogos na Meta…</p>;
  }

  return (
    <div className="meta-catalog-field">
      <div className="meta-catalog-field-header">
        <label htmlFor="meta-catalog-choice" className="meta-catalog-field-title">
          Qual catálogo a Mila deve usar?
        </label>
      </div>
      {semPermissao ? (
        <p className="meta-catalog-source-warning">
          A Meta não liberou a lista de catálogos desta conta. Reconecte a Meta e autorize o acesso aos seus negócios para escolher o catálogo.
        </p>
      ) : catalogos.length === 0 && !erro ? (
        <p className="meta-catalog-source-warning">
          Não encontramos nenhum catálogo nesta conta da Meta. Crie um no Gerenciador de Comércio e volte aqui.
        </p>
      ) : catalogos.length > 0 ? (
        <>
          <select
            id="meta-catalog-choice"
            className="meta-catalog-select"
            value={escolha}
            onChange={(e) => setEscolha(e.target.value)}
            disabled={gravando}
          >
            <option value="" disabled>
              Escolha o catálogo
            </option>
            {catalogos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || `Catálogo ${c.id}`}
                {c.business_name ? ` · ${c.business_name}` : ""}
              </option>
            ))}
          </select>
          <div className="meta-catalog-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={usarCatalogo}
              disabled={gravando || !escolha || escolha === atual}
            >
              {gravando ? "Salvando…" : "Usar este catálogo"}
            </button>
            {onCancelar ? (
              <button type="button" className="btn btn-ghost" onClick={onCancelar} disabled={gravando}>
                Cancelar
              </button>
            ) : null}
          </div>
        </>
      ) : null}
      {erro ? (
        <p className="meta-catalog-feedback meta-catalog-feedback-error" role="alert">
          ✕ {erro}
        </p>
      ) : null}
    </div>
  );
}

function formatarDataHora(ts?: number | null): string {
  if (!ts) return "Nunca sincronizado";
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

  // Sem fonte salva, o seletor começa vazio ("Escolha a fonte"): a sugestão
  // aparece marcada, mas só vale depois que a lojista escolhe e salva.
  const [fonte, setFonte] = useState<string>(meta.product_source || "");
  const sugerida = meta.product_source ? null : meta.suggested_source || null;
  const [trocandoCatalogo, setTrocandoCatalogo] = useState(false);
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

  const catalogId = meta.catalog_id || null;
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

      if (data.status === "bloqueado_duplicacao") {
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
      ? "Sincronizado"
      : meta.last_sync_status === "parcial"
      ? "Parcial (com ressalvas)"
      : meta.last_sync_status === "erro"
      ? "Falha"
      : meta.last_sync_at
      ? "Concluído"
      : "Pendente";

  if (!catalogId || trocandoCatalogo) {
    return (
      <div className="meta-catalog-manager">
        <div className="meta-catalog-header">
          <div className="meta-catalog-header-info">
            <span className="meta-catalog-label">Catálogo do Instagram & Facebook</span>
            {catalogId ? <span className="meta-catalog-name">{catalogName}</span> : null}
          </div>
        </div>
        <SeletorCatalogo
          atual={catalogId}
          onCancelar={catalogId ? () => setTrocandoCatalogo(false) : undefined}
        />
      </div>
    );
  }

  return (
    <div className="meta-catalog-manager">
      <div className="meta-catalog-header">
        <div className="meta-catalog-header-info">
          <span className="meta-catalog-label">Catálogo do Instagram & Facebook</span>
          {catalogName ? (
            <span className="meta-catalog-name">{catalogName}</span>
          ) : null}
        </div>
        <span className="meta-catalog-id" title="Identificador do catálogo no Gerenciador de Comércio da Meta">
          ID: <strong>{catalogId}</strong>
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setTrocandoCatalogo(true)}
          disabled={salvando || sincronizando}
        >
          Trocar catálogo
        </button>
      </div>

      <div className="meta-catalog-controls">
        <div className="meta-catalog-field">
          <div className="meta-catalog-field-header">
            <label htmlFor="meta-product-source-select" className="meta-catalog-field-title">
              Fonte dos produtos
            </label>
            {fonteAtualObj?.providerId ? (
              <span
                className={`meta-catalog-source-pill ${
                  fonteConectada ? "meta-source-pill-ok" : "meta-source-pill-warn"
                }`}
              >
                {fonteConectada ? "✓ Conectada" : "⚠ Não conectada"}
              </span>
            ) : null}
          </div>
          <select
            id="meta-product-source-select"
            className="meta-catalog-select"
            value={fonte}
            onChange={(e) => {
              setFonte(e.target.value);
              setMensagemSucesso(null);
            }}
            disabled={salvando || sincronizando}
          >
            <option value="" disabled>
              Escolha a fonte
            </option>
            {FONTES.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
                {f.id === sugerida ? " (sugerida)" : ""}
              </option>
            ))}
          </select>
        </div>

        {fonteAtualObj?.providerId && !fonteConectada ? (
          <p className="meta-catalog-source-warning">
            Aviso: a integração com {fonteAtualObj.nome.split(" ")[0]} não está conectada nesta loja. Conecte-a para importar seus produtos.
          </p>
        ) : null}

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
      </div>

      {bloqueioDuplicacao ? (
        <div className="meta-catalog-duplication-box" role="alert">
          <div className="meta-catalog-duplication-text">
            <strong>Catálogo já existente na Meta</strong>
            <p>{bloqueioDuplicacao.mensagem}</p>
          </div>
          <div className="meta-catalog-duplication-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => sincronizarAgora(true)}
              disabled={sincronizando}
            >
              {sincronizando ? "Sincronizando..." : "Sim, sincronizar mesmo assim"}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setBloqueioDuplicacao(null)}
              disabled={sincronizando}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {mensagemSucesso ? (
        <p className="meta-catalog-feedback meta-catalog-feedback-success" role="status">
          ✓ {mensagemSucesso}
        </p>
      ) : null}

      {erro ? (
        <p className="meta-catalog-feedback meta-catalog-feedback-error" role="alert">
          ✕ {erro}
        </p>
      ) : null}

      <div className="meta-catalog-actions">
        <button
          type="button"
          className="btn btn-primary meta-btn-sync"
          onClick={() => sincronizarAgora(false)}
          disabled={!fonte || sincronizando || salvando || (fonteAtualObj?.providerId ? !fonteConectada : false)}
        >
          {sincronizando ? (
            <>
              <span className="meta-sync-spinner" aria-hidden="true" />
              <span>Sincronizando produtos e coleções…</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
              <span>Sincronizar agora</span>
            </>
          )}
        </button>

        <button
          type="button"
          className="btn btn-ghost meta-btn-save-source"
          onClick={salvarFonte}
          disabled={!fonte || salvando || sincronizando}
        >
          {salvando ? "Salvando…" : "Salvar fonte"}
        </button>
      </div>

      <div className="meta-catalog-summary-card">
        <div className="meta-catalog-summary-top">
          <span className="meta-catalog-summary-title">Última sincronização</span>
          <span className={`meta-catalog-status-badge meta-status-${meta.last_sync_status || "pendente"}`}>
            {statusLabel}
          </span>
        </div>
        <p className="meta-catalog-summary-date" suppressHydrationWarning>
          {formatarDataHora(meta.last_sync_at)}
        </p>

        {summary ? (
          <div className="meta-catalog-stats-grid">
            <div className="meta-stat-item">
              <span className="meta-stat-num">{summary.totalAvaliados ?? 0}</span>
              <span className="meta-stat-label">Avaliados</span>
            </div>
            <div className="meta-stat-item">
              <span className="meta-stat-num">{summary.enviados ?? 0}</span>
              <span className="meta-stat-label">Enviados</span>
            </div>
            <div className="meta-stat-item">
              <span className="meta-stat-num">{summary.conjuntos?.length ?? 0}</span>
              <span className="meta-stat-label">Coleções Instagram</span>
            </div>
          </div>
        ) : null}

        {summary?.falhas && summary.falhas > 0 ? (
          <p className="meta-catalog-feedback meta-catalog-feedback-error" role="status">
            {summary.falhas} {summary.falhas === 1 ? "item falhou" : "itens falharam"} no envio.
            {summary.erros && summary.erros.length > 0 ? " Veja os detalhes abaixo." : ""}
          </p>
        ) : null}

        {summary?.erros && summary.erros.length > 0 ? (
          <details className="meta-catalog-warnings-details">
            <summary>{summary.erros.length} erros no envio</summary>
            <ul>
              {summary.erros.slice(0, 10).map((e, idx) => (
                <li key={idx}>
                  {e.item ? <strong>{e.item}: </strong> : null}{e.erro}
                </li>
              ))}
              {summary.erros.length > 10 ? (
                <li>... e mais {summary.erros.length - 10} erros.</li>
              ) : null}
            </ul>
          </details>
        ) : null}

        {summary?.avisos && summary.avisos.length > 0 ? (
          <details className="meta-catalog-warnings-details">
            <summary>{summary.avisos.length} avisos de fotos ou itens ignorados</summary>
            <ul>
              {summary.avisos.slice(0, 10).map((av, idx) => (
                <li key={idx}>
                  {av.item ? <strong>{av.item}: </strong> : null}{av.aviso}
                </li>
              ))}
              {summary.avisos.length > 10 ? (
                <li>... e mais {summary.avisos.length - 10} avisos.</li>
              ) : null}
            </ul>
          </details>
        ) : null}
      </div>
    </div>
  );
}
