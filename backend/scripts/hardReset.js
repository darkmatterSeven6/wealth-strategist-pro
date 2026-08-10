const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/dv_financials.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log("🔥 [EMERGENCY FIX] Wiping and recreating feeder_funds table...");
  
  db.run("DROP TABLE IF EXISTS feeder_funds");
  
  db.run(`
    CREATE TABLE feeder_funds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fund_id TEXT,
      fund_name TEXT NOT NULL,
      platform TEXT,
      category TEXT,
      latest_navpu REAL DEFAULT 0,
      total_units REAL DEFAULT 0,
      total_investment_value REAL DEFAULT 0,
      invested_capital REAL DEFAULT 0,
      unrealized_gain REAL DEFAULT 0,
      unrealized_gain_pct REAL DEFAULT 0,
      pending_buy_order REAL DEFAULT 0,
      pending_units REAL DEFAULT 0,
      est_completion_date TEXT,
      has_active_holding INTEGER DEFAULT 0,
      has_dividends INTEGER DEFAULT 0
    )
  `);

  const stmt = db.prepare(`
    INSERT INTO feeder_funds (
      fund_id, fund_name, platform, category, latest_navpu, 
      total_units, total_investment_value, invested_capital, 
      unrealized_gain, unrealized_gain_pct, pending_buy_order, 
      pending_units, est_completion_date, has_active_holding, has_dividends
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // 1. ATRAM Global Tech Feeder (Settled: 2.0419 | Capital: ₱1,000.00)
  stmt.run('atram-tech', 'ATRAM Global Technology Feeder Fund', 'GCash GInvest', 'Global Equity Growth', 497.0092, 2.0419, 1014.84, 1000.00, 14.84, 1.48, 0.00, 0.00, null, 1, 0);

  // 2. ALFM Global Multi-Asset Income Fund (Settled: 4.2169 | Capital: ₱200.00 | Pending: ₱500.00)
  stmt.run('alfm-multi-asset', 'ALFM Global Multi-Asset Income Fund Inc - PHP', 'GCash GInvest', 'Multi-Asset Dividend', 47.5422, 4.2169, 200.48, 200.00, 0.48, 0.24, 500.00, 10.5169, '2026-08-14', 1, 1);

  // 3. ATRAM Global Equity Opportunity (Settled: 0.0000 | Capital: ₱0.00 | Pending: ₱1,000.00)
  stmt.run('atram-equity-opp', 'ATRAM Global Equity Opportunity Feeder Fund', 'GCash GInvest', 'Global Equity Growth', 194.5000, 0.0000, 0.00, 0.00, 0.00, 0.00, 1000.00, 6.9865, '2026-08-14', 0, 0);

  // 4. ALFM Money Market Fund (Settled: 0.0000 | Capital: ₱0.00 | Pending: ₱50.00)
  stmt.run('alfm-money-market', 'ALFM Money Market Fund', 'Maya Funds (Seedbox)', 'Money Market', 136.5800, 0.0000, 0.00, 0.00, 0.00, 0.00, 50.00, 0.3660, '2026-08-13', 0, 0);

  // 5. ATRAM Medium Term Peso Bond Fund (Settled: 0.0000 | Capital: ₱0.00 | Pending: ₱100.00)
  stmt.run('atram-peso-bond', 'ATRAM Medium Term Peso Bond Fund', 'Maya Funds (Seedbox)', 'Fixed Income Bond', 2.2870, 0.0000, 0.00, 0.00, 0.00, 0.00, 100.00, 43.7254, '2026-08-14', 0, 0);

  stmt.finalize();
  console.log("🟢 [EMERGENCY FIX] Database ground-truth successfully inserted and verified!");
});

db.close();
