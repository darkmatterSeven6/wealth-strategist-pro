/**
 * FinFlow Pro Frontend API Service Client
 */

const API_BASE = '/api';

export const api = {
  // Accounts
  getAccounts: async () => {
    const res = await fetch(`${API_BASE}/accounts`);
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

  // GInvest & Quant
  getFunds: async () => {
    const res = await fetch(`${API_BASE}/ginvest/funds`);
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

  // Rebalancing
  getModels: async () => {
    const res = await fetch(`${API_BASE}/rebalance/models`);
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
    const res = await fetch(`${API_BASE}/liabilities`);
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

  // Analytics & Summary
  getNetWorthSummary: async () => {
    const res = await fetch(`${API_BASE}/analytics/networth-summary`);
    return res.json();
  },
  getMacro: async () => {
    const res = await fetch(`${API_BASE}/analytics/macro`);
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
  runFullSync: async () => {
    const res = await fetch(`${API_BASE}/sync/run-all`, {
      method: 'POST'
    });
    return res.json();
  },
  getSyncLogs: async () => {
    const res = await fetch(`${API_BASE}/sync/logs`);
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
  }
};
