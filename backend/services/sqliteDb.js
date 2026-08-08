const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'dv_financials.db');
const SCHEMA_PATH = path.join(__dirname, '..', 'data', 'schema.sql');

class SqliteService {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    try {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('❌ [SQLITE INIT ERROR]:', err.message);
        } else {
          console.log('🟢 [SQLITE ENGINE] Connected to dv_financials.db');
          this.bootstrapSchema();
        }
      });
    } catch (err) {
      console.error('❌ [SQLITE EXCEPTION]:', err.message);
    }
  }

  bootstrapSchema() {
    if (!fs.existsSync(SCHEMA_PATH)) return;
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');

    this.db.exec(schemaSql, (err) => {
      if (err) {
        console.error('❌ [SQLITE SCHEMA ERROR]:', err.message);
      } else {
        console.log('🟢 [SQLITE ENGINE] Schema verified & tables initialized.');
        this.seedInitialData();
      }
    });
  }

  seedInitialData() {
    // Check if credit_cards is empty
    this.db.get('SELECT COUNT(*) as count FROM credit_cards', (err, row) => {
      if (!err && row && row.count === 0) {
        console.log('🟡 [SQLITE SEED] Seeding default Atome Card record...');
        const stmt = this.db.prepare(`
          INSERT OR IGNORE INTO credit_cards (
            card_id, card_name, card_number, card_brand, total_limit, available_limit,
            due_date, statement_date, billing_cycle_day, min_amount_due, annual_fee,
            interest_rate_apr, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run([
          'card-atome-01',
          'Atome Card (Mastercard)',
          '•••• 5956',
          'Mastercard',
          10000.00,
          5811.42,
          '2026-08-18',
          '2026-08-03',
          18,
          209.43,
          0.00,
          0.00,
          'active'
        ], (sErr) => {
          if (!sErr) console.log('🟢 [SQLITE SEED] Default Atome Card initialized.');
        });
        stmt.finalize();
      }
    });

    // Check if liabilities is empty
    this.db.get('SELECT COUNT(*) as count FROM liabilities', (err, row) => {
      if (!err && row && row.count === 0) {
        console.log('🟡 [SQLITE SEED] Seeding default Liabilities records...');
        const stmt = this.db.prepare(`
          INSERT OR IGNORE INTO liabilities (
            id, name, provider, type, outstanding_balance, credit_limit,
            nominal_monthly_rate, effective_apr, monthly_admin_fee, monthly_payment,
            remaining_terms_months, billing_cycle_due_date, is_zero_interest_promo, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run([
          'liab-atome-card',
          'Atome Card / PayLater',
          'Atome Philippines',
          'bnpl',
          4188.58,
          10000.00,
          0.0,
          0.0,
          0.0,
          209.43,
          1,
          '2026-08-18',
          1,
          'active'
        ]);

        stmt.run([
          'liab-maya-credit',
          'Maya Credit',
          'Maya Bank',
          'revolving_credit',
          0.0,
          30000.00,
          3.99,
          47.88,
          0.0,
          0.0,
          1,
          '2026-08-25',
          0,
          'paid_off'
        ]);

        stmt.finalize();
      }
    });
  }

  getRawDb() {
    return this.db;
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
}

module.exports = new SqliteService();
