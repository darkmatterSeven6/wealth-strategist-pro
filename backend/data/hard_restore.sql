-- 1. Reset ATRAM Global Equity Opportunity Feeder Fund (SETTLED = ZERO, PENDING = ₱1,000)
UPDATE feeder_funds 
SET 
  total_units = 0.0000,
  latest_navpu = 194.5000,
  total_investment_value = 0.00,
  invested_capital = 0.00,
  unrealized_gain = 0.00,
  unrealized_gain_pct = 0.00,
  pending_buy_order = 1000.00,
  pending_units = 6.9865,
  est_completion_date = '2026-08-14',
  has_active_holding = 0
WHERE fund_name LIKE '%Equity Opportunity%';

-- 2. Reset ATRAM Global Technology Feeder Fund (SETTLED = 2.0419 Units, CAPITAL = ₱1,000)
UPDATE feeder_funds 
SET 
  total_units = 2.0419,
  latest_navpu = 497.0092,
  total_investment_value = 1014.84,
  invested_capital = 1000.00,
  unrealized_gain = 14.84,
  unrealized_gain_pct = 1.48,
  pending_buy_order = 0.00,
  has_active_holding = 1
WHERE fund_name LIKE '%Global Technology%';

-- 3. Reset ALFM Global Multi-Asset Income Fund Inc (SETTLED = 4.2169 Units, CAPITAL = ₱200, PENDING = ₱500)
UPDATE feeder_funds 
SET 
  total_units = 4.2169,
  latest_navpu = 47.5422,
  total_investment_value = 200.48,
  invested_capital = 200.00,
  unrealized_gain = 0.48,
  unrealized_gain_pct = 0.24,
  pending_buy_order = 500.00,
  pending_units = 10.5169,
  est_completion_date = '2026-08-14',
  has_active_holding = 1
WHERE fund_name LIKE '%Multi-Asset%';

-- 4. Reset ALFM Money Market Fund (SETTLED = ZERO, PENDING = ₱50)
UPDATE feeder_funds 
SET 
  total_units = 0.0000,
  latest_navpu = 136.5800,
  total_investment_value = 0.00,
  invested_capital = 0.00,
  unrealized_gain = 0.00,
  unrealized_gain_pct = 0.00,
  pending_buy_order = 50.00,
  est_completion_date = '2026-08-13',
  has_active_holding = 0
WHERE fund_name LIKE '%Money Market%';

-- 5. Reset ATRAM Medium Term Peso Bond Fund (SETTLED = ZERO, PENDING = ₱100)
UPDATE feeder_funds 
SET 
  total_units = 0.0000,
  latest_navpu = 2.2870,
  total_investment_value = 0.00,
  invested_capital = 0.00,
  unrealized_gain = 0.00,
  unrealized_gain_pct = 0.00,
  pending_buy_order = 100.00,
  est_completion_date = '2026-08-14',
  has_active_holding = 0
WHERE fund_name LIKE '%Medium Term Peso Bond%';

-- 6. Reset All Other Watchlist / Uninvested Funds to Zero
UPDATE feeder_funds 
SET 
  total_units = 0.0000,
  total_investment_value = 0.00,
  invested_capital = 0.00,
  unrealized_gain = 0.00,
  unrealized_gain_pct = 0.00,
  has_active_holding = 0
WHERE fund_name NOT LIKE '%Global Technology%' 
  AND fund_name NOT LIKE '%Multi-Asset%' 
  AND fund_name NOT LIKE '%Equity Opportunity%'
  AND fund_name NOT LIKE '%Money Market%'
  AND fund_name NOT LIKE '%Medium Term Peso Bond%';
