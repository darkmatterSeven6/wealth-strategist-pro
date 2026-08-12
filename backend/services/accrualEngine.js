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

// Currency Truncation Helper (Strict 2-Decimal Floating Protection)
const toCentavos = (amount) => {
  return Math.floor(Math.round(amount * 10000) / 100) / 100;
};

class AccrualEngine {
  constructor() {
    this.cronJob = null;
    this.isInitialized = false;
    this.isRunning = false; // Lock to prevent double invocation
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
    if (this.isRunning) {
      throw new Error("Accrual engine is currently processing. Please wait.");
    }
    this.isRunning = true;
    try {
      const db = dataStore.getDb();
      const accounts = db.accounts || [];
      const creditedAccounts = [];
      let totalNetCredited = 0;
      let totalTaxWithheld = 0;
      const now = new Date().toISOString();

    for (const acc of accounts) {
      // Accrue on liquid interest-bearing digital banks with positive balance
      let grossApy = acc.currentApy || acc.baseApy || 0;
      const balance = parseFloat(acc.balance || 0);

      // MARIBANK, ATOME, MAYA GOALS HARDCODED OVERRIDES
      if (acc.name === 'Maya Bank ( Savings )') {
        grossApy = acc.currentApy || acc.baseApy || 5.00;
      } else if (acc.name === 'MariBank Savings') {
        grossApy = balance > 1000000 ? 3.75 : 3.25;
      } else if (acc.name === 'Atome Savings') {
        grossApy = 3.25;
      } else if (acc.name === 'Maya - Rainy Days Fund') {
        grossApy = 4.00;
      }

      if (balance > 0 && grossApy > 0 && acc.isLiquid) {
        // Gross Daily Yield
        const dailyGross = (balance * (grossApy / 100)) / 365;
        // 20% Philippine Statutory Withholding Tax
        const withholdingTax = dailyGross * 0.20;
        // Net Daily Yield (80% of Gross)
        const rawDailyYield = (balance * (grossApy / 100) * 0.80) / 365;
        const dailyNet = toCentavos(rawDailyYield);

        let newBalance = balance;
        if (acc.name === 'Maya - Rainy Days Fund') {
          // Virtual ledger tracking for uncredited monthly goals
          acc.accruedUncreditedInterest = toCentavos((acc.accruedUncreditedInterest || 0) + dailyNet);
          acc.virtualTotalBalance = toCentavos(balance + acc.accruedUncreditedInterest);
        } else {
          // Real-time daily cash compounding
          newBalance = toCentavos(balance + dailyNet);
          acc.balance = newBalance;
        }

        acc.lastDailyGain = dailyNet;
        acc.dailyInterestEstimate = dailyNet;
        acc.lastSynced = now;

        totalNetCredited = toCentavos(totalNetCredited + dailyNet);
        totalTaxWithheld += withholdingTax;

        // Insert INTEREST_CREDIT ledger record
        const ledgerRecord = {
          id: `tx-yield-${Date.now()}-${acc.id}`,
          institution: acc.institution || acc.name,
          referenceNumber: `NET-YIELD-${acc.id}-${new Date().toISOString().slice(0,10)}`,
          type: 'INTEREST_CREDIT',
          amount: dailyNet,
          grossAmount: dailyGross,
          withholdingTax: withholdingTax,
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
          netInterest: dailyNet,
          grossInterest: dailyGross,
          withholdingTax: withholdingTax,
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
        totalNetCredited: totalNetCredited,
        totalTaxWithheld: totalTaxWithheld,
        creditedAccounts
      };
    } finally {
      this.isRunning = false;
    }
  }
}

module.exports = new AccrualEngine();
