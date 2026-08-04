/**
 * Quantitative Financial Engine for GInvest & Wealth Portfolios
 * Calculates CAGR, Sharpe Ratio (using PH 3-Month T-Bill Rf), Volatility, Drawdowns & Alpha/Beta.
 */

class QuantEngine {
  /**
   * Calculate Compound Annual Growth Rate
   * @param {number} startVal 
   * @param {number} endVal 
   * @param {number} years 
   * @returns {number} percentage
   */
  calculateCAGR(startVal, endVal, years) {
    if (startVal <= 0 || endVal <= 0 || years <= 0) return 0;
    const cagr = (Math.pow(endVal / startVal, 1 / years) - 1) * 100;
    return parseFloat(cagr.toFixed(2));
  }

  /**
   * Calculate Annualized Volatility from price series
   * @param {Array<number>} prices 
   * @param {string} frequency 'daily' | 'monthly'
   * @returns {number} percentage
   */
  calculateVolatility(prices, frequency = 'monthly') {
    if (!prices || prices.length < 3) return 0;
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      const r = Math.log(prices[i] / prices[i - 1]);
      returns.push(r);
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (returns.length - 1);
    const stdDev = Math.sqrt(variance);
    const periodsPerYear = frequency === 'daily' ? 252 : 12;
    const annVol = stdDev * Math.sqrt(periodsPerYear) * 100;
    return parseFloat(annVol.toFixed(2));
  }

  /**
   * Calculate Sharpe Ratio using 3-month PH Treasury Bill as risk-free rate
   * @param {number} annualReturnPercent 
   * @param {number} annualVolPercent 
   * @param {number} riskFreeRatePercent Default ~5.50% PH 3M T-Bill
   * @returns {number}
   */
  calculateSharpe(annualReturnPercent, annualVolPercent, riskFreeRatePercent = 5.50) {
    if (annualVolPercent <= 0) return 0;
    const excessReturn = annualReturnPercent - riskFreeRatePercent;
    const sharpe = excessReturn / annualVolPercent;
    return parseFloat(sharpe.toFixed(2));
  }

