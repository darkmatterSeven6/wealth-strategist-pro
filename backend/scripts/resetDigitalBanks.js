const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../data/dv_financials.db');
const schemaPath = path.resolve(__dirname, '../data/schema.sql');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log("🔥 [EMERGENCY FIX] Applying schema and resetting digital_banks...");

  // Apply schema
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schemaSql, (err) => {
    if (err) console.error("Schema error:", err.message);

    db.run("DELETE FROM digital_banks");

    const stmt = db.prepare(`
      INSERT INTO digital_banks (account_id, bank_name, balance, base_apy, current_apy, is_liquid, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run('acc-maya-01', 'Maya Savings', 100013.16, 3.5, 5.0, 1, 'connected');

    stmt.finalize();
    console.log("🟢 [EMERGENCY FIX] digital_banks ground-truth successfully inserted!");
  });
});

db.close();
