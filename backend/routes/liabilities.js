const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const bnplEngine = require('../services/bnplEngine');

// GET all liabilities & drag analysis
router.get('/', (req, res) => {
  const db = dataStore.getDb();
  const liabilities = db.liabilities || [];
  const accounts = db.accounts || [];
  const cashFlow = db.cashFlow || {};
  const profile = db.profile || {};

  const analysis = bnplEngine.analyzeLiabilitiesAndLiquidity(liabilities, accounts, cashFlow, profile);

  res.json({
    success: true,
    ...analysis
  });
});

// POST add or update liability
router.post('/', (req, res) => {
  const {
    name,
    provider,
    type,
    outstandingBalance,
    creditLimit,
    billingCycleDueDate,
    nominalMonthlyRate,
    monthlyAdminFee,
    monthlyPayment,
    remainingTermsMonths,
    isZeroInterestPromo
  } = req.body;

  if (!name || outstandingBalance === undefined) {
    return res.status(400).json({ success: false, error: 'Name and outstanding balance are required.' });
  }

  const db = dataStore.getDb();
  const balance = parseFloat(outstandingBalance);
  const nominalRate = nominalMonthlyRate ? parseFloat(nominalMonthlyRate) : 0;
  const adminFee = monthlyAdminFee ? parseFloat(monthlyAdminFee) : 0;
  const effectiveApr = bnplEngine.calculateEffectiveApr(nominalRate, adminFee, balance);

  const newLiab = {
    id: `liab-${Date.now()}`,
    name,
    provider: provider || name,
    type: type || 'bnpl',
    outstandingBalance: balance,
    creditLimit: creditLimit ? parseFloat(creditLimit) : balance * 2,
    billingCycleDueDate: billingCycleDueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    nominalMonthlyRate: nominalRate,
    effectiveApr,
    monthlyAdminFee: adminFee,
    monthlyPayment: monthlyPayment ? parseFloat(monthlyPayment) : (balance / (remainingTermsMonths || 3)),
    remainingTermsMonths: remainingTermsMonths ? parseInt(remainingTermsMonths) : 3,
    isZeroInterestPromo: Boolean(isZeroInterestPromo),
    daysUntilDue: 14,
    status: 'active'
  };

  db.liabilities.push(newLiab);
  dataStore.saveDb(db);
  dataStore.addSyncLog('Liabilities Tracker', 'success', `Added liability line: ${name} (₱${balance.toLocaleString()})`);

  res.json({ success: true, liability: newLiab });
});

// POST pay off / record payment
router.post('/pay', (req, res) => {
  const { liabilityId, paymentAmount } = req.body;
  if (!liabilityId || !paymentAmount) {
    return res.status(400).json({ success: false, error: 'liabilityId and paymentAmount are required.' });
  }

  const db = dataStore.getDb();
  const idx = db.liabilities.findIndex(l => l.id === liabilityId);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Liability not found.' });
  }

  const liab = db.liabilities[idx];
  const payAmt = parseFloat(paymentAmount);
  liab.outstandingBalance = Math.max(0, parseFloat((liab.outstandingBalance - payAmt).toFixed(2)));

  if (liab.outstandingBalance === 0) {
    liab.status = 'paid_off';
  }

  dataStore.saveDb(db);
  dataStore.addSyncLog('Debt Payoff Action', 'success', `Paid ₱${payAmt.toLocaleString()} towards ${liab.name}. Remaining: ₱${liab.outstandingBalance.toLocaleString()}`);

  res.json({
    success: true,
    message: `Payment of ₱${payAmt.toLocaleString()} recorded.`,
    liability: liab
  });
});

// POST update existing liability
router.post('/update', (req, res) => {
  const {
    id,
    name,
    provider,
    type,
    outstandingBalance,
    creditLimit,
    billingCycleDueDate,
    nominalMonthlyRate,
    monthlyAdminFee,
    monthlyPayment,
    remainingTermsMonths,
    isZeroInterestPromo,
    status
  } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Liability ID is required.' });
  }

  const db = dataStore.getDb();
  const idx = db.liabilities.findIndex(l => l.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Liability not found.' });
  }

  const existing = db.liabilities[idx];
  const balance = outstandingBalance !== undefined ? parseFloat(outstandingBalance) : existing.outstandingBalance;
  const limit = creditLimit !== undefined ? parseFloat(creditLimit) : (existing.creditLimit || balance * 2);
  const nominalRate = nominalMonthlyRate !== undefined ? parseFloat(nominalMonthlyRate) : (existing.nominalMonthlyRate || 0);
  const adminFee = monthlyAdminFee !== undefined ? parseFloat(monthlyAdminFee) : (existing.monthlyAdminFee || 0);
  const effectiveApr = bnplEngine.calculateEffectiveApr(nominalRate, adminFee, balance);

  const updatedLiab = {
    ...existing,
    name: name || existing.name,
    provider: provider || existing.provider,
    type: type || existing.type,
    outstandingBalance: balance,
    creditLimit: limit,
    billingCycleDueDate: billingCycleDueDate || existing.billingCycleDueDate,
    nominalMonthlyRate: nominalRate,
    effectiveApr,
    monthlyAdminFee: adminFee,
    monthlyPayment: monthlyPayment !== undefined ? parseFloat(monthlyPayment) : existing.monthlyPayment,
    remainingTermsMonths: remainingTermsMonths !== undefined ? parseInt(remainingTermsMonths) : existing.remainingTermsMonths,
    isZeroInterestPromo: isZeroInterestPromo !== undefined ? Boolean(isZeroInterestPromo) : existing.isZeroInterestPromo,
    status: status || (balance === 0 ? 'paid_off' : existing.status || 'active')
  };

  db.liabilities[idx] = updatedLiab;
  dataStore.saveDb(db);
  dataStore.addSyncLog('Liabilities Tracker', 'success', `Updated liability: ${updatedLiab.name} (Balance: ₱${balance.toLocaleString()}, Limit: ₱${limit.toLocaleString()})`);

  res.json({
    success: true,
    liability: updatedLiab
  });
});

// DELETE liability
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const db = dataStore.getDb();
  const idx = db.liabilities.findIndex(l => l.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Liability not found.' });
  }

  const removed = db.liabilities.splice(idx, 1)[0];
  dataStore.saveDb(db);
  dataStore.addSyncLog('Liabilities Tracker', 'info', `Removed liability line: ${removed.name}`);

  res.json({
    success: true,
    message: `Removed ${removed.name}`
  });
});

module.exports = router;
