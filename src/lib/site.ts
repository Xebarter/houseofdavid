const PRODUCTION_SITE_URL = 'https://houseofdavid-woad.vercel.app';

/** Canonical public site URL (no trailing slash). */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  const vercel = process.env.VERCEL_URL?.replace(/\/$/, '');
  if (vercel) return `https://${vercel}`;

  if (process.env.NODE_ENV === 'production') return PRODUCTION_SITE_URL;

  return 'http://localhost:3000';
}

export const SITE_URL = getSiteUrl();
