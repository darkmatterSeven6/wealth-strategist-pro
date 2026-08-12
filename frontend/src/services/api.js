/**
 * DV Financials Frontend API Service Client
 */

const API_BASE = '/api';

export const api = {
  // Accounts
  getAccounts: async () => {
    const res = await fetch(`${API_BASE}/accounts`, { cache: 'no-store' });
    return res.json();
  },
  overrideAccount: async (data) => {
    const res = await fetch(`${API_BASE}/accounts/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  createAccount: async (data) => {
    const res = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  reorderAccounts: async (accountIds) => {
    const res = await fetch(`${API_BASE}/accounts/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountIds })
    });
    return res.json();
  },

  // GInvest & Quant
  getFunds: async () => {
    const res = await fetch(`${API_BASE}/ginvest/funds`, { cache: 'no-store' });
    return res.json();
  },
  updateHolding: async (data) => {
    const res = await fetch(`${API_BASE}/ginvest/update-holding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  scrapeNavpu: async () => {
    const res = await fetch(`${API_BASE}/ginvest/scrape`, {
      method: 'POST'
    });
    return res.json();
  },
  createFund: async (data) => {
    const res = await fetch(`${API_BASE}/ginvest/fund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  activatePendingOrder: async (fundId) => {
    const res = await fetch(`${API_BASE}/ginvest/activate-pending-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fundId })
    });
    return res.json();
  },
  parseScreenshotText: async (rawText, metadata) => {
    const res = await fetch(`${API_BASE}/ginvest/parse-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText, metadata })
    });
    return res.json();
  },
  importScreenshotData: async (data) => {
    const res = await fetch(`${API_BASE}/ginvest/import-screenshot-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Rebalancing
  getModels: async () => {
    const res = await fetch(`${API_BASE}/rebalance/models`, { cache: 'no-store' });
    return res.json();
  },
  analyzeRebalancing: async (modelKey) => {
    const res = await fetch(`${API_BASE}/rebalance/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modelKey })
    });
    return res.json();
  },

  // Liabilities & BNPL
  getLiabilities: async () => {
    const res = await fetch(`${API_BASE}/liabilities`, { cache: 'no-store' });
    return res.json();
  },
  createLiability: async (data) => {
    const res = await fetch(`${API_BASE}/liabilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  payLiability: async (liabilityId, paymentAmount) => {
    const res = await fetch(`${API_BASE}/liabilities/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liabilityId, paymentAmount })
    });
    return res.json();
  },
  updateLiability: async (data) => {
    const res = await fetch(`${API_BASE}/liabilities/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteLiability: async (id) => {
    const res = await fetch(`${API_BASE}/liabilities/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },
  getCreditCards: async () => {
    const res = await fetch(`${API_BASE}/liabilities/cards`, { cache: 'no-store' });
    return res.json();
  },
  addCardTransaction: async (data) => {
    const res = await fetch(`${API_BASE}/liabilities/card/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateCreditCard: async (data) => {
    const res = await fetch(`${API_BASE}/liabilities/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  payCreditCard: async (data) => {
    const res = await fetch(`${API_BASE}/liabilities/card/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Analytics & Summary
  getNetWorthSummary: async () => {
    const res = await fetch(`${API_BASE}/analytics/networth-summary`, { cache: 'no-store' });
    return res.json();
  },
  getMacro: async () => {
    const res = await fetch(`${API_BASE}/analytics/macro`, { cache: 'no-store' });
    return res.json();
  },
  updateMacro: async (data) => {
    const res = await fetch(`${API_BASE}/analytics/macro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Sync & Rails
  syncData: async () => {
    const res = await fetch(`${API_BASE}/sync-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },
  runFullSync: async () => {
    const res = await fetch(`${API_BASE}/sync/run-all`, {
      method: 'POST'
    });
    return res.json();
  },
  getSyncLogs: async () => {
    const res = await fetch(`${API_BASE}/sync/logs`, { cache: 'no-store' });
    return res.json();
  },
  postMockRail: async (rail, payload) => {
    const res = await fetch(`${API_BASE}/sync/${rail}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },
  uploadStatement: async (payload) => {
    const res = await fetch(`${API_BASE}/sync/statement-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // System Save & Cloud Sync (Local + GitHub)
  saveAndPushToGitHub: async (message = null) => {
    const res = await fetch(`${API_BASE}/system/save-and-push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    return res.json();
  },
  getSystemSyncStatus: async () => {
    const res = await fetch(`${API_BASE}/system/sync-status`, { cache: 'no-store' });
    return res.json();
  },
  shutdownSystem: async () => {
    const res = await fetch(`${API_BASE}/system/shutdown`, {
      method: 'POST'
    });
    return res.json();
  }
};
