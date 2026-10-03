import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // Se o request vier pelo subdomínio vitrine.milaai.com.br
  if (hostname.startsWith("vitrine.") || hostname.includes("vitrine.localhost")) {
    const pathname = url.pathname;

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

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static files with extensions (e.g. .svg, .png, .jpg, .ico)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};
