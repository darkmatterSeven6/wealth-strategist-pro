const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

console.log('====================================================');
console.log('      WEALTH STRATEGIST PRO - SYSTEM AUDIT REPORT   ');
console.log('====================================================\n');

// 1. AUDIT FILE-LEVEL DATASTORE VALUES
const jsonPath = path.join(__dirname, '../data/db_danilo.json');
const dbPath = path.join(__dirname, '../data/dv_danilo.db');

console.log('--- 1. DATASTORE FILE VALUES ---');

if (fs.existsSync(jsonPath)) {
  try {
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log('[db_danilo.json]');
    const rainyGoal = jsonData.accounts?.find(a => a.name?.includes('Rainy Days') || a.account_number?.includes('5798'));
    console.log('  • Maya Rainy Days Balance:', rainyGoal ? rainyGoal.virtualTotalBalance || rainyGoal.balance : 'NOT FOUND');
  } catch (e) {
    console.log('  • db_danilo.json error:', e.message);
  }
} else {
  console.log('  • db_danilo.json DOES NOT EXIST');
}

if (fs.existsSync(dbPath)) {
  const db = new sqlite3.Database(dbPath);
  db.get("SELECT balance, accruedUncreditedInterest, virtualTotalBalance FROM accounts WHERE account_number LIKE '%5798%' OR name LIKE '%Rainy Days%'", (err, row) => {
    console.log('[dv_danilo.db]');
    if (err) console.log('  • SQLite Error:', err.message);
    else console.log('  • Maya Rainy Days SQLite Row:', row);
    db.close();
  });
} else {
  console.log('  • dv_danilo.db DOES NOT EXIST');
}

// 2. AUDIT SERVER ENTRY & ROUTER CODE
console.log('\n--- 2. BACKEND DATA ROUTING AUDIT ---');
const serverPath = path.join(__dirname, '../server.js');
if (fs.existsSync(serverPath)) {
  const serverCode = fs.readFileSync(serverPath, 'utf8');
  console.log('  • Express reads from SQLite?', serverCode.includes('sqlite3') || serverCode.includes('dv_danilo.db'));
  console.log('  • Express reads from JSON?', serverCode.includes('db_danilo.json') || serverCode.includes('fs.readFileSync'));
}

console.log('\n====================================================');
