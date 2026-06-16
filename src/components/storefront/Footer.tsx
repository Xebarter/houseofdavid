'use client';

import { useRouter } from 'next/navigation';
import { BRAND_NAME, BRAND_EMAIL, BRAND_PHONE_DISPLAY, BRAND_PHONE_TEL, BRAND_LOCATION } from '@/lib/brand';
import { BrandLogo } from '@/components/brand/BrandLogo';

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: 'w-[17px] h-[17px]',
  'aria-hidden': true,
};

function FooterSocialIcon({ name }: { name: string }) {
  switch (name) {
    case 'Facebook':
      return (
        <svg {...iconProps}>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );
    case 'Instagram':
      return (
        <svg {...iconProps}>
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <path d="M17.5 6.5h.01" />
        </svg>
      );
    case 'X':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-[15px] h-[15px]" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'WhatsApp':
      return (
        <svg {...iconProps}>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      );
    case 'TikTok':
      return (
        <svg {...iconProps}>
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
      );
    default:
      return null;
  }
}

export function Footer() {
  const router = useRouter();
  const whatsappLink = `https://wa.me/${BRAND_PHONE_TEL.replace(/\+/g, '')}?text=Hello%20${encodeURIComponent(BRAND_NAME)}!%20I'd%20like%20to%20inquire%20about%20your%20fragrances`;

  const socialLinks = [
    { name: 'Facebook', url: 'https://facebook.com/aletheaindustrials' },
    { name: 'Instagram', url: 'https://instagram.com/aletheaindustrials' },
    { name: 'X', url: 'https://x.com/aletheaindustrials' },
    { name: 'WhatsApp', url: whatsappLink },
    { name: 'TikTok', url: 'https://tiktok.com/@aletheaindustrials' },
  ];

  return (
    <footer className="bg-luxury-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-16">
          <div>
            <BrandLogo size="lg" showName nameClassName="text-2xl" className="mb-4" />
            <p className="text-sm text-luxury-smoke font-light leading-relaxed max-w-xs">
              Curating exceptional fragrances for the modern gentleman since 1995.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 mt-8">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow ${BRAND_NAME} on ${link.name}`}
                  className="group flex h-10 w-10 items-center justify-center border border-white/10 text-luxury-smoke/75 transition-all duration-500 hover:border-luxury-gold/50 hover:text-luxury-gold hover:bg-luxury-gold/[0.04]"
                >
                  <FooterSocialIcon name={link.name} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="luxury-label mb-6">Discover</p>
            <ul className="space-y-3">
              {[
                { label: 'Collections', action: () => router.push('/collections') },
                { label: 'Journal', action: () => router.push('/journal') },
                { label: 'Our Story', action: () => router.push('/about') },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={item.action}
                    className="text-sm text-luxury-smoke hover:text-luxury-cream transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="luxury-label mb-6">Contact</p>
            <div className="space-y-4 text-sm text-luxury-smoke font-light">
              <div>
                <p className="text-[10px] uppercase tracking-wideish text-luxury-gold-muted mb-1">Email</p>
                <a href={`mailto:${BRAND_EMAIL}`} className="hover:text-luxury-cream transition-colors">
                  {BRAND_EMAIL}
                </a>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wideish text-luxury-gold-muted mb-1">Location</p>
                <p>{BRAND_LOCATION}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wideish text-luxury-gold-muted mb-1">Phone</p>
                <a href={`tel:${BRAND_PHONE_TEL}`} className="hover:text-luxury-cream transition-colors">
                  {BRAND_PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="luxury-divider" />

        <div className="py-8 text-center">
          <p className="text-xs text-luxury-smoke tracking-wideish">
            © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
