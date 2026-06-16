'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BRAND_NAME, BRAND_EMAIL, BRAND_HERO_SUBLINE, BRAND_PHONE_DISPLAY, BRAND_PHONE_TEL, BRAND_LOCATION } from '@/lib/brand';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { Cart } from '@/components/storefront/Cart';
import { Checkout } from '@/components/storefront/Checkout';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1600224768867-74b5992a1da8?auto=format&fit=crop&w=2400&q=80';

const STORY_IMAGE =
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1600&q=80';

const ATELIER_IMAGE =
  'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1600&q=80';

const pillars = [
  {
    number: '01',
    title: 'Craft',
    description:
      'Each composition is developed over months — balancing rare oud, aged vetiver, and refined citrus in pursuit of depth and longevity.',
  },
  {
    number: '02',
    title: 'Character',
    description:
      'Our fragrances are designed for men who lead with quiet confidence. Bold without shouting. Memorable without excess.',
  },
  {
    number: '03',
    title: 'Presence',
    description:
      'A signature scent is an extension of identity. We create fragrances that linger in memory long after you have left the room.',
  },
];

const values = [
  {
    title: 'Rare Ingredients',
    description:
      'We source exceptional raw materials from Grasse to Oman — vetiver from Haiti, oud from sustainable plantations, and citrus pressed at peak harvest.',
  },
  {
    title: 'Master Perfumery',
    description:
      'Every formula passes through our in-house noses, refined through dozens of iterations before a single bottle reaches the shelf.',
  },
  {
    title: 'Intentional Luxury',
    description:
      'From weighted glass to archival-grade packaging, every detail is considered. Nothing is ornamental without purpose.',
  },
  {
    title: 'Responsible Sourcing',
    description:
      'Ethical partnerships, recyclable materials, and a commitment to reducing our footprint without compromising quality.',
  },
];

const timeline = [
  {
    year: '1995',
    title: 'The House is Founded',
    description:
      'House of David opens its first atelier in Paris with a singular vision: masculine fragrances of uncompromising quality.',
  },
  {
    year: '2003',
    title: 'Rue du Faubourg',
    description:
      'Our flagship boutique on Saint-Honoré becomes a destination for collectors and connoisseurs of fine perfumery.',
  },
  {
    year: '2010',
    title: 'Global Presence',
    description:
      'Expansion to New York, London, Tokyo, and Dubai — bringing our compositions to gentlemen across four continents.',
  },
  {
    year: '2018',
    title: 'Signature Collection',
    description:
      'Launch of our permanent signature line, developed entirely by our master perfumers in the Paris atelier.',
  },
  {
    year: '2022',
    title: 'Sustainable Future',
    description:
      'Carbon-neutral operations and a fully recyclable packaging initiative across the entire catalog.',
  },
  {
    year: 'Today',
    title: 'Continuing the Legacy',
    description:
      'Serving fragrance enthusiasts in over forty countries, with new compositions released each season.',
  },
];

const perfumers = [
  {
    name: 'Claude Dubois',
    role: 'Founder & Master Perfumer',
    bio: 'Four decades of experience in classical French perfumery. Claude established the house philosophy of restraint, depth, and lasting impression.',
  },
  {
    name: 'Isabelle Moreau',
    role: 'Head of Creation',
    bio: 'Isabelle bridges heritage technique with contemporary sensibility, leading the development of every new composition in our catalog.',
  },
  {
    name: 'Antoine Rousseau',
    role: 'Director of Sourcing',
    bio: 'Antoine travels the world to discover rare botanicals and build relationships with the finest ingredient producers on earth.',
  },
];

const sustainabilityPoints = [
  'Ethically sourced ingredients from certified sustainable farms',
  'Recyclable glass bottles and biodegradable outer packaging',
  'Carbon-neutral shipping on every order worldwide',
  'Partnerships with conservation organizations in ingredient regions',
];

