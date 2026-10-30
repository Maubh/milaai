/** Public origins stay HTTPS even though cloudflared reaches Next over HTTP. */
export function publicSiteUrl(
  hostHeader: string | null,
  pathname: string,
  search: string = "",
): URL | null {
  const host = (hostHeader ?? "").trim().toLowerCase().split(":")[0];
  if (host !== "milaai.com.br" && host !== "www.milaai.com.br" && host !== "vitrine.milaai.com.br") return null;
  const url = new URL(`https://${host}`);
  // Assign separately: a path beginning with // must never replace the origin.
  url.pathname = pathname;
  url.search = search;
  return url;
}

export function needsPublicHttps(hostHeader: string | null, forwardedProto: string | null): boolean {
  if (!publicSiteUrl(hostHeader, "/")) return false;
  return (forwardedProto ?? "").split(",")[0].trim().toLowerCase() !== "https";
}
