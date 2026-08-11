-- ==========================================================
-- DV FINANCIALS - SQLite Database Schema Definition
-- ==========================================================

-- 1. Credit Cards & Revolving Facilities Table
CREATE TABLE IF NOT EXISTS credit_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id TEXT UNIQUE NOT NULL,       -- e.g. "card-atome-01"
    card_name TEXT NOT NULL,            -- e.g. "Atome Card (Mastercard)"
    card_number TEXT NOT NULL,          -- e.g. "**** 5956"
    card_brand TEXT DEFAULT 'Mastercard',
    total_limit REAL NOT NULL,          -- e.g. 10000.00
    available_limit REAL NOT NULL,      -- e.g. 5811.42
    outstanding_balance REAL GENERATED ALWAYS AS (total_limit - available_limit) STORED,
    due_date TEXT,                      -- e.g. "2026-08-18"
    statement_date TEXT,                -- e.g. "2026-08-03"
    billing_cycle_day INTEGER DEFAULT 18,
    min_amount_due REAL DEFAULT 0.00,
    annual_fee REAL DEFAULT 0.00,
    interest_rate_apr REAL DEFAULT 0.00,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Card Transactions & Merchant Ledger
CREATE TABLE IF NOT EXISTS card_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id TEXT UNIQUE NOT NULL, -- e.g. "ctx-01"
    card_id TEXT NOT NULL,
    merchant_name TEXT NOT NULL,
    amount REAL NOT NULL,
    transaction_type TEXT NOT NULL,      -- 'purchase', 'bill_payment', 'refund', 'fee'
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reference_number TEXT,
    category TEXT,
    FOREIGN KEY(card_id) REFERENCES credit_cards(card_id) ON DELETE CASCADE
);

-- 3. General Liabilities & BNPL Contracts Table
CREATE TABLE IF NOT EXISTS liabilities (
    id TEXT PRIMARY KEY,                 -- e.g. "liab-atome-card", "liab-maya-credit"
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    type TEXT NOT NULL,                  -- 'credit_card', 'bnpl', 'revolving_credit', 'loan'
    outstanding_balance REAL NOT NULL,
    credit_limit REAL NOT NULL,
    nominal_monthly_rate REAL DEFAULT 0.0,
    effective_apr REAL DEFAULT 0.0,
    monthly_admin_fee REAL DEFAULT 0.0,
    monthly_payment REAL DEFAULT 0.0,
    remaining_terms_months INTEGER DEFAULT 1,
    billing_cycle_due_date TEXT,
    is_zero_interest_promo BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'active',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Digital Banks Table
CREATE TABLE IF NOT EXISTS digital_banks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id TEXT UNIQUE NOT NULL,
    account_name TEXT NOT NULL,
    account_type TEXT,
    account_type_label TEXT,
    badge_label TEXT,
    last_four_digits TEXT,
    current_balance REAL DEFAULT 0.0,
    base_rate REAL DEFAULT 0.0,
    active_boost_rate REAL DEFAULT 0.0,
    total_effective_rate REAL DEFAULT 0.0,
    net_daily_gain REAL DEFAULT 0.0,
    pockets_json TEXT,
    is_liquid BOOLEAN DEFAULT 1,
    status TEXT DEFAULT 'active',
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
