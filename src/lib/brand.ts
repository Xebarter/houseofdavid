export const BRAND_NAME = 'House of David';
export const BRAND_TAGLINE = 'Luxury fragrance collection';
export const BRAND_EMAIL = 'david@houseofdavid.com';
export const BRAND_PHONE_DISPLAY = '+256 701 071 332';
export const BRAND_PHONE_TEL = '+256701071332';
export const BRAND_LOCATION = 'Luthuri Ave, Bugolobi, Kampala, Uganda';
export const BRAND_HERO_HEADLINE = 'The Art of Masculine Presence';
export const BRAND_HERO_SUBLINE =
  'Rare compositions for the discerning gentleman — crafted with precision, worn with intention.';

export const BRAND_THEME_COLOR = '#080808';
export const BRAND_BACKGROUND_COLOR = '#080808';

/** Brand mark for UI (header, footer, auth) — lightweight PNG derived from favicon set */
export const BRAND_ICON_SRC = '/favicon-96x96.png';

/** Default logo in storefront components */
export const BRAND_LOGO_SRC = BRAND_ICON_SRC;

/** Higher-resolution mark for admin sidebar and framed contexts */
export const BRAND_SIDEBAR_LOGO_SRC = '/web-app-manifest-192x192.png';

/** Open Graph / social sharing */
export const BRAND_OG_IMAGE = '/web-app-manifest-512x512.png';

/** Browser tab and PWA icon paths */
export const BRAND_FAVICON = {
  ico: '/favicon.ico',
  svg: '/favicon.svg',
  png96: '/favicon-96x96.png',
  apple: '/apple-touch-icon.png',
} as const;

export const BRAND_PWA_ICONS = [
  { src: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
  { src: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' },
] as const;
