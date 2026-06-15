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

export function BrandStatement() {
  return (
    <section className="relative py-24 sm:py-32 bg-luxury-charcoal border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="max-w-2xl mx-auto text-center mb-20">
          <p className="luxury-label mb-4">Philosophy</p>
          <h2 className="luxury-heading text-3xl sm:text-4xl md:text-5xl font-light leading-tight">
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
  );
}
