"use client";

import { useEffect, useState } from "react";

type Props = {
  value: string;
  size?: number;
  className?: string;
  alt?: string;
};

/** Client-side QR as data URL — no third-party image host. */
export default function LocalQr({ value, size = 220, className, alt }: Props) {
  const [src, setSrc] = useState<string>("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSrc("");
    setFailed(false);
    if (!value) return;

    (async () => {
      try {
        const QR = await import("qrcode");
        const dataUrl = await QR.toDataURL(value, {
          width: size,
          margin: 2,
          errorCorrectionLevel: "M",
        });
        if (!cancelled) setSrc(dataUrl);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (failed) {
    return (
      <div className={className} role="img" aria-label="Não foi possível gerar o QR">
        <span aria-hidden="true">QR</span>
      </div>
    );
  }

  if (!src) {
    return (
      <div className={className} role="status" aria-label="Gerando QR">
        <span aria-hidden="true">…</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} src={src} width={size} height={size} alt={alt || "QR Code"} />
  );
}
