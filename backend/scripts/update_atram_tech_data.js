const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'db.json');
const defaultPath = path.join(__dirname, '..', 'data', 'defaultData.json');

function updateData(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);

  if (data.funds) {
    data.funds = data.funds.map(fund => {
      if (fund.id === 'fund-atram-tech') {
        const currentNavpu = 478.811055;
        const unitsHeld = 2.0885;
        const investedCapital = 1000.00;
        const averageCost = 478.811055;
        const currentMarketValue = parseFloat((unitsHeld * currentNavpu).toFixed(2));
        const unrealizedGain = parseFloat((currentMarketValue - investedCapital).toFixed(2));
        const unrealizedGainPercent = 0.00;

        return {
          ...fund,
          currentNavpu: 478.811055,
          previousNavpu: 476.950000,
          navpuDate: '2026-08-03',
          unitsHeld: 2.0885,
          investedCapital: 1000.00,
          averageCost: 478.811055,
          currentMarketValue: 1000.00,
          unrealizedGain: 0.00,
          unrealizedGainPercent: 0.00,
          pendingBuyOrders: 1000.00,
          pendingSellOrders: 0.00,
          orderNumber: 'SGC2608015853033',
          orderStatus: 'Buy Order Placed (Processing - Est. Aug 07, 2026)',
          riskRating: 'Aggressive',
          metrics: {
            ...fund.metrics,
            oneYearReturn: 27.54,
            threeYearCagr: 19.85,
            volatility30d: 16.5,
            sharpeRatio: 1.34
          },
          historicalNavpu: [
            { date: "2025-08-01", navpu: 375.4200 },
            { date: "2025-09-01", navpu: 384.9100 },
            { date: "2025-10-01", navpu: 391.5300 },
            { date: "2025-11-03", navpu: 397.7500 },
            { date: "2025-12-01", navpu: 406.8000 },
            { date: "2026-01-02", navpu: 416.6400 },
            { date: "2026-02-02", navpu: 423.7800 },
            { date: "2026-03-02", navpu: 429.7200 },
            { date: "2026-04-01", navpu: 438.2100 },
            { date: "2026-05-04", navpu: 449.6000 },
            { date: "2026-06-01", navpu: 461.1500 },
            { date: "2026-07-01", navpu: 472.3000 },
            { date: "2026-08-03", navpu: 478.811055 }
          ]
        };
      }
      return fund;
    });
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Updated ATRAM Global Technology Feeder Fund in ${filePath}`);
}

updateData(dbPath);
updateData(defaultPath);
