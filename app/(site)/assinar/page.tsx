"use client";

import { useEffect } from "react";
import { guardarDestinoPosLogin } from "@/lib/pos-login";

/** Link de assinatura da Mila: leva à tela de plano, passando pelo login se preciso. */
export default function AssinarPage() {
  useEffect(() => {
    guardarDestinoPosLogin("/workspace/plano");
    window.location.replace("/workspace/plano");
  }, []);

  return (
    <main className="work-wrap">
      <p>
        Abrindo a tela de planos… Se nada acontecer, <a href="/workspace/plano">clique aqui</a>.
      </p>
    </main>
  );
}
