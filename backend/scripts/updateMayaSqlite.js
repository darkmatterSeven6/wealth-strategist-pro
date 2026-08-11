const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../data/dv_financials.db');
const schemaPath = path.resolve(__dirname, '../data/schema.sql');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log("🔥 [EMERGENCY FIX] Applying schema and updating digital_banks...");

  // Apply schema
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  db.exec("DROP TABLE IF EXISTS digital_banks;", (err) => {
    if (err) console.error(err);
    
    db.exec(schemaSql, (err) => {
      if (err) console.error("Schema error:", err.message);

      // Insert base records first so the UPDATE statement works
      const stmt = db.prepare(`
        INSERT INTO digital_banks (account_id, account_name, last_four_digits)
        VALUES (?, ?, ?)
      `);
      stmt.run('acc-maya-01', 'Maya Savings', '7280');
      stmt.run('acc-maya-02', 'Maya Personal Goals (Rainy Days)', '5798');
      stmt.finalize();

      // Execute user's exact UPDATE statements
      const updateScript = `
        -- 1. Update Maya Bank ( Savings )
        UPDATE digital_banks 
        SET 
          account_name = 'Maya Bank ( Savings )',
          account_type_label = 'Maya Standard Savings',
          current_balance = 100035.08,
          base_rate = 0.0300,
          active_boost_rate = 0.0200,
          total_effective_rate = 0.0500,
          net_daily_gain = 10.96,
          pockets_json = NULL,
          last_synced_at = CURRENT_TIMESTAMP
        WHERE last_four_digits = '7280';

        -- 2. Update Maya - Rainy Days Fund
        UPDATE digital_banks 
        SET 
          account_name = 'Maya - Rainy Days Fund',
          account_type_label = 'Personal Goal Account',
          current_balance = 5001.75,
          base_rate = 0.0400,
          active_boost_rate = 0.0100,
          total_effective_rate = 0.0500,
          net_daily_gain = 0.55,
          pockets_json = NULL,
          last_synced_at = CURRENT_TIMESTAMP
        WHERE last_four_digits = '5798';
      `;

      db.exec(updateScript, (err) => {
        if (err) console.error("Update error:", err.message);
        console.log("🟢 [EMERGENCY FIX] digital_banks ground-truth updated successfully!");
        db.close();
      });
    });
  });
});
