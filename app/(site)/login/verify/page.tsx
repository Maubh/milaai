"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getTelefone, isVerified, markVerified } from "@/lib/onboarding";
import "../auth.css";

const CODE_LEN = 6;
const RESEND_SECONDS = 30;

export default function VerifyPage() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LEN).fill(""));
  const [erro, setErro] = useState<string | null>(null);
  const [telefone, setTelefone] = useState("");
  const [alreadyVerified] = useState(() => isVerified());
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [enviando, setEnviando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setTelefone(getTelefone());
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  function setDigit(index: number, raw: string) {
    const d = raw.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = d;
      return next;
    });
    setErro(null);
    if (d && index < CODE_LEN - 1) inputsRef.current[index + 1]?.focus();
  }

  function onKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function onPaste(e: React.ClipboardEvent) {
    const nums = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LEN).split("");
    if (!nums.length) return;
    e.preventDefault();
    setDigits(Array.from({ length: CODE_LEN }, (_, i) => nums[i] ?? ""));
    setErro(null);
    inputsRef.current[Math.min(nums.length, CODE_LEN - 1)]?.focus();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== CODE_LEN) {
      setErro("Digite os 6 dígitos do código.");
      return;
    }
    const phone = getTelefone();
    if (!phone) {
      setErro("Número não encontrado. Volte e informe seu WhatsApp.");
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 400 && data?.detail === "expired") {
        setErro("Código expirado. Peça um novo.");
        setEnviando(false);
        return;
      }
      if (res.status === 400 && data?.detail === "mismatch") {
        setErro("Código incorreto. Confira e tente de novo.");
        setEnviando(false);
        return;
      }
      if (res.status === 429) {
        setErro("Muitas tentativas. Peça um novo código.");
        setEnviando(false);
        return;
      }
      if (!res.ok || data?.ok === false) {
        setErro("Não foi possível verificar. Tente de novo.");
        setEnviando(false);
        return;
      }
      markVerified({
        waLink: typeof data?.wa_link === "string" ? data.wa_link : undefined,
        plan: typeof data?.plan === "string" ? data.plan : undefined,
      });
      router.push("/onboarding/connect");
    } catch {
      setErro("Falha de conexão. Tente de novo.");
      setEnviando(false);
    }
  }

  async function resend() {
    const phone = getTelefone();
    if (!phone) {
      setErro("Número não encontrado. Volte e informe seu WhatsApp.");
      return;
    }
    setReenviando(true);
    setErro(null);
    try {
      const res = await fetch("/api/auth/otp/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) {
        setErro("Aguarde um instante antes de pedir outro código.");
        setReenviando(false);
        return;
      }
      if (!res.ok || data?.ok === false) {
        setErro("Não foi possível reenviar. Tente de novo.");
        setReenviando(false);
        return;
      }
      setSecondsLeft(RESEND_SECONDS);
      setDigits(Array(CODE_LEN).fill(""));
      inputsRef.current[0]?.focus();
    } catch {
      setErro("Falha de conexão no reenvio.");
    } finally {
      setReenviando(false);
    }
  }

  return (
    <div className="wrap auth-minimal">
      <p className="auth-minimal-back auth-minimal-back-top">
        <Link href="/login">← Trocar número</Link>
      </p>
      <h1 className="auth-minimal-title">Digite o código</h1>
      <p className="auth-minimal-lede">
        Enviamos um código de 6 dígitos no WhatsApp
        {telefone ? (
          <>
            {" "}
            de <strong className="num">{telefone}</strong>
          </>
        ) : null}
        .
        {alreadyVerified ? (
          <> Esta etapa já foi concluída neste navegador. Pode ver de novo ou seguir adiante.</>
        ) : null}
      </p>
      {!telefone ? (
        <p className="auth-prereq" role="note">
          Sem número ainda. <Link href="/login">Informe seu WhatsApp</Link> para receber o código.
        </p>
      ) : null}
      <form className="auth-minimal-form" onSubmit={submit} aria-label="Verificar código">
        <fieldset className="otp-fieldset" onPaste={onPaste}>
          <legend>Seis dígitos do código</legend>
          <div className="otp-row">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                className="num"
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                aria-label={`Dígito ${i + 1} de 6`}
                maxLength={1}
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
              />
            ))}
          </div>
        </fieldset>
        {erro ? (
          <p role="alert" className="calc-error">
            {erro}
          </p>
        ) : null}
        <button type="submit" className="btn btn-plum auth-minimal-cta" disabled={enviando}>
          {enviando ? "Verificando…" : "Verificar e continuar"}
        </button>
        <p className="auth-minimal-back">
          {secondsLeft > 0 ? (
            <>Reenviar em {secondsLeft}s</>
          ) : (
            <button type="button" className="link-btn" onClick={resend} disabled={reenviando}>
              {reenviando ? "Reenviando…" : "Reenviar código"}
            </button>
          )}
        </p>
      </form>
    </div>
  );
}
