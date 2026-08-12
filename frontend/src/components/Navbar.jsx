import React, { useState } from 'react';
import { AccrualConfirmModal } from './AccrualConfirmModal';
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
  Clock,
  SlidersHorizontal,
  Landmark,
  Cloud
} from 'lucide-react';

import { showSuccessToast, showErrorToast } from '../utils/toast';

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
    { id: 'household', line1: 'Household', line2: 'Overview', icon: Landmark },
    { id: 'overview', line1: 'Overview', line2: null, icon: Clock },
    { id: 'accounts', line1: 'Digital', line2: 'Banks', icon: Wallet },
    { id: 'ginvest', line1: 'GInvest', line2: '& Quant', icon: TrendingUp },
    { id: 'rebalance', line1: 'Rebalancing', line2: null, icon: SlidersHorizontal },
    { id: 'liabilities', line1: 'Liabilities', line2: '& BNPL', icon: CreditCard },
    { id: 'sync', line1: 'Ingestion', line2: 'Rails', icon: Radio },
  ];

  const [isAccrualModalOpen, setIsAccrualModalOpen] = useState(false);
  const [isAccrualLoading, setIsAccrualLoading] = useState(false);

  const netWorth = summary?.netWorth || 0;

  const handleSyncData = async () => {
    console.log('[UI] "Sync Data" clicked. Dispatching POST /api/sync-data...');
    try {
      if (onTriggerSync) {
        await onTriggerSync();
      } else {
        const response = await fetch('http://localhost:5001/api/sync-data', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        console.log('[UI] Sync response:', data);
      }
      showSuccessToast('IMAP Email Sync triggered successfully! Check terminal for live logs.');
    } catch (err) {
      console.error('[UI Sync Error]:', err);
      showErrorToast('Sync request failed. Verify backend process on PORT 5001.');
    }
  };

  const handleHouseholdSync = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/household/sync', {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        showSuccessToast('Household State synced successfully with Google Drive.');
        window.location.reload(); // Refresh to fetch newly synced DBs
      } else {
        showErrorToast('Household Sync failed: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      showErrorToast('Household Sync request failed.');
    }
  };

  const executeTestAccrual = async () => {
    setIsAccrualLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/accrual/trigger-daily-test', {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        showSuccessToast('1-Day Accrual Executed Successfully!');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showErrorToast('Accrual Test failed: ' + data.error);
        setIsAccrualLoading(false);
        setIsAccrualModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      showErrorToast('Accrual Test request failed.');
      setIsAccrualLoading(false);
      setIsAccrualModalOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#070b14]/95 backdrop-blur-xl">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* 1. Left Brand Logo & Status */}
          <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => setActiveTab('overview')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-cyan-400 p-[1.5px] shadow-glow-emerald">
              <div className="w-full h-full bg-[#080c14] rounded-[10px] flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#00DC82] fill-[#00DC82]" />
              </div>
            </div>
            <div className="flex flex-col justify-center select-none">
              <div className="flex flex-col leading-[1.05]">
                <span className="font-extrabold text-[13px] tracking-tight text-white">
                  DV
                </span>
                <span className="font-extrabold text-[13px] tracking-tight text-[#00DC82]">
                  FINANCIALS
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00DC82] animate-pulse" />
                <span className="font-medium text-slate-400">PH Wealth Engine Live</span>
              </div>
            </div>
          </div>

          {/* 2. Center Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/40 p-1 rounded-xl border border-slate-800/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-[#00DC82] text-[#080c14] shadow-md shadow-emerald-500/20 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#080c14]' : 'text-slate-400'}`} />
                  <div className="flex flex-col text-left leading-[1.1]">
                    <span className={`text-[11px] font-semibold ${isActive ? 'text-[#080c14] font-bold' : 'text-slate-300'}`}>
                      {tab.line1}
                    </span>
                    {tab.line2 && (
                      <span className={`text-[10px] font-semibold ${isActive ? 'text-[#080c14] font-bold' : 'text-slate-400'}`}>
                        {tab.line2}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* 3. Right Action Cluster */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Total Net Worth Card */}
            <div className="hidden xl:flex flex-col items-center justify-center px-3 py-1 bg-[#0b1220] rounded-lg border border-slate-800/90 shadow-sm">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                TOTAL NET WORTH
              </span>
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-extrabold text-white font-mono tracking-tight">
                  ₱{netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] font-bold text-[#00DC82] bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">
                  +-0.6%
                </span>
              </div>
            </div>

            {/* Quick Adjust Button */}
            <button
              onClick={onOpenOverride}
              className="hidden md:flex items-center space-x-2 px-2.5 py-1.5 bg-[#0b1220] hover:bg-slate-800/80 text-slate-200 rounded-lg border border-slate-800/90 transition shadow-sm"
              title="Fast Manual Balance Override"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="flex flex-col text-left leading-[1.05]">
                <span className="text-[10px] font-bold text-slate-200">Quick</span>
                <span className="text-[10px] font-bold text-slate-400">Adjust</span>
              </div>
            </button>

            {/* Sync Data Button */}
            <button
              onClick={handleSyncData}
              disabled={isSyncing}
              className="hidden sm:flex items-center space-x-2 px-2.5 py-1.5 bg-[#0b1220] hover:bg-slate-800/80 text-slate-200 rounded-lg border border-slate-800/90 transition shadow-sm disabled:opacity-50"
              title="Run Automated Account & NAVPU Ingestion"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-teal-400 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
              <div className="flex flex-col text-left leading-[1.05]">
                <span className="text-[10px] font-bold text-slate-200">Sync</span>
                <span className="text-[10px] font-bold text-slate-400">Data</span>
              </div>
            </button>

            {/* Test Daily Accrual Button */}
            <button
              onClick={() => setIsAccrualModalOpen(true)}
              className="flex items-center space-x-2 px-2.5 py-1.5 bg-amber-900/40 hover:bg-amber-800/60 text-amber-200 rounded-lg border border-amber-800/50 transition shadow-sm"
              title="Trigger 1-Day Auto Accrual Dry Run"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="flex flex-col text-left leading-[1.05]">
                <span className="text-[10px] font-bold text-amber-200">Test Daily</span>
                <span className="text-[10px] font-bold text-amber-400">Accrual</span>
              </div>
            </button>

            {/* Household Sync Button */}
            <button
              onClick={handleHouseholdSync}
              className="flex items-center space-x-2 px-2.5 py-1.5 bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 rounded-lg border border-blue-800/50 transition shadow-sm"
              title="Sync Household State with Google Drive"
            >
              <Cloud className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <div className="flex flex-col text-left leading-[1.05]">
                <span className="text-[10px] font-bold text-blue-200">Household</span>
                <span className="text-[10px] font-bold text-blue-400">Sync</span>
              </div>
            </button>

            {/* 🟢 Solid Save & Sync Button */}
            <button
              onClick={onSaveAndSync}
              disabled={isSaving}
              className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-slate-950 transition-all duration-200 shadow-md ${
                hasUnsavedChanges
                  ? 'bg-gradient-to-r from-amber-400 via-emerald-400 to-[#00DC82] hover:brightness-110 shadow-amber-500/25 animate-pulse'
                  : 'bg-[#00DC82] hover:bg-emerald-400 shadow-emerald-500/25 font-black'
              } disabled:opacity-50`}
              title="Save all changes locally and push to GitHub repository"
            >
              {isSaving ? (
                <RefreshCw className="w-3.5 h-3.5 text-slate-950 animate-spin shrink-0" />
              ) : (
                <Check className="w-3.5 h-3.5 text-slate-950 shrink-0 stroke-[3]" />
              )}
              <div className="flex flex-col text-center font-black leading-[1.05]">
                <span className="text-[10px] uppercase tracking-tight text-slate-950 font-black">Save</span>
                <span className="text-[9px] uppercase tracking-tight text-slate-950 font-black">&</span>
                <span className="text-[10px] uppercase tracking-tight text-slate-950 font-black">Sync</span>
              </div>

              {/* Unsaved indicator badge */}
              {hasUnsavedChanges && (
                <span className="w-2 h-2 rounded-full bg-amber-900 border border-amber-300 absolute -top-1 -right-1" />
              )}
            </button>

            {/* 🚪 Exit Button */}
            <button
              onClick={onOpenExit}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#0b1220] hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 rounded-lg border border-slate-800/90 hover:border-rose-900/60 transition shadow-sm"
              title="Exit DV Financials Session"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-xs font-bold text-rose-400">Exit</span>
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
                    ? 'bg-[#00DC82] text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.line1} {tab.line2 || ''}</span>
              </button>
            );
          })}
        </div>
      </div>
      <AccrualConfirmModal
        isOpen={isAccrualModalOpen}
        onClose={() => setIsAccrualModalOpen(false)}
        onConfirm={executeTestAccrual}
        isLoading={isAccrualLoading}
      />
    </header>
  );
}
