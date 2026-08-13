const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../data/dv_danilo.db');
const jsonPath = path.join(__dirname, '../data/db_danilo.json');

const db = new sqlite3.Database(dbPath);

console.log('Synchronizing GInvest holdings to exact GCash Ground Truth (₱2,736.22)...');

db.serialize(() => {
  // 1. Update ATRAM Global Technology Feeder Fund
  db.run(
    `UPDATE feeder_funds 
     SET total_units = 2.0419,
         invested_capital = 1000.00,
         total_investment_value = 1031.25,
         unrealized_gain = 31.25
     WHERE fund_name LIKE '%Global Technology%'`,
    (err) => { if (err) console.error('Error updating ATRAM Tech:', err.message); }
  );

  // 2. Update ATRAM Global Equity Opportunity Feeder Fund
  db.run(
    `UPDATE feeder_funds 
     SET total_units = 6.9550,
         invested_capital = 1000.00,
         total_investment_value = 999.99,
         unrealized_gain = -0.01
     WHERE fund_name LIKE '%Global Equity Opportunity%'`,
    (err) => { if (err) console.error('Error updating ATRAM Equity:', err.message); }
  );

  // 3. Update ALFM Global Multi-Asset Income Fund Inc - PHP
  db.run(
    `UPDATE feeder_funds 
     SET total_units = 14.7087,
         invested_capital = 700.00,
         total_investment_value = 704.96,
         unrealized_gain = 4.96
     WHERE fund_name LIKE '%ALFM Global Multi-Asset%'`,
    function(err) {
      if (err) console.error('Error updating ALFM:', err.message);
      else console.log('[SUCCESS] GInvest positions successfully recalibrated in SQLite.');
    }
  );
});

db.close();
