export interface Country {
  iso: string;
  nome: string;
  ddi: string;
  bandeira: string;
}

// Lista em português, Brasil primeiro. Bandeiras via emoji (sem imagem externa).
export const COUNTRIES: Country[] = [
  { iso: "BR", nome: "Brasil", ddi: "55", bandeira: "🇧🇷" },
  { iso: "PT", nome: "Portugal", ddi: "351", bandeira: "🇵🇹" },
  { iso: "US", nome: "Estados Unidos", ddi: "1", bandeira: "🇺🇸" },
  { iso: "AR", nome: "Argentina", ddi: "54", bandeira: "🇦🇷" },
  { iso: "UY", nome: "Uruguai", ddi: "598", bandeira: "🇺🇾" },
  { iso: "PY", nome: "Paraguai", ddi: "595", bandeira: "🇵🇾" },
  { iso: "CL", nome: "Chile", ddi: "56", bandeira: "🇨🇱" },
  { iso: "CO", nome: "Colômbia", ddi: "57", bandeira: "🇨🇴" },
  { iso: "PE", nome: "Peru", ddi: "51", bandeira: "🇵🇪" },
  { iso: "MX", nome: "México", ddi: "52", bandeira: "🇲🇽" },
  { iso: "ES", nome: "Espanha", ddi: "34", bandeira: "🇪🇸" },
  { iso: "IT", nome: "Itália", ddi: "39", bandeira: "🇮🇹" },
  { iso: "FR", nome: "França", ddi: "33", bandeira: "🇫🇷" },
  { iso: "DE", nome: "Alemanha", ddi: "49", bandeira: "🇩🇪" },
  { iso: "GB", nome: "Reino Unido", ddi: "44", bandeira: "🇬🇧" },
  { iso: "IE", nome: "Irlanda", ddi: "353", bandeira: "🇮🇪" },
  { iso: "NL", nome: "Holanda", ddi: "31", bandeira: "🇳🇱" },
  { iso: "BE", nome: "Bélgica", ddi: "32", bandeira: "🇧🇪" },
  { iso: "CH", nome: "Suíça", ddi: "41", bandeira: "🇨🇭" },
  { iso: "AT", nome: "Áustria", ddi: "43", bandeira: "🇦🇹" },
  { iso: "SE", nome: "Suécia", ddi: "46", bandeira: "🇸🇪" },
  { iso: "NO", nome: "Noruega", ddi: "47", bandeira: "🇳🇴" },
  { iso: "DK", nome: "Dinamarca", ddi: "45", bandeira: "🇩🇰" },
  { iso: "FI", nome: "Finlândia", ddi: "358", bandeira: "🇫🇮" },
  { iso: "PL", nome: "Polônia", ddi: "48", bandeira: "🇵🇱" },
  { iso: "CA", nome: "Canadá", ddi: "1", bandeira: "🇨🇦" },
  { iso: "AU", nome: "Austrália", ddi: "61", bandeira: "🇦🇺" },
  { iso: "NZ", nome: "Nova Zelândia", ddi: "64", bandeira: "🇳🇿" },
  { iso: "JP", nome: "Japão", ddi: "81", bandeira: "🇯🇵" },
  { iso: "KR", nome: "Coreia do Sul", ddi: "82", bandeira: "🇰🇷" },
  { iso: "CN", nome: "China", ddi: "86", bandeira: "🇨🇳" },
  { iso: "IN", nome: "Índia", ddi: "91", bandeira: "🇮🇳" },
  { iso: "ZA", nome: "África do Sul", ddi: "27", bandeira: "🇿🇦" },
  { iso: "AO", nome: "Angola", ddi: "244", bandeira: "🇦🇴" },
  { iso: "MZ", nome: "Moçambique", ddi: "258", bandeira: "🇲🇿" },
  { iso: "BO", nome: "Bolívia", ddi: "591", bandeira: "🇧🇴" },
  { iso: "EC", nome: "Equador", ddi: "593", bandeira: "🇪🇨" },
  { iso: "VE", nome: "Venezuela", ddi: "58", bandeira: "🇻🇪" },
  { iso: "CR", nome: "Costa Rica", ddi: "506", bandeira: "🇨🇷" },
  { iso: "PA", nome: "Panamá", ddi: "507", bandeira: "🇵🇦" },
  { iso: "DO", nome: "República Dominicana", ddi: "1", bandeira: "🇩🇴" },
];

export function findCountry(iso: string): Country {
  return COUNTRIES.find((c) => c.iso === iso) ?? COUNTRIES[0];
}

export function formatNationalNumber(raw: string, iso: string): string {
  const digits = raw.replace(/\D/g, "");
  if (iso === "BR") {
    const d = digits.slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : "";
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  return digits.slice(0, 15);
}

export function isValidNationalNumber(value: string, iso: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (iso === "BR") return digits.length === 10 || digits.length === 11;
  return digits.length >= 7 && digits.length <= 15;
}

export function toInternational(value: string, iso: string): string {
  const country = findCountry(iso);
  return `+${country.ddi} ${value}`.trim();
}
