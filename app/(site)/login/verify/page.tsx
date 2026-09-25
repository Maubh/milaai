"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TEST_CODE } from "@/lib/conversation";
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

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (digits.join("") === TEST_CODE) {
      setErro(null);
      markVerified();
      router.push("/onboarding/connect");
    } else {
      setErro(`Código diferente do teste. Digite ${TEST_CODE}.`);
    }
  }

  function resend() {
    setSecondsLeft(RESEND_SECONDS);
    setErro(null);
    inputsRef.current[0]?.focus();
  }

  return (
    <div className="wrap auth-minimal">
      <p className="auth-minimal-back auth-minimal-back-top">
        <Link href="/login">← Trocar número</Link>
      </p>
      <h1 className="auth-minimal-title">Digite o código</h1>
      <p className="auth-minimal-lede">
        O código de teste é <strong className="num">{TEST_CODE}</strong>. Mostramos ele aqui de
        propósito, sem envio real.
        {alreadyVerified ? (
          <> Esta etapa já foi concluída neste navegador. Pode ver de novo ou seguir adiante.</>
        ) : null}
      </p>
      {!telefone ? (
        <p className="auth-prereq" role="note">
          Sem número na prévia ainda. <Link href="/login">Informe seu número</Link> para
          percorrer o fluxo completo, ou explore o código abaixo à vontade. Nada é enviado.
        </p>
      ) : null}
      <form className="auth-minimal-form" onSubmit={submit} aria-label="Verificar código de teste">
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
        <button type="submit" className="btn btn-plum auth-minimal-cta">
          Verificar e continuar
        </button>
        <p className="auth-minimal-back">
          {secondsLeft > 0 ? (
            <>Reenvio simulado em {secondsLeft}s</>
          ) : (
            <button type="button" className="link-btn" onClick={resend}>
              Reenviar código de teste
            </button>
          )}
        </p>
      </form>
    </div>
  );
}
