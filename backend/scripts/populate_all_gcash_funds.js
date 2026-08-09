const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/db.json');
const defaultDataPath = path.join(__dirname, '../data/defaultData.json');

const currentDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Helper to generate 12-month historical series ending in current NAVPU
function generateHistory(endNavpu, oneYearReturnPercent) {
  const dates = [
    '2025-08-01', '2025-09-01', '2025-10-01', '2025-11-03', '2025-12-01',
    '2026-01-02', '2026-02-02', '2026-03-02', '2026-04-01', '2026-05-02',
    '2026-06-01', '2026-07-01', '2026-08-03', '2026-08-04'
  ];
  
  const startNavpu = endNavpu / (1 + oneYearReturnPercent / 100);
  const step = (endNavpu - startNavpu) / (dates.length - 1);
  
  return dates.map((date, idx) => {
    if (idx === dates.length - 1) {
      return { date, navpu: parseFloat(endNavpu.toFixed(4)) };
    }
    // Add small realistic noise
    const progress = idx / (dates.length - 1);
    const noise = (Math.sin(idx * 1.5) * 0.015);
    const val = startNavpu + (endNavpu - startNavpu) * (progress + noise);
    return { date, navpu: parseFloat(val.toFixed(4)) };
  });
}

const allFunds = [
  {
    id: "fund-atram-tech",
    name: "ATRAM Global Technology Feeder Fund",
    provider: "ATRAM Trust Corporation",
    platform: "GCash GInvest",
    targetFund: "Fidelity Funds - Global Technology Fund",
    category: "Global Equity Feeder",
    currency: "PHP",
    riskRating: "Aggressive",
    currentNavpu: 269.75,
    previousNavpu: 268.90,
    navpuDate: "2026-08-04",
    unitsHeld: 1452.8410,
    investedCapital: 317445.76,
    averageCost: 218.50,
    currentMarketValue: 391903.86,
    unrealizedGain: 74458.10,
    unrealizedGainPercent: 23.46,
    dividendYieldPAnnum: 0,
    metrics: {
      oneYearReturn: 27.54,
      threeYearCagr: 19.85,
      fiveYearCagr: 18.20,
      volatility30d: 16.50,
      sharpeRatio: 1.34,
      maxDrawdown: -14.20,
      alpha: 4.80,
      beta: 1.15
    },
    historicalNavpu: generateHistory(269.75, 27.54)
  },
  {
    id: "fund-atram-infra",
    name: "ATRAM Global Infra Equity Feeder Fund",
    provider: "ATRAM Trust Corporation",
    platform: "GCash GInvest",
    targetFund: "Franklin Global Listed Infrastructure Fund",
    category: "Global Equity Feeder",
    currency: "PHP",
    riskRating: "Aggressive",
    currentNavpu: 143.00,
    previousNavpu: 142.15,
    navpuDate: "2026-08-04",
    unitsHeld: 1050.0000,
    investedCapital: 134400.00,
    averageCost: 128.00,
    currentMarketValue: 150150.00,
    unrealizedGain: 15750.00,
    unrealizedGainPercent: 11.72,
    dividendYieldPAnnum: 0,
    metrics: {
      oneYearReturn: 13.40,
      threeYearCagr: 11.20,
      fiveYearCagr: 10.50,
      volatility30d: 11.40,
      sharpeRatio: 0.69,
      maxDrawdown: -11.50,
      alpha: 1.20,
      beta: 0.85
    },
    historicalNavpu: generateHistory(143.00, 13.40)
  },
  {
    id: "fund-alfm-multi-asset",
    name: "ALFM Global Multi-Asset Income Fund Inc - PHP",
    provider: "BPI Wealth / ALFM",
    platform: "GCash GInvest, Maya Funds",
    targetFund: "BlackRock Global Multi-Asset Income Fund",
    category: "Multi-Asset Dividend Income",
    currency: "PHP",
    riskRating: "Moderate",
    currentNavpu: 52.97,
    previousNavpu: 52.83,
    navpuDate: "2026-08-04",
    unitsHeld: 3800.0000,
    investedCapital: 190760.00,
    averageCost: 50.20,
    currentMarketValue: 201286.00,
    unrealizedGain: 10526.00,
    unrealizedGainPercent: 5.52,
    dividendYieldPAnnum: 5.85,
    metrics: {
      oneYearReturn: 9.20,
      threeYearCagr: 7.60,
      fiveYearCagr: 8.10,
      volatility30d: 6.80,
      sharpeRatio: 0.78,
      maxDrawdown: -6.80,
      alpha: 1.10,
      beta: 0.62
    },
    historicalNavpu: generateHistory(52.97, 9.20)
  },
  {
    id: "fund-manulife-reit",
    name: "Manulife Global REIT Feeder Fund",
    provider: "Manulife Investment Management",
    platform: "GCash GInvest",
    targetFund: "Manulife Global Fund - Asian REIT Fund",
    category: "Global REIT Feeder",
    currency: "PHP",
    riskRating: "Moderate",
    currentNavpu: 109.35,
    previousNavpu: 108.90,
    navpuDate: "2026-08-04",
    unitsHeld: 1200.0000,
    investedCapital: 123000.00,
    averageCost: 102.50,
    currentMarketValue: 131220.00,
    unrealizedGain: 8220.00,
    unrealizedGainPercent: 6.68,
    dividendYieldPAnnum: 6.30,
    metrics: {
      oneYearReturn: 11.20,
      threeYearCagr: 8.40,
      fiveYearCagr: 9.20,
      volatility30d: 9.50,
      sharpeRatio: 0.82,
      maxDrawdown: -8.90,
      alpha: 1.60,
      beta: 0.74
    },
    historicalNavpu: generateHistory(109.35, 11.20)
  },
  {
    id: "fund-atram-money-market",
    name: "ATRAM Peso Money Market Fund",
    provider: "ATRAM Trust Corporation",
    platform: "Maya Funds (Seedbox Funds)",
    targetFund: "Philippine Short-Term Treasury Bills & Time Deposits",
    category: "Money Market / Liquidity",
    currency: "PHP",
    riskRating: "Conservative",
    currentNavpu: 136.58,
    previousNavpu: 136.56,
    navpuDate: "2026-08-10",
    unitsHeld: 1650.0000,
    investedCapital: 215820.00,
    averageCost: 130.80,
    currentMarketValue: 225324.00,
    unrealizedGain: 9504.00,
    unrealizedGainPercent: 4.40,
    dividendYieldPAnnum: 0,
    metrics: {
      oneYearReturn: 4.75,
      threeYearCagr: 4.35,
      fiveYearCagr: 3.90,
      volatility30d: 0.42,
      sharpeRatio: 0.15,
      maxDrawdown: -0.05,
      alpha: 0.05,
      beta: 0.02
    },
    historicalNavpu: generateHistory(136.56, 4.75)
  },
  {
    id: "fund-atram-ph-smart-index",
    name: "ATRAM Philippine Equity Smart Index Fund",
    provider: "ATRAM Trust Corporation",
    platform: "GCash GInvest",
    targetFund: "FactSet Philippines Smart Equity Index",
    category: "Domestic Equity Index",
    currency: "PHP",
    riskRating: "Aggressive",
    currentNavpu: 11.82,
    previousNavpu: 11.75,
    navpuDate: "2026-08-04",
    unitsHeld: 4500.0000,
    investedCapital: 50400.00,
    averageCost: 11.20,
    currentMarketValue: 53190.00,
    unrealizedGain: 2790.00,
    unrealizedGainPercent: 5.54,
    dividendYieldPAnnum: 0,
    metrics: {
      oneYearReturn: 7.45,
      threeYearCagr: 4.10,
      fiveYearCagr: 3.80,
      volatility30d: 12.80,
      sharpeRatio: 0.38,
      maxDrawdown: -14.10,
      alpha: 0.85,
      beta: 0.96
    },
    historicalNavpu: generateHistory(11.82, 7.45)
  },
  {
    id: "fund-atram-medium-term-bond",
    name: "ATRAM Medium Term Peso Bond Fund",
    provider: "ATRAM Trust Corporation",
    platform: "Maya Funds (Seedbox Funds)",
    targetFund: "Markit iBoxx ALBI Philippines Sovereign & Corporate Bonds",
    category: "Fixed Income / Bond",
    currency: "PHP",
    riskRating: "Moderate",
    currentNavpu: 2.287,
    previousNavpu: 2.285,
    navpuDate: "2026-08-10",
    unitsHeld: 25000.0000,
    investedCapital: 55000.00,
    averageCost: 2.20,
    currentMarketValue: 57125.00,
    unrealizedGain: 2125.00,
    unrealizedGainPercent: 3.86,
    dividendYieldPAnnum: 0,
    metrics: {
      oneYearReturn: 5.85,
      threeYearCagr: 4.60,
      fiveYearCagr: 4.25,
      volatility30d: 2.45,
      sharpeRatio: 0.62,
      maxDrawdown: -2.15,
      alpha: 0.35,
      beta: 0.30
    },
    historicalNavpu: generateHistory(2.285, 5.85)
  },
  {
    id: "fund-atram-consumer-trends",
    name: "ATRAM Global Consumer Trends Feeder Fund",
    provider: "ATRAM Trust Corporation",
    platform: "GCash GInvest",
    targetFund: "Fidelity Funds - Global Consumer Industries Fund",
    category: "Global Thematic Feeder",
    currency: "PHP",
    riskRating: "Aggressive",
    currentNavpu: 174.60,
    previousNavpu: 173.80,
    navpuDate: "2026-08-04",
    unitsHeld: 320.0000,
    investedCapital: 51200.00,
    averageCost: 160.00,
    currentMarketValue: 55872.00,
    unrealizedGain: 4672.00,
    unrealizedGainPercent: 9.13,
    dividendYieldPAnnum: 0,
    metrics: {
      oneYearReturn: 15.20,
      threeYearCagr: 12.40,
      fiveYearCagr: 11.80,
      volatility30d: 13.50,
      sharpeRatio: 0.88,
      maxDrawdown: -12.40,
      alpha: 2.40,
      beta: 1.05
    },
    historicalNavpu: generateHistory(174.60, 15.20)
  },
  {
    id: "fund-atram-health-care",
    name: "ATRAM Global Health Care Feeder Fund",
    provider: "ATRAM Trust Corporation",
    platform: "GCash GInvest",
    targetFund: "Wellington Global Health Care Fund",
    category: "Global Thematic Feeder",
    currency: "PHP",
    riskRating: "Aggressive",
    currentNavpu: 196.40,
    previousNavpu: 195.80,
    navpuDate: "2026-08-04",
    unitsHeld: 280.0000,
    investedCapital: 51800.00,
    averageCost: 185.00,
    currentMarketValue: 54992.00,
    unrealizedGain: 3192.00,
    unrealizedGainPercent: 6.16,
    dividendYieldPAnnum: 0,
    metrics: {
      oneYearReturn: 8.90,
      threeYearCagr: 7.45,
      fiveYearCagr: 8.80,
      volatility30d: 11.20,
      sharpeRatio: 0.58,
      maxDrawdown: -9.80,
      alpha: 0.75,
      beta: 0.78
    },
    historicalNavpu: generateHistory(196.40, 8.90)
  },
  {
    id: "fund-atram-sdg-fund",
    name: "ATRAM Philippine Sustainable Development And Growth Fund",
    provider: "ATRAM Trust Corporation",
    platform: "GCash GInvest",
    targetFund: "Philippine Equities with High UN SDG Impact",
    category: "Domestic Equity ESG",
    currency: "PHP",
    riskRating: "Aggressive",
    currentNavpu: 1.284,
    previousNavpu: 1.278,
    navpuDate: "2026-08-04",
    unitsHeld: 40000.0000,
    investedCapital: 48800.00,
    averageCost: 1.22,
    currentMarketValue: 51360.00,
    unrealizedGain: 2560.00,
    unrealizedGainPercent: 5.25,
    dividendYieldPAnnum: 0,
    metrics: {
      oneYearReturn: 7.10,
      threeYearCagr: 4.25,
      fiveYearCagr: 4.50,
      volatility30d: 12.10,
      sharpeRatio: 0.36,
      maxDrawdown: -13.50,
      alpha: 0.60,
      beta: 0.92
    },
    historicalNavpu: generateHistory(1.284, 7.10)
  },
  {
    id: "fund-manulife-preferred-income",
    name: "Manulife Global Preferred Income Feeder Fund",
    provider: "Manulife Investment Management",
    platform: "GCash GInvest",
    targetFund: "Manulife Global Fund - Preferred Securities Income Fund",
    category: "Fixed Income / Preferred Securities",
    currency: "PHP",
    riskRating: "Moderate",
    currentNavpu: 1.135,
    previousNavpu: 1.130,
    navpuDate: "2026-08-04",
    unitsHeld: 50000.0000,
    investedCapital: 53500.00,
    averageCost: 1.07,
    currentMarketValue: 56750.00,
    unrealizedGain: 3250.00,
    unrealizedGainPercent: 6.07,
    dividendYieldPAnnum: 5.25,
    metrics: {
      oneYearReturn: 7.95,
      threeYearCagr: 6.10,
      fiveYearCagr: 6.80,
      volatility30d: 5.40,
      sharpeRatio: 0.74,
      maxDrawdown: -4.90,
      alpha: 0.95,
      beta: 0.48
    },
    historicalNavpu: generateHistory(1.135, 7.95)
  },
  {
    id: "fund-manulife-apac-reit",
    name: "Manulife Asia Pacific REIT Fund of Funds",
    provider: "Manulife Investment Management",
    platform: "GCash GInvest",
    targetFund: "Asia Pacific Real Estate Investment Trusts Basket",
    category: "Global REIT Feeder",
    currency: "PHP",
    riskRating: "Moderate",
    currentNavpu: 1.265,
    previousNavpu: 1.258,
    navpuDate: "2026-08-04",
    unitsHeld: 45000.0000,
    investedCapital: 52650.00,
    averageCost: 1.17,
    currentMarketValue: 56925.00,
    unrealizedGain: 4275.00,
    unrealizedGainPercent: 8.12,
    dividendYieldPAnnum: 6.15,
    metrics: {
      oneYearReturn: 10.85,
      threeYearCagr: 7.90,
      fiveYearCagr: 8.60,
      volatility30d: 9.60,
      sharpeRatio: 0.78,
      maxDrawdown: -9.10,
      alpha: 1.45,
      beta: 0.72
    },
    historicalNavpu: generateHistory(1.265, 10.85)
  },
  {
    id: "fund-atram-equity-opportunity",
    name: "ATRAM Global Equity Opportunity Feeder Fund",
    provider: "ATRAM Trust Corporation",
    platform: "GCash GInvest",
    targetFund: "Morgan Stanley Investment Funds - Global Opportunity Fund",
    category: "Global Equity Feeder",
    currency: "PHP",
    riskRating: "Aggressive",
    currentNavpu: 194.50,
    previousNavpu: 193.60,
    navpuDate: "2026-08-04",
    unitsHeld: 300.0000,
    investedCapital: 51900.00,
    averageCost: 173.00,
    currentMarketValue: 58350.00,
    unrealizedGain: 6450.00,
    unrealizedGainPercent: 12.43,
    dividendYieldPAnnum: 0,
    metrics: {
      oneYearReturn: 18.60,
      threeYearCagr: 14.80,
      fiveYearCagr: 15.20,
      volatility30d: 15.20,
      sharpeRatio: 1.08,
      maxDrawdown: -15.40,
      alpha: 3.20,
      beta: 1.12
    },
    historicalNavpu: generateHistory(194.50, 18.60)
  },
  {
    id: "fund-bpi-philippine-stock-index",
    name: "Philippine Stock Index Fund (Units)",
    provider: "BPI Wealth",
    platform: "GCash GInvest",
    targetFund: "Philippine Stock Exchange Composite Index (PSEi)",
    category: "Domestic Equity Index",
    currency: "PHP",
    riskRating: "Aggressive",
    currentNavpu: 772.40,
    previousNavpu: 768.10,
    navpuDate: "2026-08-04",
    unitsHeld: 80.0000,
    investedCapital: 58400.00,
    averageCost: 730.00,
    currentMarketValue: 61792.00,
    unrealizedGain: 3392.00,
    unrealizedGainPercent: 5.81,
    dividendYieldPAnnum: 0,
    metrics: {
      oneYearReturn: 6.80,
      threeYearCagr: 3.20,
      fiveYearCagr: 2.90,
      volatility30d: 12.60,
      sharpeRatio: 0.34,
      maxDrawdown: -14.30,
      alpha: 0.20,
      beta: 1.00
    },
    historicalNavpu: generateHistory(772.40, 6.80)
  },
  {
    id: "fund-manulife-asia-dynamic-bond",
    name: "Manulife Asia Dynamic Bond Feeder Fund",
    provider: "Manulife Investment Management",
    platform: "GCash GInvest",
    targetFund: "Manulife Global Fund - Asian High Yield Fund",
    category: "Fixed Income / Bond",
    currency: "PHP",
    riskRating: "Moderate",
    currentNavpu: 1.162,
    previousNavpu: 1.157,
    navpuDate: "2026-08-04",
    unitsHeld: 48000.0000,
    investedCapital: 52800.00,
    averageCost: 1.10,
    currentMarketValue: 55776.00,
    unrealizedGain: 2976.00,
    unrealizedGainPercent: 5.64,
    dividendYieldPAnnum: 4.85,
    metrics: {
      oneYearReturn: 7.10,
      threeYearCagr: 5.40,
      fiveYearCagr: 5.80,
      volatility30d: 4.80,
      sharpeRatio: 0.67,
      maxDrawdown: -5.00,
      alpha: 0.80,
      beta: 0.42
    },
    historicalNavpu: generateHistory(1.162, 7.10)
  }
];

currentDb.funds = allFunds;

// Write to db.json and defaultData.json
fs.writeFileSync(dbPath, JSON.stringify(currentDb, null, 2), 'utf8');

const defaultDb = JSON.parse(fs.readFileSync(defaultDataPath, 'utf8'));
defaultDb.funds = allFunds;
fs.writeFileSync(defaultDataPath, JSON.stringify(defaultDb, null, 2), 'utf8');

console.log(`Successfully populated ${allFunds.length} GCash GInvest funds in db.json and defaultData.json`);
