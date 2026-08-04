const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const rebalanceEngine = require('../services/rebalanceEngine');
const bnplEngine = require('../services/bnplEngine');

// GET model portfolios
router.get('/models', (req, res) => {
  res.json({
    success: true,
    models: rebalanceEngine.getModelPortfolios()
  });
});

// POST analyze portfolio rebalancing
router.post('/analyze', (req, res) => {
  const { modelKey } = req.body;
  const db = dataStore.getDb();
  const funds = db.funds || [];
  const accounts = db.accounts || [];
  const liabilities = db.liabilities || [];
  const cashFlow = db.cashFlow || {};
  const profile = db.profile || {};
  const macro = db.macroRegime || {};

  // Check liquidity guard first
  const liabilitiesAnalysis = bnplEngine.analyzeLiabilitiesAndLiquidity(liabilities, accounts, cashFlow, profile);
  const liquidityStatus = {
    isLiquidityDeficit: liabilitiesAnalysis.liquidity.isLiquidityDeficit,
    liquidBalance: liabilitiesAnalysis.liquidity.liquidBalance,
    liquidityMonthsAvailable: liabilitiesAnalysis.liquidity.liquidityMonthsAvailable
  };

  const analysis = rebalanceEngine.analyzeRebalancing(
    funds,
    modelKey || 'aggressive',
    macro,
    liquidityStatus
  );

  res.json({
    success: true,
    ...analysis
  });
});

module.exports = router;
