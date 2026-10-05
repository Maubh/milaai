"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import IntegrationConnectionLayout from "./IntegrationConnectionLayout";

interface Props {
  token: string;
  onTokenChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  connecting: boolean;
  connected: boolean;
  error: string;
}

export default function NotionConnection({ token, onTokenChange, onSubmit, connecting, connected, error }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <IntegrationConnectionLayout
      name="Notion"
      title={connected ? "Seu Notion está conectado." : "Conectar seu Notion"}
      description={connected
        ? "Agora, volte à Mila para escolher a base que receberá seus dados."
        : "Seu caderno de fornecedores e suas notas de compra, organizados na base que você escolher."}
      footer="Você também pode salvar seu caderno em uma planilha no Google Drive."
      brand={<>
          <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor" aria-hidden="true">
            <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
          </svg>
          <span>Notion</span>
      </>}
    >

        {connected ? (
          <div className="notion-connect-panel notion-connect-success" role="status">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="m7 12 3 3 7-7" /></svg>
            <h2>Conexão confirmada</h2>
            <p>A Mila validou seu token com o Notion. Na conversa, ela vai ajudar você a escolher uma das bases compartilhadas.</p>
            <Link className="notion-connect-submit" href="/conversa">Voltar à conversa com a Mila</Link>
          </div>
        ) : (
          <form className="notion-connect-panel" onSubmit={onSubmit} aria-busy={connecting}>
            <h2>Adicione sua conexão</h2>
            <p className="notion-connect-panel-intro">Já tem uma conexão no Notion? Cole o token abaixo.</p>

            <details className="notion-connect-help">
              <summary>Como obter meu token?</summary>
              <ol>
                <li>Abra <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer">as conexões do Notion</a> e crie uma conexão interna no seu espaço de trabalho. Você precisa ser proprietário desse espaço.</li>
                <li>Copie o token da conexão. Ele funciona como uma chave de acesso.</li>
                <li>Abra a base que deseja usar no Notion. No menu de opções (•••), em <strong>Conexões</strong>, adicione a conexão que você criou.</li>
              </ol>
              <p>A Mila grava na base que você indicar; ela não cria uma base nova.</p>
              <a href="https://www.notion.com/help/create-integrations-with-the-notion-api" target="_blank" rel="noopener noreferrer">Ver instruções do Notion</a>
            </details>

            <label className="notion-connect-label" htmlFor="notion-token">Token da conexão</label>
            <div className="notion-connect-input-wrap">
              <input id="notion-token" type={visible ? "text" : "password"} value={token} onChange={(event) => onTokenChange(event.target.value)} placeholder="Cole seu token do Notion" autoComplete="off" spellCheck={false} autoCapitalize="none" required disabled={connecting} aria-describedby={error ? "notion-token-note notion-connect-error" : "notion-token-note"} />
              <button type="button" onClick={() => setVisible(!visible)} aria-controls="notion-token" aria-pressed={visible}>{visible ? "Ocultar" : "Mostrar"}</button>
            </div>
            <p id="notion-token-note" className="notion-connect-note">A conexão permite acesso apenas às bases de dados que você compartilhar com ela.</p>

            {error ? <div id="notion-connect-error" className="notion-connect-error" role="alert"><p>{error}</p>{/telefone|sessão/.test(error) ? <Link href="/login">Entrar na Mila</Link> : null}</div> : null}

            <button className="notion-connect-submit" type="submit" disabled={connecting || !token.trim()}>
              {connecting ? "Validando conexão…" : "Conectar Notion"}
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>
            </button>
            <p className="notion-connect-validation">A Mila confere o token com o Notion antes de confirmar a conexão.</p>
          </form>
        )}
    </IntegrationConnectionLayout>
  );
}
