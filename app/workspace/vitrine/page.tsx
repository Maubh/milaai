import type { Metadata } from "next";
import { Suspense } from "react";
import VitrineLayoutView from "./VitrineLayoutView";

export const metadata: Metadata = {
  title: "Vitrine | mila",
  robots: { index: false, follow: false },
};

/** Layout da vitrine: a escolha (gravada na marca da loja) e a prévia dos três. */
export default function WorkspaceVitrinePage() {
  // useSearchParams (o ?template= vindo da galeria) pede um limite de Suspense.
  return (
    <Suspense fallback={<VitrineLayoutView pending />}>
      <VitrineLayoutView />
    </Suspense>
  );
}
