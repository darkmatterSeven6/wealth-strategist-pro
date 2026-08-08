const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const dataStore = require('../services/dataStore');
const quantEngine = require('../services/quantEngine');
const navpuScraper = require('../services/navpuScraper');

// Load seed holdings as fallback
let seedHoldings = [];
try {
  const seedPath = path.join(__dirname, '..', 'data', 'seedHoldings.json');
  if (fs.existsSync(seedPath)) {
    seedHoldings = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  }
} catch (e) {
  console.error('Could not load seedHoldings in ginvest route:', e);
}

// GET all funds enriched with quant metrics
router.get('/funds', (req, res) => {
  const db = dataStore.getDb();
  let rawFunds = db.funds || [];
  const riskFreeRate = db.macroRegime?.phThreeMonthTBillRate || 5.50;

  // Enrich funds with top_holdings if not present
  rawFunds = rawFunds.map(fund => {
    if (!fund.top_holdings || fund.top_holdings.length === 0) {
      const match = seedHoldings.find(s => s.fund_id === fund.id || s.fund_name?.toLowerCase() === fund.name?.toLowerCase());
      if (match) {
        return {
          ...fund,
          targetFund: match.target_fund || fund.targetFund,
          targetFundManager: match.target_fund_manager || fund.targetFundManager,
          benchmark: match.benchmark || fund.benchmark,
          top10Weight: match.top_10_weight || fund.top10Weight,
          top_holdings: match.holdings
        };
      }
    }
    return fund;
  });

  const enrichedFunds = quantEngine.enrichFundMetrics(rawFunds, riskFreeRate);
  
  // Sort funds so active holdings (units > 0 or pending buy > 0) are always at the top
  enrichedFunds.sort((a, b) => {
    const aActive = (a.unitsHeld > 0 || (a.pendingBuyOrders || 0) > 0 || (a.investedCapital || 0) > 0) ? 1 : 0;
    const bActive = (b.unitsHeld > 0 || (b.pendingBuyOrders || 0) > 0 || (b.investedCapital || 0) > 0) ? 1 : 0;
    if (aActive !== bActive) return bActive - aActive;

    if (aActive && bActive) {
      const aVal = (a.currentMarketValue || 0) + (a.pendingBuyOrders || 0);
      const bVal = (b.currentMarketValue || 0) + (b.pendingBuyOrders || 0);
      return bVal - aVal;
    }
    return (b.metrics?.oneYearReturn || 0) - (a.metrics?.oneYearReturn || 0);
  });

  const summary = quantEngine.calculatePortfolioSummary(enrichedFunds, db.accounts || [], riskFreeRate);

  res.json({
    success: true,
    riskFreeRate,
    summary,
    funds: enrichedFunds
  });
});

// POST update units held, average cost, or platform metadata
router.post('/update-holding', (req, res) => {
  const { fundId, unitsHeld, averageCost, investedCapital, platform, category, dividendYieldPAnnum, pendingBuyOrders, pendingSellOrders } = req.body;
  if (!fundId) {
    return res.status(400).json({ success: false, error: 'fundId is required.' });
  }

  const db = dataStore.getDb();
  const fundIndex = db.funds.findIndex(f => f.id === fundId);
  if (fundIndex === -1) {
    return res.status(404).json({ success: false, error: 'Fund not found.' });
  }

  const fund = db.funds[fundIndex];
  if (unitsHeld !== undefined) fund.unitsHeld = parseFloat(unitsHeld);
  if (averageCost !== undefined) fund.averageCost = parseFloat(averageCost);
  if (platform) fund.platform = platform;
  if (category) fund.category = category;
  if (dividendYieldPAnnum !== undefined) fund.dividendYieldPAnnum = parseFloat(dividendYieldPAnnum);
  if (pendingBuyOrders !== undefined) fund.pendingBuyOrders = parseFloat(pendingBuyOrders);
  if (pendingSellOrders !== undefined) fund.pendingSellOrders = parseFloat(pendingSellOrders);

  if (investedCapital !== undefined) {
    fund.investedCapital = parseFloat(investedCapital);
  } else if (fund.unitsHeld !== undefined && fund.averageCost !== undefined) {
    fund.investedCapital = parseFloat((fund.unitsHeld * fund.averageCost).toFixed(2));
  }

  const currentMarketValue = parseFloat((fund.unitsHeld * (fund.currentNavpu || 100)).toFixed(2));
  fund.currentMarketValue = currentMarketValue;
  fund.unrealizedGain = parseFloat((currentMarketValue - fund.investedCapital).toFixed(2));
  fund.unrealizedGainPercent = fund.investedCapital > 0 
    ? parseFloat(((fund.unrealizedGain / fund.investedCapital) * 100).toFixed(2)) 
    : 0;

  dataStore.saveDb(db);
  dataStore.addSyncLog('GInvest Holding Update', 'success', `Updated holding for ${fund.name} (${fund.platform || 'GInvest'}): ${fund.unitsHeld} units.`);

  res.json({
    success: true,
    message: `Updated holding for ${fund.name}`,
    fund
  });
});

