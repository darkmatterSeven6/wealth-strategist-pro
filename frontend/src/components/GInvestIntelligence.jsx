import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Edit3, 
  Zap, 
  ShieldAlert, 
  Percent, 
  Activity, 
  ArrowUpRight, 
  CheckCircle2, 
  Layers, 
  BarChart3,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function GInvestIntelligence({ 
  fundsData, 
  onScrapeNavpu, 
  onUpdateHolding, 
  isScraping 
}) {
  const funds = fundsData?.funds || [];
  const summary = fundsData?.summary || {};
  const riskFreeRate = fundsData?.riskFreeRate || 5.50;

  const [editingFund, setEditingFund] = useState(null);
  const [editUnits, setEditUnits] = useState('');
  const [editCost, setEditCost] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', 'Global Equity / Tech', 'Global Thematic', 'Multi-Asset Dividend', 'Global REIT', 'Money Market'];

  const filteredFunds = selectedCategory === 'ALL'
    ? funds
    : funds.filter(f => f.category === selectedCategory);

  const handleOpenEdit = (fund) => {
    setEditingFund(fund);
    setEditUnits(fund.unitsHeld.toString());
    setEditCost(fund.averageCost.toString());
  };

  const handleSaveHolding = (e) => {
    e.preventDefault();
    if (!editingFund) return;
    onUpdateHolding({
      fundId: editingFund.id,
      unitsHeld: parseFloat(editUnits),
      averageCost: parseFloat(editCost)
    });
    setEditingFund(null);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Live Scraper Trigger */}
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
            Live Philippine UITF NAVPUs, 1-Yr Net Returns, 3-Yr CAGR, Sharpe Ratios (Rf: {riskFreeRate}% 3M T-Bill), and Volatility metrics.
          </p>
        </div>

        <div className="flex items-center space-x-3">
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
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Market Value</span>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            ₱{summary.totalGInvest?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <div className="text-xs text-emerald-400 font-semibold mt-1">
            Invested Capital: ₱{summary.totalInvestedCapital?.toLocaleString() || '0'}
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-slate-900/60">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Unrealized Gain</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            +₱{summary.totalGInvestGain?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <div className="text-xs text-emerald-300 font-semibold mt-1">
            +{summary.totalGInvestGainPercent?.toFixed(2) || '0.00'}% Net Return
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-slate-900/60">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Weighted Sharpe Ratio</span>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">
            {summary.weightedSharpe || '1.15'}
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
            ₱{summary.monthlyDividendIncome?.toLocaleString() || '0'}/month from ALFM & REITs
          </div>
        </div>
      </div>

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

      {/* Quant Intelligence Table */}
      <div className="rounded-2xl glass-panel border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Fund Name & Category</th>
                <th className="py-3.5 px-4 text-right">Latest NAVPU</th>
                <th className="py-3.5 px-4 text-right">Units & Position Value</th>
                <th className="py-3.5 px-4 text-right">Unrealized Gain</th>
                <th className="py-3.5 px-4 text-right">1-Yr Return</th>
                <th className="py-3.5 px-4 text-right">3-Yr CAGR</th>
                <th className="py-3.5 px-4 text-right">Sharpe (Rf 5.5%)</th>
                <th className="py-3.5 px-4 text-right">Vol (30d)</th>
                <th className="py-3.5 px-4 text-right">Max Drawdown</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-200">
              {filteredFunds.map((fund) => {
                const m = fund.metrics || {};
                const isGain = (fund.unrealizedGain || 0) >= 0;
                return (
                  <tr key={fund.id} className="hover:bg-slate-800/40 transition">
                    {/* Name */}
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-bold text-white text-sm flex items-center space-x-1.5">
                          <span>{fund.name}</span>
                          {fund.dividendYieldPAnnum > 0 && (
                            <span className="px-1.5 py-0.5 text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                              {fund.dividendYieldPAnnum}% Div
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {fund.category} • {fund.currency}
                        </div>
                      </div>
                    </td>

                    {/* NAVPU */}
                    <td className="py-4 px-4 text-right">
                      <div className="font-mono font-bold text-white text-sm">
                        ₱{fund.currentNavpu?.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {fund.navpuDate || 'Latest'}
                      </div>
                    </td>

                    {/* Units & Position Value */}
                    <td className="py-4 px-4 text-right">
                      <div className="font-mono font-bold text-white text-sm">
                        ₱{(fund.currentMarketValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {fund.unitsHeld?.toFixed(4)} units
                      </div>
                    </td>

                    {/* Unrealized Gain */}
                    <td className="py-4 px-4 text-right">
                      <div className={`font-mono font-bold text-sm ${isGain ? 'text-emerald-400' : 'text-rose-400'}`}>
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

                    {/* Max Drawdown */}
                    <td className="py-4 px-4 text-right">
                      <span className="font-mono text-rose-400 font-semibold">
                        {m.maxDrawdown}%
                      </span>
                    </td>

                    {/* Edit Holding */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleOpenEdit(fund)}
                        className="p-1.5 bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 rounded-lg border border-slate-700 transition"
                        title="Edit Units / Acquisition Cost"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
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
                <h3 className="text-lg font-bold text-white">Adjust GInvest Holding</h3>
                <p className="text-xs text-purple-400">{editingFund.name}</p>
              </div>
              <button onClick={() => setEditingFund(null)} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveHolding} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Units Held
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={editUnits}
                  onChange={(e) => setEditUnits(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Average Acquisition NAVPU (₱)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editCost}
                  onChange={(e) => setEditCost(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Current NAVPU:</span>
                  <span className="font-mono font-bold text-white">₱{editingFund.currentNavpu?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Projected Value:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ₱{((parseFloat(editUnits) || 0) * editingFund.currentNavpu).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                  Update Holding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
