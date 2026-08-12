const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../data/dv_danilo.db');
const jsonPath = path.join(__dirname, '../data/db_danilo.json');
const db = new sqlite3.Database(dbPath);

console.log('Overwriting Maya Rainy Days Fund to exact August 12 Ground Truth...');

db.serialize(() => {
  db.run(
    `UPDATE digital_banks 
     SET current_balance = 5000.00,
         net_daily_gain = 0.44
     WHERE last_four_digits LIKE '%5798%' OR account_name LIKE '%Rainy Days%'`,
    function(err) {
      if (err) console.error('Error overwriting SQLite account state:', err.message);
      else console.log(`[SUCCESS] SQLite Maya Rainy Days Fund hard-set to ₱5,000.00 (Rows modified: ${this.changes})`);
    }
  );
});

db.close();

try {
  const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  json.accounts.forEach(dbAcc => {
    if (dbAcc.name === 'Maya - Rainy Days Fund' || (dbAcc.last_four_digits && dbAcc.last_four_digits.includes('5798'))) {
      dbAcc.balance = 5000.00;
      dbAcc.accruedUncreditedInterest = 2.63;
      dbAcc.virtualTotalBalance = 5002.63;
      dbAcc.lastDailyGain = 0.44;
      console.log(`[SUCCESS] JSON Maya Rainy Days Fund hard-set to ₱5,002.63 (Virtual Total)`);
    }
  });
  fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2));
} catch(err) {
  console.error("Error updating JSON:", err.message);
}
