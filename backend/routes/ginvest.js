const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const quantEngine = require('../services/quantEngine');
const navpuScraper = require('../services/navpuScraper');

// GET all funds enriched with quant metrics
router.get('/funds', (req, res) => {
  const db = dataStore.getDb();
  const rawFunds = db.funds || [];
  const riskFreeRate = db.macroRegime?.phThreeMonthTBillRate || 5.50;

  const enrichedFunds = quantEngine.enrichFundMetrics(rawFunds, riskFreeRate);
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

module.exports = router;
