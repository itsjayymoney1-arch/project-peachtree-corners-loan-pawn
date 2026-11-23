import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  Clock3,
  Gem,
  HandCoins,
  Laptop,
  MapPin,
  Menu,
  Music2,
  Phone,
  ShoppingBag,
  Tag,
  Wrench,
  X,
} from 'lucide-react';
import { STORE_INFO } from './data/storeInfo';
import { PUBLIC_CATALOG } from './data/publicCatalog';
import HoursSection from './components/HoursSection';
import './safe.css';

const navigation = [
  { label: 'Home', href: '#home' },
  { label: 'Departments', href: '#departments' },
  { label: 'Shop', href: '#catalog' },
  { label: 'Pawn services', href: '#pawn' },
  { label: 'Sell', href: '#sell' },
  { label: 'About', href: '#about' },
  { label: 'Hours & contact', href: '#contact' },
];

const departments = [
  { number: '01', name: 'Jewelry', Icon: Gem },
  { number: '02', name: 'Electronics', Icon: Laptop },
  { number: '03', name: 'Tools', Icon: Wrench },
  { number: '04', name: 'Musical instruments', Icon: Music2 },
];

const quickServices = [
  {
    number: '01',
    title: 'Get a pawn loan',
    description: 'Talk with us about a loan using an item as collateral.',
    linkText: 'Learn about pawn loans',
    href: '#pawn',
    Icon: HandCoins,
  },
  {
    number: '02',
    title: 'Sell an item',
    description: 'Have an item to sell? Call to ask what to bring.',
    linkText: 'Ask about selling',
    href: '#sell',
    Icon: Tag,
  },
  {
    number: '03',
    title: 'Shop merchandise',
    description: 'Explore our departments and ask about current availability.',
    linkText: 'Explore merchandise',
    href: '#catalog',
    Icon: ShoppingBag,
  },
];

function CallButton({ children = 'Call the store', className = '' }) {
  return (
    <a className={`safe-button safe-button-gold ${className}`} href={STORE_INFO.phone.telLink}>
      <Phone size={16} aria-hidden="true" />
      <span>{children}</span>
    </a>
  );
}

function Brand() {
  return (
    <a className="safe-brand" href="#home" aria-label={`${STORE_INFO.name}, home`}>
      <img className="safe-brand-mark" src="/manus-storage/business-card-emblem_5ff97cc9.png" alt="" />
      <span className="safe-brand-name">
        <span>Peachtree Corners</span>
        <small>Loan &amp; Pawn</small>
      </span>
    </a>
  );
}

