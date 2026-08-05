import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import DashboardOverview from './components/DashboardOverview';
import AccountAggregator from './components/AccountAggregator';
import GInvestIntelligence from './components/GInvestIntelligence';
import PortfolioRebalancer from './components/PortfolioRebalancer';
import LiabilitiesBNPLTracker from './components/LiabilitiesBNPLTracker';
import IngestionRailsSync from './components/IngestionRailsSync';
import FastOverrideModal from './components/FastOverrideModal';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  // Core Data States
  const [summaryData, setSummaryData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [fundsData, setFundsData] = useState(null);
  const [rebalanceData, setRebalanceData] = useState(null);
  const [rebalanceModels, setRebalanceModels] = useState(null);
  const [liabilitiesData, setLiabilitiesData] = useState(null);
  const [syncLogs, setSyncLogs] = useState([]);
  const [macroData, setMacroData] = useState(null);

  // Fetch all initial data
  const loadAllData = useCallback(async () => {
    try {
      const [sumRes, accRes, fundsRes, modelsRes, rebalRes, liabRes, logsRes, macroRes] = await Promise.all([
        api.getNetWorthSummary(),
        api.getAccounts(),
        api.getFunds(),
        api.getModels(),
        api.analyzeRebalancing('aggressive'),
        api.getLiabilities(),
        api.getSyncLogs(),
        api.getMacro()
      ]);

      if (sumRes.success) setSummaryData(sumRes);
      if (accRes.success) setAccounts(accRes.accounts);
      if (fundsRes.success) setFundsData(fundsRes);
      if (modelsRes.success) setRebalanceModels(modelsRes.models);
      if (rebalRes.success) setRebalanceData(rebalRes);
      if (liabRes.success) setLiabilitiesData(liabRes);
      if (logsRes.success) setSyncLogs(logsRes.logs);
      if (macroRes.success) setMacroData(macroRes.macro);
    } catch (err) {
      console.error('Failed loading DV Financials state:', err);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Connect WebSocket for Live Real-Time Data Push
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let ws;

    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === 'SYNC_COMPLETE' || payload.event === 'DATA_UPDATED') {
            loadAllData();
          }
        } catch (e) {}
      };
    } catch (e) {
      console.warn('WebSocket connection not ready, using polling fallback');
    }

    return () => {
      if (ws) ws.close();
    };
  }, [loadAllData]);

  // Handler Actions
  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      await api.runFullSync();
      await loadAllData();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleScrapeNavpu = async () => {
    setIsScraping(true);
    try {
      await api.scrapeNavpu();
      await loadAllData();
    } finally {
      setIsScraping(false);
    }
  };

  const handleOverrideAccount = async (payload) => {
    await api.overrideAccount(payload);
    await loadAllData();
  };

  const handleCreateAccount = async (payload) => {
    await api.createAccount(payload);
    await loadAllData();
  };

  const handleUpdateHolding = async (payload) => {
    await api.updateHolding(payload);
    await loadAllData();
  };

  const handleCreateFund = async (payload) => {
    await api.createFund(payload);
    await loadAllData();
  };

  const handleAnalyzeRebalance = async (modelKey) => {
    const res = await api.analyzeRebalancing(modelKey);
    if (res.success) {
      setRebalanceData(res);
    }
  };

  const handlePayLiability = async (liabilityId, amount) => {
    await api.payLiability(liabilityId, amount);
    await loadAllData();
  };

  const handleCreateLiability = async (payload) => {
    await api.createLiability(payload);
    await loadAllData();
  };

  const handleUpdateLiability = async (payload) => {
    await api.updateLiability(payload);
    await loadAllData();
  };

  const handleDeleteLiability = async (id) => {
    await api.deleteLiability(id);
    await loadAllData();
  };

  const handlePostMockRail = async (rail, payload) => {
    const res = await api.postMockRail(rail, payload);
    await loadAllData();
    return res;
  };

  const handleUploadStatement = async (payload) => {
    const res = await api.uploadStatement(payload);
    await loadAllData();
    return res;
  };

  const handleUpdateMacro = async (payload) => {
    const res = await api.updateMacro(payload);
    if (res.success) {
      setMacroData(res.macro);
      await loadAllData();
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Top Sticky Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        summary={summaryData?.summary}
        isSyncing={isSyncing}
        onTriggerSync={handleTriggerSync}
        onOpenOverride={() => setIsOverrideModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'overview' && (
          <DashboardOverview
            data={summaryData}
            onNavigateTab={setActiveTab}
            onTriggerSync={handleTriggerSync}
            onOpenOverride={() => setIsOverrideModalOpen(true)}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountAggregator
            accounts={accounts}
            onOverrideAccount={handleOverrideAccount}
            onCreateAccount={handleCreateAccount}
          />
        )}

        {activeTab === 'ginvest' && (
          <GInvestIntelligence
            fundsData={fundsData}
            onScrapeNavpu={handleScrapeNavpu}
            onUpdateHolding={handleUpdateHolding}
            onCreateFund={handleCreateFund}
            isScraping={isScraping}
          />
        )}

        {activeTab === 'rebalance' && (
          <PortfolioRebalancer
            rebalanceData={rebalanceData}
            models={rebalanceModels}
            onAnalyzeRebalance={handleAnalyzeRebalance}
            macroData={macroData}
            onUpdateMacro={handleUpdateMacro}
          />
        )}

        {activeTab === 'liabilities' && (
          <LiabilitiesBNPLTracker
            liabilitiesData={liabilitiesData}
            onPayLiability={handlePayLiability}
            onCreateLiability={handleCreateLiability}
            onUpdateLiability={handleUpdateLiability}
            onDeleteLiability={handleDeleteLiability}
          />
        )}

        {activeTab === 'sync' && (
          <IngestionRailsSync
            syncLogs={syncLogs}
            onRunFullSync={handleTriggerSync}
            onPostMockRail={handlePostMockRail}
            onUploadStatement={handleUploadStatement}
            isSyncing={isSyncing}
          />
        )}
      </main>

      {/* Fast Manual Override Modal */}
      <FastOverrideModal
        accounts={accounts}
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        onSaveOverride={handleOverrideAccount}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500 bg-[#080c14]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>DV Financials v1.0 • Local Philippine Wealth & Quantitative Engine</span>
          <span className="text-slate-400">Zero Cloud Dependencies • 100% Local JSON Persistence</span>
        </div>
      </footer>

    </div>
  );
}