// POST add new fund
router.post('/fund', (req, res) => {
  const {
    name,
    provider,
    platform,
    category,
    currency,
    riskRating,
    currentNavpu,
    unitsHeld,
    averageCost,
    dividendYieldPAnnum
  } = req.body;

  if (!name || currentNavpu === undefined) {
    return res.status(400).json({ success: false, error: 'Fund name and current NAVPU are required.' });
  }

  const db = dataStore.getDb();
  const navpu = parseFloat(currentNavpu);
  const units = unitsHeld ? parseFloat(unitsHeld) : 0;
  const avgCost = averageCost ? parseFloat(averageCost) : navpu;
  const investedCapital = parseFloat((units * avgCost).toFixed(2));
  const currentMarketValue = parseFloat((units * navpu).toFixed(2));
  const unrealizedGain = parseFloat((currentMarketValue - investedCapital).toFixed(2));
  const unrealizedGainPercent = investedCapital > 0 ? parseFloat(((unrealizedGain / investedCapital) * 100).toFixed(2)) : 0;

  const newFund = {
    id: `fund-custom-${Date.now()}`,
    name,
    provider: provider || 'Philippine Asset Manager',
    platform: platform || 'GInvest / GFunds (GCash)',
    targetFund: name,
    category: category || 'Global Equity Feeder',
    currency: currency || 'PHP',
    riskRating: riskRating || 'Moderate',
    currentNavpu: navpu,
    previousNavpu: navpu,
    navpuDate: new Date().toISOString().split('T')[0],
    unitsHeld: units,
    averageCost: avgCost,
    investedCapital,
    currentMarketValue,
    unrealizedGain,
    unrealizedGainPercent,
    dividendYieldPAnnum: dividendYieldPAnnum ? parseFloat(dividendYieldPAnnum) : 0,
    metrics: {
      oneYearReturn: 8.5,
      threeYearCagr: 7.2,
      fiveYearCagr: 8.0,
      volatility30d: 12.0,
      sharpeRatio: 0.85,
      maxDrawdown: -8.5
    },
    historicalNavpu: [
      { date: '2025-08-01', navpu: parseFloat((navpu * 0.92).toFixed(2)) },
      { date: '2026-01-01', navpu: parseFloat((navpu * 0.96).toFixed(2)) },
      { date: new Date().toISOString().split('T')[0], navpu }
    ]
  };

  db.funds = db.funds || [];
  db.funds.push(newFund);
  dataStore.saveDb(db);
  dataStore.addSyncLog('Fund Manager', 'success', `Added new fund: ${name} on ${newFund.platform}`);

  res.json({ success: true, fund: newFund });
});

const screenshotParser = require('../services/screenshotParser');

