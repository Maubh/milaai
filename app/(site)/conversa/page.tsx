"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import { SCRIPTED_PROMPTS, type ChatLine } from "@/lib/conversation";

function SimulatorInner() {
  const params = useSearchParams();
  const [activeId, setActiveId] = useState<string>(SCRIPTED_PROMPTS[0].id);
  const [customNote, setCustomNote] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = params.get("pergunta");
    if (q && SCRIPTED_PROMPTS.some((p) => p.id === q)) {
      setActiveId(q);
      setCustomNote(null);
    }
  }, [params]);

  const active = SCRIPTED_PROMPTS.find((p) => p.id === activeId) ?? SCRIPTED_PROMPTS[0];
  const lines: ChatLine[] = customNote
    ? [...active.reply, { from: "socia", text: customNote }]
    : active.reply;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeId, customNote]);

  function askCustom() {
    setCustomNote(
      "O envio livre é limitado a sugestões nesta simulação. Não finjo ser uma IA generativa. Escolha uma das perguntas roteirizadas para ver uma resposta completa com dados de exemplo.",
    );
  }

  return (
    <div className="wrap conversa-wrap">
      <p className="tag">Simulação da conversa · nenhuma mensagem enviada</p>
      <h1 className="conversa-title">Conversa simulada com a <span className="mila-highlight">mila</span></h1>
      <p className="conversa-lede">
        Escolha uma pergunta do roteiro e leia a resposta com dados de exemplo. O Raio-X do Preço aparece
        dentro da conversa: custo, taxa, embalagem, rateio e margem explicados por mensagem.
      </p>

      <div className="conversa-grid">
        <div className="prompt-list" role="group" aria-label="Perguntas do roteiro">
          {SCRIPTED_PROMPTS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={p.id === activeId ? "prompt-btn active" : "prompt-btn"}
              aria-pressed={p.id === activeId}
              onClick={() => {
                setActiveId(p.id);
                setCustomNote(null);
              }}
            >
              {p.short}
            </button>
          ))}
          <button type="button" className="prompt-btn custom" onClick={askCustom}>
            Escrever outra pergunta…
          </button>
        </div>

        <div>
          <ChatPanel lines={lines} showIntegrationLink={activeId === "integracao"} />
          <div ref={bottomRef} />
          <div className="work-actions">
            <Link href="/workspace" className="btn btn-plum btn-sm">
              Ajustar custos no workspace
            </Link>
            <Link href="/onboarding/connect" className="btn btn-ghost btn-sm">
              Voltar à conexão
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConversaPage() {
  return (
    <Suspense fallback={<div className="wrap conversa-wrap"><p>Carregando simulação…</p></div>}>
      <SimulatorInner />
    </Suspense>
  );
}
