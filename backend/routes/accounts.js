const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const accrualEngine = require('../services/accrualEngine');

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

// POST trigger daily net interest accruals (Midnight Net Yield Engine)
router.post('/run-accruals', async (req, res) => {
  try {
    const result = await accrualEngine.runDailyAccrual(true);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST fast override balance, APY, Name, Account Number, or Tier
router.post('/override', (req, res) => {
  const { accountId, name, institution, accountNumber, balance, currentApy, tierInfo } = req.body;
  if (!accountId) {
    return res.status(400).json({ success: false, error: 'accountId is required.' });
  }

  const db = dataStore.getDb();
  const accIndex = db.accounts.findIndex(a => a.id === accountId);
  if (accIndex === -1) {
    return res.status(404).json({ success: false, error: 'Account not found.' });
  }

  const acc = db.accounts[accIndex];
  if (name !== undefined && name !== null && name.trim() !== '') {
    acc.name = name.trim();
  }
  if (institution !== undefined && institution !== null) {
    acc.institution = institution.trim();
  }
  if (accountNumber !== undefined && accountNumber !== null) {
    acc.accountNumber = accountNumber.trim();
  }
  if (balance !== undefined && balance !== null && balance !== '') {
    acc.balance = parseFloat(balance);
  }
  if (currentApy !== undefined && currentApy !== null && currentApy !== '') {
    acc.currentApy = parseFloat(currentApy);
  }
  if (tierInfo !== undefined && tierInfo !== null) {
    acc.tierInfo = tierInfo.trim();
  }

  // Recalculate daily net interest (less 20% withholding tax)
  acc.dailyInterestEstimate = parseFloat(((acc.balance * (acc.currentApy / 100) * 0.80) / 365).toFixed(2));
  acc.lastSynced = new Date().toISOString();

  dataStore.saveDb(db);
  dataStore.addSyncLog('Manual Fast-Override', 'success', `Updated ${acc.name} (${acc.accountNumber}) balance to ₱${acc.balance.toLocaleString()} @ ${acc.currentApy}% APY.`);

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
    dailyInterestEstimate: parseFloat(((numBalance * (apy / 100) * 0.80) / 365).toFixed(2)),
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

// POST /api/accounts/reorder - Save new drag-and-drop order
router.post('/reorder', (req, res) => {
  const { accountIds } = req.body;
  if (!Array.isArray(accountIds)) {
    return res.status(400).json({ success: false, error: 'accountIds must be an array of account IDs.' });
  }

  const db = dataStore.getDb();
  const currentAccounts = db.accounts || [];

  const accountMap = new Map(currentAccounts.map(acc => [acc.id, acc]));
  const reordered = [];

  for (const id of accountIds) {
    if (accountMap.has(id)) {
      reordered.push(accountMap.get(id));
      accountMap.delete(id);
    }
  }

  // Append any accounts not included in accountIds to prevent data loss
  for (const remaining of accountMap.values()) {
    reordered.push(remaining);
  }

  db.accounts = reordered;
  dataStore.saveDb(db);
  dataStore.addSyncLog('Account Manager', 'info', `Updated account card display order.`);

  res.json({
    success: true,
    message: 'Accounts reordered successfully.',
    accounts: db.accounts
  });
});

module.exports = router;

