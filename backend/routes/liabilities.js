const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const bnplEngine = require('../services/bnplEngine');
const sqliteDb = require('../services/sqliteDb');

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

// POST add or create new liability
router.post('/', async (req, res) => {
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
  const limit = creditLimit ? parseFloat(creditLimit) : balance * 2;
  const nominalRate = nominalMonthlyRate ? parseFloat(nominalMonthlyRate) : 0;
  const adminFee = monthlyAdminFee ? parseFloat(monthlyAdminFee) : 0;
  const effectiveApr = bnplEngine.calculateEffectiveApr(nominalRate, adminFee, balance);
  const dueDate = billingCycleDueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
  const newId = `liab-${Date.now()}`;

  const newLiab = {
    id: newId,
    name,
    provider: provider || name,
    type: type || 'bnpl',
    outstandingBalance: balance,
    creditLimit: limit,
    billingCycleDueDate: dueDate,
    nominalMonthlyRate: nominalRate,
    effectiveApr,
    monthlyAdminFee: adminFee,
    monthlyPayment: monthlyPayment ? parseFloat(monthlyPayment) : (balance / (remainingTermsMonths || 3)),
    remainingTermsMonths: remainingTermsMonths ? parseInt(remainingTermsMonths) : 3,
    isZeroInterestPromo: Boolean(isZeroInterestPromo),
    daysUntilDue: 14,
    status: 'active'
  };

  // SQLite Persistence
  try {
    const rawDb = sqliteDb.getRawDb();
    if (rawDb) {
      rawDb.run(
        `INSERT OR REPLACE INTO liabilities (
          id, name, provider, type, outstanding_balance, credit_limit,
          nominal_monthly_rate, effective_apr, monthly_admin_fee, monthly_payment,
          remaining_terms_months, billing_cycle_due_date, is_zero_interest_promo, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newId, name, provider || name, type || 'bnpl', balance, limit,
          nominalRate, effectiveApr, adminFee, newLiab.monthlyPayment,
          newLiab.remainingTermsMonths, dueDate, newLiab.isZeroInterestPromo ? 1 : 0, 'active'
        ]
      );
    }
  } catch (sqlErr) {
    console.warn('[SQLITE LIABILITIES INSERT WARN]:', sqlErr.message);
  }

  db.liabilities.push(newLiab);
  dataStore.saveDb(db);
  dataStore.addSyncLog('Liabilities Tracker', 'success', `Added liability line: ${name} (₱${balance.toLocaleString()})`);

  res.json({ success: true, liability: newLiab });
});

// POST pay off / record payment for general liability
router.post('/pay', async (req, res) => {
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

  // SQLite Persistence
  try {
    const rawDb = sqliteDb.getRawDb();
    if (rawDb) {
      rawDb.run(
        `UPDATE liabilities SET outstanding_balance = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [liab.outstandingBalance, liab.status, liab.id]
      );
    }
  } catch (sqlErr) {
    console.warn('[SQLITE LIABILITIES PAY WARN]:', sqlErr.message);
  }

  dataStore.saveDb(db);
  dataStore.addSyncLog('Debt Payoff Action', 'success', `Paid ₱${payAmt.toLocaleString()} towards ${liab.name}. Remaining: ₱${liab.outstandingBalance.toLocaleString()}`);

  res.json({
    success: true,
    message: `Payment of ₱${payAmt.toLocaleString()} recorded.`,
    liability: liab
  });
});

/**
 * POST /api/liabilities/update
 * Universal update route supporting Atome Credit Card settings, card limits, and general liabilities
 */
