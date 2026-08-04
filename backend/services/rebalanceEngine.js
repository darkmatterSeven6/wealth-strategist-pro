/**
 * Market-Aware Asset Reallocation & GInvest Execution Engine
 */

const MODEL_PORTFOLIOS = {
  conservative: {
    id: "conservative",
    name: "Conservative Yield & Capital Preservation",
    description: "Focuses on money market stability, low volatility, and capital preservation with minor tech exposure.",
    targetYield: "4.8% - 5.2% p.a.",
    expectedVol: "1.5% - 3.0%",
    targets: {
      "fund-atram-tech": 0.10,
      "fund-atram-infra": 0.05,
      "fund-alfm-multi-asset": 0.15,
      "fund-manulife-reit": 0.05,
      "fund-atram-money-market": 0.65
    }
  },
  moderate: {
    id: "moderate",
    name: "Moderate Dividend Cash Flow & Balanced Growth",
    description: "Prioritizes steady dividend income (5.5%–6.5% yield) from REITs & Multi-Asset funds with 30% AI/Tech growth upside.",
    targetYield: "5.8% - 6.5% p.a.",
    expectedVol: "7.0% - 9.5%",
    targets: {
      "fund-atram-tech": 0.20,
      "fund-atram-infra": 0.10,
      "fund-alfm-multi-asset": 0.35,
      "fund-manulife-reit": 0.15,
      "fund-atram-money-market": 0.20
    }
  },
  aggressive: {
    id: "aggressive",
    name: "Aggressive AI & Global Tech Momentum",
    description: "Overweights Global Technology & Infrastructure feeders to maximize secular AI capital appreciation.",
    targetYield: "3.2% - 4.0% p.a.",
    expectedVol: "14.0% - 18.0%",
    targets: {
      "fund-atram-tech": 0.45,
      "fund-atram-infra": 0.15,
      "fund-alfm-multi-asset": 0.20,
      "fund-manulife-reit": 0.10,
      "fund-atram-money-market": 0.10
    }
  }
};

class RebalanceEngine {
  getModelPortfolios() {
    return MODEL_PORTFOLIOS;
  }

