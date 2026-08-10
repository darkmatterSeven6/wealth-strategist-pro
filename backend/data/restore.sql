-- 1. ATRAM Global Technology Feeder Fund (Active Holding)
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

-- 2. ALFM Global Multi-Asset Income Fund Inc (Active Holding + Pending Order)
UPDATE feeder_funds 
SET 
  total_units = 4.2169,
  latest_navpu = 47.5422,
  total_investment_value = 200.48,
  invested_capital = 200.00,
  unrealized_gain = 0.48,
  unrealized_gain_pct = 0.24,
  pending_buy_order = 500.00,
  est_completion_date = '2026-08-14',
  has_active_holding = 1
WHERE fund_name LIKE '%Multi-Asset%';

-- 3. ATRAM Global Equity Opportunity Feeder Fund (Pending Order Only - Settled = 0)
UPDATE feeder_funds 
SET 
  total_units = 0.0000,
  latest_navpu = 143.132102,
  total_investment_value = 0.00,
  invested_capital = 0.00,
  unrealized_gain = 0.00,
  unrealized_gain_pct = 0.00,
  pending_buy_order = 1000.00,
  pending_units = 6.9865,
  est_completion_date = '2026-08-14',
  has_active_holding = 0
WHERE fund_name LIKE '%Equity Opportunity%';

-- 4. Reset All Uninvested Watchlist Funds to Zero Settled Capital
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
  AND fund_name NOT LIKE '%Equity Opportunity%';

-- 5. Add Today's Pending Orders (Submitted Aug 10, 2026)
UPDATE feeder_funds SET pending_buy_order = 50.00, est_completion_date = '2026-08-13' WHERE fund_name LIKE '%ALFM Money Market%';
UPDATE feeder_funds SET pending_buy_order = 100.00, est_completion_date = '2026-08-14' WHERE fund_name LIKE '%Medium Term Peso Bond%';
