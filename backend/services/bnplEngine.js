/**
 * BNPL, Credit Drag & Liquidity Buffer Engine
 */

class BnplEngine {
  /**
   * Calculate Effective APR from nominal monthly rate and fees
   * @param {number} nominalMonthlyRatePercent 
   * @param {number} monthlyAdminFee 
   * @param {number} principal 
   * @returns {number} percentage
   */
  calculateEffectiveApr(nominalMonthlyRatePercent, monthlyAdminFee = 0, principal = 1000) {
    const monthlyFeePercent = principal > 0 ? (monthlyAdminFee / principal) * 100 : 0;
    const totalMonthlyRate = (nominalMonthlyRatePercent + monthlyFeePercent) / 100;
    if (totalMonthlyRate <= 0) return 0;
    const effectiveApr = (Math.pow(1 + totalMonthlyRate, 12) - 1) * 100;
    return parseFloat(effectiveApr.toFixed(2));
  }

  /**
   * Analyze liabilities and compute credit drag metrics
   * @param {Array<Object>} liabilities 
   * @param {Array<Object>} accounts 
   * @param {Object} cashFlow 
   * @param {Object} profile 
   * @returns {Object}
   */
  analyzeLiabilitiesAndLiquidity(liabilities, accounts, cashFlow, profile = {}) {
    const monthlyLivingExpenses = profile.targetMonthlyLivingExpenses || 55000.0;
    const minBufferMonths = 2;
    const idealBufferMonths = profile.targetEmergencyFundMonths || 3;

    const minRequiredLiquidity = monthlyLivingExpenses * minBufferMonths;
    const idealRequiredLiquidity = monthlyLivingExpenses * idealBufferMonths;

    // Liquid balances (Digital banks, checking, savings, wallets)
    const liquidBalance = accounts
      .filter(a => a.isLiquid)
      .reduce((sum, a) => sum + a.balance, 0);

    const isLiquidityDeficit = liquidBalance < minRequiredLiquidity;
    const liquidityMonthsAvailable = monthlyLivingExpenses > 0 
      ? parseFloat((liquidBalance / monthlyLivingExpenses).toFixed(2)) 
      : 0;

    let totalOutstandingDebt = 0;
    let totalMonthlyDebtPayments = 0;
    let totalAnnualInterestDrag = 0;
    let highInterestDebtTotal = 0; // APR > 20%
    let totalCreditLimit = 0;
    let totalAvailableCredit = 0;

    const enrichedLiabilities = liabilities.map(item => {
      const balance = item.outstandingBalance || 0;
      const creditLimit = item.creditLimit !== undefined && item.creditLimit !== null 
        ? item.creditLimit 
        : (balance > 0 ? balance * 2 : 10000);
      const availableCredit = Math.max(0, parseFloat((creditLimit - balance).toFixed(2)));
      const utilizationPercent = creditLimit > 0 ? parseFloat(((balance / creditLimit) * 100).toFixed(1)) : 0;

      totalOutstandingDebt += balance;
      totalMonthlyDebtPayments += item.monthlyPayment || 0;
      totalCreditLimit += creditLimit;
      totalAvailableCredit += availableCredit;

      const effectiveApr = item.effectiveApr || this.calculateEffectiveApr(
        item.nominalMonthlyRate || 0,
        item.monthlyAdminFee || 0,
        balance
      );

      // Annual interest cost
      const annualInterestCost = balance * (effectiveApr / 100);
      totalAnnualInterestDrag += annualInterestCost;

      if (effectiveApr >= 20) {
        highInterestDebtTotal += balance;
      }

      // Compute days until due date if date provided
      let daysUntilDue = item.daysUntilDue;
      if (item.billingCycleDueDate) {
        const dueDate = new Date(item.billingCycleDueDate);
        const today = new Date();
        const diffTime = dueDate.getTime() - today.getTime();
        daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (daysUntilDue < 0) daysUntilDue = 0;
      }

      // Determine urgency
      let urgency = "LOW";
      if (daysUntilDue <= 3 || effectiveApr > 45) {
        urgency = "CRITICAL";
      } else if (daysUntilDue <= 10 || effectiveApr > 25) {
        urgency = "HIGH";
      } else if (daysUntilDue <= 15) {
        urgency = "MEDIUM";
      }

      return {
        ...item,
        creditLimit,
        availableCredit,
        utilizationPercent,
        effectiveApr,
        annualInterestCost: parseFloat(annualInterestCost.toFixed(2)),
        monthlyInterestCost: parseFloat((annualInterestCost / 12).toFixed(2)),
        daysUntilDue,
        urgency
      };
    });

    const monthlyInterestDrag = totalAnnualInterestDrag / 12;
    const monthlyIncome = cashFlow.monthlyInflow || 175000.0;
    const totalFixedBills = (cashFlow.fixedExpenses || []).reduce((sum, e) => sum + e.amount, 0);
    const totalCommittedOutflow = totalFixedBills + totalMonthlyDebtPayments;
    const netInvestableSurplus = monthlyIncome - totalCommittedOutflow;
    const debtToIncomeRatio = monthlyIncome > 0 ? (totalMonthlyDebtPayments / monthlyIncome) * 100 : 0;
    const overallCreditUtilization = totalCreditLimit > 0 
      ? parseFloat(((totalOutstandingDebt / totalCreditLimit) * 100).toFixed(1)) 
      : 0;

    return {
      totalOutstandingDebt: parseFloat(totalOutstandingDebt.toFixed(2)),
      totalCreditLimit: parseFloat(totalCreditLimit.toFixed(2)),
      totalAvailableCredit: parseFloat(totalAvailableCredit.toFixed(2)),
      overallCreditUtilization,
      totalMonthlyDebtPayments: parseFloat(totalMonthlyDebtPayments.toFixed(2)),
      totalAnnualInterestDrag: parseFloat(totalAnnualInterestDrag.toFixed(2)),
      monthlyInterestDrag: parseFloat(monthlyInterestDrag.toFixed(2)),
      highInterestDebtTotal: parseFloat(highInterestDebtTotal.toFixed(2)),
      debtToIncomeRatio: parseFloat(debtToIncomeRatio.toFixed(2)),
      
      // Liquidity Buffer Check
      liquidity: {
        liquidBalance: parseFloat(liquidBalance.toFixed(2)),
        monthlyLivingExpenses: parseFloat(monthlyLivingExpenses.toFixed(2)),
        minRequiredLiquidity: parseFloat(minRequiredLiquidity.toFixed(2)),
        idealRequiredLiquidity: parseFloat(idealRequiredLiquidity.toFixed(2)),
        liquidityMonthsAvailable,
        isLiquidityDeficit,
        liquiditySurplusOrDeficit: parseFloat((liquidBalance - minRequiredLiquidity).toFixed(2)),
        healthGrade: liquidityMonthsAvailable >= idealBufferMonths 
          ? "A+ (Excellent Buffer)" 
          : liquidityMonthsAvailable >= minBufferMonths 
          ? "B (Adequate Buffer)" 
          : "C- (Deficit - Replenish Liquid Banks)"
      },

      // Cash Flow Summary
      cashFlowSummary: {
        monthlyIncome: parseFloat(monthlyIncome.toFixed(2)),
        totalFixedBills: parseFloat(totalFixedBills.toFixed(2)),
        totalMonthlyDebtPayments: parseFloat(totalMonthlyDebtPayments.toFixed(2)),
        totalCommittedOutflow: parseFloat(totalCommittedOutflow.toFixed(2)),
        netInvestableSurplus: parseFloat(netInvestableSurplus.toFixed(2)),
        savingsRatePercent: monthlyIncome > 0 ? parseFloat(((netInvestableSurplus / monthlyIncome) * 100).toFixed(2)) : 0
      },

      enrichedLiabilities
    };
  }
}

module.exports = new BnplEngine();
