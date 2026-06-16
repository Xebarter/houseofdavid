import type { Metadata } from 'next';
import { BRAND_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Collections | ${BRAND_NAME}`,
  description:
    `Explore our complete catalog of luxury fragrances — woody, oriental, oud, fresh, and signature compositions for the discerning gentleman.`,
};

export default function CollectionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
