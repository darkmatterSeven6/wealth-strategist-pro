import React, { useState, useEffect } from 'react';
import { 
  X, 
  Layers, 
  PieChart, 
  ExternalLink, 
  ShieldCheck, 
  TrendingUp, 
  Building2, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  Award, 
  BarChart2, 
  Globe2, 
  Info,
  DollarSign
} from 'lucide-react';
import { getFundHoldingsData } from '../data/seedHoldings';

export default function FundHoldingsModal({ 
  isOpen, 
  onClose, 
  fund, 
  onOpenEditHolding 
}) {
  const [holdingSearch, setHoldingSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !fund) return null;

  const holdingsData = getFundHoldingsData(fund) || {};
  const holdings = holdingsData.holdings || [];
  const targetFundName = holdingsData.targetFund || fund.targetFund || fund.target_fund || `${fund.name} (Underlying Portfolio)`;
  const targetManager = holdingsData.targetFundManager || fund.targetFundManager || fund.provider || 'Institutional Asset Manager';
  const benchmark = holdingsData.benchmark || fund.benchmark || 'Global Multi-Asset Benchmark';
  const top10Weight = holdingsData.top10Weight || fund.top10Weight || '40.00%';

  // Extract unique sectors
  const allSectors = Array.from(new Set(holdings.map(h => h.sector).filter(Boolean)));

  // Filter holdings based on search and sector
  const filteredHoldings = holdings.filter(h => {
    const q = holdingSearch.toLowerCase().trim();
    const matchesQuery = !q || 
      h.name?.toLowerCase().includes(q) || 
      h.ticker?.toLowerCase().includes(q) || 
      h.sector?.toLowerCase().includes(q) || 
      h.description?.toLowerCase().includes(q);

    const matchesSector = selectedSector === 'ALL' || h.sector === selectedSector;
    return matchesQuery && matchesSector;
  });

  // Calculate sector breakdown percentages
  const sectorBreakdown = holdings.reduce((acc, h) => {
    const s = h.sector || 'Other';
    const rawWeight = parseFloat((h.weight || '0').replace('%', '')) || 0;
    acc[s] = (acc[s] || 0) + rawWeight;
    return acc;
  }, {});

  const sectorColors = [
    'from-purple-500 to-indigo-500',
    'from-emerald-500 to-teal-500',
    'from-cyan-500 to-blue-500',
    'from-amber-500 to-orange-500',
    'from-pink-500 to-rose-500',
    'from-violet-500 to-fuchsia-500'
  ];

  const hasPosition = (fund.unitsHeld || 0) > 0 || (fund.pendingBuyOrders || 0) > 0 || (fund.investedCapital || 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 my-auto animate-in zoom-in-95 duration-200">
        
        {/* Top Gradient Header Accent */}
        <div className="h-2 w-full bg-gradient-to-r from-purple-600 via-indigo-500 to-emerald-400" />

        {/* Modal Header */}
        <div className="p-6 md:p-8 border-b border-slate-800 bg-slate-900/90 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pr-10">
            <div>
              <div className="flex items-center space-x-2.5 flex-wrap gap-y-1 mb-1.5">
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full uppercase">
                  Target Fund Breakdown
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 rounded-full">
                  {fund.platform || 'GCash GInvest'}
                </span>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                  fund.riskRating === 'Aggressive' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                  fund.riskRating === 'Moderate' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {fund.riskRating || 'Moderate'} Risk
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                {fund.name}
              </h2>
              
              <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                <Globe2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="font-semibold text-slate-300">Underlying Target Fund:</span>
                <span className="text-purple-300 font-bold">{targetFundName}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Manager</span>
              <span className="text-xs font-bold text-white mt-0.5 truncate block" title={targetManager}>
                {targetManager}
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Benchmark Index</span>
              <span className="text-xs font-bold text-slate-300 mt-0.5 truncate block" title={benchmark}>
                {benchmark}
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Top 10 Weight</span>
              <span className="text-xs font-extrabold text-emerald-400 mt-0.5 block font-mono">
                {top10Weight}
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Latest NAVPU</span>
              <span className="text-xs font-extrabold text-white mt-0.5 block font-mono">
                ₱{(fund.currentNavpu || 0).toLocaleString('en-US', { minimumFractionDigits: 4 })}
              </span>
            </div>
          </div>

          {/* User's Personal Holding Banner (if invested) */}
          {hasPosition && (
            <div className="mt-4 p-3.5 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-purple-950/30 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    Your Position: <span className="font-mono text-emerald-400">{fund.unitsHeld} units</span> (₱{(fund.currentMarketValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })})
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Invested: ₱{(fund.investedCapital || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} • Unrealized Gain: <span className={fund.unrealizedGain >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                      {fund.unrealizedGain >= 0 ? '+' : ''}₱{(fund.unrealizedGain || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ({fund.unrealizedGainPercent}%)
                    </span>
                  </div>
                </div>
              </div>

              {onOpenEditHolding && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenEditHolding(fund);
                  }}
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/40 transition cursor-pointer shrink-0 self-start sm:self-center"
                >
                  ✏️ Edit Holding
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Body & Holdings Content */}
        <div className="p-6 md:p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          
          {/* Search & Sector Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Constituent Companies & Assets ({filteredHoldings.length})
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter holding or sector..."
                  value={holdingSearch}
                  onChange={(e) => setHoldingSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Sector Tags Bar */}
          {allSectors.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedSector('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  selectedSector === 'ALL'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                }`}
              >
                All Sectors
              </button>
              {allSectors.map((sector) => (
                <button
                  key={sector}
                  onClick={() => setSelectedSector(sector)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    selectedSector === sector
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                  }`}
                >
                  {sector}
                </button>
              ))}
            </div>
          )}

          {/* Holdings Cards Matrix */}
          {filteredHoldings.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
              <Info className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-semibold">No constituent holdings found matching "{holdingSearch}".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredHoldings.map((holding, idx) => {
                const rawWeightNum = parseFloat((holding.weight || '0').replace('%', '')) || 0;

                return (
                  <div
                    key={idx}
                    className="p-4 bg-slate-950/70 hover:bg-slate-950 border border-slate-800/90 hover:border-purple-500/40 rounded-2xl transition duration-150 flex flex-col justify-between space-y-3 group shadow-sm"
                  >
                    {/* Top Row: Name, Ticker, Weight Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="font-extrabold text-white text-sm tracking-tight group-hover:text-purple-300 transition">
                            {holding.name}
                          </span>
                          {holding.ticker && (
                            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-slate-300 rounded border border-slate-700">
                              {holding.ticker}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-slate-400 block">
                          {holding.sector}
                        </span>
                      </div>

                      {/* Weight Badge & Visual Meter */}
                      <div className="text-right shrink-0">
                        <span className="px-2.5 py-1 text-xs font-black text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 rounded-xl font-mono inline-block">
                          {holding.weight}
                        </span>
                      </div>
                    </div>

                    {/* Weight Progress Bar */}
                    <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 via-indigo-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(rawWeightNum * 6.5, 100)}%` }}
                      />
                    </div>

                    {/* Business Model / Investment Thesis */}
                    <p className="text-xs text-slate-300 leading-relaxed font-normal bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/50">
                      {holding.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 md:px-8 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Institutional Top Holdings & Weights sourced from official fund factsheets.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Close Breakdown
          </button>
        </div>

      </div>
    </div>
  );
}
