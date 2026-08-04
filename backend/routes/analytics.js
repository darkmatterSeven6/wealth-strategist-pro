const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const quantEngine = require('../services/quantEngine');
const bnplEngine = require('../services/bnplEngine');

// GET full net worth & dashboard overview
router.get('/networth-summary', (req, res) => {
  const db = dataStore.getDb();
  const accounts = db.accounts || [];
  const funds = db.funds || [];
  const liabilities = db.liabilities || [];
  const cashFlow = db.cashFlow || {};
  const profile = db.profile || {};
  const macro = db.macroRegime || {};
  const riskFreeRate = macro.phThreeMonthTBillRate || 5.50;

  const enrichedFunds = quantEngine.enrichFundMetrics(funds, riskFreeRate);
  const quantSummary = quantEngine.calculatePortfolioSummary(enrichedFunds, accounts, riskFreeRate);
  const liabilitiesAnalysis = bnplEngine.analyzeLiabilitiesAndLiquidity(liabilities, accounts, cashFlow, profile);

  // Total Assets = Total Cash/Banks + Total GInvest Value
  const totalCashBankAssets = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalGInvestAssets = quantSummary.totalGInvest;
  const totalAssets = totalCashBankAssets + totalGInvestAssets;
  const totalLiabilities = liabilitiesAnalysis.totalOutstandingDebt;
  const netWorth = totalAssets - totalLiabilities;

  // Breakdown percentages
  const cashPercent = totalAssets > 0 ? (totalCashBankAssets / totalAssets) * 100 : 0;
  const ginvestPercent = totalAssets > 0 ? (totalGInvestAssets / totalAssets) * 100 : 0;

  res.json({
    success: true,
    profile,
    macro,
    summary: {
      netWorth: parseFloat(netWorth.toFixed(2)),
      totalAssets: parseFloat(totalAssets.toFixed(2)),
      totalLiabilities: parseFloat(totalLiabilities.toFixed(2)),
      totalCashBankAssets: parseFloat(totalCashBankAssets.toFixed(2)),
      totalGInvestAssets: parseFloat(totalGInvestAssets.toFixed(2)),
      cashPercent: parseFloat(cashPercent.toFixed(2)),
      ginvestPercent: parseFloat(ginvestPercent.toFixed(2)),
      totalGInvestGain: quantSummary.totalGInvestGain,
      totalGInvestGainPercent: quantSummary.totalGInvestGainPercent,
      annualPassiveIncomeEstimate: parseFloat((quantSummary.annualDigitalBankInterest + quantSummary.annualDividendIncome).toFixed(2)),
      monthlyPassiveIncomeEstimate: parseFloat(((quantSummary.annualDigitalBankInterest + quantSummary.annualDividendIncome) / 12).toFixed(2)),
      quant: quantSummary,
      liabilitiesAndLiquidity: liabilitiesAnalysis
    }
  });
});

// GET & POST macro regime
router.get('/macro', (req, res) => {
  const db = dataStore.getDb();
  res.json({ success: true, macro: db.macroRegime || {} });
});

router.post('/macro', (req, res) => {
  const db = dataStore.getDb();
  db.macroRegime = { ...db.macroRegime, ...req.body };
  dataStore.saveDb(db);
  res.json({ success: true, macro: db.macroRegime });
});

module.exports = router;
