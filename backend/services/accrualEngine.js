const cron = require('node-cron');
const dataStore = require('./dataStore');

// Daily Net Yield Multipliers (After 20% PH Withholding Tax)
const NET_DAILY_RATES = {
  MAYA_SAVINGS: (0.0500 * 0.80) / 365,      // 4.00% Net p.a.
  MAYA_GOALS: (0.0400 * 0.80) / 365,        // 3.20% Net p.a.
  MARIBANK: (0.0325 * 0.80) / 365,          // 2.60% Net p.a.
  ATOME: (0.0325 * 0.80) / 365              // 2.60% Net p.a.
};

const roundCentavos = (val) => Math.round(val * 100) / 100;

function runDailyAccrualPass(isCatchup = false, isManual = false) {
  const db = dataStore.getDb();
  const accounts = db.accounts || [];
  
  // Use Asia/Manila timezone to get the current date string (YYYY-MM-DD)
  const todayStr = new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'Asia/Manila', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  }).format(new Date());

  console.log(`[ACCRUAL ENGINE] Running ${isCatchup ? 'Startup Catch-up' : (isManual ? 'Manual' : 'Scheduled Midnight')} Accrual Pass for ${todayStr}...`);

  // Idempotency Check: Don't run automated accruals if already run today
  if (!isManual && db.profile?.lastAccrualDate === todayStr) {
    console.log(`[ACCRUAL ENGINE] Pass already completed for ${todayStr}. Skipping.`);
    return;
  }

  let totalNetCredited = 0;
  let totalTaxWithheld = 0;
  const now = new Date().toISOString();

  accounts.forEach(acc => {
    // 1. Advance Maya Bank Savings
    if (acc.accountNumber?.includes('7280') || acc.name?.toLowerCase().includes('maya bank')) {
      const balance = acc.balance || 0;
      const dailyNet = balance * NET_DAILY_RATES.MAYA_SAVINGS;
      acc.balance = roundCentavos(balance + dailyNet);
      acc.lastDailyGain = roundCentavos(dailyNet);
      acc.lastSynced = now;
      totalNetCredited += dailyNet;
    }

    // 2. Advance Maya Rainy Days Fund Virtual Ledger
    else if (acc.accountNumber?.includes('5798') || acc.name?.toLowerCase().includes('rainy days')) {
      const dailyNet = (5000 * NET_DAILY_RATES.MAYA_GOALS); // ~0.438356
      acc.accruedUncreditedInterest = (acc.accruedUncreditedInterest || 0) + dailyNet;
      acc.virtualTotalBalance = roundCentavos((acc.balance || 5000) + acc.accruedUncreditedInterest);
      acc.lastDailyGain = roundCentavos(dailyNet);
      acc.lastSynced = now;
      totalNetCredited += dailyNet;
    }

    // 3. Advance MariBank Savings
    else if (acc.accountNumber?.includes('046') || acc.name?.toLowerCase().includes('maribank')) {
      const balance = acc.balance || 0;
      const dailyNet = balance * NET_DAILY_RATES.MARIBANK;
      acc.balance = roundCentavos(balance + dailyNet);
      acc.lastDailyGain = roundCentavos(dailyNet);
      acc.lastSynced = now;
      totalNetCredited += dailyNet;
    }

    // 4. Advance Atome Savings
    else if (acc.accountNumber?.includes('2626') || acc.name?.toLowerCase().includes('atome')) {
      const balance = acc.balance || 0;
      const dailyNet = balance * NET_DAILY_RATES.ATOME;
      acc.balance = roundCentavos(balance + dailyNet);
      acc.lastDailyGain = roundCentavos(dailyNet);
      acc.lastSynced = now;
      totalNetCredited += dailyNet;
    }
  });

  // Lock the run for today
  if (!db.profile) db.profile = {};
  db.profile.lastAccrualDate = todayStr;
  
  dataStore.saveDb(db);
  console.log(`[ACCRUAL ENGINE] Accrual pass completed successfully. +₱${totalNetCredited.toFixed(2)} total net yield.`);
  
  if (typeof global.broadcastEvent === 'function') {
    global.broadcastEvent('DATA_UPDATED', { type: 'ACCRUAL_SYNC' });
  }

  return { success: true, totalNetCredited };
}

// Schedule Cron at 12:00 AM Manila Time
function initAccrualCron() {
  // Run Catch-up Check Immediately on Server Boot
  runDailyAccrualPass(true);

  // Schedule Midnight Execution
  cron.schedule('0 0 * * *', () => {
    runDailyAccrualPass(false);
  }, {
    scheduled: true,
    timezone: 'Asia/Manila'
  });

  console.log('[ACCRUAL ENGINE] Timezone-aware midnight cron job initialized (Asia/Manila).');
}

// Ensure the module exports the exact functions the user wanted,
// but also expose an init() and runDailyAccrual() alias to not break server.js or routes.
module.exports = { 
  initAccrualCron, 
  runDailyAccrualPass,
  
  // Aliases to preserve backward compatibility with existing backend routes/server.js
  init: initAccrualCron,
  runDailyAccrual: (isManualTrigger) => runDailyAccrualPass(false, isManualTrigger)
};
