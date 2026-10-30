"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CloseIcon, MenuIcon } from "./Icons";

interface Secao {
  href: string;
  rotulo: string;
}

/**
 * Topo fixo da proposta A. Publica a altura real (fechado) em --lpa-topo para as
 * âncoras e o título fixo da rotina. Abaixo de 1024px, as seções ficam numa
 * gaveta ancorada sob o topo, aberta por um botão de menu.
 */
export default function CabecalhoFixo({
  marca,
  secoes,
  previa,
  entrar,
}: {
  marca: ReactNode;
  secoes: readonly Secao[];
  previa: ReactNode;
  entrar: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    const topo = ref.current;
    const raiz = topo?.closest<HTMLElement>(".lpa");
    if (!topo || !raiz) return;
    const medir = () => raiz.style.setProperty("--lpa-topo", `${Math.ceil(topo.getBoundingClientRect().height)}px`);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(topo);
    return () => {
      observador.disconnect();
      raiz.style.removeProperty("--lpa-topo");
    };
  }, []);

  useEffect(() => {
    const computador = window.matchMedia("(min-width: 1024px)");
    const aoMudar = () => {
      if (computador.matches) setAberto(false);
    };
    computador.addEventListener("change", aoMudar);
    return () => computador.removeEventListener("change", aoMudar);
  }, []);

  useEffect(() => {
    if (!aberto) return;
    const topo = ref.current;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setAberto(false);
      botao.current?.focus();
    };
    const foraDoTopo = (e: Event) => {
      if (topo && e.target instanceof Node && !topo.contains(e.target)) setAberto(false);
    };
    document.addEventListener("keydown", aoTeclar);
    document.addEventListener("pointerdown", foraDoTopo);
    document.addEventListener("focusin", foraDoTopo);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.removeEventListener("pointerdown", foraDoTopo);
      document.removeEventListener("focusin", foraDoTopo);
    };
  }, [aberto]);

  const fecharAoNavegar = () => {
    if (!aberto) return;
    setAberto(false);
    botao.current?.focus({ preventScroll: true });
  };

  return (
    <header ref={ref} className={aberto ? "lp-bar lpa-bar is-aberto" : "lp-bar lpa-bar"}>
      {marca}
      <div className="lp-bar-actions">
        <div className="lpa-previa-topo">{previa}</div>
        {entrar}
        <button
          ref={botao}
          type="button"
          className="lpa-menu"
          aria-label="Menu de seções"
          aria-expanded={aberto}
          aria-controls="lpa-secoes"
          onClick={() => setAberto((a) => !a)}
        >
          <MenuIcon size={20} className="lpa-menu-abrir" />
          <CloseIcon size={20} className="lpa-menu-fechar" />
        </button>
      </div>
      <div className="lpa-gaveta">
        <nav id="lpa-secoes" className="lpa-nav" aria-label="Seções">
          <ul className="lpa-nav-track">
            {secoes.map((s) => (
              <li key={s.href}>
                <a href={s.href} className="lpa-nav-item" onClick={fecharAoNavegar}>
                  {s.rotulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="lpa-gaveta-previa">
          <span>Prévia</span>
          {previa}
        </div>
      </div>
    </header>
  );
}
