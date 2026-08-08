import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import DashboardOverview from './components/DashboardOverview';
import AccountAggregator from './components/AccountAggregator';
import GInvestIntelligence from './components/GInvestIntelligence';
import PortfolioRebalancer from './components/PortfolioRebalancer';
import LiabilitiesBNPLTracker from './components/LiabilitiesBNPLTracker';
import IngestionRailsSync from './components/IngestionRailsSync';
import FastOverrideModal from './components/FastOverrideModal';
import ExitConfirmationModal from './components/ExitConfirmationModal';
import ExitScreen from './components/ExitScreen';
import { api } from './services/api';
import { CheckCircle2, AlertCircle, GitBranch, X, Database } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { showSuccessToast, showErrorToast, showInfoToast } from './utils/toast';

export { showSuccessToast, showErrorToast, showInfoToast };

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  // System & Save/Exit States
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isExited, setIsExited] = useState(false);
  const [savedToGitHubOnExit, setSavedToGitHubOnExit] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Core Data States
  const [summaryData, setSummaryData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [fundsData, setFundsData] = useState(null);
  const [rebalanceData, setRebalanceData] = useState(null);
  const [rebalanceModels, setRebalanceModels] = useState(null);
  const [liabilitiesData, setLiabilitiesData] = useState(null);
  const [syncLogs, setSyncLogs] = useState([]);
  const [macroData, setMacroData] = useState(null);

  // Helper for floating dark-mode notifications
  const showToast = (type, title, text) => {
    const formatted = text ? `${title}: ${text}` : title;
    if (type === 'success') {
      showSuccessToast(formatted);
    } else if (type === 'error') {
      showErrorToast(formatted);
    } else {
      showInfoToast(formatted);
    }
    setToastMessage({ type, title, text, id: Date.now() });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.id ? null : prev));
    }, 6000);
  };

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
    // Check if initial repo has pending changes
    api.getSystemSyncStatus().then((res) => {
      if (res.success) {
        if (!res.isClean) {
          setHasUnsavedChanges(true);
        }
        if (res.lastCommit) {
          setLastSavedTime(res.lastCommit);
        }
      }
    }).catch(() => {});
  }, [loadAllData]);

  // Connect WebSocket for Live Real-Time Data Push
  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;
    let isUnmounted = false;

    const connectWs = () => {
      if (isUnmounted) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          // Connected cleanly
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.event === 'SYNC_COMPLETE' || payload.event === 'DATA_UPDATED') {
              loadAllData();
            }
          } catch (e) {}
        };

        ws.onerror = () => {
          // Handled gracefully without uncaught exceptions
        };

        ws.onclose = () => {
          if (!isUnmounted) {
            reconnectTimeout = setTimeout(connectWs, 3000);
          }
        };
      } catch (e) {
        if (!isUnmounted) {
          reconnectTimeout = setTimeout(connectWs, 5000);
        }
      }
    };

    connectWs();

    return () => {
      isUnmounted = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        ws.onclose = null;
        ws.onerror = null;
        ws.close();
      }
    };
  }, [loadAllData]);


  // Browser beforeunload prompt if unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Current Data and settings have not been saved. Would you like to Save now before exiting?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // 🟢 Unified Save & Push to GitHub Handler
  const handleSaveAndSync = async (customMessage = null) => {
    setIsSaving(true);
    try {
      const res = await api.saveAndPushToGitHub(customMessage);
      if (res.success) {
        setHasUnsavedChanges(false);
        const formattedTime = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        setLastSavedTime(formattedTime);

        if (res.githubPushed) {
          showToast(
            'success',
            'Saved Locally & Synced with GitHub',
            `State committed & pushed to GitHub main successfully at ${formattedTime}.`
          );
        } else {
          showToast(
            'warning',
            'Saved to Local Database',
            `Saved to db.json locally. (GitHub sync note: ${res.error || 'Check network'})`
          );
        }
        await loadAllData();
        return true;
      } else {
        showToast('error', 'Save Failed', res.error || 'Could not save local database.');
        return false;
      }
    } catch (err) {
      showToast('error', 'Save Error', err.message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // 🚪 Exit Handlers
  const handleOpenExit = () => {
    setIsExitModalOpen(true);
  };

  const handleSaveAndExit = async () => {
    const saved = await handleSaveAndSync('chore: Save & Exit DV Financials session');
    setIsExitModalOpen(false);
    if (saved) {
      setSavedToGitHubOnExit(true);
      setIsExited(true);
      try {
        await api.shutdownSystem();
      } catch (e) {
        console.warn('[System Shutdown Call Note]:', e);
      }
      try {
        window.close();
      } catch (e) {}
    }
  };

  const handleExitWithoutSaving = async () => {
    setIsExitModalOpen(false);
    setSavedToGitHubOnExit(false);
    setIsExited(true);
    try {
      await api.shutdownSystem();
    } catch (e) {
      console.warn('[System Shutdown Call Note]:', e);
    }
    try {
      window.close();
    } catch (e) {}
  };

  const handleResumeSession = () => {
    setIsExited(false);
    loadAllData();
  };

  // Core Data Mutation Handlers (Each marks hasUnsavedChanges = true)
  const handleTriggerSync = async () => {
    setIsSyncing(true);
    console.log('[UI] "Sync Data" clicked. Dispatching POST /api/sync-data...');
    try {
      const res = await api.syncData();
      console.log('[UI] Sync response:', res);
      await loadAllData();
      setHasUnsavedChanges(true);
      return res;
    } catch (err) {
      console.error('[UI Sync Error]:', err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };


  const handleScrapeNavpu = async () => {
    setIsScraping(true);
    try {
      await api.scrapeNavpu();
      await loadAllData();
      setHasUnsavedChanges(true);
    } finally {
      setIsScraping(false);
    }
  };

  const handleOverrideAccount = async (payload) => {
    await api.overrideAccount(payload);
    await loadAllData();
    setHasUnsavedChanges(true);
  };

  const handleCreateAccount = async (payload) => {
    await api.createAccount(payload);
    await loadAllData();
    setHasUnsavedChanges(true);
  };

  const handleUpdateHolding = async (payload) => {
    await api.updateHolding(payload);
    await loadAllData();
    setHasUnsavedChanges(true);
  };

  const handleCreateFund = async (payload) => {
    await api.createFund(payload);
    await loadAllData();
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
  };

  const handleCreateLiability = async (payload) => {
    await api.createLiability(payload);
    await loadAllData();
    setHasUnsavedChanges(true);
  };

  const handleUpdateLiability = async (payload) => {
    await api.updateLiability(payload);
    await loadAllData();
    setHasUnsavedChanges(true);
  };

  const handleDeleteLiability = async (id) => {
    await api.deleteLiability(id);
    await loadAllData();
    setHasUnsavedChanges(true);
  };

  const handlePostMockRail = async (rail, payload) => {
    const res = await api.postMockRail(rail, payload);
    await loadAllData();
    setHasUnsavedChanges(true);
    return res;
  };

  const handleUploadStatement = async (payload) => {
    const res = await api.uploadStatement(payload);
    await loadAllData();
    setHasUnsavedChanges(true);
    return res;
  };

  const handleUpdateMacro = async (payload) => {
    const res = await api.updateMacro(payload);
    if (res.success) {
      setMacroData(res.macro);
      await loadAllData();
      setHasUnsavedChanges(true);
    }
  };

  // If user chose to exit session, display clean ExitScreen
  if (isExited) {
    return (
      <ExitScreen
        onResume={handleResumeSession}
        savedToGitHub={savedToGitHubOnExit}
        lastSavedTime={lastSavedTime}
      />
    );
  }

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
        onSaveAndSync={() => handleSaveAndSync()}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        lastSavedTime={lastSavedTime}
        onOpenExit={handleOpenExit}
      />

      {/* Floating Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-slideUp">
          <div className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start space-x-3 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-950/50'
              : toastMessage.type === 'warning'
              ? 'bg-amber-950/90 border-amber-500/40 text-amber-100 shadow-amber-950/50'
              : 'bg-rose-950/90 border-rose-500/40 text-rose-100 shadow-rose-950/50'
          }`}>
            <div className="shrink-0 mt-0.5">
              {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toastMessage.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400" />}
              {toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
            </div>
            <div className="flex-1 text-xs">
              <h4 className="font-bold text-sm text-white mb-0.5">{toastMessage.title}</h4>
              <p className="opacity-90 leading-relaxed">{toastMessage.text}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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

      {/* Exit Confirmation & Unsaved Changes Modal */}
      <ExitConfirmationModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onSaveAndExit={handleSaveAndExit}
        onExitWithoutSaving={handleExitWithoutSaving}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        lastSavedTime={lastSavedTime}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500 bg-[#080c14] mt-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span>DV Financials v1.0 • Local Philippine Wealth & Quantitative Engine</span>
            {hasUnsavedChanges ? (
              <span className="inline-flex items-center space-x-1 text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>Pending Unsaved Changes</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <GitBranch className="w-3 h-3" />
                <span>Synced with GitHub</span>
              </span>
            )}
          </div>
          <span className="text-slate-400">Zero Cloud Dependencies • 100% Local JSON Persistence</span>
        </div>
      </footer>

      {/* Dark-Mode Toast Notification Provider */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 5000,
        }} 
      />

    </div>
  );
}
