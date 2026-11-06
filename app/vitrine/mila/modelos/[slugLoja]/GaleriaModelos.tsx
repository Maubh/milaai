"use client";

import { useState } from "react";
import VitrineView from "../../../[slugLoja]/[slugColecao]/VitrineView";
import SeletorTemplates from "@/components/SeletorTemplates";
import type { LojaVitrine } from "@/lib/server/vitrine-api";
import { COLECAO_DE_EXEMPLO, DESCRICAO_TEMPLATE, pecasDeExemplo, type TemplateVitrine } from "@/lib/vitrine";

/** Onde a lojista escolhe de verdade: a página Vitrine da área logada. */
export const LINK_ESCOLHER = "https://milaai.com.br/workspace/vitrine";

/**
 * Entrada da galeria: as três abas em cima e a vitrine de exemplo embaixo,
 * com a marca da loja. A escolha é feita na área logada (ou pela mila).
 */
export default function GaleriaModelos({ loja }: { loja: LojaVitrine }) {
  const [ativo, setAtivo] = useState<TemplateVitrine>(loja.template);
  const itens = pecasDeExemplo(loja.corPrimaria);

  return (
    <div className="galeria">
      <header className="galeria-topo">
        <div className="galeria-topo-inner">
          <h1 className="galeria-titulo">Layouts da vitrine de {loja.nomeExibicao}</h1>
          <p className="galeria-texto">Os três usam cores, fontes e logo da sua marca.</p>
          <SeletorTemplates
            nome="galeria-template"
            valor={ativo}
            onChange={setAtivo}
            legenda="Layout para ver"
            atual={loja.template}
          />
          <a className="galeria-escolher" href={`${LINK_ESCOLHER}?template=${ativo}`}>
            Escolher na área logada
          </a>
        </div>
      </header>

      <section className="galeria-previa" aria-live="polite" aria-label={`Prévia do layout ${DESCRICAO_TEMPLATE[ativo].nome}`}>
        <VitrineView
          key={ativo}
          loja={loja}
          template={ativo}
          exemplo
          vitrine={{ id: "exemplo", slugColecao: "exemplo", tituloColecao: COLECAO_DE_EXEMPLO, descricao: null, itens }}
        />
      </section>
    </div>
  );
}
