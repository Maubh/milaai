import Link from "next/link";
import "@/app/site.css";

export default function SiteHeader() {
  return (
    <header className="site-header site-header-minimal">
      <div className="wrap site-header-inner">
        <Link href="/" className="brand brand-small" aria-label="socIA — início">
          socIA
        </Link>
      </div>
    </header>
  );
}
