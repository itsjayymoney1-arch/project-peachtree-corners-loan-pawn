import React, { useState, useEffect } from 'react';
import { useRouter } from './context/RouterContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ProductModal from './components/ProductModal';
import InquiryModal from './components/InquiryModal';

// Pages
import Home from './pages/Home';
import Vault from './pages/Vault';
import Shop from './pages/Shop';
import Jewelry from './pages/Jewelry';
import Electronics from './pages/Electronics';
import Tools from './pages/Tools';
import MusicalInstruments from './pages/MusicalInstruments';
import SellToUs from './pages/SellToUs';
import PawnLoans from './pages/PawnLoans';
import About from './pages/About';
import Contact from './pages/Contact';

// Commerce & Admin Pages
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Account from './pages/Account';
import Auth from './pages/Auth';
import Admin from './pages/Admin';

export default function App() {
  const { currentPath, navigate } = useRouter();

  // State for modals
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquiryProduct, setInquiryProduct] = useState(null);

  // SEO page title and meta updates
  useEffect(() => {
    let title = "Peachtree Corners Loan & Pawn | Value Worth Discovering";
    let desc = "Explore quality jewelry, electronics, tools, musical instruments, and specialty merchandise at Peachtree Corners Loan & Pawn.";

    switch (currentPath) {
      case '/vault':
        title = "THE VAULT: Just Came In | Peachtree Corners Loan & Pawn";
        desc = "Discover what's new before somebody else does. Live estate jewelry, Swiss watches, contractor equipment, and new arrivals in Peachtree Corners, GA.";
        break;
      case '/checkout':
      case '/cart':
        title = "Secure Checkout | Peachtree Corners Loan & Pawn";
        desc = "Complete your secure order with in-store counter pickup or insured shipping.";
        break;
      case '/order-confirmation':
        title = "Order Confirmed | Peachtree Corners Loan & Pawn";
        desc = "Thank you for your order. View your confirmation receipt and in-store pickup details.";
        break;
      case '/account':
        title = "Client Account & Orders | Peachtree Corners Loan & Pawn";
        desc = "Manage order history, fulfillment tracking, and Vault Weekly subscription preferences.";
        break;
      case '/auth':
        title = "Client Sign In & Registration | Peachtree Corners Loan & Pawn";
        desc = "Sign in or create your client profile for fast checkout and drop alerts.";
        break;
      case '/admin':
        title = "Staff Administration & Inventory Platform | Peachtree Corners Loan & Pawn";
        desc = "Executive retail commerce dashboard, inventory intake, orders, and marketing management.";
        break;
      case '/shop':
        title = "Browse Showroom Catalog | Peachtree Corners Loan & Pawn";
        desc = "Explore our verified inventory of fine jewelry, electronics, contractor equipment, and musical instruments.";
        break;
      case '/jewelry':
        title = "Fine Jewelry & Luxury Watches | Peachtree Corners Loan & Pawn";
        desc = "Discover solid gold chains, diamond solitaire rings, fine bracelets, and Swiss automatic timepieces.";
        break;
      case '/electronics':
        title = "Modern Electronics & Tech | Peachtree Corners Loan & Pawn";
        desc = "Inspected performance laptops, smartphones, noise-canceling headphones, and gaming consoles.";
        break;
      case '/tools':
        title = "Tools & Contractor Equipment | Peachtree Corners Loan & Pawn";
        desc = "Commercial grade cordless power tool combo kits, miter saws, air compressors, and laser levels.";
        break;
      case '/musical-instruments':
        title = "Musical Instruments & Pro Audio | Peachtree Corners Loan & Pawn";
        desc = "Solid body electric guitars, acoustic guitars, tube amplifiers, and stage keyboards.";
        break;
      case '/sell-to-us':
        title = "Sell Your Merchandise | Peachtree Corners Loan & Pawn";
        desc = "Turn what you own into an opportunity. In-person evaluations for jewelry, watches, tools, and electronics.";
        break;
      case '/pawn-loans':
        title = "Collateral Pawn Loans | Peachtree Corners Loan & Pawn";
        desc = "Questions about pawn services? Learn how collateral loans work with confidential in-store evaluations.";
        break;
      case '/about':
        title = "About Our Store | Peachtree Corners Loan & Pawn";
        desc = "An elevated retail discovery experience located at 7040 Jimmy Carter Blvd in Peachtree Corners, GA.";
        break;
      case '/contact':
        title = "Contact & Directions | Peachtree Corners Loan & Pawn";
        desc = "Store address, phone number (678-691-1692), directions, and inquiry form for Peachtree Corners Loan & Pawn.";
        break;
      default:
        title = "Peachtree Corners Loan & Pawn | Value Worth Discovering";
        break;
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', desc);
  }, [currentPath]);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseProductModal = () => {
    setSelectedProduct(null);
  };

  const handleInquireProduct = (product) => {
    setInquiryProduct(product);
    setInquiryModalOpen(true);
  };

  const handleCloseInquiryModal = () => {
    setInquiryModalOpen(false);
    setInquiryProduct(null);
  };

  // Route renderer
  const renderCurrentPage = () => {
    switch (currentPath) {
      case '/vault':
        return <Vault onSelectProduct={handleSelectProduct} onInquireProduct={handleInquireProduct} />;
      case '/cart':
      case '/checkout':
        return <Checkout />;
      case '/order-confirmation':
        return <OrderConfirmation />;
      case '/account':
        return <Account />;
      case '/auth':
        return <Auth />;
      case '/admin':
        return <Admin />;
      case '/shop':
        return <Shop onSelectProduct={handleSelectProduct} onInquireProduct={handleInquireProduct} />;
      case '/jewelry':
        return <Jewelry onSelectProduct={handleSelectProduct} onInquireProduct={handleInquireProduct} />;
      case '/electronics':
        return <Electronics onSelectProduct={handleSelectProduct} onInquireProduct={handleInquireProduct} />;
      case '/tools':
        return <Tools onSelectProduct={handleSelectProduct} onInquireProduct={handleInquireProduct} />;
      case '/musical-instruments':
        return <MusicalInstruments onSelectProduct={handleSelectProduct} onInquireProduct={handleInquireProduct} />;
      case '/sell-to-us':
        return <SellToUs />;
      case '/pawn-loans':
        return <PawnLoans />;
      case '/about':
        return <About />;
      case '/contact':
        return <Contact />;
      case '/':
      default:
        return <Home onSelectProduct={handleSelectProduct} onInquireProduct={handleInquireProduct} />;
    }
  };

  const isAdminRoute = currentPath === '/admin';

  return (
    <div className="min-h-screen flex flex-col bg-luxury-black text-luxury-ivory selection:bg-luxury-gold selection:text-luxury-black font-sans">
      {!isAdminRoute && <Header />}

      <main className="flex-1 w-full">
        {renderCurrentPage()}
      </main>

      {!isAdminRoute && <Footer />}

      {/* Global Shopping Bag Slide-Over Drawer */}
      <CartDrawer />

      {/* Global Product Quick View Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseProductModal}
          onInquire={handleInquireProduct}
        />
      )}

      {/* Global Inquiry Modal */}
      {inquiryModalOpen && (
        <InquiryModal
          isOpen={inquiryModalOpen}
          onClose={handleCloseInquiryModal}
          prefilledProduct={inquiryProduct}
        />
      )}
    </div>
  );
}
