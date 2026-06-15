import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collections | House of David',
  description:
    'Explore our complete catalog of luxury fragrances — woody, oriental, oud, fresh, and signature compositions for the discerning gentleman.',
};

export default function CollectionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
