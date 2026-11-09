import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import InquiryForm from './InquiryForm';

export default function InquiryModal({ isOpen, onClose, prefilledProduct }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-luxury-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-luxury-darkCard border border-luxury-gold/50 rounded-sm shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-luxury-charcoal border border-luxury-gold/30 text-luxury-ivory hover:text-luxury-gold hover:border-luxury-gold transition-colors focus:outline-none"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="text-xs uppercase tracking-widest font-semibold text-luxury-gold block mb-1">
            Merchandise Inquiry
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-luxury-ivory">
            {prefilledProduct ? `Inquire About ${prefilledProduct.title}` : 'Inquire With Our Store'}
          </h2>
          <p className="text-xs text-luxury-muted mt-1">
            Questions regarding availability, collateral appraisal, or store pickup.
          </p>
        </div>

        <InquiryForm 
          prefilledProduct={prefilledProduct}
          initialCategory={prefilledProduct ? prefilledProduct.category : 'jewelry'}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
