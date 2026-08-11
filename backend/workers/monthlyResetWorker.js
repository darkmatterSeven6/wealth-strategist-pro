const cron = require('node-cron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dataStore = require('../services/dataStore');

const dbPath = path.resolve(__dirname, '../data/dv_financials.db');

const initScheduler = () => {
  // 1st of every month at midnight
  cron.schedule('0 0 1 * *', () => {
    console.log('🔄 [CRON WORKER] Running monthly Maya Savings tier reset...');

    try {
      // 1. Update SQLite
      const sqliteDb = new sqlite3.Database(dbPath);
      const updateSql = `
        UPDATE digital_banks 
        SET 
          active_boost_rate = 0.0000,
          total_effective_rate = base_rate,
          last_synced_at = CURRENT_TIMESTAMP
        WHERE account_id = 'acc-maya-01' OR account_name LIKE '%Maya Savings%';
      `;
      sqliteDb.run(updateSql, (err) => {
        if (err) console.error('❌ [CRON SQLITE ERROR]', err);
        else console.log('🟢 [CRON] SQLite digital_banks reset to base tier.');
        sqliteDb.close();
      });

      // 2. Update JSON Datastore
      const db = dataStore.getDb();
      let updated = false;
      if (db.accounts) {
        db.accounts.forEach(acc => {
          if (acc.id === 'acc-maya-01') {
            acc.currentApy = acc.baseApy || 3.0;
            acc.tierInfo = 'Base 3.0%';
            // Recalculate daily net interest (less 20% withholding tax)
            acc.dailyInterestEstimate = (acc.balance * (acc.currentApy / 100) * 0.80) / 365;
            acc.lastSynced = new Date().toISOString();
            updated = true;
          }
        });
      }

      if (updated) {
        dataStore.saveDb(db);
        dataStore.addSyncLog('Monthly Reset Worker', 'info', `Reset Maya Savings boost tier to Base 3.0%.`);
        console.log('🟢 [CRON] JSON dataStore Maya Savings reset to base tier.');
      }
    } catch (err) {
      console.error('❌ [CRON FATAL ERROR]', err.message);
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Manila'
  });
  
  console.log('🕒 [WORKER] Monthly Reset CRON initialized (Schedule: 0 0 1 * *)');
};

module.exports = { initScheduler };