  /**
   * Analyze portfolio against a chosen model and current macro regime
   * @param {Array<Object>} funds 
   * @param {string} selectedModelKey 'conservative' | 'moderate' | 'aggressive'
   * @param {Object} macroRegime 
   * @param {Object} liquidityStatus 
   * @returns {Object}
   */
  analyzeRebalancing(funds, selectedModelKey = 'aggressive', macroRegime = {}, liquidityStatus = {}) {
    const model = MODEL_PORTFOLIOS[selectedModelKey] || MODEL_PORTFOLIOS.aggressive;
    const totalGInvestValue = funds.reduce((sum, f) => sum + (f.currentMarketValue || 0), 0);

    if (totalGInvestValue <= 0) {
      return {
        model,
        summary: "No active GInvest holdings found to analyze.",
        allocations: [],
        recommendations: [],
        stepByStepInstructions: []
      };
    }

    const allocations = [];
    const executionTrades = [];

    funds.forEach(fund => {
      const currentValue = fund.currentMarketValue || 0;
      const currentWeight = currentValue / totalGInvestValue;
      const targetWeight = model.targets[fund.id] !== undefined ? model.targets[fund.id] : 0;
      const targetValue = totalGInvestValue * targetWeight;
      const deltaValue = targetValue - currentValue;
      const deltaWeightPercent = (targetWeight - currentWeight) * 100;

      let action = "HOLD";
      if (deltaValue > 500) {
        action = "BUY";
      } else if (deltaValue < -500) {
        action = "REBALANCE_TRIM";
      }

      allocations.push({
        fundId: fund.id,
        fundName: fund.name,
        category: fund.category,
        currentValue: parseFloat(currentValue.toFixed(2)),
        currentWeightPercent: parseFloat((currentWeight * 100).toFixed(2)),
        targetValue: parseFloat(targetValue.toFixed(2)),
        targetWeightPercent: parseFloat((targetWeight * 100).toFixed(2)),
        deltaValue: parseFloat(deltaValue.toFixed(2)),
        deltaWeightPercent: parseFloat(deltaWeightPercent.toFixed(2)),
        action,
        currentNavpu: fund.currentNavpu,
        estimatedUnitsDelta: fund.currentNavpu > 0 ? parseFloat((deltaValue / fund.currentNavpu).toFixed(4)) : 0
      });

      if (Math.abs(deltaValue) > 500) {
        executionTrades.push({
          fundId: fund.id,
          fundName: fund.name,
          action: deltaValue > 0 ? "BUY" : "SELL",
          amount: Math.abs(parseFloat(deltaValue.toFixed(2))),
          unitsEstimate: fund.currentNavpu > 0 ? Math.abs(parseFloat((deltaValue / fund.currentNavpu).toFixed(4))) : 0,
          priority: Math.abs(deltaValue) > 10000 ? "HIGH" : "NORMAL"
        });
      }
    });

    // Sort sells first (to fund the buys)
    executionTrades.sort((a, b) => (a.action === 'SELL' ? -1 : 1));

    // Generate step-by-step instructions for GCash GInvest execution
    const stepByStepInstructions = [];
    let stepNumber = 1;

    // Macro Regime Context Note
    let regimeNote = "";
    if (macroRegime.techMomentumScore > 75) {
      regimeNote = "Macro regime exhibits high AI/Tech momentum (>75/100). Aggressive model allows higher volatility tolerance for secular upside.";
    } else if (macroRegime.phThreeMonthTBillRate > 6.0) {
      regimeNote = "High local Treasury Bill yields (>6.0%). Conservative/Moderate allocation is highly attractive on a risk-adjusted basis.";
    } else {
      regimeNote = "Balanced macro conditions. Moderate dividend feeder allocation recommended to hedge equity drawdown risks.";
    }

    // Liquidity Guard Check
    const hasLiquidityWarning = liquidityStatus.isLiquidityDeficit;
    if (hasLiquidityWarning && selectedModelKey === 'aggressive') {
      stepByStepInstructions.push({
        step: stepNumber++,
        title: "⚠️ LIQUIDITY BUFFER WARNING",
        description: `Your emergency liquidity (₱${liquidityStatus.liquidBalance?.toLocaleString() || 0}) is below the required 1-2 months buffer. Replenish MariBank/Maya before deploying new capital into aggressive equity feeders.`
      });
    }

    const sells = executionTrades.filter(t => t.action === 'SELL');
    const buys = executionTrades.filter(t => t.action === 'BUY');

    if (sells.length > 0) {
      sells.forEach(s => {
        stepByStepInstructions.push({
          step: stepNumber++,
          title: `Sell / Redeem from ${s.fundName}`,
          description: `Open GCash > GInvest (GFunds) > Select "${s.fundName}" > Tap "Sell" > Enter ₱${s.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} (approx ${s.unitsEstimate} units). Settlement takes 1-3 business days.`,
          type: "SELL",
          fundId: s.fundId,
          amount: s.amount
        });
      });
    }

    if (buys.length > 0) {
      buys.forEach(b => {
        stepByStepInstructions.push({
          step: stepNumber++,
          title: `Buy / Subscribe to ${b.fundName}`,
          description: `Once proceeds settle in GCash Wallet > Open GInvest > Select "${b.fundName}" > Tap "Buy" > Enter ₱${b.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`,
          type: "BUY",
          fundId: b.fundId,
          amount: b.amount
        });
      });
    }

    if (executionTrades.length === 0) {
      stepByStepInstructions.push({
        step: stepNumber++,
        title: "Portfolio is Well-Balanced",
        description: "Your current GInvest holdings are within target tolerance bands (+/- 2%). No rebalance trades required today.",
        type: "HOLD"
      });
    }

    return {
      modelKey: selectedModelKey,
      model,
      totalGInvestValue: parseFloat(totalGInvestValue.toFixed(2)),
      regimeNote,
      allocations,
      executionTrades,
      stepByStepInstructions
    };
  }
}

module.exports = new RebalanceEngine();
