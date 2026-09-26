"use client";

import Link from "next/link";
import type { ChatLine } from "@/lib/conversation";

interface Props {
  lines: ChatLine[];
  title?: string;
  showIntegrationLink?: boolean;
}

export default function ChatPanel({ lines, title = "mila · simulação", showIntegrationLink }: Props) {
  return (
    <div className="chat-panel" role="log" aria-label={`${title}: conversa simulada`} aria-live="polite">
      <div className="chat-panel-head">
        <span>{title}</span>
        <span className="chat-panel-seal">Simulação</span>
      </div>
      <div className="chat-panel-body">
        {lines.map((line, i) => (
          <p key={i} className={line.from === "lojista" ? "bubble out" : "bubble in"}>
            {line.text}
            {showIntegrationLink && line.from === "socia" && i === lines.length - 1 ? (
              <>
                {" "}
                <Link href="/integrations/bling">Ver tela de conexão do Bling</Link>
              </>
            ) : null}
          </p>
        ))}
      </div>
      <p className="chat-panel-foot">Simulação da conversa · nenhuma mensagem enviada</p>
    </div>
  );
}
