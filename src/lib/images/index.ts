export {
  IMAGE_CONFIG,
  type VariantWidth,
} from './config';
export type {
  ImageVariants,
  UploadImageResult,
  UploadProgressCallback,
  ImageDeliveryProps,
} from './types';
export {
  buildVariantUrl,
  buildSrcSet,
  resolveImageDelivery,
  isOptimizedStorageUrl,
  extractBasePathFromUrl,
  PRODUCT_CARD_SIZES,
  PRODUCT_DETAIL_SIZES,
  HERO_PRODUCT_SIZES,
  CART_THUMB_SIZES,
} from './urls';
export {
  optimizeImageForUpload,
  formatBytesSaved,
  type ClientOptimizeResult,
} from './optimize-client';
