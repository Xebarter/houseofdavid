import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Story | House of David',
  description:
    'Discover the heritage, craftsmanship, and philosophy behind House of David — luxury fragrances for the discerning gentleman since 1995.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
