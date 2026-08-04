/**
 * Automated Session Sync Workers & E-Statement Parsers
 * Ingests statement uploads, simulates headless browser runs & parses transaction logs.
 */

const dataStore = require('./dataStore');

class SyncWorkers {
  /**
   * Run automated session sync for all digital banks & wallets
   */
  async runFullSync() {
    const db = dataStore.getDb();
    const accounts = db.accounts || [];
    const updatedAccounts = [];

    for (const acc of accounts) {
      const updated = { ...acc };
      const now = new Date().toISOString();

      if (acc.id === 'acc-maribank-01') {
        // Daily interest accrual @ 3.75%
        const dailyInterest = (acc.balance * (acc.currentApy / 100)) / 365;
        updated.balance = parseFloat((acc.balance + dailyInterest).toFixed(2));
        updated.dailyInterestEstimate = parseFloat(dailyInterest.toFixed(2));
        updated.lastSynced = now;
      } else if (acc.id === 'acc-maya-01') {
        // Maya boosted interest accrual
        const dailyInterest = (acc.balance * (acc.currentApy / 100)) / 365;
        updated.dailyInterestEstimate = parseFloat(dailyInterest.toFixed(2));
        updated.lastSynced = now;
      } else if (acc.id === 'acc-gotyme-01' || acc.id === 'acc-atome-01' || acc.id === 'acc-tonik-01') {
        const dailyInterest = (acc.balance * (acc.currentApy / 100)) / 365;
        updated.dailyInterestEstimate = parseFloat(dailyInterest.toFixed(2));
        updated.lastSynced = now;
      } else {
        updated.lastSynced = now;
      }

      updatedAccounts.push(updated);
    }

    db.accounts = updatedAccounts;
    db.profile.lastSyncTimestamp = new Date().toISOString();
    dataStore.saveDb(db);

    dataStore.addSyncLog(
      'Automated Aggregation Pipeline',
      'success',
      `Synchronized ${updatedAccounts.length} accounts with live accruals and statement hooks.`
    );

    return updatedAccounts;
  }

  /**
   * Parse GCash / GInvest / Maya Statement CSV or JSON payload
   * @param {string} rawContent 
   * @param {string} fileType 'csv' | 'json' | 'text'
   * @returns {Object}
   */
  parseStatement(rawContent, fileType = 'json') {
    try {
      if (fileType === 'json') {
        const parsed = JSON.parse(rawContent);
        return {
          success: true,
          type: 'json',
          recordsFound: Array.isArray(parsed) ? parsed.length : 1,
          data: parsed
        };
      }

      // CSV parser logic
      const lines = rawContent.trim().split('\n');
      if (lines.length < 2) {
        return { success: false, error: 'CSV file contains insufficient rows.' };
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const records = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
        if (cols.length >= headers.length) {
          const item = {};
          headers.forEach((h, idx) => {
            item[h] = cols[idx];
          });
          records.push(item);
        }
      }

      return {
        success: true,
        type: 'csv',
        recordsFound: records.length,
        records
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

module.exports = new SyncWorkers();
