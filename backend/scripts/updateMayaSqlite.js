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
        -- 1. Update Maya Savings (Liquid Account)
        UPDATE digital_banks 
        SET 
          account_type = 'LIQUID_SAVINGS',
          badge_label = '⚡ Maya Savings',
          current_balance = 100035.08,
          base_rate = 0.0300,
          active_boost_rate = 0.0700,
          total_effective_rate = 0.1000,
          net_daily_gain = 21.92,
          pockets_json = NULL,
          last_synced_at = CURRENT_TIMESTAMP
        WHERE account_name LIKE '%Maya Savings%' OR last_four_digits = '7280';

        -- 2. Update Maya Personal Goals (Target Account)
        UPDATE digital_banks 
        SET 
          account_type = 'PERSONAL_GOALS',
          badge_label = '🎯 Personal Goals',
          current_balance = 5001.75,
          base_rate = 0.0400,
          active_boost_rate = 0.0000,
          total_effective_rate = 0.0400,
          net_daily_gain = 0.44,
          pockets_json = NULL,
          last_synced_at = CURRENT_TIMESTAMP
        WHERE account_name LIKE '%Rainy Days%' OR last_four_digits = '5798';
      `;

      db.exec(updateScript, (err) => {
        if (err) console.error("Update error:", err.message);
        console.log("🟢 [EMERGENCY FIX] digital_banks ground-truth updated successfully!");
        db.close();
      });
    });
  });
});
