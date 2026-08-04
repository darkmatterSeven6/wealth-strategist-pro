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

// POST update units held or average cost
router.post('/update-holding', (req, res) => {
  const { fundId, unitsHeld, averageCost, investedCapital } = req.body;
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
  if (investedCapital !== undefined) {
    fund.investedCapital = parseFloat(investedCapital);
  } else if (fund.unitsHeld && fund.averageCost) {
    fund.investedCapital = parseFloat((fund.unitsHeld * fund.averageCost).toFixed(2));
  }

  const currentMarketValue = parseFloat((fund.unitsHeld * fund.currentNavpu).toFixed(2));
  fund.currentMarketValue = currentMarketValue;
  fund.unrealizedGain = parseFloat((currentMarketValue - fund.investedCapital).toFixed(2));
  fund.unrealizedGainPercent = fund.investedCapital > 0 
    ? parseFloat(((fund.unrealizedGain / fund.investedCapital) * 100).toFixed(2)) 
    : 0;

  dataStore.saveDb(db);
  dataStore.addSyncLog('GInvest Holding Update', 'success', `Updated holding for ${fund.name}: ${fund.unitsHeld} units.`);

  res.json({
    success: true,
    message: `Updated holding for ${fund.name}`,
    fund
  });
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