router.post('/update', (req, res) => {
  const {
    id,
    card_name,
    cardName,
    name,
    card_number,
    cardNumber,
    total_limit,
    totalLimit,
    available_limit,
    availableLimit,
    outstanding_balance,
    outstandingBalance,
    due_date,
    dueDate,
    statement_date,
    statementDate,
    billing_cycle_day,
    billingCycleDay,
    billing_cycle_due_date,
    billingCycleDueDate,
    nominal_monthly_rate,
    nominalMonthlyRate,
    monthly_admin_fee,
    monthlyAdminFee,
    monthly_payment,
    monthlyPayment,
    remaining_terms_months,
    remainingTermsMonths,
    is_zero_interest_promo,
    isZeroInterestPromo,
    provider,
    type,
    status
  } = req.body;

  const targetCardName = card_name || cardName || (type === 'credit_card' ? name : null);
  const targetCardNumber = card_number || cardNumber;
  const rawTotalLimit = total_limit !== undefined ? total_limit : (totalLimit !== undefined ? totalLimit : req.body.creditLimit);
  const rawAvailLimit = available_limit !== undefined ? available_limit : availableLimit;
  const rawDueDate = due_date || dueDate || billing_cycle_due_date || billingCycleDueDate;
  const rawStatementDate = statement_date || statementDate;

  const isCardTarget = Boolean(
    targetCardName ||
    targetCardNumber ||
    rawTotalLimit !== undefined ||
    rawAvailLimit !== undefined ||
    id === 1 ||
    id === '1' ||
    id === 'card-atome-01' ||
    type === 'credit_card' ||
    (name && name.toLowerCase().includes('atome')) ||
    (id && id.toString().includes('atome'))
  );

  console.log(`[LIABILITIES ENGINE] Received update request for ${isCardTarget ? 'Card ID ' + (id || 1) : 'Liability ID ' + id}`);

  const db = dataStore.getDb();
  if (!db.creditCards) db.creditCards = [];
  if (!db.liabilities) db.liabilities = [];

  if (isCardTarget) {
    const totalLimitNum = rawTotalLimit !== undefined ? (parseFloat(rawTotalLimit) || 0) : 10000.00;
    const availLimitNum = rawAvailLimit !== undefined 
      ? (parseFloat(rawAvailLimit) || 0) 
      : (outstandingBalance !== undefined ? Math.max(0, totalLimitNum - parseFloat(outstandingBalance)) : 5811.42);
    const resolvedDueDate = rawDueDate || '2026-08-18';
    const resolvedStatementDate = rawStatementDate || '2026-08-03';
    const cardIdParam = id || 'card-atome-01';

    // 1. UPDATE SQLite credit_cards table
    const sql = `
      UPDATE credit_cards 
      SET 
        card_name = COALESCE(?, card_name),
        card_number = COALESCE(?, card_number),
        total_limit = ?,
        available_limit = ?,
        due_date = ?,
        statement_date = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? OR card_id = ? OR card_name LIKE '%Atome%'
    `;

    const rawDb = sqliteDb.getRawDb();
    if (rawDb) {
      rawDb.run(
        sql,
        [
          targetCardName || null,
          targetCardNumber || null,
          totalLimitNum,
          availLimitNum,
          resolvedDueDate,
          resolvedStatementDate,
          typeof id === 'number' ? id : 1,
          typeof cardIdParam === 'string' ? cardIdParam : 'card-atome-01'
        ],
        function (err) {
          if (err) {
            console.error('❌ [LIABILITIES UPDATE ERROR]:', err.message);
          } else {
            console.log(`🟢 [LIABILITIES ENGINE] Atome Card updated in SQLite: Available ₱${availLimitNum} / Total ₱${totalLimitNum}`);
          }
        }
      );

      // Also update SQLite liabilities table for Atome Card
      const outstandingBal = Math.max(0, parseFloat((totalLimitNum - availLimitNum).toFixed(2)));
      rawDb.run(
        `UPDATE liabilities 
         SET outstanding_balance = ?, credit_limit = ?, billing_cycle_due_date = ?, status = CASE WHEN ? = 0 THEN 'paid_off' ELSE 'active' END, updated_at = CURRENT_TIMESTAMP 
         WHERE id = 'liab-atome-card' OR name LIKE '%Atome%'`,
        [outstandingBal, totalLimitNum, resolvedDueDate, outstandingBal]
      );
    }

    // 2. UPDATE dataStore in-memory JSON state
    let cardIdx = db.creditCards.findIndex(c => c.id === cardIdParam || (c.cardName && c.cardName.includes('Atome')));
    if (cardIdx === -1) {
      if (db.creditCards.length > 0) cardIdx = 0;
    }

    let updatedCard = null;
    if (cardIdx !== -1) {
      const card = db.creditCards[cardIdx];
      if (targetCardName) card.cardName = targetCardName;
      if (targetCardNumber) card.cardNumber = targetCardNumber;
      card.totalLimit = totalLimitNum;
      card.availableLimit = availLimitNum;
      card.outstandingBalance = parseFloat(Math.max(0, totalLimitNum - availLimitNum).toFixed(2));
      card.minAmountDue = parseFloat(Math.max(0, card.outstandingBalance * 0.05).toFixed(2));
      card.dueDate = resolvedDueDate;
      card.statementDate = resolvedStatementDate;
      if (billing_cycle_day || billingCycleDay) card.billingCycleDay = parseInt(billing_cycle_day || billingCycleDay);
      if (status) card.status = status;
      updatedCard = card;
    } else {
      updatedCard = {
        id: 'card-atome-01',
        cardName: targetCardName || 'Atome Card (Mastercard)',
        cardNumber: targetCardNumber || '•••• 5956',
        cardBrand: 'Mastercard',
        totalLimit: totalLimitNum,
        availableLimit: availLimitNum,
        outstandingBalance: parseFloat(Math.max(0, totalLimitNum - availLimitNum).toFixed(2)),
        minAmountDue: parseFloat(Math.max(0, (totalLimitNum - availLimitNum) * 0.05).toFixed(2)),
        dueDate: resolvedDueDate,
        statementDate: resolvedStatementDate,
        billingCycleDay: 18,
        annualFee: 0.00,
        interestRateApr: 0.00,
        status: 'active',
        transactions: []
      };
      db.creditCards.push(updatedCard);
    }

    // Sync to general liabilities table if Atome card is present
    const atomeLiab = db.liabilities.find(l => l.id === 'liab-atome-card' || (l.name && l.name.includes('Atome')));
    if (atomeLiab) {
      atomeLiab.outstandingBalance = updatedCard.outstandingBalance;
      atomeLiab.creditLimit = updatedCard.totalLimit;
      atomeLiab.billingCycleDueDate = resolvedDueDate;
      atomeLiab.status = updatedCard.outstandingBalance === 0 ? 'paid_off' : 'active';
    }

    dataStore.saveDb(db);
    dataStore.addSyncLog(
      'Atome Card Settings',
      'success',
      `Atome Card settings saved: Available ₱${availLimitNum.toLocaleString()} / Total ₱${totalLimitNum.toLocaleString()}`
    );

    return res.json({
      success: true,
      message: 'Atome Card settings saved.',
      card: updatedCard,
      liability: atomeLiab
    });
  }

  // GENERAL LIABILITY UPDATE HANDLER
  const idx = db.liabilities.findIndex(l => l.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Liability record not found.' });
  }

  const existing = db.liabilities[idx];
  const balance = (outstanding_balance !== undefined ? parseFloat(outstanding_balance) : (outstandingBalance !== undefined ? parseFloat(outstandingBalance) : existing.outstandingBalance)) || 0;
  const limit = (total_limit !== undefined ? parseFloat(total_limit) : (req.body.creditLimit !== undefined ? parseFloat(req.body.creditLimit) : (existing.creditLimit || balance * 2))) || 0;
  const nominalRate = (nominal_monthly_rate !== undefined ? parseFloat(nominal_monthly_rate) : (nominalMonthlyRate !== undefined ? parseFloat(nominalMonthlyRate) : (existing.nominalMonthlyRate || 0))) || 0;
  const adminFee = (monthly_admin_fee !== undefined ? parseFloat(monthly_admin_fee) : (monthlyAdminFee !== undefined ? parseFloat(monthlyAdminFee) : (existing.monthlyAdminFee || 0))) || 0;
  const effectiveApr = bnplEngine.calculateEffectiveApr(nominalRate, adminFee, balance);
  const resolvedDueDate = rawDueDate || existing.billingCycleDueDate;

  const updatedLiab = {
    ...existing,
    name: name || existing.name,
    provider: provider || existing.provider,
    type: type || existing.type,
    outstandingBalance: balance,
    creditLimit: limit,
    billingCycleDueDate: resolvedDueDate,
    nominalMonthlyRate: nominalRate,
    effectiveApr,
    monthlyAdminFee: adminFee,
    monthlyPayment: monthly_payment !== undefined ? parseFloat(monthly_payment) : (monthlyPayment !== undefined ? parseFloat(monthlyPayment) : existing.monthlyPayment),
    remainingTermsMonths: remaining_terms_months !== undefined ? parseInt(remaining_terms_months) : (remainingTermsMonths !== undefined ? parseInt(remainingTermsMonths) : existing.remainingTermsMonths),
    isZeroInterestPromo: is_zero_interest_promo !== undefined ? Boolean(is_zero_interest_promo) : (isZeroInterestPromo !== undefined ? Boolean(isZeroInterestPromo) : existing.isZeroInterestPromo),
    status: status || (balance === 0 ? 'paid_off' : existing.status || 'active')
  };

  // SQLite Persistence for general liability
  try {
    const rawDb = sqliteDb.getRawDb();
    if (rawDb) {
      rawDb.run(
        `UPDATE liabilities 
         SET name = ?, provider = ?, type = ?, outstanding_balance = ?, credit_limit = ?,
             nominal_monthly_rate = ?, effective_apr = ?, monthly_admin_fee = ?, monthly_payment = ?,
             remaining_terms_months = ?, billing_cycle_due_date = ?, is_zero_interest_promo = ?, status = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          updatedLiab.name, updatedLiab.provider, updatedLiab.type, updatedLiab.outstandingBalance, updatedLiab.creditLimit,
          updatedLiab.nominalMonthlyRate, updatedLiab.effectiveApr, updatedLiab.monthlyAdminFee, updatedLiab.monthlyPayment,
          updatedLiab.remainingTermsMonths, updatedLiab.billingCycleDueDate, updatedLiab.isZeroInterestPromo ? 1 : 0, updatedLiab.status,
          updatedLiab.id
        ]
      );
    }
  } catch (sqlErr) {
    console.warn('[SQLITE LIABILITIES UPDATE WARN]:', sqlErr.message);
  }

  db.liabilities[idx] = updatedLiab;
  dataStore.saveDb(db);
  dataStore.addSyncLog('Liabilities Tracker', 'success', `Updated liability: ${updatedLiab.name} (Balance: ₱${balance.toLocaleString()}, Limit: ₱${limit.toLocaleString()})`);

  res.json({
    success: true,
    message: 'Liability updated successfully.',
    liability: updatedLiab
  });
});

// POST update credit card limits and metadata (Dedicated Card Route)
router.post('/card/update', (req, res) => {
  // Re-use universal update router
  return router.handle({ ...req, url: '/update' }, res);
});

// POST record card purchase or credit transaction
router.post('/card/transaction', (req, res) => {
  const {
    cardId = 'card-atome-01',
    merchant,
    amount,
    type = 'purchase',
    category = 'Shopping'
  } = req.body;

  if (!merchant || !amount || parseFloat(amount) <= 0) {
    return res.status(400).json({ success: false, error: 'Merchant and positive amount are required.' });
  }

  const db = dataStore.getDb();
  if (!db.creditCards) db.creditCards = [];

  let card = db.creditCards.find(c => c.id === cardId || (c.cardName && c.cardName.includes('Atome')));
  if (!card && db.creditCards.length > 0) card = db.creditCards[0];
  if (!card) {
    return res.status(404).json({ success: false, error: 'Credit card not found.' });
  }

  const txAmount = parseFloat(amount);
  const txRecord = {
    id: `ctx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    merchant,
    amount: txAmount,
    type,
    category,
    date: new Date().toISOString(),
    ref: `REF-${Math.floor(100000 + Math.random() * 900000)}`
  };

  if (type === 'purchase') {
    if (txAmount > card.availableLimit) {
      return res.status(400).json({
        success: false,
        error: `Transaction declined. Amount ₱${txAmount.toLocaleString()} exceeds available limit of ₱${card.availableLimit.toLocaleString()}.`
      });
    }
    card.availableLimit = parseFloat((card.availableLimit - txAmount).toFixed(2));
    card.outstandingBalance = parseFloat((card.outstandingBalance + txAmount).toFixed(2));
  } else {
    card.availableLimit = parseFloat(Math.min(card.totalLimit, card.availableLimit + txAmount).toFixed(2));
    card.outstandingBalance = parseFloat(Math.max(0, card.outstandingBalance - txAmount).toFixed(2));
  }

  card.minAmountDue = parseFloat(Math.max(0, card.outstandingBalance * 0.05).toFixed(2));
  if (!card.transactions) card.transactions = [];
  card.transactions.unshift(txRecord);

  // Sync to SQLite
  try {
    const rawDb = sqliteDb.getRawDb();
    if (rawDb) {
      rawDb.run(
        `UPDATE credit_cards SET available_limit = ?, updated_at = CURRENT_TIMESTAMP WHERE card_id = ? OR id = 1`,
        [card.availableLimit, card.id]
      );
      rawDb.run(
        `INSERT INTO card_transactions (transaction_id, card_id, merchant_name, amount, transaction_type, reference_number, category)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [txRecord.id, card.id, txRecord.merchant, txRecord.amount, txRecord.type, txRecord.ref, txRecord.category]
      );
      rawDb.run(
        `UPDATE liabilities SET outstanding_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 'liab-atome-card'`,
        [card.outstandingBalance]
      );
    }
  } catch (sqlErr) {
    console.warn('[SQLITE TRANSACTION SYNC WARN]:', sqlErr.message);
  }

  // Sync to liabilities in memory
  const atomeLiab = (db.liabilities || []).find(l => l.id === 'liab-atome-card');
  if (atomeLiab) {
    atomeLiab.outstandingBalance = card.outstandingBalance;
    atomeLiab.status = card.outstandingBalance === 0 ? 'paid_off' : 'active';
  }

  dataStore.saveDb(db);
  dataStore.addSyncLog(
    'Atome Card Transaction',
    'success',
    `${type === 'purchase' ? 'Charged' : 'Credited'} ₱${txAmount.toLocaleString()} at ${merchant}. Available Limit: ₱${card.availableLimit.toLocaleString()}`
  );

  res.json({
    success: true,
    card,
    transaction: txRecord,
    message: 'Transaction recorded successfully.'
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

  let card = db.creditCards.find(c => c.id === id || (c.cardName && c.cardName.includes('Atome')));
  if (!card && db.creditCards.length > 0) card = db.creditCards[0];
  if (!card) {
    return res.status(404).json({ success: false, error: 'Credit card not found.' });
  }

  const payAmt = parseFloat(paymentAmount);

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

  // Sync to SQLite
  try {
    const rawDb = sqliteDb.getRawDb();
    if (rawDb) {
      rawDb.run(
        `UPDATE credit_cards SET available_limit = ?, updated_at = CURRENT_TIMESTAMP WHERE card_id = ? OR id = 1`,
        [card.availableLimit, card.id]
      );
      rawDb.run(
        `INSERT INTO card_transactions (transaction_id, card_id, merchant_name, amount, transaction_type, reference_number, category)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [txRecord.id, card.id, txRecord.merchant, txRecord.amount, txRecord.type, txRecord.ref, txRecord.category]
      );
      rawDb.run(
        `UPDATE liabilities SET outstanding_balance = ?, status = CASE WHEN ? = 0 THEN 'paid_off' ELSE 'active' END, updated_at = CURRENT_TIMESTAMP WHERE id = 'liab-atome-card'`,
        [card.outstandingBalance, card.outstandingBalance]
      );
    }
  } catch (sqlErr) {
    console.warn('[SQLITE BILL PAY SYNC WARN]:', sqlErr.message);
  }

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

// DELETE liability
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const db = dataStore.getDb();
  const idx = db.liabilities.findIndex(l => l.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Liability not found.' });
  }

  const removed = db.liabilities.splice(idx, 1)[0];

  // SQLite Persistence
  try {
    const rawDb = sqliteDb.getRawDb();
    if (rawDb) {
      rawDb.run(`DELETE FROM liabilities WHERE id = ?`, [id]);
    }
  } catch (sqlErr) {
    console.warn('[SQLITE DELETE WARN]:', sqlErr.message);
  }

  dataStore.saveDb(db);
  dataStore.addSyncLog('Liabilities Tracker', 'success', `Deleted liability: ${removed.name}`);

  res.json({ success: true, message: `Removed ${removed.name}` });
});

module.exports = router;
