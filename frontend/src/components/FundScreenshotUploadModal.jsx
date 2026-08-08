import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles, 
  Layers, 
  FileText, 
  TrendingUp, 
  RefreshCw, 
  ArrowRight,
  ShieldCheck,
  ClipboardPaste,
  HelpCircle
} from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { api } from '../services/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';

export default function FundScreenshotUploadModal({ 
  isOpen, 
  onClose, 
  funds = [], 
  onSuccess 
}) {
  const [selectedFundId, setSelectedFundId] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('GCash GInvest');
  const [customFundName, setCustomFundName] = useState('');
  
  // Image & OCR States
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatusText, setOcrStatusText] = useState('');
  const [rawExtractedText, setRawExtractedText] = useState('');
  
  // Extracted & Editable Fields
  const [extractedData, setExtractedData] = useState({
    unitsHeld: '',
    currentNavpu: '',
    currentMarketValue: '',
    pendingBuyOrders: '0.00',
    pendingSellOrders: '0.00',
    navpuDate: new Date().toISOString().split('T')[0],
    oneYearReturn: ''
  });

  const [hasScanned, setHasScanned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Auto-select first fund if none selected
  useEffect(() => {
    if (funds && funds.length > 0 && !selectedFundId) {
      setSelectedFundId(funds[0].id);
    }
  }, [funds, selectedFundId]);

  // Support paste directly from clipboard (Ctrl+V)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          handleImageSelect(blob);
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, selectedFundId, selectedPlatform]);

  if (!isOpen) return null;

  const handleImageSelect = (file) => {
    if (!file) return;
    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setHasScanned(false);
    runOcrPipeline(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Run Tesseract.js OCR & Regex Extraction
  const runOcrPipeline = async (file) => {
    setIsProcessingOcr(true);
    setOcrProgress(10);
    setOcrStatusText('Initializing Optical Character Recognition (OCR)...');

    try {
      const worker = await createWorker('eng');
      
      setOcrProgress(35);
      setOcrStatusText('Scanning holding screen & extracting financial numerals...');
      
      const ret = await worker.recognize(file);
      const text = ret.data.text || '';
      setRawExtractedText(text);
      
      setOcrProgress(80);
      setOcrStatusText('Parsing units, NAVPU, market values, and dates...');

      await worker.terminate();

      // Send raw text to backend regex parser for high accuracy
      const parseRes = await api.parseScreenshotText(text, {
        fundId: selectedFundId,
        platform: selectedPlatform
      });

      if (parseRes.success && parseRes.data) {
        const d = parseRes.data;
        
        // Auto-match fund if detected in image and user hasn't locked one
        if (d.fundNameDetected) {
          const matched = funds.find(f => f.name.toLowerCase().includes(d.fundNameDetected.toLowerCase()) || d.fundNameDetected.toLowerCase().includes(f.name.toLowerCase()));
          if (matched) {
            setSelectedFundId(matched.id);
          }
        }

        setExtractedData({
          unitsHeld: d.totalUnits !== null ? String(d.totalUnits) : '',
          currentNavpu: d.navpu !== null ? String(d.navpu) : '',
          currentMarketValue: d.totalInvestmentValue !== null ? String(d.totalInvestmentValue) : '',
          pendingBuyOrders: d.pendingBuyOrders !== null ? String(d.pendingBuyOrders) : '0.00',
          pendingSellOrders: d.pendingSellOrders !== null ? String(d.pendingSellOrders) : '0.00',
          navpuDate: d.navpuDate || new Date().toISOString().split('T')[0],
          oneYearReturn: d.oneYearReturn !== null ? String(d.oneYearReturn) : ''
        });

        setOcrProgress(100);
        setHasScanned(true);
        showSuccessToast('Statement Screenshot parsed successfully! Review detected values below.');
      } else {
        throw new Error('Could not parse statement structure.');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      // Fallback: still show form for manual verification
      setHasScanned(true);
      showErrorToast('Could not automatically detect all fields. Please verify manually.');
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const handleApply = async () => {
    setIsSubmitting(true);
    try {
      const selectedFund = funds.find(f => f.id === selectedFundId);
      const fundName = selectedFund ? selectedFund.name : customFundName;

      if (!fundName && !selectedFundId) {
        showErrorToast('Please select or specify a target fund.');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        fundId: selectedFundId !== 'custom' ? selectedFundId : undefined,
        fundName,
        platform: selectedPlatform,
        unitsHeld: parseFloat(extractedData.unitsHeld) || 0,
        currentNavpu: parseFloat(extractedData.currentNavpu) || 0,
        currentMarketValue: parseFloat(extractedData.currentMarketValue) || 0,
        pendingBuyOrders: parseFloat(extractedData.pendingBuyOrders) || 0,
        pendingSellOrders: parseFloat(extractedData.pendingSellOrders) || 0,
        navpuDate: extractedData.navpuDate,
        oneYearReturn: extractedData.oneYearReturn ? parseFloat(extractedData.oneYearReturn) : undefined
      };

      const res = await api.importScreenshotData(payload);
      if (res.success) {
        showSuccessToast(`Successfully updated "${fundName}" holdings from screenshot!`);
        if (onSuccess) onSuccess(res.fund);
        onClose();
      } else {
        showErrorToast(res.error || 'Failed to save imported screenshot data.');
      }
    } catch (err) {
      showErrorToast(err.message || 'Error applying screenshot data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedFundObj = funds.find(f => f.id === selectedFundId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col custom-scrollbar">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Import Portfolio from Screenshot
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                  Smart OCR
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Upload or paste a screenshot from GCash GFunds, Maya, Seedbox, or BPI to auto-extract units and valuation.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* STEP 1: Fund & Platform Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Fund
              </label>
              <select
                value={selectedFundId}
                onChange={(e) => setSelectedFundId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {funds.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.platform})
                  </option>
                ))}
                <option value="custom">+ Add as New Fund...</option>
              </select>
              {selectedFundId === 'custom' && (
                <input
                  type="text"
                  placeholder="Enter custom fund name..."
                  value={customFundName}
                  onChange={(e) => setCustomFundName(e.target.value)}
                  className="mt-2 w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Investment Platform
              </label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="GCash GInvest">GCash GInvest (GFunds)</option>
                <option value="Maya Investa Funds">Maya Investa Funds</option>
                <option value="Maya Seedbox Funds">Maya Seedbox Funds</option>
                <option value="BPI Wealth">BPI Wealth / BPI Trade</option>
                <option value="BDO EIP">BDO Easy Investment Plan</option>
                <option value="First Metro Sec">First Metro Sec (FundsFirst)</option>
              </select>
            </div>
          </div>

          {/* STEP 2: Screenshot Dropzone & Clipboard Paste */}
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
              imagePreview 
                ? 'border-emerald-500/50 bg-emerald-950/10' 
                : 'border-slate-700/80 hover:border-emerald-500/40 bg-slate-950/40 hover:bg-slate-950/70'
            }`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="hidden" 
            />

            {imagePreview ? (
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="relative group max-h-48 rounded-xl overflow-hidden border border-slate-700 shadow-lg">
                  <img 
                    src={imagePreview} 
                    alt="Fund Screenshot" 
                    className="max-h-48 object-contain bg-black" 
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-semibold text-slate-200">
                    Click or drop to replace
                  </div>
                </div>
                <div className="text-left space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Screenshot Loaded
                  </div>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Optical Character Recognition (OCR) has processed the statement image.
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (imageFile) runOcrPipeline(imageFile);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-600 transition-colors mt-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Re-scan Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Drag & Drop your fund screenshot here, or <span className="text-emerald-400 underline">browse files</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1.5">
                    <ClipboardPaste className="w-3.5 h-3.5 text-slate-400" />
                    Tip: You can also copy a screenshot and press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700">Ctrl + V</kbd> to paste
                  </p>
                </div>
                <div className="text-[11px] text-slate-500">
                  Supports PNG, JPG, JPEG, WebP from mobile app captures
                </div>
              </div>
            )}

            {/* OCR Processing Bar */}
            {isProcessingOcr && (
              <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-left space-y-2 animate-pulse">
                <div className="flex justify-between text-xs font-semibold text-emerald-400">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    {ocrStatusText}
                  </span>
                  <span>{ocrProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${ocrProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: Detected Fields & Interactive Verification Matrix */}
          {(hasScanned || imagePreview) && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Detected Statement Values (Verify & Edit)
                </h3>
                <span className="text-xs text-slate-400">
                  Double check numbers against your screenshot before applying.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Total Units Held */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Total Units Held
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="e.g. 2.0419"
                      value={extractedData.unitsHeld}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExtractedData(prev => {
                          const nav = parseFloat(prev.currentNavpu) || 0;
                          const units = parseFloat(val) || 0;
                          return {
                            ...prev,
                            unitsHeld: val,
                            currentMarketValue: nav > 0 ? (units * nav).toFixed(2) : prev.currentMarketValue
                          };
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-bold text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500">units</span>
                  </div>
                </div>

                {/* Current NAVPU */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Current NAVPU
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400">₱</span>
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="e.g. 497.0092"
                      value={extractedData.currentNavpu}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExtractedData(prev => {
                          const nav = parseFloat(val) || 0;
                          const units = parseFloat(prev.unitsHeld) || 0;
                          return {
                            ...prev,
                            currentNavpu: val,
                            currentMarketValue: units > 0 ? (units * nav).toFixed(2) : prev.currentMarketValue
                          };
                        });
                      }}
                      className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-bold text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Total Investment / Market Value */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Total Investment Value
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400">₱</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 1014.84"
                      value={extractedData.currentMarketValue}
                      onChange={(e) => setExtractedData({ ...extractedData, currentMarketValue: e.target.value })}
                      className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-bold text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Pending Buy Orders */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Pending Buy Orders
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400">₱</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={extractedData.pendingBuyOrders}
                      onChange={(e) => setExtractedData({ ...extractedData, pendingBuyOrders: e.target.value })}
                      className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* As of Date */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Statement As-Of Date
                  </label>
                  <input
                    type="date"
                    value={extractedData.navpuDate}
                    onChange={(e) => setExtractedData({ ...extractedData, navpuDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Past 1 Year Return */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Past 1-Year Return (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 33.93"
                      value={extractedData.oneYearReturn}
                      onChange={(e) => setExtractedData({ ...extractedData, oneYearReturn: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500">%</span>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 z-20 flex items-center justify-between px-6 py-4 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={isSubmitting || isProcessingOcr || !extractedData.unitsHeld}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Applying to Portfolio...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Confirm & Apply to Portfolio
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
