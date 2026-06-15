export interface ImageVariants {
  /** Content hash — used as storage folder id */
  id: string;
  width: number;
  height: number;
  aspectRatio: number;
  /** Tiny blur-up data URL for placeholders */
  placeholder: string;
  /** Canonical URL (1280w WebP or closest) */
  primary: string;
  /** Available widths on CDN */
  widths: number[];
  /** Base public URL without width/format suffix */
  basePath: string;
}

export interface UploadImageResult {
  url: string;
  variants: ImageVariants;
  deduplicated: boolean;
}

export type UploadProgressCallback = (
  percent: number,
  phase?: 'optimizing' | 'uploading' | 'processing' | 'done'
) => void;

export interface ImageDeliveryProps {
  src: string;
  variants?: ImageVariants | null;
  srcSetAvif?: string;
  srcSetWebp?: string;
  srcSetFallback?: string;
  sizes?: string;
  width?: number;
  height?: number;
  placeholder?: string;
}
