import type { ReactNode } from "react";
import "./plan-tag.css";

/**
 * Selo de plano das notas ("Plano Pro", "Essencial e Pro"). Todos com a mesma
 * base, borda, raio, padding e tipografia; só o texto muda. Os selos Pro das
 * integrações e de Dados da loja (com cadeado) são outro componente.
 */
export function PlanTag({ children }: { children: ReactNode }) {
  return <span className="plan-tag">{children}</span>;
}