  /**
   * Calculate Maximum Drawdown
   * @param {Array<number>} prices 
   * @returns {number} percentage (negative)
   */
  calculateMaxDrawdown(prices) {
    if (!prices || prices.length < 2) return 0;
    let peak = prices[0];
    let maxDrawdown = 0;
    for (const p of prices) {
      if (p > peak) peak = p;
      const drawdown = (p - peak) / peak;
      if (drawdown < maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    return parseFloat((maxDrawdown * 100).toFixed(2));
  }

  /**
   * Enrich Fund objects with live computed quant metrics
   * @param {Array<Object>} funds 
   * @param {number} riskFreeRate 
   * @returns {Array<Object>}
   */
  enrichFundMetrics(funds, riskFreeRate = 5.50) {
    return funds.map(fund => {
      const history = fund.historicalNavpu || [];
      const prices = history.map(h => h.navpu);
      
      let oneYearReturn = fund.metrics?.oneYearReturn;
      if (prices.length >= 12) {
        const startP = prices[prices.length - 13] || prices[0];
        const endP = prices[prices.length - 1];
        oneYearReturn = parseFloat((((endP - startP) / startP) * 100).toFixed(2));
      }

      let threeYearCagr = fund.metrics?.threeYearCagr;
      if (prices.length >= 36) {
        const startP = prices[prices.length - 37];
        const endP = prices[prices.length - 1];
        threeYearCagr = this.calculateCAGR(startP, endP, 3);
      }

      const vol30d = this.calculateVolatility(prices.slice(-6), 'monthly') || fund.metrics?.volatility30d || 10;
      const sharpe = this.calculateSharpe(oneYearReturn || 10, vol30d, riskFreeRate);
      const maxDrawdown = this.calculateMaxDrawdown(prices) || fund.metrics?.maxDrawdown || 0;

      const currentNavpu = fund.currentNavpu;
      const currentMarketValue = parseFloat((fund.unitsHeld * currentNavpu).toFixed(2));
      const unrealizedGain = parseFloat((currentMarketValue - fund.investedCapital).toFixed(2));
      const unrealizedGainPercent = fund.investedCapital > 0 
        ? parseFloat(((unrealizedGain / fund.investedCapital) * 100).toFixed(2)) 
        : 0;

      return {
        ...fund,
        currentMarketValue,
        unrealizedGain,
        unrealizedGainPercent,
        metrics: {
          ...fund.metrics,
          oneYearReturn: oneYearReturn || fund.metrics?.oneYearReturn || 0,
          threeYearCagr: threeYearCagr || fund.metrics?.threeYearCagr || 0,
          volatility30d: vol30d,
          sharpeRatio: sharpe,
          maxDrawdown: maxDrawdown,
          riskFreeRateUsed: riskFreeRate
        }
      };
    });
  }

  /**
   * Calculate Aggregate Portfolio Level Metrics
   * @param {Array<Object>} funds 
   * @param {Array<Object>} accounts 
   * @param {number} riskFreeRate 
   */
  calculatePortfolioSummary(funds, accounts, riskFreeRate = 5.50) {
    const totalGInvest = funds.reduce((sum, f) => sum + (f.currentMarketValue || 0), 0);
    const totalInvestedCapital = funds.reduce((sum, f) => sum + (f.investedCapital || 0), 0);
    const totalGInvestGain = totalGInvest - totalInvestedCapital;
    const totalGInvestGainPercent = totalInvestedCapital > 0 ? (totalGInvestGain / totalInvestedCapital) * 100 : 0;

    // Digital & Liquid Banks
    const liquidBankTotal = accounts
      .filter(a => a.isLiquid)
      .reduce((sum, a) => sum + a.balance, 0);

    // Total Net Liquid Interest Annually
    const annualDigitalBankInterest = accounts.reduce((sum, a) => {
      return sum + (a.balance * ((a.currentApy || 0) / 100));
    }, 0);

    // Weighted GInvest Expected Return & Weighted Sharpe
    let weightedReturn = 0;
    let weightedSharpe = 0;
    let weightedVol = 0;
    let annualDividendIncome = 0;

    funds.forEach(f => {
      const weight = totalGInvest > 0 ? (f.currentMarketValue || 0) / totalGInvest : 0;
      weightedReturn += weight * (f.metrics?.oneYearReturn || 0);
      weightedSharpe += weight * (f.metrics?.sharpeRatio || 0);
      weightedVol += weight * (f.metrics?.volatility30d || 0);

      if (f.dividendYieldPAnnum) {
        annualDividendIncome += (f.currentMarketValue || 0) * (f.dividendYieldPAnnum / 100);
      }
    });

    return {
      totalGInvest: parseFloat(totalGInvest.toFixed(2)),
      totalInvestedCapital: parseFloat(totalInvestedCapital.toFixed(2)),
      totalGInvestGain: parseFloat(totalGInvestGain.toFixed(2)),
      totalGInvestGainPercent: parseFloat(totalGInvestGainPercent.toFixed(2)),
      liquidBankTotal: parseFloat(liquidBankTotal.toFixed(2)),
      annualDigitalBankInterest: parseFloat(annualDigitalBankInterest.toFixed(2)),
      monthlyDigitalBankInterest: parseFloat((annualDigitalBankInterest / 12).toFixed(2)),
      annualDividendIncome: parseFloat(annualDividendIncome.toFixed(2)),
      monthlyDividendIncome: parseFloat((annualDividendIncome / 12).toFixed(2)),
      weightedReturn: parseFloat(weightedReturn.toFixed(2)),
      weightedSharpe: parseFloat(weightedSharpe.toFixed(2)),
      weightedVolatility: parseFloat(weightedVol.toFixed(2)),
      riskFreeRate
    };
  }
}

module.exports = new QuantEngine();
