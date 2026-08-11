const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

db.accounts.forEach(acc => {
  if (acc.id === 'acc-maya-01') {
    acc.name = 'Maya Bank ( Savings )';
    acc.accountTypeLabel = 'Maya Standard Savings';
    acc.balance = 100035.08;
    acc.baseApy = 3.0;
    acc.currentApy = 5.0;
    acc.dailyInterestEstimate = 10.96;
    acc.tierInfo = 'Base 3.0% + 2.0% Mission Boost (₱1k)';
    delete acc.subAccounts;
  } else if (acc.id === 'acc-custom-1786121765629') {
    acc.name = 'Maya - Rainy Days Fund';
    acc.accountTypeLabel = 'Personal Goal Account';
    acc.balance = 5001.75;
    acc.baseApy = 4.0;
    acc.currentApy = 5.0;
    acc.dailyInterestEstimate = 0.55;
    acc.tierInfo = 'Base 4.0% + 1.0% Milestone Boost (₱5k)';
    delete acc.subAccounts;
  }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log("🟢 [EMERGENCY FIX] db.json updated successfully!");
