import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  ArrowUpRight, 
  Coins, 
  PieChart as PieIcon, 
  Calendar,
  Layers,
  Percent,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function DashboardOverview({ 
  data, 
  onNavigateTab, 
  onTriggerSync, 
  onOpenOverride 
}) {
  const summary = data?.summary || {};
  const macro = data?.macro || {};
  const quant = summary?.quant || {};
  const liabilities = summary?.liabilitiesAndLiquidity || {};
  const liquidity = liabilities?.liquidity || {};

  const netWorth = summary?.netWorth || 0;
  const totalAssets = summary?.totalAssets || 0;
  const totalLiab = summary?.totalLiabilities || 0;
  const totalGInvest = summary?.totalGInvestAssets || 0;
  const totalCashBanks = summary?.totalCashBankAssets || 0;

  const cashPercent = summary?.cashPercent || 0;
  const ginvestPercent = summary?.ginvestPercent || 0;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Macro & Strategy Alert Banner */}
      <div className="p-4 rounded-2xl glass-panel border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-cyan-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Philippine Macro Regime & Tactical Pulse
              </span>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 font-bold rounded-full">
                AI MOMENTUM: {macro.techMomentumScore || 82.5}/100
              </span>
            </div>
            <p className="text-sm text-slate-300 font-medium">
              3M PH T-Bill Yield: <span className="text-white font-mono font-bold">{macro.phThreeMonthTBillRate || 5.50}%</span> | BSP Policy Rate: <span className="text-white font-mono font-bold">{macro.bspPolicyRate || 6.50}%</span> | USD/PHP: <span className="text-white font-mono font-bold">₱{macro.usdPhpExchangeRate || 58.50}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={() => onNavigateTab('rebalance')}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg shadow-glow-emerald transition flex items-center space-x-1"
          >
            <span>View Rebalance Plan</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Hero KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Net Worth */}
        <div className="p-5 rounded-2xl glass-panel-interactive relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Net Worth</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight">
              ₱{netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center space-x-2 mt-1.5 text-xs">
              <span className="text-emerald-400 font-bold flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                +{summary.totalGInvestGainPercent?.toFixed(1) || '0.0'}%
              </span>
              <span className="text-slate-500">Unrealized Growth</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Assets: <strong className="text-slate-200">₱{totalAssets.toLocaleString()}</strong></span>
            <span>Debt: <strong className="text-rose-400">₱{totalLiab.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Card 2: Liquid Digital Banks */}
        <div className="p-5 rounded-2xl glass-panel-interactive relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Liquid Cash & Banks</span>
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight">
              ₱{totalCashBanks.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center space-x-2 mt-1.5 text-xs">
              <span className="text-cyan-400 font-bold">
                +{quant.annualDigitalBankInterest ? `₱${quant.monthlyDigitalBankInterest?.toLocaleString()}/mo` : '₱0/mo'}
              </span>
              <span className="text-slate-500">Passive Yield</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>MariBank / Maya / GoTyme</span>
            <span className="text-cyan-400 font-bold">{cashPercent.toFixed(1)}% of Net Worth</span>
          </div>
        </div>

        {/* Card 3: GInvest Portfolio */}
        <div className="p-5 rounded-2xl glass-panel-interactive relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">GInvest Market Value</span>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight">
              ₱{totalGInvest.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center space-x-2 mt-1.5 text-xs">
              <span className="text-purple-400 font-bold">
                Sharpe: {quant.weightedSharpe || '1.15'}
              </span>
              <span className="text-slate-500">Vol: {quant.weightedVolatility || '11.8'}%</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Gain: <strong className="text-emerald-400">+₱{quant.totalGInvestGain?.toLocaleString() || '0'}</strong></span>
            <span className="text-purple-400 font-bold">{ginvestPercent.toFixed(1)}% Weight</span>
          </div>
        </div>

        {/* Card 4: Liabilities & BNPL Drag */}
        <div className="p-5 rounded-2xl glass-panel-interactive relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Debt & BNPL Drag</span>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight">
              ₱{totalLiab.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center space-x-2 mt-1.5 text-xs">
              <span className="text-rose-400 font-bold">
                -₱{liabilities.monthlyInterestDrag?.toLocaleString() || '0'}/mo
              </span>
              <span className="text-slate-500">Interest Cost</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Buffer: <strong className="text-emerald-400">{liquidity.liquidityMonthsAvailable || '3.5'} Mo</strong></span>
            <span className={`font-bold ${liquidity.isLiquidityDeficit ? 'text-rose-400' : 'text-emerald-400'}`}>
              {liquidity.isLiquidityDeficit ? 'Buffer Deficit' : 'Healthy'}
            </span>
          </div>
        </div>

      </div>

      {/* Asset Allocation & Performance Deep Dive Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Asset Allocation Breakdown */}
        <div className="lg:col-span-1 p-6 rounded-2xl glass-panel border border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-base">Asset Allocation</h3>
              <p className="text-xs text-slate-400">Capital distribution across vehicles</p>
            </div>
            <button 
              onClick={() => onNavigateTab('ginvest')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          {/* Allocation Visual Bar */}
          <div className="h-4 rounded-full bg-slate-800 overflow-hidden flex p-0.5">
            <div 
              className="h-full bg-cyan-400 rounded-l-full transition-all duration-500" 
              style={{ width: `${Math.max(5, cashPercent)}%` }}
              title={`Cash & Banks: ${cashPercent.toFixed(1)}%`}
            />
            <div 
              className="h-full bg-emerald-400 transition-all duration-500" 
              style={{ width: `${Math.max(5, ginvestPercent)}%` }}
              title={`GInvest Feeder Funds: ${ginvestPercent.toFixed(1)}%`}
            />
          </div>

          {/* Allocation Legend List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400" />
                <div>
                  <div className="text-xs font-bold text-slate-200">High-Yield Digital Banks & Wallets</div>
                  <div className="text-[11px] text-slate-400">MariBank, Maya 10%, GoTyme, Tonik</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-white">₱{totalCashBanks.toLocaleString()}</div>
                <div className="text-[10px] text-cyan-400 font-semibold">{cashPercent.toFixed(1)}%</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-slate-200">GInvest UITF & Feeder Funds</div>
                  <div className="text-[11px] text-slate-400">ATRAM Tech, Infra, ALFM Multi-Asset, REITs</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-white">₱{totalGInvest.toLocaleString()}</div>
                <div className="text-[10px] text-emerald-400 font-semibold">{ginvestPercent.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Passive Yield Aggregate Box */}
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-300">Total Projected Passive Cash Flow</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                ₱{summary.annualPassiveIncomeEstimate?.toLocaleString() || '0'}/yr
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Combines daily credited digital bank interest + GInvest feeder dividend payouts.
            </p>
          </div>
        </div>

        {/* Right 2 Columns: Liquidity Buffer & Action Plan */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Liquidity Buffer Health Card */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl ${liquidity.isLiquidityDeficit ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Emergency Liquidity Buffer</h3>
                  <p className="text-xs text-slate-400">Covers essential living burn + fixed debt obligations</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                liquidity.isLiquidityDeficit 
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                {liquidity.healthGrade || 'A+ (Adequate)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
                <span className="text-[11px] text-slate-400 block">Monthly Living Burn</span>
                <span className="text-sm font-bold font-mono text-white">
                  ₱{liquidity.monthlyLivingExpenses?.toLocaleString() || '55,000'}
                </span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
                <span className="text-[11px] text-slate-400 block">Current Liquid Balance</span>
                <span className="text-sm font-bold font-mono text-cyan-400">
                  ₱{liquidity.liquidBalance?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
                <span className="text-[11px] text-slate-400 block">Runway Available</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {liquidity.liquidityMonthsAvailable || '0'} Months
                </span>
              </div>
            </div>

            {/* Visual Runway Progress */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>0 Months</span>
                <span className="text-amber-400 font-medium">Min Buffer (2 Mo)</span>
                <span className="text-emerald-400 font-medium">Ideal Target (3+ Mo)</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    liquidity.liquidityMonthsAvailable >= 3 ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, ((liquidity.liquidityMonthsAvailable || 1) / 4) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Deck */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div 
              onClick={() => onNavigateTab('accounts')}
              className="p-4 rounded-xl glass-panel-interactive cursor-pointer border border-slate-800/80 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 group-hover:text-cyan-400 transition">
                  Digital Bank Yields
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Optimize daily compounding across MariBank 3.75% and Maya boosted tiers.
              </p>
            </div>

            <div 
              onClick={() => onNavigateTab('rebalance')}
              className="p-4 rounded-xl glass-panel-interactive cursor-pointer border border-slate-800/80 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 group-hover:text-emerald-400 transition">
                  Quant Rebalance
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Execute tactical buys/sells across ATRAM Global Tech & ALFM Multi-Asset.
              </p>
            </div>

            <div 
              onClick={() => onNavigateTab('liabilities')}
              className="p-4 rounded-xl glass-panel-interactive cursor-pointer border border-slate-800/80 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 group-hover:text-rose-400 transition">
                  BNPL & APR Drag
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition" />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Track zero-interest grace periods and mitigate 35%+ APR interest erosion.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
