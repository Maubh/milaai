"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  COUNTRIES,
  findCountry,
  formatNationalNumber,
  isValidNationalNumber,
  toInternational,
} from "@/lib/countries";
import { saveTelefone } from "@/lib/onboarding";
import TurnstileWidget from "@/components/TurnstileWidget";
import "./auth.css";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export default function LoginPage() {
  const router = useRouter();
  const [iso, setIso] = useState("BR");
  const [numero, setNumero] = useState("");
  const [busca, setBusca] = useState("");
  const [listaAberta, setListaAberta] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [captchaOk, setCaptchaOk] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaErro, setCaptchaErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const pais = findCountry(iso);
  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.nome.toLowerCase().includes(q) || c.ddi.includes(q.replace(/\D/g, "")),
    );
  }, [busca]);

  function escolherPais(novoIso: string) {
    setIso(novoIso);
    setNumero("");
    setErro(null);
    setListaAberta(false);
    setBusca("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidNationalNumber(numero, iso)) {
      setErro(`Digite um número válido para ${pais.nome}.`);
      return;
    }
    if (SITE_KEY && !captchaToken) {
      setCaptchaErro("Confirme que você não é um robô para continuar.");
      return;
    }
    setErro(null);
    setCaptchaErro(null);
    setEnviando(true);
    if (SITE_KEY && captchaToken) {
      try {
        const res = await fetch("/api/turnstile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: captchaToken }),
        });
        const data = await res.json();
        if (!data?.ok) {
          setCaptchaErro("A verificação expirou. Confirme novamente que você não é um robô.");
          setCaptchaOk(false);
          setCaptchaToken(null);
          setEnviando(false);
          return;
        }
      } catch {
        setCaptchaErro("Não foi possível verificar. Tente de novo.");
        setEnviando(false);
        return;
      }
    }
    saveTelefone(toInternational(numero, iso));
    router.push("/login/verify");
  }

  return (
    <div className="wrap auth-minimal">
      <p className="auth-minimal-back auth-minimal-back-top">
        <Link href="/">← Voltar</Link>
      </p>
      <h1 className="auth-minimal-title">Entrar na mila</h1>
      <p className="auth-minimal-lede">
        Vamos gerar um código para você entrar na prévia. Ele aparece na próxima tela. Nada é
        enviado de verdade.
      </p>
      <form className="auth-minimal-form" onSubmit={submit} aria-label="Informar celular">
        <div className="field">
          <label htmlFor="login-tel">Celular</label>
          <div className="phone-row">
            <div className="country-pick">
              <button
                type="button"
                className="country-btn"
                aria-haspopup="listbox"
                aria-expanded={listaAberta}
                aria-label={`País: ${pais.nome}, código +${pais.ddi}. Trocar país.`}
                onClick={() => setListaAberta((v) => !v)}
              >
                <span aria-hidden="true" className="country-flag">
                  {pais.bandeira}
                </span>
                <span className="num">+{pais.ddi}</span>
                <span aria-hidden="true" className="country-caret">
                  ▾
                </span>
              </button>
              {listaAberta ? (
                <div className="country-list-wrap">
                  <input
                    type="search"
                    className="country-search"
                    placeholder="Buscar país ou código"
                    aria-label="Buscar país ou código"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    autoFocus
                  />
                  <ul className="country-list" role="listbox" aria-label="Países">
                    {filtrados.map((c) => (
                      <li key={c.iso} role="option" aria-selected={c.iso === iso}>
                        <button
                          type="button"
                          className={c.iso === iso ? "country-opt active" : "country-opt"}
                          onClick={() => escolherPais(c.iso)}
                        >
                          <span aria-hidden="true" className="country-flag">
                            {c.bandeira}
                          </span>
                          <span className="country-name">{c.nome}</span>
                          <span className="num country-ddi">+{c.ddi}</span>
                        </button>
                      </li>
                    ))}
                    {filtrados.length === 0 ? (
                      <li className="country-empty">Nenhum país encontrado.</li>
                    ) : null}
                  </ul>
                </div>
              ) : null}
            </div>
            <input
              id="login-tel"
              name="telefone"
              inputMode="tel"
              autoComplete="tel"
              placeholder={iso === "BR" ? "(11) 99999-0000" : "Seu número"}
              value={numero}
              onChange={(e) => {
                setNumero(formatNationalNumber(e.target.value, iso));
                setErro(null);
              }}
              aria-describedby={erro ? "login-tel-erro" : "login-tel-ajuda"}
            />
          </div>
          {erro ? (
            <p id="login-tel-erro" role="alert" className="error">
              {erro}
            </p>
          ) : (
            <p id="login-tel-ajuda" className="hint">
              Simulação. Nenhum código real será enviado.
            </p>
          )}
        </div>
        <p className="auth-consent">
          Ao clicar em “Continuar para o código”, você concorda com os{" "}
          <Link href="/termos">Termos de Uso</Link> e a{" "}
          <Link href="/privacidade">Política de Privacidade</Link> da mila.
        </p>
        {SITE_KEY ? (
          <div className="field">
            <TurnstileWidget
              siteKey={SITE_KEY}
              onVerify={(token) => {
                setCaptchaOk(true);
                setCaptchaToken(token);
                setCaptchaErro(null);
              }}
              onExpire={() => {
                setCaptchaOk(false);
                setCaptchaToken(null);
              }}
            />
            {captchaErro ? (
              <p role="alert" className="error">
                {captchaErro}
              </p>
            ) : null}
          </div>
        ) : null}
        <button
          type="submit"
          className="btn btn-plum auth-minimal-cta"
          disabled={enviando || (!!SITE_KEY && !captchaOk)}
        >
          {enviando ? "Continuando…" : "Continuar para o código"}
        </button>
      </form>
    </div>
  );
}
