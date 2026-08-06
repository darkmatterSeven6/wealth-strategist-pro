import React from 'react';
import { 
  Activity, 
  RefreshCw, 
  Sliders, 
  Wallet, 
  TrendingUp, 
  PieChart, 
  CreditCard, 
  Radio, 
  Zap, 
  Save, 
  LogOut, 
  Check, 
  GitBranch 
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  summary, 
  isSyncing, 
  onTriggerSync, 
  onOpenOverride,
  onSaveAndSync,
  isSaving,
  hasUnsavedChanges = false,
  lastSavedTime = null,
  onOpenExit
}) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: PieChart },
    { id: 'accounts', label: 'Digital Banks', icon: Wallet },
    { id: 'ginvest', label: 'GInvest & Quant', icon: TrendingUp },
    { id: 'rebalance', label: 'Rebalancing', icon: Sliders },
    { id: 'liabilities', label: 'Liabilities & BNPL', icon: CreditCard },
    { id: 'sync', label: 'Ingestion Rails', icon: Radio },
  ];

  const netWorth = summary?.netWorth || 0;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-[#080c14]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-cyan-400 p-[2px] shadow-glow-emerald">
                <div className="w-full h-full bg-[#080c14] rounded-[10px] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
                    DV <span className="text-emerald-400">FINANCIALS</span>
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                    LOCAL v1.0
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>PH Wealth Engine Live</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/60">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions, Live Net Worth, Save & Exit */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Net Worth Pill */}
            <div className="hidden xl:flex flex-col items-end px-3 py-1 bg-slate-900/80 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Total Net Worth
              </span>
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-extrabold text-white font-mono">
                  ₱{netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1 rounded">
                  +{summary?.totalGInvestGainPercent?.toFixed(1) || '0.0'}%
                </span>
              </div>
            </div>

            {/* Fast Override Button */}
            <button
              onClick={onOpenOverride}
              className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
              title="Fast Manual Balance Override"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Quick Adjust</span>
            </button>

            {/* Sync All Button */}
            <button
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition disabled:opacity-50"
              title="Run Automated Account & NAVPU Ingestion"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
            </button>

            {/* 🟢 Primary SAVE & SYNC BUTTON (Local & GitHub) */}
            <button
              onClick={onSaveAndSync}
              disabled={isSaving}
              className={`relative flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 shadow-md ${
                hasUnsavedChanges
                  ? 'bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 shadow-amber-500/20 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20'
              } disabled:opacity-50`}
              title="Save all changes locally and push to GitHub repository"
            >
              {isSaving ? (
                <Save className="w-3.5 h-3.5 animate-spin" />
              ) : hasUnsavedChanges ? (
                <Save className="w-3.5 h-3.5 text-slate-950" />
              ) : (
                <Check className="w-3.5 h-3.5 text-emerald-200" />
              )}
              <span>{isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Save & Sync'}</span>

              {/* Unsaved indicator dot */}
              {hasUnsavedChanges && (
                <span className="w-2 h-2 rounded-full bg-amber-900 border border-amber-300 absolute -top-1 -right-1" />
              )}
            </button>

            {/* 🚪 EXIT BUTTON */}
            <button
              onClick={onOpenExit}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-900/90 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 text-xs font-semibold rounded-lg border border-slate-800 hover:border-rose-800/60 transition"
              title="Exit DV Financials Session"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto space-x-1 py-2 border-t border-slate-800/60 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs whitespace-nowrap font-medium ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
