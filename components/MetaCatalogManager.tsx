"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { integrationErrorText } from "@/lib/integration-errors";
import { META_SOURCES as FONTES } from "@/lib/meta-catalog";
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

function nomeDaFonte(id?: string | null): string | null {
  if (!id) return null;
  return FONTES.find((f) => f.id === id)?.nome ?? id;
}

interface CatalogoOpcao {
  id: string;
  name: string | null;
  business_name: string | null;
}

/**
 * Escolha do catálogo da Meta (comportamento de main). Com vários catálogos na
 * conta, a mila não escolhe sozinha: a lojista escolhe uma vez e a escolha vale
 * até ela trocar.
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
    return <p className="meta-catalog-hint" role="status">Buscando seus catálogos na Meta…</p>;
  }

  return (
    <div className="meta-catalog-field">
      <label htmlFor="meta-catalog-choice">Qual catálogo a mila deve usar?</label>
      {semPermissao ? (
        <p className="meta-catalog-hint" data-tone="warn">
          A Meta não liberou a lista de catálogos desta conta. Reconecte a Meta e autorize o acesso aos seus negócios para escolher o catálogo.
        </p>
      ) : catalogos.length === 0 && !erro ? (
        <p className="meta-catalog-hint" data-tone="warn">
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
          <div className="meta-catalog-alert-actions">
            <button
              type="button"
              className="ledger-button ledger-button-primary"
              onClick={usarCatalogo}
              disabled={gravando || !escolha || escolha === atual}
            >
              {gravando ? "Salvando…" : "Usar este catálogo"}
            </button>
            {onCancelar ? (
              <button type="button" className="ledger-button ledger-button-quiet" onClick={onCancelar} disabled={gravando}>
                Cancelar
              </button>
            ) : null}
          </div>
        </>
      ) : null}
      {erro ? (
        <p className="meta-catalog-feedback" data-tone="error" role="alert">{erro}</p>
      ) : null}
      {/* Só quando a Meta nega o acesso aos negócios (business_permission false): reautorizar
          mantém a conexão e pede de novo a permissão. Outro 403 (ex.: plano) não é caso de reautorizar. */}
      {semPermissao ? (
        <a href="/integrations/meta" className="ledger-button meta-catalog-reauth">Reautorizar acesso à Meta</a>
      ) : null}
    </div>
  );
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

  // Sem fonte salva, o seletor começa vazio ("Escolha a fonte"): a sugestão
  // aparece marcada, mas só vale depois que a lojista escolhe e salva (main).
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
  const fonteSalva = !!meta.product_source;
  const syncBloqueado = fonteAtualObj?.providerId ? !fonteConectada : false;
  // Configuração abre sozinha quando há algo a resolver: fonte não salva ou desconectada.
  const [configAberta, setConfigAberta] = useState<boolean>(!fonteSalva || syncBloqueado);
  const configId = useId();
  const motivoId = useId();

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
    : fonte
      ? `Fonte escolhida: ${nomeDaFonte(fonte)} · ainda não salva${sugerida === fonte ? " (sugestão da mila)" : ""}`
      : `Fonte dos produtos: ainda não escolhida${sugerida ? ` · sugestão da mila: ${nomeDaFonte(sugerida)}` : ""}`;
  const motivoBloqueio = syncBloqueado && fonteAtualObj
    ? `Para sincronizar, conecte ${fonteAtualObj.nome.split(" ")[0]} nesta loja ou escolha outra fonte em Configurar.`
    : null;
  const temDetalhes = !!summary || !!meta.catalog_id;

  // Sem catálogo escolhido (ou trocando), a área mostra só a escolha do catálogo.
  if (!catalogId || trocandoCatalogo) {
    return (
      <div className="meta-catalog-frame">
      <div className="meta-catalog">
        <div className="meta-catalog-summary-copy">
          <p className="meta-catalog-name">{catalogId ? catalogName : "Catálogo do Instagram e Facebook"}</p>
        </div>
        <SeletorCatalogo atual={catalogId} onCancelar={catalogId ? () => setTrocandoCatalogo(false) : undefined} />
      </div>
      </div>
    );
  }

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
            className="ledger-button meta-catalog-configure"
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
            disabled={!fonte || sincronizando || salvando || syncBloqueado}
            aria-describedby={motivoBloqueio ? motivoId : undefined}
          >
            {sincronizando ? <><span className="meta-sync-spinner" aria-hidden="true" /> Sincronizando…</> : "Sincronizar"}
          </button>
        </div>
      </div>

      {motivoBloqueio ? <p id={motivoId} className="meta-catalog-note" data-tone="warn">{motivoBloqueio}</p> : null}
      {!fonte ? <p className="meta-catalog-note">Escolha a fonte dos produtos em Configurar para poder sincronizar.</p> : null}
      {fonte && (!fonteSalva || pendente) && !syncBloqueado ? <p className="meta-catalog-note">Ao sincronizar, a mila salva antes {fonteSalva ? "a alteração" : "a fonte escolhida"} e envia com ela.</p> : null}

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
        <div className="meta-catalog-field meta-catalog-current">
          <span>Catálogo na Meta: <strong>{catalogName}</strong></span>
          <button
            type="button"
            className="ledger-button ledger-button-quiet"
            onClick={() => setTrocandoCatalogo(true)}
            disabled={salvando || sincronizando}
          >
            Trocar catálogo
          </button>
        </div>
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
          <p id={`${configId}-fonte`} className="meta-catalog-hint" data-tone={fonteAtualObj?.providerId && !fonteConectada ? "warn" : undefined}>
            {fonteAtualObj?.providerId
              ? fonteConectada
                ? `${fonteAtualObj.nome.split(" ")[0]} está conectada nesta loja.`
                : `${fonteAtualObj.nome.split(" ")[0]} não está conectada nesta loja. Conecte-a para importar seus produtos.`
              : fonte
                ? "Produtos cadastrados pela conversa com a mila."
                : "Escolha de onde vêm os produtos que vão para o catálogo."}
            {!fonteSalva && sugerida && sugerida === fonte ? " Sugestão da mila, ainda não salva." : ""}
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
            disabled={!fonte || salvando || sincronizando}
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
