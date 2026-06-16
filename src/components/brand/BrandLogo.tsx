import Image from 'next/image';
import { BRAND_LOGO_SRC, BRAND_NAME } from '@/lib/brand';

const SIZE_MAP = {
  sm: 28,
  md: 36,
  lg: 48,
} as const;

const SIZE_CLASS = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
} as const;

type BrandLogoProps = {
  size?: keyof typeof SIZE_MAP;
  showName?: boolean;
  nameClassName?: string;
  className?: string;
  imageClassName?: string;
  src?: string;
  framed?: boolean;
  priority?: boolean;
};

export function BrandLogo({
  size = 'md',
  showName = false,
  nameClassName = '',
  className = '',
  imageClassName = '',
  src = BRAND_LOGO_SRC,
  framed = false,
  priority = false,
}: BrandLogoProps) {
  const px = SIZE_MAP[size];

  const image = (
    <Image
      src={src}
      alt={BRAND_NAME}
      width={px * 2}
      height={px * 2}
      priority={priority}
      className={`shrink-0 object-contain ${framed ? 'h-full w-full' : SIZE_CLASS[size]} ${imageClassName}`}
    />
  );

  return (
    <span className={`inline-flex items-center gap-2.5 min-w-0 ${className}`}>
      {framed ? (
        <span
          className="flex shrink-0 items-center justify-center rounded-lg border border-white/10 bg-luxury-black/50 p-1.5"
          style={{ width: px + 12, height: px + 12 }}
        >
          {image}
        </span>
      ) : (
        image
      )}
      {showName ? (
        <span
          className={`min-w-0 truncate font-display font-medium tracking-wide text-luxury-cream ${nameClassName}`}
        >
          {BRAND_NAME}
        </span>
      ) : null}
    </span>
  );
}