// POST trigger live NAVPU scraper
router.post('/scrape', async (req, res) => {
  try {
    const updatedFunds = await navpuScraper.scrapeAllFunds();
    const db = dataStore.getDb();
    const riskFreeRate = db.macroRegime?.phThreeMonthTBillRate || 5.50;
    const enriched = quantEngine.enrichFundMetrics(updatedFunds, riskFreeRate);

    res.json({
      success: true,
      message: 'Successfully scraped and updated all Philippine UITF NAVPUs.',
      funds: enriched
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST parse OCR text from screenshot
router.post('/parse-text', (req, res) => {
  try {
    const { rawText, metadata } = req.body;
    const parseResult = screenshotParser.parseFundStatementText(rawText, metadata);
    res.json(parseResult);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST apply screenshot parsed fund data to database
router.post('/import-screenshot-data', (req, res) => {
  try {
    const {
      fundId,
      fundName,
      platform,
      unitsHeld,
      currentNavpu,
      currentMarketValue,
      investedCapital,
      pendingBuyOrders,
      pendingSellOrders,
      navpuDate,
      oneYearReturn
    } = req.body;

    const db = dataStore.getDb();
    db.funds = db.funds || [];

    let fund = db.funds.find(f => f.id === fundId || f.name.toLowerCase() === (fundName || '').toLowerCase());

    const units = parseFloat(unitsHeld) || 0;
    const navpu = parseFloat(currentNavpu) || (fund ? fund.currentNavpu : 100);
    const mktVal = currentMarketValue ? parseFloat(currentMarketValue) : parseFloat((units * navpu).toFixed(2));
    const invCap = investedCapital ? parseFloat(investedCapital) : (fund && fund.investedCapital ? fund.investedCapital : mktVal);
    const unGain = parseFloat((mktVal - invCap).toFixed(2));
    const unGainPct = invCap > 0 ? parseFloat(((unGain / invCap) * 100).toFixed(2)) : 0;
    const dateStr = navpuDate || new Date().toISOString().split('T')[0];

    if (fund) {
      fund.unitsHeld = units;
      fund.currentNavpu = navpu;
      fund.currentMarketValue = mktVal;
      fund.investedCapital = invCap;
      fund.averageCost = units > 0 ? parseFloat((invCap / units).toFixed(4)) : navpu;
      fund.unrealizedGain = unGain;
      fund.unrealizedGainPercent = unGainPct;
      fund.navpuDate = dateStr;
      if (platform) fund.platform = platform;
      if (pendingBuyOrders !== undefined) fund.pendingBuyOrders = parseFloat(pendingBuyOrders) || 0;
      if (pendingSellOrders !== undefined) fund.pendingSellOrders = parseFloat(pendingSellOrders) || 0;
      if (oneYearReturn !== undefined && fund.metrics) {
        fund.metrics.oneYearReturn = parseFloat(oneYearReturn);
      }

      // Add to historical NAVPU if fresh
      fund.historicalNavpu = fund.historicalNavpu || [];
      const histIdx = fund.historicalNavpu.findIndex(h => h.date === dateStr);
      if (histIdx >= 0) {
        fund.historicalNavpu[histIdx].navpu = navpu;
      } else {
        fund.historicalNavpu.push({ date: dateStr, navpu });
      }
    } else {
      // Create new fund entry
      fund = {
        id: `fund-${Date.now()}`,
        name: fundName || 'New Fund',
        provider: 'Philippine Fund Manager',
        platform: platform || 'GCash GInvest',
        targetFund: fundName || 'Target Asset',
        category: 'Global Equity Feeder',
        currency: 'PHP',
        riskRating: 'Aggressive',
        currentNavpu: navpu,
        previousNavpu: navpu,
        navpuDate: dateStr,
        unitsHeld: units,
        averageCost: units > 0 ? parseFloat((invCap / units).toFixed(4)) : navpu,
        investedCapital: invCap,
        currentMarketValue: mktVal,
        unrealizedGain: unGain,
        unrealizedGainPercent: unGainPct,
        dividendYieldPAnnum: 0,
        pendingBuyOrders: parseFloat(pendingBuyOrders) || 0,
        pendingSellOrders: parseFloat(pendingSellOrders) || 0,
        metrics: {
          oneYearReturn: oneYearReturn ? parseFloat(oneYearReturn) : 10.0,
          threeYearCagr: 8.0,
          fiveYearCagr: 8.5,
          volatility30d: 12.0,
          sharpeRatio: 0.8,
          maxDrawdown: -10.0
        },
        historicalNavpu: [
          { date: dateStr, navpu }
        ]
      };
      db.funds.push(fund);
    }

    dataStore.saveDb(db);
    dataStore.addSyncLog(
      'Screenshot OCR Ingestion',
      'success',
      `Imported screenshot statement for "${fund.name}" on ${fund.platform}: ${fund.unitsHeld} units @ ₱${fund.currentNavpu} (Market Value: ₱${fund.currentMarketValue.toLocaleString()}).`
    );

    if (typeof global.broadcastEvent === 'function') {
      global.broadcastEvent('DATA_UPDATED', { type: 'FUNDS_SYNC', fundId: fund.id });
    }

    res.json({ success: true, message: 'Screenshot data imported successfully.', fund });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
