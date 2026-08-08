const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const bnplEngine = require('../services/bnplEngine');

// GET all liabilities & drag analysis
router.get('/', (req, res) => {
  const db = dataStore.getDb();
  const liabilities = db.liabilities || [];
  const creditCards = db.creditCards || [];
  const accounts = db.accounts || [];
  const cashFlow = db.cashFlow || {};
  const profile = db.profile || {};

  const analysis = bnplEngine.analyzeLiabilitiesAndLiquidity(liabilities, accounts, cashFlow, profile);

  res.json({
    success: true,
    creditCards,
    ...analysis
  });
});

// GET credit cards specifically
router.get('/cards', (req, res) => {
  const db = dataStore.getDb();
  res.json({
    success: true,
    creditCards: db.creditCards || []
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

// ==========================================
// CREDIT CARD & REVOLVING FACILITY ENDPOINTS
// ==========================================

// POST record new card transaction (purchase or bill payment)
router.post('/card/transaction', (req, res) => {
  const {
    cardId = 'card-atome-01',
    merchant,
    amount,
    type = 'purchase', // 'purchase', 'bill_payment', 'refund'
    category = 'General',
    ref
  } = req.body;

  if (!merchant || amount === undefined) {
    return res.status(400).json({ success: false, error: 'Merchant and transaction amount are required.' });
  }

  const db = dataStore.getDb();
  if (!db.creditCards) db.creditCards = [];

  let card = db.creditCards.find(c => c.id === cardId);
  if (!card) {
    // If card doesn't exist, initialize default Atome Card
    card = {
      id: cardId,
      cardName: 'Atome Card (Mastercard)',
      cardNumber: '•••• 5956',
      cardBrand: 'Mastercard',
      totalLimit: 10000.00,
      availableLimit: 5811.42,
      outstandingBalance: 4188.58,
      dueDate: '2026-08-18',
      statementDate: '2026-08-03',
      billingCycleDay: 18,
      minAmountDue: 209.43,
      annualFee: 0.00,
      interestRateApr: 0.00,
      status: 'active',
      transactions: []
    };
    db.creditCards.push(card);
  }

  const txAmount = parseFloat(amount);
  const txRecord = {
    id: `ctx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    merchant,
    amount: txAmount,
    type,
    category,
    date: new Date().toISOString(),
    ref: ref || `ATM-TX-${Math.floor(10000 + Math.random() * 90000)}`
  };

  if (!card.transactions) card.transactions = [];
  card.transactions.unshift(txRecord);
  if (card.transactions.length > 100) {
    card.transactions = card.transactions.slice(0, 100);
  }

  // Balance recalculation
  if (type === 'purchase' || type === 'fee') {
    card.availableLimit = parseFloat(Math.max(0, card.availableLimit - txAmount).toFixed(2));
    card.outstandingBalance = parseFloat((card.totalLimit - card.availableLimit).toFixed(2));
  } else if (type === 'bill_payment' || type === 'refund') {
    card.availableLimit = parseFloat(Math.min(card.totalLimit, card.availableLimit + txAmount).toFixed(2));
    card.outstandingBalance = parseFloat(Math.max(0, card.totalLimit - card.availableLimit).toFixed(2));
  }

  // Keep min amount due updated (~5% of outstanding balance)
  card.minAmountDue = parseFloat(Math.max(0, card.outstandingBalance * 0.05).toFixed(2));

  // Sync to general liabilities table if Atome card is present
  const atomeLiab = (db.liabilities || []).find(l => l.id === 'liab-atome-card');
  if (atomeLiab) {
    atomeLiab.outstandingBalance = card.outstandingBalance;
    atomeLiab.creditLimit = card.totalLimit;
    if (atomeLiab.outstandingBalance === 0) {
      atomeLiab.status = 'paid_off';
    } else {
      atomeLiab.status = 'active';
    }
  }

  dataStore.saveDb(db);
  dataStore.addSyncLog(
    'Atome Card Activity',
    'success',
    `Recorded ${type === 'bill_payment' ? 'Bill Repayment' : 'Purchase'} [₱${txAmount.toLocaleString()}] at ${merchant}. Available Limit: ₱${card.availableLimit.toLocaleString()}`
  );

  res.json({
    success: true,
    card,
    transaction: txRecord,
    message: `Transaction recorded successfully.`
  });
});

// POST update credit card limits and metadata
router.post('/card/update', (req, res) => {
  const {
    id = 'card-atome-01',
    cardName,
    cardNumber,
    totalLimit,
    availableLimit,
    outstandingBalance,
    dueDate,
    statementDate,
    billingCycleDay,
    status
  } = req.body;

  const db = dataStore.getDb();
  if (!db.creditCards) db.creditCards = [];

  let card = db.creditCards.find(c => c.id === id);
  if (!card) {
    return res.status(404).json({ success: false, error: 'Credit card not found.' });
  }

  if (cardName !== undefined) card.cardName = cardName;
  if (cardNumber !== undefined) card.cardNumber = cardNumber;
  if (dueDate !== undefined) card.dueDate = dueDate;
  if (statementDate !== undefined) card.statementDate = statementDate;
  if (billingCycleDay !== undefined) card.billingCycleDay = parseInt(billingCycleDay);
  if (status !== undefined) card.status = status;

  if (totalLimit !== undefined) {
    card.totalLimit = parseFloat(totalLimit) || 0;
  }

  if (availableLimit !== undefined) {
    card.availableLimit = parseFloat(availableLimit) || 0;
    card.outstandingBalance = parseFloat(Math.max(0, card.totalLimit - card.availableLimit).toFixed(2));
  } else if (outstandingBalance !== undefined) {
    card.outstandingBalance = parseFloat(outstandingBalance) || 0;
    card.availableLimit = parseFloat(Math.max(0, card.totalLimit - card.outstandingBalance).toFixed(2));
  }

  card.minAmountDue = parseFloat(Math.max(0, card.outstandingBalance * 0.05).toFixed(2));

  // Sync to general liabilities table if Atome card is present
  const atomeLiab = (db.liabilities || []).find(l => l.id === 'liab-atome-card');
  if (atomeLiab) {
    atomeLiab.outstandingBalance = card.outstandingBalance;
    atomeLiab.creditLimit = card.totalLimit;
    if (dueDate) atomeLiab.billingCycleDueDate = dueDate;
    if (atomeLiab.outstandingBalance === 0) {
      atomeLiab.status = 'paid_off';
    } else {
      atomeLiab.status = 'active';
    }
  }

  dataStore.saveDb(db);
  dataStore.addSyncLog(
    'Atome Card Settings',
    'success',
    `Updated ${card.cardName}: Total Limit ₱${card.totalLimit.toLocaleString()}, Available Limit ₱${card.availableLimit.toLocaleString()}, Outstanding: ₱${card.outstandingBalance.toLocaleString()}`
  );

  res.json({
    success: true,
    card,
    message: 'Credit card details updated successfully.'
  });
});

// POST pay credit card bill
router.post('/card/pay', (req, res) => {
  const {
    id = 'card-atome-01',
    paymentAmount,
    paymentSource = 'Maya Bank'
  } = req.body;

  if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
    return res.status(400).json({ success: false, error: 'Valid payment amount is required.' });
  }

  const db = dataStore.getDb();
  if (!db.creditCards) db.creditCards = [];

  const card = db.creditCards.find(c => c.id === id);
  if (!card) {
    return res.status(404).json({ success: false, error: 'Credit card not found.' });
  }

  const payAmt = parseFloat(paymentAmount);
  const prevBalance = card.outstandingBalance;

  // Restore available limit (cannot exceed total limit)
  card.availableLimit = parseFloat(Math.min(card.totalLimit, card.availableLimit + payAmt).toFixed(2));
  card.outstandingBalance = parseFloat(Math.max(0, card.totalLimit - card.availableLimit).toFixed(2));
  card.minAmountDue = parseFloat(Math.max(0, card.outstandingBalance * 0.05).toFixed(2));

  // Record payment in card transactions ledger
  const txRecord = {
    id: `ctx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    merchant: `Bill Payment (via ${paymentSource})`,
    amount: payAmt,
    type: 'bill_payment',
    category: 'Payment / Credit',
    date: new Date().toISOString(),
    ref: `PAY-ATM-${Math.floor(10000 + Math.random() * 90000)}`
  };

  if (!card.transactions) card.transactions = [];
  card.transactions.unshift(txRecord);

  // Sync to general liabilities table if Atome card is present
  const atomeLiab = (db.liabilities || []).find(l => l.id === 'liab-atome-card');
  if (atomeLiab) {
    atomeLiab.outstandingBalance = card.outstandingBalance;
    if (card.outstandingBalance === 0) {
      atomeLiab.status = 'paid_off';
    }
  }

  dataStore.saveDb(db);
  dataStore.addSyncLog(
    'Atome Bill Payment',
    'success',
    `Settled ₱${payAmt.toLocaleString()} on ${card.cardName}. New Outstanding: ₱${card.outstandingBalance.toLocaleString()}, Available: ₱${card.availableLimit.toLocaleString()}`
  );

  res.json({
    success: true,
    card,
    transaction: txRecord,
    message: `Payment of ₱${payAmt.toLocaleString()} processed successfully!`
  });
});

module.exports = router;
