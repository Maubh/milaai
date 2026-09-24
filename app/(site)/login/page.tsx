"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, saveSession, type DemoSession } from "@/lib/session";
import "../../site.css";
import "./auth.css";

export default function LoginPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [existing, setExisting] = useState<DemoSession | null>(null);

  useEffect(() => {
    setExisting(getSession());
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (nome.trim().length < 2) {
      setErro("Conte como podemos chamar você — duas letras já bastam.");
      return;
    }
    setErro(null);
    saveSession(nome);
    router.push("/workspace");
  }

  return (
    <div className="wrap auth-wrap">
      <div className="auth-grid">
        <div>
          <p className="tag">Demonstração · sem senha</p>
          <h1 className="display auth-title">Entre na demonstração</h1>
          <p className="auth-lede">
            Diga seu nome para personalizar a sessão de demonstração. Não há código por mensagem, nem
            conta real: é só para chamar você pelo nome no workspace.
          </p>
          <ul className="auth-points">
            <li>Nada é enviado para servidores ou WhatsApp.</li>
            <li>Só o nome fica salvo neste navegador.</li>
            <li>Você pode sair e apagar tudo quando quiser.</li>
          </ul>
        </div>
        <form className="card auth-card" onSubmit={submit} aria-label="Entrar na demonstração">
          <div className="field">
            <label htmlFor="demo-nome">Como podemos chamar você?</label>
            <input
              id="demo-nome"
              name="nome"
              autoComplete="given-name"
              placeholder="Ex.: Marina"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          {erro ? (
            <p role="alert" className="calc-error">
              {erro}
            </p>
          ) : null}
          <button type="submit" className="btn btn-plum" style={{ width: "100%" }}>
            Entrar na demonstração
          </button>
          {existing ? (
            <p className="auth-existing">
              Sessão de exemplo ativa como <strong>{existing.nome}</strong>.{" "}
              <button type="button" className="link-btn" onClick={() => router.push("/workspace")}>
                Continuar
              </button>
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
