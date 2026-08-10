const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');
const DEFAULT_DATA_PATH = path.join(__dirname, '..', 'data', 'defaultData.json');
const SQLITE_DB_PATH = path.join(__dirname, '..', 'data', 'dv_financials.db');

function updateJSONStore(filePath) {
  if (!fs.existsSync(filePath)) return;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!data.funds) return;

  data.funds = data.funds.map(fund => {
    const name = fund.name || '';
    
    // 1. Global Technology
    if (name.includes('Global Technology')) {
      fund.unitsHeld = 2.0419;
      fund.investedCapital = 1000.00;
      fund.currentNavpu = 497.0092;
      fund.pendingBuyOrders = 0.00;
      fund.has_active_holding = 1;
    }
    // 2. Multi-Asset
    else if (name.includes('Multi-Asset')) {
      fund.unitsHeld = 4.2169;
      fund.investedCapital = 200.00;
      fund.currentNavpu = 47.5422;
      fund.pendingBuyOrders = 500.00;
      fund.est_completion_date = '2026-08-14';
      fund.has_active_holding = 1;
    }
    // 3. Equity Opportunity
    else if (name.includes('Equity Opportunity')) {
      fund.unitsHeld = 0.0000;
      fund.investedCapital = 0.00;
      fund.currentNavpu = 143.132102;
      fund.pendingBuyOrders = 1000.00;
      fund.pending_units = 6.9865;
      fund.est_completion_date = '2026-08-14';
      fund.has_active_holding = 0;
    }
    // 4. Reset All Uninvested Watchlist Funds
    else {
      fund.unitsHeld = 0.0000;
      fund.investedCapital = 0.00;
      fund.has_active_holding = 0;
    }

    // 5. Add Today's Pending Orders (These could overlap with above or be separate)
    if (name.includes('ALFM Money Market')) {
      fund.pendingBuyOrders = 50.00;
      fund.est_completion_date = '2026-08-13';
    }
    if (name.includes('Medium Term Peso Bond')) {
      fund.pendingBuyOrders = 100.00;
      fund.est_completion_date = '2026-08-14';
    }

    // Force Immediate Recalculation of Unrealized Gain and Pct
    const currentMarketValue = parseFloat((fund.unitsHeld * (fund.currentNavpu || 100)).toFixed(2));
    fund.currentMarketValue = currentMarketValue;
    fund.unrealizedGain = parseFloat((currentMarketValue - (fund.investedCapital || 0)).toFixed(2));
    if (fund.investedCapital > 0) {
      fund.unrealizedGainPercent = parseFloat(((fund.unrealizedGain / fund.investedCapital) * 100).toFixed(2));
    } else {
      fund.unrealizedGainPercent = 0.00;
    }
    
    return fund;
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ JSON Store updated: ${path.basename(filePath)}`);
}

console.log('--- Executing Ground-Truth Restoration (JSON Stores) ---');
updateJSONStore(DB_PATH);
updateJSONStore(DEFAULT_DATA_PATH);
