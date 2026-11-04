"use client";

import type { ChatLine } from "@/lib/conversation";

interface Props {
  lines: ChatLine[];
  title?: string;
}

export default function ChatPanel({ lines, title = "mila · simulação" }: Props) {
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
          </p>
        ))}
      </div>
      <p className="chat-panel-foot">Simulação da conversa · nenhuma mensagem enviada</p>
    </div>
  );
}
