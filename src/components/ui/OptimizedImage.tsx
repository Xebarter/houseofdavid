'use client';

import { useState } from 'react';
import type { ImageVariants } from '@/lib/images/types';
import { resolveImageDelivery } from '@/lib/images/urls';

type OptimizedImageProps = {
  src: string;
  alt: string;
  variants?: ImageVariants | null;
  sizes?: string;
  className?: string;
  /** Reserve layout space — pass aspect ratio e.g. "3/4" or numeric */
  aspectRatio?: string | number;
  width?: number;
  height?: number;
  priority?: boolean;
  fill?: boolean;
  objectFit?: 'cover' | 'contain';
};

export function OptimizedImage({
  src,
  alt,
  variants,
  sizes = '100vw',
  className = '',
  aspectRatio,
  width,
  height,
  priority = false,
  fill = false,
  objectFit = 'cover',
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const delivery = resolveImageDelivery(src, variants);
  const placeholder = delivery.placeholder;
  const resolvedWidth = width ?? delivery.width;
  const resolvedHeight = height ?? delivery.height;

  const aspectStyle =
    aspectRatio !== undefined
      ? {
          aspectRatio: typeof aspectRatio === 'number' ? String(aspectRatio) : aspectRatio,
        }
      : resolvedWidth && resolvedHeight
        ? { aspectRatio: `${resolvedWidth} / ${resolvedHeight}` }
        : undefined;

  const wrapperClass = fill
    ? `relative overflow-hidden ${className}`
    : `relative overflow-hidden ${className}`;

  const imgClass = fill
    ? `absolute inset-0 w-full h-full object-${objectFit} transition-opacity duration-500 ${
        loaded ? 'opacity-100' : 'opacity-0'
      }`
    : `w-full h-full object-${objectFit} transition-opacity duration-500 ${
        loaded ? 'opacity-100' : 'opacity-0'
      }`;

  const hasResponsive = Boolean(delivery.srcSetAvif && delivery.srcSetWebp);

  return (
    <div className={wrapperClass} style={aspectStyle}>
      {placeholder && !loaded && (
        <img
          src={placeholder}
          alt=""
          aria-hidden
          className={
            fill
              ? 'absolute inset-0 w-full h-full object-cover scale-110 blur-lg'
              : 'absolute inset-0 w-full h-full object-cover scale-110 blur-lg'
          }
        />
      )}
      {!placeholder && !loaded && (
        <div
          className="absolute inset-0 bg-luxury-charcoal animate-pulse"
          aria-hidden
        />
      )}
      {hasResponsive ? (
        <picture>
          <source type="image/avif" srcSet={delivery.srcSetAvif} sizes={sizes} />
          <source type="image/webp" srcSet={delivery.srcSetWebp} sizes={sizes} />
          <img
            src={delivery.src}
            alt={alt}
            width={resolvedWidth}
            height={resolvedHeight}
            sizes={sizes}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            fetchPriority={priority ? 'high' : 'auto'}
            onLoad={() => setLoaded(true)}
            className={imgClass}
          />
        </picture>
      ) : (
        <img
          src={delivery.src}
          alt={alt}
          width={resolvedWidth}
          height={resolvedHeight}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          className={imgClass}
        />
      )}
    </div>
  );
}
