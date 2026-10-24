/**
 * Conteúdo do selo Pro quando o recurso está bloqueado no plano atual: cadeado
 * pequeno + "Pro". O cadeado segue a família dos ícones do shell (grade 24,
 * traço arredondado), com traço um pouco mais grosso para continuar legível em
 * 12px. Ele é decorativo; o leitor de tela ouve "Pro, bloqueado no seu plano",
 * sem depender de tooltip.
 */
export function ProBloqueado() {
  return (
    <>
      <svg className="plan-lock" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
      Pro<span className="sr-only">, bloqueado no seu plano</span>
    </>
  );
}
