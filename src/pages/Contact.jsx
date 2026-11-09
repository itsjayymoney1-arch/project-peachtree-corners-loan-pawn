import React, { useState } from 'react';
import { STORE_INFO } from '../data/storeInfo';
import { 
  Phone, 
  MapPin, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Clock, 
  Compass,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter your full name.';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number.';
    }
    if (!formData.message.trim() || formData.message.trim().length < 5) {
      newErrors.message = 'Please enter your message.';
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

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedData({ ...formData });
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
      subject: 'General Inquiry',
      message: ''
    });
  };

  return (
    <div className="space-y-16 pb-16 animate-fadeIn">
      
      {/* 1. EDITORIAL HEADER */}
      <section className="relative min-h-[45vh] flex items-center justify-center overflow-hidden border-b border-luxury-borderSubtle">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=2000&q=85"
            alt="Peachtree Corners Loan and Pawn store location"
            className="w-full h-full object-cover object-center filter brightness-[0.25]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-luxury-gold/20 text-luxury-goldLight border border-luxury-gold/40 text-xs uppercase tracking-widest font-semibold backdrop-blur-md">
            <MapPin className="w-3.5 h-3.5 text-luxury-gold" />
            Peachtree Corners, GA
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-luxury-ivory leading-tight">
            CONNECT WITH US
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-luxury-muted font-light leading-relaxed">
            Have questions about merchandise availability, jewelry appraisals, or collateral pawn services? We invite you to call, visit, or submit an inquiry below.
          </p>
        </div>
      </section>

      {/* 2. VERIFIED CONTACT DETAILS & INQUIRY FORM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          
          {/* Store Info Cards (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Primary Details Card */}
            <div className="p-6 rounded-sm bg-luxury-darkCard border border-luxury-gold/30 shadow-gold-glow space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest font-semibold text-luxury-gold block mb-1">
                  Business Location
                </span>
                <h3 className="font-editorial text-2xl font-semibold text-luxury-ivory">
                  {STORE_INFO.name}
                </h3>
              </div>

              {/* Physical Address */}
              <div className="space-y-2 pt-2 border-t border-luxury-borderSubtle">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-luxury-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-luxury-ivory text-sm font-semibold">Address</strong>
                    <p className="text-xs text-luxury-muted mt-0.5 leading-relaxed">
                      {STORE_INFO.address.street}<br />
                      {STORE_INFO.address.city}, {STORE_INFO.address.state} {STORE_INFO.address.zip}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={STORE_INFO.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-luxury-charcoal text-luxury-gold border border-luxury-gold/40 hover:bg-luxury-gold hover:text-luxury-black font-semibold text-xs uppercase tracking-wider transition-all"
                  >
                    <span>Get Directions on Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Telephone */}
              <div className="space-y-2 pt-4 border-t border-luxury-borderSubtle">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-luxury-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-luxury-ivory text-sm font-semibold">Store Telephone</strong>
                    <a
                      href={STORE_INFO.phone.telLink}
                      className="text-base font-bold text-luxury-gold hover:text-luxury-goldLight transition-colors block mt-0.5"
                    >
                      {STORE_INFO.phone.formatted}
                    </a>
                    <span className="text-xs text-luxury-muted">Click to call directly from your device</span>
                  </div>
                </div>
              </div>

              {/* Operating Hours Advisory */}
              <div className="p-4 rounded-sm bg-luxury-charcoal/80 border border-luxury-borderSubtle text-xs text-luxury-muted space-y-1.5">
                <div className="flex items-center gap-2 text-luxury-gold font-semibold uppercase tracking-wider text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Store Hours Notice</span>
                </div>
                <p className="leading-relaxed">
                  Operating hours may vary during holidays and weekends. To ensure prompt service or verify immediate staff availability, we encourage calling <strong>(678) 691-1692</strong> prior to visiting.
                </p>
              </div>

            </div>

            {/* Service Area Card */}
            <div className="p-5 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle text-xs space-y-2">
              <span className="text-luxury-gold uppercase tracking-wider font-semibold block text-[11px]">
                Serving Greater Gwinnett
              </span>
              <p className="text-luxury-muted leading-relaxed">
                Conveniently located on Jimmy Carter Boulevard, easily accessible to clients from Peachtree Corners, Norcross, Berkeley Lake, Lilburn, Duluth, and surrounding metro areas.
              </p>
            </div>

          </div>

          {/* Contact Inquiry Form (3 cols) */}
          <div className="lg:col-span-3 bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm p-6 sm:p-8 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-luxury-gold/15 text-luxury-goldLight border border-luxury-gold/30 text-xs uppercase tracking-wider font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-luxury-gold" />
                Demonstration Contact Form
              </div>
              <h2 className="font-editorial text-3xl font-semibold text-luxury-ivory">
                Send Us a Message
              </h2>
              <p className="text-xs text-luxury-muted mt-1">
                This is a frontend demonstration prototype. You can test form validation and response confirmation safely.
              </p>
            </div>

            {submittedData ? (
              <div className="bg-luxury-charcoal/70 border border-luxury-gold/40 rounded-sm p-6 text-center space-y-4 animate-fadeIn">
                <div className="w-12 h-12 mx-auto rounded-full bg-luxury-gold/20 border border-luxury-gold flex items-center justify-center text-luxury-gold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-editorial text-2xl font-semibold text-luxury-ivory">
                  Demonstration Message Received
                </h3>
                <p className="text-xs text-luxury-muted max-w-md mx-auto">
                  Thank you for trying the contact demonstration, <strong>{submittedData.name}</strong>! As this is an independent prototype, no live transmission occurred.
                </p>
                <div className="p-3 bg-luxury-darkCard rounded text-left text-xs space-y-1 text-luxury-muted">
                  <p><strong className="text-luxury-ivory">Subject:</strong> {submittedData.subject}</p>
                  <p><strong className="text-luxury-ivory">Phone:</strong> {submittedData.phone}</p>
                  <p><strong className="text-luxury-ivory">Message:</strong> {submittedData.message}</p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={resetForm}
                    className="text-xs uppercase tracking-wider text-luxury-gold hover:underline font-semibold"
                  >
                    Send Another Demonstration Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-medium uppercase tracking-wider text-luxury-ivory mb-1">
                      Your Name <span className="text-luxury-gold">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. John Miller"
                      className={`w-full px-3.5 py-2.5 bg-luxury-charcoal border rounded-sm text-sm text-luxury-ivory placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-gold transition-colors ${
                        errors.name ? 'border-red-500/80' : 'border-luxury-borderSubtle'
                      }`}
                    />
                    {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-medium uppercase tracking-wider text-luxury-ivory mb-1">
                      Email Address <span className="text-luxury-gold">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. john@example.com"
                      className={`w-full px-3.5 py-2.5 bg-luxury-charcoal border rounded-sm text-sm text-luxury-ivory placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-gold transition-colors ${
                        errors.email ? 'border-red-500/80' : 'border-luxury-borderSubtle'
                      }`}
                    />
                    {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-phone" className="block text-xs font-medium uppercase tracking-wider text-luxury-ivory mb-1">
                      Phone Number <span className="text-luxury-gold">*</span>
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 678-555-0100"
                      className={`w-full px-3.5 py-2.5 bg-luxury-charcoal border rounded-sm text-sm text-luxury-ivory placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-gold transition-colors ${
                        errors.phone ? 'border-red-500/80' : 'border-luxury-borderSubtle'
                      }`}
                    />
                    {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-xs font-medium uppercase tracking-wider text-luxury-ivory mb-1">
                      Inquiry Topic
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm text-sm text-luxury-ivory focus:outline-none focus:border-luxury-gold transition-colors"
                    >
                      <option value="General Inquiry">General Store Inquiry</option>
                      <option value="Jewelry Inquiry">Jewelry or Watch Availability</option>
                      <option value="Selling Merchandise">Selling Merchandise</option>
                      <option value="Collateral Pawn Questions">Collateral Pawn Questions</option>
                      <option value="Contractor Tools">Contractor Tools & Equipment</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-msg" className="block text-xs font-medium uppercase tracking-wider text-luxury-ivory mb-1">
                    Your Message <span className="text-luxury-gold">*</span>
                  </label>
                  <textarea
                    id="contact-msg"
                    rows="4"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can our store team assist you today?"
                    className={`w-full px-3.5 py-2.5 bg-luxury-charcoal border rounded-sm text-sm text-luxury-ivory placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-gold transition-colors ${
                      errors.message ? 'border-red-500/80' : 'border-luxury-borderSubtle'
                    }`}
                  />
                  {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Validating Demo...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* 3. INTERACTIVE MAP SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-luxury-gold/30 rounded-sm overflow-hidden bg-luxury-darkCard">
          <div className="p-4 sm:p-6 border-b border-luxury-borderSubtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-luxury-gold block">
                Interactive Map & Location
              </span>
              <h3 className="font-editorial text-xl sm:text-2xl font-semibold text-luxury-ivory">
                7040 Jimmy Carter Blvd, Suite 4, Peachtree Corners, GA 30092
              </h3>
            </div>
            <a
              href={STORE_INFO.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-1.5 shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Google Maps</span>
            </a>
          </div>

          {/* Embedded Google Map iframe with exact query */}
          <div className="w-full h-80 sm:h-96 bg-luxury-charcoal relative">
            <iframe
              title="Peachtree Corners Loan and Pawn Location Map"
              src="https://maps.google.com/maps?q=7040+Jimmy+Carter+Boulevard+Suite+4+Peachtree+Corners+GA+30092&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full border-0 filter grayscale-[40%] contrast-[1.1] opacity-90 hover:opacity-100 transition-opacity"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      </section>

    </div>
  );
}
