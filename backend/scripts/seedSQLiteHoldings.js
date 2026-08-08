const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const seedHoldings = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'seedHoldings.json'), 'utf8'));

// 1. Update db.json
const dbPath = path.join(__dirname, '..', 'data', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
db.funds = db.funds.map(f => {
  const match = seedHoldings.find(s => s.fund_id === f.id || s.fund_name?.toLowerCase() === f.name?.toLowerCase());
  if (match) {
    return {
      ...f,
      targetFund: match.target_fund || f.targetFund,
      targetFundManager: match.target_fund_manager || match.target_manager || f.targetFundManager,
      benchmark: match.benchmark || f.benchmark,
      top10Weight: match.top_10_weight || f.top10Weight,
      top_holdings: match.holdings
    };
  }
  return f;
});
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

// 2. Update defaultData.json
const defaultPath = path.join(__dirname, '..', 'data', 'defaultData.json');
const defData = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
defData.funds = defData.funds.map(f => {
  const match = seedHoldings.find(s => s.fund_id === f.id || s.fund_name?.toLowerCase() === f.name?.toLowerCase());
  if (match) {
    return {
      ...f,
      targetFund: match.target_fund || f.targetFund,
      targetFundManager: match.target_fund_manager || match.target_manager || f.targetFundManager,
      benchmark: match.benchmark || f.benchmark,
      top10Weight: match.top_10_weight || f.top10Weight,
      top_holdings: match.holdings
    };
  }
  return f;
});
fs.writeFileSync(defaultPath, JSON.stringify(defData, null, 2), 'utf8');

// 3. Update SQLite dv_financials.db
const sqliteDbPath = path.join(__dirname, '..', 'data', 'dv_financials.db');
const sqliteDb = new sqlite3.Database(sqliteDbPath);

sqliteDb.serialize(() => {
  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS fund_holdings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fund_id TEXT UNIQUE NOT NULL,
      fund_name TEXT NOT NULL,
      target_fund TEXT,
      target_manager TEXT,
      benchmark TEXT,
      top_10_weight TEXT,
      holdings_json TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const stmt = sqliteDb.prepare(`
    INSERT OR REPLACE INTO fund_holdings (fund_id, fund_name, target_fund, target_manager, benchmark, top_10_weight, holdings_json, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  seedHoldings.forEach(sh => {
    stmt.run(
      sh.fund_id,
      sh.fund_name,
      sh.target_fund,
      sh.target_fund_manager || sh.target_manager,
      sh.benchmark,
      sh.top_10_weight,
      JSON.stringify(sh.holdings)
    );
  });

  stmt.finalize(() => {
    console.log('Successfully seeded all ' + seedHoldings.length + ' funds into SQLite, db.json, and defaultData.json!');
    
    sqliteDb.all('SELECT fund_id, fund_name, target_fund, json_array_length(holdings_json) as holdings_count FROM fund_holdings', (err, rows) => {
      if (err) console.error(err);
      console.log('SQLite Holdings Table State:', rows);
      sqliteDb.close();
    });
  });
});
