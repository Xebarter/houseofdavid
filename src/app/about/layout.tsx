import type { Metadata } from 'next';
import { BRAND_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Our Story | ${BRAND_NAME}`,
  description:
    `Discover the heritage, craftsmanship, and philosophy behind ${BRAND_NAME} — luxury fragrances for the discerning gentleman since 1995.`,
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
