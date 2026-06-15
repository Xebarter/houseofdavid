import Link from 'next/link';
import { Award, Leaf, Users, Droplets, Clock } from 'lucide-react';
import { BRAND_NAME } from '@/lib/brand';

export function About() {
  const values = [
    {
      icon: <Leaf className="h-8 w-8 text-amber-500" />,
      title: "Natural Ingredients",
      description: "We source only the finest natural ingredients, ensuring each fragrance captures the essence of nature's beauty."
    },
    {
      icon: <Award className="h-8 w-8 text-amber-500" />,
      title: "Craftsmanship",
      description: "Each bottle is meticulously crafted by master perfumers with decades of experience in the art of fragrance creation."
    },
    {
      icon: <Droplets className="h-8 w-8 text-amber-500" />,
      title: "Sustainability",
      description: "Committed to eco-friendly practices, from recyclable packaging to sustainable ingredient sourcing."
    },
    {
      icon: <Clock className="h-8 w-8 text-amber-500" />,
      title: "Timeless Appeal",
      description: "Creating fragrances that transcend trends and remain beloved for generations."
    }
  ];

  const timeline = [
    {
      year: "1995",
      title: "The Beginning",
      description: "Founded in Paris by renowned perfumer Claude Dubois with a vision to create exceptional fragrances."
    },
    {
      year: "2003",
      title: "First Boutique",
      description: "Opened our flagship store on Rue du Faubourg Saint-Honoré, establishing our presence in the luxury market."
    },
    {
      year: "2010",
      title: "Global Expansion",
      description: "Expanded to major cities worldwide including New York, London, Tokyo, and Dubai."
    },
    {
      year: "2018",
      title: "Master Perfumers",
      description: "Launched our exclusive collection created by our in-house team of master perfumers."
    },
    {
      year: "2022",
      title: "Sustainable Future",
      description: "Achieved carbon neutrality and introduced our eco-conscious packaging initiative."
    },
    {
      year: "Today",
      title: "Continuing Legacy",
      description: "Serving fragrance enthusiasts across 40 countries with our ever-growing collection."
    }
  ];

  return (
    <div className="bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-900 to-black py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-600/20 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-amber-50 mb-6">
              Our Story
            </h1>
            <p className="text-xl text-amber-200 max-w-3xl mx-auto">
              Crafting exceptional fragrances since 1995, blending tradition with innovation to create scents that define moments and memories.
            </p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-amber-50 mb-6">The Essence of Luxury</h2>
              <p className="text-amber-200 mb-6 leading-relaxed">
                At {BRAND_NAME}, we believe that fragrance is more than just a scent—it's an expression of individuality, 
                a memory in a bottle, and a signature that defines who you are. For nearly three decades, we've been dedicated 
                to crafting exceptional fragrances that capture the imagination and elevate everyday moments.
              </p>
              <p className="text-amber-200 mb-6 leading-relaxed">
                Our journey began in the heart of Paris, where founder Claude Dubois envisioned a house that would push 
                boundaries while honoring traditional perfumery techniques. Today, we continue that legacy with a commitment 
                to excellence, sustainability, and the artistry that makes each of our creations truly special.
              </p>
              <Link 
                href="/" 
                className="inline-block bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium py-3 px-6 rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-300"
              >
                Explore Our Collection
              </Link>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1600224768867-74b5992a1da8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                alt="Perfume creation process" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-amber-50 mb-4">Our Values</h2>
            <p className="text-amber-200 max-w-2xl mx-auto">
              These principles guide everything we do, from ingredient selection to bottle design.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-900/50 p-8 rounded-2xl border border-amber-900/50 hover:border-amber-600/50 transition-all duration-300">
                <div className="mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-amber-50 mb-3">{value.title}</h3>
                <p className="text-amber-200">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-amber-50 mb-4">Our Journey</h2>
            <p className="text-amber-200 max-w-2xl mx-auto">
              From a small Parisian atelier to a globally recognized name in luxury perfumery.
            </p>
          </div>
          
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-amber-600/20 hidden lg:block"></div>
            
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div 
                  key={index} 
                  className={`relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${index % 2 === 0 ? 'lg:text-right' : ''}`}
                >
                  <div className={`${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                    <div className="bg-gray-800 p-6 rounded-2xl border border-amber-900/50">
                      <span className="inline-block bg-amber-600/20 text-amber-500 px-3 py-1 rounded-full text-sm font-medium mb-3">
                        {item.year}
                      </span>
                      <h3 className="text-xl font-bold text-amber-50 mb-3">{item.title}</h3>
                      <p className="text-amber-200">{item.description}</p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center ${index % 2 === 0 ? 'justify-start lg:justify-end' : 'justify-end lg:justify-start'} lg:col-start-1`}>
                    <div className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full bg-amber-600 text-white font-bold">
                      {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-amber-50 mb-4">Meet Our Master Perfumers</h2>
            <p className="text-amber-200 max-w-2xl mx-auto">
              Behind every {BRAND_NAME} fragrance is a master craftsman with years of expertise.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 rounded-2xl overflow-hidden border border-amber-900/50">
              <div className="h-64 bg-gradient-to-br from-amber-900/30 to-amber-700/30 flex items-center justify-center">
                <Users className="h-16 w-16 text-amber-500" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-amber-50 mb-2">Claude Dubois</h3>
                <p className="text-amber-400 mb-3">Founder & Master Perfumer</p>
                <p className="text-amber-200 text-sm">
                  With over 40 years of experience, Claude established the foundation of our perfumery philosophy.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-2xl overflow-hidden border border-amber-900/50">
              <div className="h-64 bg-gradient-to-br from-amber-900/30 to-amber-700/30 flex items-center justify-center">
                <Users className="h-16 w-16 text-amber-500" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-amber-50 mb-2">Isabelle Moreau</h3>
                <p className="text-amber-400 mb-3">Head of Creation</p>
                <p className="text-amber-200 text-sm">
                  Isabelle brings a modern perspective while honoring classical perfumery techniques.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-2xl overflow-hidden border border-amber-900/50">
              <div className="h-64 bg-gradient-to-br from-amber-900/30 to-amber-700/30 flex items-center justify-center">
                <Users className="h-16 w-16 text-amber-500" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-amber-50 mb-2">Antoine Rousseau</h3>
                <p className="text-amber-400 mb-3">Sourcing Specialist</p>
                <p className="text-amber-200 text-sm">
                  Antoine travels the world to discover rare ingredients for our exclusive collections.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sustainability Commitment */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-xl aspect-video flex items-center justify-center">
                <Leaf className="h-24 w-24 text-amber-500" />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-amber-50 mb-6">Commitment to Sustainability</h2>
              <p className="text-amber-200 mb-6 leading-relaxed">
                We recognize our responsibility to protect the planet for future generations. That's why sustainability 
                isn't just a trend for us—it's a core principle woven into every aspect of our business.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1 mr-3 w-6 h-6 rounded-full bg-amber-600/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  </div>
                  <span className="text-amber-200">Ethically sourced ingredients from sustainable farms</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1 mr-3 w-6 h-6 rounded-full bg-amber-600/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  </div>
                  <span className="text-amber-200">Recyclable and biodegradable packaging materials</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1 mr-3 w-6 h-6 rounded-full bg-amber-600/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  </div>
                  <span className="text-amber-200">Carbon-neutral shipping worldwide</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1 mr-3 w-6 h-6 rounded-full bg-amber-600/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  </div>
                  <span className="text-amber-200">Partnerships with environmental conservation organizations</span>
                </li>
              </ul>
              <Link 
                href="/" 
                className="inline-block bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium py-3 px-6 rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-300"
              >
                Learn More About Our Initiatives
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-amber-900/20 to-amber-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-amber-50 mb-6">Experience the {BRAND_NAME} Difference</h2>
          <p className="text-amber-200 max-w-2xl mx-auto mb-8">
            Discover our curated collection of luxury fragrances, each crafted to perfection and designed to reflect your unique personality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/" 
              className="bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium py-3 px-8 rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-300 text-center"
            >
              Shop Collection
            </Link>
            <Link 
              href="/#contact" 
              className="bg-transparent border-2 border-amber-600 text-amber-50 font-medium py-3 px-8 rounded-lg hover:bg-amber-600/10 transition-all duration-300 text-center"
            >
              Visit Our Boutique
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}