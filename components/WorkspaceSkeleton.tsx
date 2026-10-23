import type { ReactNode } from "react";
import "./workspace-skeleton.css";

type BoneSize = "title" | "heading" | "line" | "short" | "tiny" | "button" | "logo" | "qr" | "figure";

/** Um bloco de esqueleto. Só forma: o texto real chega com a página. */
export function Bone({ size = "line" }: { size?: BoneSize }) {
  return <span className="skeleton-bone" data-size={size} aria-hidden="true" />;
}

/**
 * Moldura de carregamento de uma rota: anuncia uma vez para leitor de tela e
 * esconde os blocos, que são só a geometria da página que está chegando.
 */
export default function WorkspaceSkeleton({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="workspace-skeleton" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}
