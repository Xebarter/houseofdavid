export const IMAGE_CONFIG = {
  /** Max raw file size before client optimization rejects */
  maxInputBytes: 25 * 1024 * 1024,
  /** Max size after client optimization */
  maxOptimizedBytes: 6 * 1024 * 1024,
  /** Longest edge cap before upload */
  maxDimension: 2400,
  /** Client-side pre-upload compression */
  clientWebpQuality: 0.86,
  clientAvifQuality: 0.68,
  /** Responsive widths generated on server */
  variantWidths: [200, 480, 960, 1280, 1920] as const,
  thumbWidth: 200,
  /** Server encoding quality */
  avifQuality: 54,
  webpQuality: 84,
  avifEffort: 5,
  placeholderWidth: 24,
  placeholderQuality: 22,
  cacheControl: 'public, max-age=31536000, immutable',
  storagePrefix: 'perfume-images',
} as const;

export type VariantWidth = (typeof IMAGE_CONFIG.variantWidths)[number];
