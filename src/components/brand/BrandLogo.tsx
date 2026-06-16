import Image from 'next/image';
import { BRAND_LOGO_SRC, BRAND_NAME } from '@/lib/brand';

const SIZE_MAP = {
  sm: 28,
  md: 36,
  lg: 48,
} as const;

type BrandLogoProps = {
  size?: keyof typeof SIZE_MAP;
  showName?: boolean;
  nameClassName?: string;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  size = 'md',
  showName = false,
  nameClassName = '',
  className = '',
  priority = false,
}: BrandLogoProps) {
  const px = SIZE_MAP[size];

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src={BRAND_LOGO_SRC}
        alt={BRAND_NAME}
        width={px}
        height={px}
        priority={priority}
        className="shrink-0 object-contain"
      />
      {showName ? (
        <span
          className={`font-display font-medium tracking-wide text-luxury-cream ${nameClassName}`}
        >
          {BRAND_NAME}
        </span>
      ) : null}
    </span>
  );
}
