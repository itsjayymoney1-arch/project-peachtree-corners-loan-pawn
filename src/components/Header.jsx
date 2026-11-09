import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useApp } from '../context/AppContext';
import { STORE_INFO } from '../data/storeInfo';
import { 
  Phone, 
  MapPin, 
  Menu, 
  X, 
  ChevronRight, 
  Sparkles,
  Flame,
  ShoppingBag,
  User,
  ShieldCheck,
  Search,
  ExternalLink
} from 'lucide-react';

export default function Header({ onOpenSearch }) {
  const { currentPath, navigate } = useRouter();
  const { cart, setIsCartOpen, customerUser, currentAdmin } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'The Vault', path: '/vault', isVault: true },
    { name: 'Shop All', path: '/shop' },
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
              Live Retail Showroom &bull; The Vault
            </span>
            <span className="hidden sm:inline text-luxury-muted">
              7040 Jimmy Carter Blvd &bull; Peachtree Corners, GA
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
            <button
              onClick={() => handleNavClick('/admin')}
              className="flex items-center gap-1 text-luxury-gold hover:text-luxury-goldLight hover:underline font-mono text-[11px]"
              title="Store Staff Administration Portal"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Admin Portal</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav 
        className={`w-full transition-all duration-300 border-b ${
          scrolled 
            ? 'bg-luxury-black/98 backdrop-blur-md border-luxury-gold/25 shadow-2xl py-2.5' 
            : 'bg-luxury-black/90 backdrop-blur-sm border-luxury-borderSubtle py-3.5'
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
                <span className="block text-[10px] uppercase tracking-[0.25em] text-luxury-gold font-medium mt-0.5">
                  LOAN &amp; PAWN &bull; THE VAULT
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden xl:flex items-center space-x-1 lg:space-x-4">
              {navLinks.map((link) => {
                const isActive = currentPath === link.path;
                return (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link.path)}
                    className={`px-2.5 py-1.5 text-xs uppercase tracking-wider font-medium transition-all duration-200 relative ${
                      isActive 
                        ? 'text-luxury-gold font-bold' 
                        : link.isVault 
                          ? 'text-luxury-goldLight hover:text-luxury-gold font-bold flex items-center gap-1 bg-luxury-gold/10 px-3 rounded-full border border-luxury-gold/30'
                          : 'text-luxury-ivory hover:text-luxury-gold'
                    }`}
                  >
                    {link.isVault && <Flame className="w-3 h-3 text-luxury-gold animate-pulse" />}
                    <span>{link.name}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-luxury-gold rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Header Controls (Cart, Account, Store Contact) */}
            <div className="flex items-center space-x-3">
              
              {/* Account Shortcut */}
              <button
                onClick={() => handleNavClick(customerUser ? '/account' : '/auth')}
                className={`p-2 rounded-sm border transition-colors flex items-center gap-1.5 text-xs uppercase tracking-wider ${
                  customerUser 
                    ? 'border-luxury-gold/40 bg-luxury-charcoal text-luxury-gold hover:border-luxury-gold' 
                    : 'border-transparent text-luxury-muted hover:text-luxury-ivory hover:bg-luxury-charcoal'
                }`}
                title={customerUser ? `Logged in as ${customerUser.firstName}` : 'Sign In or Register'}
              >
                <User className="w-4 h-4 text-luxury-gold" />
                <span className="hidden sm:inline">
                  {customerUser ? customerUser.firstName : 'Account'}
                </span>
              </button>

              {/* Shopping Bag / Cart Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-sm bg-luxury-charcoal border border-luxury-gold/40 hover:border-luxury-gold text-luxury-gold transition-all shadow-sm flex items-center gap-2"
                aria-label={`Shopping Bag with ${totalCartCount} items`}
              >
                <ShoppingBag className="w-4 h-4 text-luxury-gold" />
                <span className="hidden sm:inline text-xs uppercase font-bold text-luxury-ivory">
                  Bag
                </span>
                {totalCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-luxury-gold text-luxury-black text-[11px] font-bold flex items-center justify-center shadow-gold-glow">
                    {totalCartCount}
                  </span>
                )}
              </button>

              {/* Call Store CTA (Desktop) */}
              <a
                href={STORE_INFO.phone.telLink}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider font-semibold rounded-sm bg-luxury-gold text-luxury-black hover:brightness-110 active:scale-95 transition-all shadow-md"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Store</span>
              </a>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-sm text-luxury-gold hover:bg-luxury-charcoal border border-luxury-gold/30 transition-colors focus:outline-none"
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
        <div className="xl:hidden fixed inset-0 top-[96px] z-50 bg-luxury-black/98 border-t border-luxury-gold/20 backdrop-blur-xl overflow-y-auto pb-12 animate-fadeIn">
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
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-sm border border-luxury-gold text-luxury-gold font-semibold text-xs uppercase tracking-wider"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Bag ({totalCartCount})</span>
              </button>
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
                        : link.isVault 
                          ? 'text-luxury-goldLight font-bold bg-luxury-gold/10'
                          : 'text-luxury-ivory hover:text-luxury-gold hover:bg-luxury-charcoal/30'
                    }`}
                  >
                    <span className="text-sm font-medium tracking-wide flex items-center gap-2">
                      {link.isVault && <Flame className="w-4 h-4 text-luxury-gold" />}
                      <span>{link.name}</span>
                    </span>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-luxury-gold' : 'text-luxury-muted'}`} />
                  </button>
                );
              })}

              {/* Account Link in Mobile */}
              <button
                onClick={() => handleNavClick(customerUser ? '/account' : '/auth')}
                className="w-full py-3.5 px-2 flex items-center justify-between text-left text-luxury-ivory hover:text-luxury-gold"
              >
                <span className="text-sm font-medium tracking-wide flex items-center gap-2">
                  <User className="w-4 h-4 text-luxury-gold" />
                  <span>{customerUser ? `My Account (${customerUser.firstName})` : 'Client Sign In / Register'}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-luxury-muted" />
              </button>

              {/* Admin Portal in Mobile */}
              <button
                onClick={() => handleNavClick('/admin')}
                className="w-full py-3.5 px-2 flex items-center justify-between text-left text-luxury-goldLight font-bold bg-luxury-charcoal/40"
              >
                <span className="text-sm tracking-wide flex items-center gap-2 font-mono">
                  <ShieldCheck className="w-4 h-4 text-luxury-gold" />
                  <span>Store Staff Admin Portal</span>
                </span>
                <ChevronRight className="w-4 h-4 text-luxury-gold" />
              </button>
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
                Mon - Sat 9:30 AM - 6:00 PM &bull; (678) 691-1692
              </p>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
