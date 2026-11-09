import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { STORE_INFO } from '../data/storeInfo';
import { 
  Phone, 
  MapPin, 
  Menu, 
  X, 
  ChevronRight, 
  Sparkles,
  ShieldAlert,
  Search,
  ExternalLink
} from 'lucide-react';

export default function Header({ onOpenSearch }) {
  const { currentPath, navigate } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Jewelry', path: '/jewelry' },
    { name: 'Electronics', path: '/electronics' },
    { name: 'Tools', path: '/tools' },
    { name: 'Musical Instruments', path: '/musical-instruments' },
    { name: 'Sell to Us', path: '/sell-to-us' },
    { name: 'Pawn Loans', path: '/pawn-loans' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Top Demonstration & Store Contact Banner */}
      <div className="bg-luxury-black/95 border-b border-luxury-gold/20 text-xs py-2 px-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-luxury-muted">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-luxury-gold/15 text-luxury-goldLight text-[11px] font-medium border border-luxury-gold/30">
              <Sparkles className="w-3 h-3 text-luxury-gold" />
              Demo Prototype
            </span>
            <span className="hidden sm:inline text-luxury-muted">
              Peachtree Corners, GA • Call for verified in-store inventory
            </span>
          </div>

          <div className="flex items-center space-x-4 ml-auto text-luxury-ivory text-xs font-medium">
            <a 
              href={STORE_INFO.phone.telLink} 
              className="flex items-center gap-1.5 hover:text-luxury-gold transition-colors"
              title="Call Peachtree Corners Loan & Pawn"
            >
              <Phone className="w-3.5 h-3.5 text-luxury-gold" />
              <span>{STORE_INFO.phone.formatted}</span>
            </a>
            <span className="text-luxury-gold/40">|</span>
            <a 
              href={STORE_INFO.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-luxury-gold transition-colors text-luxury-muted hover:text-luxury-ivory"
              title="Get directions to 7040 Jimmy Carter Blvd"
            >
              <MapPin className="w-3.5 h-3.5 text-luxury-gold" />
              <span className="hidden md:inline">7040 Jimmy Carter Blvd, Suite 4</span>
              <span className="md:hidden">Directions</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav 
        className={`w-full transition-all duration-300 border-b ${
          scrolled 
            ? 'bg-luxury-black/95 backdrop-blur-md border-luxury-gold/20 shadow-2xl py-3' 
            : 'bg-luxury-black/90 backdrop-blur-sm border-luxury-borderSubtle py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Brand Logo / Business Name */}
            <button 
              onClick={() => handleNavClick('/')}
              className="text-left group flex items-center gap-3 focus:outline-none"
              aria-label="Peachtree Corners Loan and Pawn Home"
            >
              <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-luxury-charcoal to-luxury-black border border-luxury-gold/40 flex items-center justify-center shadow-gold-glow group-hover:border-luxury-gold transition-all duration-300">
                <span className="font-editorial text-xl font-bold text-luxury-gold group-hover:text-luxury-goldLight transition-colors">
                  PC
                </span>
              </div>
              <div>
                <span className="block font-editorial text-lg sm:text-xl font-semibold tracking-wide text-luxury-ivory group-hover:text-luxury-goldLight transition-colors leading-none">
                  PEACHTREE CORNERS
                </span>
                <span className="block text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-luxury-gold font-medium mt-1">
                  LOAN & PAWN
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden xl:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => {
                const isActive = currentPath === link.path;
                return (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link.path)}
                    className={`px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider font-medium transition-all duration-200 relative ${
                      isActive 
                        ? 'text-luxury-gold font-semibold' 
                        : 'text-luxury-muted hover:text-luxury-ivory hover:bg-luxury-charcoal/50'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-luxury-gold rounded-full shadow-gold-glow" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Header Right CTA & Search */}
            <div className="hidden lg:flex items-center space-x-3">
              <button
                onClick={() => handleNavClick('/shop')}
                className="p-2 text-luxury-muted hover:text-luxury-gold hover:bg-luxury-charcoal/50 rounded-sm transition-colors"
                title="Search Demonstration Inventory"
                aria-label="Search items"
              >
                <Search className="w-4 h-4" />
              </button>

              <a
                href={STORE_INFO.phone.telLink}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-sm bg-gradient-to-r from-luxury-gold to-luxury-goldLight text-luxury-black hover:brightness-110 active:scale-95 transition-all shadow-md"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Store</span>
              </a>

              <a
                href={STORE_INFO.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs uppercase tracking-wider font-medium rounded-sm border border-luxury-gold/50 text-luxury-gold hover:bg-luxury-gold/10 hover:border-luxury-gold transition-all"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Visit Us</span>
              </a>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex xl:hidden items-center space-x-2">
              <button
                onClick={() => handleNavClick('/shop')}
                className="p-2 text-luxury-muted hover:text-luxury-gold rounded-sm transition-colors"
                aria-label="Search items"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-sm text-luxury-gold hover:bg-luxury-charcoal border border-luxury-gold/30 transition-colors focus:outline-none"
                aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 top-[98px] z-50 bg-luxury-black/98 border-t border-luxury-gold/20 backdrop-blur-xl overflow-y-auto pb-12">
          <div className="max-w-lg mx-auto px-6 py-6 space-y-6">
            
            {/* Quick Actions Bar */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={STORE_INFO.phone.telLink}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider shadow-md"
              >
                <Phone className="w-4 h-4" />
                <span>Call Store</span>
              </a>
              <a
                href={STORE_INFO.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-sm border border-luxury-gold/60 text-luxury-gold font-medium text-xs uppercase tracking-wider hover:bg-luxury-gold/10"
              >
                <MapPin className="w-4 h-4" />
                <span>Get Directions</span>
              </a>
            </div>

            {/* Navigation Category List */}
            <div className="divide-y divide-luxury-borderSubtle border-y border-luxury-borderSubtle">
              {navLinks.map((link) => {
                const isActive = currentPath === link.path;
                return (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link.path)}
                    className={`w-full py-3.5 px-2 flex items-center justify-between text-left transition-colors ${
                      isActive 
                        ? 'text-luxury-gold font-semibold bg-luxury-gold/5' 
                        : 'text-luxury-ivory hover:text-luxury-gold hover:bg-luxury-charcoal/30'
                    }`}
                  >
                    <span className="text-sm font-medium tracking-wide">
                      {link.name}
                    </span>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-luxury-gold' : 'text-luxury-muted'}`} />
                  </button>
                );
              })}
            </div>

            {/* Store Information Box */}
            <div className="p-4 rounded-sm bg-luxury-charcoal/60 border border-luxury-gold/20 space-y-2">
              <p className="text-xs uppercase tracking-wider text-luxury-gold font-semibold">
                Store Location
              </p>
              <p className="text-sm text-luxury-ivory leading-relaxed">
                {STORE_INFO.address.street}<br />
                {STORE_INFO.address.city}, {STORE_INFO.address.state} {STORE_INFO.address.zip}
              </p>
              <p className="text-xs text-luxury-muted pt-1">
                Serving Peachtree Corners, Norcross, and Greater Atlanta.
              </p>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
