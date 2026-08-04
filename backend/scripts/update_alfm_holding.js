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
      if (fund.id === 'fund-alfm-multi-asset') {
        return {
          ...fund,
          currentNavpu: 47.1875,
          previousNavpu: 47.1650,
          navpuDate: '2026-07-31',
          unitsHeld: 2.1192,
          investedCapital: 100.00,
          averageCost: 47.1875,
          currentMarketValue: 99.99,
          unrealizedGain: -0.01,
          unrealizedGainPercent: -0.01,
          pendingBuyOrders: 100.00,
          pendingSellOrders: 0.00,
          riskRating: 'Aggressive',
          metrics: {
            ...fund.metrics,
            oneYearReturn: 5.00
          }
        };
      } else {
        // Zero out other funds if they had placeholder demo holding, so portfolio total matches user's actual holding
        return {
          ...fund,
          unitsHeld: fund.unitsHeld && fund.id === 'fund-alfm-multi-asset' ? fund.unitsHeld : 0,
          investedCapital: fund.investedCapital && fund.id === 'fund-alfm-multi-asset' ? fund.investedCapital : 0,
          currentMarketValue: fund.id === 'fund-alfm-multi-asset' ? 99.99 : 0,
          unrealizedGain: fund.id === 'fund-alfm-multi-asset' ? -0.01 : 0,
          unrealizedGainPercent: fund.id === 'fund-alfm-multi-asset' ? -0.01 : 0
        };
      }
    });
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Updated ${filePath}`);
}

updateData(dbPath);
updateData(defaultPath);
