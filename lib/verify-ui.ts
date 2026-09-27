/**
 * Decisões de exibição da tela de código, puras para serem testáveis.
 *
 * O telefone vem do `localStorage`, que o servidor não lê. Por isso o estado
 * precisa distinguir três situações, e confundir duas delas produz recado falso:
 *   - `null` → ainda não li o storage (primeiro render, servidor + hidratação)
 *   - `""`   → li e não tem número guardado (a lojista realmente não informou)
 *   - texto  → li e tem número
 */

/** Só avisa "informe seu WhatsApp" quando de fato não há número guardado. */
export function shouldShowMissingPhoneNote(telefone: string | null): boolean {
  return telefone === "";
}
