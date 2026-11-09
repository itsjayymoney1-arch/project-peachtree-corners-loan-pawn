import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Send, Phone, MapPin } from 'lucide-react';
import { STORE_INFO } from '../data/storeInfo';

export default function InquiryForm({ initialCategory = 'jewelry', initialDescription = '', prefilledProduct = null, onClose = null }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: initialCategory,
    description: prefilledProduct ? `Inquiring about demonstration item: ${prefilledProduct.title}` : initialDescription,
    estimatedValue: prefilledProduct ? prefilledProduct.estimatedValue : '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter your full name (minimum 2 characters).';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number.';
    }
    if (!formData.category) {
      newErrors.category = 'Please select an item category.';
    }
    if (!formData.description.trim() || formData.description.trim().length < 5) {
      newErrors.description = 'Please provide a brief description of the item.';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Simulate clean frontend demonstration submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedData({ ...formData, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    }, 600);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const resetForm = () => {
    setSubmittedData(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      category: 'jewelry',
      description: '',
      estimatedValue: '',
      message: ''
    });
  };

  if (submittedData) {
    return (
      <div className="bg-luxury-darkCard border border-luxury-gold/50 rounded-sm p-6 sm:p-8 text-center space-y-6 shadow-gold-glow animate-fadeIn">
        <div className="w-16 h-16 mx-auto rounded-full bg-luxury-gold/20 border border-luxury-gold flex items-center justify-center text-luxury-gold">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-luxury-gold/15 text-luxury-goldLight border border-luxury-gold/30">
            <Sparkles className="w-3.5 h-3.5 text-luxury-gold" />
            Demonstration Success Confirmation
          </span>
          <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-luxury-ivory">
            Demonstration Inquiry Recorded
          </h3>
          <p className="text-sm text-luxury-muted max-w-md mx-auto">
            This is a frontend demonstration prototype. No actual customer data or message was sent to the live business.
          </p>
        </div>

        {/* Summary Receipt Box */}
        <div className="text-left bg-luxury-charcoal/80 border border-luxury-borderSubtle rounded-sm p-4 text-xs space-y-2 max-w-md mx-auto">
          <div className="flex justify-between border-b border-luxury-borderSubtle pb-2 text-luxury-gold font-medium">
            <span>Customer Name:</span>
            <span className="text-luxury-ivory">{submittedData.name}</span>
          </div>
          <div className="flex justify-between border-b border-luxury-borderSubtle pb-2 text-luxury-gold font-medium">
            <span>Category:</span>
            <span className="text-luxury-ivory capitalize">{submittedData.category}</span>
          </div>
          <div className="flex justify-between border-b border-luxury-borderSubtle pb-2 text-luxury-gold font-medium">
            <span>Item:</span>
            <span className="text-luxury-ivory truncate max-w-[200px]">{submittedData.description}</span>
          </div>
          {submittedData.estimatedValue && (
            <div className="flex justify-between border-b border-luxury-borderSubtle pb-2 text-luxury-gold font-medium">
              <span>Est. Value:</span>
              <span className="text-luxury-ivory">{submittedData.estimatedValue}</span>
            </div>
          )}
          <div className="flex justify-between text-luxury-muted text-[11px] pt-1">
            <span>Prototype Action:</span>
            <span>Frontend State Only (Isolated)</span>
          </div>
        </div>

        {/* Real Store Connection CTA */}
        <div className="p-4 rounded-sm bg-luxury-charcoal/40 border border-luxury-gold/20 text-xs text-luxury-muted space-y-3 max-w-md mx-auto">
          <p className="text-luxury-ivory font-medium">
            To speak directly with Peachtree Corners Loan & Pawn right now:
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <a
              href={STORE_INFO.phone.telLink}
              className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-sm bg-luxury-gold text-luxury-black font-semibold uppercase tracking-wider text-xs hover:brightness-110"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call (678) 691-1692</span>
            </a>
            <a
              href={STORE_INFO.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-sm border border-luxury-gold text-luxury-gold text-xs uppercase tracking-wider hover:bg-luxury-gold/10"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Get Directions</span>
            </a>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={resetForm}
            className="text-xs uppercase tracking-wider text-luxury-gold hover:underline"
          >
            Submit Another Demonstration Inquiry
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs uppercase tracking-wider text-luxury-muted hover:text-luxury-ivory"
            >
              Close Window
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {/* Demonstration Notice */}
      <div className="p-3 rounded-sm bg-luxury-charcoal/80 border border-luxury-gold/30 text-xs text-luxury-muted flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-luxury-gold shrink-0 mt-0.5" />
        <p>
          <strong className="text-luxury-gold font-semibold uppercase tracking-wide block sm:inline mr-1">
            Demonstration Form Only:
          </strong>
          This form is a frontend prototype. No personal or financial records are stored or sent to external databases.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name Field */}
        <div>
          <label htmlFor="inquiry-name" className="block text-xs font-medium uppercase tracking-wider text-luxury-ivory mb-1">
            Your Full Name <span className="text-luxury-gold">*</span>
          </label>
          <input
            id="inquiry-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Eleanor Vance"
            className={`w-full px-3.5 py-2.5 bg-luxury-charcoal border rounded-sm text-sm text-luxury-ivory placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-gold transition-colors ${
              errors.name ? 'border-red-500/80' : 'border-luxury-borderSubtle'
            }`}
          />
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="inquiry-email" className="block text-xs font-medium uppercase tracking-wider text-luxury-ivory mb-1">
            Email Address <span className="text-luxury-gold">*</span>
          </label>
          <input
            id="inquiry-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. eleanor@example.com"
            className={`w-full px-3.5 py-2.5 bg-luxury-charcoal border rounded-sm text-sm text-luxury-ivory placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-gold transition-colors ${
              errors.email ? 'border-red-500/80' : 'border-luxury-borderSubtle'
            }`}
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Phone Field */}
        <div>
          <label htmlFor="inquiry-phone" className="block text-xs font-medium uppercase tracking-wider text-luxury-ivory mb-1">
            Phone Number <span className="text-luxury-gold">*</span>
          </label>
          <input
            id="inquiry-phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. 678-555-0199"
            className={`w-full px-3.5 py-2.5 bg-luxury-charcoal border rounded-sm text-sm text-luxury-ivory placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-gold transition-colors ${
              errors.phone ? 'border-red-500/80' : 'border-luxury-borderSubtle'
            }`}
          />
          {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
        </div>

        {/* Category Field */}
        <div>
          <label htmlFor="inquiry-category" className="block text-xs font-medium uppercase tracking-wider text-luxury-ivory mb-1">
            Item Category <span className="text-luxury-gold">*</span>
          </label>
          <select
            id="inquiry-category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm text-sm text-luxury-ivory focus:outline-none focus:border-luxury-gold transition-colors"
          >
            <option value="jewelry">Jewelry & Watches</option>
            <option value="electronics">Electronics & Tech</option>
            <option value="tools">Tools & Equipment</option>
            <option value="instruments">Musical Instruments</option>
            <option value="collectibles">Collectibles & Coins</option>
            <option value="other">Other Merchandise</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Item Description (2 cols) */}
        <div className="sm:col-span-2">
          <label htmlFor="inquiry-desc" className="block text-xs font-medium uppercase tracking-wider text-luxury-ivory mb-1">
            Item Name / Description <span className="text-luxury-gold">*</span>
          </label>
          <input
            id="inquiry-desc"
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g. 14K Gold rope chain, DeWalt tool kit, etc."
            className={`w-full px-3.5 py-2.5 bg-luxury-charcoal border rounded-sm text-sm text-luxury-ivory placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-gold transition-colors ${
              errors.description ? 'border-red-500/80' : 'border-luxury-borderSubtle'
            }`}
          />
          {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
        </div>

        {/* Optional Estimated Value (1 col) */}
        <div>
          <label htmlFor="inquiry-value" className="block text-xs font-medium uppercase tracking-wider text-luxury-ivory mb-1">
            Est. Value <span className="text-luxury-muted text-[10px]">(Optional)</span>
          </label>
          <input
            id="inquiry-value"
            type="text"
            name="estimatedValue"
            value={formData.estimatedValue}
            onChange={handleChange}
            placeholder="e.g. $500"
            className="w-full px-3.5 py-2.5 bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm text-sm text-luxury-ivory placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-gold transition-colors"
          />
        </div>
      </div>

      {/* Message Field */}
      <div>
        <label htmlFor="inquiry-msg" className="block text-xs font-medium uppercase tracking-wider text-luxury-ivory mb-1">
          Additional Details or Questions
        </label>
        <textarea
          id="inquiry-msg"
          rows="3"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Mention condition, original packaging, receipts, or any questions for our store team..."
          className="w-full px-3.5 py-2.5 bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm text-sm text-luxury-ivory placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-gold transition-colors"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-3 rounded-sm bg-gradient-to-r from-luxury-gold to-luxury-goldLight text-luxury-black font-semibold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Validating Demo...' : 'Send Demonstration Inquiry'}</span>
        </button>
      </div>
    </form>
  );
}
