const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

db.accounts.forEach(acc => {
  if (acc.id === 'acc-maya-01') {
    acc.name = '[⚡ Maya Savings]';
    acc.balance = 100035.08;
    acc.baseApy = 3.0;
    acc.currentApy = 10.0;
    acc.dailyInterestEstimate = 21.92;
    acc.tierInfo = 'Base 3.0% + 7.0% Mission Boost (Spend ₱30k+ via Maya Card & Bills paid)';
    delete acc.subAccounts;
  } else if (acc.id === 'acc-custom-1786121765629') {
    acc.name = '[🎯 Personal Goals]';
    acc.balance = 5001.75;
    acc.baseApy = 4.0;
    acc.currentApy = 4.0;
    acc.dailyInterestEstimate = 0.44;
    acc.tierInfo = '4% p.a. target account';
  }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log("🟢 [EMERGENCY FIX] db.json updated successfully!");
