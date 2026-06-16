import Image from 'next/image';
import { BRAND_LOGO_SRC, BRAND_NAME } from '@/lib/brand';

const SIZE_MAP = {
  sm: 32,
  md: 40,
  lg: 48,
} as const;

const SIZE_CLASS = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
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
      alt={showName ? '' : BRAND_NAME}
      aria-hidden={showName || undefined}
      width={px}
      height={px}
      priority={priority}
      className={`block shrink-0 object-contain ${framed ? 'h-full w-full' : SIZE_CLASS[size]} ${imageClassName}`}
    />
  );

  const mark = framed ? (
    <span
      className="flex shrink-0 items-center justify-center rounded-lg border border-white/10 bg-luxury-black/40 p-1"
      style={{ width: px + 8, height: px + 8 }}
    >
      {image}
    </span>
  ) : (
    image
  );

  return (
    <span className={`inline-flex max-w-full min-w-0 items-center gap-2 sm:gap-2.5 ${className}`}>
      {mark}
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
