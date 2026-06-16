import { BRAND_ICON_SRC, BRAND_NAME } from '@/lib/brand';

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
  markClassName?: string;
  src?: string;
  framed?: boolean;
};

export function BrandLogo({
  size = 'md',
  showName = false,
  nameClassName = '',
  className = '',
  imageClassName = '',
  markClassName = '',
  src = BRAND_ICON_SRC,
  framed = false,
}: BrandLogoProps) {
  const px = SIZE_MAP[size];
  const markSizeClass = markClassName || SIZE_CLASS[size];
  const isResponsiveMark = Boolean(markClassName);

  const image = (
  // Native img keeps static /public brand marks pixel-stable in production (no optimizer variance).
  // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={showName ? '' : BRAND_NAME}
      aria-hidden={showName || undefined}
      width={isResponsiveMark ? undefined : px}
      height={isResponsiveMark ? undefined : px}
      decoding="async"
      className={`block h-full w-full max-h-full max-w-full object-contain ${imageClassName}`}
      style={
        isResponsiveMark || framed
          ? undefined
          : { width: px, height: px, minWidth: px, minHeight: px, maxWidth: px, maxHeight: px }
      }
    />
  );

  const mark = framed ? (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-luxury-black/40 p-1"
      style={{ width: px + 8, height: px + 8, minWidth: px + 8, minHeight: px + 8 }}
    >
      {image}
    </span>
  ) : (
    <span
      className={`relative block shrink-0 overflow-hidden ${markSizeClass}`}
      style={
        isResponsiveMark
          ? undefined
          : { width: px, height: px, minWidth: px, minHeight: px, maxWidth: px, maxHeight: px }
      }
    >
      {image}
    </span>
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
