'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BRAND_NAME,
  BRAND_EMAIL,
  BRAND_PHONE_DISPLAY,
  BRAND_PHONE_TEL,
  BRAND_LOCATION,
} from '@/lib/brand';
import { BrandLogo } from '@/components/brand/BrandLogo';

const socialLinks = [
  { name: 'Facebook' as const, url: 'https://facebook.com/aletheaindustrials' },
  { name: 'Instagram' as const, url: 'https://instagram.com/aletheaindustrials' },
  { name: 'X' as const, url: 'https://x.com/aletheaindustrials' },
  { name: 'WhatsApp' as const, url: '' },
  { name: 'TikTok' as const, url: 'https://tiktok.com/@aletheaindustrials' },
] as const;

const iconClass = 'w-[15px] h-[15px] transition-colors duration-500';

function FooterSocialIcon({ name }: { name: (typeof socialLinks)[number]['name'] }) {
  switch (name) {
    case 'Facebook':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className={iconClass} aria-hidden>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'Instagram':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className={iconClass} aria-hidden>
          <rect x="2.5" y="2.5" width="19" height="19" rx="5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.25" cy="6.75" r="0.75" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'X':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-[13px] h-[13px] transition-colors duration-500" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'WhatsApp':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className={iconClass} aria-hidden>
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'TikTok':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className={iconClass} aria-hidden>
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

export function Footer() {
  const router = useRouter();
  const whatsappLink = `https://wa.me/${BRAND_PHONE_TEL.replace(/\+/g, '')}?text=Hello%20${encodeURIComponent(BRAND_NAME)}!%20I'd%20like%20to%20inquire%20about%20your%20fragrances`;

  const links = socialLinks.map((link) =>
    link.name === 'WhatsApp' ? { ...link, url: whatsappLink } : link
  );

  return (
    <footer className="bg-luxury-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12 py-12 sm:py-16">
          <div className="min-w-0">
            <Link href="/" className="inline-flex max-w-full min-w-0 hover:opacity-90 transition-opacity mb-4">
              <BrandLogo
                size="sm"
                showName
                className="min-w-0 sm:hidden"
                nameClassName="text-base leading-tight"
              />
              <BrandLogo
                size="lg"
                showName
                className="hidden min-w-0 sm:inline-flex sm:gap-3"
                nameClassName="text-xl sm:text-2xl"
              />
            </Link>
            <p className="text-sm text-luxury-smoke font-light leading-relaxed max-w-xs">
              Curating exceptional fragrances for the modern gentleman since 1995.
            </p>
            <div className="mt-10">
              <p className="luxury-label mb-4">Connect</p>
              <div className="flex flex-wrap items-center gap-2">
                {links.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow ${BRAND_NAME} on ${link.name}`}
                    className="group relative flex h-11 w-11 items-center justify-center border border-white/[0.08] bg-white/[0.02] text-luxury-smoke/65 transition-all duration-500 ease-out hover:border-luxury-gold/50 hover:bg-luxury-gold/[0.06] hover:text-luxury-gold hover:shadow-[0_0_24px_rgba(201,169,98,0.1)]"
                  >
                    <span
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      aria-hidden
                      style={{
                        background:
                          'linear-gradient(135deg, transparent 40%, rgba(201,169,98,0.08) 50%, transparent 60%)',
                      }}
                    />
                    <FooterSocialIcon name={link.name} />
                  </a>
                ))}
              </div>
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
