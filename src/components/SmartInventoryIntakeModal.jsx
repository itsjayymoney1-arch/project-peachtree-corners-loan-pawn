import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Trash2, 
  Plus, 
  ShieldCheck, 
  Layers, 
  Eye, 
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  FileText,
  DollarSign
} from 'lucide-react';
import { aiVisionService } from '../services/aiVisionService';
import { useApp } from '../context/AppContext';

export default function SmartInventoryIntakeModal({ isOpen, onClose, onProductSaved }) {
  const { addProduct, currentAdmin } = useApp();
  
  // Intake Modes: 'manual' or 'ai_quick' or 'batch'
  const [intakeMode, setIntakeMode] = useState('ai_quick');

  // MODE 1: MANUAL ADD FORM STATE
  const [manualTitle, setManualTitle] = useState('');
  const [manualCategory, setManualCategory] = useState('jewelry');
  const [manualSubcategory, setManualSubcategory] = useState('Estate Jewelry');
  const [manualBrand, setManualBrand] = useState('');
  const [manualModel, setManualModel] = useState('');
  const [manualSku, setManualSku] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualCondition, setManualCondition] = useState('Polished & Inspected');
  const [manualPrice, setManualPrice] = useState('');
  const [manualQuantity, setManualQuantity] = useState(1);
  const [manualFeatured, setManualFeatured] = useState(false);
  const [manualIsNewArrival, setManualIsNewArrival] = useState(true);
  const [manualIsVaultDrop, setManualIsVaultDrop] = useState(false);
  const [manualImages, setManualImages] = useState([]);
  const [manualStatus, setManualStatus] = useState('available');

  // MODE 2: QUICK ADD AI STATE
  // Steps: 'upload' -> 'analyzing' -> 'review' -> 'success'
  const [aiStep, setAiStep] = useState('upload');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  
  // Confirmed fields during review
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewCategory, setReviewCategory] = useState('jewelry');
  const [reviewSubcategory, setReviewSubcategory] = useState('');
  const [reviewBrand, setReviewBrand] = useState('');
  const [reviewModel, setReviewModel] = useState('');
  const [reviewCondition, setReviewCondition] = useState('');
  const [reviewDescription, setReviewDescription] = useState('');
  const [reviewPrice, setReviewPrice] = useState('');
  const [reviewQuantity, setReviewQuantity] = useState(1);
  const [reviewFeatured, setReviewFeatured] = useState(false);
  const [reviewIsVaultDrop, setReviewIsVaultDrop] = useState(false);

  // Status & Error
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // File Upload Handlers (Supports drag & drop, file picker, and camera simulation)
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Convert to preview data URLs
    const newPhotos = files.map(file => URL.createObjectURL(file));
    if (intakeMode === 'manual') {
      setManualImages(prev => [...prev, ...newPhotos]);
    } else {
      setUploadedPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index, isManual = false) => {
    if (isManual) {
      setManualImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Add realistic stock photo sample for quick in-browser demonstration
  const handleAddDemoPhoto = (type = 'watch') => {
    const samples = {
      watch: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
      gold: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
      tool: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1000&q=80',
      electronics: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80'
    };
    const sampleUrl = samples[type] || samples.watch;
    if (intakeMode === 'manual') {
      setManualImages(prev => [...prev, sampleUrl]);
    } else {
      setUploadedPhotos(prev => [...prev, sampleUrl]);
    }
  };

  // Trigger AI Analysis
  const runAiAnalysis = async () => {
    if (uploadedPhotos.length === 0) {
      setErrorMessage("Please upload or capture at least one photograph to analyze.");
      return;
    }
    setErrorMessage('');
    setAiStep('analyzing');

    try {
      const result = await aiVisionService.analyzeProductPhotos(uploadedPhotos);
      setAiAnalysisResult(result);

      // Prepopulate human review fields
      setReviewTitle(result.suggestedTitle);
      setReviewCategory(result.suggestedCategory);
      setReviewSubcategory(result.suggestedSubcategory);
      setReviewBrand(result.suggestedBrand);
      setReviewModel(result.suggestedModel);
      setReviewCondition(result.suggestedCondition);
      setReviewDescription(result.suggestedDescription);
      setReviewPrice(result.suggestedPrice || '');
      setReviewQuantity(result.defaultQuantity || 1);

      setAiStep('review');
    } catch (err) {
      setErrorMessage(err.message || "AI vision analysis failed. You may switch to Manual Add mode.");
      setAiStep('upload');
    }
  };

  // Save / Publish AI Product
  const handlePublishAiProduct = async (action = 'publish') => {
    if (!reviewPrice || parseFloat(reviewPrice) <= 0) {
      setErrorMessage("Store Staff must verify and confirm the actual selling price.");
      return;
    }

    try {
      const newProduct = addProduct({
        title: reviewTitle,
        category: reviewCategory,
        subcategory: reviewSubcategory,
        brand: reviewBrand,
        model: reviewModel,
        condition: reviewCondition,
        description: reviewDescription,
        price: parseFloat(reviewPrice),
        quantity: parseInt(reviewQuantity, 10) || 1,
        images: uploadedPhotos,
        status: action === 'draft' ? 'draft' : 'available',
        featured: reviewFeatured,
        isNewArrival: true,
        isVaultDrop: reviewIsVaultDrop,
        aiGenerated: true,
        aiConfidence: aiAnalysisResult?.confidence || null
      });

      if (action === 'publish_and_another') {
        // Reset AI workflow for next product
        setUploadedPhotos([]);
        setAiAnalysisResult(null);
        setAiStep('upload');
        setStatusMessage(`Published "${newProduct.title}". Ready for next item!`);
        setTimeout(() => setStatusMessage(''), 3000);
      } else {
        onProductSaved && onProductSaved(newProduct);
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to save product.");
    }
  };

  // Save / Publish Manual Product
  const handleSaveManualProduct = (action = 'publish') => {
    if (!manualTitle || !manualPrice) {
      setErrorMessage("Title and Selling Price are required to publish merchandise.");
      return;
    }

    try {
      const newProduct = addProduct({
        title: manualTitle,
        category: manualCategory,
        subcategory: manualSubcategory,
        brand: manualBrand,
        model: manualModel,
        sku: manualSku || undefined,
        description: manualDescription,
        condition: manualCondition,
        price: parseFloat(manualPrice),
        quantity: parseInt(manualQuantity, 10) || 1,
        images: manualImages.length ? manualImages : undefined,
        status: action === 'draft' ? 'draft' : 'available',
        featured: manualFeatured,
        isNewArrival: manualIsNewArrival,
        isVaultDrop: manualIsVaultDrop,
        aiGenerated: false
      });

      if (action === 'publish_and_another') {
        // Reset manual form
        setManualTitle('');
        setManualBrand('');
        setManualModel('');
        setManualPrice('');
        setManualDescription('');
        setManualImages([]);
        setStatusMessage(`Merchandise "${newProduct.title}" cataloged! Ready for next.`);
        setTimeout(() => setStatusMessage(''), 3000);
      } else {
        onProductSaved && onProductSaved(newProduct);
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to save product.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-luxury-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-luxury-darkCard border border-luxury-gold/50 rounded-sm shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-luxury-black border-b border-luxury-borderSubtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-luxury-charcoal border border-luxury-gold/40 flex items-center justify-center text-luxury-gold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-editorial text-lg sm:text-xl font-bold text-luxury-ivory tracking-wide flex items-center gap-2">
                <span>SMART INVENTORY INTAKE</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-luxury-gold/15 text-luxury-gold border border-luxury-gold/30">
                  Store Staff Portal
                </span>
              </h2>
              <p className="text-[11px] text-luxury-muted">
                Fast two-mode product entry designed for store floor intake and appraisal counters.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-sm text-luxury-muted hover:text-luxury-ivory hover:bg-luxury-charcoal transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs (Two Distinct Modes) */}
        <div className="p-3 bg-luxury-charcoal/90 border-b border-luxury-borderSubtle flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-2">
            <button
              onClick={() => { setIntakeMode('ai_quick'); setErrorMessage(''); }}
              className={`px-4 py-2 rounded-sm text-xs uppercase tracking-wider font-bold flex items-center gap-2 transition-all ${
                intakeMode === 'ai_quick' 
                  ? 'bg-luxury-gold text-luxury-black shadow-gold-glow' 
                  : 'bg-luxury-black text-luxury-muted hover:text-luxury-ivory border border-luxury-borderSubtle'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Mode 2: Quick Add AI (Photo-First)</span>
            </button>

            <button
              onClick={() => { setIntakeMode('manual'); setErrorMessage(''); }}
              className={`px-4 py-2 rounded-sm text-xs uppercase tracking-wider font-bold flex items-center gap-2 transition-all ${
                intakeMode === 'manual' 
                  ? 'bg-luxury-gold text-luxury-black shadow-gold-glow' 
                  : 'bg-luxury-black text-luxury-muted hover:text-luxury-ivory border border-luxury-borderSubtle'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Mode 1: Manual Add</span>
            </button>
          </div>

          <span className="text-[10px] text-luxury-goldLight font-mono">
            Appraiser: {currentAdmin?.name || 'Staff Member'}
          </span>
        </div>

        {/* Global Notifications / Error Messages */}
        {statusMessage && (
          <div className="p-3 bg-emerald-950/80 border-b border-emerald-700/60 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-950/80 border-b border-red-700/60 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Hidden File Input for Mobile Camera / Drag Drop */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          capture="environment"
          onChange={handlePhotoSelect}
          className="hidden"
        />

        {/* ======================================================== */}
        {/* MODE 2: QUICK ADD AI (PHOTO-FIRST WORKFLOW)             */}
        {/* ======================================================== */}
        {intakeMode === 'ai_quick' && (
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            
            {/* STEP 1: PHOTO UPLOAD */}
            {aiStep === 'upload' && (
              <div className="space-y-6 text-center">
                
                {/* Drag & Drop Hero Box */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-luxury-gold/40 hover:border-luxury-gold rounded-sm p-8 sm:p-12 bg-luxury-charcoal/40 hover:bg-luxury-charcoal/70 transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 group"
                >
                  <div className="w-16 h-16 rounded-full bg-luxury-black border border-luxury-gold/50 flex items-center justify-center text-luxury-gold group-hover:scale-110 transition-transform shadow-gold-glow">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-editorial text-xl font-bold text-luxury-ivory">
                      TAP TO SNAP OR UPLOAD MERCHANDISE PHOTOS
                    </h3>
                    <p className="text-xs text-luxury-muted mt-1 max-w-md mx-auto">
                      Photograph markings, hallmarks, model numbers, or dial condition. Our vision model extracts details automatically.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-6 py-2.5 rounded-sm bg-luxury-gold text-luxury-black font-bold text-xs uppercase tracking-wider"
                  >
                    Select Photos
                  </button>
                </div>

                {/* Demonstration Quick-Pick Sample Buttons */}
                <div className="p-3 rounded-sm bg-luxury-charcoal/60 border border-luxury-borderSubtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <span className="text-luxury-muted font-medium">Or test with one-click showcase sample:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddDemoPhoto('watch')}
                      className="px-2.5 py-1 bg-luxury-darkCard border border-luxury-borderSubtle hover:border-luxury-gold text-luxury-ivory rounded-sm"
                    >
                      + Swiss Watch
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddDemoPhoto('gold')}
                      className="px-2.5 py-1 bg-luxury-darkCard border border-luxury-borderSubtle hover:border-luxury-gold text-luxury-ivory rounded-sm"
                    >
                      + 14K Gold Chain
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddDemoPhoto('tool')}
                      className="px-2.5 py-1 bg-luxury-darkCard border border-luxury-borderSubtle hover:border-luxury-gold text-luxury-ivory rounded-sm"
                    >
                      + Cordless Tool
                    </button>
                  </div>
                </div>

                {/* Uploaded Photos Thumbnails Preview */}
                {uploadedPhotos.length > 0 && (
                  <div className="space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-luxury-gold">
                        Selected Photos ({uploadedPhotos.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-luxury-gold hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add More Photos</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {uploadedPhotos.map((photo, idx) => (
                        <div key={idx} className="relative aspect-square rounded-sm overflow-hidden border border-luxury-gold/40 group bg-luxury-charcoal">
                          <img src={photo} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute top-1 right-1 p-1 rounded bg-luxury-black/80 text-luxury-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 bg-luxury-gold text-luxury-black text-[9px] font-bold px-1 rounded">
                              Cover
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Step 2 CTA: Run Analysis */}
                    <div className="pt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={runAiAnalysis}
                        className="px-8 py-3.5 rounded-sm bg-gradient-to-r from-luxury-gold via-luxury-goldLight to-luxury-gold text-luxury-black font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-gold-glow flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Analyze Photographs with Vision AI</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* STEP 2: ANALYZING STATE */}
            {aiStep === 'analyzing' && (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full border-4 border-luxury-gold border-t-transparent animate-spin" />
                <h3 className="font-editorial text-2xl font-bold text-luxury-ivory">
                  Analyzing Product Photographs...
                </h3>
                <p className="text-xs text-luxury-muted max-w-sm mx-auto">
                  Extracting observable markings, category classifications, cosmetic condition notes, and editorial descriptions.
                </p>
              </div>
            )}

            {/* STEP 3: HUMAN REVIEW & VERIFICATION */}
            {aiStep === 'review' && aiAnalysisResult && (
              <div className="space-y-6">
                
                {/* Confidence & Safety Guardrails Bar */}
                <div className="p-4 rounded-sm bg-luxury-charcoal/80 border border-luxury-gold/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-luxury-gold shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-luxury-gold uppercase tracking-wider block">
                        AI Analysis Complete &bull; Staff Review Required
                      </span>
                      <p className="text-[11px] text-luxury-muted">
                        Visual inspection suggestions generated. Staff must confirm store selling price and physical authenticity.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAiStep('upload')}
                    className="text-xs text-luxury-gold hover:underline flex items-center gap-1 shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Change Photos</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Photo Preview Column */}
                  <div className="md:col-span-4 space-y-3">
                    <div className="aspect-square rounded-sm overflow-hidden border border-luxury-borderSubtle bg-luxury-charcoal">
                      <img
                        src={aiAnalysisResult.primaryImage}
                        alt="Analyzed item"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-3 bg-luxury-charcoal/50 border border-luxury-borderSubtle rounded-sm text-xs space-y-2">
                      <span className="text-[10px] uppercase font-bold text-luxury-gold block">
                        Visual Inspection Notes:
                      </span>
                      <p className="text-luxury-muted text-[11px] leading-relaxed">
                        {aiAnalysisResult.cosmeticObservations}
                      </p>
                      <div className="pt-1 text-[10px] text-amber-300 flex items-start gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                        <span>Precious metal karat and operational movements require in-person tool confirmation.</span>
                      </div>
                    </div>
                  </div>

                  {/* Editable Fields Column */}
                  <div className="md:col-span-8 space-y-4 text-xs">
                    
                    {/* Suggested Title */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[11px] uppercase tracking-wider text-luxury-muted font-bold">
                          Product Title *
                        </label>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800">
                          AI Suggested
                        </span>
                      </div>
                      <input
                        type="text"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3.5 py-2 text-luxury-ivory font-medium focus:border-luxury-gold outline-none"
                      />
                    </div>

                    {/* Category & Brand */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-bold">
                          Category
                        </label>
                        <select
                          value={reviewCategory}
                          onChange={(e) => setReviewCategory(e.target.value)}
                          className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3 py-2 text-luxury-ivory focus:border-luxury-gold outline-none"
                        >
                          <option value="jewelry">Jewelry &amp; Watches</option>
                          <option value="electronics">Electronics &amp; Tech</option>
                          <option value="tools">Tools &amp; Equipment</option>
                          <option value="instruments">Musical Instruments</option>
                          <option value="collectibles">Collectibles</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-bold">
                          Brand / Maker
                        </label>
                        <input
                          type="text"
                          value={reviewBrand}
                          onChange={(e) => setReviewBrand(e.target.value)}
                          className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3 py-2 text-luxury-ivory focus:border-luxury-gold outline-none"
                        />
                      </div>
                    </div>

                    {/* Condition & Model */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-bold">
                          Condition
                        </label>
                        <input
                          type="text"
                          value={reviewCondition}
                          onChange={(e) => setReviewCondition(e.target.value)}
                          className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3 py-2 text-luxury-ivory focus:border-luxury-gold outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-bold">
                          Model / Style
                        </label>
                        <input
                          type="text"
                          value={reviewModel}
                          onChange={(e) => setReviewModel(e.target.value)}
                          className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3 py-2 text-luxury-ivory focus:border-luxury-gold outline-none"
                        />
                      </div>
                    </div>

                    {/* PRICING & QUANTITY (MANDATORY HUMAN CONFIRMATION) */}
                    <div className="p-4 rounded-sm bg-luxury-gold/10 border border-luxury-gold/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-luxury-goldLight mb-1 font-bold">
                          Confirmed Store Selling Price ($) *
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-gold" />
                          <input
                            type="number"
                            step="any"
                            required
                            value={reviewPrice}
                            onChange={(e) => setReviewPrice(e.target.value)}
                            placeholder="e.g. 2450.00"
                            className="w-full bg-luxury-black border border-luxury-gold rounded-sm pl-8 pr-3 py-2 font-mono text-base font-bold text-luxury-gold focus:outline-none"
                          />
                        </div>
                        <span className="text-[10px] text-luxury-muted mt-1 block">
                          Staff must set the final selling price.
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-luxury-goldLight mb-1 font-bold">
                          Quantity in Showroom
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={reviewQuantity}
                          onChange={(e) => setReviewQuantity(e.target.value)}
                          className="w-full bg-luxury-black border border-luxury-gold/50 rounded-sm px-3 py-2 text-luxury-ivory font-mono text-base font-bold focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-bold">
                        Editorial Catalog Description
                      </label>
                      <textarea
                        rows="3"
                        value={reviewDescription}
                        onChange={(e) => setReviewDescription(e.target.value)}
                        className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm p-2.5 text-xs text-luxury-ivory focus:border-luxury-gold outline-none"
                      />
                    </div>

                    {/* Checkbox Options */}
                    <div className="flex flex-wrap gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-luxury-ivory select-none">
                        <input
                          type="checkbox"
                          checked={reviewIsVaultDrop}
                          onChange={(e) => setReviewIsVaultDrop(e.target.checked)}
                          className="rounded border-luxury-borderSubtle text-luxury-gold focus:ring-0 bg-luxury-charcoal"
                        />
                        <span>Feature in Saturday Vault Drop</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-luxury-ivory select-none">
                        <input
                          type="checkbox"
                          checked={reviewFeatured}
                          onChange={(e) => setReviewFeatured(e.target.checked)}
                          className="rounded border-luxury-borderSubtle text-luxury-gold focus:ring-0 bg-luxury-charcoal"
                        />
                        <span>Feature on Homepage</span>
                      </label>
                    </div>

                  </div>

                </div>

                {/* STEP 4: SAVE OR PUBLISH BUTTONS */}
                <div className="pt-4 border-t border-luxury-borderSubtle flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handlePublishAiProduct('draft')}
                    className="w-full sm:w-auto px-5 py-2.5 border border-luxury-borderSubtle text-luxury-muted hover:text-luxury-ivory text-xs uppercase font-semibold rounded-sm"
                  >
                    Save as Draft
                  </button>

                  <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => handlePublishAiProduct('publish_and_another')}
                      className="px-5 py-2.5 bg-luxury-charcoal border border-luxury-gold text-luxury-gold hover:bg-luxury-gold/10 font-bold text-xs uppercase tracking-wider rounded-sm transition-all"
                    >
                      Publish &amp; Add Another
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePublishAiProduct('publish')}
                      className="px-6 py-2.5 bg-luxury-gold text-luxury-black font-bold text-xs uppercase tracking-widest rounded-sm hover:brightness-110 shadow-gold-glow transition-all"
                    >
                      Publish Product Immediately
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 1: MANUAL ADD WORKFLOW                              */}
        {/* ======================================================== */}
        {intakeMode === 'manual' && (
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Details */}
              <div className="md:col-span-8 space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-bold">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="e.g. 14K Solid Gold Figaro Chain"
                    className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3.5 py-2.5 text-luxury-ivory focus:border-luxury-gold outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-bold">
                      Category *
                    </label>
                    <select
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value)}
                      className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3 py-2 text-luxury-ivory focus:border-luxury-gold outline-none"
                    >
                      <option value="jewelry">Jewelry &amp; Watches</option>
                      <option value="electronics">Electronics</option>
                      <option value="tools">Tools &amp; Equipment</option>
                      <option value="instruments">Musical Instruments</option>
                      <option value="collectibles">Collectibles</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-bold">
                      Subcategory
                    </label>
                    <input
                      type="text"
                      value={manualSubcategory}
                      onChange={(e) => setManualSubcategory(e.target.value)}
                      placeholder="e.g. Diamond Chains"
                      className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3 py-2 text-luxury-ivory focus:border-luxury-gold outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-bold">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={manualBrand}
                      onChange={(e) => setManualBrand(e.target.value)}
                      placeholder="e.g. Rolex, DeWalt"
                      className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3 py-2 text-luxury-ivory focus:border-luxury-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-bold">
                      Model / Reference
                    </label>
                    <input
                      type="text"
                      value={manualModel}
                      onChange={(e) => setManualModel(e.target.value)}
                      placeholder="e.g. Ref 116610"
                      className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3 py-2 text-luxury-ivory focus:border-luxury-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-bold">
                      Custom SKU (Optional)
                    </label>
                    <input
                      type="text"
                      value={manualSku}
                      onChange={(e) => setManualSku(e.target.value)}
                      placeholder="Auto-generated if empty"
                      className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3 py-2 text-luxury-ivory font-mono focus:border-luxury-gold outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-bold">
                      Condition
                    </label>
                    <input
                      type="text"
                      value={manualCondition}
                      onChange={(e) => setManualCondition(e.target.value)}
                      placeholder="e.g. Polished & Inspected"
                      className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3 py-2 text-luxury-ivory focus:border-luxury-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-luxury-goldLight mb-1 font-bold">
                      Selling Price ($) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={manualPrice}
                      onChange={(e) => setManualPrice(e.target.value)}
                      placeholder="1850.00"
                      className="w-full bg-luxury-charcoal border border-luxury-gold rounded-sm px-3 py-2 text-luxury-gold font-bold text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-bold">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={manualQuantity}
                      onChange={(e) => setManualQuantity(e.target.value)}
                      className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3 py-2 text-luxury-ivory focus:border-luxury-gold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-bold">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                    placeholder="Enter detailed merchandise description and inspection notes..."
                    className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm p-3 text-luxury-ivory focus:border-luxury-gold outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-luxury-ivory select-none">
                    <input
                      type="checkbox"
                      checked={manualIsVaultDrop}
                      onChange={(e) => setManualIsVaultDrop(e.target.checked)}
                      className="rounded border-luxury-borderSubtle text-luxury-gold focus:ring-0 bg-luxury-charcoal"
                    />
                    <span>Include in Weekly Vault Drop</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-luxury-ivory select-none">
                    <input
                      type="checkbox"
                      checked={manualFeatured}
                      onChange={(e) => setManualFeatured(e.target.checked)}
                      className="rounded border-luxury-borderSubtle text-luxury-gold focus:ring-0 bg-luxury-charcoal"
                    />
                    <span>Feature on Homepage</span>
                  </label>
                </div>

              </div>

              {/* Right Column: Photos */}
              <div className="md:col-span-4 space-y-4">
                <span className="text-[11px] uppercase tracking-wider text-luxury-gold font-bold block">
                  Product Photographs
                </span>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-luxury-gold/50 rounded-sm p-6 text-center bg-luxury-charcoal/40 hover:bg-luxury-charcoal cursor-pointer space-y-2"
                >
                  <Camera className="w-6 h-6 text-luxury-gold mx-auto" />
                  <p className="text-xs text-luxury-ivory font-medium">Upload Photos</p>
                  <p className="text-[10px] text-luxury-muted">Drag or click to browse</p>
                </div>

                {manualImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {manualImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-sm overflow-hidden border border-luxury-borderSubtle group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx, true)}
                          className="absolute top-1 right-1 p-1 bg-luxury-black/80 text-luxury-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-luxury-borderSubtle flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleSaveManualProduct('draft')}
                className="w-full sm:w-auto px-5 py-2.5 border border-luxury-borderSubtle text-luxury-muted hover:text-luxury-ivory text-xs uppercase font-semibold rounded-sm"
              >
                Save Draft
              </button>

              <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveManualProduct('publish_and_another')}
                  className="px-5 py-2.5 bg-luxury-charcoal border border-luxury-gold text-luxury-gold hover:bg-luxury-gold/10 font-bold text-xs uppercase tracking-wider rounded-sm transition-all"
                >
                  Publish &amp; Add Another
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveManualProduct('publish')}
                  className="px-6 py-2.5 bg-luxury-gold text-luxury-black font-bold text-xs uppercase tracking-widest rounded-sm hover:brightness-110 shadow-gold-glow transition-all"
                >
                  Publish Product
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
