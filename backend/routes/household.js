const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// 1. Sync Route
router.post('/sync', async (req, res) => {
  try {
    const defaultSyncDir = path.resolve(process.env.USERPROFILE || 'C:\\Users\\danie', 'Google Drive\\DV_Financials_Household_Sync');
    const syncDir = process.env.HOUSEHOLD_SYNC_PATH ? path.resolve(process.env.HOUSEHOLD_SYNC_PATH) : defaultSyncDir;
    if (!fs.existsSync(syncDir)) {
      fs.mkdirSync(syncDir, { recursive: true });
    }

    const tenant = process.env.USER_TENANT || 'danilo';
    const peerTenant = tenant === 'danilo' ? 'wife' : 'danilo';
    const localDbName = tenant === 'wife' ? 'dv_wife.db' : 'dv_danilo.db';
    const peerDbName = tenant === 'wife' ? 'dv_danilo.db' : 'dv_wife.db';
    const localJsonName = tenant === 'wife' ? 'db_wife.json' : 'db_danilo.json';
    const peerJsonName = tenant === 'wife' ? 'db_danilo.json' : 'db_wife.json';

    const localDataDir = path.resolve(__dirname, '../data');

    // 1. Export local DB & JSON to Sync Dir
    if (fs.existsSync(path.join(localDataDir, localDbName))) {
      fs.copyFileSync(path.join(localDataDir, localDbName), path.join(syncDir, localDbName));
    }
    if (fs.existsSync(path.join(localDataDir, localJsonName))) {
      fs.copyFileSync(path.join(localDataDir, localJsonName), path.join(syncDir, localJsonName));
    }

    // 2. Import peer DB & JSON from Sync Dir
    let pulled = false;
    if (fs.existsSync(path.join(syncDir, peerDbName))) {
      fs.copyFileSync(path.join(syncDir, peerDbName), path.join(localDataDir, peerDbName));
      pulled = true;
    }
    if (fs.existsSync(path.join(syncDir, peerJsonName))) {
      fs.copyFileSync(path.join(syncDir, peerJsonName), path.join(localDataDir, peerJsonName));
      pulled = true;
    }

    res.json({ success: true, message: `Synced successfully. Exported ${tenant}, Pulled ${peerTenant}: ${pulled}` });
  } catch (error) {
    console.error('Sync Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Overview Route
router.get('/overview', async (req, res) => {
  try {
    const localDataDir = path.resolve(__dirname, '../data');
    
    const readDb = (dbName) => {
      return new Promise((resolve) => {
        const dbPath = path.join(localDataDir, dbName);
        if (!fs.existsSync(dbPath)) return resolve({ netWorth: 0, liquidCash: 0, dailyInterest: 0 });
        
        const db = new sqlite3.Database(dbPath);
        db.all('SELECT current_balance, is_liquid, net_daily_gain FROM digital_banks', (err, rows) => {
          if (err || !rows) {
            db.close();
            return resolve({ netWorth: 0, liquidCash: 0, dailyInterest: 0 });
          }
          let liquidCash = 0;
          let dailyInterest = 0;
          let netWorth = 0;
          
          rows.forEach(r => {
            netWorth += (r.current_balance || 0);
            if (r.is_liquid) {
              liquidCash += (r.current_balance || 0);
            }
            dailyInterest += (r.net_daily_gain || 0);
          });
          
          db.close();
          resolve({ netWorth, liquidCash, dailyInterest });
        });
      });
    };

    const daniloDb = await readDb('dv_danilo.db');
    const wifeDb = await readDb('dv_wife.db');

    const totalNetWorth = daniloDb.netWorth + wifeDb.netWorth;
    const totalLiquidCash = daniloDb.liquidCash + wifeDb.liquidCash;
    const totalDailyInterest = daniloDb.dailyInterest + wifeDb.dailyInterest;

    res.json({
      success: true,
      household: {
        totalNetWorth,
        totalLiquidCash,
        totalDailyInterest,
        danilo: daniloDb,
        wife: wifeDb
      }
    });
  } catch (error) {
    console.error('Household Overview Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
