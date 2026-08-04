const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');

// GET all accounts
router.get('/', (req, res) => {
  const db = dataStore.getDb();
  const accounts = db.accounts || [];
  const totalLiquid = accounts
    .filter(a => a.isLiquid)
    .reduce((sum, a) => sum + a.balance, 0);
  const totalBalances = accounts.reduce((sum, a) => sum + a.balance, 0);

  res.json({
    success: true,
    totalBalances: parseFloat(totalBalances.toFixed(2)),
    totalLiquid: parseFloat(totalLiquid.toFixed(2)),
    count: accounts.length,
    accounts
  });
});

// POST fast override balance or APY
router.post('/override', (req, res) => {
  const { accountId, balance, currentApy, tierInfo } = req.body;
  if (!accountId) {
    return res.status(400).json({ success: false, error: 'accountId is required.' });
  }

  const db = dataStore.getDb();
  const accIndex = db.accounts.findIndex(a => a.id === accountId);
  if (accIndex === -1) {
    return res.status(404).json({ success: false, error: 'Account not found.' });
  }

  const acc = db.accounts[accIndex];
  if (balance !== undefined && balance !== null) {
    acc.balance = parseFloat(balance);
  }
  if (currentApy !== undefined && currentApy !== null) {
    acc.currentApy = parseFloat(currentApy);
  }
  if (tierInfo) {
    acc.tierInfo = tierInfo;
  }

  // Recalculate daily interest
  acc.dailyInterestEstimate = parseFloat(((acc.balance * (acc.currentApy / 100)) / 365).toFixed(2));
  acc.lastSynced = new Date().toISOString();

  dataStore.saveDb(db);
  dataStore.addSyncLog('Manual Fast-Override', 'success', `Updated ${acc.name} balance to ₱${acc.balance.toLocaleString()} @ ${acc.currentApy}% APY.`);

  res.json({
    success: true,
    message: `Account ${acc.name} updated successfully.`,
    account: acc
  });
});

// POST create custom account
router.post('/', (req, res) => {
  const { name, institution, type, balance, currentApy, tierInfo, color } = req.body;
  if (!name || balance === undefined) {
    return res.status(400).json({ success: false, error: 'Name and balance are required.' });
  }

  const db = dataStore.getDb();
  const apy = currentApy ? parseFloat(currentApy) : 3.00;
  const numBalance = parseFloat(balance);
  const newAccount = {
    id: `acc-custom-${Date.now()}`,
    name,
    institution: institution || name,
    type: type || 'digital_bank',
    accountNumber: `•••• ${Math.floor(1000 + Math.random() * 9000)}`,
    balance: numBalance,
    baseApy: apy,
    currentApy: apy,
    dailyInterestEstimate: parseFloat(((numBalance * (apy / 100)) / 365).toFixed(2)),
    tierInfo: tierInfo || `${apy}% p.a. custom account`,
    color: color || '#3b82f6',
    icon: 'CustomBank',
    isLiquid: true,
    status: 'connected',
    lastSynced: new Date().toISOString()
  };

  db.accounts.push(newAccount);
  dataStore.saveDb(db);
  dataStore.addSyncLog('Account Manager', 'success', `Created new account: ${name}`);

  res.json({ success: true, account: newAccount });
});

module.exports = router;