export default function SafeApp() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="safe-site">
      <a className="safe-skip" href="#main-content">Skip to content</a>
      <div className="safe-topline">
        <div className="safe-container safe-topline-inner">
          <span><MapPin size={13} aria-hidden="true" /> Peachtree Corners, Georgia</span>
          <a href={STORE_INFO.phone.telLink}><Phone size={13} aria-hidden="true" /> {STORE_INFO.phone.formatted}</a>
        </div>
      </div>
      <header className="safe-header">
        <div className="safe-container safe-header-inner">
          <Brand />
          <nav className="safe-desktop-nav" aria-label="Main navigation">
            {navigation.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
          </nav>
          <div className="safe-header-actions">
            <CallButton className="safe-header-call">Call us</CallButton>
            <button
              className="safe-menu-toggle"
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-controls="safe-mobile-navigation"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X size={23} aria-hidden="true" /> : <Menu size={23} aria-hidden="true" />}
            </button>
          </div>
        </div>
        <nav
          id="safe-mobile-navigation"
          className="safe-mobile-nav"
          aria-label="Mobile navigation"
          hidden={!menuOpen}
        >
          {navigation.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}<ArrowRight size={16} aria-hidden="true" />
            </a>
          ))}
          <a className="safe-mobile-call" href={STORE_INFO.phone.telLink} onClick={() => setMenuOpen(false)}>
            <Phone size={16} aria-hidden="true" /> {STORE_INFO.phone.formatted}
          </a>
        </nav>
      </header>

      <main id="main-content">
        <section className="safe-hero" id="home" aria-labelledby="hero-title">
          <div className="safe-container safe-hero-inner">
            <div className="safe-hero-content">
              <p className="safe-eyebrow"><span /> Peachtree Corners, Georgia</p>
              <h1 id="hero-title">Pawn, sell &amp; shop<br /><em>in Peachtree Corners.</em></h1>
              <p className="safe-hero-copy">Questions about a pawn loan, selling an item, or what’s in store? Give us a call or stop by in Peachtree Corners.</p>
              <div className="safe-actions">
                <CallButton>Call {STORE_INFO.phone.formatted}</CallButton>
                <a className="safe-button safe-button-outline" href={STORE_INFO.directionsUrl} target="_blank" rel="noopener noreferrer">Get directions <ArrowDownRight size={16} aria-hidden="true" /></a>
              </div>
              <p className="safe-availability"><span aria-hidden="true" /> Call ahead to ask about items, services, and current availability.</p>
            </div>
            <div className="safe-hero-visual">
              <img className="safe-hero-image" src="/manus-storage/storefront_3d7d1716.png" alt="Peachtree Corners Loan & Pawn storefront on Jimmy Carter Boulevard" />
              <span className="safe-photo-caption">Our storefront · Photo from our previous website, 2022</span>
              <details className="safe-storefront-detail">
                <summary>View another storefront photo</summary>
                <img src="/manus-storage/shop-exterior_b9e5269c.webp" alt="Another view of the Peachtree Corners Loan & Pawn storefront" loading="lazy" />
              </details>
            </div>
          </div>
        </section>

        <section className="safe-quick-services" aria-label="Ways we can help">
          <div className="safe-container safe-quick-services-grid">
            {quickServices.map(({ number, title, description, linkText, href, Icon }) => (
              <a className="safe-intent-card" href={href} key={href}>
                <span className="safe-intent-icon"><Icon size={24} strokeWidth={1.5} aria-hidden="true" /></span>
                <span className="safe-intent-number" aria-hidden="true">{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="safe-intent-link">{linkText} <ArrowRight size={16} aria-hidden="true" /></span>
              </a>
            ))}
          </div>
        </section>

        <div className="safe-info-bar">
          <div className="safe-container safe-info-grid">
            <div><MapPin aria-hidden="true" /><span><strong>Visit us</strong>{STORE_INFO.address.street}</span></div>
            <div><Phone aria-hidden="true" /><span><strong>Speak with us</strong><a href={STORE_INFO.phone.telLink}>{STORE_INFO.phone.formatted}</a></span></div>
            <div><Clock3 aria-hidden="true" /><span><strong>Plan your visit</strong><a href="#hours">See store hours <ArrowRight size={14} aria-hidden="true" /></a></span></div>
          </div>
        </div>

        <section className="safe-section safe-departments" id="departments" aria-labelledby="departments-title">
          <div className="safe-container">
            <div className="safe-section-heading">
              <div>
                <p className="safe-eyebrow"><span /> A little something for everyone</p>
                <h2 id="departments-title">Explore the departments.</h2>
              </div>
              <p>Looking for something specific? Give us a call to confirm what is currently available in store.</p>
            </div>
            <div className="safe-department-grid">
              {departments.map(({ number, name, Icon }) => (
                <div className="safe-department-card" key={name}>
                  <div className="safe-card-top"><span>{number}</span><Icon size={28} strokeWidth={1.25} aria-hidden="true" /></div>
                  <h3>{name}</h3>
                  <a href={STORE_INFO.phone.telLink}>Ask about availability <ArrowRight size={15} aria-hidden="true" /></a>
                </div>
              ))}
            </div>
            <p className="safe-department-note">Departments are shown for reference, not as a listing of current inventory. Please call to confirm availability.</p>
          </div>
        </section>
        <section className="safe-section safe-catalog" id="catalog" aria-labelledby="catalog-title">
          <div className="safe-container">
            <div className="safe-section-heading">
              <div>
                <p className="safe-eyebrow"><span /> In-store finds</p>
                <h2 id="catalog-title">Shop the showroom.</h2>
              </div>
              <p>All items are subject to availability. Please call the store before making a trip.</p>
            </div>
            {PUBLIC_CATALOG.length ? (
              <div className="safe-catalog-grid">
                {PUBLIC_CATALOG.map((item) => (
                  <article className="safe-catalog-card" key={item.id}>
                    {item.image && <img src={item.image} alt={item.name} loading="lazy" />}
                    <div className="safe-catalog-card-body">
                      <h3>{item.name}</h3>
                      {item.description && <p>{item.description}</p>}
                      {Number.isFinite(item.price) && <p className="safe-catalog-price">${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>}
                      <a className="safe-text-link" href={STORE_INFO.phone.telLink}>Call about this item <ArrowRight size={15} aria-hidden="true" /></a>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="safe-catalog-empty">
                <h3>New listings are coming soon.</h3>
                <p>We haven't added individual items online yet. Call the store to ask what's available today.</p>
                <CallButton>Call about merchandise</CallButton>
              </div>
            )}
          </div>
        </section>
        <section className="safe-section safe-services" id="pawn" aria-labelledby="pawn-title">
          <div className="safe-container safe-service-layout">
            <div className="safe-service-intro">
              <p className="safe-eyebrow"><span /> Pawn services</p>
              <h2 id="pawn-title">A conversation<br /><em>starts here.</em></h2>
              <p>Have a question about a pawn loan or an item you own? Call the store to discuss your questions, what to bring, and the applicable terms.</p>
              <CallButton>Ask about pawn services</CallButton>
            </div>
            <div className="safe-service-panel">
              <div className="safe-panel-symbol" aria-hidden="true"><Gem size={32} strokeWidth={1.2} /></div>
              <p className="safe-panel-label">Good to know</p>
              <h3>In-person inspection</h3>
              <p>{STORE_INFO.disclaimer.loansNotice}</p>
              <div className="safe-panel-divider" />
              <p>For questions about an existing pawn ticket, please contact the store directly.</p>
              <a className="safe-text-link" href={STORE_INFO.phone.telLink}>Call {STORE_INFO.phone.formatted} <ArrowRight size={16} aria-hidden="true" /></a>
            </div>
          </div>
        </section>

        <section className="safe-sell" id="sell" aria-labelledby="sell-title">
          <div className="safe-container safe-sell-inner">
            <div>
              <p className="safe-eyebrow"><span /> Selling an item</p>
              <h2 id="sell-title">Have something to sell?</h2>
              <p>Call us to ask about your item, what to bring, and whether it is something the store is interested in.</p>
            </div>
            <CallButton>Call to ask about selling</CallButton>
          </div>
        </section>

        <section className="safe-section safe-visit" id="contact" aria-labelledby="contact-title">
          <div className="safe-container safe-visit-grid">
            <div className="safe-visit-copy" id="about">
              <p className="safe-eyebrow"><span /> About &amp; contact</p>
              <h2 id="contact-title">Find us in<br /><em>Peachtree Corners.</em></h2>
              <p>{STORE_INFO.address.areaNote}</p>
              <div className="safe-contact-list">
                <div><MapPin size={19} aria-hidden="true" /><span><strong>Visit</strong>{STORE_INFO.address.street}<br />{STORE_INFO.address.city}, {STORE_INFO.address.state} {STORE_INFO.address.zip}</span></div>
                <div><Phone size={19} aria-hidden="true" /><span><strong>Call</strong><a href={STORE_INFO.phone.telLink}>{STORE_INFO.phone.formatted}</a></span></div>
              </div>
              <div className="safe-actions">
                <CallButton>Call the store</CallButton>
                <a className="safe-button safe-button-outline" href={STORE_INFO.directionsUrl} target="_blank" rel="noopener noreferrer">Get directions <ArrowDownRight size={16} aria-hidden="true" /></a>
              </div>
            </div>
            <div className="safe-hours-card" id="hours">
              <p className="safe-eyebrow"><span /> Plan your visit</p>
              <h2>Store hours</h2>
              <HoursSection />
              <p className="safe-hours-note">Hours can change. Please call ahead to confirm before making a special trip.</p>
              <a className="safe-text-link" href={STORE_INFO.phone.telLink}><Phone size={15} aria-hidden="true" /> {STORE_INFO.phone.formatted}</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="safe-footer">
        <div className="safe-container">
          <div className="safe-footer-main">
            <div><Brand /><p>{STORE_INFO.address.full}</p></div>
            <div className="safe-footer-links">
              <a href="#departments">Departments</a><a href="#pawn">Pawn services</a><a href="#sell">Sell</a><a href="#contact">Contact &amp; hours</a>
            </div>
            <div className="safe-footer-call"><span>Questions? Call the store.</span><a href={STORE_INFO.phone.telLink}>{STORE_INFO.phone.formatted}</a></div>
          </div>
          <div className="safe-footer-bottom">
            <span>© {new Date().getFullYear()} {STORE_INFO.name}</span>
            <a href="/staff-hours">Staff hours administration</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
