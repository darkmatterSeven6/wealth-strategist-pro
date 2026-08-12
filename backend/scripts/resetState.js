const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Locate local database
const dbPath = path.join(__dirname, '../data/dv_danilo.db');
const jsonPath = path.join(__dirname, '../data/db_danilo.json');
const db = new sqlite3.Database(dbPath);

const BASELINE_DATA = [
  { search: '7280', balance: 100035.08, name: 'Maya Bank ( Savings )' },
  { search: '5798', balance: 5001.75, name: 'Maya - Rainy Days Fund' },
  { search: '0046', balance: 1115.92, name: 'MariBank Savings' },
  { search: '2626', balance: 701.28, name: 'Atome Savings' }
];

console.log('Beginning database baseline reset...');

db.serialize(() => {
  BASELINE_DATA.forEach(acc => {
    // Note: accruedUncreditedInterest is virtual and stored in JSON, not SQLite.
    // We reset current_balance and net_daily_gain here in SQLite.
    db.run(
      `UPDATE digital_banks 
       SET current_balance = ?, 
           net_daily_gain = 0 
       WHERE last_four_digits LIKE ? OR account_name LIKE ?`,
      [acc.balance, `%${acc.search}%`, `%${acc.name}%`],
      function(err) {
        if (err) {
          console.error(`Error resetting ${acc.name}:`, err.message);
        } else {
          console.log(`[SUCCESS] Reset ${acc.name} -> ₱${acc.balance} (Rows modified: ${this.changes})`);
        }
      }
    );
  });
});

db.close((err) => {
  if (err) console.error('Database closing error:', err.message);
  else console.log('Database connection closed cleanly.');
});

// Also reset JSON state to clear accruedUncreditedInterest and lastDailyGain
try {
  const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  json.accounts.forEach(dbAcc => {
    const target = BASELINE_DATA.find(b => b.name === dbAcc.name || (dbAcc.last_four_digits && dbAcc.last_four_digits.includes(b.search)));
    if (target) {
      dbAcc.balance = target.balance;
      dbAcc.lastDailyGain = 0;
      if (target.name === 'Maya - Rainy Days Fund') {
        dbAcc.accruedUncreditedInterest = 0;
        dbAcc.virtualTotalBalance = target.balance;
      }
      console.log(`[SUCCESS] Reset JSON for ${target.name} -> ₱${target.balance}`);
    }
  });
  fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2));
} catch(err) {
  console.error("Error updating JSON:", err.message);
}
