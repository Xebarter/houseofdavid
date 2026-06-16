import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import { Providers } from './providers';
import {
  BRAND_NAME,
  BRAND_TAGLINE,
  BRAND_OG_IMAGE,
  BRAND_THEME_COLOR,
  BRAND_BACKGROUND_COLOR,
} from '@/lib/brand';
import './globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const sans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const siteDescription = `${BRAND_TAGLINE} — discover artisanal perfumes and exclusive scents.`;

export const metadata: Metadata = {
  title: BRAND_NAME,
  description: siteDescription,
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    title: BRAND_NAME,
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    title: BRAND_NAME,
    description: siteDescription,
    type: 'website',
    images: [{ url: BRAND_OG_IMAGE, width: 512, height: 512, alt: BRAND_NAME }],
  },
  twitter: {
    card: 'summary',
    title: BRAND_NAME,
    description: siteDescription,
    images: [BRAND_OG_IMAGE],
  },
  other: {
    'msapplication-TileColor': BRAND_BACKGROUND_COLOR,
  },
};

export const viewport: Viewport = {
  themeColor: BRAND_THEME_COLOR,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <body
        className="font-sans antialiased"
        suppressHydrationWarning
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
