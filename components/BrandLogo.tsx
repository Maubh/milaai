type BrandLogoProps = {
  variant?: "mineral" | "ivory" | "white" | "black";
  className?: string;
  height?: number;
  /** Pass "" when the parent already names the brand (e.g. aria-label on Link). */
  alt?: string;
};

/** Wordmark SVG oficial (não recriar em Manrope). */
export default function BrandLogo({
  variant = "mineral",
  className = "brand-logo",
  height = 28,
  alt = "mila.ai",
}: BrandLogoProps) {
  const width = Math.round((height * 844) / 224);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={`/brand/vectors/wordmark-${variant}.svg`}
      alt={alt}
      width={width}
      height={height}
      decoding="async"
    />
  );
}
