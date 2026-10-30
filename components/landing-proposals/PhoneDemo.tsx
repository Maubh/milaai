import IPhoneMockup from "@/components/IPhoneMockup";
import { LEGENDA_MOCKUP } from "@/lib/landing-proposals";

/** O mockup da landing atual, intacto, com o aviso de exemplo fora do componente. */
export default function PhoneDemo({ className = "" }: { className?: string }) {
  return (
    <div className={`lp-phone ${className}`.trim()}>
      <IPhoneMockup />
      <p className="lp-phone-legenda">{LEGENDA_MOCKUP}</p>
    </div>
  );
}
