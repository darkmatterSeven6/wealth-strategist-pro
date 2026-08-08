const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const syncWorkers = require('../services/syncWorkers');
const navpuScraper = require('../services/navpuScraper');
const emailParser = require('../services/emailParser');

// POST trigger full automated sync session
router.post('/run-all', async (req, res) => {
  try {
    const updatedAccounts = await syncWorkers.runFullSync();
    const updatedFunds = await navpuScraper.scrapeAllFunds();

    res.json({
      success: true,
      message: 'Full aggregation sync pipeline executed successfully.',
      syncedAccounts: updatedAccounts.length,
      syncedFunds: updatedFunds.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Ingestion Rail: MariBank Mock / Webhook proxy
router.post('/maribank', (req, res) => {
  const { balance, transactions, interestAccrued } = req.body;
  const db = dataStore.getDb();
  const acc = db.accounts.find(a => a.id === 'acc-maribank-01');
  if (acc) {
    if (balance !== undefined) acc.balance = parseFloat(balance);
    if (interestAccrued) acc.dailyInterestEstimate = parseFloat(interestAccrued);
    acc.lastSynced = new Date().toISOString();
    dataStore.saveDb(db);
    dataStore.addSyncLog('MariBank Ingestion Rail', 'success', `Ingested MariBank payload: ₱${acc.balance.toLocaleString()}`);
  }
  res.json({ success: true, message: 'MariBank ingestion processed', account: acc });
});

// POST Ingestion Rail: Maya Mock / Webhook proxy
router.post('/maya', (req, res) => {
  const { savingsBalance, boostedApy, walletBalance } = req.body;
  const db = dataStore.getDb();
  const savingsAcc = db.accounts.find(a => a.id === 'acc-maya-01');
  const walletAcc = db.accounts.find(a => a.id === 'acc-maya-wallet-01');

  if (savingsAcc) {
    if (savingsBalance !== undefined) savingsAcc.balance = parseFloat(savingsBalance);
    if (boostedApy !== undefined) savingsAcc.currentApy = parseFloat(boostedApy);
    savingsAcc.lastSynced = new Date().toISOString();
  }
  if (walletAcc && walletBalance !== undefined) {
    walletAcc.balance = parseFloat(walletBalance);
    walletAcc.lastSynced = new Date().toISOString();
  }

  dataStore.saveDb(db);
  dataStore.addSyncLog('Maya Ingestion Rail', 'success', 'Processed Maya Bank & Wallet webhook event.');
  res.json({ success: true, message: 'Maya ingestion processed' });
});

// POST Ingestion Rail: GCash / GInvest Mock / Webhook proxy
router.post('/gcash', (req, res) => {
  const { walletBalance, ginvestHoldings } = req.body;
  const db = dataStore.getDb();
  const walletAcc = db.accounts.find(a => a.id === 'acc-gcash-wallet-01');
  if (walletAcc && walletBalance !== undefined) {
    walletAcc.balance = parseFloat(walletBalance);
    walletAcc.lastSynced = new Date().toISOString();
  }

  if (Array.isArray(ginvestHoldings)) {
    ginvestHoldings.forEach(item => {
      const fund = db.funds.find(f => f.id === item.fundId);
      if (fund) {
        if (item.unitsHeld !== undefined) fund.unitsHeld = parseFloat(item.unitsHeld);
        if (item.averageCost !== undefined) fund.averageCost = parseFloat(item.averageCost);
        fund.investedCapital = parseFloat((fund.unitsHeld * (fund.averageCost || fund.currentNavpu)).toFixed(2));
        fund.currentMarketValue = parseFloat((fund.unitsHeld * fund.currentNavpu).toFixed(2));
      }
    });
  }

  dataStore.saveDb(db);
  dataStore.addSyncLog('GCash Ingestion Rail', 'success', 'Ingested GCash Wallet & GInvest holdings payload.');
  res.json({ success: true, message: 'GCash ingestion processed' });
});

// POST Ingestion Rail: GoTyme Mock / Webhook proxy
router.post('/gotyme', (req, res) => {
  const { balance, stashes } = req.body;
  const db = dataStore.getDb();
  const acc = db.accounts.find(a => a.id === 'acc-gotyme-01');
  if (acc) {
    if (balance !== undefined) acc.balance = parseFloat(balance);
    if (Array.isArray(stashes)) acc.subAccounts = stashes;
    acc.lastSynced = new Date().toISOString();
    dataStore.saveDb(db);
    dataStore.addSyncLog('GoTyme Ingestion Rail', 'success', `Updated GoTyme balance: ₱${acc.balance.toLocaleString()}`);
  }
  res.json({ success: true, message: 'GoTyme ingestion processed', account: acc });
});

// POST Ingestion Rail: Atome Mock / Webhook proxy
router.post('/atome', (req, res) => {
  const { savingsBalance, cardOutstanding } = req.body;
  const db = dataStore.getDb();
  const acc = db.accounts.find(a => a.id === 'acc-atome-01');
  const liab = db.liabilities.find(l => l.id === 'liab-atome-card');

  if (acc && savingsBalance !== undefined) {
    acc.balance = parseFloat(savingsBalance);
    acc.lastSynced = new Date().toISOString();
  }
  if (liab && cardOutstanding !== undefined) {
    liab.outstandingBalance = parseFloat(cardOutstanding);
  }

  dataStore.saveDb(db);
  dataStore.addSyncLog('Atome Ingestion Rail', 'success', 'Processed Atome Savings & Card sync.');
  res.json({ success: true, message: 'Atome ingestion processed' });
});

// POST Ingestion Rail: Email Receipt Parser Engine
router.post('/email-receipt', (req, res) => {
  const { from, subject, body, date } = req.body;
  if (!body && !subject) {
    return res.status(400).json({ success: false, error: 'Email subject or body is required.' });
  }

  const result = emailParser.ingestAndApply({ from, subject, body, date });
  res.json(result);
});

// GET parsed transactions list
router.get('/transactions', (req, res) => {
  const db = dataStore.getDb();
  res.json({
    success: true,
    transactions: db.transactions || []
  });
});

// POST E-statement upload / parser hook
router.post('/statement-upload', (req, res) => {
  const { rawContent, fileType, institution } = req.body;
  if (!rawContent) {
    return res.status(400).json({ success: false, error: 'rawContent is required.' });
  }

  const result = syncWorkers.parseStatement(rawContent, fileType || 'json');
  if (result.success) {
    dataStore.addSyncLog(
      `E-Statement Hook (${institution || 'General'})`,
      'success',
      `Parsed statement successfully: ${result.recordsFound} records ingested.`
    );
  }

  res.json(result);
});

// GET sync logs
router.get('/logs', (req, res) => {
  const db = dataStore.getDb();
  res.json({
    success: true,
    logs: db.syncLogs || []
  });
});

module.exports = router;

