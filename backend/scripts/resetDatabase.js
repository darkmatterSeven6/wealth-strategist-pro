const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../data/dv_danilo.db');
const jsonPath = path.join(__dirname, '../data/db_danilo.json');

const db = new sqlite3.Database(dbPath);

const BASELINE_BALANCES = [
  { id: '7280', name: 'Maya Bank ( Savings )', balance: 100035.08 },
  { id: '5798', name: 'Maya - Rainy Days Fund', balance: 5001.75 },
  { id: '0046', name: 'MariBank Savings', balance: 1115.92 },
  { id: '2626', name: 'Atome Savings', balance: 701.28 }
];

db.serialize(() => {
  BASELINE_BALANCES.forEach(acc => {
    db.run(
      `UPDATE digital_banks SET current_balance = ? WHERE last_four_digits LIKE ? OR account_name LIKE ?`,
      [acc.balance, `%${acc.id}%`, `%${acc.name}%`],
      (err) => {
        if (err) console.error(`Error updating SQLite ${acc.name}:`, err.message);
        else console.log(`Reset SQLite ${acc.name} to ₱${acc.balance}`);
      }
    );
  });
});

db.close();

// Also reset JSON
try {
  const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  json.accounts.forEach(dbAcc => {
    const target = BASELINE_BALANCES.find(b => b.name === dbAcc.name || (dbAcc.last_four_digits && dbAcc.last_four_digits.includes(b.id)));
    if (target) {
      dbAcc.balance = target.balance;
      if (target.name === 'Maya - Rainy Days Fund') {
        dbAcc.accruedUncreditedInterest = 0;
        dbAcc.virtualTotalBalance = target.balance;
      }
      console.log(`Reset JSON ${target.name} to ₱${target.balance}`);
    }
  });
  fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2));
} catch(err) {
  console.error("Error updating JSON:", err.message);
}
