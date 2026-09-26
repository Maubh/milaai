type BrandLogoProps = {
  variant?: "mineral" | "ivory" | "white" | "black";
  className?: string;
  height?: number;
};

/** Wordmark SVG oficial (não recriar em Manrope). */
export default function BrandLogo({
  variant = "mineral",
  className = "brand-logo",
  height = 28,
}: BrandLogoProps) {
  const width = Math.round((height * 844) / 224);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={`/brand/vectors/wordmark-${variant}.svg`}
      alt="mila.ai"
      width={width}
      height={height}
      decoding="async"
    />
  );
}
