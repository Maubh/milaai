import type { CSSProperties, ReactNode } from "react";
import "./workspace-skeleton.css";

type BoneSize = "title" | "heading" | "line" | "short" | "tiny" | "button" | "logo" | "qr" | "figure";

/** Um bloco de esqueleto. Só forma: o texto real chega com a página. */
export function Bone({ size = "line" }: { size?: BoneSize }) {
  return <span className="skeleton-bone" data-size={size} aria-hidden="true" />;
}

/**
 * Bloco de uma linha de texto que ainda não chegou. Vai dentro do próprio
 * elemento de texto (título, valor, detalhe): a altura da linha é a real.
 */
export function TextBone({ w = "100%" }: { w?: string }) {
  return <span className="skeleton-text" style={{ "--skeleton-w": w } as CSSProperties} aria-hidden="true" />;
}

/**
 * Texto fixo já conhecido, coberto por um bloco em cada linha: mantém as
 * quebras e a altura reais sem mostrar o conteúdo antes da hora.
 */
export function TextMask({ children }: { children: ReactNode }) {
  return <span className="skeleton-mask">{children}</span>;
}

/**
 * Moldura de carregamento de uma rota: anuncia uma vez para leitor de tela e
 * deixa a página que está chegando oculta e inerte: ela só dá a geometria.
 */
export default function WorkspaceSkeleton({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="workspace-skeleton" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {/* Inerte: a página dentro pode ter links e botões reais, que não podem receber foco escondidos. */}
      <div aria-hidden="true" inert>{children}</div>
    </div>
  );
}
