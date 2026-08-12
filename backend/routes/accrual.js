const express = require('express');
const router = express.Router();
const accrualEngine = require('../services/accrualEngine');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dataStore = require('../services/dataStore');

// Dry-run test endpoint for Daily Accrual
router.post('/trigger-daily-test', async (req, res) => {
  try {
    const result = await accrualEngine.runDailyAccrual(true);
    res.json({
      success: true,
      message: 'Accrual engine dry-run test triggered successfully',
      data: result
    });
  } catch (err) {
    console.error('Error triggering daily accrual:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const BASELINE_BALANCES = [
  { searchKey: '7280', name: 'Maya Bank ( Savings )', balance: 100035.08 },
  { searchKey: '5798', name: 'Maya - Rainy Days Fund', balance: 5001.75 },
  { searchKey: '0046', name: 'MariBank Savings', balance: 1115.92 },
  { searchKey: '2626', name: 'Atome Savings', balance: 701.28 }
];

// Live Database Reset Endpoint (Server Remains Online)
router.post('/reset-baseline', (req, res) => {
  // 1. Reset JSON Store (in memory and file)
  const jsonDb = dataStore.getDb();
  if (jsonDb && jsonDb.accounts) {
    jsonDb.accounts.forEach(dbAcc => {
      const target = BASELINE_BALANCES.find(b => b.name === dbAcc.name || (dbAcc.last_four_digits && dbAcc.last_four_digits.includes(b.searchKey)));
      if (target) {
        dbAcc.balance = target.balance;
        if (target.name === 'Maya - Rainy Days Fund') {
          dbAcc.accruedUncreditedInterest = 0;
          dbAcc.virtualTotalBalance = target.balance;
        }
      }
    });
    dataStore.saveDb(jsonDb);
  }

  // 2. Reset SQLite Database
  const dbPath = path.join(__dirname, '../data/dv_danilo.db');
  const db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    BASELINE_BALANCES.forEach(acc => {
      db.run(
        `UPDATE digital_banks SET current_balance = ? WHERE last_four_digits LIKE ? OR account_name LIKE ?`,
        [acc.balance, `%${acc.searchKey}%`, `%${acc.name}%`],
        (err) => {
          if (err) console.error(`Reset error for SQLite ${acc.name}:`, err.message);
        }
      );
    });
  });

  db.close((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    return res.status(200).json({
      success: true,
      message: 'Database hard-reset to pre-test baselines completed live.',
      data: BASELINE_BALANCES
    });
  });
});

module.exports = router;
