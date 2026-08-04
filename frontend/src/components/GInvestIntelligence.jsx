import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Edit3, 
  PlusCircle, 
  Layers, 
  BarChart3,
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  Clock
} from 'lucide-react';

export default function GInvestIntelligence({ 
  fundsData, 
  onScrapeNavpu, 
  onUpdateHolding, 
  onCreateFund, 
  isScraping 
}) {
  const funds = fundsData?.funds || [];
  const summary = fundsData?.summary || {};
  const riskFreeRate = fundsData?.riskFreeRate || 5.50;

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Edit Holding State
  const [editingFund, setEditingFund] = useState(null);
  const [editUnits, setEditUnits] = useState('');
  const [editCost, setEditCost] = useState('');
  const [editPlatform, setEditPlatform] = useState('GCash GInvest');
  const [editPendingBuy, setEditPendingBuy] = useState('0');
  const [editPendingSell, setEditPendingSell] = useState('0');

  // Add Fund Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFund, setNewFund] = useState({
    name: '',
    platform: 'GCash GInvest',
    category: 'Global Equity Feeder',
    riskRating: 'Aggressive',
    currentNavpu: '',
    unitsHeld: '0',
    averageCost: '',
    dividendYieldPAnnum: '0',
    pendingBuyOrders: '0'
  });

  const categories = [
    'ALL', 
    'Global Equity / Tech', 
    'Global Thematic', 
    'Multi-Asset & Bonds', 
    'Global REITs', 
    'Domestic Equity', 
    'Money Market'
  ];

  const filteredFunds = funds.filter(fund => {
    // Search query matching
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      fund.name.toLowerCase().includes(q) ||
      (fund.category && fund.category.toLowerCase().includes(q)) ||
      (fund.platform && fund.platform.toLowerCase().includes(q)) ||
      (fund.provider && fund.provider.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    // Category matching
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'Global Equity / Tech') {
      return (fund.category?.includes('Global Equity') || fund.category?.includes('Tech')) && !fund.category?.includes('Thematic');
    }
    if (selectedCategory === 'Global Thematic') {
      return fund.category?.includes('Thematic') || fund.category?.includes('Consumer') || fund.category?.includes('Health');
    }
    if (selectedCategory === 'Multi-Asset & Bonds') {
      return fund.category?.includes('Multi-Asset') || fund.category?.includes('Bond') || fund.category?.includes('Income') || fund.category?.includes('Preferred');
    }
    if (selectedCategory === 'Global REITs') {
      return fund.category?.includes('REIT');
    }
    if (selectedCategory === 'Domestic Equity') {
      return fund.category?.includes('Domestic') || fund.category?.includes('Philippine') || fund.category?.includes('Stock') || fund.category?.includes('ESG');
    }
    if (selectedCategory === 'Money Market') {
      return fund.category?.includes('Money Market') || fund.category?.includes('Liquidity');
    }
    return fund.category === selectedCategory;
  });

  const formatNavpu = (navpu) => {
    if (navpu === undefined || navpu === null) return '0.00';
    const str = navpu.toString();
    if (str.includes('.') && str.split('.')[1].length > 2) {
      return navpu.toFixed(4);
    }
    return navpu < 10 ? navpu.toFixed(4) : navpu.toFixed(2);
  };

  const renderPlatformBadges = (platformStr) => {
    const p = (platformStr || '').toLowerCase();
    const badges = [];

    // GCash GInvest
    if (p.includes('gcash') || p.includes('ginvest')) {
      badges.push(
        <span 
          key="gcash" 
          className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-[#112338] text-[#5ba4fc] border border-[#1d3d66]"
        >
          <span className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_6px_rgba(59,130,246,0.8)] shrink-0"></span>
          <span>GCash GInvest</span>
        </span>
      );
    }

    // Maya Funds
    if (p.includes('maya')) {
      badges.push(
        <span 
          key="maya" 
          className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-[#0d2a21] text-[#34d399] border border-[#144f3c]"
        >
          <span className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_6px_rgba(16,185,129,0.8)] shrink-0"></span>
          <span>Maya Funds</span>
        </span>
      );
    }

    // BPI Wealth
    if (p.includes('bpi')) {
      badges.push(
        <span 
          key="bpi" 
          className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-[#2e151c] text-[#fb7185] border border-[#521d2b]"
        >
          <span className="w-2 h-2 rounded-full bg-[#f43f5e] shadow-[0_0_6px_rgba(244,63,94,0.8)] shrink-0"></span>
          <span>BPI Wealth</span>
        </span>
      );
    }

    // GoTyme
    if (p.includes('gotyme') || p.includes('seedbox')) {
      badges.push(
        <span 
          key="gotyme" 
          className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-[#0e2733] text-[#38bdf8] border border-[#154a5c]"
        >
          <span className="w-2 h-2 rounded-full bg-[#0ea5e9] shadow-[0_0_6px_rgba(14,165,233,0.8)] shrink-0"></span>
          <span>GoTyme</span>
        </span>
      );
    }

    // Fallback
    if (badges.length === 0 && platformStr) {
      badges.push(
        <span 
          key="other" 
          className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-900 text-slate-300 border border-slate-700"
        >
          <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0"></span>
          <span>{platformStr}</span>
        </span>
      );
    }

    return badges;
  };

  const handleOpenEdit = (fund) => {
    setEditingFund(fund);
    setEditUnits(fund.unitsHeld !== undefined ? fund.unitsHeld.toString() : '0');
    setEditCost(fund.averageCost !== undefined ? fund.averageCost.toString() : (fund.currentNavpu || '0').toString());
    setEditPlatform(fund.platform || 'GCash GInvest');
    setEditPendingBuy((fund.pendingBuyOrders || 0).toString());
    setEditPendingSell((fund.pendingSellOrders || 0).toString());
  };

  const handleSaveHolding = (e) => {
    e.preventDefault();
    if (!editingFund) return;
    onUpdateHolding({
      fundId: editingFund.id,
      unitsHeld: parseFloat(editUnits) || 0,
      averageCost: parseFloat(editCost) || (editingFund.currentNavpu || 0),
      platform: editPlatform,
      pendingBuyOrders: parseFloat(editPendingBuy) || 0,
      pendingSellOrders: parseFloat(editPendingSell) || 0
    });
    setEditingFund(null);
  };

  const handleCreateFundSubmit = (e) => {
    e.preventDefault();
    if (!newFund.name || !newFund.currentNavpu) return;
    if (onCreateFund) {
      onCreateFund({
        name: newFund.name,
        platform: newFund.platform,
        category: newFund.category,
        riskRating: newFund.riskRating,
        currentNavpu: parseFloat(newFund.currentNavpu),
        unitsHeld: parseFloat(newFund.unitsHeld) || 0,
        averageCost: parseFloat(newFund.averageCost) || parseFloat(newFund.currentNavpu),
        dividendYieldPAnnum: parseFloat(newFund.dividendYieldPAnnum) || 0,
        pendingBuyOrders: parseFloat(newFund.pendingBuyOrders) || 0
      });
    }
    setIsAddModalOpen(false);
    setNewFund({
      name: '',
      platform: 'GCash GInvest',
      category: 'Global Equity Feeder',
      riskRating: 'Aggressive',
      currentNavpu: '',
      unitsHeld: '0',
      averageCost: '',
      dividendYieldPAnnum: '0',
      pendingBuyOrders: '0'
    });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Live Scraper / Add Fund Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              GInvest & Feeder Fund Intelligence
            </h2>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full">
              QUANT SUITE
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Live Philippine UITFs & Feeder Funds with Total Units, Investment Values, 1-Yr Returns, 3-Yr CAGR, and Sharpe Ratios ($R_f$: {riskFreeRate}%).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
          >
            <PlusCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>Add Fund / Feeder</span>
          </button>

          <button
            onClick={onScrapeNavpu}
            disabled={isScraping}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-glow-purple transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
            <span>{isScraping ? 'Scraping Feeds...' : 'Fetch Live NAVPUs'}</span>
          </button>
        </div>
      </div>

      {/* Portfolio Quant Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-purple-500/20 bg-gradient-to-br from-purple-950/20 to-slate-900/60">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Investment Value</span>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            ₱{summary.totalGInvest?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <div className="text-xs text-emerald-400 font-semibold mt-1">
            Invested Capital: ₱{summary.totalInvestedCapital?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-slate-900/60">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Unrealized Gain</span>
          <div className={`text-2xl font-extrabold font-mono mt-1 ${
            (summary.totalGInvestGain || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {(summary.totalGInvestGain || 0) >= 0 ? '+' : ''}₱{summary.totalGInvestGain?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <div className="text-xs text-slate-400 font-semibold mt-1">
            {(summary.totalGInvestGainPercent || 0) >= 0 ? '+' : ''}{summary.totalGInvestGainPercent?.toFixed(2) || '0.00'}% Net Return
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-slate-900/60">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Weighted Sharpe Ratio</span>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">
            {summary.weightedSharpe || '0.78'}
          </div>
          <div className="text-xs text-slate-400 font-semibold mt-1">
            Excess return over 5.50% T-Bills
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-slate-900/60">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Projected Dividends</span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
            ₱{summary.annualDividendIncome?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}<span className="text-xs text-slate-400 font-normal"> / yr</span>
          </div>
          <div className="text-xs text-amber-300 font-semibold mt-1">
            ₱{summary.monthlyDividendIncome?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}/month from ALFM & REITs
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Filter Tabs */}
        <div className="flex overflow-x-auto space-x-2 pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-glow-purple font-bold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search funds, feeder or platform..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Quant Intelligence Table */}
      <div className="rounded-2xl glass-panel border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 min-w-[300px]">Fund Name & Platform</th>
                <th className="py-3.5 px-4 text-right">Latest NAVPU</th>
                <th className="py-3.5 px-4 text-right">Total Units</th>
                <th className="py-3.5 px-4 text-right">Total Investment Value</th>
                <th className="py-3.5 px-4 text-right">Invested Capital</th>
                <th className="py-3.5 px-4 text-right">Unrealized Gain</th>
                <th className="py-3.5 px-4 text-right">1-Yr Return</th>
                <th className="py-3.5 px-4 text-right">3-Yr CAGR</th>
                <th className="py-3.5 px-4 text-right">Sharpe ($R_f$ 5.5%)</th>
                <th className="py-3.5 px-4 text-right">Vol (30d)</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-200">
              {filteredFunds.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    No funds found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredFunds.map((fund) => {
                  const m = fund.metrics || {};
                  const isGain = (fund.unrealizedGain || 0) >= 0;
                  const hasPosition = (fund.unitsHeld || 0) > 0 || (fund.pendingBuyOrders || 0) > 0;

                  return (
                    <tr 
                      key={fund.id} 
                      className={`hover:bg-slate-800/40 transition ${hasPosition ? 'bg-purple-950/10' : ''}`}
                    >
                      
                      {/* Fund Name, Type & Badges (Matching User's Reference Layout) */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          {/* 1. Fund Name */}
                          <div className="font-bold text-white text-sm tracking-tight flex items-center space-x-1.5">
                            <span>{fund.name}</span>
                            {hasPosition && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" title="Active Holding" />
                            )}
                          </div>

                          {/* 2. Fund Type / Category & Metadata */}
                          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                            <span className="text-slate-300 font-medium">{fund.category}</span>
                            <span>•</span>
                            <span>{fund.currency}</span>
                            {fund.riskRating && (
                              <>
                                <span>•</span>
                                <span className={`font-semibold ${
                                  fund.riskRating === 'Aggressive' ? 'text-rose-400' :
                                  fund.riskRating === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'
                                }`}>{fund.riskRating}</span>
                              </>
                            )}
                          </div>

                          {/* 3. Platform Badges and Dividend Yield placed directly under Fund Type */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {renderPlatformBadges(fund.platform)}
                            {fund.dividendYieldPAnnum > 0 && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#2b2111] text-[#f59e0b] border border-[#523e16] rounded-md">
                                {fund.dividendYieldPAnnum}% Div
                              </span>
                            )}
                            {fund.pendingBuyOrders > 0 && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/50 rounded-md">
                                <Clock className="w-2.5 h-2.5 text-indigo-400" />
                                <span>+₱{fund.pendingBuyOrders.toFixed(2)} Pending</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* NAVPU */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-mono font-bold text-white text-sm">
                          ₱{formatNavpu(fund.currentNavpu)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {fund.navpuDate || 'Latest'}
                        </div>
                      </td>

                      {/* Total Units */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-mono font-bold text-slate-100 text-sm">
                          {(fund.unitsHeld || 0).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          units
                        </div>
                      </td>

                      {/* Total Investment Value */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-mono font-bold text-emerald-400 text-sm">
                          ₱{(fund.currentMarketValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        {fund.pendingBuyOrders > 0 && (
                          <div className="text-[10px] text-indigo-400 font-mono">
                            +₱{fund.pendingBuyOrders.toFixed(2)} buy order
                          </div>
                        )}
                      </td>

                      {/* Invested Capital */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-mono font-medium text-slate-300 text-xs">
                          ₱{(fund.investedCapital || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          @ ₱{formatNavpu(fund.averageCost || fund.currentNavpu)}
                        </div>
                      </td>

                      {/* Unrealized Gain */}
                      <td className="py-4 px-4 text-right">
                        <div className={`font-mono font-bold text-xs ${isGain ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isGain ? '+' : ''}₱{(fund.unrealizedGain || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div className={`text-[10px] font-bold ${isGain ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isGain ? '+' : ''}{fund.unrealizedGainPercent?.toFixed(2)}%
                        </div>
                      </td>

                      {/* 1-Yr Return */}
                      <td className="py-4 px-4 text-right">
                        <span className={`font-mono font-bold ${(m.oneYearReturn || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {(m.oneYearReturn || 0) >= 0 ? '+' : ''}{m.oneYearReturn}%
                        </span>
                      </td>

                      {/* 3-Yr CAGR */}
                      <td className="py-4 px-4 text-right">
                        <span className="font-mono font-semibold text-slate-200">
                          {m.threeYearCagr ? `${m.threeYearCagr}%` : 'N/A'}
                        </span>
                      </td>

                      {/* Sharpe Ratio */}
                      <td className="py-4 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                          (m.sharpeRatio || 0) >= 1.0 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                            : (m.sharpeRatio || 0) >= 0.5 
                            ? 'bg-cyan-500/10 text-cyan-400' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {m.sharpeRatio?.toFixed(2) || '0.00'}
                        </span>
                      </td>

                      {/* Volatility */}
                      <td className="py-4 px-4 text-right">
                        <span className="font-mono text-slate-300">
                          {m.volatility30d}%
                        </span>
                      </td>

                      {/* Edit Holding */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleOpenEdit(fund)}
                          className="p-1.5 bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 rounded-lg border border-slate-700 transition shadow-sm"
                          title="Edit Holding & Orders"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Holding Modal */}
      {editingFund && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Adjust Fund Investment</h3>
                <p className="text-xs text-purple-400">{editingFund.name}</p>
              </div>
              <button onClick={() => setEditingFund(null)} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveHolding} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Platform / App
                </label>
                <select
                  value={editPlatform}
                  onChange={(e) => setEditPlatform(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-purple-500"
                >
                  <option value="GCash GInvest">🔵 GCash GInvest (GFunds)</option>
                  <option value="Maya Funds">🟢 Maya Funds</option>
                  <option value="GCash GInvest, Maya Funds">🟣 Both GCash GInvest & Maya Funds</option>
                  <option value="BPI Wealth">🔴 BPI Wealth / BPI Trade</option>
                  <option value="GoTyme">🔷 GoTyme (Seedbox)</option>
                  <option value="Other Platform">⚪ Other Broker / App</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Total Units
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editUnits}
                    onChange={(e) => setEditUnits(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Avg Cost / NAVPU (₱)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editCost}
                    onChange={(e) => setEditCost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Pending Buy Orders (₱)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={editPendingBuy}
                    onChange={(e) => setEditPendingBuy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Pending Sell Orders (₱)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={editPendingSell}
                    onChange={(e) => setEditPendingSell(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Current NAVPU:</span>
                  <span className="font-mono font-bold text-white">₱{formatNavpu(editingFund.currentNavpu)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Calculated Total Investment Value:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ₱{((parseFloat(editUnits) || 0) * (editingFund.currentNavpu || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Calculated Invested Capital:</span>
                  <span className="font-mono font-bold text-slate-300">
                    ₱{((parseFloat(editUnits) || 0) * (parseFloat(editCost) || editingFund.currentNavpu || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingFund(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-glow-purple"
                >
                  Save Investment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Fund Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Add New Fund / Feeder</h3>
                <p className="text-xs text-slate-400">Track any UITF, Mutual Fund, or REIT with automated quant metrics</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateFundSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Fund Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. BPI US Equity Feeder Fund"
                  value={newFund.name}
                  onChange={(e) => setNewFund({ ...newFund, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Platform / App *
                  </label>
                  <select
                    value={newFund.platform}
                    onChange={(e) => setNewFund({ ...newFund, platform: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-purple-500"
                  >
                    <option value="GCash GInvest">🔵 GCash GInvest (GFunds)</option>
                    <option value="Maya Funds">🟢 Maya Funds</option>
                    <option value="GCash GInvest, Maya Funds">🟣 Both GCash GInvest & Maya Funds</option>
                    <option value="BPI Wealth">🔴 BPI Wealth / BPI Trade</option>
                    <option value="GoTyme">🔷 GoTyme (Seedbox)</option>
                    <option value="Other Platform">⚪ Other Broker / App</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newFund.category}
                    onChange={(e) => setNewFund({ ...newFund, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-purple-500"
                  >
                    <option value="Global Equity Feeder">Global Equity Feeder</option>
                    <option value="Global Thematic">Global Thematic</option>
                    <option value="Multi-Asset Dividend Income">Multi-Asset Dividend Income</option>
                    <option value="Global REIT Feeder">Global REIT Feeder</option>
                    <option value="Money Market / Liquidity">Money Market / Liquidity</option>
                    <option value="Domestic Equity Index">Domestic Equity Index</option>
                    <option value="Domestic Equity ESG">Domestic Equity ESG</option>
                    <option value="Fixed Income / Bond">Fixed Income / Bond</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Current NAVPU (₱) *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="100.00"
                    value={newFund.currentNavpu}
                    onChange={(e) => setNewFund({ ...newFund, currentNavpu: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Total Units
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newFund.unitsHeld}
                    onChange={(e) => setNewFund({ ...newFund, unitsHeld: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Avg Cost / NAVPU (₱)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Same as NAVPU"
                    value={newFund.averageCost}
                    onChange={(e) => setNewFund({ ...newFund, averageCost: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Risk Rating
                  </label>
                  <select
                    value={newFund.riskRating}
                    onChange={(e) => setNewFund({ ...newFund, riskRating: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-purple-500"
                  >
                    <option value="Conservative">Conservative (Low Risk)</option>
                    <option value="Moderate">Moderate (Medium Risk)</option>
                    <option value="Aggressive">Aggressive (High Growth)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Dividend Yield (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={newFund.dividendYieldPAnnum}
                    onChange={(e) => setNewFund({ ...newFund, dividendYieldPAnnum: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-glow-purple"
                >
                  Save & Add Fund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
