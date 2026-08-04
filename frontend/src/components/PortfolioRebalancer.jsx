import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

export default function PortfolioRebalancer({ 
  rebalanceData, 
  models, 
  onAnalyzeRebalance, 
  macroData, 
  onUpdateMacro 
}) {
  const [selectedModel, setSelectedModel] = useState('aggressive');
  const [isUpdatingMacro, setIsUpdatingMacro] = useState(false);
  const [techScore, setTechScore] = useState('82.5');
  const [tBillRate, setTBillRate] = useState('5.50');
  const [bspRate, setBspRate] = useState('6.50');

  useEffect(() => {
    if (macroData) {
      if (macroData.techMomentumScore) setTechScore(macroData.techMomentumScore.toString());
      if (macroData.phThreeMonthTBillRate) setTBillRate(macroData.phThreeMonthTBillRate.toString());
      if (macroData.bspPolicyRate) setBspRate(macroData.bspPolicyRate.toString());
    }
  }, [macroData]);

  const handleSelectModel = (key) => {
    setSelectedModel(key);
    onAnalyzeRebalance(key);
  };

  const handleSaveMacro = (e) => {
    e.preventDefault();
    onUpdateMacro({
      techMomentumScore: parseFloat(techScore),
      phThreeMonthTBillRate: parseFloat(tBillRate),
      bspPolicyRate: parseFloat(bspRate)
    });
    setIsUpdatingMacro(false);
  };

  const modelInfo = models?.[selectedModel] || rebalanceData?.model || {};
  const allocations = rebalanceData?.allocations || [];
  const executionTrades = rebalanceData?.executionTrades || [];
  const instructions = rebalanceData?.stepByStepInstructions || [];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Market-Aware Rebalance Engine
            </h2>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              TACTICAL RAILS
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Compare live GInvest weights against model targets and generate step-by-step GCash execution trades.
          </p>
        </div>

        <button
          onClick={() => setIsUpdatingMacro(!isUpdatingMacro)}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
        >
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Edit Macro Inputs</span>
        </button>
      </div>

      {/* Macro Inputs Drawer */}
      {isUpdatingMacro && (
        <form onSubmit={handleSaveMacro} className="p-5 rounded-2xl glass-panel border border-cyan-500/30 bg-slate-900/90 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Update Macro Regime Assumptions
            </span>
            <button type="button" onClick={() => setIsUpdatingMacro(false)} className="text-slate-400 text-xs font-bold">✕ Close</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                Tech / AI Momentum (0-100)
              </label>
              <input
                type="number"
                step="0.1"
                value={techScore}
                onChange={(e) => setTechScore(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                PH 3-Month T-Bill Rf (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={tBillRate}
                onChange={(e) => setTBillRate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                BSP Policy Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={bspRate}
                onChange={(e) => setBspRate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-glow-cyan"
            >
              Apply Macro Factors
            </button>
          </div>
        </form>
      )}

      {/* Model Portfolio Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Conservative Model */}
        <div 
          onClick={() => handleSelectModel('conservative')}
          className={`p-5 rounded-2xl cursor-pointer transition-all border ${
            selectedModel === 'conservative'
              ? 'bg-gradient-to-br from-cyan-950/40 via-slate-900/90 to-slate-900 border-cyan-400 shadow-glow-cyan'
              : 'glass-panel border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Conservative</span>
            <span className="text-[10px] font-bold bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded-full">
              4.8% - 5.2% Yield
            </span>
          </div>
          <h4 className="font-extrabold text-white text-base mt-2">Capital Preservation & Yield</h4>
          <p className="text-xs text-slate-400 mt-1">
            65% Money Market, 20% Dividend Multi-Asset/REITs, 15% Global Equities.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between text-[11px] text-slate-400">
            <span>Expected Vol: <strong>1.5% - 3.0%</strong></span>
            <span>Low Risk</span>
          </div>
        </div>

        {/* Moderate Model */}
        <div 
          onClick={() => handleSelectModel('moderate')}
          className={`p-5 rounded-2xl cursor-pointer transition-all border ${
            selectedModel === 'moderate'
              ? 'bg-gradient-to-br from-purple-950/40 via-slate-900/90 to-slate-900 border-purple-400 shadow-glow-purple'
              : 'glass-panel border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Moderate</span>
            <span className="text-[10px] font-bold bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full">
              5.8% - 6.5% Yield
            </span>
          </div>
          <h4 className="font-extrabold text-white text-base mt-2">Dividend Cash Flow & Balanced</h4>
          <p className="text-xs text-slate-400 mt-1">
            50% Multi-Asset & REITs (monthly payouts), 20% Money Market, 30% Tech & Infra.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between text-[11px] text-slate-400">
            <span>Expected Vol: <strong>7.0% - 9.5%</strong></span>
            <span>Balanced</span>
          </div>
        </div>

        {/* Aggressive Model */}
        <div 
          onClick={() => handleSelectModel('aggressive')}
          className={`p-5 rounded-2xl cursor-pointer transition-all border ${
            selectedModel === 'aggressive'
              ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-900 border-emerald-400 shadow-glow-emerald'
              : 'glass-panel border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Aggressive</span>
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full">
              Max Growth
            </span>
          </div>
          <h4 className="font-extrabold text-white text-base mt-2">AI & Global Tech Momentum</h4>
          <p className="text-xs text-slate-400 mt-1">
            60% Global Tech & Infra Feeders, 30% Multi-Asset/REITs, 10% Money Market.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between text-[11px] text-slate-400">
            <span>Expected Vol: <strong>14.0% - 18.0%</strong></span>
            <span>High Growth</span>
          </div>
        </div>

      </div>

      {/* Rebalance Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Target vs Actual Weight Comparison */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-base">Allocation Target vs Actual</h3>
              <p className="text-xs text-slate-400">Tolerance band (+/- 2%) deviation analysis</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-300">
              Total: ₱{rebalanceData?.totalGInvestValue?.toLocaleString() || '0'}
            </span>
          </div>

          <div className="space-y-4">
            {allocations.map((alloc) => {
              const isOver = alloc.deltaValue < -500;
              const isUnder = alloc.deltaValue > 500;
              return (
                <div key={alloc.fundId} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-sm">{alloc.fundName}</span>
                      <span className="text-[11px] text-slate-400 ml-2">({alloc.category})</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      alloc.action === 'BUY'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : alloc.action === 'REBALANCE_TRIM'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {alloc.action === 'REBALANCE_TRIM' ? 'TRIM / SELL' : alloc.action}
                    </span>
                  </div>

                  {/* Weight Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Current: <strong className="text-white font-mono">{alloc.currentWeightPercent}%</strong> (₱{alloc.currentValue.toLocaleString()})</span>
                      <span>Target: <strong className="text-emerald-400 font-mono">{alloc.targetWeightPercent}%</strong> (₱{alloc.targetValue.toLocaleString()})</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isUnder ? 'bg-amber-400' : 'bg-emerald-400'}`}
                        style={{ width: `${Math.min(100, alloc.currentWeightPercent * 2)}%` }}
                      />
                    </div>
                  </div>

                  {/* Delta Output */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/50 text-slate-400">
                    <span>Target Adjustment:</span>
                    <span className={`font-mono font-bold ${alloc.deltaValue > 0 ? 'text-emerald-400' : alloc.deltaValue < 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                      {alloc.deltaValue > 0 ? `+₱${alloc.deltaValue.toLocaleString()} (Buy approx ${alloc.estimatedUnitsDelta} units)` : alloc.deltaValue < 0 ? `-₱${Math.abs(alloc.deltaValue).toLocaleString()} (Sell approx ${Math.abs(alloc.estimatedUnitsDelta)} units)` : 'On Target (±0.0%)'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Tactical Step-by-Step GCash GInvest Execution Checklist */}
        <div className="lg:col-span-1 p-6 rounded-2xl glass-panel border border-emerald-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20 space-y-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">GCash GInvest Action Plan</h3>
              <p className="text-[11px] text-slate-400">Exact execution sequence</p>
            </div>
          </div>

          {/* Instructions Timeline */}
          <div className="space-y-3">
            {instructions.map((inst, idx) => (
              <div 
                key={idx}
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  inst.type === 'SELL'
                    ? 'bg-amber-500/5 border-amber-500/20 text-slate-200'
                    : inst.type === 'BUY'
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                      {inst.step}
                    </span>
                    <span>{inst.title}</span>
                  </span>
                  {inst.type && (
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                      inst.type === 'SELL' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {inst.type}
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed pl-6">
                  {inst.description}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            <span className="text-slate-300 font-bold block mb-0.5">💡 Execution Protocol:</span>
            Always execute redemptions (SELL) first. Once Philippine PESO cash settles to your GCash Wallet balance (1-3 banking days), execute the corresponding subscriptions (BUY).
          </div>
        </div>

      </div>

    </div>
  );
}
