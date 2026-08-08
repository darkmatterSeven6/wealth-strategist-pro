/**
 * DV Financials - Midnight Net Yield Auto-Accrual Engine
 * Calculates and credits daily net interest on digital bank ending balances
 * after deducting the Philippine 20% statutory final withholding tax.
 * 
 * Formula:
 * Daily Net Yield = (Ending Balance * (Gross APY / 100) * 0.80) / 365
 * 
 * Cron Schedule: Runs at 12:01 AM every day (0 1 0 * * *)
 */

const cron = require('node-cron');
const dataStore = require('./dataStore');

class AccrualEngine {
  constructor() {
    this.cronJob = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the cron job to run at 12:01 AM every day
   */
  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Schedule 12:01 AM daily: "1 0 * * *" or "0 1 0 * * *"
    this.cronJob = cron.schedule('1 0 * * *', async () => {
      console.log('⏰ [Accrual Engine] Triggering 12:01 AM Midnight Net Yield Auto-Accrual...');
      await this.runDailyAccrual();
    }, {
      scheduled: true,
      timezone: 'Asia/Manila'
    });

    console.log('✅ [Accrual Engine] Scheduled daily net interest accrual cron (12:01 AM Asia/Manila).');
  }

  /**
   * Execute daily net interest accrual calculation and ledger credit
   * @param {boolean} isManualTrigger 
   * @returns {Object} accrual summary
   */
  async runDailyAccrual(isManualTrigger = false) {
    const db = dataStore.getDb();
    const accounts = db.accounts || [];
    const creditedAccounts = [];
    let totalNetCredited = 0;
    let totalTaxWithheld = 0;
    const now = new Date().toISOString();

    for (const acc of accounts) {
      // Accrue on liquid interest-bearing digital banks with positive balance
      const grossApy = acc.currentApy || acc.baseApy || 0;
      const balance = parseFloat(acc.balance || 0);

      if (balance > 0 && grossApy > 0 && acc.isLiquid) {
        // Gross Daily Yield
        const dailyGross = (balance * (grossApy / 100)) / 365;
        // 20% Philippine Statutory Withholding Tax
        const withholdingTax = dailyGross * 0.20;
        // Net Daily Yield (80% of Gross)
        const dailyNet = (balance * (grossApy / 100) * 0.80) / 365;

        const newBalance = parseFloat((balance + dailyNet).toFixed(2));
        acc.balance = newBalance;
        acc.dailyInterestEstimate = parseFloat(dailyNet.toFixed(2));
        acc.lastSynced = now;

        totalNetCredited += dailyNet;
        totalTaxWithheld += withholdingTax;

        // Insert INTEREST_CREDIT ledger record
        const ledgerRecord = {
          id: `tx-yield-${Date.now()}-${acc.id}`,
          institution: acc.institution || acc.name,
          referenceNumber: `NET-YIELD-${acc.id}-${new Date().toISOString().slice(0,10)}`,
          type: 'INTEREST_CREDIT',
          amount: parseFloat(dailyNet.toFixed(2)),
          grossAmount: parseFloat(dailyGross.toFixed(2)),
          withholdingTax: parseFloat(withholdingTax.toFixed(2)),
          taxRate: '20% Withholding Tax',
          grossApy: grossApy,
          runningBalance: newBalance,
          subject: `Daily Net Interest Credited (${grossApy}% p.a. less 20% WHT)`,
          timestamp: now,
          parsedAt: now
        };

        if (!db.transactions) db.transactions = [];
        db.transactions.unshift(ledgerRecord);

        creditedAccounts.push({
          accountId: acc.id,
          name: acc.name,
          institution: acc.institution,
          previousBalance: balance,
          netInterest: parseFloat(dailyNet.toFixed(2)),
          grossInterest: parseFloat(dailyGross.toFixed(2)),
          withholdingTax: parseFloat(withholdingTax.toFixed(2)),
          newBalance: newBalance,
          grossApy: grossApy
        });
      }
    }

    // Keep transaction history clean (max 300 records)
    if (db.transactions && db.transactions.length > 300) {
      db.transactions = db.transactions.slice(0, 300);
    }

    db.profile.lastSyncTimestamp = now;
    dataStore.saveDb(db);

    const logMessage = `Accrued ₱${totalNetCredited.toFixed(2)} net interest across ${creditedAccounts.length} digital bank accounts (₱${totalTaxWithheld.toFixed(2)} 20% WHT deducted).`;
    dataStore.addSyncLog(
      isManualTrigger ? 'Midnight Net Yield Accrual (Manual Run)' : 'Midnight Net Yield Accrual (Cron)',
      'success',
      logMessage
    );

    return {
      success: true,
      timestamp: now,
      creditedAccountsCount: creditedAccounts.length,
      totalNetCredited: parseFloat(totalNetCredited.toFixed(2)),
      totalTaxWithheld: parseFloat(totalTaxWithheld.toFixed(2)),
      creditedAccounts
    };
  }
}

module.exports = new AccrualEngine();
