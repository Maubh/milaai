"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SYSTEM_VERSION, hasUnreadRelease } from "@/lib/releases";
import "./release-updates.css";

const LAST_SEEN_KEY = "mila:last-seen-release:v1";
const SEEN_EVENT = "mila:release-seen";
export const RELEASES_PATH = "/workspace/novidades";

/**
 * Estado do destino Atualizações: versão atual e se há novidade não lida.
 * Visitar a página ou abrir o sino marca a versão como vista. Só uma versão
 * pública nova acende o aviso; acabamento (`internal`) não.
 */
export function useReleaseStatus() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(false);
  const active = pathname === RELEASES_PATH;

  useEffect(() => {
    try {
      if (active) {
        localStorage.setItem(LAST_SEEN_KEY, SYSTEM_VERSION);
        setUnread(false);
      } else {
        setUnread(hasUnreadRelease(localStorage.getItem(LAST_SEEN_KEY)));
      }
    } catch {
      // As notas continuam acessíveis quando o storage do navegador está bloqueado.
      setUnread(false);
    }
  }, [active]);

  // Várias instâncias do hook (sino, página) apagam o ponto juntas.
  useEffect(() => {
    const seen = () => setUnread(false);
    window.addEventListener(SEEN_EVENT, seen);
    return () => window.removeEventListener(SEEN_EVENT, seen);
  }, []);

  const markSeen = useCallback(() => {
    try {
      localStorage.setItem(LAST_SEEN_KEY, SYSTEM_VERSION);
    } catch {
      // Sem storage o ponto já não aparece.
    }
    setUnread(false);
    window.dispatchEvent(new Event(SEEN_EVENT));
  }, []);

  return {
    markSeen,
    unread,
    active,
    version: SYSTEM_VERSION,
    label: `Atualizações, versão ${SYSTEM_VERSION}${unread ? ", novidade não lida" : ""}`,
  };
}