export function AboutPage() {
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = () => {
    setShowCart(false);
    setShowCheckout(true);
  };

  return (
    <div className="min-h-screen bg-luxury-black">
      <Header onCartClick={() => setShowCart(true)} />

      <main className="pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/5">
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${HERO_IMAGE})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/85 via-luxury-black/70 to-luxury-black" />
            <div className="absolute inset-0 bg-gradient-to-r from-luxury-black/80 via-luxury-black/40 to-luxury-black/70" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 py-24 sm:py-32">
            <nav className="flex items-center gap-2 text-[11px] uppercase tracking-wideish text-luxury-smoke mb-8">
              <Link href="/" className="hover:text-luxury-cream transition-colors">
                Home
              </Link>
              <span className="text-luxury-gold-muted/50">/</span>
              <span className="text-luxury-cream/70">Our Story</span>
            </nav>

            <p className="luxury-label mb-4">{BRAND_NAME}</p>
            <h1 className="luxury-heading text-4xl sm:text-5xl md:text-6xl font-light leading-tight max-w-3xl mb-6">
              A Legacy of
              <span className="block italic text-luxury-gold-light">Masculine Elegance</span>
            </h1>
            <div className="luxury-divider max-w-xs mb-6" />
            <p className="text-base sm:text-lg text-luxury-cream/70 font-light max-w-2xl leading-relaxed">
              {BRAND_HERO_SUBLINE} Since 1995, we have pursued one ambition: to create fragrances
              worthy of the men who wear them.
            </p>
          </div>
        </section>

        {/* Origin story */}
        <section className="py-20 sm:py-28 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <p className="luxury-label mb-4">Our Origin</p>
                <h2 className="luxury-heading text-3xl sm:text-4xl font-light mb-6 leading-tight">
                  The Essence of Luxury
                </h2>
                <p className="text-sm text-luxury-cream/70 font-light leading-relaxed mb-5">
                  At {BRAND_NAME}, fragrance is more than a scent — it is an expression of
                  individuality, a memory held in glass, and a signature that defines who you are.
                  For nearly three decades, we have crafted compositions that capture the imagination
                  and elevate everyday moments.
                </p>
                <p className="text-sm text-luxury-cream/70 font-light leading-relaxed mb-8">
                  Our journey began in Paris, where our founder envisioned a house that would push
                  boundaries while honoring the traditions of French perfumery. That vision endures
                  in every bottle we release today.
                </p>
                <Link href="/collections" className="luxury-btn-primary inline-flex min-w-[200px]">
                  Explore Collections
                </Link>
              </div>
              <div className="relative aspect-[4/5] overflow-hidden border border-white/5">
                <img
                  src={STORY_IMAGE}
                  alt="House of David fragrance craftsmanship"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/40 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="py-20 sm:py-28 bg-luxury-charcoal border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="max-w-2xl mx-auto text-center mb-16 sm:mb-20">
              <p className="luxury-label mb-4">Philosophy</p>
              <h2 className="luxury-heading text-3xl sm:text-4xl font-light leading-tight">
                Where tradition meets
                <span className="block italic text-luxury-gold-light">modern masculinity</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-16">
              {pillars.map((pillar) => (
                <div key={pillar.number} className="group text-center md:text-left">
                  <span className="block text-luxury-gold/50 font-display text-4xl font-light mb-4">
                    {pillar.number}
                  </span>
                  <h3 className="luxury-heading text-2xl font-medium mb-4 tracking-wide">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-luxury-smoke leading-relaxed font-light">
                    {pillar.description}
                  </p>
                  <div className="mt-6 h-px w-12 bg-luxury-gold/30 mx-auto md:mx-0 group-hover:w-full transition-all duration-700" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 sm:py-28 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="luxury-label mb-4">Principles</p>
              <h2 className="luxury-heading text-3xl sm:text-4xl font-light mb-4">
                What We Stand For
              </h2>
              <p className="text-sm text-luxury-smoke font-light leading-relaxed">
                These principles guide everything we do — from the first note to the final bottle.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="border border-white/5 bg-luxury-charcoal/40 p-8 hover:border-luxury-gold/20 transition-colors duration-500"
                >
                  <h3 className="luxury-heading text-xl font-medium mb-3">{value.title}</h3>
                  <p className="text-sm text-luxury-cream/60 font-light leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 sm:py-28 bg-luxury-charcoal border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="luxury-label mb-4">Heritage</p>
              <h2 className="luxury-heading text-3xl sm:text-4xl font-light mb-4">Our Journey</h2>
              <p className="text-sm text-luxury-smoke font-light leading-relaxed">
                From a Parisian atelier to a globally recognized name in luxury perfumery.
              </p>
            </div>

            <div className="relative max-w-3xl mx-auto">
              <div className="absolute left-4 sm:left-1/2 sm:-translate-x-px top-0 bottom-0 w-px bg-luxury-gold/20" />
              <div className="space-y-10">
                {timeline.map((item, index) => (
                  <div
                    key={item.year}
                    className={`relative pl-12 sm:pl-0 sm:grid sm:grid-cols-2 sm:gap-8 sm:items-start ${
                      index % 2 === 0 ? '' : 'sm:direction-rtl'
                    }`}
                  >
                    <div
                      className={`absolute left-2.5 sm:left-1/2 sm:-translate-x-1/2 top-1.5 w-3 h-3 rounded-full border-2 border-luxury-gold bg-luxury-black z-10`}
                    />
                    <div className={index % 2 === 0 ? 'sm:text-right sm:pr-12' : 'sm:col-start-2 sm:pl-12'}>
                      <p className="luxury-label text-[10px] mb-2">{item.year}</p>
                      <h3 className="luxury-heading text-lg font-medium mb-2">{item.title}</h3>
                      <p className="text-sm text-luxury-cream/60 font-light leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Atelier */}
        <section className="py-20 sm:py-28 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="relative aspect-[16/10] overflow-hidden border border-white/5 order-2 lg:order-1">
                <img
                  src={ATELIER_IMAGE}
                  alt="Perfume atelier"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-luxury-black/30 to-transparent pointer-events-none" />
              </div>
              <div className="order-1 lg:order-2">
                <p className="luxury-label mb-4">The Atelier</p>
                <h2 className="luxury-heading text-3xl sm:text-4xl font-light mb-6 leading-tight">
                  Where Compositions Are Born
                </h2>
                <p className="text-sm text-luxury-cream/70 font-light leading-relaxed mb-8">
                  In our Paris atelier, master perfumers work in small batches — evaluating, refining,
                  and aging each formula until it achieves the depth and sillage that defines a{' '}
                  {BRAND_NAME} fragrance. No formula is rushed. No compromise is made.
                </p>
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5">
                  {[
                    { stat: '30+', label: 'Years of craft' },
                    { stat: '40+', label: 'Countries served' },
                    { stat: '100%', label: 'In-house creation' },
                  ].map(({ stat, label }) => (
                    <div key={label}>
                      <p className="text-2xl text-luxury-cream font-light">{stat}</p>
                      <p className="text-[10px] uppercase tracking-wideish text-luxury-gold-muted mt-1">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Perfumers */}
        <section className="py-20 sm:py-28 bg-luxury-charcoal border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="luxury-label mb-4">The Noses</p>
              <h2 className="luxury-heading text-3xl sm:text-4xl font-light mb-4">
                Master Perfumers
              </h2>
              <p className="text-sm text-luxury-smoke font-light leading-relaxed">
                Behind every {BRAND_NAME} fragrance is a craftsman with decades of expertise.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {perfumers.map((person) => (
                <div
                  key={person.name}
                  className="border border-white/5 bg-luxury-black/40 p-8 hover:border-luxury-gold/20 transition-colors duration-500"
                >
                  <div className="w-12 h-12 border border-luxury-gold/30 flex items-center justify-center mb-6">
                    <span className="luxury-heading text-lg text-luxury-gold">
                      {person.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="luxury-heading text-xl font-medium mb-1">{person.name}</h3>
                  <p className="text-xs uppercase tracking-wideish text-luxury-gold-muted mb-4">
                    {person.role}
                  </p>
                  <p className="text-sm text-luxury-cream/60 font-light leading-relaxed">
                    {person.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sustainability */}
        <section className="py-20 sm:py-28 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              <div>
                <p className="luxury-label mb-4">Responsibility</p>
                <h2 className="luxury-heading text-3xl sm:text-4xl font-light mb-6 leading-tight">
                  Commitment to Sustainability
                </h2>
                <p className="text-sm text-luxury-cream/70 font-light leading-relaxed mb-8">
                  Sustainability is not a trend for us — it is woven into every decision, from
                  ingredient sourcing to the box that arrives at your door.
                </p>
                <ul className="space-y-4">
                  {sustainabilityPoints.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-luxury-gold flex-shrink-0" />
                      <span className="text-sm text-luxury-cream/65 font-light">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-white/5 bg-luxury-charcoal/40 p-8 sm:p-10">
                <p className="luxury-label mb-4">Contact</p>
                <h3 className="luxury-heading text-2xl font-light mb-4">Get in Touch</h3>
                <div className="space-y-4 text-sm text-luxury-cream/65 font-light leading-relaxed">
                  <div>
                    <p className="text-[10px] uppercase tracking-wideish text-luxury-gold-muted mb-1">Email</p>
                    <a
                      href={`mailto:${BRAND_EMAIL}`}
                      className="text-luxury-gold hover:text-luxury-gold-light transition-colors"
                    >
                      {BRAND_EMAIL}
                    </a>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wideish text-luxury-gold-muted mb-1">Location</p>
                    <p>{BRAND_LOCATION}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wideish text-luxury-gold-muted mb-1">Phone</p>
                    <a
                      href={`tel:${BRAND_PHONE_TEL}`}
                      className="hover:text-luxury-cream transition-colors"
                    >
                      {BRAND_PHONE_DISPLAY}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-28 bg-luxury-charcoal">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 text-center">
            <p className="luxury-label mb-4">Discover</p>
            <h2 className="luxury-heading text-3xl sm:text-4xl font-light mb-4">
              Experience {BRAND_NAME}
            </h2>
            <p className="text-sm text-luxury-smoke font-light leading-relaxed mb-10">
              Explore our complete catalog of luxury fragrances — each crafted to reflect the man
              who wears it.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/collections" className="luxury-btn-primary min-w-[220px]">
                Shop Collections
              </Link>
              <Link href="/" className="luxury-btn-ghost">
                Return Home
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <Cart isOpen={showCart} onClose={() => setShowCart(false)} onCheckout={handleCheckout} />
      <Checkout isOpen={showCheckout} onClose={() => setShowCheckout(false)} />
    </div>
  );
}
