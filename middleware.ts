import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { needsPublicHttps, publicSiteUrl } from "@/lib/public-site-url";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const { pathname, search } = url;
  const host = req.headers.get("host");

  // TLS ends at Cloudflare. Redirect public HTTP without looping on the HTTP
  // origin leg; local container liveness is deliberately outside this rule.
  if (needsPublicHttps(host, req.headers.get("x-forwarded-proto"))) {
    return NextResponse.redirect(publicSiteUrl(host, pathname, search)!, 308);
  }

  // Keep the previous middleware exclusions after HTTPS enforcement, so assets
  // also keep the public HTTP -> HTTPS contract without changing their routing.
  if (pathname.startsWith("/_next/static") || pathname.startsWith("/_next/image") || pathname.startsWith("/favicon.ico") || /\.(?:svg|png|jpg|jpeg|gif|webp|ico)/.test(pathname)) {
    return NextResponse.next();
  }

  // 1. Sanitiza URLs que chegam com asteriscos ou pontuação colada de markdown (ex: WhatsApp)
  // Exemplo: /workspace/integracoes* -> /workspace/integracoes
  if (/[*_]+$/.test(pathname) || pathname.includes("*")) {
    const cleanPath = pathname.replace(/[*_]+/g, "");
    const destination = publicSiteUrl(host, cleanPath || "/", search) ?? new URL(`${cleanPath || "/"}${search}`, req.url);
    return NextResponse.redirect(destination, 308);
  }

  // 2. Se o request vier pelo subdomínio vitrine.milaai.com.br
  const hostname = req.headers.get("host") || "";
  if (hostname.startsWith("vitrine.") || hostname.includes("vitrine.localhost")) {
    // Evitar loop se já estiver em /vitrine ou arquivos estáticos
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/vitrine") ||
      pathname.includes(".")
    ) {
      return NextResponse.next();
    }

    // Reescreve internamente /{slugLoja}/{slugColecao} para /vitrine/{slugLoja}/{slugColecao}
    url.pathname = `/vitrine${pathname}`;
    return NextResponse.rewrite(url);
  }

  // 3. A porta do workspace (layout) não recebe o caminho pedido; sem ele, o
  // login devolveria a lojista ao início em vez de, por ex., às integrações.
  // Sobrescreve qualquer valor vindo do cliente; o destino ainda passa pela
  // lista fechada de `pos-login`.
  if (pathname.startsWith("/workspace")) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-mila-path", pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
