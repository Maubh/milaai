"use client";

import { DESCRICAO_TEMPLATE, TEMPLATES_VITRINE, type TemplateVitrine } from "@/lib/vitrine";
import "./seletor-templates.css";

/**
 * Grupo de rádios com nome e descrição curta de cada layout. Serve à galeria
 * pública (só para ver) e à área logada (para gravar). Rótulo, foco visível e
 * estado escolhido marcado por borda, check e texto, não só por cor.
 */
export default function SeletorTemplates({
  nome,
  valor,
  onChange,
  legenda,
  atual,
  disabled = false,
}: {
  nome: string;
  valor: TemplateVitrine;
  onChange: (t: TemplateVitrine) => void;
  legenda: string;
  /** O layout gravado hoje, para marcar "em uso". */
  atual?: TemplateVitrine;
  disabled?: boolean;
}) {
  return (
    <fieldset className="seletor-templates" disabled={disabled}>
      <legend className="seletor-templates-legenda">{legenda}</legend>
      <div className="seletor-templates-opcoes">
        {TEMPLATES_VITRINE.map((t) => {
          const id = `${nome}-${t}`;
          const marcado = valor === t;
          return (
            <label key={t} htmlFor={id} className={`seletor-template${marcado ? " is-marcado" : ""}`}>
              <input id={id} type="radio" name={nome} value={t} checked={marcado} onChange={() => onChange(t)} className="seletor-template-radio" />
              <span className="seletor-template-nome">
                {DESCRICAO_TEMPLATE[t].nome}
                {atual === t ? <span className="seletor-template-atual"> (em uso)</span> : null}
              </span>
              <span className="seletor-template-desc">{DESCRICAO_TEMPLATE[t].descricao}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
